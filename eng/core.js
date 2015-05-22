var DODO = {};

(function () {
    'use strict';
    var initializing = false, fnTest = /xyz/.test(function () {
        xyz;
    }) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
//    this.Class = function () {
    DODO.Class = function () {
    };

    var inject = DODO.Class.inject = function (prop) {
        var proto = this.prototype;
        var _super = {};
        // TODO: rewrite this function to be consistent with ternary operator
        for (var name in prop) {
            if (
                    typeof (prop[name]) === "function" &&
                    typeof (proto[name]) === "function" &&
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

    // Create a new Class that inherits from this class
    var extend = DODO.Class.extend = function (prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] === "function" &&
                    typeof _super[name] === "function" && fnTest.test(prop[name]) ?
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
        Class.extend = extend;
        Class.inject = inject;

        return Class;
    };
})();

// JS EXTENSIONS
Number.prototype.map = function (istart, istop, ostart, ostop) {
    return ostart + (ostop - ostart) * ((this - istart) / (istop - istart));
};

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

Number.prototype.floor = function () {
    return Math.floor(this);
};

Number.prototype.ceil = function () {
    return Math.ceil(this);
};

Number.prototype.toInt = function () {
    return (this | 0);
};

Number.prototype.round = function (precision) {
    precision = Math.pow(10, precision || 0);
    return Math.round(this * precision) / precision;
};

Number.prototype.sin = function () {
    return Math.sin(this);
};

Number.prototype.cos = function () {
    return Math.cos(this);
};

Number.prototype.abs = function () {
    return Math.abs(this);
};

DODO.angleTo = function (pos1, pos2) {
    return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
};

DODO.distanceTo = function (pos1, pos2) {
    var xd = pos2.x - pos1.x;
    var yd = pos2.y - pos1.y;
    return Math.sqrt(xd * xd + yd * yd);
};

// OBJECT manipulation utils
DODO.copy = function (object) {
    if (
            !object || typeof (object) !== 'object' ||
            object instanceof HTMLElement ||
            object instanceof Class
            ) {
        return object;
    }
    else if (object instanceof Array) {
        var c = [];
        for (var i = 0, l = object.length; i < l; i++) {
            c[i] = DODO.copy(object[i]);
        }
        return c;
    }
    else {
        var c = {};
        for (var i in object) {
            c[i] = DODO.copy(object[i]);
        }
        return c;
    }
};

// remove all own properties on obj,
// effectively reverting it to a new object
DODO.wipe = function (obj)
{
    for (var p in obj)
    {
        if (obj.hasOwnProperty(p))
            delete obj[p];
    }
};

// CONSTANTS
DODO.Colors = {
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

