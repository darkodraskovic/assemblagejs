DODO.Sprite = DODO.Evented.extend({
    destroyThis: false,
    updates: true,
    origin: new PIXI.Point(0, 0),
    // parent refers to the instance of Sprite or layer (instance of PIXI.DisplayObjectContainer)
    init: function(parent, x, y, props) {
        // Add all the properties of the prop obj to this instance.
        _.extend(this, props);
        this._vector = new SAT.Vector();
        this.scene = parent.scene;
    },
    initializeSprite: function(parent, x, y) {
        // Used to optimize getters & setters.
        this.position = this.sprite.position;
        this.scale = this.sprite.scale;

        // sprites DOC stores PIXI.Sprite-s belonging to children of this sprite.
        var sprites = new PIXI.DisplayObjectContainer();
        this.sprite.addChild(sprites);
        this.sprite.dodoSprite = this;

        if (parent instanceof DODO.Sprite) {
            parent.addSprite(this);
        }
        else if (parent instanceof DODO.Layer) {
            parent.addChild(this.sprite);
        }

        this.setPosition(x, y);
        this.scene.spritesToCreate.push(this);
    },
    // Visual BOUNDS
    getLeft: function() {
        return this.sprite.getBounds().x / this.scene.scale + this.scene.camera.x;
    },
    getRight: function() {
        var bounds = this.sprite.getBounds();
        return (bounds.x + bounds.width) / this.scene.scale + this.scene.camera.x;
    },
    getTop: function() {
        return this.sprite.getBounds().y / this.scene.scale + this.scene.camera.y;
    },
    getBottom: function() {
        var bounds = this.sprite.getBounds();
        return (bounds.y + bounds.height) / this.scene.scale + this.scene.camera.y;
    },
    getCenterX: function() {
        return this.getLeft() + this.getWidth() / 2;
    },
    getCenterY: function() {
        return this.getTop() + this.getHeight() / 2;
    },
    overlapsSprite: function(sprite) {
        return (this.getTop() <= sprite.getBottom() && this.getBottom() >= sprite.getTop()
                && this.getLeft() <= sprite.getRight() && this.getRight() >= sprite.getLeft());
    },
    isOnScreen: function() {
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
    // The last child of this PIXI sprite is the parent of PIXI sprites belonging to other DODO sprites.
    addSprite: function(sprite) {
        this.sprite.children[this.sprite.children.length - 1].addChild(sprite.sprite);
    },
    removeSprite: function(sprite) {
        this.sprite.children[this.sprite.children.length - 1].removeChild(sprite.sprite);
    },
    getChildrenSprites: function() {
        return _.map(this.sprite.children[this.sprite.children.length - 1].children, function(child) {
            return child.dodoSprite;
        });
    },
    getParentSprite: function() {
        return this.sprite.parent.parent.dodoSprite;
    },
    // Sprite POINTS
    setPoint: function(name, x, y) {
        this.points = this.points || {};
        this.points[name] = {x: x, y: y};
    },
    getPoint: function(name) {
        this._vector.x = this.points[name].x * this.scale.x;
        this._vector.y = this.points[name].y * this.scale.y;
        this.getRotation() && this._vector.rotate(this.getRotation());
        this._vector.x += this.position.x;
        this._vector.y += this.position.y;
        return this._vector;
    },
    // TRANSFORMATIONS
    setPosition: function(x, y) {
        this.position.x = x;
        this.position.y = y;
    },
    getPosition: function() {
        return this.position;
    },
    setX: function(x) {
        this.position.x = x;
    },
    getX: function() {
        return this.position.x;
    },
    setY: function(y) {
        this.position.y = y;
    },
    getY: function() {
        return this.position.y;
    },
    setXRelative: function(x) {
        this.setX(this.position.x + x);
    },
    setYRelative: function(y) {
        this.setY(this.position.y + y);
    },
    setPositionRelative: function(x, y) {
        this.setPosition(this.position.x + x, this.position.y + y);
    },
    getPositionScene: function() {
        return this.scene.container.toLocal(this.scene.origin, this.sprite);
    },
    getPositionScreen: function() {
        return this.sprite.toGlobal(this.scene.origin);
    },
    setWidth: function(w) {
        this.sprite.width = w;
    },
    getWidth: function() {
        return Math.abs(this.sprite.width);
    },
    setHeight: function(h) {
        this.sprite.height = h;
    },
    getHeight: function() {
        return Math.abs(this.sprite.height);
    },
    setScale: function(x, y) {
        this.scale.x = x;
        this.scale.y = y;
    },
    setScaleX: function(x) {
        this.scale.x = x;
    },
    setScaleY: function(y) {
        this.scale.y = y;
    },
    getScale: function() {
        return this.sprite.scale;
    },
    getScaleX: function() {
        return this.sprite.scale.x;
    },
    getScaleY: function() {
        return this.sprite.scale.y;
    },
    setRotation: function(n) {
        this.sprite.rotation = n;
    },
    getRotation: function() {
        return this.sprite.rotation;
    },
    flipX: function() {
        this.setScaleX(this.getScaleX() * -1);
    },
    getFlippedX: function() {
        return this.getScale().x < 0;
    },
    setFlippedX: function(flipped) {
        if (flipped) {
            if (!this.getFlippedX())
                this.flipX();
        }
        else {
            if (this.getFlippedX())
                this.flipX();
        }
    },
    flipY: function() {
        this.setScaleY(this.getScaleY() * -1);
    },
    getFlippedY: function() {
        return this.getScale().y < 0;
    },
    setFlippedY: function(flipped) {
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
    setOrigin: function(x, y) {
        var deltaX = -(x - this.origin.x) * this.getWidth() / this.scale.x;
        var deltaY = -(y - this.origin.y) * this.getHeight() / this.scale.y;

        this.origin.x = x;
        this.origin.y = y;

        _.each(this.getChildrenSprites(), function(sprite) {
            sprite.setPositionRelative(deltaX, deltaY);
        });

        _.each(this.points, function(p) {
            p.x += deltaX;
            p.y += deltaY;
        });

        return [deltaX, deltaY];
    },
    getOrigin: function() {
        return this.origin;
    },
    // Z ORDER & LAYERS
    getLayer: function() {
        var parent = this.sprite.parent;
        while (parent && !(parent instanceof DODO.Layer)) {
            parent = parent.parent;
        }
        return parent;
    },
    getLayerName: function() {
        return this.getLayer().name;
    },
    getLayerNumber: function() {
        var layer = this.getLayer();
        return layer.parent.getChildIndex(layer);
    },
    setLayer: function(layer) {
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
    getZ: function() {
        return this.sprite.parent.getChildIndex(this.sprite);
    },
    setZ: function(position) {
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
    moveToSprite: function(sprite, position) {
        var layer = sprite.getLayer();
        if (this.setLayer(layer)) {
            if (position === "back" || position === "front") {
                layer.addChildAt(this.sprite, layer.getChildIndex(sprite.sprite));
                if (position === "front") {
                    // Swaps the position of 2 PIXI DO within this PIXI DOC.
                    layer.swapChildren(this.sprite, sprite.sprite);
                }
            }
        }
    },
    // LIFECYCLE
    update: function() {
    },
    destroy: function() {
        var spritesToDestroy = this.scene.spritesToDestroy;
        if (_.contains(spritesToDestroy, this))
            return;
        _.each(this.getChildrenSprites(), function(sprite) {
            sprite.destroy();
        });
        this.trigger('destroyed');
        this.debind();
        spritesToDestroy.push(this);
    }
});

DODO.Sprite.inject(DODO.input.mouseReactivityInjection);