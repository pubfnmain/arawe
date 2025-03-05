from . import WIDTH, HEIGHT


class Object:
    id: int
    x: float
    y: float
    char = "o"
    repr: str

    def __init__(self, x, y):
        self.__class__.id += 1
        self.x = x
        self.y = y
        self.repr = self.char + str(self.id)


class Vector(Object):
    dx: float = 0
    dy: float = 0
    speed = 3

    def move(self) -> bool:
        if self.dx or self.dy:
            x = self.x + self.dx * self.speed
            y = self.y + self.dy * self.speed
            if 0 > x:
                self.x = 0
            elif x > WIDTH:
                self.x = WIDTH 
            else:
                self.x = x

            if 0 > y:
                self.y = 0
            elif y > HEIGHT:
                self.y = HEIGHT
            else:
                self.y = y
            return True
        return False

    def get_pos(self):
        return f"{self.repr}:pos:{self.x:.2f},{self.y:.2f}"


class Player(Vector):
    id: int = 0
    hp: int = 100
    sh: int = 0
    use: int = 0
    aux: int = 0
    char = "p"
    state: bool = True

    def get_hp(self):
        return f"{self.repr}:hp:{self.hp}"

    def get_sh(self):
        return f"{self.repr}:sh:{self.sh}"

    def get_vec(self):
        return f"{self.repr}:vec:{self.dx:.2f},{self.dy:.2f}"

    def new(self):
        return f"{self.repr}:new:{self.x:.2f},{self.y:.2f}"


class Shell(Vector):
    id: int = 0
    p: Player
    char = "s"

    def __init__(self, p: Player, dx, dy):
        self.p = p
        super().__init__(p.x, p.y)
        self.dx = dx
        self.dy = dy

    def delete(self):
        return f"{self.repr}:del"
