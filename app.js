const backdropCanvas = document.querySelector("#backdropCanvas");
const arenaCanvas = document.querySelector("#arenaCanvas");
const arenaStage = document.querySelector("#arenaStage");
const startButton = document.querySelector("#startButton");
const soundButton = document.querySelector("#soundButton");
const focusButton = document.querySelector("#focusButton");
const gameLibraryButton = document.querySelector("#gameLibraryButton");
const openGamesHeroButton = document.querySelector("#openGamesHeroButton");
const gameLibrary = document.querySelector("#gameLibrary");
const closeLibraryButton = document.querySelector("#closeLibraryButton");
const libraryMessage = document.querySelector("#libraryMessage");
const gamePlayer = document.querySelector("#gamePlayer");
const closePlayerButton = document.querySelector("#closePlayerButton");
const modeEyebrow = document.querySelector("#modeEyebrow");
const arenaTitle = document.querySelector("#arenaTitle");
const stageMessage = document.querySelector("#stageMessage");
const roundStatus = document.querySelector("#roundStatus");
const scoreLabel = document.querySelector("#scoreLabel");
const timeLabel = document.querySelector("#timeLabel");
const metricLabel = document.querySelector("#metricLabel");
const scoreReadout = document.querySelector("#scoreReadout");
const timeReadout = document.querySelector("#timeReadout");
const accuracyReadout = document.querySelector("#accuracyReadout");
const difficultyPanel = document.querySelector("#difficultyPanel");
const difficultyTitle = document.querySelector("#difficultyTitle");
const difficultyButtons = [...document.querySelectorAll("[data-difficulty]")];

const storage = {
  aimBestScore: Number(localStorage.getItem("savasGame.aim.bestScore") || localStorage.getItem("savasGame.bestScore") || 0),
  aimBestCombo: Number(localStorage.getItem("savasGame.aim.bestCombo") || localStorage.getItem("savasGame.bestCombo") || 0),
  runnerBestScore: Number(localStorage.getItem("savasGame.runner.bestScore") || 0),
  xoxWins: Number(localStorage.getItem("savasGame.xox.xWins") || 0),
  xoxBotWins: Number(localStorage.getItem("savasGame.xox.oWins") || 0),
  memoryBestMoves: Number(localStorage.getItem("savasGame.memory.bestMoves") || 0),
  snakeBestScore: Number(localStorage.getItem("savasGame.snake.bestScore") || 0),
};

const sound = createSoundEngine();
const backdrop = createBackdrop(backdropCanvas);
const aimArena = createAimArena(arenaCanvas);
const runnerGame = createRunnerGame(arenaCanvas);
const xoxGame = createXoxGame(arenaCanvas);
const memoryGame = createMemoryGame(arenaCanvas);
const snakeGame = createSnakeGame(arenaCanvas);

const games = {
  reflex: {
    title: "Aim Antreman\u0131",
    eyebrow: "hedef modu",
    metricLabel: "\u0130sabet",
    difficultyTitle: "Aim zorluk seviyesi",
    readyMessage: "Zorluk se\u00e7 ve ba\u015flat",
    engine: aimArena,
  },
  runner: {
    title: "Neon Ko\u015fu",
    eyebrow: "ko\u015fu modu",
    metricLabel: "Can",
    readyMessage: "Haz\u0131r",
    engine: runnerGame,
  },
  xox: {
    title: "XOX",
    eyebrow: "zeka modu",
    metricLabel: "O",
    difficultyTitle: "Bot zorlu\u011fu",
    readyMessage: "Bot zorlu\u011funu se\u00e7 ve ba\u015flat",
    engine: xoxGame,
  },
  memory: {
    title: "Haf\u0131za Kartlar\u0131",
    eyebrow: "haf\u0131za modu",
    metricLabel: "E\u015fle\u015fme",
    difficultyTitle: "Tahta boyutu",
    readyMessage: "Tahta boyutunu se\u00e7 ve ba\u015flat",
    engine: memoryGame,
  },
  snake: {
    title: "Y\u0131lan Oyunu",
    eyebrow: "klasik mod",
    metricLabel: "En iyi",
    difficultyTitle: "Y\u0131lan zorlu\u011fu",
    readyMessage: "Zorluk se\u00e7 ve ba\u015flat",
    engine: snakeGame,
  },
};

let activeGame = games.reflex;
let activeGameId = "reflex";
let lastFocusedElement = null;
const selectedDifficulties = {
  reflex: "medium",
  xox: "medium",
  memory: "easy",
  snake: "easy",
};

backdrop.start();

startButton.addEventListener("click", () => {
  sound.start();
  sound.play("start");
  activeGame.engine.start(getActiveDifficulty());
});

gameLibraryButton.addEventListener("click", () => {
  sound.start();
  sound.play("open");
  openLibrary();
});

openGamesHeroButton.addEventListener("click", () => {
  sound.start();
  sound.play("open");
  openLibrary();
});

closeLibraryButton.addEventListener("click", () => {
  sound.play("close");
  closeLibrary();
});

closePlayerButton.addEventListener("click", () => {
  sound.play("close");
  closePlayer();
});

gameLibrary.addEventListener("click", (event) => {
  if (event.target === gameLibrary) {
    sound.play("close");
    closeLibrary();
  }
});

gamePlayer.addEventListener("click", (event) => {
  if (event.target === gamePlayer) {
    sound.play("close");
    closePlayer();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && gamePlayer.classList.contains("is-open")) {
    sound.play("close");
    closePlayer();
    return;
  }

  if (event.key === "Escape" && gameLibrary.classList.contains("is-open")) {
    sound.play("close");
    closeLibrary();
  }
});

soundButton.addEventListener("click", () => {
  sound.toggle();
  soundButton.setAttribute("aria-pressed", String(sound.enabled));
  soundButton.setAttribute("aria-label", sound.enabled ? "Sesi kapat" : "Sesi a\u00e7");
  soundButton.classList.toggle("is-muted", !sound.enabled);
  sound.play(sound.enabled ? "open" : "close");
});

focusButton.addEventListener("click", async () => {
  sound.start();
  sound.play("click");

  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    focusButton.setAttribute("aria-label", "Tam ekran desteklenmedi");
  }
});

document.querySelectorAll("button, .nav-tabs a, .brand").forEach((item) => {
  item.addEventListener("pointerenter", () => sound.play("hover"));
});

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!activeGame.difficultyTitle) return;

    sound.start();
    sound.play("click");
    selectedDifficulties[activeGameId] = button.dataset.difficulty;
    activeGame.engine.setDifficulty?.(getActiveDifficulty());
    syncDifficultyButtons();

    if (!gamePlayer.classList.contains("is-open")) return;

    activeGame.engine.reset();
    stageMessage.textContent = activeGame.readyMessage;
    activeGame.engine.drawIdle();
  });
});

document.querySelectorAll("[data-launch]").forEach((button) => {
  button.addEventListener("click", () => {
    sound.start();
    const action = button.dataset.launch;
    const card = button.closest(".game-card");
    const game = games[action];

    if (game) {
      sound.play("click");
      closeLibrary();
      openPlayer(action);
      return;
    }

    document.querySelectorAll(".game-card").forEach((item) => {
      item.classList.toggle("is-selected", item === card);
    });

    if (card) {
      card.classList.add("is-pulsing");
      window.setTimeout(() => card.classList.remove("is-pulsing"), 380);
      const gameName = card.querySelector("h3").textContent;
      libraryMessage.textContent = `${gameName} slotu a\u00e7\u0131k. Oyun kodland\u0131\u011f\u0131nda buraya ba\u011flayaca\u011f\u0131z.`;
    }
    sound.play("click");
  });
});

window.addEventListener("resize", () => {
  backdrop.resize();
  activeGame.engine.resize();
  if (gamePlayer.classList.contains("is-open") && !activeGame.engine.isRunning()) {
    activeGame.engine.drawIdle();
  }
});

document.addEventListener("fullscreenchange", syncFullscreenButton);

function openLibrary() {
  lastFocusedElement = document.activeElement;
  document.body.classList.add("has-modal");
  gameLibrary.classList.add("is-open");
  gameLibrary.setAttribute("aria-hidden", "false");
  gameLibraryButton.setAttribute("aria-expanded", "true");
  libraryMessage.textContent = "Yeni oyunlar i\u00e7in pencere haz\u0131r.";
  gameLibrary.querySelector("[data-launch]")?.focus();
}

