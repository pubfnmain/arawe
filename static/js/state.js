export const textures = {
    death: [[], []],
    emerge: [[], []],
    stand: [[], []],
    run: [[], []],
    sword: [[], []],
    shuriken: [],
};

export const mobile = /Android|iPhone/i.test(navigator.userAgent)
export const players = []
export const shells = []
export const objects = []

export const state = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    cx: 0,
    cy: 0,
    player: {},
    getVector: function () {
        let x = 0, y = 0
        if (this.forward)
            y -= 1
        if (this.backward)
            y += 1
        if (this.left)
            x -= 1
        if (this.right)
            x += 1
        return `vec:${x},${y}`
    }
}

export const canvas = document.querySelector("canvas")
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

export const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;
// const fixedWidth = 640
ctx.font = "8px Monocraft"
ctx.textAlign = "center"
// ctx.save()
ctx.scale(3, 3)
// // ctx.scale(width / fixedWidth, width / fixedWidth);
// let frame = 0;
// //!  constants end


function loadImage(src) {
    const img = new Image()
    img.src = `/static/img/${src}.png`
    return img
}

function loadImageSet(src, frameCount, dest) {
    let img;
    for (; frameCount; frameCount--)
        dest.push(loadImage(`${src}/${frameCount}`))
}

export function loadTextures() {
    loadImageSet("Dacer/standing/left", 6, textures.stand[0])
    loadImageSet("Dacer/standing/right", 6, textures.stand[1])
    loadImageSet("Dacer/running/left", 6, textures.run[0])
    loadImageSet("Dacer/running/right", 6, textures.run[1])
    loadImageSet("weapoons/blade/left", 6, textures.sword[0])
    loadImageSet("weapoons/blade/right", 6, textures.sword[1])
    loadImageSet("Dacer/death/left", 16, textures.death[0])
    loadImageSet("Dacer/death/right", 16, textures.death[1])
    loadImageSet("Dacer/rebirth/left", 16, textures.emerge[0]);
    loadImageSet("Dacer/rebirth/right", 16, textures.emerge[1]);
    loadImageSet("weapoons/shuriken", 3, textures.shuriken)
    textures.tree = loadImage("baground/Tree")
    textures.rock = loadImage("baground/Rock")
}
