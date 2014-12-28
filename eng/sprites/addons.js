/******************************************************************************/
/* EXTENSIONS */
/******************************************************************************/
A_.EXTENSIONS.Polygon = {
    addTo: function (sprite, pixiPolygon) {
        var graphics = new PIXI.Graphics();
//        sprite.graphics.beginFill(0xFFFF00);
        graphics.lineStyle(4, 0x00FF00);
        graphics.drawPolygon(pixiPolygon.points);

        sprite.sprite.addChild(graphics);
        sprite.graphics = graphics;
    }
};

A_.SPRITES.ADDONS = {};

/* 
 * TEMPLATE *
 A_.SPRITES.ADDONS.pinTo = Class.extend({
 init: function (sprite, props) {
 if (props) {
 for (var prop in props) {
 this[prop] = props[prop];
 }
 }
 this.sprite = sprite;
 this.active = true;
 
 },
 on: function () {
 this.reset();
 },
 off: function () {
 
 },
 reset: function () {
 
 },
 update: function () {
 
 }
 });
 */

A_.SPRITES.ADDONS.PinTo = Class.extend({
    // props: {name: "name", parent: parent, offsetX: 0, offsetY: 0}
    init: function (sprite, props) {
        if (props) {
            for (var prop in props) {
                this[prop] = props[prop];
            }
        }
        this.sprite = sprite;
        this.active = true;

        if (typeof this.offsetX === "undefined") {
            this.offsetX = 0;
        }
        if (typeof this.offsetY === "undefined") {
            this.offsetY = 0;
        }
        this.spritePoint = this.parent.spritePoint(this.name, this.offsetX, this.offsetY);
    },
    off: function () {

    },
    on: function () {
        this.reset();
    },
    reset: function () {

    },
    update: function () {
        this.sprite.rotation(this.parent.rotation());
        this.sprite.position(this.spritePoint.x(), this.spritePoint.y());
    }
});

A_.SPRITES.ADDONS.Sine = Class.extend({
    angle: 0,
    positive: true,
    valueDiff: 0,
    init: function (sprite, props) {
        if (props) {
            for (var prop in props) {
                this[prop] = props[prop];
            }
        }
        this.sprite = sprite;
        this.active = true;

        if (typeof this.amplitude === "undefined")
            this.amplitude = 12; // in units (pixels, scale, etc.)
        if (typeof this.amplitudeRand === "undefined")
            this.amplitudeRand = 0; // in %
        this.currentAmplitude = this.amplitude;

        if (typeof this.period === "undefined")
            this.period = 2; // in sec
        if (typeof this.periodRand === "undefined")
            this.periodRand = 0; // in %
        this.currentPeriod = this.period;
        this.speed = (2 * Math.PI) / this.period;

        this.value = 0;

    },
    on: function () {
        this.reset();
    },
    off: function () {

    },
    reset: function () {
        this.onPeriodStart();
        this.positive = true;

        var periodRand = _.random(-this.periodRand, this.periodRand);
        if (periodRand)
            periodRand /= 100;
        this.currentPeriod = this.period + this.period * periodRand;
        this.speed = (2 * Math.PI) / this.currentPeriod;

        var valueRand = _.random(-this.amplitudeRand, this.amplitudeRand);
        if (valueRand)
            valueRand /= 100;
        this.currentAmplitude = this.amplitude + this.amplitude * valueRand;
    },
    update: function () {
        var sin = Math.sin(this.angle += this.speed * A_.game.dt);

        if (sin < 0) {
            this.positive = false;
        }
        else if (sin > 0) {
            if (!this.positive) { // The new period begins...
                this.reset();
            }
        }
        this.value = this.currentAmplitude * sin;
    },
    onPeriodStart: function () {

    }
});

