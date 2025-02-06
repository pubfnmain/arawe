from asyncio import sleep

from starlette.endpoints import WebSocketEndpoint
from starlette.websockets import WebSocket

from object import Player


def vector(i):
    if i.startswith("-"):
        mod = i[1:]
    else:
        mod = i
    if not mod.isdigit():
        return None
    i = int(i)
    if i < -1 or i > 1:
        return None
    return i


class Game:
    width = 640
    height = 640
    players: dict[str, Player] = {}

    async def create_player(self, websocket: WebSocket) -> None:
        username = websocket.path_params["username"]
        if (player := self.players.get(username)):
            if player.websocket:
                await websocket.close()
                return
            player.websocket = websocket
            await websocket.accept()
            for enemy in self.players.values():
                await websocket.send_text(enemy.get_pos())
                await websocket.send_text(enemy.get_vector())
                await websocket.send_text(enemy.get_hp())
        elif len(self.players) > 9:
            return await websocket.close()
        else:
            self.players[username] = player = Player(websocket, 64, 64)
            pos = player.emerge()
            hp = player.get_hp()
            await websocket.accept()
            for enemy in self.players.values():
                if enemy is player:
                    await websocket.send_text(enemy.emerge())
                    await websocket.send_text(enemy.get_vector())
                else:
                    await websocket.send_text(enemy.get_pos())
                    await websocket.send_text(enemy.get_vector())
                    await websocket.send_text(enemy.get_hp())
                    if (ws := enemy.websocket):
                        await ws.send_text(pos)
                        await ws.send_text(hp)
           
    def disable_player(self, websocket: WebSocket) -> None:
        if (player := self.get_player(websocket)):
            player.websocket = None

    def get_player(self, websocket) -> Player | None:
        username = websocket.path_params["username"]
        player = self.players.get(username)
        if player and player.websocket == websocket:
            return player

    async def send_all(self, msg: str):
        for player in self.players.values():
            if player.websocket:
                await player.websocket.send_text(msg)

    async def use(self, websocket, dx=None, dy=None):
        player = self.get_player(websocket)
        if not player or player.use:
            return

        player.use = 16
        await self.send_all(f"{player}:use")
        for name, enemy in tuple(self.players.items()):
            if enemy is player:
                continue

            px1 = player.x + 16 * player.dir
            py0 = player.y - 16
            py1 = player.y + 16

            if px1 > player.x:
                px0 = player.x
            else:
                px0, px1 = px1, player.x

            ex0 = enemy.x - 4
            ex1 = enemy.x + 4
            ey0 = enemy.y - 16
            ey1 = enemy.y + 16

            if (((px0 <= ex0 <= px1) or (px0 <= ex1 <= px1))
                and ((py0 <= ey0 <= py1) or (py0 <= ey1 <= py1))):
                enemy.hp -= 10
                await self.send_all(enemy.get_hp())
                if not enemy.hp:
                    self.players.pop(name)

    async def set_vector(self, websocket, dx, dy):
        player = self.get_player(websocket)
        if not player:
            return
        player.set_vector(dx, dy)
        await self.send_all(player.get_vector())

    async def loop(self):
        while True:
            for player in self.players.values():
                if player.move():
                    await self.send_all(player.get_pos())
                player.update()
            await sleep(0.032)


game = Game()


class Process(WebSocketEndpoint):
    encoding = "text"

    async def on_connect(self, websocket: WebSocket) -> None:
        await game.create_player(websocket)

    async def on_receive(self, websocket: WebSocket, data) -> None:
        if data == "use":
            await game.use(websocket)
        else:
            msg = data.split(':')
            if len(msg) != 2:
                return
            cmd, args = msg[0], msg[1].split(',')
            if cmd != "vec":
                return
            if len(args) != 2:
                return
            dx = vector(args[0])
            dy = vector(args[1])
            if dx is None or dy is None:
                return
            await game.set_vector(websocket, dx, dy)       
    
    async def on_disconnect(self, websocket, close_code) -> None:
        game.disable_player(websocket)
