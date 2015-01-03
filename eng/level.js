A_.Level = Class.extend({
    width: 0,
    height: 0,
    scale: 1,
    init: function() {
        this.container = new PIXI.DisplayObjectContainer();
//        this.followee = null;
        this.sprites = [];
        this.tiles = [];
        this.tileLayers = [];
        this.spriteLayers = [];
        this.imageLayers = [];
        this.layers = [];
        this.debugLayer = null;
    },
    createEmptyLayer: function(name) {
        var layer = new PIXI.DisplayObjectContainer();
        layer.baked = false;
        layer.collision = false;
        layer.parallax = 100;
        if (name)
            layer.name = name;
        return layer;
    },
    createImageLayer: function(name, props) {
        var layer = this.createEmptyLayer(name);

        if (!props.width) {
            props.width = this.width;
        }
        if (!props.height) {
            props.height = this.height;
        }
        layer.addChild(new A_.SCENERY.TiledSprite(props).sprite);

        this.addImageLayer(layer);
        return layer;
    },
    createSpriteLayer: function(name) {
        var layer = this.createEmptyLayer(name);
        this.addSpriteLayer(layer);
        return layer;
    },
    createTileLayer: function(name, image, tileW, tileH, collides) {
        var layer = this.createEmptyLayer(name);
        var tilemap = new A_.TILES.Tilemap(layer, image, tileW, tileH, collides);
        layer.tilemap = tilemap;
        this.addTileLayer(layer);
        return layer;
    },
    createDebugLayer: function(name) {
        var layer = this.createEmptyLayer(name);
        this.addDebugLayer(layer);
        return layer;
    },
    // LAYER MANAGEMENT
    addLayer: function(layer) {
        this.layers.push(layer);
        this.container.addChild(layer);
        if (this.debugLayer) {
            this.toTopOfContainer(this.debugLayer);
        }
    },
    addImageLayer: function(layer) {
        this.imageLayers.push(layer);
        this.addLayer(layer);
    },
    addSpriteLayer: function(layer) {
        this.spriteLayers.push(layer);
        this.addLayer(layer);
    },
    addTileLayer: function(layer) {
        this.tileLayers.push(layer);
        this.addLayer(layer);
    },
    addDebugLayer: function(layer) {
        this.debugLayer = layer;
        this.debugLayer.name = "debug";
        this.addLayer(layer);
    },
    // if layer's object do not update their properties, such as animation or position
    // pre-bake layer, ie. make a single sprite/texture out of layer's objects
    bakeLayer: function(layer, level) {
        var renderTexture = new PIXI.RenderTexture(level.width, level.height);
        // Create a sprite that uses the render texture.
        var sprite = new PIXI.Sprite(renderTexture);
        // Render the layer to the render texture.
        renderTexture.render(layer);

//    for (var prop in layer) {
//        if (layer.hasOwnProperty(prop)) {
//            sprite[prop] = layer[prop];
//        }
//    }
        sprite.alpha = layer.alpha;
        sprite.baked = true;
        sprite.position = layer.position;
        sprite.parallax = layer.parallax;
        sprite.name = layer.name;
        if (layer.tilemap) {
            sprite.tilemap = layer.tilemap;
        }

        return sprite;
    },
    // TRANSFORMATIONS
    position: function(x, y) {
        if (typeof x === "number" && typeof y === "number") {
            this.container.position.x = x;
            this.container.position.y = y;
            this.processParallax(x, y);
            this.processScale();

          this.container.position.x = Math.round(this.container.position.x);
          this.container.position.y = Math.round(this.container.position.y);
        } else {
            return this.container.position;
        }
    },
    processParallax: function(x, y) {
        for (var i = 0; i < this.container.children.length; i++) {
            var layer = this.container.children[i];
            layer.position.x = -x + x * layer.parallax / 100;
            layer.position.y = -y + y * layer.parallax / 100;
        }
    },
    processScale: function() {
        // Transform the position from container's scaled local system  
        // into stage's unscaled global system.        
        this.container.position.x *= this.scale;
        this.container.position.y *= this.scale;
    },
    setScale: function(scale) {
        if (scale > 0.25 && scale < 5) {
            // scale the game world according to scale
            this.container.scale = new PIXI.Point(scale, scale);

            // position canvas in the center of the window if...
            // BUG: wrong behavior when screenBounded === false
            // BUG: zoom/in out camera movement strange behavior
            if (A_.camera.followType === "bounded") {
                if (this.container.width < A_.renderer.view.width) {
                    this.container.position.x = (A_.renderer.view.width - this.container.width) / 2;
                    this.container.position.x /= scale;
                }
                if (this.container.height < A_.renderer.view.height) {
                    this.container.position.y = (A_.renderer.view.height - this.container.height) / 2;
                    this.container.position.y /= scale;
                }
            }

            // If the world is scaled 2x, camera sees 2x less and vice versa. 
            A_.camera.width = A_.renderer.view.width / scale;
            A_.camera.height = A_.renderer.view.height / scale;

            this.scale = scale;
        }
    },
    // Layer Z POSITION
    toTopOfContainer: function(layer) {
        this.container.setChildIndex(layer, this.container.children.length - 1);
    },
    toBottomOfContainer: function(layer) {
        this.container.setChildIndex(layer, 0);
    },
    sortLayer: function(layer) {
        layer.children = _.sortBy(layer.children, function(child) {
            return child.position.y;
        });
    },
    // MOUSE POSITION
    mousePosition: function(mousePosition) {
        // Transform the mouse position from the unscaled stage's global system to
        // the unscaled scaled gameWorld.container's system. 
        mousePosition.x /= this.scale;
        mousePosition.y /= this.scale;
        mousePosition.x += A_.camera.x;
        mousePosition.y += A_.camera.y;
        return mousePosition;
    },
    // FIND
    // Layer
    findLayerByName: function(name) {
        return _.find(this.layers, function(layer) {
            return layer.name === name;
        });
    },
    findLayerByNumber: function(num) {
        return this.container.getChildAt(num);
    },
    findLayerSize: function(layer) {
        return layer.children.length;
    },
    // Sprite
    findSpriteByName: function(name) {
        var sprite = _.find(this.sprites, function(sprite) {
            return sprite.name === name;
        });
        return sprite;
    },
    findSpritesByName: function(name) {
        return _.filter(this.sprites, function(sprite) {
            return sprite.name === name;
        });
    },
    findSpritesByProperty: function(prop) {
        return _.filter(this.sprites, function(sprite) {
            return typeof sprite[prop] !== "undefined";
        });
    },
    findSpritesByPropertyValue: function(prop, value) {
        return _.filter(this.sprites, function(sprite) {
            return sprite[prop] === value;
        });
    },
    findSpriteByClass: function(spriteClass) {
        var sprite = _.find(this.sprites, function(sprite) {
            return sprite instanceof spriteClass;
        });
        return sprite;
    },
    findSpritesByClass: function(spriteClass) {
        return _.filter(this.sprites, function(sprite) {
            return sprite instanceof spriteClass;
        });
    },
    findSpriteContainingPoint: function(x, y) {
        var sprite = _.find(A_.collider.collisionSprites, function(sprite) {
            return sprite.containsPoint(x, y);
        });
        return sprite;
    },
    // TODO
    findSpriteByID: function() {

    }
});

// TEMPORARY - for debugging purposes only
window.addEventListener("mousewheel", mouseWheelHandler, false);
var scaleDelta = 0.25;
function mouseWheelHandler(e) {
    var scaleDelta = 0.02;
    if (e.wheelDelta > 0) {
        A_.level.setScale(A_.level.scale + scaleDelta);
    } else {
        A_.level.setScale(A_.level.scale - scaleDelta);
    }
}
