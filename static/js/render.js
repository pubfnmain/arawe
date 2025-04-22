import {
    textures,
    ctx,
    canvas,
    players,
    shells,
    objects,
    mobile,
    joystick,
    monsters,
    state,
    CX,
    CY
} from "./state.js";
import { Shell } from "./object.js";

function render() {
    // mobile && ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0fef7f";

    for (const player of Object.values(players)) {
        player.render();
    }

    for (const shell of Object.values(shells))
        shell.render()

    for (const tree of objects) {
        tree.render()
    }


    // if (mobile) {
    //     ctx.beginPath();
    //     ctx.arc(joystick.x, joystick.y, joystick.radius, 0, Math.PI * 2);
    //     ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    //     ctx.fill();
    //     ctx.beginPath();
    //     ctx.arc(
    //         joystick.stickX,
    //         joystick.stickY,
    //         joystick.stickRadius,
    //         0,
    //         Math.PI * 2
    //     );
    //     ctx.fillStyle = "rgb(255, 255, 255)";
    //     ctx.fill();
    // }
}

export function clear() {
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function addRenderLoop() {
    setInterval(() => {
        clear();
        render();
    }, 32);
}
