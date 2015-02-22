var Diskette = A_.SPRITES.Kinematic.extend({
    spriteSheet: "diskette/diskette.png",
    collisionResponse: "active",
    drawCollisionPolygon: false,
    frameWidth: 32,
    frameHeight: 32,
    elasticity: 0.5,
    groundCheck: true,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 10;
        this.friction.y = 0;
        this.setGravity(0, 20, 60);
        this.maxVelocity.x = 500;
        this.maxVelocity.y = 500;
    },
    update: function () {
        if (this.standing) {
            this.velocity.sub(this.gravity);
        }
        this._super();
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);
    },
    collideWithKinematic: function (other, response) {
        var elasticity = this.elasticity;
        
        if (response.overlap && Math.abs(response.overlapN.x) === 1&& other instanceof Diskette) {
            this.elasticity = 2;
        }
        
        this._super(other, response);
        this.elasticity = elasticity;
    }
});