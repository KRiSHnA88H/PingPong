"""A tiny authoritative Pong server for two players."""

import asyncio
import json
from pathlib import Path

from aiohttp import WSMsgType, web


WIDTH = 500
HEIGHT = 500
PADDLE_HEIGHT = 90
PADDLE_SPEED = 7
BALL_SIZE = 12

players = {}
game = {
    "paddles": [205, 205],
    "ball": [250, 250],
    "ball_speed": [-5, 3],
    "scores": [0, 0],
}


def reset_ball(direction):
    game["ball"] = [250, 250]
    game["ball_speed"] = [5 * direction, 3]


def move_ball():
    ball_x, ball_y = game["ball"]
    speed_x, speed_y = game["ball_speed"]
    ball_x += speed_x
    ball_y += speed_y

    if ball_y <= 0 or ball_y + BALL_SIZE >= HEIGHT:
        speed_y *= -1

    # Bounce off a paddle when the ball reaches its side.
    if speed_x < 0 and ball_x <= 32 and game["paddles"][0] <= ball_y + BALL_SIZE and ball_y <= game["paddles"][0] + PADDLE_HEIGHT:
        speed_x = abs(speed_x)
    elif speed_x > 0 and ball_x + BALL_SIZE >= 468 and game["paddles"][1] <= ball_y + BALL_SIZE and ball_y <= game["paddles"][1] + PADDLE_HEIGHT:
        speed_x = -abs(speed_x)

    if ball_x < 0:
        game["scores"][1] += 1
        reset_ball(1)
        return
    if ball_x > WIDTH:
        game["scores"][0] += 1
        reset_ball(-1)
        return

    game["ball"] = [ball_x, ball_y]
    game["ball_speed"] = [speed_x, speed_y]


async def send_state():
    state = {
        "type": "state",
        "players": len(players),
        "paddles": game["paddles"],
        "ball": game["ball"],
        "scores": game["scores"],
    }
    message = json.dumps(state)
    for socket in list(players):
        if not socket.closed:
            await socket.send_str(message)


async def game_loop(app):
    while True:
        await asyncio.sleep(1 / 60)
        if len(players) == 2:
            for player in players.values():
                index = player["slot"]
                game["paddles"][index] = max(
                    0,
                    min(HEIGHT - PADDLE_HEIGHT, game["paddles"][index] + player["direction"] * PADDLE_SPEED),
                )
            move_ball()
        await send_state()


async def start_game_loop(app):
    app["game_task"] = asyncio.create_task(game_loop(app))


async def stop_game_loop(app):
    app["game_task"].cancel()
    await asyncio.gather(app["game_task"], return_exceptions=True)


async def home(request):
    return web.FileResponse(Path(__file__).with_name("index.html"))


async def websocket(request):
    socket = web.WebSocketResponse()
    await socket.prepare(request)

    if len(players) >= 2:
        await socket.send_json({"type": "full", "message": "This game already has two players."})
        await socket.close()
        return socket

    occupied_slots = {player["slot"] for player in players.values()}
    player_number = 1 if 0 not in occupied_slots else 2
    players[socket] = {"slot": player_number - 1, "direction": 0}
    await socket.send_json({"type": "welcome", "player": player_number})
    await send_state()

    try:
        async for message in socket:
            if message.type == WSMsgType.TEXT:
                try:
                    data = json.loads(message.data)
                    if data.get("type") == "move":
                        players[socket]["direction"] = max(-1, min(1, int(data.get("direction", 0))))
                except (ValueError, TypeError, json.JSONDecodeError):
                    continue
            elif message.type == WSMsgType.ERROR:
                break
    finally:
        players.pop(socket, None)
        await send_state()

    return socket


app = web.Application()
app.router.add_get("/", home)
app.router.add_get("/ws", websocket)
app.on_startup.append(start_game_loop)
app.on_cleanup.append(stop_game_loop)

if __name__ == "__main__":
    web.run_app(app, host="0.0.0.0", port=8000)
