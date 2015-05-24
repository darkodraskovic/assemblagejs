DODO.Tilemap = DODO.Container.extend({
    init: function (layer, img, tileW, tileH, collides, spacing, orientation) {
        this._super();
        layer.addChild(this);
        layer.tilemap = this;

        this.tileW = tileW;
        this.tileH = tileH;
        this.collides = collides && layer.scene.tilemaps.push(this);

        // For isometric maps processing
        this.spacing = _.isUndefined(spacing) ? 0 : spacing;
        this.orientation = orientation || "orthogonal";
        if (this.orientation === "isometric") {
            this.tileW_half = this.tileW / 2;
            this.tileH_half = this.tileH / 2;
            this.sceneW_half = layer.scene.playgroundWidth / 2;
        }

        this.baseTexture = DODO.getAsset(img);
        this.imgCols = this.baseTexture.width / (tileW + this.spacing);
        this.imgRows = this.baseTexture.height / (tileH + this.spacing);

        // For tile sprite creation.
        this.frameRectangle = new PIXI.Rectangle(0, 0, this.tileW, this.tileH + this.spacing);
    },
    populate: function (layerData) {
        this.tiles = [];
        this.mapW = layerData.length;
        this.mapH = layerData[0].length;

        for (var j = 0; j < layerData.length; j++) {
            this.tiles[j] = [];
            for (var k = 0; k < layerData[j].length; k++) {
                if (layerData[j][k] > 0) {
                    this.setTile(layerData[j][k], j, k);
                }
                else
                    this.tiles[j][k] = null;
            }
        }
    },
    getTile: function (x, y) {
        return this.tiles[x] && this.tiles[x][y];
    },
    getTileAt: function (x, y) {
        return this.getTile(this.getMapX(x), this.getMapY(y));
    },
    getTileIsoAt: function (x, y) {
        return this.getTile(this.getMapIsoX(x), this.getMapIsoY(y));
    },
    setTile: function (gid, x, y) {
        if (gid < 1 || gid > this.imgCols * this.imgRows)
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
        return this.tiles[x][y] = new DODO.Tile(gid, x, y, this);
    },
    removeTile: function (x, y) {
        if (this.tiles[x] && this.tiles[x][y]) {
            this.removeChild(this.tiles[x][y]);
            this.tiles[x][y].destroy();
            this.tiles[x][y] = null;
        }
    },
// UTILS
    forEachTile: function (fn) {
        for (var i = 0; i < this.mapW; i++) {
            for (var j = 0; j < this.mapH; j++) {
                if (this.tiles[i][j])
                    fn(this.tiles[i][j]);
            }
        }
    },
// Orthogonal
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
        return ((y / this.tileH_half - (x - this.sceneW_half) / this.tileW_half) / 2).floor();
    },
    getSceneIsoX: function (x, y) {
        return (x - y) * this.tileW_half - this.tileW_half + this.sceneW_half;
    },
    getSceneIsoY: function (x, y) {
        return (x + y) * this.tileH_half;
    }
});

