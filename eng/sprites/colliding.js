A_.SPRITES.Colliding = A_.SPRITES.Animated.extend({
    collides: true,
    drawCollisionPolygon: true,
    collisionResponse: "static",
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        this.response = new SAT.Response();
        this._vector = new SAT.Vector();

        if (this.drawCollisionPolygon && A_.game.debug) {
            this.debugGraphics = new A_.SPRITES.Graphics(this, 0, 0);
        }

        this.setCollisionPolygon(this.createCollisionPolygon(this.polygon));
        this.synchCollisionPolygon();
    },
    setCollisionPolygon: function(polygon) {
        this.collisionPolygon = polygon;
        if (this.drawCollisionPolygon && A_.game.debug)
            A_.POLYGON.Utils.drawPolygon(this.debugGraphics.sprite, this.collisionPolygon.PIXIPolygon, this.polygonStyle);
    },
    resetCollisionData: function() {
        this.collisionWidth = this.collisionHeight = this.collisionOffsetX = this.collisionOffsetY = 0;
    },
    createCollisionPolygon: function(polygon) {
        if (!_.isNumber(this.collisionWidth))
            this.collisionWidth = this.getWidth();
        if (!_.isNumber(this.collisionHeight))
            this.collisionHeight = this.getHeight();
        if (!_.isNumber(this.collisionOffsetX))
            this.collisionOffsetX = 0;
        if (!_.isNumber(this.collisionOffsetY))
            this.collisionOffsetY = 0;

        var collisionPolygon;

        if (!polygon) {
            var box = new A_.POLYGON.Box(new SAT.Vector(0, 0), this.collisionWidth, this.collisionHeight);
            collisionPolygon = box.toPolygon();
        } else {
            collisionPolygon = polygon;
        }
        collisionPolygon.setOffset(new SAT.Vector(this.collisionOffsetX, this.collisionOffsetY));
        collisionPolygon.calcBounds();

//        if (this.getMouseReactivity())
//            this.sprite.hitArea = A_.POLYGON.Utils.SATPolygonToPIXIPolygon(collisionPolygon, false);

        if (this.drawCollisionPolygon && A_.game.debug) {
            collisionPolygon.PIXIPolygon = A_.POLYGON.Utils.SATPolygonToPIXIPolygon(collisionPolygon);
        }

        return collisionPolygon;
    },
    collidesWithEntity: function(other) {
        this.response.clear();
        return (SAT.testPolygonPolygon(this.collisionPolygon, other.collisionPolygon, this.response));
    },
    collidesWithEntityAtOffset: function(other, offsetX, offsetY) {
        this.response.clear();
        this.collisionPolygon.translate(offsetX, offsetY);
        var collides = SAT.testPolygonPolygon(this.collisionPolygon, other.collisionPolygon, this.response);
        this.collisionPolygon.translate(-offsetX, -offsetY);
        return collides;
    },
    containsPoint: function(x, y) {
        this._vector.x = x;
        this._vector.y = y;
        return SAT.pointInPolygon(this._vector, this.collisionPolygon);
    },
//    TRANSFORMATIONS
    setScale: function(x, y) {
        this._super(x, y);
        this.collisionPolygon.setScale(x, y);
    },
    setScaleX: function(x) {
        this._super(x);
        this.collisionPolygon.setScaleX(x);
    },
    setScaleY: function(y) {
        this._super(y);
        this.collisionPolygon.setScaleY(y);
    },
    setSize: function(x, y) {
        this._super(x, y);
        this.collisionPolygon.setScale(this.getScaleX(), this.getScaleY());
    },
    setWidth: function(w) {
        this._super(w);
        this.collisionPolygon.setScaleX(this.getScaleX());
    },
    setHeight: function(h) {
        this._super(h);
        this.collisionPolygon.setScaleY(this.getScaleY());
    },
    setOrigin: function(x, y) {
        var delta = this._super(x, y);
        var colPol = this.collisionPolygon;

        colPol.translate(delta[0] * Math.sign(colPol.scale.x), delta[1]* Math.sign(colPol.scale.y));
        colPol.calcBounds();
    },
    synchCollisionPolygon: function() {
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
    },
    // UTILS
    aabbWidth: function() {
        return this.collisionPolygon.getWidth();
    },
    aabbHeight: function() {
        return this.collisionPolygon.getHeight();
    },
    aabbBottom: function() {
        return this.collisionPolygon.getBottom();
    },
    aabbTop: function() {
        return this.collisionPolygon.getTop();
    },
    aabbLeft: function() {
        return this.collisionPolygon.getLeft();
    },
    aabbRight: function() {
        return this.collisionPolygon.getRight();
    },
    aabbCenterX: function() {
        return this.collisionPolygon.getCenterX();
    },
    aabbCenterY: function() {
        return this.collisionPolygon.getCenterY();
    },
    aabbOverlapsSegment: function(axis, a, b) {
        if (axis === "y") {
            return (this.aabbTop() < b && this.aabbBottom() > a);
        } else if (axis === "x") {
            return (this.aabbLeft() < b && this.aabbRight() > a);
        }
    },
    aabbOverlapsEntity: function(entity) {
        return (this.aabbTop() < entity.aabbBottom() && this.aabbBottom() > entity.aabbTop()
                && this.aabbLeft() < entity.aabbRight() && this.aabbRight() > entity.aabbLeft());
    }
});
