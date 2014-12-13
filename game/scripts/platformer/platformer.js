// CLASSES
var Player = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "player.png",
    frame: {w: 48, h: 48},
    collision: {response: "dynamic", offset: {x: 0, y: 0}, size: {w: 18, h: 36}},
    drawDebugGraphics: false,
    followee: true,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.controlled = true;
        this.addAnimation("idle", [0], 0);
        this.addAnimation("run", _.range(12, 24), 0.20);
//        this.bounciness = 0.5;
    },    
    update: function () {
        if (this.facing === "right") {
            if (this.flipped("x")) {
                this.flip("x");
            }
        } else if (this.facing === "left") {
            if (!this.flipped("x")) {
                this.flip("x");
            }
        }
        
        if (this.velocity.x !== 0) {
            this.setAnimation("run");
        } else {
            this.setAnimation("idle");
        }
        this._super();
    }
});

Player.inject(A_.MODULES.Platformer);