# Multiplayer Pong

A small Pong game for two people. The Python server controls the ball, paddles, and score, then sends the same game state to both browsers over WebSockets.

## Run with Docker

```sh
docker build -t multiplayer-pong .
docker run --rm -p 8000:8000 multiplayer-pong
```

Open [http://localhost:8000](http://localhost:8000) in two browser windows. Player 1 uses **W/S**; Player 2 uses **Up/Down**.

## Run without Docker

```sh
python -m pip install -r requirements.txt
python server.py
```


