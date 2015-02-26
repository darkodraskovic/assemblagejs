var Particle = A_.SPRITES.Kinematic.extend({
    collisionResponse: "active",
    drawCollisionPolygon: true,
    elasticity: 1,
    bounceTreshold: 0,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 0;
        this.friction.y = 0;
        this.maxVelocity.x = this.maxVelocity.y = 256;
        this.setGravity(0, 0);
        this.velocity.x = _.random(-this.maxVelocity.x, this.maxVelocity.x);
        this.velocity.y = _.random(-this.maxVelocity.y, this.maxVelocity.y);
        this.angularSpeed = _.random(-Math.PI, Math.PI);
    }
});