// START

//var levelData = skorpio1;
//var levelData = skorpio2;
//var levelData = farer1;
//var levelData = rot1;
//var levelData = platformer1;


// SKORPIO
//A_.game.loadLevelData(skorpio1, function () {
//    A_.game.createLevel(skorpio1);
//    A_.game.activateLevel(A_.game.levels.skorpio1);
//});

// PLATFORMER
A_.game.loadLevelData(platformer1, function () {
    A_.game.createLevel(platformer1);
    A_.game.activateLevel(A_.game.levels.platformer1);
});

//A_.game.loadLevelData(skorpio1, function () {
//    A_.game.createLevel(skorpio1);
//    A_.game.loadLevelData(platformer1, function () {
//        A_.game.createLevel(platformer1);
//        A_.game.activateLevel(A_.game.levels.platformer1);
//    });
//});


// FARER
//A_.game.loadLevelData(farer1, function () {
//    var level = A_.game.createLevel(farer1);
//    populateLevel(level);
//    A_.game.activateLevel(level);
//});

// ROT
//A_.game.loadLevelData(rot1, function () {
//    var level = A_.game.createLevel(rot1);
//    createRoguelikeMap(level);
//    
//});

