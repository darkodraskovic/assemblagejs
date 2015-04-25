// MANIFESTS
var skorpio = {
    scripts: ["skorpio"],
    maps: ["map_skorpio1", "map_skorpio2"],
    graphics: ["AgentComplete.png", "AssaultRifle.png", "player_skorpio.png", "Computer1.png",
        "Explosion.png", "Fire.png", "Interior-Furniture.png",
        "Muzzleflashes-Shots.png"],
    sounds: [["explosion.mp3"], ["grunt.wav"], ["fire.wav"],
        ["gunshot.mp3"], ["laser-beam.mp3"]],
};

var farer = {
    scripts: ["farer"],
    maps: [],
    graphics: ["bullet.png", "Explosion.png", "laser.png",
        "nebula.png", "player_farer.png", "rotor.png", "starfield.png"],
    sounds: [["bullet.wav"], ["explosion.mp3"], ["laser-beam.mp3"]],
};

var rot = {
    scripts: ["rot"],
    maps: [],
    graphics: ["player_rot.png", "tilemap.png"],
    sounds: []
};

var platformer = {
    scripts: ["platformer"],
    maps: ["platformer"],
    graphics: ["ball.png", "sci-fi-platformer-tiles-32x32.png", "moving_platform.png", "player_platformer.png",
        "Explosion.png", "undead.png"],
    sounds: [["dull.wav"], ["e.wav"], ["grounded.wav"], ["jetpack.wav"], ["jump.wav"]]
};

var brownian = {
    scripts: ["brownian"],
    maps: ["brownian"],
    graphics: [],
    sounds: []
};

var isometric = {
    scripts: ["Isometric/isometric"],
    maps: ["Isometric/isometric1", "Isometric/isometric2", "Isometric/isometric3", "Isometric/isometric4"],
    graphics: ["Isometric/cube.png", "Isometric/isometricGround.png", "Isometric/player.png", 
        "Isometric/sphere.png", "Isometric/tileset.png", "Isometric/tileset2.png", "Isometric/violettileset.png"],
    sounds: []
};

var diskette = {
    scripts: ["diskette/diskette", "diskette/anime", "diskette/ball", "diskette/diskette", "diskette/computer",
        "diskette/player", "diskette/scenery"],
    maps: ["diskette/diskette1", "diskette/diskette2"],
    graphics: ["diskette/ball.png", "diskette/blocks.png", "diskette/computer.png", "diskette/crosshair.png",
        "diskette/diskette.png", "diskette/dynamics.png", "diskette/medical.png", "diskette/moon.png", "diskette/owl.png",
        "diskette/player.png", "diskette/player_wb.png", "diskette/pyramid.png", "diskette/pyramidDisplacementMap.png", "diskette/sky.png",
        "diskette/star.png", "diskette/sun.png"],
    sounds: [["diskette/bounce.ogg"], ["diskette/throw.ogg"]],
};

var pong = {
    scripts: ["Pong/main"],
    maps: ["Pong/mainMenu", "Pong/playground"],
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

//sceneManager.startScene(platformer, "lvl1", "platformer");
//sceneManager.startScene(skorpio, "lvl1", "map_skorpio1");
//sceneManager.startScene(brownian, "lvl1", "brownian");
//sceneManager.startScene(isometric, "lvl1", "Isometric/isometric4");
//sceneManager.startScene(pong, "mainMenu", "Pong/mainMenu");

// FARER
loader.loadManifest(farer, function () {
    var scene = sceneManager.createScene("farer1");
    populateScene(scene);
});

// ROT
//loader.loadManifest(rot1, function () {
//    var scene = sceneManager.createScene("rot1");
//    createRoguelikeMap(scene);
//});

// DISKETTE
//loader.loadManifest(diskette, function () {
//    var scene = sceneManager.createScene("Diskette Level 1", "diskette/diskette1");
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
