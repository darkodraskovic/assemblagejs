var Player = Anime.extend({
    spriteSheet: "diskette/player.png",
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

        DODO.game.renderer.view.style.cursor = "url(game/graphics/diskette/crosshair.png), auto";
        DODO.game.renderer.view.addEventListener("mouseover", function (event) {
            DODO.game.renderer.view.style.cursor = "url(game/graphics/diskette/crosshair.png), auto";
        });

        DODO.input.addMapping("left", DODO.Key.A);
        DODO.input.addMapping("right", DODO.Key.D);
        DODO.input.addMapping("jump", DODO.Key.SPACE);
        DODO.input.addMapping("crouch", DODO.Key.S);

        this.scene.bind('leftpressed', this, function () {
            this.throwTimerRunning = true;
            this.throwTimer = 0;
            this.progressBarInner.setVisible(true);
        });
        this.scene.bind('leftreleased', this, function () {
            this.throwBall(this.progressBarInner.percent.map(0, 100, 0, this.throwForce));
            this.progressBarInner.percent = 0;
            this.progressBarInner.setVisible(false);
        });
        this.scene.bind('rightpressed', this, function () {
            if (this.throwTimerRunning) {
                this.throwTimerRunning = false;
            }
            else
                this.throwTimerRunning = true;
        });

        this.throwSound = DODO.getAsset('diskette/throw.ogg');

        this.initMouseReactivity();
        this.setMouseReactivity(true);
        this.setPoint("ball", 0, -this.getHeight() / 3);

        this.scene.bind('created', this, function () {
            this.progressBarInner = new ProgressBarInner(this.scene.findLayerByName("Entities"),
                    this.getX(), this.getY(),
                    {color: DODO.Colors.purple, alpha: 0.75, owner: this});
            this.progressBarInner.setVisible(false);
        })

        // TODO
        this.uprightPolygon = this.collisionPolygon;
        this.collisionWidth = this.collisionPolygon.w;
        this.collisionHeight = this.collisionPolygon.h * 0.65;
        this.collisionOffsetY = (this.collisionPolygon.h - this.collisionHeight);
        this.crouchPolygon = this.createCollisionPolygon();

        this.setOrigin(0.5, 0);
        this.setFollowee(true);
    },
    processControls: function () {
        if (DODO.input.down["right"] || DODO.input.down["left"]) {
            if (DODO.input.down["right"]) {
                this.velocity.x = this.speed;
            }
            else if (DODO.input.down["left"]) {
                this.velocity.x = -this.speed;
            }
            if (this.standing) {
                this.platformerState = "walking";
            }

        }
        else if (DODO.input.down["crouch"]) {
            this.platformerState = "crouching";
        }
        else if (this.standing) {
            this.platformerState = "idle";
        }
        if (!this.standing && this.platformerState !== "crouching") {
            this.platformerState = "falling";
        }

        if (this.platformerState === "crouching") {
            this.setCollisionPolygon(this.crouchPolygon);
        }
        else {
            this.setCollisionPolygon(this.uprightPolygon);
        }

        if (DODO.input.down["jump"]) {
            if (this.standing) {
                this.velocity.y = this.gravityN.y < 0 ? this.jumpForce : -this.jumpForce;
            }
        }
    },
    processFacing: function () {
        var mousePosition = this.scene.getMousePosition();
        if (mousePosition.x < this.getX()) {
            this.facing = "left";
        } else {
            this.facing = "right";
        }
    },
    update: function () {
        this.processControls();
        this.processFacing();

        if (this.scene.leftdown) {
            if (this.throwTimerRunning) {
                this.throwTimer += DODO.game.dt;
                this.progressBarInner.percent = this.throwTimer.map(0, this.throwTime, 0, 100).clamp(0, 100);
            }
        }

        this._super();
    },
    throwBall: function (force) {
        var ball = new Ball(this.layer, this.getX(), this.aabbTop() + (this.platformerState === "crouching" ? 16 : 20));
        var angle = DODO.angleTo(this.getPosition(), this.scene.getMousePosition());
        ball.velocity.x = force * Math.cos(angle);
        ball.velocity.y = force * Math.sin(angle);
        this.throwSound.play();
    }
});

var alpha = 0.75;
var ProgressBarInner = DODO.Graphics.extend({
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
        this.progressBarOuter = new ProgressBarOuter(this.scene.findLayerByName("Entities"), this.getX(), this.getY(),
                {color: DODO.Colors.darkslategray, alpha: 0.75, owner: this.owner});
        this.pinTo = new DODO.addons.PinTo(this, {parent: this.progressBarOuter, name: "inner", offsetX: 2, offsetY: 2});
    },
    update: function () {
        this.pinTo.update();
        this.setScaleX(this.percent / 100);
        this._super();
    },
    setVisible: function (visible) {
        this.sprite.visible = visible;
        this.progressBarOuter.sprite.visible = visible;
    }
});
var ProgressBarOuter = DODO.Graphics.extend({
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
        var mousePosition = this.scene.getMousePosition();
        if (mousePosition.x < this.owner.getX()) {
            this.setPosition(mousePosition.x, mousePosition.y);
        } else {
            this.setPosition(mousePosition.x - this.getWidth(), mousePosition.y);
        }
    }
});