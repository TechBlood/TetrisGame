const COLS = 10;
const ROWS = 20;
let BLOCK = 30;
const boardCanvas = document.getElementById('board-canvas');
const boardCtx = boardCanvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold-canvas');
const holdCtx = holdCanvas.getContext('2d');
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');
const scaler = document.getElementById('scaler');
const gameContainer = document.getElementById('game-container');
const infoPanel = document.getElementById('info-panel');
const sidePanel = document.getElementById('side-panel');

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');
const finalScoreEl = document.getElementById('final-score');
const gameOverOverlay = document.getElementById('game-over-overlay');
const pauseOverlay = document.getElementById('pause-overlay');
const startOverlay = document.getElementById('start-overlay');
const startOverlayBtn = document.getElementById('start-overlay-btn');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn2 = document.getElementById('restart-btn2');
const restartBtn = document.getElementById('restart-btn');
const highScoresOl = document.getElementById('high-scores');
const newRecordEl = document.getElementById('new-record');
const nameEntry = document.getElementById('name-entry');
const playerNameInput = document.getElementById('player-name');
const saveScoreBtn = document.getElementById('save-score-btn');
const garbageBar = document.getElementById('garbage-bar');
const garbageCountEl = document.getElementById('garbage-count');
const themeSelect = document.getElementById('theme-select');
const modeSelect = document.getElementById('mode-select');

const ytUrlInput = document.getElementById('yt-url');
const ytPlayBtn = document.getElementById('yt-play-btn');
const ytStopBtn = document.getElementById('yt-stop-btn');
const ytVolumeInput = document.getElementById('yt-volume');
const vizStyleSelect = document.getElementById('viz-style');
const micBtn = document.getElementById('mic-btn');
const ytWrapper = document.getElementById('yt-wrapper');
const ytTitleEl = document.getElementById('yt-title');
const ytCloseBtn = document.getElementById('yt-close');
const tabBtn = document.getElementById('tab-audio-btn');
const ytAudioHint = document.getElementById('yt-audio-hint');
const ytFallbackBtn = document.getElementById('yt-fallback-btn');
const vizCanvas = document.getElementById('viz-canvas');
const vizCtx = vizCanvas ? vizCanvas.getContext('2d') : null;
const fxLayer = document.getElementById('fx-layer');

const statPiecesEl = document.getElementById('stat-pieces');
const statLinesEl = document.getElementById('stat-lines');
const statTetrisesEl = document.getElementById('stat-tetrises');
const statComboEl = document.getElementById('stat-combo');
const statTimeEl = document.getElementById('stat-time');
const statAccEl = document.getElementById('stat-acc');

// ============ TEMAS ============
const THEMES = {
  clasico: { board: '#1a1a2e', boardBorder: '#3a7bd5', title: ['#00d2ff', '#3a7bd5', '#00d2ff'], accent: '#00d2ff', bgTop: '#0f0c29', bgBottom: '#24243e' },
  neon: { board: '#0a0a12', boardBorder: '#39ff14', title: ['#39ff14', '#00ffff', '#39ff14'], accent: '#39ff14', bgTop: '#050510', bgBottom: '#1a0033' },
  oceano: { board: '#04121a', boardBorder: '#00c8ff', title: ['#00c8ff', '#00ffc8', '#00c8ff'], accent: '#00c8ff', bgTop: '#001018', bgBottom: '#00334d' },
  fuego: { board: '#1a0505', boardBorder: '#ff4500', title: ['#ff4500', '#ffd600', '#ff4500'], accent: '#ff8c00', bgTop: '#160505', bgBottom: '#4d1a00' },
  esmeralda: { board: '#052018', boardBorder: '#00ffa3', title: ['#00ffa3', '#7dffd6', '#00ffa3'], accent: '#00ffa3', bgTop: '#04150f', bgBottom: '#0a4d3a' },
  cereza: { board: '#200509', boardBorder: '#ff2e7e', title: ['#ff2e7e', '#ffb3d1', '#ff2e7e'], accent: '#ff2e7e', bgTop: '#1c0408', bgBottom: '#5c0f2a' },
  noche: { board: '#0b0b1c', boardBorder: '#8b7bff', title: ['#8b7bff', '#ffffff', '#8b7bff'], accent: '#8b7bff', bgTop: '#070714', bgBottom: '#1d1b3d' },
  aurora: { board: '#02151d', boardBorder: '#00fff0', title: ['#00fff0', '#00ff88', '#00fff0'], accent: '#00fff0', bgTop: '#010f14', bgBottom: '#0a3d4d' }
};

let theme = THEMES.clasico;

function applyTheme(name) {
  theme = THEMES[name] || THEMES.clasico;
  const titleEl = document.querySelector('#game-title');
  if (titleEl) {
    titleEl.style.background = `linear-gradient(90deg, ${theme.title[0]}, ${theme.title[1]}, ${theme.title[2]})`;
    titleEl.style.webkitBackgroundClip = 'text';
    titleEl.style.backgroundClip = 'text';
    titleEl.style.webkitTextFillColor = 'transparent';
  }
  boardCanvas.style.borderColor = theme.boardBorder;
  boardCanvas.style.boxShadow = `0 0 30px ${theme.boardBorder}`;
}

// ============ AUDIO & RUIDO ============
let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function initAudio() {
  getAudioContext();
}

function scheduleNoise(when, dur, vol, high) {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * dur;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = high ? 'highpass' : 'bandpass';
  filter.frequency.value = high ? 6000 : 1800;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(vol, when);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  src.start(when);
  src.stop(when + dur + 0.02);
}

