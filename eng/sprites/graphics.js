DODO.Graphics = DODO.Sprite.extend({
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.sprite = new PIXI.Graphics();
        if (this.polygon) {
            var polygon = DODO.SATPolygonToPIXIPolygon(this.polygon);
            DODO.drawPolygon(this.sprite, polygon, props && props.style);
	    delete this.polygon, delete this.style;
        }
        this.initializeSprite(parent, x, y);
    }
});

DODO.Text = DODO.Sprite.extend({
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);
        this.sprite = new PIXI.Text(props.text || "Text", props && props.style);
	delete this.style;
        this.initializeSprite(parent, x, y);
    }
});
