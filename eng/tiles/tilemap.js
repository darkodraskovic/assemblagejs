A_.TILES.Tilemap = Class.extend({
    init: function (layer, img, tileW, tileH) {
        this.layer = layer;
        this.baked = false;
        this.level = layer.level;

        this.baseTexture = new PIXI.BaseTexture.fromImage("game/graphics/" + img, PIXI.scaleModes.LINEAR);
        this.imgCols = this.baseTexture.width / tileW;
        this.imgRows = this.baseTexture.height / tileH;

        this.tileW = tileW;
        this.tileH = tileH;

        this.tiles = [];
    },
    populateTilelayer: function (layerData) {
        if (this.layer.collisionResponse) {
            this.collisionResponse = "static";
            this.level.tileMaps.push(this);
        }

        this.mapW = layerData.length;
        this.mapH = layerData[0].length;
        for (var i = 0; i < this.mapW; i++) {
            this.tiles[i] = [];
            for (var j = 0; j < this.mapH; j++) {
                this.tiles[i][j] = null;
            }
        }

        for (var j = 0; j < layerData.length; j++) {
            for (var k = 0; k < layerData[j].length; k++) {
                if (layerData[j][k] > 0) {
                    this.setTile(layerData[j][k], j, k);
                }
            }
        }

        this.layer.tilemap = this;
    },
    getTile: function (x, y) {
        if (x < 0 || x >= this.mapW)
            return;
        if (y < 0 || y >= this.mapH)
            return;
        return this.tiles[x][y];
    },
    getTileAt: function (x, y) {
        return this.getTile(this.getMapX(x), this.getMapX(y));
    },
    setTile: function (gid, x, y) {
        if (this.layer.baked)
            return;
        if (!_.isNumber(gid) || !_.isNumber(x) || !_.isNumber(y))
            return;
        if (gid <= 0 || gid > this.imgCols * this.imgRows)
            return;
        if (x < 0 || x >= this.mapW)
            return;
        if (y < 0 || y >= this.mapH)
            return;
        if (this.tiles[x][y]) {
            if (this.tiles[x][y] === gid)
                return;
            this.removeTile(x, y);
        }

        var tile = new A_.TILES.Tile(gid, x, y, this);
        this.tiles[x][y] = tile;
        return tile;
    },
    removeTile: function (x, y) {
        if (this.layer.baked)
            return;

        if (this.tiles[x] && this.tiles[x][y]) {
            var tile = this.tiles[x][y];

            this.tiles[x][y] = null;

            tile.removeFromLevel();
        }
    },
    // UTILS
    getLevelX: function (x) {
        return (x * this.tileW);
    },
    getLevelY: function (y) {
        return (y * this.tileH);
    },
    getMapX: function (x) {
        return (x / this.tileW).floor();
    },
    getMapY: function (y) {
        return (y / this.tileH).floor();
    }
});