function playTone(freq, duration, type = 'square', volume = 0.04, when = 0) {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const start = audioCtx.currentTime + when;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

const SOUNDS = {
  move: () => playTone(200, 0.04, 'square', 0.02),
  rotate: () => playTone(320, 0.05, 'square', 0.02),
  drop: () => playTone(120, 0.08, 'square', 0.03),
  hardDrop: () => playTone(80, 0.1, 'sawtooth', 0.05),
  clear: (count) => [0, 1, 2, 3].slice(0, count).forEach(i => playTone(523 * Math.pow(1.26, i), 0.1, 'square', 0.04, i * 0.08)),
  hold: () => playTone(400, 0.05, 'triangle', 0.03),
  gameOver: () => [220, 220, 165, 165, 165, 165, 220].forEach((f, i) => playTone(f, 0.18, 'sawtooth', 0.04, i * 0.15)),
  levelUp: () => playTone(660, 0.12, 'square', 0.04),
  garbage: () => playTone(90, 0.12, 'sawtooth', 0.04),
  lock: () => playTone(150, 0.06, 'square', 0.03),
  explosion: () => {
    playTone(180, 0.12, 'sawtooth', 0.05);
    playTone(90, 0.15, 'square', 0.04, 0.03);
    scheduleNoise(audioCtx ? audioCtx.currentTime : 0, 0.15, 0.15, false);
  },
};

let gameMode = 'maraton';

const SHAPES = [
  { id: 0, name: 'I', color: '#00e5ff', matrix: [[1,1,1,1]] },
  { id: 1, name: 'J', color: '#3a7bd5', matrix: [[1,0,0],[1,1,1]] },
  { id: 2, name: 'L', color: '#ff9100', matrix: [[0,0,1],[1,1,1]] },
  { id: 3, name: 'O', color: '#ffd600', matrix: [[1,1],[1,1]] },
  { id: 4, name: 'S', color: '#69f0ae', matrix: [[0,1,1],[1,1,0]] },
  { id: 5, name: 'T', color: '#d500f9', matrix: [[0,1,0],[1,1,1]] },
  { id: 6, name: 'Z', color: '#ff1744', matrix: [[1,1,0],[0,1,1]] },
];

const SRS_KICKS = {
  JLSTZ: [
    [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
    [[0,0],[1,0],[1,-1],[0,2],[1,2]],
    [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
    [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  ],
  I: [
    [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
    [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
    [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
    [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
  ],
};

// ============ ESTADO ============
let board = [];
let currentPiece = null;
let nextQueue = [];
let nextPiece = null;
let holdPiece = null;
let canHold = true;
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let started = false;
let paused = false;
let dropInterval = 1000;
let dropTimer = 0;
let lockDelay = 0;
let lastTime = 0;
let animationId = null;
let gameStartMs = 0;
let elapsedMs = 0;

let garbageLines = 0;
let combo = 0;
let b2b = false;

let stats = { pieces: 0, lines: 0, tetrises: 0, combo: 0, placed: 0 };
let lineEffect = { active: false, rows: [], t: 0, done: false };
let impactParticles = [];
let particles = [];

// ============ TABLERO Y PANTALLA ============
function fitToScreen() {
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const isMobile = winW < 700;
  gameContainer.classList.toggle('mobile', isMobile);

  const vh = Math.max(10, document.documentElement.clientHeight || winH);
  const vw = Math.max(10, document.documentElement.clientWidth || winW);

  if (isMobile) {
    infoPanel.style.height = 'auto';
    sidePanel.style.height = 'auto';
    scaler.style.zoom = '1';
    const scale = Math.min((vw - 6) / Math.max(scaler.scrollWidth, 1), 1);
    scaler.style.zoom = Math.max(0.2, scale);
    return;
  }

  scaler.style.zoom = '1';
  const panelW = Math.max(150, Math.min(190, winW * 0.13));
  const availW = vw - 2 * panelW - 36 - 28;
  const availH = vh * 0.86;
  const newBlock = Math.max(16, Math.min(Math.floor(availW / COLS), Math.floor(availH / ROWS)));
  if (newBlock !== BLOCK) {
    BLOCK = newBlock;
    resizeProcessor();
  }
  const bh = boardCanvas.offsetHeight;
  infoPanel.style.height = bh + 'px';
  sidePanel.style.height = bh + 'px';
}

function resizeProcessor() {
  boardCanvas.width = COLS * BLOCK;
  boardCanvas.height = ROWS * BLOCK;
  nextCanvas.width = 90;
  nextCanvas.height = 90;
  holdCanvas.width = 90;
  holdCanvas.height = 90;
}

function resizeBoard() {
  resizeProcessor();
  fitToScreen();
}

function createBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

let bag = [];
function refillBag() {
  bag = SHAPES.slice().sort(() => Math.random() - 0.5);
}
function nextFromBag() {
  if (bag.length === 0) refillBag();
  return bag.shift();
}

function spawnPiece(piece = null) {
  let type = piece;
  if (!type) {
    while (nextQueue.length < 2) nextQueue.push(nextFromBag());
    type = nextQueue.shift();
  }
  currentPiece = {
    type: type,
    matrix: type.matrix.map(row => [...row]),
    row: 0,
    col: Math.floor((COLS - type.matrix[0].length) / 2),
    r: 0,
  };
  while (nextQueue.length < 1) nextQueue.push(nextFromBag());
  nextPiece = nextQueue[0];
  canHold = true;
  lockDelay = 0;
  if (collides(currentPiece.matrix, currentPiece.row, currentPiece.col)) {
    gameOver = true;
    endGame();
  }
  stats.pieces++;
}

function collides(matrix, row, col) {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        const newCol = col + c;
        const newRow = row + r;
        if (newCol < 0 || newCol >= COLS || newRow >= ROWS) return true;
        if (newRow >= 0 && board[newRow][newCol]) return true;
      }
    }
  }
  return false;
}

function rotateMatrixCW(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const newMatrix = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      newMatrix[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return newMatrix;
}

function rotatePiece() {
  if (gameOver || paused || !currentPiece) return;
  const typeName = currentPiece.type.name;
  const oldR = currentPiece.r;
  const newR = (oldR + 1) % 4;
  const rotated = rotateMatrixCW(currentPiece.matrix);
  const kicks = (typeName === 'I' ? SRS_KICKS.I : SRS_KICKS.JLSTZ)[oldR];

  for (const [dx, dy] of kicks) {
    const newCol = currentPiece.col + dx;
    const newRow = currentPiece.row - dy;
    if (!collides(rotated, newRow, newCol)) {
      currentPiece.matrix = rotated;
      currentPiece.col = newCol;
      currentPiece.row = newRow;
      currentPiece.r = newR;
      lockDelay = 0;
      SOUNDS.rotate();
      return;
    }
  }
}

function rotatePiece180() {
  rotatePiece();
  rotatePiece();
}

function moveLeft() {
  if (gameOver || paused || !currentPiece) return;
  if (!collides(currentPiece.matrix, currentPiece.row, currentPiece.col - 1)) {
    currentPiece.col--;
    lockDelay = 0;
    SOUNDS.move();
  }
}

function moveRight() {
  if (gameOver || paused || !currentPiece) return;
  if (!collides(currentPiece.matrix, currentPiece.row, currentPiece.col + 1)) {
    currentPiece.col++;
    lockDelay = 0;
    SOUNDS.move();
  }
}

function moveDown() {
  if (gameOver || paused || !currentPiece) return false;
  if (!collides(currentPiece.matrix, currentPiece.row + 1, currentPiece.col)) {
    currentPiece.row++;
    lockDelay = 0;
    return true;
  }
  return false;
}

function hardDrop() {
  if (gameOver || paused || !currentPiece) return;
  let dist = 0;
  while (!collides(currentPiece.matrix, currentPiece.row + 1, currentPiece.col)) {
    currentPiece.row++;
    dist++;
  }
  score += dist * 2;
  stats.placed++;
  SOUNDS.hardDrop();
  spawnHardDropParticles();
  lockPiece();
}

function merge() {
  const { matrix, row, col, type } = currentPiece;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        const rr = row + r;
        const cc = col + c;
        if (rr >= 0) board[rr][cc] = type.color;
      }
    }
  }
}

function clearLines() {
  let clearedRows = [];
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell !== 0)) {
      clearedRows.push(r);
    }
  }
  if (clearedRows.length === 0) {
    combo = 0;
    return clearedRows;
  }
  const tetris = clearedRows.length === 4;
  const points = [0, 100, 300, 500, 800][Math.min(clearedRows.length, 4)];
  let total = points * level;

  if (combo > 0) total += 50 * combo * level;
  combo++;
  stats.combo = Math.max(stats.combo, combo - 1);

  if (tetris) stats.tetrises++;
  if (tetris && b2b) total = Math.floor(total * 1.5);
  b2b = tetris;

  score += total;
  lines += clearedRows.length;
  stats.lines += clearedRows.length;

  const newLevel = Math.floor(lines / 10) + 1;
  if (newLevel > level) SOUNDS.levelUp();
  level = newLevel;
  dropInterval = gameMode === 'maraton' ? Math.max(80, 1000 - (level - 1) * 70) : 1000;

  startLineEffect(clearedRows);
  return clearedRows;
}

