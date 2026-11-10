// Firebase ko bypass karke game chalane ke liye temporary database variables
const database = {
    ref: function() {
        return {
            push: function(data) { console.log("Score Saved Offine:", data); },
            orderByChild: function() { return { limitToLast: function() { return { on: function(event, callback) { 
                // Dummy snapshot for offline view
                callback({ forEach: function() {} });
            } } } } }
        };
    }
};

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const setupScreen = document.getElementById("setup-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const playerNameInput = document.getElementById("player-name");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const finalScoreSpan = document.getElementById("final-score");
const leaderboardRows = document.getElementById("leaderboard-rows");

let birdY = 200;
let birdVelocity = 0;
let gravity = 0.4;
let jump = -6.5;
let score = 0;
let pipes = [];
let gameInterval;
let currentPlayerName = "";
let isPlaying = false;

document.addEventListener("keydown", (e) => { if (e.code === "Space") flap(); });
canvas.addEventListener("click", flap);

function flap() {
    if (isPlaying) birdVelocity = jump;
}

startBtn.addEventListener("click", () => {
    currentPlayerName = playerNameInput.value.trim();
    if (currentPlayerName === "") {
        alert("Oye! Pehle apna gaming name to likho!");
        return;
    }
    setupScreen.style.display = "none";
    canvas.style.display = "block";
    initGame();
});

restartBtn.addEventListener("click", () => {
    gameOverScreen.style.display = "none";
    canvas.style.display = "block";
    initGame();
});

function initGame() {
    birdY = 200;
    birdVelocity = 0;
    score = 0;
    pipes = [
        { x: canvas.width, top: 150, bottom: 150 }
    ];
    isPlaying = true;
    if(gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 1000 / 60);
}

function gameLoop() {
    birdVelocity += gravity;
    birdY += birdVelocity;

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 160) {
        let gap = 120;
        let topHeight = Math.floor(Math.random() * (canvas.height - gap - 100)) + 30;
        pipes.push({
            x: canvas.width,
            top: topHeight,
            bottom: canvas.height - topHeight - gap
        });
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2;

        if (pipes[i].x === 40) {
            score++;
        }

        if (
            pipes[i].x < 50 && pipes[i].x + 40 > 20 &&
            (birdY < pipes[i].top || birdY + 20 > canvas.height - pipes[i].bottom)
        ) {
            endGame();
        }

        if (pipes[i].x < -40) pipes.splice(i, 1);
    }

    if (birdY > canvas.height || birdY < 0) {
        endGame();
    }

    draw();
}

function draw() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00a000";
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, 40, pipe.top);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, 40, pipe.bottom);
    });

    ctx.fillStyle = "#ffeb3b";
    ctx.fillRect(20, birdY, 20, 20);

    ctx.fillStyle = "#fff";
    ctx.font = "24px Courier New";
    ctx.fillText("Score: " + score, 10, 30);
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    canvas.style.display = "none";
    finalScoreSpan.innerText = score;
    gameOverScreen.style.display = "flex";
    saveScore();
}

function saveScore() {
    database.ref('flappy_scores/').push({
        name: currentPlayerName,
        score: score,
        time: Date.now()
    });
}
