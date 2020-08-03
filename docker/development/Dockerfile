FROM python:3.8-slim

RUN apt update && apt install -y --no-install-recommends netcat

WORKDIR /app
CMD "./tools/run-development.sh"
