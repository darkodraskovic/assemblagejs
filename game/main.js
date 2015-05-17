// MANIFESTS
var skorpio = {
    scripts: ["Skorpio/skorpio.js"],
    maps: ["Skorpio/skorpio1.json", "Skorpio/skorpio2.json"],
    graphics: ["Skorpio/AgentComplete.png", "Skorpio/AssaultRifle.png",
        "Skorpio/player_skorpio.png", "Skorpio/Computer1.png",
        "Common/Explosion.png", "Skorpio/Fire.png", "Skorpio/Interior-Furniture.png",
        "Skorpio/Muzzleflashes-Shots.png"],
    sounds: [["explosion.mp3"], ["grunt.wav"], ["fire.wav"],
        ["gunshot.mp3"], ["laser-beam.mp3"]],
};

var farer = {
    scripts: ["Farer/farer.js"],
    maps: [],
    graphics: ["Farer/bullet.png", "Common/Explosion.png", "Farer/laser.png",
        "Farer/nebula.png", "Farer/player_farer.png", "Farer/rotor.png", "Farer/starfield.png"],
    sounds: [["bullet.wav"], ["explosion.mp3"], ["laser-beam.mp3"]]
};

var rot = {
    scripts: ["Rot/rot.js"],
    maps: [],
    graphics: ["Rot/player_rot.png", "Rot/tilemap.png"],
    sounds: []
};

var platformer = {
    scripts: ["Platformer/platformer.js"],
    maps: ["Platformer/platformer.json"],
    graphics: ["Platformer/ball.png", "Platformer/sci-fi-platformer-tiles-32x32.png",
        "Platformer/moving_platform.png", "Platformer/player_platformer.png",
        "Common/Explosion.png", "Platformer/undead.png"],
    sounds: [["dull.wav"], ["e.wav"], ["grounded.wav"], ["jetpack.wav"], ["jump.wav"]]
};

var brownian = {
    scripts: ["Brownian/brownian.js"],
    maps: ["Brownian/brownian.json"],
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
    scripts: ["Diskette/diskette.js", "Diskette/anime.js", "Diskette/ball.js", "Diskette/diskette.js", "Diskette/computer.js",
        "Diskette/player.js", "Diskette/scenery.js"],
    maps: ["Diskette/diskette1.json", "Diskette/diskette2.json"],
    graphics: ["Diskette/ball.png", "Diskette/blocks.png", "Diskette/computer.png", "Diskette/crosshair.png",
        "Diskette/diskette.png", "Diskette/dynamics.png", "Diskette/medical.png", "Diskette/moon.png", "Diskette/owl.png",
        "Diskette/player.png", "Diskette/player_wb.png", "Diskette/pyramid.png", "Diskette/pyramidDisplacementMap.png", "Diskette/sky.png",
        "Diskette/star.png", "Diskette/sun.png"],
    sounds: [["Diskette/bounce.ogg"], ["Diskette/throw.ogg"]],
};

var pong = {
    scripts: ["Pong/main.js"],
    maps: ["Pong/mainMenu.json", "Pong/playground.json"],
    graphics: ["Pong/ball.png", "Pong/bar.png", "Pong/brick.png", "Pong/tiles.png"],
    sounds: [['Pong/bounce.wav'], ['Pong/xylo1.wav']],
};

// GAME
var MyGame = DODO.Game.extend({
    init: function() {
        this._super();
        // CUSTOM code
    },
    update: function() {
        // CUSTOM code
        this._super();
    }
});
new MyGame();
//new DODO.Game();

// START
var sceneManager = DODO.game.sceneManager;
var loader = DODO.game.loader;

 sceneManager.startScene(platformer, "lvl1", "Platformer/platformer.json");
// sceneManager.startScene(skorpio, "lvl1", "Skorpio/skorpio1.json");
// sceneManager.startScene(brownian, "lvl1", "Brownian/brownian.json");
//sceneManager.startScene(isometric, "lvl1", "Isometric/isometric4.json");
// sceneManager.startScene(pong, "mainMenu", "Pong/mainMenu.json");

//
// FARER
//loader.loadAssets(farer, function () {
//    var scene = new DODO.Scene("farer1", DODO.config.camera);
//    populateScene(scene);
//});

// ROT
//loader.loadAssets(rot, function () {
//    var scene = new DODO.Scene("rot1", DODO.config.camera);
//    createRoguelikeMap(scene);
//});

// DISKETTE
//loader.loadAssets(diskette, function () {
//    var scene = new DODO.Scene("Diskette Level 1", DODO.config.camera, "Diskette/diskette1.json");
//    for (var i = 0; i < 50; i++) {
//        var star = new SceneryStar(scene.findLayerByName("Sky"),
//                Math.random() * DODO.game.renderer.width, Math.random() * DODO.game.renderer.width);
//        star.sprite.alpha = Math.random();
//    }
//    scene.findSpriteByClass(ScenerySun).setZ("top");
//    player = scene.findSpriteByClass(Player);
//
//    DODO.input.addMapping("restart", DODO.Key.T);
//});
