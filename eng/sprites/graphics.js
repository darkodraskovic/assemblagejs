DODO.Graphics = DODO.Sprite.extend({
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        this.sprite = new PIXI.Graphics();
        if (this.polygon) {
            var polygon = DODO.SATPolygonToPIXIPolygon(this.polygon);
            DODO.drawPolygon(this.sprite, polygon, props);
        }

        this.origin = this.sprite.pivot;
        this.initializeSprite(parent, x, y);
    }
});

DODO.Text = DODO.Sprite.extend({
    init: function(parent, x, y, props) {
        this._super(parent, x, y, props);

        this.sprite = new PIXI.Text(props.text || "Text",
                {font: props.font || "Bold 25px Courier New", fill: props.fill || "Black",
                    align: props.align || "left", 
                    stroke: props.stroke || "LightGrey", strokeThickness: props.strokeThickness || 0,
                    wordWrap: props.wordWrap || false, wordWrapWidth: props.wordWrapWidth || 100,
                    dropShadow: props.dropShadow || true, 
                    dropShadowColor: props.dropShadowColor || '#444444', 
                    dropShadowAngle: props.dropShadowAngle || Math.PI / 4, 
                    dropShadowDistance: props.dropShadowDistance || 3}
        );

        this.origin = this.sprite.pivot;
        this.initializeSprite(parent, x, y);
    }
});
