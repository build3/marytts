from typing import Tuple

class BaseMaryTTSRepository(object):

    def voice_output(self, text: str, locale: str, voice: str) -> Tuple[bytes, str, int]:
        raise NotImplementedError

    def load_acoustic_params(self, text: str, locale: str, voice: str) -> Tuple[bytes, int]:
        raise NotImplementedError
