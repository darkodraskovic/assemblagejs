var Anime = A_.SPRITES.Kinematic.extend({
    frameWidth: 40,
    frameHeight: 68,
    bounded: false,
    wrap: true,
    collisionResponse: "passive",
    collisionWidth: 28,
    collisionHeight: 68,
    drawCollisionPolygon: false,
    facing: "right",
    elasticity: 0,
//    jumpForce: 625,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 256;
        this.friction.y = 0;
        this.maxVelocity.x = 300;
        this.maxVelocity.y = 800;
        this.setGravity(0, 25, 60);
        var animationSpeed = 0.25;
        this.addAnimation("idle", [0], 0);
        this.addAnimation("walking", _.range(10, 20), animationSpeed);
        this.addAnimation("jumping", _.range(25, 30), animationSpeed);
        this.animations["jumping"].loop = false;
        this.addAnimation("falling", _.range(25, 30), animationSpeed);
        this.animations["falling"].loop = false;
        this.addAnimation("crouching", _.range(30, 36), animationSpeed * 2);
        this.animations["crouching"].loop = false;
        this.animations["crouching"].onComplete = this.onCrouchingComplete.bind(this);
    },
    onCrouchingComplete: function () {
//        window.console.log("Crouching completed");
    },
    update: function () {
        if (this.standing) {
            if (this.velocity.x) {
                this.setAnimation("walking");
            } else {
                if (this.crouching) {
                    this.setAnimation("crouching");
                }
                else {
                    this.setAnimation("idle");
                }
            }
        } else {
            if (this.velocity.y < -this.gravity[this.gV]) {
//                this.setAnimation("jumping");
                this.setAnimation("falling");
            } else {
                this.setAnimation("falling");
            }
        }

        // FLIP
        if (this.facing === "right") {
            this.setFlippedX(false);
        } else {
            this.setFlippedX(true);
        }

        this._super();
    },
    // UTILS
    flipFacing: function () {
        if (this.facing === "right") {
            this.facing = "left";
        }
        else {
            this.facing = "right";
        }
    },
    setGravity: function (x, y, slopeTolerance) {
        if (y > 0) {
            this.setFlippedY(false);
        } else {
            this.setFlippedY(true);
        }
        this._super(x, y, slopeTolerance);
    }
});
