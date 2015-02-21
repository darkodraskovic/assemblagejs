A_.TILES.Tile = Class.extend({
    init: function (gid, x, y, tilemap) {
        this.gid = gid;
        this.mapPosition = {};
        this.mapPosition.x = x;
        this.mapPosition.y = y;
        this.tilemap = tilemap;
        this.createSprite();

        var layer = this.tilemap.layer;
        var level = this.tilemap.level;

        if (layer.collisionResponse) {
            this.initCollision();
            level.tiles.push(this);
        }
    },
    createSprite: function () {
        var frameInd = this.gid - 1;
        var tm = this.tilemap;
        var frame = new PIXI.Rectangle((frameInd % tm.imgCols) * tm.tileW,
                Math.floor(frameInd / tm.imgCols) * tm.tileH, tm.tileW, tm.tileH);
        var tileTexture = new PIXI.Texture(tm.baseTexture, frame);
        this.sprite = new PIXI.Sprite(tileTexture);
        this.tilemap.layer.addChild(this.sprite);
        this.sprite.position.x = this.tilemap.getLevelX(this.mapPosition.x);
        this.sprite.position.y = this.tilemap.getLevelY(this.mapPosition.y);
    },
    initCollision: function () {
        var collisionPolygon;
        var box = new SAT.Box(new SAT.Vector(0, 0), this.tilemap.tileW, this.tilemap.tileH);
        collisionPolygon = box.toPolygon();
        collisionPolygon.w = box.w;
        collisionPolygon.h = box.h;
        collisionPolygon.calcBounds();
        this.collisionPolygon = collisionPolygon;
        
        this.collisionPolygon.pos.x = this.sprite.x;
        this.collisionPolygon.pos.y = this.sprite.y;
//            this.collisionPolygon.pos.x = A_.level.container.toLocal(A_.level.origin, this.sprite).x;
//            this.collisionPolygon.pos.y = A_.level.container.toLocal(A_.level.origin, this.sprite).y;

        this.collides = true;

    },
    removeFromLevel: function () {
        var level = this.tilemap.level;
        if (this.tilemap.collisionResponse) {
            var ind = level.tiles.indexOf(this);
            if (ind > -1)
                level.tiles.splice(ind, 1);
        }
        this.sprite.parent.removeChild(this.sprite);
    }
});
