DODO.Tiling = PIXI.extras.TilingSprite.extend({
    init: function (parent, props, w, h) {
        _.extend(this, props);
        
        this.scene = parent.scene;
        PIXI.extras.TilingSprite.call(this, DODO.getAsset(this.image),
                w  || this.scene.playgroundWidth * 2, h || this.scene.playgroundHeight * 2);
                
        parent.addChild(this);

        if (!_.isObject(this.velocity)) {
            this.velocity = {x: 0, y: 0};
        }

        this.scene.spritesToCreate.push(this);
    },
    update: function () {
        var pos = this.position;

        pos.x += this.velocity.x * DODO.game.dt;
        pos.y += this.velocity.y * DODO.game.dt;

        if (pos.x > 0)
            pos.x -= this.scene.playgroundWidth;
        if (pos.y > 0) {
            pos.y -= this.scene.playgroundHeight;
        }
    }
});
