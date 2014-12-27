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
        if (this.rightpressed) {
            A_.game.createSprite(Explosion, A_.level.findLayerByName("Thrus"),
                    this.x() + this.width() / 2, this.y() + this.height() / 2);
            this.destroy();
        }
    }
});

// CLASSES
var Player = A_.SPRITES.Platformer.extend({
    animSheet: "player.png",
    frame: {w: 32, h: 64},
    bounded: false,
    wrap: true,
    controlled: true,
    collision: {response: "dynamic", offset: {x: 0, y: 8}, size: {w: 18, h: 46}},
    drawDebugGraphics: false,
    followee: true,
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
    }
});

var Platform = A_.SPRITES.Colliding.extend({
    animSheet: "moving_platform.png",
    frame: {w: 128, h: 32},
    collision: {response: "static"},
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
        this.origX = this.x();
        this.origY = this.y();
    },
    update: function() {
        this._super();

        this.x(this.origX + this.sine.value);
        this.y(this.origY - this.sine.value);
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
        this.scale(0.4, 0.4);
        A_.game.createSound({
            urls: ['dull.wav'],
            volume: 1
        }).play();
    }
});
