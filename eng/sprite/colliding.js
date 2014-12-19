A_.SPRITES.Colliding = A_.SPRITES.Animated.extend({
    collides: true,
    drawDebugGraphics: true,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);

        this.prevOverlapN = new SAT.Vector(0, 0);
    },
    createCollisionPolygon: function (polygon) {
        if (!this.collision)
            this.collision = {};

        if (!this.collision.size)
            this.collision.size = {};
        if (!this.collision.size.w)
            this.collision.size.w = this.sprite.width;
        if (!this.collision.size.h)
            this.collision.size.h = this.sprite.height;

        if (!this.collision.offset) {
            this.collision.offset = {};
        }
        if (!this.collision.offset.x) {
            this.collision.offset.x = 0;
        }
        if (!this.collision.offset.y) {
            this.collision.offset.y = 0;
        }

        if (!this.collisionPolygons) {
            this.collisionPolygons = [];
        }
        var w = this.collision.size.w;
        var h = this.collision.size.h;

        var offsetX = this.collision.offset.x;
        var offsetY = this.collision.offset.y;

        var collisionPolygon;

        if (!polygon) {
            offsetX -= w / 2;
            offsetY -= h / 2;
            var box = new SAT.Box(new SAT.Vector(0, 0), w, h);
            collisionPolygon = box.toPolygon();
//            collisionPolygon.w = box.w;
//            collisionPolygon.h = box.h;
            collisionPolygon.calcSize();
        } else {
            collisionPolygon = polygon;
            offsetX += collisionPolygon.offset.x;
            offsetY += collisionPolygon.offset.y;
        }
        var offset = new SAT.Vector(offsetX, offsetY);
        collisionPolygon.setOffset(offset);

        collisionPolygon.origPoints = _.map(collisionPolygon.points, function (point) {
            return point.clone();
        });
        collisionPolygon.origOffset = collisionPolygon.offset.clone();
        collisionPolygon.origW = collisionPolygon.w;
        collisionPolygon.origH = collisionPolygon.h;

        collisionPolygon.scale = new SAT.Vector(1, 1);

//        if (this.interacts)
//            this.sprite.hitArea = A_.POLYGON.Utils.SATPolygonToPIXIPolygon(collisionPolygon, false);

//        collisionPolygon.baked = A_.POLYGON.Utils.SATPolygonToPIXIPolygon(collisionPolygon, false);

        this.collisionPolygons.push(collisionPolygon);
        return collisionPolygon;
    },
    destroyCollisionPolygon: function (collisionPolygon) {
        if (_.contains(this.collisionPolygons, collisionPolygon)) {
            this.collisionPolygons.splice(this.collisionPolygons.indexOf(collisionPolygon), 1);
        }
        if (this.collisionPolygon === collisionPolygon)
            this.collisionPolygon = null;
    },
    setCollision: function (polygon) {
        this.collisionPolygon = this.createCollisionPolygon(polygon);
        this.setCollisionResponse();
        this.setCollisionDebug();
    },
    setCollisionResponse: function () {
        var collider = A_.collider;

        if (this.collides || this.collision.response) {
            this.collides = true;
            if (!this.collision.response) {
                this.collision.response = "sensor";
                collider.collisionDynamics.push(this);
            } else {
                if (this.collision.response === "static")
                    collider.collisionStatics.push(this);
                else
                    collider.collisionDynamics.push(this);
            }
            collider.collisionSprites.push(this);
        }
    },
    setCollisionDebug: function () {
        if (this.drawDebugGraphics && A_.game.debug) {
            this.debugGraphics = new PIXI.Graphics();
            A_.collider.debugLayer.addChild(this.debugGraphics);
        }
    },
    removeCollision: function () {
        this.removeCollisionResponse();
        this.removeCollisionDebug();
        this.destroyCollisionPolygon(this.collisionPolygon)
    },
    removeCollisionResponse: function () {
        var collider = A_.collider;
        if (_.contains(collider.collisionSprites, this)) {
            collider.collisionSprites.splice(collider.collisionSprites.indexOf(this), 1);
        }
        if (_.contains(collider.collisionDynamics, this)) {
            collider.collisionDynamics.splice(collider.collisionDynamics.indexOf(this), 1);
        }
        if (_.contains(collider.collisionStatics, this)) {
            collider.collisionStatics.splice(collider.collisionStatics.indexOf(this), 1);
        }
    },
    removeCollisionDebug: function () {
        if (this.debugGraphics) {
            A_.collider.debugLayer.removeChild(this.debugGraphics);
            this.debugGraphics = null;
        }
    },
    setSlope: function () {
        this.slopeAngle = this.collisionPolygon.diagonalAngle;
        this.slopeFactor = 1 - (this.slopeAngle / (Math.PI / 2));
        var colPol = this.collisionPolygon;
        if (_.find(colPol.points, function (point) {return point.x === colPol.minX && point.y === colPol.minY})) {
            this.slopeRiseDirection = "left";
            this.slopeAngle += Math.PI / 2;
        }
        else {
            this.slopeRiseDirection = "right";
        }
        this.slopeSet = true;
    },
    update: function () {
        this._super();
    },
    drawDebug: function () {
        var debugGraphics = this.debugGraphics;
        if (this.drawDebugGraphics && debugGraphics) {
            debugGraphics.clear();
            A_.POLYGON.Utils.drawSATPolygon(debugGraphics, this.collisionPolygon);
        }
    },
    postupdate: function () {
        this._super();
    },
    collideWithStatic: function (other, response) {
        this.prevOverlapN = response.overlapN;
        this.collided = true;

        if (this.collision.response !== "sensor")
            this.positionRelative(-response.overlapV.x, -response.overlapV.y);
    },
    collideWithDynamic: function (other, response) {
        this.prevOverlapN = response.overlapN;
        this.collided = true;
        var thisResponse = this.collision.response;
        var otherResponse = other.collision.response;

        if (thisResponse === "static") {
            return;
        }
        else if (thisResponse === "sensor") {
            return;
        } else {
            if (otherResponse === "active") {
                if (thisResponse === "active" || thisResponse === "passive") {
                    if (this.collisionPolygon === response.a) {
                        this.positionRelative(-response.overlapV.x * 0.5,
                                -response.overlapV.y * 0.5);
                    } else {
                        this.positionRelative(response.overlapV.x * 0.5,
                                response.overlapV.y * 0.5);
                    }
                }
                else if (thisResponse === "light") {
                    if (this.collisionPolygon === response.a) {
                        this.positionRelative(-response.overlapV.x, -response.overlapV.y);
                    } else {
                        this.positionRelative(response.overlapV.x, response.overlapV.y);
                    }
                }
            }
            else if (otherResponse === "passive") {
                if (thisResponse === "active") {
                    if (this.collisionPolygon === response.a) {
                        this.positionRelative(-response.overlapV.x * 0.5,
                                -response.overlapV.y * 0.5);
                    } else {
                        this.positionRelative(response.overlapV.x * 0.5,
                                response.overlapV.y * 0.5);
                    }
                }
            }
        }
    },
    containsPoint: function (x, y) {
        var response = new SAT.Response();
        var contains = SAT.pointInPolygon(new SAT.Vector(x, y), this.collisionPolygon);
        if (contains) {
            return response;
        } else {
            return false;
        }
    },
    position: function (x, y) {
        if (typeof x === "number" && typeof y === "number") {   
            this._super(x, y);
            if (this.collisionPolygon) {
                this.collisionPolygon.pos.x = x;
                this.collisionPolygon.pos.y = y;
//                this.collisionPolygon.pos.x = this.positionLevel().x;
//                this.collisionPolygon.pos.y = this.positionLevel().y;
            }
        }
        else
            return this._super();
    },
    scale: function (x, y) {
        if (x && y) {
            this._super(x, y);
            if (this.collisionPolygon) {
                this.collisionPolygon.setScale(x, y);
            }
        }
        else
            return this._super();
    },
    size: function (x, y) {
        if (typeof x !== "number" || typeof y !== "number")
            return this._super();
        this._super(x, y);
        if (this.collisionPolygon) {
            x = x / this.frame.w;
            y = y / this.frame.w;
            this.collisionPolygon.setScale(x, y);
        }
    },
    width: function (w) {
        if (typeof w !== "number")
            return this._super();
        this._super(w);
        if (this.collisionPolygon) {
            w /= this.frame.w;
            this.collisionPolygon.setScale(w, this.collisionPolygon.scale.y);
        }
    },
    height: function (h) {
        if (typeof h !== "number")
            return this._super();
        this._super(h);
        if (this.collisionPolygon) {
            h = h / this.frame.h;
            this.collisionPolygon.setScale(this.collisionPolygon.scale.x, h);
        }
    },
    rotation: function (n) {
        if (n) {
            this._super(n);
            if (this.collisionPolygon)
                this.collisionPolygon.setAngle(this.rotation());
        } else
            return this._super();
    }
});