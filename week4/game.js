const canvas = document.querySelector("#gameCanvas");
const context = canvas.getContext("2d");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");
const livesElement = document.querySelector("#lives");
const messageElement = document.querySelector("#message");
const startButton = document.querySelector("#startButton");

const GAME_TIME = 20;
const TARGET_SCORE = 15;
const MAX_LIVES = 3;
let score = 0;
let lives = MAX_LIVES;
let remainingTime = GAME_TIME;
let items = [];
let gameRunning = false;
let animationId = null;
let lastFrameTime = 0;
let lastSpawnTime = 0;
let endTime = 0;

// 화면 배경과 간단한 거리 풍경을 그립니다.
function drawBackground() {
  const sky = context.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#9adbd6");
  sky.addColorStop(1, "#f7d99a");
  context.fillStyle = sky;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#75a866";
  context.fillRect(0, canvas.height * 0.72, canvas.width, canvas.height * 0.28);
  context.fillStyle = "#536d66";
  context.fillRect(0, canvas.height * 0.82, canvas.width, canvas.height * 0.18);
  context.fillStyle = "#f8dfa2";
  context.fillRect(0, canvas.height * 0.86, canvas.width, 5);
  context.fillRect(0, canvas.height * 0.96, canvas.width, 5);
}

// 코인 또는 장애물을 무작위 위치에 만듭니다.
function createItem() {
  const isObstacle = Math.random() < 0.24;
  const size = isObstacle ? 25 : 22;
  items.push({
    type: isObstacle ? "obstacle" : "coin",
    x: size + Math.random() * (canvas.width - size * 2),
    y: 50 + Math.random() * (canvas.height * 0.62),
    size,
    bornAt: performance.now(),
    duration: 1800 + Math.random() * 800
  });
}

// 현재 아이템을 캔버스에 그립니다.
function drawItems() {
  items.forEach((item) => {
    context.beginPath();
    if (item.type === "coin") {
      context.arc(item.x, item.y, item.size, 0, Math.PI * 2);
      context.fillStyle = "#ffd23f";
      context.fill();
      context.lineWidth = 4;
      context.strokeStyle = "#b87916";
      context.stroke();
      context.fillStyle = "#fff2a6";
      context.font = "bold 20px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("₩", item.x, item.y);
    } else {
      context.fillStyle = "#e4572e";
      context.fillRect(item.x - item.size, item.y - item.size, item.size * 2, item.size * 2);
      context.strokeStyle = "#8e2d1c";
      context.lineWidth = 4;
      context.strokeRect(item.x - item.size, item.y - item.size, item.size * 2, item.size * 2);
      context.fillStyle = "#fff3df";
      context.font = "bold 22px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("!", item.x, item.y);
    }
  });
}

// 점수판과 종료 상태를 업데이트합니다.
function updateStatus() {
  scoreElement.textContent = score;
  timeElement.textContent = remainingTime;
  livesElement.textContent = lives;
}

// 게임을 성공 또는 실패로 마칩니다.
function finishGame(success) {
  gameRunning = false;
  cancelAnimationFrame(animationId);
  messageElement.textContent = success ? "성공! 코인 15개를 모았습니다." : "실패! 기회를 모두 잃었습니다.";
  startButton.textContent = "재시작";
}

// 매 프레임마다 속도와 생성 빈도를 조금씩 높입니다.
function gameLoop(now) {
  if (!gameRunning) return;
  const elapsed = now - lastFrameTime;
  lastFrameTime = now;
  const secondsLeft = Math.max(0, Math.ceil((endTime - now) / 1000));
  remainingTime = secondsLeft;

  const difficulty = Math.min(1.7, 1 + (GAME_TIME - secondsLeft) / 20);
  const spawnInterval = 850 / difficulty;
  if (now - lastSpawnTime >= spawnInterval) {
    createItem();
    lastSpawnTime = now;
  }

  items = items.filter((item) => now - item.bornAt < item.duration / difficulty);
  drawBackground();
  drawItems();
  updateStatus();

  if (remainingTime <= 0) {
    finishGame(score >= TARGET_SCORE);
    return;
  }
  if (score >= TARGET_SCORE) {
    finishGame(true);
    return;
  }
  animationId = requestAnimationFrame(gameLoop);
}

// 새 게임의 상태를 초기화하고 시작합니다.
function startGame() {
  cancelAnimationFrame(animationId);
  score = 0;
  lives = MAX_LIVES;
  remainingTime = GAME_TIME;
  items = [];
  gameRunning = true;
  const now = performance.now();
  lastFrameTime = now;
  lastSpawnTime = now;
  endTime = now + GAME_TIME * 1000;
  messageElement.textContent = "코인과 장애물을 눌러 보세요.";
  startButton.textContent = "재시작";
  updateStatus();
  animationId = requestAnimationFrame(gameLoop);
}

// 클릭 또는 터치 위치에 있는 아이템을 판정합니다.
function hitItem(event) {
  if (!gameRunning) return;
  event.preventDefault();
  const point = event.changedTouches ? event.changedTouches[0] : event;
  const bounds = canvas.getBoundingClientRect();
  const scaleX = canvas.width / bounds.width;
  const scaleY = canvas.height / bounds.height;
  const x = (point.clientX - bounds.left) * scaleX;
  const y = (point.clientY - bounds.top) * scaleY;
  const itemIndex = items.findIndex((item) => Math.hypot(item.x - x, item.y - y) <= item.size + 8);
  if (itemIndex === -1) return;

  const [item] = items.splice(itemIndex, 1);
  if (item.type === "coin") {
    score += 1;
  } else {
    lives -= 1;
    if (lives <= 0) finishGame(false);
  }
  updateStatus();
  if (score >= TARGET_SCORE) finishGame(true);
}

startButton.addEventListener("click", startGame);
canvas.addEventListener("click", hitItem);
canvas.addEventListener("touchend", hitItem, { passive: false });
drawBackground();