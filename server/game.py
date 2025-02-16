from asyncio import gather, sleep, create_task, Lock

from starlette.websockets import WebSocket, WebSocketDisconnect, WebSocketState

from . import WIDTH, HEIGHT
from .object import Player, Shell


lock = Lock()


class Game:
    players: dict[str, Player] = {}
    shells: list[Shell] = []
    sockets: list[WebSocket] = []

    async def add_socket(self, ws: WebSocket):
        await ws.accept()
        self.sockets.append(ws)

    def disconnect(self, ws: WebSocket):
        name = ws.path_params["name"]
        player = self.players.get(name)
        if player:
            player.state = False
        self.sockets.remove(ws)

    async def connect(self, ws: WebSocket) -> Player | None:
        name = ws.path_params["name"]
        player = self.players.get(name)
        if player:
            if player.state:
                return None
            player.state = True
            await self.add_socket(ws)
        else:
            self.players[name] = player = Player(64, 64)
            await self.add_socket(ws)
            for socket in self.sockets:
                await socket.send_text(player.new())

        for name, p in self.players.items():
            await ws.send_text(p.get_pos())
            await ws.send_text(p.repr + ":name:" + name)
            await ws.send_text(p.get_hp())
            await ws.send_text(p.get_sh())

        return player       

    async def send(self, msg):
        # print(self.sockets)
        for socket in self.sockets:
            await socket.send_text(msg)

    async def use(self, player: Player):
        if player.use:
            return

        player.use = 16
        await self.send(player.repr + ":use")
        for name in tuple(self.players):
            p = self.players[name]
            if p is player:
                continue
            if abs(player.x - p.x) <= 16 and abs(player.y - p.y) <= 16:
                p.hp -= 10
                if not p.hp:
                    del self.players[name]
                await self.send(p.get_hp())

    async def aux(self, player: Player, dx, dy):
        if player.aux:
            return

        player.aux = 16
        self.shells.append(Shell(player, dx, dy))

    async def vec(self, player, dx, dy):
        player.dx = dx
        player.dy = dy
        await self.send(player.get_vec())

    async def loop(self):
        while True:
            for player in self.players.values():
                if player.use:
                    player.use -= 1
                if player.aux:
                    player.aux -= 1
                if player.move():
                    await self.send(player.get_pos())

            for i in range(len(self.shells) - 1, -1, -1):
                shell = self.shells[i]
                shell.move()

                if 0 > shell.x or shell.x > WIDTH:
                    self.shells.pop(i)
                    continue
                elif 0 > shell.y or shell.y > HEIGHT:
                    self.shells.pop(i)
                    continue

                await self.send(shell.get_pos())

                for name in tuple(self.players):
                    p = self.players[name]
                    if p is shell.p:
                        continue
                    if abs(shell.x - p.x) <= 8 and abs(shell.y - p.y) <= 8:
                        p.hp -= 10
                        if not p.hp:
                            del self.players[name]
                        await self.send(p.get_hp())

            await sleep(0.03)
