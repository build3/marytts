#!/bin/sh

set -e

pip install -r requirements/local.txt

exec python -m main.development
