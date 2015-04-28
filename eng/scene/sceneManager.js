A_.SCENE.SceneManager = Class.extend({
    init: function (game) {
        this.game = game;
        this.scenes = [];
        this._scenesToDestroy = [];
        this._scenesToCreate = [];
    },
    _manageScenes: function () {
        // DESTROY scenes
        if (this._scenesToDestroy.length) {
            for (var i = 0, len = this._scenesToDestroy.length; i < len; i++) {
                var scene = this._scenesToDestroy[i];
                this.scenes.splice(this.scenes.indexOf(scene), 1);
                A_.game.stage.removeChild(scene.container);
                window.console.log("Scene " + scene.name + " DESTROYED.");
            }
            this._scenesToDestroy.length = 0;
        }

        // CREATE scenes
        if (this._scenesToCreate.length) {
            for (i = 0, len = this._scenesToCreate.length; i < len; i++) {
                var scene = this._scenesToCreate[i];
                this.game.stage.addChild(scene.container);
                this.scenes.push(scene);
                scene.play();
                window.console.log("Scene " + scene.name + " CREATED.");
            }
            this._scenesToCreate.length = 0;
        }
    },
    startScene: function (manifest, name, map) {
        this.game.loader.loadAssets(manifest, function () {
            new A_.SCENE.Scene(name, A_.CONFIG.camera, map);
        });
    },
    restartScene: function (name) {
        var scene = this.findSceneByName(name);
        if (!scene)
            return;
        scene.destroy();
        new A_.SCENE.Scene(scene.name, A_.CONFIG.camera, scene.map);
    },
    update: function () {
        for (var i = 0, len = this.scenes.length; i < len; i++) {
            this.scenes[i].update();
        }
        this._manageScenes();
    },
    // HELPER FUNCS
    findSceneByName: function (name) {
        return _.find(this.scenes, function (scene) {
            return scene.name === name;
        });
    }
});