function finishClear() {
  for (const r of lineEffect.rows) {
    board.splice(r, 1);
    board.unshift(Array(COLS).fill(0));
  }
  SOUNDS.clear(Math.min(lineEffect.rows.length, 4));
  lineEffect.active = false;
  lineEffect.done = true;
  spawnRowExplosion(lineEffect.rows);
  showClearAnimation(lineEffect.rows);
  addGarbageForClear(lineEffect.rows.length);
  if (garbageLines > 0) {
    addGarbageRows(garbageLines);
    checkGarbageGameOver();
  }
}

function checkGarbageGameOver() {
  if (board[0].some(cell => cell !== 0) || board[1].some(cell => cell !== 0)) {
    gameOver = true;
    endGame();
  }
}

function startLineEffect(rows) {
  lineEffect = { active: true, rows: rows.slice().sort((a, b) => a - b), t: 0, done: false };
}

function lockPiece() {
  merge();
  SOUNDS.lock();
  const cleared = clearLines();
  if (cleared && cleared.length === 0) {
    spawnPiece();
    updateScore();
  }
}

function addGarbageForClear(clearedCount) {
  if (clearedCount >= 4) {
    garbageLines += level - 1;
    SOUNDS.garbage();
    updateGarbageDisplay();
  }
}

function addGarbageRows(n) {
  if (n <= 0) return;
  for (let i = 0; i < n; i++) {
    board.shift();
    const newRow = Array(COLS).fill('garbage');
    newRow[Math.floor(Math.random() * COLS)] = 0;
    board.push(newRow);
  }
  garbageLines = 0;
  updateGarbageDisplay();
}

function updateGarbageDisplay() {
  if (garbageLines > 0) {
    garbageBar.classList.remove('hidden');
    garbageCountEl.textContent = garbageLines;
  } else {
    garbageBar.classList.add('hidden');
  }
}

function holdPieceFunc() {
  if (gameOver || paused || !canHold || !currentPiece) return;
  const currentType = currentPiece.type;
  let replacement = holdPiece ? holdPiece : nextFromBag();
  holdPiece = currentType;
  spawnPiece(replacement);
  canHold = false;
  SOUNDS.hold();
}

