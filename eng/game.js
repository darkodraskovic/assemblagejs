A_.Game = A_.EventDispatcher.extend({
    init: function () {
        A_.game = this;
        this.createRenderer(A_.CONFIG.screen, A_.CONFIG.renderer);
        this.loader = new A_.Loader();
        this.sceneManager = new A_.SCENE.SceneManager(this);
        this.debug = A_.CONFIG.debug;
        this.maxTick = 50;
        this.play();
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
            this.trigger('play');
        }
    },
    pause: function () {
        if (this.running) {
            this.running = false;
            this._paused = true;
        }
    },
    update: function () {
        if (!this.running) {
            if (this._paused) {
                this._paused = false;
                this.trigger('pause');
            }
            return;
        }

        var now = new Date().getTime();
        var dt = now - this.time;
        this.dt = dt;
        if (dt > this.maxTick)
            dt = this.maxTick;
        this.time = now;
        this.dt = dt / 1000;

        this.sceneManager.update();
        this.renderer.render(this.stage);
    }
});

function runGame() {
    A_.game.update();

    requestAnimFrame(runGame);
}
