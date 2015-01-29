A_.LEVEL.Level = Class.extend({
    width: 0,
    height: 0,
    scale: 1,
    init: function () {
        this.container = new PIXI.DisplayObjectContainer();
        // this.sprite is referenced by the A_.INPUT.addMouseReactivity
        this.sprite = this.container;
        this.initMouseReactivity();
        this.setMouseReactivity(true);

        this.sprites = [];
        this.tiles = [];
        this.tileLayers = [];
        this.spriteLayers = [];
        this.imageLayers = [];
        this.layers = [];
        this.sounds = [];
        this.debugLayer = null;

        this.spritesToCreate = [];
        this.tilesToCreate = [];
        this.spritesToDestroy = [];
        this.tilesToDestroy = [];

        this.origin = new PIXI.Point(0, 0);

        this.width = A_.game.screen.width;
        this.height = A_.game.screen.height;

        this.collider = new A_.COLLISION.Collider();
    },
    createEmptyLayer: function (name) {
        var layer = new PIXI.DisplayObjectContainer();
        layer.baked = false;
        layer.collision = false;
        layer.parallax = 100;
        layer.level = this;
        if (name)
            layer.name = name;
        return layer;
    },
    createImageLayer: function (name, props, layer) {
        if (!layer) {
            layer = this.createEmptyLayer(name);
        }

        if (!props.width) {
            props.width = this.width;
        }
        if (!props.height) {
            props.height = this.height;
        }
        if (!props.level) {
            props.level = this;
        }
        layer.addChild(new A_.SCENERY.TiledSprite(props).sprite);

        this.addImageLayer(layer);
        return layer;
    },
    createSpriteLayer: function (name) {
        var layer = this.createEmptyLayer(name);
        this.addSpriteLayer(layer);
        return layer;
    },
    createTileLayer: function (name, image, tileW, tileH, collides) {
        var layer = this.createEmptyLayer(name);
        var tilemap = new A_.TILES.Tilemap(layer, image, tileW, tileH, collides);
        layer.tilemap = tilemap;
        this.addTileLayer(layer);
        return layer;
    },
    createDebugLayer: function (name) {
        var layer = this.createEmptyLayer(name);
        this.addDebugLayer(layer);
        return layer;
    },
    createDummyLayer: function () {
        var layer = this.createEmptyLayer();
        var text = new PIXI.Text("Level loaded :)", {font: "Bold 50px Courier New", fill: "Black",
            stroke: "LightGrey", strokeThickness: 0,
            dropShadow: true, dropShadowColor: '#444444', dropShadowAngle: Math.PI / 4, dropShadowDistance: 4});
        layer.addChild(text);
        text.anchor = new PIXI.Point(0.5, 0.5);
        text.position.x = A_.game.renderer.width / 2;
        text.position.y = A_.game.renderer.height / 2;
        this.addLayer(layer);
    },
    // ENTITIES management
    createSprite: function (SpriteClass, layer, x, y, props) {
        if (!SpriteClass)
            return;

        if (!layer) {
            layer = this.layers[0];
        }

        var sprite = new SpriteClass(layer, x, y, props);
//        if (sprite instanceof A_.SPRITES.Colliding)
//            sprite.setCollision(collisionPolygon);
        sprite.setPosition(x, y);
        sprite.onCreation();

        this.spritesToCreate.push(sprite);
        return sprite;
    },
    createTile: function (tileLayer, gid, x, y) {
        if (_.isString(tileLayer)) {
            tileLayer = A_.level.findLayerByName(tileLayer);
        }
        if (!tileLayer) {
            return;
        }
        var tile = tileLayer.tilemap.setTile(gid, x, y);
        return tile;
    },
    createEntities: function (entities) {
        if (!entities.length)
            return;

        var levelEntities = entities[0] instanceof A_.SPRITES.Animated ?
                this.sprites : this.tiles;
        _.each(entities, function (entity) {
            levelEntities.push(entity);
        });
        entities.length = 0;
    },
    destroyEntity: function (entity) {
        if (entity instanceof A_.SPRITES.Animated) {
            if (!_.contains(this.sprites, entity))
                return;
            entity.clear();
            this.sprites.splice(this.sprites.indexOf(entity), 1);
        }
        else if (entity instanceof A_.TILES.Tile) {
            if (!_.contains(this.tiles, entity))
                return;
            entity.tilemap.unsetTile(entity.mapPosition.x, entity.mapPosition.y);
        }
    },
    destroyEntities: function (entities) {
        _.each(entities, function (entity) {
            this.destroyEntity(entity)
        }, this);
        entities.length = 0;
    },
    // TODO: Create a separate js to handle sound
    createSound: function (props) {
//        var level = props.parent.level;
        var level = this;
        _.each(props["urls"], function (url, i, list) {
            list[i] = "sounds/" + level.directoryPrefix + url;
        }, this);
        var sound = new Howl(props);
        level.sounds.push(sound);
        return sound;
    },
    destroySounds: function () {
        _.each(this.sounds, function (sound) {
            sound.unload();
        });
        this.sounds.length = 0;
    },
    // LAYER management
    addLayer: function (layer) {
        this.layers.push(layer);
        this.container.addChild(layer);
        if (this.debugLayer) {
            this.toTopOfContainer(this.debugLayer);
        }
    },
    addImageLayer: function (layer) {
        this.imageLayers.push(layer);
        this.addLayer(layer);
    },
    addSpriteLayer: function (layer) {
        this.spriteLayers.push(layer);
        this.addLayer(layer);
    },
    addTileLayer: function (layer) {
        this.tileLayers.push(layer);
        this.addLayer(layer);
    },
    addDebugLayer: function (layer) {
        this.debugLayer = layer;
        this.debugLayer.name = "debug";
        this.addLayer(layer);
    },
    // If layer's object do not update their properties, such as animation or position
    // pre-bake layer, ie. make a single sprite/texture out of layer's objects.
    bakeLayer: function (layer, level) {
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
        sprite.position = layer.position;
        sprite.parallax = layer.parallax;
        sprite.name = layer.name;
        sprite.tilemap = layer.tilemap;
        sprite.collisionResponse = layer.collisionResponse;

        sprite.baked = true;
        return sprite;
    },
    update: function () {
        this.updateEntities();

        this.manageEntities();

        if (this.debugLayer) {
            _.each(this.collider.collisionSprites, function (sprite) {
                sprite.updateDebug();
            });
        }
        // TODO: Currently only sorting on y axis. Add a generic sort routine
        // based on an arbitrary property.
        _.each(this.spriteLayers, function (layer) {
            if (layer["sort"]) {
                this.sortLayer(layer);
            }
        }, this);

        this.camera.update();

        this.setPosition(-this.camera.x, -this.camera.y);

    },
    updateEntities: function () {
        // Active tiles' update
        _.each(this.tiles, function (sprite) {
            sprite.update();
        });

        _.each(this.sprites, function (sprite) {
            if (sprite.updates) {
                sprite.preupdate();
                sprite.update();
                sprite.postupdate();
            }
        });

        this.collider.processCollisions();
    },
    manageEntities: function () {
        this.destroyEntities(this.tilesToDestroy);
        this.destroyEntities(this.spritesToDestroy);
        this.createEntities(this.tilesToCreate);
        this.createEntities(this.spritesToCreate);
    },
    // TRANSFORMATIONS && CAMERA
    setPosition: function (x, y) {
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
    getPosition: function () {
        return this.container.position;
    },
    processParallax: function (x, y) {
        for (var i = 0; i < this.container.children.length; i++) {
            var layer = this.container.children[i];
            layer.position.x = -x + x * layer.parallax / 100;
            layer.position.y = -y + y * layer.parallax / 100;
        }
    },
    createCamera: function () {
        this.camera = new A_.CAMERA.Camera(A_.game.renderer.view.width, A_.game.renderer.view.height, this.cameraOptions);
    },
    processScale: function () {
        // Transform the position from container's scaled local system  
        // into stage's unscaled global system.        
        this.container.position.x *= this.scale;
        this.container.position.y *= this.scale;
    },
    setScale: function (scale) {
        if (scale > 0.25 && scale < 5) {
            // scale the game world according to scale
            this.container.scale = new PIXI.Point(scale, scale);

            this.camera.width /= scale / this.scale;
            this.camera.height /= scale / this.scale;

            this.scale = scale;
        }
    },
    // Layer Z POSITION
    toTopOfContainer: function (layer) {
        this.container.setChildIndex(layer, this.container.children.length - 1);
    },
    toBottomOfContainer: function (layer) {
        this.container.setChildIndex(layer, 0);
    },
    sortLayer: function (layer) {
        layer.children = _.sortBy(layer.children, function (child) {
            return child.position.y;
        });
    },
    // MOUSE POSITION
    mousePosition: function (mousePosition) {
        // Transform the mouse position from the unscaled stage's global system to
        // the unscaled scaled gameWorld.container's system. 
        mousePosition.x /= this.scale;
        mousePosition.y /= this.scale;
        mousePosition.x += this.camera.x;
        mousePosition.y += this.camera.y;
        return mousePosition;
    },
    getMouseX: function () {
        var x = this.container.stage.getMousePosition().x / this.scale;
        return x += this.camera.x;
    },
    getMouseY: function () {
        var y = this.container.stage.getMousePosition().y / this.scale;
        return y += this.camera.y;
    },
    getMousePosition: function () {
        var mousePosition = this.container.stage.getMousePosition().clone();
        mousePosition.x /= this.scale;
        mousePosition.y /= this.scale;
        mousePosition.x += this.camera.x;
        mousePosition.y += this.camera.y;
        return mousePosition;
    },
    // FIND
    // Layer
    findLayerByName: function (name) {
        return _.find(this.layers, function (layer) {
            return layer.name === name;
        });
    },
    findLayerByNumber: function (num) {
        return this.container.getChildAt(num);
    },
    findLayerSize: function (layer) {
        return layer.children.length;
    },
    // Sprite
    findSpriteByName: function (name) {
        var sprite = _.find(this.sprites, function (sprite) {
            return sprite.name === name;
        });
        return sprite;
    },
    findSpritesByName: function (name) {
        return _.filter(this.sprites, function (sprite) {
            return sprite.name === name;
        });
    },
    findSpritesByProperty: function (prop) {
        return _.filter(this.sprites, function (sprite) {
            return typeof sprite[prop] !== "undefined";
        });
    },
    findSpritesByPropertyValue: function (prop, value) {
        return _.filter(this.sprites, function (sprite) {
            return sprite[prop] === value;
        });
    },
    findSpriteByClass: function (spriteClass) {
        var sprite = _.find(this.sprites, function (sprite) {
            return sprite instanceof spriteClass;
        });
        return sprite;
    },
    findSpritesByClass: function (spriteClass) {
        return _.filter(this.sprites, function (sprite) {
            return sprite instanceof spriteClass;
        });
    },
    findSpriteContainingPoint: function (x, y) {
        var sprite = _.find(A_.collider.collisionSprites, function (sprite) {
            return sprite.containsPoint(x, y);
        });
        return sprite;
    },
    // TODO
    findSpriteByID: function () {

    }
});
A_.LEVEL.Level.inject(A_.INPUT.mouseReactivityInjection);

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
