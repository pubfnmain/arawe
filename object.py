from starlette.websockets import WebSocket


class Object:
    x: float
    y: float


class Shell(Object):
    speed: int = 2
    dx: float = 0
    dy: float = 0

    def move(self) -> bool:
        if self.dx or self.dy:
            self.x += self.dx * self.speed
            self.y += self.dy * self.speed
            return True
        return False


class Player(Shell):
    name: str
    websocket: WebSocket | None = None
    hp = 100
    use = 0
    dir = -1

    def __str__(self):
        return 'p:' + self.name

    def __init__(self, websocket, x, y):
        self.websocket = websocket
        self.name = websocket.path_params["username"]
        self.x = x
        self.y = y

    def update(self):
        if self.use:
            self.use -= 1

    def get_pos(self):
        return f"{self}:pos:{self.x},{self.y}"

    def emerge(self):
        return f"{self}:emerge:{self.x},{self.y}"

    def get_hp(self):
        return f"{self}:hp:{self.hp}"

    def get_vector(self):
        return f"{self}:vec:{self.dx},{self.dy}"

    def set_vector(self, dx, dy):
        self.dx = dx
        self.dy = dy
        if dx:
            self.dir = dx
        # TODO: if dx is float then dir is the sign of dx
