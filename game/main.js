// START
//A_.game.loadTiledLevel(level1);
//A_.game.loadTiledLevel(level2);
//A_.game.loadTiledLevel(ships);

var player;
A_.game.loadEmptyLevel(farer1);
A_.game.onLevelStarted = function () {
    this.level.width = 2048;
    this.level.height = 2048;
    
    this.level.createImageLayer({image: "starfield.png"});
    
    var layer = this.level.createSpriteLayer();
    player = this.camera.followee = this.createSprite(Ship, layer, this.level.width / 2, this.level.height / 2);
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