A_.TILES.Tile = Class.extend({
    init: function(gid, sprite, x, y, tilemap) {
        this.gid = gid;
        this.sprite = sprite;
        this.mapPosition = {};
        this.mapPosition.x = x;
        this.mapPosition.y = y;
        this.tilemap = tilemap;
        this.w = tilemap.tileW;
        this.h = tilemap.tileH;
        this.containedPoint = new SAT.Vector(0, 0);
    },
    setCollision: function(w, h) {
        var collisionPolygon;

        var box = new SAT.Box(new SAT.Vector(0, 0), w, h);
        collisionPolygon = box.toPolygon();
        collisionPolygon.w = box.w;
        collisionPolygon.h = box.h;

        this.collisionPolygon = collisionPolygon;
        this.collisionPolygon.pos.x = this.x();
        this.collisionPolygon.pos.y = this.y();
        A_.collider.collisionStatics.push(this);
        A_.collider.collisionTiles.push(this);
    },
    collideWithStatic: function(other, response) {

    },
    collideWithDynamic: function(other, response) {

    },
    getPosition: function() {
        return this.sprite.position;
    },
    x: function(x) {
        if (x)
            this.position(x, this.y());
        else
            return this.sprite.position.x;
    },
    y: function(y) {
        if (y)
            this.position(this.x(), y);
        else
            return this.sprite.position.y;
    },
    position: function(x, y) {
        if (typeof x === "number" && typeof y === "number") {
            this.sprite.position.x = x;
            this.sprite.position.y = y;
        } else {
            return this.sprite.position;
        }
    },
    containsPoint: function(x, y) {
        this.containedPoint.x = x;
        this.containedPoint.y = y;
        return SAT.pointInPolygon(this.containedPoint, this.collisionPolygon);
    },
    width: function () {
        return this.w;
    },
    height: function () {
        return this.h;
    }
});
