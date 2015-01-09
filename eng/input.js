/**************************************************************************/
// KEYBOARD
/**************************************************************************/

A_.KEY = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    PAUSE: 19,
    CAPS: 20,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    RIGHT_ARROW: 39,
    DOWN_ARROW: 40,
    INSERT: 45,
    DELETE: 46,
    _0: 48,
    _1: 49,
    _2: 50,
    _3: 51,
    _4: 52,
    _5: 53,
    _6: 54,
    _7: 55,
    _8: 56,
    _9: 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    NUMPAD_0: 96,
    NUMPAD_1: 97,
    NUMPAD_2: 98,
    NUMPAD_3: 99,
    NUMPAD_4: 100,
    NUMPAD_5: 101,
    NUMPAD_6: 102,
    NUMPAD_7: 103,
    NUMPAD_8: 104,
    NUMPAD_9: 105,
    MULTIPLY: 106,
    ADD: 107,
    SUBSTRACT: 109,
    DECIMAL: 110,
    DIVIDE: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PLUS: 187,
    COMMA: 188,
    MINUS: 189,
    PERIOD: 190
};

A_.INPUT.actions = {};
A_.INPUT.pressed = {};
A_.INPUT.released = {};
A_.INPUT.down = {};


A_.INPUT.addMapping = function(action, key) {
    this.actions[action] = key;
    this.pressed[action] = false;
    this.released[action] = false;
    this.down[action] = false;
};

window.addEventListener("keydown", function(event) {
    for (var action in A_.INPUT.actions) {
        if (event.keyCode === A_.INPUT.actions[action]) {
            if (A_.INPUT.pressed[action] === false && A_.INPUT.down[action] === false) {
                A_.INPUT.pressed[action] = true;
                A_.INPUT.down[action] = true;
            }
        }
    }
}, false);

window.addEventListener("keyup", function(event) {
    for (var action in A_.INPUT.actions) {
        if (event.keyCode === A_.INPUT.actions[action]) {
            A_.INPUT.released[action] = true;
            A_.INPUT.down[action] = false;
        }
    }
}, false);

/**************************************************************************/
// MOUSE
/**************************************************************************/

A_.INPUT.mousePosition = {};
A_.INPUT.mousePosition.screen = {};
A_.INPUT.mousePosition.level = {};
A_.INPUT.mousewheel = null;

A_.INPUT.addMouseReacivity = function(entity) {
    if (!entity.initedInput) {
        var that = entity;
        entity.sprite.mousedown = function() {
            that.leftpressed = true;
//            window.console.log("left pressed");
            that.leftdown = true;
        };
        entity.sprite.mouseup = function() {
            that.leftreleased = true;
            that.leftdown = false;
        };
        entity.sprite.mouseupoutside = function() {
            that.leftreleased = true;
            that.leftdown = false;
        };
        entity.sprite.rightdown = function() {
            that.rightpressed = true;
            that.rightdown = true;
        };
        entity.sprite.rightup = function() {
            that.rightreleased = true;
            that.rightdown = false;
        };
        entity.sprite.rightupoutside = function() {
            that.rightreleased = true;
            that.rightdown = false;
        };
        entity.initedInput = true;
    }
    entity.sprite.interactive = true;
    entity.mouseReactive = function(reactive) {
        if (typeof reactive === "undefined") {
            return this.sprite.interactive;
        }
        else if (!reactive) {
            this.sprite.interactive = false;
        }
        else {
            A_.INPUT.addMouseReacivity(this);
        }
    };
    entity.resetMouseReaction = function() {
        this.leftpressed = false;
        this.leftreleased = false;
        this.rightpressed = false;
        this.rightreleased = false;
    };
};

A_.INPUT.processMouseWheel = function (e) {
    if (e.wheelDelta > 0) {
        A_.INPUT.mousewheel = "forward";
    } else {
        A_.INPUT.mousewheel = "backward";
    }
}
window.addEventListener("mousewheel", A_.INPUT.processMouseWheel, false);

A_.INPUT.process = function() {
    var stageMousePosition = A_.game.stage.getMousePosition().clone();
    this.mousePosition.screen.x = stageMousePosition.x;
    this.mousePosition.screen.y = stageMousePosition.y;
    this.mousePosition.level = A_.level.mousePosition(stageMousePosition);
};
A_.INPUT.postprocess = function() {
    for (var action in this.actions) {
        this.pressed[action] = false;
        this.released[action] = false;
    }

    _.each(A_.level.sprites, function(sprite) {
        if (sprite.sprite.interactive) {
            sprite.resetMouseReaction();
        }
    });

    _.each(A_.level.tiles, function(tile) {
        if (tile.sprite.interactive) {
            tile.resetMouseReaction();
        }
    });

    A_.level.resetMouseReaction();

    this.mousewheel = "null";
};

A_.INPUT.mouseReactivityInjection = {
    initMouseReactivity: function () {
        var that = this;
        this.sprite.mousedown = function() {
            that.leftpressed = true;
            window.console.log("left pressed");
            that.leftdown = true;
        };
        this.sprite.mouseup = function() {
            that.leftreleased = true;
            that.leftdown = false;
        };
        this.sprite.mouseupoutside = function() {
            that.leftreleased = true;
            that.leftdown = false;
        };
        this.sprite.rightdown = function() {
            that.rightpressed = true;
            that.rightdown = true;
        };
        this.sprite.rightup = function() {
            that.rightreleased = true;
            that.rightdown = false;
        };
        this.sprite.rightupoutside = function() {
            that.rightreleased = true;
            that.rightdown = false;
        };
    },
    mouseReactive: function(reactive) {
        if (typeof reactive === "undefined") {
            return this.sprite.interactive;
        }
        else {
            this.sprite.interactive = reactive;
        }        
    },
    resetMouseReaction: function() {
        this.leftpressed = false;
        this.leftreleased = false;
        this.rightpressed = false;
        this.rightreleased = false;
    }
};