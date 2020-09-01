import re
from typing import Any, Tuple

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


def process_phonemes(
    text: str,
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[str, int]:
    content, status_code = repository.load_acoustic_params(text, locale, voice)

    if not status_code == 200:
        return content.decode('utf-8'), status_code

    processor = MaryTTSXMLProcessor(content)

    return processor.process(), status_code


def process_voice_output_from_xml(
    xml: str,
    locale: str,
    voice: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[bytes, str, int]:
    return repository.voice_output_from_xml(xml, locale, voice)


def process_phonemes_from_xml(xml: bytes) -> Tuple[bytes, str, int]:
    return MaryTTSXMLProcessor(xml).process(), 200
