function fetchAssetListFromMapData(mapData) {
    var assetsToLoad = [];
    _.each(mapData["tilesets"], function (tileset) {
        var img = tileset["image"];
        if (img.indexOf("/") > -1) {
            img = img.substring(img.lastIndexOf("/") + 1);
        }
        assetsToLoad.push("assets/" + img);
    });

    var layersData = mapData["layers"];
    var classes = [];
    for (i = 0; i < layersData.length; i++) {
        // if current layer is IMAGE LAYER, create a TilingSprite and add it to the gameworld
        if (layersData[i]["type"] === "imagelayer") {
            var img = layersData[i]["image"];
            if (img.indexOf("/") > -1) {
                img = img.substring(img.lastIndexOf("/") + 1);
            }
            assetsToLoad.push("assets/" + img);
        } else if (layersData[i]["type"] === "objectgroup") {
            _.each(layersData[i]["objects"], function (o) {
                if (!o["polygon"] && o["type"] !== "Rectangle") {
                    classes.push(o["name"]);
                }
            });
        }
    }
    classes = _.uniq(classes);

    _.each(classes, function (c) {
        var asset = eval(c).prototype.animSheet;
        if (!asset) {
            asset = eval(c).prototype.image;
        }
        if (asset.indexOf("/") > -1) {
            asset = asset.substring(asset.lastIndexOf("/") + 1);
        }
        assetsToLoad.push("assets/" + asset);
    });
    return assetsToLoad;
}

