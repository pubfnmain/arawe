from asyncio import create_task
from contextlib import asynccontextmanager

from starlette.applications import Starlette
from starlette.routing import Route, Mount, WebSocketRoute
from starlette.staticfiles import StaticFiles

from .service import listen
from .endpoints import index, Socket


@asynccontextmanager
async def lifespan(app):
    task = create_task(listen())
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
