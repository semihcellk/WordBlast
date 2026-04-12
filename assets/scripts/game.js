/**
 * WordFlare — Game Engine
 * Dynamic word guessing game with hints, timer, stats, keyboard, and confetti.
 */

// ==================== STATE ====================
let score = 0;
let lives = 3;
const maxLives = 3;
let gameOver = false;
let correctWord = "";
let guessedAttempts = new Set();
let hintUsed = false;
let timerMode = false;
let timerSeconds = 60;
let timerInterval = null;
let firstGuessMade = false;

// ==================== DOM REFERENCES ====================
const boxesContainer = document.getElementById("boxes-container");
const predictionInput = document.getElementById("prediction");
const submitBtn = document.getElementById("submit-btn");
const hintBtn = document.getElementById("hint-btn");
const resetBtn = document.getElementById("reset-btn");
const scoreDisplay = document.getElementById("score-display");
const livesDisplay = document.getElementById("lives-display");
const timerToggle = document.getElementById("timer-toggle");
const timerDisplay = document.getElementById("timer-display");
const statsToggleBtn = document.getElementById("stats-toggle-btn");
const statsModalOverlay = document.getElementById("stats-modal-overlay");
const closeModalBtn = document.getElementById("close-modal-btn");
const confettiCanvas = document.getElementById("confetti-canvas");
const confettiCtx = confettiCanvas.getContext("2d");

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
    initGame();

    // Enter key to submit
    predictionInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            submitGuess();
        }
    });

    // Button listeners
    submitBtn.addEventListener("click", submitGuess);
    hintBtn.addEventListener("click", useHint);
    resetBtn.addEventListener("click", resetGame);

    // Timer toggle
    timerToggle.addEventListener("change", () => {
        timerMode = timerToggle.checked;
        if (timerMode) {
            timerDisplay.classList.remove("hidden");
            // If game is already in progress and first guess was made, start timer
            if (firstGuessMade && !gameOver) {
                startTimer();
            }
        } else {
            timerDisplay.classList.add("hidden");
            stopTimer();
        }
    });

    // Stats modal
    statsToggleBtn.addEventListener("click", openStatsModal);
    closeModalBtn.addEventListener("click", closeStatsModal);
    statsModalOverlay.addEventListener("click", (e) => {
        if (e.target === statsModalOverlay) closeStatsModal();
    });

    // Physical keyboard → visual keyboard
    document.addEventListener("keydown", (e) => {
        const letter = e.key.toUpperCase();
        if (/^[A-Z]$/.test(letter)) {
            const keyEl = document.querySelector(`.key[data-key="${letter}"]`);
            if (keyEl) {
                keyEl.style.transform = "translateY(1px)";
                setTimeout(() => { keyEl.style.transform = ""; }, 100);
            }
        }
    });

    // Visual keyboard clicks
    document.getElementById("keyboard").addEventListener("click", (e) => {
        if (e.target.classList.contains("key")) {
            const letter = e.target.dataset.key;
            predictionInput.value = letter;
            submitGuess();
        }
    });

    // Resize confetti canvas
    resizeConfettiCanvas();
    window.addEventListener("resize", resizeConfettiCanvas);
});

function initGame() {
    correctWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    generateBoxes();
    renderLives();
    updateScoreDisplay(0);
    predictionInput.focus();
}

function generateBoxes() {
    boxesContainer.innerHTML = "";
    for (let i = 0; i < correctWord.length; i++) {
        const box = document.createElement("div");
        box.className = "box";
        box.dataset.letter = correctWord[i];
        box.dataset.index = i;
        boxesContainer.appendChild(box);
    }
}

