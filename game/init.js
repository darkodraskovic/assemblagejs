var assetsToLoad = [
    "assets/PlayerComplete.png",
    "assets/AgentComplete.png",
    "assets/Interior-Furniture.png",
    "assets/Muzzleflashes-Shots.png",
    "assets/Computer1.png"
];
var player;

var myGame = new A_.Game();

var debug = true;
var cameraOptions = {innerBoundOffset: 0.25, worldBounded: false, followType: "centered"};
myGame.loadLevel("assets/map_skorpio.json", assetsToLoad, cameraOptions, debug);
myGame = null;

