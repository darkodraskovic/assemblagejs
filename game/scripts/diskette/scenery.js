var ScenerySun = A_.SPRITES.Sprite.extend({
    spriteSheet: "diskette/moon.png",
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        var sineProps = {period: 1, periodRand: 50, amplitude: 0.012, amplitudeRand: 50};
        this.sine = this.addon("Sine", sineProps);
    },
    update: function () {
        this.sine.update();
        this.setScaleX(1 + this.sine.value);
        this.setScaleY(1 + this.sine.value);
    }
});

var SceneryStar = A_.SPRITES.Sprite.extend({
    spriteSheet: "diskette/star.png",
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        var sineProps = {period: 0.5, periodRand: 25, amplitude: 0.1, amplitudeRand: 50};
        this.sine = this.addon("Sine", sineProps);
    },
    update: function () {
        this.sine.update();
        this.setScaleX(1 + this.sine.value);
        this.setScaleY(1 + this.sine.value);
    }
});
var SceneryPyramid = A_.SPRITES.Sprite.extend({
    spriteSheet: "diskette/pyramid.png",
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.setOrigin(1, 0);
    }
});