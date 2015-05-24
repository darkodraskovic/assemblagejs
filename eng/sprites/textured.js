DODO.Textured = PIXI.Sprite.extend({
    bounded: false,
    wrap: false,
    outOfBounds: false,
    init: function (parent, x, y, props) {
        _.extend(this, props);
        PIXI.Sprite.call(this);
        this._vector = new SAT.Vector();

        var texture = DODO.getAsset(this.spriteSheet);
        if (texture) {
            this.frameWidth = this.frameWidth || texture.width;
            this.frameHeight = this.frameHeight || texture.height;
            this.createTransparentSprite(this.frameWidth, this.frameHeight);
            this.initAnimation(texture);
        }
        else {
            this.createTransparentSprite(((props && props.polygon) && props.polygon.w) || 0,
                    ((props && props.polygon) && props.polygon.h) || 0);
        }
        this.initializeSprite(parent, x, y);
    },
    createTransparentSprite: function (w, h) {
        var graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF, 0);
        graphics.drawRect(0, 0, w, h);
        graphics.endFill();
        this.texture = graphics.generateTexture(false);
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
        animation.anchor.x = this.anchor.x;
        animation.anchor.y = this.anchor.y;
        animation.visible = false;
        animation.animationSpeed = speed || 0;
        animation.name = name;
        this.addChild(animation);
        this.setChildIndex(animation, 0);
        return animation;
    },
    findAnimationByName: function (name) {
        var animations = this.children;
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

        _.each(this.children, function (child) {
            if (child instanceof PIXI.extras.MovieClip) {
                child.anchor.x = x;
                child.anchor.y = y;
            }
            else {
                child.position.x -= deltaX;
                child.position.y -= deltaY;
            }
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
        if (this.bounded) {
            this.position.x = Math.max(0, Math.min(this.position.x, this.scene.playgroundWidth));
            this.position.y = Math.max(0, Math.min(this.position.y, this.scene.playgroundHeight));
        } else if (this.wrap) {
            if (this.position.x < 0) {
                this.position.x = this.scene.playgroundWidth;
            } else if (this.position.x > this.scene.playgroundWidth) {
                this.position.x = 0;
            }
            if (this.position.y < 0) {
                this.position.y = this.scene.playgroundHeight;
            } else if (this.position.y > this.scene.playgroundHeight) {
                this.position.y = 0;
            }
        }
        else {
            if (this.position.x < 0 || this.position.x > this.scene.playgroundWidth ||
                    this.position.y < 0 || this.position.y > this.scene.playgroundHeight) {
                this.outOfBounds = true;
            } else {
                this.outOfBounds = false;
            }
        }
    }
});

Object.defineProperties(DODO.Textured.prototype, {
    'animation': {
        get: function () {
            var animations = this.children;
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
    },
    animations: {
        get: function () {
            var animations = [];
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] instanceof PIXI.extras.MovieClip)
                    animations.push(this.children[i]);
            }
            return animations;
        }
    }
});
