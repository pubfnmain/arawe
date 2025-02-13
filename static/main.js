const canvas = document.createElement("canvas");
const width = document.body.clientWidth;
const height = document.body.clientHeight;

canvas.width = width;
canvas.height = height;
document.body.append(canvas);

const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.scale(4, 4);

let random = localStorage.getItem("random");
if (!random) {
    random = Math.floor(Math.random() * 1000);
    localStorage.setItem("random", random);
}

const socket = new WebSocket(
    "ws://" + document.location.host + "/guest" + random
);
let frame = 0;
//!  constants end

class Player {
    x = null;
    y = null;
    run = 0;
    hp = 100;
    use = null;
    emerge = null;
    death = null;
    dir = -1;
}

class Animation {
    frame = 0;

    constructor(count) {
        this.count = count;
    }

    process() {
        this.frame++;
        if (this.frame == this.count) return true;
    }
}

const players = {};
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
    death: { "-1": [], 1: [] },
    emerge: { "-1": [], 1: [] },
    stand: { "-1": [], 1: [] },
    run: { "-1": [], 1: [] },
    sword: { "-1": [], 1: [] },
    shuriken: null
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

function isMobile() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
    );
}

function loadTextures() {
    let img;
    for (let i = 1; i < 7; i++) {
        img = new Image();
        img.src = "/static/img/Dacer/standing/left/" + i + ".png";
        textures.stand[-1].push(img);
        img = new Image();
        img.src = "/static/img/Dacer/standing/right/" + i + ".png";
        textures.stand[1].push(img);
        img = new Image();
        img.src = "/static/img/Dacer/running/left/" + i + ".png";
        textures.run[-1].push(img);
        img = new Image();
        img.src = "/static/img/Dacer/running/right/" + i + ".png";
        textures.run[1].push(img);
        img = new Image();
        img.src = "/static/img/weapoons/blade/left/" + i + ".png";
        textures.sword[-1].push(img);
        img = new Image();
        img.src = "/static/img/weapoons/blade/right/" + i + ".png";
        textures.sword[1].push(img);
    }

    for (let i = 1; i < 17; i++) {
        img = new Image();
        img.src = "/static/img/Dacer/death/left/" + i + ".png";
        textures.death[-1].push(img);
        img = new Image();
        img.src = "/static/img/Dacer/death/right/" + i + ".png";
        textures.death[1].push(img);
        img = new Image();
        img.src = "/static/img/Dacer/rebirth/left/" + i + ".png";
        textures.emerge[-1].push(img);
        img = new Image();
        img.src = "/static/img/Dacer/rebirth/right/" + i + ".png";
        textures.emerge[1].push(img);
    }
    img = new Image();
    img.src = "/static/img/weapoons/shuriken.png"
    textures.shuriken = img;

    // for (let i = 1; i < 7; i++) {}
    // console.log(player);
    // const image = new Image();
    // image.src = "/static/img/baground/Tree.png";
    // enemy.textures[0] = image;
}

function clear() {
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(0, 0, width, height);
}

function render() {
    // isMobile() && ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0fef7f";
    // console.log(player);
    for (const shell of Object.values(shells)) {
        ctx.drawImage(
            textures.shuriken,
            shell.x - 8,
            shell.y - 8,
            16,
            16
        )
    }

    let player;
    for (const id of Object.keys(players)) {
        player = players[id];
        if (player.emerge) {
            ctx.drawImage(
                textures.emerge[player.dir][player.emerge.frame],
                player.x - 16,
                player.y - 16,
                32,
                32
            );
        } else if (player.state)
            ctx.drawImage(
                textures.run[player.dir][frame % 6],
                player.x - 16,
                player.y - 16,
                32,
                32
            );
        else
            ctx.drawImage(
                textures.stand[player.dir][frame % 6],
                player.x - 16,
                player.y - 16,
                32,
                32
            );

        if (!player.use)
            ctx.drawImage(
                textures.sword[player.dir][0],
                player.x - 16,
                player.y - 16,
                32,
                32
            );
        else {
            ctx.drawImage(
                textures.sword[player.dir][player.use.frame],
                player.x - 16,
                player.y - 16,
                32,
                32
            );
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
    if (isMobile()) {
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

function send_vector() {
    let x = 0,
        y = 0;
    if (movement.left) x -= 1;
    if (movement.right) x += 1;
    if (movement.forward) y -= 1;
    if (movement.backward) y += 1;
    socket.send(`vec:${x},${y}`);
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
            case "Space":
                // socket.send("use");
                socket.send("aux:-1,0")
                break;
        }
        // send_vector();
    });

    document.addEventListener("mousedown", (event) => {
        if (!event.button)
            socket.send("use");
    });
    // socket.addEventListener("open", (event) => {});
    loadTextures();
    socket.addEventListener("message", (event) => {
        let msg = event.data.split(":");
        if (msg[0] == "p") {
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
                if (x > 0) player.dir = 1;
                if (x < 0) player.dir = -1;
            } else if (cmd == "use") {
                player.use = new Animation(6);
            } else if (cmd == "hp") {
                player.hp = parseInt(msg[3]);
                if (!+player.hp) delete players[msg[1]];
            } else if (cmd == "emerge") {
                [x, y] = msg[3].split(",");
                player.x = x;
                player.y = y;
                player.emerge = new Animation(16);
            }
        } else if (msg[0] == "s") {
            let shell = shells[msg[1]]
            const [x, y] = msg[3].split(",");
            if (!shell) shell = shells[msg[1]] = {}
            shell.x = x
            shell.y = y
        }
        console.log(event.data);
        // render();
    });
}

function addIntervals() {
    setInterval(() => {
        clear()
        render()
    }, 32);
    setInterval(() => {
        if (frame == 5) {
            frame = 0;
        } else {
            frame++;
        }
        for (player of Object.values(players)) {
            if (player.emerge) {
                if (player.emerge.process()) player.emerge = null;
            }
            if (player.use) {
                if (player.use.process()) player.use = null;
            }
        }
    }, 100);
}

if (isMobile()) {
    const button = document.createElement("button")
    button.innerText = "full"
    button.onclick = () => {
        document.body.requestFullscreen()
    }
    document.body.appendChild(button)
    function vectorHandler(dx, dy) {
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0) {
            const x = (dx / length).toFixed(3);
            const y = (dy / length).toFixed(3);
            socket.send(`vec:${x},${y}`);
        } else {
            socket.send(`vec:0,0`);
        }
        // if (dx > 10) {
        //     movement.left = false;
        //     movement.right = true;
        // } else if (dx < -10) {
        //     movement.right = false;
        //     movement.left = true;
        // }
        // if (dy > 10) {
        //     movement.backward = true;
        //     movement.forward = false;
        // } else if (dy < -10) {
        //     movement.backward = false;
        //     movement.forward = true;
        // }
        // if (dx == 0 && dy == 0) {
        //     movement.backward = false;
        //     movement.forward = false;
        //     movement.left = false;
        //     movement.right = false;
        // }
        // send_vector();
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
}

function main() {
    addEventListeners();
    addIntervals();
}

main();
