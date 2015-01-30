A_.Game = Class.extend({
    isRunning: false,
    init: function () {
        this.createRenderer();

        // Level management
        this.levels = {};
        this.mapsData = {};
        this.level = null;

        this.levelManager = new A_.LEVEL.LevelManager(this);

        this.debug = A_.CONFIG.debug;

        this.time = new Date().getTime();
        this.dt = new Date().getTime();
        // Cf. run.js
        requestAnimFrame(runGame);
    },
    createRenderer: function () {
        this.rendererOptions = A_.CONFIG.renderer;
        this.screen = A_.CONFIG.screen;

        this.stage = new PIXI.Stage(this.screen.color);
        this.renderer = PIXI.autoDetectRenderer(this.screen.width, this.screen.height, this.rendererOptions);
        document.body.appendChild(this.renderer.view);
//        A_.renderer = this.renderer;
    },
    // GAME LOOP
    stop: function () {
        if (this.isRunning) {
            this.isRunning = false;
            this.stopped = true;
        }
    },
    onStopped: function () {
        window.console.log("stopped");
    },
    start: function () {
        if (!this.isRunning) {
            this.time = new Date().getTime();
            this.isRunning = true;
        }
    },
    run: function () {
        if (!this.isRunning) {
            if (this.stopped) {
                this.stopped = false;
                this.onStopped();
            }
            return;
        }

        var now = new Date().getTime();
        this.dt = now - this.time;
        this.time = now;
        this.dt /= 1000;

        this.levelManager.level.update();

        this.renderer.render(this.stage);

        A_.INPUT.reset(this.levelManager.level);

        // State changed during the game loop
        if (!this.isRunning) {
            this.onStopped();
        }
    }
});
