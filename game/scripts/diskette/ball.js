var Ball = DODO.Kinematic.extend({
    bounded: false,
    spriteSheet: "Diskette/ball.png",
    collisionResponse: "passive",
    drawCollisionPolygon: false,
    elasticity: 0.5,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 2;
        this.friction.y = 0;
        this.setGravity(0, 10);
        this.maxVelocity.x = 800;
        this.maxVelocity.y = 800;
        this.lifeTime = 3;
        this.lifeTimer = 0;
    },
    update: function () {
        if (this.outOfBounds) {
            this.destroy();
        }
        this.lifeTimer += DODO.game.dt;
        if (this.lifeTimer > this.lifeTime) {
            this.destroy();
        }

        this._super();
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);

    },
    collideWithKinematic: function (other, response) {
        var elasticity = this.elasticity;
        if (other instanceof Diskette) {
            this.elasticity = 2;            
        }
        this._super(other, response);
        this.elasticity = elasticity;
    }
});