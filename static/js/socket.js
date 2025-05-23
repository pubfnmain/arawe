import { players, shells, state, objects } from "./state.js";
import { Shell, Player, Texture } from "./object.js";

export default function listenSocket(event) {
    let msg = event.data.split(":");
    let x, y
    switch (msg[0]) {
        case "t":
            [x, y] = msg[3].split(",");
            objects.push(new Texture(+msg[2], +x, +y))
        case "p":
        case "m":
            let player = players[msg[1]];
            if (!player) {
                player = players[msg[1]] = new Player();
                player.type = msg[0]
            }
            switch (msg[2]) {
                case "name":
                    player.name = msg[3];
                    if (state.player.name == msg[3]) state.player = player;
                    break;
                case "pos":
                    [x, y] = msg[3].split(",");
                    player.x = x;
                    player.y = y;
                    break;
                case "vec":
                    [x, y] = msg[3].split(",");
                    if (x > 0) player.dir = 1;
                    else if (x < 0) player.dir = 0;
                    player.run = x != 0 || y != 0;
                    break;
                case "use":
                    player.use = 5;
                    break;
                case "hp":
                    player.hp = +msg[3];
                    if (!player.hp) player.death = 15;
                    // delete players[msg[1]];
                    break;
                case "new":
                    [x, y] = msg[3].split(",");
                    player.x = x;
                    player.y = y;
                    player.emerge = 15;
                    break;
            }
            break;
        case "s":
            switch (msg[2]) {
                case "del":
                    delete shells[msg[1]];
                    break;
                case "pos":
                    let shell = shells[msg[1]];
                    let [x, y] = msg[3].split(",");
                    if (!shell) shell = shells[msg[1]] = new Shell();
                    shell.x = x
                    shell.y = y
                    break;
            }
            break;
    }
    console.log(event.data);
}
