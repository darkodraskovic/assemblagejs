A_.Tilelayer = Class.extend({
    init: function (layer, img, tileW, tileH) {
        this.layer = layer;
        this.baked = false;

        this.img = img;
        this.bTxt = new PIXI.BaseTexture.fromImage(img, PIXI.scaleModes.LINEAR);
        this.imgW = this.bTxt.width;
        this.imgH = this.bTxt.height;
        this.imgCols = this.imgW / tileW;
        this.imgRows = this.imgH / tileH;


        this.tileW = tileW;
        this.tileH = tileH;

        this.tiles = [];


    },
    createTilelayer: function (layerData) {
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
                if (layerData[j][k] > -1) {
                    this.setTile(layerData[j][k], j, k);
                }
            }
        }

        this.layer.tilemap = this;
    },
    getTile: function (x, y) {
        return this.tiles[x][y];
    },
    setTile: function (gid, x, y) {
        if (this.layer.baked)
            return;
        if (typeof gid === "undefined" || typeof x === "undefined" || typeof y === "undefined")
            return;
        if (gid < 0 || gid >= this.imgCols * this.imgRows)
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

        var tile = this.createTile(gid);
        this.setTileInMap(tile, x, y);
        var worldCoords = this.mapToWorld(x, y);
        this.setTileInWorld(tile, worldCoords[0], worldCoords[1]);
    },
    setTileInMap: function (tile, x, y) {
        this.tiles[x][y] = tile;
    },
    setTileInWorld: function (tile, x, y) {
        var tileSprite = tile.sprite;
        tileSprite.position.x = x;
        tileSprite.position.y = y;
        tileSprite.getPosition = function () {
            return this.position;
        };
        this.layer.addChild(tileSprite);
        if (this.layer.collision) {
            A_.collider.activateCollisionFor(tileSprite, null, this.tileW, this.tileH, 0, 0);
            tileSprite.collisionType = "static";
            A_.collider.collisionStatics.push(tileSprite);
        }
    },
    removeTile: function (x, y) {
        if (!this.layer.update)
            return;

        if (this.tiles[x][y]) {
            var sprite = this.tiles[x][y].sprite;

            // REMOVE FROM
            // Pixi
            this.layer.removeChild(sprite);
            // Statics
            if (layer.collision) {
                var ind = A_.collider.collisionStatics.indexOf(sprite);
                A_.collider.collisionStatics.splice(ind, 1);
            }
            // Tilemap
            this.tiles[x][y] = null;
        }
    },
    worldToMap: function (x, y) {
        return [Math.round(x / this.tileW), Math.round(y / this.tileH)];
    },
    mapToWorld: function (x, y) {
        return [x * this.tileW, y * this.tileH];
    },
    createTileSprite: function (gid) {
        var frame = new PIXI.Rectangle((gid % this.imgCols) * this.tileW,
                Math.floor(gid / this.imgCols) * this.tileH, this.tileW, this.tileH);
        var tileTexture = new PIXI.Texture(this.bTxt, frame);
        var tileSprite = new PIXI.Sprite(tileTexture);

        return tileSprite;
    },
    createTile: function (gid) {
        var tile = {};

        var sprite = this.createTileSprite(gid);

        tile.gid = gid;
        tile.sprite = sprite;

        return tile;
    },
});