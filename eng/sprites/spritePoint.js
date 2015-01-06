A_.SPRITES.SpritePoint = Class.extend({
    init: function(name, x, y) {
        this.name = name;
        this.origPoint = new SAT.Vector(x, y);
        // .point refers to the position in the sprite's local coordinate system.
        this.point = new SAT.Vector(x, y);
        // .calcPoint refers to the position in the sprite's parent coordinate system.
        this.calcPoint = new SAT.Vector(x, y);
    },
    position: function(x, y) {
        if (_.isNumber(x) && _.isNumber(y)) {
            this.calcPoint.x = x + this.point.x;
            this.calcPoint.y = y + this.point.y;
        }
        else
            return this.calcPoint;
    },
    rotation: function(rotation) {
        if (_.isNumber(rotation)) {
            // Calculate the vector from the point to the rotated point.
            var rotVec = this.point.clone().rotate(rotation).sub(this.point);
            // Add the vector to the position in the parent's coord sys.
            this.calcPoint.add(rotVec);
        } else
            return this.rotation;
    },
    scale: function(x, y) {
        if (_.isNumber(x) && _.isNumber(y)) {
            this.point.x *= x;
            this.point.y *= y;
        } else
            return;
    },
    x: function(x) {
        if (_.isNumber(x))
            this.calcPoint.x = x;
        else
            return this.calcPoint.x;
    },
    y: function(y) {
        if (_.isNumber(y))
            this.calcPoint.y = y;
        else
            return this.calcPoint.y;
    }
});