A_.LEVEL.LevelManager = Class.extend({
    init: function () {
        this.mapsData = {};
        this.levels = {};
    },
    loadAssets: function (data, callback) {
        if (!data) {
            data = {
                name: "empty",
                type: "generic",
                directoryPrefix: "",
                scripts: [],
                map: "",
                graphics: [],
                sounds: [],
            };
        }
        this.data = data;
        this.callback = callback;

        this.activateAssetsLoader();
    },
    activateAssetsLoader: function () {
        this.loader = new A_.LEVEL.Loader(this.data.directoryPrefix);
        this.loader.loadScripts(this.onScriptsLoaded.bind(this), this.data.scripts);
    },
    onScriptsLoaded: function () {
        window.console.log("Loaded scripts");
        this.loader.loadMap(this.onMapLoaded.bind(this), this.data.map);
    },
    onMapLoaded: function () {
        window.console.log("Loaded map");
        this.mapsData[this.data.name] = this.loader.mapDataParsed;
        this.loader.loadGraphics(this.onGraphicsLoaded.bind(this), this.data.graphics);
    },
    onGraphicsLoaded: function () {
        window.console.log("Loaded graphics");
        this.loader.loadSounds(this.onSoundsLoaded.bind(this), this.data.sounds);
    },
    onSoundsLoaded: function () {
        window.console.log("Loaded sounds");

        this.loader = null;
        this.data = null;

        if (this.callback)
            this.callback();
    },
    createLevel: function (data) {
        var level = new A_.LEVEL.Level();
        level.data = data;

        level.name = level.data.name;
        this.levels[level.name] = level;

        level.directoryPrefix = level.data.directoryPrefix + "/";

        level.cameraOptions = level.data.camera;
        level.createCamera();

        if (A_.game.debug)
            level.createDebugLayer();

        if (level.data.type === "tiled") {
            window.console.log("Created TILED LEVEL :)");
            A_.TILES.createTiledMap(this.mapsData[level.name], level);
            A_.game.createEntities(this.spritesToCreate, level);
            A_.game.createEntities(this.tilesToCreate, level);
        }
        else {
            window.console.log("Created GENERIC LEVEL :)");
            level.createDummyLayer();
        }


        return level;
    },
    activateLevel: function (level) {
        this.level = level;
        A_.level = level;

        this.collider = level.collider;
        A_.collider = level.collider;

        this.level.setScale(this.level.scale);

        A_.game.stage.addChild(this.level.container);
        window.console.log("Level STARTS...");

        A_.game.start();
    },
    deactivateLevel: function () {
        this.collider = null;
        A_.collider = null;

        A_.game.stage.removeChild(this.level.container);

        this.level = null;
        A_.level = null;
    },
    destroyLevel: function (level) {
        delete this.mapsData[level.name];

        this.stage.removeChild(level.container);

        this.destroySounds(level);

        delete this.levels[level.name];
    }
});