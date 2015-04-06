A_.TILES.createTiledMap = function (mapData, level) {
    var level = level;

    level.setWidth(mapData["width"] * mapData["tilewidth"]);
    level.setHeight(mapData["height"] * mapData["tileheight"]);

    var layersData = mapData["layers"];

    var currentTilemap;
    for (i = 0; i < layersData.length; i++) {
        var layer = level.createEmptyLayer();
        var layerData = layersData[i];

        for (var prop in layerData) {
            layer[prop] = layerData[prop];
        }
        layer.alpha = layer.opacity;

        if (layerData["properties"]) {
            var customLayerProps = layerData["properties"];
            for (var prop in customLayerProps) {
                layer[prop] = eval(customLayerProps[prop]);
            }
        }

        // if current layer is IMAGE LAYER, create a TilingSprite and add it to the gameworld.
        if (layerData["type"] === "imagelayer") {
            var img = layerData["image"];
            if (img.indexOf("/") > -1) {
                img = img.substring(img.lastIndexOf("/") + 1);
                img = level.manifest.directory + img;
            }

            var image = level.createImage(layer, {image: img, width: level.width, height: level.height,
                velocity: {x: layer["velocityX"], y: layer["velocityY"]}});
            level.addImageLayer(layer);
            if (layer.active) {
                level.images.push(image);
            }
        }

        // if current layer is TILE LAYER
        else if (layerData["type"] === "tilelayer") {
            // Temporarily turn unser layer.baked option in order to build
            // a tilemap. We'll bake the tilemap later if needed.
            var baked = layer.baked;
            layer.baked = false;

            // This layer property must be set by user.
            var img = layer["image"];
            var tileset;
            for (var j = 0; j < mapData["tilesets"].length; j++) {
                var tilesetimg = mapData["tilesets"][j].image;
                if (tilesetimg.indexOf("/") > -1) {
                    tilesetimg = tilesetimg.substring(tilesetimg.lastIndexOf("/") + 1);
                }
                if (tilesetimg === img) {
                    tileset = mapData["tilesets"][j];
                    break;
                }
            }


            var mapW = layerData["width"];
            var mapH = layerData["height"];
            var tileW = tileset.tilewidth;
            var tileH = tileset.tileheight;

            var tileData = layerData["data"];
            var tileData2D = [];
            for (var j = 0; j < mapW; j++) {
                tileData2D[j] = [];
                for (var k = 0; k < mapH; k++) {
                    tileData2D[j][k] = 0;
                }
            }
            for (var j = 0; j < tileData.length; j++) {
                if (tileData[j] !== 0) {
                    var gid = tileData[j] - tileset.firstgid + 1;
                    var mapX = j % mapData["width"];
                    var mapY = Math.floor(j / mapData["width"]);
                    tileData2D[mapX][mapY] = gid;
                }
            }

            var tilemap = new A_.TILES.Tilemap(layer, level.manifest.directory + img, tileW, tileH, mapData.orientation);
            currentTilemap = tilemap;
            tilemap.populateTilelayer(tileData2D);

            layer.baked = baked;
            if (layer.baked) {
                layer = level.bakeLayer(layer);
                var tiles = tilemap.tiles;
                for (var l = 0, cols = tiles.length; l < cols; l++) {
                    for (var m = 0, rows = tiles[0].length; m < rows; m++) {
                        if (tiles[l][m]) {
                            tiles[l][m].sprite = null;
                        }
                    }
                }
            }
            level.addTileLayer(layer);
        }

        // if the current layer is OBJECT LAYER
        else if (layerData["type"] === "objectgroup") {
            level.addSpriteLayer(layer);
            // loop through all objects conained in the layer
            for (var j = 0; j < layerData["objects"].length; j++) {
                // copy object data into temp var
                var args = {};
                var oData = layerData["objects"][j];
                for (var prop in oData["properties"]) {
                    args[prop] = eval(oData["properties"][prop]);
                }

                args["name"] = oData["name"];
                args["type"] = oData["type"];

                // Polygon
                if (oData["polygon"]) {
                    var collisionPolygon = A_.POLYGON.Utils.TiledPolygonToSATPolygon(oData, mapData);
                    args.collisionPolygon = collisionPolygon;
                    var type;
                    if (oData["type"]) {
                        type = eval(oData["type"]);
                    } else {
                        type = A_.SPRITES.Colliding;
                        args["frameWidth"] = collisionPolygon.w;
                        args["frameHeight"] = collisionPolygon.h;
                    }
                    var o = level.createSprite(type, layer, oData["x"], oData["y"], args);
                    if (o.sprite instanceof PIXI.Graphics) {
                        A_.POLYGON.Utils.drawTiledPolygon(o.sprite, oData["polygon"]);
                    }
                }
                // Rectangle
                else if (oData.type === "") {
                    args["frameWidth"] = oData["width"];
                    args["frameHeight"] = oData["height"];
                    var o = level.createSprite(A_.SPRITES.Colliding, layer, oData["x"], oData["y"], args);
                    o.setPositionRelative(o.collisionPolygon.w * o.getOrigin().x, o.collisionPolygon.h * o.getOrigin().y);
                }
                // Tile || Rectangle
                else {
                    var type = eval(oData["type"]);
                    if (!type.prototype.spriteSheet) {
                        args["frameWidth"] = oData["width"];
                        args["frameHeight"] = oData["height"];
                    }
                    var o = level.createSprite(type, layer, oData["x"], oData["y"], args);

                    if (mapData.orientation !== "isometric")
                        o.setPositionRelative(o.getWidth() * o.getOrigin().x, o.getHeight() * o.getOrigin().y);
                }

                o.setRotation(oData["rotation"].toRad());
                if (mapData.orientation === "isometric") {
                    var x = o.getX() / mapData.tileheight;
                    var y = o.getY() / mapData.tileheight;
                    o.position.x = (x - y) * (mapData.tilewidth / 2) + level.getWidth() / 2;
                    o.position.y = (x + y) * (mapData.tileheight / 2);
                }
                if (o instanceof A_.SPRITES.Colliding)
                    o.synchCollisionPolygon();
            }

            if (layer.baked) {
                layer = level.bakeLayer(layer, level);
            }
        }
    }
    level.manageSprites();
};