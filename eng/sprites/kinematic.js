DODO.Kinematic = DODO.Colliding.extend({
    isMoving: false,
    elasticity: 0,
    angularSpeed: 0,
    bounceTreshold: 100,
    standing: false,
    mass: 1,
    collisionResponse: "sensor",
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.velocity = new SAT.Vector(0, 0);
        this.gravity = new SAT.Vector(0, 0);
        this.gravityN = new SAT.Vector(0, 0);
        this.setGravity(0, 0, 45);
        this.friction = new SAT.Vector(0, 0);
        this.acceleration = new SAT.Vector(0, 0);
        this.maxVelocity = new SAT.Vector(1000, 1000);

        this.slopeNormal = new SAT.Vector(0, 0);

        this.collisionTiles = [];
        this._collisionNormal = new SAT.Vector(0, 0);
        this.wall = null;
    },
    setGravity: function(x, y, slopeTolerance) {
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
        if (this.gravity.x || this.gravity.y) {
            this.gravitySet = true;
        }
        else
            this.gravitySet = false;
    },
    update: function() {
        if (this.collisionResponse === "static")
            return;

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
            this.setRotation(this.getRotation() + this.angularSpeed * DODO.game.dt);
            this.isRotating = true;
        } else {
            this.isRotating = false;
        }

        // SYNCH position
        this.setPositionRelative(this.velocity.x * DODO.game.dt, this.velocity.y * DODO.game.dt);
        this.synchCollisionPolygon();

        // Reset collision vars
        this.collided = false;
        this.standing = false;
        this._collisionNormal.x = this._collisionNormal.y = 0;
        this.slopeNormal.x = 0;
        this.slopeNormal.y = 0;

        // Process COLLISION
        if (this.collides) {
            this.processSpriteCollisions();
            if (this.collisionResponse !== "sensor")
                this.processTileCollisions();
        }

        this._super();
    },
    processTileCollisions: function() {
        if (this.gravitySet) {
            this.ceiling = null;
            this.wall = null;
            this.ground = null;
            var x = this.getX();
            var y = this.getY();
        }
        for (var i = 0; i < this.scene.tileMaps.length; i++) {
            var tilemap = this.scene.tileMaps[i];
            var yStart, yEnd, xStart, xEnd;
            var top = this.aabbTop(), bottom = this.aabbBottom(),
                    left = this.aabbLeft(), right = this.aabbRight();
            if (tilemap.orientation === "isometric") {
                yStart = tilemap.getMapIsoY(right, top);
                yEnd = tilemap.getMapIsoY(left, bottom);
                xStart = tilemap.getMapIsoX(left, top);
                xEnd = tilemap.getMapIsoX(right, bottom);
            }
            else {
                yStart = tilemap.getMapY(top);
                yEnd = tilemap.getMapY(bottom);
                xStart = tilemap.getMapX(left);
                xEnd = tilemap.getMapX(right);
            }

            for (var row = yStart; row <= yEnd; row++) {
                for (var col = xStart; col <= xEnd; col++) {
                    var tile = tilemap.getTile(col, row);
                    if (tile && tile.collides) {
                        if (this.collidesWithEntity(tile)) {
                            this.collideWithTile(tile, this.response);
                        }
                    }
                }
            }
        }
        if (this.gravitySet) {
            this.processTiles();
            if (this.velocity.len2()) {
                if (!this.wall)
                    this.setX(x);
                if (!this.ground && !this.ceiling)
                    this.setY(y);
            }
        }
        this._processStaticImpulse(this._collisionNormal);
    },
    collideWithTile: function(other, response) {
        this.collisionTiles.push(other);
        if (!this.response.overlap)
            return;
        this.collided = true;
        this.setPositionRelative(-this.response.overlapV.x, -this.response.overlapV.y);
        this.synchCollisionPolygon();
        this._collisionNormal.copy(this.response.overlapN);
    },
    processTiles: function() {
        for (var i = 0, len = this.collisionTiles.length; i < len; i++) {
            var entity = this.collisionTiles[i];
            var response = this.response;
            if (!this.standing &&
                    this.collidesWithEntityAtOffset(entity, this.gravityN[this.gH], this.gravityN[this.gV])) {
                if (response.overlap) {
                    if (response.overlapN[this.gV] === this.gravityN[this.gV] && this.velocity[this.gV] / this.gravityN[this.gV] >= 0) {
                        this._processVelocity(this.gV);
                    }
                    this.ground = entity;
                    this._processStanding(response.overlapN);
                }
            }
            else if (!this.ceiling && this.collidesWithEntityAtOffset(entity, this.gravityN[this.gH], -this.gravityN[this.gV])) {
                if (response.overlap) {
                    this.ceiling = entity;
                    if (response.overlapN[this.gV] === -this.gravityN[this.gV] && this.velocity[this.gV] / this.gravityN[this.gV] < 0) {
                        this._processVelocity(this.gV);
                    }
                }
            }
            if (!this.velocity[this.gH])
                continue;
            var sign = this.velocity[this.gH] / this.gravityN[this.gH] < 0 ? -1 : 1;
            if (!this.wall &&
                    this.collidesWithEntityAtOffset(entity, sign * this.gravityN[this.gV], this.gravityN[this.gH])) {
                if (response.overlap) {
                    if (response.overlapN[this.gH].abs() === this.gravityN[this.gV].abs() && this.velocity[this.gH]) {
                        this._processVelocity(this.gH);
                        this.wall = entity;
                    }
                }
            }
        }
        this.collisionTiles.length = 0;
    },
    _processVelocity: function(orientation) {
        if (this.velocity[orientation].abs() > this.bounceTreshold) {
            this.velocity[orientation] = -this.velocity[orientation] * this.elasticity;
        } else {
            this.velocity[orientation] = 0;
        }
    },
    processSpriteCollisions: function() {
        var entities = this.scene.sprites;
        for (var i = 0, len = entities.length; i < len; i++) {
            var other = entities[i];
            if (other.collides && other !== this) {
                // Bitmasks. Currently inactive. DO NOTE DELETE!
//                if (typeof o1.collisionType === "undefined" || typeof o2.collisionType === "undefined" ||
//                        o1.collidesWith & o2.collisionType || o2.collidesWith & o1.collisionType) {
//                }                
                if (this.collidesWithEntity(other)) {
                    other.collisionResponse === "static" ? this.collideWithStatic(other, this.response) :
                            this.collideWithKinematic(other, this.response);
//                    }
                }
            }
        }
        this._processStaticImpulse(this._collisionNormal);
    },
    collideWithStatic: function(other, response) {
        if (!response.overlap)
            return;

        this.collided = true;

        if (this.collisionResponse === "sensor") {
            return;
        }

        this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
        this.synchCollisionPolygon();

        this._collisionNormal.copy(this.response.overlapN);
        if (this.gravitySet)
            this._processStanding(response.overlapN);
    },
    _processStaticImpulse: function(overlapN) {
        this._vector.copy(this.velocity).reverse();
        if (this._vector.dot(overlapN) < 0) {
            this._vector.project(overlapN);
            this._vector.x *= -(1 + (this._vector.x.abs() >= this.bounceTreshold ? this.elasticity : 0));
            this._vector.y *= -(1 + (this._vector.y.abs() >= this.bounceTreshold ? this.elasticity : 0));
            this.velocity.sub(this._vector);
        }
    },
    collideWithKinematic: function(other, response) {
        if (!response.overlap)
            return;

        this.collided = true;

        if (this.collisionResponse === "sensor" || other.collisionResponse === "sensor" || other.collisionResponse === "lite")
            return;

        if (this.collisionResponse === "lite") {
            this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
            this.synchCollisionPolygon();

            this._collisionNormal.copy(this.response.overlapN);
            if (this.gravitySet)
                this._processStanding(response.overlapN);

            return;
        }

        else if (this.collisionResponse === "active" || (this.collisionResponse === "passive" && other.collisionResponse === "active")) {
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
                this._processKinematicImpulse(response.overlapN, velocityDiff, other);
                other._processKinematicImpulse(other._collisionNormal, other._vector, this);
            }
        }
    },
    _processKinematicImpulse: function(collisionNormal, velocityDiff, other) {
        // Calculate the impulse
        // I = -(1 + e) * (((Vb - Va) dot N) * N) * (Mb / (Ma + Mb))
        velocityDiff.project(collisionNormal);

        velocityDiff.x *= -(1 + (velocityDiff.x.abs() >= this.bounceTreshold ? this.elasticity : 0));
        velocityDiff.y *= -(1 + (velocityDiff.y.abs() >= this.bounceTreshold ? this.elasticity : 0));

        velocityDiff.scale(other.mass / (this.mass + other.mass));

        this.velocity.sub(velocityDiff);

        if (this.gravitySet) {
            if (collisionNormal[this.gV] === this.gravityN[this.gV] && this.velocity[this.gV] / this.gravityN[this.gV] >= 0) {
                if (this.velocity[this.gV].abs() < this.bounceTreshold) {
                    this.velocity[this.gV] = 0;
                }
            }
            this._processStanding(collisionNormal);
        }
    },
    _processStanding: function(overlapN) {
        if (overlapN.dot(this.gravityN) > 0) {
            this.slopeNormal.x = overlapN.x;
            this.slopeNormal.y = overlapN.y;
            if (overlapN[this.gH] > -this.slopeOffset && overlapN[this.gH] < this.slopeOffset) {
                this.standing = true;
            }
        }
    }
});