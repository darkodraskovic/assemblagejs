var MyGame = A_.Game.extend({
    init: function () {
        this._super();
        // CUSTOM code
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
    map: "platformer",
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
var sceneManager = A_.game.sceneManager;

//sceneManager.createScene(platformer1, "lvl1");
//sceneManager.createScene(skorpio1, "lvl1");
//sceneManager.createScene(skorpio2, "lvl1");
//sceneManager.createScene(brownian, "lvl1");
//sceneManager.createScene(isometric, "lvl1");
sceneManager.createScene(pongMainMenu, "mainMenu");
//sceneManager.createScene(pongPlayground, "playground");

// FARER
//sceneManager.loadScene(farer1, function () {
//    var scene = sceneManager.createScene(farer1, "farer1");
//    populateScene(scene);
//});

// ROT
//sceneManager.loadScene(rot1, function () {
//    var scene = sceneManager.createScene(rot1, "rot1");
//    createRoguelikeMap(scene);
//});

// DISKETTE
//sceneManager.loadScene(diskette, function () {
//    scene = sceneManager.createScene(diskette, "scene1");
//    for (var i = 0; i < 50; i++) {
//        var star = scene.createSprite(SceneryStar, scene.findLayerByName("Sky"),
//                Math.random() * A_.game.renderer.width, Math.random() * A_.game.renderer.width);
//        star.sprite.alpha = Math.random();
//    }
//    scene.findSpriteByClass(ScenerySun).setZ("top");
//    player = scene.findSpriteByClass(Player);
//    
//    A_.INPUT.addMapping("restart", A_.KEY.T);
//});
