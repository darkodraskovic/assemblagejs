DODO.Colliding = DODO.Textured.extend({
    collides: true,
    drawCollisionPolygon: true,
    collisionResponse: "static",
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        this.response = new SAT.Response();
        if (this.drawCollisionPolygon) {
            this.debugGraphics = new DODO.Graphics(this, 0, 0);
        }
        this.setCollisionPolygon(this.polygon);
    },
    setCollisionPolygon: function(polygon) {
        this.collisionPolygon = polygon || this.createCollisionBox();
	this.drawCollisionPolygon && this.drawCollision();

	//        if (this.getMouseReactivity())
	//            this.sprite.hitArea = DODO.SATPolygonToPIXIPolygon(this.collisionPolygon, false);
	
	this.synchCollisionPolygon();
    },
    setCollisionSize: function(w, h) {
	var colPol = this.collisionPolygon;
	var prevScaleX = colPol.scale.x;
	var prevScaleY = colPol.scale.y;
	var relX = (w / this.aabbWidth()) * prevScaleX;
	var relY = (h / this.aabbHeight()) * prevScaleY;
	colPol.setScale(relX, relY);
	colPol.scale.x = prevScaleX;
	colPol.scale.y = prevScaleY;
	if (this.drawCollisionPolygon) {
	    colPol.setScale(1, 1);
	    this.drawCollision();
	    this.debugGraphics.scale.set(prevScaleX, prevScaleY);
	    colPol.setScale(prevScaleX, prevScaleY);
	    this.debugGraphics.position.set(colPol.offset.x, colPol.offset.y);
	}
    },
    setCollisionOffset: function (x, y, relative) {
	var colPol = this.collisionPolygon;
	if (relative)
	    x += colPol.offset.x, y += colPol.offset.y;
	colPol.setOffset(new SAT.Vector(x, y));
        colPol.calcBounds();
	if (this.drawCollisionPolygon) {
	    this.debugGraphics.position.set(x, y);
	}
    },
    drawCollision: function (){
	this.collisionPolygon.PIXIPolygon = DODO.SATPolygonToPIXIPolygon(this.collisionPolygon);
	DODO.drawPolygon(this.debugGraphics.sprite, this.collisionPolygon.PIXIPolygon, this.polygonStyle);
    },
    createCollisionBox: function() {
            var box = new DODO.Box(new SAT.Vector(0, 0), this.width, this.height);
            return box.toPolygon();
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
