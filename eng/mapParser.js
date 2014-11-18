function parseMap(game) {

    var collider = game.collider;

    game.gameWorld.width = mapData["width"] * mapData["tilewidth"];
    game.gameWorld.height = mapData["height"] * mapData["tileheight"];
    game.gameWorld.mapWidth = mapData["width"];
    game.gameWorld.mapHeight = mapData["height"];

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

        // TODO: rewrite this to be automatic and to use eval
        if (layersData[i]["properties"]) {
            if (layersData[i]["properties"]["collision"])
                layer.collision = true;
            if (layersData[i]["properties"]["baked"])
                layer.baked = true;
            if (layersData[i]["properties"]["sort"]) {
                layer.sort = true;
            }
            if (layersData[i]["properties"]["parallax"]) {
                layer.parallax = parseFloat(layersData[i]["properties"]["parallax"]);
            }
            if (!layer.parallax || isNaN(layer.parallax)) {
                layer.parallax = 100;
            }
        }

        // if current layer is IMAGE LAYER, create a TilingSprite and add it to the gameworld
        if (layersData[i]["type"] === "imagelayer") {
            var bg = makeBackground("assets/" + layersData[i]["image"], game.gameWorld.width, game.gameWorld.height);
            layer.addChild(bg);
            game.gameWorld.container.addChild(layer);
        }

        // if current layer is TILE LAYER
        else if (layersData[i]["type"] === "tilelayer") {

            var baked = layer.baked;
            layer.baked = false;

            var img = layersData[i]["properties"]["image"];
            var tileset;
            for (var j = 0; j < mapData["tilesets"].length; j++) {
                if (mapData["tilesets"][j].image === img) {
                    tileset = mapData["tilesets"][j];
                    break;
                }
            }

            var mapW = layersData[i]["width"];
            var mapH = layersData[i]["height"];
            var tileW = tileset.tilewidth;
            var tileH = tileset.tileheight;
            var tilemap = makeTilemap(layer, "assets/" + img, mapW, mapH, tileW, tileH);

            var tileData = layersData[i]["data"];
            for (var j = 0; j < tileData.length; j++) {
                if (tileData[j] !== 0) {
                    tileData[j] = tileData[j] - tileset.firstgid;
                    var gid = tileData[j];
                    var mapX = j % game.gameWorld.mapWidth;
                    var mapY = Math.floor(j / game.gameWorld.mapWidth);
                    tilemap.setTile(gid, mapX, mapY);
                }
            }

            layer.baked = baked;
            if (layer.baked) {
                layer = bakeLayer(layer);
            }

            game.gameWorld.container.addChild(layer);
            layer.tilemap = tilemap;
            game.tileLayers.push(layer);

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

                    var o = new A_.SPRITES.Sprite();

                    for (var prop in oData) {
                        o[prop] = oData[prop];
                    }

                    for (var prop in args) {
                        o[prop] = args[prop];
                    }

                    o.setPosition(o.x, o.y);

                    if (oData.polygon) {
                        var collisionPolygon = createSATPolygonFromTiled(oData, true);
                        o.collides = true;
                        o.setCollision(collisionPolygon);
                        var pos = o.getPosition();
                        o.setPosition(pos.x - collisionPolygon.offset.x, pos.y - collisionPolygon.offset.y);
                        o.updateCollisionPolygon();

                    } else {
                        var pos = o.getPosition();
                        o.setPosition(pos.x, pos.y);
                        o.collides = true;
                        o.setCollision();
                    }
                    o.update();
//                    game.polygons.push(o);
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
                        var collisionPolygon = createSATPolygonFromTiled(colPolyData, true);
                    } else {
                        collisionPolygon = null;
                    }
                    var o = game.createSprite(eval(oData["name"]), layer, oData["x"], oData["y"], args, collisionPolygon);
                    var pos = o.getPosition();
                    o.setPosition(pos.x + o.sprite.width / 2, pos.y - o.sprite.height / 2)
                    if (o.name === "Player") {
                        player = o;
                    }
                }
            }

            if (layer.baked) {
                layer = bakeLayer(layer);
            }

            game.gameWorld.container.addChild(layer);

            game.spriteLayers.push(layer);
        }
        game.layers.push(layer);
    }
}

// if layer's object do not update their properties, such as animation or position
// pre-bake layer, ie. make a single sprite/texture out of layer's objects
function bakeLayer(layer) {
    var renderTexture = new PIXI.RenderTexture(game.gameWorld.width, game.gameWorld.height);

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
    sprite.baked = true;
    sprite.position = layer.position;
    sprite.parallax = layer.parallax;
    sprite.name = layer.name;

    return sprite;
}

function createSATPolygonFromTiled(oData, centered) {
    var xs = [];
    var ys = [];

    var vectors = _.map(oData.polygon, function (vertex) {
        return new SAT.Vector(vertex.x, vertex.y)
    });
    _.each(vectors, function (vector) {
        xs[xs.length] = vector.x;
        ys[ys.length] = vector.y;
    });

    var minX = _.min(xs);
    var minY = _.min(ys);
    var maxX = _.max(xs);
    var maxY = _.max(ys);
    var w = maxX - minX;
    var h = maxY - minY;

    var collisionPolygon = new SAT.Polygon(new SAT.Vector(oData.x, oData.y), vectors);
    var offsetX = 0;
    var offsetY = 0;
    if (centered) {
        offsetX = (minX + w / 2);
        offsetY = (minY + h / 2);
    } else {
        offsetX = minX;
        offsetY = minY;
    }

    var offset = new SAT.Vector(-offsetX, -offsetY);
    collisionPolygon.setOffset(offset);
    collisionPolygon.w = w;
    collisionPolygon.h = h;

    return collisionPolygon;
}
