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

const storage = {
  aimBestScore: Number(localStorage.getItem("savasGame.aim.bestScore") || localStorage.getItem("savasGame.bestScore") || 0),
  aimBestCombo: Number(localStorage.getItem("savasGame.aim.bestCombo") || localStorage.getItem("savasGame.bestCombo") || 0),
  runnerBestScore: Number(localStorage.getItem("savasGame.runner.bestScore") || 0),
};

const sound = createSoundEngine();
const backdrop = createBackdrop(backdropCanvas);
const aimArena = createAimArena(arenaCanvas);
const runnerGame = createRunnerGame(arenaCanvas);

const games = {
  reflex: {
    title: "Aim Antreman\u0131",
    eyebrow: "hedef modu",
    metricLabel: "\u0130sabet",
    engine: aimArena,
  },
  runner: {
    title: "Neon Ko\u015fu",
    eyebrow: "ko\u015fu modu",
    metricLabel: "Can",
    engine: runnerGame,
  },
};

let activeGame = games.reflex;
let lastFocusedElement = null;

backdrop.start();

startButton.addEventListener("click", () => {
  sound.start();
  sound.play("start");
  activeGame.engine.start();
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
  activeGame = games[gameId] || games.reflex;
  lastFocusedElement = document.activeElement;
  modeEyebrow.textContent = activeGame.eyebrow;
  arenaTitle.textContent = activeGame.title;
  arenaStage.setAttribute("aria-label", activeGame.title);
  metricLabel.textContent = activeGame.metricLabel;
  scoreLabel.textContent = "Skor";
  timeLabel.textContent = "S\u00fcre";

  document.body.classList.add("has-modal");
  gamePlayer.classList.add("is-open");
  gamePlayer.setAttribute("aria-hidden", "false");
  activeGame.engine.reset();

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
  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    running: false,
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

  function start() {
    resize();
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
    stageMessage.textContent = "Hedef kilidi";
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
    const margin = Math.min(72, Math.max(42, state.width * 0.08));
    const radius = Math.max(24, Math.min(46, 42 - Math.min(18, state.score / 1400)));
    state.target = {
      x: randomBetween(margin, state.width - margin),
      y: randomBetween(margin, state.height - margin),
      r: radius,
      life: Math.max(0.72, 1.45 - state.score / 9000),
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
    const lifeRatio = Math.max(0, target.life / 1.45);

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

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function padScore(value) {
  return String(Math.max(0, Math.floor(value))).padStart(3, "0");
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}
