A_.SCENE.SceneManager = Class.extend({
    init: function (game) {
        this.game = game;
        this.maps = {};
        // An array of loaded scene manifests.
        this.loadedManifests = [];
        // An array of active scenes.
        this.scenes = [];

        this._scenesToDestroy = [];
        this._scenesToCreate = [];
    },
    // Scene LOADING
    loadScene: function (manifest, onComplete, onProgress) {
        if (_.contains(this.loadedManifests, manifest)) {
            window.console.log("Scene is already loaded.");
            return;
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

        var loader = new A_.Loader();
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
    // Scene CREATION & DESTRUCTION
    createScene: function (manifest, name) {
        if (!_.contains(this.loadedManifests, manifest)) {
            window.console.log("LOADING scene manifest first.");
            this.loadScene(manifest, this.createScene.bind(this, manifest, name));
            return;
        }

        var scene = new A_.SCENE.Scene(this, name, A_.CONFIG.camera, manifest);

        this._scenesToCreate.push(scene);
        return scene;
    },
    destroyScene: function (scene) {
        if (_.isString(scene))
            scene = this.findSceneByName(scene);
        if (!scene)
            return;

        this._scenesToDestroy.push(scene);
    },
    _manageScenes: function () {       
        // DESTROY scenes
        if (this._scenesToDestroy.length) {
            for (var i = 0, len = this._scenesToDestroy.length; i < len; i++) {
                var scene = this._scenesToDestroy[i];
                scene.clear();
                scene.trigger('destroy');

                var ind = this.scenes.indexOf(scene);
                if (ind > -1)
                    this.scenes.splice(ind, 1);

                window.console.log("Scene " + scene.name + " DESTROYED.");
            }
            this._scenesToDestroy.length = 0;
        }

        // CREATE scenes
        if (this._scenesToCreate.length) {
            for (i = 0, len = this._scenesToCreate.length; i < len; i++) {
                var scene = this._scenesToCreate[i];

                this.game.stage.addChild(scene.container);
                this.scenes.push(scene);

                scene.play();

                scene.trigger('create');

                window.console.log("Scene " + scene.name + " CREATED.");
            }
            this._scenesToCreate.length = 0;
        }
    },
    update: function () {
        for (var i = 0, len = this.scenes.length; i < len; i++) {
            this.scenes[i].update();
        }
        this._manageScenes();
    },
    // HELPER FUNCS
    findSceneByName: function (name) {
        return _.find(this.scenes, function (scene) {
            return scene.name === name;
        });
    }
});