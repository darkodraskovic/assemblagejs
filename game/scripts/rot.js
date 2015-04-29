// CLASSES
var Ball = DODO.Kinematic.extend({
    colTimesCalled: 0,
    spriteSheet: "player_rot.png",
    elasticity: 0.5,
    drawCollisionPolygon: true,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        DODO.input.addMapping("left", DODO.Key.A);
        DODO.input.addMapping("right", DODO.Key.D);
        DODO.input.addMapping("down", DODO.Key.S);
        DODO.input.addMapping("up", DODO.Key.W);

        this.collisionResponse = "active";
        this.maxVelocity = new SAT.Vector(256, 256);
        this.speed = 256;
        this.friction.x = this.friction.y = 64;

        window.scene = this.scene;
        window.player = this;
        
        this.setFollowee(true);
    },
    update: function() {
        if (DODO.input.down["up"]) {
            this.acceleration.y = -this.speed;
        } else if (DODO.input.down["down"]) {
            this.acceleration.y = this.speed;
        }
        else
            this.acceleration.y = 0;

        if (DODO.input.down["left"]) {
            this.acceleration.x = -this.speed;
        } else if (DODO.input.down["right"]) {
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
    var layerFloors = new DODO.Layer(scene);
    new DODO.Tilemap(layerFloors, "tilemap.png", tileW, tileH);
    layerFloors.tilemap.populate(mapDataFloors);

    var layerWalls = new DODO.Layer(scene);
    new DODO.Tilemap(layerWalls, "tilemap.png", tileW, tileH);
    layerWalls.collisionResponse = "static";    
    layerWalls.tilemap.populate(mapDataWalls);

    layer = new DODO.Layer(scene);
    new Ball(layer, 256, 256);   
}