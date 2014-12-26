A_.SPRITES.Platformer = A_.SPRITES.Kinematic.extend({
    platformerState: "grounded",
    movingState: "idle",
    jumpForce: 500,
    bounciness: 0,
    controlled: false,
    facing: "right",
    autoFlip: true,
    init: function(layer, x, y, props) {
        this._super(layer, x, y, props);
        this.gravity = new SAT.Vector(0, 20);
        this.friction = new SAT.Vector(48, 0);
        this.maxVelocity = new SAT.Vector(300, 600);
        this.force = new SAT.Vector(100, 100);
        this.slope = null;
        this.scanDepth = 8;
        this.platform = null;
        this.platformDY = 0;

        if (this.controlled) {
            A_.INPUT.addMapping("left", A_.KEY.A);
            A_.INPUT.addMapping("right", A_.KEY.D);
            A_.INPUT.addMapping("jump", A_.KEY.SPACE);
        }
    },
    update: function() {
        if (this.controlled) {
            if (A_.INPUT.down["right"] || A_.INPUT.down["left"]) {
                this.applyForce = true;
                if (A_.INPUT.down["right"] && A_.INPUT.down["left"]) {
                    this.applyForce = false;
                }
                else if (A_.INPUT.down["right"]) {
                    this.facing = "right";
                }
                else if (A_.INPUT.down["left"]) {
                    this.facing = "left";
                }
            }
            else {
                this.applyForce = false;
            }

            if (A_.INPUT.down["jump"]) {
                this.tryJump = true;
            }
        }

        // SLOPE & PLATFORM
        if (!this.slope) {
            var sprite;
            var y = this.collisionPolygon.getBottom() + this.scanDepth;
            var xL = this.collisionPolygon.getLeft() - 2;
            var xR = this.collisionPolygon.getRight() + 2;
            sprite = A_.level.findSpriteContainingPoint(xL, y) || A_.level.findSpriteContainingPoint(xR, y);
            if (sprite && sprite.slope) {
                this.slope = sprite;
//                this.y(this.y() + this.scanDepth / 2);
                this.y(this.y() + 2);
            }
//            if (sprite && sprite.platform) {
//                this.platform = sprite;
//            }
        }
        // PLATFORM
        if (this.platform) {
            this.y(this.y() + this.platformDY + 2);
        }

        if (this.applyForce) {
            if (this.facing === "right") {
                this.acceleration.x = this.force.x;
            }
            else if (this.facing === "left") {
                this.acceleration.x = -this.force.x;
            }
        }
        else {
            this.acceleration.x = 0;
        }


        if (this.tryJump) {
            if (this.platformerState === "grounded") {
                this.velocity.y = -this.jumpForce;
            }
            this.tryJump = false;
        }

//        window.console.log(this.slope !== null);
        this._super();

        // STATES
        if (this.velocity.y > this.gravity.y && (!this.slope && !this.platform)) {
            this.platformerState = "falling";
        } else if (this.velocity.y < -this.gravity.y) {
            this.platformerState = "jumping";
        }
//        if (this.velocity.x > this.friction.x || this.velocity.x < -this.friction.x) {
        if (this.velocity.x !== 0) {
            this.movingState = "moving";
        } else {
            this.movingState = "idle";
        }
//        window.console.log(this.platformerState);

        // FLIP
        if (this.autoFlip) {
            if (this.facing === "right") {
                if (this.flipped("x")) {
                    this.flip("x");
                }
            } else if (this.facing === "left") {
                if (!this.flipped("x")) {
                    this.flip("x");
                }
            }
        }

        this.slope = null;
        this.platform = null;
    },
    calculateVelocity: function() {
        this._super();

        if (this.slope) {
            var slope = this.slope;
            if (slope.slopeRiseDirection === "right" && this.velocity.x > 0 || slope.slopeRiseDirection === "left" && this.velocity.x < 0) {
//                this.velocity.x *= slope.slopeFactor;
            }
        }
    },
    applyVelocity: function() {
        this._super();

        if (this.slope) {
            var slope = this.slope;
            var srd = slope.slopeRiseDirection;
            if (srd === "right" && this.velocity.x < 0 || srd === "left" && this.velocity.x > 0) {
                var diffX = Math.abs(this.velocity.x) * A_.game.dt;
                var diffY = Math.tan(this.slope.slopeAngle) * diffX;
//                var diffY = Math.abs(Math.tan(this.slope.slopeAngle) * diffX);
                this.y(this.y() + diffY);
            }
//            this.slope = null;
        }
    },
    collideWithStatic: function(other, response) {
        this._super(other, response);

        if (response.overlapN.y !== 0) {
            // FLOOR
            if (response.overlapN.y === 1) {
                if (this.collisionPolygon.getBottom() < other.collisionPolygon.getTop() + 2
                        && this.velocity.y > 0) {
                    this.platformerState = "grounded";
                    this.velocity.y = 0;
                }
            }
            // CEILING
            else {
                if (this.bounciness === 0) {
                    if (this.platformerState !== "grounded") {
                        var xL1 = this.collisionPolygon.getLeft() + 2;
                        var xR1 = this.collisionPolygon.getRight() - 2;
                        var xL2 = other.collisionPolygon.getLeft();
                        var xR2 = other.collisionPolygon.getRight();
                        if (xL1 < xR2 && xR1 > xL2) {
                            if (this.velocity.y < 0) {
                                this.velocity.y = 0;
                            }
                            this.y(this.y() + 2);
                        }
                    }
                }
            }
        }
        // WALL
        else if (response.overlapN.x !== 0) {
            this.velocity.x = 0;
        }

        // SLOPE
        if (other.slope) {
            if (!other.slopeSet) {
                other.setSlope();
            }
            var y = this.collisionPolygon.getBottom();
            var xL = this.collisionPolygon.getLeft() - 2;
            var xR = this.collisionPolygon.getRight() + 2;

            if (other.containsPoint(xL, y) || other.containsPoint(xR, y)) {
                this.platformerState = "grounded";
                this.velocity.y = 0;
                this.x(this.x() + response.overlapV.x);
                this.slope = other;
            }
        }

        // PLATFORM
        if (other.platform) {
            if (other.collisionPolygon.getLeft() < this.collisionPolygon.getRight() &&
                    other.collisionPolygon.getRight() > this.collisionPolygon.getLeft()) {
                if (this.y() < other.y()) {
                    this.platform = other;
                    this.velocity.y = 0;
                    this.platformDX = other.x() - other.prevX;
                    this.platformDY = other.y() - other.prevY;
                    this.x(this.x() + this.platformDX);
                }
            }
        }
    }
});