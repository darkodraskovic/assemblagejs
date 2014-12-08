A_.TILES.Tile = Class.extend({
    init: function (gid, sprite, x, y, tilemap) {
        this.gid = gid;
        this.sprite = sprite;
        this.mapPosition = {};
        this.mapPosition.x = x;
        this.mapPosition.y = y;
        this.tilemap = tilemap;
    },
    setCollision: function () {
        this.collision = {};
        this.collision.size = {};
        this.collision.size.w = this.tilemap.tileW;
        this.collision.size.h = this.tilemap.tileH;
        this.collision.offset = {};
        this.collision.offset.x = this.tilemap.tileW / 2;
        this.collision.offset.y = this.tilemap.tileH / 2;
        this.collisionPolygon = A_.collider.activateCollisionFor(this.collision);
        this.collisionPolygon.pos.x = this.x();
        this.collisionPolygon.pos.y = this.y();
        this.collision.response = "static";
        A_.collider.collisionStatics.push(this);
        A_.collider.collisionTiles.push(this);
    },
    collideWithStatic: function (other, response) {

    },
    collideWithDynamic: function (other, response) {
        
    },
    getPosition: function () {
        return this.sprite.position;
    },
    x: function(x) {
        if (x)
            this.position(x, this.y());
        else
            return this.sprite.position.x;
    },
    y: function(y) {
        if (y)
            this.position(this.x(), y);
        else
            return this.sprite.position.y;
    },
    position: function(x, y) {
        if (x && y) {
            this.sprite.position.x = x;
            this.sprite.position.y = y;
        } else {
            return this.sprite.position;
        }
    },
});

A_.TILES.Tilemap = Class.extend({
    init: function (layer, img, tileW, tileH) {
        this.layer = layer;
        this.baked = false;

        this.img = "graphics/" + A_.level.directoryPrefix + img;
        this.bTxt = new PIXI.BaseTexture.fromImage(this.img, PIXI.scaleModes.LINEAR);
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
//                if (layerData[j][k] > -1) {
                if (layerData[j][k] > 0) {
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
        if (gid <= 0 || gid >= this.imgCols * this.imgRows)
            return;
        if (x < 0 || x >= this.mapW)
            return;
        if (y < 0 || y >= this.mapH)
            return;
        if (this.tiles[x][y]) {
            if (this.tiles[x][y] === gid)
                return;
            this.unsetTile(x, y);
        }

        var tile = this.createTile(gid, x, y);
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

        this.layer.addChild(tileSprite);

        if (this.layer.collision) {
            tile.setCollision();
        }
    },
    unsetTile: function (x, y) {
        if (this.layer.baked)
            return;

        if (this.tiles[x] && this.tiles[x][y]) {
            var tile = this.tiles[x][y];
            var sprite = this.tiles[x][y].sprite;

            // REMOVE FROM
            // Pixi
            this.layer.removeChild(sprite);
            // Collisions
            if (this.layer.collision) {
                var ind = A_.collider.collisionTiles.indexOf(tile);
                A_.collider.collisionTiles.splice(ind, 1);
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
    createTileSprite: function (frameInd) {
        var frame = new PIXI.Rectangle((frameInd % this.imgCols) * this.tileW,
                Math.floor(frameInd / this.imgCols) * this.tileH, this.tileW, this.tileH);
        var tileTexture = new PIXI.Texture(this.bTxt, frame);
        var tileSprite = new PIXI.Sprite(tileTexture);

        return tileSprite;
    },
    createTile: function (gid, x, y) {
        var sprite = this.createTileSprite(gid - 1);
        return new A_.TILES.Tile(gid, sprite, x, y, this);
    },
});