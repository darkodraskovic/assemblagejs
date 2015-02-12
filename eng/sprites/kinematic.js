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
        this.maxVelocitySelf = new SAT.Vector(256, 256);
        this.maxSpeed = this.maxVelocity.len();

        this.slopeN = new SAT.Vector(0, 0);
        this.finalElasticity = new SAT.Vector(0, 0);
        this.applyElasticity = false;
    },
    setMaxVelocity: function (x, y) {
        this.maxVelocity.x = x;
        this.maxVelocity.y = y;
        this.maxSpeed = this.maxVelocity.len();
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
    collideWithDynamic: function (other, response) {
        this._super(other, response);

        if (!response.overlap)
            return;

        var otherResponse = other.collisionResponse;
        if (otherResponse === "active" || otherResponse === "passive") {
            var thisResponse = this.collisionResponse;
            if (thisResponse === "lite") {
                if (this.collisionPolygon === response.a) {
                    this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
                } else {
                    this.setPositionRelative(response.overlapV.x, response.overlapV.y);
                }
            }
            if (otherResponse === "active" || otherResponse === "passive") {
                var thisResponse = this.collisionResponse;
                if (thisResponse === "lite") {
                    if (this.collisionPolygon === response.a) {
                        this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
                    } else {
                        this.setPositionRelative(response.overlapV.x, response.overlapV.y);
                    }
                    this.synchCollisionPolygon();
                } else {
                    if (this.collisionPolygon === response.a) {
                        // PENETRATION resolution
                        var coefficientX = Math.abs(this.velocity.x) / (Math.abs(this.velocity.x) + Math.abs(other.velocity.x));
                        var coefficientY = Math.abs(this.velocity.y) / (Math.abs(this.velocity.y) + Math.abs(other.velocity.y));
                        if (!_.isFinite(coefficientX)) {
                            coefficientX = 0.5;
                        }
                        if (!_.isFinite(coefficientY)) {
                            coefficientY = 0.5;
                        }
                        if (_.isFinite(coefficientX)) {
                            this.setXRelative(-response.overlapV.x * coefficientX);
                            other.setXRelative(response.overlapV.x * (1 - coefficientX));
                        }
                        if (_.isFinite(coefficientY)) {
                            this.setYRelative(-response.overlapV.y * coefficientY);
                            other.setYRelative(response.overlapV.y * (1 - coefficientY));
                        }
                        this.synchCollisionPolygon();
                        other.synchCollisionPolygon();

                        // IMPULSE resolution
                        // Calculate relative velocity
                        var rv = other.velocity.clone().sub(this.velocity);
                        // Calculate relative velocity in terms of the normal direction
                        var velAlongNormal = rv.dot(response.overlapN);

                        // Resolve only if velocities are separating
                        if (velAlongNormal <= 0) {
                            // Calculate impulse scalar
                            var e = Math.min(this.elasticity, other.elasticity);
                            var j = -(1 + e) * velAlongNormal;
                            // Calculate impulse vector
                            var impulse = response.overlapN.clone().scale(j, j);
                            // Apply impulse
                            this.velocity.sub(impulse);
                            other.velocity.add(impulse);
                        }

                        this.synchCollisionPolygon();
                        other.synchCollisionPolygon();
                    }
                }
            }
        }
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);
        if (response.overlap) {
            if (this.elasticity) {
                this.processElasticity(response);
            }
            // TODO: Wrongly implemented. See if needed at all.
//            else {
//                this.processSlope(response);
//            }
        }
    },
    processElasticity: function (response) {
        // b * (V - 2 *  N * (V dot N))
        this.finalElasticity.copy(response.overlapN);
        var dot = this.velocity.dot(response.overlapN);
        this.finalElasticity.scale(dot, dot);
        this.finalElasticity.scale(2, 2);
        this.applyElasticity = true;
    },
    processSlope: function (response) {
        this.slopeN.copy(response.overlapN);
        this.slopeN.perp();
        this.velocity.project(this.slopeN);
    }
});
