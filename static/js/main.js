import { state, loadTextures } from './state.js'
import listenSocket from "./socket.js"
import addControl from "./control.js"
import { clear, addRenderLoop } from "./render.js"
import { addFrameUpdateLoop } from "./object.js"


function init(name) {
  state.player.name = name
  state.socket = new WebSocket("ws://localhost:8080/" + state.player.name)
  state.socket.addEventListener("message", listenSocket)
  addControl()
  loadTextures()
  addRenderLoop()
  addFrameUpdateLoop()
}

clear()
const button = document.querySelector("button")
const input = document.querySelector("input")

button.onclick = () => {
  init(input.value)
  button.remove()
  input.remove()
}
