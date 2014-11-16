A_.SPRITES.Sprite = Class.extend({
    image: null,
    frame: null,
    baseTexture: null,
    rectangle: null,
    bounded: true,
    prevOverlapN: new SAT.Vector(0, 0),
    collisionOffsetX: 0,
    collisionOffsetY: 0,
    init: function () {
        if (this.image) {
            this.sprite = new PIXI.Sprite.fromImage(this.image);
        } else if (this.frame) {
            this.sprite = new PIXI.Sprite.fromFrame(this.frame);
        } else if (this.baseTexture) {
            this.sprite = new PIXI.Texture(this.baseTexture, this.rectangle);
        } else
            this.sprite = new PIXI.DisplayObjectContainer();

        this.sprite.anchor = new PIXI.Point(0.5, 0.5);

//        this.position = new PIXI.Point(0, 0);
        this.rotation = 0;

        this.width = 1;
        this.height = 1;

        this.alpha = 1;

    },
    setPosition: function (x, y) {
        this.sprite.position.x = x;
        this.sprite.position.y = y;
        if (this.collides) {
            this.updateCollisionPolygon();
        }
    },
    getPosition: function () {
        return this.sprite.position;
    },
    setSize: function (x, y) {
        this.width = x;
        this.height = y;
    },
    getSize: function () {
        return {width: this.sprite.width, height: this.sprite.height};
    },
    setScale: function (x, y) {
        this.sprite.scale = new PIXI.Point(x, y);
        if (this.collides) {
            this.collisionPolygon.setScale(x, y);
        }
    },
    getScale: function () {
        return this.sprite.scale;
    },
    setCollision: function (polygon) {
        if (!this.collisionW)
            this.collisionW = this.width;
        if (!this.collisionH)
            this.collisionH = this.height;

        if (polygon) {
            game.collider.activateCollisionFor(this, polygon);
        }
        else {
            game.collider.activateCollisionFor(this, polygon, this.collisionW, this.collisionH,
                    this.collisionW / 2 - this.collisionOffsetX, this.collisionH / 2 - this.collisionOffsetY);
        }
    },
    update: function () {

    },
    postupdate: function () {
        this.sprite.rotation = this.rotation;
        this.sprite.alpha = this.alpha;

        if (this.bounded) {
            var pos = this.getPosition();
            this.setPosition(Math.max(this.collisionPolygon.w / 2, Math.min(pos.x, game.gameWorld.width - this.collisionPolygon.w / 2)),
                    Math.max(this.collisionPolygon.h / 2, Math.min(pos.y, game.gameWorld.height - this.collisionPolygon.h / 2)));
        }

        if (this.collides) {
            this.updateCollisionPolygon();
        }
    },
    // COLLISION callbacks
    collideWithStatic: function (other, response) {
        var pos = this.getPosition();
        this.setPosition(pos.x - response.overlapV.x, pos.y - response.overlapV.y);
        this.prevOverlapN = response.overlapN;
    },
    collideWithDynamic: function (other, response) {
        if (this.collisionType === "static" || this.collisionType === "sensor")
            return;

        if (this.collisionResponse === "passive" && other.collisionResponse === "passive")
            return;

        var pos = this.getPosition();
        if (this.collisionPolygon === response.a) {
            this.setPosition(pos.x - response.overlapV.x / 2, pos.y - response.overlapV.y / 2);
        } else {
            this.setPosition(pos.x + response.overlapV.x / 2, pos.y + response.overlapV.y / 2);
        }
    },
    collideWithSensor: function (other, response) {

    }
});

