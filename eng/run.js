function runGame() {
    if (A_.game.isRunning === true) {
        A_.game.run();
    }

    requestAnimFrame(runGame);
}

A_.game = new A_.Game();
