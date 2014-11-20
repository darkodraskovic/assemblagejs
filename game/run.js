// CONFIG
var cameraOptions = {innerBoundOffset: 0.25, worldBounded: false, followType: "centered"};
A_.game.setDefaultCameraOptions(cameraOptions);

// START
A_.game.loadTiledLevel("map_skorpio1");

// LOGIC
A_.game.preupdate = function () {
    if (!A_.level.findSpriteByClass(Agent)) {
        if (this.levelName === "map_skorpio1") {
            A_.game.loadTiledLevel("map_skorpio2");
        } else {
            A_.game.loadTiledLevel("map_skorpio1");
        }
    }    
};

A_.game.postupdate = function () {

};