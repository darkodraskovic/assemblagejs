A_.TILES.createTiledMap = function (mapData, scene) {
    mapData = JSON.parse(mapData);
    var scene = scene;
    
    scene.setWidth(mapData["width"] * mapData["tilewidth"]);
    scene.setHeight(mapData["height"] * mapData["tileheight"]);

    var layersData = mapData["layers"];

    for (i = 0; i < layersData.length; i++) {
        var layer = scene.createLayer();
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
            new A_.SPRITES.TilingSprite(layer, {image: layer["image"], width: scene.width, height: scene.height,
                velocity: {x: layer["velocityX"], y: layer["velocityY"]}});
        }
        
        // if current layer is TILE LAYER
        else if (layerData["type"] === "tilelayer") {
            // Temporarily turn on unset layer.baked option in order to build
            // a tilemap. We'll bake the tilemap later if needed.
            var baked = layer.baked;
            layer.baked = false;

            // This layer property must be set by user.
            var img = layer["image"].substring(layer["image"].lastIndexOf("/") + 1);
            var tileset;
            var spacing;
            for (var j = 0; j < mapData["tilesets"].length; j++) {
                var tilesetimg = mapData["tilesets"][j].image;
                if (tilesetimg.indexOf("/") > -1) {
                    tilesetimg = tilesetimg.substring(tilesetimg.lastIndexOf("/") + 1);
                }
                if (tilesetimg === img) {
                    tileset = mapData["tilesets"][j];
                    spacing = mapData["tilesets"][j]["spacing"];
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

            var tilemap = new A_.TILES.Tilemap(layer, layer["image"], tileW, tileH, spacing,
                    mapData.orientation);
            tilemap.populate(tileData2D);

            layer.baked = baked;
            if (layer.baked) {
                layer = scene.bakeLayer(layer);
                var tiles = tilemap.tiles;
                for (var l = 0, cols = tiles.length; l < cols; l++) {
                    for (var m = 0, rows = tiles[0].length; m < rows; m++) {
                        if (tiles[l][m]) {
                            tiles[l][m].sprite = null;
                        }
                    }
                }
            }
        }
        
        // if the current layer is OBJECT LAYER
        else if (layerData["type"] === "objectgroup") {
            for (var j = 0; j < layerData["objects"].length; j++) {
                var args = {};
                var oData = layerData["objects"][j];
                for (var prop in oData["properties"]) {
                    args[prop] = eval(oData["properties"][prop]);
                }
                args["name"] = oData["name"];

                if (oData["polygon"]) {
                    args.polygon = A_.POLYGON.Utils.TiledPolygonToSATPolygon(oData, mapData);
                }

                var type;
                if (oData["type"]) { // user defined type
                    type = eval(oData["type"]);
                } else {
                    type = A_.SPRITES.Colliding; // Colliding polygon
                }
                var o = new type(layer, oData["x"], oData["y"], args);

                // General object transform
                o.setRotation(oData["rotation"].toRad());

                if (mapData.orientation === "isometric") {
                    var x = o.getX() / mapData.tileheight;
                    var y = o.getY() / mapData.tileheight;
                    o.position.x = (x - y) * (mapData.tilewidth / 2) + scene.getWidth() / 2;
                    o.position.y = (x + y) * (mapData.tileheight / 2);
                }

                if (o instanceof A_.SPRITES.Colliding) {
                    o.synchCollisionPolygon();
                }
            }

            if (layer.baked) {
                layer = scene.bakeLayer(layer, scene);
            }
        }
    }
    scene.manageSprites();
};