var Poly = A_.SPRITES.Sprite.extend({
//    graphcis: true,
    init: function (parent, x, y, props) {
        this.graphics = true;
        this._super(parent, x, y, props);

        this.bodyDef = new Box2D.b2BodyDef();
        this.bodyDef.set_type(Box2D.b2_dynamicBody);
        this.body = world.CreateBody(this.bodyDef);

        var circleShape = new Box2D.b2CircleShape();
        circleShape.set_m_radius(0.5);
//        this.body.CreateFixture(circleShape, 1.0);

        var fixtureDef = new Box2D.b2FixtureDef();
        fixtureDef.set_density(2.5);
        fixtureDef.set_friction(0.6);
        fixtureDef.set_shape(circleShape);
        this.body.CreateFixture(fixtureDef);
    },
    update: function () {
       this.setRotation(this.getRotation() + Math.PI * A_.game.dt);  
    }
});

var Ground = A_.SPRITES.Sprite.extend({
//    graphcis: true,
    init: function (parent, x, y, props) {
        this.graphics = true;
        this._super(parent, x, y, props);
        this.body = world.CreateBody(new Box2D.b2BodyDef());
    }
});


var world = new Box2D.b2World(new Box2D.b2Vec2(0.0, -10.0));