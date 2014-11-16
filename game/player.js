var Anime = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "assets/Armor2Walk.png",
    frameW: 64,
    frameH: 64,
    walkAnimSpeed: 0.3,
    init: function () {
        this._super();

        this.sprite.interactive = true;
        var that = this;
        this.sprite.click = function (interactionData) {
            window.console.log(that.name + " clicked");
        }

        this.addAnimation("idle_up", [0], 1);
        this.addAnimation("idle_down", [18], 1);
        this.addAnimation("idle_left", [9], 1);
        this.addAnimation("idle_right", [27], 1);

        this.addAnimation("walk_up", A_.UTILITIES.arrayRange(1, 8), this.walkAnimSpeed);
        this.addAnimation("walk_down", A_.UTILITIES.arrayRange(19, 26), this.walkAnimSpeed);
        this.addAnimation("walk_left", A_.UTILITIES.arrayRange(10, 17), this.walkAnimSpeed);
        this.addAnimation("walk_right", A_.UTILITIES.arrayRange(28, 35), this.walkAnimSpeed);

        this.setAnimation("idle_down");
    },
    update: function () {
        this._super();

        if (this.state === "standing") {
            this.setAnimation("idle_" + this.direction);
        }
        else if (this.state === "moving") {
            this.setAnimation("walk_" + this.direction);
        }
    }
});

var Player = Anime.extend({
    animSheet: "assets/Armor2Walk.png"
});
//var Agent = A_.SPRITES.ArcadeSprite.extend({
//    animSheet: "assets/AgentWalk.png"
//})
var Agent = A_.SPRITES.AnimatedSprite.extend({
    frameW: 64,
    frameH: 64,
    collisionW: 26,
    collisionH: 48,
    collisionOffsetX: 0,
    collisionOffsetY: 6,
    animSheet: "assets/AgentWalk.png"
})