A_.TILES.Tile = function (gid, x, y, tilemap) {
    this.gid = gid;

    // SPRITE
    var frameInd = this.gid - 1;
    var frame = tilemap.frameRectangle;
    frame.x = (frameInd % tilemap.imgCols) * (tilemap.tileW + tilemap.spacing);
    frame.y = Math.floor(frameInd / tilemap.imgCols) * (tilemap.tileH + tilemap.spacing);
    var tileTexture = new PIXI.Texture(tilemap.baseTexture, frame);
    PIXI.Sprite.call(this, tileTexture);
    tilemap.layer.addChild(this);
    if (tilemap.orientation === "isometric") {
        this.position.x = tilemap.getSceneIsoX(x, y);
        this.position.y = tilemap.getSceneIsoY(x, y);
    }
    else {
        this.position.x = tilemap.getSceneX(x);
        this.position.y = tilemap.getSceneY(y);
    }
    if (tilemap.offset)
        this.position.y -= tilemap.spacing;

    // COLLISION
    if (tilemap.layer.collisionResponse) {
        var collisionPolygon;
        if (tilemap.orientation === "isometric") {
            var colX = tilemap.getSceneIsoX(x, y);
            var colY = tilemap.getSceneIsoY(x, y);
            collisionPolygon = new A_.POLYGON.Polygon(new SAT.Vector(colX, colY), [
                new SAT.Vector(tilemap.tileW / 2, 0),
                new SAT.Vector(0, tilemap.tileH / 2),
                new SAT.Vector(tilemap.tileW / 2, tilemap.tileH),
                new SAT.Vector(tilemap.tileW, tilemap.tileH / 2),
            ]);
        }
        else {
            var box = new A_.POLYGON.Box(new SAT.Vector(tilemap.getSceneX(x), tilemap.getSceneY(y)), tilemap.tileW, tilemap.tileH);
            collisionPolygon = box.toPolygon();
            collisionPolygon.w = box.w;
            collisionPolygon.h = box.h;
        }
        this.collisionPolygon = collisionPolygon;
        this.collides = true;
    }
};

A_.TILES.Tile.prototype = new PIXI.Sprite();
A_.TILES.Tile.prototype.constructor = A_.TILES.Tile;