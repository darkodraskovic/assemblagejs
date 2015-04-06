var Player = Anime.extend({
    spriteSheet: "diskette/player.png",
    followee: true,
    throwForce: 750,
    throwTimer: 0,
    throwTime: 0.75,
    jumpForce: 680,
//    jumpForce: 600,
    speed: 500,
    mass: 0.4,
    drawCollisionPolygon: true,
//    elasticity: 0.5,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        A_.game.renderer.view.style.cursor = "url(game/graphics/diskette/crosshair.png), auto";
        A_.game.renderer.view.addEventListener("mouseover", function (event) {
            A_.game.renderer.view.style.cursor = "url(game/graphics/diskette/crosshair.png), auto";
        });

        A_.INPUT.addMapping("left", A_.KEY.A);
        A_.INPUT.addMapping("right", A_.KEY.D);
        A_.INPUT.addMapping("jump", A_.KEY.SPACE);
        A_.INPUT.addMapping("crouch", A_.KEY.S);

        this.throwSound = this.level.createSound({
            urls: ['diskette/throw.ogg'],
            volume: 1
        });

        this.initMouseReactivity();
        this.setMouseReactivity(true);
        this.setSpritePoint("ball", 0, -this.getHeight() / 3);

//        this.dynamicsMap = this.level.findLayerByName("Dynamics").tilemap;

        this.progressBarInner = this.level.createSprite(ProgressBarInner, this.level.findLayerByName("HUD"), this.getX(), this.getY(),
                {color: A_.UTILS.Colors.purple, alpha: 0.75, owner: this});
        this.progressBarInner.setVisible(false);

        this.setOrigin(0.5, 0.5);
        // TODO
        this.uprightPolygon = this.collisionPolygon;
        this.collisionWidth = this.collisionPolygon.w;
        this.collisionHeight = this.collisionPolygon.h * 0.65;
        this.collisionOffsetY = this.collisionPolygon.h * 0.175;
        this.crouchPolygon = this.createCollisionPolygon();
    },
    processControls: function () {
        if (A_.INPUT.down["right"] || A_.INPUT.down["left"]) {
            if (A_.INPUT.down["right"]) {
                this.velocity.x = this.speed;
            }
            else if (A_.INPUT.down["left"]) {
                this.velocity.x = -this.speed;
            }
            if (this.standing) {
                this.platformerState = "walking";
            }

        }
        else if (this.standing && A_.INPUT.down["crouch"]) {
            this.platformerState = "crouching";
        }
        else {
            this.platformerState = "idle";
        }
        if (!this.standing) {
            this.platformerState = "falling";
        }

        if (this.platformerState === "crouching") {
            this.setCollisionPolygon(this.crouchPolygon);
        }
        else {
            this.setCollisionPolygon(this.uprightPolygon);
        }
        if (A_.INPUT.down["jump"]) {
            if (this.standing) {
                this.velocity.y = this.gravityN.y < 0 ? this.jumpForce : -this.jumpForce;
            }
        }
    },
    processFacing: function () {
        var mousePosition = this.level.getMousePosition();
        if (mousePosition.x < this.getX()) {
            this.facing = "left";
        } else {
            this.facing = "right";
        }
    },
    update: function () {
//        window.console.log(this.standing);
//        window.console.log(this.velocity.y);
//        window.console.log(this.sprite.scale);

        this.processControls();
        this.processFacing();

        if (this.level.leftpressed) {
//            this.throwTimerRunning = true;
//            this.throwTimer = 0;
//            this.progressBarInner.setVisible(true);
        }
        if (this.level.leftreleased) {
//            this.throwBall(this.progressBarInner.percent.map(0, 100, 0, this.throwForce));
            this.throwBall(this.throwForce);
//            this.progressBarInner.percent = 0;
//            this.progressBarInner.setVisible(false);
        }
//        if (this.level.leftdown) {
//            if (this.throwTimerRunning) {
//                this.throwTimer += A_.game.dt;
//                this.progressBarInner.percent = this.throwTimer.map(0, this.throwTime, 0, 100).clamp(0, 100);
//            }
//        }
        if (this.level.rightpressed) {
            if (this.throwTimerRunning) {
                this.throwTimerRunning = false;
            }
            else
                this.throwTimerRunning = true;
        }

        this._super();
    },
    throwBall: function (force) {
//        var point = this.getSpritePoint("ball");
//        var ball = this.level.createSprite(Ball, this.layer, point.getX(), point.getY());
//        var ball = this.level.createSprite(Ball, this.layer, this.getX(), this.aabbTop());
        var ball = this.level.createSprite(Ball, this.layer, this.getX(), this.aabbTop() + (this.platformerState === "crouching" ? 16 : 20));
        var angle = A_.UTILS.angleTo(this.getPosition(), this.level.getMousePosition());
        ball.velocity.x = force * Math.cos(angle);
        ball.velocity.y = force * Math.sin(angle);
        this.throwSound.play();
    }
});

var alpha = 0.75;
var ProgressBarInner = A_.SPRITES.Sprite.extend({
    frameWidth: 124,
    frameHeight: 20,
    graphics: true,
    padding: 2,
    percent: 0,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.sprite.beginFill(this.color, this.alpha);
        this.sprite.drawRect(0, 0, this.frameWidth, this.frameHeight);
        this.sprite.endFill();
        this.progressBarOuter = this.level.createSprite(ProgressBarOuter, this.level.findLayerByName("HUD"), this.getX(), this.getY(),
                {color: A_.UTILS.Colors.darkslategray, alpha: 0.75, owner: this.owner});
        this.addon("PinTo", {parent: this.progressBarOuter, name: "inner", offsetX: 2, offsetY: 2});
    },
    update: function () {
        this.setScaleX(this.percent / 100);
        this._super();
    },
    setVisible: function (visible) {
        this.sprite.visible = visible;
        this.progressBarOuter.sprite.visible = visible;
    }
});
var ProgressBarOuter = A_.SPRITES.Sprite.extend({
    frameWidth: 128,
    frameHeight: 24,
    graphics: true,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.sprite.lineStyle(2, this.color, this.alpha);
        this.sprite.drawRect(0, 0, this.frameWidth, this.frameHeight);
        this.sprite.endFill();
    },
    update: function () {
        var mousePosition = this.level.getMousePosition();
        if (mousePosition.x < this.owner.getX()) {
            this.setPosition(mousePosition.x, mousePosition.y);
        } else {
            this.setPosition(mousePosition.x - this.getWidth(), mousePosition.y);
        }
    }
});