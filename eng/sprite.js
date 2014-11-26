A_.SPRITES.AnimatedSprite = Class.extend({
    // init() is called when the sprite is instantiated with new keyword.
    init: function (layer, x, y, props) {
        // Add all the properties of the prop obj to this instance.
        for (var prop in props) {
            this[prop] = props[prop];
        }

//        if (this.image) {
//            this.image = "assets/" + this.image;
//            this.sprite = new PIXI.Sprite.fromImage(this.image);
//        } else if (this.frame) {
//            this.sprite = new PIXI.Sprite.fromFrame(this.frame);
//        } else if (this.texture) {
//            this.sprite = new PIXI.Sprite(this.texture);
//        } else if (this.baseTexture) {
//            this.sprite = new PIXI.Sprite(new PIXI.Texture(this.baseTexture, this.rectangle));
//        } else {
        this.sprite = new PIXI.DisplayObjectContainer();
//        }

        this.animations = {};
        if (!this.frame) {
            this.frame = {w: 0, h: 0};
        }
        if (this.animSheet) {
            this.animSheet = "assets/" + this.animSheet;
            this.baseTexture = new PIXI.BaseTexture.fromImage(this.animSheet, PIXI.scaleModes.LINEAR);
            // If the frame size is not specified in the class definition, 
            // or the frame w/h is set to 0, use the dims of the image itself.
            if (!this.frame.w) {
                this.frame.w = this.baseTexture.width;
            }
            if (!this.frame.h) {
                this.frame.h = this.baseTexture.height;
            }

            var colls = Math.round(this.baseTexture.width / this.frame.w);
            var rows = Math.round(this.baseTexture.height / this.frame.h);

            this.textures = [];
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < colls; j++)
                    this.textures[this.textures.length] = new PIXI.Texture(this.baseTexture,
                            new PIXI.Rectangle(j * this.frame.w, i * this.frame.h,
                                    this.frame.w, this.frame.h));
            }
            this.addAnimation("default", [0], 1);
            this.setAnimation("default");
            this.addAnimation("all", _.range(0, this.textures.length), 0.05);
        }

        this.sprite.anchor = new PIXI.Point(0.5, 0.5);

        this.sprite.rotation = 0;

        if (!this.width)
            this.width = 1;
        if (!this.height)
            this.height = 1;

        this.alpha = 1;

        this.layer = layer;
        this.layer.addChild(this.sprite);
        this.setPosition(x, y);
    },
    // PIXI/SAT dependent GETTERS and SETTERS.
    // Used to keep in sync PIXI, SAT and engine sprite properties
    setPosition: function (x, y) {
        this.sprite.position.x = x;
        this.sprite.position.y = y;
    },
    setPositionRelative: function (x, y) {
        this.setPosition(this.sprite.position.x + x, this.sprite.position.y + y);
    },
    getPosition: function () {
        return this.sprite.position;
    },
    getPositionX: function () {
        return this.sprite.position.x;
    },
    getPositionY: function () {
        return this.sprite.position.y;
    },
    setSize: function (x, y) {
        this.sprite.width = x;
        this.sprite.height = y;
    },
    getSize: function () {
        return {width: this.sprite.width, height: this.sprite.height};
    },
    getWidth: function () {
        return this.sprite.width;
    },
    setWidth: function (width) {
        this.sprite.width = width;
    },
    getHeight: function () {
        return this.sprite.height;
    },
    setHeight: function (height) {
        this.sprite.height = height;
    },
    setScale: function (x, y) {
        this.sprite.scale = new PIXI.Point(x, y);
    },
    getScale: function () {
        return this.sprite.scale;
    },
    setRotation: function (n) {
        this.sprite.rotation = n;
    },
    getRotation: function () {
        return this.sprite.rotation;
    },
    toTopOfLayer: function () {
        this.layer.setChildIndex(this.sprite, this.layer.children.length - 1);
    },
    toBottomOfLayer: function () {
        this.layer.setChildIndex(this.sprite, 0);
    },
    setZ: function (n) {
        this.layer.setChildIndex(this.sprite, n);
    },
    getZ: function () {
        return this.layer.getChildIndex(this.sprite);
    },
    update: function () {

    },
    postupdate: function () {
        this.sprite.alpha = this.alpha;
    },
    // Animation
    addAnimation: function (name, frames, speed) {
        // set default speed to 1; 
        if (!speed) {
            speed = 1;
        }

        var textures = [];
        for (var i = 0; i < frames.length; i++)
            textures[i] = this.textures[frames[i]];

        var animation = new PIXI.MovieClip(textures);

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
        if (typeof frame === 'undefined') {
            if (this.currentAnimationName === name)
                return;
            frame = 0;
        }
        if (typeof speed !== 'undefined') {
            this.animations[name].animationSpeed = speed;
        } 
//        else {
//            this.animations[name].animationSpeed = 0.1;
//        }

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
    },
    destroy: function () {
        A_.game.spritesToDestroy.push(this);
    }
});

