A_.LevelLoader = Class.extend({
    dependencies: [],
    failedToLoad: [],
    loadMap: function (callback, mapDataJSON) {
        var that = this;
        $.getJSON(mapDataJSON, function (data) {
            that.mapDataParsed = data;
            callback();
        });
    },
    loadAssets: function (callback, assetsToLoad) {
        this.assetsToLoad = assetsToLoad;
        this.assetLoader = new PIXI.AssetLoader(assetsToLoad);
        this.assetLoader.onComplete = callback;
        this.assetLoader.load();
    },
    // SOUND loader
    loadSounds: function (callback, soundsToLoad) {
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
    // CLASS loader
    loadScripts: function (callback, scriptsToLoad) {
        this.scriptCounter = 0;
        this.scriptsToLoad = scriptsToLoad;
        this.onScriptsLoaded = callback;
        this.loadScript();
    },
    loadScript: function () {
        var that = this;
        $.getScript("game/sprites/" + that.scriptsToLoad[that.scriptCounter] + ".js", that.onScriptLoaded.bind(that));
    },
    onScriptLoaded: function () {
        this.scriptCounter++;
        if (this.scriptCounter < this.scriptsToLoad.length) {
            this.loadScript();
        } else {
            this.onScriptsLoaded();
        }
    },
    // TODO: automatic class dependencies loading...
}); 