var Bullet = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "Muzzleflashes-Shots.png",
    collisionW: 12,
    collisionH: 10,
    frameW: 32,
    frameH: 32,
    collisionResponse: "sensor",
    init: function (props) {
        this._super(props);
        this.friction.x = 0;
        this.friction.y = 0;
        this.maxVelocity.x = this.maxVelocity.y = 1000;
        this.speed = 600;
        this.bounded = false;
    },
    collide: function (other, response) {
        if (other instanceof Agent) {
            other.alive = false;
            other.motionState = "idle";
            this.destroy();
        } else if (other.collisionResponse === "static") {
            this.destroy();
        }
    }, 
    collideWithTile: function (){
        this.destroy();
    }
});

var Computer = A_.SPRITES.CollisionSprite.extend({
    image: "Computer1.png",
    collisionResponse: "static",
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