DODO.Textured = DODO.Sprite.extend({
    bounded: false,
    wrap: false,
    outOfBounds: false,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        var texture = DODO.getAsset(this.spriteSheet);
        if (texture) {
            if (!_.isNumber(this.frameWidth) || !_.isNumber(this.frameHeight))
                this.sprite = new PIXI.Sprite(texture);
            else {
                this.sprite = this.createTransparentSprite(this.frameWidth, this.frameHeight);
                this.initAnimation(texture);
            }
        }
        else {
            this.sprite = this.createTransparentSprite((this.polygon && this.polygon.w) || this.collisionWidth,
                    (this.polygon && this.polygon.h) || this.collisionHeight);
        }
        this.anchor = this.sprite.anchor;
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
        // Container stores MovieClip objects.
        this.animationsContainer = this.sprite.addChild(new PIXI.Container());
        this.addAnimation("all", _.range(0, this.textures.length), 0);
        this.setAnimation(this.addAnimation("default", [0], 0));
    },
    // ANIMATIONS
    addAnimation: function (name, textures, speed) {
        for (var i = 0; i < textures.length; i++)
            textures[i] = this.textures[textures[i]];

        var animation = new PIXI.extras.MovieClip(textures);
        animation.anchor.x = this.sprite.anchor.x;
        animation.anchor.y = this.sprite.anchor.y;
        animation.visible = false;
        animation.animationSpeed = speed || 0;
        animation.name = name;
        this.animationsContainer.addChild(animation);
        return animation;
    },
    setAnimation: function (anim, frame, speed) {
        if (_.isString(anim))
            anim = this.findAnimationByName(anim);
        if (!anim)
            return;
        var currentAnim = this.getAnimation();
        if (currentAnim === anim)
            return;
        if (currentAnim) {
            currentAnim.stop();
            currentAnim.visible = false;
        }
        anim.animationSpeed = _.isNumber(speed) ? speed : anim.animationSpeed;
        anim.visible = true;
        anim.gotoAndPlay(frame || 0);
    },
    findAnimationByName: function (name) {
        var animContainerChildren = this.animationsContainer.children;
        for (var i = 0; i < animContainerChildren.length; i++) {
            if (animContainerChildren[i].name === name)
                return animContainerChildren[i];
        }
    },
    getAnimation: function () {
        var animContChildren = this.animationsContainer.children;
        for (var i = 0; i < animContChildren.length; i++)
            if (animContChildren[i].visible)
                return animContChildren[i];
    },
    // ORIGIN
    setAnchor: function (x, y) {
        var deltaX = (x - this.anchor.x) * this.width / this.scale.x;
        var deltaY = (y - this.anchor.y) * this.height / this.scale.y;

        this.anchor.x = x;
        this.anchor.y = y;

        if (this.animationsContainer)
            _.each(this.animationsContainer.children, function (animation) {
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
//	    colPol.setOffset(new SAT.Vector(colPol.offset.x - deltaX * colPol.scale.x,
//					    colPol.offset.y - deltaY * colPol.scale.y));
            colPol.calcBounds();
        }
    },
    getAnchor: function () {
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
