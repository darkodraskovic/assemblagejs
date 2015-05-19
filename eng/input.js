DODO.Inputted = DODO.Evented.extend({
    initMouseReactivity: function () {
        this.container.mouseover = function (interactionData) {
            this.mouseover = true;
            this.trigger('mousein', interactionData);
        }.bind(this);
        this.container.mouseout = function (interactionData) {
            this.mouseover = false;
            this.trigger('mouseout', interactionData);
        }.bind(this);
        this.container.mousedown = function (interactionData) {
            this.leftdown = true;
            this.trigger('leftpressed', interactionData);
        }.bind(this);
        this.container.mouseup = this.container.mouseupoutside = function (interactionData) {
            this.leftdown = false;
            this.trigger('leftreleased', interactionData);
        }.bind(this);
        this.container.rightdown = function (interactionData) {
            this.rightdown = true;
            this.trigger('rightpressed', interactionData);
        }.bind(this);
        this.container.rightup = this.container.rightupoutside = function (interactionData) {
            this.rightdown = false;
            this.trigger('rightreleased', interactionData);
        }.bind(this);
    },
    setMouseReactivity: function (reactive) {
        this.container.interactive = reactive;
    },
    getMouseReactivity: function () {
        return this.container.interactive;
    },
});

DODO.input = new (DODO.Evented.extend({
    actions: {},
    down: {},
    _pressed: {},
    addMapping: function (action, key) {
        this.actions[key] = action;
        this.down[action] = false;
        this._pressed[action] = false;
    },
    disableContextMenu: function (canvas) {
        canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };
    }
}))();

// Keyboard
window.addEventListener("keydown", function (event) {
    var action = DODO.input.actions[event.keyCode];
    if (action) {
        if (!DODO.input._pressed[action]) {
            DODO.input._pressed[action] = true;
            DODO.input.trigger(action + "Pressed");
        }
        DODO.input.down[action] = true;
        event.preventDefault();
    }
}, false);

window.addEventListener("keyup", function (event) {
    var action = DODO.input.actions[event.keyCode];
    if (action) {
        DODO.input.trigger(action + "Released");
        DODO.input._pressed[action] = false;
        DODO.input.down[action] = false;
        event.preventDefault();
    }
}, false);

// Mousewheel
window.addEventListener("mousewheel", function (e) {
    if (e.wheelDelta > 0) {
        DODO.input.trigger('forward');
    } else {
        DODO.input.trigger('backward');
    }
}, false);

// CONSTS
DODO.Key = {
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