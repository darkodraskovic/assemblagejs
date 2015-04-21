A_.LEVEL.LevelManager = Class.extend({
    init: function (game, manifests) {
        this.manifests = manifests;
        this.game = game;
        this.maps = {};
        // An array of loaded level manifests.
        this.loadedManifests = [];
        // An array of active levels.
        this.levels = [];

        this.levelsToDestroy = [];
        this.levelsToCreate = [];
    },
    // Level LOADING
    createEmptyManifest: function () {
        return {
            directory: "",
            scripts: [],
            map: "",
            graphics: [],
            sounds: []
        };
    },
    loadLevel: function (manifest, onComplete, onProgress) {
        if (_.contains(this.loadedManifests, manifest)) {
            window.console.log("Level is already loaded.");
            return;
        }

        if (!manifest || !_.contains(this.manifests, manifest)) {
            window.console.log("Cannot find manifest. Creating a dummy one.");
            manifest = this.createEmptyManifest();
        }


        if (!manifest.pathAdded) {
            for (var i = 0; i < manifest.scripts.length; i++) {
                manifest.scripts[i] = A_.CONFIG.directories.scripts + manifest.directory + manifest.scripts[i] + ".js";
            }
            if (manifest.map) {
                manifest.map = A_.CONFIG.directories.maps + manifest.directory + manifest.map + ".js";
            }
            for (var i = 0; i < manifest.graphics.length; i++) {
                manifest.graphics[i] = A_.CONFIG.directories.graphics + manifest.directory + manifest.graphics[i];
            }
            for (var i = 0; i < manifest.sounds.length; i++) {
                for (var j = 0; j < manifest.sounds[i].length; j++) {
                    manifest.sounds[i][j] = A_.CONFIG.directories.sounds + manifest.directory + manifest.sounds[i][j];
                }
            }
            manifest.pathAdded = true;
        }

        var loader = new A_.LEVEL.Loader();
        if (onProgress) {
            loader.bind('load', onProgress)
        }
        loader.loadScripts(this._onScriptsLoaded.bind(this, onComplete, manifest, loader), manifest.scripts);
    },
    _onScriptsLoaded: function (onComplete, manifest, loader) {
        if (manifest.map) {
            loader.loadMap(this._onMapLoaded.bind(this, onComplete, manifest, loader), manifest.map);
        }
        else {
            loader.loadGraphics(this._onGraphicsLoaded.bind(this, onComplete, manifest, loader), manifest.graphics);
        }
    },
    _onMapLoaded: function (onComplete, manifest, loader) {
        var start = manifest.map.lastIndexOf("/") + 1;
        var end = manifest.map.indexOf(".js");
        var mapName = manifest.map.substring(start, end);
        this.maps[manifest.map] = TileMaps[mapName];
        loader.loadGraphics(this._onGraphicsLoaded.bind(this, onComplete, manifest, loader), manifest.graphics);
    },
    _onGraphicsLoaded: function (onComplete, manifest, loader) {
        loader.loadSounds(this._onSoundsLoaded.bind(this, onComplete, manifest), manifest.sounds);
    },
    _onSoundsLoaded: function (onComplete, manifest) {
        window.console.log("Loaded EVERYTHING :)");

        this.loadedManifests.push(manifest);

        if (onComplete) {
            onComplete();
        }
    },
    // Level CREATION & DESTRUCTION
    createLevel: function (manifest, name) {
        if (!_.contains(this.manifests, manifest)) {
            window.console.log("Cannot find level manifest.");
            return;
        }
        else if (!_.contains(this.loadedManifests, manifest)) {
            window.console.log("Loading level manifest first.");
            this.loadLevel(manifest, this.createLevel.bind(this, manifest, name));
            return;
        }
        else if (this.findLevelByName(name)) {
            window.console.log("The level is already created.");
            return;
        }

        var level = new A_.LEVEL.Level(this.game, this);
        level.manifest = manifest;

        level.name = name;

        level.cameraOptions = A_.UTILS.copy(level.manifest.camera);
        level.createCamera();

        if (this.game.debug)
            level.createDebugLayer();

        if (level.manifest.map) {
            A_.TILES.createTiledMap(this.maps[level.manifest.map], level);
        }
        else {
            level.createDummyLayer();
        }

        this.levelsToCreate.push(level);

        return level;
    },
    destroyLevel: function (level) {
        if (_.isString(level))
            level = this.findLevelByName(level);
        if (!level)
            return;

        this.levelsToDestroy.push(level);
    },
    updateLevels: function () {
        for (var i = 0, len = this.levels.length; i < len; i++) {
            this.levels[i].run();
        }

        // DESTROY levels
        for (i = 0, len = this.levelsToDestroy.length; i < len; i++) {
            var level = this.levelsToDestroy[i];
            level.clear();
            level.trigger('destroy');

            var ind = this.levels.indexOf(level);
            if (ind > -1)
                this.levels.splice(ind, 1);

            window.console.log("Level " + level.name + " DESTROYED.");
        }
        this.levelsToDestroy.length = 0;

        // CREATE levels
        for (i = 0, len = this.levelsToCreate.length; i < len; i++) {
            var level = this.levelsToCreate[i];

            this.game.stage.addChild(level.container);
            this.levels.push(level);

            level.play();

            level.trigger('create');
            
            window.console.log("Level " + level.name + " CREATED.");
        }
        this.levelsToCreate.length = 0;
    },
    // HELPER FUNCS
    findLevelByName: function (name) {
        return _.find(this.levels, function (level) {
            return level.name === name;
        });
    },
});