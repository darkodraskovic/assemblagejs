A_.COLLISION.Collider = Class.extend({
    init: function () {
        this.debugLayer = new PIXI.DisplayObjectContainer()
        this.debugLayer.parallax = 100;
        this.collisionSprites = [];
        this.collisionTiles = [];
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

        if (o.sprite && o.sprite.interactive)
            o.sprite.hitArea = SATPolygonToPIXIPolygon(o.collisionPolygon, false);

//        o.collisionPolygon.baked = SATPolygonToPIXIPolygon(o.collisionPolygon, false);

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
        var len = this.collisionSprites.length;
        for (i = 0; i < len - 1; i++) {
            var o1 = this.collisionSprites[i];
            for (j = i + 1; j < len; j++) {
                var o2 = this.collisionSprites[j];
                if (typeof o1.collisionType === "undefined" || typeof o2.collisionType === "undefined" ||
                        o1.collidesWith & o2.collisionType || o2.collidesWith & o1.collisionType) {
                    var response = new SAT.Response();
                    var collided = SAT.testPolygonPolygon(o1.collisionPolygon, o2.collisionPolygon, response);
                    if (collided) {
                        o1.collide(o2, response);
                        o2.collide(o1, response);
                    }
                }
            }
        }

        var lenSprites = this.collisionSprites.length;
        var lenTiles = this.collisionTiles.length;
        for (i = 0; i < lenSprites; i++) {
            var o1 = this.collisionSprites[i];
            for (j = 0; j < lenTiles; j++) {
                var o2 = this.collisionTiles[j];
                var response = new SAT.Response();
                var collided = SAT.testPolygonPolygon(o1.collisionPolygon, o2.collisionPolygon, response);
                if (collided) {
                    o1.collideWithTile(o2, response);
                    o2.collideWithSprite(o1, response);
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
            // draw circle in the center of the sprite
//            debugGraphics.lineStyle(2, 0xFF0000);
//            debugGraphics.drawCircle(colPol.pos.x, colPol.pos.y, 3);
        }
    }
});

function drawSATPolygon(graphics, polygon) {
    var calcPointsArr = [];
    if (polygon.baked) {
        _.each(polygon.baked.points, function (point, i) {
            if (i % 2 === 0) {
                calcPointsArr[i] = point + polygon.pos.x;
            } else {
                calcPointsArr[i] = point + polygon.pos.y;
            }
        });
    } else {
        calcPointsArr = (SATPolygonToPIXIPolygon(polygon, true)).points;
    }

    graphics.lineStyle(2, 0xff0000);

    graphics.drawPolygon(calcPointsArr);
    graphics.endFill();
}

function SATPolygonToPIXIPolygon(SATPolygon, translated) {
    var calcPoints;
    if (translated) {
        calcPoints = _.map(SATPolygon.calcPoints,
                function (calcPoint) {
                    return calcPoint.clone().add(new SAT.Vector(SATPolygon.pos.x, SATPolygon.pos.y));
                });
    } else {
        calcPoints = _.map(SATPolygon.calcPoints,
                function (calcPoint) {
                    return calcPoint.clone();
                });
    }

    var calcPointsArr = _.reduce(calcPoints, function (points, vector) {
        return points.concat(_.reduce(vector, function (coords, point) {
            return coords.concat(point)
        }, []));
    }, []);
    calcPointsArr[calcPointsArr.length] = calcPointsArr[0];
    calcPointsArr[calcPointsArr.length] = calcPointsArr[1];
    return new PIXI.Polygon(calcPointsArr);
}

SAT.Polygon.prototype.setScale = function (x, y) {
    this.points = _.map(this.origPoints, function (origPoint) {
        return origPoint.clone();
    })
    _.each(this.points, function (point) {
        return point.scale(x, y)
    });

    this.w = this.origW;
    this.h = this.origH;
    this.w *= x;
    this.h *= x;

    this.offset = this.origOffset.clone();
    this.setOffset(new SAT.Vector(this.offset.x * x, this.offset.y * y));
}