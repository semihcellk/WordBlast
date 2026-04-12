# WordBlast 🚀

> **Academics Note:** _This project was developed for the **BBF 101E - Introduction to Information Systems** course at **Istanbul Technical University (ITU)** in 2024._

WordBlast is a premium, interactive word prediction puzzle game built entirely from scratch with HTML, CSS, and Vanilla JavaScript. Challenge yourself to guess the hidden 5-letter word against the clock, with an elegant UI tailored for an immersive gaming experience!

## 🌟 Key Features

The project has recently undergone a **massive overhaul** to offer a fully dynamic and replayable gameplay experience:

- **Dynamic Word Generation**: Instead of a hardcoded word, the game selects a random word from a vast curated pool of 200+ common 5-letter words. Every playthrough is unique!
- **Interactive Visual Keyboard**: An on-screen QWERTY keyboard visually tracks your progress. Keys glow green for correct letters, and turn grey for wrong guesses. (Also fully supports physical keyboard input!)
- **Tactical Hint System 💡**: Stuck? Use your single-use hint to reveal a random correct letter. But beware, it comes at a strategic cost of -10 points!
- **Timer Mode ⏱️**: Toggle on the hardcore 60-second countdown mode. If the clock strikes 0 before you crack the code, it's Game Over.
- **Local Statistics Tracking 📊**: Your `Win Rate`, `Current Streak`, `Games Played`, and `Best Score` are all tracked inside your browser's Local Storage natively and beautifully presented in an interactive Glassmorphism Modal.
- **Premium Aesthetics**: Features a captivating dark mode, smooth micro-interactions, CSS-gradient generated letter-reveals, and a custom Javascript particle engine that explodes into 🎊 confetti upon a win.
- **Anti-Spam Toast Notifications**: Custom intelligent UI alerts that prevent annoying message stacking and enforce strict input validation bounds (handling 2,3,4 letter mistypes safely).

## 🕹️ How to Play

1. **Objective**: Guess the randomly selected mystery five-letter word.
2. **Guessing**: Type a single letter or the full 5-letter word via your physical keyboard or the on-screen visual keyboard, then press `Enter` or click "Submit Guess".
3. **Scoring**:
   - Correct Letter = +20 points
   - Correct Word instantly = +100 points
   - Getting a Hint = -10 points
4. **Lives**: You start with 3 lives (❤️). Each incorrect guess consumes one life. Dropping to 0 lives results in a loss. Good luck!

## 📂 Project Structure

```text
├── assets/
│   ├── styles/
│   │   └── style.css   # Premium Game Styling, CSS animations, variables
│   └── scripts/
│       ├── words.js    # Data source (200+ Word Array Pool)
│       └── game.js     # Engine Logic (Canvas, State, Validation, Storage)
├── index.html          # Main application skeleton & UI
└── README.md           # You are here
```

## 🛠️ Tech Stack

- **HTML5:** Semantic architecture.
- **CSS3 (Vanilla):** Modern CSS features including Flexbox layouts, gradients, filter-blur overlays, popIn animations, and custom properties.
- **Vanilla JavaScript:** Fully reliant on native DOM Manipulation, algorithmic state management, `localStorage`, `Canvas API` particle physics, and robust event handling. **Zero external frameworks or libraries!**

## 🚀 Running Locally

No sophisticated bundlers or server startups needed. It relies entirely on frontend foundational technologies:

1. Clone or download the repository.
2. Open `index.html` locally in any modern browser (Chrome / Edge / Firefox / Safari).
3. Start guessing!

---

_Designed & Developed as a highly-polished, aesthetically pleasing Vanilla project._
