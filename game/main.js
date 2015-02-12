A_.game = new A_.Game();

// START

//var levelName = "skorpio1";
//var levelName = "skorpio2";
//var levelName = "farer1";
//var levelName = "rot1";
//var levelName = "platformer1";

var levelManager = A_.game.levelManager;

//levelManager.startLevel(platformer1, "lvl1");
levelManager.startLevel(skorpio1, "lvl1");

// FARER
//levelManager.loadLevel(farer1, function () {
//    var level = levelManager.createLevel(farer1, "farer1");
//    populateLevel(level);
//    levelManager.activateLevel("farer1");
//});

// ROT
//levelManager.loadLevel(rot1, function () {
//    var level = levelManager.createLevel(rot1, "rot1");
//    createRoguelikeMap(level);
//    levelManager.activateLevel("rot1");
//});




