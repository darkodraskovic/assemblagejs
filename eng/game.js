A_.Game = Class.extend({
    scale: 1,
    screenW: 800,
    screenH: 600,
    stageColor: 0x757575,
    isRunning: false,
    mousePosition: {stage: {x: 0, y: 0}, level: {x: 0, y: 0}},
    init: function() {
        this.createRenderer();

        this.origin = new PIXI.Point(0, 0);
        this.debug = A_.CONFIG.debug;

        A_.INPUT.addMouseReacivity(this);

        this.time = new Date().getTime();
        this.dt = new Date().getTime();

        this.levels = [];
        this.level = null;
        this.spritesToDestroy = [];
        this.spritesToCreate = [];
        this.tilesToDestroy = [];
        this.tilesToCreate = [];

        this.cameraOptions = A_.CONFIG.camera;

        this.sounds = [];
        requestAnimFrame(runGame);
    },
    createRenderer: function() {
        this.rendererOptions = A_.CONFIG.renderer;
        this.stage = new PIXI.Stage(this.stageColor);
        this.renderer = PIXI.autoDetectRenderer(this.screenW, this.screenH, this.rendererOptions);
        document.body.appendChild(this.renderer.view);
        A_.renderer = this.renderer;
        // this.sprite is referenced by the A_.INPUT.addMouseReactivity
        this.sprite = this.stage;
    },
    // LEVEL LOADING
    // Load empty LEVEL
    loadEmptyLevel: function(level) {
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
        this.onLevelLoaded = this.onEmptyLevelLoaded;

        if (this.level) {
            this.destroyLevel = true;
            this.activateLevelLoaderDeferred = true;
            return;
        } else {
            this.activateLevelLoader();
        }
    },
    onEmptyLevelLoaded: function() {
        window.console.log("Loaded EMPTY LEVEL :)");

        this.createLevelTemplate();

        var layer = this.level.createEmptyLayer();
        var text = new PIXI.Text("Level loaded :)", {font: "Bold 50px Courier New", fill: "Black",
            stroke: "LightGrey", strokeThickness: 0,
            dropShadow: true, dropShadowColor: '#444444', dropShadowAngle: Math.PI / 4, dropShadowDistance: 4});
        layer.addChild(text);
        text.anchor = new PIXI.Point(0.5, 0.5);
        text.position.x = this.renderer.width / 2;
        text.position.y = this.renderer.height / 2;
        this.level.addLayer(layer);

        this.startLevel();
    },
    // Load level from TILED
    loadTiledLevel: function(levelData) {
        if (!_.find(this.levels, function(level) {
            return level.name === levelData.name;
        })) {
            this.levels.push(levelData);
        }

        this.onLevelLoaded = this.onTiledLevelLoaded;

        if (this.level) {
            // Load level deferred: wait until the end of the game loop.
            this.destroyLevel = true;
            this.activateLevelLoaderDeferred = true;
            this.levelToLoad = levelData;
            return;
        } else {
            // Load level immediately.
            this.levelToLoad = levelData;
            this.activateLevelLoader();
        }
    },
    activateLevelLoader: function() {
        this.levelLoader = new A_.LevelLoader(this.levelToLoad.directoryPrefix);
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
    onTiledLevelLoaded: function() {
        window.console.log("Loaded TILED LEVEL :)");

        this.createLevelTemplate();

        A_.TILES.createTiledMap(this, this.levelLoader.mapDataParsed);

        this.startLevel();
    },
    // COMMON level routines
    createLevelTemplate: function() {
        this.level = new A_.Level();
        A_.level = this.level;

        this.collider = new A_.COLLISION.Collider();
        A_.collider = this.collider;

        if (this.debug)
            A_.level.createDebugLayer();

        // If the level was loaded
        if (this.levelLoader.directoryPrefix)
            this.level.directoryPrefix = this.levelLoader.directoryPrefix;
        // If the empty level was created
        else
            this.level.directoryPrefix = "";

        this.level.width = 0;
        this.level.height = 0;


        this.stage.addChild(this.level.container);
    },
    startLevel: function() {
        this.setupCamera();

        this.level.setScale(this.level.scale);

        this.level.name = this.levelToLoad.name;
        this.activateLevelLoaderDeferred = false;
        this.levelToLoad = null;
        this.onLevelLoaded = null;

        this.createSprites();
        this.isRunning = true;
        this.onLevelStarted();
    },
    onLevelStarted: function() {
        window.console.log("Level STARTS...");
    },
    unloadLevel: function() {
        this.destroyLevel = true;
    },
    clearLevel: function() {
        this.collider = null;
        A_.collider = null;

        this.level = null;
        A_.level = null;

        this.camera = null;
        A_.camera = null;

        this.levelLoader = null;

        delete(A_.game.level);
        delete(A_.game.collider);
        delete(A_.game.camera);
        delete(A_.game.LevelLoader);

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
    createSprite: function(SpriteClass, layer, x, y, props, collisionPolygon) {
        if (!SpriteClass)
            return;

        if (!layer) {
            layer = this.level.layers[0];
        }

        var sprite = new SpriteClass(layer, x, y, props);
        if (sprite instanceof A_.SPRITES.Colliding)
            sprite.setCollision(collisionPolygon);
        sprite.position(x, y);

        this.spritesToCreate.push(sprite);
        sprite.onCreation();
        return sprite;
    },
    createSprites: function() {
        var that = this;
        _.each(this.spritesToCreate, function(sprite) {
            that.level.sprites.push(sprite);
            // TODO: Find out why this does not work.
//            sprite.onCreation();
        });
        this.spritesToCreate.length = 0;
    },
//    destroySprite: function (sprite) {
//        
//        if (!_.contains(this.level.sprites, sprite))
//            return;
//
//        sprite.clear();
//
//        if (sprite === this.camera.followee) {
//            this.camera.followee = null;
//        }
//        
//        this.level.sprites.splice(this.level.sprites.indexOf(sprite), 1);
//    },
//    destroySprites: function () {
//        var that = this;
//        _.each(this.spritesToDestroy, function (sprite) {
//            that.destroySprite(sprite)
//        });
//        this.spritesToDestroy.length = 0;
//    },
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
        var that = this;
        _.each(entities, function(entity) {
            that.destroyEntity(entity)
        });
        entities.length = 0;
    },
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

        this.manageSprites();

        this.render();

        A_.INPUT.postprocess();

        this.manageLevels();

    },
    update: function() {
        // User-defined global routine.
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

        this.collider.processCollisions();

        _.each(this.level.sprites, function(sprite) {
            sprite.postupdate();
        });

        // User-defined global routine.
        this.postupdate();
    },
    preupdate: function() {

    },
    postupdate: function() {

    },
    manageSprites: function() {
//        this.destroySprites();
        this.destroyEntities(this.tilesToDestroy);
        this.destroyEntities(this.spritesToDestroy);
        this.createSprites();
    },
    render: function() {
        _.each(this.level.spriteLayers, function(layer) {
            if (layer["sort"]) {
                A_.level.sortLayer(layer);
            }
        });

        if (this.debug) {
            _.each(this.collider.collisionSprites, function(sprite) {
                sprite.drawDebug();
            })
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
