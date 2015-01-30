A_.SPRITES.Animated = Class.extend({
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

//        if (_.isUndefined(this.level)) {
//            this.level = parent.level || A_.level;
//        }
        this.level = parent.level;

        // If this sprite displays an image or features animations...
        if (this.animSheet) {
            if (!this.frame) {
                this.frame = {w: 0, h: 0};
            }
            // A texture stores the information that represents an image. 
            // All textures have a base texture. (PIXI doc)
            this.animSheet = "graphics/" + this.level.directoryPrefix + this.animSheet;
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

            // An array of textures that we'll use to make up different sprite animations, ie. MovieClips.
            // PIXI's MovieClip is an object used to display an animation depicted by a list of textures.
            this.textures = [];
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < colls; j++)
                    this.textures[this.textures.length] = new PIXI.Texture(this.baseTexture,
                            new PIXI.Rectangle(j * this.frame.w, i * this.frame.h,
                                    this.frame.w, this.frame.h));
            }

            this.createSprite(this.frame.w, this.frame.h);

            this.defaultAnimationSpeed = 0.05;
            // Every animated sprite has two animations (MovieClips):
            // A default one, which displays the first frame (Texture) and
            // An animation (MovieClip) which plays all frames (Texture-s).
            this.addAnimation("default", [0], 1);
            this.addAnimation("all", _.range(0, this.textures.length), this.defaultAnimationSpeed);
            this.setAnimation("default");
        } else {
            this.createSprite(1, 1);
        }

        this.spritePoints = [];

        this.addons = [];

        this.prevX = 0;
        this.prevY = 0;
//        this.rotation(0);
//        this.alpha(1);

        if (parent instanceof A_.SPRITES.Animated) {
            parent.addSprite(this);
        }
        else {
            this.layer = parent;
            this.layer.addChild(this.sprite);
        }
