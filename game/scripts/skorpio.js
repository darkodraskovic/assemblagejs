var Anime = A_.SPRITES.ArcadeSprite.extend({
    frame: {w: 64, h: 64},
    collisionSize: {w: 26, h: 48},
    collisionOffset: {x: 0, y: 6},
    animSpeed: 0.15,
    alive: true,
    facing: "right",
    bounciness: 0,
    collides: true,
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);

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
            if (!this.groaned) {
                var sound = A_.game.createSound({
                    urls: ['assets/grunt.wav'],
                    volume: 0.5
                })
                sound.play();
                this.groaned = true;
            }
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
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
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
            this.shootBullet();
        }
        if (A_.game.rightpressed) {
            this.shootLaser();
        }
        this._super();
    },
    shootBullet: function () {
        var pos = this.getPosition();
        var bullet = A_.game.createSprite(Bullet, A_.level.findLayerByName("Effects"), pos.x, pos.y + 8);
        bullet.setRotation(A_.UTILS.angleTo(this.getPosition(), A_.game.mousePosition.level));
        bullet.setAnimation("all", 16, 0);
        bullet.velocity.y = bullet.speed * Math.sin(bullet.getRotation());
        bullet.velocity.x = bullet.speed * Math.cos(bullet.getRotation());
    },
    shootLaser: function () {
        var pos = this.getPosition();
        A_.game.createSprite(LaserBeam, A_.level.findLayerByName("Effects"), pos.x, pos.y, {spawner: this});
    }
});

Player.inject(A_.MODULES.TopdownWASD);

var Agent = Anime.extend({
    animSheet: "AgentComplete.png",
    timer: 0,
    collisionResponse: "passive",
    collisionType: A_.COLLISION.Type.ENEMY,
    collidesWith: A_.COLLISION.Type.FRIENDLY_FIRE,
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
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

// WEAPONS & AMMO
var Bullet = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "Muzzleflashes-Shots.png",
    frame: {w: 32, h: 32},
    collisionSize: {w: 12, h: 10},
    collisionResponse: "sensor",
    collidesWith: A_.COLLISION.Type.ENEMY,
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        this.friction.x = 0;
        this.friction.y = 0;
        this.maxVelocity.x = this.maxVelocity.y = 1000;
        this.speed = 600;
        this.bounded = false;        
        A_.game.createSound({
            urls: ['assets/gunshot.mp3'],
            volume: 0.5
        }).play();
    },
    update: function () {
        this._super();
        if (this.outOfBounds) {
            this.destroy();
        }
    },
    collide: function (other, response) {
        if (other instanceof Agent) {
            other.alive = false;
            other.motionState = "idle";
            this.destroy();
        } else if (other.collisionResponse === "static") {
            this.destroy();
        }
    },
    collideWithTile: function () {
        this.destroy();
    }
});

var LaserBeam = A_.SPRITES.CollisionSprite.extend({
    animSheet: "Muzzleflashes-Shots.png",
    collides: false,
    frame: {w: 32, h: 32},
    bounded: false,
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        this.alpha = 0.75;
        this.setAnimation("all", 18, 0);
        this.currentAnimation.anchor = new PIXI.Point(0, 0.5);
        this.setRotation(A_.UTILS.angleTo(this.spawner.getPosition(), A_.game.mousePosition.level));

        this.tip = {x: this.spawner.getPositionX(), y: this.spawner.getPositionY()};
        this.laserTip = A_.game.createSprite(LaserTip, A_.level.findLayerByName("Effects"),
                this.getPositionX() + Math.cos(this.getRotation()) * this.getWidth(),
                this.getPositionY() + Math.sin(this.getRotation()) * this.getWidth(),
                {collisionSize: {w: 4, h: 4}});
        this.laserTip.laser = this;
        this.sound = A_.game.createSound({
            urls: ['assets/laser-beam.mp3'],
            loop: true,
            volume: 0.4
        }).play();
        
        this.origH = this.getHeight();
        this.sine = 0;
    },
    update: function () {
        this.setPosition(this.spawner.getPositionX(), this.spawner.getPositionY());

        this.setRotation(A_.UTILS.angleTo(this.spawner.getPosition(), A_.game.mousePosition.level));
        this.setWidth(A_.UTILS.distanceTo(this.getPosition(), A_.game.mousePosition.level));
        this.tip.x = this.getPositionX() + Math.cos(this.getRotation()) * this.getWidth();
        this.tip.y = this.getPositionY() + Math.sin(this.getRotation()) * this.getWidth();

        if (A_.game.rightreleased) {
            if (this.laserTip) {
                if (this.laserTip.fire)
                    this.laserTip.fire.destroy();
                this.laserTip.destroy();
            }
            this.sound.stop();
            this.destroy();
        }
        
        var varSize = Math.sin(_.random(Math.PI / 4, 3 * (Math.PI / 4)));
        this.setHeight(this.origH * varSize);
    }
});

