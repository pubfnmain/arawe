from re import match

from aiohttp import WSMsgType
from aiohttp.web import FileResponse, WebSocketResponse

from . import game


async def index(request):
    return FileResponse("index.html")


async def socket(request):
    name = request.match_info["name"][:16]
    ws = WebSocketResponse()
    await ws.prepare(request)
    try:
        if (player := await game.connect(name, ws)):
            async for msg in ws:
                if msg.type == WSMsgType.TEXT:
                    if msg.data == 'close':
                        break
                    else:
                        data = msg.data
                        # TODO: regular expressions
                        if data == "use":
                            await game.use(player)
                        elif (m := match(r"aux:([+-]?(?:\d*\.*\d+)),([+-]?(?:\d*\.*\d+))", data)):
                            await game.aux(player, float(m.group(1)), float(m.group(2)))
                        elif (m := match(r"vec:([+-]?(?:\d*\.*\d+)),([+-]?(?:\d*\.*\d+))", data)):
                            await game.vec(player, float(m.group(1)), float(m.group(2)))
                elif msg.type == WSMsgType.ERROR:
                    break
                    print('ws connection closed with exception %s' % ws.exception())
    finally:
        game.disconnect(name, ws)
        await ws.close()

    return ws
