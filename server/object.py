from random import randint, random

from . import WIDTH, HEIGHT


class Object:
    id: int = 0
    x: float
    y: float
    char: str
    repr: str

    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y
        self.repr = self.char + ':' + str(Object.id)
        Object.id += 1

    def get_pos(self):
        return f"{self.repr}:pos:{self.x:.2f},{self.y:.2f}"


class Texture(Object):
    char = 't'

    def __init__(self, x: int, y: int, code: int):
        super().__init__(x, y)
        self.code = code

    def get_data(self):
        return f"{self.repr}:{self.code}:{self.x:.2f},{self.y:.2f}"


class Vector(Object):
    dx: float
    dy: float
    speed = 5

    def __init__(self, x: float, y: float,
                 dx: float = 0, dy: float = 0) -> None:
        super().__init__(x, y)
        self.dx = dx
        self.dy = dy

    def move(self) -> bool:
        moved = False

        if self.dx:
            x = self.x + self.dx * self.speed
            if 0 > x:
                self.x = 0
            elif x > WIDTH:
                self.x = WIDTH 
            else:
                self.x = x
            moved = True

        if self.dy:
            y = self.y + self.dy * self.speed
            if 0 > y:
                self.y = 0
            elif y > HEIGHT:
                self.y = HEIGHT
            else:
                self.y = y
            moved = True

        return moved


class Player(Vector):
    hp: int = 100
    sh: int = 0
    use: int = 0
    aux: int = 0
    char = 'p'
    state: bool = True

    def name(self, name):
        return f"{self.repr}:name:{name}"

    def get_hp(self):
        return f"{self.repr}:hp:{self.hp}"

    def get_sh(self):
        return f"{self.repr}:sh:{self.sh}"

    def get_vec(self):
        return f"{self.repr}:vec:{self.dx:.2f},{self.dy:.2f}"

    def new(self):
        return f"{self.repr}:new:{self.x:.2f},{self.y:.2f}"


class Monster(Player):
    char = 'm'
    agr = 512
    hit = 256
    speed = 4

    async def process(self, game):
        agr = False
        hit = False
        target = None

        for player in game.players.values():
            if player is self or isinstance(player, Monster):
                continue
            dist = ((self.x - player.x) ** 2 + (self.y - player.y) ** 2) ** .5
            if self.hit >= dist:
                hit = True
                target = player
                break
            if self.agr >= dist:
                agr = True
                target = player

        if target:
            dx = target.x - self.x
            dy = target.y - self.y
            divider = max(abs(dx), abs(dy))
            if divider:
                dx /= divider
                dy /= divider

                if hit:
                    # print(self.x, target.x, self.y, target.y, divider, dx, dy)
                    await game.aux(self, dx, dy)

                if agr:
                    await game.vec(self, dx, dy)
        else:
            self.dx = 0
            self.dy = 0


class Shell(Vector):
    p: Player
    char = 's'

    def __init__(self, p: Player, dx, dy):
        self.p = p
        super().__init__(p.x, p.y, dx, dy)

    def delete(self):
        return f"{self.repr}:del"
