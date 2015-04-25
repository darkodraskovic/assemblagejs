A_.Loader = A_.EventDispatcher.extend({
    // SCRIPT loader
    loadScripts: function (scriptsToLoad, callback) {
        if (!scriptsToLoad || !scriptsToLoad.length) {
            (callback || function () {
                window.console.log("No scripts to load.");
            })();
            return;
        }
        this.loadScript(scriptsToLoad[0], this._onScriptLoaded.bind(this, scriptsToLoad, callback));
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
    _onScriptLoaded: function (scriptsToLoad, callback) {
        this.trigger('load');
        scriptsToLoad.shift();
        // If there are more scripts to load
        if (scriptsToLoad.length) {
            this.loadScript(scriptsToLoad[0], this._onScriptLoaded.bind(this, scriptsToLoad, callback));
        }
        // Call the user supplied callback.
        else {
            (callback || function () {
                window.console.log("SCRITPS loaded.");
            })();
        }
    },
    // MAP loader
    loadMap: function (map, callback) {
        if (!map) {
            (callback || function () {
                window.console.log("No map to load.");
            })();
            return;
        }
        this.loadScript(map, this._onMapLoaded.bind(this, map, callback), A_.CONFIG.directories.maps);
    },
    _onMapLoaded: function (map, callback) {
        this.maps[map] = TileMaps[map.substring(map.lastIndexOf("/") + 1)];

        this.trigger('load');
        (callback || function () {
            window.console.log("MAP loaded.");
        })();
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
        this.loadSound(soundsToLoad[0], this._onSoundLoaded.bind(this, soundsToLoad, callback));
    },
    loadSound: function (soundArray, callback) {
        new Howl({
            urls: _.map(soundArray, function (sound) {
                return A_.CONFIG.directories.sounds + sound;
            }),
            onload: callback
        });
    },
    _onSoundLoaded: function (soundsToLoad, callback) {
        this.trigger('load');
        soundsToLoad.shift();
        if (soundsToLoad.length) {
            this.loadSound(soundsToLoad[0], this._onSoundLoaded.bind(this, soundsToLoad, callback));
        } else {
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
        this.loadScripts(manifest.scripts, this._onManifestScriptsLoaded.bind(this, manifest, onComplete));
    },
    _onManifestScriptsLoaded: function (manifest, onComplete) {
        this.loadMap(manifest.map, this._onManifestMapLoaded.bind(this, manifest, onComplete));
    },
    _onManifestMapLoaded: function (manifest, onComplete) {
        this.loadGraphics(manifest.graphics, this._onManifestGraphicsLoaded.bind(this, manifest, onComplete));
    },
    _onManifestGraphicsLoaded: function (manifest, onComplete) {
        this.loadSounds(manifest.sounds, this._onManifestSoundsLoaded.bind(this, manifest, onComplete));
    },
    _onManifestSoundsLoaded: function (manifest, onComplete) {
        this.loadedManifests.push(manifest);
        (onComplete || function () {
            window.console.log("Loaded EVERYTHING :)");
        })();
    }
});