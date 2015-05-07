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
        this.interactionManager = new PIXI.interaction.InteractionManager(this.renderer);
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
    pause: function () {
        this.running = false;
    },
    update: function () {
        if (!this.running) {
            return;
        }
//        window.console.log(this.interactionManager.eventData);
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
