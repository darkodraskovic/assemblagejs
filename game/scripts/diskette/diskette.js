var Diskette = A_.SPRITES.Kinematic.extend({
    spriteSheet: "diskette/diskette.png",
    collisionResponse: "active",
    drawCollisionPolygon: false,
    frameWidth: 32,
    frameHeight: 32,
    elasticity: 0.5,
    springForce: 600,
    springScan: 0.1,
    init: function (parent, x, y, props) {
        this._super(parent, x, y, props);
        this.friction.x = 10;
        this.friction.y = 0;
        this.setGravity(0, 20, 60);
        this.maxVelocity.x = 600;
        this.maxVelocity.y = 800;
        this.dynamicsMap = this.level.findLayerByName("Dynamics").tilemap;

        this.springSound = this.level.createSound({
            urls: ['diskette/bounce.ogg'],
            volume: 1
        });
    },
    update: function () {
        var spring = this.detectDynamics();
        if (spring)
            this.processDynamics(spring);

        this._super();
    },
    detectDynamics: function () {
        var tile = this.dynamicsMap.getTileAt(this.getX(), this.getBottom() + this.springScan);
        if (tile &&
                (tile.gid === Dynamics.U_SPRING || tile.gid === Dynamics.UL_SPRING || tile.gid === Dynamics.UR_SPRING)) {
            return tile.gid;
        }
        tile = this.dynamicsMap.getTileAt(this.getRight() + this.springScan, this.getY());
        if (tile &&
                (tile.gid === Dynamics.L_SPRING || tile.gid === Dynamics.UL_SPRING)) {
            return tile.gid;
        }
        tile = this.dynamicsMap.getTileAt(this.getLeft() - this.springScan, this.getY());
        if (tile &&
                (tile.gid === Dynamics.R_SPRING || tile.gid === Dynamics.UR_SPRING)) {
            return tile.gid;
        }
    },
    processDynamics: function (spring) {
        if (spring === Dynamics.U_SPRING) {
            this.velocity.y -= this.springForce;
        }
        else if (spring === Dynamics.L_SPRING) {
            this.velocity.x -= this.springForce;
        }
        else if (spring === Dynamics.R_SPRING) {
            this.velocity.x += this.springForce;
        }
        else if (spring === Dynamics.UL_SPRING) {
            this.velocity.y -= this.springForce;
            this.velocity.x -= this.springForce;
        }
        else if (spring === Dynamics.UR_SPRING) {
            this.velocity.y -= this.springForce;
            this.velocity.x += this.springForce;
        }
        this.springSound.play();
    },
    collideWithStatic: function (other, response) {
        this._super(other, response);
    },
    collideWithKinematic: function (other, response) {
        var elasticity = this.elasticity;

        if (response.overlap && Math.abs(response.overlapN.x) === 1 && other instanceof Diskette) {
            this.elasticity = 2;
        }

        this._super(other, response);
        this.elasticity = elasticity;
    }
});