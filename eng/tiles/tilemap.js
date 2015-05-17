DODO.Tilemap = function (layer, img, tileW, tileH, collides, spacing, orientation) {
    PIXI.Container.call(this);    
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
        this.sceneW_half = layer.scene.getWidth() / 2;
    }

    this.baseTexture = DODO.getAsset(img);
    this.imgCols = this.baseTexture.width / (tileW + this.spacing);
    this.imgRows = this.baseTexture.height / (tileH + this.spacing);

    // For tile sprite creation.
    this.frameRectangle = new PIXI.Rectangle(0, 0, this.tileW, this.tileH + this.spacing);
};

DODO.Tilemap.prototype = Object.create(PIXI.Container.prototype);
DODO.Tilemap.prototype.constructor = DODO.Tilemap;

DODO.Tilemap.prototype.populate = function (layerData) {
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
};
DODO.Tilemap.prototype.getTile = function (x, y) {
    return this.tiles[x] && this.tiles[x][y];
};
DODO.Tilemap.prototype.getTileAt = function (x, y) {
    return this.getTile(this.getMapX(x), this.getMapY(y));
};
DODO.Tilemap.prototype.getTileIsoAt = function (x, y) {
    return this.getTile(this.getMapIsoX(x), this.getMapIsoY(y));
};
DODO.Tilemap.prototype.setTile = function (gid, x, y) {
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
};
DODO.Tilemap.prototype.removeTile = function (x, y) {
    if (this.tiles[x] && this.tiles[x][y]) {
        this.tiles[x][y].parent.removeChild(this.tiles[x][y]);
        this.tiles[x][y] = null;
    }
};
// UTILS
DODO.Tilemap.prototype.forEachTile = function (fn) {
    for (var i = 0; i < this.mapW; i++) {
        for (var j = 0; j < this.mapH; j++) {
            if (this.tiles[i][j])
                fn(this.tiles[i][j]);
        }
    }
};
// Orthogonal
DODO.Tilemap.prototype.getSceneX = function (x) {
    return (x * this.tileW);
};
DODO.Tilemap.prototype.getSceneY = function (y) {
    return (y * this.tileH);
};
DODO.Tilemap.prototype.getMapX = function (x) {
    return (x / this.tileW).floor();
};
DODO.Tilemap.prototype.getMapY = function (y) {
    return (y / this.tileH).floor();
};
// Isometric
DODO.Tilemap.prototype.getMapIsoX = function (x, y) {
    return (((x - this.sceneW_half) / this.tileW_half + y / this.tileH_half) / 2).floor();
};
DODO.Tilemap.prototype.getMapIsoY = function (x, y) {
    return ((y / this.tileH_half - (x - this.sceneW_half) / this.tileW_half) / 2).floor();
};
DODO.Tilemap.prototype.getSceneIsoX = function (x, y) {
    return (x - y) * this.tileW_half - this.tileW_half + this.sceneW_half;
};
DODO.Tilemap.prototype.getSceneIsoY = function (x, y) {
    return (x + y) * this.tileH_half;
};