function createMap(game, mapData) {

    var collider = game.collider;

    game.level.width = mapData["width"] * mapData["tilewidth"];
    game.level.height = mapData["height"] * mapData["tileheight"];
    game.level.mapWidth = mapData["width"];
    game.level.mapHeight = mapData["height"];

    var layersData = mapData["layers"];
    var collisionLayer = _.find(layersData, function (layerData) {
        return layerData["name"] === "CollisionMasks"
    });

    if (collisionLayer) {
        for (var i = 0; i < collisionLayer["objects"].length; i++) {
            var oData = collisionLayer["objects"][i];
            collider.collisionMasks.push(oData);
        }
    }

    var objectNames = [];
    _.each(layersData, function (layerData) {
        _.each(layerData["objects"], function (o) {
            if (!o["polygon"] && !_.contains(objectNames, o.name) && o.name !== "")
                objectNames[objectNames.length] = o.name;
        })
    });

    for (i = 0; i < layersData.length; i++) {
        var layer = new PIXI.DisplayObjectContainer();
        for (var prop in layersData[i]) {
            layer[prop] = layersData[i][prop];
        }
        layer.alpha = layer.opacity;

        // TODO: rewrite this to be automatic and to use eval
        if (layersData[i]["properties"]) {
            if (layersData[i]["properties"]["collision"])
                layer.collision = true;
            if (!layersData[i]["properties"]["baked"]) {
                if (layersData[i]["type"] === "tilelayer")
                    layer.baked = true;
            } else {
                layer.baked = eval(layersData[i]["properties"]["baked"]);
            }
            if (layersData[i]["properties"]["sort"]) {
                layer.sort = true;
            }
            if (layersData[i]["properties"]["parallax"]) {
                layer.parallax = parseFloat(layersData[i]["properties"]["parallax"]);
                if (isNaN(layer.parallax)) {
                    layer.parallax = 100;
                }
            }
        }
        if (typeof layer.parallax === "undefined") {
            layer.parallax = 100;
        }

        // if current layer is IMAGE LAYER, create a TilingSprite and add it to the gameworld
        if (layersData[i]["type"] === "imagelayer") {
            var img = layersData[i]["image"];
            if (img.indexOf("/") > -1) {
                img = img.substring(img.lastIndexOf("/") + 1);
            }
            var tiledSprite = new A_.SCENERY.TiledSprite({image: img, width: game.level.width, height: game.level.height});
            layer.addChild(tiledSprite.sprite);
            game.level.container.addChild(layer);
        }

        // if current layer is TILE LAYER
        else if (layersData[i]["type"] === "tilelayer") {

//            window.console.log(layer.baked);
            var baked = layer.baked;
            layer.baked = false;

            var img = layersData[i]["properties"]["image"];
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

            var mapW = layersData[i]["width"];
            var mapH = layersData[i]["height"];
            var tileW = tileset.tilewidth;
            var tileH = tileset.tileheight;

            var tileData = layersData[i]["data"];
            var tileData2D = [];
            for (var j = 0; j < mapW; j++) {
                tileData2D[j] = [];
                for (var k = 0; k < mapH; k++) {
                    tileData2D[j][k] = -1;
                }
            }
            for (var j = 0; j < tileData.length; j++) {
                if (tileData[j] !== 0) {
                    tileData[j] = tileData[j] - tileset.firstgid;
                    var gid = tileData[j];
                    var mapX = j % game.level.mapWidth;
                    var mapY = Math.floor(j / game.level.mapWidth);
                    tileData2D[mapX][mapY] = gid;
                }
            }

            var tilemap = new A_.TILES.Tilemap(layer, "assets/" + img, tileW, tileH);
            tilemap.createTilelayer(tileData2D);

            layer.baked = baked;
            if (layer.baked) {
                layer = bakeLayer(layer, game.level);
            }

            game.level.addTileLayer(layer);
        }

        // if the current layer is OBJECT LAYER
        else if (layersData[i]["type"] === "objectgroup") {
            if (layersData[i]["name"] === "CollisionMasks")
                continue;

            // loop through all objects conained in the layer
            for (var j = 0; j < layersData[i]["objects"].length; j++) {
                // copy object data into temp var
                var oData = layersData[i]["objects"][j];

                // POLY || RECT
                // TODO: write Game.createPolygon()
                if (oData.polygon || oData.type === "Rectangle") {
                    var args = {};
                    for (var prop in oData["properties"]) {
                        args[prop] = eval(oData["properties"][prop]);
                    }

                    for (var prop in oData) {
                        args[prop] = oData[prop];
                    }

                    if (oData.polygon) {
                        var collisionPolygon = A_.POLYGON.Utils.createSATPolygonFromTiled(oData, true);
                        var o = game.createSprite(A_.SPRITES.CollisionSprite, layer, oData["x"], oData["y"], args, collisionPolygon);
                        o.setPositionRelative(-collisionPolygon.offset.x, -collisionPolygon.offset.y);

                    } else {
                        args.collisionSize = {w: args.width, h: args.height};
                        var o = game.createSprite(A_.SPRITES.CollisionSprite, layer, oData["x"], oData["y"], args);
                        o.setPositionRelative(o.collisionPolygon.w / 2, o.collisionPolygon.h / 2);
                    }
                    A_.EXTENSIONS.Polygon.addTo(o, A_.POLYGON.Utils.SATPolygonToPIXIPolygon(o.collisionPolygon, false));
                    o.updateCollisionPolygon();
                    o.update();
                    layer.addChild(o.sprite);
                }
                else {
                    var args = {};
                    for (var prop in oData["properties"]) {
                        args[prop] = eval(oData["properties"][prop]);
                    }

                    for (var prop in oData) {
                        args[prop] = oData[prop];
                    }

                    var colPolyData = _.find(collider.collisionMasks, function (mask) {
                        return mask.name === args.collisionMask;
                    });
                    if (colPolyData) {
                        var collisionPolygon = A_.POLYGON.Utils.createSATPolygonFromTiled(colPolyData, true);
                    } else {
                        collisionPolygon = null;
                    }

                    var o = game.createSprite(eval(oData["name"]), layer, oData["x"], oData["y"], args, collisionPolygon);
                    o.setPositionRelative(o.sprite.width / 2, -o.sprite.height / 2)

                    if (o.followee) {
                        game.cameraOptions.followee = o;
                    }
                }
            }

            if (layer.baked) {
                layer = bakeLayer(layer, game.level);
            }

            game.level.addSpriteLayer(layer)
        }
    }
}

// if layer's object do not update their properties, such as animation or position
// pre-bake layer, ie. make a single sprite/texture out of layer's objects
function bakeLayer(layer, level) {
    var renderTexture = new PIXI.RenderTexture(level.width, level.height);

    // create a sprite that uses the new render texture
    var sprite = new PIXI.Sprite(renderTexture);

    // render the layer to the render texture
    renderTexture.render(layer);

    // TODO: this commented piece of code makes tiled map non seamless
//    for (var prop in layer) {
//        if (layer.hasOwnProperty(prop)) {
//            sprite[prop] = layer[prop];
//        }
//    }
    sprite.alpha = layer.alpha;
    sprite.baked = true;
    sprite.position = layer.position;
    sprite.parallax = layer.parallax;
    sprite.name = layer.name;
    // If the layer is baked, we do not need the tilemap.
//    if (layer.tilemap) { sprite.tilemap = layer.tilemap; }

    return sprite;
}