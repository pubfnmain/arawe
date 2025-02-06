const canvas = document.createElement("canvas");
const width = document.body.clientWidth;
const height = document.body.clientHeight;
canvas.width = width;
canvas.height = height;
document.body.append(canvas);

const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.scale(4, 4);

let random = localStorage.getItem("random")
if (!random) {
    random = Math.floor(Math.random() * 1000)
    localStorage.setItem("random", random)
}

const socket = new WebSocket("ws://" + document.location.host + "/guest" + random);
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
        this.count = count
    }

    process() {
        this.frame++
        if (this.frame == this.count)
            return true
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
    death: {"-1": [], 1: []},
    emerge: {"-1": [], 1: []},
    stand: {"-1": [], 1: []},
    run: {"-1": [], 1: []},
    sword: {"-1": [], 1: []}
};

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
        img.src = "/static/img/weapoons/blade_Left_OF" + i + ".png";
        textures.sword[-1].push(img);
        img = new Image();
        img.src = "/static/img/weapoons/blade_RIght_OF" + i + ".png";
        textures.sword[1].push(img);
    }

    for (let i = 1; i < 17; i++) {
        img = new Image();
        img.src = "/static/img/Dacer/death/left/" + i + ".png"
        textures.death[-1].push(img)
        img = new Image();
        img.src = "/static/img/Dacer/death/right/" + i + ".png"
        textures.death[1].push(img)
        img = new Image();
        img.src = "/static/img/Dacer/rebirth/left/" + i + ".png"
        textures.emerge[-1].push(img)
        img = new Image();
        img.src = "/static/img/Dacer/rebirth/right/" + i + ".png"
        textures.emerge[1].push(img)
    }

    // for (let i = 1; i < 7; i++) {}
    // console.log(player);
    // const image = new Image();
    // image.src = "/static/img/baground/Tree.png";
    // enemy.textures[0] = image;
}

function render() {
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#0fef7f";
    // console.log(player);

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
        }
        else if (player.state)
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

    // ctx.drawImage(enemy.textures[0], enemy.x, enemy.y, 64, 64);
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
            if (x != 0) player.dir = x;
        } else if (cmd == "use") {
            player.use = new Animation(6);
        } else if (cmd == "hp") {
            player.hp = parseInt(msg[3]);
            if (!+player.hp)
                delete players[msg[1]]
        } else if (cmd == "emerge") {
            [x, y] = msg[3].split(",");
            player.x = x;
            player.y = y;
            player.emerge = new Animation(16);
        }
        console.log(event.data);
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
        for (player of Object.values(players)) {
            if (player.emerge) {
                if (player.emerge.process())
                    player.emerge = null
            }
            if (player.use) {
                if (player.use.process())
                    player.use = null
            }
        }
    }, 50);
}

function main() {
    addEventListeners();
    addIntervals();
}

main();
