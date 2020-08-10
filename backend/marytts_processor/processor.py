"""
This module process XML from MaryTTS server to the JSON form
easier accesible by the client.

Structure of processed XML looks as follows:

[
    {
        "ms": 0,
        "hertz": 100,
        "phoneme_name": "t"
    },
    {
        "ms": 124,
        "hertz": 148,
        "phoneme_name": "E"
    },
    ...
]
"""

import json
import re

from lxml import html


class MaryTTSXMLProcessor:

    def __init__(self, xml: bytes):
        self.data = []
        self.total_duration = 0 ### Total duration in ms used to calculate time percantage of duration.
        self.previous_hertz = 0 ### Last known hertz value.

        self.tree = html.document_fromstring(xml)

    def process(self) -> str:
        phonemes = self.tree.xpath('//t//ph')

        for phoneme in phonemes:
            duration = int(phoneme.get('d'))
            f0 = phoneme.get('f0')
            phoneme_name = phoneme.get('p')

            if not f0:
                self.data.append(self._empty_phoneme(duration, phoneme_name))

            else:
                f0_pairs = self._split_phoneme_pairs(f0)

                for pair in f0_pairs:
                    self.data.append(self._phoneme_dict(pair, duration, phoneme_name))

            self.total_duration += duration

        return json.dumps(self.data)

    def _empty_phoneme(self, duration: int, phoneme_name: str) -> dict:
        """
        This is used when there is no f0 property in the ph in the XML.
        As there is no f0 I don't have information about time percentage
        so the hertz are probably constant during the period.
        In this case I just add whole duration and total duration to
        obtain point in time.
        """
        # If total duration is 0 then pass 0ms to the client so the chart
        # can be built from 0ms.
        if self.total_duration != 0:
            ms = duration + self.total_duration

        else:
            ms = 0

        return {
            'ms': ms,
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

        if self.total_duration != 0:
            ms = duration * (int(time_percentage) / 100) + self.total_duration

        else:
            # MaryTTS always starts with 4 ms so I substract
            # the duration so the client will start
            # drawing chart with 0ms.
            ms = duration * (int(time_percentage) / 100) - 4

        return {
            'ms': int(ms),
            'hertz': hertz,
            'phoneme_name': phoneme_name,
        }