A_.SPRITES.AnimatedSprite = A_.SPRITES.Sprite.extend({
    animSheet: null,
    frameW: null,
    frameH: null,
    currentAnimation: null,
    init: function () {
        this._super();
        this.animations = {};

        if (this.animSheet) {
            this.baseTexture = new PIXI.BaseTexture.fromImage(this.animSheet, PIXI.scaleModes.LINEAR);
            if (!this.frameW) {
                this.frameW = this.baseTexture.width;
            }
            if (!this.frameH) {
                this.frameH = this.baseTexture.height;
            }

            var colls = Math.round(this.baseTexture.width / this.frameW);
            var rows = Math.round(this.baseTexture.height / this.frameH);

            this.textures = [];
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < colls; j++)
                    this.textures[this.textures.length] = new PIXI.Texture(this.baseTexture,
                            new PIXI.Rectangle(j * this.frameW, i * this.frameH,
                                    this.frameW, this.frameH));
            }
            this.addAnimation("default", [0], 1);
            this.setAnimation("default");
            this.currentAnimationName = "default";
        }
    },
    addAnimation: function (name, frames, speed) {
        // set default speed to 1; 
        if (!speed) {
            speed = 1;
        }

        var textures = [];
        for (var i = 0; i < frames.length; i++)
            textures[i] = this.textures[frames[i]];

        var animation = new PIXI.MovieClip(textures);

//        window.console.log(animation);

        animation.anchor.x = 0.5;
        animation.anchor.y = 0.5;
        animation.visible = false;
        // set the speed that the MovieClip will play at; higher is faster, lower is slower
        animation.animationSpeed = speed;
        this.sprite.addChild(animation);
        this.animations[name] = animation;
    },
    setAnimation: function (name, frame, speed) {
        // play from the start by default
        if (!frame) {
            if (this.currentAnimationName === name)
                return;
            frame = 0;
        }
        if (speed) {
            this.animations["name"].animationSpeed = speed;
        }

        // Turn off the previously playing animation
        if (this.currentAnimation) {
            // Stops the MovieClip
            this.currentAnimation.stop();
            // The visibility of the object.
            this.currentAnimation.visible = false;
        }

        this.currentAnimation = this.animations[name];
        this.currentAnimationName = name;
        this.animations[name].visible = true;
        // goes to a frame and begins playing the animation
        this.animations[name].gotoAndPlay(frame);
    }
});


A_.SPRITES.ArcadeSprite = A_.SPRITES.AnimatedSprite.extend({
//    velocity: new SAT.Vector(0, 0),
//    gravity: new SAT.Vector(0, 0),
//    friction: new SAT.Vector(40, 40),
//    acceleration: new SAT.Vector(0, 0),
//    maxVelocity: new SAT.Vector(256, 256),
//    speed: new SAT.Vector(64, 64),
    isMoving: false,
    bounciness: 0.5,
    minBounceSpeed: 64,
    init: function () {
        this._super();
        this.velocity = new SAT.Vector(0, 0);
        this.gravity = new SAT.Vector(0, 0);
        this.friction = new SAT.Vector(40, 40);
        this.acceleration = new SAT.Vector(0, 0);
        this.maxVelocity = new SAT.Vector(256, 256);
        this.speed = new SAT.Vector(64, 64);
        this.bounced = {horizontal: false, vertical: false};
    },
    update: function () {
        this._super();

        // ARCADE PHYSICS
        // MOVEMENT
        var startPos = this.getPosition();

        if (this.gravity.x === 0) {
            if (this.velocity.x > 0) {
                this.velocity.x -= this.friction.x;
                if (this.velocity.x < 0) {
                    this.velocity.x = 0;
                }
            }
            if (this.velocity.x < 0) {
                this.velocity.x += this.friction.x;
                if (this.velocity.x > 0) {
                    this.velocity.x = 0;
                }
            }
        }
        if (this.gravity.y === 0) {
            if (this.velocity.y > 0) {
                this.velocity.y -= this.friction.y;
                if (this.velocity.y < 0) {
                    this.velocity.y = 0;
                }
            }
            if (this.velocity.y < 0) {
                this.velocity.y += this.friction.y;
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                }
            }
        }

        this.velocity.add(this.acceleration);
        this.velocity.add(this.gravity);

        if (this.bounced.horizontal) {
            this.velocity.x = -this.velocity.x * this.bounciness;
        }
        if (this.bounced.vertical) {
            this.velocity.y = -this.velocity.y * this.bounciness;
        }
        this.bounced.horizontal = this.bounced.vertical = false;

        this.velocity.x = this.velocity.x.clamp(-this.maxVelocity.x, this.maxVelocity.x);
        this.velocity.y = this.velocity.y.clamp(-this.maxVelocity.y, this.maxVelocity.y);

        var vel = this.velocity.clone();
        vel.scale(game.dt, game.dt);

        var x = startPos.x + vel.x;
        var y = startPos.y + vel.y;
        this.setPosition(x, y);

        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }

    },
    collideWithStatic: function (other, response) {
        var pon = this.prevOverlapN.clone();
        this._super(other, response);

        // BUG: the sprite does not bounce in tilemap corners
        if (this.bounciness > 0) {
            if (response.overlapN.x !== 0 && Math.abs(this.velocity.x) > this.speed.x) {
                if (pon.y === 0)
                    this.bounced.horizontal = true;
            }
            if (response.overlapN.y !== 0 && Math.abs(this.velocity.y) > this.speed.y) {
                if (pon.x === 0)
                    this.bounced.vertical = true;
            }
        }
    }
});

