A_.TILES.createTiledMap = function(mapData) {
    var game = A_.game;
    var level = A_.level;
    var collider = A_.collider;

    level.width = mapData["width"] * mapData["tilewidth"];
    level.height = mapData["height"] * mapData["tileheight"];

    // Each Tiled level can have one CollisionMasks layer.
    // The type of the collision mask polygon has to correspond to the type,
    // ie. to the class of the sprite whose mask it is.
    var layersData = mapData["layers"];
    var collisionMasksLayer = _.find(layersData, function(layerData) {
        return layerData["name"] === "CollisionMasks";
    });

    if (collisionMasksLayer) {
        for (var i = 0; i < collisionMasksLayer["objects"].length; i++) {
            var oData = collisionMasksLayer["objects"][i];
            collider.collisionMasks.push(oData);
        }
        layersData.splice(layersData.indexOf(collisionMasksLayer), 1);
    }

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
            }

            level.createImageLayer(layer.name, {image: img, width: level.width, height: level.height}, layer);
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
                    var gid  = tileData[j] - tileset.firstgid + 1;
                    var mapX = j % mapData["width"];
                    var mapY = Math.floor(j / mapData["width"]);
                    tileData2D[mapX][mapY] = gid;
                }
            }

            var tilemap = new A_.TILES.Tilemap(layer, img, tileW, tileH);
            tilemap.populateTilelayer(tileData2D);

            layer.baked = baked;
            if (layer.baked) {
                layer = level.bakeLayer(layer, level);
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

                // POLY || RECT
                if (oData.polygon || oData.type === "Rectangle") {
//                    args.collision = {};
//                    args.collision.response = args.collisionResponse;

                    if (oData.polygon) {
                        var collisionPolygon = A_.POLYGON.Utils.createSATPolygonFromTiled(oData);
                        args.collisionPolygon = collisionPolygon;
                        var o = game.createSprite(A_.SPRITES.Colliding, layer, oData["x"], oData["y"], args);
                        o.setPositionRelative(-collisionPolygon.offset.x, -collisionPolygon.offset.y);

                    } else {
//                        args.collision.size = {w: oData["width"], h: oData["height"]};
                        args.collisionW = oData["width"]; 
                        args.collisionH = oData["height"]; 
                        var o = game.createSprite(A_.SPRITES.Colliding, layer, oData["x"], oData["y"], args);
                        o.setPositionRelative(o.collisionPolygon.w / 2, o.collisionPolygon.h / 2);
                    }
//                    A_.EXTENSIONS.Polygon.addTo(o, A_.POLYGON.Utils.SATPolygonToPIXIPolygon(o.collisionPolygon, false));
                }
                else {
                    var colPolyData = _.find(collider.collisionMasks, function(mask) {
                        return mask.type === args.collisionMask;
                    });
                    if (colPolyData) {
                        var collisionPolygon = A_.POLYGON.Utils.createSATPolygonFromTiled(colPolyData);
                        args.collisionPolygon = collisionPolygon;
                    } 
//                    else {
//                        collisionPolygon = null;
//                    }
                    var o = game.createSprite(eval(oData["type"]), layer, oData["x"], oData["y"], args);
                    o.setPositionRelative(o.getWidth() / 2, -o.getHeight() / 2);

                    if (o.followee) {
                        game.cameraOptions.followee = o;
                    }
                    if (oData["type"] === "Player") {
                        A_.player = o;
                    }
                }
                o.setRotation(oData["rotation"].toRad());
            }

            if (layer.baked) {
                layer = level.bakeLayer(layer, level);
            }
        }
    }
};