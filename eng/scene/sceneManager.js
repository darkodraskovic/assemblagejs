A_.SCENE.SceneManager = Class.extend({
    init: function (game) {
        this.game = game;
        this.scenes = [];
        this._scenesToDestroy = [];
        this._scenesToCreate = [];
    },
    // Scene CREATION & DESTRUCTION
    createScene: function (name, map) {
        var scene = new A_.SCENE.Scene(this, name, A_.CONFIG.camera, map);
        this._scenesToCreate.push(scene);
        return scene;
    },
    destroyScene: function (scene) {
        if (_.isString(scene))
            scene = this.findSceneByName(scene);
        if (!scene)
            return;

        this._scenesToDestroy.push(scene);
    },
    _manageScenes: function () {
        // DESTROY scenes
        if (this._scenesToDestroy.length) {
            for (var i = 0, len = this._scenesToDestroy.length; i < len; i++) {
                var scene = this._scenesToDestroy[i];
                scene.clear();
                scene.trigger('destroyed');
                var ind = this.scenes.indexOf(scene);
                if (ind > -1)
                    this.scenes.splice(ind, 1);
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
                scene.trigger('created');
                window.console.log("Scene " + scene.name + " CREATED.");
            }
            this._scenesToCreate.length = 0;
        }
    },
    startScene: function (manifest, name, map) {
        if (manifest)
            this.game.loader.loadManifest(manifest, this.createScene.bind(this, name, map));
        else
            this.createScene(name, map);
    },
    restartScene: function (name) {
        var scene = this.findSceneByName(name);
        if (!scene)
            return;
        this.destroyScene(scene);
        this.createScene(scene.name, scene.map);
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