DODO.Tile.prototype.turnOn = function() {
    this.alpha = 1;
    this.collides = true;
    this.turned = "on";
};
DODO.Tile.prototype.turnOff = function() {
    this.alpha = 0.5;
    this.collides = false;
    this.turned = "off";
};
DODO.Tile.prototype.toggleTurned = function() {
    if (this.turned === "on") {
        this.turnOff();
    }
    else {
        this.turnOn();
    }
    this.toggleSound.play();
};

var AnimePlatformer = DODO.Kinematic.extend({
    frameWidth: 32,
    frameHeight: 64,
    bounded: false,
    wrap: true,
    autoFlip: true,
    collisionResponse: "passive",
    drawCollisionPolygon: true,
    mode: "throwing",
    facing: "right",
    elasticity: 0,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.force = new SAT.Vector(100, 100);
        this.jumpForce = 530;
        this.friction.x = 32;
        this.friction.y = 0;
        this.maxVelocity.x = 300;
        this.maxVelocity.y = 600;
        this.setGravity(0, 20, 60);
        this.addAnimation("idle", [0], 0);
        this.addAnimation("moving", _.range(1, 7), 0.15);
        this.addAnimation("launching", [17], 0);
        this.addAnimation("falling", [18], 0);
        this.setAnchor(0.5, 1);
	this.setCollisionSize(18, 46);
    },
    update: function() {
        if (this.applyForce) {
            if (this.facing === "right") {
                this.acceleration.x = this.force.x;
            }
            else if (this.facing === "left") {
                this.acceleration.x = -this.force.x;
            }
        }
        else {
            this.acceleration.x = 0;
        }


        // PLATFORM
        if (this.movingPlatform) {
            this.position.y = this.position.y + this.platformDY + 2;
            this.movingPlatform = null;
        }


        if (this.standing) {
            if (this.applyForce) {
                this.setAnimation("moving");
            } else {
                this.setAnimation("idle");
            }
        } else {
            if (this.velocity.y < 0) {
                this.setAnimation("launching");
            } else {
                this.setAnimation("falling");
            }
        }

        // FLIP
        if (this.autoFlip) {
            if (this.facing === "right") {
                this.setFlippedX(false);
            } else {
                this.setFlippedX(true);
            }
        }

        this._super();
    },
    toggleMode: function() {
        if (this.mode === "throwing") {
            this.mode = "building";
        } else {
            this.mode = "throwing";
        }
    },
    // UTILS
    flipFacing: function() {
        if (this.facing === "right") {
            this.facing = "left";
        }
        else {
            this.facing = "right";
        }
    },
    collideWithStatic: function(other, response) {
        this._super(other, response);

        // Moving platform
        if (response.overlap && response.overlapN.y > 0 && !(other instanceof DODO.Tile)) {
            if (other.position.x !== other.prevX || other.position.y !== other.prevY) {
                this.processMovingPlatform(other);
            }
        }
    },
    processMovingPlatform: function(other) {
        if (this.position.y < other.position.y) {
            if (other instanceof Platform) {
                this.movingPlatform = other;
                this.platformDX = other.position.x - other.prevX;
                this.platformDY = other.position.y - other.prevY;

                this.position.x += this.platformDX;
                this.synchCollisionPolygon();
            }
        }
    },
    setGravity: function(x, y, slopeTolerance) {
        if (y > 0) {
            this.setFlippedY(false);
        } else {
            this.setFlippedY(true);
        }
        this._super(x, y, slopeTolerance);
    }
});

