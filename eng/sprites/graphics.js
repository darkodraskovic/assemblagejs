DODO.Graphics = DODO.Sprite.extend({
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.sprite = new PIXI.Graphics();
        if (this.polygon) {
            this.polygon = DODO.SATPolygonToPIXIPolygon(this.polygon);
            DODO.drawPolygon(this.sprite, polygon, props && props.style);
        }
        this.initializeSprite(parent, x, y);
    }
});

DODO.Text = DODO.Sprite.extend({
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.sprite = new PIXI.Text(props.text || "Text", props && props.style);
        this.initializeSprite(parent, x, y);
    }
});
