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
        var anim = this.addAnimation("jumping", _.range(25, 30), animationSpeed);
        anim.loop = false;
        anim = this.addAnimation("falling", _.range(25, 30), animationSpeed);
        anim.loop = false;
        anim = this.addAnimation("crouching", _.range(30, 36), animationSpeed * 2);
        anim.loop = false;
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
        this.flip.x = this.facing === "left";
        this._super();
    },
    setGravity: function (x, y, slopeTolerance) {
        this.flip.y = y < 0;
        this._super(x, y, slopeTolerance);
    }
});
