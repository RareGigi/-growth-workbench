(() => {
  'use strict';

  const ROOM_META = Object.freeze({
    'leaf-rain': { groups: ['rain', 'real'], mood: '沉静', hours: [21, 22, 23, 0, 1, 2, 3, 4] },
    library: { groups: ['real', 'calm'], mood: '稳定', hours: [9, 10, 11, 14, 15, 16] },
    cafe: { groups: ['real', 'rain'], mood: '轻盈', hours: [12, 13, 14, 15, 16, 17] },
    'magic-bookshop': { groups: ['fantasy', 'calm'], mood: '沉浸', hours: [18, 19, 20, 21, 22] },
    celestial: { groups: ['fantasy', 'eastern'], mood: '开阔', hours: [0, 1, 2, 3, 4, 17, 18] },
    temple: { groups: ['eastern', 'calm'], mood: '清醒', hours: [5, 6, 7, 8, 9] }
  });

  const FILTERS = Object.freeze([
    ['all', '全部'],
    ['real', '现实'],
    ['rain', '雨景'],
    ['fantasy', '奇幻'],
    ['eastern', '东方']
  ]);

  const OWN_UI_SELECTOR = '[data-focus-room-sheet], .focus-room-discovery';
  let activeFilter = 'all';
  let scheduled = false;

  function currentHour() {
    return new Date().getHours();
  }

  function recommendation() {
    const hour = currentHour();
    const exact = Object.entries(ROOM_META).find(([, meta]) => meta.hours.includes(hour));
    if (exact) return exact[0];
    if (hour < 10) return 'temple';
    if (hour < 18) return 'library';
    if (hour < 22) return 'magic-bookshop';
    return 'leaf-rain';
  }

  function roomName(sheet, id) {
    return sheet.querySelector(`[data-focus-v2-action="room"][data-id="${id}"] strong`)?.textContent?.trim() || '当前推荐';
  }

  function ensureStyles() {
    if (document.querySelector('#focus-room-discovery-styles')) return;
    const style = document.createElement('style');
    style.id = 'focus-room-discovery-styles';
    style.textContent = `
      .focus-room-discovery { padding:12px 18px 0; border-bottom:1px solid rgba(70,83,112,.07); background:linear-gradient(180deg,rgba(248,249,253,.98),rgba(248,249,253,.92)); }
      .focus-room-now { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px; padding:10px 12px; border:1px solid rgba(112,130,174,.15); border-radius:15px; background:rgba(239,243,252,.78); }
      .focus-room-now-copy { min-width:0; }
      .focus-room-now-copy small { display:block; color:#8b94a8; font-size:8px; font-weight:800; letter-spacing:.13em; }
      .focus-room-now-copy strong { display:block; margin-top:2px; color:#3e4860; font-size:12px; }
      .focus-room-now-copy span { display:block; margin-top:2px; color:#8993a8; font-size:9px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .focus-room-now button { flex:0 0 auto; min-height:38px; padding:0 12px; border:1px solid #d5def0; border-radius:11px; background:#fff; color:#526da8; font-size:10px; font-weight:800; -webkit-tap-highlight-color:transparent; }
      .focus-room-filters { display:flex; gap:7px; overflow-x:auto; padding:0 0 11px; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
      .focus-room-filters::-webkit-scrollbar { display:none; }
      .focus-room-filter { flex:0 0 auto; min-height:34px; padding:0 12px; border:1px solid #e0e5ef; border-radius:999px; background:#fff; color:#727d93; font-size:10px; font-weight:750; -webkit-tap-highlight-color:transparent; }
      .focus-room-filter.active { border-color:#9fb0d6; background:#edf2fc; color:#526ba4; box-shadow:0 0 0 2px rgba(94,120,179,.07); }
      .focus-room-card[data-discovery-hidden="true"] { display:none !important; }
      .focus-room-card[data-now-recommended="true"] .focus-room-card-media::after { content:'此刻推荐'; position:absolute; left:9px; top:9px; padding:5px 8px; border-radius:999px; background:rgba(43,51,69,.72); color:#fff; font-size:8px; font-weight:800; letter-spacing:.04em; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
      @media (max-width:760px) {
        .focus-room-discovery { padding:10px 12px 0; }
        .focus-room-now { margin-bottom:8px; padding:9px 10px; border-radius:13px; }
        .focus-room-filters { gap:6px; padding-bottom:9px; }
        .focus-room-filter { min-height:32px; padding:0 11px; font-size:9px; }
        .focus-room-card[data-now-recommended="true"] .focus-room-card-media::after { backdrop-filter:none; -webkit-backdrop-filter:none; }
      }
    `;
    document.head.appendChild(style);
  }

  function applyFilter(sheet) {
    sheet.querySelectorAll('[data-focus-v2-action="room"][data-id]').forEach((card) => {
      const groups = ROOM_META[card.dataset.id]?.groups || [];
      const visible = activeFilter === 'all' || groups.includes(activeFilter);
      card.dataset.discoveryHidden = visible ? 'false' : 'true';
    });
    sheet.querySelectorAll('[data-focus-room-filter]').forEach((button) => {
      const active = button.dataset.focusRoomFilter === activeFilter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function enhanceSheet(sheet) {
    if (!sheet || sheet.dataset.discoveryReady === 'true') return;
    sheet.dataset.discoveryReady = 'true';
    ensureStyles();

    const recommendedId = recommendation();
    const recommendedMeta = ROOM_META[recommendedId];
    const recommendedCard = sheet.querySelector(`[data-focus-v2-action="room"][data-id="${recommendedId}"]`);
    recommendedCard?.setAttribute('data-now-recommended', 'true');

    const discovery = document.createElement('div');
    discovery.className = 'focus-room-discovery';
    discovery.innerHTML = `
      <div class="focus-room-now">
        <div class="focus-room-now-copy">
          <small>RIGHT NOW</small>
          <strong>此刻更适合 · ${roomName(sheet, recommendedId)}</strong>
          <span>${recommendedMeta?.mood || '专注'}氛围 · 会保留你的声音设置，也可再一键应用推荐声景</span>
        </div>
        <button type="button" data-focus-room-now="${recommendedId}">进入</button>
      </div>
      <div class="focus-room-filters" role="group" aria-label="筛选自习室风格">
        ${FILTERS.map(([id, label]) => `<button type="button" class="focus-room-filter ${id === activeFilter ? 'active' : ''}" data-focus-room-filter="${id}" aria-pressed="${id === activeFilter}">${label}</button>`).join('')}
      </div>`;

    const header = sheet.querySelector(':scope > header');
    header?.insertAdjacentElement('afterend', discovery);
    applyFilter(sheet);
  }

  function scan() {
    scheduled = false;
    document.querySelectorAll('[data-focus-room-sheet]').forEach(enhanceSheet);
  }

  function scheduleScan() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(scan);
  }

  function mutationNeedsScan(records) {
    return records.some((record) => {
      const target = record.target?.nodeType === 1 ? record.target : record.target?.parentElement;
      if (!target?.closest) return true;
      if (target.matches('[data-timer-clock]') || target.closest('[data-timer-clock]')) return false;
      if (target.matches(OWN_UI_SELECTOR) || target.closest(OWN_UI_SELECTOR)) return false;
      return Array.from(record.addedNodes || []).some((node) => node.nodeType === 1 && (node.matches?.('[data-focus-room-sheet]') || node.querySelector?.('[data-focus-room-sheet]')));
    });
  }

  document.addEventListener('click', (event) => {
    const filter = event.target.closest('[data-focus-room-filter]');
    if (filter) {
      event.preventDefault();
      activeFilter = filter.dataset.focusRoomFilter || 'all';
      const sheet = filter.closest('[data-focus-room-sheet]');
      if (sheet) applyFilter(sheet);
      return;
    }

    const recommended = event.target.closest('[data-focus-room-now]');
    if (recommended) {
      event.preventDefault();
      const sheet = recommended.closest('[data-focus-room-sheet]');
      sheet?.querySelector(`[data-focus-v2-action="room"][data-id="${recommended.dataset.focusRoomNow}"]`)?.click();
    }
  }, true);

  const observer = new MutationObserver((records) => {
    if (mutationNeedsScan(records)) scheduleScan();
  });
  observer.observe(document.querySelector('#app') || document.body, { childList: true, subtree: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleScan(); });
  window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
  scheduleScan();
})();
