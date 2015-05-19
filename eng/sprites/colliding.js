DODO.Colliding = DODO.Textured.extend({
    collides: true,
    drawCollisionPolygon: true,
    collisionResponse: "static",
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        this.response = new SAT.Response();
        this.collisionPolygon = this.polygon || new DODO.Box(new SAT.Vector(0, 0), this.width, this.height);
        delete this.polygon;
        this.drawCollisionPolygon && this.drawCollision();
        //        if (this.getMouseReactivity())
        //            this.container.hitArea = DODO.SATPolygonToPIXIPolygon(this.collisionPolygon, false);
        this.synchCollisionPolygon();
    },
    setCollisionSize: function (w, h) {
        var colPol = this.collisionPolygon;
        if (w * colPol.scale.x === this.aabbWidth() && h * colPol.scale.x === this.aabbHeight())
            return;
        var prevScaleX = colPol.scale.x;
        var prevScaleY = colPol.scale.y;
        var relX = (w / this.aabbWidth()) * prevScaleX;
        var relY = (h / this.aabbHeight()) * prevScaleY;
        colPol.setScale(relX, relY);
        colPol.scale.x = prevScaleX;
        colPol.scale.y = prevScaleY;
        if (this.debugGraphics) {
            colPol.setScale(1, 1);
            this.debugGraphics.scale.set(1, 1);
            this.drawCollision();
            this.debugGraphics.scale.set(prevScaleX, prevScaleY);
            colPol.setScale(prevScaleX, prevScaleY);
            this.debugGraphics.position.set(colPol.offset.x, colPol.offset.y);
        }
    },
    setCollisionOffset: function (x, y) {
        var colPol = this.collisionPolygon;
        colPol.setOffset(new SAT.Vector(x * colPol.scale.x, y * colPol.scale.y));
        colPol.calcBounds();
        if (this.debugGraphics) {
            // FIX ME
            this.debugGraphics.position.set(x, y);
        }
    },
    drawCollision: function () {
        this.debugGraphics = this.debugGraphics || new DODO.Graphics(this, 0, 0);
        this.collisionPolygon.PIXIPolygon = DODO.SATPolygonToPIXIPolygon(this.collisionPolygon);
        DODO.drawPolygon(this.debugGraphics.container, this.collisionPolygon.PIXIPolygon, this.polygonStyle);
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
        this._vector.x = x;
        this._vector.y = y;
        return SAT.pointInPolygon(this._vector, this.collisionPolygon);
    },
    synchCollisionPolygon: function () {
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
    setAnchor: function (x, y) {
        var delta = this._super(x, y);
        this.collisionPolygon.translate(-delta[0] * this.scale.x, -delta[1] * this.scale.y);
//        this.collisionPolygon.setOffset(new SAT.Vector(-delta[0] * this.scale.x, -delta[1] * this.scale.y));
        this.collisionPolygon.calcBounds();
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
