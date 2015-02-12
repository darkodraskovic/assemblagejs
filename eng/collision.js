A_.COLLISION.Collider = Class.extend({
    init: function () {
        this.collisionSprites = [];
        this.collisionStatics = [];
        this.collisionDynamics = [];
        this.collisionMasks = [];
        this.response = new SAT.Response();
    },
    processCollisions: function () {
        _.each(this.collisionSprites, function (sprite) {
            sprite.collided = false;
        });

        var lenDyn = this.collisionDynamics.length;
        var lenStat = this.collisionStatics.length;


        // STATICS
        for (i = 0; i < lenDyn; i++) {
            var o1 = this.collisionDynamics[i];
            for (j = 0; j < lenStat; j++) {
                var o2 = this.collisionStatics[j];
                if (o1.collides && o2.collides) {
                    // Bitmasks. Currently inactive. DO NOTE DELETE!
//                if (typeof o1.collisionType === "undefined" || typeof o2.collisionType === "undefined" ||
//                        o1.collidesWith & o2.collisionType || o2.collidesWith & o1.collisionType) {
                    this.response.clear();
                    var collided = SAT.testPolygonPolygon(o1.collisionPolygon, o2.collisionPolygon, this.response);
                    if (collided) {
                        o1.collideWithStatic(o2, this.response);
                        o2.collideWithDynamic(o1, this.response);
//                    }
                    }
                }
            }
        }
        // DYNAMICS
        for (i = 0; i < lenDyn - 1; i++) {
            var o1 = this.collisionDynamics[i];
            for (j = i + 1; j < lenDyn; j++) {
                var o2 = this.collisionDynamics[j];
                if (o1.collides && o2.collides) {
                    // Bitmasks. Currently inactive. DO NOTE DELETE!
//                if (typeof o1.collisionType === "undefined" || typeof o2.collisionType === "undefined" ||
//                        o1.collidesWith & o2.collisionType || o2.collidesWith & o1.collisionType) {
                    this.response.clear();

                    var collided = SAT.testPolygonPolygon(o1.collisionPolygon, o2.collisionPolygon, this.response);
                    if (collided) {
                        o1.collideWithDynamic(o2, this.response);
                        o2.collideWithDynamic(o1, this.response);
//                    }
                    }
                }
            }
        }
    }
});

A_.COLLISION.aabbInjection = {
    aabbWidth: function () {
//        return Math.abs(this.collisionPolygon.w);
        return this.collisionPolygon.getWidth();
    },
    aabbHeight: function () {
//        return Math.abs(this.collisionPolygon.h);
        return this.collisionPolygon.getHeight();
    },
    aabbBottom: function () {
        return this.collisionPolygon.getBottom();
    },
    aabbTop: function () {
        return this.collisionPolygon.getTop();
    },
    aabbLeft: function () {
        return this.collisionPolygon.getLeft();
    },
    aabbRight: function () {
        return this.collisionPolygon.getRight();
    },
    aabbCenterX: function () {
        return this.collisionPolygon.getCenterX();
    },
    aabbCenterY: function () {
        return this.collisionPolygon.getCenterY();
    },
    aabbOverlapsSegment: function (axis, a, b) {
        if (axis === "y") {
            return (this.aabbTop() < b && this.aabbBottom() > a);
        } else if (axis === "x") {
            return (this.aabbLeft() < b && this.aabbRight() > a);
        }
    },
    aabbOverlapsEntity: function (entity) {
        return (this.aabbTop() < entity.aabbBottom() && this.aabbBottom() > entity.aabbTop()
                && this.aabbLeft() < entity.aabbRight() && this.aabbRight() > entity.aabbLeft());
    }
};