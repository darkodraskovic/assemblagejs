A_.TILES.Tile.inject({
    init: function (gid, sprite, x, y, tilemap) {
        this._super(gid, sprite, x, y, tilemap);
        if (this.tilemap.layer.name === "Thrus") {
            this.turned = "on";
        }
        this.explosionSound = this.tilemap.level.createSound({
            urls: ['e.wav'],
            volume: 1
        });
    },
    turnOn: function () {
        this.sprite.alpha = 1;
        this.collides = true;
        this.turned = "on";
    },
    turnOff: function () {
        this.sprite.alpha = 0.5;
        this.collides = false;
        this.turned = "off";
    },
    toggleTurned: function () {
        if (this.turned === "on") {
            this.turnOff();
        }
        else {
            this.turnOn();
        }
    }
});

var AnimePlatformer = A_.SPRITES.Kinematic.extend({
    frameWidth: 32,
    frameHeight: 64,
    bounded: false,
    wrap: true,
    autoFlip: true,
    collisionResponse: "passive",
    collisionOffsetY: 8,
    collisionWidth: 18,
    collisionHeight: 46,
    drawCollisionPolygon: false,
    mode: "throwing",
    facing: "right",
    platformer: true,
    elasticity: 0,
    init: function (parent, x, y, props) {
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
    },
    update: function () {
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
            this.setY(this.getY() + this.platformDY + 2);
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
    toggleMode: function () {
        if (this.mode === "throwing") {
            this.mode = "building";
        } else {
            this.mode = "throwing";
        }
    },
    // UTILS
    flipFacing: function () {
        if (this.facing === "right") {
            this.facing = "left";
        }
        else {
            this.facing = "right";
        }
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);

        // Moving platform
        if (response.overlap && response.overlapN.y > 0 && !(other instanceof A_.TILES.Tile)) {
            if (other.getX() !== other.prevX || other.getY() !== other.prevY) {
                this.processMovingPlatform(other);
            }
        }
    },
    processMovingPlatform: function (other) {
        if (this.getY() < other.getY()) {
            if (other instanceof Platform) {
                this.movingPlatform = other;
                this.platformDX = other.getX() - other.prevX;
                this.platformDY = other.getY() - other.prevY;

                this.setXRelative(this.platformDX);
                this.synchCollisionPolygon();
            }
        }
    },
    setGravity: function (x, y, slopeTolerance) {
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
    spriteSheet: "player_platformer.png",
    controlled: true,
    followee: true,
    player: true,
//    elasticity: 0.5,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        A_.INPUT.addMapping("left", A_.KEY.A);
        A_.INPUT.addMapping("right", A_.KEY.D);
        A_.INPUT.addMapping("jump", A_.KEY.SPACE);

        A_.INPUT.addMapping("jetpack", A_.KEY.SPACE);
        A_.INPUT.addMapping("toggleMode", A_.KEY.SHIFT);
        this.thrus = this.level.findLayerByName("Thrus").tilemap;
        this.groundSound = this.level.createSound({
            urls: ['grounded.wav'],
            volume: 1
        });
        this.jetpackSound = this.level.createSound({
            urls: ['jetpack.wav'],
            volume: 1,
        });
        this.jumpSound = this.level.createSound({
            urls: ['jump.wav'],
            volume: 1
        });
    },
    processControls: function () {
        if (A_.INPUT.down["right"] || A_.INPUT.down["left"]) {
            this.applyForce = true;
            if (A_.INPUT.down["right"] && A_.INPUT.down["left"]) {
                this.applyForce = false;
            }
            else if (A_.INPUT.down["right"]) {
                this.facing = "right";
            }
            else if (A_.INPUT.down["left"]) {
                this.facing = "left";
            }
        }
        else {
            this.applyForce = false;
        }

        if (A_.INPUT.down["jump"]) {
            this.tryJump = true;
        }

        if (A_.INPUT.pressed["jetpack"]) {
            this.fireJetpack();
        }
    },
    fireJetpack: function () {
        if (!this.ground) {
            this.velocity.y = (this.gravityN.y < 0 ? this.jumpForce : -this.jumpForce) * 0.75;
            this.jetpackSound.play();
        }
    },
    update: function () {
//        window.console.log(this.ground !== null);
//        window.console.log(this.standing);
        this.processControls();

        if (this.tryJump) {
            if (this.ground) {
                this.velocity.y = this.gravityN.y < 0 ? this.jumpForce : -this.jumpForce;
                this.jumps = true;
                this.jumpSound.play();
            }
            this.tryJump = false;
        }

        if (A_.INPUT.pressed["toggleMode"]) {
            this.toggleMode();
        }

        if (this.ground && this.velocity.y > this.gravity.y) {
//            this.groundSound.play();
        }

        this.processThrus();

        if (this.level.leftpressed && this.mode === "throwing") {
            var ball = this.level.createSprite(Ball, this.layer, this.getX(), this.getY());
            var angle = A_.UTILS.angleTo(this.getPosition(), this.level.getMousePosition());
            ball.velocity.x = ball.maxVelocity.x * Math.cos(angle);
            ball.velocity.y = ball.maxVelocity.y * Math.sin(angle);
        }
        this._super();
//        window.console.log(this.velocity);
    },
    processThrus: function () {
        var tilemap = this.thrus;
        var level = tilemap.level;
        if (level.rightdown) {
            var mpl = level.getMousePosition();
            var tile = this.thrus.getTileAt(mpl.x, mpl.y);
            if (tile) {
                tilemap.level.createSprite(ExplosionPlatformer, level.findLayerByName("Thrus"),
                        tilemap.getLevelX(tilemap.getMapX(mpl.x)) + tilemap.tileW / 2, tilemap.getLevelY(tilemap.getMapY(mpl.y)) + tilemap.tileH / 2);
                tilemap.removeTile(tilemap.getMapX(mpl.x), tilemap.getMapY(mpl.y));
            }
        }

        if (this.level.leftpressed && this.mode === "building") {
            var mpl = this.level.getMousePosition();
            var tile = this.thrus.getTileAt(mpl.x, mpl.y);
            if (tile) {
                tile.toggleTurned();
                tile.explosionSound.play();
            }
        }
        if (this.level.leftdown && this.mode === "building") {
            var mpl = this.level.getMousePosition();
            if (!this.thrus.getTileAt(mpl.x, mpl.y)) {
                this.thrus.setTile(737, this.thrus.getMapX(mpl.x), this.thrus.getMapX(mpl.y));
            }
        }
    }
});

