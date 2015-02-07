A_.game = new A_.Game();

// START

//var levelName = "skorpio1";
//var levelName = "skorpio2";
//var levelName = "farer1";
//var levelName = "rot1";
var levelName = "platformer1";

var levelManager = A_.game.levelManager;

levelManager.startLevel(levelName);

// SKORPIO / PLATFORMER
//levelManager.loadLevel(levelName, function () {
//    levelManager.createLevel(levelName);
//    levelManager.resumeLevel(levelName);
//});

// FARER
//levelManager.loadLevel("farer1", function () {
//    var level = levelManager.createLevel("farer1");
//    populateLevel(level);
//    levelManager.resumeLevel("farer1");
//});

// ROT
//levelManager.loadLevel("rot1", function () {
//    var level = levelManager.createLevel("rot1");
//    createRoguelikeMap(level);
//    levelManager.resumeLevel("rot1");
//});




