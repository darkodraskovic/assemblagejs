DODO.Loader = DODO.Evented.extend({
    loadAssets: function (assets, onComplete, onProgress) {
        if (_.isObject(assets)) {
            assets = _.flatten(_.values(assets), true);
        }
        if (!assets.length) {
            onComplete();
            return;
        }
        var assetsRemaining = assets.length;
        var onAssetLoaded = function () {
            --assetsRemaining;
            onProgress && onProgress(assets.length - assetsRemaining, assets.length);
            if (assetsRemaining <= 0) {
                onComplete && onComplete();
            }
        };
        _.each(assets, function (asset) {
            var url = _.isArray(asset) ? asset[0] : asset;
            DODO.assets[url] ? onAssetLoaded() : this["load" + DODO.getAssetType(asset)](asset, onAssetLoaded);
        }, this);
    },
    loadScript: function (url, callback) {
        // Adding the script tag to the head...
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = DODO.config.directories.scripts + url;
        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;
        // Fire the loading!
        head.appendChild(script);
    },
    loadGraphics: function (url, callback) {
        PIXI.loader
                .add([{name: url, url: DODO.config.directories.graphics + url}])
                .load(function (loader, resources) {
                    DODO.assets[url] = resources[url].texture;
                    callback();
                });
    },
    loadSound: function (urlArray, callback) {
        DODO.assets[urlArray[0]] = new Howl({
            urls: _.map(urlArray, function (sound) {
                return DODO.config.directories.sounds + sound;
            }),
            onload: callback
        });
    },
    loadOther: function (url, callback) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', DODO.config.directories.data + url);
        httpRequest.onload = function () {
            DODO.assets[url] = httpRequest.responseText;
            callback();
        };
        httpRequest.send();
    }
});

DODO.assets = {};

// Augmentable list of asset types
DODO.AssetTypes = {
    // Script Assets
    js: 'Script',
    // Graphics Assets
    png: 'Graphics', jpg: 'Graphics', gif: 'Graphics', jpeg: 'Graphics',
    // Sound Assets (currently not used, but there for reference)
    ogg: 'Sound', wav: 'Sound', m4a: 'Sound', mp3: 'Sound'
};

// Determine the type of an asset with a lookup table
DODO.getAssetType = function (asset) {
    // Cf. Loader.loadSound()
    if (_.isArray(asset))
        return 'Sound';
    // Determine the lowercase extension of the file
    var fileExt = _(asset.split(".")).last().toLowerCase();
    // Lookup the asset in the assetTypes hash, or return other
    return DODO.AssetTypes[fileExt] || 'Other';
};

DODO.getAsset = function (asset) {
    return DODO.assets[asset];
};