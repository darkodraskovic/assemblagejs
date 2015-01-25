A_.SPRITES.Colliding = A_.SPRITES.Animated.extend({
    collides: true,
    drawDebugGraphics: true,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.initCollision(this.collisionPolygon);
        this.containedPoint = new SAT.Vector(0, 0);
        this.response = new SAT.Response();
        this.offset = new SAT.Vector();
    },
    onCreation: function () {
        this._super();
    },
    createCollisionPolygon: function (polygon) {
        if (!this.collisionPolygons) {
            this.collisionPolygons = [];
        }
        if (!_.isNumber(this.collisionW))
            this.collisionW = this.getWidth();
        if (!_.isNumber(this.collisionH))
            this.collisionH = this.getHeight();
        if (!_.isNumber(this.collisionOffsetX))
            this.collisionOffsetX = 0;
        if (!_.isNumber(this.collisionOffsetY))
            this.collisionOffsetY = 0;

        var w = this.collisionW;
        var h = this.collisionH;

        var offsetX = this.collisionOffsetX;
        var offsetY = this.collisionOffsetY;

        var collisionPolygon;

        if (!polygon) {
//            offsetX -= w / 2;
//            offsetY -= h / 2;
            offsetX -= w * this.getOrigin().x;
            offsetY -= h * this.getOrigin().y;
            var box = new SAT.Box(new SAT.Vector(0, 0), w, h);
            collisionPolygon = box.toPolygon();
            // Get the with & height of the polygon's bounding box.
            collisionPolygon.calcSize();
        } else {
            collisionPolygon = polygon;
            offsetX += collisionPolygon.offset.x;
            offsetY += collisionPolygon.offset.y;
        }
        // NB: We offset the polygon so that the origin of its bounding box is 
        // in the top left corner of the sprite. 
        var offset = new SAT.Vector(offsetX, offsetY);
        collisionPolygon.setOffset(offset);

        collisionPolygon.origPoints = _.map(collisionPolygon.points, function (point) {
            return point.clone();
        });
        collisionPolygon.origOffset = collisionPolygon.offset.clone();
        collisionPolygon.origW = collisionPolygon.w;
        collisionPolygon.origH = collisionPolygon.h;

        collisionPolygon.scale = new SAT.Vector(1, 1);
        collisionPolygon.calcBounds();

//        if (this.interactive())
//            this.sprite.hitArea = A_.POLYGON.Utils.SATPolygonToPIXIPolygon(collisionPolygon, false);

//        collisionPolygon.baked = A_.POLYGON.Utils.SATPolygonToPIXIPolygon(collisionPolygon, false);

        this.collisionPolygons.push(collisionPolygon);

        delete this.collisionW;
        delete this.collisionH;
        delete this.collisionOffsetX;
        delete this.collisionOffsetY;

        return collisionPolygon;
    },
    destroyCollisionPolygon: function (collisionPolygon) {
        if (_.contains(this.collisionPolygons, collisionPolygon)) {
            this.collisionPolygons.splice(this.collisionPolygons.indexOf(collisionPolygon), 1);
        }
        if (this.collisionPolygon === collisionPolygon)
            this.collisionPolygon = null;
    },
    initCollision: function (polygon) {
        this.collisionPolygon = this.createCollisionPolygon(polygon);
        this.setCollisionResponse();
        this.setCollisionDebug();
    },
    setCollisionResponse: function () {
        var collider = A_.collider;

        if (!this.collisionResponse) {
            this.collisionResponse = "sensor";
            collider.collisionDynamics.push(this);
        } else {
            if (this.collisionResponse === "static")
                collider.collisionStatics.push(this);
            else
                collider.collisionDynamics.push(this);
        }
        collider.collisionSprites.push(this);
    },
    resetCollisionResponse: function (collisionResponse) {
        this.removeCollisionResponse();
        this.collisionResponse = collisionResponse;
        this.setCollisionResponse();
    },
    setCollisionDebug: function () {
        if (this.drawDebugGraphics && A_.game.debug) {
            this.debugGraphics = new PIXI.Graphics();
            A_.level.debugLayer.addChild(this.debugGraphics);
        }
    },
    removeCollision: function () {
        this.removeCollisionResponse();
        this.removeCollisionDebug();
        this.destroyCollisionPolygon(this.collisionPolygon)
    },
    removeCollisionResponse: function () {
        var collider = A_.collider;
        if (_.contains(collider.collisionSprites, this)) {
            collider.collisionSprites.splice(collider.collisionSprites.indexOf(this), 1);
        }
        if (_.contains(collider.collisionDynamics, this)) {
            collider.collisionDynamics.splice(collider.collisionDynamics.indexOf(this), 1);
        }
        if (_.contains(collider.collisionStatics, this)) {
            collider.collisionStatics.splice(collider.collisionStatics.indexOf(this), 1);
        }
    },
    removeCollisionDebug: function () {
        if (this.debugGraphics) {
            A_.level.debugLayer.removeChild(this.debugGraphics);
            this.debugGraphics = null;
        }
    },
    drawDebug: function () {
        var debugGraphics = this.debugGraphics;
        if (this.drawDebugGraphics && debugGraphics) {
            debugGraphics.clear();
            A_.POLYGON.Utils.drawSATPolygon(debugGraphics, this.collisionPolygon);
        }
    },
    collideWithStatic: function (other, response) {
        this.collided = true;

        if (this.collisionResponse !== "sensor") {
            this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
        }
    },
    collideWithDynamic: function (other, response) {
        this.collided = true;
    },
    collidesWithEntity: function (other) {
        this.response.clear();
        return (SAT.testPolygonPolygon(this.collisionPolygon, other.collisionPolygon, this.response));
    },
    collidesWithEntityAtOffset: function (other, offsetX, offsetY) {
        this.response.clear();
        this.collisionPolygon.translate(offsetX, offsetY);
        var collides = SAT.testPolygonPolygon(this.collisionPolygon, other.collisionPolygon, this.response);
        this.collisionPolygon.translate(-offsetX, -offsetY);
        return collides;
    },
    containsPoint: function (x, y) {
        this.containedPoint.x = x;
        this.containedPoint.y = y;
        return SAT.pointInPolygon(this.containedPoint, this.collisionPolygon);
    },
//    TRANSFORMATIONS
    setPosition: function (x, y) {
        this._super(x, y);
        this.collisionPolygon.pos.x = x;
        this.collisionPolygon.pos.y = y;
//        this.collisionPolygon.pos.x = this.getPositionLevel().x;
//        this.collisionPolygon.pos.y = this.getPositionLevel().y;

    },
    setX: function (x) {
        this._super(x);
        this.collisionPolygon.pos.x = x;
//        this.collisionPolygon.pos.x = this.getPositionLevel().x;
    },
    setY: function (y) {
        this._super(y);
        this.collisionPolygon.pos.y = y;
//        this.collisionPolygon.pos.y = this.getPositionLevel().y;
    },
    setRotation: function (n) {
        this._super(n);
        this.collisionPolygon.setAngle(n);
    },
    setScale: function (x, y) {
        this._super(x, y);
        this.collisionPolygon.setScale(x, y);
    },
    setScaleX: function (x) {
        this._super(x);
        this.collisionPolygon.setScaleX(x);
    },
    setScaleY: function (y) {
        this._super(y);
        this.collisionPolygon.setScaleY(y);
    },
    setSize: function (x, y) {
        this._super(x, y);
        this.collisionPolygon.setScale(this.getScaleX(), this.getScaleY());
    },
    setWidth: function (w) {
        this._super(w);
        this.collisionPolygon.setScaleX(this.getScaleX());
    },
    setHeight: function (h) {
        this._super(h);
        this.collisionPolygon.setScaleY(this.getScaleY());
    },
    setOrigin: function (x, y) {
        var delta = this._super(x, y);
        this.collisionPolygon.offset.x += delta[0];
        this.collisionPolygon.offset.y += delta[1];
        //            colPol.recalc();
    },
//    syncCollisionPolygon: function() {
//        if (this.getRotation() !== this.prevRot)
//            this.collisionPolygon.setAngle(this.getRotation());
//
//        this.collisionPolygon.pos.x = this.getX();
//        this.collisionPolygon.pos.y = this.getY();
//
//    },
//    syncSprite: function() {
//        if (this.getRotation() !== this.prevRot)
//            this.setRotation(this.collisionPolygon.angle);
//        
//        this.setPosition(this.collisionPolygon.pos.x, this.collisionPolygon.pos.y);
//    },
    clear: function () {
        this.removeCollision();
        this._super();
    }
});

A_.SPRITES.Colliding.inject(A_.COLLISION.aabbInjection);