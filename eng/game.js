A_.Game = Class.extend({
    debug: true,
    scale: 1,
    screenW: 800,
    screenH: 600,
    stageColor: 0x757575,
    isRunning: false,
    rendererOptions: {
        antialiasing: false,
        transparent: false,
        resolution: 1
    },
    init: function () {
        this.stage = new PIXI.Stage(this.stageColor);
        this.renderer = PIXI.autoDetectRenderer(this.screenW, this.screenH, this.rendererOptions);
        document.body.appendChild(this.renderer.view);

        var that = this;
        this.stage.mousedown = function () {
            that.leftpressed = true;
            that.leftdown = true;
        };
        this.stage.mouseup = function () {
            that.leftreleased = true;
            that.leftdown = false;
        };

        this.time = new Date().getTime();
        this.dt = new Date().getTime();

        this.assetsToLoad = null;
        this.levels = [];
        this.level = null;
        this.spritesToDestroy = [];
        this.spritesToCreate = [];

        requestAnimFrame(runGame);
    },
    setDefaultCameraOptions: function (cameraOptions) {
        this.cameraOptions = cameraOptions;
    },
    // LOAD EMPTY LEVEL
    loadEmptyLevel: function (name) {
        var level = this.addLevel(name);

        this.levelToLoad = level;
        if (this.level) {
            this.destroyLevel = true;
            this.createEmptyLevel = true;
            return;
        } else {
            this.activateEmptyLevelLoader();
        }
    },
    activateEmptyLevelLoader: function () {
        this.createLevelTemplate();

        var layer = this.level.createEmptyLayer();
        var text = new PIXI.Text("Level loaded :)", {font: "Bold 50px Courier New", fill: "Black",
            stroke: "LightGrey", strokeThickness: 0,
            dropShadow: true, dropShadowColor: '#444444', dropShadowAngle: Math.PI / 4, dropShadowDistance: 4});
        layer.addChild(text);
        text.anchor = new PIXI.Point(0.5, 0.5);
        text.position.x = this.renderer.width / 2;
        text.position.y = this.renderer.height / 2;

        this.startLevel();
    },
    // LOAD LEVEL from TILED
    loadTiledLevel: function (name) {
        if (!_.find(this.levels, function (level) {
            return level.name === name
        })) {
            this.addLevel(name, "game/levels/" + name + ".json");
        }
        var level = _.find(this.levels, function (level) {
            return level.name === name;
        });
        if (!level) {
            window.console.log("No level named " + name);
            return;
        }

        if (this.level) {
            this.destroyLevel = true;
            this.createTiledLevel = true;
            this.levelToLoad = level;
            return;
        } else {
            this.levelToLoad = level;
            this.activateTiledLevelLoader();
        }
    },
    activateTiledLevelLoader: function () {
        this.levelLoader = new A_.LevelLoader();
        this.levelLoader.loadMap(this.onMapLoaded.bind(this), this.levelToLoad.mapDataJSON);
    },
    onMapLoaded: function () {
        var assetsToLoad = fetchAssetListFromMapData(this.levelLoader.mapDataParsed);
        this.levelLoader.loadAssets(this.onAssetsLoaded.bind(this), assetsToLoad);
    },
    onAssetsLoaded: function () {
        this.onLevelLoaded();
    },
    onLevelLoaded: function () {
        this.createLevelTemplate();

        createMap(this, this.levelLoader.mapDataParsed);

        this.startLevel();
    },
    // COMMON LEVEL routines
    addLevel: function (name, mapDataJSON, cameraOptions) {
        var level = {name: name, mapDataJSON: mapDataJSON, cameraOptions: cameraOptions};
        this.levels.push(level);
        return level;
    },
    createLevelTemplate: function () {
        this.collider = new A_.Collider();
        A_.collider = this.collider;

        this.level = new A_.Level();
        A_.level = this.level;
    },
    startLevel: function () {
        if (this.levelToLoad.cameraOptions) {
            this.cameraOptions = this.levelToLoad.cameraOptions;
        }
        this.level.setupCamera(this.cameraOptions);
        this.level.camera.x = 0;
        this.level.camera.y = 0;

        if (this.debug) {
            this.collider.setDebug();
            this.level.container.addChild(this.collider.debugLayer);
        }

        this.setScale(this.scale);

        this.stage.addChild(this.level.container);

        this.levelName = this.levelToLoad.name;
        this.createTiledLevel = false;
        this.levelToLoad = null;

        this.createSprites();
        this.isRunning = true;
    },
    unloadLevel: function () {
        this.destroyLevel = true;
    },
    clearLevel: function () {
        this.collider = null;
        A_.collider = null;

        this.level = null;
        A_.level = null;

        this.levelLoader = null;

        delete(A_.game.level);
        delete(A_.game.collider);
        delete(A_.game.LevelLoader);

        this.stage.removeChildren();

        this.destroyLevel = false;
    },
    // SPRITE CREATION and DESTRUCTION
    createSprite: function (SpriteClass, layer, x, y, props, collisionPolygon) {
        if (!SpriteClass)
            return;

        if (!layer) {
            layer = this.level.layers[0];
        }


        var sprite = new SpriteClass(props);
        sprite.setCollision(collisionPolygon);

        if (this.debug) {
            sprite.debugGraphics = new PIXI.Graphics();
            this.collider.debugLayer.addChild(sprite.debugGraphics);
        }

        sprite.layer = layer;
        layer.addChild(sprite.sprite);
        sprite.setPosition(x, y);

        this.spritesToCreate.push(sprite);

        return sprite;
    },
    createSprites: function () {
        var that = this;
        _.each(this.spritesToCreate, function (sprite) {
            that.level.sprites.push(sprite);
        });
        this.spritesToCreate.length = 0;
    },
    destroySprite: function (sprite) {
        if (!_.contains(this.level.sprites, sprite))
            return;

        if (_.contains(this.collider.collisionSprites, sprite)) {
            this.collider.collisionSprites.splice(this.collider.collisionSprites.indexOf(sprite), 1);
        }

        if (sprite.collisionType) {
            switch (sprite.collisionType) {
                case "static":
                    this.collider.collisionStatics.splice(this.collider.collisionStatics.indexOf(sprite), 1);
                    break;
                case "dynamic":
                    this.collider.collisionDynamics.splice(this.collider.collisionDynamics.indexOf(sprite), 1);
                    break;
                case "sensor":
                    this.collider.collisionSensors.splice(this.collider.collisionSensors.indexOf(sprite), 1);
                    break;
            }
        }
        if (sprite.collisionPolygon) {
            delete(sprite.collisionPolygon);
        }
        if (sprite === this.level.camera.followee) {
            this.level.camera.followee = null;
        }
        // TODO: destroy collision mask

        if (sprite.debugGraphics) {
            sprite.debugGraphics.parent.removeChild(sprite.debugGraphics);
        }
        sprite.sprite.parent.removeChild(sprite.sprite);
        this.level.sprites.splice(this.level.sprites.indexOf(sprite), 1);
    },
    destroySprites: function () {
        var that = this;
        _.each(this.spritesToDestroy, function (sprite) {
            that.destroySprite(sprite)
        });
        this.spritesToDestroy.length = 0;
    },
    // GAME LOOP
    run: function () {
        if (!this.isRunning)
            return;

        var now = new Date().getTime();
        this.dt = now - this.time;
        this.time = now;
        this.dt /= 1000;

        this.processInput();

        this.update();

        this.manageSprites();

        this.render();

        this.postprocessInput();

        this.manageLevels();

    },
    processInput: function () {
        // #docs This will return the point containing global coordinates of the mouse,
        // more precisely, a point containing the coordinates of the global InteractionData position.
        // InteractionData holds all information related to an Interaction event.
        this.level.mousePosition = this.stage.getMousePosition().clone();
        // Transform the mouse position from the unscaled stage's global system to
        // the unscaled scaled gameWorld.container's system. 
        this.level.mousePosition.x /= this.scale;
        this.level.mousePosition.y /= this.scale;
        this.level.mousePosition.x += this.level.camera.x;
        this.level.mousePosition.y += this.level.camera.y;
    },
    update: function () {
        // User-defined function.
        this.preupdate();

        _.each(this.level.sprites, function (sprite) {
            sprite.update();
        });

        this.collider.processCollisions();

        _.each(this.level.sprites, function (sprite) {
            sprite.postupdate();
        });

        // User-defined function.
        this.postupdate();

        _.each(this.level.layers, function (layer) {
            if (layer["sort"]) {
                layer.children = _.sortBy(layer.children, function (child) {
                    return child.position.y;
                });
                _.each(layer.children, function (child, i) {
                    layer.setChildIndex(child, i);
                })
            }
        });
    },
    manageSprites: function () {
        this.destroySprites();
        this.createSprites();
    },
    render: function () {
        if (this.debug) {
            this.collider.drawDebug();
        }

        this.level.camera.update();

        // Transform the position from container's scaled local system  
        // into stage's unscaled global system.
        this.level.container.position.x *= this.scale;
        this.level.container.position.y *= this.scale;

//        this.gameWorld.container.position.x = Math.round(this.gameWorld.container.position.x);
//        this.gameWorld.container.position.y = Math.round(this.gameWorld.container.position.y);

        this.renderer.render(this.stage);
    },
    postprocessInput: function () {
        for (var action in A_.INPUT.actions) {
            if (A_.INPUT.pressed[action] === true) {
                A_.INPUT.pressed[action] = false;
            }
            if (A_.INPUT.released[action] === true) {
                A_.INPUT.released[action] = false;
            }
        }

        _.each(this.level.sprites, function (sprite) {
            if (sprite.interactive) {
                sprite.leftpressed = false;
                sprite.leftreleased = false;
            }
        });

        this.leftpressed = false;
        this.leftreleased = false;
    },
    manageLevels: function () {
        if (this.destroyLevel) {
            this.isRunning = false;
            this.clearLevel();
            if (this.createTiledLevel) {
                this.activateTiledLevelLoader();
            } else if (this.createEmptyLevel) {
                this.activateEmptyLevelLoader();
            }
        }
    },
    setScale: function (scale) {
        if (scale > 0.25 && scale < 1.5) {
            // scale the game world according to scale
            this.level.container.scale = new PIXI.Point(scale, scale);

            // position canvas in the center of the window if...
            // console.log(gameWorld.container.width); 
            // console.log(gameWorld.container.height); 
            // BUG: wrong behavior when screenBounded === false
            // BUG: zoom/in out camera movement strange behavior
            if (this.level.camera.followType === "bounded") {
                if (this.level.container.width < this.renderer.view.width) {
                    this.level.x = (this.renderer.view.width - this.level.container.width) / 2;
                    this.level.x /= scale;
                }
//            else {
//		this.gameWorld.x = 0;
//	    }
                if (this.level.container.height < this.renderer.view.height) {
                    this.level.y = (this.renderer.view.height - this.level.container.height) / 2;
                    this.level.y /= scale;
                }
//            else {
//		this.gameWorld.y = 0;
//	    }
            }

            // If the world is scaled 2x, camera sees 2x less and vice versa. 
            this.level.camera.width = this.renderer.view.width / scale;
            this.level.camera.height = this.renderer.view.height / scale;

//        this.camera.centerOn(player);

            this.scale = scale;
        }
    }
});

function runGame() {
    requestAnimFrame(runGame);

    if (A_.game.isRunning === true) {
        A_.game.run();
    }
}

A_.game = new A_.Game();

window.addEventListener("mousewheel", mouseWheelHandler, false);
function mouseWheelHandler(e) {
    var scaleDelta = 0.02;
    if (e.wheelDelta > 0) {
        A_.game.setScale(A_.game.scale + scaleDelta);
    } else {
        A_.game.setScale(A_.game.scale - scaleDelta);
    }
}