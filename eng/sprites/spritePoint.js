A_.SPRITES.SpritePoint = Class.extend({
    init: function(name, x, y) {
        this.name = name;
        this.origPoint = new SAT.Vector(x, y);
        // .point refers to the position in the sprite's local coordinate system.
        this.point = new SAT.Vector(x, y);
        // .calcPoint refers to the position in the sprite's parent coordinate system.
        this.calcPoint = new SAT.Vector(x, y);
    },
    setPosition: function(x, y) {
        this.calcPoint.x = x + this.point.x;
        this.calcPoint.y = y + this.point.y;
    },
    getPosition: function() {
        return this.calcPoint;
    },
    setX: function(x) {
        this.calcPoint.x = x;
    },
    getX: function() {
        return this.calcPoint.x;
    },
    setY: function(y) {
        this.calcPoint.y = y;
    },
    getY: function() {
        return this.calcPoint.y;
    },
    setRotationRelative: function(rotation) {
        // Calculate the vector from the point to the rotated point.
//        var rotVec = this.point.clone().rotate(rotation).sub(this.point);
        var rotVec = this.point.clone().rotate(rotation).sub(this.point);
        // Add the vector to the position in the parent's coord sys.
//        this.calcPoint.add(rotVec);
        this.point.add(rotVec);
    },
//    getRotation: function() {
//        return this.rotation;
//    },
    setScale: function(x, y) {
        this.point.x *= x;
        this.point.y *= y;
    },
    setScaleX: function(x) {
        this.point.x *= x;
    },
    setScaleY: function(y) {
        this.point.y *= y;
    }
});