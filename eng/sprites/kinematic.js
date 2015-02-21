A_.SPRITES.Kinematic = A_.SPRITES.Colliding.extend({
    isMoving: false,
    elasticity: 0,
    angularSpeed: 0,
    impulseTreshold: 10,
    elasticityTreshold: 100,
    groundCheck: false,
    grounded: false,
    slopeStanding: 0,
    mass: 1,
    applyElasticity: false,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.velocity = new SAT.Vector(0, 0);
        this.gravity = new SAT.Vector(0, 0);
        this.gravityN = this.gravity.clone().normalize();
        this.friction = new SAT.Vector(0, 0);
        this.acceleration = new SAT.Vector(0, 0);
        this.maxVelocity = new SAT.Vector(1000, 1000);

        this.slopeNormal = new SAT.Vector(0, 0);
        this.finalElasticity = new SAT.Vector(0, 0);
        this._vector = new SAT.Vector(0, 0);

        this.collisionEntities = [];
        this.collisionNormals = [];
    },
    setGravity: function (x, y) {
        this.gravity.x = x;
        this.gravity.y = y;
        this.gravityN.copy(this.gravity).normalize();
        this.elasticityTreshold = this.gravity.len2();
        this.impulseTreshold = this.gravity.len();
        if (Math.abs(this.gravityN.x) > Math.abs(this.gravityN.y)) {
            this.gHorizontal = "y";
            this.gVertical = "x";
        }
        else {
            this.gHorizontal = "x";
            this.gVertical = "y";
        }
        this.slopeOffset = Math.cos((90 - this.slopeStanding).toRad());
    },
    update: function () {
        // LINEAR velocity
        if (this.velocity.x > 0) {
            this.velocity.x = (this.velocity.x - this.friction.x).clamp(0, this.maxVelocity.x);
        }
        else if (this.velocity.x < 0) {
            this.velocity.x = (this.velocity.x + this.friction.x).clamp(-this.maxVelocity.x, 0);
        }
        if (this.velocity.y > 0) {
            this.velocity.y = (this.velocity.y - this.friction.y).clamp(0, this.maxVelocity.y);
        }
        else if (this.velocity.y < 0) {
            this.velocity.y = (this.velocity.y + this.friction.y).clamp(-this.maxVelocity.y, 0);
        }

        this.velocity.add(this.acceleration);
        this.velocity.add(this.gravity);

        this.velocity.x = this.velocity.x.clamp(-this.maxVelocity.x, this.maxVelocity.x);
        this.velocity.y = this.velocity.y.clamp(-this.maxVelocity.y, this.maxVelocity.y);

        // ANGULAR velocity
        if (this.angularSpeed) {
            this.setRotation(this.getRotation() + this.angularSpeed * A_.game.dt);
            this.isRotating = true;
        } else {
            this.isRotating = false;
        }

        // SYNCH position
        this.setPositionRelative(this.velocity.x * A_.game.dt, this.velocity.y * A_.game.dt);
        this.synchCollisionPolygon();

        // Reset collision vars
        this.collisionEntities.length = 0;
        this.collisionNormals.length = 0;
        this.slopeNormal.x = 0;
        this.slopeNormal.y = 0;
        this.collided = false;

        // Process COLLISION
        this.processStaticCollisions();
        this.processKinematicCollisions();
        this.processCollisionResults();

        this._super();
    },
    collideWithStatic: function (other, response) {
        if (!response.overlap || this.collisionResponse === "sensor")
            return;

        this.collided = true;

        this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
        this.synchCollisionPolygon();

        this.collisionEntities.push(other);
        this.collisionNormals.push(response.overlapN.x);
        this.collisionNormals.push(response.overlapN.y);

        if (response.overlap) {
            this.slopeNormal.copy(response.overlapN);
            if (this.elasticity) {
                this.processElasticity(response);
            }
        }
    },
    collideWithKinematic: function (other, response) {
        if (!response.overlap)
            return;

        this.collided = true;

        var otherResponse = other.collisionResponse;
        if (otherResponse === "active" || otherResponse === "passive") {
            var thisResponse = this.collisionResponse;
            // LITE response
            if (thisResponse === "lite") {
                this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
                this.synchCollisionPolygon();
            }
            // ACTIVE & PASSIVE response
            else if (thisResponse === "active" || (thisResponse === "passive" && otherResponse === "active")) {
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
                this.processKineticImpulse(other, response);
            }
        }
    },
    processElasticity: function (response) {
        // b * (V - 2 *  N * (V dot N))
        var dot = this.velocity.dot(response.overlapN);
        if (dot > this.elasticityTreshold && this.velocity.dot(response.overlapN) >= 0) {
            this.finalElasticity.copy(response.overlapN);
            this.finalElasticity.scale(dot, dot);
            this.finalElasticity.scale(2, 2);
            this.applyElasticity = true;
        }
    },
    processStaticImpulse: function (collisionNormal) {
        if (this.velocity.dot(collisionNormal) > 0) {
            collisionNormal.perp();
            this.velocity.project(collisionNormal);
        }
    },
    processKineticImpulse: function (other, response) {
        // Calculate the velocity difference.
        var relativeVelocity = this._vector;
        relativeVelocity.copy(other.velocity);
        relativeVelocity.sub(this.velocity);
        // Resolve only if velocities are separating.
        if (relativeVelocity.dot(response.overlapN) <= 0 && relativeVelocity.len() > this.impulseTreshold) {
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
    },
    processCollisionResults: function () {
        // GROUND check
        if (this.groundCheck) {
            this.grounded = null;
            this.ceiling = null;
            _.each(this.collisionEntities, function (entity) {
                if (this.collidesWithEntityAtOffset(entity, this.gravityN[this.gHorizontal], this.gravityN[this.gVertical])) {
                    if (this.response.overlap) {
                        this.grounded = entity;
                    }
                }
                if (this.collidesWithEntityAtOffset(entity, this.gravityN[this.gHorizontal], -this.gravityN[this.gVertical])) {
                    if (this.response.overlap) {
                        this.ceiling = entity;
                    }
                }
            }, this);
        }

        // Apply static ELASTICITY
        // BUG: elasticity slows down objects on fall
        if (this.applyElasticity) {
            this.velocity.sub(this.finalElasticity);
            this.velocity.scale(this.elasticity, this.elasticity);
            this.applyElasticity = false;
        }
        // Apply static IMPULSE
        else if (this.velocity.len() > this.impulseTreshold) {
            for (var i = 0; i < this.collisionEntities.length; i++) {
                for (var j = 0; j < this.collisionNormals.length; j += 2) {
                    this._vector.x = this.collisionNormals[j];
                    this._vector.y = this.collisionNormals[j + 1];
                    if (this.groundCheck) {
                        if ((this.grounded && (this._vector[this.gHorizontal] > -this.slopeOffset && this._vector[this.gHorizontal] < this.slopeOffset)) ||
                                this.ceiling) {
                            this.processStaticImpulse(this._vector);
                        } else if (this.collided) {
                            this.velocity[this.gHorizontal] = -this.velocity[this.gHorizontal] * this.elasticity;
                        }
                    }
                    else {
                        this.processStaticImpulse(this._vector);
                    }
                }
            }
        }
    },
    processStaticCollisions: function () {
        if (!this.collides)
            return;

        var entities = this.level.collider.collisionStatics;
        for (var i = 0, len = entities.length; i < len; i++) {
            var other = entities[i];
            if (other.collides && other !== this) {
                // Bitmasks. Currently inactive. DO NOTE DELETE!
//                if (typeof o1.collisionType === "undefined" || typeof o2.collisionType === "undefined" ||
//                        o1.collidesWith & o2.collisionType || o2.collidesWith & o1.collisionType) {
                this.response.clear();
                var collided = SAT.testPolygonPolygon(this.collisionPolygon, other.collisionPolygon, this.response);
                if (collided) {
                    this.collideWithStatic(other, this.response);
//                    }
                }
            }
        }
    },
    processKinematicCollisions: function () {
        if (!this.collides)
            return;

        var entities = this.level.collider.collisionKinematics;
        for (var i = 0, len = entities.length; i < len; i++) {
            var other = entities[i];
            if (other.collides && other !== this) {
                // Bitmasks. Currently inactive. DO NOTE DELETE!
//                if (typeof o1.collisionType === "undefined" || typeof o2.collisionType === "undefined" ||
//                        o1.collidesWith & o2.collisionType || o2.collidesWith & o1.collisionType) {
                this.response.clear();
                var collided = SAT.testPolygonPolygon(this.collisionPolygon, other.collisionPolygon, this.response);
                if (collided) {
                    this.collideWithKinematic(other, this.response);
//                    }
                }
            }
        }
    }
});
