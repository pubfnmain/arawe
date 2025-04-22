from asyncio import gather, sleep, create_task
from random import randrange, random
import traceback

from aiohttp.web import WebSocketResponse

from . import WIDTH, HEIGHT
from .object import Player, Shell, Monster, Texture


class Game:
    players: dict[str, Player] = {
        "M" + str(i): Monster(randrange(256, WIDTH - 256), randrange(256, HEIGHT - 256))
        for i in range(16)
    }
    textures: list[Texture] = [
        Texture(randrange(64, WIDTH - 64), randrange(64, HEIGHT - 64), int(random() < .5))
        for i in range(64)
    ]
    shells: list[Shell] = []
    sockets: list[WebSocketResponse] = []

    def disconnect(self, name: str, ws: WebSocketResponse):
        player = self.players.get(name)
        if player:
            player.state = False
        if ws in self.sockets: # undefined error
            self.sockets.remove(ws)

    async def connect(self, name: str, ws: WebSocketResponse) -> Player | None:
        player = self.players.get(name)
        if player:
            if player.state:
                return None
            player.state = True
            self.sockets.append(ws)
            # for socket in self.sockets:
            #     await socket.send_str(player.repr + ":name:" + name)
        else:
            self.players[name] = player = Player(randrange(256, WIDTH - 256),
                                                 randrange(256, HEIGHT - 256))
            self.sockets.append(ws)
            for socket in self.sockets:
                await socket.send_str(player.new())
                await socket.send_str(player.name(name))
                await ws.send_str(player.name(name))

        for name, p in self.players.items():
            await ws.send_str(p.get_pos())
            await ws.send_str(p.name(name))
            await ws.send_str(p.get_hp())
            await ws.send_str(p.get_sh())

        for i in self.textures:
            await ws.send_str(i.get_data())

        return player       

    async def send(self, msg):
        for socket in self.sockets:
            try:
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
            if abs(player.x - p.x) <= 32 and abs(player.y - p.y) <= 32:
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
        try:
            while True:
                for player in self.players.values():
                    if isinstance(player, Monster):
                        await player.process(self)
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
                        if isinstance(shell.p, Monster) and isinstance(p, Monster):
                            continue
                        if p is shell.p:
                            continue
                        if abs(shell.x - p.x) <= 16 and abs(shell.y - p.y) <= 16:
                            p.hp -= 10
                            if not p.hp:
                                del self.players[name]
                            self.shells.pop(i)
                            await self.send(p.get_hp())
                            await self.send(shell.delete())
                            break

                await sleep(0.03)
        except Exception as e:
            tb = traceback.extract_tb(e.__traceback__)
            print(e, tb)
            print(tb.name, tb.line, e)
