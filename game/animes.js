var Anime = A_.SPRITES.ArcadeSprite.extend({
    frameW: 64,
    frameH: 64,
    animSpeed: 0.3,
    alive: true,
    facing: "right",
    bounciness: 0,
    collides: true,
    init: function (props) {
        this._super(props);

        this.addAnimation("idle_up", [0], 1);
        this.addAnimation("idle_down", [18], 1);
        this.addAnimation("idle_left", [9], 1);
        this.addAnimation("idle_right", [27], 1);

        this.addAnimation("moving_up", _.range(1, 9), this.animSpeed);
        this.addAnimation("moving_down", _.range(19, 27), this.animSpeed);
        this.addAnimation("moving_left", _.range(10, 18), this.animSpeed);
        this.addAnimation("moving_right", _.range(28, 36), this.animSpeed);

        this.addAnimation("death", _.range(36, 42), this.animSpeed);
        this.animations["death"].loop = false;

        var that = this;
        this.animations["death"].onComplete = function () {
            that.destroy();
        };
    },
    update: function () {
        this._super();

        if (this.alive) {
            this.setAnimation(this.motionState + "_" + this.facing);
        }
        else {
            this.setAnimation("death");
        }
    }
});

var Player = Anime.extend({
    animSheet: "assets/PlayerComplete.png",
    init: function (props) {
        this._super(props);
        var that = this;
        game.stage.click = function () {
            that.shoot();
        };
    },
    update: function () {
        var rot = (A_.UTILS.angleTo(this.getPosition(), game.gameWorld.mousePosition)).toDeg();
        if (rot >= -45 && rot < 45) {
            this.facing = "right"
        } else if (rot >= 45 && rot < 135) {
            this.facing = "down"
        } else if (rot > 135 || rot <= -135) {
            this.facing = "left"
        } else
            this.facing = "up";

        this._super();

    },
    shoot: function () {
        var pos = this.getPosition();
        var bullet = game.createSprite(Bullet, this.layer, pos.x, pos.y + 8);
        bullet.rotation = A_.UTILS.angleTo(this.getPosition(), game.gameWorld.mousePosition);
        bullet.setAnimation("all", 16, 0);
        bullet.velocity.y = bullet.speed * Math.sin(bullet.rotation);
        bullet.velocity.x = bullet.speed * Math.cos(bullet.rotation);
    }
});

var Agent = Anime.extend({
    frameW: 64,
    frameH: 64,
    collisionW: 26,
    collisionH: 48,
    collisionOffsetX: 0,
    collisionOffsetY: 6,
    animSheet: "assets/AgentComplete.png",
    timer: 0,
    collisionType: "dynamic",
    init: function (props) {
        this._super(props);
        this.maxVelocity = new SAT.Vector(64, 64);
        this.motionState = "moving";
        this.timer = 2;
    },
    update: function () {
        if (this.alive) {
            if (this.cardinalContains("N")) {
                this.facing = "up";
            }
            if (this.cardinalContains("S")) {
                this.facing = "down";
            }
            if (this.cardinalContains("W")) {
                this.facing = "left";
            }
            if (this.cardinalContains("E")) {
                this.facing = "right";
            }
            this.timer += game.dt;
            if (this.timer > 2) {
                this.timer = 0;
                this.cardinalDir = _.sample(this.cardinalDirs);
            }
        }
        this._super();
    }
});