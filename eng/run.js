function startGame() {
    A_.game.isRunning = true;
    requestAnimFrame(runGame);
}

function runGame() {
    if (A_.game.isRunning === true) {        
        A_.game.run();
        requestAnimFrame(runGame);
    }
}