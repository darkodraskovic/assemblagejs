A_.TILES.Tile = Class.extend({
    init: function(gid, x, y, tilemap) {
        this.gid = gid;
        // TODO: Remove this reference.
        this.tilemap = tilemap;
        this.createSprite(tilemap, x, y);

        if (tilemap.layer.collisionResponse) {
            this.initCollision(tilemap, x, y);
        }
    },
    createSprite: function(tilemap, x, y) {
        var frameInd = this.gid - 1;
        var frame = tilemap.frameRectangle;
        frame.x = (frameInd % tilemap.imgCols) * (tilemap.tileW + tilemap.spacing);
        frame.y = Math.floor(frameInd / tilemap.imgCols) * (tilemap.tileH + tilemap.spacing);
        var tileTexture = new PIXI.Texture(tilemap.baseTexture, frame);
        this.sprite = new PIXI.Sprite(tileTexture);
        tilemap.layer.addChild(this.sprite);
        if (tilemap.orientation === "isometric") {
            this.sprite.position.x = tilemap.getLevelIsoX(x, y);
            this.sprite.position.y = tilemap.getLevelIsoY(x, y);
//            this.sprite.position.y = tilemap.getLevelIsoY(x, y) - tilemap.offset ? tilemap.spacing : 0;
            if (tilemap.offset)
                this.sprite.position.y -= tilemap.spacing;
        }
        else {
            this.sprite.position.x = tilemap.getLevelX(x);
            this.sprite.position.y = tilemap.getLevelY(y);
        }
    },
    initCollision: function(tilemap, x, y) {
        var collisionPolygon;
        if (tilemap.orientation === "isometric") {
            var colX = tilemap.getLevelIsoX(x, y);
            var colY = tilemap.getLevelIsoY(x, y);
            collisionPolygon = new A_.POLYGON.Polygon(new SAT.Vector(colX, colY), [
                new SAT.Vector(0, 0),
                new SAT.Vector(-tilemap.tileW / 2, tilemap.tileH / 2),
                new SAT.Vector(0, tilemap.tileH),
                new SAT.Vector(tilemap.tileW / 2, tilemap.tileH / 2),
            ]);
            collisionPolygon.setOffset(new SAT.Vector(tilemap.tileW / 2, 0));
            collisionPolygon.calcBounds();
//            var graphics = new PIXI.Graphics();
//            A_.POLYGON.Utils.drawSATPolygon(graphics, collisionPolygon);
//            tilemap.layer.addChild(graphics);
//            graphics.position.x = collisionPolygon.pos.x;
//            graphics.position.y = collisionPolygon.pos.y;
        }
        else {
            var box = new SAT.Box(new SAT.Vector(tilemap.getLevelX(x), tilemap.getLevelY(y)), tilemap.tileW, tilemap.tileH);
            collisionPolygon = box.toPolygon();
            collisionPolygon.w = box.w;
            collisionPolygon.h = box.h;
            collisionPolygon.calcBounds();
        }
        this.collisionPolygon = collisionPolygon;
//            this.collisionPolygon.pos.x = A_.level.container.toLocal(A_.level.origin, this.sprite).x;
//            this.collisionPolygon.pos.y = A_.level.container.toLocal(A_.level.origin, this.sprite).y;
        this.collides = true;
    },
    removeFromLevel: function() {
        this.sprite.parent.removeChild(this.sprite);
    }
});
