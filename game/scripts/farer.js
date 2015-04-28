// CLASSES
var Player = A_.SPRITES.Kinematic.extend({
    spriteSheet: "player_farer.png",
    collisionResponse: "active",
    movementAngle: 0,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.maxVelocity.x = this.maxVelocity.y = 356;
        this.friction.x = this.friction.y = 24;
        this.origFriction = this.friction.clone();
        this.setGravity(0, 0);
        A_.INPUT.addMapping("left", A_.KEY.A);
        A_.INPUT.addMapping("right", A_.KEY.D);
        A_.INPUT.addMapping("down", A_.KEY.S);
        A_.INPUT.addMapping("up", A_.KEY.W);
        this.setOrigin(0.5, 0.5);
        this.laser1 = new Laser(this, 18, -12);
        this.laser2 = new Laser(this, 18, 12);
        this.setSpritePoint("bullet1", 18, -12);
        this.setSpritePoint("bullet2", 18, 12);
        this.scene.bind('leftpressed', this, this.shootBullet);
        this.setFollowee(true);
        player = this;
    },
    update: function () {
        var rot = A_.UTILS.angleTo(this.getPosition(), this.scene.getMousePosition());
        this.setRotation(rot);

        var speedSign = 0;
        if (this.getRotation() < 0)
            speedSign = -1;
        else
            speedSign = 1;

        if (A_.INPUT.down["up"]) {
            this.movementAngle = this.getRotation();
            this.acceleration.x = this.acceleration.y = 64;
        }
        else if (A_.INPUT.down["down"]) {
            this.movementAngle = this.getRotation() + Math.PI;
            this.acceleration.x = this.acceleration.y = 64;
        }
        else if (A_.INPUT.down["left"]) {
            this.movementAngle = this.getRotation() + Math.PI / 2 * speedSign;
            this.acceleration.x = this.acceleration.y = 64;
        }
        else if (A_.INPUT.down["right"]) {
            this.movementAngle = this.getRotation() + -Math.PI / 2 * speedSign;
            this.acceleration.x = this.acceleration.y = 64;
        }
        else {
            this.acceleration.x = this.acceleration.y = 0;
        }

        var sin = Math.sin(this.movementAngle);
        var cos = Math.cos(this.movementAngle);

        this.friction.x = Math.abs(this.origFriction.x * cos);
        this.friction.y = Math.abs(this.origFriction.y * sin);

        this.acceleration.x *= cos;
        this.acceleration.y *= sin;

        this._super();

    },
    shootBullet: function () {
        var rot = this.getRotation();
        var pos1 = this.getSpritePoint("bullet1").getPosition();
        var bullet1 = new Bullet(this.scene.findLayerByName("Effects"), pos1.x, pos1.y);
        bullet1.setRotation(rot);
        bullet1.velocity.x = Math.cos(rot) * bullet1.maxVelocity.x;
        bullet1.velocity.y = Math.sin(rot) * bullet1.maxVelocity.y;

        var pos2 = this.getSpritePoint("bullet2").getPosition();
        var bullet2 = new Bullet(this.scene.findLayerByName("Effects"), pos2.x, pos2.y);
        bullet2.setRotation(rot);
        bullet2.velocity.x = Math.cos(rot) * bullet2.maxVelocity.x;
        bullet2.velocity.y = Math.sin(rot) * bullet2.maxVelocity.y;
    }
});

