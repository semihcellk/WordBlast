let score = 0;
let lives = 3;
const correctWord = "BLAST";
const maxLives = 3;

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
    const predictionInput = document.getElementById("prediction");
    let userGuess = predictionInput.value.toUpperCase().trim();
    const boxes = document.querySelectorAll(".box");
    
    // Validate input empty
    if (!userGuess) return;

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
            setTimeout(() => alert("Masterful! You guessed the entire word. You won!"), 500);
        } else {
            lives--;
            renderLives();
            shakeBoxes(boxes);
            if(lives <= 0) {
                 setTimeout(() => alert("Game Over! The word was BLAST. Your score: " + score), 500);
            } else {
                 setTimeout(() => alert("Incorrect word! " + lives + " lives remaining."), 10);
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
            } else {
                // Already guessed, technically not wrong but we may just let it pass
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
        setTimeout(() => alert("Congratulations! You won with a score of " + score), 500);
        return;
    }

    if (lives <= 0) {
        setTimeout(() => alert("Game Over! You Lost! Your score: " + score), 500);
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
    updateScoreAnimated(score);
    renderLives();
    document.querySelector(".reset-button").style.display = "none";
    document.getElementById("prediction").focus();
}
