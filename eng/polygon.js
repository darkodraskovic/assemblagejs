// SAT EXTENSION
SAT.Polygon.prototype.setScale = function (x, y) {
    var relScaleX = x / this.scale.x;
    var relScaleY = y / this.scale.y;
    this.scale.x = x;
    this.scale.y = y;

    _.each(this.points, function (point) {
        return point.scale(relScaleX, relScaleY);
    }, this);

    this.w *= relScaleX;
    this.h *= relScaleY;

    this.offset.scale(relScaleX, relScaleY);
//    this.recalc();

};

SAT.Polygon.prototype.setScaleX = function (x) {
    var relScaleX = x / this.scale.x;
    this.scale.x = x;

    _.each(this.points, function (point) {
        return point.x *= relScaleX;
    }, this);

    this.w *= relScaleX;

    this.offset.x *= relScaleX;
//    this.recalc();

};
SAT.Polygon.prototype.setScaleY = function (y) {
    var relScaleY = y / this.scale.y;
    this.scale.y = y;

    _.each(this.points, function (point) {
        return point.y *= relScaleY;
    }, this);

    this.h *= relScaleY;

    this.offset.y *= relScaleY;
//    this.recalc();

};

SAT.Polygon.prototype.getLeft = function () {
//    return this.pos.x - Math.abs(this.offset.x);
    return this.pos.x + this.calcMinX;
}
SAT.Polygon.prototype.getRight = function () {
//    return this.pos.x + (Math.abs(this.w) - Math.abs(this.offset.x));
    return this.pos.x + this.calcMaxX;
}
SAT.Polygon.prototype.getTop = function () {
//    return this.pos.y - Math.abs(this.offset.y);
    return this.pos.y + this.calcMinY;
}
SAT.Polygon.prototype.getBottom = function () {
//    return this.pos.y + (Math.abs(this.h) - Math.abs(this.offset.y));
    return this.pos.y + this.calcMaxY;
}
SAT.Polygon.prototype.getCenterX = function () {
//    return this.getLeft() + (Math.abs(this.w) / 2);
    return this.pos.x + (this.calcMaxX - this.calcMinX) / 2;
}
SAT.Polygon.prototype.getCenterY = function () {
//    return this.getTop() + (Math.abs(this.h) / 2);
    return this.pos.y + (this.calcMaxY - this.calcMinY) / 2;
}

SAT.Polygon.prototype.getWidth = function () {
    return this.calcW;
}

SAT.Polygon.prototype.getHeight = function () {
    return this.calcH;
}


SAT.Polygon.prototype.calcSize = function () {
    var xs = [];
    var ys = [];

    _.each(this.points, function (point) {
        xs[xs.length] = point.x;
        ys[ys.length] = point.y;
    });

    this.minX = _.min(xs);
    this.minY = _.min(ys);
    this.maxX = _.max(xs);
    this.maxY = _.max(ys);
    this.w = this.maxX - this.minX;
    this.h = this.maxY - this.minY;
}

SAT.Polygon.prototype.calcBounds = function () {
    var xs = [];
    var ys = [];

    _.each(this.calcPoints, function (point) {
        xs[xs.length] = point.x;
        ys[ys.length] = point.y;
    });

    this.calcMinX = _.min(xs);
    this.calcMinY = _.min(ys);
    this.calcMaxX = _.max(xs);
    this.calcMaxY = _.max(ys);
    this.calcW = this.calcMaxX - this.calcMinX;
    this.calcH = this.calcMaxY - this.calcMinY;
}

// ENGINE polygon UTILS
A_.POLYGON.Utils = {};

A_.POLYGON.Utils.createSATPolygonFromTiled = function (oData) {
    var vectors = _.map(oData.polygon, function (vertex) {
        return new SAT.Vector(vertex.x, vertex.y)
    });

    var collisionPolygon = new SAT.Polygon(new SAT.Vector(oData.x, oData.y), vectors);
    collisionPolygon.calcSize();

    var offsetX = (collisionPolygon.minX + collisionPolygon.w / 2);
    var offsetY = (collisionPolygon.minY + collisionPolygon.h / 2);
    var offset = new SAT.Vector(-offsetX, -offsetY);
    collisionPolygon.setOffset(offset);

    return collisionPolygon;
};

A_.POLYGON.Utils.SATPolygonToPIXIPolygon = function (SATPolygon, translated) {
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
            return coords.concat(point);
        }, []));
    }, []);
    calcPointsArr[calcPointsArr.length] = calcPointsArr[0];
    calcPointsArr[calcPointsArr.length] = calcPointsArr[1];
    return new PIXI.Polygon(calcPointsArr);
};

A_.POLYGON.Utils.drawSATPolygon = function (graphics, polygon) {
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
        calcPointsArr = (this.SATPolygonToPIXIPolygon(polygon, true)).points;
    }

    graphics.lineStyle(2, 0xff0000);

    graphics.drawPolygon(calcPointsArr);
    graphics.endFill();
};