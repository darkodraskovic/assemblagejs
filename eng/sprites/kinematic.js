A_.SPRITES.Kinematic = A_.SPRITES.Colliding.extend({
    isMoving: false,
    elasticity: 0.5,
    angularSpeed: 0,
    movementAngle: 0,
    impactTreshold: 20,
    elasticityTreshold: 50,
    groundCheck: false,
    grounded: false,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.velocity = new SAT.Vector(0, 0);
        this.gravity = new SAT.Vector(0, 0);
        this.gravityN = this.gravity.clone().normalize();
        this.friction = new SAT.Vector(32, 32);
        this.calcFriction = new SAT.Vector(32, 32);
        this.acceleration = new SAT.Vector(0, 0);
        this.calcAcceleration = new SAT.Vector(0, 0);
        this.maxVelocity = new SAT.Vector(256, 256);
        this.maxSpeed = this.maxVelocity.len();

        this.slopeNormal = new SAT.Vector(0, 1);
        this.finalElasticity = new SAT.Vector(0, 0);
        this.applyElasticity = false;

        this._vector = new SAT.Vector(0, 0);
        this.mass = 1;

        this.collisionEntities = [];
    },
    setMaxVelocity: function (x, y) {
        this.maxVelocity.x = x;
        this.maxVelocity.y = y;
        this.maxSpeed = this.maxVelocity.len();
    },
    setGravity: function (x, y) {
        this.gravity.x = x;
        this.gravity.y = y;
        this.gravityN.copy(this.gravity).normalize();
    },
    processGround: function () {
        this.grounded = false;
        _.each(this.collisionEntities, function (entity) {
            if (entity.collides) {
                if (this.collidesWithEntityAtOffset(entity, this.gravityN.x, this.gravityN.y)) {
                    if (this.response.overlap) {
                        this.grounded = true;
                    }
                }
            }
        }, this);
    },
    preupdate: function () {
        this._super();
        if (this.applyElasticity) {
            this.velocity.sub(this.finalElasticity);
            this.velocity.scale(this.elasticity, this.elasticity);
            this.applyElasticity = false;
        }

        this.grounded = false;
        if (this.groundCheck) {
            _.each(this.collisionEntities, function (entity) {
                if (this.collidesWithEntityAtOffset(entity, this.gravityN.x, this.gravityN.y)) {
                    if (this.response.overlap) {
                        this.grounded = true;
                    }
                }
            }, this);
        }
    },
    update: function () {
        // LINEAR velocity
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

        // ANGULAR velocity
        if (this.angularSpeed) {
            this.setRotation(this.getRotation() + this.angularSpeed * A_.game.dt);
            this.isRotating = true;
        } else {
            this.isRotating = false;
        }

        // SYNCH position
        this.setPositionRelative(this.velocity.x * A_.game.dt, this.velocity.y * A_.game.dt);
    },
    collideWithKinematic: function (other, response) {
        this._super(other, response);

        if (!response.overlap)
            return;

        var otherResponse = other.collisionResponse;
        if (otherResponse === "active" || otherResponse === "passive") {
            var thisResponse = this.collisionResponse;
            // LITE response
            if (thisResponse === "lite") {
                if (this.collisionPolygon === response.a) {
                    this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
                } else {
                    this.setPositionRelative(response.overlapV.x, response.overlapV.y);
                }
                this.synchCollisionPolygon();
            }
            // ACTIVE & PASSIVE response
            else if (thisResponse === "active" || (thisResponse === "passive" && otherResponse === "active")) {
                if (this.collisionPolygon === response.a) {
                    // PENETRATION resolution
                    var coefficientX = Math.abs(this.velocity.x) / (Math.abs(this.velocity.x) + Math.abs(other.velocity.x));
                    var coefficientY = Math.abs(this.velocity.y) / (Math.abs(this.velocity.y) + Math.abs(other.velocity.y));
                    // If the sum of absolute velocities is zero, separate sprites equidistantly.
                    if (!_.isFinite(coefficientX)) {
                        coefficientX = 0.5;
                    }
                    if (!_.isFinite(coefficientY)) {
                        coefficientY = 0.5;
                    }
                    this.setXRelative(-response.overlapV.x * coefficientX);
                    other.setXRelative(response.overlapV.x * (1 - coefficientX));
                    this.setYRelative(-response.overlapV.y * coefficientY);
                    other.setYRelative(response.overlapV.y * (1 - coefficientY));
                    this.synchCollisionPolygon();
                    other.synchCollisionPolygon();

                    // IMPULSE resolution
                    this.processImpulse(other, response);
                }
            }
        }
    },
    postupdate: function () {
        this._super();

        this.collisionEntities.length = 0;
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);

        this.collisionEntities.push(other);

        if (response.overlap) {
            this.slopeNormal.copy(response.overlapN);

            if (this.elasticity && this.velocity.len() > this.elasticityTreshold) {
                this.processElasticity(response);
            }
            else {
                this.processImpact();
            }
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
    processImpact: function () {
        this._vector.copy(this.slopeNormal);
        this._vector.perp();
        if (this.velocity.dot(this.slopeNormal) > 0) {
            if (this.velocity.len() > this.impactTreshold) {
                this.velocity.project(this._vector);
            }
            else {
                this.velocity.x = this.velocity.y = 0;
            }
        }
    },
    processImpulse: function (other, response) {
        // Calculate the velocity difference.
        var relativeVelocity = this._vector;
        relativeVelocity.copy(other.velocity);
        relativeVelocity.sub(this.velocity);
        // Resolve only if velocities are separating.
        if (relativeVelocity.dot(response.overlapN) <= 0) {
            // Use the lower elasticity for intuitive results.
            var e = Math.min(this.elasticity, other.elasticity);
            // Calculate the impulse.
            var impulse = relativeVelocity.project(response.overlapN).scale(-(1 + e));
            // Apply the impulse.
            var x = impulse.x;
            var y = impulse.y;
            impulse.scale(other.mass / (this.mass + other.mass));
            this.velocity.sub(impulse);
            impulse.x = x;
            impulse.y = y;
            impulse.scale(this.mass / (this.mass + other.mass));
            other.velocity.add(impulse);
        }
    }
});