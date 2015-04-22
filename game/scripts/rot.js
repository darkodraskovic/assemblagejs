// CLASSES
var Ball = A_.SPRITES.Kinematic.extend({
    colTimesCalled: 0,
    spriteSheet: "player_rot.png",
    elasticity: 0.5,
    followee: true,
    drawCollisionPolygon: true,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        A_.INPUT.addMapping("left", A_.KEY.A);
        A_.INPUT.addMapping("right", A_.KEY.D);
        A_.INPUT.addMapping("down", A_.KEY.S);
        A_.INPUT.addMapping("up", A_.KEY.W);

        this.collisionResponse = "active";
        this.maxVelocity = new SAT.Vector(256, 256);
        this.speed = 256;
        this.friction.x = this.friction.y = 64;

        window.scene = this.scene;
        window.player = this;
    },
    update: function() {
        if (A_.INPUT.down["up"]) {
            this.acceleration.y = -this.speed;
        } else if (A_.INPUT.down["down"]) {
            this.acceleration.y = this.speed;
        }
        else
            this.acceleration.y = 0;

        if (A_.INPUT.down["left"]) {
            this.acceleration.x = -this.speed;
        } else if (A_.INPUT.down["right"]) {
            this.acceleration.x = this.speed;
        }
        else
            this.acceleration.x = 0;

        this._super();
    }
});

// VARS & CONSTS
var tileW = 48;
var tileH = 48;

var mapDataFloors = [];
var mapDataWalls = [];

// PROCEDURES
function createRoguelikeMap(scene) {
    scene.width = 960;
    scene.height = 960;
    var mapW = scene.width / tileW;
    var mapH = scene.height / tileH;
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
            this.createRotLayers(scene);
        }
    };
    map.create(userCallback.bind(this));
}
function createRotLayers(scene) {
    var layerFloors = scene.createTileLayer("Floor", "tilemap.png", tileW, tileH);
    layerFloors.tilemap.populate(mapDataFloors);
    var layerWalls = scene.createTileLayer("Walls", "tilemap.png", tileW, tileH);
    layerWalls.collisionResponse = "static";    
    layerWalls.tilemap.populate(mapDataWalls);

    var layer = scene.createSpriteLayer();
    scene.createSprite(Ball, layer, 256, 256);   
}