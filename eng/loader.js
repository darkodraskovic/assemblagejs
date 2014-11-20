//A_.LevelLoader = Class.extend({
//    init: function (callback, mapDataJSON, assetsToLoad) {        
//        this.callback = callback;
//        this.mapDataJSON = mapDataJSON;
//        this.assetsToLoad = assetsToLoad;
//    },
//    loadLevel: function () {
//        this.loadMap();
//    },
//    loadMap: function () {
//        var that = this;
//        this.mapLoader = new PIXI.JsonLoader(this.mapDataJSON);
//        this.mapLoader.load();
//        this.mapLoader.on('loaded', function (evt) {            
//            that.mapDataParsed = evt.content.content.json;
//            that.loadAssets();
//        });
//    },
//    loadAssets: function () {
//        this.assetLoader = new PIXI.AssetLoader(this.assetsToLoad);
//        this.assetLoader.onComplete = this.callback;
//        this.assetLoader.load();
//    }
//});
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
        this.assetLoader = new PIXI.AssetLoader(assetsToLoad);
        this.assetLoader.onComplete = callback;
        this.assetLoader.load();
    }
});