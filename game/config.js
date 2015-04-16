A_.COLLISION.Type = {
    NONE: 0,
    ITEM: 1,
    PLAYER: 2,
    FRIEND: 4,
    ENEMY: 8,
    FRIENDLY_FIRE: 16,
    ENEMY_FIRE: 32
};

A_.CONFIG.debug = true;

A_.CONFIG.renderer = {
    antialiasing: false,
    transparent: false,
    resolution: 1
};
A_.CONFIG.screen = {
    width: 1024,
    height: 768,
    color: A_.UTILS.Colors.darkslateblue
};

A_.CONFIG.pixelRounding = false;

// PIXI.scaleModes : Object {DEFAULT: 0, LINEAR: 0, NEAREST: 1}
PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;