var Anime = A_.SPRITES.Kinematic.extend({
    frameWidth: 40,
    frameHeight: 68,
    bounded: false,
    wrap: true,
    collisionResponse: "passive",
    collisionWidth: 32,
    collisionHeight: 68,
    drawCollisionPolygon: false,
    facing: "right",
    arcade: true,
    elasticity: 0,
    jumpForce: 800,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.force = new SAT.Vector(100, 100);
        this.friction.x = 56;
        this.friction.y = 0;
        this.maxVelocity.x = 300;
        this.maxVelocity.y = 800;
        this.setGravity(0, 30, 60);
        var animationSpeed = 0.25;
        this.addAnimation("idle", [0], 0);
        this.addAnimation("walking", _.range(10, 20), animationSpeed);
        this.addAnimation("jumping", _.range(25, 30), animationSpeed);
        this.animations["jumping"].loop = false;
        this.addAnimation("falling", _.range(25, 30), animationSpeed);
        this.animations["falling"].loop = false;
    },
    update: function () {
        if (this.standing) {
            if (this.applyForce) {
                this.setAnimation("walking");
            } else {
                this.setAnimation("idle");
            }
        } else {
//            if (this.velocity.y < this.gravity[this.gVertical]) {
                this.setAnimation("jumping");
//            } else if (this.velocity.y > this.gravity[this.gVertical]) {
//                this.setAnimation("falling");
//            }
        }
        
        if (this.applyForce) {
            if (this.facing === "right") {
                this.acceleration.x = this.force.x;
            }
            else if (this.facing === "left") {
                this.acceleration.x = -this.force.x;
            }
        }
        else {
            this.acceleration.x = 0;
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
