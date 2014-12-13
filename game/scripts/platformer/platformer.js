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
        this.addAnimation("walk", _.range(1, 7), 0.15);
        this.addAnimation("jumping", [17], 0);
        this.addAnimation("falling", [18], 0);
//        this.bounciness = 0.5;
    },    
    update: function () {
        this._super();
        if (this.platformerState === "grounded") {
            if (this.movingState === "moving") {
                this.setAnimation("walk");
            } else {
                this.setAnimation("idle");
            }            
        } else {
            this.setAnimation(this.platformerState);
        }
    }
});

Player.inject(A_.MODULES.Platformer);