var LaserTip = A_.SPRITES.CollisionSprite.extend({
    bounded: false,
    update: function () {
        this._super();
        this.setPosition(this.laser.tip.x, this.laser.tip.y);
        if (!this.collided) {
            if (this.fire) {
                this.fire.destroy();
                this.fire = null;
            }
            this.timer = null;
        }
    },
    collide: function (other, response) {
        this._super(other, response);
        if (other.collisionResponse === "static") {
            if (!this.timer) {
                this.timer = 1;
            }
            else {
                this.timer -= A_.game.dt;
            }
            if (this.timer < 0) {
                A_.game.createSprite(Explosion, A_.level.findLayerByName("Effects"),
                        other.getPositionX(), other.getPositionY());
                other.destroy();
                this.timer = null;
            }
            if (!this.fire) {
                this.fire = A_.game.createSprite(LaserFire, A_.level.findLayerByName("Effects"),
                        this.getPositionX(), this.getPositionY());
                this.fire.laserTip = this;
            }
        }
    }
});


var LaserFire = A_.SPRITES.AnimatedSprite.extend({
    animSheet: "Fire.png",
    frame: {w: 64, h: 64},
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        this.addAnimation("burn", [0, 1, 2], 0.2);
        this.setAnimation("burn");
        this.sound = A_.game.createSound({
            urls: ['assets/fire.wav'],
            loop: true,
            volume: 0.3
        });
        this.sound.play();

//        var blur = new PIXI.BlurFilter();
//        blur.blurX = blur.blurY = 1;
//        this.sprite.filters = [blur];
    },
    onCreate: function () {
        this.toTopOfLayer();
    },
    update: function () {
        this._super();
        this.setPosition(this.laserTip.getPositionX(), this.laserTip.getPositionY());
        var scale = this.getScale();
        this.setScale(scale.x + A_.game.dt, scale.y + A_.game.dt);
    },
    onDestruction: function () {
        this.sound.stop();
    }
});


var Explosion = A_.SPRITES.AnimatedSprite.extend({
    animSheet: "Explosion.png",
    frame: {w: 128, h: 128},
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);

        this.addAnimation("explode", _.range(0, 17), 0.2);
        this.setAnimation("explode");
        this.animations["explode"].loop = false;
        var that = this;
        this.animations["explode"].onComplete = function () {
            that.destroy();
        };
        A_.game.createSound({
            urls: ['assets/explosion.mp3'],
            volume: 0.6
        }).play();
    },
});

// ITEMS
var Computer = A_.SPRITES.CollisionSprite.extend({
    animSheet: "Computer1.png",
    collisionResponse: "static",
    interactive: true,
    collisionType: A_.COLLISION.Type.ITEM,
    collidesWith: A_.COLLISION.Type.NONE,
    update: function (props) {
        this._super(props);
//        if (this.leftpressed) {
//            window.console.log("Pressed");
//        }
//        if (this.leftreleased) {
//            window.console.log("Released");
//        }
//        if (this.leftdown) {
//            window.console.log("Down");
//        }
//        if (this.rightpressed) {
//            window.console.log("Pressed");
//        }
//        if (this.rightreleased) {
//            window.console.log("Released");
//        }
//        if (this.rightdown) {
//            window.console.log("Down");
//        }
    }
})