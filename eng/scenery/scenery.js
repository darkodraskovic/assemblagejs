A_.SCENERY.TiledSprite = Class.extend({
    init: function (parent, props) {
        this.level = parent.level;
        this.parent = parent;

        for (var prop in props) {
            this[prop] = props[prop];
        }

        if (this.image) {
            this.image = "game/graphics/" + this.image;
        }
        var texture = new PIXI.Texture.fromImage(this.image);

        if (!this.width) {
            this.width = 512;
        }
        if (!this.height) {
            this.height = 512;
        }
        this.sprite = new PIXI.TilingSprite(texture, this.width, this.height);
        this.parent.addChild(this.sprite);
        this.spriteB = new PIXI.TilingSprite(texture, this.width, this.height);
        this.parent.addChild(this.spriteB);

        this.velocity = new SAT.Vector();
        if (!_.isNumber(this.velocityX)) {
            this.velocity.x = 0;
        } else {
            this.velocity.x = this.velocityX;
        }
        if (!_.isNumber(this.velocityY)) {
            this.velocity.y = 0;
        } else {
            this.velocity.y = this.velocityY;
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
        
        if (pos.x < 0) {
            pos.x = this.level.width;
        } else if (pos.x > this.level.width) {
            pos.x = 0;
        }
        if (pos.y < 0) {
            pos.y = this.level.height;
        } else if (pos.y > this.level.height) {
            pos.y = 0;
        }
        
        var posB = this.spriteB.position;
        posB.x = -this.width + pos.x;
        posB.y = pos.y;
    }
});


