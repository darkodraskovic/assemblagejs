// CLASSES
var Anime = A_.SPRITES.Topdown.extend({
    frame: {w: 64, h: 64},
    collision: {response: "passive", offset: {x: 0, y: 6}, size: {w: 26, h: 48}},
    animSpeed: 0.15,
    alive: true,
    facing: "right",
    bounciness: 0,
    collides: true,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        
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
        this.animations["death"].onComplete = function() {
            that.destroy();
        };
    },
    update: function() {
        this._super();

        if (this.alive) {
            this.setAnimation(this.motionState + "_" + this.facing);
        }
        else {
            if (!this.groaned) {
                var sound = A_.game.createSound({
                    urls: ['grunt.wav'],
                    volume: 0.5
                })
                sound.play();
                this.groaned = true;
            }
            this.setAnimation("death");
        }
    }
});

//Anime.inject(A_.MODULES.Topdown);

var Player = Anime.extend({
    animSheet: "PlayerComplete.png",
    collisionType: A_.COLLISION.Type.PLAYER,
    collidesWith: A_.COLLISION.Type.ENEMY | A_.COLLISION.Type.ITEM,
    controlled: true,
    followee: true,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        
        this.collision = A_.UTILS.copy(this.collision);
        this.collision.response = "active";
        this.rifle = A_.game.createSprite(Rifle, this.layer,
                this.x(), this.y(),
                {holder: this, animSpeed: this.animSpeed});                
    },
    onCreation: function() {
        this._super();
    },
    update: function() {
        var rot = (A_.UTILS.angleTo(this.position(), A_.INPUT.mousePosition.level)).toDeg();
        if (rot >= -45 && rot < 45) {
            this.facing = "right";
        } else if (rot >= 45 && rot < 135) {
            this.facing = "down";
        } else if (rot > 135 || rot <= -135) {
            this.facing = "left";
        } else
            this.facing = "up";

        if (A_.level.leftpressed) {
            this.shootBullet();
        }
        if (A_.level.rightpressed) {
            this.shootLaser();
        }
        this._super();
    },
    shootBullet: function() {
        var sprPt = this.rifle.spritePoint(this.facing);
        var bullet = A_.game.createSprite(Bullet, A_.level.findLayerByName("Effects"), sprPt.x(), sprPt.y());
        bullet.rotation(A_.UTILS.angleTo(this.position(), A_.INPUT.mousePosition.level));
        bullet.setAnimation("all", 16, 0);
    },
    shootLaser: function() {
        var pos = this.position();
        A_.game.createSprite(LaserBeam, A_.level.findLayerByName("Effects"), pos.x, pos.y, {spawner: this});
    }
});

