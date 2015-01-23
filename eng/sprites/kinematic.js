A_.SPRITES.Kinematic = A_.SPRITES.Colliding.extend({
    isMoving: false,
    elasticity: 0.5,
    angularSpeed: 0,
    movementAngle: 0,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.velocity = new SAT.Vector(0, 0);
        this.gravity = new SAT.Vector(0, 0);
        this.friction = new SAT.Vector(32, 32);
        this.calcFriction = new SAT.Vector(32, 32);
        this.acceleration = new SAT.Vector(0, 0);
        this.calcAcceleration = new SAT.Vector(0, 0);
        this.maxVelocity = new SAT.Vector(256, 256);
        this.maxSpeed = this.maxVelocity.len();

        this.slopeN = new SAT.Vector(0, 0);
//        this.bounced = {horizontal: false, vertical: false};
        this.finalElasticity = new SAT.Vector(0, 0);
        this.applyElasticity = false;
    },
    update: function () {
        this._super();

        this.calculateVelocity();
        this.applyVelocity();

        if (this.angularSpeed) {
            this.setRotation(this.getRotation() + this.angularSpeed * A_.game.dt);
            this.isRotating = true;
        } else {
            this.isRotating = false;
        }

        this.applyElasticity = false;
    },
    calculateVelocity: function () {
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


        this.velocity.add(this.calcAcceleration);
        this.velocity.add(this.gravity);

//        if (this.elasticity) {
//            if (this.bounced.horizontal) {
//                this.velocity.x = -this.velocity.x * this.elasticity;
//            }
//            if (this.bounced.vertical) {
//                this.velocity.y = -this.velocity.y * this.elasticity;
//            }
//        }
//        this.bounced.horizontal = this.bounced.vertical = false;
        if (this.applyElasticity) {
            this.velocity.sub(this.finalElasticity);
            this.velocity.scale(this.elasticity, this.elasticity);
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
    applyVelocity: function () {
        this.setPositionRelative(this.velocity.x * A_.game.dt, this.velocity.y * A_.game.dt);

        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);
        if (response.overlap) {
            if (this.elasticity) {
                this.processElasticity(response);
            } else {
//                this.processSlope(response);
            }
        }
    },
    processElasticity: function (response) {
        // b * (V - 2 *  N * (V dot N))
        this.finalElasticity.copy(response.overlapN);
        var dot = this.velocity.dot(response.overlapN);
        this.finalElasticity.scale(dot, dot);
        this.finalElasticity.scale(2, 2);
//        this.velocity.sub(elasticityVector);
//        this.velocity.scale(this.elasticity, this.elasticity);
        this.applyElasticity = true;
    },
    processSlope: function (response) {
        this.slopeN.copy(response.overlapN)
        this.slopeN.perp();
        this.velocity.project(this.slopeN);

        // Obsolete elasticity processing routine
//        if (Math.abs(response.overlapV.x) > Math.abs(response.overlapV.y)) {
//            this.bounced.horizontal = true;
//            this.bounced.vertical = false;
//        } else {
//            this.bounced.vertical = true;
//            this.bounced.horizontal = false;
//        }
    }
});
