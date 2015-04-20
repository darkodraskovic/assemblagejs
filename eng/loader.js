A_.LEVEL.Loader = A_.EventDispatcher.extend({
    // SCRIPT loader
    loadScripts: function (callback, scriptsToLoad) {
        // If the func is called with only one argument, ie. an array of script names
        if (!scriptsToLoad) {
            scriptsToLoad = callback;
            callback = function () {
                window.console.log("Scripts loaded!");
            };
        }
        // If the user supplied no scripts to load
        if (!scriptsToLoad.length) {
            callback();
            return;
        }

        this.scriptCounter = 0;
        this.scriptsToLoad = scriptsToLoad;
        this.onScriptsLoaded = callback;
        this.loadScript("game/scripts/" + this.scriptsToLoad[this.scriptCounter] + ".js", this.onScriptLoaded.bind(this));
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
    onScriptLoaded: function () {
        this.trigger('load');
        this.scriptCounter++;
        // If there are more scripts to load
        if (this.scriptCounter < this.scriptsToLoad.length) {
            this.loadScript("game/scripts/" + this.scriptsToLoad[this.scriptCounter] + ".js", this.onScriptLoaded.bind(this));
        }
        // Call the user supplied callback
        else {
            window.console.log("SCRITPS loaded.");
            this.onScriptsLoaded();
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
        
        this.loadScript("game/maps/" + mapData + ".js", this.onMapLoaded.bind(this, callback));
    },
    onMapLoaded: function (callback) {
        this.trigger('load');
        window.console.log("MAP loaded.");
        callback();
    },
    // GRAPHICS loader
    loadGraphics: function (callback, graphicsToLoad) {
        if (!graphicsToLoad) {
            graphicsToLoad = callback();
            callback = function () {
                window.console.log("GRAPHICS loaded!");
            };
        }
        if (graphicsToLoad.length < 1) {
            callback();
            return;
        }

        graphicsToLoad = _.map(graphicsToLoad, function (asset) {
            return "game/graphics/" + asset;
        });
        this.assetLoader = new PIXI.AssetLoader(graphicsToLoad);
        this.assetLoader.onComplete = this.onGraphicsLoaded.bind(this, callback);
        this.assetLoader.onProgress = this.trigger.bind(this, 'load');
        this.assetLoader.load();
    },
    onGraphicsLoaded: function (callback) {
        window.console.log("GRAPHICS loaded!");
        callback();
    },
    // SOUND loader
    loadSounds: function (callback, soundsToLoad) {
        if (!soundsToLoad) {
            soundsToLoad = callback();
            callback = function () {
                window.console.log("SOUNDS loaded!");
            };
        }
        if (soundsToLoad.length < 1) {
            callback();
            return;
        }

        soundsToLoad = _.each(soundsToLoad, function (sound, i) {
            soundsToLoad[i] = _.map(sound, function (name) {
                if (name.indexOf("game/sounds/") < 0)
                    return "game/sounds/" + name;
                else
                    return name;
            });
        });
        
        this.soundCounter = 0;
        this.soundsToLoad = soundsToLoad;
        this.onSoundsLoaded = callback;
        
        this.loadSound();
    },
    loadSound: function () {
        var that = this;
        new Howl({
            urls: that.soundsToLoad[that.soundCounter],
            onload: that.onSoundLoaded.bind(that)
        });
    },
    onSoundLoaded: function () {
        this.trigger('load');
        this.soundCounter++;
        if (this.soundCounter < this.soundsToLoad.length) {
            this.loadSound();
        } else {
            window.console.log("SOUNDS loaded.");
            this.onSoundsLoaded();
        }
    }
});