A_.TILES.Tile.inject({
    init: function (gid, sprite, x, y, tilemap) {
        this._super(gid, sprite, x, y, tilemap);
        if (this.tilemap.layer.name === "Thrus") {
            this.turned = "on";
        }
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
    },
    update: function () {
        this._super();
//        if (this.leftpressed && A_.player.mode === "building") {
        if (this.leftpressed) {
            this.toggleTurned();
            this.tilemap.level.createSound({
                urls: ['e.wav'],
                volume: 1
            }).play();
        }
        if (this.tilemap.level.rightdown) {
            var mpl = this.tilemap.level.getMousePosition();
            if (this.containsPoint(mpl.x, mpl.y)) {
                this.tilemap.level.createSprite(ExplosionPlatformer, this.tilemap.level.findLayerByName("Thrus"),
                        this.getX() + this.getWidth() / 2, this.getY() + this.getHeight() / 2);
                this.destroy();
            }
        }
    }
});

var AnimePlatformer = A_.SPRITES.Platformer.extend({
    frameWidth: 32,
    frameHeight: 64,
    bounded: false,
    wrap: true,
    collisionResponse: "passive",
    collisionOffsetY: 8,
    collisionWidth: 18,
    collisionHeight: 46,
    drawDebugGraphics: false,
    mode: "throwing",
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.jumpForce = 530;
        this.controlled = true;
        this.addAnimation("idle", [0], 0);
        this.addAnimation("moving", _.range(1, 7), 0.15);
        this.addAnimation("launching", [17], 0);
        this.addAnimation("falling", [18], 0);
    },
    update: function () {
        this._super();

        if (this.platformerState === "grounded") {
            this.setAnimation(this.movingState);
        } else {
            this.setAnimation(this.platformerState);
        }
    },
    toggleMode: function () {
        if (this.mode === "throwing") {
            this.mode = "building";
        } else {
            this.mode = "throwing";
        }
    }
});

var Ball = A_.SPRITES.Kinematic.extend({
    bounded: false,
    spriteSheet: "ball.png",
    collisionResponse: "passive",
    drawDebugGraphics: false,
    elasticity: 1,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 0;
        this.friction.y = 0;
        this.setMaxVelocity(400, 400);
//        this.gravity.y = 7;
//        this.elasticity = 1;
    },
    update: function () {
        this._super();
        if (this.outOfBounds) {
            this.destroy();
        }
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);
    },
    collideWithKinematic: function (other, response) {
        this._super(other, response);
    }
});


// CLASSES
var PlayerPlatformer = AnimePlatformer.extend({
    spriteSheet: "player_platformer.png",
    controlled: true,
    followee: true,
    player: true,
//    drawDebugGraphics: true,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        
        A_.INPUT.addMapping("jetpack", A_.KEY.SPACE);
        A_.INPUT.addMapping("toggleMode", A_.KEY.SHIFT);
        this.thrus = this.level.findLayerByName("Thrus");
    },
    onJumped: function () {
        this._super();
        this.level.createSound({
            urls: ['jump.wav'],
            volume: 1
        }).play();
    },
    onGrounded: function () {
        this._super();
        this.level.createSound({
            urls: ['grounded.wav'],
            volume: 1
        }).play();
    },
    onWall: function () {
        this._super();
//        window.console.log("wall");
    },
    onCeiling: function () {
        this._super();
//        window.console.log("ceiling");
    },
    update: function () {
//        window.console.log("updt platformer");
        if (A_.INPUT.pressed["toggleMode"]) {
            this.toggleMode();
        }
        if (this.level.leftdown && this.mode === "building") {
            var mpl = this.level.getMousePosition();
            var tilemap = this.thrus.tilemap;
            var x = Math.floor(mpl.x / tilemap.tileW);
            var y = Math.floor(mpl.y / tilemap.tileH);
            if (!tilemap.getTile(x, y)) {
                this.level.createTile(this.thrus, 737, x, y);
            }
        }
        if (this.level.leftpressed && this.mode === "throwing") {
            var ball = this.level.createSprite(Ball, this.layer, this.getX(), this.getY());
            var angle = A_.UTILS.angleTo(this.getPosition(), this.level.getMousePosition());
            ball.velocity.x = ball.maxSpeed * Math.cos(angle);
            ball.velocity.y = ball.maxSpeed * Math.sin(angle);
        }
        if (A_.INPUT.pressed["jetpack"]) {
            this.fireJetpack();
        }

        this._super();
    },
    fireJetpack: function () {
        if (this.platformerState !== "grounded") {
            this.velocity.y = -this.jumpForce * 0.75;
            this.jetpackSound = this.level.createSound({
                urls: ['jetpack.wav'],
                volume: 1,
            });
            this.jetpackSound.play();
        }
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);
    },
});

var Undead = AnimePlatformer.extend({
    spriteSheet: "undead.png",
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.controlled = false;
        this.maxVelocity = new SAT.Vector(150, 600);
        this.jumpProbability = 25;
//        this.undeadProbe = A_.game.createSprite(UndeadProbe, this.layer, this.getX(), this.getY(), {undead: this});
    },
    update: function () {
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
//        else if (this.platformerState === "grounded") {
//            this.velocity.x = -this.velocity.x;
//            this.setX(this.prevX);
//            this.flipFacing();
//        }
        if (this.platformerState === "grounded") {
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
        if (!this.collided && undead.platformerState === "grounded") {
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

var Platform = A_.SPRITES.Colliding.extend({
    spriteSheet: "moving_platform.png",
    frameWidth: 128,
    frameHeight: 32,
    collisionResponse: "static",
    type: "horizontal",
//    drawDebugGraphics: false,    
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
        this._super();

        this.setX(this.origX + this.sine.value);
        this.setY(this.origY - this.sine.value);
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
            volume: 1
        }).play();
    }
});
