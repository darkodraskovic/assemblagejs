var Ship = A_.SPRITES.ArcadeSprite.extend({
    animSheet: "spaceships.png",
    frame: {w: 98, h: 75},
    collisionResponse: "passive",
    init: function (layer, x, y, props) {
        this._super(layer, x, y, props);
        this.setAnimation("all", this.frameInd, 0);
        this.spd = 40;
        this.setRotation((_.random(0, 360)).toRad());
        this.k = 1;
        this.curSpd = {x: _.random(50, 150), y: _.random(50, 150)};
    },
    update: function () {
        this._super();
//        var dX = 0;
//        var dY = 0;
//        var ships = A_.level.findSpritesByClass(Ship);
//        ships = _.without(ships, this);
//        _.each(ships, function (ship) {
//            dX += ship.getPositionX() - this.getPositionX();
//            dY += ship.getPositionY() - this.getPositionY();
//        }, this);
//        this.rotation = Math.atan2(dY, dX) + (90).toRad();
//        this.setPositionRelative(dX * A_.game.dt * this.k, dY * A_.game.dt * this.k);

        this._super();
        var dvX = 0;
        var dvY = 0;
        var ships = A_.level.findSpritesByClass(Ship);
        ships = _.without(ships, this);
        _.each(ships, function (ship) {
            dvX += (ship.curSpd.x - this.curSpd.x) * this.k;
            dvY += (ship.curSpd.y - this.curSpd.y) * this.k;
        }, this);
        this.curSpd.x += dvX * A_.game.dt;
        this.curSpd.y += dvY * A_.game.dt;
        this.setRotation(Math.atan2(this.curSpd.y, this.curSpd.x) + (90).toRad());       
        this.setPositionRelative(this.curSpd.x * A_.game.dt, this.curSpd.y * A_.game.dt);
        
    },
});