function closeLibrary() {
  document.body.classList.remove("has-modal");
  gameLibrary.classList.remove("is-open");
  gameLibrary.setAttribute("aria-hidden", "true");
  gameLibraryButton.setAttribute("aria-expanded", "false");

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

function openPlayer(gameId) {
  stopAllGames();
  activeGameId = gameId;
  activeGame = games[gameId] || games.reflex;
  if (!games[gameId]) activeGameId = "reflex";
  lastFocusedElement = document.activeElement;
  modeEyebrow.textContent = activeGame.eyebrow;
  arenaTitle.textContent = activeGame.title;
  arenaStage.setAttribute("aria-label", activeGame.title);
  metricLabel.textContent = activeGame.metricLabel;
  scoreLabel.textContent = "Skor";
  timeLabel.textContent = "S\u00fcre";
  syncDifficultyPanel();

  document.body.classList.add("has-modal");
  gamePlayer.classList.add("is-open");
  gamePlayer.setAttribute("aria-hidden", "false");
  activeGame.engine.setDifficulty?.(getActiveDifficulty());
  activeGame.engine.reset();
  stageMessage.textContent = activeGame.readyMessage;

  requestAnimationFrame(() => {
    activeGame.engine.resize();
    activeGame.engine.drawIdle();
    startButton.focus();
  });
}

function closePlayer() {
  activeGame.engine.stop();
  document.body.classList.remove("has-modal");
  gamePlayer.classList.remove("is-open");
  gamePlayer.setAttribute("aria-hidden", "true");
  roundStatus.classList.remove("is-live");
  roundStatus.textContent = "Haz\u0131r";
  stageMessage.textContent = "Haz\u0131r";

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

function stopAllGames() {
  Object.values(games).forEach(({ engine }) => engine.stop());
}

function getActiveDifficulty() {
  return selectedDifficulties[activeGameId] || "medium";
}

function getDifficultyLabel(difficulty) {
  const labels = {
    easy: "Kolay",
    medium: "Orta",
    hard: "Zor",
  };
  return labels[difficulty] || labels.medium;
}

function syncDifficultyPanel() {
  const hasDifficulty = Boolean(activeGame.difficultyTitle);
  difficultyPanel.hidden = !hasDifficulty;

  if (!hasDifficulty) return;

  difficultyTitle.textContent = activeGame.difficultyTitle;
  syncDifficultyButtons();
}

function syncDifficultyButtons() {
  const selectedDifficulty = getActiveDifficulty();
  difficultyButtons.forEach((button) => {
    const isSelected = button.dataset.difficulty === selectedDifficulty;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function syncFullscreenButton() {
  const isFullscreen = Boolean(document.fullscreenElement);
  focusButton.setAttribute("aria-pressed", String(isFullscreen));
  focusButton.setAttribute("aria-label", isFullscreen ? "Tam ekrandan \u00e7\u0131k" : "Tam ekrana ge\u00e7");
}

function createSoundEngine() {
  let context = null;
  let enabled = true;
  let lastHover = 0;

  const wave = {
    hover: ["triangle", 520, 0.035, 0.018, 90],
    click: ["square", 310, 0.055, 0.028, 160],
    open: ["sine", 660, 0.12, 0.04, 220],
    close: ["sine", 180, 0.1, 0.04, -70],
    start: ["sawtooth", 180, 0.16, 0.055, 520],
    hit: ["triangle", 760, 0.08, 0.055, 360],
    miss: ["sawtooth", 130, 0.11, 0.045, -70],
    end: ["sine", 240, 0.28, 0.05, -150],
  };

  function start() {
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        enabled = false;
        return;
      }
      context = new AudioContext();
    }

    if (context.state === "suspended") {
      context.resume();
    }
  }

  function play(name) {
    if (!enabled) return;
    if (name === "hover") {
      const now = performance.now();
      if (now - lastHover < 80) return;
      lastHover = now;
    }

    start();
    if (!context) return;

    const [type, frequency, duration, gainValue, bend] = wave[name] || wave.click;
    const osc = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const now = context.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + bend), now + duration);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(420, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function toggle() {
    enabled = !enabled;
    start();
  }

  return {
    get enabled() {
      return enabled;
    },
    play,
    start,
    toggle,
  };
}

function createBackdrop(canvas) {
  const ctx = canvas.getContext("2d");
  const points = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    points.length = 0;
    const count = Math.max(38, Math.floor((width * height) / 26000));
    for (let index = 0; index < count; index += 1) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 1.8 + 0.8,
        color: index % 3 === 0 ? "#5eead4" : index % 3 === 1 ? "#f6c453" : "#ff4d5f",
      });
    }
  }

  function frame() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    points.forEach((point, index) => {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < -20) point.x = width + 20;
      if (point.x > width + 20) point.x = -20;
      if (point.y < -20) point.y = height + 20;
      if (point.y > height + 20) point.y = -20;

      ctx.beginPath();
      ctx.fillStyle = point.color;
      ctx.globalAlpha = 0.45;
      ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      ctx.fill();

      for (let next = index + 1; next < points.length; next += 1) {
        const other = points[next];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        if (distance < 112) {
          ctx.globalAlpha = (1 - distance / 112) * 0.12;
          ctx.strokeStyle = point.color;
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    raf = requestAnimationFrame(frame);
  }

  function start() {
    resize();
    cancelAnimationFrame(raf);
    frame();
  }

  return { resize, start };
}

function createAimArena(canvas) {
  const ctx = canvas.getContext("2d");
  const profiles = {
    easy: {
      radiusBase: 54,
      radiusMin: 34,
      radiusMax: 58,
      radiusShrinkLimit: 14,
      radiusScoreDivisor: 1800,
      lifeBase: 2.1,
      lifeMin: 1.05,
      lifeScoreDivisor: 12000,
    },
    medium: {
      radiusBase: 42,
      radiusMin: 24,
      radiusMax: 46,
      radiusShrinkLimit: 18,
      radiusScoreDivisor: 1400,
      lifeBase: 1.45,
      lifeMin: 0.72,
      lifeScoreDivisor: 9000,
    },
    hard: {
      radiusBase: 35,
      radiusMin: 18,
      radiusMax: 38,
      radiusShrinkLimit: 20,
      radiusScoreDivisor: 1050,
      lifeBase: 1,
      lifeMin: 0.5,
      lifeScoreDivisor: 6500,
    },
  };
  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    running: false,
    difficulty: "medium",
    score: 0,
    combo: 0,
    bestCombo: 0,
    hits: 0,
    shots: 0,
    timeLeft: 45,
    target: null,
    particles: [],
    lastFrame: 0,
    raf: 0,
  };

  resize();

  canvas.addEventListener("pointerdown", (event) => {
    if (!state.running) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    state.shots += 1;

    if (state.target && Math.hypot(x - state.target.x, y - state.target.y) <= state.target.r) {
      registerHit(x, y);
      return;
    }

    state.combo = 0;
    stageMessage.textContent = "Iskalad\u0131n";
    sound.play("miss");
    spawnParticles(x, y, "#ff4d5f", 10, 0.9);
    syncHud();
  });

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(320, rect.width);
    state.height = Math.max(320, rect.height);
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  function start(difficulty = "medium") {
    resize();
    state.difficulty = profiles[difficulty] ? difficulty : "medium";
    metricLabel.textContent = "\u0130sabet";
    scoreLabel.textContent = "Skor";
    timeLabel.textContent = "S\u00fcre";
    state.running = true;
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.hits = 0;
    state.shots = 0;
    state.timeLeft = 45;
    state.particles.length = 0;
    state.lastFrame = performance.now();
    arenaStage.classList.add("is-running");
    roundStatus.classList.add("is-live");
    roundStatus.textContent = "Canl\u0131";
    stageMessage.textContent = `Hedef kilidi: ${getDifficultyLabel(state.difficulty)}`;
    spawnTarget();
    syncHud();
    cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(loop);
  }

  function loop(now) {
    const delta = Math.min(0.05, (now - state.lastFrame) / 1000);
    state.lastFrame = now;
    state.timeLeft = Math.max(0, state.timeLeft - delta);

    if (state.target) {
      state.target.life -= delta;
      state.target.pulse += delta;
      if (state.target.life <= 0) {
        state.combo = 0;
        sound.play("miss");
        spawnParticles(state.target.x, state.target.y, "#f6c453", 8, 0.7);
        spawnTarget();
      }
    }

    updateParticles(delta);
    drawArena();
    syncHud();

    if (state.timeLeft <= 0) {
      finish();
      return;
    }

    state.raf = requestAnimationFrame(loop);
  }

  function registerHit(x, y) {
    state.hits += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    const comboBonus = Math.min(10, state.combo) * 7;
    state.score += 100 + comboBonus;
    stageMessage.textContent = state.combo >= 5 ? `Seri x${state.combo}` : "\u0130sabet";
    sound.play("hit");
    spawnParticles(x, y, state.combo >= 5 ? "#f6c453" : "#5eead4", 20, 1.4);
    spawnTarget();
    syncHud();
  }

  function spawnTarget() {
    const profile = profiles[state.difficulty] || profiles.medium;
    const margin = Math.min(72, Math.max(42, state.width * 0.08));
    const radius = Math.max(
      profile.radiusMin,
      Math.min(profile.radiusMax, profile.radiusBase - Math.min(profile.radiusShrinkLimit, state.score / profile.radiusScoreDivisor)),
    );
    const maxLife = Math.max(profile.lifeMin, profile.lifeBase - state.score / profile.lifeScoreDivisor);
    state.target = {
      x: randomBetween(margin, state.width - margin),
      y: randomBetween(margin, state.height - margin),
      r: radius,
      life: maxLife,
      maxLife,
      pulse: 0,
      hue: Math.random() > 0.5 ? "#ff4d5f" : "#5eead4",
    };
  }

  function spawnParticles(x, y, color, amount, force) {
    for (let index = 0; index < amount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomBetween(80, 240) * force;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: randomBetween(0.28, 0.72),
        maxLife: 0.72,
        color,
        size: randomBetween(2, 5),
      });
    }
  }

  function updateParticles(delta) {
    state.particles = state.particles.filter((particle) => {
      particle.life -= delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vx *= 0.96;
      particle.vy *= 0.96;
      return particle.life > 0;
    });
  }

  function drawIdle() {
    resize();
    drawBase();
    drawCenterGlyph();
  }

  function drawArena() {
    drawBase();
    if (state.target) {
      drawTarget(state.target);
    }
    drawParticles();
  }

  function drawBase() {
    ctx.clearRect(0, 0, state.width, state.height);
    const gradient = ctx.createLinearGradient(0, 0, state.width, state.height);
    gradient.addColorStop(0, "rgba(94, 234, 212, 0.08)");
    gradient.addColorStop(0.46, "rgba(246, 196, 83, 0.04)");
    gradient.addColorStop(1, "rgba(255, 77, 95, 0.08)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.strokeStyle = "rgba(244, 247, 235, 0.09)";
    ctx.lineWidth = 1;
    for (let x = 0; x < state.width; x += 42) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.height);
      ctx.stroke();
    }
    for (let y = 0; y < state.height; y += 42) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y);
      ctx.stroke();
    }
  }

  function drawCenterGlyph() {
    const cx = state.width / 2;
    const cy = state.height / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = "rgba(94, 234, 212, 0.42)";
    ctx.lineWidth = 2;
    for (let ring = 0; ring < 3; ring += 1) {
      ctx.beginPath();
      ctx.arc(0, 0, 44 + ring * 34, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(246, 196, 83, 0.52)";
    ctx.beginPath();
    ctx.moveTo(-130, 0);
    ctx.lineTo(-64, 0);
    ctx.moveTo(64, 0);
    ctx.lineTo(130, 0);
    ctx.moveTo(0, -130);
    ctx.lineTo(0, -64);
    ctx.moveTo(0, 64);
    ctx.lineTo(0, 130);
    ctx.stroke();
    ctx.restore();
  }

  function drawTarget(target) {
    const pulse = Math.sin(target.pulse * 12) * 4;
    const radius = target.r + pulse;
    const lifeRatio = Math.max(0, target.life / target.maxLife);

    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.globalCompositeOperation = "lighter";

    ctx.strokeStyle = target.hue;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(246, 196, 83, 0.88)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, target.r + 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeRatio);
    ctx.stroke();

    ctx.strokeStyle = "rgba(244, 247, 235, 0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-radius - 15, 0);
    ctx.lineTo(-radius + 10, 0);
    ctx.moveTo(radius - 10, 0);
    ctx.lineTo(radius + 15, 0);
    ctx.moveTo(0, -radius - 15);
    ctx.lineTo(0, -radius + 10);
    ctx.moveTo(0, radius - 10);
    ctx.lineTo(0, radius + 15);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 77, 95, 0.72)";
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(5, radius * 0.18), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    state.particles.forEach((particle) => {
      const alpha = Math.max(0, particle.life / particle.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
    });
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function finish() {
    state.running = false;
    cancelAnimationFrame(state.raf);
    arenaStage.classList.remove("is-running");
    roundStatus.classList.remove("is-live");
    roundStatus.textContent = "Bitti";
    stageMessage.textContent = "Tur bitti";
    storage.aimBestScore = Math.max(storage.aimBestScore, state.score);
    storage.aimBestCombo = Math.max(storage.aimBestCombo, state.bestCombo);
    localStorage.setItem("savasGame.lastScore", String(state.score));
    localStorage.setItem("savasGame.bestScore", String(storage.aimBestScore));
    localStorage.setItem("savasGame.bestCombo", String(storage.aimBestCombo));
    localStorage.setItem("savasGame.aim.bestScore", String(storage.aimBestScore));
    localStorage.setItem("savasGame.aim.bestCombo", String(storage.aimBestCombo));
    sound.play("end");
    drawArena();
  }

  function syncHud() {
    scoreReadout.textContent = padScore(state.score);
    timeReadout.textContent = String(Math.ceil(state.timeLeft));
    accuracyReadout.textContent = `${calculateAccuracy()}%`;
  }

  function calculateAccuracy() {
    if (state.shots === 0) return 100;
    return Math.round((state.hits / state.shots) * 100);
  }

  function stop() {
    state.running = false;
    cancelAnimationFrame(state.raf);
    arenaStage.classList.remove("is-running");
  }

  function reset() {
    stop();
    metricLabel.textContent = "\u0130sabet";
    scoreLabel.textContent = "Skor";
    timeLabel.textContent = "S\u00fcre";
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.hits = 0;
    state.shots = 0;
    state.timeLeft = 45;
    state.target = null;
    state.particles.length = 0;
    roundStatus.classList.remove("is-live");
    roundStatus.textContent = "Haz\u0131r";
    stageMessage.textContent = "Haz\u0131r";
    syncHud();
  }

  function isRunning() {
    return state.running;
  }

  return {
    drawIdle,
    isRunning,
    reset,
    resize,
    start,
    stop,
  };
}

function createRunnerGame(canvas) {
  const ctx = canvas.getContext("2d");
  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    running: false,
    score: 0,
    distance: 0,
    speed: 260,
    health: 3,
    timeLeft: 45,
    groundY: 0,
    nextObstacle: 0,
    invincible: 0,
    obstacles: [],
    sparks: [],
    player: {
      x: 74,
      y: 0,
      w: 34,
      h: 48,
      vy: 0,
      onGround: true,
      step: 0,
    },
    lastFrame: 0,
    raf: 0,
  };

  resize();

  canvas.addEventListener("pointerdown", () => {
    if (!state.running) return;
    jump();
  });

  window.addEventListener("keydown", (event) => {
    if (!state.running) return;
    if (event.code === "Space" || event.code === "ArrowUp" || event.key.toLowerCase() === "w") {
      event.preventDefault();
      jump();
    }
  });

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(320, rect.width);
    state.height = Math.max(320, rect.height);
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    syncRunnerBounds();
  }

  function syncRunnerBounds() {
    state.groundY = state.height - Math.max(58, state.height * 0.18);
    state.player.x = Math.max(58, Math.min(104, state.width * 0.14));
    if (!state.running || state.player.onGround) {
      state.player.y = state.groundY - state.player.h;
      state.player.vy = 0;
      state.player.onGround = true;
    }
  }

  function start() {
    resize();
    metricLabel.textContent = "Can";
    scoreLabel.textContent = "Skor";
    timeLabel.textContent = "S\u00fcre";
    state.running = true;
    state.score = 0;
    state.distance = 0;
    state.speed = 260;
    state.health = 3;
    state.timeLeft = 45;
    state.nextObstacle = 0.86;
    state.invincible = 0;
    state.obstacles.length = 0;
    state.sparks.length = 0;
    state.player.vy = 0;
    state.player.step = 0;
    state.player.onGround = true;
    syncRunnerBounds();
    state.lastFrame = performance.now();
    arenaStage.classList.add("is-running");
    roundStatus.classList.add("is-live");
    roundStatus.textContent = "Canl\u0131";
    stageMessage.textContent = "T\u0131kla veya bo\u015flukla z\u0131pla";
    syncHud();
    cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(loop);
  }

  function loop(now) {
    const delta = Math.min(0.05, (now - state.lastFrame) / 1000);
    state.lastFrame = now;
    state.timeLeft = Math.max(0, state.timeLeft - delta);
    state.distance += state.speed * delta;
    state.speed = Math.min(520, 260 + state.distance * 0.018);
    state.invincible = Math.max(0, state.invincible - delta);
    state.player.step += delta * state.speed * 0.035;

    updatePlayer(delta);
    updateObstacles(delta);
    updateSparks(delta);
    drawRunner();
    syncHud();

    if (state.timeLeft <= 0) {
      finish(false);
      return;
    }

    state.raf = requestAnimationFrame(loop);
  }

  function updatePlayer(delta) {
    const gravity = 2600;
    state.player.vy += gravity * delta;
    state.player.y += state.player.vy * delta;

    const floorY = state.groundY - state.player.h;
    if (state.player.y >= floorY) {
      state.player.y = floorY;
      state.player.vy = 0;
      state.player.onGround = true;
    }
  }

  function updateObstacles(delta) {
    state.nextObstacle -= delta;
    if (state.nextObstacle <= 0) {
      spawnObstacle();
      const speedFactor = Math.max(0.58, 1 - (state.speed - 260) / 520);
      state.nextObstacle = randomBetween(0.82, 1.42) * speedFactor;
    }

    state.obstacles.forEach((obstacle) => {
      obstacle.x -= state.speed * delta;
      obstacle.pulse += delta;

      if (!obstacle.passed && obstacle.x + obstacle.w < state.player.x) {
        obstacle.passed = true;
        state.score += 70;
        stageMessage.textContent = "Ge\u00e7tin";
        sound.play("hit");
      }

      if (!obstacle.hit && state.invincible <= 0 && intersects(getPlayerBox(), obstacle)) {
        obstacle.hit = true;
        registerCollision(obstacle);
      }
    });

    state.obstacles = state.obstacles.filter((obstacle) => obstacle.x + obstacle.w > -40);
  }

  function spawnObstacle() {
    const height = randomBetween(38, 66);
    const width = randomBetween(24, 40);
    state.obstacles.push({
      x: state.width + 34,
      y: state.groundY - height,
      w: width,
      h: height,
      passed: false,
      hit: false,
      pulse: 0,
    });
  }

  function jump() {
    if (!state.player.onGround) return;
    state.player.onGround = false;
    state.player.vy = -Math.max(690, Math.min(740, state.height * 1.05));
    stageMessage.textContent = "Z\u0131pla";
    sound.play("click");
    spawnSparks(state.player.x + state.player.w * 0.5, state.groundY - 4, "#5eead4", 9, 0.8);
  }

  function registerCollision(obstacle) {
    state.health = Math.max(0, state.health - 1);
    state.invincible = 1.05;
    stageMessage.textContent = state.health > 0 ? "Kalkan hasar ald\u0131" : "Ko\u015fu bitti";
    sound.play("miss");
    spawnSparks(obstacle.x + obstacle.w * 0.5, obstacle.y + obstacle.h * 0.5, "#ff4d5f", 18, 1.3);

    if (state.health <= 0) {
      finish(true);
    }
  }

  function spawnSparks(x, y, color, amount, force) {
    for (let index = 0; index < amount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomBetween(90, 260) * force;
      state.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: randomBetween(0.26, 0.68),
        maxLife: 0.68,
        size: randomBetween(2, 5),
        color,
      });
    }
  }

  function updateSparks(delta) {
    state.sparks = state.sparks.filter((spark) => {
      spark.life -= delta;
      spark.x += spark.vx * delta;
      spark.y += spark.vy * delta;
      spark.vx *= 0.94;
      spark.vy += 420 * delta;
      return spark.life > 0;
    });
  }

  function drawIdle() {
    resize();
    drawRunnerBase();
    drawRunnerPlayer();
    drawGate(state.width * 0.68, state.groundY - 64, 30, 64, 0);
  }

  function drawRunner() {
    drawRunnerBase();
    state.obstacles.forEach((obstacle) => drawGate(obstacle.x, obstacle.y, obstacle.w, obstacle.h, obstacle.pulse));
    drawRunnerPlayer();
    drawSparks();
  }

  function drawRunnerBase() {
    ctx.clearRect(0, 0, state.width, state.height);
    const sky = ctx.createLinearGradient(0, 0, 0, state.height);
    sky.addColorStop(0, "rgba(76, 201, 240, 0.08)");
    sky.addColorStop(0.5, "rgba(94, 234, 212, 0.04)");
    sky.addColorStop(1, "rgba(255, 77, 95, 0.08)");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, state.width, state.height);

    const offset = state.distance % 120;
    ctx.strokeStyle = "rgba(94, 234, 212, 0.12)";
    ctx.lineWidth = 1;
    for (let x = -offset; x < state.width + 120; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, state.groundY);
      ctx.lineTo(x + 70, state.height);
      ctx.stroke();
    }

    for (let line = 0; line < 6; line += 1) {
      const y = state.groundY + line * 18;
      ctx.globalAlpha = 0.2 - line * 0.022;
      ctx.strokeStyle = line % 2 === 0 ? "#5eead4" : "#f6c453";
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const skylineOffset = (state.distance * 0.18) % 180;
    ctx.fillStyle = "rgba(9, 11, 8, 0.44)";
    for (let x = -skylineOffset; x < state.width + 180; x += 60) {
      const h = 44 + ((x + 240) % 130);
      ctx.fillRect(x, state.groundY - h - 18, 38, h);
    }

    ctx.strokeStyle = "rgba(246, 196, 83, 0.62)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, state.groundY);
    ctx.lineTo(state.width, state.groundY);
    ctx.stroke();
  }

  function drawRunnerPlayer() {
    const player = state.player;
    const blink = state.invincible > 0 && Math.floor(performance.now() / 90) % 2 === 0;
    if (blink) return;

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.globalCompositeOperation = "lighter";

    const lean = player.onGround ? Math.sin(player.step) * 2 : -7;
    ctx.translate(player.w / 2, player.h / 2);
    ctx.rotate((lean * Math.PI) / 180);
    ctx.translate(-player.w / 2, -player.h / 2);

    ctx.fillStyle = "rgba(94, 234, 212, 0.85)";
    ctx.fillRect(7, 12, 20, 25);
    ctx.strokeStyle = "rgba(244, 247, 235, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(17, 36);
    ctx.lineTo(player.onGround ? 8 + Math.sin(player.step) * 5 : 9, 48);
    ctx.moveTo(20, 36);
    ctx.lineTo(player.onGround ? 30 - Math.sin(player.step) * 5 : 28, 48);
    ctx.moveTo(9, 20);
    ctx.lineTo(player.onGround ? 0 : -4, 29);
    ctx.moveTo(27, 20);
    ctx.lineTo(player.onGround ? 34 : 38, 12);
    ctx.stroke();

    ctx.fillStyle = "rgba(246, 196, 83, 0.95)";
    ctx.fillRect(10, 0, 16, 14);
    ctx.strokeStyle = "rgba(255, 77, 95, 0.9)";
    ctx.strokeRect(10, 0, 16, 14);
    ctx.restore();
  }

  function drawGate(x, y, width, height, pulse) {
    const glow = 0.45 + Math.sin(pulse * 9) * 0.18;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = `rgba(255, 77, 95, ${glow})`;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "rgba(246, 196, 83, 0.82)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 4, y - 4, width + 8, height + 8);
    ctx.restore();
  }

  function drawSparks() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    state.sparks.forEach((spark) => {
      const alpha = Math.max(0, spark.life / spark.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = spark.color;
      ctx.fillRect(spark.x - spark.size / 2, spark.y - spark.size / 2, spark.size, spark.size);
    });
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function getPlayerBox() {
    return {
      x: state.player.x + 5,
      y: state.player.y + 3,
      w: state.player.w - 10,
      h: state.player.h - 5,
    };
  }

  function finish(crashed) {
    state.running = false;
    cancelAnimationFrame(state.raf);
    arenaStage.classList.remove("is-running");
    roundStatus.classList.remove("is-live");
    roundStatus.textContent = "Bitti";
    stageMessage.textContent = crashed ? "\u00c7arp\u0131\u015ft\u0131n" : "Tur bitti";
    const finalScore = calculateRunnerScore();
    storage.runnerBestScore = Math.max(storage.runnerBestScore, finalScore);
    localStorage.setItem("savasGame.runner.bestScore", String(storage.runnerBestScore));
    localStorage.setItem("savasGame.runner.lastScore", String(finalScore));
    sound.play("end");
    drawRunner();
    syncHud();
  }

  function syncHud() {
    scoreReadout.textContent = padScore(calculateRunnerScore());
    timeReadout.textContent = String(Math.ceil(state.timeLeft));
    accuracyReadout.textContent = `${state.health}/3`;
  }

  function calculateRunnerScore() {
    return Math.floor(state.score + state.distance * 0.08);
  }

  function stop() {
    state.running = false;
    cancelAnimationFrame(state.raf);
    arenaStage.classList.remove("is-running");
  }

  function reset() {
    stop();
    metricLabel.textContent = "Can";
    scoreLabel.textContent = "Skor";
    timeLabel.textContent = "S\u00fcre";
    state.score = 0;
    state.distance = 0;
    state.speed = 260;
    state.health = 3;
    state.timeLeft = 45;
    state.nextObstacle = 0;
    state.invincible = 0;
    state.obstacles.length = 0;
    state.sparks.length = 0;
    state.player.vy = 0;
    state.player.step = 0;
    state.player.onGround = true;
    syncRunnerBounds();
    roundStatus.classList.remove("is-live");
    roundStatus.textContent = "Haz\u0131r";
    stageMessage.textContent = "Haz\u0131r";
    syncHud();
  }

  function isRunning() {
    return state.running;
  }

  return {
    drawIdle,
    isRunning,
    reset,
    resize,
    start,
    stop,
  };
}

