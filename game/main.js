// START
//A_.game.loadTiledLevel(level1);
//A_.game.loadTiledLevel(level2);
//A_.game.loadTiledLevel(ships);

var player;
//A_.game.loadEmptyLevel(farer1);
//A_.game.onLevelStarted = function () {
//    this.level.width = 2048;
//    this.level.height = 2048;

//    this.level.createImageLayer({image: "starfield.png"});
//    
//    var layer = this.level.createSpriteLayer();
//    player = this.camera.followee = this.createSprite(Ship, layer, this.level.width / 2, this.level.height / 2);
//}

var tileW = 48;
var tileH = 48;

A_.game.loadEmptyLevel(rot1);
A_.game.onLevelStarted = function () {
    this.level.width = 960;
    this.level.height = 960;

    createRoguelikeMap();
}

var mapDataFloors = [];
var mapDataWalls = [];
function createRoguelikeMap() {
    var mapW = A_.level.width / tileW;
    var mapH = A_.level.height / tileH;
    for (var i = 0; i < mapW; i++) {
        mapDataFloors[i] = [];
        mapDataWalls[i] = [];
        for (var j = 0; j < mapH; j++) {
            mapDataFloors[i][j] = 0;
            mapDataWalls[i][j] = 0;
        }
    }

    var map = new ROT.Map.Arena(mapW, mapH);
    var userCallback = function (x, y, value) {
        if (!value)
            this.mapDataFloors[x][y] = 35;
        else this.mapDataWalls[x][y] = 43;
        
        if (x * y >= (this.mapDataFloors.length - 1) * (this.mapDataFloors[0].length - 1)) {
            this.createRotLayer();
            window.console.log("created");
        }
    };
    map.create(userCallback.bind(this));
}
function createRotLayer() {
    var layerFloors = A_.level.createTileLayer("tilemap.png", tileW, tileH);
    layerFloors.tilemap.createTilelayer(mapDataFloors);
    var layerWalls = A_.level.createTileLayer("tilemap.png", tileW, tileH);
    layerWalls.collision = true;
    layerWalls.tilemap.createTilelayer(mapDataWalls);


    var layer = A_.level.createSpriteLayer();
    player = A_.game.camera.followee = A_.game.createSprite(Ball, layer, 256, 256);
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


