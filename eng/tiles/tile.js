A_.TILES.Tile = Class.extend({
    init: function(gid, x, y, tilemap) {
        this.gid = gid;
        this.mapPosition = {};
        this.mapPosition.x = x;
        this.mapPosition.y = y;
        this.tilemap = tilemap;
        this.w = tilemap.tileW;
        this.h = tilemap.tileH;
        this.containedPoint = new SAT.Vector(0, 0);
        this.createSprite();
        if (this.tilemap.collision) {
            this.initCollision();
        }
    },
    createSprite: function() {
        var frameInd = this.gid - 1;
        var tm = this.tilemap;
        var frame = new PIXI.Rectangle((frameInd % tm.imgCols) * tm.tileW,
                Math.floor(frameInd / tm.imgCols) * tm.tileH, tm.tileW, tm.tileH);
        var tileTexture = new PIXI.Texture(tm.baseTexture, frame);
        this.sprite = new PIXI.Sprite(tileTexture);
    },
    initCollision: function() {
        this.collides = true;

        var collisionPolygon;
        var box = new SAT.Box(new SAT.Vector(0, 0), this.w, this.h);
        collisionPolygon = box.toPolygon();
        collisionPolygon.w = box.w;
        collisionPolygon.h = box.h;
        this.collisionPolygon = collisionPolygon;
        this.collisionPolygon.pos.x = this.getX();
        this.collisionPolygon.pos.y = this.getY();

        this.collision = this.tilemap.collision;
        if (this.collision.response === "sensor") {
            A_.collider.collisionDynamics.push(this);
        }
        else {
            A_.collider.collisionStatics.push(this);
        }

//        A_.COLLISION.addABB(this);
    },
    moveToLayer: function(layer) {
        layer.addChild(this.sprite);
    },
    setPosition: function(x, y) {
        this.sprite.position.x = x;
        this.sprite.position.y = y;
        if (this.collisionPolygon) {
            this.collisionPolygon.pos.x = x;
            this.collisionPolygon.pos.y = y;
        }
    },
    getX: function() {
        return this.sprite.position.x;
    },
    getY: function() {
        return this.sprite.position.y;
    },
    getPosition: function() {
        return this.sprite.position;
    },
    getWidth: function() {
        return this.w;
    },
    getHeight: function() {
        return this.h;
    },
    collideWithDynamic: function(other, response) {

    },
    collideWithStatic: function(other, response) {

    },
    containsPoint: function(x, y) {
        this.containedPoint.x = x;
        this.containedPoint.y = y;
        return SAT.pointInPolygon(this.containedPoint, this.collisionPolygon);
    },
    destroy: function() {
        A_.game.tilesToDestroy.push(this);
    },
    update: function() {

    }
});

A_.TILES.Tile.inject(A_.COLLISION.abbInjection);
A_.TILES.Tile.inject(A_.INPUT.mouseReactivityInjection);