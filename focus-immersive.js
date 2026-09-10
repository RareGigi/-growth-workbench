(() => {
  'use strict';

  const Core = window.GrowthCore;
  if (!Core) return;

  const ASSET_VERSION = '2026.09-focus-room-v2';
  const ROOMS = [
    { id: 'leaf-rain', name: '窗叶听雨', image: 'assets/scenes/focus-leaf-rain.webp', note: '贴近窗边的雨声与纸笔感，适合做题和长时间专注。', tag: '雨夜 · 深度学习' },
    { id: 'library', name: '深夜图书馆', image: 'assets/scenes/focus-library.webp', note: '安静木质书库，氛围更稳，适合阅读与整理。', tag: '安静 · 阅读' },
    { id: 'cafe', name: '雨晨咖啡厅', image: 'assets/scenes/focus-cafe.webp', note: '带一点生活感的雨晨，适合轻任务和写作。', tag: '雨晨 · 轻专注' },
    { id: 'magic-bookshop', name: '月灯书屋', image: 'assets/scenes/focus-magic-bookshop.webp', note: '暖灯与旧书气息，适合夜间学习和沉浸写作。', tag: '暖灯 · 夜读' },
    { id: 'celestial', name: '云上天宫', image: 'assets/scenes/focus-celestial.webp', note: '云气和远景更开阔，适合想换脑子时重新进入状态。', tag: '云间 · 放空后专注' },
    { id: 'temple', name: '山寺晨光', image: 'assets/scenes/focus-temple.webp', note: '晨光、木色与松风感，适合早起学习和复盘。', tag: '晨光 · 清醒' }
  ];

  const AMBIENCE = [
    ['window-rain', '窗边细雨'],
    ['leaf-rain', '叶间落雨'],
    ['deep-rain', '深夜大雨'],
    ['library', '书库低语'],
    ['cafe', '远处咖啡厅'],
    ['hearth', '壁炉轻响'],
    ['cloud-wind', '云间柔风'],
    ['temple', '松风远钟']
  ];
  const MUSIC = [
    ['star-rain', '星雨琴音'],
    ['graphite', '静默铅笔'],
    ['quiet-books', '书页微光'],
    ['constellations', '温柔星群'],
    ['temple-dawn', '晨钟之前']
  ];
  const PRESETS = {
    'leaf-rain': { ambience: 'leaf-rain', music: 'graphite', ambienceVolume: 0.5, musicVolume: 0.16 },
    library: { ambience: 'library', music: 'quiet-books', ambienceVolume: 0.38, musicVolume: 0.14 },
    cafe: { ambience: 'cafe', music: 'graphite', ambienceVolume: 0.34, musicVolume: 0.13 },
    'magic-bookshop': { ambience: 'hearth', music: 'quiet-books', ambienceVolume: 0.36, musicVolume: 0.15 },
    celestial: { ambience: 'cloud-wind', music: 'constellations', ambienceVolume: 0.4, musicVolume: 0.14 },
    temple: { ambience: 'temple', music: 'temple-dawn', ambienceVolume: 0.38, musicVolume: 0.12 }
  };

  let adjustOpen = false;
  let roomOpen = false;
  let scheduled = false;
  let observer = null;

  const state = () => Core.state;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const room = (id) => ROOMS.find((item) => item.id === id) || ROOMS[0];
  const timerText = () => document.querySelector('.focus-stage-time [data-timer-clock], .timer-panel [data-timer-clock]')?.textContent || '--:--';
  const focusPage = () => document.querySelector('.focus-page');
  const native = (selector) => document.querySelector(`.focus-room-picker ${selector}, .timer-panel ${selector}, .focus-scene ${selector}`);

  function icon(name) {
    const paths = {
      pause: '<path d="M8 6v12M16 6v12"/>',
      play: '<path d="m9 6 9 6-9 6z"/>',
      volume: '<path d="M4 10h4l5-4v12l-5-4H4zM16 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>',
      sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M7 14v6"/>',
      away: '<path d="M5 4h9v16H5zM14 12h6M17 9l3 3-3 3"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      spark: '<path d="M12 3c1.3 2.4 3.2 4 6 4.8-2.3 1.3-3.8 3.4-4.2 6.2-1.4-2.4-3.3-4-6-4.8C10 7.9 11.5 5.8 12 3z"/>',
      room: '<path d="M4 5.5h16v13H4zM8 5.5v13M8 10h12M12 14h4"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
  }

  function optionList(items, selected) {
    return items.map(([id, label]) => `<option value="${id}" ${selected === id ? 'selected' : ''}>${label}</option>`).join('');
  }

  function ensureStyles() {
    if (document.querySelector('#focus-room-v2-styles')) return;
    const style = document.createElement('style');
    style.id = 'focus-room-v2-styles';
    style.textContent = `
      /* V2: do not fake handwriting by laying one shared clip over every room. */
      .focus-writing-video { display: none !important; }
      .focus-motion-toggle { display: none !important; }
      .focus-room-picker { display: none !important; }

      .immersive-dock-actions { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
      .focus-room-launcher {
        display:flex; align-items:center; justify-content:space-between; gap:14px;
        margin:14px 0 4px; padding:12px 14px 12px 16px;
        border:1px solid rgba(95,109,140,.14); border-radius:18px;
        background:rgba(255,255,255,.78); box-shadow:0 10px 30px rgba(65,78,110,.06);
      }
      .focus-room-launcher-copy { min-width:0; }
      .focus-room-launcher-copy small { display:block; margin-bottom:3px; color:#8a93a7; font-size:9px; font-weight:750; letter-spacing:.13em; }
      .focus-room-launcher-copy strong { display:block; color:#3e4658; font-size:14px; }
      .focus-room-launcher-copy span { display:block; margin-top:3px; overflow:hidden; color:#8991a2; font-size:10px; text-overflow:ellipsis; white-space:nowrap; }
      .focus-room-launcher button {
        flex:0 0 auto; display:flex; min-height:44px; align-items:center; justify-content:center; gap:7px;
        padding:0 14px; border:1px solid #d9e0ef; border-radius:13px; background:#f3f6fc; color:#536ba3;
        font-size:11px; font-weight:750; -webkit-tap-highlight-color:transparent;
      }
      .focus-room-launcher button svg { width:17px; height:17px; fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; }

      .focus-overlay-backdrop {
        position:fixed; z-index:164; inset:0; background:rgba(7,11,18,.38); opacity:0; pointer-events:none;
        transition:opacity .18s ease; backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
      }
      body.focus-room-open .focus-overlay-backdrop,
      body.focus-adjust-open .focus-overlay-backdrop { opacity:1; pointer-events:auto; }

      .focus-room-sheet {
        position:fixed; z-index:175; left:50%; bottom:max(18px, env(safe-area-inset-bottom));
        width:min(760px, calc(100vw - 36px)); max-height:min(720px, calc(100dvh - 36px)); overflow:hidden;
        border:1px solid rgba(255,255,255,.42); border-radius:26px; background:rgba(248,249,253,.96); color:#293246;
        box-shadow:0 30px 100px rgba(0,0,0,.3); opacity:0; pointer-events:none;
        transform:translate(-50%, 18px) scale(.985); transition:opacity .18s ease, transform .18s ease;
        backdrop-filter:blur(24px) saturate(1.05); -webkit-backdrop-filter:blur(24px) saturate(1.05);
      }
      body.focus-room-open .focus-room-sheet { opacity:1; pointer-events:auto; transform:translate(-50%,0) scale(1); }
      .focus-room-sheet > header { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:16px 18px 12px 20px; border-bottom:1px solid rgba(70,83,112,.09); }
      .focus-room-sheet > header small { display:block; color:#8992a4; font-size:9px; font-weight:800; letter-spacing:.14em; }
      .focus-room-sheet > header h2 { margin:3px 0 0; color:#30384a; font-size:19px; letter-spacing:-.02em; }
      .focus-room-sheet > header p { margin:4px 0 0; color:#8a93a4; font-size:10px; }
      .focus-room-sheet > header button,
      .immersive-sheet > header button { display:grid; width:44px; height:44px; flex:0 0 auto; place-items:center; border:0; border-radius:14px; background:#eef1f7; color:#59647a; }
      .focus-room-sheet > header svg { width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:1.75; stroke-linecap:round; stroke-linejoin:round; }
      .focus-room-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:11px; max-height:calc(100dvh - 170px); overflow:auto; padding:15px 18px 18px; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; }
      .focus-room-card { position:relative; min-width:0; overflow:hidden; padding:0; border:1px solid #dfe4ef; border-radius:17px; background:#fff; color:#4c566b; text-align:left; box-shadow:0 6px 18px rgba(61,76,108,.05); -webkit-tap-highlight-color:transparent; }
      .focus-room-card.active { border-color:#95a9d6; box-shadow:0 0 0 2px rgba(92,118,177,.09), 0 8px 24px rgba(61,76,108,.08); }
      .focus-room-card-media { position:relative; display:block; aspect-ratio:16/9; overflow:hidden; background:#e8ebf2; }
      .focus-room-card-media img { width:100%; height:100%; display:block; object-fit:cover; transition:transform .2s ease; }
      .focus-room-card:hover .focus-room-card-media img { transform:scale(1.025); }
      .focus-room-card-current { position:absolute; top:9px; right:9px; padding:5px 8px; border-radius:999px; background:rgba(250,251,255,.9); color:#5068a1; font-size:9px; font-weight:800; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); }
      .focus-room-card-copy { display:block; min-height:92px; padding:10px 11px 12px; }
      .focus-room-card-copy strong { display:block; color:#3b4458; font-size:13px; }
      .focus-room-card-copy em { display:block; margin-top:3px; color:#7381a0; font-size:9px; font-style:normal; font-weight:700; letter-spacing:.03em; }
      .focus-v2-recommend { display:flex; width:100%; min-height:44px; align-items:center; justify-content:center; gap:7px; margin-top:12px; border:1px solid #dce3f0; border-radius:12px; background:#eef3fd; color:#536ba6; font-size:10px; font-weight:750; }
      .focus-v2-recommend svg { width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:1.75; stroke-linecap:round; stroke-linejoin:round; }
      .focus-room-card-copy span { display:-webkit-box; margin-top:7px; overflow:hidden; color:#8a93a4; font-size:10px; line-height:1.45; -webkit-box-orient:vertical; -webkit-line-clamp:2; }

      body.focus-immersive-active .focus-room-launcher { display:none !important; }
      body.focus-immersive-active .focus-room-sheet { bottom:calc(112px + env(safe-area-inset-bottom)); max-height:calc(100dvh - 148px); }

      /* Keep audio adjustment separate from room selection. */
      .immersive-sheet .immersive-section-head,
      .immersive-sheet .immersive-room-chips { display:none !important; }
      .immersive-sheet .immersive-audio-grid { margin-top:0 !important; }

      @media (max-width: 760px) {
        .focus-room-launcher { margin-top:10px; padding:10px 11px 10px 13px; border-radius:16px; }
        .focus-room-launcher-copy span { max-width:54vw; }
        .focus-room-launcher button span { display:none; }
        .focus-room-launcher button { width:44px; padding:0; }
        .focus-room-sheet { right:0; bottom:0; left:0; width:100%; max-height:min(78dvh,720px); border-radius:24px 24px 0 0; transform:translateY(22px); }
        body.focus-room-open .focus-room-sheet { transform:none; }
        .focus-room-sheet > header { padding:15px 14px 11px 16px; }
        .focus-room-sheet > header p { max-width:75vw; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .focus-room-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; max-height:calc(78dvh - 84px); padding:12px 12px calc(16px + env(safe-area-inset-bottom)); }
        .focus-room-card { border-radius:15px; }
        .focus-room-card-copy { min-height:86px; padding:9px 9px 10px; }
        .focus-room-card-copy strong { font-size:12px; }
        .focus-room-card-copy span { font-size:9px; }
        body.focus-immersive-active .focus-room-sheet { bottom:0; max-height:72dvh; }
        body.focus-immersive-active .immersive-dock { grid-template-columns:1fr !important; gap:7px !important; min-height:0 !important; padding:8px !important; border-radius:20px !important; }
        body.focus-immersive-active .immersive-dock-status { display:none !important; }
        body.focus-immersive-active .immersive-dock-actions { grid-template-columns:repeat(5,minmax(0,1fr)) !important; }
        body.focus-immersive-active .immersive-dock-actions button { min-height:52px !important; padding:0 4px !important; }
        body.focus-immersive-active .immersive-dock-actions button span { font-size:9px !important; }
      }

      @media (max-width: 390px) {
        .focus-room-grid { gap:7px; padding-right:9px; padding-left:9px; }
        .focus-room-card-copy span { -webkit-line-clamp:1; }
        .focus-room-card-copy { min-height:72px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .focus-room-sheet, .focus-overlay-backdrop, .focus-room-card-media img { transition:none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function buildDock() {
    const timer = state().timer;
    const settings = state().focusSettings || {};
    const paused = timer?.status === 'paused';
    return `<div class="immersive-dock" data-immersive-dock>
      <div class="immersive-dock-status"><span>${esc(room(settings.roomId).name)}</span><strong data-timer-clock>${esc(timerText())}</strong><small>${paused ? '已暂停 · 可以继续或暂离' : '保持这一刻'}</small></div>
      <div class="immersive-dock-actions">
        <button type="button" class="immersive-primary" data-action="${paused ? 'focus-resume' : 'focus-pause'}">${icon(paused ? 'play' : 'pause')}<span>${paused ? '继续' : '暂停'}</span></button>
        <button type="button" data-focus-v2-action="rooms" aria-expanded="${roomOpen}">${icon('room')}<span>房间</span></button>
        <button type="button" data-focus-v2-action="sound">${icon('volume')}<span>声音</span></button>
        <button type="button" data-focus-v2-action="adjust" aria-expanded="${adjustOpen}">${icon('sliders')}<span>调整</span></button>
        <button type="button" data-focus-v2-action="away">${icon('away')}<span>暂离</span></button>
      </div>
    </div>`;
  }

  function buildLauncher() {
    const current = room(state().focusSettings?.roomId);
    return `<div class="focus-room-launcher" data-focus-room-launcher>
      <div class="focus-room-launcher-copy"><small>CURRENT STUDY ROOM</small><strong>${esc(current.name)}</strong><span>${esc(current.tag)}</span></div>
      <button type="button" data-focus-v2-action="rooms" aria-expanded="${roomOpen}">${icon('room')}<span>切换自习室</span></button>
    </div>`;
  }

  function buildRoomSheet() {
    const currentId = state().focusSettings?.roomId || ROOMS[0].id;
    return `<section class="focus-room-sheet" data-focus-room-sheet aria-label="选择自习室" aria-hidden="${!roomOpen}">
      <header>
        <div><small>STUDY ROOMS</small><h2>换一个自习室</h2><p>平时收起来，需要时再打开；选择后会直接回到专注画面。</p></div>
        <button type="button" data-focus-v2-action="close-rooms" aria-label="收起自习室选择">${icon('close')}</button>
      </header>
      <div class="focus-room-grid">
        ${ROOMS.map((item) => `<button type="button" class="focus-room-card ${item.id === currentId ? 'active' : ''}" data-focus-v2-action="room" data-id="${item.id}" aria-pressed="${item.id === currentId}">
          <span class="focus-room-card-media"><img src="${item.image}?v=${ASSET_VERSION}" alt="${esc(item.name)}场景预览" width="640" height="360" loading="lazy" decoding="async">${item.id === currentId ? '<i class="focus-room-card-current">当前</i>' : ''}</span>
          <span class="focus-room-card-copy"><strong>${esc(item.name)}</strong><em>${esc(item.tag)}</em><span>${esc(item.note)}</span></span>
        </button>`).join('')}
      </div>
    </section>`;
  }

  function buildSheet() {
    const settings = state().focusSettings || {};
    return `<section class="immersive-sheet" data-immersive-sheet aria-label="调整专注声音" aria-hidden="${!adjustOpen}">
      <header><div><small>FOCUS SOUND</small><h2>调整声音</h2></div><button type="button" data-focus-v2-action="adjust" aria-label="收起调整">${icon('close')}</button></header>
      <div class="immersive-sheet-scroll">
        <div class="immersive-audio-grid">
          <div class="immersive-channel ${settings.ambienceEnabled ? 'enabled' : ''}">
            <div class="immersive-channel-title"><span>环境声</span><button type="button" data-focus-v2-action="toggle-channel" data-channel="ambience">${settings.ambienceEnabled ? '关闭' : '开启'}</button></div>
            <select data-focus-v2-track="ambience" aria-label="选择环境声">${optionList(AMBIENCE, settings.ambienceId)}</select>
            <label><span>音量</span><input type="range" min="0" max="100" step="1" value="${Math.round((settings.ambienceVolume ?? 0.46) * 100)}" data-focus-v2-volume="ambience"><output>${Math.round((settings.ambienceVolume ?? 0.46) * 100)}%</output></label>
          </div>
          <div class="immersive-channel ${settings.musicEnabled ? 'enabled' : ''}">
            <div class="immersive-channel-title"><span>轻音乐</span><button type="button" data-focus-v2-action="toggle-channel" data-channel="music">${settings.musicEnabled ? '关闭' : '开启'}</button></div>
            <select data-focus-v2-track="music" aria-label="选择轻音乐">${optionList(MUSIC, settings.musicId)}</select>
            <label><span>音量</span><input type="range" min="0" max="100" step="1" value="${Math.round((settings.musicVolume ?? 0.16) * 100)}" data-focus-v2-volume="music"><output>${Math.round((settings.musicVolume ?? 0.16) * 100)}%</output></label>
          </div>
        </div>
        <button type="button" class="focus-v2-recommend" data-focus-v2-action="recommend">${icon('spark')}按当前房间应用推荐声景</button>
        <p class="immersive-tip">音乐默认压在环境声下面；两条声道仍可分别关闭、切换和调整音量。</p>
        <div class="immersive-sheet-actions"><button type="button" data-action="focus-end">结束并记录本轮</button></div>
      </div>
    </section>`;
  }

  function buildBackdrop() {
    return `<button type="button" class="focus-overlay-backdrop" data-focus-v2-action="close-panels" aria-label="关闭面板"></button>`;
  }

  function removeSharedHandwriting(page) {
    page.querySelectorAll('.focus-writing-video').forEach((video) => {
      try { video.pause(); } catch (_) {}
      video.remove();
    });
    const motionToggle = page.querySelector('.focus-motion-toggle');
    if (motionToggle) motionToggle.setAttribute('aria-hidden', 'true');
  }

  function enhance() {
    scheduled = false;
    observer?.disconnect();
    try {
      ensureStyles();
      const page = focusPage();
      const timer = state().timer;
      const active = Boolean(page && timer);
      document.body.classList.toggle('focus-immersive-active', active);
      document.body.classList.toggle('focus-immersive-paused', active && timer?.status === 'paused');
      document.body.classList.toggle('focus-adjust-open', Boolean(page && adjustOpen));
      document.body.classList.toggle('focus-room-open', Boolean(page && roomOpen));

      if (!page) {
        adjustOpen = false;
        roomOpen = false;
        document.body.classList.remove('focus-adjust-open', 'focus-room-open');
        return;
      }

      removeSharedHandwriting(page);
      page.querySelector('[data-immersive-dock]')?.remove();
      page.querySelector('[data-focus-room-launcher]')?.remove();
      page.querySelector('[data-focus-room-sheet]')?.remove();
      page.querySelector('[data-immersive-sheet]')?.remove();
      page.querySelector('[data-focus-v2-backdrop]')?.remove();

      if (active) {
        page.insertAdjacentHTML('beforeend', buildDock());
        page.insertAdjacentHTML('beforeend', buildSheet());
      } else {
        const roomRoot = page.querySelector('.focus-room');
        const timerPanel = roomRoot?.querySelector('.timer-panel');
        if (timerPanel) timerPanel.insertAdjacentHTML('beforebegin', buildLauncher());
        else if (roomRoot) roomRoot.insertAdjacentHTML('beforeend', buildLauncher());
        else page.insertAdjacentHTML('beforeend', buildLauncher());
      }

      page.insertAdjacentHTML('beforeend', buildRoomSheet());
      if (adjustOpen || roomOpen) {
        page.insertAdjacentHTML('beforeend', buildBackdrop().replace('class="focus-overlay-backdrop"', 'class="focus-overlay-backdrop" data-focus-v2-backdrop'));
      }
    } finally {
      observer?.observe(document.querySelector('#app') || document.body, { childList: true, subtree: true });
    }
  }

  function scheduleEnhance() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(enhance);
  }

  function forwardClick(selector) {
    const target = native(selector);
    if (target) target.click();
  }

  function forwardTrack(channel, value) {
    const select = document.querySelector(`.timer-panel [data-focus-track="${channel}"]`);
    if (!select) return;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function forwardVolume(channel, value) {
    const input = document.querySelector(`.timer-panel [data-focus-volume="${channel}"]`);
    if (!input) return;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function applyRecommended() {
    const settings = state().focusSettings || {};
    const preset = PRESETS[settings.roomId] || PRESETS['leaf-rain'];
    settings.ambienceId = preset.ambience;
    settings.musicId = preset.music;
    settings.ambienceEnabled = true;
    settings.musicEnabled = true;
    settings.ambienceVolume = preset.ambienceVolume;
    settings.musicVolume = preset.musicVolume;
    try { Core.save('focus-recommended-soundscape'); } catch (_) {}
    forwardTrack('ambience', preset.ambience);
    scheduleEnhance();
  }

  function leaveTemporarily() {
    const timer = state().timer;
    if (!timer) return;
    if (timer.status === 'running') forwardClick('.timer-actions [data-action="focus-pause"]');
    setTimeout(() => {
      const today = document.querySelector('.side-nav [data-action="navigate"][data-page="today"]');
      if (today) today.click();
      else {
        state().ui.page = 'today';
        try { Core.save('focus-away'); } catch (_) {}
        location.reload();
      }
    }, 0);
  }

  function closePanels() {
    adjustOpen = false;
    roomOpen = false;
    enhance();
  }

  document.addEventListener('click', (event) => {
    const control = event.target.closest('[data-focus-v2-action]');
    if (!control) return;
    event.preventDefault();
    event.stopPropagation();
    const action = control.dataset.focusV2Action;

    if (action === 'rooms') {
      roomOpen = !roomOpen;
      if (roomOpen) adjustOpen = false;
      return enhance();
    }
    if (action === 'close-rooms') {
      roomOpen = false;
      return enhance();
    }
    if (action === 'close-panels') return closePanels();
    if (action === 'adjust') {
      adjustOpen = !adjustOpen;
      if (adjustOpen) roomOpen = false;
      return enhance();
    }
    if (action === 'sound') return forwardClick('.focus-soundscape [data-action="focus-audio-master"]');
    if (action === 'away') return leaveTemporarily();
    if (action === 'room') {
      const id = control.dataset.id;
      roomOpen = false;
      forwardClick(`[data-action="focus-room-select"][data-id="${id}"]`);
      return scheduleEnhance();
    }
    if (action === 'toggle-channel') return forwardClick(`[data-action="focus-sound-toggle"][data-channel="${control.dataset.channel}"]`);
    if (action === 'recommend') return applyRecommended();
  }, true);

  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-focus-v2-track]');
    if (!select) return;
    event.stopPropagation();
    forwardTrack(select.dataset.focusV2Track, select.value);
  }, true);

  document.addEventListener('input', (event) => {
    const input = event.target.closest('[data-focus-v2-volume]');
    if (!input) return;
    event.stopPropagation();
    input.parentElement?.querySelector('output')?.replaceChildren(`${input.value}%`);
    forwardVolume(input.dataset.focusV2Volume, input.value);
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && (adjustOpen || roomOpen)) closePanels();
  });

  observer = new MutationObserver(scheduleEnhance);
  observer.observe(document.querySelector('#app') || document.body, { childList: true, subtree: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleEnhance(); });
  window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
  scheduleEnhance();
})();
