A_.LEVEL.Loader = Class.extend({
    // SCRIPT loader
    loadScripts: function (callback, scriptsToLoad) {
        if (!callback) {
            callback = function () {
                window.console.log("Scripts loaded!");
            };
        }
        if (scriptsToLoad.length < 1) {
            callback();
            return;
        }

        this.scriptCounter = 0;
        this.scriptsToLoad = scriptsToLoad;
        this.onScriptsLoaded = callback;
        this.loadScript("game/scripts/" + this.scriptsToLoad[this.scriptCounter] + ".js", this.onScriptLoaded.bind(this));
    },
    loadScript: function (url, callback) {
        // Adding the script tag to the head
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;

        // Fire the loading
        head.appendChild(script);
    },
    onScriptLoaded: function () {
        this.scriptCounter++;
        if (this.scriptCounter < this.scriptsToLoad.length) {
            this.loadScript("game/scripts/" + this.scriptsToLoad[this.scriptCounter] + ".js", this.onScriptLoaded.bind(this));
        } else {
            this.onScriptsLoaded();
        }
    },
    // MAP loader
    loadMap: function (callback, mapData) {
        if (!callback) {
            callback = function () {
                window.console.log("Maps loaded!");
            };
        }
        if (!mapData) {
            callback();
            return;
        }

        this.loadScript("game/maps/" + mapData + ".js", callback);
    },
    // GRAPHICS loader
    loadGraphics: function (callback, graphicsToLoad) {
        if (!callback) {
            callback = function () {
                window.console.log("Graphics loaded!");
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
        this.assetLoader.onComplete = callback;
        this.assetLoader.load();
    },
    // SOUND loader
    loadSounds: function (callback, soundsToLoad) {
        if (!callback) {
            callback = function () {
                window.console.log("Sounds loaded!");
            };
        }
        if (soundsToLoad.length < 1) {
            callback();
            return;
        }

        this.soundCounter = 0;
        soundsToLoad = _.each(soundsToLoad, function (sound, i) {
            soundsToLoad[i] = _.map(sound, function (name) {
                if (name.indexOf("game/sounds/") < 0)
                    return "game/sounds/" + name;
                else
                    return name;
            });
        });
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
        this.soundCounter++;
        if (this.soundCounter < this.soundsToLoad.length) {
            this.loadSound();
        } else {
            this.onSoundsLoaded();
        }
    }
});