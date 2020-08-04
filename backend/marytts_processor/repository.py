from typing import Tuple

class BaseMaryTTSRepository(object):
    def voice_output(self, text: str) -> Tuple[bytes, str, int]:
        raise NotImplementedError
