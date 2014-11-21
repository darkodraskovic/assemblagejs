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
    // WORK IN PROGRESS: automatic dependencies loading...
    resetDependencies: function () {
        this.dependencies = [];
        this.failedToLoad = [];
    },    
    loadSprites: function (spritesToLoad, callback) {
        var that = this;

        this.dependencies = [];
        _.each(spritesToLoad, function (spriteToLoad, i) {
            $.getScript("game/sprites/" + spriteToLoad + ".js").done(function (data) {
                if (i === spritesToLoad.length - 1) {
                    that.onSpritesLoaded();
                    callback();
                }
            }).fail(function (jqxhr) {
                var response = jqxhr.responseText;
                var depend = (response.substring(response.indexOf("=") + 1, response.indexOf("."))).trim();
                that.dependencies.push(depend);
                that.failedToLoad.unshift(spriteToLoad);

                if (i === spritesToLoad.length - 1) {
                    that.onSpritesLoaded();
                }
            });
        });
    },
    onSpritesLoaded: function () {
        if (this.dependencies.length > 0) {
            this.dependencies = _.uniq(this.dependencies);
            this.loadSprites(this.dependencies);
        } 
        else if (this.failedToLoad.length > 0) {
            this.loadSprites(this.failedToLoad); 
            this.failedToLoad.length = 0;
        }
    }
}); 