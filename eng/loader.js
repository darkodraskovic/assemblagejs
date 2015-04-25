A_.Loader = A_.EventDispatcher.extend({
    onAssetLoaded: function (numAssets) {
        return function (callback) {
            if (numAssets) 
                this.trigger('loaded');
            if (--numAssets <= 0) {
                (callback || function () {
                    window.console.log("Asset loaded.");
                })();
            }
        };
    },
    loadAssets: function (assets, type, callback) {
        var onAssetLoaded = this.onAssetLoaded((assets && assets.length) || 0);
        if (!assets || !assets.length) {
            onAssetLoaded(callback);
            return;
        }
        _.each(assets, function (asset) {
            this["load" + type](asset, onAssetLoaded.bind(this, callback));
        }, this);
    },
    loadScript: function (url, callback, path) {
        // Adding the script tag to the head...
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = (path || A_.CONFIG.directories.scripts) + url + ".js";

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;

        // Fire the loading!
        head.appendChild(script);
    },
    loadMap: function (map, callback) {
        this.loadScript(map, callback, A_.CONFIG.directories.maps);
    },
    loadGraphics: function (image, callback) {
        var imageLoader = new PIXI.ImageLoader(A_.CONFIG.directories.graphics + image);
        imageLoader.on('loaded', callback);
        imageLoader.load();
    },
    loadSound: function (soundArray, callback) {
        new Howl({
            urls: _.map(soundArray, function (sound) {
                return A_.CONFIG.directories.sounds + sound;
            }),
            onload: callback
        });
    },
    // MANIFEST loader
    maps: {},
    loadManifest: function (manifest, onComplete, onProgress) {
        if (onProgress) {
            this.bind('load', onProgress)
        }
        var onAssetTypeLoaded = this.onAssetLoaded((manifest && _.keys(manifest).length) || 0);
        this.loadAssets(manifest.scripts, "Script", onAssetTypeLoaded.bind(this, onComplete));
        this.loadAssets(manifest.maps, "Map", onAssetTypeLoaded.bind(this, onComplete));
        this.loadAssets(manifest.graphics, "Graphics", onAssetTypeLoaded.bind(this, onComplete));
        this.loadAssets(manifest.sounds, "Sound", onAssetTypeLoaded.bind(this, onComplete));
    }
});