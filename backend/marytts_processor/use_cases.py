import re
import json
from typing import Any, Tuple, List

from .generator import MaryTTSXMLGenerator, Point
from .marytts import MaryTTSRepository
from .processor import MaryTTSXMLProcessor
from .repository import BaseMaryTTSRepository


def process_voice_output(
    text: str,
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[bytes, str, int]:
    return repository.voice_output(text, locale, voice)


def process_simplified_voice_output(
    text: str,
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[bytes, str, int]:
    original_content, original_status_code, _ = repository.load_acoustic_params(text, locale, voice)

    if original_status_code != 200:
        raise Exception("MaryTTS return incorrect acoustic params")

    points = json.loads(MaryTTSXMLProcessor(original_content).process(should_simplify=True))

    modifiers = [
        Point(
            hz=point['hertz'],
            ms=point['ms'],
            phoneme=point['phoneme_name']
        ) for point in points
    ]

    xml = MaryTTSXMLGenerator(original_content, modifiers).generate()
    return repository.voice_output_from_xml(xml, locale, voice)


def process_voice_output_from_text_and_points(
    text: str,
    modifiers: List[Point],
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[bytes, str, int]:
    original_content, original_status_code, _ = repository.load_acoustic_params(text, locale, voice)

    if original_status_code != 200:
        raise Exception("MaryTTS return incorrect acoustic params")

    xml = MaryTTSXMLGenerator(original_content, modifiers).generate()
    return repository.voice_output_from_xml(xml, locale, voice)


def process_phonemes(
    text: str,
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[str, int]:
    content, status_code, _ = repository.load_acoustic_params(text, locale, voice)

    if not status_code == 200:
        return content.decode('utf-8'), status_code

    processor = MaryTTSXMLProcessor(content)

    return processor.process(should_simplify=False), status_code


def process_simplified_phonemes(
    text: str,
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
)-> Tuple[str, int]:
    content, status_code, _ = repository.load_acoustic_params(text, locale, voice)

    if not status_code == 200:
        return content.decode('utf-8'), status_code

    processor = MaryTTSXMLProcessor(content)

    return processor.process(should_simplify=True), status_code


def get_xml(
    text: str,
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[bytes, int, str]:
    return repository.load_acoustic_params(text, locale, voice)


def get_xml_from_text_and_modifiers(
    text: str,
    modifiers: List[Point],
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[bytes, int, str]:
    xml, status_code, headers = repository.load_acoustic_params(text, locale, voice)
    return MaryTTSXMLGenerator(xml, modifiers).generate(), status_code, headers


def get_xml_from_xml_and_modifiers(
    xml: str,
    modifiers: List[Point],
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[bytes, int, str]:
    import logging; logging.error(xml)
    return MaryTTSXMLGenerator(bytes(xml, 'utf-8'), modifiers).generate(), 200, 'text/plain'


def process_voice_output_from_xml(
    xml: str,
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[bytes, str, int]:
    return repository.voice_output_from_xml(xml, locale, voice)


def process_simplified_voice_output_from_xml(
    xml: str,
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[bytes, str, int]:
    points = json.loads(MaryTTSXMLProcessor(bytes(xml, 'utf-8')).process(should_simplify=True))

    modifiers = [
        Point(
            hz=point['hertz'],
            ms=point['ms'],
            phoneme=point['phoneme_name']
        ) for point in points
    ]

    simplified_xml = MaryTTSXMLGenerator(bytes(xml, 'utf-8'), modifiers).generate()
    return repository.voice_output_from_xml(simplified_xml, locale, voice)


def process_voice_output_from_xml_and_modifiers(
    xml: str,
    modifiers: List[Point],
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[bytes, str, int]:
    simplified_xml = MaryTTSXMLGenerator(bytes(xml, 'utf-8'), modifiers).generate()
    return repository.voice_output_from_xml(simplified_xml, locale, voice)


def process_phonemes_from_xml(xml: bytes) -> Tuple[bytes, str, int]:
    return MaryTTSXMLProcessor(xml).process(should_simplify=False), 200


def process_simplified_phonemes_from_xml(xml: bytes) -> Tuple[bytes, str, int]:
    return MaryTTSXMLProcessor(xml).process(should_simplify=True), 200
