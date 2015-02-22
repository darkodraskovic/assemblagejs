var SceneryPyramid = A_.SPRITES.Sprite.extend({
    spriteSheet: "diskette/pyramid.png",
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.setOrigin(1, 0);
    }
});
var ScenerySun = A_.SPRITES.Sprite.extend({
    spriteSheet: "diskette/moon.png",
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
    }
});