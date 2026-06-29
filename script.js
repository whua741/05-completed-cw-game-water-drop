// Variables to control game state
let gameRunning = false;
let dropMaker;
let timerInterval;
let score = 0;
let timeLeft = 30;

const scoreElement = document.getElementById("score");
const timeElement = document.getElementById("time");
const messageElement = document.getElementById("game-message");
const startButton = document.getElementById("start-btn");

const winMessages = [
  "Amazing! You saved the water and won!",
  "Great job! The drops were all yours.",
  "You crushed it — charity: water would be proud!"
];

const loseMessages = [
  "Nice try! Give it another shot to reach 20 points.",
  "Keep going — you can catch more drops next time!",
  "Almost there! Practice makes perfect."
];

startButton.addEventListener("click", startGame);

function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeLeft = 30;

  scoreElement.textContent = score;
  timeElement.textContent = timeLeft;
  messageElement.textContent = "Catch the good drops and avoid the bad ones!";
  messageElement.classList.remove("game-win", "game-lose");
  startButton.disabled = true;

  dropMaker = setInterval(createDrop, 1000);
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  if (!gameRunning) return;

  timeLeft -= 1;
  timeElement.textContent = timeLeft;

  if (timeLeft <= 0) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;

  clearInterval(dropMaker);
  clearInterval(timerInterval);
  startButton.disabled = false;

  const finalMessage = score >= 20
    ? winMessages[Math.floor(Math.random() * winMessages.length)]
    : loseMessages[Math.floor(Math.random() * loseMessages.length)];

  messageElement.textContent = `${finalMessage} Final score: ${score}.`;
  messageElement.classList.add(score >= 20 ? "game-win" : "game-lose");

  document.querySelectorAll(".water-drop").forEach(drop => drop.remove());
}

function createDrop() {
  const drop = document.createElement("div");
  const isBadDrop = Math.random() < 0.2;
  drop.className = `water-drop${isBadDrop ? " bad-drop" : ""}`;

  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * Math.max(gameWidth - 60, 0);
  drop.style.left = xPosition + "px";

  drop.style.animationDuration = "4s";
  document.getElementById("game-container").appendChild(drop);

  drop.addEventListener("click", () => {
    if (!gameRunning) return;

    if (isBadDrop) {
      score = Math.max(0, score - 1);
      messageElement.textContent = "Oops! That was a bad drop. -1 point.";
    } else {
      score += 1;
      messageElement.textContent = "Great catch! +1 point.";
    }

    scoreElement.textContent = score;
    drop.remove();
  });

  drop.addEventListener("animationend", () => {
    drop.remove();
  });
}
