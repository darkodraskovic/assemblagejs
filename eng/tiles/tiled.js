DODO.createTiledMap = function(mapData, scene) {
    mapData = JSON.parse(mapData);

    scene.setWidth(mapData["width"] * mapData["tilewidth"]);
    scene.setHeight(mapData["height"] * mapData["tileheight"]);

    var layersData = mapData["layers"];

    for (i = 0; i < layersData.length; i++) {
        var layer = new DODO.Layer(scene);
        var layerData = layersData[i];

        _.extend(layer, layerData);
        layer.alpha = layer.opacity;
        if (layerData["properties"]) {
            var customLayerProps = layerData["properties"];
            for (var prop in customLayerProps) {
                layer[prop] = eval(customLayerProps[prop]);
            }
        }

        // if current layer is IMAGE LAYER, create a Tiling sprite and add it to the gameworld.
        if (layerData["type"] === "imagelayer") {
            new DODO.Tiling(layer, {image: layer["image"], width: scene.width, height: scene.height,
                velocity: {x: layer["velocityX"], y: layer["velocityY"]}});
        }

        // if current layer is TILE LAYER
        else if (layerData["type"] === "tilelayer") {
            // This layer "image" property must be set by the user.
            var img = layer["image"].substring(layer["image"].lastIndexOf("/") + 1);
            var tileset;
            for (var j = 0; j < mapData["tilesets"].length; j++) {
                var tilesetimg = mapData["tilesets"][j].image;
                tilesetimg = tilesetimg.substring(tilesetimg.lastIndexOf("/") + 1);
                if (tilesetimg === img) {
                    tileset = mapData["tilesets"][j];
                    break;
                }
            }

            var tileData2D = [];
            for (var j = 0; j < layerData["width"]; j++) {
                tileData2D[j] = [];
                for (var k = 0; k < layerData["height"]; k++) {
                    tileData2D[j][k] = 0;
                }
            }
            var tileData1D = layerData["data"];
            for (var j = 0; j < tileData1D.length; j++) {
                if (tileData1D[j] !== 0) {
                    var gid = tileData1D[j] - tileset.firstgid + 1;
                    var mapX = j % mapData["width"];
                    var mapY = Math.floor(j / mapData["width"]);
                    tileData2D[mapX][mapY] = gid;
                }
            }

            var tilemap = new DODO.Tilemap(layer, layer["image"], 
                tileset.tilewidth, tileset.tileheight, layer.collides, tileset.spacing, mapData.orientation);
            tilemap.populate(tileData2D);
        }

        // if the current layer is OBJECT LAYER
        else if (layerData["type"] === "objectgroup") {
            for (var j = 0; j < layerData["objects"].length; j++) {
                var props = {};
                var oData = layerData["objects"][j];
                for (var prop in oData["properties"]) {
                    props[prop] = eval(oData["properties"][prop]);
                }
                props["name"] = oData["name"];
                if (oData["polygon"]) {
                    props.polygon = DODO.TiledPolygonToSATPolygon(oData, mapData);
                }
                var o = new (eval(oData["type"]))(layer, oData["x"], oData["y"], props);

                // Object TRANSFORM
                o.rotation = oData["rotation"].toRad();
                if (mapData.orientation === "isometric") {
                    var x = o.position.x / mapData.tileheight;
                    var y = o.position.y / mapData.tileheight;
                    o.position.x = (x - y) * (mapData.tilewidth / 2) + scene.getWidth() / 2;
                    o.position.y = (x + y) * (mapData.tileheight / 2);
                }
                if (o instanceof DODO.Colliding) {
                    o.synchCollisionPolygon();
                }
            }
        }
        if (layer.baked) {
//            scene.bakeLayer(layer);
        }
    }
};