// ============ UI & PUNTUACIONES ============
function updateScore() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
  linesEl.textContent = lines;
  statPiecesEl.textContent = stats.pieces;
  statLinesEl.textContent = stats.lines;
  statTetrisesEl.textContent = stats.tetrises;
  statComboEl.textContent = combo > 1 ? combo - 1 : 0;
}

function updateAccuracy() {
  statAccEl.textContent = stats.pieces === 0 ? '100%' : Math.round((stats.placed / stats.pieces) * 100) + '%';
}

function updateTimeDisplay() {
  const secs = Math.floor(elapsedMs / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  statTimeEl.textContent = `${mm}:${ss}`;
}

// ============ DIBUJO ============
function drawBlock(ctx, x, y, color, size, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x, y, size, size * 0.15);
  ctx.fillRect(x, y, size * 0.15, size);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.strokeRect(x, y, size, size);
  ctx.globalAlpha = 1;
}

function getGhostRow() {
  if (!currentPiece) return 0;
  let row = currentPiece.row;
  while (!collides(currentPiece.matrix, row + 1, currentPiece.col)) row++;
  return row;
}

function drawBoard() {
  boardCtx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (cell === 'garbage') {
        boardCtx.fillStyle = '#ff8c8c';
        boardCtx.fillRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
      } else if (cell) {
        drawBlock(boardCtx, c * BLOCK, r * BLOCK, cell, BLOCK);
      }
    }
  }

  if (currentPiece && !gameOver) {
    const { matrix, row, col, type } = currentPiece;
    const ghostRow = getGhostRow();

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const cc = col + c;
          const gr = ghostRow + r;
          if (gr !== row + r) {
            boardCtx.fillStyle = type.color;
            boardCtx.globalAlpha = 0.2;
            boardCtx.fillRect(cc * BLOCK, gr * BLOCK, BLOCK, BLOCK);
            boardCtx.globalAlpha = 1;
          }
        }
      }
    }

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] && row + r >= 0) {
          drawBlock(boardCtx, (col + c) * BLOCK, (row + r) * BLOCK, type.color, BLOCK);
        }
      }
    }
  }

  if (lineEffect.active) {
    for (const r of lineEffect.rows) {
      boardCtx.fillStyle = `rgba(255,255,255,${0.6 * (1 - lineEffect.t)})`;
      boardCtx.fillRect(0, r * BLOCK, boardCanvas.width, BLOCK);
    }
  }
}

function drawMiniPiece(ctx, piece) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (!piece) return;
  const matrix = piece.matrix;
  const size = Math.floor(ctx.canvas.width / 3.4);
  const offsetX = (ctx.canvas.width - matrix[0].length * size) / 2;
  const offsetY = (ctx.canvas.height - matrix.length * size) / 2;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        drawBlock(ctx, offsetX + c * size, offsetY + r * size, piece.color, size);
      }
    }
  }
}

function draw() {
  drawBoard();
  drawImpactParticles();
  drawMiniPiece(nextCtx, nextPiece);
  drawMiniPiece(holdCtx, holdPiece);
}

function initParticles() {
  particles = Array.from({ length: 40 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 3 + 1,
    speed: Math.random() * 0.0015 + 0.0005,
    drift: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.5 + 0.1,
  }));
}

function drawBackground() {
  const w = bgCanvas.width = window.innerWidth;
  const h = bgCanvas.height = window.innerHeight;
  const grad = bgCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, theme.bgTop);
  grad.addColorStop(1, theme.bgBottom);
  bgCtx.fillStyle = grad;
  bgCtx.fillRect(0, 0, w, h);

  const t = performance.now() / 1000;
  for (const p of particles) {
    p.y += p.speed;
    p.x += p.drift * 0.01;
    if (p.y > 1) { p.y = -0.05; p.x = Math.random(); }
    bgCtx.fillStyle = theme.accent;
    bgCtx.globalAlpha = p.alpha * (0.7 + 0.3 * Math.sin(t * 2 + p.x * 10));
    bgCtx.beginPath();
    bgCtx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
    bgCtx.fill();
  }
  bgCtx.globalAlpha = 1;
}

function spawnExplosion(row, col, color, count, square = true) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 0.12 + 0.05) * BLOCK / 30;
    impactParticles.push({
      x: (col + 0.5) * BLOCK,
      y: (row + 0.5) * BLOCK,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: Math.random() * 0.02 + 0.012,
      size: (Math.random() * 0.5 + 0.3) * BLOCK * 0.5,
      color: color,
      square: square,
      gravity: 0.0022 * BLOCK / 30,
    });
  }
}

function spawnRowExplosion(rows) {
  for (const r of rows) {
    for (let c = 0; c < COLS; c++) {
      if (board[r] && board[r][c]) spawnExplosion(r, c, board[r][c], 2, true);
    }
  }
  SOUNDS.explosion();
}

function spawnHardDropParticles() {
  if (!currentPiece) return;
  const bottom = getGhostRow();
  const { matrix, col, type } = currentPiece;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) spawnExplosion(bottom + r, col + c, type.color, 2, true);
    }
  }
  SOUNDS.explosion();
}

function updateImpactParticles(delta) {
  const dt = delta / 1000;
  for (let i = impactParticles.length - 1; i >= 0; i--) {
    const p = impactParticles[i];
    p.life -= p.decay;
    if (p.life <= 0) { impactParticles.splice(i, 1); continue; }
    p.vy += p.gravity * dt * 60;
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
  }
}

function drawImpactParticles() {
  for (const p of impactParticles) {
    boardCtx.globalAlpha = Math.max(0, p.life);
    boardCtx.fillStyle = p.color;
    if (p.square) {
      boardCtx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    } else {
      boardCtx.beginPath();
      boardCtx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      boardCtx.fill();
    }
  }
  boardCtx.globalAlpha = 1;
}

function clearImpactParticles() {
  impactParticles = [];
}