function createXoxGame(canvas) {
  const ctx = canvas.getContext("2d");
  const winLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    running: false,
    locked: false,
    board: Array(9).fill(null),
    winningLine: null,
    difficulty: "medium",
    moves: 0,
    xWins: storage.xoxWins,
    oWins: storage.xoxBotWins,
    botTimer: 0,
    boardRect: { x: 0, y: 0, size: 0, cell: 0 },
  };

  resize();

  canvas.addEventListener("pointerdown", (event) => {
    if (!state.running || state.locked) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cell = getCellAt(x, y);

    if (cell < 0 || state.board[cell]) return;

    placeMark(cell, "X");
    sound.play("hit");

    if (finishIfRoundEnded("X")) return;

    state.locked = true;
    roundStatus.textContent = "Bot";
    stageMessage.textContent = "Bot d\u00fc\u015f\u00fcn\u00fcyor";
    state.botTimer = window.setTimeout(playBotTurn, 320);
  });

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(320, rect.width);
    state.height = Math.max(320, rect.height);
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    syncBoardRect();
  }

  function syncBoardRect() {
    const size = Math.max(220, Math.min(430, state.width - 54, state.height - 104));
    let y = Math.max(72, (state.height - size) / 2 + 26);
    if (y + size > state.height - 18) {
      y = state.height - size - 18;
    }

    state.boardRect = {
      x: (state.width - size) / 2,
      y,
      size,
      cell: size / 3,
    };
  }

  function start(difficulty = "medium") {
    resize();
    state.difficulty = ["easy", "medium", "hard"].includes(difficulty) ? difficulty : "medium";
    resetRound();
    state.running = true;
    state.locked = false;
    arenaStage.classList.add("is-running");
    roundStatus.classList.add("is-live");
    roundStatus.textContent = "S\u0131ra X";
    stageMessage.textContent = `X koymak i\u00e7in kare se\u00e7: ${getDifficultyLabel(state.difficulty)}`;
    syncHud();
    drawBoard();
  }

  function playBotTurn() {
    if (!state.running) return;

    const cell = chooseBotMove();
    if (cell >= 0) {
      placeMark(cell, "O");
      sound.play("click");
    }

    if (finishIfRoundEnded("O")) return;

    state.locked = false;
    roundStatus.textContent = "S\u0131ra X";
    stageMessage.textContent = "Hamleni se\u00e7";
    syncHud();
    drawBoard();
  }

  function chooseBotMove() {
    if (state.difficulty === "easy") {
      return chooseEasyBotMove();
    }

    if (state.difficulty === "hard") {
      return chooseHardBotMove();
    }

    return chooseMediumBotMove();
  }

  function chooseEasyBotMove() {
    if (Math.random() < 0.28) {
      return findForcedMove("O") ?? pickRandomEmpty();
    }

    return pickRandomEmpty();
  }

  function chooseMediumBotMove() {
    return (
      findForcedMove("O") ??
      findForcedMove("X") ??
      pickFirstEmpty([4]) ??
      pickFirstEmpty(shuffle([0, 2, 6, 8])) ??
      pickFirstEmpty(shuffle([1, 3, 5, 7])) ??
      -1
    );
  }

  function chooseHardBotMove() {
    const emptyCells = getEmptyCells(state.board);
    let bestScore = -Infinity;
    let bestMoves = [];

    emptyCells.forEach((cell) => {
      const testBoard = [...state.board];
      testBoard[cell] = "O";
      const score = scoreBoard(testBoard, false, 0);

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [cell];
      } else if (score === bestScore) {
        bestMoves.push(cell);
      }
    });

    return bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? -1;
  }

  function scoreBoard(board, isBotTurn, depth) {
    if (findWinningLine(board, "O")) return 10 - depth;
    if (findWinningLine(board, "X")) return depth - 10;
    const emptyCells = getEmptyCells(board);
    if (!emptyCells.length) return 0;

    if (isBotTurn) {
      let bestScore = -Infinity;
      emptyCells.forEach((cell) => {
        const testBoard = [...board];
        testBoard[cell] = "O";
        bestScore = Math.max(bestScore, scoreBoard(testBoard, false, depth + 1));
      });
      return bestScore;
    }

    let bestScore = Infinity;
    emptyCells.forEach((cell) => {
      const testBoard = [...board];
      testBoard[cell] = "X";
      bestScore = Math.min(bestScore, scoreBoard(testBoard, true, depth + 1));
    });
    return bestScore;
  }

  function findForcedMove(mark) {
    const emptyCells = getEmptyCells(state.board);

    for (const cell of emptyCells) {
      const testBoard = [...state.board];
      testBoard[cell] = mark;
      if (findWinningLine(testBoard, mark)) {
        return cell;
      }
    }

    return null;
  }

  function getEmptyCells(board) {
    return board
      .map((value, index) => (value ? null : index))
      .filter((value) => value !== null);
  }

  function pickRandomEmpty() {
    const emptyCells = getEmptyCells(state.board);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)] ?? -1;
  }

  function pickFirstEmpty(cells) {
    return cells.find((cell) => !state.board[cell]) ?? null;
  }

  function shuffle(items) {
    return [...items].sort(() => Math.random() - 0.5);
  }

  function placeMark(cell, mark) {
    state.board[cell] = mark;
    state.moves += 1;
    syncHud();
    drawBoard();
  }

  function finishIfRoundEnded(mark) {
    const winningLine = findWinningLine(state.board, mark);
    if (winningLine) {
      state.winningLine = winningLine;
      finish(mark);
      return true;
    }

    if (state.board.every(Boolean)) {
      finish("draw");
      return true;
    }

    return false;
  }

  function finish(result) {
    state.running = false;
    state.locked = false;
    window.clearTimeout(state.botTimer);
    arenaStage.classList.remove("is-running");
    roundStatus.classList.remove("is-live");

    if (result === "X") {
      state.xWins += 1;
      storage.xoxWins = state.xWins;
      localStorage.setItem("savasGame.xox.xWins", String(state.xWins));
      roundStatus.textContent = "Kazand\u0131n";
      stageMessage.textContent = "X kazand\u0131";
      sound.play("end");
    } else if (result === "O") {
      state.oWins += 1;
      storage.xoxBotWins = state.oWins;
      localStorage.setItem("savasGame.xox.oWins", String(state.oWins));
      roundStatus.textContent = "Bot kazand\u0131";
      stageMessage.textContent = "O kazand\u0131";
      sound.play("miss");
    } else {
      roundStatus.textContent = "Berabere";
      stageMessage.textContent = "Tahta doldu";
      sound.play("end");
    }

    syncHud();
    drawBoard();
  }

  function findWinningLine(board, mark) {
    return winLines.find((line) => line.every((cell) => board[cell] === mark)) || null;
  }

  function getCellAt(x, y) {
    const { x: bx, y: by, size, cell } = state.boardRect;
    if (x < bx || x > bx + size || y < by || y > by + size) return -1;

    const column = Math.min(2, Math.floor((x - bx) / cell));
    const row = Math.min(2, Math.floor((y - by) / cell));
    return row * 3 + column;
  }

  function drawIdle() {
    resize();
    resetRound();
    drawBoard();
  }

  function drawBoard() {
    ctx.clearRect(0, 0, state.width, state.height);
    drawXoxBase();

    const { x, y, size, cell } = state.boardRect;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(94, 234, 212, 0.72)";
    ctx.lineWidth = 5;
    ctx.shadowColor = "rgba(94, 234, 212, 0.28)";
    ctx.shadowBlur = 16;

    for (let index = 1; index < 3; index += 1) {
      ctx.beginPath();
      ctx.moveTo(x + cell * index, y);
      ctx.lineTo(x + cell * index, y + size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y + cell * index);
      ctx.lineTo(x + size, y + cell * index);
      ctx.stroke();
    }

    state.board.forEach((mark, index) => {
      if (!mark) return;
      const column = index % 3;
      const row = Math.floor(index / 3);
      const cx = x + column * cell + cell / 2;
      const cy = y + row * cell + cell / 2;

      if (mark === "X") {
        drawX(cx, cy, cell * 0.54);
      } else {
        drawO(cx, cy, cell * 0.31);
      }
    });

    if (state.winningLine) {
      drawWinLine(state.winningLine);
    }

    ctx.restore();
  }

  function drawXoxBase() {
    const gradient = ctx.createLinearGradient(0, 0, state.width, state.height);
    gradient.addColorStop(0, "rgba(94, 234, 212, 0.09)");
    gradient.addColorStop(0.5, "rgba(246, 196, 83, 0.045)");
    gradient.addColorStop(1, "rgba(255, 77, 95, 0.09)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.strokeStyle = "rgba(244, 247, 235, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < state.width; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.height);
      ctx.stroke();
    }
    for (let y = 0; y < state.height; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y);
      ctx.stroke();
    }
  }

  function drawX(cx, cy, radius) {
    ctx.strokeStyle = "rgba(255, 77, 95, 0.95)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(255, 77, 95, 0.35)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(cx - radius / 2, cy - radius / 2);
    ctx.lineTo(cx + radius / 2, cy + radius / 2);
    ctx.moveTo(cx + radius / 2, cy - radius / 2);
    ctx.lineTo(cx - radius / 2, cy + radius / 2);
    ctx.stroke();
  }

  function drawO(cx, cy, radius) {
    ctx.strokeStyle = "rgba(246, 196, 83, 0.95)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(246, 196, 83, 0.34)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawWinLine(line) {
    const { x, y, cell } = state.boardRect;
    const first = line[0];
    const last = line[2];
    const start = {
      x: x + (first % 3) * cell + cell / 2,
      y: y + Math.floor(first / 3) * cell + cell / 2,
    };
    const end = {
      x: x + (last % 3) * cell + cell / 2,
      y: y + Math.floor(last / 3) * cell + cell / 2,
    };

    ctx.strokeStyle = "rgba(126, 217, 87, 0.95)";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(126, 217, 87, 0.36)";
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  function syncHud() {
    scoreLabel.textContent = "X";
    timeLabel.textContent = "Tur";
    metricLabel.textContent = "O";
    scoreReadout.textContent = String(state.xWins);
    timeReadout.textContent = String(state.moves);
    accuracyReadout.textContent = String(state.oWins);
  }

  function resetRound() {
    state.board = Array(9).fill(null);
    state.winningLine = null;
    state.moves = 0;
    state.locked = false;
    window.clearTimeout(state.botTimer);
    syncHud();
  }

  function stop() {
    state.running = false;
    state.locked = false;
    window.clearTimeout(state.botTimer);
    arenaStage.classList.remove("is-running");
  }

  function reset() {
    stop();
    resetRound();
    roundStatus.classList.remove("is-live");
    roundStatus.textContent = "Haz\u0131r";
    stageMessage.textContent = "Haz\u0131r";
  }

  function isRunning() {
    return state.running;
  }

  return {
    drawIdle,
    isRunning,
    reset,
    resize,
    start,
    stop,
  };
}

