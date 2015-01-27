// CLASSES
var Ball = A_.SPRITES.Topdown.extend({
    colTimesCalled: 0,
    animSheet: "ball.png",
    collisionResponse: "dynamic",
    name: "ball",
    elasticity: 2,
    init: function (parent, x, y, props) {
        this.controlled = true;
        
        this._super(parent, x, y, props);
    },
    update: function () {
        this.colTimesCalled = 0;
        this._super();
    },
    collideWithStatic: function (other, response) {
        this.colTimesCalled++;
        this._super(other, response);
    }
});

// VARS & CONSTS
var tileW = 48;
var tileH = 48;

var mapDataFloors = [];
var mapDataWalls = [];

var player;

// PROCEDURES
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
        else
            this.mapDataWalls[x][y] = 43;

        if (x * y >= (this.mapDataFloors.length - 1) * (this.mapDataFloors[0].length - 1)) {
            this.createRotLayers();
//            window.console.log("created");
        }
    };
    map.create(userCallback.bind(this));
}
function createRotLayers() {
    var layerFloors = A_.level.createTileLayer("Floor", "tilemap.png", tileW, tileH);
    layerFloors.tilemap.populateTilelayer(mapDataFloors);
    var layerWalls = A_.level.createTileLayer("Walls", "tilemap.png", tileW, tileH);
    layerWalls.collisionResponse = "static";    
    layerWalls.tilemap.populateTilelayer(mapDataWalls);


    var layer = A_.level.createSpriteLayer();
    player = A_.game.createSprite(Ball, layer, 256, 256);
    A_.game.camera.followee = player;
}

A_.game.onLevelStarted = function () {
    this.level.width = 960;
    this.level.height = 960;

    createRoguelikeMap();
}