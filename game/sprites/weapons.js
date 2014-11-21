var Bullet = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "Muzzleflashes-Shots.png",
    collisionW: 12,
    collisionH: 10,
    frameW: 32,
    frameH: 32,
    collisionType: "dynamic",
    init: function (props) {
        this._super(props);
        this.friction.x = 0;
        this.friction.y = 0;
        this.maxVelocity.x = this.maxVelocity.y = 1000;
        this.speed = 600;
        this.bounded = false;
        this.collisionResponse = "lite";
    },
    collideWithStatic: function () {
        this.destroy();
    },
    collideWithDynamic: function (other, response) {
        if (other instanceof Agent) {
            this.destroy();
            other.alive = false;
            other.motionState = "idle";
        }        
    }
});

var Computer = A_.SPRITES.Sprite.extend({
    image: "Computer1.png",
    collisionType: "static",
    interactive: true,
    update: function () {
        this._super();
        if (this.leftpressed) {
            window.console.log("Pressed");
        }
        if (this.leftreleased) {
            window.console.log("Released");
        }
        if (this.leftdown) {
            window.console.log("Down");
        }
    }
})