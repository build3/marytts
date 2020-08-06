import logging
import json
import re
from typing import Any, Tuple

import xmltodict

from .marytts import MaryTTSRepository
from .repository import BaseMaryTTSRepository


def process_voice_output(
    text: str,
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[bytes, str, int]:
    return repository.voice_output(text, locale, voice)


def process_phonemes(
    text: str,
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[str, int]:
    content, status_code = repository.load_acoustic_params(text, locale, voice)

    if not status_code == 200:
        return content.decode('utf-8'), status_code

    data = xmltodict.parse(content.decode('utf-8'))

    sentences = data['maryxml']['p']['s']

    data = {'phrases': []}
    durations = []
    previous_hertz = []

    if _is_complex(sentences):
        for sentence in sentences:
            phrases = _get_phrases_from_prosody(sentence['prosody'])

            if isinstance(phrases, list):
                for phrase in phrases:
                    if isinstance(phrase, list):
                        for prodigy_phrase in phrase:
                            data['phrases'].append(_create_phrase_dict(prodigy_phrase, durations, previous_hertz))
                    else:
                        data['phrases'].append(_create_phrase_dict(phrase, durations, previous_hertz))
            else:
                data['phrases'].append(_create_phrase_dict(phrases, durations, previous_hertz))
    else:
        if 'prosody' in sentences:
            phrases = _get_phrases_from_prosody(sentences['prosody'])
        else:
            phrases = sentences['phrase']['t']

        if isinstance(phrases, list):
            for phrase in phrases:
                if isinstance(phrase, list):
                    for prodigy_phrase in phrase:
                        data['phrases'].append(_create_phrase_dict(prodigy_phrase, durations, previous_hertz))
                else:
                    data['phrases'].append(_create_phrase_dict(phrase, durations, previous_hertz))
        else:
            data['phrases'].append(_create_phrase_dict(phrases, durations, previous_hertz))

    return json.dumps(data), status_code


def _get_phrases_from_prosody(prosody: Any) -> list:
    if isinstance(prosody, list):
        return [single_prosody['phrase']['t'] for single_prosody in prosody]

    return prosody['phrase']['t']


def _is_complex(sentences: Any) -> bool:
    ### Sentences can be list if there are multiple sentences and dict for one sentence.
    return isinstance(sentences, list)


def _create_phrase_dict(phrase: dict, durations: list, previous_hertz: list) -> dict:
    syllables = phrase.get('syllable')

    if not syllables:
        ### For example dot at the end of sentence
        return

    if isinstance(syllables, list):
        syllables_data = [_get_phrases_from_syllable(syllable['ph'], durations, previous_hertz) for syllable in syllables]
    else:
        syllables_data = [_get_phrases_from_syllable(syllables['ph'], durations, previous_hertz)]

    return {
        'phrase': phrase['@ph'],
        'text': phrase['#text'],
        'syllables': syllables_data,
    }


def _get_phrases_from_syllable(ph: Any, durations: list, previous_hertz: list):
    if isinstance(ph, list):
        return [
            _single_phrase_dict(phrase, durations, previous_hertz)
            for phrase in ph
        ]

    return [_single_phrase_dict(ph, durations, previous_hertz)]


def _single_phrase_dict(phrase: dict, durations: list, previous_hertz: list) -> dict:
    return {
        'duration': phrase['@d'],
        'end': phrase['@end'],
        'f0': _get_list_of_f0(phrase, durations, previous_hertz),
    }


def _get_list_of_f0(ph: dict, durations: list, previous_hertz: list) -> list:
    f0 = ph.get('@f0')
    duration = int(ph['@d'])

    if not f0:
        phonemes = [_empty_phoneme(durations, duration, previous_hertz)]
    else:
        phonemes = list(filter(None, re.split("(\(\d+,\d+\))", f0)))
        phonemes = [
            _phoneme_dict(phoneme, durations, duration, previous_hertz)
            for phoneme in phonemes
        ]

    durations.append(duration)

    return phonemes


def _empty_phoneme(durations: list, duration: int, previous_hertz: list) -> dict:
    if not previous_hertz:
        hertz = 22
    else:
        hertz = previous_hertz[-1]

    previous_hertz = [hertz]

    return {
        'microsecond': duration + sum(durations),
        'hertz': hertz
    }


def _phoneme_dict(phoneme: str, durations: list, duration: int, previous_hertz: list) -> dict:
    time_percentage, hertz = eval(phoneme)
    previous_hertz.append(hertz)

    microsecond = duration * (int(time_percentage) / 100) + sum(durations)

    return {
        'microsecond': int(microsecond),
        'hertz': hertz,
    }
