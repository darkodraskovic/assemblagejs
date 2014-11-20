A_.LevelLoader = Class.extend({
    loadMap: function (callback, mapDataJSON) {
        var that = this;
        this.mapLoader = new PIXI.JsonLoader(mapDataJSON);
        this.mapLoader.load();
        this.mapLoader.on('loaded', function (evt) {            
            that.mapDataParsed = evt.content.content.json;
            callback();
        });
    },
    loadAssets: function (callback, assetsToLoad) {
        this.assetsToLoad = assetsToLoad;
        this.assetLoader = new PIXI.AssetLoader(assetsToLoad);
        this.assetLoader.onComplete = callback;
        this.assetLoader.load();
    }
});