A_.LEVEL.Level = Class.extend({
    width: 0,
    height: 0,
    scale: 1,
    scaleSpeed: 2,
    init: function (game) {
        this.game = game;

        this.container = new PIXI.DisplayObjectContainer();
        // this.sprite is referenced by the A_.INPUT.mouseReactivityInjection
        this.sprite = this.container;
        this.initMouseReactivity();
        this.setMouseReactivity(true);
        this.container.hitArea = new PIXI.Rectangle(0, 0, this.game.renderer.width, this.game.renderer.height);

        this.tileLayers = [];
        this.spriteLayers = [];
        this.imageLayers = [];
        // All previous layers.
        this.layers = [];
        this.debugLayer = null;

        // Colliding tiles
        this.tiles = [];
        // All the sprites & their sounds.
        this.sprites = [];
        this.sounds = [];
        // Used for sprite management.
        this.spritesToCreate = [];
        this.spritesToDestroy = [];

        // Used to calculate the level position of sprites.
        this.origin = new PIXI.Point(0, 0);
        // The level size defaults to screen witdth x height.
        this.setWidth(this.game.renderer.width);
        this.setHeight(this.game.renderer.height);

        // Helper object. Its purpose is to avoid getMousePosition() object creation.
        this._MousePosition = {x: 0, y: 0};

        this.running = false;
    },
    // LAYER management
    createEmptyLayer: function (name) {
        var layer = new PIXI.DisplayObjectContainer();
        layer.baked = false;
        // Used with tile layers. Has no effect on sprite layers where collision is 
        // defined per sprite class.
        layer.collision = false;
        layer.parallax = 100;
        layer.level = this;
        if (name)
            layer.name = name;
        return layer;
    },
    createImageLayer: function (name, props) {
        var layer = this.createEmptyLayer(name);

        if (!props.width) {
            props.width = this.width;
        }
        if (!props.height) {
            props.height = this.height;
        }
        if (!props.level) {
            props.level = this;
        }

        this.createImage(layer, props);

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
        text.position.x = this.game.renderer.width / 2;
        text.position.y = this.game.renderer.height / 2;
        this.addLayer(layer);
    },
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
    // If layer's objects do not update their properties, such as animation or position,
    // pre-bake layer, ie. make a single sprite/texture out of layer's sprites.
    bakeLayer: function (layer) {
        var renderTexture = new PIXI.RenderTexture(this.width, this.height);
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
        sprite.level = layer.level;
        sprite.position.x = layer.position.x;
        sprite.position.y = layer.position.y;
        sprite.parallax = layer.parallax;
        sprite.name = layer.name;
        sprite.tilemap = layer.tilemap;
        sprite.collisionResponse = layer.collisionResponse;

        sprite.baked = true;
        return sprite;
    },
    // IMAGES
    createImage: function (layer, props) {
        var image = new A_.SCENERY.TiledSprite(layer, props);
        layer.addChild(image.sprite);
        return image;
    },
    // ENTITIES management
    createSprite: function (SpriteClass, layer, x, y, props) {
        if (!SpriteClass)
            return;

        if (!layer) {
            layer = this.layers[this.layers.length - 1];
        }

        var sprite = new SpriteClass(layer, x, y, props);

        this.spritesToCreate.push(sprite);
        return sprite;
    },
    createSound: function (props) {
//        _.each(props["urls"], function (url, i, list) {
//            list[i] = "game/sounds/" + url;
//        });

        var urls = props["urls"];
        for (var i = 0, len = urls.length; i < len; i++) {
            urls[i] = "game/sounds/" + urls[i];
        }

        var sound = _.find(this.sounds, function (sound) {
            return _.isEqual(sound.urls(), props["urls"]);
        });
        if (sound) {
            return sound;
        }

        var sound = new Howl(props);
        this.sounds.push(sound);
        return sound;
    },
    destroySounds: function () {
        _.each(this.sounds, function (sound) {
            sound.unload();
        });
        this.sounds.length = 0;
    },
    clear: function () {
        this.destroySounds();

        _.each(this.layers, function (layer) {
            layer.level = null;
            delete(layer.level);
            layer.removeChildren();
            this.container.removeChild(layer);
        }, this);

    },
    // START/STOP level execution
    play: function () {
        this.running = true;
//        _.each(this.sprites, function (sprite) {
//            if (sprite.currentAnimation) {
//                sprite.currentAnimation.play();
//            }
//        });
        for (var i = 0, len = this.sprites.length; i < len; i++) {
            this.sprites[i].currentAnimation.play();
        }
    },
    pause: function () {
        this.running = false;
//        _.each(this.sprites, function (sprite) {
//            if (sprite.currentAnimation) {
//                sprite.currentAnimation.stop();
//            }
//        });
        for (var i = 0, len = this.sprites.length; i < len; i++) {
            this.sprites[i].currentAnimation.stop();
        }
    },
    onPaused: function () {
        window.console.log("game stopped");
        if (this.onPausedCallback) {
            this.onPausedCallback();
            this.onPausedCallback = null;
        }
    },
    // Level LOOP/UPDATE
    run: function () {
        if (!this.running) {
            if (this.stopped) {
                this.stopped = false;
                this.onPaused();
            }
            return;
        }

        // Update SPRITES
//        _.each(this.sprites, function (sprite) {
//            if (sprite.updates) {
//                sprite.update();
//            }
//        });
        for (var i = 0, len = this.sprites.length; i < len; i++) {
            this.sprites[i].update();
        }

        this.manageSprites();

        // Rendering
        if (A_.INPUT.mousewheel) {
            if (A_.INPUT.mousewheel === "forward") {
                this.setScale(this.scale + this.scaleSpeed * A_.game.dt);
            } else {
                this.setScale(this.scale - this.scaleSpeed * A_.game.dt);
            }
        }

        this.sortEntities();

        this.camera.update();

        this.setPosition(-this.camera.x, -this.camera.y);

        // MOUSE INPUT    
        this.resetMouseReaction();
    },
    manageSprites: function () {
//        _.each(this.spritesToDestroy, function (sprite) {
//            sprite.removeFromLevel();
//            this.sprites.splice(this.sprites.indexOf(sprite), 1);
//        }, this);
        for (var i = 0, len = this.spritesToDestroy.length; i < len; i++) {
            var sprite = this.spritesToDestroy[i];
            sprite.removeFromLevel();
            this.sprites.splice(this.sprites.indexOf(sprite), 1);
        }
        this.spritesToDestroy.length = 0;

//        _.each(this.spritesToCreate, function (sprite) {
//            this.sprites.push(sprite);
//        }, this);
        for (var i = 0, len = this.spritesToCreate.length; i < len; i++) {
            this.sprites.push(this.spritesToCreate[i]);
        }
        this.spritesToCreate.length = 0;
    },
    sortEntities: function () {
        // TODO: Currently only sorting on y axis. Add a generic sort routine
        // based on an arbitrary property.
        _.each(this.spriteLayers, function (layer) {
            if (layer["sort"]) {
                this.sortLayer(layer);
            }
        }, this);
    },
    // TRANSFORMATIONS && CAMERA
    setPosition: function (x, y) {
        this.container.position.x = x;
        this.container.position.y = y;
        this.processParallax(x, y);
        this.processScale();

        this.container.position.x = Math.round(this.container.position.x);
        this.container.position.y = Math.round(this.container.position.y);
    },
    processParallax: function (x, y) {
        for (var i = 0; i < this.layers.length; i++) {
            var layer = this.layers[i];
            layer.position.x = -x + x * layer.parallax / 100;
            layer.position.y = -y + y * layer.parallax / 100;
        }
    },
    processScale: function () {
        // Transform the position from container's scaled local system  
        // into stage's unscaled global system.        
        this.container.position.x *= this.scale;
        this.container.position.y *= this.scale;
    },
    setScale: function (scale) {
        if (scale > 0.25 && scale < 3) {
            // scale the game world according to scale
            this.container.scale = new PIXI.Point(scale, scale);

            this.camera.width /= scale / this.scale;
            this.camera.height /= scale / this.scale;

            this.scale = scale;
        }
    },
    setWidth: function (w) {
      this.width = w;
      this.container.hitArea.width = w;
    },
    setHeight: function (h) {
      this.height = h;
      this.container.hitArea.height = h;
    },
    getWidth: function () {
        return this.width;
    },
    getHeight: function () {
        return this.height;
    },
    createCamera: function () {
        this.cameraOptions.level = this;
        this.camera = new A_.CAMERA.Camera(this.game.renderer.width, this.game.renderer.height, this.cameraOptions);
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
    getMouseX: function () {
        var x = this.container.stage.getMousePosition().x / this.scale;
        return x += this.camera.x;
    },
    getMouseY: function () {
        var y = this.container.stage.getMousePosition().y / this.scale;
        return y += this.camera.y;
    },
    getMousePosition: function () {
        var levelPosition = this._MousePosition;
        var stagePosition = this.container.stage.getMousePosition();
        levelPosition.x = stagePosition.x;
        levelPosition.y = stagePosition.y;

        levelPosition.x /= this.scale;
        levelPosition.y /= this.scale;
        levelPosition.x += this.camera.x;
        levelPosition.y += this.camera.y;

        return levelPosition;
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
        return _.find(this.sprites, function (sprite) {
            return sprite.name === name;
        });
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
    findSpriteByPropertyValue: function (prop, value) {
        return _.find(this.sprites, function (sprite) {
            return sprite[prop] === value;
        });
    },
    findSpritesByPropertyValue: function (prop, value) {
        return _.filter(this.sprites, function (sprite) {
            return sprite[prop] === value;
        });
    },
    findSpriteByClass: function (spriteClass) {
        return _.find(this.sprites, function (sprite) {
            return sprite instanceof spriteClass;
        });
    },
    findSpritesByClass: function (spriteClass) {
        return _.filter(this.sprites, function (sprite) {
            return sprite instanceof spriteClass;
        });
    },
    findSpriteContainingPoint: function (x, y) {
        return _.find(this.collider.collisionSprites, function (sprite) {
            return sprite.containsPoint(x, y);
        });
    },
    // TODO
    findSpriteByID: function () {

    }
});

A_.LEVEL.Level.inject(A_.INPUT.mouseReactivityInjection);
