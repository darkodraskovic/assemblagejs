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
        parent instanceof DODO.Layer ? parent.addChild(this.container) : this.parent = parent;
        this.position.set(x, y);
        this.scene.spritesToCreate.push(this);
        this.flip = new PIXI.Point();
        this.flip._container = this.container;
        Object.defineProperties(this.flip, {
            'x': {
                set: function (flipped) {
                    if (flipped && this._container.scale.x > 0)
                        this._container.scale.x *= -1;
                    else if (!flipped && this._container.scale.x < 0)
                        this._container.scale.x *= -1;
                },
                get: function () {
                    return this._container.scale.x < 0;
                }
            },
            'y': {
                set: function (flipped) {
                    if (flipped && this._container.scale.y > 0)
                        this._container.scale.y *= -1;
                    else if (!flipped && this._container.scale.y < 0)
                        this._container.scale.y *= -1;
                },
                get: function () {
                    return this._container.scale.y < 0;
                }
            }
        });
        this.container.position._sprite = this;
        Object.defineProperties(this.container.position, {
            'scene': {
                get: function () {
                    return this._sprite.scene.container.toLocal(this._sprite.scene.origin, this._sprite.container);
                }
            },
            'screen': {
                get: function () {
                    return this._sprite.container.getGlobalPosition();
                }
            }
        });
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
    // LAYER
    moveToSprite: function (sprite, position) {
        var layer = sprite.layer;
        if (layer) {
            this.layer = layer;
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
        _.each(this.children, function (sprite) {
            sprite.destroy();
        });
        this.parent = null;
        spritesToDestroy.push(this);
    },
    clear: function () {
        this.trigger('destroyed');
        if (this.container) {
            this.container._dodoSprite = null;
            this.container.parent && this.container.parent.removeChild(this.container);
            this.container.destroy();
        }
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
    },
    'z': {
        get: function () {
            return this.container.parent.getChildIndex(this.container);
        },
        set: function (position) {
            var parent = this.container.parent;
            if (_.isString(position)) {
                if (position === "top") {
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
        }
    },
    'layer': {
        get: function () {
            var parent = this.container.parent;
            while (parent && !(parent instanceof DODO.Layer)) {
                parent = parent.parent;
            }
            return parent;
        },
        set: function (layer) {
            if (_.isString(layer)) {
                layer = this.scene.findLayerByName(layer);
            } else if (_.isNumber(layer)) {
                layer = this.scene.findLayerByNumber(layer);
            }
            if (layer instanceof DODO.Layer) {
                layer.addChild(this.container);
                return layer;
            }
        }
    },
    'layerName': {
        get: function () {
            return this.layer.name;
        },
        set: function (name) {
            this.layer = name;
        }
    },
    'layerNumber': {
        get: function () {
            return this.layer.parent.getChildIndex(this.layer);
        },
        set: function (number) {
            this.layer = number;
        }
    },
    'parent': {
        get: function () {
            return this.container.parent._dodoSprite;
        },
        set: function (sprite) {
            sprite instanceof DODO.Sprite ? sprite.container.addChild(this.container) :
                    this.parent && this.parent.layer.addChild(this.container);
        }
    },
    'children': {
        get: function () {
            var children = [];
            _.each(this.container.children, function (child) {
                child._dodoSprite && children.push(child._dodoSprite);
            });
            return children;
        }
    }
});
