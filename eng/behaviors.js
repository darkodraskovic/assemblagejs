/******************************************************************************/
/* MODULES */
/******************************************************************************/
A_.MODULES.Topdown = {
    motionState: "idle",
    motionStates: ["moving", "idle"],
    cardinalDir: "E",
    cardinalDirs: ["N", "NW", "NE", "S", "SW", "SE"],
    init: function(layer, x, y, props) {
        this._super(layer, x, y, props);
        this.force = new SAT.Vector(64, 64);
    },
    update: function() {
        if (this.motionState === "moving") {
            if (this.cardinalContains("N")) {
                this.acceleration.y = -this.force.y;
            }
            else if (this.cardinalContains("S")) {
                this.acceleration.y = this.force.y;
            } else this.acceleration.y = 0;
            if (this.cardinalContains("W")) {
                this.acceleration.x = -this.force.x;
            }
            else if (this.cardinalContains("E")) {
                this.acceleration.x = this.force.x;
            } else this.acceleration.x = 0;
        } else {
            this.acceleration.x = this.acceleration.y = 0;
        }

        this._super();
    },
    cardinalToAngle: function(car) {
        if (!car)
            car = this.cardinalDir;
        switch (car) {
            case "N":
                return -90;
                break;
            case "S":
                return 90;
                break;
            case "W":
                return -180;
                break;
            case "E":
                return 0;
                break;
            case "NW":
                return -135;
                break;
            case "NE":
                return -45;
                break;
            case "SW":
                return 135;
                break;
            case "SE":
                return 45;
                break;
            default :
                return 0;
        }
    },
    cardinalContains: function(cont, car) {
        if (!car)
            car = this.cardinalDir;

        if (car.indexOf(cont) > -1) {
            return true;
        }
    }
}

A_.MODULES.TopdownWASD = {
    init: function(layer, x, y, props) {
        this._super(layer, x, y, props);
        A_.INPUT.addMapping("left", A_.KEY.A);
        A_.INPUT.addMapping("right", A_.KEY.D);
        A_.INPUT.addMapping("down", A_.KEY.S);
        A_.INPUT.addMapping("up", A_.KEY.W);
    },
    update: function() {
        var cd = "";
        if (A_.INPUT.down["up"]) {
            cd = "N";
        } else if (A_.INPUT.down["down"]) {
            cd = "S";
        }
        if (A_.INPUT.down["left"]) {
            cd += "W";
        } else if (A_.INPUT.down["right"]) {
            cd += "E";
        }

        if (cd.length > 0) {
            this.motionState = "moving";
            this.cardinalDir = cd;
        } else
            this.motionState = "idle";

        this._super();
    }
};

A_.MODULES.Platformer = {
    platformerState: "grounded",
    jumpForce: 600,
    bounciness: 0,
    force: new SAT.Vector(64, 64),
    gravity: new SAT.Vector(0, 20),
    friction: new SAT.Vector(20, 0),
    maxVelocity: new SAT.Vector(400, 1000),
    init: function(layer, x, y, props) {
        this._super(layer, x, y, props);
        A_.INPUT.addMapping("left", A_.KEY.A);
        A_.INPUT.addMapping("right", A_.KEY.D);
        A_.INPUT.addMapping("jump", A_.KEY.SPACE);
    },
    update: function() {
        if (A_.INPUT.down["left"]) {
            this.acceleration.x -= this.force.x;
        }
        if (A_.INPUT.down["right"]) {
            this.acceleration.x += this.force.x;
        }
        if (A_.INPUT.down["jump"]) {
            if (this.platformerState === "grounded") {
                this.acceleration.y -= this.jumpForce;
            }
        }

        this._super();

        // STATES
        if (this.velocity.y > this.gravity.y) {
            this.platformerState = "falling";
        } else if (this.velocity.y < -this.gravity.y) {
            this.platformerState = "jumping";
        } else if (this.platformerState !== "jumping") {
            this.platformerState = "grounded";
        }
    },
    collideWithStatic: function(other, response) {
        // BUG: When jumping and going left/right into the wall, the jump is capped
        this._super(other, response);

        if (response.overlapN.y === 1) {
            this.platformerState = "grounded";
            if (this.bounciness === 0) {
                this.velocity.y = 0;
            } else {
                this.velocity.y -= this.gravity.y;
            }
        }
    }
};

A_.MODULES.pinTo = {
    init: function(layer, x, y, props) {
        this._super(layer, x, y, props);
        this.pinTo.point = this.pinTo.parent.addSpritePoint(this.pinTo.name,
                this.pinTo.offsetX, this.pinTo.offsetY);
    },
    postupdate: function() {
        this.rotation(this.pinTo.parent.rotation());
        this.position(this.pinTo.point.calcPoint.x, this.pinTo.point.calcPoint.y);

        this._super();
    }
}

/******************************************************************************/
/* EXTENSIONS */
/******************************************************************************/
A_.EXTENSIONS.Polygon = {
    addTo: function(sprite, pixiPolygon) {
        var graphics = new PIXI.Graphics();
//        sprite.graphics.beginFill(0xFFFF00);
        graphics.lineStyle(4, 0x00FF00);
        graphics.drawPolygon(pixiPolygon.points);

        sprite.sprite.addChild(graphics);
        sprite.graphics = graphics;
    }
};

A_.EXTENSIONS.Sine = {
    addTo: function(sprite, props) {
        sprite.sine = {};
        for (var prop in props) {
            sprite.sine[prop] = props[prop];
        }

        sprite.sine.angle = 0;
        sprite.sine.positive = true;

        if (typeof sprite.sine.value === 'undefined')
            sprite.sine.value = 12; // in units (pixels, scale, etc.)
        sprite.sine.currentValue = sprite.sine.value;
        if (typeof sprite.sine.valueRand === 'undefined')
            sprite.sine.valueRand = 50; // in %

        if (sprite.sine.period === 'undefined')
            sprite.sine.period = 2; // in sec
        sprite.sine.currentPeriod = sprite.sine.period;
        sprite.sine.speed = (2 * Math.PI) / sprite.sine.period;
        if (sprite.sine.periodRand === 'undefined')
            sprite.sine.periodRand = 50; // in %

        sprite.sine.computeValue = function() {
            var sin = Math.sin(this.angle += this.speed * A_.game.dt);

            if (sin < 0) {
                this.positive = false;
            }
            else if (sin > 0) {
                if (!this.positive) { // The new period begins...
                    this.positive = true;

                    var periodRand = _.random(-this.periodRand, this.periodRand);
                    if (periodRand)
                        periodRand /= 100;
                    this.currentPeriod = this.period + this.period * periodRand;
                    this.speed = (2 * Math.PI) / this.currentPeriod;

                    var valueRand = _.random(-this.valueRand, this.valueRand);
                    if (valueRand)
                        valueRand /= 100;
                    this.currentValue = this.value + this.value * valueRand;
                }
            }
            return this.currentValue * sin;
        };
    }
};

