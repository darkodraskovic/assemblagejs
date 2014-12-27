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
        this.collides = true;
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
    interactive: function(interacts) {
        if (typeof interacts === "undefined")
            return this.sprite.interactive;
        if (interacts) {
            var that = this;
            if (!this.initedInput) {
                this.sprite.mousedown = function() {
//                    window.console.log("mousedown");
                    that.leftpressed = true;
                    that.leftdown = true;
                };
                this.sprite.mouseup = function() {
//                    window.console.log("mouseup");
                    that.leftreleased = true;
                    that.leftdown = false;
                };
                this.sprite.mouseupoutside = function() {
                    that.leftreleased = true;
                    that.leftdown = false;
                };
                this.sprite.rightdown = function() {
                    that.rightpressed = true;
                    that.rightdown = true;
                };
                this.sprite.rightup = function() {
                    that.rightreleased = true;
                    that.rightdown = false;
                };
                this.sprite.rightupoutside = function() {
                    that.rightreleased = true;
                    that.rightdown = false;
                };
                this.initedInput = true;
            }
            this.sprite.interactive = true;
        } else {
            this.sprite.interactive = false;
        }
    },
    x: function() {
        return this.sprite.position.x;
    },
    y: function() {
        return this.sprite.position.y;
    },
    position: function() {
        return this.sprite.position;
    },
    width: function() {
        return this.w;
    },
    height: function() {
        return this.h;
    },
    collideWithDynamic: function(other, response) {

    },
    containsPoint: function(x, y) {
        this.containedPoint.x = x;
        this.containedPoint.y = y;
        return SAT.pointInPolygon(this.containedPoint, this.collisionPolygon);
    },
    update: function() {

    }
});
