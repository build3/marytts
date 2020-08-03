import gevent

from gevent.pywsgi import WSGIServer

from . import create_app

app = create_app()


if __name__ == '__main__':
    try:
        gevent.joinall([
            gevent.spawn(app.run, '0.0.0.0', 8000, True),
        ])
    except KeyboardInterrupt:
        print('Exiting')
