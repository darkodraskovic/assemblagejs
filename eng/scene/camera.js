DODO.Camera = DODO.Class.extend({
    init: function (scene, w, h, props) {
        this.scene = scene;
        this.width = w;
        this.height = h;
        this.x = 0;
        this.y = 0;

        this.worldBounded = (props && props.worldBounded) || false;
        this.followType = (props && props.followType) || "centered";
        this.setInnerBounds((props && props.innerBoundOffset) || 0.25);
    },
    setInnerBounds: function (innerBoundOffset) {
        this.innerBounds = this.innerBounds || {};
        this.innerBounds.left = innerBoundOffset;
        this.innerBounds.right = 1 - innerBoundOffset;
        this.innerBounds.top = innerBoundOffset;
        this.innerBounds.bottom = 1 - innerBoundOffset;
    },
    setFollowee: function (followee) {
        this.followee = followee;
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
        
        if (followee.position.x < this.getInnerBound("left"))
        {
            this.x = followee.position.x - this.width * this.innerBounds.left;
        }
        if (followee.position.y < this.getInnerBound("top"))
        {
            this.y = followee.position.y - this.height * this.innerBounds.top;
        }
        if (followee.position.x > this.getInnerBound("right"))
        {
            this.x = followee.position.x - this.width * this.innerBounds.right;
        }
        if (followee.position.y > this.getInnerBound("bottom"))
        {
            this.y = followee.position.y - this.height * this.innerBounds.bottom;
        }
    },
    followCentered: function () {
        this.x = this.followee.position.x - this.width / 2;
        this.y = this.followee.position.y - this.height / 2;
    },
    centerOn: function (center) {
        this.x = center.position.x - this.width / 2;
        this.y = center.position.y - this.height / 2;
    },
    bound: function () {
        var sceneW = this.scene.getWidth();
        var sceneH = this.scene.getHeight();
        
        if (this.x + this.width > sceneW)
        {
            this.x = sceneW - this.width;
        }
        if (this.x < 0)
        {
            this.x = 0;
        }
        if (this.y + this.height > sceneH)
        {
            this.y = sceneH - this.height;
        }
        if (this.y < 0)
        {
            this.y = 0;
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
            this.bound();
        }
    }
});
