from .marytts import MaryTTSRepository
from .repository import BaseMaryTTSRepository


def process_voice_output(
    text: str,
    repository: BaseMaryTTSRepository = MaryTTSRepository()
) -> bytes:
    return repository.voice_output(text)
