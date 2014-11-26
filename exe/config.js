$('body').contextmenu( function() {
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
    worldBounded: false,
    followType: "centered"
};

A_.CONFIG.renderer = {
    antialiasing: false,
    transparent: false,
    resolution: 1
};

var level1 = {
    name: "level1",
    scripts: ["skorpio"],
    map: "map_skorpio1",
    assets: ["AgentComplete.png", "PlayerComplete.png", "Computer1.png", 
        "Explosion.png", "Fire.png", "Interior-Furniture.png", 
        "Muzzleflashes-Shots.png"],
    sounds: [["explosion.mp3"], ["grunt.wav"], ["fire.wav"], 
        ["gunshot.mp3"], ["laser-beam.mp3"]]
};

var level2 = A_.UTILS.copy(level1);
level2.name = "level2";
level2.map = "map_skorpio2"
