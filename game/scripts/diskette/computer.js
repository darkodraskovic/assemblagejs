var Computer = DODO.Kinematic.extend({
    bounded: false,
    spriteSheet: "Diskette/computer.png",
    collisionResponse: "sensor",
    drawCollisionPolygon: true,
    collisionWidth: 38,
    collisionOffsetX: 16,
    collisionOffsetY: 4,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.setZ("bottom");
    },
    getSlotX: function () {
        return this.position.x + this.collisionOffsetX;
    },
    getSlotY: function () {
        return this.position.y + 27;
    }
});