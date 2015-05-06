DODO.Animated = DODO.Sprite.extend({
    bounded: false,
    wrap: false,
    outOfBounds: false,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        this.textures = [];
        if (this.spriteSheet) {
            this.baseTexture = DODO.getAsset(this.spriteSheet);
            this.frameWidth = this.frameWidth || this.baseTexture.width;
            this.frameHeight = this.frameHeight || this.baseTexture.height;

            var colls = Math.round(this.baseTexture.width / this.frameWidth);
            var rows = Math.round(this.baseTexture.height / this.frameHeight);
            // An array of textures that we'll use to make up different sprite animations, ie. MovieClips.
            // PIXI's MovieClip is an object used to display an animation depicted by a list of textures.
            var rectangle = new PIXI.Rectangle(0, 0, this.frameWidth, this.frameHeight);
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < colls; j++) {
                    rectangle.x = j * this.frameWidth;
                    rectangle.y = i * this.frameHeight;
                    this.textures.push(new PIXI.Texture(this.baseTexture, rectangle));
                }
            }
        }
        else {
            if (this.polygon) {
                this.frameWidth = this.polygon.w;
                this.frameHeight = this.polygon.h;
            }
            else {
                this.frameWidth = this.collisionWidth;
                this.frameHeight = this.collisionHeight;
            }
            this.textures.push(new PIXI.RenderTexture(this.frameWidth, this.frameHeight));
        }

        this.initializePIXISprite();
        this.initializeSprite(parent, x, y);
    },
    createPIXISprite: function (w, h) {
        var graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF, 0);
        graphics.drawRect(0, 0, w, h);
        graphics.endFill();

        var sprite = new PIXI.Sprite(graphics.generateTexture(false));
        this.anchor = sprite.anchor;
        return sprite;
    },
    initializePIXISprite: function () {
        this.sprite = this.createPIXISprite(this.frameWidth, this.frameHeight);

        // animations DOC stores MovieClip objects.
        this.sprite.addChild(new PIXI.DisplayObjectContainer());
        // A hashmap of all animations, ie. MovieClips for easy reference.
        this.animations = {};
        this.addAnimation("default", [0], 1);
        this.setAnimation("default");
    },
    // ANIMATIONS
    // frames is an array of nums refering to the index of texture in this.textures
    addAnimation: function (name, textures, speed) {
        for (var i = 0; i < textures.length; i++)
            textures[i] = this.textures[textures[i]];
        var animation = new PIXI.MovieClip(textures);

        animation.anchor.x = this.anchor.x;
        animation.anchor.y = this.anchor.y;
        animation.visible = false;
        animation.animationSpeed = speed || 0;
        // The first child of this.sprite is the DOC containing MovieClips.
        this.sprite.children[0].addChild(animation);
        this.animations[name] = animation;

        return animation;
    },
    setAnimation: function (name, frame, speed) {
        if (this.currentAnimationName === name)
            return;

        if (this.currentAnimation) {
            this.currentAnimation.stop();
            this.currentAnimation.visible = false;
        }

        this.currentAnimation = this.animations[name];
        this.currentAnimationName = name;
        this.currentAnimation.animationSpeed = _.isNumber(speed) ? speed : this.currentAnimation.animationSpeed;
        this.currentAnimation.visible = true;
        this.currentAnimation.gotoAndPlay(frame || 0);
    },
    // ORIGIN
    setOrigin: function (x, y) {
        var deltaX = (x - this.anchor.x) * this.width / this.scale.x;
        var deltaY = (y - this.anchor.y) * this.height / this.scale.y;

        this.anchor.x = x;
        this.anchor.y = y;

        _.each(this.animations, function (animation) {
            animation.anchor.x = x;
            animation.anchor.y = y;
        });

        _.each(this.getChildrenSprites(), function (sprite) {
            sprite.position.x -= deltaX;
            sprite.position.y -= deltaY;
        });

        _.each(this.points, function (p) {
            p.x -= deltaX;
            p.y -= deltaY;
        });

        var colPol = this.collisionPolygon;
        if (colPol) {
            colPol.translate(-deltaX * colPol.scale.x, -deltaY * colPol.scale.y);
            colPol.calcBounds();
        }
    },
    getOrigin: function () {
        return this.anchor;
    },
    // LIFECYCLE & UPDATE
    update: function () {
        if (!this.container) {
            if (this.bounded) {
                this.setPosition(Math.max(0, Math.min(this.position.x, this.scene.width)),
                        Math.max(0, Math.min(this.position.y, this.scene.height)));
            } else if (this.wrap) {
                if (this.position.x < 0) {
                    this.position.x = this.scene.width;
                } else if (this.position.x > this.scene.width) {
                    this.position.x = 0;
                }
                if (this.position.y < 0) {
                    this.position.y = this.scene.height;
                } else if (this.position.y > this.scene.height) {
                    this.position.y = 0;
                }
            }
            else {
                if (this.position.x < 0 || this.position.x > this.scene.width ||
                        this.position.y < 0 || this.position.y > this.scene.height) {
                    this.outOfBounds = true;
                } else {
                    this.outOfBounds = false;
                }
            }
        }

        this._super();
    }
});