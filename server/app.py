from asyncio import create_task
from contextlib import asynccontextmanager

from starlette.applications import Starlette
from starlette.routing import Route, Mount, WebSocketRoute
from starlette.staticfiles import StaticFiles

from . import game
from .endpoints import index, Socket


@asynccontextmanager
async def lifespan(app):
    task = create_task(game.loop())
    yield


app = Starlette(
    debug=True,
    lifespan=lifespan,
    routes=(
        Route('/', index),
        Mount('/static', app=StaticFiles(directory="static")),
        WebSocketRoute("/{name:str}", Socket)
    ),
)
