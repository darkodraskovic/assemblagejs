A_.TILES.Tile.inject({
    init: function(gid, sprite, x, y, tilemap) {
        this._super(gid, sprite, x, y, tilemap);
        if (this.tilemap.layer.name === "Thrus") {
            this.turned = "on";
        }
    },
    turnOn: function() {
        this.sprite.alpha = 1;
        this.collides = true;
        this.turned = "on";
    },
    turnOff: function() {
        this.sprite.alpha = 0.5;
        this.collides = false;
        this.turned = "off";
    },
    toggleTurned: function() {
        if (this.turned === "on") {
            this.turnOff();
        }
        else {
            this.turnOn();
        }
//        window.console.log(this.turned);
    },
    update: function() {
        this._super();
        if (this.leftpressed) {
            this.toggleTurned();
            A_.game.createSound({
                urls: ['e.wav'],
                volume: 1
            }).play();
        }
        if (A_.level.rightdown) {
            var mpl = A_.INPUT.mousePosition.level;
            if (this.containsPoint(mpl.x, mpl.y)) {
                A_.game.createSprite(Explosion, A_.level.findLayerByName("Thrus"),
                        this.getX() + this.getWidth() / 2, this.getY() + this.getHeight() / 2);
                this.destroy();
            }
        }
    }
});

var Anime = A_.SPRITES.Platformer.extend({
    frame: {w: 32, h: 64},
    bounded: false,
    wrap: true,
//    collision: {response: "dynamic", offset: {x: 0, y: 8}, size: {w: 18, h: 46}},
    collisionResponse: "dynamic",
    collisionOffsetY: 8,
    collisionW: 18,
    collisionH: 46,
    drawDebugGraphics: false,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.jumpForce = 530;
        this.controlled = true;
        this.addAnimation("idle", [0], 0);
        this.addAnimation("moving", _.range(1, 7), 0.15);
        this.addAnimation("jumping", [17], 0);
        this.addAnimation("falling", [18], 0);
    },
    update: function() {
        this._super();

        if (this.platformerState === "grounded") {
            this.setAnimation(this.movingState);
        } else {
            this.setAnimation(this.platformerState);
        }
    }
});



// CLASSES
var Player = Anime.extend({
    animSheet: "player.png",
    controlled: true,
    followee: true,
    onCreation: function() {
        A_.INPUT.addMapping("jetpack", A_.KEY.SHIFT);
        this._super();
        this.thrus = A_.level.findLayerByName("Thrus");
    },
    onJumped: function() {
        this._super();
        A_.game.createSound({
            urls: ['jump.wav'],
            volume: 1
        }).play();
    },
    onGrounded: function() {
        this._super();
        A_.game.createSound({
            urls: ['grounded.wav'],
            volume: 1
        }).play();
    },
    onWall: function() {
        this._super();
//        window.console.log("wall");
    },
    onCeiling: function() {
        this._super();
        window.console.log("ceiling");
    },
    update: function() {
        if (A_.level.leftdown) {
            var mpl = A_.INPUT.mousePosition.level;
            var tilemap = this.thrus.tilemap;
            var x = Math.floor(mpl.x / tilemap.tileW);
            var y = Math.floor(mpl.y / tilemap.tileH);
            if (!tilemap.getTile(x, y)) {
                A_.game.createTile(this.thrus, 737, x, y);
            }
        }
        if (A_.INPUT.down["jetpack"]) {
            if (this.velocity.y > -200) {
                this.velocity.y -= this.force.y;
            }
        }
        if (A_.INPUT.pressed["jetpack"]) {
            this.jetpackSound = A_.game.createSound({
                urls: ['jetpack.wav'],
                volume: 1,
            });
            this.jetpackSound.play();
        }
        if (A_.INPUT.released["jetpack"]) {
//            this.jetpackSound.stop();
        }
        this._super();
//        window.console.log(this.platformerState);
    },
//    collideWithDynamic: function (other, response) {
//        if (other.collision.response === "sensor") {
//        }
//    }
    collideWithStatic: function(other, response) {
//        window.console.log(response.overlapN.y);
        this._super(other, response);
    }
});

var Undead = Anime.extend({
    animSheet: "undead.png",
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.controlled = false;
        this.maxVelocity = new SAT.Vector(150, 600);
        this.jumpProbability = 25;
    },
    onCreation: function() {
        this._super();
        this.undeadProbe = A_.game.createSprite(UndeadProbe, this.layer, this.getX(), this.getY(), {undead: this});
    },
    update: function() {
        this.applyForce = true;
        this._super();
    },
    onWall: function() {
        this._super();
        if (_.random(1, 100) < this.jumpProbability) {
            this.tryJump = true;
        }
        else if (this.platformerState === "grounded") {
            this.velocity.x = -this.velocity.x;
            this.setX(this.prevX);
            this.flipFacing();
        }
    }
});

var UndeadProbe = A_.SPRITES.Colliding.extend({
    bounded: false,
//    collision: {response: "sensor", offset: {x: 0, y: 0}, size: {w: 2, h: 2}},
    collisionResponse: "sensor",
    collisionW: 2,
    collisionH: 2,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

    },
    onCreation: function() {
        this._super();
        this.addon("PinTo", {name: "probe", parent: this.undead,
            offsetX: 0, offsetY: this.undead.getHeight() / 2 + 4});
    },
    update: function() {
        this._super();
//    },
//    postupdate: function() {
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
A_.game.preupdate = function() {
    if (this.leftpressed) {
    }
}

var Platform = A_.SPRITES.Colliding.extend({
    animSheet: "moving_platform.png",
    frame: {w: 128, h: 32},
//    collision: {response: "static"},
    collisionResponse: "static",
    type: "horizontal",
//    drawDebugGraphics: false,    
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.sine = this.addon("Sine");
        this.sine.period = 2;
        this.sine.amplitude = this.frame.w;
        this.sine.reset();
        this.platform = true;
    },
    onCreation: function() {
        this.origX = this.getX();
        this.origY = this.getY();
    },
    update: function() {
        this._super();

        this.setX(this.origX + this.sine.value);
        this.setY(this.origY - this.sine.value);
    }
});

var Explosion = A_.SPRITES.Animated.extend({
    animSheet: "Explosion.png",
    frame: {w: 128, h: 128},
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        this.addAnimation("explode", _.range(0, 17), 0.5);
        this.setAnimation("explode");
        this.animations["explode"].loop = false;
        var that = this;
        this.animations["explode"].onComplete = function() {
            that.destroy();
        };
        this.setScale(0.4, 0.4);
        A_.game.createSound({
            urls: ['dull.wav'],
            volume: 1
        }).play();
    }
});
