from asyncio import sleep, create_task
from contextlib import asynccontextmanager

from starlette.applications import Starlette
from starlette.responses import FileResponse
from starlette.routing import Route, Mount, WebSocketRoute
from starlette.staticfiles import StaticFiles
from starlette.endpoints import WebSocketEndpoint

from server import Process, game


async def index(request):
    return FileResponse("index.html")


@asynccontextmanager
async def lifespan(app):
    task = create_task(game.loop())
    yield


app = Starlette(
    debug=True,
    routes=(
        Route('/', index),
        Mount('/static', app=StaticFiles(directory="static")),
        WebSocketRoute("/{username:str}", Process)
    ),
    lifespan=lifespan
)
