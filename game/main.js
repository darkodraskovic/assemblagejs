var MyGame = A_.Game.extend({
    init: function () {
        this._super();
        var LevelManager = A_.LEVEL.LevelManager.extend({
            update: function () {
                // CUSTOM code
                this._super();
            }
        });
        this.levelManager = new LevelManager(this);

    },
    update: function () {
        // CUSTOM code
        this._super();
    }
});
new MyGame();

// MANIFESTS
var skorpio1 = {
    directory: "",
    scripts: ["skorpio"],
    map: "map_skorpio1",
    graphics: ["AgentComplete.png", "AssaultRifle.png", "player_skorpio.png", "Computer1.png",
        "Explosion.png", "Fire.png", "Interior-Furniture.png",
        "Muzzleflashes-Shots.png"],
    sounds: [["explosion.mp3"], ["grunt.wav"], ["fire.wav"],
        ["gunshot.mp3"], ["laser-beam.mp3"]],
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
};

rot1 = {
    directory: "",
    scripts: ["rot"],
    map: "",
    graphics: ["player_rot.png", "tilemap.png"],
    sounds: [],
};

platformer1 = {
    directory: "",
    scripts: ["platformer"],
    map: "level1",
    graphics: ["ball.png", "sci-fi-platformer-tiles-32x32.png", "moving_platform.png", "player_platformer.png",
        "Explosion.png", "undead.png"],
    sounds: [["dull.wav"], ["e.wav"], ["grounded.wav"], ["jetpack.wav"], ["jump.wav"]],
};

brownian = {
    directory: "",
    scripts: ["brownian"],
    map: "brownian",
    graphics: [],
    sounds: [],
};

var isometric = {
    directory: "Isometric/",
    scripts: ["isometric"],
    map: "isometric4",
    graphics: ["cube.png", "isometricGround.png", "player.png", "sphere.png", "tileset.png", "tileset2.png", "violettileset.png"],
    sounds: [],
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
};

var pongPlayground = {
    directory: "Pong/",
    scripts: ["main"],
    map: "playground",
    graphics: ["ball.png", "bar.png", "brick.png", "tiles.png"],
    sounds: [['bounce.wav'], ['xylo1.wav']],
};
var pongMainMenu = {
    directory: "Pong/",
    type: "tiled",
    scripts: ["main"],
    map: "mainMenu",
    graphics: ["tiles.png"],
    sounds: [],
};

// START
var levelManager = A_.game.levelManager;

//levelManager.createLevel(platformer1, "lvl1");
//levelManager.createLevel(skorpio1, "lvl1");
//levelManager.createLevel(skorpio2, "lvl1");
//levelManager.createLevel(brownian, "lvl1");
//levelManager.createLevel(isometric, "lvl1");
levelManager.createLevel(pongMainMenu, "mainMenu");
//levelManager.createLevel(pongPlayground, "playground");

// FARER
//levelManager.loadLevel(farer1, function () {
//    var level = levelManager.createLevel(farer1, "farer1");
//    populateLevel(level);
//});

// ROT
//levelManager.loadLevel(rot1, function () {
//    var level = levelManager.createLevel(rot1, "rot1");
//    createRoguelikeMap(level);
//});

// DISKETTE
//levelManager.loadLevel(diskette, function () {
//    level = levelManager.createLevel(diskette, "level1");
//    for (var i = 0; i < 50; i++) {
//        var star = level.createSprite(SceneryStar, level.findLayerByName("Sky"),
//                Math.random() * A_.game.renderer.width, Math.random() * A_.game.renderer.width);
//        star.sprite.alpha = Math.random();
//    }
//    level.findSpriteByClass(ScenerySun).setZ("top");
//    player = level.findSpriteByClass(Player);
//    
//    A_.INPUT.addMapping("restart", A_.KEY.T);
//});
