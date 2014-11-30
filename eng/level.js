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
        this.imageLayers = [];
        this.layers = [];
        this.debugLayer = null;
    },
    createEmptyLayer: function () {
        var layer = new PIXI.DisplayObjectContainer();
        layer.baked = false;
        layer.collision = false;
        layer.parallax = 100;
        return layer;
    },
    createImageLayer: function (props) {
        var layer = this.createEmptyLayer();

        if (!props.width) {
            props.width = this.width;
        }
        if (!props.height) {
            props.height = this.height;
        }
        layer.addChild(new A_.SCENERY.TiledSprite(props).sprite);

        this.addImageLayer(layer);
        return layer;
    },
    createSpriteLayer: function (props) {
        var layer = this.createEmptyLayer();
        this.addSpriteLayer(layer);
        return layer;
    },
    addLayer: function (layer) {
        this.layers.push(layer);
        this.container.addChild(layer);
        if (this.debugLayer) {
            this.toTopOfContainer(this.debugLayer);
        }
    },
    addImageLayer: function (layer) {
        this.imageLayers.push(layer);
        this.addLayer(layer);
    },
    addSpriteLayer: function (layer) {
        this.spriteLayers.push(layer);
        this.addLayer(layer);
    },
    addTileLayer: function (layer) {
        this.tileLayers.push(layer);
        this.addLayer(layer);
    },
    addDebugLayer: function (layer) {
        this.debugLayer = layer;
        this.addLayer(layer);
    },
    // Layer Z POSITION
    toTopOfContainer: function (layer) {
        this.container.setChildIndex(layer, this.container.children.length - 1);
    },
    toBottomOfContainer: function (layer) {
        this.container.setChildIndex(layer, 0);
    },
    // FIND
    // Layer
    findLayerByName: function (name) {
        return _.find(this.layers, function (layer) {
            return layer.name === name;
        });
    },
    findLayerByNumber: function (num) {
        return this.container.getChildAt(num);
    },
    findLayerSize: function (layer) {
        return layer.children.length;
    },
    // Sprite
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