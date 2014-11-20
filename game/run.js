var assetsToLoad = [
    "assets/PlayerComplete.png",
    "assets/AgentComplete.png",
    "assets/Interior-Furniture.png",
    "assets/Muzzleflashes-Shots.png",
    "assets/Computer1.png"
];

var cameraOptions = {innerBoundOffset: 0.25, worldBounded: false, followType: "centered"};
A_.game.setDefaultCameraOptions(cameraOptions);

A_.game.addLevel("level1", "assets/map_skorpio.json", assetsToLoad, cameraOptions);
A_.game.addLevel("level2", "assets/map_skorpio2.json", assetsToLoad, cameraOptions);

A_.game.loadLevel("level1");