function createMemoryGame(canvas) {
  const ctx = canvas.getContext("2d");
  const profiles = {
    easy: { size: 3, time: 75 },
    medium: { size: 5, time: 210 },
    hard: { size: 7, time: 420 },
  };
  const colors = ["#5eead4", "#f6c453", "#ff4d5f", "#7ed957", "#4cc9f0", "#f472b6", "#a78bfa", "#fb7185"];
  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    running: false,
    locked: false,
    difficulty: "easy",
    gridSize: 3,
    totalCards: 9,
    cards: [],
    flipped: [],
    matched: 0,
    moves: 0,
    timeLeft: 90,
    lastFrame: 0,
    raf: 0,
    gridRect: { x: 0, y: 0, width: 0, height: 0, cellW: 0, cellH: 0 },
  };

  resize();

  canvas.addEventListener("pointerdown", (event) => {
    if (!state.running || state.locked) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const index = getCardAt(x, y);

    if (index < 0) return;

    const card = state.cards[index];
    if (!card || card.open || card.matched) return;

    card.open = true;
    if (card.bonus) {
      state.flipped.forEach((flippedIndex) => {
        state.cards[flippedIndex].open = false;
      });
      card.matched = true;
      state.matched += 1;
      state.moves += 1;
      state.flipped = [];
      stageMessage.textContent = "Bonus kart";
      sound.play("hit");
      syncHud();
      drawMemory();
      if (state.matched === state.totalCards) {
        finish(true);
      }
      return;
    }

    state.flipped.push(index);
    sound.play("click");
    drawMemory();

    if (state.flipped.length === 2) {
      state.moves += 1;
      state.locked = true;
      checkPair();
    }

    syncHud();
  });

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(320, rect.width);
    state.height = Math.max(320, rect.height);
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    syncGridRect();
  }

  function syncGridRect() {
    const maxWidth = Math.min(660, state.width - 44);
    const maxHeight = Math.min(520, state.height - 96);
    const gridWidth = Math.max(260, Math.min(maxWidth, maxHeight));
    const gridHeight = gridWidth;
    let y = Math.max(72, (state.height - gridHeight) / 2 + 28);
    if (y + gridHeight > state.height - 18) {
      y = state.height - gridHeight - 18;
    }

    state.gridRect = {
      x: (state.width - gridWidth) / 2,
      y,
      width: gridWidth,
      height: gridHeight,
      cellW: gridWidth / state.gridSize,
      cellH: gridHeight / state.gridSize,
    };
  }

  function start(difficulty = state.difficulty) {
    setDifficulty(difficulty);
    resize();
    createDeck();
    state.running = true;
    state.locked = false;
    state.matched = 0;
    state.moves = 0;
    state.timeLeft = profiles[state.difficulty].time;
    state.lastFrame = performance.now();
    arenaStage.classList.add("is-running");
    roundStatus.classList.add("is-live");
    roundStatus.textContent = "Canl\u0131";
    stageMessage.textContent = `${state.gridSize}x${state.gridSize}: ayn\u0131 kartlar\u0131 bul`;
    syncHud();
    drawMemory();
    cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(loop);
  }

  function loop(now) {
    const delta = Math.min(0.05, (now - state.lastFrame) / 1000);
    state.lastFrame = now;
    state.timeLeft = Math.max(0, state.timeLeft - delta);
    syncHud();
    drawMemory();

    if (state.timeLeft <= 0) {
      finish(false);
      return;
    }

    state.raf = requestAnimationFrame(loop);
  }

  function createDeck() {
    const pairCount = Math.floor(state.totalCards / 2);
    const cards = [];

    for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
      const symbol = String(pairIndex + 1);
      cards.push(createCard(symbol, pairIndex, false));
      cards.push(createCard(symbol, pairIndex, false));
    }

    if (state.totalCards % 2 === 1) {
      cards.push(createCard("*", -1, true));
    }

    state.cards = shuffleMemory(cards);
    state.flipped = [];
  }

  function createCard(symbol, pairIndex, bonus) {
    return {
      symbol,
      pairIndex,
      bonus,
      color: bonus ? "#f4f7eb" : colors[pairIndex % colors.length],
      open: false,
      matched: false,
    };
  }

  function checkPair() {
    const [firstIndex, secondIndex] = state.flipped;
    const first = state.cards[firstIndex];
    const second = state.cards[secondIndex];

    if (first.pairIndex === second.pairIndex) {
      first.matched = true;
      second.matched = true;
      state.matched += 2;
      state.flipped = [];
      state.locked = false;
      stageMessage.textContent = "E\u015fle\u015fti";
      sound.play("hit");
      syncHud();
      drawMemory();

      if (state.matched === state.totalCards) {
        finish(true);
      }
      return;
    }

    stageMessage.textContent = "Tekrar dene";
    sound.play("miss");
    window.setTimeout(() => {
      first.open = false;
      second.open = false;
      state.flipped = [];
      state.locked = false;
      drawMemory();
    }, 720);
  }

  function drawIdle() {
    resize();
    createDeck();
    state.cards.forEach((card) => {
      card.open = false;
      card.matched = false;
    });
    state.matched = 0;
    state.moves = 0;
    state.timeLeft = profiles[state.difficulty].time;
    syncHud();
    drawMemory();
  }

  function drawMemory() {
    ctx.clearRect(0, 0, state.width, state.height);
    drawMemoryBase();

    state.cards.forEach((card, index) => {
      drawCard(card, index);
    });
  }

  function drawMemoryBase() {
    const gradient = ctx.createLinearGradient(0, 0, state.width, state.height);
    gradient.addColorStop(0, "rgba(76, 201, 240, 0.08)");
    gradient.addColorStop(0.48, "rgba(246, 196, 83, 0.045)");
    gradient.addColorStop(1, "rgba(126, 217, 87, 0.08)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.strokeStyle = "rgba(244, 247, 235, 0.07)";
    ctx.lineWidth = 1;
    for (let x = 0; x < state.width; x += 44) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.height);
      ctx.stroke();
    }
    for (let y = 0; y < state.height; y += 44) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y);
      ctx.stroke();
    }
  }

  function drawCard(card, index) {
    const { x, y, cellW, cellH } = state.gridRect;
    const column = index % state.gridSize;
    const row = Math.floor(index / state.gridSize);
    const gap = Math.max(4, Math.min(16, cellW * 0.08));
    const cardX = x + column * cellW + gap;
    const cardY = y + row * cellH + gap;
    const cardW = cellW - gap * 2;
    const cardH = cellH - gap * 2;
    const isOpen = card.open || card.matched;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = isOpen ? "rgba(244, 247, 235, 0.1)" : "rgba(9, 11, 8, 0.72)";
    ctx.strokeStyle = isOpen ? card.color : "rgba(94, 234, 212, 0.42)";
    ctx.lineWidth = card.matched ? 4 : 2;
    roundedRect(cardX, cardY, cardW, cardH, 8);
    ctx.fill();
    ctx.stroke();

    if (isOpen) {
      ctx.fillStyle = card.color;
      const symbolScale = card.symbol.length > 1 ? 0.32 : 0.42;
      ctx.font = `900 ${Math.floor(Math.min(cardW, cardH) * symbolScale)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = card.color;
      ctx.shadowBlur = 18;
      ctx.fillText(card.symbol, cardX + cardW / 2, cardY + cardH / 2 + 1);
    } else {
      ctx.strokeStyle = "rgba(246, 196, 83, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + cardW * 0.28, cardY + cardH * 0.5);
      ctx.lineTo(cardX + cardW * 0.72, cardY + cardH * 0.5);
      ctx.moveTo(cardX + cardW * 0.5, cardY + cardH * 0.28);
      ctx.lineTo(cardX + cardW * 0.5, cardY + cardH * 0.72);
      ctx.stroke();
    }

    ctx.restore();
  }

  function roundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function getCardAt(x, y) {
    const { x: gx, y: gy, width, height, cellW, cellH } = state.gridRect;
    if (x < gx || x > gx + width || y < gy || y > gy + height) return -1;

    const column = Math.min(state.gridSize - 1, Math.floor((x - gx) / cellW));
    const row = Math.min(state.gridSize - 1, Math.floor((y - gy) / cellH));
    return row * state.gridSize + column;
  }

  function finish(won) {
    state.running = false;
    state.locked = false;
    cancelAnimationFrame(state.raf);
    arenaStage.classList.remove("is-running");
    roundStatus.classList.remove("is-live");

    if (won) {
      if (!storage.memoryBestMoves || state.moves < storage.memoryBestMoves) {
        storage.memoryBestMoves = state.moves;
        localStorage.setItem("savasGame.memory.bestMoves", String(state.moves));
      }
      roundStatus.textContent = "Bitti";
      stageMessage.textContent = "T\u00fcm kartlar bulundu";
      sound.play("end");
    } else {
      roundStatus.textContent = "S\u00fcre bitti";
      stageMessage.textContent = "Kartlar tamamlanmad\u0131";
      sound.play("miss");
    }

    syncHud();
    drawMemory();
  }

  function syncHud() {
    scoreLabel.textContent = "Hamle";
    timeLabel.textContent = "S\u00fcre";
    metricLabel.textContent = "E\u015fle\u015fme";
    scoreReadout.textContent = String(state.moves);
    timeReadout.textContent = String(Math.ceil(state.timeLeft));
    accuracyReadout.textContent = `${state.matched}/${state.totalCards}`;
  }

  function setDifficulty(difficulty) {
    state.difficulty = profiles[difficulty] ? difficulty : "easy";
    state.gridSize = profiles[state.difficulty].size;
    state.totalCards = state.gridSize * state.gridSize;
    state.timeLeft = profiles[state.difficulty].time;
    syncGridRect();
  }

  function stop() {
    state.running = false;
    state.locked = false;
    cancelAnimationFrame(state.raf);
    arenaStage.classList.remove("is-running");
  }

  function reset() {
    stop();
    state.flipped = [];
    state.matched = 0;
    state.moves = 0;
    state.timeLeft = profiles[state.difficulty].time;
    state.cards.forEach((card) => {
      card.open = false;
      card.matched = false;
    });
    roundStatus.classList.remove("is-live");
    roundStatus.textContent = "Haz\u0131r";
    stageMessage.textContent = "Haz\u0131r";
    syncHud();
  }

  function isRunning() {
    return state.running;
  }

  return {
    drawIdle,
    isRunning,
    reset,
    resize,
    setDifficulty,
    start,
    stop,
  };
}

function shuffleMemory(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createSnakeGame(canvas) {
  const ctx = canvas.getContext("2d");
  const profiles = {
    easy: { size: 5, speed: 260 },
    medium: { size: 10, speed: 165 },
    hard: { size: 13, speed: 110 },
  };
  const directions = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
  };
  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    running: false,
    difficulty: "easy",
    gridSize: 5,
    speed: 540,
    score: 0,
    snake: [],
    previousSnake: [],
    food: { x: 0, y: 0 },
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    lastFrame: 0,
    accumulator: 0,
    raf: 0,
    swipeStart: null,
    gridRect: { x: 0, y: 0, size: 0, cell: 0 },
  };

  resize();

  window.addEventListener("keydown", (event) => {
    if (!state.running) return;

    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const direction = directions[key];
    if (!direction) return;

    event.preventDefault();
    setNextDirection(direction);
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (!state.running) return;

    state.swipeStart = {
      x: event.clientX,
      y: event.clientY,
    };
  });

  canvas.addEventListener("pointerup", (event) => {
    if (!state.running || !state.swipeStart) return;

    const dx = event.clientX - state.swipeStart.x;
    const dy = event.clientY - state.swipeStart.y;
    state.swipeStart = null;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      setNextDirection({ x: dx > 0 ? 1 : -1, y: 0 });
    } else {
      setNextDirection({ x: 0, y: dy > 0 ? 1 : -1 });
    }
  });

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(320, rect.width);
    state.height = Math.max(320, rect.height);
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    syncGridRect();
  }

  function syncGridRect() {
    const maxSize = Math.min(560, state.width - 48, state.height - 100);
    const size = Math.max(240, maxSize);
    let y = Math.max(72, (state.height - size) / 2 + 28);
    if (y + size > state.height - 18) {
      y = state.height - size - 18;
    }

    state.gridRect = {
      x: (state.width - size) / 2,
      y,
      size,
      cell: size / state.gridSize,
    };
  }

  function start(difficulty = state.difficulty) {
    setDifficulty(difficulty);
    resize();
    setupRound();
    state.running = true;
    state.lastFrame = performance.now();
    state.accumulator = state.speed;
    arenaStage.classList.add("is-running");
    roundStatus.classList.add("is-live");
    roundStatus.textContent = "Canl\u0131";
    stageMessage.textContent = `${state.gridSize}x${state.gridSize}: yemi ye`;
    syncHud();
    drawSnakeGame();
    cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(loop);
  }

  function loop(now) {
    const elapsed = Math.min(120, now - state.lastFrame);
    state.lastFrame = now;
    state.accumulator += elapsed;

    while (state.accumulator >= state.speed && state.running) {
      state.accumulator -= state.speed;
      moveSnake();
    }

    drawSnakeGame();

    if (state.running) {
      state.raf = requestAnimationFrame(loop);
    }
  }

  function setupRound() {
    const center = Math.floor(state.gridSize / 2);
    const startX = Math.max(2, center);
    state.score = 0;
    state.direction = { x: 1, y: 0 };
    state.nextDirection = { x: 1, y: 0 };
    state.snake = [
      { x: startX, y: center },
      { x: startX - 1, y: center },
      { x: startX - 2, y: center },
    ].filter((part) => part.x >= 0);
    state.previousSnake = cloneSnake(state.snake);
    spawnFood();
  }

  function moveSnake() {
    state.previousSnake = cloneSnake(state.snake);
    state.direction = state.nextDirection;
    const head = state.snake[0];
    const nextHead = {
      x: head.x + state.direction.x,
      y: head.y + state.direction.y,
    };
    const eating = nextHead.x === state.food.x && nextHead.y === state.food.y;
    const bodyToCheck = eating ? state.snake : state.snake.slice(0, -1);

    if (
      nextHead.x < 0 ||
      nextHead.y < 0 ||
      nextHead.x >= state.gridSize ||
      nextHead.y >= state.gridSize ||
      bodyToCheck.some((part) => part.x === nextHead.x && part.y === nextHead.y)
    ) {
      finish(false);
      return;
    }

    state.snake.unshift(nextHead);

    if (eating) {
      state.score += 1;
      sound.play("hit");
      stageMessage.textContent = `Yem: ${state.score}`;
      if (state.snake.length === state.gridSize * state.gridSize) {
        finish(true);
        return;
      }
      spawnFood();
    } else {
      state.snake.pop();
    }

    syncHud();
  }

  function spawnFood() {
    const emptyCells = [];
    for (let y = 0; y < state.gridSize; y += 1) {
      for (let x = 0; x < state.gridSize; x += 1) {
        if (!state.snake.some((part) => part.x === x && part.y === y)) {
          emptyCells.push({ x, y });
        }
      }
    }

    state.food = emptyCells[Math.floor(Math.random() * emptyCells.length)] || { x: 0, y: 0 };
  }

  function setNextDirection(direction) {
    if (direction.x + state.direction.x === 0 && direction.y + state.direction.y === 0) return;

    state.nextDirection = direction;
  }

  function drawIdle() {
    resize();
    setupRound();
    syncHud();
    drawSnakeGame();
  }

  function drawSnakeGame() {
    ctx.clearRect(0, 0, state.width, state.height);
    drawSnakeBase();
    drawFood();
    drawSnake();
  }

  function drawSnakeBase() {
    const gradient = ctx.createLinearGradient(0, 0, state.width, state.height);
    gradient.addColorStop(0, "rgba(126, 217, 87, 0.08)");
    gradient.addColorStop(0.48, "rgba(94, 234, 212, 0.045)");
    gradient.addColorStop(1, "rgba(246, 196, 83, 0.08)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);

    const { x, y, size, cell } = state.gridRect;
    ctx.save();
    ctx.strokeStyle = "rgba(94, 234, 212, 0.22)";
    ctx.lineWidth = 1;
    for (let index = 0; index <= state.gridSize; index += 1) {
      ctx.beginPath();
      ctx.moveTo(x + index * cell, y);
      ctx.lineTo(x + index * cell, y + size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + index * cell);
      ctx.lineTo(x + size, y + index * cell);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(246, 196, 83, 0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, size, size);
    ctx.restore();
  }

  function drawSnake() {
    const { x, y, cell } = state.gridRect;
    const progress = state.running ? easeMove(Math.min(1, state.accumulator / state.speed)) : 1;
    const points = state.snake.map((part, index) => {
      const previous = state.previousSnake[index] || state.previousSnake[state.previousSnake.length - 1] || part;
      return {
        x: x + (lerp(previous.x, part.x, progress) + 0.5) * cell,
        y: y + (lerp(previous.y, part.y, progress) + 0.5) * cell,
      };
    });

    if (!points.length) return;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(94, 234, 212, 0.36)";
    ctx.shadowBlur = 18;

    if (points.length > 1) {
      ctx.strokeStyle = "rgba(94, 234, 212, 0.9)";
      ctx.lineWidth = Math.max(12, cell * 0.58);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      ctx.strokeStyle = "rgba(126, 217, 87, 0.58)";
      ctx.lineWidth = Math.max(5, cell * 0.24);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }

    const head = points[0];
    const headRadius = Math.max(9, cell * 0.37);
    ctx.fillStyle = "rgba(246, 196, 83, 0.98)";
    ctx.shadowColor = "rgba(246, 196, 83, 0.42)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(head.x, head.y, headRadius, 0, Math.PI * 2);
    ctx.fill();

    const eyeOffsetX = state.direction.y === 0 ? state.direction.x * headRadius * 0.32 : headRadius * 0.24;
    const eyeOffsetY = state.direction.x === 0 ? state.direction.y * headRadius * 0.32 : headRadius * 0.24;
    ctx.fillStyle = "rgba(9, 11, 8, 0.85)";
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(head.x + eyeOffsetX, head.y + eyeOffsetY, Math.max(2, headRadius * 0.12), 0, Math.PI * 2);
    ctx.arc(head.x + eyeOffsetX - state.direction.y * headRadius * 0.42, head.y + eyeOffsetY + state.direction.x * headRadius * 0.42, Math.max(2, headRadius * 0.12), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawFood() {
    const { x, y, cell } = state.gridRect;
    const cx = x + state.food.x * cell + cell / 2;
    const cy = y + state.food.y * cell + cell / 2;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(255, 77, 95, 0.95)";
    ctx.shadowColor = "rgba(255, 77, 95, 0.5)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(5, cell * 0.22), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function finish(won) {
    state.running = false;
    cancelAnimationFrame(state.raf);
    arenaStage.classList.remove("is-running");
    roundStatus.classList.remove("is-live");

    storage.snakeBestScore = Math.max(storage.snakeBestScore, state.score);
    localStorage.setItem("savasGame.snake.bestScore", String(storage.snakeBestScore));
    roundStatus.textContent = won ? "Kazand\u0131n" : "Bitti";
    stageMessage.textContent = won ? "Alan doldu" : "Y\u0131lan \u00e7arpt\u0131";
    sound.play(won ? "end" : "miss");
    syncHud();
    drawSnakeGame();
  }

  function syncHud() {
    scoreLabel.textContent = "Yem";
    timeLabel.textContent = "Alan";
    metricLabel.textContent = "En iyi";
    scoreReadout.textContent = String(state.score);
    timeReadout.textContent = `${state.gridSize}x${state.gridSize}`;
    accuracyReadout.textContent = String(storage.snakeBestScore);
  }

  function setDifficulty(difficulty) {
    state.difficulty = profiles[difficulty] ? difficulty : "easy";
    state.gridSize = profiles[state.difficulty].size;
    state.speed = profiles[state.difficulty].speed;
    syncGridRect();
  }

  function stop() {
    state.running = false;
    cancelAnimationFrame(state.raf);
    arenaStage.classList.remove("is-running");
  }

  function reset() {
    stop();
    setupRound();
    roundStatus.classList.remove("is-live");
    roundStatus.textContent = "Haz\u0131r";
    stageMessage.textContent = "Haz\u0131r";
    syncHud();
  }

  function isRunning() {
    return state.running;
  }

  return {
    drawIdle,
    isRunning,
    reset,
    resize,
    setDifficulty,
    start,
    stop,
  };
}

function cloneSnake(snake) {
  return snake.map((part) => ({ x: part.x, y: part.y }));
}

function easeMove(progress) {
  return progress;
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function roundedCanvasRect(context, ctxX, ctxY, width, height, radius) {
  context.beginPath();
  context.moveTo(ctxX + radius, ctxY);
  context.lineTo(ctxX + width - radius, ctxY);
  context.quadraticCurveTo(ctxX + width, ctxY, ctxX + width, ctxY + radius);
  context.lineTo(ctxX + width, ctxY + height - radius);
  context.quadraticCurveTo(ctxX + width, ctxY + height, ctxX + width - radius, ctxY + height);
  context.lineTo(ctxX + radius, ctxY + height);
  context.quadraticCurveTo(ctxX, ctxY + height, ctxX, ctxY + height - radius);
  context.lineTo(ctxX, ctxY + radius);
  context.quadraticCurveTo(ctxX, ctxY, ctxX + radius, ctxY);
  context.closePath();
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function padScore(value) {
  return String(Math.max(0, Math.floor(value))).padStart(3, "0");
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}
