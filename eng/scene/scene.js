DODO.Layer = function (scene, name) {
//    PIXI.DisplayObjectContainer.call(this);
    PIXI.Container.call(this);
    this.scene = scene;
    this.name = name;
    this.scene.container.addChild(this);
    this.parallax = 100;
};
DODO.Layer.prototype = Object.create(PIXI.Container.prototype);
DODO.Layer.prototype.constructor = DODO.Layer;

DODO.Scene = DODO.Inputted.extend({
    init: function (name, cameraOptions, map) {
        this.name = name;
        this.map = map;

        this.container = new PIXI.Container();
        // WARNING: Hit area culls objects outside scene w & h, eg. objects on negative coords.
        this.container.hitArea = new PIXI.Rectangle(0, 0, DODO.game.renderer.width, DODO.game.renderer.height);
        this.initMouseReactivity();
        this.setMouseReactivity(true);

        // Layers
        this.layers = this.container.children;
        // Colliding tilemaps
        this.tilemaps = [];
        // Sprites & their sounds
        this.sprites = [];
        // Used for sprite management.
        this.spritesToCreate = [];
        this.spritesToDestroy = [];

        // Used to calculate the scene position of sprites.
        this.origin = new PIXI.Point(0, 0);
        // The scene size defaults to screen witdth x height.
        this.width = DODO.game.renderer.width;
        this.height = DODO.game.renderer.height;

        this.camera = new DODO.Camera(this, DODO.game.renderer.width, DODO.game.renderer.height, cameraOptions);

        if (map) {
            DODO.createTiledMap(DODO.getAsset(this.map), this);
        }

        DODO.game.stage.addChild(this.container);
        this.play();
        this.update();
        this.trigger('created');
        DODO.game.sceneManager._scenesToCreate.push(this);
    },
    // If layer's objects do not update their properties, such as animation or position,
    // pre-bake layer, ie. make a single sprite/texture out of layer's sprites.
    bakeLayer: function (layer) {
        var renderTexture = new PIXI.RenderTexture(DODO.game.renderer, this.width, this.height);
        // Create a sprite that uses the render texture.
        var sprite = new PIXI.Sprite(renderTexture);
        // Render the layer to the render texture.
        renderTexture.render(layer);

        var bakedLayer = new DODO.Layer(this, layer.name);
        bakedLayer.name = layer.name;
        bakedLayer.alpha = layer.alpha;
        bakedLayer.scene = layer.scene;
        layer.collides && (bakedLayer.tilemap = layer.tilemap);
        bakedLayer.position.x = layer.position.x;
        bakedLayer.position.y = layer.position.y;
        bakedLayer.parallax = layer.parallax;
        bakedLayer.baked = true;
        bakedLayer.addChild(sprite);

        this.container.addChildAt(bakedLayer, this.container.getChildIndex(layer));
        this.container.removeChild(layer);
        layer.destroy();
    },
    destroy: function () {
        DODO.game.sceneManager._scenesToDestroy.push(this);
    },
    clear: function () {
        _.each(this.sprites, function (sprite) {
            sprite.clear();
        });
        _.each(this.layers, function (layer) {
            layer.destroy();
        });
        _.each(this.tilemaps, function (tilemap) {
            tilemap = null;
        });
        this.trigger('destroyed');
        this.debind();
        this.container.parent.removeChild(this.container);
        this.container.destroy();
    },
    // START/STOP scene execution
    play: function () {
        this.running = true;
    },
    pause: function () {
        this.running = false;
    },
    // Scene LOOP/UPDATE
    update: function () {
        if (!this.running) {
            return;
        }

        // Update SPRITES
        var sprites = this.sprites;
        for (var i = 0, len = sprites.length; i < len; i++) {
            sprites[i].update();
        }
        // Manage SPRITES
        for (var i = 0, len = this.spritesToDestroy.length; i < len; i++) {
            this.spritesToDestroy[i].clear();
            for (var index = sprites.indexOf(this.spritesToDestroy[i]); index < sprites.length - 1; index++) {
                sprites[index] = sprites[index + 1];
            }
            sprites.length--;
        }
        this.spritesToDestroy.length = 0;
        for (var i = 0, len = this.spritesToCreate.length; i < len; i++) {
            sprites.push(this.spritesToCreate[i]);
        }
        this.spritesToCreate.length = 0;

        // Camera & Scene POSITION
        var camPosition = this.camera.update();
        this.container.position.x = -camPosition.x * this.scale.x;
        this.container.position.y = -camPosition.y * this.scale.y;
        // Layer parallax
        for (var i = 0; i < this.layers.length; i++) {
            var layer = this.layers[i];
            layer.position.x = -camPosition.x * (layer.parallax / 100 - 1);
            layer.position.y = -camPosition.y * (layer.parallax / 100 - 1);
        }
        if (DODO.config.pixelRounding) {
            this.container.position.x = Math.round(this.container.position.x);
            this.container.position.y = Math.round(this.container.position.y);
        }
    },
    // Layer Z POSITION
    toTopOfContainer: function (layer) {
        this.container.setChildIndex(layer, this.container.children.length - 1);
    },
    toBottomOfContainer: function (layer) {
        this.container.setChildIndex(layer, 0);
    },
    sortLayerByAxis: function (layer, axis) {
        if (_.isString(layer))
            layer = this.findLayerByName(layer);
        if (!(layer instanceof DODO.Layer))
            return;
        layer.children = _.sortBy(layer.children, function (child) {
            return child.position[axis];
        });
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

Object.defineProperties(DODO.Scene.prototype, {
    'width': {
        set: function (n) {
            this._playgroundWidth = n;
            this.container.hitArea.width = n;
        },
        get: function () {
            return this._playgroundWidth;
        }
    },
    'height': {
        set: function (n) {
            this._playgroundHeight = n;
            this.container.hitArea.height = n;
        },
        get: function () {
            return this._playgroundHeight;
        }
    },
    'mouse': {
        get: function () {
            return DODO.game.renderer.plugins.interaction.mouse.getLocalPosition(this.container);
        }
    },
    'scale': {
        get: function () {
            return this.container.scale;
        }
    },
});
