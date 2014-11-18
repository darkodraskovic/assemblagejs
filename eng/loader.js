A_.Loader = Class.extend({
    mapDataJSON: "",
    mapDataParsed: {},
    assetsToLoad: [],
    levelLoader: null,
    assetLoader: null,
    init: function (callback, mapDataJSON, assetsToLoad) {
        this.callback = callback;
        this.mapDataJSON = mapDataJSON;
        this.assetsToLoad = assetsToLoad;
    },
    loadMap: function (mapDataJSON) {
        var that = this;
        this.mapDataJSON = mapDataJSON;
        this.levelLoader = new PIXI.JsonLoader(mapDataJSON);
        this.levelLoader.on('loaded', function (evt) {
           that.mapDataParsed = evt.content.content.json;
           that.loadAssets();
        });
    },
    loadAssets: function () {
        this.assetLoader = new PIXI.AssetLoader(this.assetsToLoad);
        this.assetLoader.onComplete  = this.callback;
    }
});