A_.game = new A_.Game();

// START

//var levelData = skorpio1;
//var levelData = skorpio2;
//var levelData = farer1;
//var levelData = rot1;
var levelData = platformer1;

var levelManager = A_.game.levelManager;

//levelManager.launchLevel(levelData);

// SKORPIO
//levelManager.loadAssets(skorpio1, function () {
//    levelManager.createLevel(skorpio1);
//    levelManager.activateLevel(levelManager.createdLevels.skorpio1);
//});

// PLATFORMER
levelManager.loadAssets(platformer1, function () {
    levelManager.createLevel(platformer1);
    levelManager.activateLevel(levelManager.createdLevels.platformer1);
});

// FARER
//levelManager.loadAssets(farer1, function () {
//    var level = levelManager.createLevel(farer1);
//    populateLevel(level);
//    levelManager.activateLevel(level);
//});

// ROT
//levelManager.loadAssets(rot1, function () {
//    var level = levelManager.createLevel(rot1);
//    createRoguelikeMap(level);
//    
//});

//levelManager.loadAssets(skorpio1, function() {
//    levelManager.createLevel(skorpio1);
////    levelManager.activateLevel(levelManager.createdLevels.skorpio1);
//    levelManager.loadAssets(platformer1, function() {
//        levelManager.createLevel(platformer1);
////        levelManager.activateLevel(levelManager.createdLevels.platformer1);
//    });
//});
//levelManager.loadAssets(platformer1, function () {
//    levelManager.createLevel(platformer1);
//    levelManager.loadAssets(skorpio1, function () {
//        levelManager.createLevel(skorpio1);
//        levelManager.loadAssets(skorpio2, function () {
//            levelManager.createLevel(skorpio2);
//        });
////        levelManager.activateLevel(levelManager.createdLevels.platformer1);
//    });
//});


