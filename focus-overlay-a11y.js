(() => {
  'use strict';

  const FOCUSABLE = [
    'button:not(:disabled)',
    'input:not(:disabled)',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    '[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  let lastOpener = null;
  let activePanel = null;
  let wasOpen = false;
  let frame = 0;

  const visible = (element) => Boolean(element && element.getClientRects().length && !element.closest('[hidden]'));
  const focusables = (container) => container ? [...container.querySelectorAll(FOCUSABLE)].filter(visible) : [];

  function currentPanel() {
    if (document.body.classList.contains('focus-room-open')) return document.querySelector('[data-focus-room-sheet]');
    if (document.body.classList.contains('focus-adjust-open')) return document.querySelector('[data-immersive-sheet]');
    return null;
  }

  function panelOpen() {
    return document.body.classList.contains('focus-room-open') || document.body.classList.contains('focus-adjust-open');
  }

  function syncPanelFocus() {
    frame = 0;
    const open = panelOpen();
    const panel = currentPanel();

    if (open && panel) {
      if (!wasOpen || activePanel !== panel) {
        activePanel = panel;
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        const title = panel.querySelector('h2');
        if (title) {
          if (!title.id) title.id = `focus-panel-title-${Math.random().toString(36).slice(2, 8)}`;
          panel.setAttribute('aria-labelledby', title.id);
        }
        const first = focusables(panel)[0];
        if (first && !panel.contains(document.activeElement)) first.focus({ preventScroll: true });
      }
    } else if (wasOpen) {
      activePanel = null;
      if (lastOpener?.isConnected && visible(lastOpener)) lastOpener.focus({ preventScroll: true });
      lastOpener = null;
    }
    wasOpen = open;
  }

  function scheduleSync() {
    if (frame) return;
    frame = requestAnimationFrame(syncPanelFocus);
  }

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-focus-v2-action="rooms"], [data-focus-v2-action="adjust"]');
    if (opener) lastOpener = opener;
    queueMicrotask(scheduleSync);
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || !panelOpen()) return;
    const panel = currentPanel();
    const items = focusables(panel);
    if (!panel || !items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }, true);

  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
  window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
  scheduleSync();
})();
