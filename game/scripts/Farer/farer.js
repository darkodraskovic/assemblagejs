// CLASSES
var Player = DODO.Kinematic.extend({
    spriteSheet: "Farer/player_farer.png",
    collisionResponse: "active",
    movementAngle: 0,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.maxVelocity.x = this.maxVelocity.y = 356;
        this.friction.x = this.friction.y = 24;
        this.origFriction = this.friction.clone();
        this.setGravity(0, 0);
        DODO.input.addMapping("left", DODO.Key.A);
        DODO.input.addMapping("right", DODO.Key.D);
        DODO.input.addMapping("down", DODO.Key.S);
        DODO.input.addMapping("up", DODO.Key.W);
        this.setAnchor(0.5, 0.5);
        this.laser1 = new Laser(this, 18, -12);
        this.laser2 = new Laser(this, 18, 12);
//        this.setSpritePoint("bullet1", 18, -12);
//        this.setSpritePoint("bullet2", 18, 12);
        this.setPoint("bullet1", 18, -12);
        this.setPoint("bullet2", 18, 12);
        this.scene.bind('leftpressed', this, this.shootBullet);
        this.scene.camera.setFollowee(this);
        player = this;
    },
    update: function () {
        var rot = DODO.angleTo(this.position, this.scene.getMousePosition());
        this.rotation = rot;

        var speedSign = 0;
        if (this.rotation < 0)
            speedSign = -1;
        else
            speedSign = 1;

        if (DODO.input.down["up"]) {
            this.movementAngle = this.rotation;
            this.acceleration.x = this.acceleration.y = 64;
        }
        else if (DODO.input.down["down"]) {
            this.movementAngle = this.rotation + Math.PI;
            this.acceleration.x = this.acceleration.y = 64;
        }
        else if (DODO.input.down["left"]) {
            this.movementAngle = this.rotation + Math.PI / 2 * speedSign;
            this.acceleration.x = this.acceleration.y = 64;
        }
        else if (DODO.input.down["right"]) {
            this.movementAngle = this.rotation + -Math.PI / 2 * speedSign;
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
        var rot = this.rotation;
//        var pos1 = this.getSpritePoint("bullet1").position;
        var pos1 = this.getPoint("bullet1");
        var bullet1 = new Bullet(this.scene.findLayerByName("Effects"), pos1.x, pos1.y);
        bullet1.rotation = (rot);
        bullet1.velocity.x = Math.cos(rot) * bullet1.maxVelocity.x;
        bullet1.velocity.y = Math.sin(rot) * bullet1.maxVelocity.y;

//        var pos2 = this.getSpritePoint("bullet2").position;
        var pos2 = this.getPoint("bullet2");
        var bullet2 = new Bullet(this.scene.findLayerByName("Effects"), pos2.x, pos2.y);
        bullet2.rotation = (rot);
        bullet2.velocity.x = Math.cos(rot) * bullet2.maxVelocity.x;
        bullet2.velocity.y = Math.sin(rot) * bullet2.maxVelocity.y;
    }
});

var Laser = DODO.Textured.extend({
    spriteSheet: "Farer/laser.png",
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.container.alpha = 0.4;
        this.setAnchor(0, 0.5);
        this.sound = DODO.getAsset('laser-beam.mp3');
        this.sound.loop(true);
        this.sound.volume(0.75);
        this.soundId = 0;

        this.origW = this.width;
        this.origH = this.height;
        var sineProps = {period: 0.5, periodRand: 25, amplitude: 3, amplitudeRand: 25};
        this.sine = new DODO.addons.Sine(this, sineProps);
        this.scene.bind('rightpressed', this, this.toggleFire.bind(this, 'on'));
        this.scene.bind('rightreleased', this, this.toggleFire.bind(this, 'off'));
    },
    update: function () {
        if (this.scene.rightdown) {
            this.width = DODO.distanceTo(this.getScenePosition(), this.scene.getMousePosition());
        }

        this.sine.update();
        this.height = this.origH + this.sine.value;
        if (this.on)
            this.width = this.width + this.sine.value;
        else
            this.width = this.origW + this.sine.value;

        this._super();
    },
    toggleFire: function (state) {
        if (state === "on") {
            this.on = true;
            this.container.alpha = 0.75;
            this.width = DODO.distanceTo(this.getScenePosition(), this.scene.getMousePosition());

            this.sound.play(function (id) {
                this.soundId = id;
            }.bind(this));
            this.sound.fade(0, 0.75, 250, null, this.soundId);
        }
        if (state === "off") {
            this.on = false;
            this.container.alpha = 0.4;
            this.width = this.origW;

            this.sound.fade(0.75, 0, 450, null, this.soundId);
        }
    }
});

var Bullet = DODO.Kinematic.extend({
    spriteSheet: "Farer/bullet.png",
    collisionResponse: "sensor",
    drawCollisionPolygon: false,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = this.friction.y = 0;
        this.maxVelocity.x = this.maxVelocity.y = 800;
        this.bounded = false;
        var sound = DODO.getAsset('bullet.wav');
        sound.volume(0.75);
        sound.play();
        this.setAnchor(0, 0.5);
        this.container.alpha = 0.75;
    },
    update: function () {
        if (this.outOfBounds) {
            this.destroy();
        }
        this._super();
    },
    collideWithStatic: function (other, response) {
        new Explosion(this.scene.findLayerByName("Effects"),
                other.position.x, other.position.y);
        other.destroy();
        this.destroy();
    }
});

var Rotor = DODO.Colliding.extend({
    spriteSheet: "Farer/rotor.png",
    frameWidth: 45,
    frameHeight: 45,
    collisionResponse: "static",
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
//        this.addAnimation("all", _.range(0, this.textures.length), 0);
        this.setAnimation("all", 0, 0.016);
        this.setAnchor(0.5, 0.5);
    },
    update: function () {
        this.rotation = (this.rotation + Math.PI / 2 * DODO.game.dt);
        this.synchCollisionPolygon();
    }
});
var Explosion = DODO.Textured.extend({
    spriteSheet: "Common/Explosion.png",
    frameWidth: 128,
    frameHeight: 128,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        var anim = this.addAnimation("explode", _.range(0, 17), 0.5);
        this.setAnimation("explode");
        anim.loop = false;
        anim.onComplete = function() {
            this.destroy();
        }.bind(this);

        DODO.getAsset('explosion.mp3').volume(0.5).play();

        this.setAnchor(0.5, 0.5);
    }
});

// VARS & CONSTS
var player;
var numRotors = 40;

// PROCEDURES
populateScene = function (scene) {
    scene.width = 2048;
    scene.height = 2048;

    var layer = new DODO.Layer(scene, "Starfield");
    layer.parallax = 10;
    new DODO.Tiling(layer, {image: "Farer/starfield.png"});

    layer = new DODO.Layer(scene, "Nebula");
    layer.parallax = 20;
    new DODO.Tiling(layer, {image: "Farer/nebula.png"});

    var spriteLayer = new DODO.Layer(scene, "Sprites");
    new DODO.Layer(scene, "Effects");

    player = new Player(spriteLayer, scene.width / 2, scene.height / 2);
    for (var i = 0; i < numRotors; i++) {
        new Rotor(spriteLayer, _.random(0, scene.width), _.random(0, scene.height));
    }
    
    window.console.log("Created FARER layers.");
};

