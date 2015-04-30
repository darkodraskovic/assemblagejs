DODO.config = {};

DODO.config.renderer = {
    antialiasing: false,
    transparent: false,
    resolution: 1
};
DODO.config.screen = {
    width: 1024,
    height: 768,
    color: DODO.Colors.darkslateblue
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
    followType: "bounded" // or "centered"
}

DODO.config.pixelRounding = false;

// PIXI.scaleModes : Object {DEFAULT: 0, LINEAR: 0, NEAREST: 1}
PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

DODO.CollisionTypes = {
    NONE: 0,
    ITEM: 1,
    PLAYER: 2,
    FRIEND: 4,
    ENEMY: 8,
    FRIENDLY_FIRE: 16,
    ENEMY_FIRE: 32
};
