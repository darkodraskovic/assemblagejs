DODO.Tile = function (gid, x, y, tilemap) {
    this.gid = gid;

    // SPRITE
    var frame = tilemap.frameRectangle;
    frame.x = ((gid - 1) % tilemap.imgCols) * (tilemap.tileW + tilemap.spacing);
    frame.y = Math.floor((gid - 1) / tilemap.imgCols) * (tilemap.tileH + tilemap.spacing);
    PIXI.Sprite.call(this, new PIXI.Texture(tilemap.baseTexture, frame));
    tilemap.container.addChild(this);
    
    // POSITION
    if (tilemap.orientation === "isometric") {
        this.position.x = tilemap.getSceneIsoX(x, y);
        this.position.y = tilemap.getSceneIsoY(x, y);
    }
    else {
        this.position.x = tilemap.getSceneX(x);
        this.position.y = tilemap.getSceneY(y);
    }
    // FIX ME
    this.position.y -= tilemap.spacing;

    // COLLISION
    if (tilemap.collides) {
        if (tilemap.orientation === "isometric") {
            this.collisionPolygon = new DODO.Polygon(
                    new SAT.Vector(tilemap.getSceneIsoX(x, y), tilemap.getSceneIsoY(x, y)),
                    [new SAT.Vector(tilemap.tileW / 2, 0),
                        new SAT.Vector(0, tilemap.tileH / 2),
                        new SAT.Vector(tilemap.tileW / 2, tilemap.tileH),
                        new SAT.Vector(tilemap.tileW, tilemap.tileH / 2),
                    ]);
        }
        else {
            this.collisionPolygon = new DODO.Box(new SAT.Vector(tilemap.getSceneX(x), tilemap.getSceneY(y)), tilemap.tileW, tilemap.tileH);
        }
        this.collides = true;
    }
};

DODO.Tile.prototype = new PIXI.Sprite();
DODO.Tile.prototype.constructor = DODO.Tile;
