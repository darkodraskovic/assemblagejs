// START
//A_.game.loadTiledLevel(level1);
//A_.game.loadTiledLevel(level2);
//A_.game.loadTiledLevel(ships);
//
A_.game.loadEmptyLevel(farer1);
A_.game.onLevelStarted = function () {
    this.level.width = 1024;
    this.level.height = 1024;
    this.camera.followee = this.createSprite(Ship, A_.level.layers[0], 128, 128);
}

// LOGIC
A_.game.preupdate = function () {
//    if (!A_.level.findSpriteByClass(Agent) && !A_.level.findSpriteByClass(Computer)) {
//        if (this.level.name === "level1") {
//            A_.game.loadTiledLevel(level2);
//        } else {
//            A_.game.loadTiledLevel(level1);
//        }
//    }    
};

A_.game.postupdate = function () {

};