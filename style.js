
/* ============================================================
   FEATHORIA — INTERACTION ENGINE 4.0
   Shared JavaScript for all Feathoria pages

   Features:
   01. Environment detection
   02. Shared utilities
   03. Typewriter animation
   04. Scroll reveal
   05. Dynamic content observation
   06. Desktop hover effects
   07. Scroll-to-top
   08. Accessible accordion system
   09. Search and filtering
   10. Button feedback
   11. External link security
   12. Page visibility
   13. Public API

   Compatible with:
   - index.html
   - ipoems.html
   - iquotes.html
   - own.html
   - game.html
   - contact.html
   - thankyou.html
   - privacy.html

   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     01. INITIALIZATION & ENVIRONMENT
     ========================================================== */

  const Feathoria = window.Feathoria || {};

  window.Feathoria = Feathoria;

  // Prevent accidental duplicate initialization.
  if (Feathoria.initialized) return;

  const CONFIG = {
    version: '4.0.0',

    selectors: {
      hero: '.hero h2',

      reveal: '.poem-item, .quote-item',

      hover: '.poem-item, .quote-item',

      accordion: '.accordion-item',

      accordionHeading: '.accordion-item h3',

      accordionContent: '.accordion-content',

      search: '#search-input',

      scrollTop: '#scroll-top',

      randomButton: '.random-button button'
    },

    animation: {
      typewriterSpeed: 38,
      revealThreshold: 0.08,
      revealRootMargin: '0px 0px 55px 0px',
      scrollTopThreshold: 320
    },

    search: {
      debounce: 0
    }
  };

  const reducedMotionQuery = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  const finePointerQuery = window.matchMedia(
    '(hover: hover) and (pointer: fine)'
  );

  let reducedMotion = reducedMotionQuery.matches;
  let finePointer = finePointerQuery.matches;

  const state = {
    initialized: false,
    revealObserver: null,
    revealMutationObserver: null,
    accordionResizeObserver: null,
    linkMutationObserver: null,
    accordionItems: new Set(),
    searchInput: null,
    typewriterTimer: null,
    scrollFrame: null
  };


  /* ==========================================================
     02. SHARED UTILITIES
     ========================================================== */

  const helpers = {

    /**
     * Normalize text for reliable searching.
     * Handles capitalization, accents and extra spaces.
     */
    normalizeText(value) {
      return String(value ?? '')
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    },


    /**
     * Debounce repeated function calls.
     */
    debounce(callback, delay = 150) {
      let timer = null;

      return function (...args) {
        window.clearTimeout(timer);

        timer = window.setTimeout(() => {
          callback.apply(this, args);
        }, delay);
      };
    },


    /**
     * Throttle function execution using animation frames.
     */
    frameThrottle(callback) {
      let scheduled = false;

      return function (...args) {
        if (scheduled) return;

        scheduled = true;

        window.requestAnimationFrame(() => {
          scheduled = false;
          callback.apply(this, args);
        });
      };
    },


    /**
     * Get focusable elements inside a container.
     */
    getFocusableElements(container) {
      if (!container) return [];

      return Array.from(
        container.querySelectorAll(
          [
            'a[href]',
            'button:not(:disabled)',
            'input:not(:disabled)',
            'textarea:not(:disabled)',
            'select:not(:disabled)',
            '[tabindex]:not([tabindex="-1"])'
          ].join(',')
        )
      ).filter(element => {
        return !element.hidden &&
          element.getAttribute('aria-hidden') !== 'true';
      });
    },


    /**
     * Safely find an element.
     */
    getElement(selector, parent = document) {
      if (!selector || !parent) return null;

      return parent.querySelector(selector);
    },


    /**
     * Safely find multiple elements.
     */
    getElements(selector, parent = document) {
      if (!selector || !parent) return [];

      return Array.from(parent.querySelectorAll(selector));
    },


    /**
     * Check whether an element exists.
     */
    exists(selector) {
      return Boolean(document.querySelector(selector));
    },


    /**
     * Generate a unique ID.
     */
    uniqueId(prefix = 'feathoria') {
      helpers.uniqueId.counter =
        (helpers.uniqueId.counter || 0) + 1;

      return `${prefix}-${helpers.uniqueId.counter}`;
    },


    /**
     * Check if an element is currently visible.
     */
    isVisible(element) {
      if (!element || !element.isConnected) return false;

      return !element.hidden &&
        element.getAttribute('aria-hidden') !== 'true';
    }
  };

  Feathoria.helpers = helpers;


  /* ==========================================================
     03. TYPEWRITER EFFECT
     ========================================================== */

  function initTypewriter() {
    const heading = helpers.getElement(CONFIG.selectors.hero);

    if (!heading) return;

    if (heading.dataset.typewriterInitialized === 'true') {
      return;
    }

    // Only animate simple text headings.
    // Do not destroy nested HTML or interactive elements.
    if (heading.children.length > 0) return;

    const originalText = heading.textContent.trim();

    if (!originalText) return;

    heading.dataset.typewriterInitialized = 'true';

    // Preserve the full heading for assistive technology.
    if (!heading.hasAttribute('aria-label')) {
      heading.setAttribute('aria-label', originalText);
    }

    // Respect reduced-motion preferences.
    if (reducedMotion) return;

    const textNode = document.createTextNode('');

    const cursor = document.createElement('span');

    cursor.className = 'typewriter-cursor';
    cursor.textContent = '|';
    cursor.setAttribute('aria-hidden', 'true');

    // Inject cursor styling only once.
    if (!document.getElementById('feathoria-typewriter-style')) {
      const style = document.createElement('style');

      style.id = 'feathoria-typewriter-style';

      style.textContent = `
        .typewriter-cursor {
          display: inline-block;
          margin-left: 3px;
          color: var(--cyan, #8df5ff);
          font-weight: 300;
          animation: feathoria-cursor-blink 850ms steps(2, start) infinite;
        }

        @keyframes feathoria-cursor-blink {
          to {
            visibility: hidden;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .typewriter-cursor {
            animation: none;
          }
        }
      `;

      document.head.appendChild(style);
    }

    heading.replaceChildren(textNode, cursor);

    let index = 0;

    function typeNextCharacter() {
      if (!heading.isConnected) {
        window.clearTimeout(state.typewriterTimer);
        return;
      }

      if (document.hidden) {
        state.typewriterTimer = window.setTimeout(
          typeNextCharacter,
          150
        );

        return;
      }

      if (index >= originalText.length) {
        heading.textContent = originalText;
        return;
      }

      textNode.textContent += originalText.charAt(index);

      index++;

      state.typewriterTimer = window.setTimeout(
        typeNextCharacter,
        CONFIG.animation.typewriterSpeed
      );
    }

    typeNextCharacter();
  }


  /* ==========================================================
     04. SCROLL REVEAL
     ========================================================== */

  function initScrollReveal() {
    const selector = CONFIG.selectors.reveal;

    const elements = helpers.getElements(selector);

    if (!elements.length) return;

    // Reveal everything immediately when motion is reduced
    // or IntersectionObserver is unavailable.
    if (
      reducedMotion ||
      !('IntersectionObserver' in window)
    ) {
      elements.forEach(element => {
        element.classList.add('visible');
      });

      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('visible');

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: CONFIG.animation.revealThreshold,

        rootMargin: CONFIG.animation.revealRootMargin
      }
    );

    function observeElement(element) {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      if (element.dataset.revealInitialized === 'true') {
        return;
      }

      element.dataset.revealInitialized = 'true';

      element.classList.add('fade-item');

      observer.observe(element);
    }

    elements.forEach(observeElement);

    state.revealObserver = observer;

    // Observe newly inserted poems and quotes.
    if ('MutationObserver' in window) {
      const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;

            if (node.matches(selector)) {
              observeElement(node);
            }

            node.querySelectorAll(selector).forEach(
              observeElement
            );
          });
        });
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

      state.revealMutationObserver = mutationObserver;
    }
  }


  /* ==========================================================
     05. DESKTOP HOVER EFFECTS
     ========================================================== */

  function initHoverEffects() {
    if (!finePointer) return;

    const selector = CONFIG.selectors.hover;

    document.addEventListener('pointerover', event => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const item = target.closest(selector);

      if (!item) return;

      // Ignore movement between children of the same card.
      if (
        event.relatedTarget instanceof Node &&
        item.contains(event.relatedTarget)
      ) {
        return;
      }

      item.classList.add('item-hover');
    });

    document.addEventListener('pointerout', event => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const item = target.closest(selector);

      if (!item) return;

      // Ignore movement between children of the same card.
      if (
        event.relatedTarget instanceof Node &&
        item.contains(event.relatedTarget)
      ) {
        return;
      }

      item.classList.remove('item-hover');
    });
  }


  /* ==========================================================
     06. SCROLL TO TOP
     ========================================================== */

  function initScrollTop() {
    const button = helpers.getElement(CONFIG.selectors.scrollTop);

    if (!button) return;

    if (button.dataset.scrollInitialized === 'true') {
      return;
    }

    button.dataset.scrollInitialized = 'true';

    let visible = false;

    if (!button.hasAttribute('aria-label')) {
      button.setAttribute('aria-label', 'Scroll to top');
    }

    button.setAttribute('aria-hidden', 'true');
    button.tabIndex = -1;

    function updateVisibility() {
      const shouldShow =
        window.scrollY > CONFIG.animation.scrollTopThreshold;

      if (shouldShow === visible) return;

      visible = shouldShow;

      button.classList.toggle('is-visible', visible);

      button.setAttribute(
        'aria-hidden',
        String(!visible)
      );

      button.tabIndex = visible ? 0 : -1;

      if ('inert' in button) {
        button.inert = !visible;
      }
    }

    const handleScroll = helpers.frameThrottle(updateVisibility);

    window.addEventListener('scroll', handleScroll, {
      passive: true
    });

    window.addEventListener('resize', handleScroll, {
      passive: true
    });

    button.addEventListener('click', event => {
      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
    });

    updateVisibility();
  }


  /* ==========================================================
     07. ACCESSIBLE ACCORDION SYSTEM
     ========================================================== */

  function initAccordion() {
    const itemSelector = CONFIG.selectors.accordion;
    const contentSelector = CONFIG.selectors.accordionContent;

    if (!document.querySelector(itemSelector)) return;

    function getItems() {
      return helpers.getElements(itemSelector);
    }

    function getHeading(item) {
      return item.querySelector('h3');
    }

    function getContent(item) {
      return item.querySelector(contentSelector);
    }

    function getTrigger(item) {
      const heading = getHeading(item);

      if (!heading) return null;

      return heading.querySelector(
        '.accordion-trigger, button'
      ) || heading;
    }

    function observePanel(content) {
      if (!state.accordionResizeObserver || !content) {
        return;
      }

      if (state.accordionItems.has(content)) return;

      state.accordionItems.add(content);

      state.accordionResizeObserver.observe(content);
    }

    function prepareItem(item) {
      if (!item) return null;

      const heading = getHeading(item);
      const content = getContent(item);
      const trigger = getTrigger(item);

      if (!heading || !content || !trigger) {
        return null;
      }

      if (!content.id) {
        content.id = helpers.uniqueId('feathoria-accordion');
      }

      // A real button is preferred, but legacy h3 triggers
      // remain supported.
      if (trigger === heading) {
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
      }

      trigger.setAttribute('aria-controls', content.id);
      heading.setAttribute('aria-controls', content.id);

      observePanel(content);

      return {
        heading,
        trigger,
        content
      };
    }

    function setOpen(item, shouldOpen) {
      const elements = prepareItem(item);

      if (!elements) return;

      const { heading, trigger, content } = elements;

      const currentlyOpen = content.dataset.open === 'true';

      if (currentlyOpen === shouldOpen) return;

      // Do not leave keyboard focus inside a panel that is closing.
      if (
        !shouldOpen &&
        content.contains(document.activeElement)
      ) {
        trigger.focus();
      }

      if (shouldOpen) {
        content.hidden = false;

        content.dataset.open = 'true';

        content.setAttribute('aria-hidden', 'false');

        if ('inert' in content) {
          content.inert = false;
        }

        trigger.setAttribute('aria-expanded', 'true');
        heading.setAttribute('aria-expanded', 'true');

        // Start from zero and animate to the actual content height.
        content.style.maxHeight = '0px';

        window.requestAnimationFrame(() => {
          if (content.dataset.open !== 'true') return;

          content.style.maxHeight = `${content.scrollHeight}px`;
        });

      } else {
        content.dataset.open = 'false';

        content.setAttribute('aria-hidden', 'true');

        if ('inert' in content) {
          content.inert = true;
        }

        trigger.setAttribute('aria-expanded', 'false');
        heading.setAttribute('aria-expanded', 'false');

        content.style.maxHeight = '0px';
      }
    }

    function openItem(item) {
      if (!item || !item.matches(itemSelector)) return;

      // Preserve the original single-open-at-a-time behavior.
      getItems().forEach(otherItem => {
        if (otherItem !== item) {
          setOpen(otherItem, false);
        }
      });

      setOpen(item, true);
    }

    function closeItem(item) {
      if (!item || !item.matches(itemSelector)) return;

      setOpen(item, false);
    }

    function toggleItem(item) {
      const content = getContent(item);

      if (!content) return;

      if (content.dataset.open === 'true') {
        closeItem(item);
      } else {
        openItem(item);
      }
    }

    // ResizeObserver keeps open panels sized correctly when
    // images, fonts, or dynamic content change their height.
    if ('ResizeObserver' in window) {
      state.accordionResizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const content = entry.target;

          if (content.dataset.open !== 'true') return;

          content.style.maxHeight =
            `${content.scrollHeight}px`;
        });
      });
    }

    // Initialize existing accordions while respecting any
    // initial open state in the HTML.
    getItems().forEach(item => {
      const elements = prepareItem(item);

      if (!elements) return;

      const { heading, trigger, content } = elements;

      const initiallyOpen =
        content.dataset.open === 'true' ||
        trigger.getAttribute('aria-expanded') === 'true' ||
        heading.getAttribute('aria-expanded') === 'true';

      content.dataset.open = initiallyOpen ? 'true' : 'false';

      content.setAttribute(
        'aria-hidden',
        String(!initiallyOpen)
      );

      if ('inert' in content) {
        content.inert = !initiallyOpen;
      }

      trigger.setAttribute(
        'aria-expanded',
        String(initiallyOpen)
      );

      heading.setAttribute(
        'aria-expanded',
        String(initiallyOpen)
      );

      content.style.maxHeight = initiallyOpen
        ? `${content.scrollHeight}px`
        : '0px';
    });

    // Delegated click handling supports dynamically inserted items.
    document.addEventListener('click', event => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const trigger = target.closest(
        '.accordion-item h3, .accordion-item .accordion-trigger'
      );

      if (!trigger) return;

      // Links inside headings should retain their normal behavior.
      if (target.closest('a')) return;

      const item = trigger.closest(itemSelector);

      if (!item || !getContent(item)) return;

      toggleItem(item);
    });

    // Keyboard activation for legacy h3-based triggers.
    document.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;

      const target = event.target;

      if (!(target instanceof Element)) return;

      const heading = target.closest('.accordion-item h3');

      if (!heading) return;

      // Native buttons already provide keyboard activation.
      if (heading.querySelector('button, .accordion-trigger')) {
        return;
      }

      event.preventDefault();

      const item = heading.closest(itemSelector);

      if (item) toggleItem(item);
    });

    // Keep open accordion heights correct after viewport changes.
    window.addEventListener(
      'resize',
      helpers.debounce(() => {
        getItems().forEach(item => {
          const content = getContent(item);

          if (!content || content.dataset.open !== 'true') {
            return;
          }

          content.style.maxHeight =
            `${content.scrollHeight}px`;
        });
      }, 120),
      { passive: true }
    );

    // Public accordion API.
    Feathoria.accordion = {

      open(item) {
        const element = typeof item === 'string'
          ? document.querySelector(item)
          : item;

        if (element instanceof Element) {
          openItem(element);
        }
      },

      close(item) {
        const element = typeof item === 'string'
          ? document.querySelector(item)
          : item;

        if (element instanceof Element) {
          closeItem(element);
        }
      },

      toggle(item) {
        const element = typeof item === 'string'
          ? document.querySelector(item)
          : item;

        if (element instanceof Element) {
          toggleItem(element);
        }
      },

      closeAll() {
        getItems().forEach(closeItem);
      },

      getOpenItems() {
        return getItems().filter(item => {
          const content = getContent(item);

          return content?.dataset.open === 'true';
        });
      }
    };
  }


  /* ==========================================================
     08. SEARCH & FILTER SYSTEM
     ========================================================== */

  function initSearch() {
    const input = helpers.getElement(CONFIG.selectors.search);

    if (!input) return;

    if (input.dataset.searchInitialized === 'true') {
      return;
    }

    input.dataset.searchInitialized = 'true';

    state.searchInput = input;

    /*
      Search targets:
      - Standalone poem cards
      - Standalone quote cards
      - Accordion items
      - Boxes
      - Elements explicitly marked with data-search-item

      When a target contains another search target, only the
      innermost target is filtered. This prevents a parent card
      from hiding a matching child card.
    */

    const searchSelector = [
      '.boxes-container .box',
      '.poem-item',
      '.quote-item',
      '.accordion-item',
      '[data-search-item]'
    ].join(',');

    const originalHiddenStates = new WeakMap();

    function getSearchTargets() {
      const candidates = helpers.getElements(searchSelector)
        .filter(element => !element.hasAttribute('data-search-ignore'));

      return candidates.filter(element => {
        return !candidates.some(other => {
          return other !== element && element.contains(other);
        });
      });
    }

    function rememberOriginalState(element) {
      if (!originalHiddenStates.has(element)) {
        originalHiddenStates.set(element, element.hidden);
      }
    }

    function filterTargets(query) {
      const targets = getSearchTargets();

      let matchCount = 0;

      targets.forEach(element => {
        rememberOriginalState(element);

        const originallyHidden =
          originalHiddenStates.get(element);

        // Preserve elements deliberately hidden in the HTML.
        if (originallyHidden) {
          element.hidden = true;
          return;
        }

        const text = helpers.normalizeText(element.textContent);

        const matches =
          !query || text.includes(query);

        element.hidden = !matches;

        element.dataset.searchMatch = String(matches);

        if (matches) {
          matchCount++;
        }

        if (
          !matches &&
          element.matches(CONFIG.selectors.accordion)
        ) {
          const content = element.querySelector(
            CONFIG.selectors.accordionContent
          );

          if (content?.dataset.open === 'true') {
            Feathoria.accordion?.close(element);
          }
        }
      });

      return matchCount;
    }

    function performSearch() {
      const query = helpers.normalizeText(input.value);

      const matchCount = filterTargets(query);

      input.dataset.searchActive = String(Boolean(query));

      input.setAttribute(
        'aria-label',
        input.getAttribute('aria-label') ||
        'Search poems, quotes and sections'
      );

      // Optional result-count element.
      const resultElement = document.querySelector(
        '#search-results, [data-search-results]'
      );

      if (resultElement) {
        resultElement.textContent = query
          ? `${matchCount} result${matchCount === 1 ? '' : 's'} found`
          : '';
      }

      document.dispatchEvent(
        new CustomEvent('feathoria:search', {
          detail: {
            query,
            hasQuery: Boolean(query),
            matchCount
          }
        })
      );

      return matchCount;
    }

    const handleSearch = CONFIG.search.debounce > 0
      ? helpers.debounce(performSearch, CONFIG.search.debounce)
      : performSearch;

    input.addEventListener('input', handleSearch);

    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
      }

      if (event.key === 'Escape') {
        input.value = '';

        performSearch();

        input.blur();
      }
    });

    if (input.value.trim()) {
      performSearch();
    }

    // Public search API.
    Feathoria.search = {

      run(query) {
        input.value = String(query ?? '');

        return performSearch();
      },

      clear() {
        input.value = '';

        return performSearch();
      },

      getQuery() {
        return helpers.normalizeText(input.value);
      },

      refresh() {
        return performSearch();
      }
    };
  }


  /* ==========================================================
     09. BUTTON INTERACTION FEEDBACK
     ========================================================== */

  function initButtonFeedback() {
    const selector = CONFIG.selectors.randomButton;

    // Add a tiny pressed state to random buttons.
    if (!document.getElementById('feathoria-button-style')) {
      const style = document.createElement('style');

      style.id = 'feathoria-button-style';

      style.textContent = `
        .random-button button.is-pressed {
          transform: scale(0.97);
          filter: brightness(0.96);
        }

        @media (prefers-reduced-motion: reduce) {
          .random-button button.is-pressed {
            transform: none;
          }
        }
      `;

      document.head.appendChild(style);
    }

    document.addEventListener('pointerdown', event => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const button = target.closest(selector);

      if (!button || button.disabled) return;

      button.classList.add('is-pressed');
    });

    function releaseButton(event) {
      const target = event.target;

      if (!(target instanceof Element)) {
        document.querySelectorAll(
          `${selector}.is-pressed`
        ).forEach(button => {
          button.classList.remove('is-pressed');
        });

        return;
      }

      const button = target.closest(selector);

      if (button) {
        button.classList.remove('is-pressed');
      }
    }

    document.addEventListener('pointerup', releaseButton);
    document.addEventListener('pointercancel', releaseButton);
    document.addEventListener('pointerout', event => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const button = target.closest(selector);

      if (!button) return;

      if (
        event.relatedTarget instanceof Node &&
        button.contains(event.relatedTarget)
      ) {
        return;
      }

      button.classList.remove('is-pressed');
    });

    window.addEventListener('blur', () => {
      document.querySelectorAll(
        `${selector}.is-pressed`
      ).forEach(button => {
        button.classList.remove('is-pressed');
      });
    });
  }


  /* ==========================================================
     10. EXTERNAL LINK SECURITY
     ========================================================== */

  function secureExternalLink(link) {
    if (!(link instanceof HTMLAnchorElement)) return;

    if (link.target !== '_blank') return;

    const rel = new Set(
      (link.getAttribute('rel') || '')
        .split(/\s+/)
        .filter(Boolean)
    );

    rel.add('noopener');
    rel.add('noreferrer');

    link.setAttribute('rel', Array.from(rel).join(' '));
  }

  function secureExternalLinks() {
    helpers.getElements('a[target="_blank"]').forEach(
      secureExternalLink
    );

    // Handle links inserted later by other scripts.
    if (!('MutationObserver' in window)) return;

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          if (node.matches('a[target="_blank"]')) {
            secureExternalLink(node);
          }

          node.querySelectorAll?.(
            'a[target="_blank"]'
          ).forEach(secureExternalLink);
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    state.linkMutationObserver = observer;
  }


  /* ==========================================================
     11. PAGE VISIBILITY
     ========================================================== */

  function initPageVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        document.documentElement.dataset.pageHidden = 'true';
      } else {
        delete document.documentElement.dataset.pageHidden;
      }
    });
  }


  /* ==========================================================
     12. LIVE PREFERENCE UPDATES
     ========================================================== */

  function initPreferenceListeners() {
    function updateMotionPreference(event) {
      reducedMotion = event.matches;

      if (reducedMotion) {
        // Immediately reveal anything waiting for animation.
        helpers.getElements(
          `${CONFIG.selectors.reveal}.fade-item`
        ).forEach(element => {
          element.classList.add('visible');

          state.revealObserver?.unobserve(element);
        });

        // Stop an active typewriter animation and restore text.
        const heading = helpers.getElement(
          CONFIG.selectors.hero
        );

        if (heading?.dataset.typewriterInitialized === 'true') {
          window.clearTimeout(state.typewriterTimer);

          if (heading.children.length > 0) {
            const cursor = heading.querySelector(
              '.typewriter-cursor'
            );

            if (cursor) {
              cursor.remove();
            }
          }
        }
      }
    }

    function updatePointerPreference(event) {
      finePointer = event.matches;
    }

    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener(
        'change',
        updateMotionPreference
      );
    } else if (reducedMotionQuery.addListener) {
      reducedMotionQuery.addListener(
        updateMotionPreference
      );
    }

    if (finePointerQuery.addEventListener) {
      finePointerQuery.addEventListener(
        'change',
        updatePointerPreference
      );
    } else if (finePointerQuery.addListener) {
      finePointerQuery.addListener(
        updatePointerPreference
      );
    }
  }


  /* ==========================================================
     13. INITIALIZE ALL MODULES
     ========================================================== */

  function initialize() {
    if (state.initialized) return;

    state.initialized = true;

    initTypewriter();

    initScrollReveal();

    initHoverEffects();

    initScrollTop();

    initAccordion();

    initSearch();

    initButtonFeedback();

    secureExternalLinks();

    initPageVisibility();

    initPreferenceListeners();

    Feathoria.version = CONFIG.version;

    Feathoria.initialized = true;

    Feathoria.config = CONFIG;

    Feathoria.state = state;
  }


  /* ==========================================================
     14. START ENGINE
     ========================================================== */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, {
      once: true
    });
  } else {
    initialize();
  }

})();
