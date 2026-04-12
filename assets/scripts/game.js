let score = 0;
let lives = 3;
const correctWord = "BLAST";
const maxLives = 3;
let gameOver = false;
let guessedAttempts = new Set();

document.addEventListener("DOMContentLoaded", () => {
    // Allows pressing Enter to submit
    const predictionInput = document.getElementById("prediction");
    predictionInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            submitGuess();
        }
    });

    renderLives();
});

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

    // Clean UI: Keep maximum of 2 toasts on the screen at a time
    if (container.children.length >= 2) {
        container.removeChild(container.firstChild);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    // Trigger reflow for animation
    void toast.offsetWidth;
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
        // Remove from DOM after fade out transition (300ms)
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function renderLives() {
    const livesContainer = document.querySelector(".lives");
    livesContainer.innerHTML = '';
    
    for (let i = 0; i < maxLives; i++) {
        const heartSpan = document.createElement("span");
        heartSpan.className = "heart " + (i >= lives ? "lost" : "");
        heartSpan.innerText = "❤️";
        heartSpan.style.marginRight = "5px";
        livesContainer.appendChild(heartSpan);
    }
}

function updateScoreAnimated(newScore) {
    const scoreElem = document.querySelector(".score");
    scoreElem.textContent = newScore;
    scoreElem.style.transform = "scale(1.2)";
    scoreElem.style.color = "#fff";
    
    setTimeout(() => {
        scoreElem.style.transform = "scale(1)";
        scoreElem.style.color = "var(--accent-color)";
    }, 300);
}

function submitGuess() {
    if (gameOver) {
        showToast("The game is already over. Please start a new game!", "error");
        return;
    }

    const predictionInput = document.getElementById("prediction");
    let userGuess = predictionInput.value.toUpperCase().trim();
    const boxes = document.querySelectorAll(".box");
    
    // Validate input empty
    if (!userGuess) return;

    // Check if the user already tried this exact string
    if (guessedAttempts.has(userGuess)) {
        showToast("You already guessed that!", "error");
        predictionInput.value = "";
        return;
    }
    guessedAttempts.add(userGuess);

    predictionInput.value = "";
    document.querySelector(".reset-button").style.display = "block";
    let correctGuess = false;

    // Handle full word guess
    if (userGuess.length > 1) {
        if (userGuess === correctWord) {
            boxes.forEach((box, index) => {
                revealLetter(box, correctWord[index]);
            });
            score += 100;
            updateScoreAnimated(score);
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
            if (!box.classList.contains("guessed")) {
                revealLetter(box, letter);
                correctGuess = true;
            }
        }
    });

    if (correctGuess) {
        score += 20;
        updateScoreAnimated(score);
    } else {
        lives--;
        renderLives();
        shakeBoxes(boxes);
    }

    checkWinCondition(boxes);
}

function revealLetter(box, letter) {
    box.classList.add("guessed");
    // Ensure we are pulling from the correct reorganized assets location
    box.innerHTML = `<img src="assets/images/${letter}.svg" alt="${letter}">`;
}

function shakeBoxes(boxes) {
    boxes.forEach(box => {
        box.classList.remove("error-shake");
        // Trigger reflow
        void box.offsetWidth;
        box.classList.add("error-shake");
    });
}

function checkWinCondition(boxes) {
    const allBoxesFilled = Array.from(boxes).every((box) =>
        box.classList.contains("guessed")
    );

    if (allBoxesFilled) {
        gameOver = true;
        setTimeout(() => showToast(`Congratulations! You won! Your final score is ${score}`, "success"), 500);
        return;
    }

    if (lives <= 0) {
        gameOver = true;
        // Visual enhancement: reveal the letters half-transparent to show what the word was 
        boxes.forEach((box, index) => {
            if (!box.classList.contains("guessed")) {
                box.innerHTML = `<img src="assets/images/${correctWord[index]}.svg" alt="${correctWord[index]}" style="opacity: 0.5; filter: grayscale(100%);">`;
            }
        });
        setTimeout(() => showToast(`Game Over! The word was ${correctWord}. Your score: ${score}`, "error"), 500);
        return;
    }
}

function resetGame() {
    const boxes = document.querySelectorAll(".box");
    boxes.forEach((box) => {
        box.classList.remove("guessed");
        box.classList.remove("error-shake");
        box.innerHTML = "";
    });
    
    score = 0;
    lives = maxLives;
    gameOver = false;
    guessedAttempts.clear();
    updateScoreAnimated(score);
    renderLives();
    document.querySelector(".reset-button").style.display = "none";
    document.getElementById("prediction").focus();
}
