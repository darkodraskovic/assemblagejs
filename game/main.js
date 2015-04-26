// MANIFESTS
var skorpio = {
    scripts: ["skorpio.js"],
    maps: ["skorpio1.json", "skorpio2.json"],
    graphics: ["AgentComplete.png", "AssaultRifle.png", "player_skorpio.png", "Computer1.png",
        "Explosion.png", "Fire.png", "Interior-Furniture.png",
        "Muzzleflashes-Shots.png"],
    sounds: [["explosion.mp3"], ["grunt.wav"], ["fire.wav"],
        ["gunshot.mp3"], ["laser-beam.mp3"]],
};

var farer = {
    scripts: ["farer.js"],
    maps: [],
    graphics: ["bullet.png", "Explosion.png", "laser.png",
        "nebula.png", "player_farer.png", "rotor.png", "starfield.png"],
    sounds: [["bullet.wav"], ["explosion.mp3"], ["laser-beam.mp3"]],
};

var rot = {
    scripts: ["rot.js"],
    maps: [],
    graphics: ["player_rot.png", "tilemap.png"],
    sounds: []
};

var platformer = {
    scripts: ["platformer.js"],
    maps: ["platformer.json"],
    graphics: ["ball.png", "sci-fi-platformer-tiles-32x32.png", "moving_platform.png", "player_platformer.png",
        "Explosion.png", "undead.png"],
    sounds: [["dull.wav"], ["e.wav"], ["grounded.wav"], ["jetpack.wav"], ["jump.wav"]]
};

var brownian = {
    scripts: ["brownian.js"],
    maps: ["brownian.json"],
    graphics: [],
    sounds: []
};

var isometric = {
    scripts: ["Isometric/isometric.js"],
    maps: ["Isometric/isometric1.json", "Isometric/isometric2.json", "Isometric/isometric3.json", "Isometric/isometric4.json"],
    graphics: ["Isometric/cube.png", "Isometric/isometricGround.png", "Isometric/player.png", 
        "Isometric/sphere.png", "Isometric/tileset.png", "Isometric/tileset2.png", "Isometric/violettileset.png"],
    sounds: []
};

var diskette = {
    scripts: ["diskette/diskette.js", "diskette/anime.js", "diskette/ball.js", "diskette/diskette.js", "diskette/computer.js",
        "diskette/player.js", "diskette/scenery.js"],
    maps: ["diskette/diskette1.json", "diskette/diskette2.json"],
    graphics: ["diskette/ball.png", "diskette/blocks.png", "diskette/computer.png", "diskette/crosshair.png",
        "diskette/diskette.png", "diskette/dynamics.png", "diskette/medical.png", "diskette/moon.png", "diskette/owl.png",
        "diskette/player.png", "diskette/player_wb.png", "diskette/pyramid.png", "diskette/pyramidDisplacementMap.png", "diskette/sky.png",
        "diskette/star.png", "diskette/sun.png"],
    sounds: [["diskette/bounce.ogg"], ["diskette/throw.ogg"]],
};

var pong = {
    scripts: ["Pong/main.js"],
    maps: ["Pong/mainMenu.json", "Pong/playground.json"],
    graphics: ["Pong/ball.png", "Pong/bar.png", "Pong/brick.png", "Pong/tiles.png"],
    sounds: [['Pong/bounce.wav'], ['Pong/xylo1.wav']],
};

// GAME
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
//new A_.Game();

// START
var sceneManager = A_.game.sceneManager;
var loader = A_.game.loader;

//sceneManager.startScene(platformer, "lvl1", "platformer.json");
//sceneManager.startScene(skorpio, "lvl1", "skorpio1.json");
//sceneManager.startScene(brownian, "lvl1", "brownian.json");
//sceneManager.startScene(isometric, "lvl1", "Isometric/isometric4.json");
sceneManager.startScene(pong, "mainMenu", "Pong/mainMenu.json");

// FARER
//loader.loadManifest(farer, function () {
//    var scene = sceneManager.createScene("farer1");
//    populateScene(scene);
//});

// ROT
//loader.loadManifest(rot, function () {
//    var scene = sceneManager.createScene("rot1");
//    createRoguelikeMap(scene);
//});

// DISKETTE
//loader.loadManifest(diskette, function () {
//    var scene = sceneManager.createScene("Diskette Level 1", "diskette/diskette1.json");
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
