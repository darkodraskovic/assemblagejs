var Text = DODO.Text.extend({
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.initMouseReactivity();
        this.setMouseReactivity(true);
        this.scene.setScale(2);
//        this.sprite.style = {fill: 'green'};
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
        this.container.text = this.points;
        this._super();
    }
});

// ENTITIES
var Ball = DODO.Kinematic.extend({
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
        this.setAnchor(0.5, 0.5);
        this.scene.bind('created', this, function () {
            this.pointsText = this.scene.findSpriteByClass(PointsText);
        });
        this.breakSound = DODO.getAsset('Pong/xylo1.wav');
        this.bounceSound = DODO.getAsset('Pong/bounce.wav');
    },
    update: function () {
        if (this.position.x > this.scene.width) {
            this.scene.destroy();
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

var Bar = DODO.Kinematic.extend({
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

        DODO.input.addMapping("down", DODO.Key.S);
        DODO.input.addMapping("up", DODO.Key.W);
    },
    update: function () {
        if (DODO.input.down["up"]) {
            this.velocity.y -= this.velocityStep;
        }
        if (DODO.input.down["down"]) {
            this.velocity.y += this.velocityStep;
        }
        this._super();
    }
});

var Brick = DODO.Colliding.extend({
    spriteSheet: "Pong/brick.png",
    drawCollisionPolygon: false,
    frameWidth: 16,
    frameHeight: 32,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.setAnimation("all");
        this.getAnimation().gotoAndStop(_.random(0, 1));
    }
});