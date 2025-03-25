import { mobile, state, joystick, canvas } from "./state.js";

function handleKeyDown(event) {
    switch (event.code) {
        case "KeyW":
            state.forward = true;
            break;
        case "KeyA":
            state.left = true;
            break;
        case "KeyS":
            state.backward = true;
            break;
        case "KeyD":
            state.right = true;
            break;
        case "Space":
            let x = state.cx - state.player.x * 3;
            let y = state.cy - state.player.y * 3;
            let m = Math.max(Math.abs(x), Math.abs(y));
            x = (x / m).toFixed(2);
            y = (y / m).toFixed(2);
            state.socket.send(`aux:${x},${y}`);
        default:
            return;
    }
    state.socket.send(state.getVector());
}
function handleKeyUp(event) {
    switch (event.code) {
        case "KeyW":
            state.forward = false;
            break;
        case "KeyA":
            state.left = false;
            break;
        case "KeyS":
            state.backward = false;
            break;
        case "KeyD":
            state.right = false;
            break;
        default:
            return;
    }
    state.socket.send(state.getVector());
}

function handleMouseMove(event) {
    state.cx = event.clientX;
    state.cy = event.clientY;
}

function handleMouseDown(event) {
    if (!event.button) state.socket.send("use");
}

export default function addControl() {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("mouseenter", handleMouseMove);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
}

if (mobile) {
    // const button = document.createElement("button");
    // button.innerText = "full";
    // button.onclick = () => {
    //     if (document.fullscreen) document.exitFullscreen();
    //     else document.body.requestFullscreen();
    // };
    // document.body.appendChild(button);
    function vectorHandler(dx, dy) {
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0) {
            const x = (dx / length).toFixed(3);
            const y = (dy / length).toFixed(3);
            state.socket.send(`vec:${x},${y}`);
        } else {
            state.socket.send(`vec:0,0`);
        }
    }

    document.addEventListener("touchstart", (event) => {
        for (let touch of event.touches) {
            const rect = canvas.getBoundingClientRect();
            const touchX = (touch.clientX - rect.left) / 4;
            const touchY = (touch.clientY - rect.top) / 4;
            const dx = touchX - joystick.x;
            const dy = touchY - joystick.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            console.log(distance);
            if (distance <= joystick.radius) {
                joystick.active = true;
            }
        }
    });

    document.addEventListener("touchmove", (event) => {
        if (!joystick.active) return;
        for (let touch of event.touches) {
            const rect = canvas.getBoundingClientRect();
            const touchX = (touch.clientX - rect.left) / 4;
            const touchY = (touch.clientY - rect.top) / 4;
            const dx = touchX - joystick.x;
            const dy = touchY - joystick.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = joystick.radius;

            if (distance > maxDistance) {
                const angle = Math.atan2(dy, dx);
                joystick.stickX = joystick.x + Math.cos(angle) * maxDistance;
                joystick.stickY = joystick.y + Math.sin(angle) * maxDistance;
            } else {
                joystick.stickX = touchX;
                joystick.stickY = touchY;
            }
            vectorHandler(dx, dy);
        }
    });

    document.addEventListener("touchend", () => {
        joystick.active = false;
        joystick.stickX = joystick.x;
        joystick.stickY = joystick.y;
        vectorHandler(0, 0); // Остановка
    });
}
