A_.SPRITES.Colliding = A_.SPRITES.Sprite.extend({
    collides: true,
    drawCollisionPolygon: true,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.initCollision(this.collisionPolygon);
        this.containedPoint = new SAT.Vector(0, 0);
        this.response = new SAT.Response();

        this._delta = new SAT.Vector();
        this.synchCollisionPolygon();
    },
    createCollisionPolygon: function (polygon) {
        if (!this.collisionPolygons) {
            this.collisionPolygons = [];
        }
        if (!_.isNumber(this.collisionWidth))
            this.collisionWidth = this.getWidth();
        if (!_.isNumber(this.collisionHeight))
            this.collisionHeight = this.getHeight();
        if (!_.isNumber(this.collisionOffsetX))
            this.collisionOffsetX = 0;
        if (!_.isNumber(this.collisionOffsetY))
            this.collisionOffsetY = 0;

        var w = this.collisionWidth;
        var h = this.collisionHeight;

        var offsetX = this.collisionOffsetX;
        var offsetY = this.collisionOffsetY;

        var collisionPolygon;

        if (!polygon) {
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

        this.collisionPolygons.push(collisionPolygon);

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
        this.setCollisionDebug();
    },
    resetCollisionResponse: function (collisionResponse) {
        this.removeCollisionResponse();
        this.collisionResponse = collisionResponse;
        this.setCollisionResponse();
    },
    setCollisionDebug: function () {
        if (this.drawCollisionPolygon && A_.game.debug) {
            this.collisionPolygon.baked = A_.POLYGON.Utils.SATPolygonToPIXIPolygon(this.collisionPolygon, false);
            this.debugGraphics = new PIXI.Graphics();
            this.level.debugLayer.addChild(this.debugGraphics);
            A_.POLYGON.Utils.drawSATPolygon(this.debugGraphics, this.collisionPolygon, this.collisionPolygonStyle);
        }
    },
    removeCollision: function () {
        this.removeCollisionDebug();
        this.destroyCollisionPolygon(this.collisionPolygon);
    },
    removeCollisionDebug: function () {
        if (this.debugGraphics) {
            this.level.debugLayer.removeChild(this.debugGraphics);
            this.debugGraphics = null;
        }
    },
    updateDebug: function () {
        // Update debug transform
        var debugGraphics = this.debugGraphics;
        var colPol = this.collisionPolygon;
        debugGraphics.position.x = colPol.pos.x;
        debugGraphics.position.y = colPol.pos.y;
        debugGraphics.rotation = colPol.angle;
        debugGraphics.scale = colPol.scale;
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
        var colPol = this.collisionPolygon;

        this._delta.x = delta[0] + colPol.offset.x;
        this._delta.y = delta[1] + colPol.offset.y;
        colPol.setOffset(this._delta);

        if (this.debugGraphics) {
            this.debugGraphics.pivot.x -= delta[0] / colPol.scale.x;
            this.debugGraphics.pivot.y -= delta[1] / colPol.scale.y;
        }
    },
    synchCollisionPolygon: function () {
        var colPol = this.collisionPolygon;

        // Synch position.
        colPol.pos.x = this.position.x;
        colPol.pos.y = this.position.y;

        // Synch scale.
//        if (this.scale.x !== colPol.scale.x) {
//            this.collisionPolygon.setScaleX(this.scale.x);
//        }
//        if (this.scale.y !== colPol.scale.y) {
//            this.collisionPolygon.setScaleY(this.scale.y);
//        }

        // Synch rotation.
        if (this.getRotation() !== colPol.angle)
            colPol.setAngle(this.getRotation());

        if (this.debugGraphics) {
            this.updateDebug();
        }
    },
    removeFromLevel: function () {
        this.removeCollision();
        this._super();
    },
    // UTILS
    aabbWidth: function () {
        return this.collisionPolygon.getWidth();
    },
    aabbHeight: function () {
        return this.collisionPolygon.getHeight();
    },
    aabbBottom: function () {
        return this.collisionPolygon.getBottom();
    },
    aabbTop: function () {
        return this.collisionPolygon.getTop();
    },
    aabbLeft: function () {
        return this.collisionPolygon.getLeft();
    },
    aabbRight: function () {
        return this.collisionPolygon.getRight();
    },
    aabbCenterX: function () {
        return this.collisionPolygon.getCenterX();
    },
    aabbCenterY: function () {
        return this.collisionPolygon.getCenterY();
    },
    aabbOverlapsSegment: function (axis, a, b) {
        if (axis === "y") {
            return (this.aabbTop() < b && this.aabbBottom() > a);
        } else if (axis === "x") {
            return (this.aabbLeft() < b && this.aabbRight() > a);
        }
    },
    aabbOverlapsEntity: function (entity) {
        return (this.aabbTop() < entity.aabbBottom() && this.aabbBottom() > entity.aabbTop()
                && this.aabbLeft() < entity.aabbRight() && this.aabbRight() > entity.aabbLeft());
    }
});
