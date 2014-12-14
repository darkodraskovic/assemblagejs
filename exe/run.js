function runGame() {
    requestAnimFrame(runGame);

    if (A_.game.isRunning === true) {
        A_.game.run();
    }
}

A_.game = new A_.Game();
