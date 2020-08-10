FROM python:3.8-slim

RUN apt update && apt install -y --no-install-recommends libxml2-dev libxml2-utils libxslt-dev python3-lxml netcat

WORKDIR /app
CMD "./tools/run-development.sh"
