A_.game = new A_.Game();

// START


var levelManager = A_.game.levelManager;

levelManager.startLevel(platformer1, "lvl1");
//levelManager.startLevel(skorpio1, "lvl1");
//levelManager.startLevel(skorpio2, "lvl1");
//levelManager.startLevel(brownian, "lvl1");
//levelManager.startLevel(diskette, "d1", onLevelStarted);

// FARER
//levelManager.loadLevel(farer1, function () {
//    var level = levelManager.createLevel(farer1, "farer1");
//    populateLevel(level);
//    levelManager.activateLevel("farer1");
//    levelManager.manageLevels = true;
//});

// ROT
//levelManager.loadLevel(rot1, function () {
//    var level = levelManager.createLevel(rot1, "rot1");
//    createRoguelikeMap(level);
//    levelManager.activateLevel("rot1");
//    levelManager.manageLevels = true;
//});

// DISKETTE
var player; 

Dynamics = {
    U_SPRING: 1,
    L_SPRING: 2,
    R_SPRING: 3,
    UL_SPRING: 4,
    UR_SPRING: 5,
    VIRUS: 5,
    VIRUS_KILLER: 6
};
//levelManager.loadLevel(diskette, function () {
//    var level = levelManager.createLevel(diskette, "level1");
//    for (var i = 0; i < 50; i++) {
//        var star = level.createSprite(SceneryStar, level.findLayerByName("Sky"),
//                Math.random() * A_.game.renderer.width, Math.random() * A_.game.renderer.width);
//        star.setAlpha(Math.random());
//    }
//    level.findSpriteByClass(ScenerySun).setZ("top");
//    player = level.findSpriteByClass(Player);
//    levelManager.activateLevel("level1");
//    levelManager.manageLevels = true;
//});


