// CLASSES
var Player = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "player.png",
    collisionResponse: "active",
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
        var effectsLayer = A_.level.findLayerByName("Effects");
        this.laser1 = A_.game.createSprite(Laser, effectsLayer,
                this.getPositionX(), this.getPositionY(),
                {pinTo: {parent: this, name: "laser1", offsetX: 20, offsetY: -12}});

        this.laser2 = A_.game.createSprite(Laser, effectsLayer,
                this.getPositionX(), this.getPositionY(),
                {pinTo: {parent: this, name: "laser2", offsetX: 20, offsetY: 12}});
    },
    update: function () {
        var rot = A_.UTILS.angleTo(this.getPosition(), A_.game.mousePosition.level);
        this.setRotation(rot);
        if (A_.INPUT.down["up"]) {
            this.velocity.y = this.speed.y * Math.sin(rot);
            this.velocity.x = this.speed.x * Math.cos(rot);
        }
        if (A_.INPUT.down["down"]) {
            this.velocity.y = -this.speed.y / 3 * Math.sin(rot);
            this.velocity.x = -this.speed.x / 3 * Math.cos(rot);
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
    }
});

var Laser = A_.SPRITES.AnimatedSprite.extend({
    animSheet: "laser.png",
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        this.currentAnimation.anchor.x = 0;
        this.setAlpha(0.4);
        this.setScale(0.25, 1);
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
        if (A_.game.leftpressed) {
            this.toggleFire("on");
        }
        if (A_.game.leftreleased) {
            this.toggleFire("off");
        }
        if (A_.game.leftdown) {
            this.setWidth(A_.UTILS.distanceTo(this.getPosition(), A_.game.mousePosition.level));
        } else
            this.setWidth(A_.UTILS.distanceTo(this.getPosition(), A_.game.mousePosition.level) * 0.5);

        this._super();
        var val = this.sine.computeValue();

        this.setHeight(this.origH + val);
        this.setWidth(this.getWidth() + val)
    },
    toggleFire: function (state) {
        if (state === "on") {
            this.setAlpha(0.8);
            this.setWidth(A_.UTILS.distanceTo(this.getPosition(), A_.game.mousePosition.level));

            this.sound.play(function (id) {
                this.soundId = id;
            }.bind(this));
            this.sound.fade(0, 0.75, 250, null, this.soundId);
        }
        if (state === "off") {
            this.setAlpha(0.4);
            this.setWidth(this.origW);

            this.sound.fade(0.75, 0, 450, null, this.soundId);
        }
    }
});
Laser.inject(A_.MODULES.pinTo);

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