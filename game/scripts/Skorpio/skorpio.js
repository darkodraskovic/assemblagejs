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
    animSpeed: 0.15,
    elasticity: 0,
    alive: true,
    init: function (parent, x, y, props) {
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

        var deathAnim = this.addAnimation("death", _.range(36, 42), this.animSpeed);
        deathAnim.loop = false;
        deathAnim.onComplete = function () {
            this.destroy();
        }.bind(this);

        this.setAnchor(0.5, 0.5)
        this.setCollisionSize(26, 48);
        this.setCollisionOffset(0, 6);

    },
    update: function () {
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
            this.animation = this.motionState + "_" + this.facing;
        }
        else {
            if (!this.groaned) {
                var sound = DODO.getAsset('grunt.wav');
                sound.play();
                this.groaned = true;
            }
            this.animation = "death";
        }

        this._super();
    },
    cardinalContains: function (cont, car) {
        if (!car)
            car = this.cardinalDir;

        if (car.indexOf(cont) > -1) {
            return true;
        }
    }
});

var PlayerSkorpio = AnimeSkorpio.extend({
    spriteSheet: "Skorpio/player_skorpio.png",
    controlled: true,
    player: true,
    mass: 4,
    drawCollisionPolygon: true,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        DODO.input.addMapping("left", DODO.Key.A);
        DODO.input.addMapping("right", DODO.Key.D);
        DODO.input.addMapping("down", DODO.Key.S);
        DODO.input.addMapping("up", DODO.Key.W);

        this.collisionResponse = "active";
        this.maxVelocity = new SAT.Vector(256, 256);
        this.force = new SAT.Vector(512, 512);
        this.rifle = new Rifle(this.layer,
                this.position.x, this.position.y,
                {holder: this, animSpeed: this.animSpeed});

        this.scene.bind('leftpressed', this, this.shootBullet);
        this.scene.bind('rightpressed', this, this.shootLaser);

        this.scene.camera.setFollowee(this);
        window.player = this;
    },
    update: function () {
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

        var rot = (DODO.angleTo(this.position, this.scene.mouse)).toDeg();
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
    shootBullet: function () {
        var sprPt = this.rifle.getPoint(this.facing);
        var bullet = new Bullet(this.scene.findLayerByName("Effects"), sprPt.x, sprPt.y);
        var rot = DODO.angleTo(this.position, this.scene.mouse);
        bullet.rotation = (rot);
        bullet.velocity.x = Math.cos(rot) * bullet.maxVelocity.x;
        bullet.velocity.y = Math.sin(rot) * bullet.maxVelocity.y;        
    },
    shootLaser: function () {
        var pos = this.position;
        new LaserBeam(this.scene.findLayerByName("Effects"), pos.x, pos.y, {spawner: this});
    }
});

var Agent = AnimeSkorpio.extend({
    spriteSheet: "Skorpio/AgentComplete.png",
    timer: 0,
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
            this.timer += DODO.game.dt;
            if (this.timer > 6) {
                this.timer = 0;
                this.cardinalDir = _.sample(this.cardinalDirs);
            }
        }
        this._super();
    }
});

