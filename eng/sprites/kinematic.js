A_.SPRITES.Kinematic = A_.SPRITES.Colliding.extend({
    isMoving: false,
    elasticity: 0,
    angularSpeed: 0,
    impulseTreshold: 10,
    bounceTreshold: 40,
    platformer: false,
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
        this._lastCollisionNormal = new SAT.Vector(0, 0);
        this.ground = null;
        this.wall = null;
    },
    setGravity: function (x, y, slopeTolerance) {
        this.gravity.x = x;
        this.gravity.y = y;
        this.gravityN.copy(this.gravity).normalize();
        this.impulseTreshold = this.gravity.len();
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
        this._lastCollisionNormal.x = 0;
        this._lastCollisionNormal.y = 0;
        this.collided = false;

        if (this.platformer) {
            this.slopeNormal.x = 0;
            this.slopeNormal.y = 0;
            this.collisionEntities.length = 0;
        }
        // Process COLLISION
        this.processSpriteCollisions();
        this.processTileCollisions();
        if (this.platformer) {
            this.processPlatformer();
        }
        this.processStaticImpulse(this._lastCollisionNormal);

        this._super();
    },
    processTileCollisions: function () {
        for (var i = 0; i < this.level.tileMaps.length; i++) {
            var tileMap = this.level.tileMaps[i];
            var yStart = tileMap.getMapY(this.aabbTop());
            var yEnd = tileMap.getMapY(this.aabbBottom());
            var xStart = tileMap.getMapX(this.aabbLeft());
            var xEnd = tileMap.getMapX(this.aabbRight());
            for (var row = yStart; row <= yEnd; row++) {
                for (var col = xStart; col <= xEnd; col++) {
                    var tile = tileMap.getTile(col, row);
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
        if (this.platformer) {
            this.collisionEntities.push(other);
        }
        
        this.collided = true;

        if (this.collisionResponse === "sensor")
            return;

        if (!response.overlap)
            return;

        this.setPositionRelative(-response.overlapV.x, -response.overlapV.y);
        this.synchCollisionPolygon();

        this._lastCollisionNormal.copy(response.overlapN);
    },
    collideWithKinematic: function (other, response) {
        if (this.platformer) {
            this.collisionEntities.push(other);
        }

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
                this.processKineticImpulse(other, response);
            }
        }
    },
    processKineticImpulse: function (other, response) {
        // Calculate the impulse
        // I = -(1 + e) * (((Vb - Va) dot N) * N) * (Mb / (Ma + Mb))
        // Calculate the velocity difference.
        // V = Vb - Va
        var velocityDiff = this._vector;
        velocityDiff.copy(other.velocity);
        velocityDiff.sub(this.velocity);
        // Resolve only if velocities are separating.
        if (velocityDiff.dot(response.overlapN) <= 0 && velocityDiff.len() > this.impulseTreshold) {
            // V' = (V dot N) * N
            velocityDiff.project(response.overlapN);
            // V'' = V' * -(1 + e); I = V'' * (Mb / (Ma + Mb))
            var impulse2 = other._vector.copy(velocityDiff).scale(-(1 + other.elasticity)).scale(this.mass / (this.mass + other.mass));
            var impulse1 = velocityDiff.scale(-(1 + this.elasticity)).scale(other.mass / (this.mass + other.mass));
            this.velocity.sub(impulse1);
            other.velocity.add(impulse2);
        }
    },
    processStaticImpulse: function (collisionNormal) {
        if (this.velocity.dot(collisionNormal) > 0 && this.velocity.len() > this.impulseTreshold) {
            // V = Vb - Va; NB: Vb.x === Vb.y === 0
            this._vector.copy(this.velocity).reverse();
            // I = -(1 + e) * (N * (V dot N)) * (Mb / (Ma + Mb)); NB: Mb === Infinity => Mb (Ma + Mb) = 1
            var impulse = this._vector.project(collisionNormal).scale(-(1 + this.elasticity));
            // R = V - I
            this.velocity.sub(impulse);
        }
    },
    processPlatformer: function () {
        this.ground = null;
        // Process the impulse only one time per tick.
        this._grounded = false;
        this.wall = null;
        this.standing = false;
        for (var i = 0, len = this.collisionEntities.length; i < len; i++) {
            var entity = this.collisionEntities[i];
            if (this.collidesWithEntityAtOffset(entity, this.gravityN[this.gH], this.gravityN[this.gV])) {
                if (this.response.overlap) {
                    // Platformer hits the ground, ie. perfectly horizontal plane.
                    if (this.response.overlapN[this.gV] === this.gravityN[this.gV] && !this._grounded) {
                        if (this.velocity[this.gV].abs() > this.bounceTreshold) {
                            this.velocity[this.gV] = -this.velocity[this.gV] * this.elasticity;
                        } else {
                            this.velocity[this.gV] = 0;
                        }
                    }
                    // See if the entity is standing.
                    this.ground = entity;
                    this._grounded = true;
                    this.slopeNormal = this.response.overlapN;
                    if (this.slopeNormal[this.gH] > -this.slopeOffset && this.slopeNormal[this.gH] < this.slopeOffset) {
                        this.standing = true;
                    }
                }
            }
            // Platformer hits the wall, ie. perfectly vertical surface.
            if (this.collidesWithEntityAtOffset(entity, -this.gravityN[this.gV], this.gravityN[this.gH]) ||
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
        }
    }
});