function showFloatText(text, className, color) {
  const el = document.createElement('div');
  el.className = 'fx-float ' + (className || 'medium');
  el.style.color = color || '#ffffff';
  el.style.top = '38%';
  el.textContent = text;
  fxLayer.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1700);
}

function showClearAnimation(clearedRows) {
  if (clearedRows.length === 0) return;
  const labels = {
    1: { text: 'SINGLE!', size: 'medium', color: '#7dd8ff' },
    2: { text: 'DOUBLE!', size: 'big', color: '#4dd0e1' },
    3: { text: 'TRIPLE!', size: 'big', color: '#ffd54f' },
    4: { text: 'TETRIS!', size: 'big', color: '#ff5252' },
  };
  const label = labels[clearedRows.length] || labels[1];
  showFloatText(label.text, label.size, label.color);
  if (combo > 1) showFloatText('COMBO ×' + (combo - 1), 'fx-combo', '#ffd600');
}

// ============ VISUALIZADOR DE AUDIO ============
let vizStyle = 'barras';
let vizSmooth = new Float32Array(32);
let vizActive = false;
let captureKind = null;
let captureStream = null;
let captureSourceNode = null;
let vizAnalyser = null;
let vizData = null;

function ensureVizAnalyser() {
  const ac = getAudioContext();
  if (!ac) return null;
  if (!vizAnalyser) {
    vizAnalyser = ac.createAnalyser();
    vizAnalyser.fftSize = 128;
    vizAnalyser.smoothingTimeConstant = 0.8;
    vizData = new Uint8Array(vizAnalyser.frequencyBinCount);
  }
  return vizAnalyser;
}

function connectCaptureToVisualizer(stream) {
  const ac = getAudioContext();
  const analyser = ensureVizAnalyser();
  if (!ac || !analyser) return null;

  if (stream.getVideoTracks().length > 0) {
    stream.getVideoTracks().forEach((tr) => tr.stop());
  }

  const source = ac.createMediaStreamSource(stream);
  const silent = ac.createGain();
  silent.gain.value = 0;
  source.connect(analyser);
  analyser.connect(silent);
  silent.connect(ac.destination);
  return source;
}

function beginCapture(stream, kind) {
  const source = connectCaptureToVisualizer(stream);
  if (!source) {
    stream.getTracks().forEach((tr) => tr.stop());
    return;
  }
  captureStream = stream;
  captureSourceNode = source;
  captureKind = kind;
  vizActive = true;
  updateCaptureUI();
  updateVisualizerVisibility();

  if (stream.getAudioTracks()[0]) {
    stream.getAudioTracks()[0].onended = () => stopCapture();
  }
}

function stopCapture() {
  if (captureSourceNode) {
    try { captureSourceNode.disconnect(); } catch (e) {}
    captureSourceNode = null;
  }
  if (captureStream) {
    captureStream.getTracks().forEach((tr) => tr.stop());
    captureStream = null;
  }
  captureKind = null;
  vizActive = false;
  updateCaptureUI();
  updateVisualizerVisibility();
}

function updateCaptureUI() {
  const isMic = vizActive && captureKind === 'mic';
  const isTab = vizActive && captureKind === 'tab';
  if (micBtn) {
    micBtn.textContent = isMic ? '🎙️ DETENER CAPTURA' : '🎤 ACTIVAR AUDIO DEL VIDEO';
  }
  if (tabBtn) {
    tabBtn.textContent = isTab ? '🔊 DETENER PESTAÑA' : '🔊 CAPTURAR AUDIO DE OTRA PESTAÑA';
  }
}

async function toggleMicCapture() {
  if (vizActive && captureKind === 'mic') {
    stopCapture();
    return;
  }
  stopCapture();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    beginCapture(stream, 'mic');
  } catch (err) {
    alert('No se pudo acceder al micrófono o entrada de audio.');
  }
}

async function toggleTabCapture() {
  if (vizActive && captureKind === 'tab') {
    stopCapture();
    return;
  }
  stopCapture();
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
    beginCapture(stream, 'tab');
  } catch (err) {
    alert('No se pudo capturar el audio de la pestaña.');
  }
}

