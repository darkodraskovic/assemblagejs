A_.TILES.Tilemap = Class.extend({
    init: function(layer, img, tileW, tileH) {
        this.layer = layer;
        this.baked = false;

        this.img = "graphics/" + A_.level.directoryPrefix + img;
        this.baseTexture = new PIXI.BaseTexture.fromImage(this.img, PIXI.scaleModes.LINEAR);
        this.imgW = this.baseTexture.width;
        this.imgH = this.baseTexture.height;
        this.imgCols = this.imgW / tileW;
        this.imgRows = this.imgH / tileH;

        this.tileW = tileW;
        this.tileH = tileH;

        this.tiles = [];

    },
    createTilelayer: function(layerData) {
        if (this.layer.collisionResponse) {
            this.collision = {};
            this.collision.size = {};
            this.collision.size.w = this.tileW;
            this.collision.size.h = this.tileH;
            this.collision.response = this.layer.collisionResponse;
            if (this.collision.response !== "sensor" && this.collision.response !== "static") {
                this.collision.response = "static";
            }
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

//        this.applyLayerAttributesToTiles();
        this.layer.tilemap = this;
    },
    applyLayerAttributesToTiles: function() {
        if (this.collision) {
            var w = this.tileW;
            var h = this.tileH;
            _.each(this.tiles, function(tileCol) {
                _.each(tileCol, function(tile) {
                    if (tile)
                        tile.setCollision(w, h);
                });
            });
        }
        if (this.layer.mouseReactive) {
            _.each(this.tiles, function(tileCol) {
                _.each(tileCol, function(tile) {
                    if (tile)
                        A_.INPUT.addMouseReacivity(tile);
                });
            });
        }
        if (this.layer.active) {
            _.each(this.tiles, function(tileCol) {
                _.each(tileCol, function(tile) {
                    if (tile)
                        A_.level.tiles.push(tile);
                });
            });
        }

    },
    getTile: function(x, y) {
        if (x < 0 || x >= this.mapW)
            return null;
        if (y < 0 || y >= this.mapH)
            return null;
        return this.tiles[x][y];
    },
    setTile: function(gid, x, y) {
        if (this.layer.baked)
            return;
        if (!_.isNumber(gid) || !_.isNumber(x) || !_.isNumber(y))
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

        var tile = new A_.TILES.Tile(gid, x, y, this);
        this.setTileInMap(tile, x, y);
        var worldCoords = this.mapToWorld(x, y);
        this.setTileInWorld(tile, worldCoords[0], worldCoords[1]);

        if (this.collision)
            tile.setCollision(this.tileW, this.tileH);
        if (this.layer.mouseReactive)
            A_.INPUT.addMouseReacivity(tile);
        if (this.layer.active)
            A_.game.tilesToCreate.push(tile);

        return tile;
    },
    setTileInMap: function(tile, x, y) {
        this.tiles[x][y] = tile;
    },
    setTileInWorld: function(tile, x, y) {
        var sprite = tile.sprite;
        sprite.position.x = x;
        sprite.position.y = y;

        this.layer.addChild(sprite);
    },
    unsetTile: function(x, y) {
        if (this.layer.baked)
            return;

        if (this.tiles[x] && this.tiles[x][y]) {
            var tile = this.tiles[x][y];
            var sprite = this.tiles[x][y].sprite;

            // REMOVE FROM
            // Pixi
            this.layer.removeChild(sprite);
            // Collisions
            if (this.collision) {
                var ind;
                
                ind = A_.collider.collisionStatics.indexOf(tile);
                if (ind > -1)
                    A_.collider.collisionStatics.splice(ind, 1);
                
                ind = A_.collider.collisionDynamics.indexOf(tile);
                if (ind > -1)
                    A_.collider.collisionDynamics.splice(ind, 1);
            }
            // Active tiles
            if (this.layer.active) {
                ind = A_.level.tiles.indexOf(tile);
                A_.level.tiles.splice(ind, 1);
            }
            // Tilemap
            this.tiles[x][y] = null;
        }
    },
    // UTILS
    worldToMap: function(x, y) {
        return [Math.round(x / this.tileW), Math.round(y / this.tileH)];
    },
    mapToWorld: function(x, y) {
        return [x * this.tileW, y * this.tileH];
    }
});