A_.TILES.Tile = Class.extend({
    init: function (gid, x, y, tilemap) {
        this.gid = gid;
        this.mapPosition = {};
        this.mapPosition.x = x;
        this.mapPosition.y = y;
        this.tilemap = tilemap;
        this.containedPoint = new SAT.Vector(0, 0);
        this.createSprite();
        if (this.tilemap.collisionResponse) {
            this.initCollision();
        }
    },
    createSprite: function () {
        var frameInd = this.gid - 1;
        var tm = this.tilemap;
        var frame = new PIXI.Rectangle((frameInd % tm.imgCols) * tm.tileW,
                Math.floor(frameInd / tm.imgCols) * tm.tileH, tm.tileW, tm.tileH);
        var tileTexture = new PIXI.Texture(tm.baseTexture, frame);
        this.sprite = new PIXI.Sprite(tileTexture);
    },
    initCollision: function () {
        this.collides = true;

        var collisionPolygon;
        var box = new SAT.Box(new SAT.Vector(0, 0), this.tilemap.tileW, this.tilemap.tileH);
        collisionPolygon = box.toPolygon();
        collisionPolygon.w = box.w;
        collisionPolygon.h = box.h;
        this.collisionPolygon = collisionPolygon;
        this.collisionResponse = this.tilemap.collisionResponse;
        if (this.collisionResponse === "sensor") {
            A_.collider.collisionDynamics.push(this);
        }
        else {
            A_.collider.collisionStatics.push(this);
        }
    },
    moveToLayer: function (layer) {
        layer.addChild(this.sprite);
    },
    setPosition: function (x, y) {
        this.prevX = x;
        this.prevY = y;
        this.sprite.position.x = x;
        this.sprite.position.y = y;
        if (this.collisionPolygon) {
            this.collisionPolygon.pos.x = this.getX();
            this.collisionPolygon.pos.y = this.getY();
//            this.collisionPolygon.pos.x = A_.level.container.toLocal(A_.level.origin, this.sprite).x;
//            this.collisionPolygon.pos.y = A_.level.container.toLocal(A_.level.origin, this.sprite).y;
        }
    },
    getX: function () {
        return this.sprite.position.x;
    },
    getY: function () {
        return this.sprite.position.y;
    },
    getPosition: function () {
        return this.sprite.position;
    },
    getWidth: function () {
        return this.sprite.width;
    },
    getHeight: function () {
        return this.sprite.height;
    },
    collideWithDynamic: function (other, response) {

    },
    collideWithStatic: function (other, response) {

    },
    containsPoint: function (x, y) {
        this.containedPoint.x = x;
        this.containedPoint.y = y;
        return SAT.pointInPolygon(this.containedPoint, this.collisionPolygon);
    },
    destroy: function () {
        A_.game.tilesToDestroy.push(this);
    },
    update: function () {

    },
    // BUG: Works only with non baked layers
    isOnScreen: function () {
        var bounds = this.sprite.getBounds();
        var view = A_.renderer.view;

        if (bounds.x + bounds.width < 0)
            return false;
        if (bounds.x > view.width)
            return false;
        if (bounds.y + bounds.height < 0)
            return false;
        if (bounds.y > view.height)
            return false;

        return true;
    }
});

A_.TILES.Tile.inject(A_.COLLISION.aabbInjection);
A_.TILES.Tile.inject(A_.INPUT.mouseReactivityInjection);