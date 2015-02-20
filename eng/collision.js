A_.COLLISION.Collider = Class.extend({
    init: function () {
        this.collisionSprites = [];
        this.collisionStatics = [];
        this.collisionKinematics = [];
        this.collisionMasks = [];
    }
});

A_.COLLISION.aabbInjection = {
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
};