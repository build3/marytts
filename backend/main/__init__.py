import os

from gevent import monkey; monkey.patch_all()

from flask import Flask
from flask_cors import CORS


def create_app():
    app = Flask('mtts', instance_relative_config=True)

    app.config.from_mapping(
        SECRET_KEY='dev',
    )

    CORS(app)

    app.config.from_pyfile('config.py', silent=True)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    return app