var Rifle = DODO.Textured.extend({
    spriteSheet: "Skorpio/AssaultRifle.png",
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

        this.setAnchor(0.5, 0.5);
        this.setPoint("up", 12, -8);
        this.setPoint("down", -12, 16);
        this.setPoint("left", -16, 6);
        this.setPoint("right", 16, 6);

        this.pinTo = new DODO.addons.PinTo(this, {parent: this.holder, name: "rifle", offsetX: 0, offsetY: 0});
    },
    update: function () {
        this.pinTo.update();

        this.animation = this.holder.motionState + "_" + this.holder.facing;
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
    spriteSheet: "Skorpio/Muzzleflashes-Shots.png",
    frameWidth: 32,
    frameHeight: 32,
    collisionResponse: "sensor",
    lifeTime: 4,
    lifeTimer: 0,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 0;
        this.friction.y = 0;
        this.maxVelocity.x = this.maxVelocity.y = 600;
        this.bounded = false;
        var sound = DODO.getAsset('gunshot.mp3');
        sound.volume(0.5);
        sound.play();
        this.setAnchor(0, 0.5);
        this.setCollisionSize(12, 10);
        this.setCollisionOffset(10, 0);
        
        this.animation = this.addAnimation("bullet", [16], 0);
    },
    update: function () {
        if (this.outOfBounds) {
            this.destroy();
        }
        this.lifeTimer += DODO.game.dt;
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

var LaserBeam = DODO.Textured.extend({
    spriteSheet: "Skorpio/Muzzleflashes-Shots.png",
    frameWidth: 32,
    frameHeight: 32,
    bounded: false,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.container.alpha = 0.75;
        this.animation = this.addAnimation("laser", [18], 0);
        this.setAnchor(0, 0.5);

        this.rotation = (DODO.angleTo(this.spawner.position, this.scene.mouse));
        var sprPt = this.spawner.rifle.getPoint(this.spawner.facing);
        this.position.x = sprPt.x;
        this.position.y = sprPt.y;

        this.tip = {x: this.position.x, y: this.position.y};
        this.laserTip = new LaserTip(this.scene.findLayerByName("Effects"),
                this.position.x + Math.cos(this.rotation) * this.width,
                this.position.y + Math.sin(this.rotation) * this.width);
        this.laserTip.laser = this;
        this.sound = DODO.getAsset('laser-beam.mp3').play();
        this.sound.volume(0.5);
        this.sound.loop(true);

        this.origH = this.height;
        var sineProps = {period: 1, periodRand: 50, amplitude: 8, amplitudeRand: 4};
        this.sine = new DODO.addons.Sine(this, sineProps);

        this.scene.bind('rightreleased', this, this.destroy)
    },
    update: function () {
        var sprPt = this.spawner.rifle.getPoint(this.spawner.facing);
        this.position.x = sprPt.x;
        this.position.y = sprPt.y;

        this.rotation = (DODO.angleTo(this.position, this.scene.mouse));
        this.width = (DODO.distanceTo(this.position, this.scene.mouse));
        this.tip.x = this.position.x + Math.cos(this.rotation) * this.width;
        this.tip.y = this.position.y + Math.sin(this.rotation) * this.width;

        this.sine.update();
        this.height = (this.origH + this.sine.value);

        this._super();
    },
    destroy: function () {
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
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.setCollisionSize(8, 8);
    },
    update: function () {
        this.position.x = this.laser.tip.x;
        this.position.y = this.laser.tip.y;

        if (!this.collided) {
            if (this.fire) {
                this.fire.destroy();
                this.fire = null;
            }
            this.timer = null;
        }
        this.collided = false;

        this.synchCollisionPolygon();
        this._super();
    },
    collideWithStatic: function (other, response) {
        window.console.log("collide");
        this._super(other, response);

        this.collided = true;
        if (!this.timer) {
            this.timer = 1;
        }
        else {
            this.timer -= DODO.game.dt;
        }
        if (this.timer < 0) {
            window.console.log(other.getCenterX());
            new ExplosionSkorpio(this.scene.findLayerByName("Effects"),
                    other.getCenterX(), other.getCenterY());
            other.destroy();
            this.timer = null;
        }
        if (!this.fire) {
            this.fire = new LaserFire(this.scene.findLayerByName("Effects"),
                    this.position.x, this.position.y);
            this.fire.laserTip = this;
        }
    }
});


var LaserFire = DODO.Textured.extend({
    spriteSheet: "Skorpio/Fire.png",
    frameWidth: 64,
    frameHeight: 64,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.addAnimation("burn", [0, 1, 2], 0.2);
        this.animation = "burn";
        this.sound = DODO.getAsset('fire.wav');
        this.sound.volume(0.3);
        this.sound.loop(true);
        this.sound.play();

//        var blur = new PIXI.BlurFilter();
//        blur.blurX = blur.blurY = 1;
//        this.container.filters = [blur];
        this.z = "top";
        this.setAnchor(0.5, 0.5);
    },
    update: function () {
        this.position.x = this.laserTip.position.x;
        this.position.y = this.laserTip.position.y;

        this.scale.x += DODO.game.dt;
        this.scale.y += DODO.game.dt;
        this._super();
    },
    destroy: function () {
        this.sound.stop();
        this._super();
    }
});


var ExplosionSkorpio = DODO.Textured.extend({
    spriteSheet: "Common/Explosion.png",
    frameWidth: 128,
    frameHeight: 128,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        var anim = this.addAnimation("explode", _.range(0, 17), 0.2);
        this.animation = "explode";
        anim.loop = false;
        anim.onComplete = function () {
            this.destroy();
        }.bind(this);
        this.sound = DODO.getAsset('explosion.mp3');
        this.sound.volume(0.4);
        this.sound.play();
        this.setAnchor(0.5, 0.5);
    }
});

// ITEMS
var Computer = DODO.Colliding.extend({
    spriteSheet: "Skorpio/Computer1.png",
    collisionResponse: "static",
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
    }
});


