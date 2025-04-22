import { ctx, textures, players, state, CX, CY, scale } from "./state.js"

export class Player {
    type = 'p'
    run = 0;
    hp = 100;
    use = null;
    emerge = null;
    death = null;
    dir = 0;
    name = "";

    render() {
        const x = (this.x - state.player.x + CX) / scale
        const y = (this.y - state.player.y + CY) / scale
        this.renderModel(x - 16, y - 16)
        this.renderName(x, y)
        this.renderHP(x, y)
    }

    renderModel(x, y) {
        let frame

        if (this.type == 'p') {
            if (this.death != null)
                frame = textures.death[this.dir][this.death]
            else if (this.emerge)
                frame = textures.emerge[this.dir][this.emerge]
            else if (this.run)
                frame = textures.run[this.dir][Player.frame]
            else
                frame = textures.stand[this.dir][Player.frame]

            // console.log()

            ctx.drawImage(frame, x, y, 32, 32)

            if (this.use)
                frame = textures.sword[this.dir][this.use]
            else
                frame = textures.sword[this.dir][5]

            ctx.drawImage(frame, x, y, 32, 32)
        } else {
            frame = textures.monster[this.dir][Player.frame]
            ctx.drawImage(frame, x, y, 32, 32)
        }
    }

    renderName(x, y) {
        ctx.fillStyle = "white";
        ctx.fillText(this.name, x, y - 24)
    }

    renderHP(x, y) {
        const current_hp = (this.hp / 100) * 16;
        const hp_line_x = x - 8;
        const hp_line_y = y - 18;
        ctx.fillStyle = "white";
        ctx.fillRect(hp_line_x, hp_line_y, current_hp, 1.8);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(hp_line_x, hp_line_y, 16, 2);
    }
}

Player.frame = 5


export class Shell {
    render() {
        const x = (this.x - state.player.x + CX) / scale
        const y = (this.y - state.player.y + CY) / scale

        ctx.drawImage(
            textures.shuriken[Shell.frame],
            x - 8,
            y - 8,
            16,
            16
        );
    }
}

export class Texture {
    constructor(code, x, y) {
        this.code = code
        this.x = x
        this.y = y
    }
    render() {
        const x = (this.x - state.player.x + CX) / scale
        const y = (this.y - state.player.y + CY) / scale

        ctx.drawImage(
            this.code && textures.rock || textures.tree,
            x - 32,
            y - 32,
            64,
            64
        );
    }
}


Shell.frame = 2


export function addFrameUpdateLoop() {
    let player
    setInterval(() => {
        if (!Player.frame)
            Player.frame = 5
        else
            Player.frame--;
        for (const id of Object.keys(players)) {
            player = players[id]
            if (player.emerge != null) {
                if (!player.emerge)
                    player.emerge = null
                else
                    player.emerge--
            }
            if (player.use != null) {
                if (!player.use)
                    player.use = null
                else
                    player.use--
            }
            if (player.death != null) {
                if (player.death)
                    player.death--
                else
                    delete players[id]
            }
        }
        if (!Shell.frame)
            Shell.frame = 2
        else
            Shell.frame--
    }, 100);
}
