// CLASSES
var Player = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "player.png",
    collisionResponse: "active",
//    collisionOffset: {x: 12, y: 12},
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        this.speed.x = 512;
        this.speed.y = 512;

        A_.INPUT.addMapping("left", A_.KEY.A);
        A_.INPUT.addMapping("right", A_.KEY.D);
        A_.INPUT.addMapping("down", A_.KEY.S);
        A_.INPUT.addMapping("up", A_.KEY.W);
    },
    onCreation: function () {
        this.laser1 = A_.game.createSprite(Laser, this, 18, -12);
        this.laser2 = A_.game.createSprite(Laser, this, 18, 12);
    },
    update: function () {
        var rot = A_.UTILS.angleTo(this.getPosition(), A_.game.mousePosition.level);
        this.setRotation(rot);
        if (A_.INPUT.down["up"]) {
            this.velocity.y = this.speed.y * Math.sin(rot);
            this.velocity.x = this.speed.x * Math.cos(rot);
        }
        if (A_.INPUT.down["down"]) {
            this.velocity.y = -this.speed.y * Math.sin(rot);
            this.velocity.x = -this.speed.x * Math.cos(rot);
        }
        var speedSign = 0;
        if (this.getRotation() < 0)
            speedSign = -1;
        else
            speedSign = 1;
        if (A_.INPUT.down["left"]) {
            this.velocity.y = speedSign * this.speed.y * Math.sin(rot + Math.PI / 2);
            this.velocity.x = speedSign * this.speed.x * Math.cos(rot + Math.PI / 2);
        }
        if (A_.INPUT.down["right"]) {
            this.velocity.y = -speedSign * this.speed.y * Math.sin(rot + Math.PI / 2);
            this.velocity.x = -speedSign * this.speed.x * Math.cos(rot + Math.PI / 2);
        }
        this._super();

        if (A_.game.leftpressed) {
            this.shootBullet();
        }
    },
    shootBullet: function () {
        var pos1 = this.getSpriteAt(0).getLevelPosition();
        var bullet1 = A_.game.createSprite(Bullet, A_.level.findLayerByName("Effects"), pos1.x, pos1.y);
        bullet1.setRotation(this.getRotation());
        bullet1.velocity.y = bullet1.speed * Math.sin(bullet1.getRotation());
        bullet1.velocity.x = bullet1.speed * Math.cos(bullet1.getRotation());
        var pos2 = this.getSpriteAt(1).getLevelPosition();
        var bullet2 = A_.game.createSprite(Bullet, A_.level.findLayerByName("Effects"), pos2.x, pos2.y);
        bullet2.setRotation(this.getRotation());
        bullet2.velocity.y = bullet1.speed * Math.sin(bullet1.getRotation());
        bullet2.velocity.x = bullet1.speed * Math.cos(bullet1.getRotation());        
    },
});

var Laser = A_.SPRITES.AnimatedSprite.extend({
    animSheet: "laser.png",
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        this.setAnchor(0, 0.5);
        this.setAlpha(0.4);
        this.baseScale = {x: 0.3, y: 1};
        this.sound = A_.game.createSound({
            urls: ['laser-beam.mp3'],
            loop: true,
            volume: 0.75
        });
        this.soundId = 0;

        this.origW = this.getWidth();
        this.origH = this.getHeight();
        A_.EXTENSIONS.Sine.addTo(this, {period: 0.5, periodRand: 25, value: 3, valueRand: 25});
    },
    update: function () {
        if (A_.game.rightpressed) {
            this.toggleFire("on");
        }
        if (A_.game.rightreleased) {
            this.toggleFire("off");
        }
        if (A_.game.rightdown) {
            this.setWidth(A_.UTILS.distanceTo(this.getLevelPosition(), A_.game.mousePosition.level));
        }
//        else
//            this.setWidth(A_.UTILS.distanceTo(this.getPosition(), A_.game.mousePosition.level) * 0.2);

        this._super();
        var val = this.sine.computeValue();

        this.setHeight(this.origH + val);
        if (this.on)
            this.setWidth(this.getWidth() + val);
        else this.setWidth(this.origW + val);
    },
    toggleFire: function (state) {
        if (state === "on") {
            this.on = true;
            this.setAlpha(0.75);
            this.setWidth(A_.UTILS.distanceTo(this.getLevelPosition(), A_.game.mousePosition.level));

            this.sound.play(function (id) {
                this.soundId = id;
            }.bind(this));
            this.sound.fade(0, 0.75, 250, null, this.soundId);
        }
        if (state === "off") {
            this.on = false;
            this.setAlpha(0.4);
            this.setWidth(this.origW);

            this.sound.fade(0.75, 0, 450, null, this.soundId);
        }
    }
});

var Bullet = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "bullet.png",
    collisionResponse: "sensor",
//    drawDebugGraphics: false,
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        this.friction.x = this.friction.y = 0;
        this.maxVelocity.x = this.maxVelocity.y = 2000;
        this.speed = 1000;
        this.bounded = false;
        A_.game.createSound({
            urls: ['bullet.wav'],
            volume: 0.75
        }).play();
    },
    onCreation: function () {
        this.setAlpha(0.75);
        this.setAnchor(0, 0.5);
    },
    update: function () {
        this._super();
        if (this.outOfBounds) {
            this.destroy();
        }
    },
    collideWithStatic: function (other, response) {
        A_.game.createSprite(Explosion, A_.level.findLayerByName("Effects"),
                other.getPositionX(), other.getPositionY());
        other.destroy();
        this.destroy();
    }
});

var Rotor = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "rotor.png",
    frame: {w: 45, h: 45},
    collisionResponse: "static",
    angularSpeed: Math.PI / 2,
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        this.setAnimation("all", _.random(0, this.animations["all"].totalFrames), 0.025);
    },
    update: function () {
        this._super();
    }
});

var Explosion = A_.SPRITES.AnimatedSprite.extend({
    animSheet: "Explosion.png",
    frame: {w: 128, h: 128},
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);

        this.addAnimation("explode", _.range(0, 17), 0.3);
        this.setAnimation("explode");
        this.animations["explode"].loop = false;
        var that = this;
        this.animations["explode"].onComplete = function () {
            that.destroy();
        };
        A_.game.createSound({
            urls: ['explosion.mp3'],
            volume: 0.6
        }).play();
    },
});

// VARS & CONSTS
var player;
var numRotors = 40;

// PROCEDURES
A_.game.onLevelStarted = function () {
    this.level.width = 2048;
    this.level.height = 2048;

    var layer = this.level.createImageLayer({image: "starfield.png"});
    layer.parallax = 10;

    var layer = this.level.createImageLayer({image: "nebula.png"});
    layer.parallax = 20;

    var spriteLayer = this.level.createSpriteLayer();
    var effectsLayer = this.level.createSpriteLayer();
    effectsLayer.name = "Effects";

    player = this.camera.followee = this.createSprite(Player, spriteLayer, this.level.width / 2, this.level.height / 2);
    for (var i = 0; i < numRotors; i++) {
        this.createSprite(Rotor, spriteLayer, _.random(0, this.level.width), _.random(0, this.level.height));
    }        
};