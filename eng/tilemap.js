function makeTilemap(layer, img,
        mapW, mapH, tileW, tileH) {

    var tilemap = {
    };

    tilemap.layer = layer;
    tilemap.baked = false;

    tilemap.img = img;
    tilemap.bTxt = new PIXI.BaseTexture.fromImage(img, PIXI.scaleModes.LINEAR);
    tilemap.imgW = tilemap.bTxt.width;
    tilemap.imgH = tilemap.bTxt.height;
    tilemap.imgCols = tilemap.imgW / tileW;
    tilemap.imgRows = tilemap.imgH / tileH;

    tilemap.mapW = mapW;
    tilemap.mapH = mapH;
    tilemap.tileW = tileW;
    tilemap.tileH = tileH;

    tilemap.tiles = [];

    for (var i = 0; i < mapW; i++) {
        tilemap.tiles[i] = [];
        for (var j = 0; j < mapH; j++) {
            tilemap.tiles[i][j] = null;
        }
    }

    tilemap.getTile = function (x, y) {
        return this.tiles[x][y];

    };

    tilemap.setTile = function (gid, x, y) {        
        if (this.layer.baked)
            return;
        if (typeof gid === "undefined" || typeof x === "undefined" || typeof y === "undefined") 
            return;
        if (gid < 0 || gid >= this.imgCols * this.imgRows)
            return;
        if (x < 0 || x >= tilemap.mapW)
            return;
        if (y < 0 || y >= tilemap.mapH)
            return;
        if (this.tiles[x][y]) {
            if (this.tiles[x][y] === gid)
                return;
            this.removeTile(x, y);
        }
        
        var tile = this.makeTile(gid);
        this.setTileInMap(tile, x, y);
        var worldCoords = this.mapToWorld(x, y);
        this.setTileInWorld(tile, worldCoords[0], worldCoords[1]);
    };

    tilemap.setTileInMap = function (tile, x, y) {
        this.tiles[x][y] = tile;
    };

    tilemap.setTileInWorld = function (tile, x, y) {
        var tileSprite = tile.sprite;
        tileSprite.position.x = x;
        tileSprite.position.y = y;
        tileSprite.getPosition = function () { return this.position;}
        this.layer.addChild(tileSprite);
        if (this.layer.collision) {
            collider.activateCollisionFor(tileSprite, tileW, tileH, 0, 0);
            tileSprite.collisionType = "static";
            collider.collisionStatics.push(tileSprite);
            // collisionObjects.push(tileSprite);
        }

    };

    tilemap.removeTile = function (x, y) {
        if (!this.layer.update)
            return;

        if (this.tiles[x][y]) {
            var sprite = this.tiles[x][y].sprite;

            // REMOVE from
            // Pixi
            this.layer.removeChild(sprite);
            // Statics
            if (layer.collision) {
                var ind = collider.collisionStatics.indexOf(sprite);
                collider.collisionStatics.splice(ind, 1);
            }
            // Tilemap
            this.tiles[x][y] = null;
        }
    };

    tilemap.worldToMap = function (x, y) {
        return [Math.round(x / this.tileW), Math.round(y / this.tileH)];
    };

    tilemap.mapToWorld = function (x, y) {
        return [x * this.tileW, y * this.tileH];
    };


    tilemap.makeTileSprite = function (gid) {
        var frame = new PIXI.Rectangle((gid % this.imgCols) * tileW,
                Math.floor(gid / this.imgCols) * this.tileH, this.tileW, this.tileH);
        var tileTexture = new PIXI.Texture(this.bTxt, frame);
        var tileSprite = new PIXI.Sprite(tileTexture);

        return tileSprite;
    };

    tilemap.makeTile = function (gid) {
        var tile = {};

        var sprite = this.makeTileSprite(gid);

        tile.gid = gid;
        tile.sprite = sprite;                

        return tile;
    };

    return tilemap;
}
