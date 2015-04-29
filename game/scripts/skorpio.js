// CLASSES
var AnimeSkorpio = DODO.Kinematic.extend({
    motionState: "idle",
    motionStates: ["moving", "idle"],
    cardinalDir: "E",
    cardinalDirs: ["N", "NW", "NE", "S", "SW", "SE"],
    facing: "right",
    controlled: false,
    frameWidth: 64,
    frameHeight: 64,
    collisionResponse: "active",
    collisionOffsetX: 18,
    collisionOffsetY: 14,
    collisionWidth: 26,
    collisionHeight: 48,
    animSpeed: 0.15,
    elasticity: 0,
    alive: true,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = this.friction.y = 32;
        this.force = new SAT.Vector(64, 64);

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

        this.setOrigin(0.5, 0.5)
    },
    update: function() {
        if (this.motionState === "moving") {
            if (this.cardinalContains("N")) {
                this.acceleration.y = -this.force.y;
            }
            else if (this.cardinalContains("S")) {
                this.acceleration.y = this.force.y;
            } else
                this.acceleration.y = 0;
            if (this.cardinalContains("W")) {
                this.acceleration.x = -this.force.x;
            }
            else if (this.cardinalContains("E")) {
                this.acceleration.x = this.force.x;
            } else
                this.acceleration.x = 0;
        } else {
            this.acceleration.x = this.acceleration.y = 0;
        }

        if (this.alive) {
            this.setAnimation(this.motionState + "_" + this.facing);
        }
        else {
            if (!this.groaned) {
                var sound = DODO.getAsset('grunt.wav');
                sound.play();
                this.groaned = true;
            }
            this.setAnimation("death");
        }

        this._super();
    },
    cardinalContains: function(cont, car) {
        if (!car)
            car = this.cardinalDir;

        if (car.indexOf(cont) > -1) {
            return true;
        }
    }
});

var PlayerSkorpio = AnimeSkorpio.extend({
    spriteSheet: "player_skorpio.png",
    controlled: true,
    player: true,
    mass: 4,
    drawCollisionPolygon: true,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        DODO.input.addMapping("left", DODO.Key.A);
        DODO.input.addMapping("right", DODO.Key.D);
        DODO.input.addMapping("down", DODO.Key.S);
        DODO.input.addMapping("up", DODO.Key.W);

        this.collisionResponse = "active";
        this.maxVelocity = new SAT.Vector(256, 256);
        this.force = new SAT.Vector(512, 512);
        this.rifle = new Rifle(this.layer,
                this.getX(), this.getY(),
                {holder: this, animSpeed: this.animSpeed});

        this.scene.bind('leftpressed', this, this.shootBullet);
        this.scene.bind('rightpressed', this, this.shootLaser);
        
        this.setFollowee(true);
    },
    update: function() {
        var cd = "";
        if (DODO.input.down["up"]) {
            cd = "N";
        } else if (DODO.input.down["down"]) {
            cd = "S";
        }
        if (DODO.input.down["left"]) {
            cd += "W";
        } else if (DODO.input.down["right"]) {
            cd += "E";
        }

        if (cd.length > 0) {
            this.motionState = "moving";
            this.cardinalDir = cd;
        } else
            this.motionState = "idle";

        var rot = (DODO.angleTo(this.getPosition(), this.scene.getMousePosition())).toDeg();
        if (rot >= -45 && rot < 45) {
            this.facing = "right";
        } else if (rot >= 45 && rot < 135) {
            this.facing = "down";
        } else if (rot > 135 || rot <= -135) {
            this.facing = "left";
        } else
            this.facing = "up";

        this._super();
    },
    shootBullet: function() {
        var sprPt = this.rifle.getSpritePoint(this.facing);
        var bullet = new Bullet(this.scene.findLayerByName("Effects"), sprPt.getX(), sprPt.getY());
        var rot = DODO.angleTo(this.getPosition(), this.scene.getMousePosition());
        bullet.setRotation(rot);
        bullet.velocity.x = Math.cos(rot) * bullet.maxVelocity.x;
        bullet.velocity.y = Math.sin(rot) * bullet.maxVelocity.y;
        bullet.setAnimation("all", 16, 0);
    },
    shootLaser: function() {
        var pos = this.getPosition();
        new LaserBeam(this.scene.findLayerByName("Effects"), pos.x, pos.y, {spawner: this});
    }
});

var Agent = AnimeSkorpio.extend({
    spriteSheet: "AgentComplete.png",
    timer: 0,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.maxVelocity = new SAT.Vector(128, 128);
//        this.motionState = "moving";
        this.timer = 4;
        this.mass = 0.5;
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
            this.timer += DODO.game.dt;
            if (this.timer > 6) {
                this.timer = 0;
                this.cardinalDir = _.sample(this.cardinalDirs);
            }
        }
        this._super();
    }
});

