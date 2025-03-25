from redis.asyncio.client import PubSub
from starlette.websockets import WebSocket

from . import r


sockets: dict[WebSocket, str | None] = {}


async def listen():
    async with r.pubsub() as p:
        await p.subscribe("main")
        async for msg in p.listen():
            if msg["type"] == "message":
                for socket in sockets:
                    await socket.send_text(msg["data"])

async def create_player(websocket: WebSocket) -> None:
    name = websocket.path_params["name"]
    player = await r.hget("players", name)

    if player:
        state = await r.hget(player, "state")
        if state == "1":
            return
        await r.hset(player, "state", 1)
    else:
        player = "p:" + str(await r.incr("pid"))
        await r.hset("players", name, player)
        await r.hset(player, mapping={
            "hp": 100,
            "sh": 0,
            "x": 64,
            "y": 64,
            "dx": 0,
            "dy": 0,
            "state": 1,
            "name": name
        })
        await r.publish("main", player + ":emerge:64,64")
    sockets[websocket] = player
    players = await r.hvals("players")
    for player in players:
        p = await r.hgetall(player)
        await websocket.send_text(f"{player}:pos:{p['x']},{p['y']}")

       
async def disable_player(websocket: WebSocket) -> None:
    if (player := sockets.pop(websocket)):
        await r.hset(player, "state", 0)


async def use(player, dx=None, dy=None):
    await r.publish("main", player + ":use")
    # player = self.get_player(websocket)
    # if not player or player.use:
    #     return

    # player.use = 16
    # await self.send_all(f"{player}:use")
    # for name, enemy in tuple(self.players.items()):
    #     if enemy is player:
    #         continue

    #     px1 = player.x + 16 * player.dir
    #     py0 = player.y - 16
    #     py1 = player.y + 16

    #     if px1 > player.x:
    #         px0 = player.x
    #     else:
    #         px0, px1 = px1, player.x

    #     ex0 = enemy.x - 4
    #     ex1 = enemy.x + 4
    #     ey0 = enemy.y - 16
    #     ey1 = enemy.y + 16

    #     if (((px0 <= ex0 <= px1) or (px0 <= ex1 <= px1))
    #         and ((py0 <= ey0 <= py1) or (py0 <= ey1 <= py1))):
    #         enemy.hp -= 10
    #         await self.send_all(enemy.get_hp())
    #         if not enemy.hp:
                # self.players.pop(name)
    pass


async def set_player_vector(player, dx, dy):
    await r.hset(player, "dx", dx)
    await r.hset(player, "dy", dy)
    await r.publish("main", f"{player}:vec:{dx},{dy}")
