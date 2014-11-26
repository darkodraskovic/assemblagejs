// START
//A_.game.loadEmptyLevel();
//A_.game.loadTiledLevel(level1);
A_.game.loadTiledLevel(level2);
//A_.game.loadTiledLevel("ships");

// LOGIC
A_.game.preupdate = function () {
    if (!A_.level.findSpriteByClass(Agent) && !A_.level.findSpriteByClass(Computer)) {
        if (this.levelName === "level1") {
            A_.game.loadTiledLevel(level2);
        } else {
            A_.game.loadTiledLevel(level1);
        }
    }    
};

A_.game.postupdate = function () {

};