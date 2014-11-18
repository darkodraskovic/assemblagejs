var assetsToLoad = [
    "assets/PlayerComplete.png",
    "assets/AgentComplete.png",
    "assets/Interior-Furniture.png",
    "assets/Muzzleflashes-Shots.png",
    "assets/Computer1.png"
];
var player;

var myGame = new A_.Game();

//var myLoader = new A_.Loader(onLoaded, "assets/map_skorpio.json", assetsToLoad);
//myLoader.loadLevel();

// INITIALIZE GAMEWORLD
//function onLoaded() {
//    createMap(myGame, myLoader.mapDataParsed);

var debug = true;
var cameraOptions = {innerBoundOffset: 0.25, worldBounded: false, followType: "centered"};
myGame.loadLevel("assets/map_skorpio.json", assetsToLoad, cameraOptions, debug);
//myGame.initialize(debug, cameraOptions);

function startGame() {
    requestAnimFrame(runGame);
}
//}

function runGame() {
    requestAnimFrame(runGame);
    myGame.run();
}