import { ctx, canvas, players, shells, objects, mobile } from "./state.js"

const joystick = {
    x: 30,
    y: canvas.height / 4 - 30,
    radius: 20,
    stickRadius: 10,
    stickX: 30,
    stickY: canvas.height / 4 - 30,
    active: false,
};

function render() {
    // isMobile() && ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0fef7f";
    for (const shell of Object.values(shells)) {
        ctx.drawImage(
            textures.shuriken,
            shell.x - 8,
            shell.y - 8,
            16,
            16
        )
    }

    for (const tree of objects) {
        ctx.drawImage(
            textures.tree,
            tree.x - 32,
            tree.y - 32,
            64,
            64
        );
    }

    let player;
    for (const id of Object.keys(players)) {
        player = players[id];
        player.render()
    }
    if (mobile) {
        // джойстик Тимура start
        ctx.beginPath();
        ctx.arc(joystick.x, joystick.y, joystick.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(
            joystick.stickX,
            joystick.stickY,
            joystick.stickRadius,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fill();
    }
    // джойстик Тимура End
}

function clear() {
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export default function addRenderLoop() {
    setInterval(() => {
        clear()
        render()
    }, 32);
}
