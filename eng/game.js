DODO.Game = DODO.Evented.extend({
    init: function () {
        DODO.game = this;
        this.createRenderer(DODO.config.screen, DODO.config.renderer);
        this.loader = new DODO.Loader();
        this.sceneManager = new DODO.SceneManager(this);
        this.maxTick = 50;        
        this.play();
        requestAnimationFrame(runGame);
    },
    createRenderer: function (screenOptions, rendererOptions) {
        this.stage = new PIXI.Container();
        this.renderer = PIXI.autoDetectRenderer(screenOptions.width, screenOptions.height, rendererOptions);
        
        var view = this.renderer.view;
        document.body.appendChild(view);
        DODO.input.initMouse(view);
        DODO.input.disableContextMenu(view)
        window.onresize = this.onResizeWindow.bind(this, view);
        this.onResizeWindow(view);
    },
    onResizeWindow: function (canvas) {
        canvas.style.position = "absolute";
        canvas.style.top = window.innerHeight / 2 - this.renderer.height / 2;
        canvas.style.left = window.innerWidth / 2 - this.renderer.width / 2;
    },
    // GAME LOOP
    play: function () {
        if (!this.running) {
            this.time = new Date().getTime();
            this.running = true;
        }
    },
    pause: function () {
        this.running = false;
    },
    update: function () {
        if (!this.running) {
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
    DODO.game.update();
    requestAnimationFrame(runGame);
}
