function makeCamera(width, height, innerBoundOffset) {
    var camera = {};

    camera.x = 0;
    camera.y = 0;
    camera.width = width;
    camera.height = height;

    camera.innerBoundOffset = {};
    camera.innerBoundOffset.left = innerBoundOffset;
    camera.innerBoundOffset.right = 1 - innerBoundOffset;
    camera.innerBoundOffset.top = innerBoundOffset;
    camera.innerBoundOffset.bottom = 1 - innerBoundOffset;

    camera.followee = null;
    camera.followType = "centered";
    camera.worldBounded = false;
    camera.clickDelta = {};

    camera.getInnerBound = function (side) {
        switch (side) {
            case "left":
                return this.x + (this.width * this.innerBoundOffset.left);
                break;
            case "right":
                return this.x + (this.width * this.innerBoundOffset.right);
                break;
            case "top":
                return this.y + (this.height * this.innerBoundOffset.top);
                break;
            case "bottom":
                return this.y + (this.height * this.innerBoundOffset.bottom);
                break;
            default:
                break;

        }
    };

    camera.followBounded = function () {
        var bounds = {};
        var colPol = this.followee.collisionPolygon;
        bounds.x = colPol.pos.x;
        bounds.y = colPol.pos.y;
        bounds.width = colPol.w;
        bounds.height = colPol.h;

        if (bounds.x < this.getInnerBound("left"))
        {
            this.x = bounds.x - this.width * this.innerBoundOffset.left;
        }
        if (bounds.y < this.getInnerBound("top"))
        {
            this.y = bounds.y - this.height * this.innerBoundOffset.top;
        }
        if (bounds.x + bounds.width > this.getInnerBound("right"))
        {
            this.x = bounds.x + bounds.width - this.width * this.innerBoundOffset.right;
        }
        if (bounds.y + bounds.height > this.getInnerBound("bottom"))
        {
            this.y = bounds.y + bounds.height - this.height * this.innerBoundOffset.bottom;
        }
    };

    camera.followCentered = function () {
        var pos = this.followee.getPosition();
        camera.x = pos.x - camera.width / 2;
        camera.y = pos.y - camera.height / 2;
    };

    camera.centerOn = function (center) {
        camera.x = center.x - camera.width / 2;
        camera.y = center.y - camera.height / 2;
    };

    camera.bound = function () {
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
    };

    camera.update = function () {
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

        var campPos = {x: this.x, y: this.y};
        A_.level.container.position.x = -campPos.x;
        A_.level.container.position.y = -campPos.y;
        
        for (var i = 0; i < A_.level.container.children.length; i++) {
            var layer = A_.level.container.children[i];
            layer.position.x = campPos.x * layer.parallax / 100 - campPos.x;
            layer.position.y = campPos.y * layer.parallax / 100 - campPos.y;
        }
    };

    return camera;
}
