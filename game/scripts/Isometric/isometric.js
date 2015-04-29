var Anime = DODO.Kinematic.extend({
    motionState: "idle",
    motionStates: ["moving", "idle"],
    cardinalDir: "E",
    cardinalDirs: ["N", "NW", "NE", "S", "SW", "SE"],
    facing: "right",
    frameWidth: 64,
    frameHeight: 64,
    collisionResponse: "active",
//    collisionOffsetX: 19,
//    collisionOffsetY: 14,
//    collisionWidth: 26,
//    collisionHeight: 48,
    animSpeed: 0.15,
    elasticity: 0,
    alive: true,
    bounded: false,
    origin: {x: 0.5, y: 1},
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = this.friction.y = 60;
        this.force = new SAT.Vector(64, 64);

        this.addAnimation("idle_up", [0], 1);
        this.addAnimation("idle_down", [18], 1);
        this.addAnimation("idle_left", [9], 1);
        this.addAnimation("idle_right", [27], 1);

        this.addAnimation("moving_up", _.range(1, 9), this.animSpeed);
        this.addAnimation("moving_down", _.range(19, 27), this.animSpeed);
        this.addAnimation("moving_left", _.range(10, 18), this.animSpeed);
        this.addAnimation("moving_right", _.range(28, 36), this.animSpeed);

        this.addAnimation("death", _.range(36, 42), this.animSpeed);
        this.animations["death"].loop = false;

        var that = this;
        this.animations["death"].onComplete = function() {
            that.destroy();
        };

    },
    update: function() {
        if (this.motionState === "moving") {
            if (this.cardinalContains("N")) {
                this.acceleration.y = -this.force.y;
            }
            else if (this.cardinalContains("S")) {
                this.acceleration.y = this.force.y;
            } else
                this.acceleration.y = 0;
            if (this.cardinalContains("W")) {
                this.acceleration.x = -this.force.x;
            }
            else if (this.cardinalContains("E")) {
                this.acceleration.x = this.force.x;
            } else
                this.acceleration.x = 0;
        } else {
            this.acceleration.x = this.acceleration.y = 0;
            this.velocity.x = this.velocity.y = 0;
        }

        if (this.alive) {
            this.setAnimation(this.motionState + "_" + this.facing);
        }
        else {
            this.setAnimation("death");
        }

        this._super();
    },
    cardinalContains: function(cont, car) {
        if (!car)
            car = this.cardinalDir;

        if (car.indexOf(cont) > -1) {
            return true;
        }
    }
});

var Player = Anime.extend({
    spriteSheet: "Isometric/player.png",
    mass: 4,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        DODO.input.addMapping("left", DODO.Key.A);
        DODO.input.addMapping("right", DODO.Key.D);
        DODO.input.addMapping("down", DODO.Key.S);
        DODO.input.addMapping("up", DODO.Key.W);

        this.collisionResponse = "active";
        this.maxVelocity = new SAT.Vector(256, 256);
        this.force = new SAT.Vector(512, 512);

        window.tilemap = this.scene.findLayerByName("Tiles").tilemap;
        window.player = this;
        window.scene = this.scene;

        this.initMouseReactivity();
        this.setMouseReactivity(true);

        this.scene.bind('leftpressed', this, function() {
            var tm = this.scene.findLayerByName("Tiles").tilemap;
            var pos = this.scene.getMousePosition();
            window.console.log("x: " + tm.getMapIsoX(pos.x, pos.y) + ", y: " + tm.getMapIsoY(pos.x, pos.y));
        });
        
        this.setFollowee(true);
    },
    update: function() {
        var cd = "";
        if (DODO.input.down["up"]) {
            cd = "N";
        } else if (DODO.input.down["down"]) {
            cd = "S";
        }
        if (DODO.input.down["left"]) {
            cd += "W";
        } else if (DODO.input.down["right"]) {
            cd += "E";
        }

        if (cd.length > 0) {
            this.motionState = "moving";
            this.cardinalDir = cd;
        } else
            this.motionState = "idle";

        var rot = (DODO.angleTo(this.getPosition(), this.scene.getMousePosition())).toDeg();
        if (rot >= -45 && rot < 45) {
            this.facing = "right";
        } else if (rot >= 45 && rot < 135) {
            this.facing = "down";
        } else if (rot > 135 || rot <= -135) {
            this.facing = "left";
        } else
            this.facing = "up";

        this._super();
    }
});

var Cube = DODO.Kinematic.extend({
    spriteSheet: "Isometric/cube.png",
    drawCollisionPolygon: true,
    collisionResponse: "static",
    origin: {x: 0.5, y: 1},
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
    }
});

var Sphere = DODO.Kinematic.extend({
    spriteSheet: "Isometric/sphere.png",
    drawCollisionPolygon: true,
    origin: new PIXI.Point(0.5, 1),
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