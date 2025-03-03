from re import match

from starlette.endpoints import WebSocketEndpoint
from starlette.responses import FileResponse
from starlette.websockets import WebSocket, WebSocketDisconnect

from . import game
from .game import lock


async def index(request):
    return FileResponse("index.html")


# class Socket(WebSocketEndpoint):
#     encoding = "text"

#     async def on_connect(self, websocket: WebSocket) -> None:
#         await game.connect(websocket)
#         # print(game.sockets)

#     async def on_receive(self, websocket: WebSocket, data) -> None:
#         player = game.players.get(websocket.path_params["name"])
#         if not player:
#             return
#         # TODO: regular expressions
#         if data == "use":
#             await game.use(player)
#         elif (m := match(r"aux:([+-]?(?:\d*\.*\d+)),([+-]?(?:\d*\.*\d+))", data)):
#             await game.aux(player, float(m.group(1)), float(m.group(2)))
#         elif (m := match(r"vec:([+-]?(?:\d*\.*\d+)),([+-]?(?:\d*\.*\d+))", data)):
#             await game.vec(player, float(m.group(1)), float(m.group(2)))
    
#     async def on_disconnect(self, websocket, close_code) -> None:
#         game.disconnect(websocket)


async def Socket(ws):
    player = await game.connect(ws)
    try:
        while True:
            data = await ws.receive_text()
            if not player:
                return
            # TODO: regular expressions
            if data == "use":
                await game.use(player)
            elif (m := match(r"aux:([+-]?(?:\d*\.*\d+)),([+-]?(?:\d*\.*\d+))", data)):
                await game.aux(player, float(m.group(1)), float(m.group(2)))
            elif (m := match(r"vec:([+-]?(?:\d*\.*\d+)),([+-]?(?:\d*\.*\d+))", data)):
                await game.vec(player, float(m.group(1)), float(m.group(2)))
    except:
        async with lock:
            game.disconnect(ws)

