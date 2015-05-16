DODO.Sprite = DODO.Inputted.extend({
    destroyThis: false,
    updates: true,
    // parent refers to the instance of Sprite or layer (instance of PIXI.DisplayObjectContainer)
    init: function (parent, x, y, props) {
        // Add all the properties of the prop obj to this instance.
        _.extend(this, props);
        this._vector = new SAT.Vector();
        this.scene = parent.scene;
    },
    initializeSprite: function (parent, x, y) {
        this.sprite._dodoSprite = this;
        parent instanceof DODO.Layer ? parent.addChild(this.sprite) : parent.addSprite(this);
        this.position.set(x, y);
        this.scene.spritesToCreate.push(this);
    },
    // Visual BOUNDS
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
        return this.getLeft() + this.width / 2;
    },
    getCenterY: function () {
        return this.getTop() + this.height / 2;
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
    // Sprite HIERARCHY
    // The first child of this PIXI sprite is the parent of PIXI sprites belonging to other DODO sprites.
    addSprite: function (sprite) {
        this.sprite.addChild(sprite.sprite);
    },
    removeSprite: function (sprite) {
        this.sprite.removeChild(sprite.sprite);
    },
    getChildrenSprites: function () {
        var children = [];
        _.each(this.sprite.children, function (child) {
            if (!_.isUndefined(child._dodoSprite))
                children.push(child._dodoSprite);
        });
        return children;
    },
    getParentSprite: function () {
        return this.sprite.parent._dodoSprite;
    },
    // Sprite POINTS
    setPoint: function (name, x, y) {
        this.points = this.points || {};
        this.points[name] = {x: x, y: y};
    },
    getPoint: function (name) {
        this._vector.x = this.points[name].x * this.scale.x;
        this._vector.y = this.points[name].y * this.scale.y;
        this.rotation && this._vector.rotate(this.rotation);
        this._vector.x += this.position.x;
        this._vector.y += this.position.y;
        return this._vector;
    },
    // TRANSFORMATIONS
    getScenePosition: function () {
        return this.scene.container.toLocal(this.scene.origin, this.sprite);
    },
    getScreenPosition: function () {
        return this.sprite.getGlobalPosition();
    },
    flipX: function () {
        this.scale.x *= -1;
    },
    getFlippedX: function () {
        return this.scale.x < 0;
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
        this.scale.y *= -1;
    },
    getFlippedY: function () {
        return this.scale.y < 0;
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
    // LAYER
    getLayer: function () {
        var parent = this.sprite.parent;
        while (parent && !(parent instanceof DODO.Layer)) {
            parent = parent.parent;
        }
        return parent;
    },
    getLayerName: function () {
        return this.getLayer().name;
    },
    getLayerNumber: function () {
        var layer = this.getLayer();
        return layer.parent.getChildIndex(layer);
    },
    setLayer: function (layer) {
        if (_.isString(layer)) {
            layer = this.scene.findLayerByName(layer);
        } else if (_.isNumber(layer)) {
            layer = this.scene.findLayerByNumber(layer);
        }
        if (layer instanceof DODO.Layer) {
            layer.addChild(this.sprite);
            return layer;
        }
    },
    // Z ORDER
    getZ: function () {
        return this.sprite.parent.getChildIndex(this.sprite);
    },
    setZ: function (position) {
        var parent = this.sprite.parent;
        if (_.isString(position)) {
            if (position === "top") {
                // Changes the position of an existing child in the display object container (PIXI doc).
                parent.setChildIndex(this.sprite, parent.children.length - 1);
                return;
            } else if (position === "bottom") {
                parent.setChildIndex(this.sprite, 0);
                return;
            }
        } else if (_.isNumber(position)) {
            if (position >= 0 && position < parent.children.length)
                parent.setChildIndex(this.sprite, position);
        }
    },
    moveToSprite: function (sprite, position) {
        var layer = sprite.getLayer();
        if (layer) {
            this.setLayer(layer);
            if (position) {
                layer.addChildAt(this.sprite, layer.getChildIndex(sprite.sprite));
                if (position === "front") {
                    layer.swapChildren(this.sprite, sprite.sprite);
                }
            }
        }
    },
    // LIFECYCLE
    update: function () {
    },
    destroy: function () {
        var spritesToDestroy = this.scene.spritesToDestroy;
        if (_.contains(spritesToDestroy, this))
            return;
        _.each(this.getChildrenSprites(), function (sprite) {
            sprite.destroy();
        });
        this.spriteParent && this.spriteParent.removeSprite(this);
        spritesToDestroy.push(this);
    },
    clear: function () {
        if (this.sprite) {
            this.sprite._dodoSprite = null;
            this.sprite.parent && this.sprite.parent.removeChild(this.sprite);
            this.sprite.destroy();
        }
        this.trigger('destroyed');
        this.debind();
    }
});

Object.defineProperties(DODO.Sprite.prototype, {
    'position': {
        get: function () {
            return this.sprite.position;
        }
    },
    'rotation': {
        set: function (n) {
            this.sprite.rotation = n;
        },
        get: function () {
            return this.sprite.rotation;
        }
    },
    'scale': {
        get: function () {
            return this.sprite.scale;
        }
    },
    'width': {
        set: function (n) {
            this.sprite.width = n;
        },
        get: function () {
            return this.sprite.width.abs();
        }
    },
    'height': {
        set: function (n) {
            this.sprite.height = n;
        },
        get: function () {
            return this.sprite.height.abs();
        }
    },
    'alpha': {
        set: function (n) {
            this.sprite.alpha = n;
        },
        get: function () {
            return this.sprite.alpha;
        }
    },
    'visible': {
        set: function (visible) {
            this.sprite.visible = visible;
        },
        get: function () {
            return this.sprite.visible;
        }
    }
});
