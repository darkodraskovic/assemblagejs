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
    loadAssets: function (assets, callback) {
        var onAssetLoaded = this.onAssetLoaded((assets && assets.length) || 0);
        if (!assets || !assets.length) {
            onAssetLoaded(callback);
            return;
        }
        _.each(assets, function (asset) {
            this["load" + A_.UTILS.getAssetType(asset)](asset, onAssetLoaded.bind(this, callback));
        }, this);
    },
    loadScript: function (url, callback, path) {
        // Adding the script tag to the head...
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = (path || A_.CONFIG.directories.scripts) + url;
        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;
        // Fire the loading!
        head.appendChild(script);
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
    loadJSON: function (url, callback) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', A_.CONFIG.directories.maps + url);
        httpRequest.onload = function () {
            A_.DATA[url] = JSON.parse(httpRequest.responseText);
            callback();
        };
        httpRequest.send();
    },
    // MANIFEST loader
    maps: {},
    loadManifest: function (manifest, onComplete, onProgress) {
        if (onProgress) {
            this.bind('load', onProgress)
        }
        var onAssetTypeLoaded = this.onAssetLoaded((manifest && _.keys(manifest).length) || 0);
        this.loadAssets(manifest.scripts, onAssetTypeLoaded.bind(this, onComplete));
        this.loadAssets(manifest.maps, onAssetTypeLoaded.bind(this, onComplete));
        this.loadAssets(manifest.graphics, onAssetTypeLoaded.bind(this, onComplete));
        this.loadAssets(manifest.sounds, onAssetTypeLoaded.bind(this, onComplete));
    }
});

A_.DATA = {};
// Augmentable list of asset types
A_.UTILS.AssetTypes = {
    // Script Assets
    js: 'Script',
    // Map Assets
    json: 'JSON',
    // Graphics Assets
    png: 'Graphics', jpg: 'Graphics', gif: 'Graphics', jpeg: 'Graphics',
    // Sound Assets (currently not used, but there for reference)
    ogg: 'Sound', wav: 'Sound', m4a: 'Sound', mp3: 'Sound'
};
// Determine the type of an asset with a lookup table
A_.UTILS.getAssetType = function (asset) {
    // Cf. Loader.loadSound()
    if (_.isArray(asset))
        return 'Sound';
    // Determine the lowercase extension of the file
    var fileExt = _(asset.split(".")).last().toLowerCase();
    // Lookup the asset in the assetTypes hash, or return other
    return A_.UTILS.AssetTypes[fileExt] || 'Other';
};