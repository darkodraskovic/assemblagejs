A_.INPUT = new (A_.EventDispatcher.extend({
    actions: {},
    down: {},
    _pressed: {},
    addMapping: function(action, key) {
        this.actions[action] = key;
        this.down[action] = false;
        this._pressed[action] = false;
    },
    mouseReactivityInjection: {
        initMouseReactivity: function() {
            this.sprite.mousedown = function() {
                this.trigger('leftpressed');
                this.leftdown = true;
            }.bind(this);
            this.sprite.mouseup = this.sprite.mouseupoutside = function() {
                this.trigger('leftreleased');
                this.leftdown = false;
            }.bind(this);
            this.sprite.rightdown = function() {
                this.trigger('rightpressed');
                this.rightdown = true;
            }.bind(this);
            this.sprite.rightup = this.sprite.rightupoutside = function() {
                this.trigger('rightreleased');
                this.rightdown = false;
            }.bind(this);
        },
        setMouseReactivity: function(reactive) {
            this.sprite.interactive = reactive;
        },
        getMouseReactivity: function() {
            return this.sprite.interactive;
        }
    }
}))();

// Keyboard
window.addEventListener("keydown", function(event) {
    for (var action in A_.INPUT.actions) {
        if (event.keyCode === A_.INPUT.actions[action]) {
            if (!A_.INPUT._pressed[action]) {
                A_.INPUT._pressed[action] = true;
                A_.INPUT.trigger(action + "Pressed");
            }
            A_.INPUT.down[action] = true;
            event.preventDefault();
        }
    }
}, false);

window.addEventListener("keyup", function(event) {
    for (var action in A_.INPUT.actions) {
        if (event.keyCode === A_.INPUT.actions[action]) {
            A_.INPUT.trigger(action + "Released");
            A_.INPUT._pressed[action] = false;
            A_.INPUT.down[action] = false;
            event.preventDefault();
        }
    }
}, false);

// Mousewheel
window.addEventListener("mousewheel", function(e) {
    if (e.wheelDelta > 0) {
        A_.INPUT.trigger('forward');
    } else {
        A_.INPUT.trigger('backward');
    }
}, false);

// CONSTS
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