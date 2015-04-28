A_.CONFIG.debug = true;

A_.CONFIG.renderer = {
    antialiasing: false,
    transparent: false,
    resolution: 1
};
A_.CONFIG.screen = {
    width: 800,
    height: 600,
    color: A_.UTILS.Colors.darkslateblue
};

A_.CONFIG.directories = {
    scripts: "game/scripts/",
    maps: "game/maps/",
    graphics: "game/graphics/",
    sounds: "game/sounds/"
};

A_.CONFIG.camera = {
    innerBoundOffset: 0.25,
    worldBounded: true,
    followType: "bounded" // or "centered"
}

A_.CONFIG.pixelRounding = false;

// PIXI.scaleModes : Object {DEFAULT: 0, LINEAR: 0, NEAREST: 1}
PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

A_.COLLISION.Type = {
    NONE: 0,
    ITEM: 1,
    PLAYER: 2,
    FRIEND: 4,
    ENEMY: 8,
    FRIENDLY_FIRE: 16,
    ENEMY_FIRE: 32
};
