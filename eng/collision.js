A_.COLLISION.Collider = Class.extend({
    init: function () {
        this.debugLayer = new PIXI.DisplayObjectContainer()
        this.debugLayer.parallax = 100;
        this.collisionSprites = [];
        this.collisionTiles = [];
        this.collisionStatics = [];
        this.collisionDynamics = [];
        this.collisionMasks = [];
    },
    activateCollisionFor: function (o, polygon, w, h, offsetX, offsetY) {
        if (!w)
            w = o.width;
        if (!h)
            h = o.height;
        if (typeof offsetX === 'undefined')
            offsetX = w / 2;
        if (typeof offsetY === 'undefined')
            offsetY = h / 2;

        if (!polygon) {
            var pos = o.position();
            var box = new SAT.Box(new SAT.Vector(pos.x, pos.y), w, h)
            o.collisionPolygon = box.toPolygon();
            o.collisionPolygon.w = box.w;
            o.collisionPolygon.h = box.h;
        } else {
            o.collisionPolygon = polygon;
            offsetX += o.collisionPolygon.offset.x;
            offsetY += o.collisionPolygon.offset.y;
        }
        var offset = new SAT.Vector(offsetX, offsetY);
        o.collisionPolygon.setOffset(offset);

        o.collisionPolygon.origPoints = _.map(o.collisionPolygon.points, function (point) {
            return point.clone();
        });
        o.collisionPolygon.origOffset = o.collisionPolygon.offset.clone();
        o.collisionPolygon.origW = o.collisionPolygon.w;
        o.collisionPolygon.origH = o.collisionPolygon.h;
        
        o.collisionPolygon.scale = new SAT.Vector(1, 1);

        if (o.sprite && o.sprite.interactive)
            o.sprite.hitArea = A_.POLYGON.Utils.SATPolygonToPIXIPolygon(o.collisionPolygon, false);

//        o.collisionPolygon.baked = A_.POLYGON.Utils.SATPolygonToPIXIPolygon(o.collisionPolygon, false);
    },
    processCollisions: function () {
        _.each(this.collisionSprites, function (sprite) {
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

    },
    setDebug: function () {
        for (i = 0; i < this.collisionSprites.length; i++) {
            this.collisionSprites[i].debugGraphics = new PIXI.Graphics();
            this.debugLayer.addChild(this.collisionSprites[i].debugGraphics);
        }
    },
    drawDebug: function () {
        for (i = 0; i < this.collisionSprites.length; i++) {
            var o = this.collisionSprites[i];
            if (o.drawDebugGraphics) {                
                var debugGraphics = o.debugGraphics;
                var colPol = this.collisionSprites[i].collisionPolygon;

                debugGraphics.clear();
                A_.POLYGON.Utils.drawSATPolygon(debugGraphics, colPol);
                // draw circle in the center of the sprite
//            debugGraphics.lineStyle(2, 0xFF0000);
//            debugGraphics.drawCircle(colPol.pos.x, colPol.pos.y, 3);
            }
        }
    }
});