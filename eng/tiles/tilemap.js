A_.TILES.Tilemap = Class.extend({
    init: function (layer, img, tileW, tileH) {
        this.layer = layer;
        this.baked = false;
        this.level = layer.level;

        this.img = "game/graphics/" + img;
        this.baseTexture = new PIXI.BaseTexture.fromImage(this.img, PIXI.scaleModes.LINEAR);
        this.imgW = this.baseTexture.width;
        this.imgH = this.baseTexture.height;
        this.imgCols = this.imgW / tileW;
        this.imgRows = this.imgH / tileH;

        this.tileW = tileW;
        this.tileH = tileH;

        this.tiles = [];

    },
    populateTilelayer: function (layerData) {
        if (this.layer.collisionResponse) {
//            this.collision = {};
//            this.collision.size = {};
//            this.collision.size.w = this.tileW;
//            this.collision.size.h = this.tileH;
//            this.collision.response = this.layer.collisionResponse;
//            if (this.collision.response !== "sensor" && this.collision.response !== "static") {
//                this.collision.response = "static";
//            }
            this.collisioResponse = this.layer.collisionResponse;
            if (this.collisionResponse !== "sensor" && this.collisionResponse !== "static") {
                this.collisionResponse = "static";
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
    applyLayerAttributesToTiles: function () {
        if (this.collisionResponse) {
            var w = this.tileW;
            var h = this.tileH;
            _.each(this.tiles, function (tileCol) {
                _.each(tileCol, function (tile) {
                    if (tile)
                        tile.setupCollision(w, h);
                });
            });
        }
        if (this.layer.mouseReactive) {
            _.each(this.tiles, function (tileCol) {
                _.each(tileCol, function (tile) {
                    if (tile)
                        tile.initMouseReactivity();
                    tile.setmouseReactivity(true);
                });
            });
        }
        if (this.layer.active) {
            var level = this.layer.level;
            _.each(this.tiles, function (tileCol) {
                _.each(tileCol, function (tile) {
                    if (tile)
                        level.tiles.push(tile);
                });
            });
        }

    },
    getTile: function (x, y) {
        if (x < 0 || x >= this.mapW)
            return;
        if (y < 0 || y >= this.mapH)
            return;
        return this.tiles[x][y];
    },
    setTile: function (gid, x, y) {
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

        if (this.collisionResponse) {
            tile.initCollision();
            if (this.collisionResponse === "sensor") {
                this.layer.level.collider.collisionDynamics.push(tile);
            }
            else {
                this.layer.level.collider.collisionStatics.push(tile);
            }
        }

        this.setTileInMap(tile, x, y);
        var worldCoords = this.mapToWorld(x, y);
        this.setTileInWorld(tile, worldCoords[0], worldCoords[1]);

        if (this.layer.mouseReactive) {
            tile.initMouseReactivity();
            tile.setMouseReactivity(true);
        }
        if (this.layer.active)
            this.layer.level.tilesToCreate.push(tile);

        return tile;
    },
    setTileInMap: function (tile, x, y) {
        this.tiles[x][y] = tile;
    },
    setTileInWorld: function (tile, x, y) {
        tile.moveToLayer(this.layer);
        tile.setPosition(x, y);
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

            var level = this.layer.level;
            // Collisions
            if (this.collisionResponse) {
                var ind;

                ind = level.collider.collisionStatics.indexOf(tile);
                if (ind > -1)
                    level.collider.collisionStatics.splice(ind, 1);

                ind = level.collider.collisionDynamics.indexOf(tile);
                if (ind > -1)
                    level.collider.collisionDynamics.splice(ind, 1);
            }
            // Active tiles
            if (this.layer.active) {
                ind = level.tiles.indexOf(tile);
                level.tiles.splice(ind, 1);
            }
            // Tilemap
            this.tiles[x][y] = null;
        }
    },
    // UTILS
    worldToMap: function (x, y) {
        return [Math.round(x / this.tileW), Math.round(y / this.tileH)];
    },
    mapToWorld: function (x, y) {
        return [x * this.tileW, y * this.tileH];
    }
});

