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
    this._recalc();
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
    this._recalc();

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
    this._recalc();
};

SAT.Polygon.prototype.getLeft = function () {
    return this.pos.x + this.minX;
};
SAT.Polygon.prototype.getRight = function () {
    return this.pos.x + this.maxX;
};
SAT.Polygon.prototype.getTop = function () {
    return this.pos.y + this.minY;
};
SAT.Polygon.prototype.getBottom = function () {
    return this.pos.y + this.maxY;
};
SAT.Polygon.prototype.getCenterX = function () {
    return this.pos.x + (this.maxX - this.minX) / 2;
};
SAT.Polygon.prototype.getCenterY = function () {
    return this.pos.y + (this.maxY - this.minY) / 2;
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
};

// ENGINE polygon UTILS
A_.POLYGON.Utils = {};

A_.POLYGON.Utils.TiledPolygonToSATPolygon = function (oData) {
    var vectors = _.map(oData.polygon, function (vertex) {
        return new SAT.Vector(vertex.x, vertex.y);
    });

    var SATPolygon = new SAT.Polygon(new SAT.Vector(oData.x, oData.y), vectors);
    SATPolygon.calcBounds();

    var offsetX = (SATPolygon.minX + SATPolygon.w / 2);
    var offsetY = (SATPolygon.minY + SATPolygon.h / 2);
    var offset = new SAT.Vector(-offsetX, -offsetY);
    SATPolygon.setOffset(offset);

    return SATPolygon;
};

