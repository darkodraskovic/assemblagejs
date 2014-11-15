A_.Sprite = Class.extend({
    image: null,
    frame: null,
    baseTexture: null,
    rectangle: null,
    bounded: true,
    prevOverlapN: new SAT.Vector(0, 0),
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

A_.AnimatedSprite = A_.Sprite.extend({
    animSheet: null,
    frameW: null,
    frameH: null,
    animations: {},
    currentAnimation: null,
    init: function () {
        this._super();

        if (this.animSheet) {
            this.baseTexture = new PIXI.BaseTexture.fromImage(this.animSheet, PIXI.scaleModes.LINEAR);
            var colls = Math.round(this.baseTexture.width / this.frameW);
            var rows = Math.round(this.baseTexture.height / this.frameH);

            this.textures = [];
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < colls; j++)
                    this.textures[this.textures.length] = new PIXI.Texture(this.baseTexture,
                            new PIXI.Rectangle(j * this.frameW, i * this.frameH,
                                    this.frameW, this.frameH));
            }
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
        this.animations[name].visible = true;
        // goes to a frame and begins playing the animation
        this.animations[name].gotoAndPlay(frame);
    }
});


