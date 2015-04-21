var skorpio1 = {
    directory: "",
    scripts: ["skorpio"],
    map: "map_skorpio1",
    graphics: ["AgentComplete.png", "AssaultRifle.png", "player_skorpio.png", "Computer1.png",
        "Explosion.png", "Fire.png", "Interior-Furniture.png",
        "Muzzleflashes-Shots.png"],
    sounds: [["explosion.mp3"], ["grunt.wav"], ["fire.wav"],
        ["gunshot.mp3"], ["laser-beam.mp3"]],
    camera: {
        innerBoundOffset: 0.25,
        worldBounded: true,
        followType: "bounded"
    }
};

var skorpio2 = A_.UTILS.copy(skorpio1);
skorpio2.map = "map_skorpio2";

farer1 = {
    directory: "",
    scripts: ["farer"],
    map: "",
    graphics: ["bullet.png", "Explosion.png", "laser.png",
        "nebula.png", "player_farer.png", "rotor.png", "starfield.png"],
    sounds: [["bullet.wav"], ["explosion.mp3"], ["laser-beam.mp3"]],
    camera: {
        innerBoundOffset: 0.25,
        worldBounded: true,
        followType: "centered"
    }
};

rot1 = {
    directory: "",
    scripts: ["rot"],
    map: "",
    graphics: ["player_rot.png", "tilemap.png"],
    sounds: [],
    camera: {
        innerBoundOffset: 0.25,
        worldBounded: true,
        followType: "bounded"
    }
};

platformer1 = {
    directory: "",
    scripts: ["platformer"],
    map: "level1",
    graphics: ["ball.png", "sci-fi-platformer-tiles-32x32.png", "moving_platform.png", "player_platformer.png",
        "Explosion.png", "undead.png"],
    sounds: [["dull.wav"], ["e.wav"], ["grounded.wav"], ["jetpack.wav"], ["jump.wav"]],
    camera: {
        innerBoundOffset: 0.25,
        worldBounded: true,
        followType: "bounded"
    }
};

brownian = {
    directory: "",
    scripts: ["brownian"],
    map: "brownian",
    graphics: [],
    sounds: [],
    camera: {
        innerBoundOffset: 0.25,
        worldBounded: true,
        followType: "centered"
    }
};

var isometric = {
    directory: "Isometric/",
    scripts: ["isometric"],
    map: "isometric4",
    graphics: ["cube.png", "isometricGround.png", "player.png", "sphere.png", "tileset.png", "tileset2.png", "violettileset.png"],
    sounds: [],
    camera: {
        innerBoundOffset: 0.25,
        worldBounded: false,
        followType: "centered"
    }
};

var diskette = {
    directory: "diskette/",
    scripts: ["diskette", "anime", "ball", "diskette", "computer",
        "player", "scenery"],
    map: "diskette1",
    graphics: ["ball.png", "blocks.png", "computer.png", "crosshair.png",
        "diskette.png", "dynamics.png", "medical.png", "moon.png", "owl.png",
        "player.png", "player_wb.png", "pyramid.png", "pyramidDisplacementMap.png", "sky.png", 
        "star.png", "sun.png"],
    sounds: [["bounce.ogg"], ["throw.ogg"]],
    camera: {
        innerBoundOffset: 0.35,
        worldBounded: true,
        followType: "bounded"
    }
};

var pongPlayground = {
    directory: "Pong/",
    scripts: ["main"],
    map: "playground",
    graphics: ["ball.png", "bar.png", "brick.png", "tiles.png"],
    sounds: [['bounce.wav'], ['xylo1.wav']],
    camera: {
        innerBoundOffset: 0.25,
        worldBounded: true,
        followType: "centered"
    }
};
var pongMainMenu = {
    directory: "Pong/",
    type: "tiled",
    scripts: ["main"],
    map: "mainMenu",
    graphics: ["tiles.png"],
    sounds: [],
    camera: {
        innerBoundOffset: 0.25,
        worldBounded: true,
        followType: "centered"
    }
};
