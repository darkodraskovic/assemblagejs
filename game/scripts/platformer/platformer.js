// CLASSES
var Player = A_.SPRITES.Platformer.extend({
    animSheet: "player.png",
    frame: {w: 32, h: 64},
    bounded: false,
    wrap: true,
    controlled: true,
    collision: {response: "dynamic", offset: {x: 0, y: 8}, size: {w: 20, h: 46}},
    drawDebugGraphics: false,
    followee: true,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.controlled = true;
        this.addAnimation("idle", [0], 0);
        this.addAnimation("moving", _.range(1, 7), 0.15);
        this.addAnimation("jumping", [17], 0);
        this.addAnimation("falling", [18], 0);
//        this.bounciness = 0.5;
    },
    update: function () {
        this._super();

        if (this.platformerState === "grounded") {
            this.setAnimation(this.movingState);
        } else {
            this.setAnimation(this.platformerState);
        }
    }
});

var Platform = A_.SPRITES.Colliding.extend({
    animSheet: "moving_platform.png",
    frame: {w: 128, h: 32},
    collision: {response: "static"},
    type: "horizontal",
    drawDebugGraphics: false,    
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.sine = this.addon("Sine");
        this.sine.period = 1;
        this.sine.amplitude = this.frame.w;
        this.sine.reset();
        this.platform = true;
    },
    onCreation: function () {
        this.origX = this.x();
        this.origY = this.y();
    },
    update: function () {
        this._super();

        this.x(this.origX + this.sine.value);
        this.y(this.origY - this.sine.value);
    }
});