// CONFIG
var cameraOptions = {innerBoundOffset: 0.25, worldBounded: false, followType: "centered"};
A_.game.setDefaultCameraOptions(cameraOptions);

// LEVELS
var assetsToLoad = [
    "assets/PlayerComplete.png",
    "assets/AgentComplete.png",
    "assets/Interior-Furniture.png",
    "assets/Muzzleflashes-Shots.png",
    "assets/Computer1.png"
];

A_.game.addLevel("level1", "assets/map_skorpio.json", assetsToLoad);
A_.game.addLevel("level2", "assets/map_skorpio2.json", assetsToLoad);
A_.game.loadLevel("level1");

// LOOP
A_.game.preupdate = function () {
    if (!A_.level.findSpriteByClass(Agent)) {
        if (this.levelName === "level1") {
            A_.game.loadLevel("level2");

        } else {
            A_.game.loadLevel("level1");
        }
    }    
};

A_.game.postupdate = function () {

};