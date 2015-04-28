A_.SPRITES.TilingSprite = Class.extend({
    init: function (parent, props) {
        for (var prop in props) {
            this[prop] = props[prop];
        }
        this.scene = parent.scene;
        
        var texture = new PIXI.Texture.fromImage(A_.CONFIG.directories.graphics + this.image);

        if (!this.width) {
            this.width = this.scene.getWidth();
        }
        if (!this.height) {
            this.height = this.scene.getHeight();
        }
        this.sprite = new PIXI.TilingSprite(texture, 2 * this.width, 2 * this.height);
        parent.addChild(this.sprite);
        this.position = this.sprite.position;

        if (!_.isObject(this.velocity)) {
            this.velocity = {x: 0, y: 0};
        }
        
        this.scene.spritesToCreate.push(this);
    },
    update: function () {
        var pos = this.position;
        
        pos.x += this.velocity.x * A_.game.dt;
        pos.y += this.velocity.y * A_.game.dt;
        
        if (pos.x > 0) 
            pos.x -= this.scene.getWidth();
        if (pos.y > 0) {
            pos.y -= this.scene.getHeight();
        }
    }
});


