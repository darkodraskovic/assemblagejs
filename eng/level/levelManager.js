A_.LEVEL.LevelManager = Class.extend({
    init: function(game) {
        this.game = game;
        this.mapsData = {};
        // An array of level names.
        this.loadedLevels = [];
        // A map of level objects.
        this.createdLevels = {};
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
        loader.loadSounds(this.onSoundsLoaded.bind(this, callback, data), data.sounds);
    },
    onSoundsLoaded: function(callback, data) {
        window.console.log("Loaded sounds");
        window.console.log("Loaded EVERYTHING :)");
        
        this.loadedLevels.push(data.name);

        if (callback) {
            callback();            
        }
    },
    // Level CREATION & DESTRUCTION
    createLevel: function(data) {
        var level = new A_.LEVEL.Level(this.game);
//        level.data = data;
        level.data = A_.UTILS.copy(data);
//        window.console.log(level.data === data);

        level.name = level.data.name;
        this.createdLevels[level.name] = level;

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
        if (this.activeLevel === level) {
            this.deactivateLevel(this.destroyLevel.bind(this, level));
            return;
        }
        if (!_.contains(this.createdLevels, level)) {
            window.console.log("not contains");
            return;
        }
        

        level.clear();
        
        delete this.mapsData[level.name];
        delete this.createdLevels[level.name];
        this.loadedLevels.splice(this.loadedLevels.indexOf(level.data.name), 1);
        
        
        window.console.log("destroyed level");
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
        } else if (!_.contains(this.loadedLevels, data.name)) {
            this.loadAssets(data, this.launchLevel.bind(this, data));
        } else {
            var level = this.createLevel(data);
            this.activateLevel(level);
        }
    },
    restartLevel: function(level) {
        this.deactivateLevel(function() {
            var lvl = this.createLevel(level.data);
            this.activateLevel(lvl);
        }.bind(this));
    }
});