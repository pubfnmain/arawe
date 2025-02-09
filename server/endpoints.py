from re import match

from starlette.endpoints import WebSocketEndpoint
from starlette.responses import FileResponse
from starlette.websockets import WebSocket

from .service import create_player, disable_player, sockets, set_player_vector, use


async def index(request):
    return FileResponse("index.html")


class Socket(WebSocketEndpoint):
    encoding = "text"

    async def on_connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        await create_player(websocket)

    async def on_receive(self, websocket: WebSocket, data) -> None:
        player = sockets.get(websocket)
        if not player:
            return
        # TODO: regular expressions
        if data == "use":
            await use(player)
        elif (m := match(r"vec:([+-]?\d+),([+-]?\d+)", data)):
            # TODO: float args
            await set_player_vector(player, int(m.group(1)), int(m.group(2)))
    
    async def on_disconnect(self, websocket, close_code) -> None:
        await disable_player(websocket)
