A_.Loader = A_.EventDispatcher.extend({
    // SCRIPT loader
    loadScripts: function (scriptsToLoad, callback) {
        if (!scriptsToLoad || !scriptsToLoad.length) {
            (callback || function () {
                window.console.log("No scripts to load.");
            })();
            return;
        }
        _.each(scriptsToLoad, function (script) {
            this.loadScript(script, this._onScriptLoaded.bind(this, scriptsToLoad, script, callback));
        }, this);
    },
    loadScript: function (url, callback, path) {
        // Adding the script tag to the head...
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = (path || A_.CONFIG.directories.scripts) + url + ".js";

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;

        // Fire the loading!
        head.appendChild(script);
    },
    _onScriptLoaded: function (scriptsToLoad, script, callback) {
        this.trigger('load');
        scriptsToLoad.splice(scriptsToLoad.indexOf(script), 1);
        if (!scriptsToLoad.length) {
            (callback || function () {
                window.console.log("SCRITPS loaded.");
            })();
        }
    },
    // MAP loader
    loadMaps: function (maps, callback) {
        if (!maps || !maps.length) {
            (callback || function () {
                window.console.log("No map to load.");
            })();
            return;
        }
        _.each(maps, function (map) {
            this.loadScript(map, this._onMapLoaded.bind(this, maps, map, callback), A_.CONFIG.directories.maps);
        }, this)
    },
    _onMapLoaded: function (maps, map, callback) {
        this.maps[map] = TileMaps[map.substring(map.lastIndexOf("/") + 1)];
        maps.splice(maps.indexOf(map), 1);
        this.trigger('load');
        if (!maps.length) {
            (callback || function () {
                window.console.log("MAPS loaded.");
            })();
        }
    },
    // GRAPHICS loader
    loadGraphics: function (graphicsToLoad, callback) {
        if (!graphicsToLoad || !graphicsToLoad.length) {
            (callback || function () {
                window.console.log("No graphics to load.");
            })();
            return;
        }

        this.assetLoader = new PIXI.AssetLoader(_.map(graphicsToLoad, function (graphics) {
            return A_.CONFIG.directories.graphics + graphics;
        }));
        this.assetLoader.onComplete = this._onGraphicsLoaded.bind(this, callback);
        this.assetLoader.onProgress = this.trigger.bind(this, 'load');
        this.assetLoader.load();
    },
    _onGraphicsLoaded: function (callback) {
        (callback || function () {
            window.console.log("GRAPHICS loaded.");
        })();
    },
    // SOUND loader
    loadSounds: function (soundsToLoad, callback) {
        if (!soundsToLoad || !soundsToLoad.length) {
            (callback || function () {
                window.console.log("No sounds to load.");
            })();
            return;
        }
        _.each(soundsToLoad, function (soundArray) {
            this.loadSound(soundArray, this._onSoundLoaded.bind(this, soundsToLoad, soundArray, callback));
        }, this);
    },
    loadSound: function (soundArray, callback) {
        new Howl({
            urls: _.map(soundArray, function (sound) {
                return A_.CONFIG.directories.sounds + sound;
            }),
            onload: callback
        });
    },
    _onSoundLoaded: function (soundsToLoad, soundArray, callback) {
        this.trigger('load');
        soundsToLoad.splice(soundsToLoad.indexOf(soundArray), 1);
        if (!soundsToLoad.length) {
            (callback || function () {
                window.console.log("SOUNDS loaded.");
            })();
        }
    },
    // MANIFEST loader
    loadedManifests: [],
    maps: {},
    loadManifest: function (manifest, onComplete, onProgress) {
        if (_.contains(this.loadedManifests, manifest)) {
            (onComplete || function () {
                window.console.log("The manifest is already loaded.");
            })();
            return;
        }
        if (onProgress) {
            this.bind('load', onProgress)
        }
        this.loadScripts(manifest.scripts, this._onManifestLoaded.bind(this, manifest, "scripts", onComplete));
        this.loadMaps(manifest.maps, this._onManifestLoaded.bind(this, manifest, "maps", onComplete));
        this.loadGraphics(manifest.graphics, this._onManifestLoaded.bind(this, manifest, "graphics", onComplete));
        this.loadSounds(manifest.sounds, this._onManifestLoaded.bind(this, manifest, "sounds", onComplete));
    },
    _onManifestLoaded: function (manifest, asset, onComplete) {
        delete manifest[asset];
        if (!_.keys(manifest).length) {
            this.loadedManifests.push(manifest);
            (onComplete || function () {
                window.console.log("Loaded EVERYTHING :)");
            })();
        }
    }
});