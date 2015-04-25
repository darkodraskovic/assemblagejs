A_.Loader = A_.EventDispatcher.extend({
    onAssetLoaded: function (numAssets) {
        return function (callback) {
            if (numAssets) 
                this.trigger('load');
            if (--numAssets <= 0) {
                (callback || function () {
                    window.console.log("Asset loaded.");
                })();
            }
        };
    },
    // SCRIPT loader
    loadScripts: function (scriptsToLoad, callback) {
        var onScriptLoaded = this.onAssetLoaded((scriptsToLoad && scriptsToLoad.length) || 0);
        if (!scriptsToLoad || !scriptsToLoad.length) {
            onScriptLoaded(callback);
            return;
        }
        _.each(scriptsToLoad, function (script) {
            this.loadScript(script, onScriptLoaded.bind(this, callback));
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
    // MAP loader
    loadMaps: function (maps, callback) {
        var onAssetLoaded = this.onAssetLoaded((maps && maps.length) || 0);
        if (!maps || !maps.length) {
            onAssetLoaded.call(this, callback);
            return;
        }
        function onMapLoaded(map, callback) {
            this.maps[map] = TileMaps[map.substring(map.lastIndexOf("/") + 1)];
            onAssetLoaded.call(this, callback);
        }
        _.each(maps, function (map) {
            this.loadScript(map, onMapLoaded.bind(this, map, callback), A_.CONFIG.directories.maps);
        }, this);
    },
    // GRAPHICS loader
    loadGraphics: function (graphicsToLoad, callback) {
        if (!graphicsToLoad || !graphicsToLoad.length) {
            (callback || function () {
                window.console.log("No graphics to load.");
            })();
            return;
        }
        function onGraphicsLoaded(callback) {
            (callback || function () {
            window.console.log("GRAPHICS loaded.");
        })();
        }
        this.assetLoader = new PIXI.AssetLoader(_.map(graphicsToLoad, function (graphics) {
            return A_.CONFIG.directories.graphics + graphics;
        }));
        this.assetLoader.onComplete = onGraphicsLoaded.bind(this, callback);
        this.assetLoader.onProgress = this.trigger.bind(this, 'load');
        this.assetLoader.load();
    },
    // SOUND loader
    loadSounds: function (soundsToLoad, callback) {
        var onSoundLoaded = this.onAssetLoaded((soundsToLoad && soundsToLoad.length) || 0);
        if (!soundsToLoad || !soundsToLoad.length) {
            onSoundLoaded(callback);
        }
        _.each(soundsToLoad, function (soundArray) {
            this.loadSound(soundArray, onSoundLoaded.bind(this, callback));
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
    // MANIFEST loader
    maps: {},
    loadManifest: function (manifest, onComplete, onProgress) {
        if (onProgress) {
            this.bind('load', onProgress)
        }
        var onAssetTypeLoaded = this.onAssetLoaded((manifest && _.keys(manifest).length) || 0);
        this.loadScripts(manifest.scripts, onAssetTypeLoaded.bind(this, onComplete));
        this.loadMaps(manifest.maps, onAssetTypeLoaded.bind(this, onComplete));
        this.loadGraphics(manifest.graphics, onAssetTypeLoaded.bind(this, onComplete));
        this.loadSounds(manifest.sounds, onAssetTypeLoaded.bind(this, onComplete));
    }
});