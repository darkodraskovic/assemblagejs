DODO.config = {};

DODO.config.renderer = {
    backgroundColor : DODO.Colors.black,
    antialiasing: false,
    transparent: false,
    resolution: 1
};
DODO.config.screen = {
    width: 1024,
    height: 768,
};

DODO.config.directories = {
    scripts: "game/scripts/",
    data: "game/data/",
    graphics: "game/graphics/",
    sounds: "game/sounds/"
};

DODO.config.camera = {
    innerBoundOffset: 0.25,
    worldBounded: true,
    followType: "Bounded" // or "Centered"
}

DODO.config.pixelRounding = false;

// PIXI.SCALE_MODES : Object {DEFAULT: 0, LINEAR: 0, NEAREST: 1}
PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

DODO.CollisionTypes = {
    NONE: 0,
    ITEM: 1,
    PLAYER: 2,
    FRIEND: 4,
    ENEMY: 8,
    FRIENDLY_FIRE: 16,
    ENEMY_FIRE: 32
};