// ==================== TOAST SYSTEM ====================
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");

    // Spam Protection: Prevent identical messages from stacking
    if (container.lastChild && container.lastChild.innerText === message) {
        const existingToast = container.lastChild;
        existingToast.style.transform = "translateY(0) scale(1.05)";
        setTimeout(() => {
            if (existingToast.classList.contains("show")) {
                existingToast.style.transform = "translateY(0) scale(1)";
            }
        }, 150);
        return;
    }

    // Clean UI: Keep maximum of 2 toasts on screen
    if (container.children.length >= 2) {
        container.removeChild(container.firstChild);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerText = message;

    container.appendChild(toast);
    void toast.offsetWidth;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ==================== LIVES ====================
function renderLives() {
    livesDisplay.innerHTML = "";
    for (let i = 0; i < maxLives; i++) {
        const heartSpan = document.createElement("span");
        heartSpan.className = "heart " + (i >= lives ? "lost" : "");
        heartSpan.innerText = "❤️";
        heartSpan.style.marginRight = "5px";
        livesDisplay.appendChild(heartSpan);
    }
}

// ==================== SCORE ====================
function updateScoreDisplay(newScore) {
    scoreDisplay.textContent = newScore;
    scoreDisplay.style.transform = "scale(1.2)";
    scoreDisplay.style.color = "#fff";
    setTimeout(() => {
        scoreDisplay.style.transform = "scale(1)";
        scoreDisplay.style.color = "var(--accent-color)";
    }, 300);
}

// ==================== SUBMIT GUESS ====================
function submitGuess() {
    if (gameOver) {
        showToast("The game is already over. Press Play Again!", "error");
        return;
    }

    let userGuess = predictionInput.value.toUpperCase().trim();
    const boxes = document.querySelectorAll(".box");

    if (!userGuess) return;

    if (userGuess.length > 1 && userGuess.length !== correctWord.length) {
        showToast(`Please enter either 1 letter or a ${correctWord.length}-letter word!`, "error");
        return;
    }

    // Duplicate guess protection
    if (guessedAttempts.has(userGuess)) {
        showToast("You already guessed that!", "error");
        predictionInput.value = "";
        return;
    }
    guessedAttempts.add(userGuess);

    predictionInput.value = "";
    resetBtn.style.display = "block";

    // Start timer on first guess if timer mode is ON
    if (!firstGuessMade) {
        firstGuessMade = true;
        if (timerMode) startTimer();
    }

    let correctGuess = false;

    // Handle full word guess
    if (userGuess.length > 1) {
        if (userGuess === correctWord) {
            boxes.forEach((box, index) => {
                revealLetter(box, correctWord[index], "guessed");
            });
            score += 100;
            updateScoreDisplay(score);
            updateKeyboardColors();
        } else {
            lives--;
            renderLives();
            shakeBoxes(boxes);
            if (lives > 0) {
                showToast(`Incorrect word! ${lives} lives remaining.`, "error");
            }
        }
        checkWinCondition(boxes);
        return;
    }

    // Handle single letter guess
    boxes.forEach((box) => {
        const letter = box.getAttribute("data-letter");
        if (letter === userGuess) {
            if (!box.classList.contains("guessed") && !box.classList.contains("hint-revealed")) {
                revealLetter(box, letter, "guessed");
                correctGuess = true;
            }
        }
    });

    if (correctGuess) {
        score += 20;
        updateScoreDisplay(score);
        updateKeyboardKey(userGuess, "correct");
    } else {
        lives--;
        renderLives();
        shakeBoxes(boxes);
        updateKeyboardKey(userGuess, "wrong");
    }

    checkWinCondition(boxes);
}

function revealLetter(box, letter, className) {
    box.classList.add(className);
    box.innerHTML = `<span class="letter">${letter}</span>`;
}

function shakeBoxes(boxes) {
    boxes.forEach(box => {
        box.classList.remove("error-shake");
        void box.offsetWidth;
        box.classList.add("error-shake");
    });
}

// ==================== WIN / LOSE ====================
function checkWinCondition(boxes) {
    const allBoxesFilled = Array.from(boxes).every((box) =>
        box.classList.contains("guessed") || box.classList.contains("hint-revealed")
    );

    if (allBoxesFilled) {
        gameOver = true;
        stopTimer();
        saveStats(true);
        setTimeout(() => {
            showToast(`🎉 You won! Final score: ${score}`, "success");
            launchConfetti();
        }, 400);
        return;
    }

    if (lives <= 0) {
        gameOver = true;
        stopTimer();
        saveStats(false);
        // Reveal remaining letters as greyed out
        boxes.forEach((box, index) => {
            if (!box.classList.contains("guessed") && !box.classList.contains("hint-revealed")) {
                box.classList.add("game-over-reveal");
                box.innerHTML = `<span class="letter">${correctWord[index]}</span>`;
            }
        });
        setTimeout(() => showToast(`Game Over! The word was ${correctWord}. Score: ${score}`, "error"), 400);
        return;
    }
}

// ==================== HINT SYSTEM ====================
function useHint() {
    if (gameOver) {
        showToast("The game is already over!", "error");
        return;
    }
    if (hintUsed) {
        showToast("You already used your hint!", "error");
        return;
    }

    const boxes = document.querySelectorAll(".box");
    const unrevealedBoxes = Array.from(boxes).filter(
        (box) => !box.classList.contains("guessed") && !box.classList.contains("hint-revealed")
    );

    if (unrevealedBoxes.length === 0) return;

    // Pick a random unrevealed box
    const randomBox = unrevealedBoxes[Math.floor(Math.random() * unrevealedBoxes.length)];
    const letter = randomBox.getAttribute("data-letter");

    revealLetter(randomBox, letter, "hint-revealed");
    updateKeyboardKey(letter, "correct");

    // Deduct points
    score -= 10;
    updateScoreDisplay(score);

    hintUsed = true;
    hintBtn.disabled = true;

    showToast("Hint used! -10 points", "info");

    // Start timer on hint if timer mode is on and first action
    if (!firstGuessMade) {
        firstGuessMade = true;
        if (timerMode) startTimer();
    }

    checkWinCondition(document.querySelectorAll(".box"));
}

// ==================== KEYBOARD ====================
function updateKeyboardKey(letter, status) {
    const keyEl = document.querySelector(`.key[data-key="${letter}"]`);
    if (keyEl) {
        keyEl.classList.remove("correct", "wrong");
        keyEl.classList.add(status);
    }
}

function updateKeyboardColors() {
    // When a full word is guessed correctly, mark all letters
    for (const letter of correctWord) {
        updateKeyboardKey(letter, "correct");
    }
}

function resetKeyboard() {
    document.querySelectorAll(".key").forEach((key) => {
        key.classList.remove("correct", "wrong");
    });
}

// ==================== TIMER ====================
function startTimer() {
    if (timerInterval) return;
    timerSeconds = 60;
    timerDisplay.textContent = timerSeconds;
    timerDisplay.classList.remove("urgent");

    timerInterval = setInterval(() => {
        timerSeconds--;
        timerDisplay.textContent = timerSeconds;

        if (timerSeconds <= 10) {
            timerDisplay.classList.add("urgent");
        }

        if (timerSeconds <= 0) {
            stopTimer();
            gameOver = true;
            saveStats(false);

            // Reveal remaining letters
            const boxes = document.querySelectorAll(".box");
            boxes.forEach((box, index) => {
                if (!box.classList.contains("guessed") && !box.classList.contains("hint-revealed")) {
                    box.classList.add("game-over-reveal");
                    box.innerHTML = `<span class="letter">${correctWord[index]}</span>`;
                }
            });

            showToast(`⏱️ Time's up! The word was ${correctWord}.`, "error");
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ==================== STATISTICS (localStorage) ====================
function getStats() {
    const raw = localStorage.getItem("wordflare_stats");
    if (raw) return JSON.parse(raw);
    return { gamesPlayed: 0, gamesWon: 0, bestScore: 0, currentStreak: 0, bestStreak: 0 };
}

function saveStats(won) {
    const stats = getStats();
    stats.gamesPlayed++;
    if (won) {
        stats.gamesWon++;
        stats.currentStreak++;
        if (stats.currentStreak > stats.bestStreak) {
            stats.bestStreak = stats.currentStreak;
        }
        if (score > stats.bestScore) {
            stats.bestScore = score;
        }
    } else {
        stats.currentStreak = 0;
    }
    localStorage.setItem("wordflare_stats", JSON.stringify(stats));
}

function openStatsModal() {
    const stats = getStats();
    document.getElementById("stat-played").textContent = stats.gamesPlayed;
    const winRate = stats.gamesPlayed > 0
        ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
        : 0;
    document.getElementById("stat-winrate").textContent = winRate + "%";
    document.getElementById("stat-best").textContent = stats.bestScore;
    document.getElementById("stat-streak").textContent = stats.currentStreak;
    statsModalOverlay.classList.add("show");
}

function closeStatsModal() {
    statsModalOverlay.classList.remove("show");
}

// ==================== CONFETTI ====================
function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

function launchConfetti() {
    const particles = [];
    const colors = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: confettiCanvas.width / 2 + (Math.random() - 0.5) * 200,
            y: confettiCanvas.height / 2,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 1) * 18 - 4,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 12,
            alpha: 1,
        });
    }

    let frame = 0;
    const maxFrames = 180;

    function animate() {
        if (frame >= maxFrames) {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            return;
        }

        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        particles.forEach((p) => {
            p.x += p.vx;
            p.vy += 0.35; // gravity
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.alpha = Math.max(0, 1 - frame / maxFrames);

            confettiCtx.save();
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate((p.rotation * Math.PI) / 180);
            confettiCtx.globalAlpha = p.alpha;
            confettiCtx.fillStyle = p.color;
            confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            confettiCtx.restore();
        });

        frame++;
        requestAnimationFrame(animate);
    }

    animate();
}

// ==================== RESET ====================
function resetGame() {
    stopTimer();
    score = 0;
    lives = maxLives;
    gameOver = false;
    hintUsed = false;
    firstGuessMade = false;
    guessedAttempts.clear();

    // Pick a new word
    correctWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    generateBoxes();

    updateScoreDisplay(score);
    renderLives();
    resetKeyboard();

    hintBtn.disabled = false;
    resetBtn.style.display = "none";

    // Reset timer display
    timerSeconds = 60;
    timerDisplay.textContent = timerSeconds;
    timerDisplay.classList.remove("urgent");

    predictionInput.value = "";
    predictionInput.focus();
}
