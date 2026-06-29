// Variables to control game state
let gameRunning = false;
let dropMaker;
let timerInterval;
let milestoneTimer;
let score = 0;
let timeLeft = 30;
let milestoneShown = new Set();
let audioContext;
let highScore = Number(localStorage.getItem("waterDropHighScore")) || 0;

const scoreElement = document.getElementById("score");
const timeElement = document.getElementById("time");
const highScoreElement = document.getElementById("high-score");
const messageElement = document.getElementById("game-message");
const milestoneElement = document.getElementById("milestone-message");
const startButton = document.getElementById("start-btn");
const gameContainer = document.getElementById("game-container");

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

const milestoneMessages = [
  { score: 5, text: "Halfway there — you’re making waves!" },
  { score: 10, text: "You’re on a roll — the mission feels brighter!" },
  { score: 15, text: "Almost at the goal — keep going!" },
  { score: 20, text: "Goal reached — clean water dreams are in sight!" }
];

startButton.addEventListener("click", startGame);

function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeLeft = 30;
  milestoneShown = new Set();

  scoreElement.textContent = score;
  timeElement.textContent = timeLeft;
  highScoreElement.textContent = highScore;
  messageElement.textContent = "Catch the good drops and avoid the bad ones!";
  messageElement.classList.remove("game-win", "game-lose");
  milestoneElement.textContent = "";
  milestoneElement.classList.remove("show");
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

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("waterDropHighScore", highScore);
    highScoreElement.textContent = highScore;
  }

  messageElement.textContent = `${finalMessage} Final score: ${score}.`;
  messageElement.classList.add(score >= 20 ? "game-win" : "game-lose");

  document.querySelectorAll(".water-drop").forEach(drop => drop.remove());
}

function playSound(type) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  const now = audioContext.currentTime;
  const duration = type === "bad" ? 0.16 : 0.1;
  oscillator.type = type === "bad" ? "square" : "sine";
  oscillator.frequency.setValueAtTime(type === "bad" ? 220 : 760, now);
  oscillator.frequency.exponentialRampToValueAtTime(type === "bad" ? 140 : 980, now + duration);

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

function showMilestoneMessage(text) {
  milestoneElement.textContent = text;
  milestoneElement.classList.add("show");

  clearTimeout(milestoneTimer);
  milestoneTimer = setTimeout(() => {
    milestoneElement.classList.remove("show");
    milestoneElement.textContent = "";
  }, 1600);
}

function showFeedback(x, y, text) {
  const feedback = document.createElement("div");
  feedback.className = "feedback-pop";
  feedback.textContent = text;
  feedback.style.left = `${x}px`;
  feedback.style.top = `${y}px`;
  gameContainer.appendChild(feedback);

  setTimeout(() => feedback.remove(), 800);
}

function checkMilestones() {
  const nextMilestone = milestoneMessages.find((milestone) => score >= milestone.score && !milestoneShown.has(milestone.score));
  if (!nextMilestone) return;

  milestoneShown.add(nextMilestone.score);
  showMilestoneMessage(nextMilestone.text);
}

function createDrop() {
  const drop = document.createElement("div");
  const isBadDrop = Math.random() < 0.2;
  drop.className = `water-drop${isBadDrop ? " bad-drop" : ""}`;

  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  const gameWidth = gameContainer.offsetWidth;
  const maxX = Math.max(gameWidth - size, 0);
  const xPosition = Math.random() * maxX;
  drop.style.left = xPosition + "px";

  drop.style.animationDuration = `${(Math.random() * 1.5 + 2.5).toFixed(2)}s`;
  gameContainer.appendChild(drop);

  drop.addEventListener("click", () => {
    if (!gameRunning) return;

    if (isBadDrop) {
      score = Math.max(0, score - 1);
      messageElement.textContent = "Oops! That was a bad drop. -1 point.";
      playSound("bad");
    } else {
      score += 1;
      messageElement.textContent = "Great catch! +1 point.";
      playSound("good");
      checkMilestones();
    }

    const rect = drop.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    const feedbackX = rect.left - containerRect.left + rect.width / 2;
    const feedbackY = rect.top - containerRect.top - 6;
    showFeedback(feedbackX, feedbackY, isBadDrop ? "-1" : "+1");

    if (score > highScore) {
      highScore = score;
      highScoreElement.textContent = highScore;
      localStorage.setItem("waterDropHighScore", highScore);
    }

    scoreElement.textContent = score;
    drop.remove();
  });

  drop.addEventListener("animationend", () => {
    drop.remove();
  });
}
