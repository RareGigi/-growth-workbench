(() => {
  'use strict';

  const Core = window.GrowthCore;
  if (!Core) return;

  const ROOMS = [
    ['leaf-rain', '窗叶听雨'],
    ['library', '深夜图书馆'],
    ['cafe', '雨晨咖啡厅'],
    ['magic-bookshop', '月灯书屋'],
    ['celestial', '云上天宫'],
    ['temple', '山寺晨光']
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
  let scheduled = false;
  let observer = null;

  const state = () => Core.state;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const roomName = (id) => ROOMS.find(([value]) => value === id)?.[1] || '沉浸自习室';
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
      spark: '<path d="M12 3c1.3 2.4 3.2 4 6 4.8-2.3 1.3-3.8 3.4-4.2 6.2-1.4-2.4-3.3-4-6-4.8C10 7.9 11.5 5.8 12 3z"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
  }

  function optionList(items, selected) {
    return items.map(([id, label]) => `<option value="${id}" ${selected === id ? 'selected' : ''}>${label}</option>`).join('');
  }

  function buildDock() {
    const timer = state().timer;
    const settings = state().focusSettings || {};
    const paused = timer?.status === 'paused';
    return `<div class="immersive-dock" data-immersive-dock>
      <div class="immersive-dock-status"><span>${esc(roomName(settings.roomId))}</span><strong data-timer-clock>${esc(timerText())}</strong><small>${paused ? '已暂停 · 可以继续或暂离' : '保持这一刻'}</small></div>
      <div class="immersive-dock-actions">
        <button type="button" class="immersive-primary" data-action="${paused ? 'focus-resume' : 'focus-pause'}">${icon(paused ? 'play' : 'pause')}<span>${paused ? '继续' : '暂停'}</span></button>
        <button type="button" data-immersive-action="sound">${icon('volume')}<span>声音</span></button>
        <button type="button" data-immersive-action="adjust" aria-expanded="${adjustOpen}">${icon('sliders')}<span>调整</span></button>
        <button type="button" data-immersive-action="away">${icon('away')}<span>暂离</span></button>
      </div>
    </div>`;
  }

  function buildSheet() {
    const settings = state().focusSettings || {};
    const currentRoom = settings.roomId || ROOMS[0][0];
    return `<section class="immersive-sheet" data-immersive-sheet aria-label="调整专注氛围" aria-hidden="${!adjustOpen}">
      <header><div><small>FOCUS ATMOSPHERE</small><h2>调整氛围</h2></div><button type="button" data-immersive-action="adjust" aria-label="收起调整">${icon('close')}</button></header>
      <div class="immersive-sheet-scroll">
        <div class="immersive-section-head"><span>房间</span><button type="button" data-immersive-action="recommend">${icon('spark')}应用推荐声景</button></div>
        <div class="immersive-room-chips">${ROOMS.map(([id, label]) => `<button type="button" data-immersive-action="room" data-id="${id}" class="${currentRoom === id ? 'active' : ''}" aria-pressed="${currentRoom === id}">${esc(label)}</button>`).join('')}</div>
        <div class="immersive-audio-grid">
          <div class="immersive-channel ${settings.ambienceEnabled ? 'enabled' : ''}">
            <div class="immersive-channel-title"><span>环境声</span><button type="button" data-immersive-action="toggle-channel" data-channel="ambience">${settings.ambienceEnabled ? '关闭' : '开启'}</button></div>
            <select data-immersive-track="ambience" aria-label="选择环境声">${optionList(AMBIENCE, settings.ambienceId)}</select>
            <label><span>音量</span><input type="range" min="0" max="100" step="1" value="${Math.round((settings.ambienceVolume ?? 0.46) * 100)}" data-immersive-volume="ambience"><output>${Math.round((settings.ambienceVolume ?? 0.46) * 100)}%</output></label>
          </div>
          <div class="immersive-channel ${settings.musicEnabled ? 'enabled' : ''}">
            <div class="immersive-channel-title"><span>轻音乐</span><button type="button" data-immersive-action="toggle-channel" data-channel="music">${settings.musicEnabled ? '关闭' : '开启'}</button></div>
            <select data-immersive-track="music" aria-label="选择轻音乐">${optionList(MUSIC, settings.musicId)}</select>
            <label><span>音量</span><input type="range" min="0" max="100" step="1" value="${Math.round((settings.musicVolume ?? 0.16) * 100)}" data-immersive-volume="music"><output>${Math.round((settings.musicVolume ?? 0.16) * 100)}%</output></label>
          </div>
        </div>
        <p class="immersive-tip">推荐声景会把音乐压在环境声下面；所有声音仍可独立关闭或重新选择。</p>
        <div class="immersive-sheet-actions"><button type="button" data-action="focus-end">结束并记录本轮</button></div>
      </div>
    </section>`;
  }

  function enhance() {
    scheduled = false;
    observer?.disconnect();
    try {
      const page = focusPage();
      const timer = state().timer;
      const active = Boolean(page && timer);
      document.body.classList.toggle('focus-immersive-active', active);
      document.body.classList.toggle('focus-immersive-paused', active && timer?.status === 'paused');
      document.body.classList.toggle('focus-adjust-open', active && adjustOpen);
      if (!active) {
        adjustOpen = false;
        return;
      }
      page.querySelector('[data-immersive-dock]')?.remove();
      page.querySelector('[data-immersive-sheet]')?.remove();
      page.insertAdjacentHTML('beforeend', buildDock());
      page.insertAdjacentHTML('beforeend', buildSheet());
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

  document.addEventListener('click', (event) => {
    const control = event.target.closest('[data-immersive-action]');
    if (!control) return;
    event.preventDefault();
    event.stopPropagation();
    const action = control.dataset.immersiveAction;
    if (action === 'adjust') {
      adjustOpen = !adjustOpen;
      return enhance();
    }
    if (action === 'sound') return forwardClick('.focus-soundscape [data-action="focus-audio-master"]');
    if (action === 'away') return leaveTemporarily();
    if (action === 'room') return forwardClick(`[data-action="focus-room-select"][data-id="${control.dataset.id}"]`);
    if (action === 'toggle-channel') return forwardClick(`[data-action="focus-sound-toggle"][data-channel="${control.dataset.channel}"]`);
    if (action === 'recommend') return applyRecommended();
  }, true);

  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-immersive-track]');
    if (!select) return;
    event.stopPropagation();
    forwardTrack(select.dataset.immersiveTrack, select.value);
  }, true);

  document.addEventListener('input', (event) => {
    const input = event.target.closest('[data-immersive-volume]');
    if (!input) return;
    event.stopPropagation();
    input.parentElement?.querySelector('output')?.replaceChildren(`${input.value}%`);
    forwardVolume(input.dataset.immersiveVolume, input.value);
  }, true);

  observer = new MutationObserver(scheduleEnhance);
  observer.observe(document.querySelector('#app') || document.body, { childList: true, subtree: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleEnhance(); });
  window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
  scheduleEnhance();
})();
