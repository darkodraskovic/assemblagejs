DODO.Textured = DODO.Sprite.extend({
    bounded: false,
    wrap: false,
    outOfBounds: false,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        var texture = DODO.getAsset(this.spriteSheet);
        if (texture) {
            this.frameWidth = this.frameWidth || texture.width;
            this.frameHeight = this.frameHeight || texture.height;
            this.container = this.createTransparentSprite(this.frameWidth, this.frameHeight);
            this.initAnimation(texture);
        }
        else {
            this.container = this.createTransparentSprite(((props && props.polygon) && props.polygon.w) || 0,
                    ((props && props.polygon) && props.polygon.h) || 0);
        }

        this.anchor = this.container.anchor;
        this.initializeSprite(parent, x, y);
    },
    createTransparentSprite: function (w, h) {
        var graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF, 0);
        graphics.drawRect(0, 0, w, h);
        graphics.endFill();
        return new PIXI.Sprite(graphics.generateTexture(false));
    },
    initAnimation: function (texture) {
        this.textures = [];
        var colls = Math.round(texture.width / this.frameWidth);
        var rows = Math.round(texture.height / this.frameHeight);
        // An array of textures that we'll use to make up different sprite animations, ie. MovieClips.
        // PIXI's MovieClip is an object used to display an animation depicted by a list of textures.
        var rectangle = new PIXI.Rectangle(0, 0, this.frameWidth, this.frameHeight);
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < colls; j++) {
                rectangle.x = j * this.frameWidth;
                rectangle.y = i * this.frameHeight;
                this.textures.push(new PIXI.Texture(texture, rectangle));
            }
        }
        this.animation = this.addAnimation("default", [0], 0);
    },
    // ANIMATIONS
    addAnimation: function (name, textures, speed) {
        for (var i = 0; i < textures.length; i++)
            textures[i] = this.textures[textures[i]];
        var animation = new PIXI.extras.MovieClip(textures);
        animation.anchor.x = this.container.anchor.x;
        animation.anchor.y = this.container.anchor.y;
        animation.visible = false;
        animation.animationSpeed = speed || 0;
        animation.name = name;
        this.container.addChild(animation);
        return animation;
    },
    findAnimationByName: function (name) {
        var animations = this.container.children;
        for (var i = 0; i < animations.length; i++) {
            if (animations[i].name === name && animations[i] instanceof PIXI.extras.MovieClip)
                return animations[i];
        }
    },
    // ORIGIN
    setAnchor: function (x, y) {
        var deltaX = (x - this.anchor.x) * this.width / this.scale.x;
        var deltaY = (y - this.anchor.y) * this.height / this.scale.y;

        this.anchor.x = x;
        this.anchor.y = y;

        _.each(this.container.children, function (animation) {
            if (animation instanceof PIXI.extras.MovieClip) {
                animation.anchor.x = x;
                animation.anchor.y = y;
            }
        });

        _.each(this.children, function (sprite) {
            sprite.position.x -= deltaX;
            sprite.position.y -= deltaY;
        });

        _.each(this.points, function (p) {
            p.x -= deltaX;
            p.y -= deltaY;
        });

        return [deltaX, deltaY];
    },
    getAnchor: function () {
        return this.anchor;
    },
    // LIFECYCLE & UPDATE
    update: function () {
        if (!this.parent) {
            if (this.bounded) {
                this.position.x = Math.max(0, Math.min(this.position.x, this.scene.width));
                this.position.y = Math.max(0, Math.min(this.position.y, this.scene.height));
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

Object.defineProperties(DODO.Textured.prototype, {
    'animation': {
        get: function () {
            var animations = this.container.children;
            for (var i = 0; i < animations.length; i++) {
                if (animations[i].visible && animations[i] instanceof PIXI.extras.MovieClip)
                    return animations[i];
            }
        },
        set: function (animation) {
            if (_.isString(animation))
                animation = this.findAnimationByName(animation);
            if (!animation)
                return;
            var currentAnim = this.animation;
            if (currentAnim === animation)
                return;
            if (currentAnim) {
                currentAnim.stop();
                currentAnim.visible = false;
            }
            animation.visible = true;
            animation.play();
            this.animation = animation;
        }
    }
});