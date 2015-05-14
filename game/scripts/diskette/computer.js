var Computer = DODO.Kinematic.extend({
    bounded: false,
    spriteSheet: "Diskette/computer.png",
    collisionResponse: "sensor",
    drawCollisionPolygon: true,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.setZ("bottom");
	this.setCollisionSize(38, this.aabbHeight());
	this.setCollisionOffset(16, 4);
    },
    getSlotX: function () {
        return this.position.x + this.collisionOffsetX;
    },
    getSlotY: function () {
        return this.position.y + 27;
    }
});
