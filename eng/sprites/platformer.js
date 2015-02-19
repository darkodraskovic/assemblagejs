A_.SPRITES.Platformer = A_.SPRITES.Kinematic.extend({
    elasticity: 0,
    slopeTreshold: (50).toRad(),
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        this.friction = new SAT.Vector(32, 0);
        this.maxVelocity = new SAT.Vector(300, 600);
    },
    preupdate: function () {
        this._super();

        // WALL & CEILING
//        this.grounded = false;
//        _.each(this.collisionEntities, function (entity) {
//            if (entity.collides) {
////                if (this.collidesWithEntityAtOffset(entity, 1, 0) || this.collidesWithEntityAtOffset(entity, -1, 0)) {
////                    if (this.response.overlap && !this.response.overlapN.y) {
////                        this.velocity.x = 0;
////                        this.onWall();
////                        this.setXRelative(-this.response.overlapN.x);
////                        this.synchCollisionPolygon();
////                    }
////                }
////                if (this.collidesWithEntityAtOffset(entity, 0, -1)) {
////                    if (this.response.overlap && this.response.overlapN.y <= 0) {
////                        this.onCeiling();
////                        if (this.velocity.y < 0) {
////                            this.velocity.y = 0;
////                        }
////                        this.setYRelative(1);
////                        this.synchCollisionPolygon();
////                    }
////                }
//            }
//        }, this);

    },
    processImpact: function (response) {
        this._super(response);
        
        // SLOPE
//      this._vector.copy(this.slopeNormal).perp();    
//        var angle = Math.atan2(this._vector.y, this._vector.x);
//        if (angle) {
//            if (angle > -Math.PI / 2 && angle < Math.PI / 2) {
//                if (angle < this.slopeTreshold && angle > -this.slopeTreshold) {
//                    this.onSlope = true;
//                }
//                else {
//                }
//                this.slopeAngle = angle;
//            }
//        }
    },
    // CALLBACKS
    onGrounded: function () {

    },
    onWall: function () {
    },
    onCeiling: function () {

    }
});
