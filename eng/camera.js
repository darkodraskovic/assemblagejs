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

        if (!this.followType) {
            this.followType = "centered";
        }
        
        if (!this.innerBoundOffset) {
            this.innerBoundOffset = 0.25;
        }
        this.innerBounds = {};
        this.setInnerBounds(this.innerBoundOffset);
    },
    setInnerBounds: function (innerBoundOffset) {
        this.innerBoundOffset = innerBoundOffset;
        this.innerBounds.left = innerBoundOffset;
        this.innerBounds.right = 1 - innerBoundOffset;
        this.innerBounds.top = innerBoundOffset;
        this.innerBounds.bottom = 1 - innerBoundOffset;
    },
    getInnerBound: function (edge) {
        switch (edge) {
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
        var followee = this.followee;
        
        if (followee.getX() < this.getInnerBound("left"))
        {
            this.x = followee.getX() - this.width * this.innerBounds.left;
        }
        if (followee.getY() < this.getInnerBound("top"))
        {
            this.y = followee.getY() - this.height * this.innerBounds.top;
        }
        if (followee.getX() > this.getInnerBound("right"))
        {
            this.x = followee.getX() - this.width * this.innerBounds.right;
        }
        if (followee.getY() > this.getInnerBound("bottom"))
        {
            this.y = followee.getY() - this.height * this.innerBounds.bottom;
        }
    },
    followCentered: function () {
        this.x = this.followee.getX() - this.width / 2;
        this.y = this.followee.getY() - this.height / 2;
    },
    centerOn: function (center) {
        this.x = center.getX() - this.width / 2;
        this.y = center.getY() - this.height / 2;
    },
    bind: function () {
        if (this.x < 0)
        {
            this.x = 0;
        }
        if (this.y < 0)
        {
            this.y = 0;
        }
        var level = this.level;
        if (this.x + this.width > level.getWidth())
        {
            this.x = level.getWidth() - this.width;
        }
        if (this.y + this.height > level.getHeight())
        {
            this.y = level.getHeight() - this.height;
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
    }
});
