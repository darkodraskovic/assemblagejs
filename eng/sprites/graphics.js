DODO.Graphics = DODO._Graphics.extend({
    init: function (parent, x, y, props) {
        _.extend(this, props);
        this._super();
        
        if (this.polygon) {
            var polygon = DODO.SATPolygonToPIXIPolygon(this.polygon);
            DODO.drawPolygon(this, polygon, props && props.style);
            delete this.polygon, delete this.style;
        }
        this.initializeSprite(parent, x, y);
    }
});

DODO.Text = DODO._Text.extend({
    init: function (parent, x, y, props) {
        _.extend(this, props);
        this._super();
        
        this.text = props.text || this.text;
        this.style = props.style || this.style;
        
        this.initializeSprite(parent, x || 0, y || 0);
    }
});
