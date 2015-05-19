DODO.Camera = DODO.Class.extend({
    init: function (scene, w, h, props) {
        this.scene = scene;
        this.width = w;
        this.height = h;
        this.position = {x: 0, y: 0};

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
        this.followee.bind('destroyed', this, function () {
            this.followee = null;
        });
    },
    getInnerBound: function (edge) {
        switch (edge) {
            case "left":
                return this.position.x + (this.width * this.innerBounds.left);
                break;
            case "right":
                return this.position.x + (this.width * this.innerBounds.right);
                break;
            case "top":
                return this.position.y + (this.height * this.innerBounds.top);
                break;
            case "bottom":
                return this.position.y + (this.height * this.innerBounds.bottom);
                break;
            default:
                break;
        }
    },
    followBounded: function () {
        var followee = this.followee;
        
        if (followee.position.x < this.getInnerBound("left"))
        {
            this.position.x = followee.position.x - this.width * this.innerBounds.left;
        }
        if (followee.position.y < this.getInnerBound("top"))
        {
            this.position.y = followee.position.y - this.height * this.innerBounds.top;
        }
        if (followee.position.x > this.getInnerBound("right"))
        {
            this.position.x = followee.position.x - this.width * this.innerBounds.right;
        }
        if (followee.position.y > this.getInnerBound("bottom"))
        {
            this.position.y = followee.position.y - this.height * this.innerBounds.bottom;
        }
    },
    followCentered: function () {
        this.position.x = this.followee.position.x - this.width / 2;
        this.position.y = this.followee.position.y - this.height / 2;
    },
    centerOn: function (center) {
        this.position.x = center.position.x - this.width / 2;
        this.position.y = center.position.y - this.height / 2;
    },
    bound: function () {
        var sceneW = this.scene.width;
        var sceneH = this.scene.height;
        
        if (this.position.x + this.width > sceneW)
        {
            this.position.x = sceneW - this.width;
        }
        if (this.position.x < 0)
        {
            this.position.x = 0;
        }
        if (this.position.y + this.height > sceneH)
        {
            this.position.y = sceneH - this.height;
        }
        if (this.position.y < 0)
        {
            this.position.y = 0;
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
        
        return this.position;
    }
});
