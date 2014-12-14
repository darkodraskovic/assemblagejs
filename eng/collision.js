A_.COLLISION.Collider = Class.extend({
    init: function() {
        this.debugLayer = new PIXI.DisplayObjectContainer()
        this.debugLayer.parallax = 100;
        this.collisionSprites = [];
        this.collisionTiles = [];
        this.collisionStatics = [];
        this.collisionDynamics = [];
        this.collisionMasks = [];
    },
    activateCollisionFor: function(collision, polygon) {        
        var w = collision.size.w;
        var h = collision.size.h;

        var offsetX = collision.offset.x;
        var offsetY = collision.offset.y;

        var collisionPolygon;
        
        if (!polygon) {
            offsetX -= w / 2;
            offsetY -= h / 2;
            var box = new SAT.Box(new SAT.Vector(0, 0), w, h);
            collisionPolygon = box.toPolygon();
            collisionPolygon.w = box.w;
            collisionPolygon.h = box.h;
        } else {
            collisionPolygon = polygon;
            offsetX += collisionPolygon.offset.x;
            offsetY += collisionPolygon.offset.y;
        }
        var offset = new SAT.Vector(offsetX, offsetY);
        collisionPolygon.setOffset(offset);

        collisionPolygon.origPoints = _.map(collisionPolygon.points, function(point) {
            return point.clone();
        });
        collisionPolygon.origOffset = collisionPolygon.offset.clone();
        collisionPolygon.origW = collisionPolygon.w;
        collisionPolygon.origH = collisionPolygon.h;

        collisionPolygon.scale = new SAT.Vector(1, 1);

        return collisionPolygon;
//        if (o.sprite && o.sprite.interactive)
//            o.sprite.hitArea = A_.POLYGON.Utils.SATPolygonToPIXIPolygon(o.collisionPolygon, false);

//        o.collisionPolygon.baked = A_.POLYGON.Utils.SATPolygonToPIXIPolygon(o.collisionPolygon, false);
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
                // Bitmasks. Currently inactive. DO NOTE DELETE!
//                if (typeof o1.collisionType === "undefined" || typeof o2.collisionType === "undefined" ||
//                        o1.collidesWith & o2.collisionType || o2.collidesWith & o1.collisionType) {
                var response = new SAT.Response();
                var collided = SAT.testPolygonPolygon(o1.collisionPolygon, o2.collisionPolygon, response);
                if (collided) {
                    o1.collideWithDynamic(o2, response);
                    o2.collideWithDynamic(o1, response);
//                    }
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
                // Bitmasks. Currently inactive. DO NOTE DELETE!
//                if (typeof o1.collisionType === "undefined" || typeof o2.collisionType === "undefined" ||
//                        o1.collidesWith & o2.collisionType || o2.collidesWith & o1.collisionType) {
                var response = new SAT.Response();
                var collided = SAT.testPolygonPolygon(o1.collisionPolygon, o2.collisionPolygon, response);
                if (collided) {
                    o1.collideWithStatic(o2, response);
                    o2.collideWithDynamic(o1, response);
//                    }
                }
            }
        }
    }
});