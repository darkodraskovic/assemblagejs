var Diskette = A_.SPRITES.Kinematic.extend({
    spriteSheet: "diskette/diskette.png",
    collisionResponse: "active",
    drawCollisionPolygon: false,
    elasticity: 0.5,
//    elasticity: 0,
    springForce: 650,
    springScan: 1,
    bounceTreshold: 200,
    frameWidth: 32,
    frameHeight: 32,
    insertingFrameCount: 0,
//    origin: new PIXI.Point(0.5, 0.5),
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 8;
        this.friction.y = 0;
        this.setGravity(0, 20, 60);
        this.maxVelocity.x = 600;
        this.maxVelocity.y = 800;
        this.dynamicsMap = this.level.findLayerByName("Dynamics").tilemap;
        this.addAnimation("inserting", _.range(0, 10), 0.2);
        this.springSound = this.level.createSound({
            urls: ['diskette/bounce.ogg'],
            volume: 1
        });
    },
    update: function () {
        if (this.inserting) {
            if (this.currentAnimation.currentFrame.floor() !== this.insertingFrameCount % this.currentAnimation.totalFrames) {
                this.insertingFrameCount++;
            }
            if (this.insertingFrameCount >= this.currentAnimation.totalFrames * 2 + 6) {
                this.currentAnimation.stop();
                this.destroy();
            }
            return;
        }
        var spring = this.detectDynamics();
        if (spring)
            this.processDynamics(spring);

        if (this.name === "Springer") {
//            window.console.log(this.velocity.y);
//            window.console.log(spring);
        }
        
        if (!this.standing) {
            this.friction.x = 4;
        }
        else {
            this.friction.x = 10;
        }
        this._super();
    },
    detectDynamics: function () {
        var tile = this.dynamicsMap.getTileAt(this.getX(), this.getBottom() + this.springScan);
        if (tile && this.velocity.y <= 0 &&
                (tile.gid === Dynamics.U_SPRING || tile.gid === Dynamics.UL_SPRING || tile.gid === Dynamics.UR_SPRING)) {
            return tile.gid;
        }
        tile = this.dynamicsMap.getTileAt(this.getRight() + this.springScan, this.getY());
        if (tile && this.velocity.x <= 0 &&
                (tile.gid === Dynamics.L_SPRING || tile.gid === Dynamics.UL_SPRING)) {
            return tile.gid;
        }
        tile = this.dynamicsMap.getTileAt(this.getLeft() - this.springScan, this.getY());
        if (tile && this.velocity.x >= 0 &&
                (tile.gid === Dynamics.R_SPRING || tile.gid === Dynamics.UR_SPRING)) {
            return tile.gid;
        }
    },
    processDynamics: function (spring) {
        if (spring === Dynamics.U_SPRING) {
            this.velocity.y = -this.springForce;
        }
        else if (spring === Dynamics.L_SPRING) {
            this.velocity.x = -this.springForce;
        }
        else if (spring === Dynamics.R_SPRING) {
            this.velocity.x = this.springForce;
        }
        else if (spring === Dynamics.UL_SPRING) {
            this.velocity.y = -this.springForce;
            this.velocity.x = -this.springForce;
        }
        else if (spring === Dynamics.UR_SPRING) {
            this.velocity.y = -this.springForce;
            this.velocity.x = +this.springForce;
        }
        this.springSound.play();
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);

    },
    collideWithKinematic: function (other, response) {
        var elasticity = this.elasticity;
        if ((other instanceof Diskette) &&
                response.overlap) {
            if (Math.abs(response.overlapN.x) === 1 && this.velocity.x.abs() > this.bounceTreshold) {
                this.elasticity = 2;
            }
        }
        this._super(other, response);
        this.elasticity = elasticity;

        if (other instanceof Computer && response.aInB) {
            this.setAnimation("inserting");
            this.inserting = true;
//            this.setPosition(other.getSlotX(), other.getSlotY());
            this.setX(other.getSlotX());
            this.collides = false;
        }
    }
});