/******************************************************************************/
/******************************************************************************/
A_.MODULES.Topdown = {
    simpleDir: "right",
    motionState: "idle",
    motionStates: ["moving", "idle"],
    cardinalDir: "",
    cardinalDirs: ["", "N", "NW", "NE", "S", "SW", "SE"],
    init: function () {
        this._super();
    },
    update: function () {
        if (this.cardinalDir === "") {
            this.motionState = "idle";
        } else
            this.motionState = "moving";

        this.prevCardDir = this.cardinalDir;

        if (this.motionState === "moving") {
            if (this.cardinalDir.indexOf("N") > -1) {
                this.velocity.y -= this.speed.y;
                this.simpleDir = "up";
            }
            else if (this.cardinalDir.indexOf("S") > -1) {
                this.velocity.y += this.speed.y;
                this.simpleDir = "down";
            }
            if (this.cardinalDir.indexOf("W") > -1) {
                this.velocity.x -= this.speed.x;
                this.simpleDir = "left";
            }
            else if (this.cardinalDir.indexOf("E") > -1) {
                this.velocity.x += this.speed.x;
                this.simpleDir = "right";
            }
        }

        this._super();
    }
}

A_.MODULES.TopdownWASD = {
    init: function () {
        this._super();
        A_.INPUT.addMapping("left", A_.KEY.A);
        A_.INPUT.addMapping("right", A_.KEY.D);
        A_.INPUT.addMapping("down", A_.KEY.S);
        A_.INPUT.addMapping("up", A_.KEY.W);
    },
    update: function () {
        // Movement direction
        this.cardinalDir = "";
        if (A_.INPUT.down["up"]) {
            this.cardinalDir = "N";
        } else if (A_.INPUT.down["down"]) {
            this.cardinalDir = "S";
        }
        if (A_.INPUT.down["left"]) {
            this.cardinalDir += "W";
        } else if (A_.INPUT.down["right"]) {
            this.cardinalDir += "E";
        }

        this._super();
    }
};

A_.MODULES.Platformer = {
    platformerState: "grounded",
    jumpForce: 600,
    bounciness: 0,
    speed: new SAT.Vector(64, 64),
    gravity: new SAT.Vector(0, 20),
    friction: new SAT.Vector(20, 0),
    maxVelocity: new SAT.Vector(400, 1000),
    init: function () {
        this._super();
        A_.INPUT.addMapping("left", A_.KEY.A);
        A_.INPUT.addMapping("right", A_.KEY.D);
        A_.INPUT.addMapping("jump", A_.KEY.SPACE);
    },
    update: function () {
        if (A_.INPUT.down["left"]) {
            this.velocity.x -= this.speed.x;
        }
        if (A_.INPUT.down["right"]) {
            this.velocity.x += this.speed.x;
        }
        if (A_.INPUT.down["jump"]) {
            if (this.platformerState === "grounded") {
                this.velocity.y -= this.jumpForce;
            }
        }

        this._super();

        // STATES
        if (this.velocity.y > this.gravity.y) {
            this.platformerState = "falling";
        } else if (this.velocity.y < -this.gravity.y) {
            this.platformerState = "jumping";
        } else if (this.platformerState !== "jumping") {
            this.platformerState = "grounded";
        }
    },
    collideWithStatic: function (other, response) {
        // BUG: When jumping and going left/right into the wall, the jump is capped
        this._super(other, response);

        if (response.overlapN.y === 1) {
            this.platformerState = "grounded";
            if (this.bounciness === 0) {
                this.velocity.y = 0;
            } else {
                this.velocity.y -= this.gravity.y;
            }
        }
    }
};