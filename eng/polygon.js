// SAT EXTENSION
SAT.Polygon.prototype.setScale = function(x, y) {
    var prevScale = this.scale.clone();
    this.scale.x = x;
    this.scale.y = y;

    _.each(this.points, function(point) {
        return point.scale(x / prevScale.x, y / prevScale.y);
    }, this);

    this.w *= x / prevScale.x;
    this.h *= y / prevScale.y;

    this.offset.scale(x / prevScale.x, y / prevScale.y);
    this.recalc();
//    this.recalcSize();
};

SAT.Polygon.prototype.calcSize = function() {
    var xs = [];
    var ys = [];

    _.each(this.points, function(point) {
        xs[xs.length] = point.x;
        ys[ys.length] = point.y;
    });

    var minX = _.min(xs);
    var minY = _.min(ys);
    var maxX = _.max(xs);
    var maxY = _.max(ys);
    this.w = maxX - minX;
    this.h = maxY - minY;
}
// ENGINE polygon UTILS
A_.POLYGON.Utils = {};

A_.POLYGON.Utils.createSATPolygonFromTiled = function(oData, centered) {
    var xs = [];
    var ys = [];

    var vectors = _.map(oData.polygon, function(vertex) {
        return new SAT.Vector(vertex.x, vertex.y)
    });
    _.each(vectors, function(vector) {
        xs[xs.length] = vector.x;
        ys[ys.length] = vector.y;
    });

    var minX = _.min(xs);
    var minY = _.min(ys);
    var maxX = _.max(xs);
    var maxY = _.max(ys);
    var w = maxX - minX;
    var h = maxY - minY;

    var collisionPolygon = new SAT.Polygon(new SAT.Vector(oData.x, oData.y), vectors);

    var offsetX = (minX + w / 2);
    var offsetY = (minY + h / 2);

    var offset = new SAT.Vector(-offsetX, -offsetY);
    collisionPolygon.setOffset(offset);
    collisionPolygon.w = w;
    collisionPolygon.h = h;

    return collisionPolygon;
};

A_.POLYGON.Utils.SATPolygonToPIXIPolygon = function(SATPolygon, translated) {
    var calcPoints;
    if (translated) {
        calcPoints = _.map(SATPolygon.calcPoints,
                function(calcPoint) {
                    return calcPoint.clone().add(new SAT.Vector(SATPolygon.pos.x, SATPolygon.pos.y));
                });
    } else {
        calcPoints = _.map(SATPolygon.calcPoints,
                function(calcPoint) {
                    return calcPoint.clone();
                });
    }

    var calcPointsArr = _.reduce(calcPoints, function(points, vector) {
        return points.concat(_.reduce(vector, function(coords, point) {
            return coords.concat(point);
        }, []));
    }, []);
    calcPointsArr[calcPointsArr.length] = calcPointsArr[0];
    calcPointsArr[calcPointsArr.length] = calcPointsArr[1];
    return new PIXI.Polygon(calcPointsArr);
};

A_.POLYGON.Utils.drawSATPolygon = function(graphics, polygon) {
    var calcPointsArr = [];
    if (polygon.baked) {
        _.each(polygon.baked.points, function(point, i) {
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