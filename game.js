/* ==========================================================
   FEATHORIA — FLAPPY FEATHER (SANCTUARY EXPANSION)
   Hold-to-Glide • Swipe-Right Gust • Spirit Companions
   Living Constellations • Golden Lotuses • Sanctuary Unlocks
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
  const sanctuaryBadge = $("sanctuaryBadge");
  const wardrobeModal = $("wardrobeModal");
  const wardrobeList = $("wardrobeList");
  const companionsList = $("companionsList");
  const upgradesList = $("upgradesList");
  const wardrobeBalanceCount = $("wardrobeBalanceCount");
  const unlockedCollectionCount = $("unlockedCollectionCount");
  const showcaseFeatherOrb = $("showcaseFeatherOrb");
  const showcaseSpiritBadge = $("showcaseSpiritBadge");
  const showcaseTitle = $("showcaseTitle");
  const showcasePerkText = $("showcasePerkText");
  const sanctuaryToast = $("sanctuaryToast");
  const closeWardrobeBtn = $("closeWardrobeBtn");
  const tabSkins = $("tabSkins");
  const tabCompanions = $("tabCompanions");
  const tabUpgrades = $("tabUpgrades");

  const questsBtn = $("questsBtn");
  const questsBadge = $("questsBadge");
  const questsModal = $("questsModal");
  const questsBalanceCount = $("questsBalanceCount");
  const questToast = $("questToast");
  const questsList = $("questsList");
  const closeQuestsBtn = $("closeQuestsBtn");

  const milestonesPreview = $("milestonesPreview");

  const instructions = $("instructions");
  const modeHintText = $("modeHintText");
  const scoreDisplay = $("score");
  const highScoreDisplay = $("highScore");
  const feathersDisplay = $("feathersCount");
  const scorePill = $("scorePill");
  const feathersPill = $("feathersPill");
  const activeEffectsBar = $("activeEffectsBar");
  const gustBtn = $("gustBtn");

  const gameOverPopup = $("gameOver");
  const finalScoreDisplay = $("finalScore");
  const statBestStreak = $("statBestStreak");
  const statModeBest = $("statModeBest");
  const statPlumeBank = $("statPlumeBank");
  const resultMessageDisplay = $("resultMessage");
  const unlockedMilestoneBanner = $("unlockedMilestoneBanner");
  const newBestBadge = $("newBestBadge");
  const restartBtn = $("restartBtn");
  const shareScoreBtn = $("shareScoreBtn");
  const shareScoreText = $("shareScoreText");
  const chooseModeBtn = $("chooseModeBtn");

  const pauseBtn = $("pauseBtn");
  const pauseText = $("pauseText");
  const pauseIcon = $("pauseIcon");

  const soundBtn = $("soundBtn");
  const soundIcon = $("soundIcon");
  const soundText = $("soundText");

  // ==========================================================
  // 2. CONFIGURATION, SKINS, SPIRITS, BLESSINGS & QUESTS
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
      plumeChance: 0.68,
      plumeBonus: 2,
      magnetRadius: 68,
      windChance: 0.45,
      windLift: -0.055,
      powerupChance: 0.22
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
      plumeChance: 0.74,
      plumeBonus: 2,
      magnetRadius: 78,
      movingStartScore: 3,
      movingChanceBase: 0.28,
      movingChanceMax: 0.72,
      powerupChance: 0.26
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
      cost: 15,
      swatch: "linear-gradient(135deg, #ffd6ec, #b99cff)",
      feather: "#ffe4f3",
      body: "#c792ea",
      trail: "238, 178, 255"
    },
    {
      id: "jade_breeze",
      name: "Jade Breeze",
      subtitle: "Emerald-mint wings inspired by high mountain pines",
      cost: 30,
      swatch: "linear-gradient(135deg, #b8ffe4, #4fd1b5)",
      feather: "#d8fff0",
      body: "#48c9b0",
      trail: "120, 245, 210"
    },
    {
      id: "solar_phoenix",
      name: "Solar Phoenix",
      subtitle: "Radiant ember-gold wings with warm sparks",
      cost: 55,
      swatch: "linear-gradient(135deg, #fff1b8, #ff7b54)",
      feather: "#fff0b3",
      body: "#ff8c42",
      trail: "255, 166, 94"
    },
    {
      id: "midnight_owl",
      name: "Midnight Owl",
      subtitle: "Deep indigo feathers edged with silver starlight",
      cost: 85,
      swatch: "linear-gradient(135deg, #c9d6ff, #4b5d9e)",
      feather: "#e2e9ff",
      body: "#5c73b8",
      trail: "176, 198, 255"
    },
    {
      id: "aurora_swan",
      name: "Aurora Swan",
      subtitle: "Prismatic polar teal & rose sky shimmer",
      cost: 120,
      swatch: "linear-gradient(135deg, #9efcff, #ff9ce3)",
      feather: "#e8ffff",
      body: "#6be8df",
      trail: "158, 252, 255"
    },
    {
      id: "celestial_seraph",
      name: "Celestial Seraph",
      subtitle: "Pure ivory-gold halo plumage for seasoned flyers",
      cost: 180,
      swatch: "linear-gradient(135deg, #ffffff, #f3d58a)",
      feather: "#fffdf5",
      body: "#f3d58a",
      trail: "255, 244, 200"
    },
    {
      id: "astral_nebula",
      name: "Astral Nebula",
      subtitle: "Cosmic violet & cyan starlight woven into every feather",
      cost: 260,
      swatch: "linear-gradient(135deg, #35eaff, #a855f7)",
      feather: "#e0faff",
      body: "#9b6dff",
      trail: "140, 239, 255"
    }
  ];

  const SPIRIT_COMPANIONS = [
    {
      id: "none",
      name: "Solo Flight",
      subtitle: "Fly unescorted through the open sky",
      cost: 0,
      icon: "✧",
      color: "#ffffff",
      glow: "rgba(255,255,255,0)"
    },
    {
      id: "wisp_firefly",
      name: "Wisp Firefly",
      subtitle: "Warm lantern spirit · +1 extra point per plume",
      cost: 45,
      icon: "✨",
      color: "#ffe8ae",
      glow: "rgba(255, 232, 174, 0.55)"
    },
    {
      id: "cloud_puff",
      name: "Cloud Puff",
      subtitle: "Cushions downward falls while gliding (+glide lift)",
      cost: 110,
      icon: "☁",
      color: "#d9f1ff",
      glow: "rgba(184, 230, 255, 0.55)"
    },
    {
      id: "star_owl",
      name: "Starlight Owl",
      subtitle: "Guides your path · +20% Power-Up Orb duration",
      cost: 200,
      icon: "🦉",
      color: "#d1a6ff",
      glow: "rgba(209, 166, 255, 0.6)"
    },
    {
      id: "phoenix_ember",
      name: "Solar Phoenix Spirit",
      subtitle: "Legendary guardian · +1 extra Plume per Golden Lotus",
      cost: 350,
      icon: "🔥",
      color: "#ff9a62",
      glow: "rgba(255, 154, 98, 0.65)"
    }
  ];

  const BLESSING_UPGRADES = [
    {
      id: "magnet_reach",
      name: "Zephyr Pull",
      icon: "🧲",
      maxLevel: 4,
      costs: [20, 45, 80, 130],
      desc: (lvl) => `Passive plume attraction radius (+${lvl * 22}px)`
    },
    {
      id: "aegis_start",
      name: "Aegis Blessing",
      icon: "🫧",
      maxLevel: 3,
      costs: [35, 75, 140],
      desc: (lvl) =>
        lvl === 0
          ? "Start flights with a protective wind bubble"
          : lvl === 1
          ? "Start every flight with 1 Shield Bubble"
          : lvl === 2
          ? "Start with 1 Shield + longer orb duration (+35%)"
          : "Start with 1 Shield + orb duration (+60%)"
    },
    {
      id: "gust_mastery",
      name: "Quickened Gust",
      icon: "༄",
      maxLevel: 3,
      costs: [30, 65, 120],
      desc: (lvl) =>
        lvl === 0
          ? "Reduce plumes needed to charge Gust Dash"
          : lvl === 1
          ? "Charge Gust in 2 plumes instead of 3"
          : lvl === 2
          ? "Charge Gust in 2 plumes + 25% longer dash"
          : "Charge Gust in 2 plumes + 50% longer dash"
    },
    {
      id: "plume_alchemy",
      name: "Plume Alchemy",
      icon: "🪷",
      maxLevel: 4,
      costs: [25, 55, 95, 150],
      desc: (lvl) => `Increases Golden Lotus spawn chance (+${lvl * 6}%)`
    }
  ];

  const MILESTONES = [
    { id: "first_ten", label: "Skybound (10 pts)" },
    { id: "plume_five", label: "Plume Gatherer (5 plumes)" },
    { id: "streak_three", label: "Triple Harmony (3× streak)" },
    { id: "twenty_five", label: "Twilight Voyager (25 pts)" },
    { id: "gust_user", label: "Windrunner (Used Gust)" },
    { id: "lotus_finder", label: "Lotus Seeker (Golden Lotus)" }
  ];

  const DAILY_QUEST_TEMPLATES = [
    { id: "q_plumes_10", title: "Plume Collector", desc: "Gather 10 plumes today", target: 10, reward: 12, metric: "plumes" },
    { id: "q_score_25", title: "High Altitude", desc: "Score 25 total points across flights", target: 25, reward: 12, metric: "points" },
    { id: "q_streak_3", title: "Harmonic Rhythm", desc: "Reach a 3× plume streak in a run", target: 1, reward: 15, metric: "streak3" },
    { id: "q_gust_2", title: "Ride the Gale", desc: "Activate Feather Gust 2 times", target: 2, reward: 15, metric: "gusts" },
    { id: "q_orbs_3", title: "Sky Seeker", desc: "Collect 3 Power-Up Orbs", target: 3, reward: 14, metric: "orbs" },
    { id: "q_arcade_15", title: "Storm Dancer", desc: "Reach 15 points in a single Arcade flight", target: 15, reward: 18, metric: "arcadeBestRun" }
  ];

  const PENTATONIC_FREQS = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5];
  const FRAME_MS = 1000 / 60;

  // ==========================================================
  // 3. GAME STATE & STORAGE
  // ==========================================================

  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = 1;

  let mode = null; // "A" (Calm) or "B" (Arcade)
  let phase = "menu"; // "menu" | "ready" | "playing" | "countdown" | "paused" | "gameover"
  let isNewBest = false;

  let score = 0;
  let highScore = 0;
  let plumesCollected = 0;
  let plumeBank = loadNumber("featherPlumeBank", 0);
  let unlockedSkins = loadJson("featherUnlockedSkins", ["default"]);
  let equippedSkinId = loadString("featherEquippedSkin", "default");
  let unlockedCompanions = loadJson("featherUnlockedCompanions", ["none"]);
  let equippedCompanionId = loadString("featherEquippedCompanion", "none");
  let earnedMilestones = loadJson("featherMilestones", []);
  let upgradeLevels = loadJson("featherUpgrades", {
    magnet_reach: 0,
    aegis_start: 0,
    gust_mastery: 0,
    plume_alchemy: 0
  });
  let dailyState = loadDailyQuests();

  let plumeStreak = 0;
  let bestRunStreak = 0;
  let lastMilestoneScore = 0;
  let chimeStep = 0;

  // Active buffs, glide & biomes
  let hasShield = false;
  let magnetTimer = 0;
  let gustCharge = 0;
  let gustActiveTimer = 0;
  let resumeCountdown = 0;
  let isHoldingGlide = false;
  let activeBiome = "night"; // "night" | "starfall" | "firefly" | "dawn"

  let pointerDownX = 0;
  let pointerDownY = 0;
  let pointerStartTime = 0;

  let frame = 0;
  let lastTime = 0;
  let animationId = null;
  let lastInputTime = 0;
  let pauseChangedAt = 0;
  let toastTimeout = null;
  let questToastTimeout = null;

  let obstacles = [];
  let plumes = [];
  let powerups = [];
  let windCurrents = [];
  let shootingStars = [];
  let biomeFireflies = [];
  let floatingTexts = [];
  let particles = [];
  let trailPoints = [];
  let stars = [];
  let clouds = [];

  let shake = 0;
  let flash = 0;
  let flashColor = "#ffffff";

  let bird = {
    x: 0,
    y: 0,
    width: 32,
    height: 24,
    velocity: 0,
    rotation: 0,
    wingAngle: 0
  };

  let companionPos = { x: 0, y: 0 };

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function loadNumber(key, fallback) {
    try {
      const val = Number(localStorage.getItem(key));
      return Number.isFinite(val) && val >= 0 ? val : fallback;
    } catch {
      return fallback;
    }
  }

  function loadString(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore
    }
  }

  function savePlumeBank() {
    try {
      localStorage.setItem("featherPlumeBank", String(plumeBank));
    } catch {
      // Ignore
    }
  }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  function loadDailyQuests() {
    const today = todayKey();
    const saved = loadJson("featherDailyQuests", null);
    if (saved && saved.date === today && Array.isArray(saved.quests)) {
      return saved;
    }

    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash * 31 + today.charCodeAt(i)) | 0;
    }
    const startIdx = Math.abs(hash) % DAILY_QUEST_TEMPLATES.length;
    const picked = [];
    for (let i = 0; i < 3; i++) {
      const tpl = DAILY_QUEST_TEMPLATES[(startIdx + i * 2) % DAILY_QUEST_TEMPLATES.length];
      picked.push({ ...tpl, progress: 0, claimed: false });
    }

    const fresh = { date: today, quests: picked };
    saveJson("featherDailyQuests", fresh);
    return fresh;
  }

  function advanceQuestMetric(metric, amount = 1, isSetMax = false) {
    let changed = false;
    dailyState.quests.forEach((q) => {
      if (q.metric !== metric || q.claimed) return;
      const next = isSetMax ? Math.max(q.progress, amount) : q.progress + amount;
      const clamped = Math.min(q.target, next);
      if (clamped !== q.progress) {
        q.progress = clamped;
        changed = true;
      }
    });

    if (changed) {
      saveJson("featherDailyQuests", dailyState);
      updateNavBadges();
    }
  }

  function hasAffordableSanctuaryUnlock() {
    const canUnlockSkin = FEATHER_SKINS.some(
      (s) => !unlockedSkins.includes(s.id) && plumeBank >= s.cost
    );
    const canUnlockComp = SPIRIT_COMPANIONS.some(
      (c) => !unlockedCompanions.includes(c.id) && plumeBank >= c.cost
    );
    const canBless = BLESSING_UPGRADES.some((u) => {
      const lvl = upgradeLevels[u.id] || 0;
      return lvl < u.maxLevel && plumeBank >= u.costs[lvl];
    });
    return canUnlockSkin || canUnlockComp || canBless;
  }

  function updateNavBadges() {
    if (questsBadge) {
      const hasClaimable = dailyState.quests.some((q) => q.progress >= q.target && !q.claimed);
      questsBadge.classList.toggle("hidden", !hasClaimable);
    }
    if (sanctuaryBadge) {
      sanctuaryBadge.classList.toggle("hidden", !hasAffordableSanctuaryUnlock());
    }
  }

  function getGustChargeNeeded() {
    return (upgradeLevels.gust_mastery || 0) >= 1 ? 2 : 3;
  }

  function getActiveSkinMeta() {
    return FEATHER_SKINS.find((s) => s.id === equippedSkinId) || FEATHER_SKINS[0];
  }

  function getActiveSkin() {
    const found = getActiveSkinMeta();
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

  function getActiveCompanion() {
    return SPIRIT_COMPANIONS.find((c) => c.id === equippedCompanionId) || SPIRIT_COMPANIONS[0];
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
      // Ignore
    }
  }

  function ensureAudioContext() {
    if (!soundEnabled) return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
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

    const freqs = [196.0, 293.66, 392.0];
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
      masterGain.gain.setValueAtTime(0.02, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      oscs.forEach((o) => {
        try {
          o.stop(now + 0.4);
        } catch {
          // Ignore
        }
      });
    } catch {
      // Ignore
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
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
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

  function sfxGustDash() {
    playTone({ freq: 320, endFreq: 980, duration: 0.28, type: "sine", gainPeak: 0.07 });
    playTone({ freq: 640, endFreq: 1280, duration: 0.25, type: "triangle", gainPeak: 0.05, delay: 0.05 });
  }

  function sfxPowerup() {
    playTone({ freq: 523.25, duration: 0.11, type: "sine", gainPeak: 0.06 });
    playTone({ freq: 783.99, duration: 0.14, type: "sine", gainPeak: 0.055, delay: 0.06 });
    playTone({ freq: 1046.5, duration: 0.2, type: "sine", gainPeak: 0.05, delay: 0.12 });
  }

  function sfxShieldBreak() {
    playTone({ freq: 480, endFreq: 180, duration: 0.24, type: "triangle", gainPeak: 0.075 });
  }

  function sfxMilestoneChime() {
    playTone({ freq: 523.25, duration: 0.2, type: "sine", gainPeak: 0.05 });
    playTone({ freq: 659.25, duration: 0.22, type: "sine", gainPeak: 0.045, delay: 0.08 });
    playTone({ freq: 783.99, duration: 0.28, type: "sine", gainPeak: 0.045, delay: 0.16 });
  }

  function sfxPlume(isGolden = false) {
    const f1 = PENTATONIC_FREQS[chimeStep % PENTATONIC_FREQS.length];
    const f2 = PENTATONIC_FREQS[(chimeStep + 2) % PENTATONIC_FREQS.length];
    chimeStep += 1;

    playTone({ freq: f1, duration: 0.14, type: "sine", gainPeak: 0.055 });
    playTone({ freq: f2, duration: 0.18, type: "sine", gainPeak: 0.05, delay: 0.055 });
    if (isGolden) {
      playTone({ freq: f2 * 1.5, duration: 0.24, type: "triangle", gainPeak: 0.055, delay: 0.11 });
    }
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
      // Ignore
    }
  }

  function updateSoundUI() {
    if (soundBtn) {
      soundBtn.setAttribute("aria-pressed", String(soundEnabled));
      soundBtn.classList.toggle("is-muted", !soundEnabled);
    }
    if (soundIcon) soundIcon.textContent = soundEnabled ? "♪" : "✕";
    if (soundText) soundText.textContent = soundEnabled ? "Sound On" : "Muted";
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    saveSoundPreference();
    updateSoundUI();
    if (soundEnabled) {
      ensureAudioContext();
      sfxPlume(false);
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
    return `rgb(${Math.round(lerp(c1.r, c2.r, t))}, ${Math.round(lerp(c1.g, c2.g, t))}, ${Math.round(lerp(c1.b, c2.b, t))})`;
  }

  function currentConfig() {
    return mode === "A" ? CONFIG.calm : CONFIG.arcade;
  }

  function storageKey() {
    return mode === "A" ? "featherHighScoreA" : "featherHighScoreB";
  }

  function saveHighScore() {
    if (!mode) return;
    if (score > highScore) {
      highScore = score;
      isNewBest = true;
      try {
        localStorage.setItem(storageKey(), String(highScore));
      } catch {
        // Ignore
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

  function unlockMilestone(id, newlyUnlockedList = null) {
    if (earnedMilestones.includes(id)) return;
    earnedMilestones.push(id);
    saveJson("featherMilestones", earnedMilestones);
    renderMilestonesStrip();
    const meta = MILESTONES.find((m) => m.id === id);
    if (meta && newlyUnlockedList) newlyUnlockedList.push(meta.label);
  }

  function evaluateMilestones(newlyUnlockedList) {
    if (score >= 10) unlockMilestone("first_ten", newlyUnlockedList);
    if (plumesCollected >= 5) unlockMilestone("plume_five", newlyUnlockedList);
    if (bestRunStreak >= 3) unlockMilestone("streak_three", newlyUnlockedList);
    if (score >= 25) unlockMilestone("twenty_five", newlyUnlockedList);
  }

  function triggerBump(el) {
    if (!el) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }

  function updateEffectsHUD() {
    if (!activeEffectsBar) return;
    activeEffectsBar.innerHTML = "";

    if (phase === "playing" || phase === "paused" || phase === "countdown") {
      if (hasShield) {
        const b = document.createElement("span");
        b.className = "effect-badge shield";
        b.textContent = "🫧 Aegis Shield";
        activeEffectsBar.appendChild(b);
      }
      if (magnetTimer > 0) {
        const secs = Math.ceil(magnetTimer / 60);
        const b = document.createElement("span");
        b.className = "effect-badge magnet";
        b.textContent = `🧲 Magnet ${secs}s`;
        activeEffectsBar.appendChild(b);
      }
      if (gustActiveTimer > 0) {
        const b = document.createElement("span");
        b.className = "effect-badge gust";
        b.textContent = "༄ Tailwind Dash";
        activeEffectsBar.appendChild(b);
      }
      if (activeBiome !== "night") {
        const names = {
          starfall: "☄ Starfall Sky",
          firefly: "✨ Firefly Glade",
          dawn: "🌸 Dawn Lotus Mist"
        };
        const b = document.createElement("span");
        b.className = "effect-badge biome";
        b.textContent = names[activeBiome] || "";
        activeEffectsBar.appendChild(b);
      }
    }

    const needed = getGustChargeNeeded();
    const gustReady =
      (phase === "playing" || phase === "ready") &&
      gustCharge >= needed &&
      gustActiveTimer <= 0;

    if (gustBtn) {
      gustBtn.classList.toggle("hidden", !gustReady);
    }
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
    updateNavBadges();
    updateEffectsHUD();
  }

  // ==========================================================
  // 6. SANCTUARY (SKINS, SPIRITS, BLESSINGS) & DAILY QUESTS
  // ==========================================================

  function showSanctuaryToast(message) {
    if (!sanctuaryToast) return;
    sanctuaryToast.textContent = message;
    sanctuaryToast.classList.remove("hidden");
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      sanctuaryToast?.classList.add("hidden");
    }, 2400);
  }

  function showQuestToast(message) {
    if (!questToast) return;
    questToast.textContent = message;
    questToast.classList.remove("hidden");
    if (questToastTimeout) clearTimeout(questToastTimeout);
    questToastTimeout = setTimeout(() => {
      questToast?.classList.add("hidden");
    }, 2400);
  }

  function updateShowcaseBanner() {
    const skinMeta = getActiveSkinMeta();
    const comp = getActiveCompanion();
    const skinColors = getActiveSkin();

    if (showcaseFeatherOrb) {
      showcaseFeatherOrb.style.background =
        skinMeta.swatch || `linear-gradient(135deg, ${skinColors.feather}, ${skinColors.body})`;
      showcaseFeatherOrb.style.boxShadow = `0 0 18px rgba(${skinColors.trail}, 0.55)`;
    }
    if (showcaseSpiritBadge) {
      showcaseSpiritBadge.textContent = comp.icon;
    }
    if (showcaseTitle) {
      showcaseTitle.textContent = `${skinMeta.name} · ${comp.name}`;
    }
    if (showcasePerkText) {
      showcasePerkText.textContent =
        comp.id === "none"
          ? skinMeta.subtitle
          : comp.subtitle;
    }
    if (unlockedCollectionCount) {
      const totalItems = FEATHER_SKINS.length + SPIRIT_COMPANIONS.length;
      const totalUnlocked = unlockedSkins.length + unlockedCompanions.length;
      unlockedCollectionCount.textContent = `${totalUnlocked}/${totalItems} unlocked`;
    }
  }

  function refreshAllSanctuaryLists() {
    if (wardrobeBalanceCount) {
      wardrobeBalanceCount.textContent = String(plumeBank);
    }
    updateShowcaseBanner();
    renderWardrobe();
    renderCompanions();
    renderUpgrades();
    updateNavBadges();
  }

  function renderWardrobe() {
    if (!wardrobeList) return;
    wardrobeList.innerHTML = "";

    FEATHER_SKINS.forEach((skin) => {
      const unlocked = unlockedSkins.includes(skin.id);
      const equipped = equippedSkinId === skin.id;
      const canAfford = plumeBank >= skin.cost;

      const item = document.createElement("div");
      item.className = `skin-item${equipped ? " is-equipped" : ""}${
        !unlocked && canAfford ? " can-unlock" : ""
      }`;

      const preview = document.createElement("div");
      preview.className = "skin-preview";

      const swatch = document.createElement("span");
      swatch.className = "skin-swatch";
      swatch.style.background =
        skin.swatch || `linear-gradient(135deg, ${skin.feather}, ${skin.body})`;

      const info = document.createElement("div");
      info.className = "skin-info";

      const titleRow = document.createElement("div");
      titleRow.className = "skin-title-row";

      const title = document.createElement("strong");
      title.textContent = skin.name;
      titleRow.appendChild(title);

      if (!unlocked) {
        const tag = document.createElement("span");
        tag.className = `item-tag ${canAfford ? "ready" : "locked"}`;
        tag.textContent = canAfford ? "Ready to Unlock" : `Need ${skin.cost - plumeBank} more`;
        titleRow.appendChild(tag);
      }

      const sub = document.createElement("small");
      sub.textContent = skin.subtitle;

      info.appendChild(titleRow);
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
          saveJson("featherEquippedSkin", equippedSkinId);
          addParticles(bird.x, bird.y, 14, skin.feather || "#ffe8ae");
          showSanctuaryToast(`Equipped ${skin.name} feather.`);
          refreshAllSanctuaryLists();
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
          saveJson("featherUnlockedSkins", unlockedSkins);
          saveJson("featherEquippedSkin", equippedSkinId);
          updateScoreUI(false, true);
          sfxUnlock();
          addParticles(bird.x, bird.y, 26, skin.feather || "#ffe8ae");
          showSanctuaryToast(`✦ Unlocked & equipped ${skin.name}!`);
          refreshAllSanctuaryLists();
        });
      }

      item.appendChild(preview);
      item.appendChild(btn);
      wardrobeList.appendChild(item);
    });
  }

  function renderCompanions() {
    if (!companionsList) return;
    companionsList.innerHTML = "";

    SPIRIT_COMPANIONS.forEach((comp) => {
      const unlocked = unlockedCompanions.includes(comp.id);
      const equipped = equippedCompanionId === comp.id;
      const canAfford = plumeBank >= comp.cost;

      const item = document.createElement("div");
      item.className = `skin-item${equipped ? " is-equipped" : ""}${
        !unlocked && canAfford ? " can-unlock" : ""
      }`;

      const preview = document.createElement("div");
      preview.className = "skin-preview";

      const swatch = document.createElement("span");
      swatch.className = "skin-swatch";
      swatch.style.background = "rgba(255, 255, 255, 0.08)";
      swatch.textContent = comp.icon;

      const info = document.createElement("div");
      info.className = "skin-info";

      const titleRow = document.createElement("div");
      titleRow.className = "skin-title-row";

      const title = document.createElement("strong");
      title.textContent = comp.name;
      titleRow.appendChild(title);

      if (!unlocked) {
        const tag = document.createElement("span");
        tag.className = `item-tag ${canAfford ? "ready" : "locked"}`;
        tag.textContent = canAfford ? "Ready to Awaken" : `Need ${comp.cost - plumeBank} more`;
        titleRow.appendChild(tag);
      }

      const sub = document.createElement("small");
      sub.textContent = comp.subtitle;

      info.appendChild(titleRow);
      info.appendChild(sub);
      preview.appendChild(swatch);
      preview.appendChild(info);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "skin-action-btn";

      if (equipped) {
        btn.textContent = "With You";
        btn.classList.add("equipped");
        btn.disabled = true;
      } else if (unlocked) {
        btn.textContent = "Summon";
        btn.addEventListener("click", () => {
          equippedCompanionId = comp.id;
          saveJson("featherEquippedCompanion", equippedCompanionId);
          addParticles(companionPos.x, companionPos.y, 16, comp.color);
          showSanctuaryToast(`${comp.icon} ${comp.name} is flying beside you.`);
          refreshAllSanctuaryLists();
        });
      } else {
        btn.textContent = `Awaken · ${comp.cost}`;
        btn.disabled = !canAfford;
        btn.addEventListener("click", () => {
          if (plumeBank < comp.cost || unlockedCompanions.includes(comp.id)) return;
          plumeBank -= comp.cost;
          unlockedCompanions.push(comp.id);
          equippedCompanionId = comp.id;
          savePlumeBank();
          saveJson("featherUnlockedCompanions", unlockedCompanions);
          saveJson("featherEquippedCompanion", equippedCompanionId);
          updateScoreUI(false, true);
          sfxUnlock();
          addParticles(companionPos.x, companionPos.y, 28, comp.color);
          showSanctuaryToast(`✦ Awakened ${comp.name}!`);
          refreshAllSanctuaryLists();
        });
      }

      item.appendChild(preview);
      item.appendChild(btn);
      companionsList.appendChild(item);
    });
  }

  function renderUpgrades() {
    if (!upgradesList) return;
    upgradesList.innerHTML = "";

    BLESSING_UPGRADES.forEach((upg) => {
      const level = upgradeLevels[upg.id] || 0;
      const maxed = level >= upg.maxLevel;
      const cost = maxed ? 0 : upg.costs[level];
      const canAfford = plumeBank >= cost;

      const item = document.createElement("div");
      item.className = `skin-item${maxed ? " is-equipped" : ""}${
        !maxed && canAfford ? " can-unlock" : ""
      }`;

      const preview = document.createElement("div");
      preview.className = "skin-preview";

      const swatch = document.createElement("span");
      swatch.className = "skin-swatch";
      swatch.style.background = "rgba(243, 213, 138, 0.14)";
      swatch.textContent = upg.icon;

      const info = document.createElement("div");
      info.className = "skin-info";

      const titleRow = document.createElement("div");
      titleRow.className = "skin-title-row";

      const title = document.createElement("strong");
      title.textContent = `${upg.name} (Lv ${level}/${upg.maxLevel})`;
      titleRow.appendChild(title);

      if (!maxed && canAfford) {
        const tag = document.createElement("span");
        tag.className = "item-tag ready";
        tag.textContent = "Blessing Ready";
        titleRow.appendChild(tag);
      }

      const sub = document.createElement("small");
      sub.textContent = upg.desc(level);

      info.appendChild(titleRow);
      info.appendChild(sub);
      preview.appendChild(swatch);
      preview.appendChild(info);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "skin-action-btn";

      if (maxed) {
        btn.textContent = "Mastered";
        btn.classList.add("equipped");
        btn.disabled = true;
      } else {
        btn.textContent = `Bless · ${cost}`;
        btn.disabled = !canAfford;
        btn.addEventListener("click", () => {
          if (plumeBank < cost || (upgradeLevels[upg.id] || 0) >= upg.maxLevel) return;
          plumeBank -= cost;
          upgradeLevels[upg.id] = (upgradeLevels[upg.id] || 0) + 1;
          savePlumeBank();
          saveJson("featherUpgrades", upgradeLevels);
          updateScoreUI(false, true);
          sfxUnlock();
          addParticles(bird.x, bird.y, 24, "#ffe8ae");
          showSanctuaryToast(`✦ ${upg.name} raised to Lv ${upgradeLevels[upg.id]}!`);
          refreshAllSanctuaryLists();
        });
      }

      item.appendChild(preview);
      item.appendChild(btn);
      upgradesList.appendChild(item);
    });
  }

  function renderQuests() {
    if (!questsList) return;
    if (questsBalanceCount) questsBalanceCount.textContent = String(plumeBank);
    questsList.innerHTML = "";

    dailyState.quests.forEach((q) => {
      const done = q.progress >= q.target;

      const item = document.createElement("div");
      item.className = `skin-item${q.claimed ? " is-equipped" : ""}`;

      const preview = document.createElement("div");
      preview.className = "skin-preview";

      const info = document.createElement("div");
      info.className = "skin-info";

      const title = document.createElement("strong");
      title.textContent = `${q.title} (+${q.reward} Plumes)`;

      const sub = document.createElement("small");
      sub.textContent = `${q.desc} (${q.progress}/${q.target})`;

      const bar = document.createElement("div");
      bar.className = "quest-progress-bar";
      const fill = document.createElement("div");
      fill.className = "quest-progress-fill";
      fill.style.width = `${Math.min(100, (q.progress / q.target) * 100)}%`;
      bar.appendChild(fill);

      info.appendChild(title);
      info.appendChild(sub);
      info.appendChild(bar);
      preview.appendChild(info);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "skin-action-btn";

      if (q.claimed) {
        btn.textContent = "Claimed";
        btn.classList.add("equipped");
        btn.disabled = true;
      } else if (done) {
        btn.textContent = `Claim +${q.reward}`;
        btn.classList.add("claim-ready");
        btn.addEventListener("click", () => {
          if (q.claimed || q.progress < q.target) return;
          q.claimed = true;
          plumeBank += q.reward;
          savePlumeBank();
          saveJson("featherDailyQuests", dailyState);
          updateScoreUI(false, true);
          updateNavBadges();
          sfxUnlock();
          showQuestToast(`✦ Claimed +${q.reward} Plumes from ${q.title}!`);
          renderQuests();
        });
      } else {
        btn.textContent = "In Flight";
        btn.disabled = true;
      }

      item.appendChild(preview);
      item.appendChild(btn);
      questsList.appendChild(item);
    });
  }

  function switchSanctuaryTab(tab) {
    tabSkins?.classList.toggle("active", tab === "skins");
    tabSkins?.setAttribute("aria-selected", String(tab === "skins"));

    tabCompanions?.classList.toggle("active", tab === "companions");
    tabCompanions?.setAttribute("aria-selected", String(tab === "companions"));

    tabUpgrades?.classList.toggle("active", tab === "upgrades");
    tabUpgrades?.setAttribute("aria-selected", String(tab === "upgrades"));

    wardrobeList?.classList.toggle("hidden", tab !== "skins");
    companionsList?.classList.toggle("hidden", tab !== "companions");
    upgradesList?.classList.toggle("hidden", tab !== "upgrades");
  }

  function openWardrobe() {
    if (!wardrobeModal) return;
    if (phase === "playing" || phase === "countdown") togglePause();
    sanctuaryToast?.classList.add("hidden");
    refreshAllSanctuaryLists();
    wardrobeModal.classList.remove("hidden");
  }

  function closeWardrobe() {
    wardrobeModal?.classList.add("hidden");
  }

  function openQuests() {
    if (!questsModal) return;
    if (phase === "playing" || phase === "countdown") togglePause();
    questToast?.classList.add("hidden");
    renderQuests();
    questsModal.classList.remove("hidden");
  }

  function closeQuests() {
    questsModal?.classList.add("hidden");
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
      companionPos.x = bird.x - 28;
      companionPos.y = bird.y - 12;
    } else {
      bird.x = clamp(bird.x, 40, width * 0.45);
      bird.y = clamp(bird.y, 20, height - 20);
    }

    createStars();
    createClouds();
    createBiomeFireflies();
  }

  window.addEventListener("resize", resizeCanvas);

  // ==========================================================
  // 8. LIVING CONSTELLATIONS, BIOMES & PARALLAX LANDSCAPE
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

  function createBiomeFireflies() {
    biomeFireflies = [];
    for (let i = 0; i < 24; i++) {
      biomeFireflies.push({
        x: random(0, width),
        y: random(height * 0.15, height * 0.88),
        vy: random(-0.45, -0.15),
        phase: random(0, Math.PI * 2),
        size: random(1.8, 3.6)
      });
    }
  }

  function spawnShootingStar() {
    shootingStars.push({
      x: random(width * 0.25, width * 0.95),
      y: random(height * 0.05, height * 0.34),
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
      if (s.life <= 0) shootingStars.splice(i, 1);
    }

    if (activeBiome === "starfall" && Math.random() < 0.045 * dt) {
      spawnShootingStar();
    }

    if (activeBiome === "firefly") {
      biomeFireflies.forEach((f) => {
        f.y += f.vy * dt;
        f.x += Math.sin(frame * 0.03 + f.phase) * 0.35 * dt;
        if (f.y < height * 0.1) {
          f.y = height * 0.9;
          f.x = random(0, width);
        }
      });
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

  function drawConstellations() {
    if (earnedMilestones.length === 0) return;

    const constellations = [
      [
        [0.14, 0.18],
        [0.19, 0.14],
        [0.25, 0.16],
        [0.22, 0.22],
        [0.16, 0.24]
      ],
      [
        [0.44, 0.13],
        [0.48, 0.17],
        [0.46, 0.23],
        [0.42, 0.23],
        [0.4, 0.17],
        [0.44, 0.13]
      ],
      [
        [0.62, 0.24],
        [0.66, 0.19],
        [0.7, 0.22],
        [0.74, 0.17],
        [0.77, 0.23]
      ]
    ];

    const unlockedSets = Math.min(constellations.length, Math.ceil(earnedMilestones.length / 2));
    ctx.save();
    for (let c = 0; c < unlockedSets; c++) {
      const pts = constellations[c];
      ctx.strokeStyle = "rgba(243, 213, 138, 0.22)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      pts.forEach(([nx, ny], idx) => {
        const px = nx * width;
        const py = ny * height;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      pts.forEach(([nx, ny]) => {
        ctx.fillStyle = "rgba(255, 240, 195, 0.65)";
        ctx.beginPath();
        ctx.arc(nx * width, ny * height, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();
  }

  function drawBackground() {
    const cfg = mode ? currentConfig() : CONFIG.calm;
    const progress = clamp(score / 25, 0, 1);

    let topColor =
      mode === "A"
        ? lerpColor(cfg.skyTop, "#17143b", progress)
        : lerpColor(cfg.skyTop, "#260d3b", progress);
    let bottomColor =
      mode === "A"
        ? lerpColor(cfg.skyBottom, "#385c7d", progress)
        : lerpColor(cfg.skyBottom, "#6b2b59", progress);

    if (activeBiome === "dawn") {
      topColor = "#241744";
      bottomColor = "#7a3b64";
    } else if (activeBiome === "firefly") {
      topColor = "#0d2233";
      bottomColor = "#1f4d57";
    }

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

    const moonGlow = ctx.createRadialGradient(moonX, moonY, 1, moonX, moonY, moonRadius * 3);
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

    drawConstellations();
    drawShootingStars();

    if (activeBiome === "firefly") {
      biomeFireflies.forEach((f) => {
        const pulse = 0.35 + Math.sin(frame * 0.08 + f.phase) * 0.35;
        ctx.save();
        ctx.fillStyle = `rgba(195, 255, 175, ${clamp(pulse, 0.1, 0.85)})`;
        ctx.shadowColor = "#b8ff9e";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    clouds.forEach(drawCloud);
    drawLandscape();
  }

  function drawCloud(cloud) {
    ctx.save();
    ctx.globalAlpha = cloud.alpha;
    ctx.fillStyle = "#dceaff";
    const { x, y, size: s } = cloud;

    ctx.beginPath();
    ctx.arc(x, y, s * 0.4, 0, Math.PI * 2);
    ctx.arc(x + s * 0.35, y - s * 0.2, s * 0.32, 0, Math.PI * 2);
    ctx.arc(x + s * 0.65, y, s * 0.4, 0, Math.PI * 2);
    ctx.arc(x + s * 0.3, y + s * 0.1, s * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawLandscape() {
    const farY = height * 0.87;
    ctx.fillStyle = "rgba(12, 22, 44, 0.18)";
    ctx.beginPath();
    ctx.moveTo(0, farY);
    for (let x = 0; x <= width + 80; x += 80) {
      const y = farY - 26 - Math.sin(x * 0.004 + frame * 0.0012) * 24;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    const groundY = height * 0.92;
    ctx.fillStyle = "rgba(8, 15, 30, 0.26)";
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= width + 60; x += 60) {
      const y = groundY - 18 - Math.sin(x * 0.008 + frame * 0.0025) * 18;
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
        const offset = (frame * 1.1 + i * 26 + wc.phase * 20) % wc.height;
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

      if (wc.x + wc.width < -60) windCurrents.splice(i, 1);
    }
  }

  // ==========================================================
  // 10. BIRD, SPIRIT COMPANION & GUST
  // ==========================================================

  function activateGustDash() {
    const needed = getGustChargeNeeded();
    if (phase !== "playing" || gustCharge < needed || gustActiveTimer > 0) return;

    const gustLvl = upgradeLevels.gust_mastery || 0;
    const durMult = gustLvl === 2 ? 1.25 : gustLvl >= 3 ? 1.5 : 1;

    gustCharge = 0;
    gustActiveTimer = Math.round(78 * durMult);
    bird.velocity = -1.2;

    sfxGustDash();
    triggerHaptic([15, 25, 25]);
    flash = 0.22;
    flashColor = "#ffe8ae";

    unlockMilestone("gust_user");
    advanceQuestMetric("gusts", 1);

    addParticles(bird.x, bird.y, 26, "#ffe8ae");
    addFloatingText(bird.x + 18, bird.y - 22, "༄ FEATHER GUST!", "#ffe8ae");
    updateEffectsHUD();
  }

  function updateCompanion(dt) {
    const comp = getActiveCompanion();
    if (comp.id === "none") return;

    const targetX = bird.x - 30;
    const targetY = bird.y - 14 + Math.sin(frame * 0.09) * 6;
    const followFactor = clamp(0.14 * dt, 0, 1);

    companionPos.x = lerp(companionPos.x, targetX, followFactor);
    companionPos.y = lerp(companionPos.y, targetY, followFactor);
  }

  function drawCompanion() {
    const comp = getActiveCompanion();
    if (comp.id === "none") return;

    ctx.save();
    ctx.translate(companionPos.x, companionPos.y);

    ctx.shadowColor = comp.color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = comp.glow;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = comp.color;
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function updateTrail(dt) {
    if (phase === "playing") {
      trailPoints.push({
        x: bird.x - 14,
        y: bird.y + 1,
        life: gustActiveTimer > 0 ? 24 : 16,
        maxLife: gustActiveTimer > 0 ? 24 : 16
      });
    }

    for (let i = trailPoints.length - 1; i >= 0; i--) {
      const pt = trailPoints[i];
      pt.x -= (mode ? currentObstacleSpeed(currentConfig()) : 2.2) * 0.65 * dt;
      pt.life -= dt;
      if (pt.life <= 0) trailPoints.splice(i, 1);
    }
  }

  function drawTrail() {
    if (trailPoints.length < 2) return;
    const skin = getActiveSkin();
    const trailRgb = gustActiveTimer > 0 ? "255, 232, 174" : skin.trail;

    for (let i = 1; i < trailPoints.length; i++) {
      const prev = trailPoints[i - 1];
      const curr = trailPoints[i];
      const alpha = clamp(curr.life / curr.maxLife, 0, 1) * (gustActiveTimer > 0 ? 0.55 : 0.3);

      ctx.save();
      ctx.strokeStyle = `rgba(${trailRgb}, ${alpha})`;
      ctx.lineWidth = Math.max(1.5, (curr.life / curr.maxLife) * (gustActiveTimer > 0 ? 10 : 6));
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
    drawCompanion();

    const skin = getActiveSkin();

    ctx.save();
    ctx.translate(bird.x, bird.y);

    if (hasShield) {
      ctx.save();
      const pulse = 25 + Math.sin(frame * 0.12) * 2;
      ctx.strokeStyle = "rgba(140, 239, 255, 0.78)";
      ctx.fillStyle = "rgba(140, 239, 255, 0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (isHoldingGlide && bird.velocity > 0 && phase === "playing") {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 4, 22, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    if (gustActiveTimer > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 232, 174, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(2, 0, 28, -0.9, 0.9);
      ctx.stroke();
      ctx.restore();
    }

    ctx.rotate(bird.rotation);

    ctx.shadowColor = gustActiveTimer > 0 ? "#ffe8ae" : skin.body;
    ctx.shadowBlur = gustActiveTimer > 0 ? 26 : mode === "A" ? 13 : 20;

    ctx.fillStyle = skin.feather;
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = skin.body;
    ctx.save();
    const wingSpread = isHoldingGlide && bird.velocity > 0 ? -0.25 : Math.sin(bird.wingAngle) * 0.38;
    ctx.rotate(wingSpread);
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
  // 11. OBSTACLES, PLUMES, GOLDEN LOTUSES & POWER-UP ORBS
  // ==========================================================

  function shouldSpawnMovingPillar() {
    if (mode !== "B") return false;
    const cfg = CONFIG.arcade;
    if (score < cfg.movingStartScore) return false;
    const progress = clamp((score - cfg.movingStartScore) / 18, 0, 1);
    return Math.random() < lerp(cfg.movingChanceBase, cfg.movingChanceMax, progress);
  }

  function spawnObstacle(extraOffsetX = 0) {
    const cfg = currentConfig();
    const isEarlyObstacle = obstacles.length < 2 && score < 2;

    const aspectScale = clamp(width / 900, 0.86, 1.08);
    const effectiveSpawnDist = cfg.spawnDistance * aspectScale;

    const baseGap = Math.max(cfg.minGap, cfg.gap - score * cfg.gapTightenPerPoint);
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
      shattered: false,
      moving: isMoving,
      moveRange,
      moveSpeed: isMoving ? random(0.024, 0.042) : 0,
      movePhase: random(0, Math.PI * 2)
    });

    const midX = spawnX + cfg.obstacleWidth * 0.5 + effectiveSpawnDist * 0.5;
    const gapCenter = clampedBaseTop + gap * 0.5;

    if (!isEarlyObstacle && Math.random() < cfg.powerupChance) {
      const types = ["shield", "magnet", "tailwind"];
      const type = types[Math.floor(Math.random() * types.length)];
      const orbY = clamp(gapCenter + random(-gap * 0.14, gap * 0.14), margin + 30, height - margin - 30);

      powerups.push({
        x: midX,
        baseY: orbY,
        y: orbY,
        radius: 14,
        type,
        phase: random(0, Math.PI * 2),
        collected: false
      });
    } else if (Math.random() < cfg.plumeChance) {
      const offsetY = random(-gap * 0.16, gap * 0.16);
      const baseY = clamp(gapCenter + offsetY, margin + 24, height - margin - 24);
      const lotusChance = 0.14 + (upgradeLevels.plume_alchemy || 0) * 0.06;
      const isGolden = !isEarlyObstacle && Math.random() < lotusChance;

      plumes.push({
        x: midX,
        baseY,
        y: baseY,
        radius: isGolden ? 15 : 12,
        phase: random(0, Math.PI * 2),
        collected: false,
        golden: isGolden
      });
    }

    if (mode === "A" && !isEarlyObstacle && Math.random() < cfg.windChance) {
      spawnWindCurrent(midX);
    }
  }

  function drawObstacle(obstacle) {
    if (obstacle.shattered) return;
    const bottomY = obstacle.top + obstacle.gap;
    const pipeWidth = obstacle.width;

    if (mode === "A") {
      drawPipe(obstacle.x, 0, pipeWidth, obstacle.top, "#78b3e0", "#b8e2ff", "#4874a6", true, true);
      drawPipe(obstacle.x, bottomY, pipeWidth, height - bottomY, "#78b3e0", "#b8e2ff", "#4874a6", false, true);
      return;
    }

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

    if (plume.golden) {
      ctx.shadowColor = "#ffd966";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "rgba(255, 217, 102, 0.35)";
      ctx.beginPath();
      ctx.arc(0, 0, plume.radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "17px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🪷", 0, 1);
      ctx.restore();
      return;
    }

    const glowColor = mode === "A" ? "rgba(155, 220, 255, 0.35)" : "rgba(255, 224, 130, 0.38)";
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

  function drawPowerup(orb) {
    if (orb.collected) return;
    ctx.save();
    ctx.translate(orb.x, orb.y);

    const styles = {
      shield: { ring: "#8cefff", fill: "rgba(140, 239, 255, 0.25)", symbol: "🫧" },
      magnet: { ring: "#d1a6ff", fill: "rgba(209, 166, 255, 0.25)", symbol: "🧲" },
      tailwind: { ring: "#ffe8ae", fill: "rgba(255, 232, 174, 0.28)", symbol: "༄" }
    };
    const st = styles[orb.type] || styles.shield;

    ctx.shadowColor = st.ring;
    ctx.shadowBlur = 16;

    ctx.fillStyle = st.fill;
    ctx.strokeStyle = st.ring;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, orb.radius + Math.sin(orb.phase) * 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(st.symbol, 0, 1);

    ctx.restore();
  }

  function obstacleCollision(obstacle) {
    if (obstacle.shattered) return false;
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
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 0.78 * dt;
      ft.life -= dt;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
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
  // 13. GAME START, HOLD-TO-GLIDE & SWIPE CONTROLS
  // ==========================================================

  function startGame(selectedMode) {
    closeWardrobe();
    closeQuests();
    mode = selectedMode;
    ensureAudioContext();

    score = 0;
    plumesCollected = 0;
    plumeStreak = 0;
    bestRunStreak = 0;
    lastMilestoneScore = 0;
    chimeStep = 0;
    highScore = loadNumber(storageKey(), 0);
    isNewBest = false;

    hasShield = (upgradeLevels.aegis_start || 0) >= 1;
    magnetTimer = 0;
    gustCharge = 0;
    gustActiveTimer = 0;
    resumeCountdown = 0;
    isHoldingGlide = false;
    activeBiome = "night";

    phase = "ready";

    obstacles = [];
    plumes = [];
    powerups = [];
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

    companionPos.x = bird.x - 30;
    companionPos.y = bird.y - 14;

    frame = 0;
    lastTime = 0;

    if (modeHintText) {
      const needed = getGustChargeNeeded();
      modeHintText.textContent =
        mode === "A"
          ? `Hold to glide gently · ${needed}× streak or Swipe → for Gust`
          : `Hold to glide · ${needed}× streak or Swipe → / Shift for Gust`;
    }

    if (modeSelector) modeSelector.style.display = "none";

    instructions?.classList.remove("hidden");
    newBestBadge?.classList.add("hidden");
    unlockedMilestoneBanner?.classList.add("hidden");

    gameOverPopup?.classList.remove("show");
    gameOverPopup?.classList.add("hidden");

    if (pauseBtn) pauseBtn.style.display = "inline-flex";
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
    addParticles(bird.x - 10, bird.y + 8, cfg.particleCount, skin.feather);
  }

  function handlePrimaryAction() {
    if (!wardrobeModal?.classList.contains("hidden")) return;
    if (!questsModal?.classList.contains("hidden")) return;

    if (phase === "ready") {
      phase = "playing";
      instructions?.classList.add("hidden");
      if (mode === "A") startCalmAmbientPad();
      flapBird();
      return;
    }

    if (phase === "playing") {
      flapBird();
    }
  }

  function handlePointerDown(e) {
    if (e.target !== canvas && e.target !== particlesCanvas) return;
    e.preventDefault();

    pointerDownX = e.clientX;
    pointerDownY = e.clientY;
    pointerStartTime = performance.now();
    isHoldingGlide = true;

    const now = performance.now();
    if (now - lastInputTime < 85) return;
    lastInputTime = now;

    if (phase === "paused") {
      if (now - pauseChangedAt > 220) togglePause();
      return;
    }

    handlePrimaryAction();
  }

  function handlePointerMove(e) {
    if (!isHoldingGlide || phase !== "playing") return;
    const dx = e.clientX - pointerDownX;
    const dy = Math.abs(e.clientY - pointerDownY);
    const elapsed = performance.now() - pointerStartTime;

    if (dx > 52 && dy < 45 && elapsed < 360) {
      isHoldingGlide = false;
      activateGustDash();
    }
  }

  function handlePointerUp() {
    isHoldingGlide = false;
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  particlesCanvas.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerUp);

  // ==========================================================
  // 14. GAME UPDATE (DELTA-TIME)
  // ==========================================================

  function currentObstacleSpeed(cfg) {
    const bonus = Math.min(score * cfg.speedScalePerPoint, cfg.maxSpeedBonus);
    const gustMult = gustActiveTimer > 0 ? 1.85 : 1;
    return (cfg.obstacleSpeed + bonus) * gustMult;
  }

  function checkMilestoneBiomes() {
    const fifteenBucket = Math.floor(score / 15) * 15;
    if (fifteenBucket >= 15 && fifteenBucket > lastMilestoneScore) {
      lastMilestoneScore = fifteenBucket;
      spawnShootingStar();
      spawnShootingStar();
      sfxMilestoneChime();

      const biomes = ["starfall", "firefly", "dawn"];
      activeBiome = biomes[(fifteenBucket / 15 - 1) % biomes.length];
      updateEffectsHUD();

      addFloatingText(bird.x + 24, bird.y - 24, `✦ ${fifteenBucket} Sky Shift`, "#ffe8ae");
    }
  }

  function handleImpact(obstacle = null) {
    if (gustActiveTimer > 0) {
      if (obstacle && !obstacle.shattered) {
        obstacle.shattered = true;
        addParticles(obstacle.x + obstacle.width * 0.5, bird.y, 24, "#ffe8ae");
      }
      return false;
    }

    if (hasShield) {
      hasShield = false;
      if (obstacle) obstacle.shattered = true;
      bird.y = clamp(bird.y, 45, height - 45);
      bird.velocity = -3.8;
      shake = 8;
      flash = 0.3;
      flashColor = "#8cefff";
      sfxShieldBreak();
      triggerHaptic([20, 30]);
      addParticles(bird.x, bird.y, 26, "#8cefff");
      addFloatingText(bird.x + 12, bird.y - 18, "🫧 Shield Saved!", "#8cefff");
      updateEffectsHUD();
      return false;
    }

    return true;
  }

  function updateBird(dt) {
    const cfg = currentConfig();

    if (gustActiveTimer > 0) {
      gustActiveTimer = Math.max(0, gustActiveTimer - dt);
      bird.velocity *= Math.pow(0.85, dt);
      if (gustActiveTimer === 0) updateEffectsHUD();
    } else {
      const glideFactor =
        isHoldingGlide && bird.velocity > 0
          ? equippedCompanionId === "cloud_puff"
            ? 0.42
            : 0.52
          : 1;
      bird.velocity += cfg.gravity * glideFactor * dt;
      const maxFall = isHoldingGlide ? cfg.maxVelocity * 0.58 : cfg.maxVelocity;
      bird.velocity = clamp(bird.velocity, -cfg.maxVelocity, maxFall);
    }

    bird.y += bird.velocity * dt;
    bird.rotation = clamp(bird.velocity * 0.055, -0.5, 1.15);
    bird.wingAngle += (gustActiveTimer > 0 ? 0.55 : 0.3) * dt;

    if (bird.y - bird.height * 0.4 < 0 || bird.y + bird.height * 0.4 > height) {
      if (handleImpact(null)) {
        endGame();
      }
    }
  }

  function updateObstaclesAndCollectibles(dt) {
    const cfg = currentConfig();
    const speed = currentObstacleSpeed(cfg);
    const skin = getActiveSkin();

    if (magnetTimer > 0) {
      magnetTimer = Math.max(0, magnetTimer - dt);
      if (Math.floor(magnetTimer) % 30 === 0) updateEffectsHUD();
    }

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
        advanceQuestMetric("points", 1);
        if (mode === "B") advanceQuestMetric("arcadeBestRun", score, true);
        updateScoreUI(true, false);
        sfxScore();
        checkMilestoneBiomes();
        addParticles(bird.x, bird.y, 8, skin.feather);
      }

      if (obstacleCollision(obstacle)) {
        if (handleImpact(obstacle)) {
          endGame();
          return;
        }
      }

      if (obstacle.x + obstacle.width < -40) obstacles.splice(i, 1);
    }

    const baseMagnet = cfg.magnetRadius + (upgradeLevels.magnet_reach || 0) * 22;
    const effectiveMagnetR = magnetTimer > 0 ? Math.max(240, baseMagnet * 2.4) : baseMagnet;

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

        if (distSq < effectiveMagnetR * effectiveMagnetR && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const pullStrength = magnetTimer > 0 ? 0.42 : 0.24;
          const pull = (1 - dist / effectiveMagnetR) * pullStrength * dt;
          plume.x += (dx / dist) * pull * 11;
          plume.baseY += (dy / dist) * pull * 11;
          plume.y += (dy / dist) * pull * 11;
        }

        const hitDist = plume.radius + 17;
        if (dx * dx + dy * dy <= hitDist * hitDist) {
          plume.collected = true;
          plumeStreak += 1;
          bestRunStreak = Math.max(bestRunStreak, plumeStreak);

          let plumeGain = plume.golden ? 3 : 1;
          if (plume.golden && equippedCompanionId === "phoenix_ember") {
            plumeGain += 1;
          }

          plumesCollected += plumeGain;
          plumeBank += plumeGain;
          savePlumeBank();

          const needed = getGustChargeNeeded();
          gustCharge = plume.golden ? needed : Math.min(needed, gustCharge + 1);

          advanceQuestMetric("plumes", plumeGain);
          if (plumeStreak >= 3) advanceQuestMetric("streak3", 1, true);
          if (plume.golden) unlockMilestone("lotus_finder");

          const streakBonus = plumeStreak >= 3 ? 1 : 0;
          const wispBonus = equippedCompanionId === "wisp_firefly" ? 1 : 0;
          const baseGain = plume.golden ? 5 : cfg.plumeBonus;
          const totalGain = baseGain + streakBonus + wispBonus;

          score += totalGain;
          saveHighScore();
          advanceQuestMetric("points", totalGain);
          if (mode === "B") advanceQuestMetric("arcadeBestRun", score, true);

          updateScoreUI(true, true);
          sfxPlume(plume.golden);
          triggerHaptic(plume.golden || plumeStreak >= 3 ? [10, 20, 12] : 10);
          checkMilestoneBiomes();

          addParticles(
            plume.x,
            plume.y,
            plume.golden ? 24 : 16,
            plume.golden ? "#ffd966" : mode === "A" ? "#9bdcff" : "#ffe28a"
          );

          const label = plume.golden
            ? `🪷 +${totalGain} pts · +${plumeGain} Plumes`
            : streakBonus > 0
            ? `+${totalGain} Streak ×${plumeStreak}`
            : `+${totalGain} Plume`;

          addFloatingText(
            plume.x,
            plume.y - 12,
            label,
            plume.golden ? "#ffd966" : mode === "A" ? "#bce7ff" : "#ffe8ae"
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

    for (let i = powerups.length - 1; i >= 0; i--) {
      const orb = powerups[i];
      orb.x -= speed * dt;
      orb.phase += 0.09 * dt;
      orb.y = orb.baseY + Math.sin(orb.phase) * 7;

      if (!orb.collected) {
        const dx = bird.x - orb.x;
        const dy = bird.y - orb.y;
        const hitDist = orb.radius + 18;

        if (dx * dx + dy * dy <= hitDist * hitDist) {
          orb.collected = true;
          sfxPowerup();
          triggerHaptic([12, 18]);
          advanceQuestMetric("orbs", 1);

          const aegisLvl = upgradeLevels.aegis_start || 0;
          let durMult = aegisLvl === 2 ? 1.35 : aegisLvl >= 3 ? 1.6 : 1;
          if (equippedCompanionId === "star_owl") durMult += 0.2;

          if (orb.type === "shield") {
            hasShield = true;
            addParticles(orb.x, orb.y, 20, "#8cefff");
            addFloatingText(orb.x, orb.y - 14, "🫧 Aegis Shield!", "#8cefff");
          } else if (orb.type === "magnet") {
            magnetTimer = Math.round(480 * durMult);
            addParticles(orb.x, orb.y, 20, "#d1a6ff");
            addFloatingText(orb.x, orb.y - 14, "🧲 Plume Magnet!", "#d1a6ff");
          } else if (orb.type === "tailwind") {
            gustActiveTimer = Math.round(84 * durMult);
            score += 2;
            saveHighScore();
            advanceQuestMetric("points", 2);
            addParticles(orb.x, orb.y, 22, "#ffe8ae");
            addFloatingText(orb.x, orb.y - 14, "༄ Tailwind +2!", "#ffe8ae");
          }

          updateScoreUI(true, false);
        }
      }

      if (orb.collected || orb.x < -40) powerups.splice(i, 1);
    }

    const aspectScale = clamp(width / 900, 0.86, 1.08);
    if (
      obstacles.length === 0 ||
      obstacles[obstacles.length - 1].x < width - cfg.spawnDistance * aspectScale
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
    if (phase === "countdown") {
      resumeCountdown -= (dt * FRAME_MS) / 1000;
      if (resumeCountdown <= 0) {
        resumeCountdown = 0;
        phase = "playing";
        if (mode === "A") startCalmAmbientPad();
      }
      return;
    }

    if (phase !== "playing") return;

    frame += dt;

    updateWindCurrents(dt);
    updateBird(dt);
    if (phase !== "playing") return;

    updateObstaclesAndCollectibles(dt);
    if (phase !== "playing") return;

    updateCompanion(dt);
    updateClouds(dt);
    updateShootingStars(dt);
    updateTrail(dt);
    updateParticles(dt);

    if (shake > 0) shake *= Math.pow(0.85, dt);
    if (flash > 0) flash *= Math.pow(0.9, dt);
  }

  // ==========================================================
  // 15. PAUSE, SHARE & GAME OVER
  // ==========================================================

  function togglePause() {
    if (phase !== "playing" && phase !== "paused" && phase !== "countdown") return;

    pauseChangedAt = performance.now();
    isHoldingGlide = false;

    if (phase === "playing" || phase === "countdown") {
      phase = "paused";
      stopCalmAmbientPad();
      if (pauseText) pauseText.textContent = "Resume";
      if (pauseIcon) pauseIcon.textContent = "▶";
    } else {
      phase = "countdown";
      resumeCountdown = 2.4;
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

  function drawCountdownOverlay() {
    ctx.save();
    ctx.fillStyle = "rgba(8,12,25,0.3)";
    ctx.fillRect(0, 0, width, height);

    const num = Math.max(1, Math.ceil(resumeCountdown));
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffe8ae";
    ctx.font = "bold 54px 'Playfair Display', Georgia, serif";
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 16;
    ctx.fillText(String(num), width / 2, height / 2);
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
    isHoldingGlide = false;
    plumeStreak = 0;
    gustCharge = 0;
    gustActiveTimer = 0;
    magnetTimer = 0;
    hasShield = false;
    stopCalmAmbientPad();

    saveHighScore();

    sfxCrash();
    triggerHaptic([25, 30, 25]);

    shake = 12;
    flash = 0.45;
    flashColor = "#ffffff";

    const newlyUnlocked = [];
    evaluateMilestones(newlyUnlocked);

    const skin = getActiveSkin();
    addParticles(bird.x, bird.y, 36, skin.feather);

    if (finalScoreDisplay) {
      finalScoreDisplay.textContent = `Score: ${score} · Plumes: ${plumesCollected}`;
    }
    if (statBestStreak) statBestStreak.textContent = `${bestRunStreak}×`;
    if (statModeBest) statModeBest.textContent = String(highScore);
    if (statPlumeBank) statPlumeBank.textContent = String(plumeBank);
    if (resultMessageDisplay) resultMessageDisplay.textContent = buildResultMessage();
    if (shareScoreText) shareScoreText.textContent = "Share flight record";

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
    gustBtn?.classList.add("hidden");

    if (pauseBtn) pauseBtn.style.display = "none";
    updateEffectsHUD();
  }

  async function shareFlightRecord() {
    const modeLabel = mode === "A" ? "Calm & Healing" : "Arcade";
    const text = `🪶 Flappy Feather (${modeLabel}) — Score: ${score} · Best: ${highScore} · Plumes: ${plumesCollected} ✨`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "Flappy Feather — Feathoria", text });
        return;
      }
    } catch {
      // Fallback to clipboard
    }

    try {
      await navigator.clipboard.writeText(text);
      if (shareScoreText) shareScoreText.textContent = "Copied to clipboard!";
    } catch {
      if (shareScoreText) shareScoreText.textContent = text;
    }
  }

  function returnToMenu() {
    phase = "menu";
    isNewBest = false;
    isHoldingGlide = false;
    activeBiome = "night";
    stopCalmAmbientPad();

    mode = null;
    score = 0;
    plumesCollected = 0;
    plumeStreak = 0;
    bestRunStreak = 0;
    gustCharge = 0;
    gustActiveTimer = 0;
    magnetTimer = 0;
    hasShield = false;

    obstacles = [];
    plumes = [];
    powerups = [];
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
    gustBtn?.classList.add("hidden");

    if (modeSelector) modeSelector.style.display = "flex";
    if (pauseBtn) pauseBtn.style.display = "none";
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

    if (
      phase === "playing" ||
      phase === "paused" ||
      phase === "countdown" ||
      phase === "gameover"
    ) {
      drawWindCurrents();
      plumes.forEach(drawPlume);
      powerups.forEach(drawPowerup);
      obstacles.forEach(drawObstacle);
      drawBird();
    } else if (phase === "ready") {
      drawWindCurrents();
      plumes.forEach(drawPlume);
      powerups.forEach(drawPowerup);
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
      ctx.fillStyle = flashColor;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    if (phase === "paused") {
      drawPauseOverlay();
    } else if (phase === "countdown") {
      drawCountdownOverlay();
    }
  }

  function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const rawDelta = Math.max(0, timestamp - lastTime);
    lastTime = timestamp;

    const dt = Math.min(rawDelta, 50) / FRAME_MS;

    if (phase === "playing" || phase === "countdown") {
      update(dt);
    } else if (phase !== "paused") {
      frame += dt;
      updateCompanion(dt);
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
    if (e.target === wardrobeModal) closeWardrobe();
  });

  tabSkins?.addEventListener("click", () => switchSanctuaryTab("skins"));
  tabCompanions?.addEventListener("click", () => switchSanctuaryTab("companions"));
  tabUpgrades?.addEventListener("click", () => switchSanctuaryTab("upgrades"));

  questsBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    openQuests();
  });

  closeQuestsBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeQuests();
  });

  questsModal?.addEventListener("click", (e) => {
    if (e.target === questsModal) closeQuests();
  });

  gustBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    activateGustDash();
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
  shareScoreBtn?.addEventListener("click", shareFlightRecord);
  chooseModeBtn?.addEventListener("click", returnToMenu);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && (phase === "playing" || phase === "countdown")) {
      togglePause();
    }
  });

  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (key === " " || key === "arrowup" || key === "w") {
      isHoldingGlide = true;
    }

    if (e.repeat) return;

    if (key === "escape") {
      if (!wardrobeModal?.classList.contains("hidden")) {
        e.preventDefault();
        closeWardrobe();
        return;
      }
      if (!questsModal?.classList.contains("hidden")) {
        e.preventDefault();
        closeQuests();
        return;
      }
    }

    const modalsClosed =
      wardrobeModal?.classList.contains("hidden") &&
      questsModal?.classList.contains("hidden");

    if (key === " " || key === "arrowup" || key === "w") {
      if ((phase === "ready" || phase === "playing") && modalsClosed) {
        e.preventDefault();
        handlePrimaryAction();
      }
    } else if ((key === "shift" || key === "e") && phase === "playing" && modalsClosed) {
      e.preventDefault();
      activateGustDash();
    } else if (key === "p" || key === "escape") {
      if (phase === "playing" || phase === "paused" || phase === "countdown") {
        e.preventDefault();
        togglePause();
      }
    } else if (key === "m") {
      e.preventDefault();
      toggleSound();
    } else if (key === "1" && phase === "menu" && modalsClosed) {
      e.preventDefault();
      startGame("A");
    } else if (key === "2" && phase === "menu" && modalsClosed) {
      e.preventDefault();
      startGame("B");
    } else if (key === "enter" && phase === "gameover" && modalsClosed) {
      e.preventDefault();
      restartGame();
    }
  });

  document.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    if (key === " " || key === "arrowup" || key === "w") {
      isHoldingGlide = false;
    }
  });

  // ==========================================================
  // 18. INITIALIZATION
  // ==========================================================

  resizeCanvas();
  updateSoundUI();
  refreshAllSanctuaryLists();
  renderQuests();
  updateNavBadges();
  renderMilestonesStrip();

  phase = "menu";
  mode = null;

  bird.x = width * 0.27;
  bird.y = height * 0.45;
  companionPos.x = bird.x - 30;
  companionPos.y = bird.y - 14;

  if (modeSelector) modeSelector.style.display = "flex";
  if (gameOverPopup) {
    gameOverPopup.classList.remove("show");
    gameOverPopup.classList.add("hidden");
  }
  if (pauseBtn) pauseBtn.style.display = "none";

  updateScoreUI();

  if (!animationId) {
    animationId = requestAnimationFrame(gameLoop);
  }
});