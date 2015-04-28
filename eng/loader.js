A_.Loader = A_.EventDispatcher.extend({
    loadAssets: function(assets, onComplete, onProgress) {
        if (_.isObject(assets)) {
            assets = _.flatten(_.values(assets), true);
        }
        if (!assets.length) {
            onComplete();
            return;
        }
        var assetsRemaining = assets.length;
        var onAssetLoaded = function() {
            --assetsRemaining;
            onProgress && onProgress(assets.length - assetsRemaining, assets.length);
            if (assetsRemaining <= 0) {
                onComplete && onComplete();
            }
        };
        _.each(assets, function(asset) {
            this["load" + A_.UTILS.getAssetType(asset)](asset, onAssetLoaded);
        }, this);
    },
    loadScript: function(url, callback) {
        // Adding the script tag to the head...
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = A_.CONFIG.directories.scripts + url;
        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;
        // Fire the loading!
        head.appendChild(script);
    },
    loadGraphics: function(url, callback) {
        var imageLoader = new PIXI.ImageLoader(A_.CONFIG.directories.graphics + url);
        imageLoader.on('loaded', function () {
            A_.ASSETS[url] = imageLoader.texture;
            callback();
        });
        imageLoader.load();
    },
    loadSound: function(urlArray, callback) {
        A_.ASSETS[urlArray[0]] = new Howl({
            urls: _.map(urlArray, function(sound) {
                return A_.CONFIG.directories.sounds + sound;
            }),
            onload: callback
        });
    },
    loadOther: function (url, callback) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', A_.CONFIG.directories.maps + url);
        httpRequest.onload = function () {
            A_.ASSETS[url] = httpRequest.responseText;
            callback();
        };
        httpRequest.send();
    }
});

A_.ASSETS = {};

// Augmentable list of asset types
A_.UTILS.AssetTypes = {
    // Script Assets
    js: 'Script',
    // Graphics Assets
    png: 'Graphics', jpg: 'Graphics', gif: 'Graphics', jpeg: 'Graphics',
    // Sound Assets (currently not used, but there for reference)
    ogg: 'Sound', wav: 'Sound', m4a: 'Sound', mp3: 'Sound'
};

// Determine the type of an asset with a lookup table
A_.UTILS.getAssetType = function(asset) {
    // Cf. Loader.loadSound()
    if (_.isArray(asset))
        return 'Sound';
    // Determine the lowercase extension of the file
    var fileExt = _(asset.split(".")).last().toLowerCase();
    // Lookup the asset in the assetTypes hash, or return other
    return A_.UTILS.AssetTypes[fileExt] || 'Other';
};

A_.UTILS.getAsset = function(asset) {
    return A_.ASSETS[asset];
};