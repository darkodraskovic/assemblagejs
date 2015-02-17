var Particle = A_.SPRITES.Kinematic.extend({
    collisionResponse: "active",
    drawCollisionPolygon: true,
    elasticity: 1,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 0;
        this.friction.y = 0;
        this.setMaxVelocity(256, 256);
        this.velocity.x = _.random(-this.maxVelocity.x, this.maxVelocity.x);
        this.velocity.y = _.random(-this.maxVelocity.y, this.maxVelocity.y);
        this.angularSpeed = _.random(-Math.PI, Math.PI);
//        this.velocity.x = 0;
//        this.velocity.y = 0;
//        this.gravity.y = 7;
    }
});