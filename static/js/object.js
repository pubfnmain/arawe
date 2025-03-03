import { ctx, textures, players } from "./state.js"

export class Player {
    constructor(x, y) {
        this.x = x
        this.y = y 
    }

    run = 0;
    hp = 100;
    use = null;
    emerge = null;
    death = null;
    dir = 0;
    name = "";

    render() {
        this.renderModel()
        this.renderName()
        this.renderHP()
    }

    renderModel() {
        const x = this.x - 16, y = this.y - 16
        let frame

        if (this.emerge) {
            frame = textures.emerge[this.dir][this.emerge]
        } else if (this.run)
            frame = textures.run[this.dir][Player.frame]
        else
            frame = textures.stand[this.dir][Player.frame]

        ctx.drawImage(frame, x, y, 32, 32)

        if (this.use)
            frame = textures.sword[this.dir][this.use]
        else
            frame = textures.sword[this.dir][5]

        ctx.drawImage(frame, x, y, 32, 32)
    }

    renderName() {
        ctx.fillStyle = "white";
        ctx.fillText(this.name, this.x, this.y - 24)
    }

    renderHP() {
        const current_hp = (this.hp / 100) * 16;
        const hp_line_x = this.x - 8;
        const hp_line_y = this.y - 18;
        ctx.fillStyle = "white";
        ctx.fillRect(hp_line_x, hp_line_y, current_hp, 1.8);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(hp_line_x, hp_line_y, 16, 2);
    }
}

Player.frame = 5


export class Shell {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}


Shell.frame = 2


export function addFrameUpdateLoop() {
    setInterval(() => {
        if (!Player.frame)
            Player.frame = 5
        else
            Player.frame--;
        for (const player of Object.values(players)) {
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
        }
        if (!Shell.frame)
            Shell.frame = 2
        else
            Shell.frame--
    }, 100);
}
