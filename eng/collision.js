A_.Collider = Class.extend({
    // Overall array of objects that need to be tested for collision (for book keeping purposes).
    collisionSprites: [],
    collisionDynamics: [],
    collisionStatics: [],
    collisionSensors: [],
    // Array of named collision masks
    collisionMasks: [],
    debugLayer: null,
    init: function () {
        this.debugLayer = new PIXI.DisplayObjectContainer()
        this.debugLayer.parallax = 100;
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
            var pos = o.getPosition();
            var box = new SAT.Box(new SAT.Vector(pos.x, pos.y), w, h)
            o.collisionPolygon = box.toPolygon();
            o.collisionPolygon.w = box.w;
            o.collisionPolygon.h = box.h;
            // The y axis of the SAT.js polygon local coordinate system points upwards.
            // Negative value translation moves the polygon leftwards and downwards.
            // 
            // #docs: Translate the original points of this polygin (relative to the 
            // local coordinate system) by the specified amounts.
            // o.collisionPolygon.translate(-w / 2, -h / 2);
            //
            //  #docs: Sets the offset, a translation to apply to the polygon before the angle rotation
        } else {
            o.collisionPolygon = polygon;
        }
        var offset = new SAT.Vector(offsetX, offsetY);
        o.collisionPolygon.setOffset(offset);

        o.collisionPolygon.origPoints = _.map(o.collisionPolygon.points, function (point) {
            return point.clone();
        });

        o.collisionPolygon.origOffset = o.collisionPolygon.offset.clone();
        o.collisionPolygon.origW = o.collisionPolygon.w;
        o.collisionPolygon.origH = o.collisionPolygon.h;

        o.collides = true;
        
        if (o.sprite && o.sprite.interactive)
            o.sprite.hitArea = SATPolygonToPIXIPolygon(o.collisionPolygon, false);
        
        o.collisionPolygon.baked = SATPolygonToPIXIPolygon(o.collisionPolygon, false);

        o.updateCollisionPolygon = function () {
            var colPol = this.collisionPolygon;
            // We don't need to worry about transforming from positive y axis of SAT.js
            // to negative y axis of Pixi.js since polygons are moved in Pixi.js coordinate system. 
            // In other words, we have flipped the whole SAT.js system upside down and
            // put it in the Pixi.js coordinate system. When the object is going down in 
            // the Pixi.js, it will go up in the SAT.js and vice versa.
            var pos = this.getPosition();
            colPol.pos.x = pos.x;
            colPol.pos.y = pos.y;
            
            // #docs: Sets the rotation angle 
            colPol.setAngle(this.rotation);            
        };
    },
    processCollisions: function () {
        // DYNAMIC VS DYNAMIC
        for (i = 0; i < this.collisionDynamics.length - 1; i++) {
            var o1 = this.collisionDynamics[i];
            for (j = i + 1; j < this.collisionDynamics.length; j++) {
                var o2 = this.collisionDynamics[j];
                var response = new SAT.Response();
                var collided = SAT.testPolygonPolygon(o1.collisionPolygon, o2.collisionPolygon, response);
                if (collided) {
                    o1.collideWithDynamic(o2, response);
                    o2.collideWithDynamic(o1, response);
                }
            }
        }

        // DYNAMIC VS STATIC
        for (i = 0; i < this.collisionDynamics.length; i++) {
            var o1 = this.collisionDynamics[i];
            for (j = 0; j < this.collisionStatics.length; j++) {
                var o2 = this.collisionStatics[j];
                var response = new SAT.Response();
                var collided = SAT.testPolygonPolygon(o1.collisionPolygon, o2.collisionPolygon, response);
                if (collided) {
                    o1.collideWithStatic(o2, response);
                }
            }
        }


        // DYNAMIC VS SENSORS
        for (i = 0; i < this.collisionDynamics.length; i++) {
            var o1 = this.collisionDynamics[i];
            for (j = 0; j < this.collisionSensors.length; j++) {
                var o2 = this.collisionSensors[j];
                var response = new SAT.Response();
                var collided = SAT.testPolygonPolygon(o1.collisionPolygon, o2.collisionPolygon, response);
                if (collided) {
                    o1.collideWithSensor(o2, response);
                    o2.collideWithDynamic(o1, response);
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
            var debugGraphics = o.debugGraphics;
            var colPol = this.collisionSprites[i].collisionPolygon;

            debugGraphics.clear();
            drawSATPolygon(debugGraphics, colPol);
            // drawCircle(debugGraphics, this.collisionSprites[i].getPosition());
        }
    }
});
