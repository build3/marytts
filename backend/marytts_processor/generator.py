from dataclasses import dataclass
from typing import List, Optional, Tuple

from lxml import html


Phoneme = str
PhonemeCoordinates = Tuple[int, int]


@dataclass
class Point:
    phoneme: Phoneme
    ms: int
    hz: int


@dataclass
class PhonemeGroup:
    phoneme_name: Phoneme
    points: List[Point]


class MaryTTSXMLGenerator:
    def __init__(self, xml: bytes, modifiers: List[Point]):
        self.xml = xml
        self.requested_phoneme_groups = self._group_modifiers(modifiers)

    def _is_point_from_phoneme_group(self, modifier: Point, phoneme: Phoneme) -> bool:
        return modifier.phoneme == phoneme

    def _group_modifiers(self, modifiers: List[Point]) -> List[PhonemeGroup]:
        if not modifiers:
            return []

        group_points = []
        result = []
        previous_modifier = modifiers[0].phoneme

        for modifier in modifiers:
            if self._is_point_from_phoneme_group(modifier, previous_modifier):
                group_points.append(modifier)
            else:
                result.append(
                    PhonemeGroup(phoneme_name=previous_modifier, points=group_points)
                )

                previous_modifier = modifier.phoneme
                group_points = [modifier]

        result.append(PhonemeGroup(phoneme_name=previous_modifier, points=group_points))

        return result

    def _init_tree(self):
        self.tree = html.document_fromstring(self.xml)

    def _get_xml_phonemes(self):
        return self.tree.xpath("//t//ph")

    def _is_last_phoneme(self, index: int) -> bool:
        return index + 1 == len(self.requested_phoneme_groups)

    def _get_end_of_phoneme(self, index: int) -> Optional[int]:
        """
        End of the phoneme is determine by the beginning
        of the next phoneme. When the phoneme is the last one
        in the sequence, its end cannot be determined so None
        is returned
        """
        if self._is_last_phoneme(index):
            return None

        return self.requested_phoneme_groups[index + 1].points[0].ms

    def _is_accompanying_phoneme(
        self, phoneme_group: PhonemeGroup, accompanying_frequency: int
    ) -> bool:
        """
        NOTE: accompanying phoneme is not a professional name. It was invetend
        for development purpose.

        Accompanying phoneme is an phoneme that has the same frequency as the previous
        one as long as it last and it can't be changed (so it has only one point).
        """
        return (
            len(phoneme_group.points) == 1
            and phoneme_group.points[0].hz == accompanying_frequency
        )

    def _check_phonemes_groups(self, xml_phonemes: List[html.HtmlElement]):
        if len(xml_phonemes) != len(self.requested_phoneme_groups):
            raise AssertionError(
                "The size of original phonems and phonems group is different"
            )

    def _get_percent_of_point_in_its_sequence(
        self, point: Point, start: int, duration: int
    ) -> int:
        relative_ms = point.ms - start
        return int(relative_ms / duration * 100)

    def _modify_phoneme(self, phoneme, duration: int, end: int, f0: PhonemeCoordinates) -> html.HtmlElement:
        phoneme.set("d", str(duration))
        phoneme.set("end", str(end))

        if f0:
            phoneme.set("f0", "".join([f"({t},{hz})" for t, hz in f0]))

        return phoneme

    def _get_mary_xml(self) -> html.HtmlElement:
        return self.tree.xpath("//maryxml")[0]

    def generate(self) -> bytes:
        self._init_tree()

        xml_phonemes = self._get_xml_phonemes()

        self._check_phonemes_groups(xml_phonemes)

        previous_ms = 0
        previous_hz = None

        for i in range(len(xml_phonemes)):
            phoneme_group = self.requested_phoneme_groups[i]
            phoneme_node = xml_phonemes[i]

            f0 = []
            start_ms = previous_ms

            if end_ms := self._get_end_of_phoneme(i):
                duration = end_ms - start_ms
            else:
                # When we can't find the end of the phoneme
                # take its duration from original xml
                duration = int(phoneme_node.get("d"))
                end_ms = start_ms + duration

            if not self._is_accompanying_phoneme(phoneme_group, previous_hz):
                for point in phoneme_group.points:
                    percent = self._get_percent_of_point_in_its_sequence(
                        point, start_ms, duration
                    )

                    f0.append((percent, point.hz))

            phoneme_node = self._modify_phoneme(phoneme_node, duration, end_ms, f0)

            previous_ms = end_ms
            previous_hz = phoneme_group.points[-1].hz

        mary_node = self._get_mary_xml()
        return html.tostring(mary_node)
