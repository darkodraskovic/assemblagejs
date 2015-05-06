DODO.Colliding = DODO.Animated.extend({
    collides: true,
    drawCollisionPolygon: true,
    collisionResponse: "static",
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        this.response = new SAT.Response();
        if (this.drawCollisionPolygon) {
            this.debugGraphics = new DODO.Graphics(this, 0, 0);
        }
        this.setCollisionPolygon(this.createCollisionPolygon(this.polygon));
    },
    setCollisionPolygon: function(polygon) {
        this.collisionPolygon = polygon;
        if (this.drawCollisionPolygon)
            DODO.drawPolygon(this.debugGraphics.sprite, this.collisionPolygon.PIXIPolygon, this.polygonStyle);
        this.synchCollisionPolygon();
    },
    resetCollisionData: function() {
        this.collisionWidth = this.collisionHeight = this.collisionOffsetX = this.collisionOffsetY = 0;
    },
    createCollisionPolygon: function(polygon) {
        if (!_.isNumber(this.collisionWidth))
            this.collisionWidth = this.width;
        if (!_.isNumber(this.collisionHeight))
            this.collisionHeight = this.height;
        if (!_.isNumber(this.collisionOffsetX))
            this.collisionOffsetX = 0;
        if (!_.isNumber(this.collisionOffsetY))
            this.collisionOffsetY = 0;

        var collisionPolygon;

        if (!polygon) {
            var box = new DODO.Box(new SAT.Vector(0, 0), this.collisionWidth, this.collisionHeight);
            collisionPolygon = box.toPolygon();
        } else {
            collisionPolygon = polygon;
        }
        collisionPolygon.setOffset(new SAT.Vector(this.collisionOffsetX, this.collisionOffsetY));
        collisionPolygon.calcBounds();

//        if (this.getMouseReactivity())
//            this.sprite.hitArea = DODO.SATPolygonToPIXIPolygon(collisionPolygon, false);

        if (this.drawCollisionPolygon) {
            collisionPolygon.PIXIPolygon = DODO.SATPolygonToPIXIPolygon(collisionPolygon);
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
    synchCollisionPolygon: function() {
        var colPol = this.collisionPolygon;

        // Synch position.
        colPol.pos.x = this.position.x;
        colPol.pos.y = this.position.y;

        // Synch scale.
        if (this.scale.x !== colPol.scale.x) {
            this.collisionPolygon.setScaleX(this.scale.x);
        }
        if (this.scale.y !== colPol.scale.y) {
            this.collisionPolygon.setScaleY(this.scale.y);
        }

        // Synch rotation.
        if (this.rotation !== colPol.angle)
            colPol.setAngle(this.rotation);
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
