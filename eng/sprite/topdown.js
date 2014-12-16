A_.SPRITES.Topdown = A_.SPRITES.Kinematic.extend({
    motionState: "idle",
    motionStates: ["moving", "idle"],
    cardinalDir: "E",
    cardinalDirs: ["N", "NW", "NE", "S", "SW", "SE"],
    controlled: false,
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        this.force = new SAT.Vector(64, 64);
        if (this.controlled) {
            A_.INPUT.addMapping("left", A_.KEY.A);
            A_.INPUT.addMapping("right", A_.KEY.D);
            A_.INPUT.addMapping("down", A_.KEY.S);
            A_.INPUT.addMapping("up", A_.KEY.W);
        }
    },
    update: function () {
        if (this.controlled) {
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
        }
        
        if (this.motionState === "moving") {
            if (this.cardinalContains("N")) {
                this.acceleration.y = -this.force.y;
            }
            else if (this.cardinalContains("S")) {
                this.acceleration.y = this.force.y;
            } else
                this.acceleration.y = 0;
            if (this.cardinalContains("W")) {
                this.acceleration.x = -this.force.x;
            }
            else if (this.cardinalContains("E")) {
                this.acceleration.x = this.force.x;
            } else
                this.acceleration.x = 0;
        } else {
            this.acceleration.x = this.acceleration.y = 0;
        }

        this._super();
    },
    cardinalToAngle: function (car) {
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
    cardinalContains: function (cont, car) {
        if (!car)
            car = this.cardinalDir;

        if (car.indexOf(cont) > -1) {
            return true;
        }
    }
});
