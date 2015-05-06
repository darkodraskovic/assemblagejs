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

        var sprite = this.createPIXISprite(this.frameWidth, this.frameHeight);
        this.initializePIXISprite(sprite);

        this.addAnimation("default", [0], 1);
        this.addAnimation("all", _.range(0, this.textures.length), 0.1);
        this.setAnimation("default");

        this.initializeSprite(parent, x, y);
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
        // A texture stores the information that represents an image or part 
        // of an image. It cannot be added to the display list directly. 
        // Instead we use it as the texture for a PIXI.Sprite. 
        // If no frame is provided then the whole image is used. (PIXI doc)
        // generateTexture() is a function that returns a texture of the 
        // graphics object that can then be used to create sprites (PIXI doc)
        sprite = new PIXI.Sprite(graphics.generateTexture(false));
        this.origin = this.origin || new PIXI.Point();
        sprite.anchor.x = this.origin.x || 0;
        sprite.anchor.y = this.origin.y || 0;
        this.origin = sprite.anchor;
        return sprite;
    },
    initializePIXISprite: function (sprite) {
        this.sprite = sprite;

        // animations DOC stores MovieClip objects.
        var animations = new PIXI.DisplayObjectContainer();
        this.sprite.addChild(animations);
        // A hashmap of all animations, ie. MovieClips for easy reference.
        this.animations = {};

        // sprites DOC stores PIXI.Sprite-s belonging to children of this sprite.
        var sprites = new PIXI.DisplayObjectContainer();
        this.sprite.addChild(sprites);
        // An array of all sprite children (instances of DODO.Sprite) of this object 
        this.sprites = [];
    },
    // ANIMATIONS
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

        animation.anchor.x = this.origin.x;
        animation.anchor.y = this.origin.y;
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
    // ORIGIN
    setOrigin: function (x, y) {
        var deltaX = (x - this.origin.x) * this.width / this.scale.x;
        var deltaY = (y - this.origin.y) * this.height / this.scale.y;

        this.origin.x = x;
        this.origin.y = y;

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
        return this.origin;
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