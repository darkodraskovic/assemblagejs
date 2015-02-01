A_.LEVEL.Loader = Class.extend({
    // SCRIPT loader
    init: function(dirPref) {
        if (dirPref)
            this.directoryPrefix = dirPref + "/";
        else
            this.directoryPrefix = "";
    },
    loadScripts: function(callback, scriptsToLoad) {
        if (!callback) {
            callback = function() {
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
        this.loadScript();
    },
    loadScript: function() {
        var that = this;
        $.getScript("game/scripts/" + this.directoryPrefix + that.scriptsToLoad[that.scriptCounter] + ".js",
                that.onScriptLoaded.bind(that));
    },
    onScriptLoaded: function() {
        this.scriptCounter++;
        if (this.scriptCounter < this.scriptsToLoad.length) {
            this.loadScript();
        } else {
            this.onScriptsLoaded();
        }
    },
    // MAP loader
    loadMap: function(callback, mapData) {
        if (!callback) {
            callback = function() {
                window.console.log("Maps loaded!");
            };
        }
        if (!mapData) {
            callback();
            return;
        }

        var that = this;
        $.getJSON("game/levels/" + this.directoryPrefix + mapData + ".json", function(data) {
            that.mapDataParsed = data;
            callback();
        });
    },
    // ASSET loader
    loadGraphics: function(callback, graphicsToLoad) {
        if (!callback) {
            callback = function() {
                window.console.log("Graphics loaded!");
            };
        }
        if (graphicsToLoad.length < 1) {
            callback();
            return;
        }

        var that = this;
        graphicsToLoad = _.map(graphicsToLoad, function(asset) {
            return "graphics/" + that.directoryPrefix + asset;
        });
        this.assetLoader = new PIXI.AssetLoader(graphicsToLoad);
        this.assetLoader.onComplete = callback;
        this.assetLoader.load();
    },
    // SOUND loader
    loadSounds: function(callback, soundsToLoad) {
        if (!callback) {
            callback = function() {
                window.console.log("Sounds loaded!");
            };
        }
        if (soundsToLoad.length < 1) {
            callback();
            return;
        }

        this.soundCounter = 0;
        var that = this;
        soundsToLoad = _.each(soundsToLoad, function(sound, i) {
            soundsToLoad[i] = _.map(sound, function(name) {
                if (name.indexOf("sounds/") < 0)
                    return "sounds/" + that.directoryPrefix + name;
                else
                    return name;
            });
        });
        this.soundsToLoad = soundsToLoad;
        this.onSoundsLoaded = callback;
        this.loadSound();
    },
    loadSound: function() {
        var that = this;
        new Howl({
            urls: that.soundsToLoad[that.soundCounter],
            onload: that.onSoundLoaded.bind(that)
        });
    },
    onSoundLoaded: function() {
        this.soundCounter++;
        if (this.soundCounter < this.soundsToLoad.length) {
            this.loadSound();
        } else {
            this.onSoundsLoaded();
        }
    }
}); 