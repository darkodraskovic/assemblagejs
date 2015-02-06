A_.game = new A_.Game();

// START

//var levelData = skorpio1;
//var levelData = skorpio2;
//var levelData = farer1;
//var levelData = rot1;
var levelData = platformer1;

var levelManager = A_.game.levelManager;

levelManager.startLevel(levelData);

// SKORPIO
//levelManager.loadLevel(skorpio1, function () {
//    levelManager.createLevel(skorpio1);
//    levelManager.resumeLevel(levelManager.createdLevels.skorpio1);
//});

// PLATFORMER
//levelManager.loadLevel(platformer1, function () {
//    levelManager.createLevel(platformer1);
//    levelManager.resumeLevel(levelManager.createdLevels.platformer1);
//});

// FARER
//levelManager.loadLevel(farer1, function () {
//    var level = levelManager.createLevel(farer1);
//    populateLevel(level);
//    levelManager.resumeLevel(level);
//});

// ROT
//levelManager.loadLevel(rot1, function () {
//    var level = levelManager.createLevel(rot1);
//    createRoguelikeMap(level);
//    
//});

//levelManager.loadLevel(skorpio1, function() {
//    levelManager.createLevel(skorpio1);
////    levelManager.resumeLevel(levelManager.createdLevels.skorpio1);
//    levelManager.loadLevel(platformer1, function() {
//        levelManager.createLevel(platformer1);
////        levelManager.resumeLevel(levelManager.createdLevels.platformer1);
//    });
//});
//levelManager.loadLevel(platformer1, function () {
//    levelManager.createLevel(platformer1);
//    levelManager.loadLevel(skorpio1, function () {
//        levelManager.createLevel(skorpio1);
//        levelManager.loadLevel(skorpio2, function () {
//            levelManager.createLevel(skorpio2);
//        });
////        levelManager.resumeLevel(levelManager.createdLevels.platformer1);
//    });
//});


