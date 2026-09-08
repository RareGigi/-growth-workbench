(() => {
  'use strict';

  const Core = window.GrowthCore;
  const app = document.querySelector('#app');
  const liveRegion = document.querySelector('#live-region');
  const TODAY = () => Core.localDateKey();
  const state = () => Core.state;
  let modal = null;
  let drawerOpen = false;
  let searchQuery = '';
  let focusDuration = 25;
  let focusDraftTaskId = '';
  let timerLoop = null;
  let timerFinishing = false;
  let toastTimer = null;
  let toastMessage = '';
  let todaySection = 'tasks';

  const NAV = [
    ['today', '今日', 'today'],
    ['inbox', '收集箱', 'inbox'],
    ['calendar', '日历', 'calendar'],
    ['focus', '专注', 'focus'],
    ['habits', '习惯', 'habit'],
    ['review', '复盘', 'review'],
    ['notes', '笔记', 'note'],
    ['collection', '收藏', 'collection']
  ];
  const ICONS = {
    logo: '<path d="M12 2.8c1.7 2.5 4.1 4.1 7.3 4.8-2.6 1.9-4.1 4.5-4.3 7.8-1.8-2.4-4.3-4-7.5-4.6 2.7-1.9 4.2-4.6 4.5-8z"/><path d="M6.3 14.5c1 1.3 2.2 2.1 3.9 2.4-1.4 1-2.2 2.3-2.3 4-.9-1.3-2.3-2.1-3.9-2.4 1.4-1 2.2-2.3 2.3-4z"/>',
    today: '<path d="M5 5.8h14v13H5z"/><path d="M8 3.5v4.2M16 3.5v4.2M5 10h14M8.2 14h3.2M8.2 16.8h6.8"/>',
    inbox: '<path d="M4 6h16v13H4z"/><path d="M4 13h4.5l2 3h3l2-3H20"/>',
    calendar: '<path d="M4 6.8h16v13H4z"/><path d="M7.5 3.5v5M16.5 3.5v5M4 10.7h16M8 14h.1M12 14h.1M16 14h.1M8 17h.1M12 17h.1"/>',
    focus: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.5v5l3.2 2M5 4.8 3.8 6M19 4.8 20.2 6"/>',
    habit: '<path d="m4.5 12.5 4.2 4.2L19.5 6.5"/><path d="M19 12a7 7 0 1 1-4.1-6.4"/>',
    review: '<path d="M5 19V11M10 19V6M15 19v-5M20 19V9M3 19.5h19"/>',
    note: '<path d="M5 3.8h14v16.4H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    collection: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    folder: '<path d="M3.5 6.5h6.2l2 2h8.8v10h-17z"/>',
    search: '<circle cx="10.7" cy="10.7" r="6.2"/><path d="m15.3 15.3 4.5 4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevron: '<path d="m8.5 10 3.5 3.5 3.5-3.5"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M9 9.5c.8-1.7 5.8-1.4 5.8.9 0 2.6-5.6 1.2-5.6 4 0 2.3 5.2 2.7 6 .5"/>',
    growth: '<path d="M12 20V8M12 12c-4.4 0-6.5-2.3-6.5-6.5 4.2 0 6.5 2.1 6.5 6.5zM12 15c4.4 0 6.5-2.3 6.5-6.5-4.2 0-6.5 2.1-6.5 6.5z"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    edit: '<path d="m4 20 4.2-1 10.9-10.9-3.2-3.2L5 15.8zM14.8 6l3.2 3.2"/>',
    delay: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2M5.6 4.5 3.8 6.3"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    trash: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    pause: '<path d="M9 7v10M15 7v10"/>',
    play: '<path d="m9 6 9 6-9 6z"/>',
    stop: '<rect x="7" y="7" width="10" height="10" rx="1"/>',
    check: '<path d="m6 12 4 4 8-9"/>',
    heart: '<path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10A4.5 4.5 0 0 1 12 5.7a4.5 4.5 0 0 1 8 2.8z"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    back: '<path d="m14.5 5-7 7 7 7"/>',
    next: '<path d="m9.5 5 7 7-7 7"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>'
  };

  const icon = (name, className = '') => `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.logo}</svg>`;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const attr = (value) => esc(value).replace(/`/g, '&#96;');
  const img = (src, alt, width, height, options = {}) => {
    const loading = options.eager ? '' : ' loading="lazy"';
    const priority = options.eager ? ' fetchpriority="high"' : '';
    return `<span class="image-shell ${options.shellClass || ''}"><img src="${attr(src)}" alt="${attr(alt)}" width="${width}" height="${height}" decoding="async"${loading}${priority} class="${options.className || ''}" data-safe-image></span>`;
  };
  const formatClock = (seconds) => {
    const value = Math.max(0, Math.ceil(Number(seconds) || 0));
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  };
  const formatMinutes = (minutes) => {
    const value = Math.max(0, Number(minutes) || 0);
    if (value > 0 && value < 1) return '<1 分钟';
    if (value >= 60) return `${(value / 60).toFixed(value % 60 ? 1 : 0)} 小时`;
    return `${Math.round(value)} 分钟`;
  };
  const dateLabel = (dateKey, includeYear = false) => {
    const date = Core.parseDateKey(dateKey);
    const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()];
    return `${includeYear ? `${date.getFullYear()}年` : ''}${date.getMonth() + 1}月${date.getDate()}日 ${weekday}`;
  };
  const timeLabel = (timestamp) => new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const inRange = (date, start, end) => date >= start && date <= end;
  const taskById = (id) => state().tasks.find((task) => task.id === id);
  const projectById = (id) => state().projects.find((project) => project.id === id);
  const tasksForDate = (date = TODAY()) => state().tasks.filter((task) => task.date === date);
  const activeTasks = (date = TODAY()) => tasksForDate(date).filter((task) => task.status !== 'cancelled');
  const sessionSeconds = (session) => Number(session.actualSeconds) || (Number(session.actualMinutes) || 0) * 60;
  const focusMinutesFor = (date) => state().focusSessions.filter((session) => !date || session.date === date).reduce((sum, session) => sum + sessionSeconds(session) / 60, 0);
  const projectProgress = (projectId) => {
    const tasks = state().tasks.filter((task) => task.projectId === projectId && task.status !== 'cancelled');
    const project = projectById(projectId);
    const milestones = (project?.milestones || []).filter((item) => item.title);
    const total = tasks.length + milestones.length;
    if (!total) return 0;
    return Math.round((tasks.filter((task) => task.status === 'done').length + milestones.filter((item) => item.done).length) / total * 100);
  };
  const emptyState = (title, body = '', action = '') => `<div class="empty-state"><span>${icon('logo')}</span><strong>${esc(title)}</strong>${body ? `<p>${esc(body)}</p>` : ''}${action}</div>`;
  const pageHeader = (_marker, title, description, action = '') => `<header class="page-header"><div><h1>${esc(title)}</h1><p>${esc(description)}</p></div>${action}</header>`;
  const sectionHead = (title, meta = '', action = '') => `<div class="section-head"><div><h2>${esc(title)}</h2>${meta ? `<span>${esc(meta)}</span>` : ''}</div>${action}</div>`;

  function addActivity(type, title, meta = {}, timestamp = Date.now(), date = TODAY()) {
    state().activity.push({ id: Core.uid('activity'), type, title, meta, at: timestamp, date });
  }

  function announce(message) {
    if (!message) return;
    toastMessage = message;
    liveRegion.textContent = message;
  }

  function saveAndRender(reason, message = '', preserveScroll = true) {
    const unlocked = Core.save(reason);
    const count = unlocked.stickers.length + unlocked.badges.length + unlocked.scenes.length;
    const unlockedNames = [
      ...unlocked.stickers.map((id) => Core.STICKERS.find((item) => item.id === id)?.name),
      ...unlocked.badges.map((id) => Core.BADGES.find((item) => item.id === id)?.name),
      ...unlocked.scenes.map((id) => Core.SCENES.find((item) => item.id === id)?.name)
    ].filter(Boolean);
    const unlockMessage = count > 2 ? `新解锁 ${count} 件收藏` : unlockedNames.length ? `新收藏：${unlockedNames.join('、')}` : '';
    const storageMessage = unlocked.persisted === false ? '浏览器未允许本地保存' : '';
    announce([message, unlockMessage, storageMessage].filter(Boolean).join(' · '));
    render({ preserveScroll });
  }

  function sidebar() {
    const current = state().ui.page;
    const nav = NAV.map(([page, label, iconName]) => {
      const badge = page === 'inbox' && state().inbox.length ? `<small class="nav-count">${state().inbox.length}</small>` : '';
      return `<button type="button" class="nav-item ${current === page ? 'active' : ''}" data-action="navigate" data-page="${page}" aria-current="${current === page ? 'page' : 'false'}">${icon(iconName)}<span>${label}</span>${badge}</button>`;
    }).join('');
    const projects = state().projects.map((project, index) => {
      const progress = projectProgress(project.id);
      return `<button type="button" class="project-link ${current === 'project' && state().ui.selectedProjectId === project.id ? 'active' : ''}" data-action="project-open" data-id="${attr(project.id)}"><i style="--project-index:${index}"></i><span><b>${esc(project.name)}</b><small>${esc(project.area)} · ${progress}%</small></span><em>${progress}</em></button>`;
    }).join('');
    return `<aside class="sidebar" aria-label="主导航">
      <div class="brand-row">
        <button type="button" class="brand" data-action="navigate" data-page="today" aria-label="回到今日">${icon('logo')}<span><b>小小生长册</b><small>Grow with You</small></span></button>
        <button type="button" class="collapse-button" data-action="sidebar-collapse" aria-label="${state().ui.sidebarCollapsed ? '展开侧栏' : '收起侧栏'}">${icon(state().ui.sidebarCollapsed ? 'next' : 'back')}</button>
      </div>
      <nav class="side-nav">${nav}</nav>
      <section class="sidebar-projects ${state().ui.projectsCollapsed ? 'closed' : ''}">
        <div class="projects-title"><button type="button" data-action="projects-collapse">${icon('folder')}<span>项目</span>${icon('chevron', 'chevron')}</button><button type="button" class="project-add" data-action="project-new" aria-label="新建项目">${icon('plus')}</button></div>
        <div class="project-links">${projects || emptyState('还没有项目')}</div>
      </section>
    </aside>`;
  }

  function searchResults() {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return '';
    const tasks = state().tasks.filter((task) => task.title.toLowerCase().includes(query)).slice(0, 5);
    const notes = state().notes.filter((note) => `${note.title} ${note.body}`.toLowerCase().includes(query)).slice(0, 4);
    const projects = state().projects.filter((project) => `${project.name} ${project.goal}`.toLowerCase().includes(query)).slice(0, 4);
    const items = [
      ...tasks.map((task) => ({ type: 'task', id: task.id, title: task.title, meta: `${task.date} · ${task.area}` })),
      ...notes.map((note) => ({ type: 'note', id: note.id, title: note.title, meta: '笔记' })),
      ...projects.map((project) => ({ type: 'project', id: project.id, title: project.name, meta: `项目 · ${project.area}` }))
    ];
    return `<div class="search-popover">${items.length ? items.map((item) => `<button type="button" data-action="search-open" data-kind="${item.type}" data-id="${attr(item.id)}"><span>${icon(item.type === 'project' ? 'folder' : item.type === 'note' ? 'note' : 'check')}</span><b>${esc(item.title)}</b><small>${esc(item.meta)}</small></button>`).join('') : `<p>没有找到“${esc(searchQuery)}”</p>`}</div>`;
  }

  function topbar() {
    return `<header class="topbar">
      <button type="button" class="mobile-projects-button" data-action="drawer-open">${icon('menu')}<span>项目</span></button>
      <div class="global-search">${icon('search')}<input id="global-search" type="search" value="${attr(searchQuery)}" placeholder="搜索任务、笔记、项目…" autocomplete="off" aria-label="全局搜索"><div id="search-results">${searchResults()}</div></div>
      <div class="wallet" aria-label="成长奖励"><span>${icon('growth')}<small>累计成长</small><b>${state().rewards.stars}</b></span><span>${icon('coin')}<small>金币</small><b>${state().rewards.coins}</b></span></div>
      </header>`;
  }

  function taskRow(task, options = {}) {
    const project = task.projectId ? projectById(task.projectId) : null;
    const done = task.status === 'done';
    const cancelled = task.status === 'cancelled';
    return `<article class="task-row ${done ? 'done' : ''} ${cancelled ? 'cancelled' : ''}" data-task-row="${attr(task.id)}">
      <button type="button" class="task-check" data-action="task-toggle" data-id="${attr(task.id)}" aria-label="${done ? '设为未完成' : '完成任务'}" ${cancelled ? 'disabled' : ''}>${done ? icon('check') : ''}</button>
      <div class="task-copy"><b>${esc(task.title)}</b><span><i style="--area:${Core.AREA_META[task.area]?.color || '#718bd1'}"></i>${esc(task.area)} · ${task.minutes} min${project ? ` · ${esc(project.name)}` : ''}</span></div>
      <div class="task-reward">${icon('growth')}<span>+${task.reward || 0}</span></div>
      <details class="task-menu"><summary aria-label="任务操作">${icon('more')}</summary><div><button type="button" data-action="task-edit" data-id="${attr(task.id)}">${icon('edit')}编辑</button><button type="button" data-action="task-postpone" data-id="${attr(task.id)}">${icon('delay')}延后一天</button><button type="button" data-action="task-cancel" data-id="${attr(task.id)}">${icon('close')}取消</button></div></details>
    </article>`;
  }

  function faceIcon(mood) {
    const mouth = {
      开心: '<path d="M8 14c1.8 2.4 6.2 2.4 8 0"/>',
      平静: '<path d="M8.5 15h7"/>',
      一般: '<path d="M9 15c2-1 4-1 6 0"/>',
      疲惫: '<path d="M8.5 15.5c2-1.6 5-1.6 7 0"/><path d="M7.5 10h3M13.5 10h3"/>',
      焦虑: '<path d="M9 16c1.8-2 4.2-2 6 0"/><path d="m7 10 3-.5M17 10l-3-.5"/>'
    }[mood];
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10.5" r=".8" class="eye"/><circle cx="15.5" cy="10.5" r=".8" class="eye"/>${mouth}</svg>`;
  }

  function todayGrowth() {
    const date = TODAY();
    const doneTasks = tasksForDate(date).filter((task) => task.status === 'done');
    const records = state().growthRecords.filter((record) => record.date === date);
    const amount = (area) => {
      const logged = records.filter((record) => record.area === area).reduce((sum, record) => sum + (Number(record.amount) || 0), 0);
      const fromTasks = doneTasks.filter((task) => task.area === area).reduce((sum, task) => sum + (area === '写作' ? 0 : (Number(task.actualMinutes) || Number(task.minutes) || 0)), 0);
      return logged + fromTasks;
    };
    return [
      { area: '学习', value: amount('学习'), goal: 180, label: formatMinutes(amount('学习')) },
      { area: '写作', value: amount('写作'), goal: 2000, label: `${Math.round(amount('写作')).toLocaleString('zh-CN')} 字` },
      { area: '运动', value: amount('运动'), goal: 60, label: formatMinutes(amount('运动')) },
      { area: '英语', value: amount('英语'), goal: 60, label: formatMinutes(amount('英语')) },
      { area: '播客', value: amount('播客'), goal: 60, label: formatMinutes(amount('播客')) }
    ];
  }

  function activityTimeline(date = TODAY(), limit = 8) {
    const items = state().activity.filter((entry) => entry.date === date).sort((a, b) => b.at - a.at).slice(0, limit);
    if (!items.length) return emptyState('今天还没有轨迹', '完成任务、专注或记录成长后会出现在这里。');
    return `<div class="timeline-list">${items.map((entry) => `<div class="timeline-item"><time>${timeLabel(entry.at)}</time><i></i><span>${esc(entry.title)}</span></div>`).join('')}</div>`;
  }

  function stickerSlots(limit = 5, stickerIds = state().collection.stickers) {
    const owned = Array.isArray(stickerIds) ? stickerIds : [];
    return `<div class="mini-sticker-slots">${Array.from({ length: limit }, (_, index) => {
      const sticker = Core.STICKERS.find((item) => item.id === owned[index]);
      return sticker ? `<div title="${attr(sticker.name)}">${img(sticker.image, sticker.name, 160, 160)}</div>` : `<div class="empty-slot">${icon('lock')}</div>`;
    }).join('')}</div>`;
  }

  function hero() {
    const date = new Date();
    const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()];
    return `<section class="today-hero">
      ${img('assets/scenes/today-desk.webp', '银灰发青年与白兔在蓝紫暖光书桌前', 1672, 941, { eager: true, className: 'hero-image' })}
      <div class="hero-date"><span>${date.getMonth() + 1}月${date.getDate()}日</span><b>${weekday}</b><p>今天也留下一点自己的痕迹。</p></div>
    </section>`;
  }

  function todayPage() {
    const todayTasks = activeTasks();
    const priorities = todayTasks.filter((task) => task.priority).slice(0, 3);
    const nextTask = priorities.find((task) => task.status === 'todo') || todayTasks.find((task) => task.status === 'todo');
    const customAreas = new Set(['写作', '运动', '英语', '播客']);
    const filter = state().ui.taskFilter;
    const ordinary = todayTasks.filter((task) => !task.priority).filter((task) => {
      if (filter === '全部') return true;
      if (filter === '自定义') return customAreas.has(task.area);
      return task.area === filter;
    });
    const completedCount = todayTasks.filter((task) => task.status === 'done').length;
    const growth = todayGrowth();
    const moods = ['开心', '平静', '一般', '疲惫', '焦虑'];
    const todaySections = [['tasks', '任务'], ['growth', '成长'], ['journal', '手记']];
    return `<div class="page today-page">
      ${hero()}
      <nav class="today-section-tabs" role="tablist" aria-label="今日内容">${todaySections.map(([value, label]) => `<button type="button" role="tab" data-action="today-section" data-value="${value}" aria-selected="${todaySection === value}" class="${todaySection === value ? 'active' : ''}">${label}</button>`).join('')}</nav>
      <div class="today-section ${todaySection === 'tasks' ? 'active' : ''}" data-today-panel="tasks">
        <div class="today-lead-grid">
          <section class="surface priority-panel">
            ${sectionHead('今日重点', `${completedCount}/${todayTasks.length} 已完成`, `<button type="button" class="round-action" data-action="task-new" aria-label="添加重点任务">${icon('plus')}</button>`)}
            <div class="task-list">${priorities.length ? priorities.map((task) => taskRow(task)).join('') : emptyState('还没有重点任务', '添加今天最值得完成的一件事。', `<button type="button" class="text-button" data-action="task-new">添加重点</button>`)}</div>
          </section>
          <section class="next-panel">
            <span class="note-tab">接下来</span>
            <div><h2>${esc(nextTask?.title || '先选一件值得投入的事')}</h2><p>${nextTask ? `${esc(nextTask.area)} · ${nextTask.minutes} 分钟` : '新建任务后，这里会给出下一步。'}</p></div>
            <button type="button" class="primary-button" data-action="focus-from-task" data-id="${attr(nextTask?.id || '')}" ${nextTask ? '' : 'disabled'}>${icon('focus')}开始专注</button>
          </section>
        </div>
        <section class="plain-section ordinary-tasks">
          ${sectionHead('普通任务', '按领域查看')}
          <div class="segmented task-filters" role="group" aria-label="任务分类">${['全部', '学习', '工作', '生活', '自定义'].map((item) => `<button type="button" data-action="task-filter" data-value="${item}" class="${filter === item ? 'active' : ''}">${item}</button>`).join('')}</div>
          <div class="task-list bordered">${ordinary.length ? ordinary.map((task) => taskRow(task)).join('') : emptyState('这里还没有任务', filter === '全部' ? '用右下角的＋快速添加。' : `今天没有${filter}类任务。`)}</div>
        </section>
      </div>
      <div class="today-section ${todaySection === 'growth' ? 'active' : ''}" data-today-panel="growth">
        <div class="today-detail-grid">
          <section class="plain-section growth-panel">
            ${sectionHead('今日成长', '不比较，只记录', `<button type="button" class="text-button" data-action="growth-new">记录</button>`)}
            <div class="growth-list">${growth.map((item) => `<div class="growth-row"><span>${item.area}</span><div class="growth-track"><i style="width:${Math.min(100, item.value / item.goal * 100)}%;--area:${Core.AREA_META[item.area].color}"></i></div><b>${item.label}</b></div>`).join('')}</div>
          </section>
          <section class="plain-section timeline-panel">${sectionHead('今日轨迹', `${state().activity.filter((entry) => entry.date === TODAY()).length} 条真实记录`)}${activityTimeline()}</section>
        </div>
      </div>
      <div class="today-section ${todaySection === 'journal' ? 'active' : ''}" data-today-panel="journal">
        <div class="today-note-grid">
          <section class="journal-panel">
            ${sectionHead('一句话日记', '自动保存')}
            <textarea id="today-journal" rows="3" maxlength="240" placeholder="今天状态怎么样？">${esc(state().journal[TODAY()] || '')}</textarea>
            <span class="autosave-note" id="journal-status">输入后自动保存</span>
          </section>
          <section class="mood-panel">
            ${sectionHead('今日心情', '只做记录，不做诊断')}
            <div class="mood-options">${moods.map((mood) => `<button type="button" data-action="mood-set" data-value="${mood}" class="${state().mood[TODAY()] === mood ? 'active' : ''}">${faceIcon(mood)}<span>${mood}</span></button>`).join('')}</div>
          </section>
        </div>
        <section class="weekly-stickers">${sectionHead('本周新收藏', '贴纸使用固定槽位', `<button type="button" class="text-button" data-action="collection-tab" data-tab="stickers">打开贴纸册</button>`)}${stickerSlots(5)}</section>
      </div>
    </div>`;
  }

  function inboxPage() {
    const items = [...state().inbox].sort((a, b) => b.createdAt - a.createdAt);
    return `<div class="page inner-page">
      ${pageHeader('CAPTURE', '收集箱', '先把突然想到的事接住，之后再决定它去哪里。')}
      <section class="capture-bar"><form data-form="inbox"><input name="text" maxlength="160" placeholder="问 HR 社保、买洗衣液、小说第三章改结尾…" aria-label="快速记录" required><button class="primary-button" type="submit">收下</button></form></section>
      <section class="plain-section inbox-list-section">${sectionHead('待整理', `${items.length} 条`)}
        <div class="inbox-list">${items.length ? items.map((item) => `<article class="inbox-row"><span>${esc(item.text)}</span><time>${new Date(item.createdAt).toLocaleDateString('zh-CN')}</time><div><button type="button" data-action="inbox-today" data-id="${attr(item.id)}">放到今天</button><button type="button" data-action="inbox-schedule" data-id="${attr(item.id)}">安排日期</button><button type="button" data-action="inbox-project" data-id="${attr(item.id)}">转为项目</button><button type="button" class="danger-text" data-action="inbox-delete" data-id="${attr(item.id)}" aria-label="删除">${icon('trash')}</button></div></article>`).join('') : emptyState('收集箱现在很安静', '下一次想到什么，直接记在这里。')}</div>
      </section>
    </div>`;
  }

  function projectStreak(projectId) {
    const days = new Set();
    state().tasks.filter((task) => task.projectId === projectId && task.status === 'done').forEach((task) => days.add(task.completedAt ? Core.localDateKey(task.completedAt) : task.date));
    const ids = new Set(state().tasks.filter((task) => task.projectId === projectId).map((task) => task.id));
    state().focusSessions.filter((session) => ids.has(session.taskId)).forEach((session) => days.add(session.date));
    let cursor = TODAY();
    if (!days.has(cursor)) cursor = Core.addDays(cursor, -1);
    let count = 0;
    while (days.has(cursor)) { count += 1; cursor = Core.addDays(cursor, -1); }
    return count;
  }

  function projectPage() {
    const project = projectById(state().ui.selectedProjectId) || state().projects[0];
    if (!project) return `<div class="page inner-page">${pageHeader('CHAPTER', '项目', '还没有项目。')} ${emptyState('先新建一个成长章节', '', `<button type="button" class="primary-button" data-action="project-new">新建项目</button>`)}</div>`;
    const tasks = state().tasks.filter((task) => task.projectId === project.id && task.status !== 'cancelled').sort((a, b) => a.date.localeCompare(b.date));
    const completed = tasks.filter((task) => task.status === 'done');
    const focusIds = new Set(tasks.map((task) => task.id));
    const focusMinutes = state().focusSessions.filter((session) => focusIds.has(session.taskId)).reduce((sum, session) => sum + sessionSeconds(session) / 60, 0);
    const completedMinutes = completed.reduce((sum, task) => sum + (Number(task.actualMinutes) || Number(task.minutes) || 0), 0);
    const progress = projectProgress(project.id);
    const next = project.nextStep || tasks.find((task) => task.status === 'todo')?.title || '';
    const weeklyFocus = (project.weeklyFocus || []).filter(Boolean).slice(0, 3);
    const milestones = (project.milestones || []).filter((item) => item.title).sort((a, b) => String(a.date).localeCompare(String(b.date)));
    return `<div class="page inner-page project-page">
      <header class="project-hero">
        <div><div class="project-title-line"><h1>${esc(project.name)}</h1><span class="chapter-label">${esc(project.area)} · 成长章节</span></div><p>${esc(project.goal || '为这个章节写下一句清楚的目标。')}</p></div>
        <button type="button" class="secondary-button" data-action="project-edit" data-id="${attr(project.id)}">${icon('edit')}编辑项目</button>
      </header>
      <section class="project-progress"><div><span>当前进度</span><b>${progress}%</b></div><div class="progress-track"><i style="width:${progress}%"></i></div></section>
      <div class="project-story-grid">
        <section class="next-chapter"><span class="note-tab">下一步</span><h2>${esc(next || '还没有写下下一步')}</h2><p>${next ? '把它做得足够小，就能开始。' : '编辑项目，写下一件可以立刻行动的事。'}</p></section>
        <section class="weekly-focus"><div class="section-head"><div><h2>本周重点</h2><span>最多 3 项</span></div></div>${weeklyFocus.length ? `<ol>${weeklyFocus.map((item) => `<li>${esc(item)}</li>`).join('')}</ol>` : emptyState('还没有本周重点', '编辑项目时可以写入。')}</section>
      </div>
      <section class="plain-section project-tasks">${sectionHead('项目任务', `${completed.length}/${tasks.length} 已完成`, `<button type="button" class="round-action" data-action="task-new" data-project-id="${attr(project.id)}" aria-label="添加项目任务">${icon('plus')}</button>`)}<div class="task-list bordered">${tasks.length ? tasks.map((task) => taskRow(task)).join('') : emptyState('这个章节还没有任务', '添加一个真正能推动项目的小步骤。')}</div></section>
      <section class="project-totals"><div><span>累计投入</span><b>${formatMinutes(completedMinutes + focusMinutes)}</b></div><div><span>完成任务</span><b>${completed.length}</b></div><div><span>连续记录</span><b>${projectStreak(project.id)} 天</b></div></section>
      <section class="plain-section milestones">${sectionHead('重要节点', '勾选后永久留下完成记录')}${milestones.length ? `<div>${milestones.map((milestone) => `<label><input type="checkbox" data-action="milestone-toggle" data-project-id="${attr(project.id)}" data-id="${attr(milestone.id)}" ${milestone.done ? 'checked' : ''}><i></i><time>${esc(milestone.date || '未定日期')}</time><span>${esc(milestone.title)}</span></label>`).join('')}</div>` : emptyState('还没有重要节点', '在项目编辑里添加里程碑。')}</section>
    </div>`;
  }

  function calendarPage() {
    const [year, month] = state().ui.calendarCursor.split('-').map(Number);
    const first = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0).getDate();
    const blankCount = (first.getDay() + 6) % 7;
    const selected = state().ui.selectedDate;
    const cells = Array.from({ length: blankCount }, () => '<span class="calendar-blank"></span>');
    for (let day = 1; day <= lastDay; day += 1) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const taskCount = tasksForDate(date).filter((task) => task.status !== 'cancelled').length;
      const hasFocus = state().focusSessions.some((session) => session.date === date);
      const hasMilestone = state().projects.some((project) => (project.milestones || []).some((milestone) => milestone.date === date));
      cells.push(`<button type="button" class="calendar-day ${date === TODAY() ? 'is-today' : ''} ${date === selected ? 'selected' : ''}" data-action="calendar-select" data-date="${date}"><b>${day}</b><span>${taskCount ? `${taskCount} 项` : ''}</span><i>${hasFocus ? '<em class="focus-dot"></em>' : ''}${hasMilestone ? '<em class="milestone-dot"></em>' : ''}</i></button>`);
    }
    const dayTasks = tasksForDate(selected).filter((task) => task.status !== 'cancelled');
    const dayActivity = state().activity.filter((entry) => entry.date === selected).sort((a, b) => b.at - a.at);
    return `<div class="page inner-page calendar-page">
      ${pageHeader('CALENDAR', '日历', '任务、专注和重要节点都落在真实日期里。')}
      <section class="calendar-sheet">
        <header><button type="button" data-action="calendar-shift" data-value="-1" aria-label="上个月">${icon('back')}</button><h2>${year}年 ${month}月</h2><div><button type="button" class="text-button" data-action="calendar-today">回今天</button><button type="button" data-action="calendar-shift" data-value="1" aria-label="下个月">${icon('next')}</button></div></header>
        <div class="calendar-week">${['一', '二', '三', '四', '五', '六', '日'].map((day) => `<span>${day}</span>`).join('')}</div>
        <div class="calendar-grid">${cells.join('')}</div>
        <footer><span><i class="task-key"></i>任务数量</span><span><i class="focus-dot"></i>专注记录</span><span><i class="milestone-dot"></i>重要节点</span></footer>
      </section>
      <section class="day-agenda">${sectionHead(dateLabel(selected, true), `${dayTasks.length} 项任务`, `<button type="button" class="round-action" data-action="task-new" data-date="${selected}" aria-label="添加当天任务">${icon('plus')}</button>`)}
        <div class="agenda-columns"><div><h3>任务</h3>${dayTasks.length ? `<div class="task-list bordered">${dayTasks.map((task) => taskRow(task)).join('')}</div>` : emptyState('这一天还没有任务')}</div><div><h3>记录</h3>${dayActivity.length ? `<div class="day-records">${dayActivity.map((entry) => `<p><time>${timeLabel(entry.at)}</time><span>${esc(entry.title)}</span></p>`).join('')}</div>` : emptyState('这一天还没有记录')}</div></div>
      </section>
    </div>`;
  }

  function remainingSeconds(timer = state().timer) {
    if (!timer) return focusDuration * 60;
    if (timer.status === 'paused') return Math.max(0, Number(timer.remainingSeconds) || 0);
    const elapsed = Math.max(0, (Date.now() - Number(timer.lastStartedAt || Date.now())) / 1000);
    return Math.max(0, (Number(timer.remainingSeconds) || 0) - elapsed);
  }

  function focusPage() {
    const timer = state().timer;
    const remaining = remainingSeconds(timer);
    const durationSeconds = timer?.durationSeconds || focusDuration * 60;
    const progress = durationSeconds ? Math.max(0, Math.min(1, 1 - remaining / durationSeconds)) : 0;
    const todaySessions = state().focusSessions.filter((session) => session.date === TODAY());
    const todaySeconds = todaySessions.reduce((sum, session) => sum + sessionSeconds(session), 0);
    const tasks = activeTasks().filter((task) => task.status === 'todo');
    const currentLabel = timer?.label || taskById(timer?.taskId)?.title || '';
    return `<div class="page inner-page focus-page">
      ${pageHeader('FOCUS ROOM', '专注室', '这一页只留下一件事。')}
      <section class="focus-room">
        <div class="focus-scene">${img('assets/scenes/focus-night.webp', '银灰发青年在蓝紫夜色书桌前专注阅读', 1586, 992, { className: 'focus-scene-image' })}<span>静夜书房</span></div>
        <div class="timer-panel">
          <label>当前任务<select id="focus-task" ${timer ? 'disabled' : ''}><option value="">自定义专注</option>${tasks.map((task) => `<option value="${attr(task.id)}" ${(timer?.taskId || focusDraftTaskId) === task.id ? 'selected' : ''}>${esc(task.title)}</option>`).join('')}</select></label>
          <label>专注内容<input id="focus-label" maxlength="80" value="${attr(currentLabel)}" placeholder="现在只做这一件事" ${timer ? 'disabled' : ''}></label>
          <div class="timer-ring" style="--progress:${progress}"><svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70"/><circle class="timer-progress" cx="80" cy="80" r="70" data-timer-ring/></svg><strong data-timer-clock>${formatClock(remaining)}</strong></div>
          <div class="duration-switch ${timer ? 'disabled' : ''}">${[25, 45, 60].map((minutes) => `<button type="button" data-action="focus-duration" data-value="${minutes}" class="${!timer && focusDuration === minutes || timer?.durationSeconds === minutes * 60 ? 'active' : ''}" ${timer ? 'disabled' : ''}>${minutes}</button>`).join('')}</div>
          <div class="timer-actions">${!timer ? `<button type="button" class="primary-button" data-action="focus-start">${icon('play')}开始</button>` : timer.status === 'paused' ? `<button type="button" class="primary-button" data-action="focus-resume">${icon('play')}继续</button>` : `<button type="button" class="primary-button" data-action="focus-pause">${icon('pause')}暂停</button>`}<button type="button" class="secondary-button" data-action="focus-end" ${timer ? '' : 'disabled'}>${icon('stop')}结束</button></div>
          <div class="focus-totals"><span><small>今日累计</small><b>${formatMinutes(todaySeconds / 60)}</b></span><span><small>今日番茄</small><b>${todaySessions.length}</b></span></div>
        </div>
      </section>
      <section class="focus-history">${sectionHead('今日专注记录', `${todaySessions.length} 次`)}${todaySessions.length ? `<div>${[...todaySessions].reverse().map((session) => `<p><time>${timeLabel(session.endedAt)}</time><span>${esc(session.label)}</span><b>${formatMinutes(sessionSeconds(session) / 60)}</b></p>`).join('')}</div>` : emptyState('今天还没有专注记录', '选一个时长，安静地开始。')}</section>
    </div>`;
  }

  function habitsPage() {
    const dates = Array.from({ length: 7 }, (_, index) => Core.addDays(TODAY(), index - 6));
    return `<div class="page inner-page habits-page">
      ${pageHeader('GENTLE RHYTHM', '习惯', '只记录发生过的事，不因断签惩罚自己。', `<button type="button" class="secondary-button" data-action="habit-new">${icon('plus')}新习惯</button>`)}
      <section class="habit-sheet"><div class="habit-calendar-head"><span>最近 7 天</span>${dates.map((date) => { const value = Core.parseDateKey(date); return `<time><b>${['日', '一', '二', '三', '四', '五', '六'][value.getDay()]}</b><small>${value.getDate()}</small></time>`; }).join('')}</div>
        <div class="habit-rows">${state().habits.map((habit) => `<div class="habit-row"><span>${esc(habit.name)}</span>${dates.map((date) => `<button type="button" data-action="habit-toggle" data-id="${attr(habit.id)}" data-date="${date}" class="${habit.days?.[date] ? 'done' : ''}" aria-label="${attr(habit.name)} ${date}">${habit.days?.[date] ? icon('check') : ''}</button>`).join('')}<button type="button" class="habit-remove" data-action="habit-delete" data-id="${attr(habit.id)}" aria-label="删除 ${attr(habit.name)}">${icon('trash')}</button></div>`).join('')}</div>
      </section>
      <p class="gentle-note">空白不是失败，只是那一天没有记录。</p>
    </div>`;
  }

  function rangeSummary(start, end) {
    const tasks = state().tasks.filter((task) => inRange(task.date, start, end));
    const completed = tasks.filter((task) => task.status === 'done');
    const sessions = state().focusSessions.filter((session) => inRange(session.date, start, end));
    const records = state().growthRecords.filter((record) => inRange(record.date, start, end));
    const sumRecords = (area) => records.filter((record) => record.area === area).reduce((sum, record) => sum + (Number(record.amount) || 0), 0);
    const taskMinutes = (area) => completed.filter((task) => task.area === area).reduce((sum, task) => sum + (Number(task.actualMinutes) || Number(task.minutes) || 0), 0);
    const focusMinutes = sessions.reduce((sum, session) => sum + sessionSeconds(session) / 60, 0);
    const activityByDay = new Map();
    state().activity.filter((entry) => inRange(entry.date, start, end)).forEach((entry) => activityByDay.set(entry.date, (activityByDay.get(entry.date) || 0) + 1));
    const mostActive = [...activityByDay.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const delayed = [...tasks].filter((task) => task.postponedCount).sort((a, b) => (b.postponedCount || 0) - (a.postponedCount || 0))[0];
    const areaMinutes = {
      学习: taskMinutes('学习') + sumRecords('学习'),
      工作: taskMinutes('工作') + sumRecords('工作'),
      运动: taskMinutes('运动') + sumRecords('运动'),
      英语: taskMinutes('英语') + sumRecords('英语'),
      播客: sumRecords('播客'),
      写作: taskMinutes('写作')
    };
    const invested = Object.entries(areaMinutes).sort((a, b) => b[1] - a[1])[0];
    const plannedMinutes = tasks.reduce((sum, task) => sum + (Number(task.minutes) || 0), 0);
    const actualMinutes = completed.reduce((sum, task) => sum + (Number(task.actualMinutes) || Number(task.minutes) || 0), 0) + focusMinutes;
    return {
      tasks,
      completed,
      focusMinutes,
      studyMinutes: taskMinutes('学习') + sumRecords('学习'),
      exerciseCount: completed.filter((task) => task.area === '运动').length + records.filter((record) => record.area === '运动').length,
      writingWords: sumRecords('写作'),
      podcastMinutes: sumRecords('播客'),
      mostActive,
      delayed,
      invested: invested && invested[1] > 0 ? invested[0] : '',
      plannedMinutes,
      actualMinutes
    };
  }

  function reviewSuggestions(summary) {
    const suggestions = [];
    summary.tasks.filter((task) => task.status === 'todo').sort((a, b) => Number(b.priority) - Number(a.priority) || (b.postponedCount || 0) - (a.postponedCount || 0)).forEach((task) => {
      if (suggestions.length < 3 && !suggestions.includes(task.title)) suggestions.push(task.title);
    });
    state().projects.forEach((project) => {
      if (project.nextStep && suggestions.length < 3 && !suggestions.includes(project.nextStep)) suggestions.push(project.nextStep);
    });
    return suggestions.slice(0, 3);
  }

  function reviewPage() {
    const start = Core.startOfWeek();
    const end = Core.endOfWeek();
    const summary = rangeSummary(start, end);
    const suggestions = reviewSuggestions(summary);
    const review = state().weeklyReviews[start] || {};
    const stats = [
      ['完成任务', summary.completed.length, '件'],
      ['专注时间', formatMinutes(summary.focusMinutes), ''],
      ['学习时间', formatMinutes(summary.studyMinutes), ''],
      ['运动记录', summary.exerciseCount, '次'],
      ['写作字数', summary.writingWords.toLocaleString('zh-CN'), '字'],
      ['播客时间', formatMinutes(summary.podcastMinutes), '']
    ];
    return `<div class="page inner-page review-page">
      ${pageHeader('WEEKLY LETTER', '本周复盘', `${dateLabel(start)} — ${dateLabel(end)}`)}
      <section class="review-spread">
        <div class="review-summary"><h2>这一周留下了什么</h2><div class="review-stat-list">${stats.map(([label, value, unit]) => `<div><span>${label}</span><b>${value}<small>${unit}</small></b></div>`).join('')}</div></div>
        <div class="review-insights">${sectionHead('看见投入', '只根据本周真实记录')}
          <dl><div><dt>最投入领域</dt><dd>${esc(summary.invested || '暂无记录')}</dd></div><div><dt>最投入一天</dt><dd>${summary.mostActive ? dateLabel(summary.mostActive) : '暂无记录'}</dd></div><div><dt>延期最多</dt><dd>${esc(summary.delayed?.title || '暂无延期')}</dd></div><div><dt>计划 vs 实际</dt><dd>${formatMinutes(summary.plannedMinutes)} / ${formatMinutes(summary.actualMinutes)}</dd></div></dl>
        </div>
      </section>
      <section class="review-lower">
        <div class="next-week">${sectionHead('下周 3 个重点', '根据未完成任务与项目下一步')}${suggestions.length ? `<ol>${suggestions.map((item) => `<li>${esc(item)}</li>`).join('')}</ol>` : emptyState('还没有足够的数据', '先留下一个任务或项目下一步。')}</div>
        <div class="review-writing">${sectionHead('一句话复盘', '自动保存')}<textarea id="week-review" rows="6" maxlength="360" placeholder="这一周，什么值得被记住？">${esc(review.note || '')}</textarea><span class="autosave-note" id="review-status">输入后自动保存</span></div>
      </section>
      <section class="review-stickers">${sectionHead('本周贴纸位', '固定槽位，不自由堆叠')}${stickerSlots(6)}</section>
    </div>`;
  }

  function notesPage() {
    const notes = [...state().notes].sort((a, b) => b.updatedAt - a.updatedAt);
    return `<div class="page inner-page notes-page">
      ${pageHeader('NOTES', '笔记', '学习笔记、灵感与长期记录都留在这里。', `<button type="button" class="primary-button" data-action="note-new">${icon('plus')}新笔记</button>`)}
      <section class="notes-list">${notes.length ? notes.map((note) => { const project = projectById(note.projectId); return `<article class="note-row" data-action="note-edit" data-id="${attr(note.id)}"><div><span>${new Date(note.updatedAt).toLocaleDateString('zh-CN')}${project ? ` · ${esc(project.name)}` : ''}</span><h2>${esc(note.title)}</h2><p>${esc(note.body || '空白笔记')}</p></div><button type="button" data-action="note-delete" data-id="${attr(note.id)}" aria-label="删除笔记">${icon('trash')}</button></article>`; }).join('') : emptyState('还没有笔记', '写下一段值得以后再读的内容。')}</section>
    </div>`;
  }

  function outfitCard(outfit) {
    const owned = state().collection.outfits.includes(outfit.id);
    const favorite = state().collection.favorites.includes(outfit.id);
    const featured = state().collection.featuredOutfitId === outfit.id;
    return `<article class="outfit-card ${owned ? 'owned' : 'locked'} ${featured ? 'featured' : ''}">
      <button type="button" class="outfit-image" data-action="outfit-open" data-id="${outfit.id}">${img(outfit.image, `${outfit.name}限定卡面`, 853, 1844)}<span class="outfit-state">${featured ? `${icon('check')}当前展示` : owned ? '已收藏' : `${icon('lock')}待解锁`}</span></button>
      <div class="outfit-card-copy"><h3>${esc(outfit.name)}</h3><span>${esc(outfit.series)}</span><p>${esc(outfit.palette)}</p><div>${owned ? `<b>已拥有</b>` : `<b>${icon('coin')}${outfit.price}</b>`}<button type="button" data-action="outfit-favorite" data-id="${outfit.id}" class="${favorite ? 'active' : ''}" aria-label="${favorite ? '取消收藏' : '收藏'}">${icon('heart')}</button></div></div>
      ${owned ? `<button type="button" class="outfit-feature-action ${featured ? 'active' : ''}" data-action="outfit-feature" data-id="${outfit.id}" ${featured ? 'disabled' : ''}>${featured ? `${icon('check')}正在展示` : '设为展示卡面'}</button>` : ''}
    </article>`;
  }

  function wardrobeTab() {
    const filter = state().ui.wardrobeFilter;
    const featuredOutfit = Core.OUTFITS.find((outfit) => outfit.id === state().collection.featuredOutfitId) || Core.OUTFITS[0];
    const filtered = Core.OUTFITS.filter((outfit) => {
      if (filter === 'owned') return state().collection.outfits.includes(outfit.id);
      if (filter === 'all') return true;
      return outfit.release === filter;
    });
    return `<div class="wardrobe-tab">
      <section class="character-intro"><button type="button" class="character-featured" data-action="outfit-open" data-id="${featuredOutfit.id}" aria-label="查看当前展示卡面 ${attr(featuredOutfit.name)}">${img(featuredOutfit.image, `${featuredOutfit.name}当前展示卡面`, 853, 1844)}<span>${icon('check')}当前展示</span></button><div><span class="character-kicker">我的角色卡面</span><h2>${esc(featuredOutfit.name)}</h2><p>${esc(featuredOutfit.series)} · ${esc(featuredOutfit.hair)}<br>卡面会随主题改变服装、发型、配饰、动作与背景；解锁后可切换当前展示。</p><dl><div><dt>已收藏</dt><dd>${state().collection.outfits.length}/10</dd></div><div><dt>可用金币</dt><dd>${state().rewards.coins}</dd></div></dl><button type="button" class="text-button character-view-button" data-action="outfit-open" data-id="${featuredOutfit.id}">查看完整卡面${icon('next')}</button></div></section>
      <section class="outfit-shop">${sectionHead('限定卡面衣橱', '十套独立高清收藏')}
        <div class="segmented wardrobe-filters">${[['all', '全部'], ['new', '新品'], ['basic', '基础'], ['limited', '限定'], ['owned', '已拥有']].map(([value, label]) => `<button type="button" data-action="wardrobe-filter" data-value="${value}" class="${filter === value ? 'active' : ''}">${label}</button>`).join('')}</div>
        <div class="outfit-grid">${filtered.length ? filtered.map(outfitCard).join('') : emptyState('这个分类还没有卡面')}</div>
      </section>
    </div>`;
  }

  function stickersTab() {
    return `<section class="collection-sheet sticker-collection">${sectionHead('贴纸册', `${state().collection.stickers.length}/${Core.STICKERS.length} 已解锁`)}<p class="sticker-book-note">每一枚都来自真实完成的事情，按获得顺序收进固定收藏位。</p><div class="sticker-book">${Core.STICKERS.map((sticker) => {
      const owned = state().collection.stickers.includes(sticker.id);
      return `<article class="sticker-tile ${owned ? 'owned' : 'locked'}"><div class="sticker-pocket"><i aria-hidden="true"></i>${img(sticker.image, sticker.name, 200, 200)}${owned ? '' : `<div class="locked-art" aria-label="未解锁">${icon('lock')}</div>`}</div><div class="sticker-meta"><h3>${esc(sticker.name)}</h3><p>${esc(sticker.hint)}</p></div></article>`;
    }).join('')}</div></section>`;
  }

  function badgesTab() {
    return `<section class="collection-sheet">${sectionHead('成长徽章', `${state().collection.badges.length}/${Core.BADGES.length} 已获得`, '<span class="quiet-label">部分成就隐藏</span>')}<div class="badge-grid">${Core.BADGES.map((badge) => {
      const owned = state().collection.badges.includes(badge.id);
      const hidden = badge.hidden && !owned;
      return `<article class="badge-tile ${owned ? 'owned' : 'locked'}">${owned ? img(badge.image, badge.name, 180, 180) : `<div class="locked-badge">${icon('lock')}</div>`}<h3>${hidden ? '隐藏成就' : esc(badge.name)}</h3><p>${hidden ? '继续成长，它会在合适的时候出现。' : esc(badge.hint)}</p></article>`;
    }).join('')}</div></section>`;
  }

  function monthStats(key) {
    const start = `${key}-01`;
    const [year, month] = key.split('-').map(Number);
    const end = `${key}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
    const summary = rangeSummary(start, end);
    const fields = Object.entries({ 学习: summary.studyMinutes, 写作: summary.writingWords, 运动: summary.exerciseCount, 专注: summary.focusMinutes });
    const strongest = fields.sort((a, b) => b[1] - a[1])[0];
    return { completedTasks: summary.completed.length, focusMinutes: summary.focusMinutes, growthArea: strongest && strongest[1] > 0 ? strongest[0] : '暂无' };
  }

  function memoriesTab() {
    const currentMonth = Core.monthKey();
    const saved = state().monthlyMemories[currentMonth] || {};
    const stats = monthStats(currentMonth);
    const months = Object.keys(state().monthlyMemories).sort().reverse();
    const ownedOutfits = Core.OUTFITS.filter((outfit) => state().collection.outfits.includes(outfit.id));
    const ownedBadges = Core.BADGES.filter((badge) => state().collection.badges.includes(badge.id));
    const selectedOutfit = ownedOutfits.find((outfit) => outfit.id === saved.outfitId) || ownedOutfits.find((outfit) => outfit.id === state().collection.featuredOutfitId) || ownedOutfits[0] || Core.OUTFITS[0];
    const selectedBadge = ownedBadges.find((badge) => badge.id === saved.badgeId) || ownedBadges[ownedBadges.length - 1] || null;
    const memoryStickers = saved.stickers?.length ? saved.stickers : state().collection.stickers.slice(-3);
    const historyCards = months.map((key) => {
      const memory = state().monthlyMemories[key];
      const outfit = Core.OUTFITS.find((item) => item.id === memory.outfitId);
      const badge = Core.BADGES.find((item) => item.id === memory.badgeId);
      return `<article class="${outfit ? 'with-art' : ''}">${outfit ? `<div class="history-memory-art">${img(outfit.image, `${key} ${outfit.name}纪念卡面`, 853, 1844)}${badge ? `<span title="${attr(badge.name)}">${img(badge.image, badge.name, 180, 180)}</span>` : ''}</div>` : ''}<div class="history-memory-copy"><span>${key.replace('-', ' / ')}</span><h3>${esc(memory.keyword || '未命名月份')}</h3><p>${esc(memory.summary || '这一页暂时没有总结。')}</p><small>完成 ${memory.stats?.completedTasks ?? monthStats(key).completedTasks} 件 · 专注 ${formatMinutes(memory.stats?.focusMinutes ?? monthStats(key).focusMinutes)}${outfit ? ` · ${esc(outfit.name)}` : ''}</small></div></article>`;
    }).join('');
    return `<div class="memories-tab">
      <section class="monthly-editor"><div class="monthly-paper"><span class="month-ribbon">月度纪念</span><h2>${currentMonth.replace('-', ' · ')}</h2><div class="monthly-paper-grid"><div><div class="monthly-facts"><p><b>${stats.completedTasks}</b>完成任务</p><p><b>${formatMinutes(stats.focusMinutes)}</b>专注时间</p><p><b>${esc(stats.growthArea)}</b>成长领域</p></div><div class="paper-stickers">${stickerSlots(3, memoryStickers)}</div></div><figure class="monthly-character-card" data-monthly-outfit-preview>${img(selectedOutfit.image, `${selectedOutfit.name}本月角色卡面`, 853, 1844)}${selectedBadge ? `<span class="monthly-character-badge" title="${attr(selectedBadge.name)}">${img(selectedBadge.image, selectedBadge.name, 180, 180)}</span>` : ''}<figcaption>${esc(selectedOutfit.name)}</figcaption></figure></div></div>
        <form data-form="monthly"><div class="monthly-collection-fields"><label>本月角色卡面<select name="outfitId" aria-describedby="monthly-outfit-hint">${ownedOutfits.map((outfit) => `<option value="${attr(outfit.id)}" ${outfit.id === selectedOutfit.id ? 'selected' : ''}>${esc(outfit.name)}</option>`).join('')}</select><small id="monthly-outfit-hint">选择后，上方卡面会即时预览</small></label><label>本月徽章<select name="badgeId"><option value="">暂不放置</option>${ownedBadges.map((badge) => `<option value="${attr(badge.id)}" ${badge.id === selectedBadge?.id ? 'selected' : ''}>${esc(badge.name)}</option>`).join('')}</select></label></div><label>本月关键词<input name="keyword" maxlength="24" value="${attr(saved.keyword || '')}" placeholder="例如：稳定"></label><label>本月总结<textarea name="summary" rows="5" maxlength="480" placeholder="这个月，我想记住……">${esc(saved.summary || '')}</textarea></label><button type="submit" class="primary-button">保存本月纪念页</button></form>
      </section>
      <section class="scene-collection">${sectionHead('场景收藏', `${state().collection.scenes.length}/${Core.SCENES.length} 已拥有`)}<div>${Core.SCENES.map((scene) => { const owned = state().collection.scenes.includes(scene.id); return `<article class="scene-card ${owned ? '' : 'locked'}">${img(scene.image, scene.name, scene.id === 'today-desk' ? 1672 : 1586, scene.id === 'today-desk' ? 941 : 992)}<span>${owned ? esc(scene.name) : `${icon('lock')}待解锁`}</span></article>`; }).join('')}</div></section>
      <section class="history-months">${sectionHead('历史月份', `${months.length} 页永久保存`)}${months.length ? `<div>${historyCards}</div>` : emptyState('还没有月度纪念页', '保存这个月，第一本成长册就会出现。')}</section>
    </div>`;
  }

  function collectionPage() {
    const tab = state().ui.collectionTab;
    const content = { wardrobe: wardrobeTab, stickers: stickersTab, badges: badgesTab, memories: memoriesTab }[tab]?.() || wardrobeTab();
    return `<div class="page inner-page collection-page">${pageHeader('ARCHIVE', '收藏', '衣橱、贴纸、徽章与每个月留下的纪念。')}<div class="collection-tabs" role="tablist">${[['wardrobe', '衣橱'], ['stickers', '贴纸'], ['badges', '徽章'], ['memories', '纪念']].map(([value, label]) => `<button type="button" role="tab" data-action="collection-tab" data-tab="${value}" aria-selected="${tab === value}" class="${tab === value ? 'active' : ''}">${label}</button>`).join('')}</div>${content}</div>`;
  }

  const areaOptions = (selected = '学习') => Object.keys(Core.AREA_META).map((area) => `<option value="${area}" ${area === selected ? 'selected' : ''}>${area}</option>`).join('');
  const projectOptions = (selected = '') => `<option value="">不属于项目</option>${state().projects.map((project) => `<option value="${attr(project.id)}" ${project.id === selected ? 'selected' : ''}>${esc(project.name)}</option>`).join('')}`;

  function modalFrame(title, body, className = '') {
    return `<div class="modal-layer" data-action="modal-backdrop"><section class="modal-card ${className}" role="dialog" aria-modal="true" aria-label="${attr(title)}"><header><h2>${esc(title)}</h2><button type="button" data-action="modal-close" aria-label="关闭">${icon('close')}</button></header>${body}</section></div>`;
  }

  function taskModal(data = {}) {
    const task = data.id ? taskById(data.id) : null;
    const date = task?.date || data.date || TODAY();
    const projectId = task?.projectId || data.projectId || '';
    return modalFrame(task ? '编辑任务' : '新任务', `<form data-form="task"><input type="hidden" name="id" value="${attr(task?.id || '')}"><div class="form-grid"><label class="wide">任务标题<input name="title" maxlength="100" value="${attr(task?.title || '')}" placeholder="下一件可以完成的小事" required autofocus></label><label>所属领域<select name="area">${areaOptions(task?.area || projectById(projectId)?.area || '学习')}</select></label><label>预计时间<input name="minutes" type="number" inputmode="numeric" min="1" max="1440" value="${task?.minutes || 25}" required></label><label>日期<input name="date" type="date" value="${date}" required></label><label>所属项目<select name="projectId">${projectOptions(projectId)}</select></label><label>成长奖励<input name="reward" type="number" inputmode="numeric" min="0" max="999" value="${task?.reward ?? 10}" required></label><label class="check-label"><input name="priority" type="checkbox" ${task?.priority || data.priority ? 'checked' : ''}><i></i><span>设为今日重点</span></label></div><footer><button type="button" class="secondary-button" data-action="modal-close">取消</button><button type="submit" class="primary-button">保存任务</button></footer></form>`);
  }

  function quickModal() {
    const actions = [['task', 'check', '新任务', '安排一件要完成的事'], ['capture', 'inbox', '快速记录', '先放进收集箱'], ['focus', 'focus', '开始番茄', '直接进入专注室'], ['journal', 'note', '一句话日记', '留下今天的句子'], ['growth', 'growth', '成长记录', '学习、写作、运动或播客']];
    return modalFrame('快速添加', `<div class="quick-actions">${actions.map(([kind, iconName, title, description]) => `<button type="button" data-action="quick-choice" data-kind="${kind}"><span>${icon(iconName)}</span><b>${title}</b><small>${description}</small>${icon('next')}</button>`).join('')}</div>`, 'quick-modal');
  }

  function captureModal() {
    return modalFrame('快速记录', `<form data-form="capture"><label>想到什么？<textarea name="text" rows="4" maxlength="200" placeholder="先记下来，稍后再整理。" required autofocus></textarea></label><footer><button type="button" class="secondary-button" data-action="modal-close">取消</button><button type="submit" class="primary-button">放进收集箱</button></footer></form>`);
  }

  function journalModal() {
    return modalFrame('一句话日记', `<form data-form="journal"><label>今天想留下什么？<textarea name="text" rows="4" maxlength="240" placeholder="今天状态比昨天稳定一点。" autofocus>${esc(state().journal[TODAY()] || '')}</textarea></label><footer><button type="button" class="secondary-button" data-action="modal-close">取消</button><button type="submit" class="primary-button">保存这句话</button></footer></form>`);
  }

  function growthModal() {
    return modalFrame('成长记录', `<form data-form="growth"><div class="form-grid"><label>成长领域<select name="area">${areaOptions('学习')}</select></label><label>数量<input name="amount" type="number" min="0.1" step="0.1" inputmode="decimal" value="30" required></label><label>日期<input name="date" type="date" value="${TODAY()}" required></label><label class="wide">补充说明<input name="note" maxlength="100" placeholder="例如：审计专题六"></label></div><p class="form-hint">学习、工作、运动、英语和播客以分钟记录；写作以字数记录。</p><footer><button type="button" class="secondary-button" data-action="modal-close">取消</button><button type="submit" class="primary-button">记入成长</button></footer></form>`);
  }

  function projectModal(project = null) {
    const focus = (project?.weeklyFocus || []).join('\n');
    const milestones = (project?.milestones || []).map((item) => `${item.date || ''} | ${item.title}`).join('\n');
    return modalFrame(project ? '编辑项目' : '新建项目', `<form data-form="project"><input type="hidden" name="id" value="${attr(project?.id || '')}"><div class="form-grid"><label>项目名称<input name="name" maxlength="40" value="${attr(project?.name || '')}" required autofocus></label><label>领域<select name="area">${areaOptions(project?.area || '学习')}</select></label><label class="wide">目标<input name="goal" maxlength="160" value="${attr(project?.goal || '')}" placeholder="这个章节最终想抵达哪里？"></label><label class="wide">下一步<input name="nextStep" maxlength="120" value="${attr(project?.nextStep || '')}" placeholder="足够小、可以立刻开始的一步"></label><label class="wide">本周重点（每行一项，最多 3 项）<textarea name="weeklyFocus" rows="3">${esc(focus)}</textarea></label><label class="wide">重要节点（日期 | 内容，每行一项）<textarea name="milestones" rows="4" placeholder="2026-09-15 | 完成专题六">${esc(milestones)}</textarea></label></div><footer><button type="button" class="secondary-button" data-action="modal-close">取消</button><button type="submit" class="primary-button">保存项目</button></footer></form>`);
  }

  function inboxMoveModal(kind, id) {
    const item = state().inbox.find((entry) => entry.id === id);
    if (!item) return '';
    const title = kind === 'schedule' ? '安排日期' : '转成项目任务';
    return modalFrame(title, `<form data-form="inbox-move"><input type="hidden" name="id" value="${attr(id)}"><input type="hidden" name="kind" value="${kind}"><label>内容<input name="title" value="${attr(item.text)}" maxlength="100" required></label><label>日期<input name="date" type="date" value="${TODAY()}" required></label>${kind === 'project' ? `<label>项目<select name="projectId" required><option value="">请选择项目</option>${state().projects.map((project) => `<option value="${attr(project.id)}">${esc(project.name)}</option>`).join('')}</select></label>` : ''}<footer><button type="button" class="secondary-button" data-action="modal-close">取消</button><button type="submit" class="primary-button">确认整理</button></footer></form>`);
  }

  function noteModal(note = null) {
    return modalFrame(note ? '编辑笔记' : '新笔记', `<form data-form="note"><input type="hidden" name="id" value="${attr(note?.id || '')}"><label>标题<input name="title" maxlength="80" value="${attr(note?.title || '')}" required autofocus></label><label>所属项目<select name="projectId">${projectOptions(note?.projectId || '')}</select></label><label>正文<textarea name="body" rows="10" maxlength="6000" placeholder="从这里开始写……">${esc(note?.body || '')}</textarea></label><footer><button type="button" class="secondary-button" data-action="modal-close">取消</button><button type="submit" class="primary-button">保存笔记</button></footer></form>`);
  }

  function habitModal() {
    return modalFrame('新习惯', `<form data-form="habit"><label>习惯名称<input name="name" maxlength="20" placeholder="例如：拉伸" required autofocus></label><footer><button type="button" class="secondary-button" data-action="modal-close">取消</button><button type="submit" class="primary-button">添加习惯</button></footer></form>`);
  }

  function outfitModal(id) {
    const outfit = Core.OUTFITS.find((item) => item.id === id);
    if (!outfit) return '';
    const owned = state().collection.outfits.includes(id);
    const featured = state().collection.featuredOutfitId === id;
    return modalFrame(outfit.name, `<div class="outfit-detail"><div class="outfit-detail-art">${img(outfit.image, `${outfit.name}完整限定卡面`, 853, 1844, { className: 'detail-image' })}</div><div class="outfit-detail-copy"><span class="series-label">${esc(outfit.series)}</span><h3>${esc(outfit.name)}</h3>${owned ? `<button type="button" class="secondary-button detail-feature-button ${featured ? 'active' : ''}" data-action="outfit-feature" data-id="${outfit.id}" ${featured ? 'disabled' : ''}>${icon('check')}${featured ? '当前正在展示' : '设为当前展示卡面'}</button>` : ''}<dl><div><dt>发型</dt><dd>${esc(outfit.hair)}</dd></div><div><dt>配饰</dt><dd>${esc(outfit.accessories)}</dd></div><div><dt>色彩</dt><dd>${esc(outfit.palette)}</dd></div></dl><p>独立动作、发型、配饰与场景构成完整卡面。解锁后永久进入收藏册，也可以随时更换当前展示。</p>${owned ? `<div class="owned-mark">${icon('check')}已永久收藏</div>` : `<button type="button" class="primary-button purchase-button" data-action="outfit-buy" data-id="${outfit.id}">${icon('coin')}${outfit.price} 金币解锁</button>`}</div></div>`, 'outfit-modal');
  }

  function renderModal() {
    if (!modal) return '';
    const renderers = {
      quick: () => quickModal(),
      task: () => taskModal(modal),
      capture: () => captureModal(),
      journal: () => journalModal(),
      growth: () => growthModal(),
      project: () => projectModal(modal.id ? projectById(modal.id) : null),
      'inbox-move': () => inboxMoveModal(modal.kind, modal.id),
      note: () => noteModal(modal.id ? state().notes.find((note) => note.id === modal.id) : null),
      habit: () => habitModal(),
      outfit: () => outfitModal(modal.id)
    };
    return renderers[modal.type]?.() || '';
  }

  function shell() {
    const pages = { today: todayPage, inbox: inboxPage, project: projectPage, calendar: calendarPage, focus: focusPage, habits: habitsPage, review: reviewPage, notes: notesPage, collection: collectionPage };
    const current = pages[state().ui.page] || todayPage;
    return `<div class="app-shell ${state().ui.sidebarCollapsed ? 'sidebar-collapsed' : ''} ${drawerOpen ? 'drawer-open' : ''}"><button type="button" class="drawer-scrim" data-action="drawer-close" aria-label="关闭项目抽屉"></button>${sidebar()}<main class="main-shell">${topbar()}<div id="view">${current()}</div></main><button type="button" class="global-fab" data-action="quick-open" aria-label="快速添加">${icon('plus')}</button>${renderModal()}<div class="toast ${toastMessage ? 'show' : ''}" role="status">${icon('logo')}<span>${esc(toastMessage)}</span></div></div>`;
  }

  function render(options = {}) {
    const scroll = options.preserveScroll ? window.scrollY : 0;
    app.innerHTML = shell();
    document.body.classList.toggle('modal-open', Boolean(modal));
    document.querySelectorAll('[data-safe-image]').forEach((image) => image.addEventListener('error', () => image.parentElement?.classList.add('image-error'), { once: true }));
    if (options.preserveScroll) window.scrollTo(0, scroll);
    if (modal) requestAnimationFrame(() => document.querySelector('.modal-card [autofocus]')?.focus());
    if (toastMessage) {
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toastMessage = '';
        document.querySelector('.toast')?.classList.remove('show');
      }, 2600);
    }
    syncTimerView();
  }

  function openModal(next) {
    modal = next;
    render({ preserveScroll: true });
  }

  function closeModal() {
    modal = null;
    render({ preserveScroll: true });
  }

  function navigate(page) {
    state().ui.page = page;
    drawerOpen = false;
    searchQuery = '';
    Core.save('navigate');
    render({ preserveScroll: false });
  }

  function toggleTask(id) {
    const task = taskById(id);
    if (!task || task.status === 'cancelled') return;
    if (task.status === 'done') {
      task.status = 'todo';
      task.completedAt = null;
      state().activity = state().activity.filter((entry) => !(entry.type === 'task' && entry.meta?.taskId === id));
      saveAndRender('task-reopen', '已恢复为待完成');
      return;
    }
    task.status = 'done';
    task.completedAt = Date.now();
    task.updatedAt = task.completedAt;
    task.actualMinutes = task.actualMinutes || task.minutes;
    let rewardText = '任务已完成';
    if (!task.rewardGranted) {
      task.rewardGranted = true;
      const stars = Math.max(0, Number(task.reward) || 0);
      const coins = stars ? Math.max(1, Math.ceil(stars / 2)) : 0;
      state().rewards.stars += stars;
      state().rewards.coins += coins;
      rewardText += ` · 成长 +${stars} · 金币 +${coins}`;
    }
    addActivity('task', `完成 ${task.title}`, { taskId: task.id, area: task.area, scheduledDate: task.date }, task.completedAt, TODAY());
    saveAndRender('task-complete', rewardText);
  }

  function postponeTask(id) {
    const task = taskById(id);
    if (!task) return;
    const from = task.date;
    task.date = Core.addDays(task.date, 1);
    task.status = 'todo';
    task.completedAt = null;
    task.postponedCount = (task.postponedCount || 0) + 1;
    task.updatedAt = Date.now();
    state().activity = state().activity.filter((entry) => !(entry.type === 'task' && entry.meta?.taskId === id));
    addActivity('task-postponed', `延后 ${task.title} 至 ${task.date}`, { taskId: id, from, to: task.date });
    saveAndRender('task-postpone', `已延后到 ${task.date}`);
  }

  function cancelTask(id) {
    const task = taskById(id);
    if (!task) return;
    task.status = 'cancelled';
    task.completedAt = null;
    task.updatedAt = Date.now();
    state().activity = state().activity.filter((entry) => !(entry.type === 'task' && entry.meta?.taskId === id));
    addActivity('task-cancelled', `取消 ${task.title}`, { taskId: id });
    saveAndRender('task-cancel', '任务已取消');
  }

  function startFocus() {
    if (state().timer) return;
    const select = document.querySelector('#focus-task');
    const taskId = select?.value || focusDraftTaskId || null;
    const task = taskId ? taskById(taskId) : null;
    const label = document.querySelector('#focus-label')?.value.trim() || task?.title || '专注';
    const now = Date.now();
    state().timer = {
      id: Core.uid('timer'),
      status: 'running',
      taskId,
      label,
      durationSeconds: focusDuration * 60,
      remainingSeconds: focusDuration * 60,
      createdAt: now,
      lastStartedAt: now
    };
    focusDraftTaskId = taskId || '';
    saveAndRender('focus-start', '专注开始');
  }

  function pauseFocus() {
    const timer = state().timer;
    if (!timer || timer.status !== 'running') return;
    timer.remainingSeconds = remainingSeconds(timer);
    timer.status = 'paused';
    timer.lastStartedAt = null;
    saveAndRender('focus-pause', '已暂停');
  }

  function resumeFocus() {
    const timer = state().timer;
    if (!timer || timer.status !== 'paused') return;
    timer.status = 'running';
    timer.lastStartedAt = Date.now();
    saveAndRender('focus-resume', '继续专注');
  }

  function finishFocus(completedByTimer = false) {
    if (timerFinishing) return;
    const timer = state().timer;
    if (!timer) return;
    timerFinishing = true;
    const remaining = completedByTimer ? 0 : remainingSeconds(timer);
    const actualSeconds = Math.max(1, Math.round((Number(timer.durationSeconds) || 0) - remaining));
    const actualMinutes = actualSeconds / 60;
    const endedAt = Date.now();
    const session = {
      id: Core.uid('focus'),
      taskId: timer.taskId || null,
      label: timer.label || '专注',
      plannedMinutes: (Number(timer.durationSeconds) || 0) / 60,
      actualMinutes,
      actualSeconds,
      startedAt: Number(timer.createdAt || endedAt - actualSeconds * 1000),
      endedAt,
      date: TODAY(),
      status: 'completed',
      rewardGranted: completedByTimer || actualSeconds >= 60
    };
    state().focusSessions.push(session);
    const task = timer.taskId ? taskById(timer.taskId) : null;
    if (task) task.actualMinutes = (Number(task.actualMinutes) || 0) + actualMinutes;
    let message = `已记录 ${formatMinutes(actualMinutes)}`;
    if (session.rewardGranted) {
      const stars = Math.max(1, Math.round(actualMinutes / 5));
      const coins = Math.max(1, Math.round(actualMinutes / 10));
      state().rewards.stars += stars;
      state().rewards.coins += coins;
      message += ` · 成长 +${stars} · 金币 +${coins}`;
    } else {
      message += ' · 满 1 分钟后可获得奖励';
    }
    addActivity('focus', `专注 ${formatMinutes(actualMinutes)} · ${session.label}`, { sessionId: session.id, taskId: session.taskId }, endedAt, session.date);
    state().timer = null;
    focusDraftTaskId = '';
    saveAndRender('focus-end', message);
    timerFinishing = false;
  }

  function syncTimerView() {
    const timer = state().timer;
    if (!timer) return;
    const remaining = remainingSeconds(timer);
    document.querySelectorAll('[data-timer-clock]').forEach((node) => { node.textContent = formatClock(remaining); });
    const duration = Number(timer.durationSeconds) || 1;
    const progress = Math.max(0, Math.min(1, 1 - remaining / duration));
    document.querySelectorAll('[data-timer-ring]').forEach((ring) => { ring.style.strokeDashoffset = String(439.823 * (1 - progress)); });
    if (remaining <= 0 && timer.status === 'running') finishFocus(true);
  }

  function updateSearchPopover() {
    const result = document.querySelector('#search-results');
    if (result) result.innerHTML = searchResults();
  }

  app.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (action === 'navigate') return navigate(target.dataset.page);
    if (action === 'sidebar-collapse') {
      if (window.matchMedia('(max-width: 900px)').matches) { drawerOpen = false; return render({ preserveScroll: true }); }
      state().ui.sidebarCollapsed = !state().ui.sidebarCollapsed;
      return saveAndRender('sidebar');
    }
    if (action === 'projects-collapse') { state().ui.projectsCollapsed = !state().ui.projectsCollapsed; return saveAndRender('projects-collapse'); }
    if (action === 'drawer-open') { drawerOpen = true; state().ui.sidebarCollapsed = false; return render({ preserveScroll: true }); }
    if (action === 'drawer-close') { drawerOpen = false; return render({ preserveScroll: true }); }
    if (action === 'quick-open') return openModal({ type: 'quick' });
    if (action === 'modal-close' || action === 'modal-backdrop' && target === event.target) return closeModal();
    if (action === 'quick-choice') {
      const kind = target.dataset.kind;
      if (kind === 'focus') { modal = null; state().ui.page = 'focus'; Core.save('navigate'); return render({ preserveScroll: false }); }
      return openModal({ type: kind === 'task' ? 'task' : kind });
    }
    if (action === 'task-new') return openModal({ type: 'task', date: target.dataset.date || TODAY(), projectId: target.dataset.projectId || '', priority: state().ui.page === 'today' });
    if (action === 'task-edit') return openModal({ type: 'task', id });
    if (action === 'task-toggle') return toggleTask(id);
    if (action === 'task-postpone') return postponeTask(id);
    if (action === 'task-cancel') return cancelTask(id);
    if (action === 'task-filter') { state().ui.taskFilter = target.dataset.value; return saveAndRender('task-filter'); }
    if (action === 'today-section') {
      const section = target.dataset.value;
      if (!['tasks', 'growth', 'journal'].includes(section)) return;
      todaySection = section;
      return render({ preserveScroll: true });
    }
    if (action === 'growth-new') return openModal({ type: 'growth' });
    if (action === 'mood-set') {
      const mood = target.dataset.value;
      const removing = state().mood[TODAY()] === mood;
      if (removing) delete state().mood[TODAY()]; else state().mood[TODAY()] = mood;
      return saveAndRender('mood', removing ? '已取消心情记录' : `已记录：${mood}`);
    }
    if (action === 'project-open') { state().ui.selectedProjectId = id; state().ui.page = 'project'; drawerOpen = false; return saveAndRender('project-open', '', false); }
    if (action === 'project-new') return openModal({ type: 'project' });
    if (action === 'project-edit') return openModal({ type: 'project', id });
    if (action === 'milestone-toggle') {
      const project = projectById(target.dataset.projectId);
      const milestone = project?.milestones?.find((item) => item.id === id);
      if (!milestone) return;
      milestone.done = !milestone.done;
      milestone.completedAt = milestone.done ? Date.now() : null;
      state().activity = state().activity.filter((entry) => !(entry.type === 'milestone' && entry.meta?.milestoneId === id));
      if (milestone.done) addActivity('milestone', `完成节点 · ${milestone.title}`, { milestoneId: id, projectId: project.id }, milestone.completedAt, TODAY());
      return saveAndRender('milestone', milestone.done ? '重要节点已完成' : '已取消节点完成');
    }
    if (action === 'inbox-today') {
      const index = state().inbox.findIndex((item) => item.id === id);
      if (index < 0) return;
      const item = state().inbox.splice(index, 1)[0];
      state().tasks.push({ id: Core.uid('task'), title: item.text, area: '生活', minutes: 25, reward: 10, priority: false, status: 'todo', date: TODAY(), projectId: null, createdAt: Date.now(), updatedAt: Date.now(), completedAt: null, rewardGranted: false, actualMinutes: 0 });
      addActivity('inbox-organized', `整理收集箱：${item.text}`, { inboxId: id });
      return saveAndRender('inbox-today', '已放到今天');
    }
    if (action === 'inbox-schedule') return openModal({ type: 'inbox-move', kind: 'schedule', id });
    if (action === 'inbox-project') return openModal({ type: 'inbox-move', kind: 'project', id });
    if (action === 'inbox-delete') {
      state().inbox = state().inbox.filter((item) => item.id !== id);
      return saveAndRender('inbox-delete', '已删除');
    }
    if (action === 'calendar-shift') {
      const [year, month] = state().ui.calendarCursor.split('-').map(Number);
      const next = new Date(year, month - 1 + Number(target.dataset.value), 1);
      state().ui.calendarCursor = Core.monthKey(next);
      state().ui.selectedDate = Core.localDateKey(next);
      return saveAndRender('calendar-shift');
    }
    if (action === 'calendar-today') { state().ui.calendarCursor = Core.monthKey(); state().ui.selectedDate = TODAY(); return saveAndRender('calendar-today'); }
    if (action === 'calendar-select') { state().ui.selectedDate = target.dataset.date; return saveAndRender('calendar-select'); }
    if (action === 'focus-from-task') { focusDraftTaskId = id; state().ui.page = 'focus'; return saveAndRender('focus-route', '', false); }
    if (action === 'focus-duration') { focusDuration = Number(target.dataset.value) || 25; return render({ preserveScroll: true }); }
    if (action === 'focus-start') return startFocus();
    if (action === 'focus-pause') return pauseFocus();
    if (action === 'focus-resume') return resumeFocus();
    if (action === 'focus-end') return finishFocus(false);
    if (action === 'habit-new') return openModal({ type: 'habit' });
    if (action === 'habit-toggle') {
      const habit = state().habits.find((item) => item.id === id);
      if (!habit) return;
      habit.days ||= {};
      habit.rewardedDays ||= [];
      const date = target.dataset.date;
      const next = !habit.days[date];
      habit.days[date] = next;
      let newlyRewarded = false;
      if (next) {
        addActivity('habit', `记录习惯 · ${habit.name}`, { habitId: id }, Date.now(), date);
        if (!habit.rewardedDays.includes(date)) {
          habit.rewardedDays.push(date);
          state().rewards.stars += 1;
          state().rewards.coins += 1;
          newlyRewarded = true;
        }
      } else {
        state().activity = state().activity.filter((entry) => !(entry.type === 'habit' && entry.meta?.habitId === id && entry.date === date));
      }
      return saveAndRender('habit-toggle', next ? `习惯已记录${newlyRewarded ? ' · 成长 +1 · 金币 +1' : ''}` : '已取消这次记录');
    }
    if (action === 'habit-delete') { state().habits = state().habits.filter((item) => item.id !== id); return saveAndRender('habit-delete', '习惯已移除'); }
    if (action === 'note-new') return openModal({ type: 'note' });
    if (action === 'note-edit') return openModal({ type: 'note', id });
    if (action === 'note-delete') { state().notes = state().notes.filter((note) => note.id !== id); return saveAndRender('note-delete', '笔记已删除'); }
    if (action === 'collection-tab') { state().ui.collectionTab = target.dataset.tab; state().ui.page = 'collection'; return saveAndRender('collection-tab', '', false); }
    if (action === 'wardrobe-filter') { state().ui.wardrobeFilter = target.dataset.value; return saveAndRender('wardrobe-filter'); }
    if (action === 'outfit-open') return openModal({ type: 'outfit', id });
    if (action === 'outfit-favorite') {
      const favorites = state().collection.favorites;
      const index = favorites.indexOf(id);
      if (index >= 0) favorites.splice(index, 1); else favorites.push(id);
      return saveAndRender('favorite', index >= 0 ? '已取消珍藏' : '已加入珍藏');
    }
    if (action === 'outfit-feature') {
      if (!state().collection.outfits.includes(id)) return;
      if (state().collection.featuredOutfitId === id) { announce('这张卡面已经在展示'); return render({ preserveScroll: true }); }
      const outfit = Core.OUTFITS.find((item) => item.id === id);
      state().collection.featuredOutfitId = id;
      return saveAndRender('outfit-feature', `已展示「${outfit?.name || '这张卡面'}」`);
    }
    if (action === 'outfit-buy') {
      const outfit = Core.OUTFITS.find((item) => item.id === id);
      if (!outfit || state().collection.outfits.includes(id)) return;
      if (state().rewards.coins < outfit.price) { announce(`还差 ${outfit.price - state().rewards.coins} 枚金币`); return render({ preserveScroll: true }); }
      state().rewards.coins -= outfit.price;
      state().collection.outfits.push(id);
      state().collection.featuredOutfitId = id;
      addActivity('collection', `解锁卡面 · ${outfit.name}`, { outfitId: id });
      return saveAndRender('outfit-buy', `已解锁并展示「${outfit.name}」`);
    }
    if (action === 'search-open') {
      const kind = target.dataset.kind;
      searchQuery = '';
      if (kind === 'project') { state().ui.selectedProjectId = id; state().ui.page = 'project'; }
      if (kind === 'note') { state().ui.page = 'notes'; modal = { type: 'note', id }; }
      if (kind === 'task') { const task = taskById(id); if (task) { state().ui.page = 'calendar'; state().ui.selectedDate = task.date; state().ui.calendarCursor = task.date.slice(0, 7); } }
      Core.save('search-open');
      return render({ preserveScroll: false });
    }
  });

  app.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-form]');
    if (!form) return;
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (form.dataset.form === 'inbox' || form.dataset.form === 'capture') {
      const text = String(data.text || '').trim();
      if (!text) return;
      state().inbox.push({ id: Core.uid('inbox'), text, createdAt: Date.now() });
      modal = null;
      return saveAndRender('inbox-add', '已放进收集箱');
    }
    if (form.dataset.form === 'task') {
      const title = String(data.title || '').trim();
      if (!title) return;
      const id = String(data.id || '');
      const existing = id ? taskById(id) : null;
      let priority = data.priority === 'on';
      const date = String(data.date || TODAY());
      const otherPriorities = state().tasks.filter((task) => task.id !== id && task.date === date && task.priority && task.status !== 'cancelled').length;
      let warning = '';
      if (priority && otherPriorities >= 3) { priority = false; warning = ' · 当天重点已满 3 项，已保存为普通任务'; }
      const values = {
        title,
        area: Core.AREA_META[data.area] ? data.area : '生活',
        minutes: Core.clamp(data.minutes, 1, 1440),
        reward: Core.clamp(data.reward, 0, 999),
        priority,
        date,
        projectId: data.projectId || null,
        updatedAt: Date.now()
      };
      if (existing) Object.assign(existing, values);
      else state().tasks.push({ id: Core.uid('task'), ...values, status: 'todo', createdAt: Date.now(), completedAt: null, rewardGranted: false, actualMinutes: 0, postponedCount: 0 });
      modal = null;
      return saveAndRender(existing ? 'task-edit' : 'task-add', `${existing ? '任务已更新' : '任务已添加'}${warning}`);
    }
    if (form.dataset.form === 'journal') {
      state().journal[TODAY()] = String(data.text || '').trim();
      modal = null;
      return saveAndRender('journal', '日记已保存');
    }
    if (form.dataset.form === 'growth') {
      const area = Core.AREA_META[data.area] ? data.area : '生活';
      const amount = Math.max(0.1, Number(data.amount) || 0.1);
      const date = /^\d{4}-\d{2}-\d{2}$/.test(data.date) ? data.date : TODAY();
      const unit = Core.AREA_META[area].unit;
      const note = String(data.note || '').trim();
      const record = { id: Core.uid('growth'), area, amount, unit, note, date, createdAt: Date.now(), rewardGranted: true };
      state().growthRecords.push(record);
      state().rewards.stars += 2;
      state().rewards.coins += 1;
      addActivity('growth', `${area} ${amount.toLocaleString('zh-CN')} ${unit}${note ? ` · ${note}` : ''}`, { recordId: record.id, area }, record.createdAt, date);
      modal = null;
      return saveAndRender('growth-add', '成长已记录 · 成长 +2 · 金币 +1');
    }
    if (form.dataset.form === 'project') {
      const id = String(data.id || '');
      const existing = id ? projectById(id) : null;
      const oldMilestones = new Map((existing?.milestones || []).map((item) => [`${item.date}|${item.title}`, item]));
      const weeklyFocus = String(data.weeklyFocus || '').split('\n').map((item) => item.trim()).filter(Boolean).slice(0, 3);
      const milestones = String(data.milestones || '').split('\n').map((line) => {
        const [datePart, ...titleParts] = line.split('|');
        const date = datePart.trim();
        const title = titleParts.join('|').trim();
        if (!title) return null;
        const previous = oldMilestones.get(`${date}|${title}`);
        return previous || { id: Core.uid('milestone'), date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '', title, done: false, completedAt: null };
      }).filter(Boolean);
      const values = { name: String(data.name || '').trim(), area: Core.AREA_META[data.area] ? data.area : '学习', goal: String(data.goal || '').trim(), nextStep: String(data.nextStep || '').trim(), weeklyFocus, milestones };
      if (!values.name) return;
      if (existing) Object.assign(existing, values);
      else {
        const project = { id: Core.uid('project'), ...values, createdAt: Date.now() };
        state().projects.push(project);
        state().ui.selectedProjectId = project.id;
        state().ui.page = 'project';
      }
      modal = null;
      return saveAndRender(existing ? 'project-edit' : 'project-add', existing ? '项目已更新' : '新章节已建立');
    }
    if (form.dataset.form === 'inbox-move') {
      const index = state().inbox.findIndex((item) => item.id === data.id);
      if (index < 0) return;
      const item = state().inbox.splice(index, 1)[0];
      const projectId = data.kind === 'project' ? data.projectId : null;
      state().tasks.push({ id: Core.uid('task'), title: String(data.title || item.text).trim(), area: projectById(projectId)?.area || '生活', minutes: 25, reward: 10, priority: false, status: 'todo', date: data.date || TODAY(), projectId: projectId || null, createdAt: Date.now(), updatedAt: Date.now(), completedAt: null, rewardGranted: false, actualMinutes: 0, postponedCount: 0 });
      addActivity('inbox-organized', `整理收集箱：${item.text}`, { inboxId: item.id });
      modal = null;
      return saveAndRender('inbox-move', projectId ? '已转成项目任务' : `已安排到 ${data.date}`);
    }
    if (form.dataset.form === 'note') {
      const id = String(data.id || '');
      const existing = id ? state().notes.find((note) => note.id === id) : null;
      const now = Date.now();
      const values = { title: String(data.title || '').trim(), body: String(data.body || ''), projectId: data.projectId || null, updatedAt: now };
      if (!values.title) return;
      if (existing) Object.assign(existing, values);
      else state().notes.push({ id: Core.uid('note'), ...values, createdAt: now });
      modal = null;
      return saveAndRender(existing ? 'note-edit' : 'note-add', existing ? '笔记已更新' : '笔记已保存');
    }
    if (form.dataset.form === 'habit') {
      const name = String(data.name || '').trim();
      if (!name) return;
      state().habits.push({ id: Core.uid('habit'), name, days: {}, rewardedDays: [] });
      modal = null;
      return saveAndRender('habit-add', '新习惯已添加');
    }
    if (form.dataset.form === 'monthly') {
      const key = Core.monthKey();
      const stats = monthStats(key);
      const isFirstSave = !state().monthlyMemories[key];
      const outfitId = state().collection.outfits.includes(String(data.outfitId || '')) ? String(data.outfitId) : state().collection.outfits[0];
      const badgeId = state().collection.badges.includes(String(data.badgeId || '')) ? String(data.badgeId) : null;
      state().monthlyMemories[key] = { month: key, keyword: String(data.keyword || '').trim(), summary: String(data.summary || '').trim(), stickers: state().collection.stickers.slice(-3), outfitId, badgeId, stats, createdAt: state().monthlyMemories[key]?.createdAt || Date.now(), updatedAt: Date.now() };
      if (isFirstSave) addActivity('monthly-memory', `保存 ${key} 月度纪念页`, { month: key });
      return saveAndRender('monthly-save', '本月纪念页已保存');
    }
  });

  app.addEventListener('input', (event) => {
    if (event.target.id === 'global-search') {
      searchQuery = event.target.value;
      updateSearchPopover();
      return;
    }
    if (event.target.id === 'today-journal') {
      state().journal[TODAY()] = event.target.value;
      const unlocked = Core.save('journal-autosave');
      const status = document.querySelector('#journal-status');
      if (status) status.textContent = unlocked.persisted === false ? '本地保存失败，请检查浏览器权限' : unlocked.stickers.length ? '已自动保存 · 新贴纸已解锁' : '已自动保存';
      return;
    }
    if (event.target.id === 'week-review') {
      const key = Core.startOfWeek();
      state().weeklyReviews[key] ||= {};
      state().weeklyReviews[key].note = event.target.value;
      state().weeklyReviews[key].updatedAt = Date.now();
      const saved = Core.save('review-autosave');
      const status = document.querySelector('#review-status');
      if (status) status.textContent = saved.persisted === false ? '本地保存失败，请检查浏览器权限' : '已自动保存';
    }
  });

  app.addEventListener('change', (event) => {
    if (event.target.id === 'focus-task') {
      focusDraftTaskId = event.target.value;
      const task = taskById(focusDraftTaskId);
      const label = document.querySelector('#focus-label');
      if (task && label && !label.value.trim()) label.value = task.title;
      return;
    }
    if (event.target.matches('[data-form="monthly"] select[name="outfitId"]')) {
      const outfit = Core.OUTFITS.find((item) => item.id === event.target.value);
      const preview = document.querySelector('[data-monthly-outfit-preview]');
      const image = preview?.querySelector('img');
      const caption = preview?.querySelector('figcaption');
      if (!outfit || !image || !caption) return;
      image.src = outfit.image;
      image.alt = `${outfit.name}本月角色卡面`;
      image.parentElement?.classList.remove('image-error');
      image.addEventListener('error', () => image.parentElement?.classList.add('image-error'), { once: true });
      caption.textContent = outfit.name;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (modal) closeModal();
    else if (drawerOpen) { drawerOpen = false; render({ preserveScroll: true }); }
    else if (searchQuery) { searchQuery = ''; render({ preserveScroll: true }); }
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) syncTimerView(); });

  render();
  timerLoop = setInterval(syncTimerView, 250);
})();
