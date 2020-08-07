"""
This module is used to process the XML obtained from
MaryTTS server with `MaryTTSRepository`. The most important
thing which I wanted to make you aware is that most of
fields in the XML may occur as list of objects or single object.
Cause of that I introduced new `MaryXmlUnion` type which signals
that the variable maybe either list or dict.

Structure of processed XML looks as follows:

{
    "phrases": [
        {
            "phrase": "' l O - r @ m",
            "text": "Lorem",
            "phonemes": [
                {
                    "ms": 4,
                    "hertz": 134,
                    "phoneme_name": "l"
                },
                {
                    "ms": 9,
                    "hertz": 134,
                    "phoneme_name": "l"
                },
                {
                    "ms": 15,
                    "hertz": 134,
                    "phoneme_name": "l"
                }
            ]
        },
        ...
    ]
}
"""

import json
import re

from typing import Any, Iterator, Optional, Tuple, Union

import xmltodict


MaryXmlUnion = Union[dict, list]


def _flatten(phonemes_data: list) -> Iterator[list]:
    for element in phonemes_data:
        if isinstance(element, list):
            yield from _flatten(element)
        else:
            yield element


class MaryTTSXMLProcessor:

    def __init__(self, xml: bytes):
        self.data = {'phrases': []}
        self.total_duration = 0 ### Total duration in ms used to calculate time percantage of duration.
        self.previous_hertz = 22 ### Last known hertz value.

        parsed_xml = xmltodict.parse(xml.decode('utf-8'))
        self.sentences: MaryXmlUnion = parsed_xml['maryxml']['p']['s']

    def process(self) -> str:
        if self._is_complex():
            for sentence in self.sentences:
                phrases_tokens = self._get_phrases_from_sentence(sentence)
                self._serialize_phrases(phrases_tokens)
        else:
            phrases_tokens = self._get_phrases_from_sentence(self.sentences)
            self._serialize_phrases(phrases_tokens)

        return json.dumps(self.data)

    def _is_complex(self) -> bool:
        """
        Check if text processed from the client is
        complex i.e. s property is a list.
        """
        return isinstance(self.sentences, list)

    def _get_phrases_from_sentence(self, sentence: dict) -> list:
        if 'prosody' in sentence:
            return self._get_phrases_from_prosody(sentence['prosody'])

        if 'phrase' in sentence:
            tokens = self._get_phrase_token(sentence['phrase'])

            if isinstance(tokens, tuple):
                return list(_flatten([tokens[0], tokens[1]]))

            return tokens

        return []

    def _get_phrases_from_prosody(self, prosody: MaryXmlUnion) -> list:
        """
        The prosody field is not required to be in the XML but if it
        occurs it can occurs as list of objects or single object.
        So I either have to iterate through all the phrases in the
        prosody or take one phrase from the object.
        """
        if isinstance(prosody, list):
            return list(_flatten([
                list(self._get_phrase_token(single_prosody['phrase']))
                for single_prosody in prosody
            ]))

        tokens = self._get_phrase_token(prosody['phrase'])

        if isinstance(tokens, tuple):
            return list(_flatten([tokens[0], tokens[1]]))

        return tokens

    def _get_phrase_token(self, phrase: dict) -> Union[MaryXmlUnion, Tuple]:
        """
        To obtain the phonemes from the phrases I need
        to first get to the phrase tokens in the XML. The mtu property
        like everything else in the XML may appear as object or list
        of object so I'm using TypeError to prevent the exception
        when I want to get token or tokens from mtu.
        """
        if 'mtu' in phrase and 't' in phrase:
            try:
                return phrase['t'], phrase['mtu']['t']
            except TypeError:
                return phrase['t'], [mtu['t'] for mtu in phrase['mtu']]

        if 'mtu' in phrase:
            return phrase['mtu']['t']

        return phrase['t']

    def _serialize_phrases(self, phrases: MaryXmlUnion) -> None:
        if isinstance(phrases, list):
            for phrase in phrases:
                if isinstance(phrase, list):
                    self.data['phrases'] += [
                        self._create_phrase_dict(prosody_phrase)
                        for prosody_phrase in phrase
                    ]

                else:
                    self.data['phrases'].append(self._create_phrase_dict(phrase))

        else:
            self.data['phrases'].append(self._create_phrase_dict(phrases))

        # Filter out nulls from dots phrases.
        self.data['phrases'] = list(filter(None, self.data['phrases']))

    def _create_phrase_dict(self, phrase: dict) -> MaryXmlUnion:
        """
        Here I'm creating dict for the single phrase from the XML.
        A phrase may consists of letters or punctuations.
        Most of the phrases should have syllable property.
        If not they are probably something like dot in the end of sentence.
        Every syllabe has a phenome which is marked as ph in the XML.
        Then in the phenome I use f0 property to get hertz and
        calculate specific moment in time associated with the frequency.
        It is possible that f0 is empty then I take the last
        frequency which is constant across duration of the phoneme.
        """
        syllables: MaryXmlUnion = phrase.get('syllable')

        if not syllables:
            ### For example dot at the end of sentence may not have syllabes.
            return

        if isinstance(syllables, list):
            phonemes_data = [
                self._get_phonemes_from_syllable(syllable['ph'])
                for syllable in syllables
            ]
        else:
            phonemes_data = [self._get_phonemes_from_syllable(syllables['ph'])]

        return {
            'phrase': phrase['@ph'],
            'text': phrase['#text'],
            'phonemes': list(_flatten(phonemes_data)),
        }

    def _get_phonemes_from_syllable(self, phoneme: MaryXmlUnion) -> list:
        if isinstance(phoneme, list):
            return [
                self._single_phoneme_dict(single_phoneme)
                for single_phoneme in phoneme
            ]

        return [self._single_phoneme_dict(phoneme)]

    def _single_phoneme_dict(self, phoneme: dict) -> list:
        return self._get_list_of_f0_hertz(phoneme)

    def _get_list_of_f0_hertz(self, phoneme: dict) -> list:
        """
        This function converts f0 string to the dict with
        ms and hertz. I've introduced here a little
        side effect which adds duration of processed phenome
        to the `total_duration`. So I can calculate ms for
        the next phoneme.
        """
        f0 = phoneme.get('@f0')
        duration = int(phoneme['@d'])
        phoneme_name = phoneme['@p']

        if not f0:
            f0_hertz_with_ms = [self._empty_phoneme(duration, phoneme_name)]
        else:
            f0_pairs = self._split_phoneme_pairs(f0)

            f0_hertz_with_ms = [
                self._phoneme_dict(pair, duration, phoneme_name)
                for pair in f0_pairs
            ]

        self.total_duration += duration

        return f0_hertz_with_ms

    def _empty_phoneme(self, duration: int, phoneme_name: str) -> dict:
        """
        This is used when there is no f0 property in the ph in the XML.
        As there is no f0 I don't have information about time percentage
        so the hertz are probably constant during the period.
        In this case I just add whole duration and total duration to
        obtain point in time.
        """
        return {
            'ms': duration + self.total_duration,
            'hertz': self.previous_hertz,
            'phoneme_name': phoneme_name,
        }

    def _split_phoneme_pairs(self, f0: str) -> list:
        """
        This function takes f0 from the phoneme and
        split the pairs.

        f0 property has following schema:
            f0="(4,130)(9,140)(14,138)"

        where first parameter in the pair is percentage time of
        phoneme duration and the other is frequency in Hz in that moment.
        """
        return list(filter(None, re.split("(\(\d+,\d+\))", f0)))

    def _phoneme_dict(self, pair: str, duration: int, phoneme_name: str) -> dict:
        """
        Returns dict with ms and Hz value from phoneme
        from the specific moment in time.
        The ms is calculated from total duration processed
        up to this moment.
        """
        # Convert string (4,130) to python's tuple and destruct values
        time_percentage, hertz = eval(pair)
        self.previous_hertz = hertz

        ms = duration * (int(time_percentage) / 100) + self.total_duration

        return {
            'ms': int(ms),
            'hertz': hertz,
            'phoneme_name': phoneme_name,
        }
