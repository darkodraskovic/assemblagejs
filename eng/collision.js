A_.COLLISION.Collider = Class.extend({
    init: function() {
        this.collisionSprites = [];
//        this.collisionTiles = [];
        this.collisionStatics = [];
        this.collisionDynamics = [];
        this.collisionMasks = [];
        this.response = new SAT.Response();
    },
    processCollisions: function() {
        _.each(this.collisionSprites, function(sprite) {
            sprite.collided = false;
        });


        // DYNAMICS
        var len = this.collisionDynamics.length;
        for (i = 0; i < len - 1; i++) {
            var o1 = this.collisionDynamics[i];
            for (j = i + 1; j < len; j++) {
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

        // STATICS
        var lenDyn = this.collisionDynamics.length;
        var lenStat = this.collisionStatics.length;
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
    }
});