A_.CAMERA.Camera = Class.extend({
    init: function (w, h, props) {
        for (var prop in props) {
            this[prop] = props[prop];
        }

        this.x = 0;
        this.y = 0;
        this.width = w;
        this.height = h;

        if (!this.worldBounded) {
            this.worldBounded = false;
        }

        if (!this.followee) {
            this.followee = null;
        }

        if (!this.followType) {
            this.followType = "centered";
        }
        
        if (!this.innerBoundOffset) {
            this.innerBoundOffset = 0.25;
        }
        this.innerBounds = {};        
        this.innerBounds.left = this.innerBoundOffset;
        this.innerBounds.right = 1 - this.innerBoundOffset;
        this.innerBounds.top = this.innerBoundOffset;
        this.innerBounds.bottom = 1 - this.innerBoundOffset;
    },
    getInnerBound: function (side) {
        switch (side) {
            case "left":
                return this.x + (this.width * this.innerBounds.left);
                break;
            case "right":
                return this.x + (this.width * this.innerBounds.right);
                break;
            case "top":
                return this.y + (this.height * this.innerBounds.top);
                break;
            case "bottom":
                return this.y + (this.height * this.innerBounds.bottom);
                break;
            default:
                break;
        }
    },
    followBounded: function () {
        var bounds = {};
        var colPol = this.followee.collisionPolygon;
        bounds.x = colPol.pos.x;
        bounds.y = colPol.pos.y;
        bounds.width = colPol.w;
        bounds.height = colPol.h;

        if (bounds.x < this.getInnerBound("left"))
        {
            this.x = bounds.x - this.width * this.innerBounds.left;
        }
        if (bounds.y < this.getInnerBound("top"))
        {
            this.y = bounds.y - this.height * this.innerBounds.top;
        }
        if (bounds.x + bounds.width > this.getInnerBound("right"))
        {
            this.x = bounds.x + bounds.width - this.width * this.innerBounds.right;
        }
        if (bounds.y + bounds.height > this.getInnerBound("bottom"))
        {
            this.y = bounds.y + bounds.height - this.height * this.innerBounds.bottom;
        }
    },
    followCentered: function () {
        var pos = this.followee.getPosition();
        this.x = pos.x - this.width / 2;
        this.y = pos.y - this.height / 2;
    },
    centerOn: function (center) {
        this.x = center.x - this.width / 2;
        this.y = center.y - this.height / 2;
    },
    bind: function () {
        if (this.x < A_.level.x)
        {
            this.x = A_.level.x;
        }
        if (this.y < A_.level.y)
        {
            this.y = A_.level.y;
        }
        if (this.x + this.width > A_.level.x + A_.level.width)
        {
            this.x = A_.level.x + A_.level.width - this.width;
        }
        if (this.y + this.height > A_.level.y + A_.level.height)
        {
            this.y = A_.level.y + A_.level.height - this.height;
        }
    },
    update: function () {
        if (this.followee) {
            if (this.followType === "centered") {
                this.followCentered();
            }
            else if (this.followType === "bounded") {
                this.followBounded();
            }
        }

        if (this.worldBounded) {
            this.bind();
        }

        var campPos = {x: this.x, y: this.y};
        A_.level.container.position.x = -campPos.x;
        A_.level.container.position.y = -campPos.y;

        for (var i = 0; i < A_.level.container.children.length; i++) {
            var layer = A_.level.container.children[i];
            layer.position.x = campPos.x * layer.parallax / 100 - campPos.x;
            layer.position.y = campPos.y * layer.parallax / 100 - campPos.y;
        }
    }
});
