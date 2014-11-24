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

Anime.inject(A_.MODULES.Topdown);

var Player = Anime.extend({
    animSheet: "PlayerComplete.png",
    collisionResponse: "active",
    collisionType: A_.COLLISION.Type.PLAYER,
    collidesWith: A_.COLLISION.Type.ENEMY | A_.COLLISION.Type.ITEM,
    init: function (props) {
        this._super(props);
    },
    update: function () {
        var rot = (A_.UTILS.angleTo(this.getPosition(), A_.game.mousePosition.level)).toDeg();
        if (rot >= -45 && rot < 45) {
            this.facing = "right"
        } else if (rot >= 45 && rot < 135) {
            this.facing = "down"
        } else if (rot > 135 || rot <= -135) {
            this.facing = "left"
        } else
            this.facing = "up";

        if (A_.game.leftpressed) {
            this.shoot();
        }
        this._super();

    },
    shoot: function () {
        var pos = this.getPosition();
        var bullet = A_.game.createSprite(Bullet, this.layer, pos.x, pos.y + 8);
        bullet.rotation = A_.UTILS.angleTo(this.getPosition(), A_.game.mousePosition.level);
        bullet.setAnimation("all", 16, 0);
        bullet.velocity.y = bullet.speed * Math.sin(bullet.rotation);
        bullet.velocity.x = bullet.speed * Math.cos(bullet.rotation);
    }
});

Player.inject(A_.MODULES.TopdownWASD);

var Agent = Anime.extend({
    frameW: 64,
    frameH: 64,
    collisionW: 26,
    collisionH: 48,
    collisionOffsetX: 0,
    collisionOffsetY: 6,
    animSheet: "AgentComplete.png",
    timer: 0,
    collisionResponse: "passive",
    collisionType: A_.COLLISION.Type.ENEMY,
    collidesWith: A_.COLLISION.Type.FRIENDLY_FIRE,
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
            this.timer += A_.game.dt;
            if (this.timer > 2) {
                this.timer = 0;
                this.cardinalDir = _.sample(this.cardinalDirs);
            }
        }
        this._super();
    }
});