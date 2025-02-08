const canvas = document.createElement("canvas");
const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;
document.body.append(canvas);

const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.scale(4, 4);

const socket = new WebSocket("ws://" + document.location.host);
let frame = 0;
//!  constants end

class Player {
    x = null;
    y = null;
    state = 0;
    right = 0;
    use = null;
    hp = 10;
}

class SwordUse {
    constructor(right) {
        this.right = right;
        this.frame = 0;
    }
}

const players = {
    // 1: {
    //     x: 150,
    //     y: 100,
    //     state: 0,
    //     right: 0,
    //     use: null,
    //     hp: 10,
    // },
    // 2: {
    //     x: 100,
    //     y: 100,
    //     state: 0,
    //     right: 0,
    //     use: null,
    //     hp: 10,
    // },
};
const shells = {};
const objects = {};
const items = {};

const movement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
};

const textures = {
    player_staying: [[], []],
    player_running: [[], []],
    sword: [[], []],
};

const joystick = {
    x: 30,
    y: canvas.height / 4 - 30,
    radius: 20,
    stickRadius: 10,
    stickX: 30,
    stickY: canvas.height / 4 - 30,
    active: false,
};

function loadTextures() {
    let img;
    for (let i = 1; i < 7; i++) {
        img = new Image();
        img.src = "/static/img/Dacer/standing/left/" + i + ".png";
        textures.player_staying[0].push(img);
        img = new Image();
        img.src = "/static/img/Dacer/standing/right/" + i + ".png";
        textures.player_staying[1].push(img);
        img = new Image();
        img.src = "/static/img/Dacer/running/left/" + i + ".png";
        textures.player_running[0].push(img);
        img = new Image();
        img.src = "/static/img/Dacer/running/right/" + i + ".png";
        textures.player_running[1].push(img);
        img = new Image();
        img.src = "/static/img/weapoons/blade_Left_OF" + i + ".png";
        textures.sword[0].push(img);
        img = new Image();
        img.src = "/static/img/weapoons/blade_RIght_OF" + i + ".png";
        textures.sword[1].push(img);
        // enemy.textures.push(img)
    }
    // for (let i = 1; i < 7; i++) {}
    // console.log(player);
    // const image = new Image();
    // image.src = "/static/img/baground/Tree.png";
    // enemy.textures[0] = image;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#0fef7f";
    // console.log(player);

    let player;
    for (const id of Object.keys(players)) {
        player = players[id];
        if (player.state)
            ctx.drawImage(
                textures.player_running[+player.right][frame % 6],
                player.x - 16,
                player.y - 16,
                32,
                32
            );
        else
            ctx.drawImage(
                textures.player_staying[+player.right][frame % 6],
                player.x - 16,
                player.y - 16,
                32,
                32
            );

        if (!player.use)
            ctx.drawImage(
                textures.sword[+player.right][0],
                player.x - 16,
                player.y - 16,
                32,
                32
            );
        else {
            if (player.use.frame == 6) {
                player.use = null;
            } else {
                ctx.drawImage(
                    textures.sword[+player.use.right][player.use.frame],
                    player.x - 16,
                    player.y - 16,
                    32,
                    32
                );
                player.use.frame++;
            }
        }
        //! отображение самочуствия нашего ребенка
        let current_hp = (player.hp / 100) * 16;
        let hp_line_x = player.x - 8;
        let hp_line_y = player.y - 18;
        ctx.fillStyle = "white";
        ctx.fillRect(hp_line_x, hp_line_y, current_hp, 1.8);
        ctx.strokeStyle = "white"; // Обводка
        ctx.lineWidth = 0.5;
        ctx.strokeRect(hp_line_x, hp_line_y, 16, 2);
    }
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
    // джойстик Тимура End
}

function send_vector() {
    let x = 0,
        y = 0;
    if (movement.left) x -= 1;
    if (movement.right) x += 1;
    if (movement.forward) y -= 1;
    if (movement.backward) y += 1;
    socket.send(`vec:${x},${y}`);
    // console.log(`vec:${x},${y}`);
}

function addEventListeners() {
    document.addEventListener("keyup", (event) => {
        switch (event.code) {
            case "KeyW":
                movement.forward = false;
                send_vector();
                break;
            case "KeyA":
                movement.left = false;
                send_vector();
                break;
            case "KeyS":
                movement.backward = false;
                send_vector();
                break;
            case "KeyD":
                movement.right = false;
                send_vector();
                break;
        }
    });

    document.addEventListener("keydown", (event) => {
        switch (event.code) {
            case "KeyW":
                movement.forward = true;
                send_vector();
                break;
            case "KeyA":
                movement.left = true;
                send_vector();
                break;
            case "KeyS":
                movement.backward = true;
                send_vector();
                break;
            case "KeyD":
                movement.right = true;
                send_vector();
                break;
        }
        // send_vector();
    });

    document.addEventListener("mousedown", (event) => {
        if (!event.button) {
            socket.send("use");
        }
    });
    // socket.addEventListener("open", (event) => {});
    loadTextures();
    socket.addEventListener("message", (event) => {
        let msg = event.data.split(":");
        let player = players[msg[1]];
        if (!player) player = players[msg[1]] = new Player();
        let cmd = msg[2];
        if (cmd == "pos") {
            [x, y] = msg[3].split(",");
            player.x = x;
            player.y = y;
        } else if (cmd == "vec") {
            [x, y] = msg[3].split(",");
            player.state = x != 0 || y != 0;
            // if (x != 0) {
            if (x > 0) player.right = true;
            if (x < 0) player.right = false;
            // }
        } else if (cmd == "use") {
            player.use = new SwordUse(+player.right);
        } else if (cmd == "hp") {
            player.hp = parseInt(msg[3]);
            if (!player.hp) delete players[msg[1]];
        }
        // console.log(event.data);
        // render();
    });
}

function addIntervals() {
    setInterval(() => render(), 32);
    setInterval(() => {
        if (frame == 5) {
            frame = 0;
        } else {
            frame++;
        }
    }, 100);
}

function vectorHandler(dx, dy) {
    // const length = Math.sqrt(dx * dx + dy * dy);
    // if (length > 0) {
    //     const x = (dx / length).toFixed(3);
    //     const y = (dy / length).toFixed(3);
    //     socket.send(`vec:${x},${y}`);
    // } else {
    //     socket.send(`vec:0,0`);
    // }
    if (dx > 10) {
        movement.left = false;
        movement.right = true;
    } else if (dx < -10) {
        movement.right = false;
        movement.left = true;
    }
    if (dy > 10) {
        movement.backward = true;
        movement.forward = false;
    } else if (dy < -10) {
        movement.backward = false;
        movement.forward = true;
    }
    if (dx == 0 && dy == 0) {
        movement.backward = false;
        movement.forward = false;
        movement.left = false;
        movement.right = false;
    }
    send_vector();
}

canvas.addEventListener("touchstart", (event) => {
    for (let touch of event.touches) {
        const rect = canvas.getBoundingClientRect();
        const touchX = (touch.clientX - rect.left) / 4;
        const touchY = (touch.clientY - rect.top) / 4;
        const dx = touchX - joystick.x;
        const dy = touchY - joystick.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= joystick.radius) {
            joystick.active = true;
        }
    }
});

canvas.addEventListener("touchmove", (event) => {
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

canvas.addEventListener("touchend", () => {
    joystick.active = false;
    joystick.stickX = joystick.x;
    joystick.stickY = joystick.y;
    vectorHandler(0, 0); // Остановка
});

function main() {
    addEventListeners();
    addIntervals();
}

main();
