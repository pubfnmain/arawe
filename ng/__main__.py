from asyncio import create_task

from aiohttp.web import Application, run_app, static, get

from . import game
from .handlers import index, socket


async def game_loop(app):
    task = create_task(game.loop())
    yield
    task.cancel()


app = Application()
app.add_routes([
    static("/static", "static"),
    get("/", index),
    get("/{name}", socket)
])
app.cleanup_ctx.append(game_loop)
run_app(app)