// CLASSES
var PlayerPlatformer = AnimePlatformer.extend({
    spriteSheet: "Platformer/player_platformer.png",
    controlled: true,
    player: true,
//    elasticity: 0.5,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        DODO.input.addMapping("left", DODO.Key.A);
        DODO.input.addMapping("right", DODO.Key.D);
        DODO.input.addMapping("jump", DODO.Key.SPACE);

        DODO.input.bind("jumpPressed", this, this.fireJetpack);

        DODO.input.addMapping("toggleMode", DODO.Key.SHIFT);
        DODO.input.bind("toggleModePressed", this, this.toggleMode);

        this.thrus = this.scene.findLayerByName("Thrus").tilemap;
        this.groundSound = DODO.getAsset('grounded.wav');
        this.jetpackSound = DODO.getAsset('jetpack.wav');
        this.jumpSound = DODO.getAsset('jump.wav');

        scene = this.scene;
        player = this;
        this.scene.bind('created', function() {
            var tilemap = scene.findLayerByName("Thrus").tilemap;
            tilemap.forEachTile(player.initTile);
        })
        this.scene.bind('leftpressed', this, this.throwBall);
        this.scene.bind('leftpressed', this, this.manageThrus);
        
        this.scene.camera.setFollowee(this);
    },
    initTile: function(tile) {
        tile.turned = "on";
        tile.toggleSound = DODO.getAsset('e.wav');
    },
    processControls: function() {
        if (DODO.input.down["right"] || DODO.input.down["left"]) {
            this.applyForce = true;
            if (DODO.input.down["right"] && DODO.input.down["left"]) {
                this.applyForce = false;
            }
            else if (DODO.input.down["right"]) {
                this.facing = "right";
            }
            else if (DODO.input.down["left"]) {
                this.facing = "left";
            }
        }
        else {
            this.applyForce = false;
        }

        if (DODO.input.down["jump"]) {
            this.tryJump = true;
        }
    },
    fireJetpack: function() {
        if (!this.standing) {
            this.velocity.y = (this.gravityN.y < 0 ? this.jumpForce : -this.jumpForce) * 0.75;
            this.jetpackSound.play();
        }
    },
    update: function() {
        this.processControls();

        if (this.tryJump) {
            if (this.standing) {
                this.velocity.y = this.gravityN.y < 0 ? this.jumpForce : -this.jumpForce;
                this.jumps = true;
                this.jumpSound.play();
            }
            this.tryJump = false;
        }

        if (this.ground && this.velocity.y > this.gravity.y) {
//            this.groundSound.play();
        }

        this.processThrus();
//        window.console.log(this.width);
        this._super();
    },
    throwBall: function() {
        if (this.mode !== "throwing")
            return;
        var ball = new Ball(this.getLayer(), this.position.x, this.aabbTop());
        var angle = DODO.angleTo(this.position, this.scene.getMousePosition());
        ball.velocity.x = ball.maxVelocity.x * Math.cos(angle);
        ball.velocity.y = ball.maxVelocity.y * Math.sin(angle);
    },
    manageThrus: function() {
        if (this.mode !== "building")
            return;
        var mpl = this.scene.getMousePosition();
        var tile = this.thrus.getTileAt(mpl.x, mpl.y);
        if (tile) {
            tile.toggleTurned();
        }
    },
    processThrus: function() {
        var tilemap = this.thrus;
        var scene = this.scene;
        if (scene.rightdown) {
            var mpl = scene.getMousePosition();
            var tile = this.thrus.getTileAt(mpl.x, mpl.y);
            if (tile) {
                new ExplosionPlatformer(this.scene.findLayerByName("Thrus"),
                        tilemap.getSceneX(tilemap.getMapX(mpl.x)) + tilemap.tileW / 2, tilemap.getSceneY(tilemap.getMapY(mpl.y)) + tilemap.tileH / 2);
                tilemap.removeTile(tilemap.getMapX(mpl.x), tilemap.getMapY(mpl.y));
            }
        }

        if (this.scene.leftdown && this.mode === "building") {
            var mpl = this.scene.getMousePosition();
            if (!this.thrus.getTileAt(mpl.x, mpl.y)) {
                var tile = this.thrus.setTile(737, this.thrus.getMapX(mpl.x), this.thrus.getMapX(mpl.y));
                this.initTile(tile);
            }
        }
    }
});

var Ball = DODO.Kinematic.extend({
    bounded: false,
    spriteSheet: "Platformer/ball.png",
    collisionResponse: "passive",
    drawCollisionPolygon: false,
    elasticity: 0.5,
    bounceTreshold: 40,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 1;
        this.friction.y = 0;
        this.setGravity(0, 8);
        this.maxVelocity.x = 500;
        this.maxVelocity.y = 500;
        this.lifeTime = 4;
        this.lifeTimer = 0;
    },
    update: function() {
        if (this.outOfBounds) {
            this.destroy();
        }
        this.lifeTimer += DODO.game.dt;
        if (this.lifeTimer > this.lifeTime) {
            this.destroy();
        }

        this._super();
    },
    collideWithStatic: function(other, response) {
        this._super(other, response);

    },
    collideWithKinematic: function(other, response) {
        this._super(other, response);
    }
});


var Platform = DODO.Colliding.extend({
    spriteSheet: "Platformer/moving_platform.png",
    frameWidth: 128,
    frameHeight: 32,
    collisionResponse: "static",
    type: "horizontal",
    prevX: 0,
    prevY: 0,
//    drawCollisionPolygon: false,    
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.sine = new DODO.addons.Sine(this);
        this.sine.period = 2;
        this.sine.amplitude = this.frameWidth;
        this.sine.reset();
        this.origX = this.position.x;
        this.origY = this.position.y;
    },
    update: function() {
        this.prevX = this.position.x;
        this.prevY = this.position.y;

        this.sine.update();
        this.position.x = this.origX + this.sine.value;
        this.position.y = this.origY - this.sine.value;

        this.synchCollisionPolygon();
        this._super();
    }
});

var ExplosionPlatformer = DODO.Textured.extend({
    spriteSheet: "Common/Explosion.png",
    frameWidth: 128,
    frameHeight: 128,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        this.addAnimation("explode", _.range(0, 17), 0.5);
        this.setAnimation("explode");
        this.animations["explode"].loop = false;
        var that = this;
        this.animations["explode"].onComplete = function() {
            that.destroy();
        };
        this.scale.x = this.scale.y = 0.4;
        DODO.getAsset('dull.wav').play();

        this.setAnchor(0.5, 0.5);
    }
});
