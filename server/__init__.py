from asyncio import sleep, run
from redis.asyncio import Redis


r = Redis(decode_responses=True)
SPEED = 2


async def loop():
    while True:
        players = await r.hvals("players")
        for player in players:
            dx = float(await r.hget(player, "dx")) * SPEED
            dy = float(await r.hget(player, "dy")) * SPEED
            if dx or dy:
                x = await r.hincrbyfloat(player, "x", dx)
                y = await r.hincrbyfloat(player, "y", dy)
                await r.publish("main", f"{player}:pos:{x},{y}")
        await sleep(0.03)


if __name__ == "__main__":
    run(loop())
