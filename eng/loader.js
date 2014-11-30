A_.LevelLoader = Class.extend({
    // SCRIPT loader
    init: function (dirPref) {
        if (dirPref)
            this.directoryPrefix = dirPref + "/";
        else 
            this.directoryPrefix = "";
    },
    loadScripts: function (callback, scriptsToLoad) {
        this.scriptCounter = 0;
        this.scriptsToLoad = scriptsToLoad;
        this.onScriptsLoaded = callback;
        this.loadScript();
    },
    loadScript: function () {
        var that = this;
        $.getScript("game/scripts/" + this.directoryPrefix + that.scriptsToLoad[that.scriptCounter] + ".js", that.onScriptLoaded.bind(that));
    },
    onScriptLoaded: function () {
        this.scriptCounter++;
        if (this.scriptCounter < this.scriptsToLoad.length) {
            this.loadScript();
        } else {
            this.onScriptsLoaded();
        }
    },
    // MAP loader
    loadMap: function (callback, mapData) {
        var that = this;
        $.getJSON("game/levels/"  + this.directoryPrefix + mapData + ".json", function (data) {
            that.mapDataParsed = data;
            callback();
        });
    },
    // ASSET loader
    loadGraphics: function (callback, graphicsToLoad) {
        var that = this;
        graphicsToLoad = _.map(graphicsToLoad, function (asset) {
            return "graphics/"  + that.directoryPrefix + asset;
        });
        this.assetLoader = new PIXI.AssetLoader(graphicsToLoad);
        this.assetLoader.onComplete = callback;
        this.assetLoader.load();
    },
    // SOUND loader
    loadSounds: function (callback, soundsToLoad) {
        this.soundCounter = 0;
        var that = this;
        soundsToLoad = _.each(soundsToLoad, function (sound, i) {
            soundsToLoad[i] = _.map(sound, function (name) {
                if (name.indexOf("sounds/") < 0)
                    return "sounds/" + that.directoryPrefix  + name;
                else
                    return name;
            })
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
        })
    },
    onSoundLoaded: function () {
        this.soundCounter++;
        if (this.soundCounter < this.soundsToLoad.length) {
            this.loadSound()
        } else {
            this.onSoundsLoaded();
        }
    },
    // TODO: automatic class dependencies loading...
}); 