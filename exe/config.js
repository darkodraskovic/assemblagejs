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
    followType: "centered"
};

A_.CONFIG.renderer = {
    antialiasing: false,
    transparent: false,
    resolution: 1
};

var level1 = {
    name: "level1",
    directoryPrefix: "skorpio",
    scripts: ["skorpio"],
    map: "map_skorpio1",
    graphics: ["AgentComplete.png", "PlayerComplete.png", "Computer1.png",
        "Explosion.png", "Fire.png", "Interior-Furniture.png",
        "Muzzleflashes-Shots.png"],
    sounds: [["explosion.mp3"], ["grunt.wav"], ["fire.wav"],
        ["gunshot.mp3"], ["laser-beam.mp3"]]
};
var level2 = A_.UTILS.copy(level1);
level2.name = "level2";
level2.map = "map_skorpio2";

var ships = {
    name: "ships",
    directoryPrefix: "kenny",
    scripts: ["kenny"],
    map: "ships",
    graphics: ["blue.png", "spaceships.png"],
    sounds: []
};

farer1 = {
    name: "farer1",
    directoryPrefix: "farer",
    scripts: ["farer"],
    map: "",
    graphics: ["bullet.png", "Explosion.png", "laser.png", 
        "nebula.png", "player.png", "rotor.png", "starfield.png"],
    sounds: [["bullet.wav"], ["explosion.mp3"],["laser-beam.mp3"]]
};
rot1 = {
    name: "rot1",
    directoryPrefix: "rot",
    scripts: ["rot"],
    map: "",
    graphics: ["ball.png", "tilemap.png"],
    sounds: []
};