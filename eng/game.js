A_.Game = Class.extend({
    init: function () {
        this.createRenderer(A_.CONFIG.screen, A_.CONFIG.renderer);

        this.levelManager = new A_.LEVEL.LevelManager(this, A_.LEVEL.Manifests);

        this.debug = A_.CONFIG.debug;

        this.time = new Date().getTime();
        this.dt = new Date().getTime();
        this.maxTick = 50;

        this.running = true;
        // Cf. run.js
        requestAnimFrame(runGame);
    },
    createRenderer: function (screenOptions, rendererOptions) {
        this.stage = new PIXI.Stage(screenOptions.color);
        this.renderer = PIXI.autoDetectRenderer(screenOptions.width, screenOptions.height, rendererOptions);
        document.body.appendChild(this.renderer.view);
        // Prevent the right click context menu.
        this.renderer.view.oncontextmenu = function (e) {
            e.preventDefault();
        };
        window.onresize = this.onResizeWindow.bind(this);
        this.onResizeWindow();
    },
    onResizeWindow: function () {
        this.renderer.view.style.position = "absolute";
        this.renderer.view.style.top = window.innerHeight / 2 - this.renderer.height / 2;
        this.renderer.view.style.left = window.innerWidth / 2 - this.renderer.width / 2;
    },
    // GAME LOOP
    play: function () {
        if (!this.running) {
            this.time = new Date().getTime();
            this.running = true;
        }
    },
    pause: function (callback) {
        if (this.running) {
            this.running = false;
            this.stopped = true;
            this.onPausedCallback = callback;
        }
    },
    onPaused: function () {
        window.console.log("game stopped");
        if (this.onPausedCallback) {
            this.onPausedCallback();
            this.onPausedCallback = null;
        }
    },
    run: function () {
        if (!this.running) {
            if (this.stopped) {
                this.stopped = false;
                this.onPaused();
            }
        }
        else {
            var now = new Date().getTime();
            var dt = now - this.time;
            this.dt = dt;
            if (dt > this.maxTick)
                dt = this.maxTick;
            this.time = now;
            this.dt = dt / 1000;

            this.levelManager._updateLevels();

            A_.INPUT.reset();
        }

        this.renderer.render(this.stage);
    }
});

function runGame() {
    A_.game.run();

    requestAnimFrame(runGame);
}

