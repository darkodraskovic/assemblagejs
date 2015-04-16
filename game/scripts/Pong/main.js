var controller;
var level;

var GameController = A_.SPRITES.Graphics.extend({
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        controller = this;
        level = this.level;
        this.level.setScale(2);
    }
});

// MENUS
var Text = A_.SPRITES.Text.extend({
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.initMouseReactivity();
        this.setMouseReactivity(true);
    },
    update: function () {
        if (this.leftpressed) {
            levelManager.deactivateLevel(this.level.name);
            levelManager.startLevel(pongPlayground, "playground");
        }

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
//    wrap: true,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 0;
        this.friction.y = 0;
        this.maxVelocity.x = this.maxVelocity.y = 192;
        this.setGravity(0, 0);
        this.velocity.x = this.maxVelocity.x;
        this.velocity.y = _.random(-this.maxVelocity.y, this.maxVelocity.y);
        this.setOrigin(0.5, 0.5);
    },
    update: function () {
        if (this.getX() > this.level.getWidth()) {
            levelManager.stopLevel(this.level.name);
            levelManager.activateLevel("mainMenu");
        }

        this._super();
    }
});

var Bar = A_.SPRITES.Kinematic.extend({
    spriteSheet: "Pong/bar.png",
    collisionResponse: "active",
    drawCollisionPolygon: false,
    elasticity: 1,
    bounceTreshold: 0,
    velocityStep: 128,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 64;
        this.friction.y = 64;
        this.maxVelocity.x = this.maxVelocity.y = 256;
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
 