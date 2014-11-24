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