A_.POLYGON.Utils.SATPolygonToPIXIPolygon = function (SATPolygon, translated) {
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

A_.POLYGON.Utils.drawSATPolygon = function (graphics, SATPolygon, props) {
    var calcPointsArr = [];
    if (SATPolygon.baked) {
        _.each(SATPolygon.baked.points, function (point, i) {
            calcPointsArr[i] = point;
        });
    } else {
        calcPointsArr = (this.SATPolygonToPIXIPolygon(SATPolygon, true)).points;
    }

    if (_.isUndefined(props)) {
        props = {};
        props.lineWidth = 2;
        props.lineColor = A_.UTILS.Colors.green;
        props.lineAlpha = 0.67;
        props.fillColor = A_.UTILS.Colors.violet;
        props.fillAlpha = 0.5;
    }
    graphics.beginFill(props.fillColor, props.fillAlpha);
    graphics.lineStyle(props.lineWidth, props.lineColor, props.lineAlpha);
    graphics.drawPolygon(calcPointsArr);
    graphics.endFill();
};

A_.UTILS.Colors = {
    'aliceblue': '0xF0F8FF',
    'antiquewhite': '0xFAEBD7',
    'aquamarine': '0x7FFFD4',
    'azure': '0xF0FFFF',
    'beige': '0xF5F5DC',
    'bisque': '0xFFE4C4',
    'black': '0x000000',
    'blanchedalmond': '0xFFEBCD',
    'blue': '0x0000FF',
    'blueviolet': '0x8A2BE2',
    'brown': '0xA52A2A',
    'burlywood': '0xDEB887',
    'cadetblue': '0x5F9EA0',
    'chartreuse': '0x7FFF00',
    'chocolate': '0xD2691E',
    'coral': '0xFF7F50',
    'cornflowerblue': '0x6495ED',
    'cornsilk': '0xFFF8DC',
    'cyan': '0x00FFFF',
    'darkgoldenrod': '0xB8860B',
    'darkgreen': '0x006400',
    'darkkhaki': '0xBDB76B',
    'darkolivegreen': '0x556B2F',
    'darkorange': '0xFF8C00',
    'darkorchid': '0x9932CC',
    'darksalmon': '0xE9967A',
    'darkseagreen': '0x8FBC8F',
    'darkslateblue': '0x483D8B',
    'darkslategray': '0x2F4F4F',
    'darkturquoise': '0x00CED1',
    'darkviolet': '0x9400D3',
    'deeppink': '0xFF1493',
    'deepskyblue': '0x00BFFF',
    'dimgray': '0x696969',
    'dodgerblue': '0x1E90FF',
    'firebrick': '0xB22222',
    'floralwhite': '0xFFFAF0',
    'forestgreen': '0x228B22',
    'gainsboro': '0xDCDCDC',
    'ghostwhite': '0xF8F8FF',
    'gold': '0xFFD700',
    'goldenrod': '0xDAA520',
    'gray': '0x808080',
    'green': '0x008000',
    'greenyellow': '0xADFF2F',
    'honeydew': '0xF0FFF0',
    'hotpink': '0xFF69B4',
    'indianred': '0xCD5C5C',
    'ivory': '0xFFFFF0',
    'khaki': '0xF0E68C',
    'lavender': '0xE6E6FA',
    'lavenderblush': '0xFFF0F5',
    'lawngreen': '0x7CFC00',
    'lemonchiffon': '0xFFFACD',
    'lightblue': '0xADD8E6',
    'lightcoral': '0xF08080',
    'lightcyan': '0xE0FFFF',
    'lightgoldenrod': '0xEEDD82',
    'lightgoldenrodyellow': '0xFAFAD2',
    'lightgray': '0xD3D3D3',
    'lightpink': '0xFFB6C1',
    'lightsalmon': '0xFFA07A',
    'lightseagreen': '0x20B2AA',
    'lightskyblue': '0x87CEFA',
    'lightslate': '0x8470FF',
    'lightslategray': '0x778899',
    'lightsteelblue': '0xB0C4DE',
    'lightyellow': '0xFFFFE0',
    'limegreen': '0x32CD32',
    'linen': '0xFAF0E6',
    'magenta': '0xFF00FF',
    'maroon': '0xB03060',
    'mediumaquamarine': '0x66CDAA',
    'mediumblue': '0x0000CD',
    'mediumorchid': '0xBA55D3',
    'mediumpurple': '0x9370DB',
    'mediumseagreen': '0x3CB371',
    'mediumslateblue': '0x7B68EE',
    'mediumspringgreen': '0x00FA9A',
    'mediumturquoise': '0x48D1CC',
    'mediumviolet': '0xC71585',
    'midnightblue': '0x191970',
    'mintcream': '0xF5FFFA',
    'mistyrose': '0xFFE4E1',
    'moccasin': '0xFFE4B5',
    'navajowhite': '0xFFDEAD',
    'navy': '0x000080',
    'oldlace': '0xFDF5E6',
    'olivedrab': '0x6B8E23',
    'orange': '0xFFA500',
    'orangered': '0xFF4500',
    'orchid': '0xDA70D6',
    'palegoldenrod': '0xEEE8AA',
    'palegreen': '0x98FB98',
    'paleturquoise': '0xAFEEEE',
    'palevioletred': '0xDB7093',
    'papayawhip': '0xFFEFD5',
    'peachpuff': '0xFFDAB9',
    'peru': '0xCD853F',
    'pink': '0xFFC0CB',
    'plum': '0xDDA0DD',
    'powderblue': '0xB0E0E6',
    'purple': '0xA020F0',
    'red': '0xFF0000',
    'rosybrown': '0xBC8F8F',
    'royalblue': '0x4169E1',
    'saddlebrown': '0x8B4513',
    'salmon': '0xFA8072',
    'sandybrown': '0xF4A460',
    'seagreen': '0x2E8B57',
    'seashell': '0xFFF5EE',
    'sienna': '0xA0522D',
    'skyblue': '0x87CEEB',
    'slateblue': '0x6A5ACD',
    'slategray': '0x708090',
    'snow': '0xFFFAFA',
    'springgreen': '0x00FF7F',
    'steelblue': '0x4682B4',
    'tan': '0xD2B48C',
    'thistle': '0xD8BFD8',
    'tomato': '0xFF6347',
    'turquoise': '0x40E0D0',
    'violet': '0xEE82EE',
    'violetred': '0xD02090',
    'wheat': '0xF5DEB3',
    'white': '0xFFFFFF',
    'whitesmoke': '0xF5F5F5',
    'yellow': '0xFFFF00',
    'yellowgreen': '0x9ACD32'
};