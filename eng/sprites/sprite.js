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
        this.container._dodoSprite = this;
        parent instanceof DODO.Layer ? parent.addChild(this.container) : parent.addSprite(this);
        this.position.set(x, y);
        this.scene.spritesToCreate.push(this);
    },
    // Visual BOUNDS
    getLeft: function () {
        return this.container.getBounds().x / this.scene.scale + this.scene.camera.position.x;
    },
    getRight: function () {
        var bounds = this.container.getBounds();
        return (bounds.x + bounds.width) / this.scene.scale + this.scene.camera.position.x;
    },
    getTop: function () {
        return this.container.getBounds().y / this.scene.scale + this.scene.camera.position.y;
    },
    getBottom: function () {
        var bounds = this.container.getBounds();
        return (bounds.y + bounds.height) / this.scene.scale + this.scene.camera.position.y;
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
        var bounds = this.container.getBounds();
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
        this.container.addChild(sprite.container);
    },
    removeSprite: function (sprite) {
        this.container.removeChild(sprite.container);
    },
    getChildrenSprites: function () {
        var children = [];
        _.each(this.container.children, function (child) {
            if (!_.isUndefined(child._dodoSprite))
                children.push(child._dodoSprite);
        });
        return children;
    },
    getParentSprite: function () {
        return this.container.parent._dodoSprite;
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
        return this.scene.container.toLocal(this.scene.origin, this.container);
    },
    getScreenPosition: function () {
        return this.container.getGlobalPosition();
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
        var parent = this.container.parent;
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
            layer.addChild(this.container);
            return layer;
        }
    },
    // Z ORDER
    getZ: function () {
        return this.container.parent.getChildIndex(this.container);
    },
    setZ: function (position) {
        var parent = this.container.parent;
        if (_.isString(position)) {
            if (position === "top") {
                // Changes the position of an existing child in the display object container (PIXI doc).
                parent.setChildIndex(this.container, parent.children.length - 1);
                return;
            } else if (position === "bottom") {
                parent.setChildIndex(this.container, 0);
                return;
            }
        } else if (_.isNumber(position)) {
            if (position >= 0 && position < parent.children.length)
                parent.setChildIndex(this.container, position);
        }
    },
    moveToSprite: function (sprite, position) {
        var layer = sprite.getLayer();
        if (layer) {
            this.setLayer(layer);
            if (position) {
                layer.addChildAt(this.container, layer.getChildIndex(sprite.container));
                if (position === "front") {
                    layer.swapChildren(this.container, sprite.container);
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
        if (this.container) {
            this.container._dodoSprite = null;
            this.container.parent && this.container.parent.removeChild(this.container);
            this.container.destroy();
        }
        this.trigger('destroyed');
        this.debind();
    }
});

Object.defineProperties(DODO.Sprite.prototype, {
    'position': {
        get: function () {
            return this.container.position;
        }
    },
    'rotation': {
        set: function (n) {
            this.container.rotation = n;
        },
        get: function () {
            return this.container.rotation;
        }
    },
    'scale': {
        get: function () {
            return this.container.scale;
        }
    },
    'width': {
        set: function (n) {
            this.container.width = n;
        },
        get: function () {
            return this.container.width.abs();
        }
    },
    'height': {
        set: function (n) {
            this.container.height = n;
        },
        get: function () {
            return this.container.height.abs();
        }
    },
    'alpha': {
        set: function (n) {
            this.container.alpha = n;
        },
        get: function () {
            return this.container.alpha;
        }
    },
    'visible': {
        set: function (visible) {
            this.container.visible = visible;
        },
        get: function () {
            return this.container.visible;
        }
    }
});
