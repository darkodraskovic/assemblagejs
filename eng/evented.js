/*
Given a player sprite and a scene object, now walk through an example event functionality:

// Play the intro animation on the player 
// when the scene is created
scene.bind('created',player,function() {
  this.showIntro();
});

// Bind a method on player using the method name
scene.bind('destroyed',player,'showFinal');

// Trigger the created event on the scene
scene.trigger('created');

// Unbind the player from the created event
scene.unbind('created',player);

// Release the player from listening
// to all events (such as if it's blown up)
player.debind();
*/

DODO.Evented = DODO.Class.extend({
    bind: function (event, target, callback) {
        // Handle the case where there is no target provided
        if (!callback) {
            callback = target;
            target = null;
        }
        // Handle case for callback that is a string
        if (_.isString(callback)) {
            callback = target[callback];
        }
        this._listeners = this._listeners || {};
        this._listeners[event] = this._listeners[event] || [];
        this._listeners[event].push([target || this, callback]);
        if (target) {
            if (!target.binds) {
                target.binds = [];
            }
            target.binds.push([this, event, callback]);
        }
    },
    trigger: function (event, data) {
        if (this._listeners && this._listeners[event]) {
            for (var i = 0, len = this._listeners[event].length; i < len; i++) {
                var listener = this._listeners[event][i];
                listener[1].call(listener[0], data);
            }
        }
    },
    //  used to remove listeners from an object
    unbind: function (event, target, callback) {
        if (!target) {
            if (this._listeners[event]) {
                delete this._listeners[event];
            }
        } else {
            var l = this._listeners && this._listeners[event];
            if (l) {
                for (var i = l.length - 1; i >= 0; i--) {
                    if (l[i][0] === target) {
                        if (!callback || callback === l[i][1]) {
                            this._listeners[event].splice(i, 1);
                        }
                    }
                }
            }
        }
    },
    //  used when an object is being destroyed to remove all of its listeners
    debind: function () {
        if (this.binds) {
            for (var i = 0, len = this.binds.length; i < len; i++) {
                var boundEvent = this.binds[i],
                        source = boundEvent[0],
                        event = boundEvent[1];
                source.unbind(event, this);
            }
        }
    }
});