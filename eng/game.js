A_.Game = Class.extend({
    isRunning: false,
    init: function () {
        this.createRenderer();

        // Level management
        this.levels = {};
        this.mapsData = {};
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
    createRenderer: function () {
        this.rendererOptions = A_.CONFIG.renderer;
        this.screen = A_.CONFIG.screen;

        this.stage = new PIXI.Stage(this.screen.color);
        this.renderer = PIXI.autoDetectRenderer(this.screen.width, this.screen.height, this.rendererOptions);
        document.body.appendChild(this.renderer.view);
        A_.renderer = this.renderer;
    },
    // LEVEL LOADING
    loadLevelData: function (levelData, callback) {
        if (!levelData) {
            levelData = {
                name: "empty",
                type: "generic",
                directoryPrefix: "",
                scripts: [],
                map: "",
                graphics: [],
                sounds: [],
            };
        }
        this.levelData = levelData;
        this.callback = callback;

        this.activateLevelDataLoader();
    },
    activateLevelDataLoader: function () {
        this.levelLoader = new A_.LevelLoader(this.levelData.directoryPrefix);
//        A_.levelLoader = this.levelLoader;
        this.levelLoader.loadScripts(this.onScriptsLoaded.bind(this), this.levelData.scripts);
    },
    onScriptsLoaded: function () {
        window.console.log("Loaded scripts");
        this.levelLoader.loadMap(this.onMapLoaded.bind(this), this.levelData.map);
    },
    onMapLoaded: function () {
        window.console.log("Loaded map");
        this.mapsData[this.levelData.name] = this.levelLoader.mapDataParsed;
        this.levelLoader.loadGraphics(this.onGraphicsLoaded.bind(this), this.levelData.graphics);
    },
    onGraphicsLoaded: function () {
        window.console.log("Loaded graphics");
        this.levelLoader.loadSounds(this.onSoundsLoaded.bind(this), this.levelData.sounds);
    },
    onSoundsLoaded: function () {
        window.console.log("Loaded sounds");

        this.levelLoader = null;
//        A_.levelLoader = null;
        this.levelData = null;

        if (this.callback)
            this.callback();
    },
//    onLevelLoaded: function () {
//
//    },
    createLevel: function (levelData) {
        var level = new A_.Level();
        level.data = levelData;

        level.name = level.data.name;
        this.levels[level.name] = level;

        level.directoryPrefix = level.data.directoryPrefix + "/";

        level.cameraOptions = level.data.camera;
        level.createCamera();

        if (this.debug)
            level.createDebugLayer();

        if (level.data.type === "tiled") {
            window.console.log("Created TILED LEVEL :)");
            A_.TILES.createTiledMap(this.mapsData[level.name], level);
        }
        else {
            window.console.log("Created GENERIC LEVEL :)");
            level.createDummyLayer();
        }

        this.createEntities(this.spritesToCreate, level);
        this.createEntities(this.tilesToCreate, level);
        
        return level;
    },
    activateLevel: function (level) {
        this.level = level;
        A_.level = level;

        this.collider = level.collider;
        A_.collider = level.collider;

        this.camera = level.camera;
        A_.camera = level.camera;
        this.level.setScale(this.level.scale);

        this.stage.addChild(this.level.container);
        window.console.log("Level STARTS...");
        
        this.start();
    },
    deactivateLevel: function () {
        this.collider = null;
        A_.collider = null;

        this.stage.removeChild(this.level.container);

        this.level = null;
        A_.level = null;

        this.camera = null;
        A_.camera = null;

//        delete(A_.game.level);
//        delete(A_.game.collider);
//        delete(A_.game.camera);
//        delete(A_.game.levelLoader);
    },
    // SPRITE CREATION and DESTRUCTION
    createSprite: function (SpriteClass, layer, x, y, props) {
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
    createTile: function (tileLayer, gid, x, y) {
        if (_.isString(tileLayer)) {
            tileLayer = A_.level.findLayerByName(tileLayer)
        }
        if (!tileLayer) {
            return;
        }
        var tile = tileLayer.tilemap.setTile(gid, x, y);
        return tile;
    },
    createEntities: function (entities, level) {
        if (!entities.length)
            return;
        
        if (!level)
            level = this.level;
        
        var levelEntities = entities[0] instanceof A_.SPRITES.Animated ?
                level.sprites : level.tiles;
        _.each(entities, function (entity) {
            levelEntities.push(entity);
        });
        entities.length = 0;
    },
    destroyEntity: function (entity) {
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
    destroyEntities: function (entities) {
        _.each(entities, function (entity) {
            this.destroyEntity(entity)
        }, this);
        entities.length = 0;
    },
    // TODO: Create a separate js to handle sound
    createSound: function (props) {
        _.each(props["urls"], function (url, i, list) {
            list[i] = "sounds/" + this.level.directoryPrefix + url;
        }, this);
        var sound = new Howl(props);
        this.level.sounds.push(sound);
        return sound;
    },
    destroySounds: function () {
        _.each(this.level.sounds, function (sound) {
            sound.unload();
        });
        this.sounds.length = 0;
    },
    // GAME LOOP
    stop: function () {
        if (this.isRunning) {
            this.isRunning = false;
            this.stopped = true;
        }
    },
    onStopped: function () {
        window.console.log("stopped");
    },
    start: function () {
        if (!this.isRunning) {
            this.time = new Date().getTime();
            this.isRunning = true;
        }
    },
    run: function () {
        if (!this.isRunning) {
            if (this.stopped) {
                this.stopped = false;
                this.onStopped();
            }
            return;
        }

        var now = new Date().getTime();
        this.dt = now - this.time;
        this.time = now;
        this.dt /= 1000;

        A_.INPUT.process();

        this.update();

        this.manageEntities();

        this.render();

        A_.INPUT.postprocess();

        // State changed during the game loop
        if (!this.isRunning) {
            this.onStopped();
        }

//        this.manageLevels();
    },
    update: function () {
        // Active tiles' update
        _.each(this.level.tiles, function (sprite) {
            sprite.update();
        });

        _.each(this.level.sprites, function (sprite) {
            sprite.update();
        });

        // Collision handling
//        _.each(this.collider.collisionSprites, function(sprite) {
//            sprite.syncCollisionPolygon();
//        });

        this.collider.processCollisions();

//        _.each(this.collider.collisionSprites, function(sprite) {
//            sprite.syncSprite();
//        });
    },
    manageEntities: function () {
        this.destroyEntities(this.tilesToDestroy);
        this.destroyEntities(this.spritesToDestroy);
        this.createEntities(this.tilesToCreate);
        this.createEntities(this.spritesToCreate);
    },
    render: function () {
        // TODO: Currently only sorting on y axis. Add a generic sort routine
        // based on an arbitrary property.
        _.each(this.level.spriteLayers, function (layer) {
            if (layer["sort"]) {
                A_.level.sortLayer(layer);
            }
        });

        if (this.debug) {
            _.each(this.collider.collisionSprites, function (sprite) {
                sprite.drawDebug();
            });
        }

        this.camera.update();

        this.renderer.render(this.stage);
    },
    manageLevels: function () {
        if (this.destroyLevel) {
            this.isRunning = false;
            this.deactivateLevel();
            if (this.levelToStart) {
                this.startLevel(this.levelToStart);
            }
        }
    }
});
