A_.Game = Class.extend({
    isRunning: false,
    init: function () {
        this.createRenderer(A_.CONFIG.screen, A_.CONFIG.renderer);

        this.levelManager = new A_.LEVEL.LevelManager(this);

        this.debug = A_.CONFIG.debug;

        this.time = new Date().getTime();
        this.dt = new Date().getTime();
        // Cf. run.js
        requestAnimFrame(runGame);
    },
    createRenderer: function (screenOptions, rendererOptions) {
        this.stage = new PIXI.Stage(screenOptions.color);
        this.renderer = PIXI.autoDetectRenderer(screenOptions.width, screenOptions.height, rendererOptions);
        document.body.appendChild(this.renderer.view);
    },
    // GAME LOOP
    stop: function (callback) {
        if (this.isRunning) {
            this.isRunning = false;
            this.stopped = true;
            this.onStoppedCallback = callback;
        }
    },
    onStopped: function () {
        window.console.log("game stopped");
        if (this.onStoppedCallback) {
            this.onStoppedCallback();
            this.onStoppedCallback = null;
        }
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
//            return;
        }
        else {
            var now = new Date().getTime();
            this.dt = now - this.time;
            this.time = now;
            this.dt /= 1000;

            this.levelManager.activeLevel.update();

            A_.INPUT.reset();
        }

        this.renderer.render(this.stage);
    }
});

function runGame() {
    A_.game.run();

    requestAnimFrame(runGame);
}

