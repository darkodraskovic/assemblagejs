var assetsToLoad = [
    "assets/PlayerComplete.png",
    "assets/AgentComplete.png",
    "assets/Interior-Furniture.png",
    "assets/Muzzleflashes-Shots.png",
    "assets/Computer1.png"
];
var player;

var myGame = new A_.Game();

var loader = new A_.Loader(onLoaded, "assets/map_skorpio.json", assetsToLoad);
loader.loadLevel();

// INITIALIZE GAMEWORLD
function onLoaded() {
    createMap(myGame, loader.mapDataParsed);

    var debug = true;
    var cameraOptions = {innerBoundOffset: 0.25, worldBounded: false, followType: "centered"};
    myGame.initialize(debug, cameraOptions);

    requestAnimFrame(gameLoop);
}

function gameLoop() {
    requestAnimFrame(gameLoop);
    myGame.run();
}