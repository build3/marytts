from typing import Tuple


class BaseMaryTTSRepository(object):

    def voice_output(self, text: str, locale: str, voice: str) -> Tuple[bytes, str, int]:
        raise NotImplementedError

    def load_acoustic_params(self, text: str, locale: str, voice: str) -> Tuple[bytes, int, str]:
        raise NotImplementedError

    def voice_output_from_xml(self, xml: str) -> Tuple[bytes, str, int]:
        raise NotImplementedError
