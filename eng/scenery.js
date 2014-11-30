A_.SCENERY.TiledSprite = Class.extend({
    init: function (props) {
        for (var prop in props) {
            this[prop] = props[prop];
        }

        if (this.image) {
            this.image = "graphics/" + A_.level.directoryPrefix + this.image;
        }
        var texture = new PIXI.Texture.fromImage(this.image);
        this.sprite = new PIXI.TilingSprite(texture, this.width, this.height);
    },
    setPosition: function (x, y) {
        this.position.x = x;
        this.position.y = y;
    }
});


