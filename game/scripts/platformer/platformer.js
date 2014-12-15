// CLASSES
var Player = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "player.png",
    frame: {w: 32, h: 64},
    bounded: false,
    wrap: true,
    collision: {response: "dynamic", offset: {x: 0, y: 8}, size: {w: 20, h: 46}},
    drawDebugGraphics: false,
    followee: true,
    init: function(parent, x, y, props) {
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
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);
        if (other instanceof Platform) {
            this.x(this.x() + other.diffX);
            this.y(this.y() + other.diffY);
        }
    }
});

Player.inject(A_.MODULES.Platformer);

var Platform = A_.SPRITES.ResponsiveSprite.extend({
    animSheet: "moving_platform.png",
    frame: {w: 128, h: 32},
    collision: {response: "static"},
    type: "horizontal",
    drawDebugGraphics: false,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.sine = this.addon("Sine");
        this.sine.period = 3;
        this.sine.amplitude = this.frame.w / 2;

        this.diffX = 0;
        this.diffY = 0;
    },
    onCreation: function () {
        this.origX = this.x();
        this.origY = this.y();
    } ,
    update: function () {        
        this._super();  

        this.prevX = this.x();
        this.prevY = this.y();
        
        this.x(this.origX + this.sine.value);
        this.y(this.origY - this.sine.value);
        
        this.diffX = this.x() - this.prevX;
        this.diffY= this.y() - this.prevY;
    },
    postupdate: function () {
    }
});