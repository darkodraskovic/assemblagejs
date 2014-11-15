// LOADER
// 
// Map layers. Used with tile map parser (see mapParser.js).
var mapData;
// The json file loader; used to load in JSON data and parse it.
// Here, it loads a JSON file exported by TILED.
var mapLoader = new PIXI.JsonLoader("assets/map.json");

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
var assetsToLoad = ["assets/metal_tiles.png", "assets/ice_tiles.png", "assets/ball.png"];
var assetLoader = new PIXI.AssetLoader(assetsToLoad);
// use callback
assetLoader.onComplete = onAssetsLoaded;

mapLoader.load();



/***************************************************************************************/
/***************************************************************************************/
// viewport that follows the player
var camera;

var player;

var game = new A_.Game();
var collider = new A_.Collider();

var DEBUG = true;
// INITIALIZE GAMEWORLD
function onAssetsLoaded() {
    A_.SPRITES.ArcadeSprite.inject(A_.MODULES.Topdown);
//    Player.inject(A_.MODULES.Platformer);
    
    parseMap(game, collider, maker);

    camera = makeCamera(game.renderer.view.width, game.renderer.view.height, 0.25, player);
    camera.followee = player;
    camera.followType = "centered";
    camera.worldBounded = false;
    player.camera = camera;

    game.camera = camera;
    game.setScale(game.scale);

    game.collider = collider;

    if (DEBUG) {
        collider.setDebug();
        game.gameWorld.container.addChild(collider.debugLayer);
    }

    // Start game loop
    requestAnimFrame(gameLoop);

}

function gameLoop() {
    requestAnimFrame(gameLoop);
    game.run();
}

function maker(name, args) {
    switch (name) {
        case "Player":
            player = new Player();
            var o = player;
            break;
        default:
            break;
    }
    return o;
}
