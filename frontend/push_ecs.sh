#!/usr/bin/env bash
URL=211579213271.dkr.ecr.us-east-1.amazonaws.com
IMAGE=matrytts/frontend
aws ecr get-login-password | docker login --username AWS --password-stdin https://$URL
docker build -f docker/production/Dockerfile -t lapop .
docker tag lapop:latest $URL/$IMAGE:latest
docker push $URL/$IMAGE:latest
