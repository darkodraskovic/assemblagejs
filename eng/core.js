var A_ = {};
A_.UTILS = {};
A_.SPRITES = {};
A_.TILES = {};
A_.SCENERY = {};
A_.MODULES = {};
A_.INPUT = {};
A_.CONFIG = {};

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

A_.UTILS.copy = function (object) {
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
};

// remove all own properties on obj,
// effectively reverting it to a new object
A_.UTILS.wipe = function (obj)
{
    for (var p in obj)
    {
        if (obj.hasOwnProperty(p))
            delete obj[p];
    }
};

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
