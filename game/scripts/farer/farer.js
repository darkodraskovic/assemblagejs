// CLASSES
var Player = A_.SPRITES.Kinematic.extend({
    animSheet: "player.png",
    collision: {response: "active"},
    moveAtAngle: true,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.maxSpeed = 512;
        this.friction.x = 24;
        this.friction.y = 24;
        A_.INPUT.addMapping("left", A_.KEY.A);
        A_.INPUT.addMapping("right", A_.KEY.D);
        A_.INPUT.addMapping("down", A_.KEY.S);
        A_.INPUT.addMapping("up", A_.KEY.W);
    },
    onCreation: function () {
        this._super();
        this.laser1 = A_.game.createSprite(Laser, this, 18, -12);
        this.laser2 = A_.game.createSprite(Laser, this, 18, 12);
        this.spritePoint("bullet1", 18, -12);
        this.spritePoint("bullet2", 18, 12);
    },
    update: function () {
        var rot = A_.UTILS.angleTo(this.position(), A_.game.mousePosition.level);
        this.rotation(rot);
        var speedSign = 0;
        if (this.rotation() < 0)
            speedSign = -1;
        else
            speedSign = 1;

        if (A_.INPUT.down["up"]) {
            this.movementAngle = this.rotation();
            this.acceleration.x = this.acceleration.y = 64;
        }
        else if (A_.INPUT.down["down"]) {
            this.movementAngle = this.rotation() + Math.PI;
            this.acceleration.x = this.acceleration.y = 64;
        }
        else if (A_.INPUT.down["left"]) {
            this.movementAngle = this.rotation() + Math.PI / 2 * speedSign;
            this.acceleration.x = this.acceleration.y = 64;
        }
        else if (A_.INPUT.down["right"]) {
            this.movementAngle = this.rotation() + -Math.PI / 2 * speedSign;
            this.acceleration.x = this.acceleration.y = 64;
        }
        else {
            this.acceleration.x = this.acceleration.y = 0;            
        }

        if (A_.game.leftpressed) {
            this.shootBullet();
        }

        this._super();
    },
    shootBullet: function () {
        var pos1 = this.spritePoint("bullet1").position();
        var bullet1 = A_.game.createSprite(Bullet, A_.level.findLayerByName("Effects"), pos1.x, pos1.y);
        bullet1.rotation(this.rotation());

        var pos2 = this.spritePoint("bullet2").position();
        var bullet2 = A_.game.createSprite(Bullet, A_.level.findLayerByName("Effects"), pos2.x, pos2.y);
        bullet2.rotation(this.rotation());
    }
});

var Laser = A_.SPRITES.Animated.extend({
    animSheet: "laser.png",
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.alpha(0.4);
        this.origin(0, 0.5);
        this.baseScale = {x: 0.3, y: 1};
        this.sound = A_.game.createSound({
            urls: ['laser-beam.mp3'],
            loop: true,
            volume: 0.75
        });
        this.soundId = 0;

        this.origW = this.width();
        this.origH = this.height();
        var sineProps = {period: 0.5, periodRand: 25, amplitude: 3, amplitudeRand: 25};
        this.sine = this.addon("Sine", sineProps);
    },
    update: function () {
        if (A_.game.rightpressed) {
            this.toggleFire("on");
        }
        if (A_.game.rightreleased) {
            this.toggleFire("off");
        }
        if (A_.game.rightdown) {
            this.width(A_.UTILS.distanceTo(this.positionLevel(), A_.game.mousePosition.level));
        }

        this._super();

        this.height(this.origH + this.sine.value);
        if (this.on)
            this.width(this.width() + this.sine.value);
        else
            this.width(this.origW + this.sine.value);
    },
    toggleFire: function (state) {
        if (state === "on") {
            this.on = true;
            this.alpha(0.75);
            this.width(A_.UTILS.distanceTo(this.positionLevel(), A_.game.mousePosition.level));

            this.sound.play(function (id) {
                this.soundId = id;
            }.bind(this));
            this.sound.fade(0, 0.75, 250, null, this.soundId);
        }
        if (state === "off") {
            this.on = false;
            this.alpha(0.4);
            this.width(this.origW);

            this.sound.fade(0.75, 0, 450, null, this.soundId);
        }
    }
});

var Bullet = A_.SPRITES.Kinematic.extend({
    animSheet: "bullet.png",
    collision: {response: "sensor"},
    moveAtAngle: true,
//    drawDebugGraphics: false,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = this.friction.y = 0;
        this.acceleration.x = this.acceleration.y = 600;
        this.maxSpeed = 1200;
        this.bounded = false;
        A_.game.createSound({
            urls: ['bullet.wav'],
            volume: 0.75
        }).play();
    },
    onCreation: function () {
        this._super();
        this.origin(0, 0.5);
        this.alpha(0.75);
        this.moveAtAngle = true;
        this.moveForward = true;
    },
    update: function () {
        this._super();
        if (this.outOfBounds) {
            this.destroy();
        }
    },
    collideWithStatic: function (other, response) {
        A_.game.createSprite(Explosion, A_.level.findLayerByName("Effects"),
                other.x(), other.y());
        other.destroy();
        this.destroy();
    }
});

var Rotor = A_.SPRITES.Kinematic.extend({
    animSheet: "rotor.png",
    frame: {w: 45, h: 45},
    collision: {response: "static"},
    angularSpeed: Math.PI / 2,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.setAnimation("all", _.random(0, this.animations["all"].totalFrames), 0.016);
    },
    update: function () {
        this._super();
    }
});
var Explosion = A_.SPRITES.Animated.extend({
    animSheet: "Explosion.png",
    frame: {w: 128, h: 128},
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        this.addAnimation("explode", _.range(0, 17), 0.2);
        this.setAnimation("explode");
        this.animations["explode"].loop = false;
        var that = this;
        this.animations["explode"].onComplete = function () {
            that.destroy();
        };
        
        A_.game.createSound({
            urls: ['explosion.mp3'],
            volume: 0.2
        }).play();
    }
});

// VARS & CONSTS
var player;
var numRotors = 40;

// PROCEDURES
A_.game.onLevelStarted = function () {
    this.level.width = 2048;
    this.level.height = 2048;

    var layer = this.level.createImageLayer("Starfield", {image: "starfield.png"});
    layer.parallax = 10;

    var layer = this.level.createImageLayer("Nebula", {image: "nebula.png"});
    layer.parallax = 20;

    var spriteLayer = this.level.createSpriteLayer("Sprites");
    this.level.createSpriteLayer("Effects");

    player = this.camera.followee = this.createSprite(Player, spriteLayer, this.level.width / 2, this.level.height / 2);
    for (var i = 0; i < numRotors; i++) {
        this.createSprite(Rotor, spriteLayer, _.random(0, this.level.width), _.random(0, this.level.height));
    }
};