function drawVisualizer() {
  if (!vizCanvas || !vizCtx) return;

  if (vizCanvas.width !== window.innerWidth || vizCanvas.height !== window.innerHeight) {
    vizCanvas.width = window.innerWidth;
    vizCanvas.height = window.innerHeight;
  }

  const w = vizCanvas.width;
  const h = vizCanvas.height;
  
  vizCtx.clearRect(0, 0, w, h);

  const N = 32;
  const bw = w / N;
  
  if (vizActive && vizAnalyser && vizData) {
    vizAnalyser.getByteFrequencyData(vizData);
    const usefulRatio = 0.65;
    const usefulBins = Math.floor(vizAnalyser.frequencyBinCount * usefulRatio);
    for (let i = 0; i < N; i++) {
      const rawIndex = (i / N) * usefulBins;
      const binIndex = Math.max(0, Math.min(Math.floor(rawIndex), usefulBins - 1));
      const val = vizData[binIndex] / 255;
      const boostedVal = Math.pow(val, 0.8) * 0.85 + 0.15;
      vizSmooth[i] = vizSmooth[i] * 0.7 + boostedVal * 0.3;
    }
  } else {
    const time = performance.now() * 0.003;
    for (let i = 0; i < N; i++) {
      vizSmooth[i] = Math.abs(Math.sin(time + i * 0.2)) * 0.2;
    }
  }

  const cx = w / 2;
  const cy = h / 2;

  switch (vizStyle) {
    case 'ondas':
      vizCtx.beginPath();
      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * w;
        const y = cy - (vizSmooth[i] - 0.2) * (h * 0.45);
        if (i === 0) vizCtx.moveTo(x, y);
        else vizCtx.lineTo(x, y);
      }
      vizCtx.strokeStyle = '#00ffff';
      vizCtx.lineWidth = 4;
      vizCtx.stroke();
      break;

    case 'circular':
      // Safe handling: ensure vizData and vizSmooth have valid values
      const safeVizData = vizData && vizData.length > 0 ? vizData : new Uint8Array(32);
      const safeVizSmooth = vizSmooth && vizSmooth.length > 0 ? vizSmooth : new Float32Array(32);
      
      vizCtx.shadowColor = '#ff007f';
      vizCtx.shadowBlur = 10;
      vizCtx.strokeStyle = '#ff00ff';
      vizCtx.lineWidth = 2;
      
      // Draw thin central magenta/neon circle
      vizCtx.beginPath();
      vizCtx.arc(cx, cy, Math.min(w, h) * 0.22, 0, Math.PI * 2);
      vizCtx.stroke();
      
      // Draw radial spectrum bars along 360° circumference
      const barCount = 32;
      const barThickness = 4;
      for (let i = 0; i < barCount; i++) {
        // Safe frequency data access
        const freqIdx = Math.min(i, safeVizData.length - 1);
        const barHeight = safeVizData[freqIdx] / 255 * (h * 0.4);
        
        const angle = (i / barCount) * Math.PI * 2;
        const startR = Math.min(w, h) * 0.22;
        const endR = startR + barHeight;
        
        const x1 = cx + Math.cos(angle) * startR;
        const y1 = cy + Math.sin(angle) * startR;
        const x2 = cx + Math.cos(angle) * endR;
        const y2 = cy + Math.sin(angle) * endR;
        
        vizCtx.beginPath();
        vizCtx.moveTo(x1, y1);
        vizCtx.lineTo(x2, y2);
        vizCtx.stroke();
      }
      break;

    case 'espectro':
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2;
        const r1 = Math.min(w, h) * 0.18;
        const r2 = r1 + vizSmooth[i] * (Math.min(w, h) * 0.25);

        const x1 = cx + Math.cos(angle) * r1;
        const y1 = cy + Math.sin(angle) * r1;
        const x2 = cx + Math.cos(angle) * r2;
        const y2 = cy + Math.sin(angle) * r2;

        vizCtx.strokeStyle = `hsl(${200 + vizSmooth[i] * 120}, 100%, 50%)`;
        vizCtx.lineWidth = 4;
        vizCtx.beginPath();
        vizCtx.moveTo(x1, y1);
        vizCtx.lineTo(x2, y2);
        vizCtx.stroke();
      }
      break;

case 'niebla':
  // Get volume and bass data for pulse effect
  const volume = vizSmooth.reduce((a, b) => a + b, 0) / N;
  const bass = vizData[0] / 255;

  // Calculate stylized, centered head size (not blocking screen)
  const headRadius = Math.min(w, h) * 0.22;
  const pulse = 1 + volume * 0.3; // subtle pulse based on volume

  // Head - dark with magenta neon border
  vizCtx.save();
  vizCtx.translate(cx, cy);
  // Apply subtle pulse scaling
  vizCtx.scale(1 + (volume * 0.1) * Math.sin(performance.now() * 0.001), 
               1 + (volume * 0.1) * Math.cos(performance.now() * 0.001));

  // Dark head background
  vizCtx.fillStyle = '#0a0a1a';
  vizCtx.beginPath();
  vizCtx.arc(0, 0, headRadius * pulse, 0, Math.PI * 2);
  vizCtx.fill();

  // Magenta neon border
  vizCtx.strokeStyle = '#ff007f';
  vizCtx.lineWidth = 4;
  vizCtx.beginPath();
  vizCtx.arc(0, 0, headRadius * pulse, 0, Math.PI * 2);
  vizCtx.stroke();

  // Effect glow
  vizCtx.shadowColor = '#ff007f';
  vizCtx.shadowBlur = 15;

  // Eyes - left larger than right, aligned horizontally in upper half of face
  const eyeY = -headRadius * 0.22;
  const eyeLeftRadius = headRadius * 0.17 * pulse;
  const eyeRightRadius = headRadius * 0.11 * pulse;
  const eyeXLeft = -headRadius * 0.12;
  const eyeXRight = headRadius * 0.14;

  vizCtx.fillStyle = '#fff';
  vizCtx.beginPath();
  vizCtx.arc(eyeXLeft, eyeY, eyeLeftRadius, 0, Math.PI * 2);
  vizCtx.fill();

  vizCtx.beginPath();
  vizCtx.arc(eyeXRight, eyeY, eyeRightRadius, 0, Math.PI * 2);
  vizCtx.fill();

  // Clear shadow temporarily for mouth
  vizCtx.shadowBlur = 0;

  // Mouth - semicircle filled in lower half of face
  const mouthWidth = headRadius * 0.65 * pulse;
  const mouthHeight = headRadius * 0.18 * pulse;
  const mouthY = headRadius * 0.1 * pulse; // positioned below eyes

  // Draw mouth filled arc (semicircle in lower face)
  vizCtx.fillStyle = '#ff007f';
  vizCtx.beginPath();
  vizCtx.arc(0, mouthY, mouthWidth / 2, 0.5, 3.1);
  vizCtx.fill();

  // Mouth outline
  vizCtx.strokeStyle = '#fff';
  vizCtx.lineWidth = 2;
  vizCtx.beginPath();
  vizCtx.arc(0, mouthY, mouthWidth / 2, 0.5, 3.1);
  vizCtx.stroke();

  // Definitive teeth fix: use clipping to ensure teeth stay inside mouth
  // Save context before clipping
  vizCtx.save();
  
  // Create clipping path: shape of the mouth cavity
  vizCtx.beginPath();
  vizCtx.arc(0, mouthY, mouthWidth / 2, 0.5, 3.1);
  vizCtx.clip();
  
  // Teeth - rectangular, inside the mouth cavity, aligned to upper inner border
  vizCtx.fillStyle = '#fff';
  const toothCount = 7;
  const toothWidth = mouthWidth / toothCount;
  
  // Row of teeth inside the clipped mouth area, aligned at top inner border
  for (let i = 0; i < toothCount; i++) {
    const toothX = -mouthWidth / 2 + i * toothWidth + toothWidth / 4;
    // Teeth start at top inner border of mouth and extend downward
    const toothStartY = mouthHeight * 0.08; // at top of mouth cavity
    const toothHeight = mouthHeight * 0.38; // height of teeth
    
    vizCtx.fillRect(toothX - toothWidth / 8, toothStartY - toothHeight / 2, toothWidth / 4, toothHeight);
  }
  
  // Restore context - teeth now confined within mouth clip
  vizCtx.restore();

  // Geometric triangles/pikes distributed around entire outer circumference of head
  // Use 5-8 triangles, evenly spaced around the head's perimeter, pointing outward
  // Increased triangle size: base from 15px to 20px equivalent
  const triangleCount = 5 + Math.floor(volume * 3); // 5 to 8 triangles based on volume
  for (let i = 0; i < triangleCount; i++) {
    // Evenly distribute triangles around full circle: angle from 0 to 2π
    const angle = (i / triangleCount) * Math.PI * 2;
    const baseDist = headRadius * 0.55;
    const impact = vizData[(i * 7) % vizData.length] / 255; // varied audio response
    const jump = 1 + impact * 0.8; // subtler audio pulse
    const triangleDist = baseDist * jump;

    // Position on the outer circumference, pointing strictly outward
    const tx = Math.cos(angle) * (headRadius * pulse);
    const ty = Math.sin(angle) * (headRadius * pulse);

    // Triangle pointing strictly outward (radial direction) - increased size
    const tipX = tx * 1.1; // slightly larger
    const tipY = ty * 1.1;
    const leftX = tx - headRadius * 0.05 * jump; // wider base
    const rightX = tx + headRadius * 0.05 * jump;
    const baseY = ty;

    vizCtx.fillStyle = '#ff007f';
    vizCtx.beginPath();
    vizCtx.moveTo(tipX, tipY);
    vizCtx.lineTo(leftX, baseY);
    vizCtx.lineTo(rightX, baseY);
    vizCtx.closePath();
    vizCtx.fill();
  }
  vizCtx.restore();
  break;

    case 'barras':
    default:
      for (let i = 0; i < N; i++) {
        const bh = vizSmooth[i] * (h * 0.6);
        vizCtx.fillStyle = `hsl(${190 + i * 5}, 90%, 60%)`;
        vizCtx.fillRect(i * bw, h - bh, bw - 4, bh);
      }
      break;
  }
}

