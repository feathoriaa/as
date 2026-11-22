
/* =========================================================
   FEATHORIA — SMART ACCORDION SYSTEM 2.0

   Features:
   • Accessible tabs and keyboard navigation
   • Smart multi-word search
   • Animated accordion controls
   • One-open-at-a-time functionality
   • Dynamic content height management
   • Search result announcements
   • Empty search states
   • Scroll-to-top functionality
   • Responsive behavior
   • Reduced-motion support
   • Event delegation
   • Defensive initialization

   Compatible with existing Feathoria class names.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =====================================================
       1. CONFIGURATION
       ===================================================== */

    const CONFIG = {
        animationDuration: 350,
        scrollThreshold: 300,
        closeOthers: true,
        closeOnTabChange: true,
        hideEmptySections: false,
        searchAllWords: true,
        enableKeyboardNavigation: true
    };

    const SELECTORS = {
        tabs: ".tab-btn",
        sections: ".section-content",
        accordion: ".accordion-item",
        header: "h3",
        trigger: ".accordion-trigger",
        content: ".accordion-content",
        search: "#search-input",
        scrollTop: "#scroll-top",
        searchStatus: "#search-status"
    };


    /* =====================================================
       2. ELEMENT COLLECTION
       ===================================================== */

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        [...root.querySelectorAll(selector)];

    const tabButtons = $$(SELECTORS.tabs);
    const sections = $$(SELECTORS.sections);
    const accordionItems = $$(SELECTORS.accordion);

    const searchInput = $(SELECTORS.search);
    const scrollTopBtn = $(SELECTORS.scrollTop);

    if (!sections.length) {
        console.warn(
            "Feathoria: No accordion sections found."
        );
        return;
    }


    /* =====================================================
       3. STATE
       ===================================================== */

    let activeSection = null;
    let activeTab = null;

    let searchQuery = "";

    let resizeObserver = null;
    let scrollTicking = false;

    const itemStates = new WeakMap();

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


    /* =====================================================
       4. GENERAL HELPERS
       ===================================================== */

    const getHeader = item =>
        $(SELECTORS.trigger, item) ||
        $(SELECTORS.header, item);

    const getContent = item =>
        $(SELECTORS.content, item);

    const getSection = item =>
        item.closest(SELECTORS.sections);

    const isOpen = item =>
        item.classList.contains("open");

    const normalizeText = text =>
        String(text || "")
            .normalize("NFKC")
            .toLocaleLowerCase()
            .trim()
            .replace(/\s+/g, " ");

    function getItemState(item) {
        if (!itemStates.has(item)) {
            itemStates.set(item, {
                animationFrame: null,
                transitionTimer: null
            });
        }

        return itemStates.get(item);
    }

    function getActiveSection() {
        return (
            activeSection ||
            sections.find(section =>
                section.classList.contains("active")
            ) ||
            sections[0]
        );
    }

    function cancelAnimation(item) {
        const state = getItemState(item);

        if (state.animationFrame) {
            cancelAnimationFrame(state.animationFrame);
            state.animationFrame = null;
        }

        if (state.transitionTimer) {
            clearTimeout(state.transitionTimer);
            state.transitionTimer = null;
        }
    }


    /* =====================================================
       5. ACCESSIBILITY INITIALIZATION
       ===================================================== */

    function initializeTabs() {

        const tablist = tabButtons[0]?.parentElement;

        if (tablist && tabButtons.every(
            button => button.parentElement === tablist
        )) {
            tablist.setAttribute("role", "tablist");
            tablist.setAttribute(
                "aria-label",
                tablist.getAttribute("aria-label") ||
                "Content categories"
            );
        }

        tabButtons.forEach((button, index) => {

            if (!button.id) {
                button.id = `feathoria-tab-${index + 1}`;
            }

            const target = document.getElementById(
                button.dataset.section
            );

            if (!target) {
                console.warn(
                    "Feathoria: Invalid tab target:",
                    button.dataset.section
                );
                button.disabled = true;
                return;
            }

            button.setAttribute("role", "tab");

            button.setAttribute(
                "aria-controls",
                target.id
            );

            target.setAttribute("role", "tabpanel");

            target.setAttribute(
                "aria-labelledby",
                button.id
            );
        });
    }


    /* =====================================================
       6. ACCORDION INITIALIZATION
       ===================================================== */

    function initializeAccordions() {

        accordionItems.forEach((item, index) => {

            const header = getHeader(item);
            const content = getContent(item);

            if (!header || !content) {
                console.warn(
                    "Feathoria: Incomplete accordion item:",
                    item
                );
                return;
            }

            // Generate unique IDs.

            if (!content.id) {
                content.id =
                    `feathoria-content-${index + 1}`;
            }

            // Support recommended real-button markup.

            let trigger = $(SELECTORS.trigger, item);

            if (!trigger) {

                // Backward compatibility with existing h3 markup.

                trigger = header;

                trigger.setAttribute("role", "button");
                trigger.setAttribute("tabindex", "0");
            } else {
                trigger.setAttribute("type", "button");
            }

            trigger.setAttribute(
                "aria-controls",
                content.id
            );

            trigger.setAttribute(
                "aria-expanded",
                "false"
            );

            content.setAttribute(
                "aria-hidden",
                "true"
            );

            content.style.overflow = "hidden";
            content.style.maxHeight = "0px";

            content.inert = true;

            item.classList.remove("open");

            getItemState(item);

        });

    }


    /* =====================================================
       7. ACCORDION OPEN
       ===================================================== */

    function openAccordion(item) {

        const header = getHeader(item);
        const content = getContent(item);

        if (!header || !content) return;

        const section = getSection(item);

        if (
            section &&
            !section.classList.contains("active")
        ) {
            return;
        }

        if (isOpen(item)) {
            refreshAccordion(item);
            return;
        }

        cancelAnimation(item);

        const state = getItemState(item);

        // Close other accordions in the same section.

        if (CONFIG.closeOthers) {

            const siblings = section
                ? $$(SELECTORS.accordion, section)
                : accordionItems;

            siblings.forEach(other => {

                if (
                    other !== item &&
                    isOpen(other)
                ) {
                    closeAccordion(other);
                }

            });

        }

        // Enable content before measuring.

        content.inert = false;

        content.setAttribute(
            "aria-hidden",
            "false"
        );

        item.classList.add("open");

        header.setAttribute(
            "aria-expanded",
            "true"
        );

        // Measure the content.

        content.style.maxHeight = "0px";

        state.animationFrame = requestAnimationFrame(() => {

            state.animationFrame = null;

            if (!isOpen(item)) return;

            content.style.maxHeight =
                content.scrollHeight + "px";

        });

    }


    /* =====================================================
       8. ACCORDION CLOSE
       ===================================================== */

    function closeAccordion(item) {

        const header = getHeader(item);
        const content = getContent(item);

        if (!header || !content) return;

        cancelAnimation(item);

        if (!isOpen(item)) {
            content.style.maxHeight = "0px";
            return;
        }

        // Start from current height for reliable transitions.

        content.style.maxHeight =
            content.scrollHeight + "px";

        // Force layout before collapsing.

        void content.offsetHeight;

        item.classList.remove("open");

        header.setAttribute(
            "aria-expanded",
            "false"
        );

        content.style.maxHeight = "0px";

        content.setAttribute(
            "aria-hidden",
            "true"
        );

        // Prevent keyboard access to collapsed content.

        const state = getItemState(item);

        const duration = reducedMotion.matches
            ? 0
            : CONFIG.animationDuration;

        state.transitionTimer = setTimeout(() => {

            state.transitionTimer = null;

            if (!isOpen(item)) {
                content.inert = true;
            }

        }, duration);

    }


    /* =====================================================
       9. CLOSE ALL ACCORDIONS
       ===================================================== */

    function closeAllAccordions() {

        accordionItems.forEach(item => {
            closeAccordion(item);
        });

    }


    /* =====================================================
       10. ACCORDION EVENT HANDLING
       ===================================================== */

    function toggleAccordion(item) {

        if (!item || !accordionItems.includes(item)) {
            return;
        }

        const section = getSection(item);

        if (
            section &&
            !section.classList.contains("active")
        ) {
            return;
        }

        if (isOpen(item)) {
            closeAccordion(item);
        } else {
            openAccordion(item);
        }

    }

    // Event delegation.

    document.addEventListener("click", event => {

        const trigger = event.target.closest(
            `${SELECTORS.trigger}, ${SELECTORS.header}`
        );

        if (!trigger) return;

        const item = trigger.closest(
            SELECTORS.accordion
        );

        if (!item) return;

        if (getHeader(item) !== trigger) return;

        // Legacy h3 uses click; real buttons use native click.

        if (
            trigger.matches(SELECTORS.trigger) ||
            trigger.tagName === "H3"
        ) {
            toggleAccordion(item);
        }

    });

    // Keyboard support for legacy h3 headers.
    // Native buttons already handle Enter and Space.

    document.addEventListener("keydown", event => {

        const header = event.target.closest(
            SELECTORS.header
        );

        if (!header) return;

        if (
            header.matches(SELECTORS.trigger) ||
            header.tagName !== "H3"
        ) {
            return;
        }

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();

            const item = header.closest(
                SELECTORS.accordion
            );

            toggleAccordion(item);
        }

    });


    /* =====================================================
       11. TAB ACTIVATION
       ===================================================== */

    function activateTab(button, options = {}) {

        if (!button || button.disabled) return;

        const targetId = button.dataset.section;

        const targetSection =
            document.getElementById(targetId);

        if (
            !targetSection ||
            !sections.includes(targetSection)
        ) {
            return;
        }

        const {
            moveFocus = false
        } = options;

        activeTab = button;
        activeSection = targetSection;

        // Update tab buttons.

        tabButtons.forEach(tab => {

            const active = tab === button;

            tab.classList.toggle("active", active);

            tab.setAttribute(
                "aria-selected",
                String(active)
            );

            tab.setAttribute(
                "tabindex",
                active ? "0" : "-1"
            );

        });

        // Update sections.

        sections.forEach(section => {

            const active = section === targetSection;

            section.classList.toggle(
                "active",
                active
            );

            section.setAttribute(
                "aria-hidden",
                String(!active)
            );

            // Truly hide inactive panels.

            section.hidden = !active;

        });

        if (CONFIG.closeOnTabChange) {
            closeAllAccordions();
        }

        applySearch();

        if (moveFocus) {
            button.focus();
        }

    }


    /* =====================================================
       12. TAB KEYBOARD NAVIGATION
       ===================================================== */

    function initializeTabKeyboard() {

        if (!CONFIG.enableKeyboardNavigation) return;

        tabButtons.forEach((button, index) => {

            button.addEventListener("keydown", event => {

                const enabledTabs = tabButtons.filter(
                    tab => !tab.disabled
                );

                const currentIndex =
                    enabledTabs.indexOf(button);

                if (currentIndex === -1) return;

                let nextIndex = currentIndex;

                switch (event.key) {

                    case "ArrowRight":
                    case "ArrowDown":
                        nextIndex =
                            (currentIndex + 1) %
                            enabledTabs.length;
                        break;

                    case "ArrowLeft":
                    case "ArrowUp":
                        nextIndex =
                            (currentIndex - 1 +
                            enabledTabs.length) %
                            enabledTabs.length;
                        break;

                    case "Home":
                        nextIndex = 0;
                        break;

                    case "End":
                        nextIndex =
                            enabledTabs.length - 1;
                        break;

                    default:
                        return;

                }

                event.preventDefault();

                activateTab(
                    enabledTabs[nextIndex],
                    { moveFocus: true }
                );

            });

        });

    }


    /* =====================================================
       13. TAB CLICK HANDLING
       ===================================================== */

    tabButtons.forEach(button => {

        button.addEventListener("click", () => {

            activateTab(button);

        });

    });


    /* =====================================================
       14. SEARCH STATUS
       ===================================================== */

    let searchStatus = $(SELECTORS.searchStatus);

    if (!searchStatus && searchInput) {

        searchStatus = document.createElement("div");

        searchStatus.id = "search-status";

        searchStatus.setAttribute(
            "role",
            "status"
        );

        searchStatus.setAttribute(
            "aria-live",
            "polite"
        );

        searchStatus.setAttribute(
            "aria-atomic",
            "true"
        );

        // Visually hidden but available to screen readers.

        Object.assign(searchStatus.style, {
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: "0",
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: "0"
        });

        searchInput.insertAdjacentElement(
            "afterend",
            searchStatus
        );

    }


    /* =====================================================
       15. SMART SEARCH
       ===================================================== */

    function matchesSearch(item, query) {

        if (!query) return true;

        const text = normalizeText(
            item.textContent
        );

        const words = query.split(/\s+/);

        if (CONFIG.searchAllWords) {

            return words.every(word =>
                text.includes(word)
            );

        }

        return words.some(word =>
            text.includes(word)
        );

    }


    /* =====================================================
       16. APPLY SEARCH
       ===================================================== */

    function applySearch() {

        const section = getActiveSection();

        if (!section) return;

        const query = normalizeText(
            searchQuery
        );

        const items = $$(SELECTORS.accordion, section);

        let visibleCount = 0;

        items.forEach(item => {

            const matches = matchesSearch(
                item,
                query
            );

            item.hidden = !matches;

            item.style.display =
                matches ? "" : "none";

            if (matches) {
                visibleCount++;
            } else {
                closeAccordion(item);
            }

        });

        // Optional empty-state element.

        const emptyState = $(
            ".search-empty",
            section
        );

        if (emptyState) {

            emptyState.hidden =
                visibleCount !== 0 || !query;

        }

        // Announce results.

        if (searchStatus) {

            if (!query) {

                searchStatus.textContent = "";

            } else if (visibleCount === 0) {

                searchStatus.textContent =
                    "No matching results found.";

            } else {

                searchStatus.textContent =
                    `${visibleCount} matching ` +
                    `${visibleCount === 1 ? "result" : "results"} found.`;

            }

        }

        // Optional hide empty sections.

        if (CONFIG.hideEmptySections && query) {

            sections.forEach(currentSection => {

                if (currentSection !== section) return;

                currentSection.classList.toggle(
                    "no-search-results",
                    visibleCount === 0
                );

            });

        } else {

            section.classList.remove(
                "no-search-results"
            );

        }

    }


    /* =====================================================
       17. SEARCH INPUT
       ===================================================== */

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            searchQuery = searchInput.value;

            applySearch();

        });

        searchInput.addEventListener("keydown", event => {

            if (event.key === "Escape") {

                searchInput.value = "";

                searchQuery = "";

                applySearch();

                searchInput.blur();

            }

        });

    }


    /* =====================================================
       18. CLEAR SEARCH
       ===================================================== */

    const clearSearchBtn = $(
        "#clear-search"
    );

    if (clearSearchBtn && searchInput) {

        clearSearchBtn.addEventListener("click", () => {

            searchInput.value = "";

            searchQuery = "";

            applySearch();

            searchInput.focus();

        });

    }


    /* =====================================================
       19. REFRESH OPEN ACCORDIONS
       ===================================================== */

    function refreshAccordion(item) {

        if (!isOpen(item)) return;

        const content = getContent(item);

        if (!content) return;

        content.style.maxHeight =
            content.scrollHeight + "px";

    }

    function refreshOpenAccordions() {

        accordionItems.forEach(item => {
            refreshAccordion(item);
        });

    }


    /* =====================================================
       20. RESIZE OBSERVER
       ===================================================== */

    if ("ResizeObserver" in window) {

        resizeObserver = new ResizeObserver(entries => {

            entries.forEach(entry => {

                const content = entry.target;

                const item = content.closest(
                    SELECTORS.accordion
                );

                if (item && isOpen(item)) {

                    refreshAccordion(item);

                }

            });

        });

        accordionItems.forEach(item => {

            const content = getContent(item);

            if (content) {
                resizeObserver.observe(content);
            }

        });

    }


    /* =====================================================
       21. WINDOW RESIZE
       ===================================================== */

    let resizeTimeout;

    window.addEventListener("resize", () => {

        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {

            refreshOpenAccordions();

        }, 100);

    }, { passive: true });


    /* =====================================================
       22. SCROLL TO TOP
       ===================================================== */

    if (scrollTopBtn) {

        function updateScrollButton() {

            const visible =
                window.scrollY > CONFIG.scrollThreshold;

            scrollTopBtn.classList.toggle(
                "visible",
                visible
            );

            scrollTopBtn.setAttribute(
                "aria-hidden",
                String(!visible)
            );

        }

        window.addEventListener("scroll", () => {

            if (scrollTicking) return;

            scrollTicking = true;

            requestAnimationFrame(() => {

                updateScrollButton();

                scrollTicking = false;

            });

        }, { passive: true });

        scrollTopBtn.addEventListener("click", () => {

            window.scrollTo({

                top: 0,

                behavior: reducedMotion.matches
                    ? "instant"
                    : "smooth"

            });

        });

        updateScrollButton();

    }


    /* =====================================================
       23. OPTIONAL EXPAND / COLLAPSE ALL
       ===================================================== */

    const expandAllBtn = $(
        "#expand-all"
    );

    const collapseAllBtn = $(
        "#collapse-all"
    );

    if (expandAllBtn) {

        expandAllBtn.addEventListener("click", () => {

            const section = getActiveSection();

            if (!section) return;

            const visibleItems = $$(
                SELECTORS.accordion,
                section
            ).filter(item => !item.hidden);

            if (CONFIG.closeOthers) {

                // Preserve one-open-at-a-time behavior.

                if (visibleItems.length) {
                    openAccordion(visibleItems[0]);
                }

            } else {

                visibleItems.forEach(openAccordion);

            }

        });

    }

    if (collapseAllBtn) {

        collapseAllBtn.addEventListener(
            "click",
            closeAllAccordions
        );

    }


    /* =====================================================
       24. INITIALIZATION
       ===================================================== */

    initializeTabs();

    initializeAccordions();

    initializeTabKeyboard();

    // Find the first valid active tab.

    const initialTab =
        tabButtons.find(button =>
            button.classList.contains("active") &&
            !button.disabled &&
            sections.includes(
                document.getElementById(
                    button.dataset.section
                )
            )
        ) ||
        tabButtons.find(button =>
            !button.disabled &&
            sections.includes(
                document.getElementById(
                    button.dataset.section
                )
            )
        );

    if (initialTab) {

        activateTab(initialTab);

    } else {

        // Fallback for pages without tabs.

        activeSection = sections[0];

        sections.forEach((section, index) => {

            const active = index === 0;

            section.classList.toggle(
                "active",
                active
            );

            section.hidden = !active;

            section.setAttribute(
                "aria-hidden",
                String(!active)
            );

        });

        applySearch();

    }

    closeAllAccordions();

    console.info(
        "Feathoria Smart Accordion System 2.0 initialized."
    );


    /* =====================================================
       25. CLEANUP SUPPORT
       ===================================================== */

    // Optional cleanup for dynamically removed pages.

    window.FeathoriaAccordion = {

        open: openAccordion,

        close: closeAccordion,

        closeAll: closeAllAccordions,

        refresh: refreshOpenAccordions,

        activateTab: activateTab,

        search: query => {

            if (!searchInput) return;

            searchInput.value = query || "";

            searchQuery = searchInput.value;

            applySearch();

        },

        destroy: () => {

            if (resizeObserver) {
                resizeObserver.disconnect();
            }

            window.FeathoriaAccordion = null;

        }

    };

});
