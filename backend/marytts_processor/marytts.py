import os
import requests
from typing import Tuple
from urllib.parse import urlencode

from .repository import BaseMaryTTSRepository


MARYTTS_URL = os.environ['MARYTTS_URL']

MARYTTS_PROCESS_ENDPOINT = 'process'


class MaryTTSRepository(BaseMaryTTSRepository):

    def voice_output(self, text: str, locale: str, voice: str) -> Tuple[bytes, str, int]:
        query_hash = {
            "INPUT_TEXT": text,
            "INPUT_TYPE": "TEXT",
            "LOCALE": locale,
            "VOICE": voice,
            "OUTPUT_TYPE": "AUDIO",
            "AUDIO": "WAVE",
        }

        query = urlencode(query_hash)

        response = self._send_process_request(query)

        return response.content, response.headers['Content-Type'], response.status_code

    def load_acoustic_params(self, text: str, locale: str, voice: str) -> Tuple[bytes, int, str]:
        query_hash = {
            "INPUT_TEXT": text,
            "INPUT_TYPE": "TEXT",
            "LOCALE": locale,
            "VOICE": voice,
            "OUTPUT_TYPE": "ACOUSTPARAMS",
            "AUDIO": "WAVE",
        }

        query = urlencode(query_hash)

        response = self._send_process_request(query)

        return response.content, response.status_code, response.headers['Content-Type']

    def _send_process_request(self, query: str) -> 'Response':
        return requests.post(f"{MARYTTS_URL}{MARYTTS_PROCESS_ENDPOINT}?{query}")