var Laser = A_.SPRITES.Animated.extend({
    spriteSheet: "laser.png",
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.sprite.alpha = 0.4;
        this.setOrigin(0, 0.5);
        this.baseScale = {x: 0.3, y: 1};
        this.sound = A_.UTILS.getAsset('laser-beam.mp3');
        this.sound.loop(true);
        this.sound.volume(0.75);
        this.soundId = 0;

        this.origW = this.getWidth();
        this.origH = this.getHeight();
        var sineProps = {period: 0.5, periodRand: 25, amplitude: 3, amplitudeRand: 25};
        this.sine = new A_.SPRITES.Addons.Sine(this, sineProps);
        this.scene.bind('rightpressed', this, this.toggleFire.bind(this, 'on'));
        this.scene.bind('rightreleased', this, this.toggleFire.bind(this, 'off'));
    },
    update: function () {
        if (this.scene.rightdown) {
            this.setWidth(A_.UTILS.distanceTo(this.getPositionScene(), this.scene.getMousePosition()));
        }

        this.sine.update();
        this.setHeight(this.origH + this.sine.value);
        if (this.on)
            this.setWidth(this.getWidth() + this.sine.value);
        else
            this.setWidth(this.origW + this.sine.value);

        this._super();
    },
    toggleFire: function (state) {
        if (state === "on") {
            this.on = true;
            this.sprite.alpha = 0.75;
            this.setWidth(A_.UTILS.distanceTo(this.getPositionScene(), this.scene.getMousePosition()));

            this.sound.play(function (id) {
                this.soundId = id;
            }.bind(this));
            this.sound.fade(0, 0.75, 250, null, this.soundId);
        }
        if (state === "off") {
            this.on = false;
            this.sprite.alpha = 0.4;
            this.setWidth(this.origW);

            this.sound.fade(0.75, 0, 450, null, this.soundId);
        }
    }
});

var Bullet = A_.SPRITES.Kinematic.extend({
    spriteSheet: "bullet.png",
    collisionResponse: "sensor",
    drawCollisionPolygon: false,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = this.friction.y = 0;
        this.maxVelocity.x = this.maxVelocity.y = 800;
        this.bounded = false;
        var sound = A_.UTILS.getAsset('bullet.wav');
        sound.volume(0.75);
        sound.play();
        this.setOrigin(0, 0.5);
        this.sprite.alpha = 0.75;
    },
    update: function () {
        if (this.outOfBounds) {
            this.destroy();
        }
        this._super();
    },
    collideWithStatic: function (other, response) {
        new Explosion(this.scene.findLayerByName("Effects"),
                other.getX(), other.getY());
        other.destroy();
        this.destroy();
    }
});

var Rotor = A_.SPRITES.Colliding.extend({
    spriteSheet: "rotor.png",
    frameWidth: 45,
    frameHeight: 45,
//    collisionResponse: "static",
//    angularSpeed: Math.PI / 2,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.setAnimation("all", _.random(0, this.animations["all"].totalFrames), 0.016);
        this.setOrigin(0.5, 0.5);
    },
    update: function () {
        this.setRotation(this.getRotation() + Math.PI / 2 * A_.game.dt);
        this.synchCollisionPolygon();
    }
});
var Explosion = A_.SPRITES.Animated.extend({
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

        A_.UTILS.getAsset('explosion.mp3').volume(0.5).play();

        this.setOrigin(0.5, 0.5);
    }
});

// VARS & CONSTS
var player;
var numRotors = 40;

// PROCEDURES
populateScene = function (scene) {
    scene.setWidth(2048);
    scene.setHeight(2048);

    var layer = new A_.SCENE.Layer(scene, "Starfield");
    new A_.SPRITES.TilingSprite(layer, {image: "starfield.png"});
    layer.parallax = 10;

    layer = new A_.SCENE.Layer(scene, "Nebula");
    new A_.SPRITES.TilingSprite(layer, {image: "nebula.png"});
    layer.parallax = 20;

    var spriteLayer = new A_.SCENE.Layer(scene, "Sprites");
    new A_.SCENE.Layer(scene, "Effects");

    window.console.log("created FARER layers");

    player = new Player(spriteLayer, scene.width / 2, scene.height / 2);
    for (var i = 0; i < numRotors; i++) {
        new Rotor(spriteLayer, _.random(0, scene.width), _.random(0, scene.height));
    }
};