// ============ REPRODUCTOR YOUTUBE ============
let ytPlayer = null;
let ytShown = false;
let vizRaf = null;

function vizLoop() {
  drawVisualizer();
  vizRaf = requestAnimationFrame(vizLoop);
}

function updateVisualizerVisibility() {
  const shouldShow = ytShown || vizActive;
  ytWrapper.classList.toggle('hidden', !shouldShow);
  if (shouldShow && !vizRaf) {
    vizRaf = requestAnimationFrame(vizLoop);
  }
}

function showYTWrapper(show) {
  ytShown = show;
  updateVisualizerVisibility();
}

function extractYTId(urlOrId) {
  if (!urlOrId) return null;
  if (/^[\w-]{11}$/.test(urlOrId.trim())) return urlOrId.trim();
  const clean = urlOrId.split('?')[0].split('&')[0];
  const m = clean.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function loadYouTube(id) {
  if (typeof YT === 'undefined' || !YT.Player) return;
  const playerVars = { autoplay: 1, mute: 0, controls: 1, loop: 1, playlist: id, origin: window.location.origin || '*' };
  
  if (ytPlayer) {
    ytPlayer.loadVideoById(id);
    if (ytPlayer.unMute) ytPlayer.unMute();
    if (ytPlayer.setVolume && ytVolumeInput) ytPlayer.setVolume(parseInt(ytVolumeInput.value) || 80);
  } else {
    ytPlayer = new YT.Player('yt-video', {
      videoId: id,
      playerVars,
      host: 'https://www.youtube-nocookie.com',
      events: {
        'onReady': (e) => {
          e.target.unMute();
          if (ytVolumeInput) e.target.setVolume(parseInt(ytVolumeInput.value) || 80);
        }
      }
    });
  }
  showYTWrapper(true);
}

// ============ CONTROLES DE ESTADO ============
function togglePause() {
  if (gameOver || !started) return;
  paused = !paused;
  pauseOverlay.classList.toggle('hidden', !paused);
  pauseBtn.textContent = paused ? '▶ REANUDAR' : '⏸ PAUSA';
  if (!paused) {
    lastTime = performance.now();
    animationId = requestAnimationFrame(gameLoop);
  }
}

function updateElapsed() {
  if (!paused && !gameOver) {
    elapsedMs = performance.now() - gameStartMs;
    updateTimeDisplay();
  }
}

function endGame() {
  cancelAnimationFrame(animationId);
  SOUNDS.gameOver();
  finalScoreEl.textContent = 'Puntuación: ' + score;
  checkRecord();
  setControlButtons(false);
  gameOverOverlay.classList.remove('hidden');
}

function checkRecord() {
  if (score <= 0) return;
  const scores = loadHighScores();
  const isRecord = scores.length < 5 || score > scores[scores.length - 1].score;
  newRecordEl.classList.toggle('hidden', !isRecord);
  nameEntry.classList.toggle('hidden', !isRecord);
  drawHighScores();
}

function saveScoreWithName() {
  const name = (playerNameInput.value || 'Jugador').trim();
  const scores = loadHighScores();
  scores.push({ name: name, score: score });
  scores.sort((a, b) => b.score - a.score);
  saveHighScores(scores.slice(0, 5));
  nameEntry.classList.add('hidden');
  newRecordEl.classList.add('hidden');
  drawHighScores();
}

function loadHighScores() {
  try { return JSON.parse(localStorage.getItem('tetris_highscores_v2')) || []; } catch (e) { return []; }
}

function saveHighScores(scores) {
  try { localStorage.setItem('tetris_highscores_v2', JSON.stringify(scores)); } catch (e) {}
}

function drawHighScores() {
  const scores = loadHighScores();
  highScoresOl.innerHTML = scores.length ? '' : '<li class="empty">Sin récords todavía</li>';
  scores.forEach((s, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${s.name} — ${s.score}`;
    highScoresOl.appendChild(li);
  });
}

function setControlButtons(playing) {
  startBtn.disabled = playing;
  pauseBtn.disabled = !playing;
}

function resetState() {
  createBoard();
  score = 0; level = 1; lines = 0;
  dropInterval = 1000;
  gameOver = false; paused = false; started = false; canHold = true;
  holdPiece = null; garbageLines = 0; combo = 0; b2b = false;
  stats = { pieces: 0, lines: 0, tetrises: 0, combo: 0, placed: 0 };
  elapsedMs = 0; nextQueue = []; bag = []; currentPiece = null;
  lineEffect = { active: false, rows: [], t: 0, done: false };
  clearImpactParticles();
  fxLayer.innerHTML = '';
  gameOverOverlay.classList.add('hidden');
  pauseOverlay.classList.add('hidden');
  startOverlay.classList.add('hidden');
  newRecordEl.classList.add('hidden');
  nameEntry.classList.add('hidden');
  pauseBtn.textContent = '⏸ PAUSA';
  updateGarbageDisplay();
  updateScore(); updateTimeDisplay(); updateAccuracy();
  drawHighScores();
  draw();
}

function startGame() {
  resetState();
  started = true;
  spawnPiece();
  updateScore();
  updateAccuracy();
  draw();
  setControlButtons(true);
  gameStartMs = performance.now();
  lastTime = performance.now();
  if (animationId) cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
}

function gameLoop(time) {
  if (gameOver) return;
  const delta = time - lastTime;
  lastTime = time;

  if (!paused) {
    updateElapsed();

    if (lineEffect.active) {
      lineEffect.t += delta / 250;
      if (lineEffect.t >= 1) {
        finishClear();
        spawnPiece();
        updateScore();
      }
    } else {
      dropTimer += delta;
      if (currentPiece && !collides(currentPiece.matrix, currentPiece.row + 1, currentPiece.col)) {
        if (dropTimer >= dropInterval) {
          dropTimer = 0;
          moveDown();
        }
      } else if (currentPiece) {
        dropTimer = 0;
        lockDelay += delta;
        if (lockDelay >= 500) {
          stats.placed++;
          lockPiece();
        }
      }
    }
  }

  updateImpactParticles(delta);
  draw();
  drawBackground();
  if (!gameOver) animationId = requestAnimationFrame(gameLoop);
}

// ============ ENTRADA CONTROLES ============
document.addEventListener('keydown', (e) => {
  initAudio();
  if (e.repeat) return;
  if (e.key === 'p' || e.key === 'P') { togglePause(); return; }
  if (gameOver || !started) return;
  
  if (e.key === 'c' || e.key === 'C') { holdPieceFunc(); draw(); return; }
  switch (e.key) {
    case 'ArrowLeft': e.preventDefault(); moveLeft(); break;
    case 'ArrowRight': e.preventDefault(); moveRight(); break;
    case 'ArrowDown': e.preventDefault(); if (moveDown()) { score += 1; updateScore(); } break;
    case 'ArrowUp': e.preventDefault(); rotatePiece(); break;
    case 'x': case 'X': rotatePiece180(); break;
    case ' ': e.preventDefault(); hardDrop(); updateScore(); break;
  }
  updateAccuracy();
  draw();
});

// Event Listeners UI
restartBtn.addEventListener('click', startGame);
restartBtn2.addEventListener('click', startGame);
startBtn.addEventListener('click', startGame);
startOverlayBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
saveScoreBtn.addEventListener('click', saveScoreWithName);

themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));
modeSelect.addEventListener('change', (e) => { gameMode = e.target.value; });

ytPlayBtn.addEventListener('click', () => {
  const id = extractYTId(ytUrlInput.value);
  if (id) loadYouTube(id);
});
ytStopBtn.addEventListener('click', () => showYTWrapper(false));
ytCloseBtn.addEventListener('click', () => showYTWrapper(false));

if (ytVolumeInput) {
  ytVolumeInput.addEventListener('input', (e) => {
    if (ytPlayer && ytPlayer.setVolume) {
      ytPlayer.setVolume(e.target.value);
    }
  });
}

if (vizStyleSelect) {
  vizStyleSelect.addEventListener('change', (e) => {
    vizStyle = e.target.value;
  });
}

if (micBtn) micBtn.addEventListener('click', toggleMicCapture);
if (tabBtn) tabBtn.addEventListener('click', toggleTabCapture);

window.onYouTubeIframeAPIReady = function() {};

document.addEventListener('click', initAudio, { once: false });
window.addEventListener('resize', () => { resizeBoard(); draw(); });

// Inicialización
applyTheme(themeSelect.value);
initParticles();
resizeBoard();
resetState();
startOverlay.classList.remove('hidden');