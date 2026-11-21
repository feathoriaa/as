/* ==========================================================
   FEATHORIA — FLAPPY FEATHER
   Calm Ambient Pad & Wind • Arcade Moving Pillars • Wardrobe
   Shooting Stars • Mobile Haptics • Flight Milestones
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ==========================================================
  // 1. DOM ELEMENTS
  // ==========================================================

  const $ = (id) => document.getElementById(id);

  const canvas = $("gameCanvas");
  const particlesCanvas = $("particlesCanvas");

  if (!canvas || !particlesCanvas) {
    console.error("Feathoria Game: Canvas elements missing.");
    return;
  }

  const ctx = canvas.getContext("2d");
  const pctx = particlesCanvas.getContext("2d");

  const modeSelector = $("modeSelector");
  const modeAButton = $("modeA");
  const modeBButton = $("modeB");

  const wardrobeBtn = $("wardrobeBtn");
  const wardrobeModal = $("wardrobeModal");
  const wardrobeList = $("wardrobeList");
  const wardrobeBalanceCount = $("wardrobeBalanceCount");
  const closeWardrobeBtn = $("closeWardrobeBtn");

  const milestonesPreview = $("milestonesPreview");

  const instructions = $("instructions");
  const modeHintText = $("modeHintText");
  const scoreDisplay = $("score");
  const highScoreDisplay = $("highScore");
  const feathersDisplay = $("feathersCount");
  const scorePill = scoreDisplay?.closest(".score-pill");
  const feathersPill = feathersDisplay?.closest(".score-pill");

  const gameOverPopup = $("gameOver");
  const finalScoreDisplay = $("finalScore");
  const statBestStreak = $("statBestStreak");
  const statModeBest = $("statModeBest");
  const statPlumeBank = $("statPlumeBank");
  const resultMessageDisplay = $("resultMessage");
  const unlockedMilestoneBanner = $("unlockedMilestoneBanner");
  const newBestBadge = $("newBestBadge");
  const restartBtn = $("restartBtn");
  const chooseModeBtn = $("chooseModeBtn");

  const pauseBtn = $("pauseBtn");
  const pauseText = $("pauseText");
  const pauseIcon = $("pauseIcon");

  const soundBtn = $("soundBtn");
  const soundIcon = $("soundIcon");
  const soundText = $("soundText");

  // ==========================================================
  // 2. CONFIGURATION, SKINS & MILESTONES
  // ==========================================================

  const CONFIG = {
    calm: {
      gravity: 0.2,
      flapPower: -5.1,
      obstacleSpeed: 2.05,
      gap: 215,
      spawnDistance: 375,
      obstacleWidth: 74,
      maxVelocity: 5.6,
      particleCount: 14,
      skyTop: "#101b38",
      skyBottom: "#263f65",
      gapTightenPerPoint: 0.42,
      minGap: 165,
      speedScalePerPoint: 0.02,
      maxSpeedBonus: 1.05,
      plumeChance: 0.64,
      plumeBonus: 2,
      magnetRadius: 65,
      windChance: 0.45,
      windLift: -0.055
    },

    arcade: {
      gravity: 0.34,
      flapPower: -6.8,
      obstacleSpeed: 3.45,
      gap: 174,
      spawnDistance: 315,
      obstacleWidth: 80,
      maxVelocity: 8.6,
      particleCount: 22,
      skyTop: "#160c32",
      skyBottom: "#49255e",
      gapTightenPerPoint: 0.68,
      minGap: 130,
      speedScalePerPoint: 0.052,
      maxSpeedBonus: 2.35,
      plumeChance: 0.7,
      plumeBonus: 2,
      magnetRadius: 75,
      movingStartScore: 3,
      movingChanceBase: 0.28,
      movingChanceMax: 0.72
    }
  };

  const FEATHER_SKINS = [
    {
      id: "default",
      name: "Mode Harmony",
      subtitle: "Adapts naturally to Calm sky or Arcade gold",
      cost: 0,
      swatch: "linear-gradient(135deg, #d9f1ff, #ffe19a)",
      calmFeather: "#d9f1ff",
      calmBody: "#91c9f3",
      calmTrail: "184, 230, 255",
      arcadeFeather: "#ffe19a",
      arcadeBody: "#ffb547",
      arcadeTrail: "255, 214, 120"
    },
    {
      id: "starlight_lotus",
      name: "Starlight Lotus",
      subtitle: "Soft lilac-rose plumage with luminous dust",
      cost: 6,
      swatch: "linear-gradient(135deg, #ffd6ec, #b99cff)",
      feather: "#ffe4f3",
      body: "#c792ea",
      trail: "238, 178, 255"
    },
    {
      id: "jade_breeze",
      name: "Jade Breeze",
      subtitle: "Emerald-mint wings inspired by high mountain pines",
      cost: 12,
      swatch: "linear-gradient(135deg, #b8ffe4, #4fd1b5)",
      feather: "#d8fff0",
      body: "#48c9b0",
      trail: "120, 245, 210"
    },
    {
      id: "solar_phoenix",
      name: "Solar Phoenix",
      subtitle: "Radiant ember-gold wings with warm sparks",
      cost: 20,
      swatch: "linear-gradient(135deg, #fff1b8, #ff7b54)",
      feather: "#fff0b3",
      body: "#ff8c42",
      trail: "255, 166, 94"
    }
  ];

  const MILESTONES = [
    { id: "first_ten", label: "Skybound (10 pts)" },
    { id: "plume_five", label: "Plume Gatherer (5 plumes)" },
    { id: "streak_three", label: "Triple Harmony (3× streak)" },
    { id: "twenty_five", label: "Twilight Voyager (25 pts)" }
  ];

  const FRAME_MS = 1000 / 60;

  // ==========================================================
  // 3. GAME STATE & STORAGE
  // ==========================================================

  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = 1;

  let mode = null; // "A" (Calm) or "B" (Arcade)
  let phase = "menu"; // "menu" | "ready" | "playing" | "paused" | "gameover"
  let isNewBest = false;

  let score = 0;
  let highScore = 0;
  let plumesCollected = 0;
  let plumeBank = loadPlumeBank();
  let unlockedSkins = loadUnlockedSkins();
  let equippedSkinId = loadEquippedSkin();
  let earnedMilestones = loadEarnedMilestones();

  let plumeStreak = 0;
  let bestRunStreak = 0;
  let lastMilestoneScore = 0;

  let frame = 0;
  let lastTime = 0;
  let animationId = null;
  let lastInputTime = 0;
  let pauseChangedAt = 0;

  let obstacles = [];
  let plumes = [];
  let windCurrents = [];
  let shootingStars = [];
  let floatingTexts = [];
  let particles = [];
  let trailPoints = [];
  let stars = [];
  let clouds = [];

  let shake = 0;
  let flash = 0;

  let bird = {
    x: 0,
    y: 0,
    width: 32,
    height: 24,
    velocity: 0,
    rotation: 0,
    wingAngle: 0
  };

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function loadPlumeBank() {
    try {
      return Math.max(0, Number(localStorage.getItem("featherPlumeBank")) || 0);
    } catch {
      return 0;
    }
  }

  function savePlumeBank() {
    try {
      localStorage.setItem("featherPlumeBank", String(plumeBank));
    } catch {
      // Ignore storage errors
    }
  }

  function loadUnlockedSkins() {
    try {
      const parsed = JSON.parse(localStorage.getItem("featherUnlockedSkins") || '["default"]');
      return Array.isArray(parsed) && parsed.includes("default") ? parsed : ["default"];
    } catch {
      return ["default"];
    }
  }

  function saveUnlockedSkins() {
    try {
      localStorage.setItem("featherUnlockedSkins", JSON.stringify(unlockedSkins));
    } catch {
      // Ignore storage errors
    }
  }

  function loadEquippedSkin() {
    try {
      const saved = localStorage.getItem("featherEquippedSkin") || "default";
      return FEATHER_SKINS.some((s) => s.id === saved) ? saved : "default";
    } catch {
      return "default";
    }
  }

  function saveEquippedSkin() {
    try {
      localStorage.setItem("featherEquippedSkin", equippedSkinId);
    } catch {
      // Ignore storage errors
    }
  }

  function loadEarnedMilestones() {
    try {
      const parsed = JSON.parse(localStorage.getItem("featherMilestones") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveEarnedMilestones() {
    try {
      localStorage.setItem("featherMilestones", JSON.stringify(earnedMilestones));
    } catch {
      // Ignore storage errors
    }
  }

  function getActiveSkin() {
    const found = FEATHER_SKINS.find((s) => s.id === equippedSkinId) || FEATHER_SKINS[0];
    if (found.id === "default") {
      const isCalm = mode === "A" || (!mode && !wardrobeModal?.classList.contains("hidden"));
      return {
        feather: isCalm ? found.calmFeather : found.arcadeFeather,
        body: isCalm ? found.calmBody : found.arcadeBody,
        trail: isCalm ? found.calmTrail : found.arcadeTrail
      };
    }
    return {
      feather: found.feather,
      body: found.body,
      trail: found.trail
    };
  }

  // ==========================================================
  // 4. SOUND SYNTHESIZER & CALM AMBIENT PAD (WEB AUDIO)
  // ==========================================================

  let audioCtx = null;
  let ambientNodes = null;
  let soundEnabled = loadSoundPreference();

  function loadSoundPreference() {
    try {
      const saved = localStorage.getItem("featherSoundEnabled");
      if (saved === null) return !prefersReducedMotion;
      return saved === "true";
    } catch {
      return !prefersReducedMotion;
    }
  }

  function saveSoundPreference() {
    try {
      localStorage.setItem("featherSoundEnabled", String(soundEnabled));
    } catch {
      // Ignore storage errors
    }
  }

  function ensureAudioContext() {
    if (!soundEnabled) return null;
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function startCalmAmbientPad() {
    if (!soundEnabled || mode !== "A") {
      stopCalmAmbientPad();
      return;
    }

    const ctxAudio = ensureAudioContext();
    if (!ctxAudio || ambientNodes) return;

    const now = ctxAudio.currentTime;
    const masterGain = ctxAudio.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.022, now + 1.2);

    const filter = ctxAudio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(520, now);

    const freqs = [196.0, 293.66, 392.0]; // G3, D4, G4 open fifth
    const oscs = freqs.map((f, idx) => {
      const osc = ctxAudio.createOscillator();
      osc.type = idx === 1 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(f, now);
      osc.connect(filter);
      osc.start(now);
      return osc;
    });

    filter.connect(masterGain);
    masterGain.connect(ctxAudio.destination);

    ambientNodes = { oscs, filter, masterGain };
  }

  function stopCalmAmbientPad() {
    if (!ambientNodes || !audioCtx) return;
    const { oscs, masterGain } = ambientNodes;
    const now = audioCtx.currentTime;

    try {
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(Math.max(0.0001, masterGain.gain.value), now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      oscs.forEach((o) => {
        try {
          o.stop(now + 0.4);
        } catch {
          // Ignore already-stopped oscillators
        }
      });
    } catch {
      // Ignore cleanup errors
    }

    ambientNodes = null;
  }

  function playTone({
    freq = 440,
    endFreq = null,
    duration = 0.14,
    type = "sine",
    gainPeak = 0.06,
    delay = 0
  }) {
    const ctxAudio = ensureAudioContext();
    if (!ctxAudio) return;

    const now = ctxAudio.currentTime + delay;
    const osc = ctxAudio.createOscillator();
    const gain = ctxAudio.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(40, endFreq),
        now + duration
      );
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctxAudio.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function sfxFlap() {
    if (mode === "A") {
      playTone({ freq: 340, endFreq: 490, duration: 0.12, type: "sine", gainPeak: 0.045 });
    } else {
      playTone({ freq: 420, endFreq: 660, duration: 0.09, type: "triangle", gainPeak: 0.055 });
    }
  }

  function sfxScore() {
    playTone({ freq: 587.33, duration: 0.12, type: "sine", gainPeak: 0.05 });
    playTone({ freq: 880, duration: 0.18, type: "sine", gainPeak: 0.045, delay: 0.06 });
  }

  function sfxMilestoneChime() {
    playTone({ freq: 523.25, duration: 0.2, type: "sine", gainPeak: 0.05 });
    playTone({ freq: 659.25, duration: 0.22, type: "sine", gainPeak: 0.045, delay: 0.08 });
    playTone({ freq: 783.99, duration: 0.28, type: "sine", gainPeak: 0.045, delay: 0.16 });
  }

  function sfxPlume(streak = 1) {
    const pitchBoost = Math.min(streak - 1, 5) * 45;
    playTone({ freq: 659.25 + pitchBoost, duration: 0.12, type: "sine", gainPeak: 0.055 });
    playTone({ freq: 987.77 + pitchBoost, duration: 0.14, type: "sine", gainPeak: 0.05, delay: 0.05 });
    playTone({ freq: 1318.5 + pitchBoost, duration: 0.2, type: "sine", gainPeak: 0.045, delay: 0.1 });
  }

  function sfxUnlock() {
    playTone({ freq: 523.25, duration: 0.12, type: "triangle", gainPeak: 0.055 });
    playTone({ freq: 783.99, duration: 0.14, type: "triangle", gainPeak: 0.055, delay: 0.07 });
    playTone({ freq: 1046.5, duration: 0.22, type: "sine", gainPeak: 0.055, delay: 0.14 });
  }

  function sfxCrash() {
    playTone({ freq: 210, endFreq: 75, duration: 0.28, type: "triangle", gainPeak: 0.07 });
  }

  function triggerHaptic(pattern) {
    if (prefersReducedMotion || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore unsupported devices
    }
  }

  function updateSoundUI() {
    if (soundBtn) {
      soundBtn.setAttribute("aria-pressed", String(soundEnabled));
      soundBtn.classList.toggle("is-muted", !soundEnabled);
    }
    if (soundIcon) {
      soundIcon.textContent = soundEnabled ? "♪" : "✕";
    }
    if (soundText) {
      soundText.textContent = soundEnabled ? "Sound On" : "Muted";
    }
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    saveSoundPreference();
    updateSoundUI();
    if (soundEnabled) {
      ensureAudioContext();
      sfxPlume(1);
      if (mode === "A" && phase === "playing") {
        startCalmAmbientPad();
      }
    } else {
      stopCalmAmbientPad();
    }
  }

  // ==========================================================
  // 5. UTILITIES, STORAGE & MILESTONES
  // ==========================================================

  const random = (min, max) => Math.random() * (max - min) + min;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function lerpColor(hexA, hexB, t) {
    const c1 = hexToRgb(hexA);
    const c2 = hexToRgb(hexB);
    const r = Math.round(lerp(c1.r, c2.r, t));
    const g = Math.round(lerp(c1.g, c2.g, t));
    const b = Math.round(lerp(c1.b, c2.b, t));
    return `rgb(${r}, ${g}, ${b})`;
  }

  function currentConfig() {
    return mode === "A" ? CONFIG.calm : CONFIG.arcade;
  }

  function storageKey() {
    return mode === "A" ? "featherHighScoreA" : "featherHighScoreB";
  }

  function getSavedScore(key) {
    try {
      return Number(localStorage.getItem(key)) || 0;
    } catch {
      return 0;
    }
  }

  function saveHighScore() {
    if (!mode) return;

    if (score > highScore) {
      highScore = score;
      isNewBest = true;

      try {
        localStorage.setItem(storageKey(), String(highScore));
      } catch {
        // Ignore storage restrictions
      }
    }

    updateScoreUI();
  }

  function renderMilestonesStrip() {
    if (!milestonesPreview) return;
    milestonesPreview.innerHTML = "";

    MILESTONES.forEach((m) => {
      const earned = earnedMilestones.includes(m.id);
      const chip = document.createElement("span");
      chip.className = `milestone-chip${earned ? " earned" : ""}`;
      chip.textContent = `${earned ? "✦ " : ""}${m.label}`;
      milestonesPreview.appendChild(chip);
    });
  }

  function evaluateMilestones(newlyUnlockedList) {
    const checks = [
      { id: "first_ten", cond: score >= 10 },
      { id: "plume_five", cond: plumesCollected >= 5 },
      { id: "streak_three", cond: bestRunStreak >= 3 },
      { id: "twenty_five", cond: score >= 25 }
    ];

    let changed = false;
    checks.forEach(({ id, cond }) => {
      if (cond && !earnedMilestones.includes(id)) {
        earnedMilestones.push(id);
        changed = true;
        const meta = MILESTONES.find((m) => m.id === id);
        if (meta) newlyUnlockedList.push(meta.label);
      }
    });

    if (changed) {
      saveEarnedMilestones();
      renderMilestonesStrip();
    }
  }

  function triggerBump(el) {
    if (!el) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }

  function updateScoreUI(bumpScore = false, bumpPlumes = false) {
    if (scoreDisplay) scoreDisplay.textContent = String(score);
    if (highScoreDisplay) highScoreDisplay.textContent = String(highScore);
    if (feathersDisplay) {
      const displayCount = phase === "menu" ? plumeBank : plumesCollected;
      feathersDisplay.textContent =
        plumeStreak >= 2 && phase === "playing"
          ? `${displayCount} ×${plumeStreak}`
          : String(displayCount);
    }

    feathersPill?.classList.toggle("streak-active", plumeStreak >= 2 && phase === "playing");

    if (bumpScore) triggerBump(scorePill);
    if (bumpPlumes) triggerBump(feathersPill);
  }

  // ==========================================================
  // 6. WARDROBE RENDERING & ACTIONS
  // ==========================================================

  function renderWardrobe() {
    if (!wardrobeList) return;
    if (wardrobeBalanceCount) {
      wardrobeBalanceCount.textContent = String(plumeBank);
    }

    wardrobeList.innerHTML = "";

    FEATHER_SKINS.forEach((skin) => {
      const unlocked = unlockedSkins.includes(skin.id);
      const equipped = equippedSkinId === skin.id;
      const canAfford = plumeBank >= skin.cost;

      const item = document.createElement("div");
      item.className = `skin-item${equipped ? " is-equipped" : ""}`;

      const preview = document.createElement("div");
      preview.className = "skin-preview";

      const swatch = document.createElement("span");
      swatch.className = "skin-swatch";
      swatch.style.background =
        skin.swatch || `linear-gradient(135deg, ${skin.feather}, ${skin.body})`;

      const info = document.createElement("div");
      info.className = "skin-info";

      const title = document.createElement("strong");
      title.textContent = skin.name;

      const sub = document.createElement("small");
      sub.textContent = skin.subtitle;

      info.appendChild(title);
      info.appendChild(sub);

      preview.appendChild(swatch);
      preview.appendChild(info);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "skin-action-btn";

      if (equipped) {
        btn.textContent = "Equipped";
        btn.classList.add("equipped");
        btn.disabled = true;
      } else if (unlocked) {
        btn.textContent = "Equip";
        btn.addEventListener("click", () => {
          equippedSkinId = skin.id;
          saveEquippedSkin();
          renderWardrobe();
        });
      } else {
        btn.textContent = `Unlock · ${skin.cost}`;
        btn.disabled = !canAfford;
        btn.addEventListener("click", () => {
          if (plumeBank < skin.cost || unlockedSkins.includes(skin.id)) return;
          plumeBank -= skin.cost;
          unlockedSkins.push(skin.id);
          equippedSkinId = skin.id;
          savePlumeBank();
          saveUnlockedSkins();
          saveEquippedSkin();
          updateScoreUI(false, true);
          sfxUnlock();
          renderWardrobe();
        });
      }

      item.appendChild(preview);
      item.appendChild(btn);
      wardrobeList.appendChild(item);
    });
  }

  function openWardrobe() {
    if (!wardrobeModal) return;
    if (phase === "playing") {
      togglePause();
    }
    renderWardrobe();
    wardrobeModal.classList.remove("hidden");
  }

  function closeWardrobe() {
    if (!wardrobeModal) return;
    wardrobeModal.classList.add("hidden");
  }

  // ==========================================================
  // 7. CANVAS RESIZING
  // ==========================================================

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();

    width = Math.max(1, rect.width || window.innerWidth);
    height = Math.max(1, rect.height || window.innerHeight);

    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    particlesCanvas.width = Math.round(width * dpr);
    particlesCanvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (phase === "menu" || phase === "ready") {
      bird.x = width * 0.27;
      bird.y = height * 0.45;
    } else {
      bird.x = clamp(bird.x, 40, width * 0.45);
      bird.y = clamp(bird.y, 20, height - 20);
    }

    createStars();
    createClouds();
  }

  window.addEventListener("resize", resizeCanvas);

  // ==========================================================
  // 8. BACKGROUND, SHOOTING STARS & ATMOSPHERE
  // ==========================================================

  function createStars() {
    stars = [];
    const count = Math.floor(Math.min(130, Math.max(45, width / 8)));

    for (let i = 0; i < count; i++) {
      stars.push({
        x: random(0, width),
        y: random(0, height),
        size: random(0.5, 2.2),
        alpha: random(0.25, 0.9),
        speed: random(0.003, 0.025),
        phase: random(0, Math.PI * 2)
      });
    }
  }

  function createClouds() {
    clouds = [];

    for (let i = 0; i < 8; i++) {
      clouds.push({
        x: random(0, width),
        y: random(height * 0.14, height * 0.78),
        size: random(35, 90),
        speed: random(0.14, 0.5),
        alpha: random(0.035, 0.12)
      });
    }
  }

  function spawnShootingStar() {
    shootingStars.push({
      x: random(width * 0.25, width * 0.9),
      y: random(height * 0.06, height * 0.34),
      vx: random(-7.5, -4.5),
      vy: random(2.2, 4.2),
      life: 32,
      maxLife: 32
    });
  }

  function updateShootingStars(dt) {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.life <= 0) {
        shootingStars.splice(i, 1);
      }
    }
  }

  function drawShootingStars() {
    shootingStars.forEach((s) => {
      const alpha = clamp(s.life / s.maxLife, 0, 1);
      ctx.save();
      const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 5, s.y - s.vy * 5);
      grad.addColorStop(0, `rgba(255, 248, 220, ${alpha})`);
      grad.addColorStop(1, "rgba(255, 248, 220, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 5, s.y - s.vy * 5);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawBackground() {
    const cfg = mode ? currentConfig() : CONFIG.calm;
    const progress = clamp(score / 25, 0, 1);

    const topColor =
      mode === "A"
        ? lerpColor(cfg.skyTop, "#17143b", progress)
        : lerpColor(cfg.skyTop, "#260d3b", progress);
    const bottomColor =
      mode === "A"
        ? lerpColor(cfg.skyBottom, "#385c7d", progress)
        : lerpColor(cfg.skyBottom, "#6b2b59", progress);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    if (score >= 5) {
      const auroraAlpha = clamp((score - 4) * 0.012, 0, 0.14);
      const auroraGrad = ctx.createLinearGradient(0, height * 0.06, width, height * 0.35);
      auroraGrad.addColorStop(0, "rgba(140, 239, 255, 0)");
      auroraGrad.addColorStop(
        0.5,
        mode === "A"
          ? `rgba(140, 239, 255, ${auroraAlpha})`
          : `rgba(255, 196, 112, ${auroraAlpha})`
      );
      auroraGrad.addColorStop(1, "rgba(243, 213, 138, 0)");

      ctx.save();
      ctx.fillStyle = auroraGrad;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.22);
      for (let x = 0; x <= width + 80; x += 80) {
        const y =
          height * 0.18 +
          Math.sin(x * 0.005 + frame * 0.012) * 28 +
          Math.cos(x * 0.011 - frame * 0.008) * 14;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height * 0.38);
      ctx.lineTo(0, height * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    const moonX = width * 0.78;
    const moonY = height * 0.2;
    const moonRadius = Math.min(width, height) * 0.055;

    const moonGlow = ctx.createRadialGradient(
      moonX,
      moonY,
      1,
      moonX,
      moonY,
      moonRadius * 3
    );
    moonGlow.addColorStop(0, "rgba(210,230,255,0.16)");
    moonGlow.addColorStop(1, "rgba(210,230,255,0)");

    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(235,240,255,0.82)";
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    stars.forEach((star) => {
      const twinkle = 0.45 + Math.sin(frame * star.speed + star.phase) * 0.4;
      ctx.globalAlpha = clamp(star.alpha * twinkle, 0.05, 1);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    drawShootingStars();

    clouds.forEach((cloud) => drawCloud(cloud));
    drawLandscape();
  }

  function drawCloud(cloud) {
    ctx.save();
    ctx.globalAlpha = cloud.alpha;
    ctx.fillStyle = "#dceaff";

    const x = cloud.x;
    const y = cloud.y;
    const s = cloud.size;

    ctx.beginPath();
    ctx.arc(x, y, s * 0.4, 0, Math.PI * 2);
    ctx.arc(x + s * 0.35, y - s * 0.2, s * 0.32, 0, Math.PI * 2);
    ctx.arc(x + s * 0.65, y, s * 0.4, 0, Math.PI * 2);
    ctx.arc(x + s * 0.3, y + s * 0.1, s * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawLandscape() {
    const groundY = height * 0.92;

    ctx.fillStyle = "rgba(8,15,30,0.22)";
    ctx.beginPath();
    ctx.moveTo(0, groundY);

    for (let x = 0; x <= width + 60; x += 60) {
      const y = groundY - 18 - Math.sin(x * 0.008 + frame * 0.002) * 18;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  }

  // ==========================================================
  // 9. CALM WIND CURRENTS
  // ==========================================================

  function spawnWindCurrent(xPos) {
    const margin = Math.max(90, height * 0.14);
    const bandHeight = clamp(height * 0.2, 110, 185);
    const top = random(margin, Math.max(margin + 20, height - margin - bandHeight));

    windCurrents.push({
      x: xPos,
      width: random(130, 190),
      top,
      height: bandHeight,
      phase: random(0, Math.PI * 2)
    });
  }

  function drawWindCurrents() {
    if (mode !== "A" || windCurrents.length === 0) return;

    windCurrents.forEach((wc) => {
      ctx.save();
      const grad = ctx.createLinearGradient(wc.x, wc.top + wc.height, wc.x, wc.top);
      grad.addColorStop(0, "rgba(162, 232, 255, 0.01)");
      grad.addColorStop(0.5, "rgba(162, 232, 255, 0.09)");
      grad.addColorStop(1, "rgba(162, 232, 255, 0.01)");

      ctx.fillStyle = grad;
      ctx.fillRect(wc.x, wc.top, wc.width, wc.height);

      ctx.strokeStyle = "rgba(220, 248, 255, 0.24)";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";

      for (let i = 0; i < 3; i++) {
        const ribbonX = wc.x + wc.width * (0.22 + i * 0.28);
        const offset = ((frame * 1.1 + i * 26 + wc.phase * 20) % wc.height);
        const ry = wc.top + wc.height - offset;

        ctx.beginPath();
        ctx.moveTo(ribbonX, ry);
        ctx.quadraticCurveTo(
          ribbonX + Math.sin(frame * 0.05 + i) * 8,
          ry - 14,
          ribbonX - 4,
          ry - 28
        );
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  function updateWindCurrents(dt) {
    if (mode !== "A") return;
    const cfg = CONFIG.calm;
    const speed = currentObstacleSpeed(cfg);

    for (let i = windCurrents.length - 1; i >= 0; i--) {
      const wc = windCurrents[i];
      wc.x -= speed * 0.85 * dt;
      wc.phase += 0.03 * dt;

      if (
        bird.x + 12 > wc.x &&
        bird.x - 12 < wc.x + wc.width &&
        bird.y > wc.top &&
        bird.y < wc.top + wc.height
      ) {
        bird.velocity += cfg.windLift * dt;
        if (Math.random() < 0.25 * dt) {
          addParticles(bird.x - 6, bird.y + 10, 1, "#d8f4ff");
        }
      }

      if (wc.x + wc.width < -60) {
        windCurrents.splice(i, 1);
      }
    }
  }

  // ==========================================================
  // 10. BIRD & MOTION TRAIL
  // ==========================================================

  function updateTrail(dt) {
    if (phase === "playing") {
      trailPoints.push({
        x: bird.x - 14,
        y: bird.y + 1,
        life: 16,
        maxLife: 16
      });
    }

    for (let i = trailPoints.length - 1; i >= 0; i--) {
      const pt = trailPoints[i];
      pt.x -= (mode ? currentObstacleSpeed(currentConfig()) : 2.2) * 0.65 * dt;
      pt.life -= dt;
      if (pt.life <= 0) {
        trailPoints.splice(i, 1);
      }
    }
  }

  function drawTrail() {
    if (trailPoints.length < 2) return;
    const skin = getActiveSkin();

    for (let i = 1; i < trailPoints.length; i++) {
      const prev = trailPoints[i - 1];
      const curr = trailPoints[i];
      const alpha = clamp(curr.life / curr.maxLife, 0, 1) * 0.3;

      ctx.save();
      ctx.strokeStyle = `rgba(${skin.trail}, ${alpha})`;
      ctx.lineWidth = Math.max(1.5, (curr.life / curr.maxLife) * 6);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawBird() {
    drawTrail();

    const skin = getActiveSkin();

    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    ctx.shadowColor = skin.body;
    ctx.shadowBlur = mode === "A" ? 13 : 20;

    ctx.fillStyle = skin.feather;
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = skin.body;
    ctx.save();
    ctx.rotate(Math.sin(bird.wingAngle) * 0.38);
    ctx.beginPath();
    ctx.ellipse(-3, 3, 10, 6, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = skin.body;
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.lineTo(-23, -5);
    ctx.lineTo(-19, 3);
    ctx.lineTo(-24, 8);
    ctx.lineTo(-11, 7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffbd68";
    ctx.beginPath();
    ctx.moveTo(13, -2);
    ctx.lineTo(23, 1);
    ctx.lineTo(13, 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#24334c";
    ctx.beginPath();
    ctx.arc(7, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(7.7, -4.8, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawHoverBird() {
    bird.x = width * 0.27;
    bird.y = height * 0.45 + Math.sin(frame * 0.04) * 11;
    bird.rotation = Math.sin(frame * 0.03) * 0.07;
    bird.wingAngle = frame * 0.16;
    drawBird();
  }

  // ==========================================================
  // 11. OBSTACLES & COLLECTIBLE PLUMES
  // ==========================================================

  function shouldSpawnMovingPillar() {
    if (mode !== "B") return false;
    const cfg = CONFIG.arcade;
    if (score < cfg.movingStartScore) return false;

    const progress = clamp((score - cfg.movingStartScore) / 18, 0, 1);
    const chance = lerp(cfg.movingChanceBase, cfg.movingChanceMax, progress);
    return Math.random() < chance;
  }

  function spawnObstacle(extraOffsetX = 0) {
    const cfg = currentConfig();
    const isEarlyObstacle = obstacles.length < 2 && score < 2;

    const baseGap = Math.max(
      cfg.minGap,
      cfg.gap - score * cfg.gapTightenPerPoint
    );
    const gap = isEarlyObstacle ? Math.min(cfg.gap + 24, baseGap + 24) : baseGap;

    const margin = Math.max(76, height * 0.12);
    const availableHeight = height - margin * 2 - gap;
    const minTop = margin;
    const maxTop = margin + Math.max(40, availableHeight);

    const baseTop = isEarlyObstacle
      ? clamp(height * 0.46 - gap * 0.5, minTop, maxTop)
      : random(minTop, maxTop);

    const isMoving = !isEarlyObstacle && shouldSpawnMovingPillar();
    const moveRange = isMoving ? Math.min(34, availableHeight * 0.35) : 0;
    const clampedBaseTop = clamp(
      baseTop,
      minTop + moveRange,
      Math.max(minTop + moveRange, maxTop - moveRange)
    );

    const spawnX = width + 40 + extraOffsetX;

    obstacles.push({
      x: spawnX,
      width: cfg.obstacleWidth,
      baseTop: clampedBaseTop,
      top: clampedBaseTop,
      gap,
      scored: false,
      moving: isMoving,
      moveRange,
      moveSpeed: isMoving ? random(0.024, 0.042) : 0,
      movePhase: random(0, Math.PI * 2)
    });

    if (Math.random() < cfg.plumeChance) {
      const gapCenter = clampedBaseTop + gap * 0.5;
      const offsetY = random(-gap * 0.16, gap * 0.16);
      const baseY = clamp(gapCenter + offsetY, margin + 24, height - margin - 24);

      plumes.push({
        x: spawnX + cfg.obstacleWidth * 0.5 + cfg.spawnDistance * 0.5,
        baseY,
        y: baseY,
        radius: 12,
        phase: random(0, Math.PI * 2),
        collected: false
      });
    }

    if (mode === "A" && !isEarlyObstacle && Math.random() < cfg.windChance) {
      spawnWindCurrent(spawnX + cfg.obstacleWidth * 0.5 + cfg.spawnDistance * 0.45);
    }
  }

  function drawObstacle(obstacle) {
    const bottomY = obstacle.top + obstacle.gap;
    const pipeWidth = obstacle.width;

    if (mode === "A") {
      // Soft cloud-lantern pillars in Calm mode
      drawPipe(obstacle.x, 0, pipeWidth, obstacle.top, "#78b3e0", "#b8e2ff", "#4874a6", true, true);
      drawPipe(obstacle.x, bottomY, pipeWidth, height - bottomY, "#78b3e0", "#b8e2ff", "#4874a6", false, true);
      return;
    }

    // Sunlit bronze/ember pillars in Arcade mode
    const color = obstacle.moving ? "#e67b54" : "#d88a4e";
    const lighter = obstacle.moving ? "#ffb58a" : "#ffc16d";
    const darker = obstacle.moving ? "#9e4328" : "#96542e";

    drawPipe(obstacle.x, 0, pipeWidth, obstacle.top, color, lighter, darker, true, false);
    drawPipe(obstacle.x, bottomY, pipeWidth, height - bottomY, color, lighter, darker, false, false);

    if (obstacle.moving) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 245, 215, 0.65)";
      ctx.lineWidth = 1.6;
      const cx = obstacle.x + pipeWidth * 0.5;
      const cy = obstacle.top + obstacle.gap * 0.5;

      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 11);
      ctx.lineTo(cx, cy - 16);
      ctx.lineTo(cx + 6, cy - 11);
      ctx.moveTo(cx - 6, cy + 11);
      ctx.lineTo(cx, cy + 16);
      ctx.lineTo(cx + 6, cy + 11);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawPipe(x, y, w, h, color, lighter, darker, isTop, isCalmLantern) {
    if (h <= 0) return;

    ctx.save();

    const gradient = ctx.createLinearGradient(x, 0, x + w, 0);
    gradient.addColorStop(0, darker);
    gradient.addColorStop(0.35, color);
    gradient.addColorStop(0.7, lighter);
    gradient.addColorStop(1, darker);

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    const capHeight = 18;
    const capExtra = 8;
    const capY = isTop ? y + h - capHeight : y;

    ctx.fillRect(x - capExtra / 2, capY, w + capExtra, capHeight);
    ctx.strokeRect(x - capExtra / 2, capY, w + capExtra, capHeight);

    // Soft glowing lantern near pillar lip in Calm mode
    if (isCalmLantern && h > 46) {
      const lanternY = isTop ? y + h - 34 : y + 34;
      const lanternX = x + w * 0.5;
      ctx.fillStyle = "rgba(255, 232, 174, 0.72)";
      ctx.shadowColor = "#ffe8ae";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(x + 10, y, 5, h);

    ctx.restore();
  }

  function drawPlume(plume) {
    if (plume.collected) return;

    ctx.save();
    ctx.translate(plume.x, plume.y);
    ctx.rotate(Math.sin(plume.phase) * 0.25);

    const glowColor =
      mode === "A" ? "rgba(155, 220, 255, 0.35)" : "rgba(255, 224, 130, 0.38)";
    const coreColor = mode === "A" ? "#e2f5ff" : "#ffe699";

    ctx.shadowColor = coreColor;
    ctx.shadowBlur = 14;

    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(0, 0, plume.radius * 1.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.quadraticCurveTo(8, -2, 0, 10);
    ctx.quadraticCurveTo(-8, -2, 0, -10);
    ctx.fill();

    ctx.restore();
  }

  function obstacleCollision(obstacle) {
    const bx = bird.x - bird.width * 0.34;
    const by = bird.y - bird.height * 0.34;
    const bw = bird.width * 0.68;
    const bh = bird.height * 0.68;

    const bottomY = obstacle.top + obstacle.gap;
    const hitHorizontal = bx + bw > obstacle.x && bx < obstacle.x + obstacle.width;

    if (!hitHorizontal) return false;
    return by < obstacle.top || by + bh > bottomY;
  }

  // ==========================================================
  // 12. PARTICLES & FLOATING POPUPS
  // ==========================================================

  function addParticles(x, y, amount, color) {
    for (let i = 0; i < amount; i++) {
      particles.push({
        x,
        y,
        vx: random(-3.5, 3.5),
        vy: random(-4, 2),
        size: random(2, 6),
        life: random(25, 55),
        maxLife: 55,
        color: color || "#ffffff"
      });
    }
  }

  function addFloatingText(x, y, text, color) {
    floatingTexts.push({
      x,
      y,
      text,
      color: color || "#ffe8ae",
      life: 48,
      maxLife: 48
    });
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.035 * dt;
      p.vx *= Math.pow(0.985, dt);
      p.life -= dt;

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 0.78 * dt;
      ft.life -= dt;

      if (ft.life <= 0) {
        floatingTexts.splice(i, 1);
      }
    }
  }

  function drawParticles() {
    pctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      pctx.save();
      pctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      pctx.fillStyle = p.color;
      pctx.beginPath();
      pctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      pctx.fill();
      pctx.restore();
    });

    floatingTexts.forEach((ft) => {
      pctx.save();
      pctx.globalAlpha = clamp(ft.life / ft.maxLife, 0, 1);
      pctx.font = "700 14px 'DM Sans', sans-serif";
      pctx.textAlign = "center";
      pctx.fillStyle = ft.color;
      pctx.shadowColor = "rgba(0, 0, 0, 0.55)";
      pctx.shadowBlur = 8;
      pctx.fillText(ft.text, ft.x, ft.y);
      pctx.restore();
    });
  }

  // ==========================================================
  // 13. GAME START & CONTROLS
  // ==========================================================

  function startGame(selectedMode) {
    closeWardrobe();
    mode = selectedMode;
    ensureAudioContext();

    score = 0;
    plumesCollected = 0;
    plumeStreak = 0;
    bestRunStreak = 0;
    lastMilestoneScore = 0;
    highScore = getSavedScore(storageKey());
    isNewBest = false;

    phase = "ready";

    obstacles = [];
    plumes = [];
    windCurrents = [];
    shootingStars = [];
    floatingTexts = [];
    particles = [];
    trailPoints = [];

    shake = 0;
    flash = 0;

    bird.x = width * 0.27;
    bird.y = height * 0.45;
    bird.velocity = 0;
    bird.rotation = 0;
    bird.wingAngle = 0;

    frame = 0;
    lastTime = 0;

    if (modeHintText) {
      modeHintText.textContent =
        mode === "A"
          ? "Ride gentle updrafts · Collect plumes for +2 & streaks"
          : "Watch for shifting pillars · Collect plumes for +2 & streaks";
    }

    if (modeSelector) {
      modeSelector.style.display = "none";
    }

    instructions?.classList.remove("hidden");
    newBestBadge?.classList.add("hidden");
    unlockedMilestoneBanner?.classList.add("hidden");

    gameOverPopup?.classList.remove("show");
    gameOverPopup?.classList.add("hidden");

    if (pauseBtn) {
      pauseBtn.style.display = "inline-flex";
    }

    if (pauseText) pauseText.textContent = "Pause";
    if (pauseIcon) pauseIcon.textContent = "Ⅱ";

    updateScoreUI();
    spawnObstacle(240);

    if (!animationId) {
      animationId = requestAnimationFrame(gameLoop);
    }
  }

  function flapBird() {
    const cfg = currentConfig();
    const skin = getActiveSkin();
    bird.velocity = cfg.flapPower;
    bird.wingAngle = 0;

    sfxFlap();

    addParticles(
      bird.x - 10,
      bird.y + 8,
      cfg.particleCount,
      skin.feather
    );
  }

  function handlePrimaryAction() {
    if (!wardrobeModal?.classList.contains("hidden")) return;

    if (phase === "ready") {
      phase = "playing";
      instructions?.classList.add("hidden");
      if (mode === "A") {
        startCalmAmbientPad();
      }
      flapBird();
      return;
    }

    if (phase === "playing") {
      flapBird();
    }
  }

  function handlePointer(e) {
    if (e.target !== canvas && e.target !== particlesCanvas) return;
    e.preventDefault();

    const now = performance.now();
    if (now - lastInputTime < 85) return;
    lastInputTime = now;

    if (phase === "paused") {
      if (now - pauseChangedAt > 220) {
        togglePause();
      }
      return;
    }

    handlePrimaryAction();
  }

  canvas.addEventListener("pointerdown", handlePointer);
  particlesCanvas.addEventListener("pointerdown", handlePointer);

  // ==========================================================
  // 14. GAME UPDATE (DELTA-TIME)
  // ==========================================================

  function currentObstacleSpeed(cfg) {
    const bonus = Math.min(score * cfg.speedScalePerPoint, cfg.maxSpeedBonus);
    return cfg.obstacleSpeed + bonus;
  }

  function checkEveryTenMilestone() {
    const tenBucket = Math.floor(score / 10) * 10;
    if (tenBucket >= 10 && tenBucket > lastMilestoneScore) {
      lastMilestoneScore = tenBucket;
      spawnShootingStar();
      spawnShootingStar();
      sfxMilestoneChime();
      addFloatingText(bird.x + 24, bird.y - 24, `✦ ${tenBucket} Sky Milestone`, "#ffe8ae");
    }
  }

  function updateBird(dt) {
    const cfg = currentConfig();

    bird.velocity += cfg.gravity * dt;
    bird.velocity = clamp(bird.velocity, -cfg.maxVelocity, cfg.maxVelocity);
    bird.y += bird.velocity * dt;

    bird.rotation = clamp(bird.velocity * 0.055, -0.5, 1.15);
    bird.wingAngle += 0.3 * dt;

    if (bird.y - bird.height * 0.4 < 0 || bird.y + bird.height * 0.4 > height) {
      endGame();
    }
  }

  function updateObstaclesAndPlumes(dt) {
    const cfg = currentConfig();
    const speed = currentObstacleSpeed(cfg);
    const skin = getActiveSkin();

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      obstacle.x -= speed * dt;

      if (obstacle.moving) {
        obstacle.movePhase += obstacle.moveSpeed * dt;
        obstacle.top = obstacle.baseTop + Math.sin(obstacle.movePhase) * obstacle.moveRange;
      }

      if (!obstacle.scored && obstacle.x + obstacle.width < bird.x) {
        obstacle.scored = true;
        score += 1;
        saveHighScore();
        updateScoreUI(true, false);
        sfxScore();
        checkEveryTenMilestone();

        addParticles(
          bird.x,
          bird.y,
          8,
          skin.feather
        );
      }

      if (obstacleCollision(obstacle)) {
        endGame();
        return;
      }

      if (obstacle.x + obstacle.width < -40) {
        obstacles.splice(i, 1);
      }
    }

    for (let i = plumes.length - 1; i >= 0; i--) {
      const plume = plumes[i];
      plume.x -= speed * dt;
      plume.phase += 0.08 * dt;

      const targetY = plume.baseY + Math.sin(plume.phase) * 8;
      plume.y = lerp(plume.y, targetY, clamp(0.18 * dt, 0, 1));

      if (!plume.collected) {
        const dx = bird.x - plume.x;
        const dy = bird.y - plume.y;
        const distSq = dx * dx + dy * dy;
        const magnetR = cfg.magnetRadius;

        if (distSq < magnetR * magnetR && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const pull = (1 - dist / magnetR) * 0.24 * dt;
          plume.x += (dx / dist) * pull * 10;
          plume.baseY += (dy / dist) * pull * 10;
          plume.y += (dy / dist) * pull * 10;
        }

        const hitDist = plume.radius + 17;
        if (dx * dx + dy * dy <= hitDist * hitDist) {
          plume.collected = true;
          plumesCollected += 1;
          plumeBank += 1;
          plumeStreak += 1;
          bestRunStreak = Math.max(bestRunStreak, plumeStreak);
          savePlumeBank();

          const streakBonus = plumeStreak >= 3 ? 1 : 0;
          const totalGain = cfg.plumeBonus + streakBonus;

          score += totalGain;
          saveHighScore();
          updateScoreUI(true, true);
          sfxPlume(plumeStreak);
          triggerHaptic(plumeStreak >= 3 ? [10, 20, 12] : 10);
          checkEveryTenMilestone();

          addParticles(
            plume.x,
            plume.y,
            16,
            mode === "A" ? "#9bdcff" : "#ffe28a"
          );

          const label =
            streakBonus > 0
              ? `+${totalGain} Streak ×${plumeStreak}`
              : `+${totalGain} Plume`;

          addFloatingText(
            plume.x,
            plume.y - 12,
            label,
            mode === "A" ? "#bce7ff" : "#ffe8ae"
          );
        }
      }

      if (plume.collected || plume.x < -40) {
        if (!plume.collected && plume.x < -40) {
          plumeStreak = 0;
          updateScoreUI(false, false);
        }
        plumes.splice(i, 1);
      }
    }

    if (
      obstacles.length === 0 ||
      obstacles[obstacles.length - 1].x < width - cfg.spawnDistance
    ) {
      spawnObstacle(0);
    }
  }

  function updateClouds(dt) {
    clouds.forEach((cloud) => {
      cloud.x -= cloud.speed * dt;

      if (cloud.x + cloud.size < -50) {
        cloud.x = width + cloud.size;
        cloud.y = random(height * 0.14, height * 0.78);
      }
    });
  }

  function update(dt) {
    if (phase !== "playing") return;

    frame += dt;

    updateWindCurrents(dt);
    updateBird(dt);
    if (phase !== "playing") return;

    updateObstaclesAndPlumes(dt);
    if (phase !== "playing") return;

    updateClouds(dt);
    updateShootingStars(dt);
    updateTrail(dt);
    updateParticles(dt);

    if (shake > 0) shake *= Math.pow(0.85, dt);
    if (flash > 0) flash *= Math.pow(0.9, dt);
  }

  // ==========================================================
  // 15. PAUSE & GAME OVER
  // ==========================================================

  function togglePause() {
    if (phase !== "playing" && phase !== "paused") return;

    pauseChangedAt = performance.now();

    if (phase === "playing") {
      phase = "paused";
      stopCalmAmbientPad();
      if (pauseText) pauseText.textContent = "Resume";
      if (pauseIcon) pauseIcon.textContent = "▶";
    } else {
      phase = "playing";
      if (mode === "A") startCalmAmbientPad();
      if (pauseText) pauseText.textContent = "Pause";
      if (pauseIcon) pauseIcon.textContent = "Ⅱ";
      lastTime = 0;
    }
  }

  function drawPauseOverlay() {
    ctx.save();

    ctx.fillStyle = "rgba(8,12,25,0.52)";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px 'DM Sans', sans-serif";
    ctx.fillText("PAUSED", width / 2, height / 2 - 14);

    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.font = "15px 'DM Sans', sans-serif";
    ctx.fillText("Tap or press P to continue", width / 2, height / 2 + 24);

    ctx.restore();
  }

  function buildResultMessage() {
    if (isNewBest && score > 0) {
      return mode === "A"
        ? "A new calm record—carried effortlessly on the breeze."
        : "New personal best! Your reflexes stayed sharp in the storm.";
    }
    if (score === 0) {
      return "Every flight starts with a single lift. Try again whenever you're ready.";
    }
    if (score < 10) {
      return "A quiet glide through the twilight. There is always another sky.";
    }
    return "Steady wings and calm focus. You found a lovely rhythm up there.";
  }

  function endGame() {
    if (phase === "gameover") return;

    phase = "gameover";
    plumeStreak = 0;
    stopCalmAmbientPad();

    saveHighScore();
    sfxCrash();
    triggerHaptic([25, 30, 25]);

    shake = 12;
    flash = 0.45;

    const newlyUnlocked = [];
    evaluateMilestones(newlyUnlocked);

    const skin = getActiveSkin();
    addParticles(bird.x, bird.y, 36, skin.feather);

    if (finalScoreDisplay) {
      finalScoreDisplay.textContent = `Score: ${score} · Plumes: ${plumesCollected}`;
    }

    if (statBestStreak) {
      statBestStreak.textContent = `${bestRunStreak}×`;
    }
    if (statModeBest) {
      statModeBest.textContent = String(highScore);
    }
    if (statPlumeBank) {
      statPlumeBank.textContent = String(plumeBank);
    }

    if (resultMessageDisplay) {
      resultMessageDisplay.textContent = buildResultMessage();
    }

    if (unlockedMilestoneBanner) {
      if (newlyUnlocked.length > 0) {
        unlockedMilestoneBanner.textContent = `✦ Milestone Unlocked: ${newlyUnlocked.join(", ")}`;
        unlockedMilestoneBanner.classList.remove("hidden");
      } else {
        unlockedMilestoneBanner.classList.add("hidden");
      }
    }

    if (newBestBadge) {
      newBestBadge.classList.toggle("hidden", !isNewBest || score === 0);
    }

    gameOverPopup?.classList.remove("hidden");
    gameOverPopup?.classList.add("show");
    instructions?.classList.add("hidden");

    if (pauseBtn) {
      pauseBtn.style.display = "none";
    }
  }

  function returnToMenu() {
    phase = "menu";
    isNewBest = false;
    stopCalmAmbientPad();

    mode = null;
    score = 0;
    plumesCollected = 0;
    plumeStreak = 0;
    bestRunStreak = 0;

    obstacles = [];
    plumes = [];
    windCurrents = [];
    shootingStars = [];
    floatingTexts = [];
    particles = [];
    trailPoints = [];

    bird.velocity = 0;
    bird.rotation = 0;

    gameOverPopup?.classList.remove("show");
    gameOverPopup?.classList.add("hidden");
    instructions?.classList.add("hidden");
    newBestBadge?.classList.add("hidden");
    unlockedMilestoneBanner?.classList.add("hidden");

    if (modeSelector) {
      modeSelector.style.display = "flex";
    }

    if (pauseBtn) {
      pauseBtn.style.display = "none";
    }

    if (pauseText) pauseText.textContent = "Pause";
    if (pauseIcon) pauseIcon.textContent = "Ⅱ";

    renderMilestonesStrip();
    updateScoreUI();
  }

  function restartGame() {
    startGame(mode || "A");
  }

  // ==========================================================
  // 16. RENDER & LOOP
  // ==========================================================

  function drawGame() {
    ctx.clearRect(0, 0, width, height);

    ctx.save();

    if (shake > 0.5) {
      ctx.translate(random(-shake, shake), random(-shake, shake));
    }

    drawBackground();

    if (phase === "playing" || phase === "paused" || phase === "gameover") {
      drawWindCurrents();
      plumes.forEach(drawPlume);
      obstacles.forEach(drawObstacle);
      drawBird();
    } else if (phase === "ready") {
      drawWindCurrents();
      plumes.forEach(drawPlume);
      obstacles.forEach(drawObstacle);
      drawHoverBird();
    } else {
      drawHoverBird();
    }

    ctx.restore();

    drawParticles();

    if (flash > 0.01) {
      ctx.save();
      ctx.globalAlpha = flash;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    if (phase === "paused") {
      drawPauseOverlay();
    }
  }

  function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;

    const rawDelta = Math.max(0, timestamp - lastTime);
    lastTime = timestamp;

    const dt = Math.min(rawDelta, 50) / FRAME_MS;

    if (phase === "playing") {
      update(dt);
    } else if (phase !== "paused") {
      frame += dt;
      updateClouds(dt);
      updateShootingStars(dt);
      updateTrail(dt);
      updateParticles(dt);
      if (shake > 0) shake *= Math.pow(0.85, dt);
      if (flash > 0) flash *= Math.pow(0.9, dt);
    }

    drawGame();
    animationId = requestAnimationFrame(gameLoop);
  }

  // ==========================================================
  // 17. EVENT LISTENERS
  // ==========================================================

  modeAButton?.addEventListener("click", () => startGame("A"));
  modeBButton?.addEventListener("click", () => startGame("B"));

  wardrobeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    openWardrobe();
  });

  closeWardrobeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeWardrobe();
  });

  wardrobeModal?.addEventListener("click", (e) => {
    if (e.target === wardrobeModal) {
      closeWardrobe();
    }
  });

  soundBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSound();
  });

  pauseBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePause();
  });

  restartBtn?.addEventListener("click", restartGame);
  chooseModeBtn?.addEventListener("click", returnToMenu);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && phase === "playing") {
      togglePause();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();

    if (key === "escape" && !wardrobeModal?.classList.contains("hidden")) {
      e.preventDefault();
      closeWardrobe();
      return;
    }

    if (key === " " || key === "arrowup" || key === "w") {
      if (phase === "ready" || phase === "playing") {
        e.preventDefault();
        handlePrimaryAction();
      }
    } else if (key === "p" || key === "escape") {
      if (phase === "playing" || phase === "paused") {
        e.preventDefault();
        togglePause();
      }
    } else if (key === "m") {
      e.preventDefault();
      toggleSound();
    } else if (key === "1" && phase === "menu" && wardrobeModal?.classList.contains("hidden")) {
      e.preventDefault();
      startGame("A");
    } else if (key === "2" && phase === "menu" && wardrobeModal?.classList.contains("hidden")) {
      e.preventDefault();
      startGame("B");
    } else if (key === "enter" && phase === "gameover" && wardrobeModal?.classList.contains("hidden")) {
      e.preventDefault();
      restartGame();
    }
  });

  // ==========================================================
  // 18. INITIALIZATION
  // ==========================================================

  resizeCanvas();
  updateSoundUI();
  renderWardrobe();
  renderMilestonesStrip();

  phase = "menu";
  mode = null;

  bird.x = width * 0.27;
  bird.y = height * 0.45;

  if (modeSelector) {
    modeSelector.style.display = "flex";
  }

  if (gameOverPopup) {
    gameOverPopup.classList.remove("show");
    gameOverPopup.classList.add("hidden");
  }

  if (pauseBtn) {
    pauseBtn.style.display = "none";
  }

  updateScoreUI();

  if (!animationId) {
    animationId = requestAnimationFrame(gameLoop);
  }
});