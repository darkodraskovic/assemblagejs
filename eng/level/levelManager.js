A_.LEVEL.LevelManager = Class.extend({
    init: function (game, manifests) {
        this.manifests = manifests;
        this.game = game;
        this.mapsData = {};
        // An array of loaded level names.
        this.loadedLevels = [];
        // A map of level objects.
        this.createdLevels = {};

        this.errors = {
            manifest: "Cannot find manifest.",
            level: "Cannot find level."
        };
    },
    // Level LOADING
    loadLevel: function (name, callback) {
        var manifest = this.findManifest(name);
        if (!manifest) {
            window.console.log("Creating dummy manifest.");
            manifest = {
                name: "empty",
                type: "generic",
                scripts: [],
                map: "",
                graphics: [],
                sounds: []
            };
        }
        this.activateLevelLoader(callback, manifest);
    },
    activateLevelLoader: function (callback, manifest) {
        var loader = new A_.LEVEL.Loader();
        loader.loadScripts(this.onScriptsLoaded.bind(this, callback, manifest, loader), manifest.scripts);
    },
    onScriptsLoaded: function (callback, manifest, loader) {
        window.console.log("Loaded scripts");
        loader.loadMap(this.onMapLoaded.bind(this, callback, manifest, loader), manifest.map);
    },
    onMapLoaded: function (callback, manifest, loader) {
        window.console.log("Loaded map");
        this.mapsData[manifest.name] = loader.mapDataParsed;
        loader.loadGraphics(this.onGraphicsLoaded.bind(this, callback, manifest, loader), manifest.graphics);
    },
    onGraphicsLoaded: function (callback, manifest, loader) {
        window.console.log("Loaded graphics");
        loader.loadSounds(this.onSoundsLoaded.bind(this, callback, manifest), manifest.sounds);
    },
    onSoundsLoaded: function (callback, manifest) {
        window.console.log("Loaded sounds");
        window.console.log("Loaded EVERYTHING :)");

        if (!_.contains(this.loadedLevels, manifest.name)) {
            this.loadedLevels.push(manifest.name);
        }

        if (callback) {
            callback();
        }
    },
    // Level CREATION & DESTRUCTION
    createLevel: function (name) {
        var manifest = this.findManifest(name);
        if (!manifest) {
            return;
        }

        var level = new A_.LEVEL.Level(this.game);
        level.manifest = A_.UTILS.copy(manifest);

        level.name = level.manifest.name;
        this.createdLevels[level.name] = level;

        level.cameraOptions = level.manifest.camera;
        level.createCamera();

        if (this.game.debug)
            level.createDebugLayer();

        if (level.manifest.type === "tiled") {
            A_.TILES.createTiledMap(this.mapsData[level.name], level);
            level.createEntities(level.spritesToCreate);
            level.createEntities(level.tilesToCreate);
            window.console.log("Created TILED LEVEL :)");
        }
        else {
            level.createDummyLayer();
            window.console.log("Created GENERIC LEVEL :)");
        }

        return level;
    },
    destroyLevel: function (name) {
        var level = this.findLevel(name);
        if (!level) {
            return;
        }

        if (this.activeLevel === level) {
            this.stopLevel(this.destroyLevel.bind(this, name));
            return;
        }

        level.clear();

        delete this.mapsData[level.name];
        delete this.createdLevels[level.name];
        this.loadedLevels.splice(this.loadedLevels.indexOf(level.manifest.name), 1);

        window.console.log("Destroyed level.");
    },
    // USER API
    resumeLevel: function (name) {
        var level = this.findLevel(name);
        if (!level) {
            return;
        }

        if (this.activeLevel) {
            this.stopLevel(this.resumeLevel.bind(this, name));
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
    stopLevel: function (callback) {
        if (!this.activeLevel)
            return;

        this.activeLevel.stop(this.onActiveLevelStopped.bind(this, callback));
    },
    onActiveLevelStopped: function (callback) {
        this.game.stop(this.onGameStopped.bind(this, callback));
    },
    onGameStopped: function (callback) {
        this.game.stage.removeChild(this.activeLevel.container);

        this.activeLevel = null;
        A_.level = null;

        if (callback) {
            callback();
        }
    },
    startLevel: function (name) {
        var manifest = this.findManifest(name);
        if (!manifest) {
            return;
        }

        if (this.activeLevel) {
            this.stopLevel(this.startLevel.bind(this, name));
        } else if (!_.contains(this.loadedLevels, manifest.name)) {
            this.loadLevel(name, this.startLevel.bind(this, name));
        } else {
            this.createLevel(name);
            this.resumeLevel(name);
        }
    },
    restartLevel: function (name) {
        var level = this.findLevel(name);
        if (!level) {
            return;
        }

        this.stopLevel(function () {
            this.createLevel(name);
            this.resumeLevel(name);
        }.bind(this));
    },
    // HELPER FUNCS
    findLevel: function (name) {
        var level = _.find(this.createdLevels, function (level) {
            return level.name === name;
        });

        if (!level) {
            window.console.log(this.errors.level);
            return;
        } else {
            return level;
        }
    },
    findManifest: function (name) {
        var manifest = _.find(this.manifests, function (manifest) {
            return manifest.name === name;
        });

        if (!manifest) {
            window.console.log(this.errors.manifest);
            return;
        } else {
            return manifest;
        }
    }
});