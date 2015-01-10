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
        this.gravityMultiplier = 4;
        this.recalcFallTreshold();
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
    onCreation: function () {
        this._super();
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

        // SLOPE
        if (!this.slope) {
            var sprite;
            var y = this.abbBottom() + this.scanDepth;
            var xL = this.abbLeft() - 2;
            var xR = this.abbRight() + 2;
            sprite = A_.level.findSpriteContainingPoint(xL, y) || A_.level.findSpriteContainingPoint(xR, y);
            if (sprite && sprite.slope) {
                this.slope = sprite;
                this.setY(this.getY() + 2);
            }
        }
        // PLATFORM
        if (this.platform) {
            this.setY(this.getY() + this.platformDY + 2);
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
                this.onJumped();
            }
            this.tryJump = false;
        }

        this._super();

        // STATES
//        if (this.velocity.y > this.gravity.y * 4 && (!this.slope && !this.platform)) {
        if (this.velocity.y > this.fallTreshold && (!this.slope && !this.platform)) {
            this.platformerState = "falling";
        } else if (this.velocity.y < -this.gravity.y) {
            this.platformerState = "jumping";
        }

        if (this.velocity.x !== 0) {
            this.movingState = "moving";
        } else {
            this.movingState = "idle";
        }

        // FLIP
        if (this.autoFlip) {
            if (this.facing === "right") {
                this.setFlippedX(false);
            } else {
                this.setFlippedX(true);
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
                this.setY(this.getY() + diffY);
            }
//            this.slope = null;
        }
    },
    collideWithStatic: function(other, response) {
        this._super(other, response);

        if (response.overlapN.y !== 0) {
            // FLOOR
            if (response.overlapN.y === 1) {
                if (this.abbOverlapsSegment("x", other.abbLeft() + 2, other.abbRight() - 2)) {
                    this.ground();
                }
            }
            // CEILING
            else {
                if (this.abbOverlapsSegment("x", other.abbLeft() + 2, other.abbRight() - 2) 
                        && this.platformerState !== "grounded") {
                    this.onCeiling();
                    if (this.velocity.y < 0) {
                        this.velocity.y = 0;
                    }
                    this.setYRelative(2);
                }
            }
        }
        // WALL
        else if (response.overlapN.x !== 0) {
            if (this.abbOverlapsSegment("y", other.abbTop() + 2, other.abbBottom() - 2)) {
                this.velocity.x = 0;
                this.onWall();
            }
        }
        // SLOPE
        if (other.slope) {
            if (!other.slopeSet) {
                other.setSlope();
            }
            if (other.containsPoint(this.abbLeft() - 2, this.abbBottom()) ||
                    other.containsPoint(this.abbRight() + 2, this.abbBottom())) {
                this.ground();
                this.setX(this.getX() + response.overlapV.x);
                this.slope = other;
            }
        }
        // PLATFORM
        if (other.platform) {
            if (this.abbOverlapsSegment("x", other.abbLeft(), other.abbRight())) {
                if (this.getY() < other.getY()) {
                    this.platform = other;
                    this.velocity.y = 0;
                    this.platformDX = other.getX() - other.prevX;
                    this.platformDY = other.getY() - other.prevY;
                    this.setX(this.getX() + this.platformDX);
                }
            }
        }
    },
    ground: function() {
        if (this.platformerState !== "grounded") {
            this.onGrounded();
        }
        this.platformerState = "grounded";
        this.velocity.y = 0;
    },
    // CALLBACKS
    onJumped: function() {

    },
    onGrounded: function() {

    },
    onWall: function() {
    },
    onCeiling: function() {

    },
    // UTILS
    flipFacing: function() {
        if (this.facing === "right") {
            this.facing = "left";
        }
        else {
            this.facing = "right";
        }
    },
    recalcFallTreshold: function() {
        this.fallTreshold = this.gravity.y * this.gravityMultiplier;
    }
});

//var PlatformerProbe = A_.SPRITES.Colliding.extend({
//    bounded: false,
//    collision: {response: "sensor", offset: {x: 0, y: 0}, size: {w: 2, h: 2}},
//    init: function(parent, x, y, props) {
//        this._super(parent, x, y, props);
//
//    },
//    onCreation: function() {
//        this._super();
//        this.addon("PinTo", {name: "probe", parent: this.undead,
//            offsetX: 0, offsetY: this.platformer.getHeight() / 2 + 2});
//    }
//});