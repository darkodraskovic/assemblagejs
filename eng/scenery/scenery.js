A_.SCENERY.TiledSprite = Class.extend({
    init: function (parent, props) {
        this.scene = parent.scene;
        this.parent = parent;

        for (var prop in props) {
            this[prop] = props[prop];
        }

        if (this.image) {
            this.image = A_.CONFIG.directories.graphics + this.image;
        }
        var texture = new PIXI.Texture.fromImage(this.image);

        if (!this.width) {
            this.width = 512;
        }
        if (!this.height) {
            this.height = 512;
        }
        this.sprite = new PIXI.TilingSprite(texture, 2 * this.width, 2 * this.height);
        this.parent.addChild(this.sprite);

        if (!_.isObject(this.velocity)) {
            this.velocity = {x: 0, y: 0};
        }
    },
    setPosition: function (x, y) {
        this.sprite.position.x = x;
        this.sprite.position.y = y;
    },
    update: function () {
        var pos = this.sprite.position;
        
        pos.x += this.velocity.x * A_.game.dt;
        pos.y += this.velocity.y * A_.game.dt;
        
        if (pos.x > 0) 
            pos.x -= this.scene.getWidth();
        if (pos.y > 0) {
            pos.y -= this.scene.getHeight();
        }
    }
});


