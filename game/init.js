// LOADER
// 
// Map layers. Used with tile map parser (see mapParser.js).
var mapData;
// The json file loader; used to load in JSON data and parse it.
// Here, it loads a JSON file exported by TILED.
var mapLoader = new PIXI.JsonLoader("assets/map_skorpio.json");

mapLoader.on('loaded', function (evt) {
    // parsed data can be found in evt.content.json (1.6) and in 2.0...
    mapData = evt.content.content.json;
    assetLoader.load();
});

// define a loader manifest
// #docs: A Class that loads a bunch of images / sprite sheet / bitmap font files. 
// Once the assets have been loaded they are added to the PIXI Texture cache and 
// can be accessed easily through PIXI.Texture.fromImage() and PIXI.Sprite.fromImage() 
// When all items have been loaded this class will dispatch a 'onLoaded' event 
// As each individual item is loaded this class will dispatch a 'onProgress' event
// Supported image formats include 'jpeg', 'jpg', 'png', 'gif'.  
// Supported sprite sheet data formats only include 'JSON' at this time. 
// Supported bitmap font data formats include 'xml' and 'fnt'.
var assetsToLoad = [
    "assets/PlayerComplete.png",
    "assets/AgentComplete.png",
    "assets/Interior-Furniture.png"
];
var assetLoader = new PIXI.AssetLoader(assetsToLoad);
// use callback
assetLoader.onComplete = onAssetsLoaded;

mapLoader.load();

/***************************************************************************************/
/***************************************************************************************/
var player;

var game = new A_.Game();

// INITIALIZE GAMEWORLD
function onAssetsLoaded() {
    parseMap(game);

    var debug = true;
    var cameraOptions = {innerBoundOffset: 0.25, worldBounded: false, followee: player, followType: "centered"};
    game.initialize(debug, cameraOptions);

    requestAnimFrame(gameLoop);
}

function gameLoop() {
    requestAnimFrame(gameLoop);
    game.run();
}