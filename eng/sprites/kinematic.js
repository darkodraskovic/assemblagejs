A_.SPRITES.Kinematic = A_.SPRITES.Colliding.extend({
    isMoving: false,
    bounciness: 0.5,
    angularSpeed: 0,
    movementAngle: 0,
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.velocity = new SAT.Vector(0, 0);
        this.gravity = new SAT.Vector(0, 0);
        this.friction = new SAT.Vector(32, 32);
        this.calcFriction = new SAT.Vector(32, 32);
        this.acceleration = new SAT.Vector(0, 0);
        this.calcAcceleration = new SAT.Vector(0, 0);
        this.maxVelocity = new SAT.Vector(256, 256);
        this.maxSpeed = this.maxVelocity.len();
        this.bounced = {horizontal: false, vertical: false};
    },
    update: function() {
        this._super();

        this.calculateVelocity();
        this.applyVelocity();

        if (this.angularSpeed) {
            this.setRotation(this.getRotation() + this.angularSpeed * A_.game.dt);
            this.isRotating = true;
        } else {
            this.isRotating = false;
        }
    },
    calculateVelocity: function() {
        if (this.moveForward) {
            this.movementAngle = this.getRotation();
        }

        this.calcFriction.x = this.friction.x;
        this.calcFriction.y = this.friction.y;
        this.calcAcceleration.x = this.acceleration.x;
        this.calcAcceleration.y = this.acceleration.y;

        if (this.moveAtAngle) {
            var sin = Math.sin(this.movementAngle);
            var cos = Math.cos(this.movementAngle);

            this.calcFriction.x = Math.abs(this.calcFriction.x * cos);
            this.calcFriction.y = Math.abs(this.calcFriction.y * sin);

            this.calcAcceleration.x *= cos;
            this.calcAcceleration.y *= sin;
        }

        if (this.gravity.x === 0) {
            if (this.velocity.x > 0) {
                this.velocity.x -= this.calcFriction.x;
                if (this.velocity.x < 0) {
                    this.velocity.x = 0;
                }
            }
            if (this.velocity.x < 0) {
                this.velocity.x += this.calcFriction.x;
                if (this.velocity.x > 0) {
                    this.velocity.x = 0;
                }
            }
        }
        if (this.gravity.y === 0) {
            if (this.velocity.y > 0) {
                this.velocity.y -= this.calcFriction.y;
                if (this.velocity.y < 0) {
                    this.velocity.y = 0;
                }
            }
            if (this.velocity.y < 0) {
                this.velocity.y += this.calcFriction.y;
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                }
            }
        }

        this.velocity.add(this.calcAcceleration);
        this.velocity.add(this.gravity);

        if (this.bounciness) {
            if (this.bounced.horizontal) {
                this.velocity.x = -this.velocity.x * this.bounciness;
            }
            if (this.bounced.vertical) {
                this.velocity.y = -this.velocity.y * this.bounciness;
            }
            this.bounced.horizontal = this.bounced.vertical = false;
        }

        if (this.moveAtAngle) {
            var spd = this.velocity.len();
            if (spd > this.maxSpeed) {
                this.velocity.scale(this.maxSpeed / spd, this.maxSpeed / spd);
            }
        }
        else {
            this.velocity.x = this.velocity.x.clamp(-this.maxVelocity.x, this.maxVelocity.x);
            this.velocity.y = this.velocity.y.clamp(-this.maxVelocity.y, this.maxVelocity.y);
        }
    },
    applyVelocity: function() {
        this.setPositionRelative(this.velocity.x * A_.game.dt, this.velocity.y * A_.game.dt);

        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
    },
    collideWithStatic: function(other, response) {
        this.processBounce(response.overlapN);
        this._super(other, response);
    },
    processBounce: function(currentOverlapN) {
        // This method must be called before the collide* _super in order
        // to fetch the correct this.previousOverlapN
        // BUG: the sprite does not bounce in tilemap corners
        if (currentOverlapN.x !== 0 && Math.abs(this.velocity.x) > this.calcAcceleration.x) {
//            if (this.prevOverlapN.y === 0) {
            this.bounced.horizontal = true;
        }
        if (currentOverlapN.y !== 0 && Math.abs(this.velocity.y) > this.calcAcceleration.y) {
//            if (this.prevOverlapN.x === 0)
            this.bounced.vertical = true;
        }
    }
});
