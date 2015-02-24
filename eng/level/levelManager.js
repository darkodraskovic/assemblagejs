A_.LEVEL.LevelManager = Class.extend({
    init: function (game, manifests) {
        this.manifests = manifests;
        this.game = game;
        this.maps = {};
        // An array of loaded level manifests.
        this.loadedLevels = [];
        // An array of created levels.
        this.createdLevels = [];
        // An array of active levels.
        this.activeLevels = [];

        this.manageLevels = false;
        this.levelsToDeactivate = [];
        this.levelsToDestroy = [];
        this.levelsToCreate = [];
        this.levelsToActivate = [];
    },
    // Level LOADING
    loadLevel: function (manifest, callback) {
        if (_.contains(this.loadedLevels, manifest)) {
            window.console.log("Level is already loaded.");
            return;
        }

        if (!manifest || !_.contains(this.manifests, manifest)) {
            window.console.log("Cannot find manifest. Creating a dummy one.");
            manifest = {
                directory: "",
                type: "generic",
                scripts: [],
                map: "",
                graphics: [],
                sounds: []
            };
        }
        manifest.mapName = manifest.map;
        if (manifest.directory && !manifest.addedDirectory) {
            for (var i = 0; i < manifest.scripts.length; i++) {
                manifest.scripts[i] = manifest.directory + manifest.scripts[i];
            }
            manifest.map = manifest.directory + manifest.map;
            for (var i = 0; i < manifest.graphics.length; i++) {
                manifest.graphics[i] = manifest.directory + manifest.graphics[i];
            }
            for (var i = 0; i < manifest.sounds.length; i++) {
                for (var j = 0; j < manifest.sounds[i].length; j++) {
                    manifest.sounds[i][j] = manifest.directory + manifest.sounds[i][j];
                }
            }
            manifest.addedDirectory = true;
        }
        this._activateLevelLoader(callback, manifest);
    },
    _activateLevelLoader: function (callback, manifest) {
        var loader = new A_.LEVEL.Loader();
        loader.loadScripts(this._onScriptsLoaded.bind(this, callback, manifest, loader), manifest.scripts);
    },
    _onScriptsLoaded: function (callback, manifest, loader) {
        window.console.log("Loaded scripts");
        if (manifest.type === "tiled") {
            loader.loadMap(this._onMapLoaded.bind(this, callback, manifest, loader), manifest.map);
        }
        else {
            loader.loadGraphics(this._onGraphicsLoaded.bind(this, callback, manifest, loader), manifest.graphics);
        }
    },
    _onMapLoaded: function (callback, manifest, loader) {
        window.console.log("Loaded map");
        this.maps[manifest.map] = TileMaps[manifest.mapName];
        loader.loadGraphics(this._onGraphicsLoaded.bind(this, callback, manifest, loader), manifest.graphics);
    },
    _onGraphicsLoaded: function (callback, manifest, loader) {
        window.console.log("Loaded graphics");
        loader.loadSounds(this._onSoundsLoaded.bind(this, callback, manifest), manifest.sounds);
    },
    _onSoundsLoaded: function (callback, manifest) {
        window.console.log("Loaded sounds");
        window.console.log("Loaded EVERYTHING :)");

        this.loadedLevels.push(manifest);

        if (callback) {
            callback();
        }
    },
    // Level CREATION & DESTRUCTION
    _createLevel: function (manifest, name, activate) {
        this.levelsToCreate.push({manifest: manifest, name: name, activate: activate});
    },
    createLevels: function () {
        _.each(this.levelsToCreate, function (levelToCreate) {
            var manifest = levelToCreate.manifest;
            var name = levelToCreate.name;

            var level = this.createLevel(manifest, name);

            if (level && levelToCreate.activate) {
                this.activateLevel(name);
            }
        }, this);

        this.levelsToCreate.length = 0;
    },
    createLevel: function (manifest, name) {
        if (!_.contains(this.manifests, manifest)) {
            window.console.log("Cannot find manifest");
            return;
        }

        var level = new A_.LEVEL.Level(this.game, this);
        level.manifest = manifest;

        level.name = name;
        this.createdLevels.push(level);

        level.cameraOptions = A_.UTILS.copy(level.manifest.camera);
        level.createCamera();

        if (this.game.debug)
            level.createDebugLayer();

        if (level.manifest.type === "tiled") {
            A_.TILES.createTiledMap(this.maps[level.manifest.map], level);
            window.console.log("Created TILED LEVEL :)");
        }
        else {
            level.createDummyLayer();
            window.console.log("Created GENERIC LEVEL :)");
        }

        return level;
    },
    destroyLevel: function (name) {
        var level = this.findCreatedLevel(name);
        if (!level) {
            return;
        }

        this.levelsToDestroy.push(level);
    },
    destroyLevels: function () {
        _.each(this.levelsToDestroy, function (level) {
            level.clear();

            var ind = this.createdLevels.indexOf(level);
            this.createdLevels.splice(ind, 1);

            window.console.log("Level destroyed.");
        }, this);

        this.levelsToDestroy.length = 0;
//        A_.game.renderer.spriteBatch.flush();
    },
    activateLevel: function (name) {
        var level = this.findCreatedLevel(name);
        if (!level) {
            return;
        }

        if (this.findActiveLevel(name)) {
            window.console.log("Level is already active.");
            return;
        }

        this.levelsToActivate.push(level);
    },
    activateLevels: function () {
        _.each(this.levelsToActivate, function (level) {
            level.setScale(level.scale);

            this.game.stage.addChild(level.container);
            this.activeLevels.push(level);

            level.play();
            window.console.log("Level STARTS...");
        }, this);

        this.levelsToActivate.length = 0;
    },
    deactivateLevel: function (name) {
        var level = this.findCreatedLevel(name);
        if (!level) {
            return;
        }

        if (!this.findActiveLevel(name)) {
            window.console.log("Level is not active.");
            return;
        }

        this.levelsToDeactivate.push(level);
    },
    deactivateLevels: function () {
        _.each(this.levelsToDeactivate, function (level) {
            var ind = this.activeLevels.indexOf(level);
            if (ind > -1)
                this.activeLevels.splice(ind, 1);

            this.game.stage.removeChild(level.container);
        }, this);

        this.levelsToDeactivate.length = 0;
    },
    startLevel: function (manifest, name) {
        if (!_.contains(this.manifests, manifest)) {
            window.console.log("Cannot find manifest");
            return;
        }

        if (!_.contains(this.loadedLevels, manifest)) {
            this.loadLevel(manifest, this.startLevel.bind(this, manifest, name));
            return;
        }
        else if (this.findActiveLevel(name)) {
            window.console.log("Level is already active.");
        }
        else if (this.findCreatedLevel(name)) {
            this.activateLevel(name);
            this.manageLevels = true;
        }
        else {
            this._createLevel(manifest, name, true);
            this.manageLevels = true;
        }
    },
    restartLevel: function (name) {
        var level = this.findActiveLevel(name);

        this.deactivateLevel(name);
        this.destroyLevel(name);
        this._createLevel(level.manifest, level.name, true);

        this.manageLevels = true;
    },
    stopLevel: function (name) {
        var level = this.findActiveLevel(name);
        if (!level) {
            return;
        }

        this.deactivateLevel(name);
        this.destroyLevel(name);
        this.manageLevels = true;
    },
    updateLevels: function () {
//        _.each(this.activeLevels, function (level) {
//            level.run();
//        });
        for (var i = 0, len = this.activeLevels.length; i < len; i++) {
            this.activeLevels[i].run();
        }

        if (this.manageLevels) {
            window.console.log("managed levels");
            this.deactivateLevels();
            this.destroyLevels();
            this.createLevels();
            this.activateLevels();
            this.manageLevels = false;
        }
    },
    // HELPER FUNCS
    findCreatedLevel: function (name) {
        var level = _.find(this.createdLevels, function (level) {
            return level.name === name;
        });

        if (!level) {
            window.console.log("Cannot find created level.");
            return;
        } else {
            return level;
        }
    },
    findActiveLevel: function (name) {
        var level = _.find(this.activeLevels, function (level) {
            return level.name === name;
        });

        if (!level) {
            window.console.log("Cannot find active level.");
            return;
        } else {
            return level;
        }
    }
});