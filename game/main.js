// START

//var levelData = skorpio1;
//var levelData = skorpio2;
//var levelData = farer1;
//var levelData = rot1;
//var levelData = platformer1;

var levelManager = A_.game.levelManager;

// SKORPIO
//levelManager.loadAssets(skorpio1, function () {
//    levelManager.createLevel(skorpio1);
//    levelManager.activateLevel(levelManager.levels.skorpio1);
//});

// PLATFORMER
//levelManager.loadAssets(platformer1, function () {
//    levelManager.createLevel(platformer1);
//    levelManager.activateLevel(levelManager.levels.platformer1);
//});

levelManager.loadAssets(skorpio1, function () {
    levelManager.createLevel(skorpio1);
    levelManager.loadAssets(platformer1, function () {
        levelManager.createLevel(platformer1);
        levelManager.activateLevel(levelManager.levels.platformer1);
    });
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

