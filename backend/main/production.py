import os

import gevent
from gevent.pywsgi import WSGIServer

from . import create_app


APP_HOST = os.environ.get('HOST', '0.0.0.0')
APP_PORT = int(os.environ.get('PORT', 8000))


if __name__ == '__main__':
    http_frame_gateway_server = WSGIServer((APP_HOST, APP_PORT), create_app())

    try:
        gevent.joinall([
            gevent.spawn(http_frame_gateway_server.serve_forever),
        ])
    except KeyboardInterrupt:
        print('Exiting')
