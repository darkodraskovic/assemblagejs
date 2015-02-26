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

        this.collisionEntities = [];
        this._lastStaticCollisionNormal = new SAT.Vector(0, 0);
        this._collisionNormal = new SAT.Vector(0, 0);
        this.ground = null;
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
        this.ground = null;
        this.ceiling = null;
        this.wall = null;
        this.standing = false;
        this.slopeNormal.x = 0;
        this.slopeNormal.y = 0;
        // Process COLLISION
        this.processTileCollisions();
        for (var i = 0, len = this.collisionEntities.length; i < len; i++) {
            this.processStatic(this.collisionEntities[i]);
        }
        this.collisionEntities.length = 0;
        this.processSpriteCollisions();
        for (var i = 0, len = this.collisionEntities.length; i < len; i++) {
            this.processStatic(this.collisionEntities[i]);
        }
        this.collisionEntities.length = 0;
        this.processImpulse(this._lastStaticCollisionNormal, this._vector.copy(this.velocity).reverse());

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
        if (this.collisionResponse === "sensor") {
            this.collided = true;
            return;
        }

        this.collisionEntities.push(other);

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
                other._collisionNormal.copy(response.overlapN).reverse();
                other._vector.copy(velocityDiff).reverse();
                this.processImpulse(response.overlapN, velocityDiff, other);
                other.processImpulse(other._collisionNormal, other._vector, this);
                this.processDynamic(response.overlapN);
                other.processDynamic(other._collisionNormal);
            }
        }
    },
    processImpulse: function (collisionNormal, velocityDiff, other) {
        // Calculate the impulse
        // I = -(1 + e) * (((Vb - Va) dot N) * N) * (Mb / (Ma + Mb))
        // Calculate the velocity difference.
        // V = Vb - Va
        // Resolve only if velocities are separating.
        if (velocityDiff.dot(collisionNormal) < 0) {
            // V' = (V dot N) * N
            velocityDiff.project(collisionNormal);
            // V'' = V' * -(1 + e); I = V'' * (Mb / (Ma + Mb))
            var e = 0
            if (velocityDiff.len() > this.bounceTreshold) {
                e = this.elasticity;
            }
            var impulse = velocityDiff.scale(-(1 + e));
            if (other)
                impulse.scale(other.mass / (this.mass + other.mass));
            this.velocity.sub(impulse);
        }
    },
    processStatic: function (entity) {
        if (!this.ground && this.collidesWithEntityAtOffset(entity, this.gravityN[this.gH], this.gravityN[this.gV])) {
            if (this.response.overlap) {
                // Platformer hits the ground, ie. perfectly horizontal plane.
                if (this.response.overlapN[this.gV] === this.gravityN[this.gV] && this.velocity.y / this.gravityN[this.gV] >= 0) {
                    if (this.velocity[this.gV].abs() > this.bounceTreshold) {
                        this.velocity[this.gV] = -this.velocity[this.gV] * this.elasticity;
                    } else {
                        this.velocity[this.gV] = 0;
                    }
                }
                // See if the entity is standing.
                this.ground = entity;
                this.slopeNormal.x = this.response.overlapN.x;
                this.slopeNormal.y = this.response.overlapN.y;
                if (this.slopeNormal[this.gH] > -this.slopeOffset && this.slopeNormal[this.gH] < this.slopeOffset) {
                    this.standing = true;
                }
            }
        }
        if (!this.ceiling && this.collidesWithEntityAtOffset(entity, this.gravityN[this.gH], -this.gravityN[this.gV])) {
            if (this.response.overlap) {
                // Platformer hits the ceiling, ie. perfectly horizontal plane.
                if (this.response.overlapN[this.gV] === -this.gravityN[this.gV] && this.velocity.y / this.gravityN[this.gV] < 0) {
                    if (this.velocity[this.gV].abs() > this.bounceTreshold) {
                        this.velocity[this.gV] = -this.velocity[this.gV] * this.elasticity;
                    } else {
                        this.velocity[this.gV] = 0;
                    }
                    this.ceiling = entity;
                }
            }
        }
        // Platformer hits the wall, ie. perfectly vertical surface.
        if (!this.wall && this.collidesWithEntityAtOffset(entity, -this.gravityN[this.gV], this.gravityN[this.gH]) ||
                this.collidesWithEntityAtOffset(entity, this.gravityN[this.gV], this.gravityN[this.gH])) {
            if (this.response.overlap && this.response.overlapN[this.gH].abs() === this.gravityN[this.gV].abs()
                    && entity.collisonResponse === "static" && this.velocity[this.gH]) {
                this.wall = entity;
                if (this.velocity[this.gH].abs() > this.bounceTreshold) {
                    this.velocity[this.gH] = -this.velocity[this.gH] * this.elasticity;
                } else {
                    this.velocity[this.gH] = 0;
                }
            }
        }
    },
    processDynamic: function (overlapN) {
        // See if the entity is standing.
        if (overlapN.dot(this.gravityN) >= 0) {
            if (overlapN[this.gH] > -this.slopeOffset && overlapN[this.gH] < this.slopeOffset) {
                this.slopeNormal.x = overlapN.x;
                this.slopeNormal.y = overlapN.y;
            }
            if (overlapN[this.gV] === this.gravityN[this.gV] && this.velocity.y / this.gravityN[this.gV] >= 0) {
                if (this.velocity[this.gV].abs() > this.bounceTreshold) {
                    this.velocity[this.gV] = -this.velocity[this.gV] * this.elasticity;
                } else {
                    this.velocity[this.gV] = 0;
                }
                this.standing = true;
            }
        }
    }
});