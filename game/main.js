A_.game = new A_.Game();

// START


var levelManager = A_.game.levelManager;

//levelManager.createLevel(platformer1, "lvl1");
//levelManager.createLevel(skorpio1, "lvl1");
//levelManager.createLevel(skorpio2, "lvl1");
//levelManager.createLevel(brownian, "lvl1");
//levelManager.createLevel(isometric, "lvl1");
//levelManager.createLevel(pongPlayground, "playground");
levelManager.createLevel(pongMainMenu, "mainMenu");

// FARER
//levelManager.loadLevel(farer1, function () {
//    var level = levelManager.createLevel(farer1, "farer1");
//    populateLevel(level);
//});

// ROT
//levelManager.loadLevel(rot1, function () {
//    var level = levelManager.createLevel(rot1, "rot1");
//    createRoguelikeMap(level);
//});

// DISKETTE
//levelManager.loadLevel(diskette, function () {
//    level = levelManager.createLevel(diskette, "level1");
//    for (var i = 0; i < 50; i++) {
//        var star = level.createSprite(SceneryStar, level.findLayerByName("Sky"),
//                Math.random() * A_.game.renderer.width, Math.random() * A_.game.renderer.width);
//        star.sprite.alpha = Math.random();
//    }
//    level.findSpriteByClass(ScenerySun).setZ("top");
//    player = level.findSpriteByClass(Player);
//    
//    A_.INPUT.addMapping("restart", A_.KEY.T);
//});