var Agent = Anime.extend({
    animSheet: "AgentComplete.png",
    timer: 0,
    collisionType: A_.COLLISION.Type.ENEMY,
    collidesWith: A_.COLLISION.Type.FRIENDLY_FIRE,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.maxVelocity = new SAT.Vector(64, 64);
        this.motionState = "moving";
        this.timer = 2;
    },
    update: function() {
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

var Rifle = A_.SPRITES.Animated.extend({
    animSheet: "AssaultRifle.png",
    frame: {w: 64, h: 64},
    init: function(parent, x, y, props) {
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
    update: function() {
//        var rot = A_.UTILS.angleTo(this.position(), A_.INPUT.mousePosition.level);
//        switch (this.holder.facing) {
//            case "left": rot -= Math.PI; break;
//            case "up": rot += Math.PI / 2; break;
//            case "down": rot -= Math.PI / 2; break;
//        };
//        this.rotation(rot);

        this.setAnimation(this.holder.motionState + "_" + this.holder.facing);
        if (this.holder.facing === "up") {
            this.moveToSprite(this.holder, "back");
        } else {

            this.moveToSprite(this.holder, "front");
        }
    }
});
// WEAPONS & AMMO
var Bullet = A_.SPRITES.Kinematic.extend({
    animSheet: "Muzzleflashes-Shots.png",
    frame: {w: 32, h: 32},
    collision : {size: {w: 12, h: 10}, response: "sensor"},
    collidesWith: A_.COLLISION.Type.ENEMY,    
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 0;
        this.friction.y = 0;
        this.maxSpeed = 600;
        this.acceleration.x = this.acceleration.y = 400;
        this.moveAtAngle = true;
        this.moveForward = true;
        this.bounded = false;
        A_.game.createSound({
            urls: ['gunshot.mp3'],
            volume: 0.5
        }).play();
    },
    update: function() {
//        this.origin(0, 0.5);
        this._super();
        if (this.outOfBounds) {
            this.destroy();
        }
        
    },
    collideWithDynamic: function(other, response) {
        if (other instanceof Agent) {
            other.alive = false;
            other.motionState = "idle";
            this.destroy();
        } else if (other.collision.response === "static") {
            this.destroy();
        }
    },
    collideWithStatic: function(other, response) {
        this.destroy();
    }
});

var LaserBeam = A_.SPRITES.Animated.extend({
    animSheet: "Muzzleflashes-Shots.png",
//    collides: false,
    frame: {w: 32, h: 32},
    bounded: false,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.alpha(0.75);
        this.setAnimation("all", 18, 0);
        this.origin(0, 0.5);

        this.rotation(A_.UTILS.angleTo(this.spawner.position(), A_.INPUT.mousePosition.level));
        var sprPt = this.spawner.rifle.spritePoint(this.spawner.facing);
        this.position(sprPt.x(), sprPt.y());

        this.tip = {x: this.x(), y: this.y()};
        this.laserTip = A_.game.createSprite(LaserTip, A_.level.findLayerByName("Effects"),
                this.x() + Math.cos(this.rotation()) * this.width(),
                this.y() + Math.sin(this.rotation()) * this.width(),
                {collision : {size: {w: 4, h: 4}}});
        this.laserTip.laser = this;
        this.sound = A_.game.createSound({
            urls: ['laser-beam.mp3'],
            loop: true,
            volume: 0.4
        }).play();

        this.origH = this.height();
        var sineProps = {period: 1, periodRand: 50, amplitude: 8, amplitudeRand: 4};
        this.sine = this.addon("Sine", sineProps);
    },
    update: function() {
        var sprPt = this.spawner.rifle.spritePoint(this.spawner.facing);
//        this.position(this.spawner.x(), this.spawner.y());
        this.position(sprPt.x(), sprPt.y());

        this.rotation(A_.UTILS.angleTo(this.position(), A_.INPUT.mousePosition.level));
        this.width(A_.UTILS.distanceTo(this.position(), A_.INPUT.mousePosition.level));
        this.tip.x = this.x() + Math.cos(this.rotation()) * this.width();
        this.tip.y = this.y() + Math.sin(this.rotation()) * this.width();

        if (A_.level.rightreleased) {
            if (this.laserTip) {
                if (this.laserTip.fire)
                    this.laserTip.fire.destroy();
                this.laserTip.destroy();
            }
            this.sound.stop();
            this.destroy();
        }

        this.height(this.origH + this.sine.value);
    }
});

var LaserTip = A_.SPRITES.Colliding.extend({
    bounded: false,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
    },
    update: function() {
        this._super();
        this.position(this.laser.tip.x, this.laser.tip.y);
        if (!this.collided) {
            if (this.fire) {
                this.fire.destroy();
                this.fire = null;
            }
            this.timer = null;
        }
    },
    collideWithStatic: function(other, response) {
        this._super(other, response);
        if (other.collision.response === "static") {
            if (!this.timer) {
                this.timer = 1;
            }
            else {
                this.timer -= A_.game.dt;
            }
            if (this.timer < 0) {
                A_.game.createSprite(Explosion, A_.level.findLayerByName("Effects"),
                        other.x(), other.y());
                other.destroy();
                this.timer = null;
            }
            if (!this.fire) {
                this.fire = A_.game.createSprite(LaserFire, A_.level.findLayerByName("Effects"),
                        this.x(), this.y());
                this.fire.laserTip = this;
            }
        }
    }
});


var LaserFire = A_.SPRITES.Animated.extend({
    animSheet: "Fire.png",
    frame: {w: 64, h: 64},
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.addAnimation("burn", [0, 1, 2], 0.2);
        this.setAnimation("burn");
        this.sound = A_.game.createSound({
            urls: ['fire.wav'],
            loop: true,
            volume: 0.3
        });
        this.sound.play();

//        var blur = new PIXI.BlurFilter();
//        blur.blurX = blur.blurY = 1;
//        this.sprite.filters = [blur];
    },
    onCreation: function() {
        this._super();
        this.z("top");
    },
    update: function() {
        this._super();
        this.position(this.laserTip.x(), this.laserTip.y());
        var scale = this.scale();
        this.scale(scale.x + A_.game.dt, scale.y + A_.game.dt);
    },
    onDestruction: function() {
        this.sound.stop();
    }
});


var Explosion = A_.SPRITES.Animated.extend({
    animSheet: "Explosion.png",
    frame: {w: 128, h: 128},
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        this.addAnimation("explode", _.range(0, 17), 0.2);
        this.setAnimation("explode");
        this.animations["explode"].loop = false;
        var that = this;
        this.animations["explode"].onComplete = function() {
            that.destroy();
        };
        A_.game.createSound({
            urls: ['explosion.mp3'],
            volume: 0.6
        }).play();
    },
});

// ITEMS
var Computer = A_.SPRITES.Colliding.extend({
    animSheet: "Computer1.png",
    collision: {response: "static"},
//    collisionType: A_.COLLISION.Type.ITEM,
//    collidesWith: A_.COLLISION.Type.NONE,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

//        A_.EXTENSIONS.Sine.addTo(this, {period: 3, periodRand: 0, value: 0.5, valueRand: 50});
    },
    update: function(props) {
        this._super(props);

//        var val = this.sine.computeValue();
//        this.scale(1 + val, 1 + val);
//        
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

// GAME LOGIC
A_.game.preupdate = function() {
};

A_.game.postupdate = function() {
    if (!A_.level.findSpriteByClass(Agent) && !A_.level.findSpriteByClass(Computer)) {
        if (this.level.name === "level1") {
            A_.game.loadTiledLevel(level2);
        } else {
            A_.game.loadTiledLevel(level1);
        }
    }

};

