from typing import Tuple

from .marytts import MaryTTSRepository
from .repository import BaseMaryTTSRepository


def process_voice_output(
    text: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> Tuple[bytes, str, int]:
    return repository.voice_output(text)
