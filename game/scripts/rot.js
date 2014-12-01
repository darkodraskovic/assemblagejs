var Ball = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "ball.png",
    collisionResponse: "dynamic",
    update: function () {
        this._super();
    }
});

Ball.inject(A_.MODULES.Topdown);
Ball.inject(A_.MODULES.TopdownWASD);