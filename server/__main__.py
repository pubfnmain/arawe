from uvicorn import run


if __name__ == '__main__':
    # run("server.app:app", host="0.0.0.0", reload=True)
    run("server.app:app", host="0.0.0.0")
