var skorpio1 = {
    name: "skorpio1",
    type: "tiled",
    scripts: ["skorpio"],
    map: "map_skorpio1",
    graphics: ["AgentComplete.png", "AssaultRifle.png", "PlayerComplete.png", "Computer1.png",
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
skorpio2.name = "skorpio2";
skorpio2.map = "map_skorpio2";

farer1 = {
    name: "farer1",
    type: "generic",
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
    name: "rot1",
    type: "generic",
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
    name: "platformer1",
    type: "tiled",
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

A_.LEVEL.Manifests["skorpio1"] = skorpio1;
A_.LEVEL.Manifests["skorpio2"] = skorpio2;
A_.LEVEL.Manifests["platformer1"] = platformer1;
A_.LEVEL.Manifests["farer1"] = farer1;
A_.LEVEL.Manifests["rot1"] = rot1;