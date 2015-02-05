$('body').contextmenu(function () {
    return false;
});

A_.COLLISION.Type = {
    NONE: 0,
    ITEM: 1,
    PLAYER: 2,
    FRIEND: 4,
    ENEMY: 8,
    FRIENDLY_FIRE: 16,
    ENEMY_FIRE: 32,
};

A_.CONFIG.debug = true;

A_.CONFIG.camera = {
    innerBoundOffset: 0.25,
    worldBounded: true,
    followType: "bounded"
};

A_.CONFIG.renderer = {
    antialiasing: false,
    transparent: false,
    resolution: 1
};
A_.CONFIG.screen = {
    width: 800,
    height: 600,
    color: 0x757575
};

var skorpio1 = {
    name: "skorpio1",
    type: "tiled",
    directoryPrefix: "skorpio",
    scripts: ["skorpio"],
    map: "map_skorpio1",
    graphics: ["AgentComplete.png", "AssaultRifle.png", "PlayerComplete.png", "Computer1.png",
        "Explosion.png", "Fire.png", "Interior-Furniture.png",
        "Muzzleflashes-Shots.png"],
    sounds: [["explosion.mp3"], ["grunt.wav"], ["fire.wav"],
        ["gunshot.mp3"], ["laser-beam.mp3"]],
    camera: A_.CONFIG.camera
};
var skorpio2 = A_.UTILS.copy(skorpio1);
skorpio2.name = "skorpio2";
skorpio2.map = "map_skorpio2";

farer1 = {
    name: "farer1",
    type: "generic",
    directoryPrefix: "farer",
    scripts: ["farer"],
    map: "",
    graphics: ["bullet.png", "Explosion.png", "laser.png",
        "nebula.png", "player.png", "rotor.png", "starfield.png"],
    sounds: [["bullet.wav"], ["explosion.mp3"], ["laser-beam.mp3"]],
    camera: A_.CONFIG.camera
};

rot1 = {
    name: "rot1",
    type: "generic",
    directoryPrefix: "rot",
    scripts: ["rot"],
    map: "",
    graphics: ["ball.png", "tilemap.png"],
    sounds: [],
    camera: A_.CONFIG.camera
};

platformer1 = {
    name: "platformer1",
    type: "tiled",
    directoryPrefix: "platformer",
    scripts: ["platformer"],
    map: "level1",
    graphics: ["ball.png", "sci-fi-platformer-tiles-32x32.png", "moving_platform.png", "player.png",
        "Explosion.png", "undead.png"],
    sounds: [["dull.wav"], ["e.wav"], ["grounded.wav"], ["jetpack.wav"], ["jump.wav"]],
    camera: {
        innerBoundOffset: 0.25,
        worldBounded: true,
        followType: "bounded"
    }
};
