DODO.SpritePoint = Class.extend({
    init: function(parent, name, x, y) {
        this.parent = parent;
        this.name = name;
        this.point = new SAT.Vector(x, y);
        this.calcPoint = new SAT.Vector(x, y);
        this.rotation = 0;
        this._position = {x:0, y: 0};
    },
    getPosition: function() {
        this._position.x = this.getX();
        this._position.y = this.getY();
        return this._position;
    },
    getX: function() {
        return this.calcPoint.x + this.parent.getX();
    },
    getY: function() {
        return this.calcPoint.y + this.parent.getY();
    },
    setRotation: function(rotation) {
        this.calcPoint.rotate(rotation - this.rotation);
        this.rotation = rotation;
    },
    setScale: function(xScale, yScale) {
        this.calcPoint.x = this.point.x * xScale;
        this.calcPoint.y = this.point.y * yScale;
        this.calcPoint.rotate(this.rotation);
    },
    translate: function (x, y) {
        this.point.x += x;
        this.point.y += y;
        // this.setScale() applies a combination of scale & rotation
        this.setScale(this.parent.getScaleX(), this.parent.getScaleY());
    }
});