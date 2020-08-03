FROM python:3.8-slim

RUN apt update && apt install -y --no-install-recommends netcat

COPY requirements/ /requirements
RUN pip install -r /requirements/dist.txt

ENV PYTHONPATH /app

COPY . /app

WORKDIR /app
CMD ["./tools/run-production.sh"]
