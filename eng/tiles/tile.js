A_.TILES.Tile = Class.extend({
    init: function (gid, x, y, tilemap) {
        this.gid = gid;
        // TODO: Remove this reference.
        this.tilemap = tilemap;
        this.createSprite(tilemap, x, y);

        if (tilemap.layer.collisionResponse) {
            this.initCollision(tilemap, x, y);
        }
    },
    createSprite: function (tilemap, x, y) {
        var frameInd = this.gid - 1;
        var frame = new PIXI.Rectangle((frameInd % tilemap.imgCols) * tilemap.tileW,
                Math.floor(frameInd / tilemap.imgCols) * tilemap.tileH, tilemap.tileW, tilemap.tileH);
        var tileTexture = new PIXI.Texture(tilemap.baseTexture, frame);
        this.sprite = new PIXI.Sprite(tileTexture);
        tilemap.layer.addChild(this.sprite);
        this.sprite.position.x = tilemap.getLevelX(x);
        this.sprite.position.y = tilemap.getLevelY(y);
    },
    initCollision: function (tilemap, x, y) {
        var collisionPolygon;
        var box = new SAT.Box(new SAT.Vector(tilemap.getLevelX(x), tilemap.getLevelY(y)), tilemap.tileW, tilemap.tileH);
        collisionPolygon = box.toPolygon();
        collisionPolygon.w = box.w;
        collisionPolygon.h = box.h;
        collisionPolygon.calcBounds();
        this.collisionPolygon = collisionPolygon;
//            this.collisionPolygon.pos.x = A_.level.container.toLocal(A_.level.origin, this.sprite).x;
//            this.collisionPolygon.pos.y = A_.level.container.toLocal(A_.level.origin, this.sprite).y;
        this.collisonResponse = "static";
        this.collides = true;
    },
    removeFromLevel: function () {
        this.sprite.parent.removeChild(this.sprite);
    }
});
