A_.SPRITES.SpritePoint = Class.extend({
    init: function(name, x, y) {
        this.name = name;
        this.point = new SAT.Vector(x, y);
        this.calcPoint = new SAT.Vector(x, y);
        this.position = {x: 0, y: 0};
        this.scale = {x: 1, y: 1};
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
        this.scale.x = xScale;
        this.scale.y = yScale;
        this.calcPoint.x = this.point.x * xScale;
        this.calcPoint.y = this.point.y * yScale;
        this.calcPoint.rotate(this.rotation);
    },
    setPoint: function (x, y) {
        this.point.x = x;
        this.point.y = y;
        this.setScale(this.scale.x, this.scale.y);
    }
});