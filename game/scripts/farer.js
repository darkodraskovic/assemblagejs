var Ship = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "player.png",
    collisionResponse: "dynamic",
    update: function () {
        this._super();
//        window.console.log(this.velocity);
    }
});

Ship.inject(A_.MODULES.Topdown);
Ship.inject(A_.MODULES.TopdownWASD);