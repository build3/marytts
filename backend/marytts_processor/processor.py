"""
This module is used to process the XML obtained from
MaryTTS server with `MaryTTSRepository`. The most important
thing which I wanted to make you aware is that most or all
field in the XML may occur as list of objects or single object.
Cause of that I introduced new `MaryXmlUnion` type which signals
that the variable maybe either list or dict.
"""

import json
import re

from typing import Any, Tuple, Union

import xmltodict


MaryXmlUnion = Union[dict, list]


class MaryTTSXMLProcessor:

    def __init__(self, xml: bytes):
        self.data = {'phrases': []}
        self.durations = []
        self.previous_hertz = []

        parsed_xml = xmltodict.parse(xml.decode('utf-8'))
        self.sentences: MaryXmlUnion = parsed_xml['maryxml']['p']['s']

    def process(self) -> str:
        if self._is_complex():
            for sentence in self.sentences:
                phrases = self._get_phrases_from_prosody(sentence['prosody'])
                self._serialize_phrases(phrases)
        else:
            if 'prosody' in self.sentences:
                phrases = self._get_phrases_from_prosody(self.sentences['prosody'])
            else:
                phrases = self.sentences['phrase']['t']

            self._serialize_phrases(phrases)

        return json.dumps(self.data)

    def _is_complex(self) -> bool:
        """
        Check if text processed from the client is complex.
        Text is context only if posses more than one sentence.
        """
        return isinstance(self.sentences, list)

    def _get_phrases_from_prosody(self, prosody: MaryXmlUnion) -> list:
        """
        The prosody field is not required to be in the XML but if it
        occurs it can occurs as list of objects or single object.
        So I either have to iterate through all the phrases in the
        prosody or take one  phrase from the object.
        """
        if isinstance(prosody, list):
            return [single_prosody['phrase']['t'] for single_prosody in prosody]

        return prosody['phrase']['t']

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

    def _create_phrase_dict(self, phrase: dict) -> MaryXmlUnion:
        syllables: MaryXmlUnion = phrase.get('syllable')

        if not syllables:
            ### For example dot at the end of sentence may not have syllabes.
            return

        if isinstance(syllables, list):
            syllables_data = [
                self._get_phrases_from_syllable(syllable['ph'])
                for syllable in syllables
            ]
        else:
            syllables_data = [self._get_phrases_from_syllable(syllables['ph'])]

        return {
            'phrase': phrase['@ph'],
            'text': phrase['#text'],
            'syllables': syllables_data,
        }

    def _get_phrases_from_syllable(self, ph: MaryXmlUnion) -> list:
        if isinstance(ph, list):
            return [self._single_phrase_dict(phrase) for phrase in ph]

        return [self._single_phrase_dict(ph)]

    def _single_phrase_dict(self, phrase: dict) -> dict:
        return {'f0': self._get_list_of_f0(phrase)}

    def _get_list_of_f0(self, ph: dict) -> list:
        f0 = ph.get('@f0')
        duration = int(ph['@d'])

        if not f0:
            phonemes = [self._empty_phoneme(duration)]
        else:
            phonemes = list(filter(None, re.split("(\(\d+,\d+\))", f0)))
            phonemes = [
                self._phoneme_dict(phoneme, duration)
                for phoneme in phonemes
            ]

        self.durations.append(duration)

        return phonemes

    def _empty_phoneme(self, duration: int) -> dict:
        if not self.previous_hertz:
            hertz = 22
        else:
            hertz = self.previous_hertz[-1]

        previous_hertz = [hertz]

        return {
            'microsecond': duration + sum(self.durations),
            'hertz': hertz
        }

    def _phoneme_dict(self, phoneme: str, duration: int) -> dict:
        time_percentage, hertz = eval(phoneme)
        self.previous_hertz.append(hertz)

        microsecond = duration * (int(time_percentage) / 100) + sum(self.durations)

        return {
            'microsecond': int(microsecond),
            'hertz': hertz,
        }
