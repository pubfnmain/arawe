import { state, loadTextures } from './state.js'
import listenSocket from "./socket.js"
import addControl from "./control.js"
import addRenderLoop from "./render.js"
import { addFrameUpdateLoop } from "./object.js"


state.player.name = "guest"
state.socket = new WebSocket("ws://localhost:8080/" + state.player.name)
state.socket.addEventListener("message", listenSocket)
addControl()
loadTextures()
addRenderLoop()
addFrameUpdateLoop()
