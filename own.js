/* ============================================================
   FEATHORIA STUDIO — ADVANCED DESIGN ENGINE
   Version 4.0
   Features:
   • Live quote & poetry preview
   • Advanced typography controls
   • 12 backgrounds + optimized custom uploads
   • Background positioning, filters, brightness, blur, overlay
   • 8 professional templates
   • Random design generator
   • Writing inspiration prompts
   • Undo / redo history
   • Saved designs with local storage
   • PNG / JPEG export
   • Square / portrait / story / landscape
   • Keyboard shortcuts
   • Responsive & performance-conscious rendering
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* ==========================================================
     01. DOM HELPERS
     ========================================================== */

  const $ = id => document.getElementById(id);

  const elements = {
    quoteInput: $("quoteInput"),
    authorInput: $("authorInput"),

    quotePreview: $("quotePreview"),
    quoteBackground: $("quoteBackground"),
    quoteOverlay: $("quoteOverlay"),
    quoteText: $("quoteText"),
    quoteAuthor: $("quoteAuthor"),

    fontSelect: $("fontSelect"),
    fontSize: $("fontSize"),
    letterSpacing: $("letterSpacing"),
    lineHeight: $("lineHeight"),
    textAlign: $("textAlign"),
    textColor: $("textColor"),
    authorSize: $("authorSize"),

    boldBtn: $("boldBtn"),
    italicBtn: $("italicBtn"),
    uppercaseBtn: $("uppercaseBtn"),

    bgUpload: $("bgUpload"),
    removeCustomBg: $("removeCustomBg"),

    backgroundZoom: $("backgroundZoom"),
    backgroundX: $("backgroundX"),
    backgroundY: $("backgroundY"),

    brightnessRange: $("brightnessRange"),
    blurRange: $("blurRange"),
    overlayRange: $("overlayRange"),

    shadowToggle: $("shadowToggle"),
    logoToggle: $("logoToggle"),

    watermark: $("watermark"),
    watermarkText: $("watermarkText"),
    watermarkOpacity: $("watermarkOpacity"),

    borderStyle: $("borderStyle"),
    borderRadius: $("borderRadius"),
    aspectSelect: $("aspectSelect"),

    downloadBtn: $("downloadBtn"),
    exportFormat: $("exportFormat"),
    exportQuality: $("exportQuality"),
    downloadStatus: $("downloadStatus"),

    quoteCounter: $("quoteCounter"),
    authorCounter: $("authorCounter"),

    undoBtn: $("undoBtn"),
    redoBtn: $("redoBtn"),

    saveBtn: $("saveBtn"),
    savedDesignsBtn: $("savedDesignsBtn"),

    resetBtn: $("resetBtn"),
    previewResetBtn: $("previewResetBtn"),

    randomBtn: $("randomBtn"),
    inspirationBtn: $("inspirationBtn"),
    inspirationText: $("inspirationText"),

    savedDialog: $("savedDialog"),
    savedDesignList: $("savedDesignList"),

    closeSavedBtn: $("closeSavedBtn"),
    closeSavedBottomBtn: $("closeSavedBottomBtn"),

    toast: $("toast"),
    formatLabel: $("formatLabel")
  };

  const requiredElements = [
    "quotePreview",
    "quoteBackground",
    "quoteOverlay",
    "quoteText",
    "quoteAuthor",
    "downloadBtn"
  ];

  for (const key of requiredElements) {
    if (!elements[key]) {
      console.error(
        `Feathoria Studio: Required element #${key} is missing.`
      );
      return;
    }
  }

  const {
    quoteInput,
    authorInput,
    quotePreview,
    quoteBackground,
    quoteOverlay,
    quoteText,
    quoteAuthor
  } = elements;


  /* ==========================================================
     02. CONSTANTS
     ========================================================== */

  const STORAGE_KEY = "feathoria_studio_designs_v2";

  const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;
  const MAX_IMAGE_DIMENSION = 1800;
  const MAX_SAVED_DESIGNS = 30;
  const MAX_HISTORY = 60;

  const HISTORY_DELAY = 300;

  const BACKGROUNDS = [
    "bg1", "bg2", "bg3", "bg4",
    "bg5", "bg6", "bg7", "bg8",
    "bg9", "bg10", "bg11", "bg12"
  ];

  const ASPECTS = [
    "square",
    "portrait",
    "story",
    "banner"
  ];

  const FILTERS = [
    "none",
    "dreamy",
    "warm",
    "cool",
    "bw",
    "vintage"
  ];

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
    authorSize: 20,

    bold: false,
    italic: false,
    uppercase: false,

    background: "bg1",
    customBackground: null,

    backgroundZoom: 100,
    backgroundX: 50,
    backgroundY: 50,

    brightness: 100,
    blur: 0,
    overlay: 20,

    filter: "none",

    shadow: false,
    logo: true,

    watermarkText: "FEATHORIA",
    watermarkOpacity: 70,

    borderStyle: "none",
    borderRadius: 20,

    aspect: "square"
  };


  /* ==========================================================
     03. STATE
     ========================================================== */

  let state = clone(DEFAULTS);

  let history = [];
  let historyIndex = -1;

  let historyTimer = null;

  let exporting = false;
  let processingUpload = false;

  let toastTimer = null;
  let uploadToken = 0;

  let lastRenderTime = 0;

  let renderQueued = false;


  /* ==========================================================
     04. UTILITIES
     ========================================================== */

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function setText(id, value) {
    const element = $(id);

    if (element) {
      element.textContent = value;
    }
  }

  function setValue(id, value) {
    const element = $(id);

    if (element && value !== undefined && value !== null) {
      element.value = value;
    }
  }

  function formatNumber(value) {
    return Number(value)
      .toFixed(2)
      .replace(/\.?0+$/, "");
  }

  function validHex(value) {
    return /^#[0-9a-fA-F]{6}$/.test(value);
  }

  function safeFilename(value) {
    return String(value || "creation")
      .normalize("NFKD")
      .replace(/[^\w-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 45) || "creation";
  }

  function safeString(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
  }

  function setStatus(message, type = "normal") {
    const element = elements.downloadStatus;

    if (!element) return;

    element.textContent = message;

    element.style.color =
      type === "error" ? "#ff9999" :
      type === "success" ? "#9fe0bb" :
      "";
  }

  function showToast(message) {
    const toast = elements.toast;

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  }

  function safeSetAttribute(element, name, value) {
    if (element) {
      element.setAttribute(name, String(value));
    }
  }

  function isValidStateValue(value, allowed) {
    return allowed.includes(value);
  }


  /* ==========================================================
     05. STATE NORMALIZATION
     ========================================================== */

  function normalizeState(input) {
    const source = input && typeof input === "object"
      ? input
      : {};

    const result = {
      ...clone(DEFAULTS),
      ...source
    };

    result.quote = safeString(result.quote).slice(0, 1200);
    result.author = safeString(result.author).slice(0, 80);

    result.font = isValidStateValue(result.font, FONTS)
      ? result.font
      : DEFAULTS.font;

    result.background = isValidStateValue(
      result.background,
      BACKGROUNDS
    )
      ? result.background
      : DEFAULTS.background;

    result.aspect = isValidStateValue(
      result.aspect,
      ASPECTS
    )
      ? result.aspect
      : DEFAULTS.aspect;

    result.filter = isValidStateValue(
      result.filter,
      FILTERS
    )
      ? result.filter
      : DEFAULTS.filter;

    result.textAlign = ["left", "center", "right"].includes(
      result.textAlign
    )
      ? result.textAlign
      : "center";

    result.textColor = validHex(result.textColor)
      ? result.textColor
      : DEFAULTS.textColor;

    result.fontSize = clamp(
      Number(result.fontSize) || DEFAULTS.fontSize,
      10,
      150
    );

    result.letterSpacing = clamp(
      Number(result.letterSpacing) || 0,
      -5,
      15
    );

    result.lineHeight = clamp(
      Number(result.lineHeight) || DEFAULTS.lineHeight,
      0.8,
      3
    );

    result.authorSize = clamp(
      Number(result.authorSize) || DEFAULTS.authorSize,
      8,
      100
    );

    result.backgroundZoom = clamp(
      Number(result.backgroundZoom) || 100,
      50,
      300
    );

    result.backgroundX = clamp(
      Number(result.backgroundX) || 50,
      0,
      100
    );

    result.backgroundY = clamp(
      Number(result.backgroundY) || 50,
      0,
      100
    );

    result.brightness = clamp(
      Number(result.brightness) || 100,
      0,
      200
    );

    result.blur = clamp(
      Number(result.blur) || 0,
      0,
      20
    );

    result.overlay = clamp(
      Number(result.overlay) || 0,
      0,
      100
    );

    result.watermarkOpacity = clamp(
      Number(result.watermarkOpacity) || 0,
      0,
      100
    );

    result.borderRadius = clamp(
      Number(result.borderRadius) || 0,
      0,
      100
    );

    result.watermarkText = safeString(
      result.watermarkText,
      DEFAULTS.watermarkText
    ).slice(0, 50);

    result.bold = Boolean(result.bold);
    result.italic = Boolean(result.italic);
    result.uppercase = Boolean(result.uppercase);

    result.shadow = Boolean(result.shadow);
    result.logo = Boolean(result.logo);

    if (
      typeof result.customBackground !== "string" ||
      !result.customBackground.startsWith("data:image/")
    ) {
      result.customBackground = null;
    }

    if (!["none", "thin", "gold", "double"].includes(result.borderStyle)) {
      result.borderStyle = "none";
    }

    return result;
  }


  /* ==========================================================
     06. HISTORY SYSTEM
     ========================================================== */

  function historySnapshot() {
    return clone(state);
  }

  function updateHistoryButtons() {
    if (elements.undoBtn) {
      elements.undoBtn.disabled = historyIndex <= 0;
    }

    if (elements.redoBtn) {
      elements.redoBtn.disabled =
        historyIndex >= history.length - 1;
    }
  }

  function resetHistory() {
    clearTimeout(historyTimer);

    history = [historySnapshot()];
    historyIndex = 0;

    updateHistoryButtons();
  }

  function commitHistory() {
    clearTimeout(historyTimer);

    const snapshot = historySnapshot();
    const current = history[historyIndex];

    if (
      current &&
      JSON.stringify(current) === JSON.stringify(snapshot)
    ) {
      updateHistoryButtons();
      return;
    }

    history = history.slice(0, historyIndex + 1);

    history.push(snapshot);

    if (history.length > MAX_HISTORY) {
      history.shift();
    }

    historyIndex = history.length - 1;

    updateHistoryButtons();
  }

  function recordHistory(immediate = false) {
    clearTimeout(historyTimer);

    if (immediate) {
      commitHistory();
      return;
    }

    historyTimer = setTimeout(() => {
      commitHistory();
    }, HISTORY_DELAY);
  }

  function undo() {
    clearTimeout(historyTimer);

    if (historyIndex <= 0) return;

    historyIndex--;

    state = normalizeState(
      clone(history[historyIndex])
    );

    renderAll();
    updateHistoryButtons();

    showToast("Undo complete.");
  }

  function redo() {
    clearTimeout(historyTimer);

    if (historyIndex >= history.length - 1) return;

    historyIndex++;

    state = normalizeState(
      clone(history[historyIndex])
    );

    renderAll();
    updateHistoryButtons();

    showToast("Redo complete.");
  }

  elements.undoBtn?.addEventListener("click", undo);
  elements.redoBtn?.addEventListener("click", redo);


  /* ==========================================================
     07. READ CONTROLS
     ========================================================== */

  function readControls() {
    state.quote = quoteInput?.value ?? state.quote;
    state.author = authorInput?.value ?? state.author;

    state.font = elements.fontSelect?.value ?? state.font;

    state.fontSize = Number(
      elements.fontSize?.value ?? state.fontSize
    );

    state.letterSpacing = Number(
      elements.letterSpacing?.value ?? state.letterSpacing
    );

    state.lineHeight = Number(
      elements.lineHeight?.value ?? state.lineHeight
    );

    state.textAlign =
      elements.textAlign?.value ?? state.textAlign;

    state.textColor =
      elements.textColor?.value ?? state.textColor;

    state.authorSize = Number(
      elements.authorSize?.value ?? state.authorSize
    );

    state.bold =
      elements.boldBtn?.getAttribute("aria-pressed") === "true";

    state.italic =
      elements.italicBtn?.getAttribute("aria-pressed") === "true";

    state.uppercase =
      elements.uppercaseBtn?.getAttribute("aria-pressed") === "true";

    state.backgroundZoom = Number(
      elements.backgroundZoom?.value ?? state.backgroundZoom
    );

    state.backgroundX = Number(
      elements.backgroundX?.value ?? state.backgroundX
    );

    state.backgroundY = Number(
      elements.backgroundY?.value ?? state.backgroundY
    );

    state.brightness = Number(
      elements.brightnessRange?.value ?? state.brightness
    );

    state.blur = Number(
      elements.blurRange?.value ?? state.blur
    );

    state.overlay = Number(
      elements.overlayRange?.value ?? state.overlay
    );

    state.shadow = Boolean(
      elements.shadowToggle?.checked
    );

    state.logo = Boolean(
      elements.logoToggle?.checked
    );

    state.watermarkText =
      elements.watermarkText?.value ?? state.watermarkText;

    state.watermarkOpacity = Number(
      elements.watermarkOpacity?.value ?? state.watermarkOpacity
    );

    state.borderStyle =
      elements.borderStyle?.value ?? state.borderStyle;

    state.borderRadius = Number(
      elements.borderRadius?.value ?? state.borderRadius
    );

    state.aspect =
      elements.aspectSelect?.value ?? state.aspect;

    state = normalizeState(state);

    return state;
  }


  /* ==========================================================
     08. RENDER CONTROLS
     ========================================================== */

  function renderControls() {
    const values = {
      quoteInput: state.quote,
      authorInput: state.author,

      fontSelect: state.font,
      fontSize: state.fontSize,
      letterSpacing: state.letterSpacing,
      lineHeight: state.lineHeight,
      textAlign: state.textAlign,

      textColor: state.textColor,
      authorSize: state.authorSize,

      backgroundZoom: state.backgroundZoom,
      backgroundX: state.backgroundX,
      backgroundY: state.backgroundY,

      brightnessRange: state.brightness,
      blurRange: state.blur,
      overlayRange: state.overlay,

      watermarkText: state.watermarkText,
      watermarkOpacity: state.watermarkOpacity,

      borderStyle: state.borderStyle,
      borderRadius: state.borderRadius,
      aspectSelect: state.aspect
    };

    Object.entries(values).forEach(([id, value]) => {
      setValue(id, value);
    });

    safeSetAttribute(
      elements.boldBtn,
      "aria-pressed",
      state.bold
    );

    safeSetAttribute(
      elements.italicBtn,
      "aria-pressed",
      state.italic
    );

    safeSetAttribute(
      elements.uppercaseBtn,
      "aria-pressed",
      state.uppercase
    );

    if (elements.shadowToggle) {
      elements.shadowToggle.checked = state.shadow;
    }

    if (elements.logoToggle) {
      elements.logoToggle.checked = state.logo;
    }

    renderBackgroundButtons();
    renderFilterButtons();
  }


  /* ==========================================================
     09. BACKGROUND SELECTORS
     ========================================================== */

  function renderBackgroundButtons() {
    document.querySelectorAll(".background-swatch").forEach(button => {
      const active =
        !state.customBackground &&
        button.dataset.background === state.background;

      button.classList.toggle("active", active);

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });
  }

  function applyBackground() {
    quoteBackground.className = "quote-background";

    if (state.customBackground) {
      quoteBackground.style.backgroundImage =
        `url("${state.customBackground}")`;

      quoteBackground.style.backgroundColor = "transparent";

      quoteBackground.style.backgroundSize =
        `${state.backgroundZoom}%`;

      quoteBackground.style.backgroundPosition =
        `${state.backgroundX}% ${state.backgroundY}%`;

      if (elements.removeCustomBg) {
        elements.removeCustomBg.hidden = false;
      }
    } else {
      quoteBackground.classList.add(state.background);

      quoteBackground.style.backgroundImage = "";
      quoteBackground.style.backgroundColor = "";

      quoteBackground.style.backgroundSize = "cover";
      quoteBackground.style.backgroundPosition = "center";

      if (elements.removeCustomBg) {
        elements.removeCustomBg.hidden = true;
      }
    }

    const filterMap = {
      none: "",
      dreamy: "saturate(1.25) brightness(1.06)",
      warm: "sepia(0.25) saturate(1.15)",
      cool: "hue-rotate(12deg) saturate(1.1)",
      bw: "grayscale(1) contrast(1.15)",
      vintage: "sepia(0.45) saturate(0.85) contrast(0.95)"
    };

    const filters = [
      `brightness(${state.brightness}%)`,
      filterMap[state.filter] || ""
    ];

    if (state.blur > 0) {
      filters.push(`blur(${state.blur}px)`);
    }

    quoteBackground.style.filter =
      filters.filter(Boolean).join(" ");

    const zoom = state.backgroundZoom / 100;

    quoteBackground.style.transform =
      `scale(${zoom + (state.blur > 0 ? 0.08 : 0)})`;

    quoteBackground.style.setProperty(
      "--overlay-opacity",
      String(state.overlay / 100)
    );

    quoteBackground.style.backgroundRepeat = "no-repeat";

    renderBackgroundButtons();
  }


  /* ==========================================================
     10. BACKGROUND BUTTON EVENTS
     ========================================================== */

  document.querySelectorAll(".background-swatch").forEach(button => {
    button.addEventListener("click", () => {
      const background = button.dataset.background;

      if (!BACKGROUNDS.includes(background)) return;

      state.background = background;
      state.customBackground = null;

      if (elements.bgUpload) {
        elements.bgUpload.value = "";
      }

      renderAll(false);
      recordHistory(true);
    });
  });


  /* ==========================================================
     11. CUSTOM BACKGROUND PROCESSING
     ========================================================== */

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const objectURL = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        URL.revokeObjectURL(objectURL);
        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectURL);
        reject(new Error("Image could not be decoded."));
      };

      image.src = objectURL;
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise(resolve => {
      canvas.toBlob(
        blob => resolve(blob),
        type,
        quality
      );
    });
  }

  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Image conversion failed."));

      reader.readAsDataURL(blob);
    });
  }

  async function optimizeUploadedImage(file) {
    const image = await loadImageFromFile(file);

    let width = image.naturalWidth;
    let height = image.naturalHeight;

    const largest = Math.max(width, height);

    if (largest > MAX_IMAGE_DIMENSION) {
      const ratio = MAX_IMAGE_DIMENSION / largest;

      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
      alpha: false
    });

    if (!context) {
      throw new Error("Canvas is unavailable.");
    }

    context.fillStyle = "#171127";
    context.fillRect(0, 0, width, height);

    context.drawImage(image, 0, 0, width, height);

    let blob = await canvasToBlob(
      canvas,
      "image/webp",
      0.84
    );

    if (!blob) {
      blob = await canvasToBlob(
        canvas,
        "image/jpeg",
        0.86
      );
    }

    if (!blob) {
      throw new Error("Image compression failed.");
    }

    // Release canvas memory.
    canvas.width = 1;
    canvas.height = 1;

    return await blobToDataURL(blob);
  }


  /* ==========================================================
     12. UPLOAD EVENT
     ========================================================== */

  elements.bgUpload?.addEventListener("change", async event => {
    const file = event.target.files?.[0];

    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!validTypes.includes(file.type)) {
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

    if (elements.downloadBtn) {
      elements.downloadBtn.disabled = true;
    }

    showToast("Optimizing your background...");

    try {
      const optimized = await optimizeUploadedImage(file);

      // Prevent stale uploads from replacing a newer selection.
      if (token !== uploadToken) return;

      state.customBackground = optimized;

      renderAll(false);
      recordHistory(true);

      showToast("Background added successfully.");
    } catch (error) {
      console.error("Background upload error:", error);

      showToast("Could not process this image.");
      event.target.value = "";
    } finally {
      if (token === uploadToken) {
        processingUpload = false;

        if (elements.downloadBtn) {
          elements.downloadBtn.disabled = false;
        }
      }
    }
  });


  /* ==========================================================
     13. REMOVE CUSTOM BACKGROUND
     ========================================================== */

  elements.removeCustomBg?.addEventListener("click", () => {
    if (!state.customBackground) return;

    state.customBackground = null;
    state.background = DEFAULTS.background;

    if (elements.bgUpload) {
      elements.bgUpload.value = "";
    }

    renderAll(false);
    recordHistory(true);

    showToast("Custom background removed.");
  });


  /* ==========================================================
     14. FILTERS
     ========================================================== */

  function renderFilterButtons() {
    document.querySelectorAll("[data-filter]").forEach(button => {
      const active = button.dataset.filter === state.filter;

      button.classList.toggle("active-filter", active);

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });
  }

  document.querySelectorAll("#filterButtons [data-filter]").forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      if (!FILTERS.includes(filter)) return;

      state.filter = filter;

      renderAll(false);
      recordHistory(true);
    });
  });


  /* ==========================================================
     15. TYPOGRAPHY
     ========================================================== */

  function applyTypography() {
    const font = FONTS.includes(state.font)
      ? state.font
      : DEFAULTS.font;

    state.font = font;

    quoteText.style.fontFamily = `"${font}", serif`;
    quoteAuthor.style.fontFamily = `"${font}", serif`;

    quoteText.style.fontSize = `${state.fontSize}px`;
    quoteText.style.letterSpacing = `${state.letterSpacing}px`;
    quoteText.style.lineHeight = String(state.lineHeight);
    quoteText.style.textAlign = state.textAlign;

    quoteText.style.fontWeight =
      state.bold ? "700" : "400";

    quoteText.style.fontStyle =
      state.italic ? "italic" : "normal";

    quoteText.style.textTransform =
      state.uppercase ? "uppercase" : "none";

    quoteText.style.color = state.textColor;
    quoteAuthor.style.color = state.textColor;

    quoteAuthor.style.fontSize =
      `${state.authorSize}px`;

    quotePreview.classList.toggle(
      "text-shadow",
      state.shadow
    );

    setText("fontSizeValue", `${state.fontSize} px`);

    setText(
      "letterSpacingValue",
      `${formatNumber(state.letterSpacing)} px`
    );

    setText(
      "lineHeightValue",
      formatNumber(state.lineHeight)
    );

    setText(
      "authorSizeValue",
      `${state.authorSize} px`
    );

    setText(
      "textColorValue",
      state.textColor.toUpperCase()
    );
  }


  /* ==========================================================
     16. WATERMARK AND LOGO
     ========================================================== */

  function applyDecoration() {
    if (elements.watermark) {
      elements.watermark.textContent = state.watermarkText;

      elements.watermark.style.opacity =
        String(state.watermarkOpacity / 100);

      elements.watermark.hidden =
        !state.watermarkText.trim();
    }

    const logo = $("logo");

    if (logo) {
      logo.hidden = !state.logo;
    }

    quotePreview.style.borderRadius =
      `${state.borderRadius}px`;

    const borderStyles = {
      none: "none",
      thin: "1px solid rgba(255,255,255,.75)",
      gold: "2px solid #e9c98a",
      double: "4px double rgba(255,255,255,.85)"
    };

    quotePreview.style.border =
      borderStyles[state.borderStyle] || "none";
  }


  /* ==========================================================
     17. ASPECT RATIOS
     ========================================================== */

  function applyAspect() {
    if (!ASPECTS.includes(state.aspect)) {
      state.aspect = "square";
    }

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


  /* ==========================================================
     18. TEXT AND COUNTERS
     ========================================================== */

  function applyText() {
    quoteText.textContent =
      state.quote.trim() || "Your words will live here...";

    quoteAuthor.textContent =
      state.author.trim()
        ? `— ${state.author.trim()}`
        : "";

    setText(
      "quoteCounter",
      `${state.quote.length} / 1200`
    );

    setText(
      "authorCounter",
      `${state.author.length} / 80`
    );
  }


  /* ==========================================================
     19. RANGE LABELS
     ========================================================== */

  function updateRangeLabels() {
    const labels = {
      backgroundZoomValue: `${state.backgroundZoom}%`,
      backgroundXValue: `${state.backgroundX}%`,
      backgroundYValue: `${state.backgroundY}%`,
      brightnessValue: `${state.brightness}%`,
      blurValue: `${state.blur} px`,
      overlayValue: `${state.overlay}%`,
      watermarkOpacityValue: `${state.watermarkOpacity}%`,
      borderRadiusValue: `${state.borderRadius} px`
    };

    Object.entries(labels).forEach(([id, value]) => {
      setText(id, value);
    });
  }


  /* ==========================================================
     20. PREVIEW RENDERING
     ========================================================== */

  function renderAll(syncControls = true) {
    if (syncControls) {
      renderControls();
    }

    applyText();
    applyTypography();
    applyBackground();
    applyDecoration();
    applyAspect();
    updateRangeLabels();

    lastRenderTime = performance.now();
  }

  // Optional frame scheduling helper for slider updates.
  function scheduleRender() {
    if (renderQueued) return;

    renderQueued = true;

    requestAnimationFrame(() => {
      renderQueued = false;

      readControls();
      renderAll(false);
    });
  }


  /* ==========================================================
     21. LIVE INPUT CONTROLS
     ========================================================== */

  const liveControlIds = [
    "quoteInput",
    "authorInput",

    "fontSelect",
    "fontSize",
    "letterSpacing",
    "lineHeight",
    "textAlign",
    "textColor",
    "authorSize",

    "backgroundZoom",
    "backgroundX",
    "backgroundY",

    "brightnessRange",
    "blurRange",
    "overlayRange",

    "watermarkText",
    "watermarkOpacity",

    "borderStyle",
    "borderRadius",
    "aspectSelect"
  ];

  liveControlIds.forEach(id => {
    const element = $(id);

    if (!element) return;

    element.addEventListener("input", () => {
      scheduleRender();
      recordHistory(false);
    });

    element.addEventListener("change", () => {
      clearTimeout(historyTimer);

      readControls();
      renderAll(false);
      recordHistory(true);
    });
  });


  /* ==========================================================
     22. FORMATTING TOGGLES
     ========================================================== */

  function toggleFormatting(property, button) {
    state[property] = !state[property];

    safeSetAttribute(
      button,
      "aria-pressed",
      state[property]
    );

    applyTypography();
    recordHistory(true);
  }

  elements.boldBtn?.addEventListener("click", () => {
    toggleFormatting("bold", elements.boldBtn);
  });

  elements.italicBtn?.addEventListener("click", () => {
    toggleFormatting("italic", elements.italicBtn);
  });

  elements.uppercaseBtn?.addEventListener("click", () => {
    toggleFormatting("uppercase", elements.uppercaseBtn);
  });


  /* ==========================================================
     23. SHADOW AND LOGO
     ========================================================== */

  elements.shadowToggle?.addEventListener("change", () => {
    state.shadow = elements.shadowToggle.checked;

    applyTypography();
    recordHistory(true);
  });

  elements.logoToggle?.addEventListener("change", () => {
    state.logo = elements.logoToggle.checked;

    applyDecoration();
    recordHistory(true);
  });


  /* ==========================================================
     24. QUICK COLOR BUTTONS
     ========================================================== */

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


  /* ==========================================================
     25. DESIGN TEMPLATES
     ========================================================== */

  const TEMPLATES = {
    midnight: {
      background: "bg7",
      font: "Playfair Display",
      fontSize: 34,
      letterSpacing: 0.5,
      lineHeight: 1.65,
      textAlign: "center",
      textColor: "#ffffff",
      authorSize: 19,
      bold: false,
      italic: false,
      uppercase: false,
      overlay: 28,
      brightness: 95,
      shadow: true,
      borderStyle: "thin",
      borderRadius: 14,
      aspect: "square"
    },

    minimal: {
      background: "bg11",
      font: "Montserrat",
      fontSize: 28,
      letterSpacing: 1,
      lineHeight: 1.7,
      textAlign: "center",
      textColor: "#30251d",
      authorSize: 15,
      bold: false,
      italic: false,
      uppercase: false,
      overlay: 0,
      brightness: 100,
      shadow: false,
      borderStyle: "thin",
      borderRadius: 4,
      aspect: "square"
    },

    romantic: {
      background: "bg8",
      font: "Cormorant Garamond",
      fontSize: 37,
      letterSpacing: 0.5,
      lineHeight: 1.7,
      textAlign: "center",
      textColor: "#fff3f5",
      authorSize: 20,
      bold: false,
      italic: true,
      uppercase: false,
      overlay: 25,
      brightness: 95,
      shadow: true,
      borderStyle: "gold",
      borderRadius: 22,
      aspect: "portrait"
    },

    poetry: {
      background: "bg10",
      font: "Lora",
      fontSize: 29,
      letterSpacing: 0,
      lineHeight: 1.9,
      textAlign: "left",
      textColor: "#f6eadb",
      authorSize: 17,
      bold: false,
      italic: false,
      uppercase: false,
      overlay: 22,
      brightness: 90,
      shadow: false,
      borderStyle: "thin",
      borderRadius: 10,
      aspect: "story"
    },

    vintage: {
      background: "bg11",
      font: "Libre Baskerville",
      fontSize: 27,
      letterSpacing: 0.3,
      lineHeight: 1.8,
      textAlign: "center",
      textColor: "#3b2a1e",
      authorSize: 16,
      bold: false,
      italic: true,
      uppercase: false,
      overlay: 0,
      brightness: 100,
      shadow: false,
      borderStyle: "gold",
      borderRadius: 5,
      aspect: "square"
    },

    cosmic: {
      background: "bg12",
      font: "Playfair Display",
      fontSize: 36,
      letterSpacing: 0.5,
      lineHeight: 1.7,
      textAlign: "center",
      textColor: "#ffffff",
      authorSize: 19,
      bold: false,
      italic: false,
      uppercase: false,
      overlay: 30,
      brightness: 90,
      shadow: true,
      borderStyle: "thin",
      borderRadius: 18,
      aspect: "story"
    },

    editorial: {
      background: "bg10",
      font: "Montserrat",
      fontSize: 32,
      letterSpacing: 1.5,
      lineHeight: 1.55,
      textAlign: "left",
      textColor: "#f4e9d6",
      authorSize: 15,
      bold: true,
      italic: false,
      uppercase: false,
      overlay: 25,
      brightness: 95,
      shadow: false,
      borderStyle: "none",
      borderRadius: 0,
      aspect: "banner"
    },

    dream: {
      background: "bg2",
      font: "Dancing Script",
      fontSize: 43,
      letterSpacing: 0,
      lineHeight: 1.55,
      textAlign: "center",
      textColor: "#ffffff",
      authorSize: 22,
      bold: false,
      italic: false,
      uppercase: false,
      overlay: 20,
      brightness: 100,
      shadow: true,
      borderStyle: "gold",
      borderRadius: 25,
      aspect: "portrait"
    }
  };

  document.querySelectorAll("[data-template]").forEach(button => {
    button.addEventListener("click", () => {
      const name = button.dataset.template;
      const template = TEMPLATES[name];

      if (!template) return;

      const currentQuote = quoteInput?.value || state.quote;
      const currentAuthor = authorInput?.value || state.author;

      state = normalizeState({
        ...clone(DEFAULTS),
        ...template,

        quote: currentQuote,
        author: currentAuthor,

        customBackground: null
      });

      if (elements.bgUpload) {
        elements.bgUpload.value = "";
      }

      renderAll();
      recordHistory(true);

      const templateName =
        button.textContent.trim() || name;

      showToast(`${templateName} template applied.`);
    });
  });


  /* ==========================================================
     26. RANDOM DESIGN GENERATOR
     ========================================================== */

  elements.randomBtn?.addEventListener("click", () => {
    state = normalizeState({
      ...state,

      background: randomItem(BACKGROUNDS),
      customBackground: null,

      font: randomItem(FONTS),
      fontSize: Math.floor(Math.random() * 17) + 26,

      letterSpacing: randomItem([0, 0.5, 1, 1.5]),
      lineHeight: randomItem([1.5, 1.6, 1.7, 1.8]),

      textAlign: randomItem([
        "center",
        "left",
        "right"
      ]),

      textColor: randomItem([
        "#ffffff",
        "#fff0dc",
        "#f7e6f2",
        "#f3e9ff"
      ]),

      authorSize: randomItem([16, 18, 20, 22]),

      bold: randomItem([true, false]),
      italic: randomItem([true, false]),
      uppercase: false,

      brightness: randomItem([85, 95, 100, 110]),
      overlay: randomItem([15, 20, 25, 35, 45]),

      filter: randomItem(FILTERS),

      shadow: randomItem([true, false]),

      borderStyle: randomItem([
        "none",
        "thin",
        "gold"
      ]),

      borderRadius: randomItem([
        0, 8, 15, 22, 30
      ]),

      aspect: randomItem(ASPECTS)
    });

    if (elements.bgUpload) {
      elements.bgUpload.value = "";
    }

    renderAll();
    recordHistory(true);

    showToast("A new design has been created.");
  });


  /* ==========================================================
     27. WRITING INSPIRATION
     ========================================================== */

  const PROMPTS = [
    "Write about a memory you wish you could visit once more.",
    "What would you say to the person you were five years ago?",
    "Describe a feeling that has no name.",
    "Write about the difference between being alone and feeling lonely.",
    "If silence could speak, what would it tell you?",
    "Write a letter to a version of yourself that never existed.",
    "What does freedom mean when nobody is watching?",
    "Describe a beautiful thing that also hurts.",
    "Write about a question you are afraid to answer.",
    "What if the life you are waiting for has already begun?",
    "Write about the things people understand without words.",
    "Describe the sky from the perspective of someone who has lost hope.",
    "Write about the moment you realized you had changed.",
    "What would your younger self fail to understand about you?",
    "Write about something you never said aloud.",
    "Describe a world in which nobody has to pretend.",
    "Write about a person you remember but no longer know.",
    "What is the smallest thing that once saved your day?",
    "Write about a door you never opened.",
    "If your thoughts were a place, what would it look like?",
    "Write about the strange comfort of being forgotten.",
    "Describe the difference between existing and living.",
    "Write about a goodbye that never happened.",
    "What would you do if you had nothing to prove?",
    "Write about the things you carry that nobody can see."
  ];

  elements.inspirationBtn?.addEventListener("click", () => {
    const prompt = randomItem(PROMPTS);

    if (!elements.inspirationText) return;

    elements.inspirationText.textContent = prompt;
    elements.inspirationText.hidden = false;
  });


  /* ==========================================================
     28. LOCAL STORAGE
     ========================================================== */

  function readSavedDesigns() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) return [];

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(item =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        item.data &&
        typeof item.data === "object"
      );
    } catch (error) {
      console.warn("Feathoria: Saved designs could not be read.", error);
      return [];
    }
  }

  function writeSavedDesigns(designs) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(designs)
      );

      return true;
    } catch (error) {
      console.error("Feathoria storage error:", error);

      if (error?.name === "QuotaExceededError") {
        showToast("Browser storage is full. Delete some saved designs.");
      } else {
        showToast("Unable to save designs in this browser.");
      }

      return false;
    }
  }


  /* ==========================================================
     29. SAVE DESIGN
     ========================================================== */

  function saveDesign() {
    clearTimeout(historyTimer);

    readControls();

    commitHistory();

    const designs = readSavedDesigns();

    const item = {
      id:
        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

      name:
        state.quote.trim().replace(/\s+/g, " ").slice(0, 45) ||
        "Untitled design",

      created: new Date().toISOString(),

      data: historySnapshot()
    };

    designs.unshift(item);

    designs.length = Math.min(
      designs.length,
      MAX_SAVED_DESIGNS
    );

    if (writeSavedDesigns(designs)) {
      showToast("Design saved successfully.");
    }
  }

  elements.saveBtn?.addEventListener("click", saveDesign);


  /* ==========================================================
     30. SAFE HTML
     ========================================================== */

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
      const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return replacements[character];
    });
  }


  /* ==========================================================
     31. SAVED DESIGN DIALOG
     ========================================================== */

  function openSavedDialog() {
    renderSavedDesigns();

    if (elements.savedDialog?.showModal) {
      if (!elements.savedDialog.open) {
        elements.savedDialog.showModal();
      }
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

  elements.savedDesignsBtn?.addEventListener(
    "click",
    openSavedDialog
  );

  elements.closeSavedBtn?.addEventListener(
    "click",
    closeSavedDialog
  );

  elements.closeSavedBottomBtn?.addEventListener(
    "click",
    closeSavedDialog
  );

  // Clicking outside the dialog closes it.
  elements.savedDialog?.addEventListener("click", event => {
    if (event.target === elements.savedDialog) {
      closeSavedDialog();
    }
  });


  /* ==========================================================
     32. RENDER SAVED DESIGNS
     ========================================================== */

  function renderSavedDesigns() {
    const container = elements.savedDesignList;

    if (!container) return;

    const designs = readSavedDesigns();

    if (!designs.length) {
      container.innerHTML = `
        <p class="empty-saved">
          No saved designs yet.
          Create something beautiful and save it here.
        </p>
      `;

      return;
    }

    container.innerHTML = designs.map(item => {
      const date = new Date(item.created);

      const dateText = Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleDateString();

      return `
        <div class="saved-item" data-id="${escapeHTML(item.id)}">
          <div class="saved-item-info">
            <p>${escapeHTML(item.name || "Untitled design")}</p>
            <small>${escapeHTML(dateText)}</small>
          </div>

          <div class="saved-item-actions">
            <button type="button" data-action="load">
              Open
            </button>

            <button type="button" data-action="delete">
              Delete
            </button>
          </div>
        </div>
      `;
    }).join("");
  }


  /* ==========================================================
     33. SAVED DESIGN ACTIONS
     ========================================================== */

  elements.savedDesignList?.addEventListener("click", event => {
    const button = event.target.closest(
      "button[data-action]"
    );

    if (!button) return;

    const itemElement = button.closest(".saved-item");
    const id = itemElement?.dataset.id;

    if (!id) return;

    const designs = readSavedDesigns();

    const selected = designs.find(
      design => design.id === id
    );

    if (!selected) return;

    if (button.dataset.action === "load") {
      try {
        state = normalizeState(
          clone(selected.data)
        );

        renderAll();

        resetHistory();

        closeSavedDialog();

        showToast("Saved design restored.");
      } catch (error) {
        console.error("Saved design load error:", error);

        showToast("This saved design could not be opened.");
      }

      return;
    }

    if (button.dataset.action === "delete") {
      const updated = designs.filter(
        design => design.id !== id
      );

      if (writeSavedDesigns(updated)) {
        renderSavedDesigns();

        showToast("Saved design deleted.");
      }
    }
  });


  /* ==========================================================
     34. RESET DESIGN
     ========================================================== */

  function resetDesign() {
    uploadToken++;

    processingUpload = false;

    state = clone(DEFAULTS);

    if (elements.bgUpload) {
      elements.bgUpload.value = "";
    }

    if (elements.inspirationText) {
      elements.inspirationText.hidden = true;
    }

    renderAll();
    resetHistory();

    showToast("Studio settings reset.");
  }

  elements.resetBtn?.addEventListener(
    "click",
    resetDesign
  );


  /* ==========================================================
     35. RESET BACKGROUND POSITION
     ========================================================== */

  elements.previewResetBtn?.addEventListener("click", () => {
    state.backgroundZoom = 100;
    state.backgroundX = 50;
    state.backgroundY = 50;

    renderAll();

    recordHistory(true);

    showToast("Background position reset.");
  });


  /* ==========================================================
     36. EXPORT DIMENSIONS
     ========================================================== */

  function getDimensions() {
    switch (state.aspect) {
      case "portrait":
        return {
          width: 1080,
          height: 1350,
          name: "portrait"
        };

      case "story":
        return {
          width: 1080,
          height: 1920,
          name: "story"
        };

      case "banner":
        return {
          width: 1920,
          height: 1080,
          name: "landscape"
        };

      default:
        return {
          width: 1080,
          height: 1080,
          name: "square"
        };
    }
  }


  /* ==========================================================
     37. CREATE EXPORT CLONE
     ========================================================== */

  function makeExportClone(dimensions) {
    const clone = quotePreview.cloneNode(true);

    const width = dimensions.width;
    const height = dimensions.height;

    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;

    clone.style.maxWidth = "none";
    clone.style.minWidth = "0";
    clone.style.minHeight = "0";

    clone.style.aspectRatio = "auto";

    clone.style.position = "relative";
    clone.style.display = "flex";

    clone.style.margin = "0";
    clone.style.transform = "none";

    clone.style.boxShadow = "none";
    clone.style.overflow = "hidden";

    clone.classList.remove(...ASPECTS);

    clone.style.borderRadius =
      `${state.borderRadius}px`;

    const background = clone.querySelector(
      "#quoteBackground"
    );

    const overlay = clone.querySelector(
      "#quoteOverlay"
    );

    const text = clone.querySelector(
      "#quoteText"
    );

    const author = clone.querySelector(
      "#quoteAuthor"
    );

    const watermark = clone.querySelector(
      "#watermark"
    );

    const logo = clone.querySelector(
      "#logo"
    );

    if (!background || !overlay || !text || !author) {
      throw new Error("Export elements are missing.");
    }

    background.style.position = "absolute";
    background.style.inset = "0";
    background.style.width = "100%";
    background.style.height = "100%";

    background.style.backgroundSize =
      state.customBackground
        ? `${state.backgroundZoom}%`
        : "cover";

    background.style.backgroundPosition =
      state.customBackground
        ? `${state.backgroundX}% ${state.backgroundY}%`
        : "center";

    background.style.filter =
      quoteBackground.style.filter;

    background.style.transform =
      quoteBackground.style.transform;

    background.style.setProperty(
      "--overlay-opacity",
      String(state.overlay / 100)
    );

    // Scale based on the visible preview width.
    const previewWidth =
      quotePreview.getBoundingClientRect().width || 500;

    const scale = width / previewWidth;

    overlay.style.width = "100%";
    overlay.style.height = "100%";

    overlay.style.maxHeight = "none";
    overlay.style.overflow = "visible";

    overlay.style.padding =
      `${previewWidth * 0.11 * scale}px`;

    text.style.fontSize =
      `${state.fontSize * scale}px`;

    text.style.letterSpacing =
      `${state.letterSpacing * scale}px`;

    text.style.lineHeight =
      String(state.lineHeight);

    text.style.fontWeight =
      state.bold ? "700" : "400";

    text.style.fontStyle =
      state.italic ? "italic" : "normal";

    text.style.textTransform =
      state.uppercase ? "uppercase" : "none";

    text.style.textAlign = state.textAlign;
    text.style.color = state.textColor;

    text.style.marginBottom =
      `${22 * scale}px`;

    author.style.fontSize =
      `${state.authorSize * scale}px`;

    author.style.color = state.textColor;

    if (watermark) {
      watermark.style.fontSize =
        `${10 * scale}px`;

      watermark.style.bottom =
        `${16 * scale}px`;

      watermark.style.right =
        `${18 * scale}px`;

      watermark.style.opacity =
        String(state.watermarkOpacity / 100);
    }

    if (logo) {
      logo.style.width =
        `${34 * scale}px`;

      logo.style.height =
        `${34 * scale}px`;

      logo.style.bottom =
        `${13 * scale}px`;

      logo.style.left =
        `${15 * scale}px`;
    }

    return clone;
  }


  /* ==========================================================
     38. WAIT FOR EXTERNAL ASSETS
     ========================================================== */

  async function waitForAssets(container) {
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
    } catch (error) {
      console.warn("Font loading warning:", error);
    }

    const images = [
      ...container.querySelectorAll("img")
    ];

    await Promise.all(
      images.map(image => {
        if (
          image.complete &&
          image.naturalWidth > 0
        ) {
          return Promise.resolve();
        }

        return new Promise(resolve => {
          let settled = false;

          const finish = () => {
            if (settled) return;

            settled = true;
            clearTimeout(timeout);

            resolve();
          };

          image.addEventListener("load", finish, {
            once: true
          });

          image.addEventListener("error", finish, {
            once: true
          });

          const timeout = setTimeout(finish, 7000);
        });
      })
    );
  }


  /* ==========================================================
     39. EXPORT BLOB
     ========================================================== */

  function canvasToDownloadBlob(canvas, format) {
    return new Promise((resolve, reject) => {
      const mimeType = format === "jpeg"
        ? "image/jpeg"
        : "image/png";

      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(
              new Error("Image conversion failed.")
            );

            return;
          }

          resolve(blob);
        },
        mimeType,
        format === "jpeg" ? 0.94 : undefined
      );
    });
  }


  /* ==========================================================
     40. EXPORT IMAGE
     ========================================================== */

  async function exportImage() {
    if (exporting || processingUpload) return;

    if (typeof window.html2canvas !== "function") {
      setStatus(
        "Image export is unavailable. Refresh the page and try again.",
        "error"
      );

      showToast("Export library is unavailable.");

      return;
    }

    exporting = true;

    const button = elements.downloadBtn;
    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Preparing design...";

    setStatus("Preparing your design...");

    let wrapper = null;
    let canvas = null;
    let objectURL = null;

    try {
      clearTimeout(historyTimer);

      readControls();
      renderAll(false);

      const dimensions = getDimensions();

      const scale = clamp(
        Number(elements.exportQuality?.value || 2),
        1,
        3
      );

      const format =
        elements.exportFormat?.value === "jpeg"
          ? "jpeg"
          : "png";

      const clone = makeExportClone(dimensions);

      wrapper = document.createElement("div");

      wrapper.style.position = "fixed";
      wrapper.style.left = "-10000px";
      wrapper.style.top = "0";

      wrapper.style.width =
        `${dimensions.width}px`;

      wrapper.style.height =
        `${dimensions.height}px`;

      wrapper.style.overflow = "hidden";
      wrapper.style.pointerEvents = "none";

      wrapper.style.zIndex = "-9999";

      wrapper.style.background =
        format === "jpeg"
          ? "#171127"
          : "transparent";

      wrapper.appendChild(clone);

      document.body.appendChild(wrapper);

      await waitForAssets(wrapper);

      // Allow the browser to finish layout and painting.
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      button.textContent = "Rendering...";

      setStatus("Rendering your creation...");

      canvas = await window.html2canvas(clone, {
        width: dimensions.width,
        height: dimensions.height,

        scale,

        backgroundColor:
          format === "jpeg"
            ? "#171127"
            : null,

        useCORS: true,
        allowTaint: false,

        logging: false,

        imageTimeout: 15000,

        scrollX: 0,
        scrollY: 0,

        windowWidth: dimensions.width,
        windowHeight: dimensions.height
      });

      const blob = await canvasToDownloadBlob(
        canvas,
        format
      );

      objectURL = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = objectURL;

      const filename = safeFilename(
        state.quote.trim().slice(0, 35) ||
        "feathoria-design"
      );

      link.download =
        `feathoria-${dimensions.name}-${filename}.${format === "jpeg" ? "jpg" : "png"}`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      setStatus(
        "Your creation has been downloaded. ✨",
        "success"
      );

      showToast("Your design is ready!");
    } catch (error) {
      console.error("Feathoria export error:", error);

      setStatus(
        "Export failed. Try a lower quality or another background.",
        "error"
      );

      showToast("Something went wrong during export.");
    } finally {
      wrapper?.remove();

      if (canvas) {
        canvas.width = 1;
        canvas.height = 1;
      }

      if (objectURL) {
        setTimeout(() => {
          URL.revokeObjectURL(objectURL);
        }, 10000);
      }

      button.disabled = false;
      button.textContent = originalText;

      exporting = false;
    }
  }

  elements.downloadBtn.addEventListener(
    "click",
    exportImage
  );


  /* ==========================================================
     41. KEYBOARD SHORTCUTS
     ========================================================== */

  function isTypingTarget(target) {
    if (!target) return false;

    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target.isContentEditable
    );
  }

  document.addEventListener("keydown", event => {
    const target = event.target;

    const modifier = event.ctrlKey || event.metaKey;

    const key = event.key.toLowerCase();

    // Do not interfere with native undo while typing.
    if (
      modifier &&
      key === "z" &&
      isTypingTarget(target)
    ) {
      return;
    }

    if (
      modifier &&
      key === "y" &&
      isTypingTarget(target)
    ) {
      return;
    }

    // Undo.
    if (modifier && key === "z") {
      event.preventDefault();

      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }

      return;
    }

    // Redo.
    if (modifier && key === "y") {
      event.preventDefault();

      redo();

      return;
    }

    // Save.
    if (modifier && key === "s") {
      event.preventDefault();

      saveDesign();

      return;
    }

    // Escape closes saved designs.
    if (
      event.key === "Escape" &&
      elements.savedDialog?.open
    ) {
      closeSavedDialog();
    }
  });


  /* ==========================================================
     42. FOOTER YEAR
     ========================================================== */

  setText("year", new Date().getFullYear());


  /* ==========================================================
     43. INITIALIZATION
     ========================================================== */

  state = normalizeState(DEFAULTS);

  renderAll();

  resetHistory();

  setStatus("");

  console.log(
    "Feathoria Studio 4.0 initialized successfully."
  );

});