A_.Game = Class.extend({
    isRunning: false,
    init: function() {
        this.createRenderer();

        // Level management
        this.levels = [];
        this.level = null;

        // Entity management
        this.spritesToCreate = [];
        this.spritesToDestroy = [];
        this.tilesToCreate = [];
        this.tilesToDestroy = [];

        // Sound management
        this.sounds = [];

        this.debug = A_.CONFIG.debug;
        this.cameraOptions = A_.CONFIG.camera;

        this.time = new Date().getTime();
        this.dt = new Date().getTime();
        // Cf. run.js
        requestAnimFrame(runGame);
    },
    createRenderer: function() {
        this.rendererOptions = A_.CONFIG.renderer;
        this.screen = A_.CONFIG.screen;

        this.stage = new PIXI.Stage(this.screen.color);
        this.renderer = PIXI.autoDetectRenderer(this.screen.width, this.screen.height, this.rendererOptions);
        document.body.appendChild(this.renderer.view);
        A_.renderer = this.renderer;
    },
    // LEVEL LOADING
    loadGenericLevel: function(level) {
        this.levelType = "generic";
        if (!level) {
            level = {
                name: "empty",
                directoryPrefix: "",
                scripts: [],
                map: "",
                graphics: [],
                sounds: []
            };
        }
        this.levels.push(level);
        this.levelToLoad = level;

        if (this.level) {
            this.destroyLevel = true;
            this.activateLevelLoaderDeferred = true;
            return;
        } else {
            this.activateLevelLoader();
        }
    },
    loadTiledLevel: function(level) {
        this.levelType = "tiled";
        if (!_.find(this.levels, function(level) {
            return level.name === level.name;
        })) {
            this.levels.push(level);
        }

        if (this.level) {
            // Load level deferred: wait until the end of the game loop.
            this.destroyLevel = true;
            this.activateLevelLoaderDeferred = true;
            this.levelToLoad = level;
            return;
        } else {
            // Load level immediately.
            this.levelToLoad = level;
            this.activateLevelLoader();
        }
    },
    onLevelLoaded: function () {
        this.createLevelTemplate();
        if (this.levelType === "generic") {
            window.console.log("Loaded GENERIC LEVEL :)");
            this.level.createDummyLayer();
        } 
        else {
            window.console.log("Loaded TILED LEVEL :)");
            A_.TILES.createTiledMap(this.levelLoader.mapDataParsed);
        }
        this.startLevel();
    },
    activateLevelLoader: function() {
        this.levelLoader = new A_.LevelLoader(this.levelToLoad.directoryPrefix);
        A_.levelLoader = this.levelLoader;
        this.levelLoader.loadScripts(this.onScriptsLoaded.bind(this), this.levelToLoad.scripts);
    },
    onScriptsLoaded: function() {
        window.console.log("Loaded scripts");
        this.levelLoader.loadMap(this.onMapLoaded.bind(this), this.levelToLoad.map);
    },
    onMapLoaded: function() {
        window.console.log("Loaded map");
        this.levelLoader.loadGraphics(this.onGraphicsLoaded.bind(this), this.levelToLoad.graphics);
    },
    onGraphicsLoaded: function() {
        window.console.log("Loaded graphics");
        this.levelLoader.loadSounds(this.onSoundsLoaded.bind(this), this.levelToLoad.sounds);
    },
    onSoundsLoaded: function() {
        window.console.log("Loaded sounds");
        this.onLevelLoaded();
    },
    createLevelTemplate: function() {
        this.level = new A_.Level();
        A_.level = this.level;

        this.collider = new A_.COLLISION.Collider();
        A_.collider = this.collider;

        if (this.debug)
            A_.level.createDebugLayer();

        // TODO: Remove. Currently used only by this.createSound().
        if (this.levelLoader.directoryPrefix)
            this.level.directoryPrefix = this.levelLoader.directoryPrefix;
        else
            this.level.directoryPrefix = "";
    },
    startLevel: function() {
        this.setupCamera();

        this.level.setScale(this.level.scale);

        this.level.name = this.levelToLoad.name;
        this.activateLevelLoaderDeferred = false;
        this.levelToLoad = null;

        this.createEntities(this.spritesToCreate);
        this.createEntities(this.tilesToCreate);
        this.isRunning = true;
        this.onLevelStarted();
    },
    onLevelStarted: function() {
        window.console.log("Level STARTS...");
    },
    clearLevel: function() {
        this.collider = null;
        A_.collider = null;

        this.level = null;
        A_.level = null;

        this.camera = null;
        A_.camera = null;

        this.levelLoader = null;
        A_.levelLoader = null;

        delete(A_.game.level);
        delete(A_.game.collider);
        delete(A_.game.camera);
        delete(A_.game.levelLoader);

        this.destroySounds();

        this.stage.removeChildren();

        this.destroyLevel = false;
    },
    // CAMERA
    setupCamera: function() {
        this.camera = new A_.CAMERA.Camera(A_.game.renderer.view.width, A_.game.renderer.view.height, this.cameraOptions);
        A_.camera = this.camera;
    },
    // SPRITE CREATION and DESTRUCTION
    createSprite: function(SpriteClass, layer, x, y, props) {
        if (!SpriteClass)
            return;

        if (!layer) {
            layer = this.level.layers[0];
        }

        var sprite = new SpriteClass(layer, x, y, props);
//        if (sprite instanceof A_.SPRITES.Colliding)
//            sprite.setCollision(collisionPolygon);
        sprite.setPosition(x, y);
        sprite.onCreation();

        this.spritesToCreate.push(sprite);
        return sprite;
    },
    createTile: function(tileLayer, gid, x, y) {
        if (_.isString(tileLayer)) {
            tileLayer = A_.level.findLayerByName(tileLayer)
        }
        if (!tileLayer) {
            return;
        }
        var tile = tileLayer.tilemap.setTile(gid, x, y);
        return tile;
    },
    createEntities: function(entities) {
        if (!entities.length)
            return;
        var levelEntities = entities[0] instanceof A_.SPRITES.Animated ?
                this.level.sprites : this.level.tiles;
        _.each(entities, function(entity) {
            levelEntities.push(entity);
        });
        entities.length = 0;
    },
    destroyEntity: function(entity) {
        if (entity instanceof A_.SPRITES.Animated) {
            if (!_.contains(this.level.sprites, entity))
                return;

            entity.clear();

            if (entity === this.camera.followee) {
                this.camera.followee = null;
            }

            this.level.sprites.splice(this.level.sprites.indexOf(entity), 1);
        }
        else if (entity instanceof A_.TILES.Tile) {
            if (!_.contains(this.level.tiles, entity))
                return;

            entity.tilemap.unsetTile(entity.mapPosition.x, entity.mapPosition.y);
        }
    },
    destroyEntities: function(entities) {
        _.each(entities, function(entity) {
            this.destroyEntity(entity)
        }, this);
        entities.length = 0;
    },
    // TODO: Create a separate js to handle sound
    createSound: function(props) {
        _.each(props["urls"], function(url, i, list) {
            list[i] = "sounds/" + this.level.directoryPrefix + url;
        }, this);
        var sound = new Howl(props);
        this.sounds.push(sound);
        return sound;
    },
    destroySounds: function() {
        _.each(this.sounds, function(sound) {
            sound.unload();
        });
        this.sounds.length = 0;
    },
    // GAME LOOP
    run: function() {
        if (!this.isRunning)
            return;
        var now = new Date().getTime();
        this.dt = now - this.time;
        this.time = now;
        this.dt /= 1000;

        A_.INPUT.process();

        this.update();

        this.manageEntities();

        this.render();

        A_.INPUT.postprocess();

        this.manageLevels();
    },
    update: function() {
        // User-defined global routine hook.
        this.preupdate();

        // Active tiles' update
        _.each(this.level.tiles, function(sprite) {
            sprite.update();
        });

        // Sprites' updates.
        _.each(this.level.sprites, function(sprite) {
            sprite.preupdate();
        });
        
        _.each(this.level.sprites, function(sprite) {
            sprite.update();
        });
        
        
        // Collision handling
//        _.each(this.collider.collisionSprites, function(sprite) {
//            sprite.syncCollisionPolygon();
//        });

        this.collider.processCollisions();

        _.each(this.level.sprites, function(sprite) {
            sprite.postupdate();
        });
//        _.each(this.collider.collisionSprites, function(sprite) {
//            sprite.syncSprite();
//        });

        // User-defined global routine hook.
        this.postupdate();
    },
    preupdate: function() {

    },
    postupdate: function() {

    },
    manageEntities: function() {
        this.destroyEntities(this.tilesToDestroy);
        this.destroyEntities(this.spritesToDestroy);
        this.createEntities(this.tilesToCreate);
        this.createEntities(this.spritesToCreate);
    },
    render: function() {
        // TODO: Currently only sorting on y axis. Add a generic sort routine
        // based on an arbitrary property.
        _.each(this.level.spriteLayers, function(layer) {
            if (layer["sort"]) {
                A_.level.sortLayer(layer);
            }
        });

        if (this.debug) {
            _.each(this.collider.collisionSprites, function(sprite) {
                sprite.drawDebug();
            });
        }

        this.camera.update();

        this.renderer.render(this.stage);
    },
    manageLevels: function() {
        if (this.destroyLevel) {
            this.isRunning = false;
            this.clearLevel();
            if (this.activateLevelLoaderDeferred) {
                this.activateLevelLoader();
            }
        }
    }
});
