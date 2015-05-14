var Anime = DODO.Kinematic.extend({
    frameWidth: 40,
    frameHeight: 68,
    bounded: false,
    wrap: true,
    collisionResponse: "passive",
    drawCollisionPolygon: false,
    facing: "right",
    elasticity: 0,
    platformerState: "idle",
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
	//        this.animations["crouching"].onComplete = this.onCrouchingComplete.bind(this);
	this.setAnchor(0.5, 1);
	this.setCollisionSize(28, 68);
	this.position.x += this.anchor.x * this.width;
	this.position.y += this.anchor.y * this.height;
    },
    onCrouchingComplete: function () {
//        window.console.log("Crouching completed");
    },
    update: function () {
        this.setAnimation(this.platformerState);

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
