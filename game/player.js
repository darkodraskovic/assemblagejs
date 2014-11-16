var Anime = A_.SPRITES.ArcadeSprite.extend({
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

        this.addAnimation("moving_up", A_.UTILITIES.arrayRange(1, 8), this.walkAnimSpeed);
        this.addAnimation("moving_down", A_.UTILITIES.arrayRange(19, 26), this.walkAnimSpeed);
        this.addAnimation("moving_left", A_.UTILITIES.arrayRange(10, 17), this.walkAnimSpeed);
        this.addAnimation("moving_right", A_.UTILITIES.arrayRange(28, 35), this.walkAnimSpeed);

        this.setAnimation("moving_right");
    },
    update: function () {
        this._super();

        this.setAnimation(this.motionState + "_" + this.simpleDir);
    }
});

var Player = Anime.extend({
    animSheet: "assets/Armor2Walk.png",
});

//var Agent = A_.SPRITES.ArcadeSprite.extend({
//    animSheet: "assets/AgentWalk.png"
//})

var Agent = Anime.extend({
//var Agent = Anime.extend({
    frameW: 64,
    frameH: 64,
    collisionW: 26,
    collisionH: 48,
    collisionOffsetX: 0,
    collisionOffsetY: 6,
    animSheet: "assets/AgentWalk.png",
    timer: 0,
    init: function () {
        this._super();
        this.maxVelocity = new SAT.Vector(64, 64);
    },
    update: function () {
        this.timer += game.dt;
        if (this.timer > 2) {
            this.timer = 0;
            this.cardinalDir = _.sample(this.cardinalDirs);
        }

        this._super();
    },
//    collideWithStatic: function (other, response) {
//        this._super(other, response);
//        this.cardinalDir = "";
//        this.timer = 1;
//    }
})