from asyncio import create_task
import logging as log

from aiohttp.web import Application, run_app, static, get

from . import game
from .views import index, socket


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