var Undead = AnimePlatformer.extend({
    spriteSheet: "undead.png",
    prevX: 0,
    prevY: 0,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.controlled = false;
        this.maxVelocity.x = 150;
        this.maxVelocity.y = 600;
        this.jumpProbability = 25;
//        this.undeadProbe = A_.game.createSprite(UndeadProbe, this.layer, this.getX(), this.getY(), {undead: this});
    },
    update: function () {
        this.prevX = this.getX();
        this.prevY = this.getY();

        if (!this.isOnScreen()) {
            this.collides = false;
            return;
        } else {
            this.collides = true;
        }

        this.applyForce = true;
        this._super();

    },
    onWall: function () {
        this._super();
//        if (_.random(1, 100) < this.jumpProbability) {
//            this.tryJump = true;
//        }
//        else if (this.ground) {
//            this.velocity.x = -this.velocity.x;
//            this.setX(this.prevX);
//            this.flipFacing();
//        }
        if (this.ground) {
            this.velocity.x = -this.velocity.x;
            this.setX(this.prevX);
            this.flipFacing();
        }
    }
});

var UndeadProbe = A_.SPRITES.Colliding.extend({
    bounded: false,
    collisionResponse: "sensor",
    collisionWidth: 2,
    collisionHeight: 2,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        this._super();
        this.addon("PinTo", {name: "probe", parent: this.undead,
            offsetX: 0, offsetY: this.undead.getHeight() / 2 + 4});
    },
    update: function () {
        this._super();
        var undead = this.undead;
        if (!this.collided && undead.ground) {
            if (_.random(1, 100) < undead.jumpProbability) {
                undead.tryJump = true;
            } else if (_.random(1, 100) > 75) {
                var deltaX = 4;
                undead.setX(undead.prevX);
                undead.velocity.x = -undead.velocity.x;
                if (undead.facing === "right") {
                    undead.facing = "left";
                    undead.setX(undead.getX() - deltaX);
                }
                else {
                    undead.facing = "right";
                    undead.setX(undead.getX() + deltaX);
                }
            }
        }
        this._super();

    }
});

var Ball = A_.SPRITES.Kinematic.extend({
    bounded: false,
    spriteSheet: "ball.png",
    collisionResponse: "passive",
    drawCollisionPolygon: false,
    elasticity: 0.5,
//    elasticity: 1,
//    groundCheck: true,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 1;
        this.friction.y = 0;
        this.setGravity(0, 8);
        this.maxVelocity.x = 500;
        this.maxVelocity.y = 500;
        this.lifeTime = 50;
        this.lifeTimer = 0;
    },
    update: function () {
        if (this.outOfBounds) {
            this.destroy();
        }
        this.lifeTimer += A_.game.dt;
        if (this.lifeTimer > this.lifeTime) {
            this.destroy();
        }

        this._super();
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);

    },
    collideWithKinematic: function (other, response) {
        this._super(other, response);
    }
});


var Platform = A_.SPRITES.Colliding.extend({
    spriteSheet: "moving_platform.png",
    frameWidth: 128,
    frameHeight: 32,
    collisionResponse: "static",
    type: "horizontal",
    prevX: 0,
    prevY: 0,
//    drawCollisionPolygon: false,    
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.sine = this.addon("Sine");
        this.sine.period = 2;
        this.sine.amplitude = this.frameWidth;
        this.sine.reset();
        this.origX = this.getX();
        this.origY = this.getY();
    },
    update: function () {
        this.prevX = this.getX();
        this.prevY = this.getY();


        this.setX(this.origX + this.sine.value);
        this.setY(this.origY - this.sine.value);

        this.synchCollisionPolygon();
        this._super();
    }
});

var ExplosionPlatformer = A_.SPRITES.Sprite.extend({
    spriteSheet: "Explosion.png",
    frameWidth: 128,
    frameHeight: 128,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        this.addAnimation("explode", _.range(0, 17), 0.5);
        this.setAnimation("explode");
        this.animations["explode"].loop = false;
        var that = this;
        this.animations["explode"].onComplete = function () {
            that.destroy();
        };
        this.setScale(0.4, 0.4);
        this.level.createSound({
            urls: ['dull.wav'],
            volume: 0.5
        }).play();
    }
});
