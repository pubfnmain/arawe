from asyncio import gather, sleep, create_task
from aiohttp.web import WebSocketResponse

from . import WIDTH, HEIGHT
from .object import Player, Shell


class Game:
    players: dict[str, Player] = {}
    shells: list[Shell] = []
    sockets: list[WebSocketResponse] = []

    def disconnect(self, name: str, ws: WebSocketResponse):
        player = self.players.get(name)
        if player:
            player.state = False
        self.sockets.remove(ws)

    async def connect(self, name: str, ws: WebSocketResponse) -> Player | None:
        player = self.players.get(name)
        if player:
            if player.state:
                return None
            player.state = True
            self.sockets.append(ws)
        else:
            self.players[name] = player = Player(64, 64)
            self.sockets.append(ws)
            for socket in self.sockets:
                await socket.send_str(player.new())

        for name, p in self.players.items():
            await ws.send_str(p.get_pos())
            await ws.send_str(p.repr + ":name:" + name)
            await ws.send_str(p.get_hp())
            await ws.send_str(p.get_sh())

        return player       

    async def send(self, msg):
        try:
            for socket in self.sockets:
                await socket.send_str(msg)
        except:
            pass

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

                if 0 >= shell.x or shell.x >= WIDTH:
                    self.shells.pop(i)
                    await self.send(shell.delete())
                    continue
                elif 0 >= shell.y or shell.y >= HEIGHT:
                    self.shells.pop(i)
                    await self.send(shell.delete())
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
                        self.shells.pop(i)
                        await self.send(p.get_hp())
                        await self.send(shell.delete())
            await sleep(0.03)
