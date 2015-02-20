A_.SPRITES.Platformer = A_.SPRITES.Kinematic.extend({
    elasticity: 0,
    slopeTreshold: (50).toRad(),
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        this.friction = new SAT.Vector(32, 0);
        this.maxVelocity = new SAT.Vector(300, 600);
    },
    // CALLBACKS
    onGrounded: function () {

    },
    onWall: function () {
    },
    onCeiling: function () {

    }
});
