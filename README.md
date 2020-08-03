## marytts-vis
Research project with Mary-TTS integration.

## Running
To run project for development you should execute following command:

```
docker-compose -f docker/development/docker-compose.yml up --build
```

This will spawn 3 containers. One for frontend application.
Second for backend application at `localhost:8000` and
third for MaryTTS server at `localhost:59125`.