//        this.parent = parent;
//        this.position(x, y);
    },
    // Create a transparent PIXI.Sprite that will store, as a parent,
    // all animations, ie. PIXI.MovieClip-s and all PIXI.Sprite-s.
    createSprite: function (w, h) {
        // We'll use the graphics PIXI obj to render an invisible texture,
        // which we'll pass to PIXI.Sprite's constructor.
        var graphic = new PIXI.Graphics();
        // Specifies a simple one-color fill that subsequent calls to other 
        // Graphics methods use when drawing. Second argument specifies the alpha. 
        graphic.beginFill(0xFFFFFF, 0);
        graphic.drawRect(0, 0, w, h);
        graphic.endFill();
        // A texture stores the information that represents an image or part 
        // of an image. It cannot be added to the display list directly. 
        // Instead we use it as the texture for a PIXI.Sprite. 
        // If no frame is provided then the whole image is used. (PIXI doc)
        // generateTexture() is a function that returns a texture of the 
        // graphics object that can then be used to create sprites (PIXI doc)
        var sprite = new PIXI.Sprite(graphic.generateTexture(false));
        sprite.anchor = new PIXI.Point(0.5, 0.5);

        // animations DOC stores MovieClip objects.
        var animations = new PIXI.DisplayObjectContainer();
        sprite.addChild(animations);
        // A hashmap of all animations, ie. MovieClips for easy reference.
        this.animations = {};

        // sprites DOC stores PIXI.Sprite-s belonging to children of this sprite.
        var sprites = new PIXI.DisplayObjectContainer();
        sprite.addChild(sprites);
        // An array of all sprite children (instances of A_.SPRITES.Sprite) of this object 
        this.sprites = [];

        this.sprite = sprite;

        // Used to optimize x & y setting & getting.
        this.position = this.sprite.position;
        this.origin = this.sprite.anchor;
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
    overlapsSprite: function (sprite) {
        return (this.getTop() <= sprite.getBottom() && this.getBottom() >= sprite.getTop()
                && this.getLeft() <= sprite.getRight() && this.getRight() >= sprite.getLeft());
    },
    isOnScreen: function () {
        var bounds = this.sprite.getBounds();
        var view = this.level.game.renderer.view;

        if (bounds.x + bounds.width < 0)
            return false;
        if (bounds.x > view.width)
            return false;
        if (bounds.y + bounds.height < 0)
            return false;
        if (bounds.y > view.height)
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
    spritePoint: function (name, x, y) {
        if (_.isNumber(x) && _.isNumber(y)) {
            var sprPt = new A_.SPRITES.SpritePoint(name, x, y);
            this.spritePoints.push(sprPt);
            return sprPt;
        } else {
            return _.find(this.spritePoints, function (sprPt) {
                return sprPt.name === name;
            });
        }
    },
    // TRANSFORMATIONS
    // PIXI dependent setters/getters, used to keep in sync PIXI and A_.
    setPosition: function (x, y) {
        this.position.x = x;
        this.position.y = y;
        _.each(this.spritePoints, function (sp) {
            sp.setPosition(x, y);
        });
    },
    getPosition: function () {
        return this.position;
    },
    setX: function (x) {
        this.position.x = x;
        _.each(this.spritePoints, function (sp) {
            sp.setX(x);
        });
    },
    getX: function () {
        return this.position.x;
    },
    setY: function (y) {
        this.position.y = y;
        _.each(this.spritePoints, function (sp) {
            sp.setY(y);
        });
    },
    getY: function () {
        return this.position.y;
    },
    setXRelative: function (x) {
        this.setX(this.getX() + x);
    },
    setYRelative: function (y) {
        this.setY(this.getY() + y);
    },
    setPositionRelative: function (x, y) {
        this.setPosition(this.getX() + x, this.getY() + y);
    },
    getPositionLevel: function () {
        return this.level.container.toLocal(this.level.origin, this.sprite);
    },
    getPositionScreen: function () {
        return this.sprite.toGlobal(this.level.origin);
    },
    setSize: function (w, h) {
        var prevWidth = this.sprite.width;
        var prevHeight = this.sprite.height;
        this.sprite.width = w;
        this.sprite.height = h;
        // We scale proportionally sprite points.
        _.each(this.spritePoints, function (sp) {
            sp.setScale(w / prevWidth, h / prevHeight);
        });

    },
//    getSize: function(w, h) {
//        return {width: Math.abs(this.sprite.width), height: Math.abs(this.sprite.height)};
//    },
    setWidth: function (w) {
        var relSpWidth = w / this.sprite.width;
        this.sprite.width = w;
        // We scale proportionally sprite points on the x axis.
        _.each(this.spritePoints, function (sp) {
            sp.setScaleX(relSpWidth);
        }, this);
    },
    getWidth: function () {
        return Math.abs(this.sprite.width);
    },
    setHeight: function (h) {
        var relSpHeight = h / this.sprite.height;
        this.sprite.height = h;
        // We scale proportionally sprite points on the y axis.
        _.each(this.spritePoints, function (sp) {
            sp.setScaleY(relSpHeight);
        }, this);
    },
    getHeight: function () {
        return Math.abs(this.sprite.height);
    },
    setScale: function (x, y) {
        var relSpScaleX = x / this.sprite.scale.x;
        var relSpScaleY = y / this.sprite.scale.y;
        this.sprite.scale.x = x;
        this.sprite.scale.y = y;
        // We scale proportionally sprite points.
        _.each(this.spritePoints, function (sp) {
            sp.setScale(relSpScaleX, relSpScaleY);
        });
    },
    setScaleX: function (x) {
        var relSpScaleX = x / this.sprite.scale.x;
        this.sprite.scale.x = x;
        // We scale proportionally sprite points.
        _.each(this.spritePoints, function (sp) {
            sp.setScaleX(relSpScaleX);
        });
    },
    setScaleY: function (y) {
        var relSpScaleY = y / this.sprite.scale.y;
        this.sprite.scale.y = y;
        // We scale proportionally sprite points.
        _.each(this.spritePoints, function (sp) {
            sp.setScaleY(relSpScaleY);
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
    setRotation: function (n) {
        var prevRot = this.getRotation();
        this.sprite.rotation = n;
        _.each(this.spritePoints, function (sp) {
            sp.setRotationRelative(n - prevRot);
        });
    },
    getRotation: function () {
        return this.sprite.rotation;
    },
    // ORIGIN (ANCHOR)
    setOrigin: function (x, y) {
        var deltaX = -(x - this.sprite.anchor.x) * this.getWidth();
        var deltaY = -(y - this.sprite.anchor.y) * this.getHeight();
        var scale = this.getScale();

        this.sprite.anchor.x = x;
        this.sprite.anchor.y = y;
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
            sp.point.x += deltaX;
            sp.point.y += deltaY;
        });

        return [deltaX, deltaY];
    },
    getOrigin: function () {
        return this.sprite.anchor;
    },
    // TRANSPARENCY
    setAlpha: function (n) {
        this.sprite.alpha = n;
    },
    getAlpha: function () {
        return this.sprite.alpha;
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
    preupdate: function () {
        this.prevRot = this.getRotation();
        this.prevX = this.getX();
        this.prevY = this.getY();

        _.each(this.addons, function (addon) {
            if (addon.active)
                addon.update();
        });
    },
    update: function () {

    },
    postupdate: function () {
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
    },
    onCreation: function () {
//        this.setPosition(x, y);
    },
    destroy: function () {
        _.each(this.sprites, function (sprite) {
            sprite.destroy();
        });

        this.onDestruction();
        this.level.spritesToDestroy.push(this);
    },
    clear: function () {
        if (this === this.level.camera.followee) {
            this.level.camera.followee = null;
        }
        this.sprite.parent.removeChild(this.sprite);
    },
    onDestruction: function () {

    }
});

A_.SPRITES.Animated.inject(A_.INPUT.mouseReactivityInjection);