// MANIFESTS
var skorpio1 = {
    path: "",
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
    path: "",
    scripts: ["farer"],
    map: "",
    graphics: ["bullet.png", "Explosion.png", "laser.png",
        "nebula.png", "player_farer.png", "rotor.png", "starfield.png"],
    sounds: [["bullet.wav"], ["explosion.mp3"], ["laser-beam.mp3"]],
};

rot1 = {
    path: "",
    scripts: ["rot"],
    map: "",
    graphics: ["player_rot.png", "tilemap.png"],
    sounds: [],
};

platformer1 = {
    path: "",
    scripts: ["platformer"],
    map: "platformer",
    graphics: ["ball.png", "sci-fi-platformer-tiles-32x32.png", "moving_platform.png", "player_platformer.png",
        "Explosion.png", "undead.png"],
    sounds: [["dull.wav"], ["e.wav"], ["grounded.wav"], ["jetpack.wav"], ["jump.wav"]],
};

brownian = {
    path: "",
    scripts: ["brownian"],
    map: "brownian",
    graphics: [],
    sounds: [],
};

var isometric = {
    path: "Isometric/",
    scripts: ["isometric"],
    map: "isometric4",
    graphics: ["cube.png", "isometricGround.png", "player.png", "sphere.png", "tileset.png", "tileset2.png", "violettileset.png"],
    sounds: [],
};

var diskette = {
    scripts: ["diskette/diskette", "diskette/anime", "diskette/ball", "diskette/diskette", "diskette/computer",
        "diskette/player", "diskette/scenery"],
    map: "diskette/diskette1",
    graphics: ["diskette/ball.png", "diskette/blocks.png", "diskette/computer.png", "diskette/crosshair.png",
        "diskette/diskette.png", "diskette/dynamics.png", "diskette/medical.png", "diskette/moon.png", "diskette/owl.png",
        "diskette/player.png", "diskette/player_wb.png", "diskette/pyramid.png", "diskette/pyramidDisplacementMap.png", "diskette/sky.png",
        "diskette/star.png", "diskette/sun.png"],
    sounds: [["diskette/bounce.ogg"], ["diskette/throw.ogg"]],
};

var pongPlayground = {
    scripts: ["Pong/main"],
    map: "Pong/playground",
    graphics: ["Pong/ball.png", "Pong/bar.png", "Pong/brick.png", "Pong/tiles.png"],
    sounds: [['Pong/bounce.wav'], ['Pong/xylo1.wav']],
};
var pongMainMenu = {
    scripts: ["Pong/main"],
    map: "Pong/mainMenu",
    graphics: ["Pong/tiles.png"],
    sounds: []
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

//sceneManager.startScene("lvl1", "platformer", platformer1);
//sceneManager.createScene(skorpio1, "lvl1");
//sceneManager.createScene(skorpio2, "lvl1");
//sceneManager.createScene(brownian, "lvl1");
//sceneManager.createScene(isometric, "lvl1");
sceneManager.startScene("mainMenu", "Pong/mainMenu", pongMainMenu);
//sceneManager.createScene(pongPlayground, "playground");

// FARER
//loader.loadManifest(farer1, function () {
//    var scene = sceneManager.createScene("farer1");
//    populateScene(scene);
//});

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
