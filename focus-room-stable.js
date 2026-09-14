(() => {
  'use strict';

  const Core = window.GrowthCore;
  if (!Core) return;

  const VERSION = '2026.09-focus-stable-v1';
  const ROOMS = Object.freeze([
    { id:'leaf-rain', proxy:'leaf-rain', name:'窗叶听雨', image:'assets/scenes/focus-leaf-rain.webp', note:'贴近窗边的雨声与纸笔感，适合做题和长时间专注。', tag:'写实 · 雨夜', groups:['real','rain'], ambience:'leaf-rain', music:'graphite', ambienceVolume:.50, musicVolume:.16, rain:true, eyebrow:'RAIN & LEAVES' },
    { id:'library', proxy:'library', name:'深夜图书馆', image:'assets/scenes/focus-library.webp', note:'木质书库与稳定底噪，适合阅读、复盘和整理。', tag:'写实 · 安静', groups:['real'], ambience:'library', music:'quiet-books', ambienceVolume:.38, musicVolume:.14, rain:false, eyebrow:'NIGHT LIBRARY' },
    { id:'cafe', proxy:'cafe', name:'雨晨咖啡厅', image:'assets/scenes/focus-cafe.webp', note:'远处模糊人声与细雨，适合轻任务和自由写作。', tag:'写实 · 雨晨', groups:['real','rain'], ambience:'cafe', music:'graphite', ambienceVolume:.34, musicVolume:.13, rain:true, eyebrow:'QUIET CAFE' },
    { id:'magic-bookshop', proxy:'magic-bookshop', name:'月灯书屋', image:'assets/scenes/focus-magic-bookshop.webp', note:'旧书、炉火与一盏不熄的灯，适合夜读和沉浸写作。', tag:'奇幻 · 暖灯', groups:['fantasy'], ambience:'hearth', music:'quiet-books', ambienceVolume:.36, musicVolume:.15, rain:false, eyebrow:'MOONLIT BOOKSHOP' },
    { id:'celestial', proxy:'celestial', name:'云上天宫', image:'assets/scenes/focus-celestial.webp', note:'云气和远山打开视野，适合换脑子后重新进入状态。', tag:'玄幻 · 云间', groups:['xuanhuan'], ambience:'cloud-wind', music:'constellations', ambienceVolume:.40, musicVolume:.14, rain:false, eyebrow:'ABOVE THE CLOUDS' },
    { id:'temple', proxy:'temple', name:'山寺晨光', image:'assets/scenes/focus-temple.webp', note:'晨光、松风与疏钟，适合早起学习和清醒复盘。', tag:'古风 · 晨光', groups:['ancient'], ambience:'temple', music:'temple-dawn', ambienceVolume:.38, musicVolume:.12, rain:false, eyebrow:'MOUNTAIN TEMPLE' },
    { id:'night-window', proxy:'library', name:'城市静夜', image:'assets/scenes/focus-night.webp', note:'夜色压低了城市噪声，只留一张桌与一盏灯。', tag:'写实 · 深夜', groups:['real'], ambience:'library', music:'graphite', ambienceVolume:.34, musicVolume:.11, rain:false, eyebrow:'CITY AFTER MIDNIGHT' },
    { id:'sunlit-cafe', proxy:'library', name:'窗边午后', image:'assets/scenes/cafe-afternoon.webp', note:'日光、咖啡与轻微生活底噪，适合低压力推进。', tag:'写实 · 午后', groups:['real'], ambience:'cafe', music:'quiet-books', ambienceVolume:.30, musicVolume:.12, rain:false, eyebrow:'SUNLIT AFTERNOON' },
    { id:'mist-garden', proxy:'temple', name:'晨雾花园', image:'assets/scenes/garden-morning.webp', note:'浅雾、树影与柔风，适合早晨阅读和轻复盘。', tag:'写实 · 自然', groups:['real'], ambience:'cloud-wind', music:'temple-dawn', ambienceVolume:.34, musicVolume:.10, rain:false, eyebrow:'GARDEN MORNING' },
    { id:'jiangnan-rain', proxy:'leaf-rain', name:'江南雨阁', image:'assets/scenes/focus-jiangnan-rain.svg', note:'檐雨、河雾和暖灯把世界收窄到眼前这一页。', tag:'古风 · 江南雨', groups:['ancient','rain'], ambience:'leaf-rain', music:'temple-dawn', ambienceVolume:.46, musicVolume:.10, rain:true, eyebrow:'JIANGNAN RAIN PAVILION' },
    { id:'bamboo-court', proxy:'temple', name:'竹影书院', image:'assets/scenes/focus-bamboo-court.svg', note:'竹叶、纸窗与庭院风声，适合长阅读和背诵。', tag:'古风 · 竹院', groups:['ancient'], ambience:'temple', music:'temple-dawn', ambienceVolume:.32, musicVolume:.09, rain:false, eyebrow:'BAMBOO COURTYARD' },
    { id:'xianxia-terrace', proxy:'celestial', name:'云海仙台', image:'assets/scenes/focus-xianxia-terrace.svg', note:'浮山、星阵与缓慢云海，适合需要宏阔感的深度任务。', tag:'玄幻 · 仙台', groups:['xuanhuan'], ambience:'cloud-wind', music:'constellations', ambienceVolume:.42, musicVolume:.13, rain:false, eyebrow:'CELESTIAL TERRACE' },
    { id:'astral-observatory', proxy:'library', name:'星穹观测室', image:'assets/scenes/focus-astral-observatory.svg', note:'星图、望远镜与安静书架，适合夜间推演和写作。', tag:'奇幻 · 星穹', groups:['fantasy'], ambience:'library', music:'star-rain', ambienceVolume:.28, musicVolume:.14, rain:false, eyebrow:'ASTRAL OBSERVATORY' },
    { id:'crystal-library', proxy:'library', name:'晶蓝秘藏馆', image:'assets/scenes/focus-crystal-library.svg', note:'冷色晶石和深处书架形成低刺激的梦境阅读空间。', tag:'奇幻 · 秘藏馆', groups:['fantasy'], ambience:'library', music:'constellations', ambienceVolume:.30, musicVolume:.13, rain:false, eyebrow:'CRYSTAL ARCHIVE' }
  ]);

  const FILTERS = [['all','全部'],['real','写实'],['ancient','古风'],['xuanhuan','玄幻'],['fantasy','奇幻'],['rain','雨景']];
  let activeFilter = 'all';
  let scheduled = false;
  let restarting = false;

  const state = () => Core.state;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const byId = (id) => ROOMS.find((room) => room.id === id) || ROOMS[0];
  const known = (id) => ROOMS.some((room) => room.id === id);
  const selectedId = () => known(state().ui?.focusRoomV2) ? state().ui.focusRoomV2 : known(state().focusSettings?.roomId) ? state().focusSettings.roomId : 'leaf-rain';
  const selected = () => byId(selectedId());
  const setText = (node, text) => { if (node && node.textContent !== text) node.textContent = text; };

  function recommendedId() {
    const hour = new Date().getHours();
    if (hour < 5) return 'astral-observatory';
    if (hour < 8) return 'temple';
    if (hour < 11) return 'mist-garden';
    if (hour < 14) return 'sunlit-cafe';
    if (hour < 17) return 'library';
    if (hour < 20) return 'xianxia-terrace';
    if (hour < 23) return 'magic-bookshop';
    return 'jiangnan-rain';
  }

  function ensureStyles() {
    if (document.querySelector('#focus-room-stable-styles')) return;
    const style = document.createElement('style');
    style.id = 'focus-room-stable-styles';
    style.textContent = `
      .focus-room-experience{padding:12px 18px 0;border-bottom:1px solid rgba(70,83,112,.08);background:#f8f9fd}
      .focus-room-now{display:flex;min-height:58px;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;padding:10px 12px;border:1px solid rgba(112,130,174,.18);border-radius:15px;background:#eef2fa}
      .focus-room-now-copy{min-width:0}.focus-room-now-copy small{display:block;color:#7f899d;font-size:12px;font-weight:700}.focus-room-now-copy strong{display:block;margin-top:2px;color:#39445b;font-size:14px}.focus-room-now-copy span{display:block;margin-top:3px;overflow:hidden;color:#707b91;font-size:12px;line-height:1.4;text-overflow:ellipsis;white-space:nowrap}
      .focus-room-now button{flex:0 0 auto;min-width:72px;min-height:44px;padding:0 14px;border:1px solid #ced9ed;border-radius:12px;background:#fff;color:#4d69a5;font-size:12px;font-weight:700}
      .focus-room-filters{display:flex;gap:7px;overflow-x:auto;padding:0 0 11px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.focus-room-filters::-webkit-scrollbar{display:none}.focus-room-filter{flex:0 0 auto;min-height:44px;padding:0 14px;border:1px solid #dde3ee;border-radius:999px;background:#fff;color:#657188;font-size:12px;font-weight:600}.focus-room-filter.active{border-color:#98acd7;background:#eaf0fb;color:#45639f}
      .focus-room-card[hidden]{display:none!important}.focus-room-card-now{position:absolute;top:9px;left:9px;z-index:2;padding:5px 8px;border-radius:999px;background:rgba(35,43,61,.78);color:#fff;font-size:12px;font-style:normal;font-weight:700}
      .focus-room-card-copy em,.focus-room-card-copy span,.focus-room-sheet>header small,.focus-room-sheet>header p,.focus-room-launcher-copy small,.focus-room-launcher-copy span{font-size:12px!important}.focus-room-card-copy strong{font-size:14px!important}
      @media(max-width:760px){.focus-room-experience{padding:10px 12px 0}.focus-room-now{margin-bottom:8px;padding:9px 10px;border-radius:13px}.focus-room-now-copy span{max-width:58vw}.focus-room-filters{gap:6px;padding-bottom:9px}.focus-room-filter{padding:0 13px}.focus-room-card-current,.focus-room-card-now{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}}
    `;
    document.head.appendChild(style);
  }

  function roomCard(item, currentId, recId) {
    const current = item.id === currentId;
    return `<button type="button" class="focus-room-card ${current ? 'active' : ''}" data-stable-room="${esc(item.id)}" data-groups="${esc(item.groups.join(' '))}" aria-pressed="${current}"><span class="focus-room-card-media"><img src="${esc(item.image)}?v=${VERSION}" alt="${esc(item.name)}场景预览" width="640" height="360" loading="${current ? 'eager' : 'lazy'}" decoding="async"${current ? ' fetchpriority="high"' : ''}>${current ? '<i class="focus-room-card-current">当前</i>' : ''}${item.id === recId && !current ? '<i class="focus-room-card-now">此刻推荐</i>' : ''}</span><span class="focus-room-card-copy"><strong>${esc(item.name)}</strong><em>${esc(item.tag)}</em><span>${esc(item.note)}</span></span></button>`;
  }

  function applyFilter(sheet) {
    sheet.querySelectorAll('[data-stable-room]').forEach((card) => {
      const groups = String(card.dataset.groups || '').split(/\s+/).filter(Boolean);
      card.hidden = activeFilter !== 'all' && !groups.includes(activeFilter);
    });
    sheet.querySelectorAll('[data-stable-filter]').forEach((button) => {
      const active = button.dataset.stableFilter === activeFilter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function decorateRoomSheet() {
    const sheet = document.querySelector('[data-focus-room-sheet]');
    if (!sheet) return;
    const grid = sheet.querySelector('.focus-room-grid');
    if (!grid) return;
    const currentId = selectedId();
    const recId = recommendedId();
    const signature = `${VERSION}:${currentId}`;
    if (grid.dataset.stableRooms !== signature) {
      grid.dataset.stableRooms = signature;
      grid.innerHTML = ROOMS.map((item) => roomCard(item, currentId, recId)).join('');
    }
    let discovery = sheet.querySelector('[data-stable-room-experience]');
    if (!discovery) {
      discovery = document.createElement('div');
      discovery.className = 'focus-room-experience';
      discovery.dataset.stableRoomExperience = '';
      sheet.querySelector(':scope > header')?.insertAdjacentElement('afterend', discovery);
    }
    const rec = byId(recId);
    const html = `<div class="focus-room-now"><div class="focus-room-now-copy"><small>此刻推荐</small><strong>${esc(rec.name)}</strong><span>${esc(rec.tag)} · ${esc(rec.note)}</span></div><button type="button" data-stable-recommended="${esc(rec.id)}">进入</button></div><div class="focus-room-filters" role="group" aria-label="筛选自习室风格">${FILTERS.map(([id,label]) => `<button type="button" class="focus-room-filter ${id === activeFilter ? 'active' : ''}" data-stable-filter="${id}" aria-pressed="${id === activeFilter}">${label}</button>`).join('')}</div>`;
    if (discovery.innerHTML !== html) discovery.innerHTML = html;
    setText(sheet.querySelector(':scope > header p'), `共 ${ROOMS.length} 个场景；选择房间后切换推荐曲目与默认音量。`);
    applyFilter(sheet);
  }

  function applyScene() {
    const item = selected();
    const image = document.querySelector('.focus-scene-image');
    if (image && image.dataset.stableRoom !== item.id) {
      image.dataset.stableRoom = item.id;
      image.src = `${item.image}?v=${VERSION}`;
      image.alt = `${item.name}自习场景`;
      image.parentElement?.classList.remove('image-error');
    }
    const focusRoom = document.querySelector('.focus-room');
    if (focusRoom?.getAttribute('aria-label') !== `${item.name}专注自习室`) focusRoom?.setAttribute('aria-label', `${item.name}专注自习室`);
    setText(document.querySelector('.focus-weather span b'), item.name);
    if (state().timer?.status !== 'running') setText(document.querySelector('.focus-weather span small'), item.tag);
    setText(document.querySelector('.focus-weather em'), item.rain ? '雨幕场景' : `${item.groups.includes('real') ? '写实' : item.groups.includes('ancient') ? '古风' : item.groups.includes('xuanhuan') ? '玄幻' : '奇幻'}场景`);
    setText(document.querySelector('.focus-scene-caption span'), item.eyebrow);
    setText(document.querySelector('.focus-scene-caption p'), item.note);
    setText(document.querySelector('.focus-room-launcher-copy strong'), item.name);
    setText(document.querySelector('.focus-room-launcher-copy span'), item.tag);
    setText(document.querySelector('.immersive-dock-status > span'), item.name);
  }

  function syncControls() {
    const settings = state().focusSettings || {};
    ['ambience','music'].forEach((channel) => {
      const select = document.querySelector(`.timer-panel [data-focus-track="${channel}"]`);
      const id = settings[`${channel}Id`];
      if (select && select.value !== id) select.value = id;
      const input = document.querySelector(`.timer-panel [data-focus-volume="${channel}"]`);
      const value = String(Math.round((settings[`${channel}Volume`] ?? 0) * 100));
      if (input && input.value !== value) input.value = value;
      const output = document.querySelector(`.timer-panel [data-focus-output="${channel}"]`);
      setText(output, `${value}%`);
    });
  }

  function preset(item, enable = false) {
    const settings = state().focusSettings;
    if (!settings) return;
    settings.ambienceId = item.ambience;
    settings.musicId = item.music;
    settings.ambienceVolume = item.ambienceVolume;
    settings.musicVolume = item.musicVolume;
    if (enable) { settings.ambienceEnabled = true; settings.musicEnabled = true; }
  }

  function restartAudio(wasPlaying, forceStart = false) {
    if (restarting) return;
    restarting = true;
    requestAnimationFrame(() => {
      const master = document.querySelector('.timer-panel [data-action="focus-audio-master"]');
      if (!master) { restarting = false; return; }
      if (wasPlaying && master.classList.contains('active')) master.click();
      if (wasPlaying || forceStart) requestAnimationFrame(() => {
        const next = document.querySelector('.timer-panel [data-action="focus-audio-master"]');
        if (next && !next.classList.contains('active')) next.click();
        restarting = false;
      });
      else restarting = false;
    });
  }

  function chooseRoom(id) {
    const item = byId(id);
    const wasPlaying = Boolean(document.querySelector('.timer-panel .sound-master.active'));
    const proxy = document.querySelector(`.focus-room-picker [data-action="focus-room-select"][data-id="${item.proxy}"]`);
    if (state().focusSettings?.roomId !== item.proxy && proxy) proxy.click();
    else if (state().focusSettings) state().focusSettings.roomId = item.proxy;
    if (!state().ui) state().ui = {};
    state().ui.focusRoomV2 = item.id;
    preset(item, false);
    Core.save('focus-room-stable');
    requestAnimationFrame(() => {
      document.querySelector('[data-focus-v2-action="close-rooms"]')?.click();
      requestAnimationFrame(() => {
        applyScene();
        syncControls();
        restartAudio(wasPlaying, false);
      });
    });
  }

  function applyRecommended() {
    const item = selected();
    const wasPlaying = Boolean(document.querySelector('.timer-panel .sound-master.active'));
    preset(item, true);
    Core.save('focus-room-stable-recommended');
    requestAnimationFrame(() => { syncControls(); restartAudio(wasPlaying, true); });
  }

  function refresh() {
    scheduled = false;
    ensureStyles();
    applyScene();
    syncControls();
    if (document.body.classList.contains('focus-room-open')) decorateRoomSheet();
  }

  function scheduleRefresh() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(refresh);
  }

  document.addEventListener('click', (event) => {
    const room = event.target.closest('[data-stable-room]');
    if (room) { event.preventDefault(); event.stopPropagation(); chooseRoom(room.dataset.stableRoom); return; }
    const rec = event.target.closest('[data-stable-recommended]');
    if (rec) { event.preventDefault(); event.stopPropagation(); chooseRoom(rec.dataset.stableRecommended); return; }
    const filter = event.target.closest('[data-stable-filter]');
    if (filter) { event.preventDefault(); activeFilter = filter.dataset.stableFilter || 'all'; applyFilter(filter.closest('[data-focus-room-sheet]')); return; }
    const control = event.target.closest('[data-focus-v2-action]');
    if (control?.dataset.focusV2Action === 'recommend') queueMicrotask(applyRecommended);
    if (control) queueMicrotask(scheduleRefresh);
    const nav = event.target.closest('[data-action="navigate"][data-page="focus"]');
    if (nav) queueMicrotask(scheduleRefresh);
  }, true);

  const app = document.querySelector('#app');
  const observer = app ? new MutationObserver(() => scheduleRefresh()) : null;
  observer?.observe(app, { childList:true, subtree:false });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleRefresh(); });
  window.addEventListener('pagehide', () => observer?.disconnect(), { once:true });
  scheduleRefresh();
})();
