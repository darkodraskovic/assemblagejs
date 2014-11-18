A_.LevelLoader = Class.extend({
    mapDataJSON: "",
    mapDataParsed: {},
    mapLoader: null,
    assetsToLoad: [],
    assetLoader: null,
    init: function (callback, mapDataJSON, assetsToLoad) {
        this.callback = callback;
        this.mapDataJSON = mapDataJSON;
        this.assetsToLoad = assetsToLoad;
    },
    loadLevel: function () {
        this.loadMap();
    },
    loadMap: function () {
        var that = this;
        this.mapLoader = new PIXI.JsonLoader(this.mapDataJSON);
        this.mapLoader.load();
        this.mapLoader.on('loaded', function (evt) {            
            that.mapDataParsed = evt.content.content.json;
            that.loadAssets();
        });
    },
    loadAssets: function () {
        this.assetLoader = new PIXI.AssetLoader(this.assetsToLoad);
        this.assetLoader.onComplete = this.callback;
        this.assetLoader.load();
    }
});