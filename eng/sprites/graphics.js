DODO.Graphics = PIXI.Graphics.extend({
    init: function (parent, x, y, props) {
        _.extend(this, props);
        PIXI.Graphics.call(this);

        if (this.polygon) {
            var polygon = DODO.SATPolygonToPIXIPolygon(this.polygon);
            DODO.drawPolygon(this, polygon, props && props.style);
            delete this.polygon, delete this.style;
        }
        this.initializeSprite(parent, x, y);
    },
    update: function () {
    }
});

DODO.Text = PIXI.Text.extend({
    init: function (parent, x, y, props) {
        _.extend(this, props);
        PIXI.Text.call(this, (props && props.text) || "Text", props && props.style);
        delete this.style;
        this.initializeSprite(parent, x || 0, y || 0);
    },
    update: function () {
    }
});
