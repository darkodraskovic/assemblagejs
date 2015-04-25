A_.TILES.Tilemap = Class.extend({
    init: function (layer, img, tileW, tileH, spacing, orientation) {
        this.layer = layer;
        this.baked = false;
        this.scene = layer.scene;
        this.tileW = tileW;
        this.tileH = tileH;
        
        // For isometric maps processing
        this.spacing = _.isUndefined(spacing) ? 0 : spacing;
        this.offset = layer.offset || false;
        this.orientation = orientation || "orthogonal";
        if (this.orientation === "isometric") {
            this.tileW_half = this.tileW / 2;
            this.tileH_half = this.tileH / 2;
            this.sceneW_half = this.scene.getWidth() / 2;
        }

        this.baseTexture = new PIXI.BaseTexture.fromImage(A_.CONFIG.directories.graphics + img, PIXI.scaleModes.LINEAR);
        this.imgCols = this.baseTexture.width / (tileW + this.spacing);
        this.imgRows = this.baseTexture.height / (tileH + this.spacing);


        this.tiles = [];
        // For tile sprite creation.
        this.frameRectangle = new PIXI.Rectangle(0, 0, this.tileW, this.tileH + this.spacing);
    },
    populate: function (layerData) {
        if (this.layer.collisionResponse) {
            this.collisionResponse = "static";
            this.scene.tileMaps.push(this);
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

        return this.tiles[x][y] = new A_.TILES.Tile(gid, x, y, this);
    },
    removeTile: function (x, y) {
        if (this.layer.baked)
            return;

        if (this.tiles[x] && this.tiles[x][y]) {
            var tile = this.tiles[x][y];
            this.tiles[x][y] = null;
            tile.parent.removeChild(tile);
        }
    },
    // UTILS
    // Orthogonal
    forEachTile: function (fn) {
        for (var i = 0; i < this.mapW; i++) {
            for (var j = 0; j < this.mapH; j++) {
                if (this.tiles[i][j])
                    fn(this.tiles[i][j]);
            }
        }
    },
    getSceneX: function (x) {
        return (x * this.tileW);
    },
    getSceneY: function (y) {
        return (y * this.tileH);
    },
    getMapX: function (x) {
        return (x / this.tileW).floor();
    },
    getMapY: function (y) {
        return (y / this.tileH).floor();
    },
    // Isometric
    getMapIsoX: function (x, y) {
      return (((x - this.sceneW_half) / this.tileW_half + y / this.tileH_half) / 2).floor();
    },
    getMapIsoY: function (x, y) {
        return ((y / this.tileH_half - (x  - this.sceneW_half) / this.tileW_half) /2).floor();  
    },
    getSceneIsoX: function (x, y) {
        return (x - y) * this.tileW_half - this.tileW_half + this.sceneW_half;
    },
    getSceneIsoY: function (x, y) {
        return (x + y) * this.tileH_half;
    }
});