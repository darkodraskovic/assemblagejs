function parseMap(game, collider, maker) {

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
        if (layersData[i]["properties"]) {
            if (layersData[i]["properties"]["collision"])
                layer.collision = true;
            if (layersData[i]["properties"]["update"])
                layer.update = true;
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

            if (!layer.update) {
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

                if (oData.polygon || oData.type === "Rectangle") {
                    var args = {};
                    for (var prop in oData["properties"]) {
                        args[prop] = eval(oData["properties"][prop]);
                    }

                    var o = new A_.Sprite();

                    for (var prop in oData) {
                        o[prop] = oData[prop];
                    }

                    for (var prop in args) {
                        o[prop] = args[prop];
                    }

//                    o.position.x = o.x;
//                    o.position.y = o.y;
                    o.setPosition(o.x, o.y);

                    if (oData.polygon) {
                        var collisionPolygon = createSATPolygonFromTiled(oData, true);
                        collider.activateCollisionFor(o, 0, 0, 0, 0, collisionPolygon);
                        var pos = o.getPosition();
                        o.setPosition(pos.x - collisionPolygon.offset.x, pos.y - collisionPolygon.offset.y);
//                        o.position.x -= collisionPolygon.offset.x;
//                        o.position.y -= collisionPolygon.offset.y;
                        o.updateCollisionPolygon();

                    } else {
                        var pos = o.getPosition();
                        o.setPosition(pos.x + oData.width / 2, pos.y + oData.height / 2);
//                        o.position.x += oData.width / 2;
//                        o.position.y += oData.height / 2;
                        collider.activateCollisionFor(o, oData.width, oData.height);
                    }

                    o.update();
                }
                else {
                    var args = {};
                    for (var prop in oData["properties"]) {
                        args[prop] = eval(oData["properties"][prop]);
                    }

                    // create an object based on give data
                    var o = maker(oData["name"], args);

                    for (var prop in oData) {
                        o[prop] = oData[prop];
                    }

                    for (var prop in args) {
                        o[prop] = args[prop];
                    }
                    // our objects are centered with .anchor property
                    // object's origin in TILED is the bottom left corner
                    // nevertheless, y axis in TILED points downwards
                    var pos = o.getPosition();
                    o.setPosition(o.x + o.width / 2, o.y + o.height / 2);
//                    o.position.x = o.x + o.width / 2;
//                    o.position.y = o.y - o.height / 2;

                    var colPolyData = _.find(collider.collisionMasks, function (mask) {
                        return mask.name === o.collisionMask;
                    });
                    if (colPolyData) {
                        var collisionPolygon = createSATPolygonFromTiled(colPolyData, true);
                        collider.activateCollisionFor(o, 0, 0, 0, 0, collisionPolygon);
                    }
                    else
                    if (o.properties) {
                        if (o.properties["collisionW"] && o.properties["collisionH"]) {
                            var colW = o["collisionW"];
                            var colH = o["collisionH"];
                            collider.activateCollisionFor(o, colW, colH);
                        } else
                            collider.activateCollisionFor(o);
                    }


                    if (o.properties) {
                        if (o.properties["collisionOffsetX"]) {
                            o.collisionPolygon.offset.x += o["collisionOffsetX"];
                            o.collisionPolygon.origOffset.x = o.collisionPolygon.offset.x;
                            o.collisionPolygon.recalc();
                            o.updateCollisionPolygon();
                        }
                        if (o.properties["collisionOffsetY"]) {
                            o.collisionPolygon.offset.y += o["collisionOffsetY"];
                            o.collisionPolygon.origOffset.y = o.collisionPolygon.offset.y;
                            o.collisionPolygon.recalc();
                            o.updateCollisionPolygon();
                        }
                    }

                    layer.addChild(o.sprite);
                }
                if (layer.update === true) {
                    game.updateSprites.push(o);
                }

                // Set collisions
                if (layer.collision === true) {
                    collider.collisionSprites.push(o);

                    if (o.collisionType) {

                        if (o.collisionType === "dynamic") {
                            collider.collisionDynamics.push(o);
                        } else if (o.collisionType === "static") {
                            collider.collisionStatics.push(o);
                        } else if (o.collisionType === "sensor") {
                            collider.collisionSensors.push(o);
                        }
                        else {
                            o.collisionType = "static";
                            collider.collisionStatics.push(o);
                        }
                    }
                }
            }

            if (!layer.update) {
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

    sprite.baked = true;
    sprite.position = layer.position;
    sprite.parallax = layer.parallax;
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
