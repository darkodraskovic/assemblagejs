A_.SPRITES.Animated = Class.extend({
    destroyThis: false,
    bounded: true,
    wrap: false,
    outOfBounds: false,
    // init() is called when the sprite is instantiated with new keyword.
    // parent refers to the instance of Sprite or layer (instance of PIXI.DisplayObjectContainer)
    init: function (parent, x, y, props) {
        // Add all the properties of the prop obj to this instance.
        if (props) {
            for (var prop in props) {
                this[prop] = props[prop];
            }
        }

        // If this sprite displays an image or features animations...
        if (this.animSheet) {
            if (!this.frame) {
                this.frame = {w: 0, h: 0};
            }
            // A texture stores the information that represents an image. 
            // All textures have a base texture. (PIXI doc)
            this.animSheet = "graphics/" + A_.level.directoryPrefix + this.animSheet;
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
        this.position(x, y);

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
    // MOUSE INTERACTION
    interactive: function (interacts) {
        if (typeof interacts === "undefined")
            return this.sprite.interactive;
        if (interacts) {
            var that = this;
            if (!this.initedInput) {
                this.sprite.mousedown = function () {
                    window.console.log("mousedown");
                    that.leftpressed = true;
                    that.leftdown = true;
                };
                this.sprite.mouseup = function () {
                    window.console.log("mouseup");
                    that.leftreleased = true;
                    that.leftdown = false;
                };
                this.sprite.mouseupoutside = function () {
                    that.leftreleased = true;
                    that.leftdown = false;
                };
                this.sprite.rightdown = function () {
                    that.rightpressed = true;
                    that.rightdown = true;
                };
                this.sprite.rightup = function () {
                    that.rightreleased = true;
                    that.rightdown = false;
                };
                this.sprite.rightupoutside = function () {
                    that.rightreleased = true;
                    that.rightdown = false;
                };
                this.initedInput = true;
            }
            this.sprite.interactive = true;
        } else {
            this.sprite.interactive = false;
        }
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
        // Getter
        if (typeof x === "undefined" || typeof y  === "undefined") {
            return _.find(this.spritePoints, function (sprPt) {
                return sprPt.name === name;
            });
        }
        
        // Setter
        var sprPt = {};
        sprPt.name = name;
        sprPt.origPoint = new SAT.Vector(x, y);
        // .point refers to the position in the sprite's local coordinate system.
        sprPt.point = new SAT.Vector(x, y);
        // .calcPoint refers to the position in the sprite's parent coordinate system.
        sprPt.calcPoint = new SAT.Vector(x, y);
        sprPt.position = function (x, y) {
            if (x && y) {
                this.calcPoint.x = x + this.point.x;
                this.calcPoint.y = y + this.point.y;
            }
            else
                return this.calcPoint;
        };
        sprPt.rotation = function (rotation) {
            if (rotation) {
                // Calculate the vector from the point to the rotated point.
                var rotVec = this.point.clone().rotate(rotation).sub(this.point);
                // Add the vector to the position in the parent's coord sys.
                this.calcPoint.add(rotVec);
            } else
                return this.rotation;
        };
        sprPt.scale = function (x, y) {
            if (x && y) {
                this.point.x *= x;
                this.point.y *= y;
            } else
                return;
        };
        sprPt.x = function (x) {
            if (x)
                this.calcPoint.x = x;
            else
                return this.calcPoint.x;
        };
        sprPt.y = function (y) {
            if (y)
                this.calcPoint.y = y;
            else
                return this.calcPoint.y;
        };
        this.spritePoints.push(sprPt);
        return sprPt;
    },
    // TRANSFORMATIONS
    // PIXI/SAT dependent setters/getters, used to keep in sync PIXI, SAT and A_.
    x: function (x) {
        if (x)
            this.position(x, this.y());
        else
            return this.sprite.position.x;
    },
    y: function (y) {
        if (y)
            this.position(this.x(), y);
        else
            return this.sprite.position.y;
    },
    position: function (x, y) {
        if (x && y) {
            // Translate the PIXI sprite.
            this.sprite.position.x = x;
            this.sprite.position.y = y;
            // Translate sprite points.
            _.each(this.spritePoints, function (sp) {
                sp.position(x, y);
            });
        } else {
            return this.sprite.position;
        }
    },
    positionRelative: function (x, y) {
        this.position(this.x() + x, this.y() + y);
    },
    positionLevel: function () {
        return A_.level.container.toLocal(A_.game.origin, this.sprite);
    },
    size: function (w, h) {
        if (typeof w !== "number" || typeof h !== "number")
            return {width: Math.abs(this.sprite.width), height: Math.abs(this.sprite.height)};

        var prevWidth = this.sprite.width;
        var prevHeight = this.sprite.height;
        this.sprite.width = w;
        this.sprite.height = h;
        // We scale proportionally sprite points.
        _.each(this.spritePoints, function (sp) {
            sp.scale(w / prevWidth, h / prevHeight);
        });
    },
    width: function (w) {
        if (typeof w !== "number")
            return Math.abs(this.sprite.width);
        var prevWidth = this.sprite.width;
        this.sprite.width = w;
        // We scale proportionally sprite points on the x axis.
        _.each(this.spritePoints, function (sp) {
            sp.scale(w / prevWidth, 1);
        }, this);
    },
    height: function (h) {
        if (typeof h !== "number")
            return Math.abs(this.sprite.height);
        var prevHeight = this.sprite.height;
        this.sprite.height = h;
        // We scale proportionally sprite points on the y axis.
        _.each(this.spritePoints, function (sp) {
            sp.scale(1, h / prevHeight);
        }, this);
    },
    scale: function (x, y) {
        if (x && y) {
            var prevScaleX = this.sprite.scale.x;
            var prevScaleY = this.sprite.scale.y;
            this.sprite.scale.x = x;
            this.sprite.scale.y = y;
            // We scale proportionally sprite points.
            _.each(this.spritePoints, function (sp) {
                sp.scale(x / prevScaleX, y / prevScaleY);
            });
        }
        else
            return this.sprite.scale;
    },
    // Flip is a scaling with a negative factor.
    flip: function (axis) {
        var prevScale = this.scale();
        if (axis === "x") {
            this.scale(prevScale.x * -1, prevScale.y);
        } else if (axis === "y") {
            this.scale(prevScale.x, prevScale.y * -1);
        }
    },
    flipped: function (axis) {
        if (axis === "x") {
            if (this.scale().x < 0)
                return true;
            else
                return false;
        }
        else if (axis === "y") {
            if (this.scale().y < 0)
                return true;
            else
                return false;
        }
    },
    rotation: function (n) {
        if (n) {
            this.sprite.rotation = n;
            _.each(this.spritePoints, function (sp) {
                sp.rotation(n);
            });
        } else
            return this.sprite.rotation;
    },
    // ORIGIN (ANCHOR)
    origin: function (x, y) {
        if (typeof x === 'undefined' || typeof y === 'undefined')
            return this.sprite.anchor;
        var w = this.width();
        var h = this.height();
        var deltaX = x - this.sprite.anchor.x;
        var deltaY = y - this.sprite.anchor.y;
        var scale = this.scale();

        this.sprite.anchor.x = x;
        this.sprite.anchor.y = y;
        _.each(this.animations, function (animation) {
            animation.anchor.x = x;
            animation.anchor.y = y;
        });

        // Translate sprite children, sprite points and collision polygon (if any)
        // by -(delta * dim).

        _.each(this.sprites, function (sprite) {
            // Since the child coord sys is scaled, its positionRelative() 
            // is fed with the original parent's width.
            sprite.positionRelative(-deltaX * w / scale.x, -deltaY * h / scale.y);
        });

        _.each(this.spritePoints, function (sp) {
            sp.point.x -= deltaX * w;
            sp.point.y -= deltaY * h;
        });

        var colPol = this.collisionPolygon;
        if (colPol) {
            colPol.offset.x -= deltaX * w;
            colPol.offset.y -= deltaY * h;
            colPol.recalc();
        }
    },
    // TRANSPARENCY
    alpha: function (n) {
        if (typeof n !== "number") {
            return this.sprite.alpha;
        }
        this.sprite.alpha = n;
    },
    // Z ORDER & LAYERS
    z: function (position) {
        var parent;
        // If the sprite is the child of some other sprite...
        if (this.container) {
            // this.container is the instance of A_ sprite.
            parent = this.container.sprite.children[1];
        } else {
            // this.layer is the instance of PIXI DOC.
            parent = this.layer;
        }

        if (position) {
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
        } else {
            // Returns the index position of a child DisplayObject instance (PIXI doc).
            return parent.getChildIndex(this.sprite);
        }
    },
    moveToSprite: function (sprite, position) {
        var parent;
        if (this.layerName() !== sprite.layerName())
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
    layerName: function (name) {
        if (!name)
            return this.layer.name;
        else
            this.moveToLayer(name);
    },
    layerNumber: function (n) {
        if (typeof n !== "number") {
            return this.layer.parent.getChildIndex(this.layer);
        } else
            this.moveToLayer(n);
    },
    moveToLayer: function (layer) {
        if (typeof layer === "string") {
            var dest = A_.level.findLayerByName(layer);
        } else if (typeof layer === "number") {
            var dest = A_.level.findLayerByNumber(layer);
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
            var addon = new A_.SPRITES.ADDONS[addonName](this, props);
            this.addons.push(addon);
            return addon;
        }
    },
    addoff: function (addon) {
        var a = _.find(this.addons, addon);
        if (a) {
            this.addons.splice(this.addons.indexOf(addon), 1);
        }
        else {
            return;
        }
    },
    // CREATION/DESTRUCTION & UPDATE
    preupdate: function () {
        _.each(this.addons, function (addon) {
            if (addon.active)
                addon.update();
        });
    },
    update: function () {

    },
    postupdate: function () {
        if (!this.container) {
            var x = this.x();
            var y = this.y();
            var halfW = this.width() / 2;
            var halfH = this.height() / 2;
            if (this.collisionPolygon) {
                halfW = Math.abs(this.collisionPolygon.w / 2);
                halfH = Math.abs(this.collisionPolygon.h / 2);
            }
            if (this.bounded) {
                this.position(Math.max(halfW, Math.min(x, A_.game.level.width - halfW)),
                        Math.max(halfH, Math.min(y, A_.game.level.height - halfH)));
            } else if (this.wrap) {
                if (x + halfW < 0) {
                    this.x(A_.game.level.width + halfW)
                } else if (x - halfW > A_.game.level.width) {
                    this.x(0 - halfW);
                }
                if (y + halfH < 0) {
                    this.y(A_.game.level.height + halfH)
                } else if (y - halfH > A_.game.level.height) {
                    this.y(0 - halfH);
                }
            }
            else {
                if (x < 0 || x > A_.game.level.width || y < 0 || y > A_.game.level.height) {
                    this.outOfBounds = true;
                } else {
                    this.outOfBounds = false;
                }
            }
        }
    },
    onCreation: function () {
//        _.each(this.addons, function(addon) {
//            window.console.log("reseted");
//            addon.reset();
//        });
    },
    destroy: function () {
        _.each(this.sprites, function (sprite) {
            sprite.destroy();
        });

        this.onDestruction();
        A_.game.spritesToDestroy.push(this);
    },
    onDestruction: function () {

    }
});
