A_.SPRITES.Sprite = Class.extend({
    destroyThis: false,
    bounded: true,
    wrap: false,
    outOfBounds: false,
    updates: true,
    // init() is called when the sprite is instantiated with new keyword.
    // parent refers to the instance of Sprite or layer (instance of PIXI.DisplayObjectContainer)
    init: function (parent, x, y, props) {
        // Add all the properties of the prop obj to this instance.
        if (props) {
            for (var prop in props) {
                if (_.isUndefined(this[prop]))
                    this[prop] = props[prop];
            }
        }

        this.level = parent.level;

        this.textures = [];
        // If this sprite displays an image or features animations...
        if (this.spriteSheet) {
            // A texture stores the information that represents an image. 
            // All textures have a base texture. (PIXI doc)
            this.spriteSheet = "game/graphics/" + this.spriteSheet;
            this.baseTexture = new PIXI.BaseTexture.fromImage(this.spriteSheet, PIXI.scaleModes.LINEAR);
            // If the frame size is not specified in the class definition, 
            // or the frame w/h is set to 0, use the dims of the image itself.
            if (!this.frameWidth) {
                this.frameWidth = this.baseTexture.width;
            }
            if (!this.frameHeight) {
                this.frameHeight = this.baseTexture.height;
            }

            var colls = Math.round(this.baseTexture.width / this.frameWidth);
            var rows = Math.round(this.baseTexture.height / this.frameHeight);

            // An array of textures that we'll use to make up different sprite animations, ie. MovieClips.
            // PIXI's MovieClip is an object used to display an animation depicted by a list of textures.
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < colls; j++)
                    this.textures[this.textures.length] = new PIXI.Texture(this.baseTexture,
                            new PIXI.Rectangle(j * this.frameWidth, i * this.frameHeight,
                                    this.frameWidth, this.frameHeight));
            }
        }
        else {
            this.textures.push(new PIXI.RenderTexture(this.frameWidth, this.frameHeight));
        }

        var sprite = this.createPIXISprite(this.frameWidth, this.frameHeight);
        this.initializePIXISprite(sprite);

        this.defaultAnimationSpeed = 0;
        // Every animated sprite has two animations (MovieClips):
        // A default one, which displays the first frame (Texture) and
        // An animation (MovieClip) which plays all frames (Texture-s).
        this.addAnimation("default", [0], 1);
        this.addAnimation("all", _.range(0, this.textures.length), this.defaultAnimationSpeed);
        this.setAnimation("default");

        this.spritePoints = [];

        this.addons = [];

        if (parent instanceof A_.SPRITES.Sprite) {
            parent.addSprite(this);
        }
        else {
            this.layer = parent;
            this.layer.addChild(this.sprite);
        }

        this.setFollowee(this.followee);

//        this.parent = parent;
        this.setPosition(x, y);
    },
    setFollowee: function (isFollowee) {
        if (isFollowee) {
            this.level.camera.followee = this;
            this.followee = true;
            return;
        }
        else if (this.level.camera.followee === this) {
            this.level.camera.followee = null;
        }
        this.followee = false;
    },
    // Create a transparent PIXI.Sprite that will store, as a parent,
    // all animations, ie. PIXI.MovieClip-s and all PIXI.Sprite-s.
    createPIXISprite: function (w, h) {
        // We'll use the graphics PIXI obj to render an invisible texture,
        // which we'll pass to PIXI.Sprite's constructor.
        var graphics = new PIXI.Graphics();
        // Specifies a simple one-color fill that subsequent calls to other 
        // Graphics methods use when drawing. Second argument specifies the alpha. 
        graphics.beginFill(0xFFFFFF, 0);
        graphics.drawRect(0, 0, w, h);
        graphics.endFill();

        var sprite;
        if (this.graphics) {
            sprite = graphics;
            sprite.pivot.x = 0.5;
            sprite.pivot.y = 0.5;
        }
        else {
            // A texture stores the information that represents an image or part 
            // of an image. It cannot be added to the display list directly. 
            // Instead we use it as the texture for a PIXI.Sprite. 
            // If no frame is provided then the whole image is used. (PIXI doc)
            // generateTexture() is a function that returns a texture of the 
            // graphics object that can then be used to create sprites (PIXI doc)
            sprite = new PIXI.Sprite(graphics.generateTexture(false));
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
        }

        return sprite;
    },
    initializePIXISprite: function (sprite) {
        this.sprite = sprite;
//        var sprite = new PIXI.DisplayObjectContainer();
        // animations DOC stores MovieClip objects.
        var animations = new PIXI.DisplayObjectContainer();
        this.sprite.addChild(animations);
        // A hashmap of all animations, ie. MovieClips for easy reference.
        this.animations = {};

        // sprites DOC stores PIXI.Sprite-s belonging to children of this sprite.
        var sprites = new PIXI.DisplayObjectContainer();
        this.sprite.addChild(sprites);
        // An array of all sprite children (instances of A_.SPRITES.Sprite) of this object 
        this.sprites = [];

        // Used to optimize getters & setters.
        this.position = this.sprite.position;
        this.scale = this.sprite.scale;
        if (this.sprite instanceof PIXI.Graphics) {
            this.origin = sprite.pivot;
        }
        else
            this.origin = sprite.anchor;
    },
    // ANIMATION
    // frames is an array of nums refering to the index of texture in this.textures
    addAnimation: function (name, frames, speed) {
        // set default speed to 1; 
        if (!speed) {
            speed = this.defaultAnimationSpeed;
        }

        var textures = [];
        for (var i = 0; i < frames.length; i++)
            textures[i] = this.textures[frames[i]];

        var animation = new PIXI.MovieClip(textures);

        animation.anchor.x = 0.5;
        animation.anchor.y = 0.5;
        // MovieClip is the child of the transparent this.sprite and is invisible by default.
        animation.visible = false;
        // set the speed that the MovieClip will play at; higher is faster, lower is slower
        animation.animationSpeed = speed;
        // The first child of this.sprite is the DOC containing MovieClips.
        this.sprite.children[0].addChild(animation);
        // Set the animations' key/value pair for easy reference.
        this.animations[name] = animation;

        return animation;
    },
    setAnimation: function (name, frame, speed) {
        // Play from the start by default.
        if (typeof frame === 'undefined') {
            if (this.currentAnimationName === name)
                return;
            frame = 0;
        }
        // The speed
        if (typeof speed !== 'undefined') {
            this.animations[name].animationSpeed = speed;
        }

        // Turn off the previously playing animation.
        if (this.currentAnimation) {
            // Stop the MovieClip.
            this.currentAnimation.stop();
            // Set the MovieClip unvisible.
            this.currentAnimation.visible = false;
        }

        this.animations[name].visible = true;
        this.currentAnimation = this.animations[name];
        this.currentAnimationName = name;
        // Goes to a frame and begins playing the animation.
        this.animations[name].gotoAndPlay(frame);
    },
    getLeft: function () {
        return this.sprite.getBounds().x / this.level.scale + this.level.camera.x;
    },
    getRight: function () {
        var bounds = this.sprite.getBounds();
        return (bounds.x + bounds.width) / this.level.scale + this.level.camera.x;
    },
    getTop: function () {
        return this.sprite.getBounds().y / this.level.scale + this.level.camera.y;
    },
    getBottom: function () {
        var bounds = this.sprite.getBounds();
        return (bounds.y + bounds.height) / this.level.scale + this.level.camera.y;
    },
    getCenterX: function () {
        // TODO...
    },
    overlapsSprite: function (sprite) {
        return (this.getTop() <= sprite.getBottom() && this.getBottom() >= sprite.getTop()
                && this.getLeft() <= sprite.getRight() && this.getRight() >= sprite.getLeft());
    },
    isOnScreen: function () {
        var bounds = this.sprite.getBounds();
        var renderer = this.level.game.renderer;

        if (bounds.x + bounds.width < 0)
            return false;
        if (bounds.x > renderer.width)
            return false;
        if (bounds.y + bounds.height < 0)
            return false;
        if (bounds.y > renderer.height)
            return false;

        return true;
    },
    // SPRITE CHILDREN
    addSprite: function (sprite) {
        this.sprites.push(sprite);
        // The second child of this PIXI sprite is the parent of sprites added to this PIXI sprite.
        this.sprite.children[1].addChild(sprite.sprite);
        // .container is A_ sprite containing this A_ sprite.
        sprite.container = this;
        // .layer is PIXI DOC containing this PIXI sprite.
        sprite.layer = this.layer;
        return sprite;
    },
    removeSprite: function (sprite) {
        this.sprites.splice(this.sprites.indexOf(sprite), 1);
        this.sprite.children[1].removeChild(sprite.sprite);
        sprite.container = null;
        sprite.layer = null;
        return sprite;
    },
    // SPRITE POINTS
    setSpritePoint: function (name, x, y) {
        var sprPt = new A_.SPRITES.SpritePoint(this, name, x, y);
        this.spritePoints.push(sprPt);
        return sprPt;
    },
    getSpritePoint: function (name) {
        return _.find(this.spritePoints, function (sprPt) {
            return sprPt.name === name;
        });
    },
    // TRANSFORMATIONS
    // PIXI dependent setters/getters, used to keep in sync PIXI and A_.
    setPosition: function (x, y) {
        this.position.x = x;
        this.position.y = y;
    },
    getPosition: function () {
        return this.position;
    },
    setX: function (x) {
        this.position.x = x;
    },
    getX: function () {
        return this.position.x;
    },
    setY: function (y) {
        this.position.y = y;
    },
    getY: function () {
        return this.position.y;
    },
    setXRelative: function (x) {
        this.setX(this.position.x + x);
    },
    setYRelative: function (y) {
        this.setY(this.position.y + y);
    },
    setPositionRelative: function (x, y) {
        this.setPosition(this.position.x + x, this.position.y + y);
    },
    getPositionLevel: function () {
        return this.level.container.toLocal(this.level.origin, this.sprite);
    },
    getPositionScreen: function () {
        return this.sprite.toGlobal(this.level.origin);
    },
    setWidth: function (w) {
        this.sprite.width = w;
        // We scale proportionally sprite points on the x axis.
        _.each(this.spritePoints, function (sp) {
            sp.setScale(this.scale.x, this.scale.y);
        }, this);
    },
    getWidth: function () {
        return Math.abs(this.sprite.width);
    },
    setHeight: function (h) {
        this.sprite.height = h;
        // We scale proportionally sprite points on the y axis.
        _.each(this.spritePoints, function (sp) {
            sp.setScale(this.scale.x, this.scale.y);
        }, this);
    },
    getHeight: function () {
        return Math.abs(this.sprite.height);
    },
    setScale: function (x, y) {
        this.scale.x = x;
        this.scale.y = y;
        // We scale proportionally sprite points.
        _.each(this.spritePoints, function (sp) {
            sp.setScale(x, y);
        });
    },
    setScaleX: function (x) {
        this.scale.x = x;
        var y = this.getScaleY();
        // We scale proportionally sprite points.
        _.each(this.spritePoints, function (sp) {
            sp.setScale(x, y);
        });
    },
    setScaleY: function (y) {
        this.scale.y = y;
        var x = this.getScaleX();
        // We scale proportionally sprite points.
        _.each(this.spritePoints, function (sp) {
            sp.setScale(x, y);
        });
    },
    getScale: function () {
        return this.sprite.scale;
    },
    getScaleX: function () {
        return this.sprite.scale.x;
    },
    getScaleY: function () {
        return this.sprite.scale.y;
    },
    setRotation: function (n) {
        this.sprite.rotation = n;
        _.each(this.spritePoints, function (sp) {
            sp.setRotation(n);
        });
    },
    getRotation: function () {
        return this.sprite.rotation;
    },
    // Flip is a scaling with a negative factor.
    flipX: function () {
        this.setScaleX(this.getScaleX() * -1);
    },
    getFlippedX: function () {
        return this.getScale().x < 0;
    },
    setFlippedX: function (flipped) {
        if (flipped) {
            if (!this.getFlippedX())
                this.flipX();
        }
        else {
            if (this.getFlippedX())
                this.flipX();
        }
    },
    flipY: function () {
        this.setScaleY(this.getScaleY() * -1);
    },
    getFlippedY: function () {
        return this.getScale().y < 0;
    },
    setFlippedY: function (flipped) {
        if (flipped) {
            if (!this.getFlippedY())
                this.flipY();
        }
        else {
            if (this.getFlippedY())
                this.flipY();
        }
    },
    // ORIGIN (ANCHOR)
    setOrigin: function (x, y) {
        var deltaX = -(x - this.origin.x) * this.getWidth();
        var deltaY = -(y - this.origin.y) * this.getHeight();
        var scale = this.getScale();

        this.origin.x = x;
        this.origin.y = y;
        _.each(this.animations, function (animation) {
            animation.anchor.x = x;
            animation.anchor.y = y;
        });

        _.each(this.sprites, function (sprite) {
            // Since the child coord sys is scaled, its positionRelative() 
            // is fed with the original parent's width.
            sprite.setPositionRelative(deltaX / scale.x, deltaY / scale.y);
        });

        _.each(this.spritePoints, function (sp) {
            sp.translate(deltaX / scale.x, deltaY / scale.y);
        });

        return [deltaX, deltaY];
    },
    getOrigin: function () {
        return this.origin;
    },
    // Z ORDER & LAYERS
    getParent: function () {
        if (this.container) {
            // this.container is the instance of A_ sprite.
            return this.container.sprite.children[1];
        } else {
            // this.layer is the instance of PIXI DOC.
            return this.layer;
        }
    },
    setZ: function (position) {
        var parent = this.getParent();

        if (typeof position === "string") {
            if (position === "top") {
                // Changes the position of an existing child in the display object container (PIXI doc).
                parent.setChildIndex(this.sprite, parent.children.length - 1);
                return;
            } else if (position === "bottom") {
                parent.setChildIndex(this.sprite, 0);
                return;
            }
        } else if (typeof position === "number") {
            if (position >= 0 && position < parent.children.length)
                parent.setChildIndex(this.sprite, position);
        }
    },
    getZ: function () {
        var parent = this.getParent();
        return parent.getChildIndex(this.sprite);
    },
    moveToSprite: function (sprite, position) {
        var parent;
//        if (this.getLayerName() !== sprite.getLayerName())
        if (this.layer !== sprite.layer)
            return;
        else
            parent = this.layer;
        if (this.container) {
            if (this.container !== sprite.container)
                return;
            else
                parent = this.container.sprite.children[1];
        }
        if (position === "back" || position === "front") {
            // Removes a child from the PIXI DOC.
            parent.removeChild(this.sprite);
            // Adds a child to the PIXI DOC.
            parent.addChildAt(this.sprite, parent.getChildIndex(sprite.sprite));
            if (position === "front") {
                // Swaps the position of 2 PIXI DO within this PIXI DOC.
                parent.swapChildren(this.sprite, sprite.sprite);
            }
        }
    },
    getLayerName: function () {
        return this.layer.name;
    },
    getLayerNumber: function () {
        return this.layer.parent.getChildIndex(this.layer);
    },
    moveToLayer: function (layer) {
        if (_.isString(layer)) {
            var dest = this.level.findLayerByName(layer);
        } else if (_.isNumber(layer)) {
            var dest = this.level.findLayerByNumber(layer);
        }
        if (dest) {
            if (this.container) {
                this.container.removeSprite(this);
            } else
                this.layer.removeChild(this.sprite);

            dest.addChild(this.sprite);
            this.layer = dest;
            _.each(this.sprites, function (sprite) {
                sprite.layer = layer;
            });
        }
    },
    // ADDONS
    addon: function (addonName, props) {
        if (A_.SPRITES.ADDONS[addonName]) {
            var a = new A_.SPRITES.ADDONS[addonName](this, props);
            a.on();
            this.addons.push(a);
            return a;
        }
    },
    addoff: function (addon) {
        var a = _.find(this.addons, addon);
        if (a) {
            a.off();
            this.addons.splice(this.addons.indexOf(addon), 1);
        }
        else {
            return;
        }
    },
    // CREATION/DESTRUCTION & UPDATE
    update: function () {
        if (!this.container) {
            if (this.bounded) {
                this.setPosition(Math.max(0, Math.min(this.getX(), this.level.width)),
                        Math.max(0, Math.min(this.getY(), this.level.height)));
            } else if (this.wrap) {
                if (this.getX() < 0) {
                    this.setX(this.level.width);
                } else if (this.getX() > this.level.width) {
                    this.setX(0);
                }
                if (this.getY() < 0) {
                    this.setY(this.level.height);
                } else if (this.getY() > this.level.height) {
                    this.setY(0);
                }
            }
            else {
                if (this.getX() < 0 || this.getX() > this.level.width ||
                        this.getY() < 0 || this.getY() > this.level.height) {
                    this.outOfBounds = true;
                } else {
                    this.outOfBounds = false;
                }
            }
        }

        for (var i = 0, len = this.addons.length; i < len; i++) {
            if (this.addons[i].active) {
                this.addons[i].update();
            }
        }

        if (this.sprite.interactive) {
            this.resetMouseReaction();
        }
    },
    destroy: function () {
        var spritesToDestroy = this.level.spritesToDestroy;
        if (_.contains(spritesToDestroy, this))
            return;

        _.each(this.sprites, function (sprite) {
            sprite.destroy();
        });

        this.onDestruction();
        spritesToDestroy.push(this);
    },
    removeFromLevel: function () {
        this.setFollowee(false);
        this.sprite.parent.removeChild(this.sprite);
    },
    onDestruction: function () {

    }
});

A_.SPRITES.Sprite.inject(A_.INPUT.mouseReactivityInjection);