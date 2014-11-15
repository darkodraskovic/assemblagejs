window.addEventListener("mousewheel", mouseWheelHandler, false);
function mouseWheelHandler(e) {
    var scaleDelta = 0.02;
    if (e.wheelDelta > 0) {
        game.setScale(game.scale + scaleDelta);
    } else {
        game.setScale(game.scale - scaleDelta);
    }
}

A_.Game = Class.extend({
    time: new Date().getTime(),
    dt: new Date().getTime(),
    debug: true,
    scale: 1,
    camera: null,
    collider: null,
    screenW: 800,
    screenH: 600,
    stage: null,
    stageColor: 0x757575,
    rendererOptions: {
        antialiasing: false,
        transparent: false,
        resolution: 1
    },
    renderer: null,
    gameWorld: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        clickPosition: null,
        container: null
    },
    updateSprites: [],
    spriteLayers: [],
    tileLayers: [],
    layers: [],
    init: function () {
        this.stage = new PIXI.Stage(this.stageColor);
        this.renderer = PIXI.autoDetectRenderer(this.screenW, this.screenH, this.rendererOptions);
        document.body.appendChild(this.renderer.view);

        this.gameWorld.container = new PIXI.DisplayObjectContainer();        
        this.stage.addChild(this.gameWorld.container);

        this.time = new Date().getTime();
        this.dt = new Date().getTime();
    },
    run: function () {

        var now = new Date().getTime();
        this.dt = now - this.time;
        this.time = now;
        this.dt /= 1000;

        this.processInput();

        _.each(this.updateSprites, function (sprite) {
            sprite.update();
        });

        this.collider.processCollisions();

        _.each(this.updateSprites, function (sprite) {
            sprite.postupdate();
        });

        if (this.debug) {
            this.collider.drawDebug();
        }

        this.camera.update();

        // Transform the position from container's scaled local system  
        // into stage's unscaled global system.
        this.gameWorld.container.position.x *= this.scale;
        this.gameWorld.container.position.y *= this.scale;

//        this.gameWorld.container.position.x = Math.round(this.gameWorld.container.position.x);
//        this.gameWorld.container.position.y = Math.round(this.gameWorld.container.position.y);

        this.renderer.render(this.stage);


        for (var action in A_.INPUT.actions) {
            if (A_.INPUT.pressed[action] === true) {
                A_.INPUT.pressed[action] = false;
            }
            if (A_.INPUT.released[action] === true) {
                A_.INPUT.released[action] = false;
            }
        }
    },
    setScale: function (scale) {
        if (scale > 0.25 && scale < 1.5) {
            // scale the game world according to scale
            this.gameWorld.container.scale = new PIXI.Point(scale, scale);

            // position canvas in the center of the window if...
            // console.log(gameWorld.container.width); 
            // console.log(gameWorld.container.height); 
            // BUG: wrong behavior when screenBounded === false
            // BUG: zoom/in out camera movement strange behavior
            if (this.camera.followType === "bounded") {
                if (this.gameWorld.container.width < this.renderer.view.width) {
                    this.gameWorld.x = (this.renderer.view.width - this.gameWorld.container.width) / 2;
                    this.gameWorld.x /= scale;
                }
//            else {
//		this.gameWorld.x = 0;
//	    }
                if (this.gameWorld.container.height < this.renderer.view.height) {
                    this.gameWorld.y = (this.renderer.view.height - this.gameWorld.container.height) / 2;
                    this.gameWorld.y /= scale;
                }
//            else {
//		this.gameWorld.y = 0;
//	    }
            }

            // If the world is scaled 2x, camera sees 2x less and vice versa. 
            this.camera.width = this.renderer.view.width / scale;
            this.camera.height = this.renderer.view.height / scale;

//        this.camera.centerOn(player);

            this.scale = scale;
        }
    },
    processInput: function () {
        // #docs This will return the point containing global coordinates of the mouse,
        // more precisely, a point containing the coordinates of the global InteractionData position.
        // InteractionData holds all information related to an Interaction event.
        this.gameWorld.clickPosition = this.stage.getMousePosition().clone();
        // Transform the mouse click position from the unscaled stage's global system to
        // the unscaled scaled gameWorld.container's system. 
        this.gameWorld.clickPosition.x /= this.scale;
        this.gameWorld.clickPosition.y /= this.scale;
        this.gameWorld.clickPosition.x += this.camera.x;
        this.gameWorld.clickPosition.y += this.camera.y;
    }
});