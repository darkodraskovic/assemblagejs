var Computer = A_.SPRITES.Kinematic.extend({
    bounded: false,
    spriteSheet: "diskette/computer.png",
    collisionResponse: "sensor",
    drawCollisionPolygon: true,
    collisionWidth: 38,
    collisionOffsetX: 16,
    collisionOffsetY: 4,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.setZ("bottom");
    },
    update: function () {       
        // this._super();
    },
    getSlotY: function () {
        return this.getY() + 27;
    },
    getSlotX: function () {
        return this.getX() + this.collisionOffsetX;
    }
});