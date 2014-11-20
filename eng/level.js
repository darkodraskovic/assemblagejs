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
        this.camera = null;
    },
    setupCamera: function (cameraOptions) {
        this.camera = makeCamera(A_.game.renderer.view.width, A_.game.renderer.view.height, cameraOptions.innerBoundOffset);
        this.camera.worldBounded = cameraOptions.worldBounded;
        if (cameraOptions.followee) {
            this.camera.followee = cameraOptions.followee;
        } else {
            this.camera.followee = this.followee;
            this.followee = null;
        }
        this.camera.followType = cameraOptions.followType;
    },
    addLayer: function (layer) {
        this.layers.push(layer);
    },
    addSpriteLayer: function (layer) {
        this.spriteLayers.push(layer);
        this.addLayer(layer);
    },
    addTileLayer: function (layer) {
        this.tileLayers.push(layer);
        this.addLayer(layer);
    }
});