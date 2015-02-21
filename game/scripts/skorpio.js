// CLASSES
var AnimeSkorpio = A_.SPRITES.Topdown.extend({
    frameWidth: 64,
    frameHeight: 64,
    collisionResponse: "active",
    collisionOffsetY: 6,
    collisionWidth: 26,
    collisionHeight: 48,
    animSpeed: 0.15,
    alive: true,
    facing: "right",
    collides: true,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = this.friction.y = 32;

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
        if (this.alive) {
            this.setAnimation(this.motionState + "_" + this.facing);
        }
        else {
            if (!this.groaned) {
                var sound = this.level.createSound({
                    urls: ['grunt.wav'],
                    volume: 0.5
                })
                sound.play();
                this.groaned = true;
            }
            this.setAnimation("death");
        }

        this._super();
    }
});

var PlayerSkorpio = AnimeSkorpio.extend({
    spriteSheet: "player_skorpio.png",
    collisionType: A_.COLLISION.Type.PLAYER,
    collidesWith: A_.COLLISION.Type.ENEMY | A_.COLLISION.Type.ITEM,
    controlled: true,
    followee: true,
    player: true,
    mass: 4,
    init: function (parent, x, y, props) {
        this.collisionResponse = "active";
        this._super(parent, x, y, props);
        this.maxVelocity = new SAT.Vector(256, 256);
        this.force = new SAT.Vector(512, 512);
        this.rifle = this.level.createSprite(Rifle, this.layer,
                this.getX(), this.getY(),
                {holder: this, animSpeed: this.animSpeed});
    },
    update: function () {
        var rot = (A_.UTILS.angleTo(this.getPosition(), this.level.getMousePosition())).toDeg();
        if (rot >= -45 && rot < 45) {
            this.facing = "right";
        } else if (rot >= 45 && rot < 135) {
            this.facing = "down";
        } else if (rot > 135 || rot <= -135) {
            this.facing = "left";
        } else
            this.facing = "up";

//        window.console.log("updt skorpio");

        if (this.level.leftpressed) {
            this.shootBullet();
        }
        if (this.level.rightpressed) {
            this.shootLaser();
        }
        this._super();

    },
    shootBullet: function () {
        var sprPt = this.rifle.spritePoint(this.facing);
        var bullet = this.level.createSprite(Bullet, this.level.findLayerByName("Effects"), sprPt.getX(), sprPt.getY());
        var rot = A_.UTILS.angleTo(this.getPosition(), this.level.getMousePosition());
        bullet.setRotation(rot);
        bullet.velocity.x = Math.cos(rot) * bullet.maxVelocity.x;
        bullet.velocity.y = Math.sin(rot) * bullet.maxVelocity.y;
        bullet.setAnimation("all", 16, 0);
    },
    shootLaser: function () {
        var pos = this.getPosition();
        this.level.createSprite(LaserBeam, this.level.findLayerByName("Effects"), pos.x, pos.y, {spawner: this});
    }
});

var Agent = AnimeSkorpio.extend({
    spriteSheet: "AgentComplete.png",
    timer: 0,
    collisionType: A_.COLLISION.Type.ENEMY,
    collidesWith: A_.COLLISION.Type.FRIENDLY_FIRE,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.maxVelocity = new SAT.Vector(128, 128);
//        this.motionState = "moving";
        this.timer = 4;
        this.mass = 0.5;
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
            if (this.timer > 6) {
                this.timer = 0;
                this.cardinalDir = _.sample(this.cardinalDirs);
            }
        }
        this._super();
    }
});

var Rifle = A_.SPRITES.Sprite.extend({
    spriteSheet: "AssaultRifle.png",
    frameWidth: 64,
    frameHeight: 64,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.addAnimation("idle_up", [0], 1);
        this.addAnimation("idle_down", [18], 1);
        this.addAnimation("idle_left", [9], 1);
        this.addAnimation("idle_right", [27], 1);

        this.addAnimation("moving_up", _.range(1, 9), this.animSpeed);
        this.addAnimation("moving_down", _.range(19, 27), this.animSpeed);
        this.addAnimation("moving_left", _.range(10, 18), this.animSpeed);
        this.addAnimation("moving_right", _.range(28, 36), this.animSpeed);

        this.spritePoint("up", 14, -18);
        this.spritePoint("down", -10, 28);
        this.spritePoint("left", -24, 6);
        this.spritePoint("right", 24, 6);

        this.addon("PinTo", {parent: this.holder, name: "rifle", offsetX: 0, offsetY: 0});
    },
    update: function () {
        this.setAnimation(this.holder.motionState + "_" + this.holder.facing);
        if (this.holder.facing === "up") {
            this.moveToSprite(this.holder, "back");
        } else {

            this.moveToSprite(this.holder, "front");
        }

        this._super();
    }
});
// WEAPONS & AMMO
var Bullet = A_.SPRITES.Kinematic.extend({
    spriteSheet: "Muzzleflashes-Shots.png",
    frameWidth: 32,
    frameHeight: 32,
    collisionResponse: "sensor",
    collisionWidth: 12,
    collisionHeight: 10,
    lifeTime: 4,
    lifeTimer: 0,
    collidesWith: A_.COLLISION.Type.ENEMY,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 0;
        this.friction.y = 0;
        this.maxVelocity.x = this.maxVelocity.y = 600;
        this.bounded = false;
        this.level.createSound({
            urls: ['gunshot.mp3'],
            volume: 0.5
        }).play();
    },
    update: function () {
        if (this.outOfBounds) {
            this.destroy();
        }
        this.lifeTimer += A_.game.dt;
        if (this.lifeTimer > this.lifeTime)
            this.destroy();

        this._super();
    },
    collideWithKinematic: function (other, response) {
        if (other instanceof Agent) {
            other.alive = false;
            other.motionState = "idle";
            this.destroy();
        } else if (other.collisionResponse === "static") {
            this.destroy();
        }
    },
    collideWithStatic: function (other, response) {
        this.destroy();
    }
});

