/* ==========================================================================
   Feathoria — Interactive Reader, Search, Ambient Audio & Keepsake Engine
   ========================================================================== */

(() => {
  "use strict";

  const PAGE_KIND =
    document.body.dataset.contentType ||
    (location.pathname.includes("iquotes") ? "quote" : "poem");

  const STORAGE = {
    library: "feathoria_library_v2",
    legacyLibrary: "feathoria_library_v1",
    theme: "feathoria_theme_v2",
    prefs: "feathoria_reader_prefs_v1"
  };

  const THEMES = ["dark", "light", "sepia"];

  const FONT_CHOICES = [
    { label: "Lora Serif", value: '"Lora", Georgia, serif' },
    { label: "Playfair Editorial", value: '"Playfair Display", Georgia, serif' },
    { label: "Clean Sans", value: '"DM Sans", system-ui, sans-serif' }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const state = {
    currentItem: null,
    savedOnly: false,
    readerFontSize: 1.12,
    readerLineHeight: 2.0,
    readerFontIndex: 0,
    focusMode: false,
    lastFocused: null,
    toastTimer: null,
    searchTimer: null
  };

  function loadLibrary() {
    try {
      const raw =
        localStorage.getItem(STORAGE.library) ||
        localStorage.getItem(STORAGE.legacyLibrary);
      const parsed = raw ? JSON.parse(raw) : null;
      return {
        saved: Array.isArray(parsed?.saved) ? [...new Set(parsed.saved)] : [],
        liked: Array.isArray(parsed?.liked) ? [...new Set(parsed.liked)] : [],
        notes: parsed?.notes && typeof parsed.notes === "object" ? parsed.notes : {}
      };
    } catch {
      return { saved: [], liked: [], notes: {} };
    }
  }

  function saveLibrary(data) {
    try {
      localStorage.setItem(STORAGE.library, JSON.stringify(data));
    } catch {
      toast("Unable to save in browser storage.");
    }
  }

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE.prefs);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function savePrefs(partial) {
    try {
      const next = { ...loadPrefs(), ...partial };
      localStorage.setItem(STORAGE.prefs, JSON.stringify(next));
    } catch {}
  }

  let library = loadLibrary();

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ------------------------------------------------------------------------
     Ambient Audio Engine
     ------------------------------------------------------------------------ */
  const SoundEngine = (() => {
    let ctx = null;
    let source = null;
    let gain = null;

    function stop() {
      if (source) {
        try { source.stop(); } catch {}
        try { source.disconnect(); } catch {}
        source = null;
      }
      if (gain) {
        try { gain.disconnect(); } catch {}
        gain = null;
      }
    }

    function createNoiseBuffer(audioCtx, type) {
      const length = audioCtx.sampleRate * 3;
      const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
      const out = buffer.getChannelData(0);

      if (type === "rain") {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < length; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }
      } else if (type === "brown") {
        let last = 0;
        for (let i = 0; i < length; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + 0.02 * white) / 1.02;
          out[i] = last * 0.25;
        }
      } else if (type === "fire") {
        let last = 0;
        for (let i = 0; i < length; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + 0.015 * white) / 1.015;
          const crackle = Math.random() > 0.9986 ? (Math.random() * 0.48 - 0.24) : 0;
          out[i] = last * 0.22 + crackle;
        }
      }
      return buffer;
    }

    async function start(type) {
      stop();
      if (!type || type === "off") return;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return toast("Ambient audio is not supported here.");

      if (!ctx) ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        try { await ctx.resume(); } catch {}
      }

      source = ctx.createBufferSource();
      source.buffer = createNoiseBuffer(ctx, type);
      source.loop = true;

      gain = ctx.createGain();
      gain.gain.value = 0.34;

      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      toast(`Ambient sound: ${type}`);
    }

    return { start, stop };
  })();

  /* ------------------------------------------------------------------------
     Read-Aloud Narrator
     ------------------------------------------------------------------------ */
  const Narrator = (() => {
    let active = false;

    function sync() {
      const btn = $("#modal-listen");
      if (!btn) return;
      btn.textContent = active ? "⏹ Stop" : "▶ Listen";
      btn.classList.toggle("is-active", active);
    }

    function stop() {
      if ("speechSynthesis" in window) {
        try { window.speechSynthesis.cancel(); } catch {}
      }
      active = false;
      sync();
    }

    function toggle(item) {
      if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
        return toast("Voice reading is unavailable on this device.");
      }
      if (active) {
        stop();
        return;
      }

      try { window.speechSynthesis.cancel(); } catch {}

      const spoken = `${item.title}. ${item.author ? `By ${item.author}. ` : ""}${item.text}`;
      const utterance = new SpeechSynthesisUtterance(spoken);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.onend = stop;
      utterance.onerror = stop;

      active = true;
      sync();
      window.speechSynthesis.speak(utterance);
    }

    return { toggle, stop };
  })();

  /* ------------------------------------------------------------------------
     Content Parsing & Decoration
     ------------------------------------------------------------------------ */
  function cleanText(el) {
    return (el?.innerText || el?.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function getAccordionTitle(acc) {
    if (!acc) return "";
    return cleanText($(".accordion-trigger > span:first-child", acc) || $("h3, button", acc));
  }

  function ensureAuthorLine(el) {
    if (!el.classList.contains("poem") && !el.classList.contains("chapter")) return;
    if ($(".author", el)) return;

    const writerAcc = el.closest("#author > .accordion-item");
    const writerName = writerAcc ? getAccordionTitle(writerAcc) : "";
    if (!writerName) return;

    const authorEl = document.createElement("p");
    authorEl.className = "author";
    authorEl.textContent = `By ${writerName}`;

    const titleEl = $(".title", el);
    if (titleEl?.nextSibling) {
      titleEl.parentNode.insertBefore(authorEl, titleEl.nextSibling);
    } else {
      el.prepend(authorEl);
    }
  }

  function parseItem(el) {
    const isQuote = el.classList.contains("quote-card");
    const title = isQuote ? "" : cleanText($(".title", el));
    const author = isQuote
      ? cleanText($(".quote-author", el)).replace(/^[—–-]\s*/, "")
      : cleanText($(".author", el)).replace(/^by\s+/i, "");

    const text = isQuote
      ? cleanText($("p", el))
      : $$("p:not(.author):not(.subtitle)", el)
          .map(cleanText)
          .filter(Boolean)
          .join("\n\n");

    const category = getAccordionTitle(el.closest(".accordion-item")) || "Collection";
    const displayTitle =
      title || `${text.slice(0, 68)}${text.length > 68 ? "…" : ""}`;

    const words = text.split(/\s+/).filter(Boolean).length;
    const readMins = Math.max(1, Math.round(words / 160));

    return {
      id: el.dataset.itemId || "",
      title: displayTitle,
      author,
      text,
      category,
      kind: isQuote ? "Quote" : "Poem",
      words,
      readMins
    };
  }

  function buildId(el, index) {
    const d = parseItem(el);
    const slug = `${d.title}|${d.author}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 75);
    return `${PAGE_KIND}-${slug || index}`;
  }

  function actionBtn(label, action, isActive = false) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.dataset.action = action;
    if (isActive) btn.classList.add("is-active");
    return btn;
  }

  function renderNote(el, id) {
    const existing = $(".note-badge", el);
    const note = library.notes[id];

    if (note) {
      const badge = existing || document.createElement("div");
      badge.className = "note-badge";
      badge.textContent = `✎ Note: ${note}`;
      if (!existing) {
        el.insertBefore(badge, $(".content-actions", el) || null);
      }
    } else if (existing) {
      existing.remove();
    }
  }

  function attachItemControls(el) {
    if ($(".content-actions", el)) return;

    const id = el.dataset.itemId;
    const d = parseItem(el);

    if (d.kind === "Poem" && d.words > 40 && !$(".item-meta-strip", el)) {
      const meta = document.createElement("div");
      meta.className = "item-meta-strip";
      meta.textContent = `${d.words} words · ${d.readMins} min read`;
      const authorEl = $(".author", el);
      if (authorEl) authorEl.after(meta);
    }

    const liked = library.liked.includes(id);
    const saved = library.saved.includes(id);

    const actions = document.createElement("div");
    actions.className = "content-actions";
    actions.append(
      actionBtn("↗ Read", "open"),
      actionBtn(liked ? "♥ Liked" : "♡ Like", "like", liked),
      actionBtn(saved ? "✓ Saved" : "＋ Save", "save", saved),
      actionBtn("⧉ Copy", "copy"),
      actionBtn("↓ Card", "card")
    );

    el.append(actions);
    renderNote(el, id);
  }

  function normalizeQuotes() {
    if (PAGE_KIND !== "quote") return;

    $$(".accordion-content").forEach(container => {
      [...container.children].forEach(child => {
        if (child.tagName !== "P" || !cleanText(child) || child.closest(".quote-card")) return;

        const raw = cleanText(child);
        const card = document.createElement("article");
        card.className = "quote-card";

        const quoteP = document.createElement("p");
        const match = raw.match(/\s+[—–-]\s+([^—–-]{2,90})$/);

        if (match) {
          quoteP.textContent = raw.slice(0, match.index).trim();
          const authorSpan = document.createElement("span");
          authorSpan.className = "quote-author";
          authorSpan.textContent = `— ${match[1].trim()}`;
          card.append(quoteP, authorSpan);
        } else {
          quoteP.textContent = raw;
          card.append(quoteP);
        }

        child.replaceWith(card);
      });
    });
  }

  function decorateAll() {
    let poemIdx = 0;
    $$(".poem, .chapter").forEach(el => {
      ensureAuthorLine(el);
      el.dataset.itemId = buildId(el, poemIdx++);
      attachItemControls(el);
    });

    normalizeQuotes();

    let quoteIdx = 0;
    $$(".quote-card").forEach(el => {
      el.dataset.itemId = buildId(el, quoteIdx++);
      attachItemControls(el);
    });

    updateSavedBadge();
    buildSpotlight();
  }

  function buildSpotlight() {
    const hero = $(".hero");
    const items = $$("[data-item-id]");
    if (!hero || !items.length || $("#daily-spotlight")) return;

    const now = new Date();
    const dayStart = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - dayStart) / 86400000);
    const seed = now.getFullYear() * 1000 + dayOfYear;
    const chosen = items[seed % items.length];
    const data = parseItem(chosen);

    const aside = document.createElement("aside");
    aside.id = "daily-spotlight";
    aside.className = "daily-spotlight";

    const meta = document.createElement("div");
    meta.className = "daily-meta";

    const badge = document.createElement("span");
    badge.className = "daily-badge";
    badge.textContent = `✦ ${data.kind} of the Day`;

    const title = document.createElement("h3");
    title.className = "daily-title";
    title.textContent = data.title;
    if (data.author) {
      const authorSpan = document.createElement("span");
      authorSpan.className = "daily-title-author";
      authorSpan.textContent = ` — ${data.author}`;
      title.append(authorSpan);
    }

    const excerpt = document.createElement("p");
    excerpt.className = "daily-excerpt";
    excerpt.textContent = data.text.replace(/\n+/g, " / ");

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "tool-btn";
    openBtn.textContent = "Read now →";
    openBtn.addEventListener("click", () => openReader(chosen));

    meta.append(badge, title, excerpt);
    aside.append(meta, openBtn);
    hero.after(aside);
  }

  /* ------------------------------------------------------------------------
     State Updates, Copying & Exports
     ------------------------------------------------------------------------ */
  function updateSavedBadge() {
    const el = $("#saved-count");
    if (el) el.textContent = String(library.saved.length);
  }

  function elementsById(id) {
    return id ? $$(`[data-item-id="${CSS.escape(id)}"]`) : [];
  }

  function syncItemState(id) {
    const liked = library.liked.includes(id);
    const saved = library.saved.includes(id);

    elementsById(id).forEach(el => {
      $$("[data-action='like'], [data-action='save']", el).forEach(btn => {
        if (btn.dataset.action === "like") {
          btn.textContent = liked ? "♥ Liked" : "♡ Like";
          btn.classList.toggle("is-active", liked);
        } else {
          btn.textContent = saved ? "✓ Saved" : "＋ Save";
          btn.classList.toggle("is-active", saved);
        }
      });
      renderNote(el, id);
    });

    if (state.currentItem?.id === id) {
      const modalSave = $("#modal-save");
      if (modalSave) modalSave.textContent = saved ? "✓ Saved" : "＋ Save";
    }
  }

  function formatPlainText(data) {
    const note = library.notes[data.id] ? `\n\nMy Note: ${library.notes[data.id]}` : "";
    return `${data.title}\n${data.author ? `${data.author}\n` : ""}\n${data.text}${note}\n\n— Feathoria`;
  }

  async function copyItem(data) {
    const text = formatPlainText(data);
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard.");
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      try { document.execCommand("copy"); } catch {}
      helper.remove();
      toast("Copied to clipboard.");
    }
  }

  function slugify(value) {
    return (
      (value || "feathoria")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 55) || "feathoria"
    );
  }

  function saveFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function exportTextFile(data) {
    const blob = new Blob([formatPlainText(data)], { type: "text/plain;charset=utf-8" });
    saveFile(blob, `${slugify(data.title)}.txt`);
    toast("Text file downloaded.");
  }

  function exportAnthology() {
    if (!library.saved.length) return toast("No saved items to export yet.");

    const seen = new Set();
    const entries = [];

    library.saved.forEach(id => {
      if (seen.has(id)) return;
      seen.add(id);
      const el = elementsById(id)[0];
      if (el) entries.push(formatPlainText(parseItem(el)));
    });

    if (!entries.length) {
      return toast("Your saved items are in the other collection.");
    }

    const header = `FEATHORIA ANTHOLOGY\nExported ${new Date().toLocaleDateString()}\n${"=".repeat(42)}\n\n`;
    const body = entries.join(`\n\n${"-".repeat(42)}\n\n`);
    const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
    saveFile(blob, `feathoria-${PAGE_KIND}s-anthology.txt`);
    toast("Anthology exported.");
  }

  /* ------------------------------------------------------------------------
     Keepsake PNG Generator
     ------------------------------------------------------------------------ */
  function wrapLines(ctx, text, maxWidth) {
    const paragraphs = (text || "").split(/\n+/);
    const lines = [];

    for (const para of paragraphs) {
      const words = para.trim().split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines.push("");
        continue;
      }

      let line = "";
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      if (line) lines.push(line);
    }

    return lines;
  }

  function downloadKeepsake(data, styleKey = "midnight", ratioKey = "auto") {
    const themes = {
      midnight: {
        bg1: "#161028",
        bg2: "#2e2046",
        border: "rgba(224, 190, 255, 0.52)",
        title: "#f6effc",
        body: "#ede5f6",
        accent: "#eccb8d",
        footer: "#c6b3db"
      },
      parchment: {
        bg1: "#f7eee0",
        bg2: "#e9d8bc",
        border: "rgba(139, 91, 51, 0.45)",
        title: "#2c221a",
        body: "#382d24",
        accent: "#8b5b33",
        footer: "#6e5d4f"
      },
      botanical: {
        bg1: "#12231d",
        bg2: "#203930",
        border: "rgba(182, 219, 198, 0.45)",
        title: "#eff7f2",
        body: "#dbeae2",
        accent: "#d6b676",
        footer: "#9cb8a9"
      },
      ivory: {
        bg1: "#ffffff",
        bg2: "#f3eef9",
        border: "rgba(115, 67, 168, 0.34)",
        title: "#241b33",
        body: "#382e48",
        accent: "#7343a8",
        footer: "#7c718b"
      }
    };

    const palette = themes[styleKey] || themes.midnight;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return toast("Could not render image.");

    const width = 1200;
    const pad = 96;
    const maxWidth = width - pad * 2;
    const titleFont = "bold 48px Georgia, serif";
    const bodyFont = "32px Georgia, serif";
    const lineHeight = 50;

    ctx.font = titleFont;
    const titleLines = wrapLines(ctx, data.title || "", maxWidth).filter(Boolean);

    ctx.font = bodyFont;
    const bodyLines = wrapLines(ctx, data.text || "", maxWidth);

    const naturalHeight =
      pad * 2 +
      titleLines.length * 62 +
      (data.author ? 72 : 45) +
      bodyLines.length * lineHeight +
      120;

    let height = Math.min(6000, Math.max(760, naturalHeight));
    if (ratioKey === "square") height = Math.max(1200, naturalHeight);
    if (ratioKey === "story") height = Math.max(2133, naturalHeight);

    canvas.width = width;
    canvas.height = height;

    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, palette.bg1);
    bgGrad.addColorStop(1, palette.bg2);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.fillStyle = palette.accent;
    ctx.font = "bold 21px Arial, sans-serif";
    ctx.fillText(`FEATHORIA  /  ${data.kind.toUpperCase()}`, pad, pad);

    let y = pad + 92;
    ctx.fillStyle = palette.title;
    ctx.font = titleFont;
    for (const line of titleLines) {
      ctx.fillText(line, pad, y);
      y += 62;
    }

    if (data.author) {
      y += 14;
      ctx.fillStyle = palette.accent;
      ctx.font = "italic 25px Georgia, serif";
      ctx.fillText(`— ${data.author}`, pad, y);
      y += 58;
    } else {
      y += 45;
    }

    ctx.fillStyle = palette.body;
    ctx.font = bodyFont;
    for (const line of bodyLines) {
      if (line) ctx.fillText(line, pad, y);
      y += lineHeight;
    }

    ctx.fillStyle = palette.footer;
    ctx.font = "20px Arial, sans-serif";
    ctx.fillText("feathoria · a quiet corner of the internet", pad, height - pad / 2);

    canvas.toBlob(blob => {
      if (!blob) return toast("Could not generate PNG.");
      saveFile(blob, `${slugify(data.title)}-${styleKey}.png`);
      toast("Keepsake PNG downloaded.");
    });
  }

  /* ------------------------------------------------------------------------
     Reading Room Modal & Typography Controls
     ------------------------------------------------------------------------ */
  function applyReaderTypography() {
    const fontChoice = FONT_CHOICES[state.readerFontIndex] || FONT_CHOICES[0];
    document.documentElement.style.setProperty("--reader-font-size", `${state.readerFontSize}rem`);
    document.documentElement.style.setProperty("--reader-line-height", String(state.readerLineHeight));
    document.documentElement.style.setProperty("--reader-font-family", fontChoice.value);

    const bodyEl = $("#modal-body");
    if (bodyEl) {
      bodyEl.style.fontSize = `${state.readerFontSize}rem`;
      bodyEl.style.lineHeight = String(state.readerLineHeight);
      bodyEl.style.fontFamily = fontChoice.value;
    }

    const fontSelect = $("#reader-font-select");
    if (fontSelect) {
      fontSelect.value = String(state.readerFontIndex);
    }

    const fontBtn = $("#reader-font-btn");
    if (fontBtn) {
      fontBtn.textContent = `Aa ${fontChoice.label.split(" ")[0]}`;
      fontBtn.title = `Typeface: ${fontChoice.label} (click to cycle)`;
    }
  }

  function enhanceModal() {
    const panel = $(".modal-panel");
    if (!panel || $("#modal-note-input")) return;

    const kicker = $(".modal-kicker", panel);
    if (kicker) {
      const topBar = document.createElement("div");
      topBar.className = "modal-top-bar";
      kicker.replaceWith(topBar);

      const controls = document.createElement("div");
      controls.className = "reader-controls";
      controls.innerHTML = `
        <button type="button" id="font-dec" title="Decrease text size" aria-label="Decrease text size">A−</button>
        <button type="button" id="font-inc" title="Increase text size" aria-label="Increase text size">A+</button>
        <button type="button" id="line-toggle" title="Toggle line spacing" aria-label="Toggle line spacing">↕ Spacing</button>
        <select id="reader-font-select" class="reader-font-select" aria-label="Choose reading typeface">
          <option value="0">Lora Serif</option>
          <option value="1">Playfair Editorial</option>
          <option value="2">Clean Sans</option>
        </select>
        <button type="button" id="reader-font-btn" title="Cycle reading typeface" aria-label="Cycle reading typeface">Aa</button>
        <button type="button" id="reader-reset-btn" title="Reset text size and spacing" aria-label="Reset text size and spacing">↺</button>
        <button type="button" id="modal-prev" title="Previous (Left Arrow)" aria-label="Previous item">←</button>
        <button type="button" id="modal-next" title="Next (Right Arrow)" aria-label="Next item">→</button>
      `;
      topBar.append(kicker, controls);
    }

    const bodyEl = $("#modal-body", panel);
    if (bodyEl) {
      const noteBox = document.createElement("div");
      noteBox.className = "modal-note-box";
      noteBox.innerHTML = `
        <label for="modal-note-input">✎ Personal Margin Note (saved locally)</label>
        <textarea id="modal-note-input" placeholder="Write a quiet reflection, memory, or line that stayed with you..."></textarea>
      `;
      bodyEl.after(noteBox);

      const studio = document.createElement("div");
      studio.className = "card-studio";
      studio.innerHTML = `
        <span>Keepsake Card:</span>
        <select id="card-style-select" aria-label="Card theme">
          <option value="midnight">Midnight Velvet</option>
          <option value="parchment">Aged Parchment</option>
          <option value="botanical">Botanical Mist</option>
          <option value="ivory">Minimalist Ivory</option>
        </select>
        <select id="card-ratio-select" aria-label="Card aspect ratio">
          <option value="auto">Auto-fit</option>
          <option value="square">Square (1:1)</option>
          <option value="story">Story (9:16)</option>
        </select>
      `;
      noteBox.after(studio);
    }

    const actions = $(".modal-actions", panel);
    if (actions && !$("#modal-listen")) {
      const listen = actionBtn("▶ Listen", "listen");
      listen.id = "modal-listen";
      actions.prepend(listen);
    }

    const prefs = loadPrefs();
    if (typeof prefs.fontSize === "number" && Number.isFinite(prefs.fontSize)) {
      state.readerFontSize = Math.min(1.6, Math.max(0.85, prefs.fontSize));
    }
    if (typeof prefs.lineHeight === "number" && Number.isFinite(prefs.lineHeight)) {
      state.readerLineHeight = Math.min(2.6, Math.max(1.5, prefs.lineHeight));
    }
    if (typeof prefs.fontIndex === "number" && FONT_CHOICES[prefs.fontIndex]) {
      state.readerFontIndex = prefs.fontIndex;
    }
    $("#line-toggle")?.classList.toggle("is-active", state.readerLineHeight > 2.1);
    applyReaderTypography();

    $("#font-dec")?.addEventListener("click", () => {
      state.readerFontSize = Math.max(0.85, +(state.readerFontSize - 0.08).toFixed(2));
      applyReaderTypography();
      savePrefs({ fontSize: state.readerFontSize });
      toast(`Text size: ${Math.round((state.readerFontSize / 1.12) * 100)}%`);
    });

    $("#font-inc")?.addEventListener("click", () => {
      state.readerFontSize = Math.min(1.6, +(state.readerFontSize + 0.08).toFixed(2));
      applyReaderTypography();
      savePrefs({ fontSize: state.readerFontSize });
      toast(`Text size: ${Math.round((state.readerFontSize / 1.12) * 100)}%`);
    });

    $("#line-toggle")?.addEventListener("click", () => {
      const wide = state.readerLineHeight <= 2.1;
      state.readerLineHeight = wide ? 2.35 : 2.0;
      $("#line-toggle")?.classList.toggle("is-active", wide);
      applyReaderTypography();
      savePrefs({ lineHeight: state.readerLineHeight });
      toast(wide ? "Line spacing: airy" : "Line spacing: standard");
    });

    $("#reader-font-select")?.addEventListener("change", e => {
      const idx = Number(e.target.value);
      if (FONT_CHOICES[idx]) {
        state.readerFontIndex = idx;
        applyReaderTypography();
        savePrefs({ fontIndex: state.readerFontIndex });
        toast(`Font: ${FONT_CHOICES[state.readerFontIndex].label}`);
      }
    });

    $("#reader-font-btn")?.addEventListener("click", () => {
      state.readerFontIndex = (state.readerFontIndex + 1) % FONT_CHOICES.length;
      applyReaderTypography();
      savePrefs({ fontIndex: state.readerFontIndex });
      toast(`Font: ${FONT_CHOICES[state.readerFontIndex].label}`);
    });

    $("#reader-reset-btn")?.addEventListener("click", () => {
      state.readerFontSize = 1.12;
      state.readerLineHeight = 2.0;
      state.readerFontIndex = 0;
      $("#line-toggle")?.classList.remove("is-active");
      applyReaderTypography();
      savePrefs({
        fontSize: state.readerFontSize,
        lineHeight: state.readerLineHeight,
        fontIndex: state.readerFontIndex
      });
      toast("Reader typography reset.");
    });

    $("#modal-prev")?.addEventListener("click", () => stepReader(-1));
    $("#modal-next")?.addEventListener("click", () => stepReader(1));
    $("#modal-listen")?.addEventListener("click", () => state.currentItem && Narrator.toggle(state.currentItem));

    $("#modal-note-input")?.addEventListener("input", e => {
      if (!state.currentItem) return;
      const val = e.target.value.trim();
      if (val) library.notes[state.currentItem.id] = val;
      else delete library.notes[state.currentItem.id];
      saveLibrary(library);
      syncItemState(state.currentItem.id);
    });
  }

  function stepReader(delta) {
    if (!state.currentItem) return;
    const list = visibleItems();
    if (!list.length) return;
    const idx = list.findIndex(el => el.dataset.itemId === state.currentItem.id);
    const nextIdx = idx === -1 ? 0 : (idx + delta + list.length) % list.length;
    openReader(list[nextIdx], { captureFocus: false });
  }

  function openReader(el, { captureFocus = true } = {}) {
    if (!el) return;
    Narrator.stop();

    if (captureFocus && document.activeElement instanceof HTMLElement) {
      state.lastFocused = document.activeElement;
    }

    const data = parseItem(el);
    state.currentItem = { ...data, id: el.dataset.itemId };

    $("#modal-title").textContent = data.title;
    $("#modal-author").textContent = data.author ? `— ${data.author}` : data.category;
    $("#modal-body").textContent = data.text;
    $("#modal-save").textContent = library.saved.includes(state.currentItem.id)
      ? "✓ Saved"
      : "＋ Save";

    const noteInput = $("#modal-note-input");
    if (noteInput) noteInput.value = library.notes[state.currentItem.id] || "";

    applyReaderTypography();

    const modal = $("#reading-modal");
    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    const panel = $(".modal-panel");
    if (panel) {
      panel.scrollTop = 0;
      let prog = $(".modal-progress", panel);
      if (!prog) {
        prog = document.createElement("div");
        prog.className = "modal-progress";
        panel.prepend(prog);
        panel.addEventListener("scroll", () => {
          const max = panel.scrollHeight - panel.clientHeight;
          prog.style.width = max > 0 ? `${Math.min(100, (panel.scrollTop / max) * 100)}%` : "0%";
        }, { passive: true });
      }
      prog.style.width = "0%";

      let metrics = $(".reader-metrics", panel);
      const bodyNode = $("#modal-body", panel);
      if (bodyNode && !metrics) {
        metrics = document.createElement("div");
        metrics.className = "reader-metrics";
        bodyNode.before(metrics);
      }
      if (metrics) {
        const pctScale = Math.round((state.readerFontSize / 1.12) * 100);
        metrics.innerHTML = `<span>${data.words} words · ~${data.readMins} min read</span><span>Scale ${pctScale}% · ${FONT_CHOICES[state.readerFontIndex].label}</span>`;
      }
    }
    $("#modal-close")?.focus();
  }

  function closeReader() {
    Narrator.stop();
    const modal = $("#reading-modal");
    if (!modal) return;

    modal.classList.remove("open");
    document.body.style.overflow = "";
    state.currentItem = null;

    if (state.lastFocused && document.contains(state.lastFocused)) {
      state.lastFocused.focus();
      state.lastFocused = null;
    }
  }

  /* ------------------------------------------------------------------------
     Focus Mode (Explicit Boolean State)
     ------------------------------------------------------------------------ */
  function setFocusMode(enable, { showToast = true } = {}) {
    state.focusMode = Boolean(enable);
    document.body.classList.toggle("focus-mode", state.focusMode);
    $("#focus-toggle")?.classList.toggle("is-active", state.focusMode);
    $("#focus-toggle")?.setAttribute("aria-pressed", String(state.focusMode));
    if (showToast) {
      toast(state.focusMode ? "Focus mode on." : "Focus mode off.");
    }
  }

  /* ------------------------------------------------------------------------
     Filtering, Sections & Accordions
     ------------------------------------------------------------------------ */
  function toggleLibraryEntry(listName, id) {
    if (!id) return;
    const list = library[listName];
    const idx = list.indexOf(id);

    if (idx >= 0) list.splice(idx, 1);
    else list.push(id);

    saveLibrary(library);
    syncItemState(id);
    updateSavedBadge();

    if (listName === "saved" && state.savedOnly) {
      showSavedCollection({ announce: false });
    }

    toast(
      listName === "saved"
        ? idx >= 0 ? "Removed from saved." : "Saved to your collection."
        : idx >= 0 ? "Like removed." : "Added to likes."
    );
  }

  function visibleItems() {
    return $$("[data-item-id]").filter(el => {
      if (el.classList.contains("item-hidden")) return false;
      const acc = el.closest(".accordion-item");
      if (acc && (acc.style.display === "none" || acc.classList.contains("item-hidden"))) return false;
      const sec = el.closest(".section-content");
      return !sec || sec.classList.contains("active");
    });
  }

  function syncClearButton() {
    const input = $("#search-input");
    const clear = $("#search-clear");
    if (input && clear) clear.hidden = !input.value.trim();
  }

  function runFilters({ expandMatches = true } = {}) {
    const query = ($("#search-input")?.value || "").trim().toLowerCase();
    syncClearButton();

    const activeSection = $(".section-content.active") || $(".section-content");
    const seenSaved = new Set();
    let anyShown = false;

    $$(".section-content").forEach(section => {
      const isCurrent = section === activeSection;

      section.querySelectorAll(".accordion-item").forEach(item => {
        let itemHasMatch = false;

        $$("[data-item-id]", item).forEach(el => {
          const id = el.dataset.itemId;
          const d = parseItem(el);
          const note = library.notes[id] || "";
          const haystack = `${d.title} ${d.author} ${d.text} ${d.category} ${note}`.toLowerCase();
          const textMatch = !query || haystack.includes(query);

          let savedMatch = true;
          if (state.savedOnly) {
            savedMatch = isCurrent && library.saved.includes(id) && !seenSaved.has(id);
            if (savedMatch && textMatch) seenSaved.add(id);
          }

          const show = Boolean(isCurrent && textMatch && savedMatch);
          el.classList.toggle("item-hidden", !show);

          if (show) {
            itemHasMatch = true;
            anyShown = true;
          }
        });

        const headingMatch = Boolean(
          !state.savedOnly &&
          isCurrent &&
          query &&
          getAccordionTitle(item).toLowerCase().includes(query)
        );

        item.style.display = itemHasMatch || headingMatch ? "" : "none";

        if (isCurrent && (state.savedOnly || query) && itemHasMatch && expandMatches) {
          setAccordion(item, true);
        }
      });
    });

    const empty = $("#empty-state");
    if (empty) empty.hidden = anyShown;

    const shownCount = state.savedOnly ? seenSaved.size : visibleItems().length;
    const filterInfo = $("#active-filter-info");
    if (filterInfo) {
      const hasQuery = Boolean(query);
      filterInfo.hidden = !(hasQuery || state.savedOnly);
      const label = filterInfo.firstChild;
      const summary = `${shownCount} shown`;
      if (label && label.nodeType === Node.TEXT_NODE) {
        label.textContent = `${summary} `;
      } else {
        filterInfo.prepend(document.createTextNode(`${summary} `));
      }
    }

    return shownCount;
  }

  function showSavedCollection({ announce = true } = {}) {
    state.savedOnly = true;
    const banner = $("#saved-view-label");
    if (banner) banner.hidden = false;
    $("#show-saved")?.classList.add("is-active");
    $("#show-all")?.classList.remove("is-active");

    const count = runFilters({ expandMatches: true });
    if (announce) {
      toast(`Showing ${count} saved ${PAGE_KIND}${count === 1 ? "" : "s"}.`);
    }
  }

  function showAllCollection() {
    state.savedOnly = false;
    const banner = $("#saved-view-label");
    if (banner) banner.hidden = true;
    $("#show-saved")?.classList.remove("is-active");
    $("#show-all")?.classList.add("is-active");
    runFilters({ expandMatches: false });
  }

  function switchSection(sectionId) {
    $$(".tab-btn").forEach(btn => {
      const isSelected = btn.dataset.section === sectionId;
      btn.classList.toggle("active", isSelected);
      btn.setAttribute("aria-selected", String(isSelected));
    });

    $$(".section-content").forEach(sec => {
      sec.classList.toggle("active", sec.id === sectionId);
    });

    if (state.savedOnly) showSavedCollection({ announce: false });
    else runFilters({ expandMatches: false });
  }

  function setAccordion(item, open) {
    if (!item) return;
    item.classList.toggle("open", open);
    const trigger = item.querySelector(".accordion-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", String(open));
  }

  function upgradeAccordions() {
    $$(".accordion-item").forEach(item => {
      item.removeAttribute("aria-expanded");
      const heading = item.querySelector(":scope > h3");
      if (!heading) return;

      heading.classList.add("accordion-heading");
      heading.removeAttribute("role");
      heading.removeAttribute("tabindex");

      const isOpen = item.classList.contains("open");
      const count = item.querySelectorAll(".poem, .chapter, .quote-card").length;

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "accordion-trigger";
      trigger.setAttribute("aria-expanded", String(isOpen));

      const label = document.createElement("span");
      label.textContent = heading.textContent.trim();
      trigger.append(label);

      if (count > 0) {
        const badge = document.createElement("span");
        badge.className = "accordion-count";
        badge.textContent = String(count);
        trigger.append(badge);
      }

      heading.textContent = "";
      heading.append(trigger);
      trigger.addEventListener("click", () => {
        setAccordion(item, !item.classList.contains("open"));
      });

      const content = item.querySelector(":scope > .accordion-content");
      if (content && !content.parentElement.classList.contains("accordion-collapse")) {
        const collapse = document.createElement("div");
        collapse.className = "accordion-collapse";
        const inner = document.createElement("div");
        inner.className = "accordion-inner";
        content.replaceWith(collapse);
        inner.append(content);
        collapse.append(inner);
      }
    });
  }

  function applyTheme(themeName) {
    const next = THEMES.includes(themeName) ? themeName : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(STORAGE.theme, next); } catch {}
  }

  /* ------------------------------------------------------------------------
     Initialization & Global Listeners
     ------------------------------------------------------------------------ */
  function init() {
    try { applyTheme(localStorage.getItem(STORAGE.theme) || "dark"); }
    catch { applyTheme("dark"); }

    const progressBar = document.createElement("div");
    progressBar.id = "read-progress";
    progressBar.setAttribute("aria-hidden", "true");
    document.body.prepend(progressBar);

    const exitFocusBtn = document.createElement("button");
    exitFocusBtn.id = "exit-focus-fab";
    exitFocusBtn.type = "button";
    exitFocusBtn.textContent = "✕ Exit Focus";
    exitFocusBtn.addEventListener("click", () => setFocusMode(false));
    document.body.append(exitFocusBtn);

    const searchWrap = $(".search-wrap");
    const searchInput = $("#search-input");
    if (searchWrap && searchInput && !$("#search-clear")) {
      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.id = "search-clear";
      clearBtn.className = "search-clear";
      clearBtn.setAttribute("aria-label", "Clear search");
      clearBtn.title = "Clear search";
      clearBtn.textContent = "×";
      clearBtn.hidden = true;
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        syncClearButton();
        runFilters({ expandMatches: false });
        searchInput.focus();
      });
      searchWrap.append(clearBtn);
    }

    const toolbar = $(".feature-toolbar");
    if (toolbar) {
      const soundBox = document.createElement("div");
      soundBox.className = "sound-controls";
      soundBox.innerHTML = `
        <span class="sound-icon" aria-hidden="true">🎧</span>
        <select id="ambient-select" aria-label="Ambient background sound">
          <option value="off">Ambient: Off</option>
          <option value="rain">Soft Rain</option>
          <option value="fire">Fireplace</option>
          <option value="brown">Deep Calm</option>
        </select>
      `;

      const exportBtn = actionBtn("⇩ Export Saved", "export-all");
      exportBtn.className = "tool-btn";
      exportBtn.id = "export-saved-btn";

      const filterInfo = document.createElement("span");
      filterInfo.id = "active-filter-info";
      filterInfo.className = "filter-bar-info";
      filterInfo.hidden = true;

      const resetFiltersBtn = document.createElement("button");
      resetFiltersBtn.type = "button";
      resetFiltersBtn.id = "reset-filters-btn";
      resetFiltersBtn.className = "filter-reset-mini";
      resetFiltersBtn.textContent = "Clear filters";
      resetFiltersBtn.addEventListener("click", () => {
        const inp = $("#search-input");
        if (inp) inp.value = "";
        showAllCollection();
        toast("Filters cleared.");
      });
      filterInfo.append(resetFiltersBtn);

      toolbar.append(soundBox, exportBtn, filterInfo);
      $("#ambient-select")?.addEventListener("change", e => SoundEngine.start(e.target.value));
      exportBtn.addEventListener("click", exportAnthology);
    }

    upgradeAccordions();
    decorateAll();
    enhanceModal();
    $("#show-all")?.classList.add("is-active");
    setFocusMode(false, { showToast: false });

    $("#theme-toggle")?.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || "dark";
      const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
      applyTheme(next);
      toast(`Theme: ${next}`);
    });

    $$(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => switchSection(btn.dataset.section));
    });

    searchInput?.addEventListener("input", () => {
      syncClearButton();
      clearTimeout(state.searchTimer);
      state.searchTimer = setTimeout(() => runFilters({ expandMatches: true }), 110);
    });

    $("#show-saved")?.addEventListener("click", () => showSavedCollection({ announce: true }));
    $("#show-all")?.addEventListener("click", showAllCollection);
    $("#show-all-inline")?.addEventListener("click", showAllCollection);

    $("#focus-toggle")?.addEventListener("click", () => {
      setFocusMode(!state.focusMode);
    });

    $("#random-item")?.addEventListener("click", () => {
      const pool = visibleItems();
      if (!pool.length) return toast("No items available right now.");
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const acc = pick.closest(".accordion-item");
      if (acc && !acc.classList.contains("open")) setAccordion(acc, true);
      pick.scrollIntoView({ behavior: "smooth", block: "center" });
      openReader(pick);
    });

    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const card = btn.closest("[data-item-id]");
      if (!card) return;

      const data = parseItem(card);
      const id = card.dataset.itemId;
      const action = btn.dataset.action;

      if (action === "open") openReader(card);
      else if (action === "like") toggleLibraryEntry("liked", id);
      else if (action === "save") toggleLibraryEntry("saved", id);
      else if (action === "copy") copyItem(data);
      else if (action === "card") {
        openReader(card);
        downloadKeepsake(
          data,
          $("#card-style-select")?.value || "midnight",
          $("#card-ratio-select")?.value || "auto"
        );
      }
    });

    $("#modal-close")?.addEventListener("click", closeReader);
    $("#reading-modal")?.addEventListener("click", e => {
      if (e.target.id === "reading-modal") closeReader();
    });

    document.addEventListener("keydown", e => {
      const isOpen = $("#reading-modal")?.classList.contains("open");
      const activeTag = document.activeElement?.tagName;
      const typing =
        ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag) ||
        document.activeElement?.isContentEditable;

      if (e.key === "Escape" && isOpen) {
        closeReader();
      } else if (isOpen && !typing && e.key === "ArrowLeft") {
        e.preventDefault();
        stepReader(-1);
      } else if (isOpen && !typing && e.key === "ArrowRight") {
        e.preventDefault();
        stepReader(1);
      } else if (!isOpen && !typing && e.key === "/") {
        e.preventDefault();
        searchInput?.focus();
      }
    });

    $("#modal-copy")?.addEventListener("click", () => state.currentItem && copyItem(state.currentItem));
    $("#modal-save")?.addEventListener("click", () => {
      if (state.currentItem) toggleLibraryEntry("saved", state.currentItem.id);
    });
    $("#modal-download")?.addEventListener("click", () => {
      if (!state.currentItem) return;
      downloadKeepsake(
        state.currentItem,
        $("#card-style-select")?.value || "midnight",
        $("#card-ratio-select")?.value || "auto"
      );
    });
    $("#modal-text")?.addEventListener("click", () => {
      if (state.currentItem) exportTextFile(state.currentItem);
    });
    $("#modal-share")?.addEventListener("click", async () => {
      if (!state.currentItem) return;
      const d = state.currentItem;
      try {
        if (navigator.share) {
          await navigator.share({
            title: d.title,
            text: formatPlainText(d),
            url: `${location.href.split("#")[0]}#${encodeURIComponent(d.id)}`
          });
        } else {
          await copyItem(d);
        }
      } catch {}
    });

    if (location.hash && location.hash.length > 1) {
      const targetId = decodeURIComponent(location.hash.slice(1));
      const targetEl = elementsById(targetId)[0];
      if (targetEl) {
        const sec = targetEl.closest(".section-content");
        if (sec?.id) switchSection(sec.id);
        const acc = targetEl.closest(".accordion-item");
        if (acc && !acc.classList.contains("open")) setAccordion(acc, true);
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
          openReader(targetEl);
        }, 120);
      }
    }

    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const scrollTopBtn = $("#scroll-top");
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct = maxScroll > 0 ? Math.min(100, (y / maxScroll) * 100) : 0;
      progressBar.style.width = `${pct}%`;
      scrollTopBtn?.classList.toggle("visible", y > 500);
    }, { passive: true });

    scrollTopBtn?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
