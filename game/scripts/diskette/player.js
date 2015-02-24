var Player = Anime.extend({
    spriteSheet: "diskette/player.png",
    followee: true,
//    elasticity: 0.5,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        A_.INPUT.addMapping("left", A_.KEY.A);
        A_.INPUT.addMapping("right", A_.KEY.D);
        A_.INPUT.addMapping("jump", A_.KEY.SPACE);

        this.throwSound = this.level.createSound({
            urls: ['diskette/throw.ogg'],
            volume: 1
        });

        this.initMouseReactivity();
        this.setMouseReactivity(true); 
        this.setSpritePoint("ball", 0, -this.getHeight() / 3);
        
        this.dynamicsMap = this.level.findLayerByName("Dynamics").tilemap;
    },
    processControls: function () {       
        if (A_.INPUT.down["right"] || A_.INPUT.down["left"]) {
            this.applyForce = true;
            if (A_.INPUT.down["right"] && A_.INPUT.down["left"]) {
                this.applyForce = false;
            }
            else if (A_.INPUT.down["right"]) {
                this.facing = "right";
            }
            else if (A_.INPUT.down["left"]) {
                this.facing = "left";
            }
        }
        else {
            this.applyForce = false;
        }

        if (A_.INPUT.down["jump"]) {
            if (this.standing) {
                this.velocity.y = this.gravityN.y < 0 ? this.jumpForce : -this.jumpForce;
            }
        }
    },
    update: function () {
        this.processControls();

        if (this.level.leftpressed) {
            this.throwBall();
        }
        if (this.rightpressed) {
            window.console.log("giggle");
        }

        this._super();
    },
    throwBall: function () {
        var point = this.getSpritePoint("ball");
        var ball = this.level.createSprite(Ball, this.layer, point.getX(), point.getY());
        var angle = A_.UTILS.angleTo(this.getPosition(), this.level.getMousePosition());
        ball.velocity.x = ball.maxVelocity.x * Math.cos(angle);
        ball.velocity.y = ball.maxVelocity.y * Math.sin(angle);
        this.throwSound.play();
    }
});