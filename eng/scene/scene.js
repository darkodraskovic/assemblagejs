A_.SCENE.Layer = function (scene, name) {
    PIXI.DisplayObjectContainer.call(this);
    this.scene = scene;
    this.name = name;    
    this.scene.container.addChild(this);
    this.parallax = 100;
};
A_.SCENE.Layer.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
A_.SCENE.Layer.prototype.constructor = A_.SCENE.Layer;

A_.SCENE.Scene = A_.EventDispatcher.extend({
    width: 0,
    height: 0,
    scale: 1,
    scaleSpeed: 2,
    init: function (name, cameraOptions, map) {
        this.game = A_.game;
        this.name = name;
        this.map = map;

        this.container = new PIXI.DisplayObjectContainer();
        // this.sprite is referenced by the A_.INPUT.mouseReactivityInjection
        this.sprite = this.container;
        this.initMouseReactivity();
        this.setMouseReactivity(true);
        // WARNING: Hit area culls objects outside scene w & h, eg. objects on negative coords.
        this.container.hitArea = new PIXI.Rectangle(0, 0, this.game.renderer.width, this.game.renderer.height);

        // Layers
        this.layers = this.container.children;
        // Colliding tilemaps
        this.tileMaps = [];
        // Sprites & their sounds
        this.sprites = [];
        this.sounds = [];
        // Used for sprite management.
        this.spritesToCreate = [];
        this.spritesToDestroy = [];

        // Used to calculate the scene position of sprites.
        this.origin = new PIXI.Point(0, 0);
        // The scene size defaults to screen witdth x height.
        this.setWidth(this.game.renderer.width);
        this.setHeight(this.game.renderer.height);

        // Helper object. Its purpose is to avoid getMousePosition() object creation.
        this._MousePosition = {x: 0, y: 0};
        A_.INPUT.bind('forward', this, this.setScale.bind(this, 'forward'));
        A_.INPUT.bind('backward', this, this.setScale.bind(this, 'backward'));
        this.camera = new A_.CAMERA.Camera(this, this.game.renderer.width, this.game.renderer.height, cameraOptions);

        if (map) {
            A_.TILES.createTiledMap(A_.UTILS.getAsset(this.map), this);
        }

        this.trigger('created');
        A_.game.sceneManager._scenesToCreate.push(this);
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
        sprite.scene = layer.scene;
        sprite.position.x = layer.position.x;
        sprite.position.y = layer.position.y;
        sprite.parallax = layer.parallax;
        sprite.name = layer.name;
        sprite.tilemap = layer.tilemap;
        sprite.collisionResponse = layer.collisionResponse;

        sprite.baked = true;
        return sprite;
    },
    destroy: function () {
        this.trigger('destroyed');
        this.debind();
        A_.game.sceneManager._scenesToDestroy.push(this);
    },
    // START/STOP scene execution
    play: function () {
        this.running = true;
        for (var i = 0, len = this.sprites.length; i < len; i++) {
            if (this.sprites[i] instanceof A_.SPRITES.Animated)
                this.sprites[i].currentAnimation.play();
        }
    },
    pause: function () {
        this.running = false;
        for (var i = 0, len = this.sprites.length; i < len; i++) {
            if (this.sprites[i] instanceof A_.SPRITES.Animated)
                this.sprites[i].currentAnimation.stop();
        }
    },
    // Scene LOOP/UPDATE
    update: function () {
        if (!this.running) {
            return;
        }

        // Update SPRITES
        for (var i = 0, len = this.sprites.length; i < len; i++) {
            this.sprites[i].update();
        }
        this.manageSprites();
        this.sortSprites();

        this.camera.update();

        this.setPosition(-this.camera.x, -this.camera.y);
    },
    manageSprites: function () {
        for (var i = 0, len = this.spritesToDestroy.length; i < len; i++) {
            var sprite = this.spritesToDestroy[i];
            // Remove child only if parent is layer (if parent is other sprite, we already removed it via removeSprite()
            sprite.sprite.parent && sprite.sprite.parent.removeChild(sprite.sprite);
            this.sprites.splice(this.sprites.indexOf(sprite), 1);
            // DO NOT DELETE: Previous line should be replace by this, currently, BUGGY code.
//            var sprites = this.sprites;
//            var index = sprites.indexOf(sprite);
//            if (index >= 0) {
//                for (var i = index, len = sprites.length - 1; i < len; i++) {
//                    sprites[i] = sprites[i + 1];
//                }
//                sprites.length = len;
//            }
        }
        this.spritesToDestroy.length = 0;

        for (var i = 0, len = this.spritesToCreate.length; i < len; i++) {
            this.sprites.push(this.spritesToCreate[i]);
        }
        this.spritesToCreate.length = 0;
    },
    sortSprites: function () {
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
        // Parallax
        for (var i = 0; i < this.layers.length; i++) {
            var layer = this.layers[i];
            layer.position.x = -x + x * layer.parallax / 100;
            layer.position.y = -y + y * layer.parallax / 100;
        }
        // Transform the position from container's scaled local system  
        // into stage's unscaled global system.        
        this.container.position.x *= this.scale;
        this.container.position.y *= this.scale;

        if (A_.CONFIG.pixelRounding) {
            this.container.position.x = Math.round(this.container.position.x);
            this.container.position.y = Math.round(this.container.position.y);
        }
    },
    setScale: function (scale) {
        if (_.isString(scale))
            scale = this.scale +
                    (scale === 'forward' ? this.scaleSpeed * A_.game.dt : -this.scaleSpeed * A_.game.dt);

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
        var scenePosition = this._MousePosition;
        var stagePosition = this.container.stage.getMousePosition();
        scenePosition.x = stagePosition.x;
        scenePosition.y = stagePosition.y;

        scenePosition.x /= this.scale;
        scenePosition.y /= this.scale;
        scenePosition.x += this.camera.x;
        scenePosition.y += this.camera.y;

        return scenePosition;
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

A_.SCENE.Scene.inject(A_.INPUT.mouseReactivityInjection);