A_.SPRITES.CollisionSprite = A_.SPRITES.AnimatedSprite.extend({
    bounded: true,
    outOfBounds: false,
//    collisionSize: {w: 0, h: 0},
//    collisionOffset: {x: 0, y: 0},
    collides: true,
    destroyThis: false,
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);

        this.prevOverlapN = new SAT.Vector(0, 0);

        var that = this;
        if (this.interactive) {
            this.sprite.interactive = true;
            this.sprite.mousedown = function () {
                that.leftpressed = true;
                that.leftdown = true;
            };
            this.sprite.mouseup = function () {
                that.leftreleased = true;
                that.leftdown = false;
            };
            this.sprite.mouseupoutside = function () {
                that.leftreleased = true;
                that.leftdown = false;
            };
        }
    },
    setInteractive: function () {
        this.sprite.interactive = true;
    },
    removeInteractive: function () {
        this.sprite.interactive = false;
    },
    setCollision: function (polygon) {
        if (!this.collisionSize)
            this.collisionSize = {};
        if (!this.collisionSize.w)
            this.collisionSize.w = this.sprite.width;
        if (!this.collisionSize.h)
            this.collisionSize.h = this.sprite.height;

        if (!this.collisionOffset) {
            this.collisionOffset = {};
        }
        if (!this.collisionOffset.x) {
            this.collisionOffset.x = 0;
        }
        if (!this.collisionOffset.y) {
            this.collisionOffset.y = 0;
        }

        if (polygon) {
            A_.game.collider.activateCollisionFor(this, polygon, null, null, this.collisionOffset.x, this.collisionOffset.y);
        }
        else {
            // Center the polygon and apply the offset.
            A_.game.collider.activateCollisionFor(this, polygon, this.collisionSize.w, this.collisionSize.h,
                    -this.collisionSize.w / 2 + this.collisionOffset.x, -this.collisionSize.h / 2 + this.collisionOffset.y);
        }

        if (this.collides || this.collisionResponse) {
            this.collides = true;
            if (!this.collisionResponse) {
                this.collisionResponse = "sensor";
            }
            A_.game.collider.collisionSprites.push(this);
        }
    },
    update: function () {
        this._super();
    },
    postupdate: function () {
        this._super();

        if (this.bounded) {
            var pos = this.getPosition();
            this.setPosition(Math.max(this.collisionPolygon.w / 2, Math.min(pos.x, A_.game.level.width - this.collisionPolygon.w / 2)),
                    Math.max(this.collisionPolygon.h / 2, Math.min(pos.y, A_.game.level.height - this.collisionPolygon.h / 2)));
        } else {
            var pos = this.getPosition();
            if (pos.x < 0 || pos.x > A_.game.level.width || pos.y < 0 || pos.y > A_.game.level.height) {
                this.outOfBounds = true;
            }
        }

        if (this.collisionPolygon) {
            this.updateCollisionPolygon();
        }
    },
    collideWithTile: function (other, response) {
        if (this.collisionResponse !== "sensor")
            this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
    },
    collide: function (other, response) {
        this.collided = true;
        if (this.collisionResponse === "static") {
            return;
        }
        else if (this.collisionResponse === "sensor") {
            return;
        } else {
            if (this.collisionResponse === "active") {
                if (other.collisionResponse === "static") {
                    this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
                } else if (other.collisionResponse === "active" || other.collisionResponse === "passive") {
                    if (this.collisionPolygon === response.a) {
                        this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
                    }
                    else {
                        this.setPositionRelative(response.overlapV.x, response.overlapV.y);
                    }
                }
            }
            else if (this.collisionResponse === "passive") {
                if (other.collisionResponse === "static")
                    this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
                if (other.collisionResponse === "active")
                    this.setPositionRelative(response.overlapV.x, response.overlapV.y);
            }
            else if (this.collisionResponse === "light") {
                this.setPositionRelative(response.overlapV.x, response.overlapV.y);
            }
        }
    },
    containsPoint: function (x, y) {
        var response = new SAT.Response();
        var contains = SAT.pointInPolygon(new SAT.Vector(x, y), this.collisionPolygon);
        if (contains) {
            return response;
        } else {
            return false;
        }
    },
    setPosition: function (x, y) {
        this._super(x, y);
        if (this.collisionPolygon)
            this.updateCollisionPolygon();
    },
    setPositionRelative: function (x, y) {
        this._super(x, y);
        if (this.collisionPolygon)
            this.updateCollisionPolygon();
    },
    setScale: function (x, y) {
        this._super(x, y);
        if (this.collisionPolygon)
            this.collisionPolygon.setScale(x, y);
    },
    setSize: function (x, y) {
        this._super(x, y);
        if (this.collisionPolygon) {
            x = x / this.frame.w;
            y = y / this.frame.w;
            this.collisionPolygon.setScale(x, y);
        }
    },
    setWidth: function (x) {
        this._super(x);
        if (this.collisionPolygon) {
            x /= this.frame.w;
            this.collisionPolygon.setScale(x, this.collisionPolygon.scale.y);
        }
    },
    setHeight: function (y) {
        this._super(y);
        if (this.collisionPolygon) {
            y = y / this.frame.h;
            this.collisionPolygon.setScale(this.collisionPolygon.scale.x, y);
        }
    }
});

