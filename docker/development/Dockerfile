FROM python:3.8-slim

RUN apt update && apt install -y --no-install-recommends netcat nodejs npm
RUN npm install npm@latest -g

WORKDIR /app
CMD "./tools/run-development.sh"
