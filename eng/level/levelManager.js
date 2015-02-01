A_.LEVEL.LevelManager = Class.extend({
    init: function(game) {
        this.game = game;
        this.mapsData = {};
        this.levels = {};
    },
    // Level LOADING
    loadAssets: function(data, callback) {
        if (!data) {
            data = {
                name: "empty",
                type: "generic",
                directoryPrefix: "",
                scripts: [],
                map: "",
                graphics: [],
                sounds: []
            };
        }
        this.activateAssetsLoader(callback, data);
    },
    activateAssetsLoader: function(callback, data) {
        var loader = new A_.LEVEL.Loader(data.directoryPrefix);
        loader.loadScripts(this.onScriptsLoaded.bind(this, callback, data, loader), data.scripts);
    },
    onScriptsLoaded: function(callback, data, loader) {
        window.console.log("Loaded scripts");
        loader.loadMap(this.onMapLoaded.bind(this, callback, data, loader), data.map);
    },
    onMapLoaded: function(callback, data, loader) {
        window.console.log("Loaded map");
        this.mapsData[data.name] = loader.mapDataParsed;
        loader.loadGraphics(this.onGraphicsLoaded.bind(this, callback, data, loader), data.graphics);
    },
    onGraphicsLoaded: function(callback, data, loader) {
        window.console.log("Loaded graphics");
        loader.loadSounds(this.onSoundsLoaded.bind(this, callback), data.sounds);
    },
    onSoundsLoaded: function(callback) {
        window.console.log("Loaded sounds");

        if (callback) {
            callback();
        }
    },
    // Level CREATION & DESTRUCTION
    createLevel: function(data) {
        var level = new A_.LEVEL.Level(this.game);
        level.data = data;

        level.name = level.data.name;
        this.levels[level.name] = level;

        level.directoryPrefix = level.data.directoryPrefix + "/";

        level.cameraOptions = level.data.camera;
        level.createCamera();

        if (this.game.debug)
            level.createDebugLayer();

        if (level.data.type === "tiled") {
            window.console.log("Created TILED LEVEL :)");
            A_.TILES.createTiledMap(this.mapsData[level.name], level);
            level.createEntities(level.spritesToCreate);
            level.createEntities(level.tilesToCreate);
        }
        else {
            window.console.log("Created GENERIC LEVEL :)");
            level.createDummyLayer();
        }

        return level;
    },
    destroyLevel: function(level) {
        delete this.mapsData[level.name];

        this.stage.removeChild(level.container);

        this.destroySounds(level);

        delete this.levels[level.name];
    },
    // Level ACTIVATION & DEACTIVATION
    // Activation
    activateLevel: function(level) {
        if (this.activeLevel) {
            this.deactivateLevel(this.activateLevel.bind(this, level));
            return;
        } 

        this.activeLevel = level;
        A_.level = level;

        this.collider = level.collider;

        this.activeLevel.setScale(this.activeLevel.scale);

        this.game.stage.addChild(this.activeLevel.container);
        window.console.log("Level STARTS...");

        this.activeLevel.start();
        this.game.start();
    },
    // Deactivation
    deactivateLevel: function(callback) {
        if (!this.activeLevel)
            return;

        this.activeLevel.stop(this.onActiveLevelStopped.bind(this, callback));
    },
    onActiveLevelStopped: function(callback) {
        this.game.stop(this.onGameStopped.bind(this, callback));
    },
    onGameStopped: function(callback) {
        this.collider = null;

        this.game.stage.removeChild(this.activeLevel.container);

        this.activeLevel = null;
        A_.level = null;
        if (callback) {
            callback();
        }
    },
    // COMPOUND routines
    launchLevel: function(data) {
        if (this.activeLevel) {
            this.deactivateLevel(this.launchLevel.bind(this, data));
        } else {
            this.loadAssets(data, function() {
                var level = this.createLevel(data);
                this.activateLevel(level);
            }.bind(this));
        }
    },
    restartLevel: function(level) {
        this.deactivateLevel(function() {
            var l = this.createLevel(level.data);
            this.activateLevel(l);
        }.bind(this));
    }
});