A_.SPRITES.ArcadeSprite = A_.SPRITES.CollisionSprite.extend({
    isMoving: false,
    bounciness: 0.5,
    minBounceSpeed: 64,
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
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
        vel.scale(A_.game.dt, A_.game.dt);

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
    motionState: "idle",
    motionStates: ["moving", "idle"],
    cardinalDir: "E",
    cardinalDirs: ["N", "NW", "NE", "S", "SW", "SE"],
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
    },
    update: function () {
        if (this.motionState === "moving") {
            if (this.cardinalContains("N")) {
                this.velocity.y -= this.speed.y;
            }
            if (this.cardinalContains("S")) {
                this.velocity.y += this.speed.y;
            }
            if (this.cardinalContains("W")) {
                this.velocity.x -= this.speed.x;
            }
            if (this.cardinalContains("E")) {
                this.velocity.x += this.speed.x;
            }
        }

        this._super();
    },
    cardinalToAngle: function (car) {
        if (!car)
            car = this.cardinalDir;
        switch (car) {
            case "N":
                return -90;
                break;
            case "S":
                return 90;
                break;
            case "W":
                return -180;
                break;
            case "E":
                return 0;
                break;
            case "NW":
                return -135;
                break;
            case "NE":
                return -45;
                break;
            case "SW":
                return 135;
                break;
            case "SE":
                return 45;
                break;
            default :
                return 0;
        }
    },
    cardinalContains: function (cont, car) {
        if (!car)
            car = this.cardinalDir;

        if (car.indexOf(cont) > -1) {
            return true;
        }
    }
}

A_.MODULES.TopdownWASD = {
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        A_.INPUT.addMapping("left", A_.KEY.A);
        A_.INPUT.addMapping("right", A_.KEY.D);
        A_.INPUT.addMapping("down", A_.KEY.S);
        A_.INPUT.addMapping("up", A_.KEY.W);
    },
    update: function () {
        var cd = "";
        if (A_.INPUT.down["up"]) {
            cd = "N";
        } else if (A_.INPUT.down["down"]) {
            cd = "S";
        }
        if (A_.INPUT.down["left"]) {
            cd += "W";
        } else if (A_.INPUT.down["right"]) {
            cd += "E";
        }

        if (cd.length > 0) {
            this.motionState = "moving";
            this.cardinalDir = cd;
        } else
            this.motionState = "idle";

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
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
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

A_.EXTENSIONS.Polygon = {
    addTo: function (sprite, pixiPolygon) {
        var graphics = new PIXI.Graphics();
//        sprite.graphics.beginFill(0xFFFF00);
        graphics.lineStyle(4, 0x00FF00);
        graphics.drawPolygon(pixiPolygon.points);

        sprite.sprite.addChild(graphics);
        sprite.graphics = graphics;
    }
};