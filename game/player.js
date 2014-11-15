var Player = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "assets/ball.png",
    frameW: 48,
    frameH: 48,
    init: function () {
        this._super();
        
        this.sprite.interactive = true;
        var that = this;
        this.sprite.click = function (interactionData) {
            window.console.log(that.name + " clicked");
        }
    },
});