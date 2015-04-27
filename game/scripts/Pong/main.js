var Text = A_.SPRITES.Text.extend({
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.initMouseReactivity();
        this.setMouseReactivity(true);
        this.scene.setScale(2);
    }
});

// MAIN MENU
var StartText = Text.extend({
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.bind('leftpressed', this, function () {
            this.scene.pause();
            sceneManager.startScene(pong, "playground", "Pong/playground.json");
        });
    }
});

// HUD
var PointsText = Text.extend({
    points: 0,
    update: function () {
        this.sprite.setText(this.points);

        this._super();
    }
});

// ENTITIES
var Ball = A_.SPRITES.Kinematic.extend({
    spriteSheet: "Pong/ball.png",
    collisionResponse: "lite",
    drawCollisionPolygon: false,
    elasticity: 1,
    bounceTreshold: 0,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 0;
        this.friction.y = 0;
        this.maxVelocity.x = this.maxVelocity.y = 224;
        this.setGravity(0, 0);
        this.velocity.x = this.maxVelocity.x;
        this.velocity.y = _.random(-this.maxVelocity.y, this.maxVelocity.y);
        this.setOrigin(0.5, 0.5);
        this.scene.bind('created', this, function () {
            this.pointsText = this.scene.findSpriteByClass(PointsText);
        });
        this.breakSound = this.scene.createSound({
            urls: ['Pong/xylo1.wav'],
            volume: 1
        });
        this.bounceSound = this.scene.createSound({
            urls: ['Pong/bounce.wav'],
            volume: 1
        });
    },
    update: function () {
        if (this.getX() > this.scene.getWidth()) {
            sceneManager.destroyScene(this.scene);
            sceneManager.findSceneByName("mainMenu").play();
        }
        this._super();
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);
        if (response.overlap) {
            this.breakSound.play();
            other.destroy();
            this.pointsText.points++;
        }
    },
    collideWithKinematic: function (other, response) {
        this._super(other, response);
        if (response.overlap) {
            if (other instanceof Bar) {
                this.velocity.y += other.velocity.y * 0.75;
                this.bounceSound.play();
            }
        }
    }
});

var Bar = A_.SPRITES.Kinematic.extend({
    spriteSheet: "Pong/bar.png",
    collisionResponse: "active",
    drawCollisionPolygon: false,
    elasticity: 1,
    bounceTreshold: 0,
    velocityStep: 64,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 32;
        this.friction.y = 32;
        this.maxVelocity.x = this.maxVelocity.y = 288;
        this.setGravity(0, 0);

        A_.INPUT.addMapping("down", A_.KEY.S);
        A_.INPUT.addMapping("up", A_.KEY.W);
    },
    update: function () {
        if (A_.INPUT.down["up"]) {
            this.velocity.y -= this.velocityStep;
        }
        if (A_.INPUT.down["down"]) {
            this.velocity.y += this.velocityStep;
        }
        this._super();
    }
});

var Brick = A_.SPRITES.Colliding.extend({
    spriteSheet: "Pong/brick.png",
    drawCollisionPolygon: false,
    frameWidth: 16,
    frameHeight: 32,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.setAnimation("all");
        this.currentAnimation.gotoAndStop(_.random(0, 1));
    }
});