var LaserBeam = A_.SPRITES.Sprite.extend({
    spriteSheet: "Muzzleflashes-Shots.png",
    frameWidth: 32,
    frameHeight: 32,
    bounded: false,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.setAlpha(0.75);
        this.setAnimation("all", 18, 0);
        this.setOrigin(0, 0.5);

        this.setRotation(A_.UTILS.angleTo(this.spawner.getPosition(), this.level.getMousePosition()));
        var sprPt = this.spawner.rifle.spritePoint(this.spawner.facing);
        this.setPosition(sprPt.getX(), sprPt.getY());

        this.tip = {x: this.getX(), y: this.getY()};
        this.laserTip = this.level.createSprite(LaserTip, this.level.findLayerByName("Effects"),
                this.getX() + Math.cos(this.getRotation()) * this.getWidth(),
                this.getY() + Math.sin(this.getRotation()) * this.getWidth(),
                {collisionWidth: 4, collisionHeight: 4});
        this.laserTip.laser = this;
        this.sound = this.level.createSound({
            urls: ['laser-beam.mp3'],
            loop: true,
            volume: 0.4
        }).play();

        this.origH = this.getHeight();
        var sineProps = {period: 1, periodRand: 50, amplitude: 8, amplitudeRand: 4};
        this.sine = this.addon("Sine", sineProps);
    },
    update: function () {
        var sprPt = this.spawner.rifle.spritePoint(this.spawner.facing);
        this.setPosition(sprPt.getX(), sprPt.getY());

        this.setRotation(A_.UTILS.angleTo(this.getPosition(), this.level.getMousePosition()));
        this.setWidth(A_.UTILS.distanceTo(this.getPosition(), this.level.getMousePosition()));
        this.tip.x = this.getX() + Math.cos(this.getRotation()) * this.getWidth();
        this.tip.y = this.getY() + Math.sin(this.getRotation()) * this.getWidth();

        if (this.level.rightreleased) {
            if (this.laserTip) {
                if (this.laserTip.fire)
                    this.laserTip.fire.destroy();
                this.laserTip.destroy();
            }
            this.sound.stop();
            this.destroy();
        }

        this.setHeight(this.origH + this.sine.value);
        this._super();
    }
});

var LaserTip = A_.SPRITES.Kinematic.extend({
    bounded: false,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
    },
    update: function () {
        this.setPosition(this.laser.tip.x, this.laser.tip.y);
        if (!this.collided) {
            if (this.fire) {
                this.fire.destroy();
                this.fire = null;
            }
            this.timer = null;
        }
        
        this.synchCollisionPolygon();
        this._super();
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);
        if (other.collisionResponse === "static") {
            if (!this.timer) {
                this.timer = 1;
            }
            else {
                this.timer -= A_.game.dt;
            }
            if (this.timer < 0) {
                this.level.createSprite(ExplosionSkorpio, this.level.findLayerByName("Effects"),
                        other.getX(), other.getY());
                other.destroy();
                this.timer = null;
            }
            if (!this.fire) {
                this.fire = this.level.createSprite(LaserFire, this.level.findLayerByName("Effects"),
                        this.getX(), this.getY());
                this.fire.laserTip = this;
            }
        }
    }
});


var LaserFire = A_.SPRITES.Sprite.extend({
    spriteSheet: "Fire.png",
    frameWidth: 64,
    frameHeight: 64,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.addAnimation("burn", [0, 1, 2], 0.2);
        this.setAnimation("burn");
        this.sound = this.level.createSound({
            urls: ['fire.wav'],
            loop: true,
            volume: 0.3
        });
        this.sound.play();

//        var blur = new PIXI.BlurFilter();
//        blur.blurX = blur.blurY = 1;
//        this.sprite.filters = [blur];
        this.setZ("top");
    },
    update: function () {
        this.setPosition(this.laserTip.getX(), this.laserTip.getY());
        var scale = this.getScale();
        this.setScale(scale.x + A_.game.dt, scale.y + A_.game.dt);
        this._super();
    },
    onDestruction: function () {
        this.sound.stop();
    }
});


var ExplosionSkorpio = A_.SPRITES.Sprite.extend({
    spriteSheet: "Explosion.png",
    frameWidth: 128,
    frameHeight: 128,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        this.addAnimation("explode", _.range(0, 17), 0.2);
        this.setAnimation("explode");
        this.animations["explode"].loop = false;
        var that = this;
        this.animations["explode"].onComplete = function () {
            that.destroy();
        };
        this.level.createSound({
            urls: ['explosion.mp3'],
            volume: 0.6
        }).play();
    },
});

// ITEMS
var Computer = A_.SPRITES.Colliding.extend({
    spriteSheet: "Computer1.png",
    collisionResponse: "static",
//    collisionType: A_.COLLISION.Type.ITEM,
//    collidesWith: A_.COLLISION.Type.NONE,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
    }
})


