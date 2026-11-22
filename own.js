/* ============================================================================
   FEATHORIA STUDIO — ADVANCED DESIGN ENGINE v7.0
   • Live quote & poetry preview with rAF batching
   • Overflow & Auto-Fit Text Guard (live detection + one-click shrink-to-fit)
   • Custom Gradient Builder & Creator Brand Kit (Pro)
   • Typography, gradient foils, atmosphere overlays, framing & card borders
   • Undo/redo history, local saved designs & Pro JSON preset import/export
   • PNG/JPEG export across square, portrait, story & banner aspect ratios
   ============================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* ==========================================================================
     01. DOM REFERENCES
     ========================================================================== */

  const $ = id => document.getElementById(id);

  const elements = {
    quoteInput: $("quoteInput"),
    authorInput: $("authorInput"),
    quotePreview: $("quotePreview"),
    quoteBackground: $("quoteBackground"),
    atmosphereLayer: $("atmosphereLayer"),
    quoteOverlay: $("quoteOverlay"),
    quoteText: $("quoteText"),
    quoteAuthor: $("quoteAuthor"),

    overflowBanner: $("overflowBanner"),
    bannerAutoFitBtn: $("bannerAutoFitBtn"),
    autoFitTextBtn: $("autoFitTextBtn"),

    fontSelect: $("fontSelect"),
    fontSize: $("fontSize"),
    letterSpacing: $("letterSpacing"),
    lineHeight: $("lineHeight"),
    textAlign: $("textAlign"),
    textColor: $("textColor"),
    textFoilSelect: $("textFoilSelect"),
    authorSize: $("authorSize"),

    saveBrandKitBtn: $("saveBrandKitBtn"),
    applyBrandKitBtn: $("applyBrandKitBtn"),

    boldBtn: $("boldBtn"),
    italicBtn: $("italicBtn"),
    uppercaseBtn: $("uppercaseBtn"),

    useCustomGradientBtn: $("useCustomGradientBtn"),
    gradColor1: $("gradColor1"),
    gradColor2: $("gradColor2"),
    gradAngle: $("gradAngle"),

    bgUpload: $("bgUpload"),
    removeCustomBg: $("removeCustomBg"),
    backgroundZoom: $("backgroundZoom"),
    backgroundX: $("backgroundX"),
    backgroundY: $("backgroundY"),
    brightnessRange: $("brightnessRange"),
    blurRange: $("blurRange"),
    overlayRange: $("overlayRange"),

    shadowToggle: $("shadowToggle"),
    atmosphereSelect: $("atmosphereSelect"),
    quoteFrameSelect: $("quoteFrameSelect"),
    logoToggle: $("logoToggle"),
    watermark: $("watermark"),
    watermarkText: $("watermarkText"),
    watermarkOpacity: $("watermarkOpacity"),
    borderStyle: $("borderStyle"),
    borderRadius: $("borderRadius"),
    aspectSelect: $("aspectSelect"),

    downloadBtn: $("downloadBtn"),
    importJsonBtn: $("importJsonBtn"),
    exportJsonBtn: $("exportJsonBtn"),
    jsonUploadInput: $("jsonUploadInput"),
    exportFormat: $("exportFormat"),
    exportQuality: $("exportQuality"),
    downloadStatus: $("downloadStatus"),

    quoteCounter: $("quoteCounter"),
    authorCounter: $("authorCounter"),

    undoBtn: $("undoBtn"),
    redoBtn: $("redoBtn"),
    saveBtn: $("saveBtn"),
    savedDesignsBtn: $("savedDesignsBtn"),
    savedQuotaHint: $("savedQuotaHint"),

    resetBtn: $("resetBtn"),
    previewResetBtn: $("previewResetBtn"),
    randomBtn: $("randomBtn"),
    inspirationBtn: $("inspirationBtn"),
    inspirationText: $("inspirationText"),

    savedDialog: $("savedDialog"),
    savedDesignList: $("savedDesignList"),
    closeSavedBtn: $("closeSavedBtn"),
    closeSavedBottomBtn: $("closeSavedBottomBtn"),

    openProBtn: $("openProBtn"),
    proDialog: $("proDialog"),
    closeProBtn: $("closeProBtn"),
    closeProBottomBtn: $("closeProBottomBtn"),
    checkoutProBtn: $("checkoutProBtn"),
    licenseKeyInput: $("licenseKeyInput"),
    activateLicenseBtn: $("activateLicenseBtn"),
    proStatusText: $("proStatusText"),

    toast: $("toast"),
    formatLabel: $("formatLabel")
  };

  const required = ["quotePreview", "quoteBackground", "quoteOverlay", "quoteText", "quoteAuthor", "downloadBtn"];
  if (required.some(k => !elements[k])) {
    console.error("Feathoria Studio: Required DOM elements are missing.");
    return;
  }

  const { quoteInput, authorInput, quotePreview, quoteBackground, quoteOverlay, quoteText, quoteAuthor } = elements;

  /* ==========================================================================
     02. CONSTANTS & PAYMENT / PRO CONFIGURATION
     ========================================================================== */

  const STORAGE_KEY = "feathoria_studio_designs_v2";
  const PRO_STORAGE_KEY = "feathoria_pro_unlock_v1";
  const BRAND_KIT_STORAGE_KEY = "feathoria_brand_kit_v1";

  // Set your real checkout link (Stripe / Lemon Squeezy / etc.) when going live
  const PAYMENT_CHECKOUT_URL = "";

  // Optional backend endpoint for verifying license keys: POST { code } -> { valid: true }
  const LICENSE_VERIFY_ENDPOINT = "";

  const LOCAL_DEMO_CODES = new Set(["FEATHORIA-PRO-2026", "FEATHORIA-VIP"]);

  const FREE_SAVED_LIMIT = 5;
  const PRO_SAVED_LIMIT = 50;
  const FREE_ASPECTS = ["square", "portrait"];
  const FREE_TEMPLATES = new Set(["midnight", "minimal", "romantic", "poetry", "vintage"]);

  const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;
  const MAX_JSON_SIZE = 2 * 1024 * 1024;
  const MAX_IMAGE_DIMENSION = 1800;
  const MAX_HISTORY = 60;
  const HISTORY_DELAY = 300;

  const BACKGROUNDS = [
    "bg1", "bg2", "bg3", "bg4",
    "bg5", "bg6", "bg7", "bg8",
    "bg9", "bg10", "bg11", "bg12"
  ];
  const ASPECTS = ["square", "portrait", "story", "banner"];
  const FILTERS = ["none", "dreamy", "warm", "cool", "bw", "vintage"];
  const FOILS = ["none", "gold", "rose", "aurora"];
  const ATMOSPHERES = ["none", "vignette", "grain", "sparkle"];
  const FRAMES = ["none", "ornate", "rule", "corner"];
  const FONTS = [
    "Playfair Display",
    "Lora",
    "Cormorant Garamond",
    "Dancing Script",
    "Roboto",
    "Montserrat",
    "Libre Baskerville"
  ];

  const DEFAULTS = {
    quote: "",
    author: "",
    font: "Playfair Display",
    fontSize: 32,
    letterSpacing: 0,
    lineHeight: 1.6,
    textAlign: "center",
    textColor: "#ffffff",
    textFoil: "none",
    authorSize: 20,
    bold: false,
    italic: false,
    uppercase: false,
    background: "bg1",
    useCustomGradient: false,
    gradColor1: "#4c2c7a",
    gradColor2: "#d587a3",
    gradAngle: 135,
    customBackground: null,
    backgroundZoom: 100,
    backgroundX: 50,
    backgroundY: 50,
    brightness: 100,
    blur: 0,
    overlay: 20,
    filter: "none",
    shadow: false,
    atmosphere: "none",
    quoteFrame: "none",
    logo: true,
    watermarkText: "FEATHORIA",
    watermarkOpacity: 70,
    borderStyle: "none",
    borderRadius: 20,
    aspect: "square"
  };

  /* ==========================================================================
     03. STATE
     ========================================================================== */

  let isProUnlocked = readProStatus();
  let state = clone(DEFAULTS);

  let history = [];
  let historyIndex = -1;
  let historyTimer = null;

  let exporting = false;
  let processingUpload = false;
  let verifyingLicense = false;
  let toastTimer = null;
  let uploadToken = 0;
  let renderQueued = false;

  /* ==========================================================================
     04. UTILITIES
     ========================================================================== */

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function clamp(num, min, max) {
    return Math.min(max, Math.max(min, num));
  }

  function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function setText(id, val) {
    const el = $(id);
    if (el) el.textContent = val;
  }

  function setValue(id, val) {
    const el = $(id);
    if (el && val !== undefined && val !== null) el.value = val;
  }

  function formatNumber(val) {
    return Number(val).toFixed(2).replace(/\.?0+$/, "");
  }

  function validHex(val) {
    return /^#[0-9a-fA-F]{6}$/.test(val);
  }

  function safeFilename(val) {
    return String(val || "creation")
      .normalize("NFKD")
      .replace(/[^\w-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 45) || "creation";
  }

  function safeString(val, fallback = "") {
    return typeof val === "string" ? val : fallback;
  }

  function escapeHTML(val) {
    return String(val).replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[ch]));
  }

  function setStatus(msg, type = "normal") {
    const el = elements.downloadStatus;
    if (!el) return;
    el.textContent = msg;
    el.style.color = type === "error" ? "#ff9999" : type === "success" ? "#9fe0bb" : "";
  }

  function showToast(msg) {
    const toast = elements.toast;
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function safeSetAttribute(el, attr, val) {
    if (el) el.setAttribute(attr, String(val));
  }

  function buildCustomGradientCSS(s = state) {
    return `linear-gradient(${s.gradAngle}deg, ${s.gradColor1}, ${s.gradColor2})`;
  }

  /* ==========================================================================
     05. PRO UNLOCK, BRAND KIT & LICENSE VERIFICATION
     ========================================================================== */

  function readProStatus() {
    try {
      const raw = localStorage.getItem(PRO_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed && parsed.unlocked === true);
    } catch {
      return false;
    }
  }

  function setProUnlocked(unlocked, source = "pro") {
    isProUnlocked = Boolean(unlocked);
    try {
      localStorage.setItem(
        PRO_STORAGE_KEY,
        JSON.stringify({ unlocked: isProUnlocked, source, updatedAt: new Date().toISOString() })
      );
    } catch (err) {
      console.warn("Could not save Pro unlock state:", err);
    }

    state = normalizeState(state);
    syncProUI();
    renderAll(true);
  }

  function syncProUI() {
    document.body.classList.toggle("is-pro-unlocked", isProUnlocked);

    if (elements.openProBtn) {
      elements.openProBtn.classList.toggle("is-unlocked", isProUnlocked);
      elements.openProBtn.textContent = isProUnlocked ? "✓ Pro Active" : "✦ Unlock Pro";
    }

    document.querySelectorAll(".template-grid button").forEach(btn => {
      const name = btn.dataset.template;
      btn.classList.toggle("is-pro-locked", !isProUnlocked && !FREE_TEMPLATES.has(name));
    });

    if (elements.proStatusText) {
      elements.proStatusText.textContent = isProUnlocked
        ? "Feathoria Pro is unlocked on this browser."
        : "Free tier active. Unlock Pro to remove studio limits.";
    }
  }

  function openProDialog(reason = "") {
    if (reason && elements.proStatusText) {
      elements.proStatusText.textContent = reason;
    } else {
      syncProUI();
    }

    if (elements.proDialog?.showModal) {
      if (!elements.proDialog.open) elements.proDialog.showModal();
    } else {
      elements.proDialog?.setAttribute("open", "");
    }
  }

  function closeProDialog() {
    if (elements.proDialog?.close) {
      elements.proDialog.close();
    } else {
      elements.proDialog?.removeAttribute("open");
    }
  }

  function requirePro(featureLabel) {
    if (isProUnlocked) return true;
    showToast(`"${featureLabel}" requires Feathoria Pro.`);
    openProDialog(`Unlock Feathoria Pro to use ${featureLabel}.`);
    return false;
  }

  async function verifyLicenseCode(code) {
    if (LICENSE_VERIFY_ENDPOINT) {
      const res = await fetch(LICENSE_VERIFY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      if (!res.ok) throw new Error("Verification request failed");
      const data = await res.json();
      return Boolean(data && data.valid);
    }
    return LOCAL_DEMO_CODES.has(code);
  }

  elements.openProBtn?.addEventListener("click", () => openProDialog());
  elements.closeProBtn?.addEventListener("click", closeProDialog);
  elements.closeProBottomBtn?.addEventListener("click", closeProDialog);
  elements.proDialog?.addEventListener("click", e => {
    if (e.target === elements.proDialog) closeProDialog();
  });

  elements.checkoutProBtn?.addEventListener("click", () => {
    if (PAYMENT_CHECKOUT_URL) {
      window.open(PAYMENT_CHECKOUT_URL, "_blank", "noopener,noreferrer");
      showToast("Checkout opened in a new tab.");
      return;
    }
    setProUnlocked(true, "instant-demo-checkout");
    closeProDialog();
    showToast("Feathoria Pro unlocked! All features active. ✨");
  });

  elements.activateLicenseBtn?.addEventListener("click", async () => {
    if (verifyingLicense) return;
    const code = (elements.licenseKeyInput?.value || "").trim().toUpperCase();
    if (!code) {
      showToast("Please enter an unlock code.");
      return;
    }

    verifyingLicense = true;
    elements.activateLicenseBtn.disabled = true;
    if (elements.proStatusText) elements.proStatusText.textContent = "Verifying code...";

    try {
      const valid = await verifyLicenseCode(code);
      if (valid) {
        setProUnlocked(true, `code:${code}`);
        closeProDialog();
        showToast("Feathoria Pro activated! ✨");
      } else {
        if (elements.proStatusText) {
          elements.proStatusText.textContent = "Invalid code. Try FEATHORIA-PRO-2026 or complete checkout.";
        }
        showToast("Invalid unlock code.");
      }
    } catch (err) {
      console.error("License verification error:", err);
      if (elements.proStatusText) {
        elements.proStatusText.textContent = "Could not verify code right now. Please try again.";
      }
      showToast("Verification error.");
    } finally {
      verifyingLicense = false;
      elements.activateLicenseBtn.disabled = false;
    }
  });

  // Creator Brand Kit (Pro)
  elements.saveBrandKitBtn?.addEventListener("click", () => {
    if (!requirePro("Creator Brand Kit")) return;
    readControls();

    const kit = {
      font: state.font,
      textColor: state.textColor,
      textFoil: state.textFoil,
      letterSpacing: state.letterSpacing,
      lineHeight: state.lineHeight,
      textAlign: state.textAlign,
      shadow: state.shadow,
      background: state.background,
      useCustomGradient: state.useCustomGradient,
      gradColor1: state.gradColor1,
      gradColor2: state.gradColor2,
      gradAngle: state.gradAngle,
      logo: state.logo,
      watermarkText: state.watermarkText,
      watermarkOpacity: state.watermarkOpacity,
      borderStyle: state.borderStyle,
      borderRadius: state.borderRadius
    };

    try {
      localStorage.setItem(BRAND_KIT_STORAGE_KEY, JSON.stringify(kit));
      showToast("Brand Kit saved! Apply it anytime.");
    } catch {
      showToast("Could not save Brand Kit in this browser.");
    }
  });

  elements.applyBrandKitBtn?.addEventListener("click", () => {
    if (!requirePro("Creator Brand Kit")) return;
    try {
      const raw = localStorage.getItem(BRAND_KIT_STORAGE_KEY);
      if (!raw) {
        showToast("No saved Brand Kit yet. Click 'Save as Brand Kit' first.");
        return;
      }
      const kit = JSON.parse(raw);
      if (!kit || typeof kit !== "object") throw new Error("Invalid kit");

      state = normalizeState({
        ...state,
        ...kit,
        customBackground: null
      });
      if (elements.bgUpload) elements.bgUpload.value = "";
      renderAll(true);
      recordHistory(true);
      showToast("Brand Kit applied! ✨");
    } catch {
      showToast("Saved Brand Kit could not be loaded.");
    }
  });

  /* ==========================================================================
     06. OVERFLOW DETECTION & AUTO-FIT TEXT GUARD
     ========================================================================== */

  function checkTextOverflow() {
    if (!elements.overflowBanner || !quoteOverlay) return false;
    const isOverflowing = quoteOverlay.scrollHeight > quoteOverlay.clientHeight + 2;
    elements.overflowBanner.hidden = !isOverflowing;
    return isOverflowing;
  }

  function autoFitTextSize() {
    clearTimeout(historyTimer);
    readControls();

    const minQuoteSize = 14;
    const minAuthorSize = 12;
    let changed = false;

    renderAll(false);
    while (quoteOverlay.scrollHeight > quoteOverlay.clientHeight + 2 && state.fontSize > minQuoteSize) {
      state.fontSize = Math.max(minQuoteSize, state.fontSize - 1);
      if (state.authorSize > minAuthorSize && state.authorSize > Math.round(state.fontSize * 0.65)) {
        state.authorSize = Math.max(minAuthorSize, state.authorSize - 1);
      }
      applyTypography();
      changed = true;
    }

    renderControls();
    checkTextOverflow();
    if (changed) {
      recordHistory(true);
      showToast(`Text fitted cleanly at ${state.fontSize} px.`);
    } else {
      showToast("Text already fits within the canvas.");
    }
  }

  elements.autoFitTextBtn?.addEventListener("click", autoFitTextSize);
  elements.bannerAutoFitBtn?.addEventListener("click", autoFitTextSize);

  /* ==========================================================================
     07. STATE NORMALIZATION & HISTORY
     ========================================================================== */

  function normalizeState(input) {
    const src = input && typeof input === "object" ? input : {};
    const out = { ...clone(DEFAULTS), ...src };

    out.quote = safeString(out.quote).slice(0, 1200);
    out.author = safeString(out.author).slice(0, 80);
    out.font = FONTS.includes(out.font) ? out.font : DEFAULTS.font;
    out.background = BACKGROUNDS.includes(out.background) ? out.background : DEFAULTS.background;
    out.aspect = ASPECTS.includes(out.aspect) ? out.aspect : DEFAULTS.aspect;
    out.filter = FILTERS.includes(out.filter) ? out.filter : DEFAULTS.filter;
    out.textAlign = ["left", "center", "right"].includes(out.textAlign) ? out.textAlign : "center";
    out.textColor = validHex(out.textColor) ? out.textColor : DEFAULTS.textColor;

    out.gradColor1 = validHex(out.gradColor1) ? out.gradColor1 : DEFAULTS.gradColor1;
    out.gradColor2 = validHex(out.gradColor2) ? out.gradColor2 : DEFAULTS.gradColor2;
    out.gradAngle = clamp(Number(out.gradAngle) || DEFAULTS.gradAngle, 0, 360);
    out.useCustomGradient = Boolean(out.useCustomGradient);

    out.textFoil = FOILS.includes(out.textFoil) ? out.textFoil : "none";
    out.atmosphere = ATMOSPHERES.includes(out.atmosphere) ? out.atmosphere : "none";
    out.quoteFrame = FRAMES.includes(out.quoteFrame) ? out.quoteFrame : "none";

    out.fontSize = clamp(Number(out.fontSize) || DEFAULTS.fontSize, 14, 150);
    out.letterSpacing = clamp(Number(out.letterSpacing) || 0, -5, 15);
    out.lineHeight = clamp(Number(out.lineHeight) || DEFAULTS.lineHeight, 0.8, 3);
    out.authorSize = clamp(Number(out.authorSize) || DEFAULTS.authorSize, 8, 100);

    out.backgroundZoom = clamp(Number(out.backgroundZoom) || 100, 50, 300);
    out.backgroundX = clamp(Number(out.backgroundX) || 50, 0, 100);
    out.backgroundY = clamp(Number(out.backgroundY) || 50, 0, 100);
    out.brightness = clamp(Number(out.brightness) || 100, 0, 200);
    out.blur = clamp(Number(out.blur) || 0, 0, 20);
    out.overlay = clamp(Number(out.overlay) || 0, 0, 100);
    out.watermarkOpacity = clamp(Number(out.watermarkOpacity) || 0, 0, 100);
    out.borderRadius = clamp(Number(out.borderRadius) || 0, 0, 100);
    out.watermarkText = safeString(out.watermarkText, DEFAULTS.watermarkText).slice(0, 50);

    out.bold = Boolean(out.bold);
    out.italic = Boolean(out.italic);
    out.uppercase = Boolean(out.uppercase);
    out.shadow = Boolean(out.shadow);
    out.logo = Boolean(out.logo);

    if (!isProUnlocked) {
      out.customBackground = null;
      out.useCustomGradient = false;
      out.textFoil = "none";
      out.atmosphere = "none";
      out.quoteFrame = "none";
      out.logo = true;
      out.watermarkText = DEFAULTS.watermarkText;
      if (!FREE_ASPECTS.includes(out.aspect)) {
        out.aspect = "square";
      }
    } else if (typeof out.customBackground !== "string" || !out.customBackground.startsWith("data:image/")) {
      out.customBackground = null;
    }

    if (!["none", "thin", "gold", "double"].includes(out.borderStyle)) {
      out.borderStyle = "none";
    }

    return out;
  }

  function snapshot() {
    return clone(state);
  }

  function updateHistoryButtons() {
    if (elements.undoBtn) elements.undoBtn.disabled = historyIndex <= 0;
    if (elements.redoBtn) elements.redoBtn.disabled = historyIndex >= history.length - 1;
  }

  function resetHistory() {
    clearTimeout(historyTimer);
    history = [snapshot()];
    historyIndex = 0;
    updateHistoryButtons();
  }

  function commitHistory() {
    clearTimeout(historyTimer);
    const next = snapshot();
    const cur = history[historyIndex];
    if (cur && JSON.stringify(cur) === JSON.stringify(next)) {
      updateHistoryButtons();
      return;
    }
    history = history.slice(0, historyIndex + 1);
    history.push(next);
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
    updateHistoryButtons();
  }

  function recordHistory(immediate = false) {
    clearTimeout(historyTimer);
    if (immediate) return commitHistory();
    historyTimer = setTimeout(commitHistory, HISTORY_DELAY);
  }

  function undo() {
    clearTimeout(historyTimer);
    if (historyIndex <= 0) return;
    historyIndex--;
    state = normalizeState(clone(history[historyIndex]));
    renderAll(true);
    updateHistoryButtons();
    showToast("Undo complete.");
  }

  function redo() {
    clearTimeout(historyTimer);
    if (historyIndex >= history.length - 1) return;
    historyIndex++;
    state = normalizeState(clone(history[historyIndex]));
    renderAll(true);
    updateHistoryButtons();
    showToast("Redo complete.");
  }

  elements.undoBtn?.addEventListener("click", undo);
  elements.redoBtn?.addEventListener("click", redo);

  /* ==========================================================================
     08. CONTROLS & RENDERING
     ========================================================================== */

  function readControls() {
    state.quote = quoteInput?.value ?? state.quote;
    state.author = authorInput?.value ?? state.author;
    state.font = elements.fontSelect?.value ?? state.font;
    state.fontSize = Number(elements.fontSize?.value ?? state.fontSize);
    state.letterSpacing = Number(elements.letterSpacing?.value ?? state.letterSpacing);
    state.lineHeight = Number(elements.lineHeight?.value ?? state.lineHeight);
    state.textAlign = elements.textAlign?.value ?? state.textAlign;
    state.textColor = elements.textColor?.value ?? state.textColor;
    state.textFoil = elements.textFoilSelect?.value ?? state.textFoil;
    state.authorSize = Number(elements.authorSize?.value ?? state.authorSize);

    state.gradColor1 = elements.gradColor1?.value ?? state.gradColor1;
    state.gradColor2 = elements.gradColor2?.value ?? state.gradColor2;
    state.gradAngle = Number(elements.gradAngle?.value ?? state.gradAngle);

    state.bold = elements.boldBtn?.getAttribute("aria-pressed") === "true";
    state.italic = elements.italicBtn?.getAttribute("aria-pressed") === "true";
    state.uppercase = elements.uppercaseBtn?.getAttribute("aria-pressed") === "true";

    state.backgroundZoom = Number(elements.backgroundZoom?.value ?? state.backgroundZoom);
    state.backgroundX = Number(elements.backgroundX?.value ?? state.backgroundX);
    state.backgroundY = Number(elements.backgroundY?.value ?? state.backgroundY);
    state.brightness = Number(elements.brightnessRange?.value ?? state.brightness);
    state.blur = Number(elements.blurRange?.value ?? state.blur);
    state.overlay = Number(elements.overlayRange?.value ?? state.overlay);

    state.shadow = Boolean(elements.shadowToggle?.checked);
    state.atmosphere = elements.atmosphereSelect?.value ?? state.atmosphere;
    state.quoteFrame = elements.quoteFrameSelect?.value ?? state.quoteFrame;
    state.logo = Boolean(elements.logoToggle?.checked);
    state.watermarkText = elements.watermarkText?.value ?? state.watermarkText;
    state.watermarkOpacity = Number(elements.watermarkOpacity?.value ?? state.watermarkOpacity);

    state.borderStyle = elements.borderStyle?.value ?? state.borderStyle;
    state.borderRadius = Number(elements.borderRadius?.value ?? state.borderRadius);
    state.aspect = elements.aspectSelect?.value ?? state.aspect;

    state = normalizeState(state);
    return state;
  }

  function renderControls() {
    const map = {
      quoteInput: state.quote,
      authorInput: state.author,
      fontSelect: state.font,
      fontSize: state.fontSize,
      letterSpacing: state.letterSpacing,
      lineHeight: state.lineHeight,
      textAlign: state.textAlign,
      textColor: state.textColor,
      textFoilSelect: state.textFoil,
      authorSize: state.authorSize,
      gradColor1: state.gradColor1,
      gradColor2: state.gradColor2,
      gradAngle: state.gradAngle,
      backgroundZoom: state.backgroundZoom,
      backgroundX: state.backgroundX,
      backgroundY: state.backgroundY,
      brightnessRange: state.brightness,
      blurRange: state.blur,
      overlayRange: state.overlay,
      atmosphereSelect: state.atmosphere,
      quoteFrameSelect: state.quoteFrame,
      watermarkText: state.watermarkText,
      watermarkOpacity: state.watermarkOpacity,
      borderStyle: state.borderStyle,
      borderRadius: state.borderRadius,
      aspectSelect: state.aspect
    };
    Object.entries(map).forEach(([id, v]) => setValue(id, v));

    safeSetAttribute(elements.boldBtn, "aria-pressed", state.bold);
    safeSetAttribute(elements.italicBtn, "aria-pressed", state.italic);
    safeSetAttribute(elements.uppercaseBtn, "aria-pressed", state.uppercase);

    if (elements.shadowToggle) elements.shadowToggle.checked = state.shadow;
    if (elements.logoToggle) elements.logoToggle.checked = state.logo;

    renderBackgroundButtons();
    renderFilterButtons();
  }

  function renderBackgroundButtons() {
    document.querySelectorAll(".background-swatch").forEach(btn => {
      const active =
        !state.customBackground &&
        !state.useCustomGradient &&
        btn.dataset.background === state.background;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function renderFilterButtons() {
    document.querySelectorAll("[data-filter]").forEach(btn => {
      const active = btn.dataset.filter === state.filter;
      btn.classList.toggle("active-filter", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function applyText() {
    quoteText.textContent = state.quote.trim() || "Your words will live here...";
    quoteAuthor.textContent = state.author.trim() ? `— ${state.author.trim()}` : "";
    setText("quoteCounter", `${state.quote.length} / 1200`);
    setText("authorCounter", `${state.author.length} / 80`);
  }

  function applyTypography() {
    quoteText.style.fontFamily = `"${state.font}", serif`;
    quoteAuthor.style.fontFamily = `"${state.font}", serif`;
    quoteText.style.fontSize = `${state.fontSize}px`;
    quoteText.style.letterSpacing = `${state.letterSpacing}px`;
    quoteText.style.lineHeight = String(state.lineHeight);
    quoteText.style.textAlign = state.textAlign;
    quoteText.style.fontWeight = state.bold ? "700" : "400";
    quoteText.style.fontStyle = state.italic ? "italic" : "normal";
    quoteText.style.textTransform = state.uppercase ? "uppercase" : "none";
    quoteText.style.color = state.textColor;
    quoteAuthor.style.color = state.textColor;
    quoteAuthor.style.fontSize = `${state.authorSize}px`;
    quotePreview.classList.toggle("text-shadow", state.shadow);

    quotePreview.classList.remove("foil-gold", "foil-rose", "foil-aurora");
    if (isProUnlocked && state.textFoil !== "none") {
      quotePreview.classList.add(`foil-${state.textFoil}`);
    }

    setText("fontSizeValue", `${state.fontSize} px`);
    setText("letterSpacingValue", `${formatNumber(state.letterSpacing)} px`);
    setText("lineHeightValue", formatNumber(state.lineHeight));
    setText("authorSizeValue", `${state.authorSize} px`);
    setText("textColorValue", state.textColor.toUpperCase());
  }

  function applyBackground() {
    quoteBackground.className = "quote-background";
    const isCreamActive = !state.customBackground && !state.useCustomGradient && state.background === "bg11";
    quotePreview.classList.toggle("bg11-active", isCreamActive);

    if (state.customBackground) {
      quoteBackground.style.backgroundImage = `url("${state.customBackground}")`;
      quoteBackground.style.backgroundColor = "transparent";
      quoteBackground.style.backgroundSize = `${state.backgroundZoom}%`;
      quoteBackground.style.backgroundPosition = `${state.backgroundX}% ${state.backgroundY}%`;
      if (elements.removeCustomBg) elements.removeCustomBg.hidden = false;
    } else if (isProUnlocked && state.useCustomGradient) {
      quoteBackground.style.backgroundImage = buildCustomGradientCSS(state);
      quoteBackground.style.backgroundColor = "transparent";
      quoteBackground.style.backgroundSize = "cover";
      quoteBackground.style.backgroundPosition = "center";
      if (elements.removeCustomBg) elements.removeCustomBg.hidden = true;
    } else {
      quoteBackground.classList.add(state.background);
      quoteBackground.style.backgroundImage = "";
      quoteBackground.style.backgroundColor = "";
      quoteBackground.style.backgroundSize = "cover";
      quoteBackground.style.backgroundPosition = "center";
      if (elements.removeCustomBg) elements.removeCustomBg.hidden = true;
    }

    const filterMap = {
      none: "",
      dreamy: "saturate(1.25) brightness(1.06)",
      warm: "sepia(0.25) saturate(1.15)",
      cool: "hue-rotate(12deg) saturate(1.1)",
      bw: "grayscale(1) contrast(1.15)",
      vintage: "sepia(0.45) saturate(0.85) contrast(0.95)"
    };

    const filters = [`brightness(${state.brightness}%)`, filterMap[state.filter] || ""];
    if (state.blur > 0) filters.push(`blur(${state.blur}px)`);
    quoteBackground.style.filter = filters.filter(Boolean).join(" ");

    const zoom = state.backgroundZoom / 100;
    quoteBackground.style.transform = `scale(${zoom + (state.blur > 0 ? 0.08 : 0)})`;
    quoteBackground.style.setProperty("--overlay-opacity", String(state.overlay / 100));
    quoteBackground.style.backgroundRepeat = "no-repeat";

    renderBackgroundButtons();
  }

  function applyDecoration() {
    quotePreview.classList.remove("fx-vignette", "fx-grain", "fx-sparkle");
    if (isProUnlocked && state.atmosphere !== "none") {
      quotePreview.classList.add(`fx-${state.atmosphere}`);
    }

    quotePreview.classList.remove("frame-ornate", "frame-rule", "frame-corner");
    if (isProUnlocked && state.quoteFrame !== "none") {
      quotePreview.classList.add(`frame-${state.quoteFrame}`);
    }

    if (elements.watermark) {
      elements.watermark.textContent = state.watermarkText;
      elements.watermark.style.opacity = String(state.watermarkOpacity / 100);
      elements.watermark.hidden = !state.watermarkText.trim();
    }

    const logo = $("logo");
    if (logo) logo.hidden = !state.logo;

    quotePreview.style.borderRadius = `${state.borderRadius}px`;
    const borders = {
      none: "none",
      thin: "1px solid rgba(255,255,255,.75)",
      gold: "2px solid #e9c98a",
      double: "4px double rgba(255,255,255,.85)"
    };
    quotePreview.style.border = borders[state.borderStyle] || "none";
  }

  function applyAspect() {
    if (!ASPECTS.includes(state.aspect)) state.aspect = "square";
    quotePreview.classList.remove(...ASPECTS);
    quotePreview.classList.add(state.aspect);

    const labels = {
      square: "Square · 1:1",
      portrait: "Portrait · 4:5",
      story: "Story · 9:16",
      banner: "Landscape · 16:9"
    };
    setText("formatLabel", labels[state.aspect]);
  }

  function updateRangeLabels() {
    setText("gradColor1Value", state.gradColor1.toUpperCase());
    setText("gradColor2Value", state.gradColor2.toUpperCase());
    setText("gradAngleValue", `${state.gradAngle}°`);
    setText("backgroundZoomValue", `${state.backgroundZoom}%`);
    setText("backgroundXValue", `${state.backgroundX}%`);
    setText("backgroundYValue", `${state.backgroundY}%`);
    setText("brightnessValue", `${state.brightness}%`);
    setText("blurValue", `${state.blur} px`);
    setText("overlayValue", `${state.overlay}%`);
    setText("watermarkOpacityValue", `${state.watermarkOpacity}%`);
    setText("borderRadiusValue", `${state.borderRadius} px`);
  }

  function renderAll(syncControls = true) {
    if (syncControls) renderControls();
    applyText();
    applyTypography();
    applyBackground();
    applyDecoration();
    applyAspect();
    updateRangeLabels();
    checkTextOverflow();
  }

  function scheduleRender() {
    readControls();
    updateRangeLabels();
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      renderAll(false);
    });
  }

  /* ==========================================================================
     09. EVENT LISTENERS, TEMPLATES, UPLOAD & JSON PRESET IMPORT/EXPORT
     ========================================================================== */

  document.querySelectorAll(".background-swatch").forEach(btn => {
    btn.addEventListener("click", () => {
      const bg = btn.dataset.background;
      if (!BACKGROUNDS.includes(bg)) return;
      state.background = bg;
      state.useCustomGradient = false;
      state.customBackground = null;
      if (elements.bgUpload) elements.bgUpload.value = "";
      renderAll(false);
      recordHistory(true);
    });
  });

  function activateCustomGradient(notify = false) {
    if (!requirePro("Custom Gradient Builder")) return;
    readControls();
    state.useCustomGradient = true;
    state.customBackground = null;
    if (elements.bgUpload) elements.bgUpload.value = "";
    renderAll(false);
    recordHistory(true);
    if (notify) showToast("Custom gradient applied.");
  }

  elements.useCustomGradientBtn?.addEventListener("click", () => activateCustomGradient(true));

  ["gradColor1", "gradColor2", "gradAngle"].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener("input", () => {
      if (!isProUnlocked) return;
      readControls();
      state.useCustomGradient = true;
      state.customBackground = null;
      scheduleRender();
      recordHistory(false);
    });
    el.addEventListener("change", () => {
      if (!requirePro("Custom Gradient Builder")) {
        renderControls();
        return;
      }
      activateCustomGradient(false);
    });
  });

  document.querySelectorAll("#filterButtons [data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      if (!FILTERS.includes(f)) return;
      state.filter = f;
      renderAll(false);
      recordHistory(true);
    });
  });

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Image decode failed."));
      };
      img.src = url;
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise(resolve => canvas.toBlob(b => resolve(b), type, quality));
  }

  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("DataURL conversion failed."));
      reader.readAsDataURL(blob);
    });
  }

  async function optimizeUploadedImage(file) {
    const img = await loadImageFromFile(file);
    let { naturalWidth: w, naturalHeight: h } = img;
    const largest = Math.max(w, h);
    if (largest > MAX_IMAGE_DIMENSION) {
      const ratio = MAX_IMAGE_DIMENSION / largest;
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas context unavailable.");

    ctx.fillStyle = "#171127";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const blob =
      (await canvasToBlob(canvas, "image/webp", 0.84)) ||
      (await canvasToBlob(canvas, "image/jpeg", 0.86));

    canvas.width = 1;
    canvas.height = 1;
    if (!blob) throw new Error("Image compression failed.");
    return blobToDataURL(blob);
  }

  elements.bgUpload?.addEventListener("click", e => {
    if (!requirePro("Custom Image Upload")) e.preventDefault();
  });

  elements.bgUpload?.addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!requirePro("Custom Image Upload")) {
      event.target.value = "";
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Choose a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      showToast("Image must be smaller than 8 MB.");
      event.target.value = "";
      return;
    }

    const token = ++uploadToken;
    processingUpload = true;
    if (elements.downloadBtn) elements.downloadBtn.disabled = true;
    showToast("Optimizing your background...");

    try {
      const optimized = await optimizeUploadedImage(file);
      if (token !== uploadToken) return;
      state.customBackground = optimized;
      state.useCustomGradient = false;
      renderAll(false);
      recordHistory(true);
      showToast("Background added successfully.");
    } catch (err) {
      console.error("Background upload error:", err);
      showToast("Could not process this image.");
      event.target.value = "";
    } finally {
      if (token === uploadToken) {
        processingUpload = false;
        if (elements.downloadBtn) elements.downloadBtn.disabled = false;
      }
    }
  });

  elements.removeCustomBg?.addEventListener("click", () => {
    if (!state.customBackground) return;
    state.customBackground = null;
    state.background = DEFAULTS.background;
    if (elements.bgUpload) elements.bgUpload.value = "";
    renderAll(false);
    recordHistory(true);
    showToast("Custom background removed.");
  });

  elements.textFoilSelect?.addEventListener("change", () => {
    const chosen = elements.textFoilSelect.value;
    if (!isProUnlocked && chosen !== "none") {
      elements.textFoilSelect.value = "none";
      requirePro("Gradient Foil Typography");
      return;
    }
    state.textFoil = chosen;
    applyTypography();
    recordHistory(true);
  });

  elements.atmosphereSelect?.addEventListener("change", () => {
    const chosen = elements.atmosphereSelect.value;
    if (!isProUnlocked && chosen !== "none") {
      elements.atmosphereSelect.value = "none";
      requirePro("Atmosphere Overlays");
      return;
    }
    state.atmosphere = chosen;
    applyDecoration();
    recordHistory(true);
  });

  elements.quoteFrameSelect?.addEventListener("change", () => {
    const chosen = elements.quoteFrameSelect.value;
    if (!isProUnlocked && chosen !== "none") {
      elements.quoteFrameSelect.value = "none";
      requirePro("Editorial Framing");
      return;
    }
    state.quoteFrame = chosen;
    applyDecoration();
    recordHistory(true);
  });

  elements.logoToggle?.addEventListener("change", () => {
    if (!isProUnlocked && !elements.logoToggle.checked) {
      elements.logoToggle.checked = true;
      requirePro("Hiding Watermark");
      return;
    }
    state.logo = elements.logoToggle.checked;
    applyDecoration();
    recordHistory(true);
  });

  elements.watermarkText?.addEventListener("focus", () => {
    if (!isProUnlocked) {
      elements.watermarkText.blur();
      requirePro("Custom Watermark Text");
    }
  });

  elements.watermarkText?.addEventListener("input", () => {
    if (!isProUnlocked) return;
    scheduleRender();
    recordHistory(false);
  });

  elements.aspectSelect?.addEventListener("change", () => {
    const chosen = elements.aspectSelect.value;
    if (!isProUnlocked && !FREE_ASPECTS.includes(chosen)) {
      elements.aspectSelect.value = state.aspect;
      requirePro("Story & Landscape Canvas Sizes");
      return;
    }
    state.aspect = chosen;
    applyAspect();
    checkTextOverflow();
    recordHistory(true);
  });

  elements.exportQuality?.addEventListener("change", () => {
    if (!isProUnlocked && Number(elements.exportQuality.value) > 2) {
      elements.exportQuality.value = "2";
      requirePro("Ultra 3x Export Resolution");
    }
  });

  [
    "quoteInput", "authorInput", "fontSelect", "fontSize",
    "letterSpacing", "lineHeight", "textAlign", "textColor",
    "authorSize", "backgroundZoom", "backgroundX", "backgroundY",
    "brightnessRange", "blurRange", "overlayRange",
    "watermarkOpacity", "borderStyle", "borderRadius"
  ].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener("input", () => {
      scheduleRender();
      recordHistory(false);
    });
    el.addEventListener("change", () => {
      clearTimeout(historyTimer);
      readControls();
      renderAll(false);
      recordHistory(true);
    });
  });

  function toggleFormatting(prop, btn) {
    state[prop] = !state[prop];
    safeSetAttribute(btn, "aria-pressed", state[prop]);
    applyTypography();
    checkTextOverflow();
    recordHistory(true);
  }

  elements.boldBtn?.addEventListener("click", () => toggleFormatting("bold", elements.boldBtn));
  elements.italicBtn?.addEventListener("click", () => toggleFormatting("italic", elements.italicBtn));
  elements.uppercaseBtn?.addEventListener("click", () => toggleFormatting("uppercase", elements.uppercaseBtn));

  elements.shadowToggle?.addEventListener("change", () => {
    state.shadow = elements.shadowToggle.checked;
    applyTypography();
    recordHistory(true);
  });

  $("whiteTextBtn")?.addEventListener("click", () => {
    state.textColor = "#ffffff";
    setValue("textColor", state.textColor);
    applyTypography();
    recordHistory(true);
  });

  $("darkTextBtn")?.addEventListener("click", () => {
    state.textColor = "#25202d";
    setValue("textColor", state.textColor);
    applyTypography();
    recordHistory(true);
  });

  const TEMPLATES = {
    midnight: { background: "bg7", useCustomGradient: false, font: "Playfair Display", fontSize: 34, letterSpacing: 0.5, lineHeight: 1.65, textAlign: "center", textColor: "#ffffff", textFoil: "none", atmosphere: "none", quoteFrame: "none", authorSize: 19, overlay: 28, brightness: 95, shadow: true, borderStyle: "thin", borderRadius: 14, aspect: "square" },
    minimal: { background: "bg11", useCustomGradient: false, font: "Montserrat", fontSize: 28, letterSpacing: 1, lineHeight: 1.7, textAlign: "center", textColor: "#30251d", textFoil: "none", atmosphere: "none", quoteFrame: "none", authorSize: 15, overlay: 0, brightness: 100, shadow: false, borderStyle: "thin", borderRadius: 4, aspect: "square" },
    romantic: { background: "bg8", useCustomGradient: false, font: "Cormorant Garamond", fontSize: 37, letterSpacing: 0.5, lineHeight: 1.7, textAlign: "center", textColor: "#fff3f5", textFoil: "none", atmosphere: "none", quoteFrame: "none", authorSize: 20, italic: true, overlay: 25, brightness: 95, shadow: true, borderStyle: "gold", borderRadius: 22, aspect: "portrait" },
    poetry: { background: "bg10", useCustomGradient: false, font: "Lora", fontSize: 29, letterSpacing: 0, lineHeight: 1.9, textAlign: "left", textColor: "#f6eadb", textFoil: "none", atmosphere: "none", quoteFrame: "none", authorSize: 17, overlay: 22, brightness: 90, shadow: false, borderStyle: "thin", borderRadius: 10, aspect: "portrait" },
    vintage: { background: "bg11", useCustomGradient: false, font: "Libre Baskerville", fontSize: 27, letterSpacing: 0.3, lineHeight: 1.8, textAlign: "center", textColor: "#3b2a1e", textFoil: "none", atmosphere: "none", quoteFrame: "none", authorSize: 16, italic: true, overlay: 0, brightness: 100, shadow: false, borderStyle: "gold", borderRadius: 5, aspect: "square" },
    cosmic: { background: "bg12", useCustomGradient: false, font: "Playfair Display", fontSize: 36, letterSpacing: 0.5, lineHeight: 1.7, textAlign: "center", textColor: "#ffffff", textFoil: "aurora", atmosphere: "sparkle", quoteFrame: "ornate", authorSize: 19, overlay: 30, brightness: 90, shadow: true, borderStyle: "thin", borderRadius: 18, aspect: "story" },
    editorial: { background: "bg10", useCustomGradient: false, font: "Montserrat", fontSize: 32, letterSpacing: 1.5, lineHeight: 1.55, textAlign: "left", textColor: "#f4e9d6", textFoil: "gold", atmosphere: "vignette", quoteFrame: "rule", authorSize: 15, bold: true, overlay: 25, brightness: 95, shadow: false, borderStyle: "none", borderRadius: 0, aspect: "banner" },
    dream: { background: "bg2", useCustomGradient: false, font: "Dancing Script", fontSize: 43, letterSpacing: 0, lineHeight: 1.55, textAlign: "center", textColor: "#ffffff", textFoil: "rose", atmosphere: "grain", quoteFrame: "corner", authorSize: 22, overlay: 20, brightness: 100, shadow: true, borderStyle: "gold", borderRadius: 25, aspect: "portrait" }
  };

  document.querySelectorAll("[data-template]").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.template;
      const tpl = TEMPLATES[name];
      if (!tpl) return;
      if (!isProUnlocked && !FREE_TEMPLATES.has(name)) {
        requirePro(`${name[0].toUpperCase()}${name.slice(1)} Template`);
        return;
      }

      state = normalizeState({
        ...clone(DEFAULTS),
        ...tpl,
        quote: quoteInput?.value || state.quote,
        author: authorInput?.value || state.author,
        customBackground: null
      });
      if (elements.bgUpload) elements.bgUpload.value = "";
      renderAll(true);
      recordHistory(true);
      showToast(`${name[0].toUpperCase()}${name.slice(1)} template applied.`);
    });
  });

  elements.randomBtn?.addEventListener("click", () => {
    const allowedAspects = isProUnlocked ? ASPECTS : FREE_ASPECTS;
    state = normalizeState({
      ...state,
      background: randomItem(BACKGROUNDS),
      useCustomGradient: false,
      customBackground: null,
      font: randomItem(FONTS),
      fontSize: Math.floor(Math.random() * 17) + 26,
      letterSpacing: randomItem([0, 0.5, 1, 1.5]),
      lineHeight: randomItem([1.5, 1.6, 1.7, 1.8]),
      textAlign: randomItem(["center", "left", "right"]),
      textColor: randomItem(["#ffffff", "#fff0dc", "#f7e6f2", "#f3e9ff"]),
      textFoil: isProUnlocked ? randomItem(FOILS) : "none",
      atmosphere: isProUnlocked ? randomItem(ATMOSPHERES) : "none",
      quoteFrame: isProUnlocked ? randomItem(FRAMES) : "none",
      authorSize: randomItem([16, 18, 20, 22]),
      bold: randomItem([true, false]),
      italic: randomItem([true, false]),
      uppercase: false,
      brightness: randomItem([85, 95, 100, 110]),
      overlay: randomItem([15, 20, 25, 35, 45]),
      filter: randomItem(FILTERS),
      shadow: randomItem([true, false]),
      borderStyle: randomItem(["none", "thin", "gold"]),
      borderRadius: randomItem([0, 8, 15, 22, 30]),
      aspect: randomItem(allowedAspects)
    });
    if (elements.bgUpload) elements.bgUpload.value = "";
    renderAll(true);
    recordHistory(true);
    showToast("A new design has been created.");
  });

  elements.exportJsonBtn?.addEventListener("click", () => {
    if (!requirePro("JSON Design Export")) return;
    readControls();
    const payload = JSON.stringify({ app: "Feathoria Studio", version: 7, state }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feathoria-preset-${safeFilename(state.quote.slice(0, 25))}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    showToast("Design JSON exported.");
  });

  elements.importJsonBtn?.addEventListener("click", () => {
    if (!requirePro("JSON Preset Import")) return;
    elements.jsonUploadInput?.click();
  });

  elements.jsonUploadInput?.addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!requirePro("JSON Preset Import")) {
      event.target.value = "";
      return;
    }
    if (file.size > MAX_JSON_SIZE) {
      showToast("Preset JSON file is too large.");
      event.target.value = "";
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const rawState = parsed && typeof parsed === "object" && parsed.state ? parsed.state : parsed;
      if (!rawState || typeof rawState !== "object") {
        throw new Error("Invalid preset structure.");
      }

      state = normalizeState(rawState);
      if (elements.bgUpload) elements.bgUpload.value = "";
      renderAll(true);
      recordHistory(true);
      showToast("JSON preset imported.");
    } catch (err) {
      console.error("JSON preset import error:", err);
      showToast("Could not import this JSON preset.");
    } finally {
      event.target.value = "";
    }
  });

  /* ==========================================================================
     10. INSPIRATION, SAVED DESIGNS & RESETS
     ========================================================================== */

  const PROMPTS = [
    "Write about a memory you wish you could visit once more.",
    "What would you say to the person you were five years ago?",
    "Describe a feeling that has no name.",
    "Write about the difference between being alone and feeling lonely.",
    "If silence could speak, what would it tell you?",
    "What if the life you are waiting for has already begun?",
    "Write about something you never said aloud.",
    "What would you do if you had nothing to prove?"
  ];

  elements.inspirationBtn?.addEventListener("click", () => {
    if (!elements.inspirationText) return;
    elements.inspirationText.textContent = randomItem(PROMPTS);
    elements.inspirationText.hidden = false;
  });

  function readSavedDesigns() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter(item => item && typeof item.id === "string" && item.data)
        : [];
    } catch {
      return [];
    }
  }

  function writeSavedDesigns(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (err) {
      showToast(err?.name === "QuotaExceededError"
        ? "Browser storage is full. Delete some saved designs."
        : "Unable to save designs in this browser.");
      return false;
    }
  }

  function saveDesign() {
    clearTimeout(historyTimer);
    readControls();
    commitHistory();

    const list = readSavedDesigns();
    const limit = isProUnlocked ? PRO_SAVED_LIMIT : FREE_SAVED_LIMIT;
    if (!isProUnlocked && list.length >= limit) {
      requirePro(`Saving More Than ${FREE_SAVED_LIMIT} Designs`);
      return;
    }

    list.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: state.quote.trim().replace(/\s+/g, " ").slice(0, 45) || "Untitled design",
      created: new Date().toISOString(),
      data: snapshot()
    });
    list.length = Math.min(list.length, limit);

    if (writeSavedDesigns(list)) showToast("Design saved successfully.");
  }

  elements.saveBtn?.addEventListener("click", saveDesign);

  function openSavedDialog() {
    renderSavedDesigns();
    if (elements.savedDialog?.showModal) {
      if (!elements.savedDialog.open) elements.savedDialog.showModal();
    } else {
      elements.savedDialog?.setAttribute("open", "");
    }
  }

  function closeSavedDialog() {
    if (elements.savedDialog?.close) {
      elements.savedDialog.close();
    } else {
      elements.savedDialog?.removeAttribute("open");
    }
  }

  elements.savedDesignsBtn?.addEventListener("click", openSavedDialog);
  elements.closeSavedBtn?.addEventListener("click", closeSavedDialog);
  elements.closeSavedBottomBtn?.addEventListener("click", closeSavedDialog);
  elements.savedDialog?.addEventListener("click", e => {
    if (e.target === elements.savedDialog) closeSavedDialog();
  });

  function renderSavedDesigns() {
    const container = elements.savedDesignList;
    if (!container) return;
    const list = readSavedDesigns();
    const limit = isProUnlocked ? PRO_SAVED_LIMIT : FREE_SAVED_LIMIT;

    if (elements.savedQuotaHint) {
      elements.savedQuotaHint.textContent =
        `Saved in this browser: ${list.length} / ${limit} slots (${isProUnlocked ? "Pro" : "Free"}).`;
    }

    if (!list.length) {
      container.innerHTML = `<p class="empty-saved">No saved designs yet. Create something beautiful and save it here.</p>`;
      return;
    }

    container.innerHTML = list.map(item => {
      const d = new Date(item.created);
      const dateStr = Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
      return `
        <div class="saved-item" data-id="${escapeHTML(item.id)}">
          <div class="saved-item-info">
            <p>${escapeHTML(item.name || "Untitled design")}</p>
            <small>${escapeHTML(dateStr)}</small>
          </div>
          <div class="saved-item-actions">
            <button type="button" data-action="load">Open</button>
            <button type="button" data-action="delete">Delete</button>
          </div>
        </div>
      `;
    }).join("");
  }

  elements.savedDesignList?.addEventListener("click", event => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.closest(".saved-item")?.dataset.id;
    if (!id) return;

    const list = readSavedDesigns();
    const selected = list.find(d => d.id === id);
    if (!selected) return;

    if (btn.dataset.action === "load") {
      state = normalizeState(clone(selected.data));
      renderAll(true);
      resetHistory();
      closeSavedDialog();
      showToast("Saved design restored.");
    } else if (btn.dataset.action === "delete") {
      const next = list.filter(d => d.id !== id);
      if (writeSavedDesigns(next)) {
        renderSavedDesigns();
        showToast("Saved design deleted.");
      }
    }
  });

  function resetDesign() {
    uploadToken++;
    processingUpload = false;
    state = clone(DEFAULTS);
    if (elements.bgUpload) elements.bgUpload.value = "";
    if (elements.inspirationText) elements.inspirationText.hidden = true;
    renderAll(true);
    resetHistory();
    showToast("Studio settings reset.");
  }

  elements.resetBtn?.addEventListener("click", resetDesign);

  elements.previewResetBtn?.addEventListener("click", () => {
    state.backgroundZoom = 100;
    state.backgroundX = 50;
    state.backgroundY = 50;
    renderAll(true);
    recordHistory(true);
    showToast("Background position reset.");
  });

  /* ==========================================================================
     11. IMAGE EXPORT ENGINE
     ========================================================================== */

  function getDimensions() {
    switch (state.aspect) {
      case "portrait": return { width: 1080, height: 1350, name: "portrait" };
      case "story":    return { width: 1080, height: 1920, name: "story" };
      case "banner":   return { width: 1920, height: 1080, name: "landscape" };
      default:         return { width: 1080, height: 1080, name: "square" };
    }
  }

  function getFoilFallbackColor(foil) {
    switch (foil) {
      case "gold":   return "#f7e2b5";
      case "rose":   return "#f9cadf";
      case "aurora": return "#d8f5f0";
      default:       return state.textColor;
    }
  }

  function makeExportClone(dimensions) {
    const exportEl = quotePreview.cloneNode(true);
    const { width, height } = dimensions;

    Object.assign(exportEl.style, {
      width: `${width}px`,
      height: `${height}px`,
      maxWidth: "none",
      minWidth: "0",
      minHeight: "0",
      aspectRatio: "auto",
      position: "relative",
      display: "flex",
      margin: "0",
      transform: "none",
      boxShadow: "none",
      overflow: "hidden",
      borderRadius: `${state.borderRadius}px`
    });
    exportEl.classList.remove(...ASPECTS, "foil-gold", "foil-rose", "foil-aurora");

    const bg = exportEl.querySelector("#quoteBackground");
    const overlay = exportEl.querySelector("#quoteOverlay");
    const text = exportEl.querySelector("#quoteText");
    const author = exportEl.querySelector("#quoteAuthor");
    const watermark = exportEl.querySelector("#watermark");
    const logo = exportEl.querySelector("#logo");

    if (!bg || !overlay || !text || !author) throw new Error("Missing export layers.");

    let bgImage = "";
    if (state.customBackground) {
      bgImage = `url("${state.customBackground}")`;
    } else if (isProUnlocked && state.useCustomGradient) {
      bgImage = buildCustomGradientCSS(state);
    }

    Object.assign(bg.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      backgroundImage: bgImage,
      backgroundSize: state.customBackground ? `${state.backgroundZoom}%` : "cover",
      backgroundPosition: state.customBackground ? `${state.backgroundX}% ${state.backgroundY}%` : "center",
      filter: quoteBackground.style.filter,
      transform: quoteBackground.style.transform
    });
    bg.style.setProperty("--overlay-opacity", String(state.overlay / 100));

    const previewWidth = quotePreview.getBoundingClientRect().width || 500;
    const scale = width / previewWidth;
    const resolvedColor = isProUnlocked && state.textFoil !== "none"
      ? getFoilFallbackColor(state.textFoil)
      : state.textColor;

    Object.assign(overlay.style, {
      width: "100%",
      height: "100%",
      maxHeight: "none",
      overflow: "visible",
      padding: `${previewWidth * 0.11 * scale}px`
    });

    Object.assign(text.style, {
      fontSize: `${state.fontSize * scale}px`,
      letterSpacing: `${state.letterSpacing * scale}px`,
      lineHeight: String(state.lineHeight),
      fontWeight: state.bold ? "700" : "400",
      fontStyle: state.italic ? "italic" : "normal",
      textTransform: state.uppercase ? "uppercase" : "none",
      textAlign: state.textAlign,
      color: resolvedColor,
      marginBottom: `${22 * scale}px`
    });

    author.style.fontSize = `${state.authorSize * scale}px`;
    author.style.color = resolvedColor;

    if (watermark) {
      Object.assign(watermark.style, {
        fontSize: `${10 * scale}px`,
        bottom: `${16 * scale}px`,
        right: `${18 * scale}px`,
        opacity: String(state.watermarkOpacity / 100)
      });
    }

    if (logo) {
      Object.assign(logo.style, {
        width: `${34 * scale}px`,
        height: `${34 * scale}px`,
        bottom: `${13 * scale}px`,
        left: `${15 * scale}px`
      });
    }

    return exportEl;
  }

  async function waitForAssets(container) {
    try {
      if (document.fonts?.ready) await document.fonts.ready;
    } catch {}

    const imgs = [...container.querySelectorAll("img")];
    await Promise.all(imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(resolve => {
        let done = false;
        const finish = () => {
          if (!done) {
            done = true;
            clearTimeout(t);
            resolve();
          }
        };
        img.addEventListener("load", finish, { once: true });
        img.addEventListener("error", finish, { once: true });
        const t = setTimeout(finish, 7000);
      });
    }));
  }

  function canvasToDownloadBlob(canvas, format) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        b => b ? resolve(b) : reject(new Error("Blob conversion failed.")),
        format === "jpeg" ? "image/jpeg" : "image/png",
        format === "jpeg" ? 0.94 : undefined
      );
    });
  }

  async function exportImage() {
    if (exporting || processingUpload) return;

    const requestedScale = Number(elements.exportQuality?.value || 2);
    if (!isProUnlocked && requestedScale > 2) {
      elements.exportQuality.value = "2";
      requirePro("Ultra 3x Export Resolution");
      return;
    }

    if (typeof window.html2canvas !== "function") {
      setStatus("Image export is unavailable. Refresh the page and try again.", "error");
      showToast("Export library is unavailable.");
      return;
    }

    exporting = true;
    const btn = elements.downloadBtn;
    const origLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Preparing design...";
    setStatus("Preparing your design...");

    let wrapper = null;
    let canvas = null;
    let objectURL = null;

    try {
      clearTimeout(historyTimer);
      readControls();
      renderAll(false);

      const dimensions = getDimensions();
      const scale = clamp(requestedScale, 1, isProUnlocked ? 3 : 2);
      const format = elements.exportFormat?.value === "jpeg" ? "jpeg" : "png";
      const exportClone = makeExportClone(dimensions);

      wrapper = document.createElement("div");
      Object.assign(wrapper.style, {
        position: "fixed",
        left: "-10000px",
        top: "0",
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: "-9999",
        background: format === "jpeg" ? "#171127" : "transparent"
      });
      wrapper.appendChild(exportClone);
      document.body.appendChild(wrapper);

      await waitForAssets(wrapper);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      btn.textContent = "Rendering...";
      setStatus("Rendering your creation...");

      canvas = await window.html2canvas(exportClone, {
        width: dimensions.width,
        height: dimensions.height,
        scale,
        backgroundColor: format === "jpeg" ? "#171127" : null,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 15000,
        scrollX: 0,
        scrollY: 0,
        windowWidth: dimensions.width,
        windowHeight: dimensions.height
      });

      const blob = await canvasToDownloadBlob(canvas, format);
      objectURL = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectURL;
      const filename = safeFilename(state.quote.trim().slice(0, 35) || "feathoria-design");
      a.download = `feathoria-${dimensions.name}-${filename}.${format === "jpeg" ? "jpg" : "png"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setStatus("Your creation has been downloaded. ✨", "success");
      showToast("Your design is ready!");
    } catch (err) {
      console.error("Feathoria export error:", err);
      setStatus("Export failed. Try a lower quality or another background.", "error");
      showToast("Something went wrong during export.");
    } finally {
      wrapper?.remove();
      if (canvas) {
        canvas.width = 1;
        canvas.height = 1;
      }
      if (objectURL) {
        setTimeout(() => URL.revokeObjectURL(objectURL), 10000);
      }
      btn.disabled = false;
      btn.textContent = origLabel;
      exporting = false;
    }
  }

  elements.downloadBtn.addEventListener("click", exportImage);

  /* ==========================================================================
     12. SHORTCUTS & INIT
     ========================================================================== */

  function isTypingTarget(el) {
    return el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement ||
      Boolean(el?.isContentEditable);
  }

  document.addEventListener("keydown", e => {
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();
    if (mod && (key === "z" || key === "y") && isTypingTarget(e.target)) return;

    if (mod && key === "z") {
      e.preventDefault();
      return e.shiftKey ? redo() : undo();
    }
    if (mod && key === "y") {
      e.preventDefault();
      return redo();
    }
    if (mod && key === "s") {
      e.preventDefault();
      return saveDesign();
    }
    if (e.key === "Escape") {
      if (elements.savedDialog?.open) closeSavedDialog();
      if (elements.proDialog?.open) closeProDialog();
    }
  });

  window.addEventListener("resize", checkTextOverflow);

  setText("year", new Date().getFullYear());
  state = normalizeState(DEFAULTS);
  syncProUI();
  renderAll(true);
  resetHistory();
  setStatus("");
});