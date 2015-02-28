A_.SPRITES.Kinematic = A_.SPRITES.Colliding.extend({
    isMoving: false,
    elasticity: 0,
    angularSpeed: 0,
    bounceTreshold: 100,
    standing: false,
    mass: 1,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.velocity = new SAT.Vector(0, 0);
        this.gravity = new SAT.Vector(0, 0);
        this.gravityN = this.gravity.clone().normalize();
        this.friction = new SAT.Vector(0, 0);
        this.acceleration = new SAT.Vector(0, 0);
        this.maxVelocity = new SAT.Vector(1000, 1000);

        this.slopeNormal = new SAT.Vector(0, 0);

        this.collisionStatics = [];
        this._lastStaticCollisionNormal = new SAT.Vector(0, 0);
        this._collisionNormal = new SAT.Vector(0, 0);
        this.wall = null;
    },
    setGravity: function (x, y, slopeTolerance) {
        this.gravity.x = x;
        this.gravity.y = y;
        this.gravityN.copy(this.gravity).normalize();
        if (Math.abs(this.gravityN.x) > Math.abs(this.gravityN.y)) {
            this.gH = "y";
            this.gV = "x";
        }
        else {
            this.gH = "x";
            this.gV = "y";
        }
        if (_.isNumber(slopeTolerance)) {
            this.slopeOffset = Math.cos((90 - slopeTolerance).toRad());
        }
        else
            this.slopeOffset = 0;
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
        this._lastStaticCollisionNormal.x = 0;
        this._lastStaticCollisionNormal.y = 0;

        this.collided = false;
        this.ceiling = null;
        this.wall = null;
        this.standing = false;
        this.slopeNormal.x = 0;
        this.slopeNormal.y = 0;

        // Process COLLISION
        this.processTileCollisions();
        this.processStatics();
        this.processSpriteCollisions();
        this.processStatics();

        this._vector.copy(this.velocity).reverse()
        if (this._vector.dot(this._lastStaticCollisionNormal) < 0) {
            this.processImpulse(this._lastStaticCollisionNormal, this._vector.copy(this.velocity).reverse());
        }

        this._super();
    },
    processTileCollisions: function () {
        for (var i = 0; i < this.level.tileMaps.length; i++) {
            var tilemap = this.level.tileMaps[i];
            var yStart = tilemap.getMapY(this.aabbTop());
            var yEnd = tilemap.getMapY(this.aabbBottom());
            var xStart = tilemap.getMapX(this.aabbLeft());
            var xEnd = tilemap.getMapX(this.aabbRight());

            for (var row = yStart; row <= yEnd; row++) {
                for (var col = xStart; col <= xEnd; col++) {
                    var tile = tilemap.getTile(col, row);
                    if (tile && tile.collides) {
                        this.response.clear();
                        var collided = SAT.testPolygonPolygon(this.collisionPolygon, tile.collisionPolygon, this.response);
                        if (collided) {
                            this.collideWithStatic(tile, this.response);
                        }
                    }
                }
            }
        }
    },
    processSpriteCollisions: function () {
        if (!this.collides || this.collisionResponse === "static")
            return;

        var entities = this.level.sprites;
        for (var i = 0, len = entities.length; i < len; i++) {
            var other = entities[i];
            if (other.collides && other !== this) {
                // Bitmasks. Currently inactive. DO NOTE DELETE!
//                if (typeof o1.collisionType === "undefined" || typeof o2.collisionType === "undefined" ||
//                        o1.collidesWith & o2.collisionType || o2.collidesWith & o1.collisionType) {
                this.response.clear();
                var collided = SAT.testPolygonPolygon(this.collisionPolygon, other.collisionPolygon, this.response);
                if (collided) {
                    other.collisionResponse === "static" ? this.collideWithStatic(other, this.response) : this.collideWithKinematic(other, this.response);
//                    }
                }
            }
        }
    },
    collideWithStatic: function (other, response) {
        this.collisionStatics.push(other);

        if (this.collisionResponse === "sensor") {
            this.collided = true;
            return;
        }

        if (!response.overlap)
            return;

        this.collided = true;

        this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
        this.synchCollisionPolygon();

        this._lastStaticCollisionNormal.copy(response.overlapN);
    },
    collideWithKinematic: function (other, response) {
        if (!response.overlap)
            return;

        this.collided = true;

        if (this.collisionResponse === "sensor")
            return;

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
                var velocityDiff = this._vector;
                velocityDiff.copy(other.velocity);
                velocityDiff.sub(this.velocity);
                if (velocityDiff.dot(response.overlapN) < 0) {
                    other._collisionNormal.copy(response.overlapN).reverse();
                    other._vector.copy(velocityDiff).reverse();
                    this.processImpulse(response.overlapN, velocityDiff, other);
                    other.processImpulse(other._collisionNormal, other._vector, this);
                    this.processStanding(response.overlapN);
                    other.processStanding(other._collisionNormal);
                }
            }
        }
    },
    processImpulse: function (collisionNormal, velocityDiff, other) {
        // Calculate the impulse
        // I = -(1 + e) * (((Vb - Va) dot N) * N) * (Mb / (Ma + Mb))
        velocityDiff.project(collisionNormal);

        velocityDiff.x *= -(1 + (velocityDiff.x.abs() > this.bounceTreshold ? this.elasticity : 0));
        velocityDiff.y *= -(1 + (velocityDiff.y.abs() > this.bounceTreshold ? this.elasticity : 0));

        if (other)
            velocityDiff.scale(other.mass / (this.mass + other.mass));
        this.velocity.sub(velocityDiff);
    },
    processStanding: function (overlapN) {
        if (overlapN.dot(this.gravityN) > 0) {
            this.slopeNormal.x = overlapN.x;
            this.slopeNormal.y = overlapN.y;
            if (overlapN[this.gH] > -this.slopeOffset && overlapN[this.gH] < this.slopeOffset) {
                this.standing = true;
            }
            if (overlapN[this.gV] === this.gravityN[this.gV] && this.velocity[this.gV] / this.gravityN[this.gV] >= 0) {
                if (this.velocity[this.gV].abs() > this.bounceTreshold) {
                    this.velocity[this.gV] = -this.velocity[this.gV] * this.elasticity;
                } else {
                    this.velocity[this.gV] = 0;
                }
            }
        }
    },
    processStatics: function () {
        for (var i = 0, len = this.collisionStatics.length; i < len; i++) {
            var entity = this.collisionStatics[i];
            var response = this.response;
            if (!this.standing && this.velocity[this.gV] / this.gravityN[this.gV] >= 0 && 
                    this.collidesWithEntityAtOffset(entity, this.gravityN[this.gH], this.gravityN[this.gV])) {
                if (response.overlap) {
                    // Platformer hits the ground, ie. perfectly horizontal plane.
                    this.processStanding(response.overlapN);
                }
            }
            else if (!this.ceiling && this.collidesWithEntityAtOffset(entity, this.gravityN[this.gH], -this.gravityN[this.gV])) {
                if (response.overlap) {
                    // Platformer hits the ceiling, ie. perfectly horizontal plane.
                    if (response.overlapN[this.gV] === -this.gravityN[this.gV] && this.velocity[this.gV] / this.gravityN[this.gV] < 0) {
                        if (this.velocity[this.gV].abs() > this.bounceTreshold) {
                            this.velocity[this.gV] = -this.velocity[this.gV] * this.elasticity;
                        } else {
                            this.velocity[this.gV] = 0;
                        }
                        this.ceiling = entity;
                    }
                }
            }
            // Platformer hits the wall, ie. perfectly vertical plane.
            if (!this.wall && this.velocity[this.gH] / this.gravityN[this.gH] > 0 && 
                    this.collidesWithEntityAtOffset(entity, -this.gravityN[this.gV], this.gravityN[this.gH])) {
                if (response.overlap) {
                    if (response.overlapN[this.gH].abs() === this.gravityN[this.gV].abs() && this.velocity[this.gH]) {
                        this.wall = entity;
                        if (this.velocity[this.gH].abs() > this.bounceTreshold) {
                            this.velocity[this.gH] = -this.velocity[this.gH] * this.elasticity;
                        } else {
                            this.velocity[this.gH] = 0;
                        }
                    }
                }
            }
            else if (!this.wall && this.collidesWithEntityAtOffset(entity, this.gravityN[this.gV], this.gravityN[this.gH])) {
                if (response.overlap) {
                    if (response.overlapN[this.gH].abs() === this.gravityN[this.gV].abs() && this.velocity[this.gH]) {
                        this.wall = entity;
                        if (this.velocity[this.gH].abs() > this.bounceTreshold) {
                            this.velocity[this.gH] = -this.velocity[this.gH] * this.elasticity;
                        } else {
                            this.velocity[this.gH] = 0;
                        }
                    }
                }
            }
        }
        this.collisionStatics.length = 0;
    }
});