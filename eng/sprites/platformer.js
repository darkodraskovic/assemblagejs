A_.SPRITES.Platformer = A_.SPRITES.Kinematic.extend({
    platformerState: "grounded",
    movingState: "idle",
    jumpForce: 500,
    elasticity: 0,
    controlled: false,
    facing: "right",
    autoFlip: true,
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        this.gravity = new SAT.Vector(0, 20);
        this.friction = new SAT.Vector(48, 0);
        this.maxVelocity = new SAT.Vector(300, 600);
        this.force = new SAT.Vector(100, 100);
        this.movingPlatform = null;
        this.platformDY = 0;
        this.collisionEntities = [];

        if (this.controlled) {
            A_.INPUT.addMapping("left", A_.KEY.A);
            A_.INPUT.addMapping("right", A_.KEY.D);
            A_.INPUT.addMapping("jump", A_.KEY.SPACE);
        }
    },
    preupdate: function () {
        this.processPlatformerState();
        
        this._super();
    },
    processPlatformerState: function () {
        if (this.velocity.y > this.gravity.y) {
            this.platformerState = "falling";
            this.jumps = false;
        } else if (this.velocity.y < -this.gravity.y) {
            this.platformerState = "launching";
        }

        _.each(this.collisionEntities, function (entity) {
            if (entity.collides) {
                if (this.collidesWithEntityAtOffset(entity, 1, 0) || this.collidesWithEntityAtOffset(entity, -1, 0)) {
                    if (this.response.overlap && !this.response.overlapN.y) {
//                        this.velocity.x = 0;
                        this.onWall();
                        this.setXRelative(-this.response.overlapN.x);
                        this.synchCollisionPolygon();
                    }
                }
                if (this.collidesWithEntityAtOffset(entity, 0, 1)) {
                    if (this.response.overlap && this.platformerState !== "launching") {
                        if (this.platformerState !== "grounded") {
                            this.onGrounded();
                        }
                        this.platformerState = "grounded";
                        this.velocity.y = 0;
                    }
                }
                if (this.collidesWithEntityAtOffset(entity, 0, -1)) {
                    if (this.response.overlap && this.response.overlapN.y <= 0) {
                        this.onCeiling();
                        if (this.velocity.y < 0) {
                            this.velocity.y = 0;
                        }
                        this.setYRelative(1);
                        this.synchCollisionPolygon();
                    }
                }
            }
        }, this);

        if (this.velocity.x !== 0) {
            this.movingState = "moving";
        } else {
            this.movingState = "idle";
        }
    },
    update: function () {
        if (this.controlled) {
            this.processControls();
        }

        // PLATFORM
        if (this.movingPlatform) {
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
                this.jumps = true;
                this.onJumped();
            }
            this.tryJump = false;
        }

        this._super();

        // FLIP
        if (this.autoFlip) {
            if (this.facing === "right") {
                this.setFlippedX(false);
            } else {
                this.setFlippedX(true);
            }
        }

        this.movingPlatform = null;
        this.collisionEntities.length = 0;
    },
    processControls: function () {
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
    },
    calculateVelocity: function () {
        this._super();

        if (this.slopeVelocityFactor) {
            this.velocity.x *= this.slopeVelocityFactor;
            this.slopeVelocityFactor = 0;
        }
    },
    applyVelocity: function () {
        this._super();

        if (this.slopeAngle) {
            if (this.slopeAngle > 0) {
                this.slopeAngle = -this.slopeAngle;
            }
            var diffX = Math.abs(this.velocity.x) * A_.game.dt;
            var diffY = Math.tan(-this.slopeAngle) * diffX;
            this.setY(this.getY() + diffY);
            this.slopeAngle = 0;
        }

    },
    collideWithStatic: function (other, response) {
        this._super(other, response);

        this.collisionEntities.push(other);

        this.processSlope(response);

        // Moving platform
        if (response.overlap && response.overlapN.y > 0 && !(other instanceof A_.TILES.Tile)) {
            if (other.getX() !== other.prevX || other.getY() !== other.prevY) {
                this.processMovingPlatform(other);
            }
        }
    },
    processMovingPlatform: function (other) {
        if (this.getY() < other.getY()) {
            this.movingPlatform = other;
            this.platformDX = other.getX() - other.prevX;
            this.platformDY = other.getY() - other.prevY;
            
            this.setXRelative(this.platformDX);
            this.synchCollisionPolygon();
        }
    },
    processSlope: function (response) {
        this.slopeN.copy(response.overlapN);
        this.slopeN.perp();
        var angle = A_.UTILS.angleTo(this.level.origin, this.slopeN);
        if (angle !== 0) {
            if (angle > -Math.PI / 2 && angle < Math.PI / 2) {
                this.setXRelative(response.overlapV.x);
                this.setYRelative(-response.overlapV.y);
                this.slopeAngle = angle;
                if (angle < 0 && this.velocity.x > 0 || angle > 0 && this.velocity.x < 0) {
                    this.slopeVelocityFactor = Math.cos(angle);
                }
            }
        }
    },
    // CALLBACKS
    onJumped: function () {

    },
    onGrounded: function () {

    },
    onWall: function () {
    },
    onCeiling: function () {

    },
    // UTILS
    flipFacing: function () {
        if (this.facing === "right") {
            this.facing = "left";
        }
        else {
            this.facing = "right";
        }
    }
});
