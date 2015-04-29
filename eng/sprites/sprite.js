DODO.Sprite = DODO.Evented.extend({
    destroyThis: false,
    updates: true,
    origin: new PIXI.Point(0, 0),
    // parent refers to the instance of Sprite or layer (instance of PIXI.DisplayObjectContainer)
    init: function (parent, x, y, props) {
        // Add all the properties of the prop obj to this instance.
        if (props) {
            for (var prop in props) {
                if (_.isUndefined(this[prop]))
                    this[prop] = props[prop];
            }
        }
    },
    initializeSprite: function (parent, x, y) {
        // Used to optimize getters & setters.
        this.position = this.sprite.position;
        this.scale = this.sprite.scale;

        this.scene = parent.scene;

        // sprites DOC stores PIXI.Sprite-s belonging to children of this sprite.
        var sprites = new PIXI.DisplayObjectContainer();
        this.sprite.addChild(sprites);

        if (parent instanceof DODO.Sprite) {
            parent.addSprite(this);
        }
        else {
            this.layer = parent;
            this.layer.addChild(this.sprite);
        }

        this.setPosition(x, y);
        this.scene.spritesToCreate.push(this);
    },
    setFollowee: function (isFollowee) {
        if (isFollowee) {
            this.scene.camera.followee = this;
        }
        else if (this.scene.camera.followee === this) {
            this.scene.camera.followee = null;
        }
    },
    getLeft: function () {
        return this.sprite.getBounds().x / this.scene.scale + this.scene.camera.x;
    },
    getRight: function () {
        var bounds = this.sprite.getBounds();
        return (bounds.x + bounds.width) / this.scene.scale + this.scene.camera.x;
    },
    getTop: function () {
        return this.sprite.getBounds().y / this.scene.scale + this.scene.camera.y;
    },
    getBottom: function () {
        var bounds = this.sprite.getBounds();
        return (bounds.y + bounds.height) / this.scene.scale + this.scene.camera.y;
    },
    getCenterX: function () {
        return this.getLeft() + this.getWidth() / 2;
    },
    getCenterY: function () {
        return this.getTop() + this.getHeight() / 2;
    },
    overlapsSprite: function (sprite) {
        return (this.getTop() <= sprite.getBottom() && this.getBottom() >= sprite.getTop()
                && this.getLeft() <= sprite.getRight() && this.getRight() >= sprite.getLeft());
    },
    isOnScreen: function () {
        var bounds = this.sprite.getBounds();
        var renderer = this.scene.game.renderer;

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
        this.sprites = this.sprites || [];
        this.sprites.push(sprite);
        // The second child of this PIXI sprite is the parent of sprites added to this PIXI sprite.
        this.sprite.children[1].addChild(sprite.sprite);
        // .container is DODO sprite containing this DODO sprite.
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
        var sprPt = new DODO.SpritePoint(this, name, x, y);
        this.spritePoints = this.spritePoints || [];
        this.spritePoints.push(sprPt);
        return sprPt;
    },
    getSpritePoint: function (name) {
        return _.find(this.spritePoints, function (sprPt) {
            return sprPt.name === name;
        });
    },
    // TRANSFORMATIONS
    // PIXI dependent setters/getters, used to keep in sync PIXI and DODO.
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
    getPositionScene: function () {
        return this.scene.container.toLocal(this.scene.origin, this.sprite);
    },
    getPositionScreen: function () {
        return this.sprite.toGlobal(this.scene.origin);
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
        this.setYRelative(-this.sprite.height * (1 - this.origin.y));
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
            // this.container is the instance of DODO sprite.
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
            var dest = this.scene.findLayerByName(layer);
        } else if (_.isNumber(layer)) {
            var dest = this.scene.findLayerByNumber(layer);
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
    // CREATION/DESTRUCTION & UPDATE
    update: function () {
    },
    destroy: function (recursive) {
        var spritesToDestroy = this.scene.spritesToDestroy;
        if (_.contains(spritesToDestroy, this))
            return;
        if (this.container && !recursive)
            this.container.removeSprite(this);
        if (this.sprites && this.sprites.length) {
            for (var i = 0; i < this.sprites.length; i++) {
                this.sprites[i].destroy(true);
            }
        }
        this.trigger('destroyed');
        this.debind();
        spritesToDestroy.push(this);
    }
});

DODO.Sprite.inject(DODO.input.mouseReactivityInjection);