var A_ = {};

/** Converts numeric degrees to radians */
if (typeof (Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    };
}

/** Converts numeric radians to degrees */
if (typeof (Number.prototype.toDeg) === "undefined") {
    Number.prototype.toDeg = function () {
        return this * 180 / Math.PI;
    };
}

if (typeof (Number.prototype.clamp) === "undefined") {
    Number.prototype.clamp = function (min, max) {
        return Math.min(max, Math.max(min, this));
    };
}

if (typeof (Number.prototype.lerp) === "undefined") {
    Number.prototype.lerp = function (a, b) {
        return a + this * (b - a);
    };
}

A_.UTILS = {};

A_.UTILS.angleTo = function (pos1, pos2) {
    return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
};

A_.UTILS.distanceToPos = function (pos1, pos2) {
    var xd = pos2.x - pos1.x;
    var yd = pos2.y - pos2.y;
    return Math.sqrt(xd * xd + yd * yd);
};
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype

// TODO: rewrite this function to be consistent with ternary operator
var inject = function (prop) {
    fnTest = /xyz/.test(function () {
        xyz;
    }) ? /\b_super\b/ : /.*/;
    var proto = this.prototype;
    var _super = {};
    for (var name in prop) {
        if (
                typeof (prop[name]) == "function" &&
                typeof (proto[name]) == "function" &&
                fnTest.test(prop[name])
                ) {
            _super[name] = proto[name]; // save original function
            proto[name] = (function (name, fn) {
                return function () {
                    var tmp = this._super;
                    this._super = _super[name];
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;
                    return ret;
                };
            })(name, prop[name]);
        }
        else {
            proto[name] = prop[name];
        }
    }
};

(function () {
    var initializing = false, fnTest = /xyz/.test(function () {
        xyz;
    }) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function () {
    };

    // Create a new Class that inherits from this class
    Class.extend = function (prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                    typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                    (function (name, fn) {
                        return function () {
                            var tmp = this._super;

                            // Add a new ._super() method that is the same method
                            // but on the super-class
                            this._super = _super[name];

                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;

                            return ret;
                        };
                    })(name, prop[name]) :
                    prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;
        Class.inject = inject;

        return Class;
    };
})();


A_.copy = function (object) {
    if (
            !object || typeof (object) != 'object' ||
            object instanceof HTMLElement ||
            object instanceof Class
            ) {
        return object;
    }
    else if (object instanceof Array) {
        var c = [];
        for (var i = 0, l = object.length; i < l; i++) {
            c[i] = A_.copy(object[i]);
        }
        return c;
    }
    else {
        var c = {};
        for (var i in object) {
            c[i] = A_.copy(object[i]);
        }
        return c;
    }
}

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


A_.SPRITES = {};
A_.MODULES = {};