var thruTile = null;
A_.TILES.Tile.inject({
    init: function(gid, sprite, x, y, tilemap) {
        this._super(gid, sprite, x, y, tilemap);
        if (this.tilemap.layer.name === "Thrus") {
            this.interactive(true);
            this.turned = "on";
        }
    },
    interactive: function(interacts) {
        if (typeof interacts === "undefined")
            return this.sprite.interactive;
        if (interacts) {
            var that = this;
            if (!this.initedInput) {
                this.sprite.mousedown = function() {
//                    window.console.log("mousedown");
                    that.toggleTurned();
                };
                this.sprite.mouseup = function() {
                };
                this.sprite.mouseupoutside = function() {
                };
                this.sprite.rightdown = function() {
                    that.tilemap.unsetTile(that.mapPosition.x, that.mapPosition.y);
                };
                this.sprite.rightup = function() {
                };
                this.sprite.rightupoutside = function() {
                };
                this.initedInput = true;
            }
            this.sprite.interactive = true;
        } else {
            this.sprite.interactive = false;
        }
    },
    turnOn: function() {
        this.sprite.alpha = 1;
        this.turned = "on";
    },
    turnOff: function() {
        this.sprite.alpha = 0.5;
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

A_.game.preupdate = function() {

};

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
    collideWithStatic: function(other, response) {
        if (other.turned && other.turned === "off") {
            return;
        }
        else {
            this._super(other, response);
        }
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
        this.sine.period = 1;
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

