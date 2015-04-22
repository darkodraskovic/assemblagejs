A_.Loader = A_.EventDispatcher.extend({
    // SCRIPT loader
    loadScripts: function (callback, scriptsToLoad) {
        // If the func is called with only one argument, ie. an array of script names
        if (!scriptsToLoad) {
            scriptsToLoad = callback;
            callback = function () {
                window.console.log("Scripts loaded.");
            };
        }
        // If the user supplied no scripts to load
        if (!scriptsToLoad.length) {
            callback();
            return;
        }

        this.loadScript(scriptsToLoad[0], this._onScriptLoaded.bind(this, callback, scriptsToLoad));
    },
    loadScript: function (url, callback) {
        // Adding the script tag to the head...
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;

        // Fire the loading!
        head.appendChild(script);
    },
    _onScriptLoaded: function (callback, scriptsToLoad) {
        this.trigger('load');
        scriptsToLoad.shift();
        // If there are more scripts to load
        if (scriptsToLoad.length) {
            this.loadScript(scriptsToLoad[0], this._onScriptLoaded.bind(this, callback, scriptsToLoad));
        }
        // Call the user supplied callback.
        else {
            window.console.log("SCRITPS loaded.");
            callback();
        }
    },
    // MAP loader
    loadMap: function (callback, mapData) {
        // If the func is called with only one argument, ie. a map filename
        if (!mapData) {
            mapData = callback;
            callback = function () {
                window.console.log("MAP loaded.");
            };
        }

        this.loadScript(mapData, this._onMapLoaded.bind(this, callback));
    },
    _onMapLoaded: function (callback) {
        this.trigger('load');
        window.console.log("MAP loaded.");
        callback();
    },
    // GRAPHICS loader
    loadGraphics: function (callback, graphicsToLoad) {
        if (!graphicsToLoad) {
            graphicsToLoad = callback();
            callback = function () {
                window.console.log("GRAPHICS loaded.");
            };
        }
        if (graphicsToLoad.length < 1) {
            callback();
            return;
        }

        this.assetLoader = new PIXI.AssetLoader(graphicsToLoad);
        this.assetLoader.onComplete = this._onGraphicsLoaded.bind(this, callback);
        this.assetLoader.onProgress = this.trigger.bind(this, 'load');
        this.assetLoader.load();
    },
    _onGraphicsLoaded: function (callback) {
        window.console.log("GRAPHICS loaded.");
        callback();
    },
    // SOUND loader
    loadSounds: function (callback, soundsToLoad) {
        if (!soundsToLoad) {
            soundsToLoad = callback();
            callback = function () {
                window.console.log("SOUNDS loaded.");
            };
        }
        if (soundsToLoad.length < 1) {
            callback();
            return;
        }

        this.loadSound(soundsToLoad[0], this._onSoundLoaded.bind(this, callback, soundsToLoad));
    },
    loadSound: function (sound, callback) {
        new Howl({
            urls: sound,
            onload: callback
        });
    },
    _onSoundLoaded: function (callback, soundsToLoad) {
        this.trigger('load');
        soundsToLoad.shift();
        if (soundsToLoad.length) {
            this.loadSound(soundsToLoad[0], this._onSoundLoaded.bind(this, callback, soundsToLoad));
        } else {
            window.console.log("SOUNDS loaded.");
            callback();
        }
    }
});