A_.SPRITES.Addons = {};

A_.SPRITES.Addons.PinTo = Class.extend({
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
        this.spritePoint = this.parent.setSpritePoint(this.name, this.offsetX, this.offsetY);
    },
    update: function () {
        this.sprite.setRotation(this.parent.getRotation());
        this.sprite.setPosition(this.spritePoint.getX(), this.spritePoint.getY());
    }
});

A_.SPRITES.Addons.Sine = Class.extend({
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
    reset: function () {
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
    }
});
