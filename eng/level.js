A_.Level = Class.extend({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    init: function () {
        this.container = new PIXI.DisplayObjectContainer();
        this.followee = null;
        this.sprites = [];
        this.tileLayers = [];
        this.spriteLayers = [];
        this.layers = [];
    },
    createEmptyLayer: function (){
        var layer = new PIXI.DisplayObjectContainer();
        layer.baked = false;
        layer.collision = false;
        layer.parallax = 100;
        this.addLayer(layer);
        return layer;
    },
    addLayer: function (layer) {
        this.layers.push(layer);
        this.container.addChild(layer);
    },
    addSpriteLayer: function (layer) {
        this.spriteLayers.push(layer);
        this.addLayer(layer);
    },
    addTileLayer: function (layer) {
        this.tileLayers.push(layer);
        this.addLayer(layer);
    },
    findLayerByName: function (name) {
        return _.find(this.layers, function (layer) {
            return layer.name === name;
        });
    },
    findLayerByNumber: function (num) {
        return this.container.getChildAt(num);
    },
    findSpriteByName: function (name) {
        var sprite = _.find(this.sprites, function (sprite) {
            return sprite.name === name;
        });
        return sprite;
    },
    findSpritesByName: function (name) {
        return _.filter(this.sprites, function (sprite) {
            return sprite.name === name;
        });       
    },
    findSpriteByClass: function (spriteClass) {
        var sprite = _.find(this.sprites, function (sprite) {
            return sprite instanceof spriteClass;
        });
        return sprite;
    },
    findSpritesByClass: function (spriteClass) {
        return _.filter(this.sprites, function (sprite) {
            return sprite instanceof spriteClass;
        });        
    },
    // TODO
    findSpriteByID: function () {

    }
});