var Rifle = DODO.Animated.extend({
    spriteSheet: "AssaultRifle.png",
    frameWidth: 64,
    frameHeight: 64,
    origin: {x: 0.5, y: 0.5},
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

        this.setSpritePoint("up", 14, -18);
        this.setSpritePoint("down", -10, 28);
        this.setSpritePoint("left", -24, 6);
        this.setSpritePoint("right", 24, 6);

        this.pinTo = new DODO.addons.PinTo(this, {parent: this.holder, name: "rifle", offsetX: 0, offsetY: 0});
    },
    update: function() {
        this.pinTo.update();
        
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
var Bullet = DODO.Kinematic.extend({
    spriteSheet: "Muzzleflashes-Shots.png",
    frameWidth: 32,
    frameHeight: 32,
    collisionResponse: "sensor",
    collisionWidth: 12,
    collisionHeight: 10,
    collisionOffsetX: -6,
    collisionOffsetY: -5,
    lifeTime: 4,
    lifeTimer: 0,
    origin: {x: 0.5, y: 0.5},
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 0;
        this.friction.y = 0;
        this.maxVelocity.x = this.maxVelocity.y = 600;
        this.bounded = false;
        var sound = DODO.getAsset('gunshot.mp3');
        sound.volume(0.5);
        sound.play();
    },
    update: function() {
        if (this.outOfBounds) {
            this.destroy();
        }
        this.lifeTimer += DODO.game.dt;
        if (this.lifeTimer > this.lifeTime)
            this.destroy();

        this._super();
    },
    collideWithKinematic: function(other, response) {
        if (other instanceof Agent) {
            other.alive = false;
            other.motionState = "idle";
            this.destroy();
        } else if (other.collisionResponse === "static") {
            this.destroy();
        }
    },
    collideWithStatic: function(other, response) {
        this.destroy();
    }
});

var LaserBeam = DODO.Animated.extend({
    spriteSheet: "Muzzleflashes-Shots.png",
    frameWidth: 32,
    frameHeight: 32,
    bounded: false,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.sprite.alpha = 0.75;
        this.setAnimation("all", 18, 0);
        this.setOrigin(0, 0.5);

        this.setRotation(DODO.angleTo(this.spawner.getPosition(), this.scene.getMousePosition()));
        var sprPt = this.spawner.rifle.getSpritePoint(this.spawner.facing);
        this.setPosition(sprPt.getX(), sprPt.getY());

        this.tip = {x: this.getX(), y: this.getY()};
        this.laserTip = new LaserTip(this.scene.findLayerByName("Effects"),
                this.getX() + Math.cos(this.getRotation()) * this.getWidth(),
                this.getY() + Math.sin(this.getRotation()) * this.getWidth(),
                {collisionWidth: 4, collisionHeight: 4});
        this.laserTip.laser = this;
        this.sound = DODO.getAsset('laser-beam.mp3').play();
        this.sound.volume(0.5);
        this.sound.loop(true);

        this.origH = this.getHeight();
        var sineProps = {period: 1, periodRand: 50, amplitude: 8, amplitudeRand: 4};
        this.sine = new DODO.addons.Sine(this, sineProps);

        this.scene.bind('rightreleased', this, this.destroy)
    },
    update: function() {
        var sprPt = this.spawner.rifle.getSpritePoint(this.spawner.facing);
        this.setPosition(sprPt.getX(), sprPt.getY());

        this.setRotation(DODO.angleTo(this.getPosition(), this.scene.getMousePosition()));
        this.setWidth(DODO.distanceTo(this.getPosition(), this.scene.getMousePosition()));
        this.tip.x = this.getX() + Math.cos(this.getRotation()) * this.getWidth();
        this.tip.y = this.getY() + Math.sin(this.getRotation()) * this.getWidth();

        this.sine.update();
        this.setHeight(this.origH + this.sine.value);

        this._super();
    },
    destroy: function() {
        if (this.laserTip) {
            if (this.laserTip.fire)
                this.laserTip.fire.destroy();
            this.laserTip.destroy();
        }
        this.sound.stop();
        this._super();
    }
});

var LaserTip = DODO.Kinematic.extend({
    bounded: false,
    collisionResponse: "sensor",
    collisionWidth: 8,
    collisionHeight: 8,
    origin: {x: 0.5, y: 0.5},
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
    },
    update: function() {
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
    collideWithStatic: function(other, response) {
        window.console.log("collide");
        this._super(other, response);

        if (other.collisionResponse === "static") {
            if (!this.timer) {
                this.timer = 1;
            }
            else {
                this.timer -= DODO.game.dt;
            }
            if (this.timer < 0) {
                new ExplosionSkorpio(this.scene.findLayerByName("Effects"),
                        other.getCenterX(), other.getCenterY());
                other.destroy();
                this.timer = null;
            }
            if (!this.fire) {
                this.fire = new LaserFire(this.scene.findLayerByName("Effects"),
                        this.getX(), this.getY());
                this.fire.laserTip = this;
            }
        }
    }
});


var LaserFire = DODO.Animated.extend({
    spriteSheet: "Fire.png",
    frameWidth: 64,
    frameHeight: 64,
//    origin: {x: 0.5, y: 0.5},
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.addAnimation("burn", [0, 1, 2], 0.2);
        this.setAnimation("burn");
        this.sound = DODO.getAsset('fire.wav');
        this.sound.volume(0.3);
        this.sound.loop(true);
        this.sound.play();

//        var blur = new PIXI.BlurFilter();
//        blur.blurX = blur.blurY = 1;
//        this.sprite.filters = [blur];
        this.setZ("top");
        this.setOrigin(0.5, 0.5);
    },
    update: function() {
        this.setPosition(this.laserTip.getX(), this.laserTip.getY());
        var scale = this.getScale();
        this.setScale(scale.x + DODO.game.dt, scale.y + DODO.game.dt);
        this._super();
    },
    destroy: function() {
        this.sound.stop();
        this._super();
    }
});


var ExplosionSkorpio = DODO.Animated.extend({
    spriteSheet: "Explosion.png",
    frameWidth: 128,
    frameHeight: 128,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        this.addAnimation("explode", _.range(0, 17), 0.2);
        this.setAnimation("explode");
        this.animations["explode"].loop = false;
        var that = this;
        this.animations["explode"].onComplete = function() {
            that.destroy();
        };
        this.sound = DODO.getAsset('explosion.mp3');
        this.sound.volume(0.4);
        this.sound.play();
        this.setOrigin(0.5, 0.5);
    }
});

// ITEMS
var Computer = DODO.Colliding.extend({
    spriteSheet: "Computer1.png",
    collisionResponse: "static",
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
    }
});


