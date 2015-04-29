// SAT EXTENSION
DODO.Polygon = function () {
    SAT.Polygon.apply(this, arguments);
    DODO._initPolygon(this);
};
DODO.Polygon.prototype = Object.create(SAT.Polygon.prototype);
DODO.Polygon.prototype.constructor = DODO.Polygon;

DODO.Box = function () {
    SAT.Box.apply(this, arguments);
};

DODO.Box.prototype = Object.create(SAT.Box.prototype);
DODO.Box.prototype.constructor = DODO.Box;
DODO.Box.prototype.toPolygon = function () {
    var polygon = SAT.Box.prototype.toPolygon.apply(this, arguments);
    DODO._initPolygon(polygon);
    return polygon;
};

DODO._initPolygon = function (polygon) {
    polygon.scale = new SAT.Vector(1, 1);
    polygon.calcBounds();
}

SAT.Polygon.prototype.applyScale = function () {
    this.scale.x = this.scale.y = 1;
};

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
    this._recalc();
    this.calcBounds();
};

SAT.Polygon.prototype.setScaleX = function (x) {
    var relScaleX = x / this.scale.x;
    this.scale.x = x;

    _.each(this.points, function (point) {
        return point.x *= relScaleX;
    }, this);

    this.w *= relScaleX;

    this.offset.x *= relScaleX;
    this._recalc();
    this.calcBounds();

};
SAT.Polygon.prototype.setScaleY = function (y) {
    var relScaleY = y / this.scale.y;
    this.scale.y = y;

    _.each(this.points, function (point) {
        return point.y *= relScaleY;
    }, this);

    this.h *= relScaleY;

    this.offset.y *= relScaleY;
    this._recalc();
    this.calcBounds();
};

SAT.Polygon.prototype.getLeft = function () {
    return this.getCenterX() - this.wHalf;
};
SAT.Polygon.prototype.getRight = function () {
    return this.getCenterX() + this.wHalf;
};
SAT.Polygon.prototype.getTop = function () {
    return this.getCenterY() - this.hHalf;
};
SAT.Polygon.prototype.getBottom = function () {
    return this.getCenterY() + this.hHalf;
};
SAT.Polygon.prototype.getCenterX = function () {
    return this.pos.x + this.centerOffsetX;
};
SAT.Polygon.prototype.getCenterY = function () {
    return this.pos.y + this.centerOffsetY;
};

SAT.Polygon.prototype.getWidth = function () {
    return this.w;
};

SAT.Polygon.prototype.getHeight = function () {
    return this.h;
};

SAT.Polygon.prototype.calcBounds = function () {
    var xs = [];
    var ys = [];

    _.each(this.calcPoints, function (point) {
        xs[xs.length] = point.x;
        ys[ys.length] = point.y;
    });

    this.minX = _.min(xs);
    this.minY = _.min(ys);
    this.maxX = _.max(xs);
    this.maxY = _.max(ys);
    this.w = this.maxX - this.minX;
    this.h = this.maxY - this.minY;
    this.wHalf = this.w/2;
    this.hHalf = this.h/2;
    this.centerOffsetX = this.maxX - this.w / 2;
    this.centerOffsetY = this.maxY - this.h / 2;
};

SAT.Polygon.prototype.clone = function () {
    var points = _.map(this.points,
            function (point) {
                return point.clone();
            });
    var polygon = new DODO.Polygon(this.pos.clone(), points);
//    polygon.setAngle(this.angle);
//    polygon.setOffset(this.offset.clone());
//    polygon.calcBounds();
    return polygon;
};
// ENGINE polygon UTILS
DODO.TiledPolygonToPIXIPolygon = function (tiledPolygon) {
    var points = [];
    for (var i = 0; i < tiledPolygon.length; i++) {
        points [2 * i] = tiledPolygon[i].x;
        points [2 * i + 1] = tiledPolygon[i].y;
    }
    return new PIXI.Polygon(points);
};

DODO.TiledPolygonToSATPolygon = function (oData, mapData) {
    var vectors = _.map(oData.polygon, function (vertex) {
        return new SAT.Vector(vertex.x, vertex.y);
    });

    if (mapData.orientation === "isometric") {
        for (var i = 0; i < vectors.length; i++) {
            var vector = vectors[i];
            // Tiled gives an equal value to a tile width and height in isometric maps, ie.
            // tilewidth = tileheight (w gets the value of h). We devide x and y to get ortho map coordinates,
            // and afterwards transform them in iso screen/level coordinates.
            var x = vector.x / mapData.tileheight; // get ortho map coordinates
            var y = vector.y / mapData.tileheight;
            vector.x = (x - y) * (mapData.tilewidth / 2);   // transform them into iso (x,y part) level coords (tile dim part)
            vector.y = (x + y) * (mapData.tileheight / 2);
        }
    }
    return new DODO.Polygon(new SAT.Vector(oData.x, oData.y), vectors);
};

DODO.SATPolygonToPIXIPolygon = function (SATPolygon) {
    var calcPoints = _.map(SATPolygon.calcPoints,
            function (calcPoint) {
                return calcPoint.clone();
            });

    var calcPointsArr = _.reduce(calcPoints, function (points, vector) {
        return points.concat(_.reduce(vector, function (coords, point) {
            return coords.concat(point);
        }, []));
    }, []);
    calcPointsArr[calcPointsArr.length] = calcPointsArr[0];
    calcPointsArr[calcPointsArr.length] = calcPointsArr[1];

    return new PIXI.Polygon(calcPointsArr);
};

DODO.drawPolygon = function (graphics, polygon, props) {
    if (!_.isObject(props)) {
        props = {};        
    }
    graphics.clear();
    graphics.beginFill(props.fillColor || DODO.Colors.violet, props.fillAlpha || 0.5);
    graphics.lineStyle(props.lineWidth || 2, props.lineColor || DODO.Colors.green, props.lineAlpha || 0.67);
    graphics.drawPolygon(polygon.points);
    graphics.endFill();
};
