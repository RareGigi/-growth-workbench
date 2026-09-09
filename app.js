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
  let rainAnimationFrame = null;
  let rainSceneCleanup = null;
  let focusAudioMedia = null;
  let focusAudioPlaying = false;
  let focusAudioStarting = false;
  let focusAudioEpoch = 0;
  let focusAudioFadeFrame = null;
  let focusAudioIssue = '';
  let focusWakeLock = null;
  let pendingBackupImport = null;

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
  const PLAN_TRACKS = Object.freeze([
    {
      id: 'tax', name: '税务师', area: '学习', projectName: '税务师', match: ['税务师', '税法', '涉税'],
      goal: '完成税务师当前备考科目的系统学习、练习与复盘。',
      nextStep: '确定本周要推进的一个税务师知识点。',
      weeklyFocus: ['学习一个核心知识点', '完成对应练习并订正', '整理本周错题'],
      steps: [['学习税务师当前知识点', 25], ['完成一组税务师练习', 25], ['整理税务师错题', 15]]
    },
    {
      id: 'english', name: '英语', area: '英语', projectName: '英语积累', match: ['英语', '单词', '听力', '口语'],
      goal: '建立可以长期坚持的英语输入、复习与输出节奏。',
      nextStep: '完成一次短时英语输入。',
      weeklyFocus: ['完成三次英语输入', '复习本周词汇与表达', '做一次简短输出'],
      steps: [['英语输入：听读一段材料', 20], ['复习词汇与表达', 15], ['用英语写 3 句话', 10]]
    },
    {
      id: 'podcast', name: '播客', area: '播客', projectName: '播客积累', match: ['播客', '小宇宙', '节目'],
      goal: '稳定收听值得留下的内容，并形成自己的观点记录。',
      nextStep: '选择一期真正想听的节目。',
      weeklyFocus: ['完整收听一期节目', '记下三个有用要点', '留下一句自己的想法'],
      steps: [['收听一期播客', 30], ['记下 3 个要点', 10], ['写一句自己的想法', 5]]
    },
    {
      id: 'cpa', name: 'CPA', area: '学习', projectName: 'CPA', match: ['CPA', 'cpa', '审计', '经济法'],
      goal: '完成 CPA 当前科目的学习、练习与错题复盘。',
      nextStep: '确定一个可以在今天推进的专题。',
      weeklyFocus: ['学习一个核心专题', '完成对应练习并订正', '整理本周错题'],
      steps: [['学习 CPA 当前专题', 25], ['完成一组 CPA 练习', 25], ['整理 CPA 错题', 15]]
    },
    {
      id: 'writing', name: '写作', area: '写作', projectName: '第五时', match: ['写作', '小说', '第五时', '章节', '字数'],
      goal: '稳定推进长篇作品，并留下可持续修改的阶段稿。',
      nextStep: '确定下一段的目标，先写下 300 字。',
      weeklyFocus: ['完成本周新增字数', '回读并标记结构问题', '整理下一章提纲'],
      steps: [['梳理下一段要写什么', 10], ['继续写作', 30], ['回读并标记修改处', 15]]
    }
  ]);
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
    rain: '<path d="M7.2 15.2c-2.1 0-3.7-1.5-3.7-3.5 0-1.8 1.3-3.2 3-3.5A5.7 5.7 0 0 1 17.2 7a4 4 0 0 1 .3 8.1H7.2zM8 18.2l-1 2M13 18.2l-1 2M18 18.2l-1 2"/>',
    music: '<path d="M9 18V7l10-2v11M9 10l10-2M6.5 21A2.5 2.5 0 1 0 6.5 16a2.5 2.5 0 0 0 0 5zM16.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>',
    volume: '<path d="M4 10h4l5-4v12l-5-4H4zM16 9a4.2 4.2 0 0 1 0 6M18.5 6.5a7.8 7.8 0 0 1 0 11"/>',
    muted: '<path d="M4 10h4l5-4v12l-5-4H4zM17 10l4 4M21 10l-4 4"/>',
    check: '<path d="m6 12 4 4 8-9"/>',
    heart: '<path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10A4.5 4.5 0 0 1 12 5.7a4.5 4.5 0 0 1 8 2.8z"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    download: '<path d="M12 4v10M8 10l4 4 4-4"/><path d="M5 18v2h14v-2"/>',
    upload: '<path d="M12 15V5M8 9l4-4 4 4"/><path d="M5 18v2h14v-2"/>',
    shield: '<path d="M12 3.5 19 6v5.7c0 4.2-2.7 7.2-7 8.8-4.3-1.6-7-4.6-7-8.8V6z"/><path d="m9 12 2 2 4-4"/>',
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
  const backupTimeLabel = (timestamp) => {
    if (!timestamp) return '时间未知';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '时间未知';
    return date.toLocaleString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  };
  const backupStats = (value) => ({
    tasks: Array.isArray(value?.tasks) ? value.tasks.length : 0,
    projects: Array.isArray(value?.projects) ? value.projects.length : 0,
    focus: Array.isArray(value?.focusSessions) ? value.focusSessions.length : 0,
    notes: Array.isArray(value?.notes) ? value.notes.length : 0,
    journalDays: value?.journal && typeof value.journal === 'object' && !Array.isArray(value.journal) ? Object.keys(value.journal).length : 0,
    memories: value?.monthlyMemories && typeof value.monthlyMemories === 'object' && !Array.isArray(value.monthlyMemories) ? Object.keys(value.monthlyMemories).length : 0
  });
  const inRange = (date, start, end) => date >= start && date <= end;
  const taskById = (id) => state().tasks.find((task) => task.id === id);
  const projectById = (id) => state().projects.find((project) => project.id === id);
  const planTrackById = (id) => PLAN_TRACKS.find((track) => track.id === id);
  const projectForTrack = (track) => {
    if (!track) return null;
    return state().projects.find((project) => project.name === track.projectName)
      || state().projects.find((project) => track.match.some((keyword) => project.name.toLowerCase().includes(keyword.toLowerCase())))
      || null;
  };
  const trackForText = (value) => {
    const text = String(value || '').toLowerCase();
    return PLAN_TRACKS.find((track) => track.match.some((keyword) => text.includes(keyword.toLowerCase()))) || null;
  };
  const rewardForMinutes = (minutes) => Core.clamp(Math.ceil((Number(minutes) || 25) / 5), 5, 20);

  function parseSmartTask(value) {
    const source = String(value || '').trim();
    let date = TODAY();
    if (/后天/.test(source)) date = Core.addDays(TODAY(), 2);
    else if (/明天|明晚/.test(source)) date = Core.addDays(TODAY(), 1);
    const explicitDate = /(\d{1,2})\s*月\s*(\d{1,2})\s*日?/.exec(source);
    if (explicitDate) {
      const now = new Date();
      const candidate = new Date(now.getFullYear(), Number(explicitDate[1]) - 1, Number(explicitDate[2]));
      if (candidate.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) candidate.setFullYear(candidate.getFullYear() + 1);
      date = Core.localDateKey(candidate);
    } else {
      const weekdayMatch = /(?:本周|下周|周)([一二三四五六日天])/.exec(source);
      if (weekdayMatch) {
        const targetDay = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 0, 天: 0 }[weekdayMatch[1]];
        const todayDay = Core.parseDateKey(TODAY()).getDay();
        let offset = (targetDay - todayDay + 7) % 7;
        if (source.includes('下周')) offset += 7;
        date = Core.addDays(TODAY(), offset);
      }
    }

    let minutes = 25;
    if (/半\s*(?:个)?小时/.test(source)) minutes = 30;
    else if (/一刻钟/.test(source)) minutes = 15;
    else {
      const hourMatch = /(\d+(?:\.\d+)?)\s*(?:个)?小时/.exec(source);
      const minuteMatch = /(\d{1,4})\s*(?:分钟|min)/i.exec(source);
      if (hourMatch) minutes = Math.round(Number(hourMatch[1]) * 60);
      else if (minuteMatch) minutes = Number(minuteMatch[1]);
    }
    minutes = Core.clamp(minutes, 1, 1440);

    const explicitProject = [...state().projects].sort((a, b) => b.name.length - a.name.length).find((project) => source.toLowerCase().includes(project.name.toLowerCase()));
    const track = trackForText(source);
    const project = explicitProject || projectForTrack(track);
    const area = project?.area || track?.area || (/运动|跳操|跑步|健身|拉伸/.test(source) ? '运动' : /工作|客户|底稿/.test(source) ? '工作' : /买|取|寄|生活/.test(source) ? '生活' : '学习');
    const priority = /重点|最重要|优先/.test(source);
    let title = source
      .replace(/\d{1,2}\s*月\s*\d{1,2}\s*日?/g, ' ')
      .replace(/今天|今晚|明天|明晚|后天|本周[一二三四五六日天]?|下周[一二三四五六日天]?|周[一二三四五六日天]/g, ' ')
      .replace(/(?:花|用|安排)?\s*\d+(?:\.\d+)?\s*(?:个)?小时/g, ' ')
      .replace(/(?:花|用|安排)?\s*\d{1,4}\s*(?:分钟|min)/gi, ' ')
      .replace(/半\s*(?:个)?小时|一刻钟/g, ' ')
      .replace(/重点|最重要|优先/g, ' ')
      .replace(/^[\s，,。；;！!]*(?:请)?(?:帮我)?(?:我)?(?:只有|有)?[\s，,。；;！!]*/g, '')
      .replace(/^(?:想要?|我要|需要|准备|计划|安排一下|安排|添加|记一下|做一下)/, '')
      .replace(/[，,。；;！!]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!title) title = track ? `推进${track.name}` : '新任务';
    return { title: title.slice(0, 100), area, minutes, reward: rewardForMinutes(minutes), priority, date, projectId: project?.id || null, trackId: track?.id || null };
  }

  function taskMatchesTrack(task, track) {
    const project = task.projectId ? projectById(task.projectId) : null;
    if (project && projectForTrack(track)?.id === project.id) return true;
    if (['english', 'podcast', 'writing'].includes(track.id) && task.area === track.area) return true;
    return track.match.some((keyword) => task.title.toLowerCase().includes(keyword.toLowerCase()));
  }

  function candidatesForTrack(track) {
    const project = projectForTrack(track);
    const existing = state().tasks
      .filter((task) => task.status === 'todo' && task.date <= TODAY() && taskMatchesTrack(task, track))
      .sort((a, b) => Number(b.priority) - Number(a.priority) || a.date.localeCompare(b.date) || a.createdAt - b.createdAt)
      .slice(0, 3)
      .map((task) => ({ title: task.title, minutes: task.minutes, area: task.area, trackId: track.id, projectId: task.projectId || project?.id || null, sourceTaskId: task.id, source: '已有任务' }));
    const suggestions = [project?.nextStep, ...(project?.weeklyFocus || [])]
      .filter(Boolean)
      .map((title) => ({ title, minutes: 25, area: track.area, trackId: track.id, projectId: project?.id || null, sourceTaskId: null, source: '项目下一步' }));
    track.steps.forEach(([title, minutes]) => suggestions.push({ title, minutes, area: track.area, trackId: track.id, projectId: project?.id || null, sourceTaskId: null, source: '计划方案' }));
    const seen = new Set();
    return [...existing, ...suggestions].filter((item) => {
      const key = item.title.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function allocatePlan(candidates, budget) {
    const count = budget < 25 ? 1 : budget < 50 ? 2 : Math.min(5, candidates.length);
    const selected = candidates.slice(0, Math.max(1, count));
    let remaining = budget;
    return selected.map((candidate, index) => {
      const rest = selected.length - index - 1;
      const available = Math.max(10, remaining - rest * 10);
      const proposed = Math.max(10, Math.min(Number(candidate.minutes) || 25, available));
      const minutes = index === selected.length - 1 ? Math.min(remaining, proposed) : Math.max(10, Math.floor(proposed / 5) * 5);
      remaining = Math.max(0, remaining - minutes);
      return { ...candidate, minutes };
    });
  }

  function generateDailyPlans(totalMinutes, energy, trackIds) {
    const tracks = trackIds.map(planTrackById).filter(Boolean);
    const queues = tracks.map((track) => candidatesForTrack(track));
    const candidates = [];
    const seenCandidates = new Set();
    const maxLength = Math.max(0, ...queues.map((queue) => queue.length));
    for (let round = 0; round < maxLength; round += 1) {
      queues.forEach((queue) => {
        const candidate = queue[round];
        if (!candidate) return;
        const key = candidate.sourceTaskId ? `task:${candidate.sourceTaskId}` : `suggestion:${candidate.trackId}:${candidate.title.toLowerCase()}`;
        if (seenCandidates.has(key)) return;
        seenCandidates.add(key);
        candidates.push(candidate);
      });
    }
    const total = Core.clamp(totalMinutes, 15, 240);
    const first = Math.min(total, energy === 'low' ? 15 : energy === 'high' ? 25 : 20);
    const ratio = energy === 'low' ? 0.5 : energy === 'high' ? 0.8 : 0.68;
    const middle = Math.min(total, Math.max(first + 5, Math.round(total * ratio / 5) * 5));
    const definitions = [
      { id: 'minimum', name: '保底版', note: '只守住今天最重要的一小步', budget: first },
      { id: 'balanced', name: '均衡版', note: '留出余量，也能看到推进', budget: middle },
      { id: 'complete', name: '完整版', note: '按现有时间完成一轮安排', budget: total }
    ];
    return definitions.map((definition) => {
      const items = allocatePlan(candidates, definition.budget);
      return { ...definition, items, focusMinutes: items.reduce((sum, item) => sum + item.minutes, 0) };
    });
  }

  function ensureTrackProject(trackId) {
    const track = planTrackById(trackId);
    if (!track) return null;
    const existing = projectForTrack(track);
    if (existing) return existing;
    const project = { id: Core.uid('project'), name: track.projectName, area: track.area, goal: track.goal, nextStep: track.nextStep, weeklyFocus: [...track.weeklyFocus], milestones: [], createdAt: Date.now() };
    state().projects.push(project);
    return project;
  }

  function addSmartTask(source) {
    const parsed = parseSmartTask(source);
    const trackProject = parsed.projectId ? null : ensureTrackProject(parsed.trackId);
    let priority = parsed.priority;
    const priorities = state().tasks.filter((task) => task.date === parsed.date && task.priority && task.status !== 'cancelled').length;
    let warning = '';
    if (priority && priorities >= 3) {
      priority = false;
      warning = ' · 当天重点已满，已放入普通任务';
    }
    const task = {
      id: Core.uid('task'),
      title: parsed.title,
      area: parsed.area,
      minutes: parsed.minutes,
      reward: parsed.reward,
      priority,
      status: 'todo',
      date: parsed.date,
      projectId: parsed.projectId || trackProject?.id || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      completedAt: null,
      rewardGranted: false,
      actualMinutes: 0,
      postponedCount: 0
    };
    state().tasks.push(task);
    state().planning.lastInput = String(source || '').trim().slice(0, 160);
    const when = parsed.date === TODAY() ? '今天' : parsed.date === Core.addDays(TODAY(), 1) ? '明天' : dateLabel(parsed.date);
    return { task, message: `已加入${when} · ${parsed.minutes} 分钟${warning}` };
  }

  function adoptDailyPlan(planId) {
    if (modal?.type !== 'planner' || modal.step !== 'results') return;
    const tracks = modal.tracks?.length ? modal.tracks : state().planning.lastTracks;
    const plans = generateDailyPlans(modal.minutes, modal.energy, tracks);
    const plan = plans.find((item) => item.id === planId);
    if (!plan?.items.length) return;
    const selectedSourceIds = new Set(plan.items.map((item) => item.sourceTaskId).filter(Boolean));
    let priorityCount = state().tasks.filter((task) => task.date === TODAY() && task.priority && task.status !== 'cancelled' && !selectedSourceIds.has(task.id)).length;
    const taskIds = [];
    plan.items.forEach((item) => {
      const trackProject = ensureTrackProject(item.trackId);
      const priority = priorityCount < 3;
      const values = {
        title: item.title,
        area: item.area,
        minutes: Core.clamp(item.minutes, 1, 1440),
        reward: rewardForMinutes(item.minutes),
        priority,
        date: TODAY(),
        projectId: item.projectId || trackProject?.id || null,
        updatedAt: Date.now()
      };
      const existing = item.sourceTaskId ? taskById(item.sourceTaskId) : state().tasks.find((task) => task.status === 'todo' && task.title.trim().toLowerCase() === item.title.trim().toLowerCase() && (!task.projectId || task.projectId === values.projectId));
      if (existing) Object.assign(existing, values, { status: 'todo', completedAt: null });
      else {
        const task = { id: Core.uid('task'), ...values, status: 'todo', createdAt: Date.now(), completedAt: null, rewardGranted: false, actualMinutes: 0, postponedCount: 0 };
        state().tasks.push(task);
        taskIds.push(task.id);
      }
      if (existing) taskIds.push(existing.id);
      if (priority) priorityCount += 1;
    });
    state().planning.defaultMinutes = Number(modal.minutes);
    state().planning.defaultEnergy = modal.energy;
    state().planning.lastTracks = [...tracks];
    state().planning.adoptedPlans.push({ id: Core.uid('plan'), date: TODAY(), style: plan.id, energy: modal.energy, taskIds, createdAt: Date.now() });
    state().planning.adoptedPlans = state().planning.adoptedPlans.slice(-60);
    focusDraftTaskId = taskIds[0] || '';
    state().ui.page = 'today';
    todaySection = 'tasks';
    modal = null;
    return saveAndRender('planner-adopt', `已采用${plan.name} · 安排 ${taskIds.length} 项`, false);
  }
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

  async function exportBackup() {
    try {
      const exportedAt = new Date().toISOString();
      const filename = `小小生长册-${Core.localDateKey()}-备份.json`;
      const payload = {
        app: 'little-growth-book',
        schemaVersion: 1,
        exportedAt,
        storageKey: Core.STORAGE_KEY,
        state: state()
      };
      const content = JSON.stringify(payload, null, 2);
      const blob = typeof File === 'function'
        ? new File([content], filename, { type: 'application/json' })
        : new Blob([content], { type: 'application/json' });

      if (typeof File === 'function' && typeof navigator.share === 'function' && navigator.canShare?.({ files: [blob] })) {
        try {
          await navigator.share({ title: '小小生长册备份', text: '保存这份备份，以后可以在收藏 → 纪念中恢复。', files: [blob] });
          announce('备份文件已交给系统保存');
          render({ preserveScroll: true });
          return;
        } catch (error) {
          if (error?.name === 'AbortError') return;
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      announce('备份文件已生成，请保存到自己的私密位置');
      render({ preserveScroll: true });
    } catch (error) {
      if (error?.name === 'AbortError') return;
      announce('备份生成失败，请稍后再试');
      render({ preserveScroll: true });
    }
  }

  async function prepareBackupImport(file) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      announce('备份文件过大，请选择小于 8 MB 的 JSON 文件');
      render({ preserveScroll: true });
      return;
    }
    try {
      const raw = typeof file.text === 'function'
        ? await file.text()
        : await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(reader.error);
          reader.readAsText(file);
        });
      const parsed = JSON.parse(raw);
      const candidate = parsed?.state && typeof parsed.state === 'object' ? parsed.state : parsed;
      const recognised = candidate && typeof candidate === 'object' && !Array.isArray(candidate) && (
        Array.isArray(candidate.projects)
        || Array.isArray(candidate.tasks)
        || Array.isArray(candidate.focusSessions)
        || Array.isArray(candidate.notes)
        || (candidate.journal && typeof candidate.journal === 'object')
        || (candidate.monthlyMemories && typeof candidate.monthlyMemories === 'object')
      );
      if (!recognised) throw new Error('unrecognised-backup');
      pendingBackupImport = {
        state: candidate,
        filename: String(file.name || '备份文件'),
        exportedAt: parsed?.exportedAt || candidate.updatedAt || candidate.createdAt || null,
        stats: backupStats(candidate)
      };
      openModal({ type: 'backup-import' });
    } catch (error) {
      pendingBackupImport = null;
      announce('没有识别出有效的小小生长册备份');
      render({ preserveScroll: true });
    }
  }

  function restorePendingBackup() {
    if (!pendingBackupImport?.state) return closeModal();
    const candidate = {
      ...pendingBackupImport.state,
      ui: {
        ...(pendingBackupImport.state.ui || {}),
        page: 'collection',
        collectionTab: 'memories'
      }
    };
    const restored = pendingBackupImport.stats;
    const result = Core.replace(candidate, 'backup-import');
    pendingBackupImport = null;
    modal = null;
    announce(result.persisted === false
      ? '备份已读取，但浏览器没有允许本地保存'
      : `备份已恢复 · ${restored.tasks} 个任务 · ${restored.notes} 篇笔记`);
    render({ preserveScroll: false });
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
    return `<aside class="sidebar" id="app-sidebar" aria-label="主导航">
      <div class="brand-row">
        <button type="button" class="brand" data-action="navigate" data-page="today" aria-label="回到今日">${icon('logo')}<span><b>小小生长册</b><small>Grow with You</small></span></button>
        <button type="button" class="collapse-button" data-action="sidebar-collapse" aria-label="${state().ui.sidebarCollapsed ? '展开侧栏' : '收起侧栏'}">${icon(state().ui.sidebarCollapsed ? 'next' : 'back')}</button>
      </div>
      <nav class="side-nav">${nav}</nav>
      <section class="sidebar-projects ${state().ui.projectsCollapsed ? 'closed' : ''}">
        <div class="projects-title"><button type="button" data-action="projects-collapse" aria-expanded="${!state().ui.projectsCollapsed}" aria-controls="sidebar-project-list">${icon('folder')}<span>项目</span>${icon('chevron', 'chevron')}</button><button type="button" class="project-add" data-action="project-new" aria-label="新建项目">${icon('plus')}</button></div>
        <div class="project-links" id="sidebar-project-list">${projects || emptyState('还没有项目')}</div>
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
      <button type="button" class="mobile-projects-button" data-action="drawer-open" aria-controls="app-sidebar" aria-expanded="${drawerOpen}">${icon('menu')}<span>项目</span></button>
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
      <nav class="today-section-tabs" role="tablist" aria-label="今日内容">${todaySections.map(([value, label]) => `<button type="button" id="today-tab-${value}" role="tab" data-action="today-section" data-value="${value}" aria-controls="today-panel-${value}" aria-selected="${todaySection === value}" tabindex="${todaySection === value ? '0' : '-1'}" class="${todaySection === value ? 'active' : ''}">${label}</button>`).join('')}</nav>
      <div class="today-section ${todaySection === 'tasks' ? 'active' : ''}" id="today-panel-tasks" role="tabpanel" aria-labelledby="today-tab-tasks" data-today-panel="tasks">
        <div class="today-lead-grid">
          <section class="surface priority-panel">
            ${sectionHead('今日重点', `${completedCount}/${todayTasks.length} 已完成`, `<button type="button" class="round-action" data-action="task-new" aria-label="添加重点任务">${icon('plus')}</button>`)}
            <div class="task-list">${priorities.length ? priorities.map((task) => taskRow(task)).join('') : emptyState('还没有重点任务', '添加今天最值得完成的一件事。', `<button type="button" class="text-button" data-action="task-new">添加重点</button>`)}</div>
          </section>
          <section class="next-panel">
            <span class="note-tab">接下来</span>
            <div><h2>${esc(nextTask?.title || '先选一件值得投入的事')}</h2><p>${nextTask ? `${esc(nextTask.area)} · ${nextTask.minutes} 分钟` : '新建任务后，这里会给出下一步。'}</p></div>
            ${nextTask ? `<button type="button" class="primary-button" data-action="focus-from-task" data-id="${attr(nextTask.id)}">${icon('focus')}开始专注</button>` : `<button type="button" class="primary-button" data-action="planner-open">${icon('today')}生成今日方案</button>`}
          </section>
        </div>
        <section class="smart-planning-bar" aria-label="快捷安排">
          <form data-form="smart-task-inline">${icon('logo')}<input name="text" maxlength="160" autocomplete="off" aria-label="一句话添加任务" placeholder="一句话添加：明晚 CPA 审计 45 分钟" required><button type="submit" aria-label="加入任务">${icon('arrow')}</button></form>
          <button type="button" class="plan-launch-button" data-action="planner-open">${icon('today')}<span><b>给我方案</b><small>按时间与状态安排</small></span>${icon('next')}</button>
        </section>
        <section class="plain-section ordinary-tasks">
          ${sectionHead('普通任务', '按领域查看')}
          <div class="segmented task-filters" role="group" aria-label="任务分类">${['全部', '学习', '工作', '生活', '自定义'].map((item) => `<button type="button" data-action="task-filter" data-value="${item}" class="${filter === item ? 'active' : ''}" aria-pressed="${filter === item}">${item}</button>`).join('')}</div>
          <div class="task-list bordered">${ordinary.length ? ordinary.map((task) => taskRow(task)).join('') : emptyState('这里还没有任务', filter === '全部' ? '用右下角的＋快速添加。' : `今天没有${filter}类任务。`)}</div>
        </section>
      </div>
      <div class="today-section ${todaySection === 'growth' ? 'active' : ''}" id="today-panel-growth" role="tabpanel" aria-labelledby="today-tab-growth" data-today-panel="growth">
        <div class="today-detail-grid">
          <section class="plain-section growth-panel">
            ${sectionHead('今日成长', '不比较，只记录', `<button type="button" class="text-button" data-action="growth-new">记录</button>`)}
            <div class="growth-list">${growth.map((item) => `<div class="growth-row"><span>${item.area}</span><div class="growth-track"><i style="width:${Math.min(100, item.value / item.goal * 100)}%;--area:${Core.AREA_META[item.area].color}"></i></div><b>${item.label}</b></div>`).join('')}</div>
          </section>
          <section class="plain-section timeline-panel">${sectionHead('今日轨迹', `${state().activity.filter((entry) => entry.date === TODAY()).length} 条真实记录`)}${activityTimeline()}</section>
        </div>
      </div>
      <div class="today-section ${todaySection === 'journal' ? 'active' : ''}" id="today-panel-journal" role="tabpanel" aria-labelledby="today-tab-journal" data-today-panel="journal">
        <div class="today-note-grid">
          <section class="journal-panel">
            ${sectionHead('一句话日记', '自动保存')}
            <textarea id="today-journal" rows="3" maxlength="240" placeholder="今天状态怎么样？">${esc(state().journal[TODAY()] || '')}</textarea>
            <span class="autosave-note" id="journal-status">输入后自动保存</span>
          </section>
          <section class="mood-panel">
            ${sectionHead('今日心情', '只做记录，不做诊断')}
            <div class="mood-options">${moods.map((mood) => `<button type="button" data-action="mood-set" data-value="${mood}" class="${state().mood[TODAY()] === mood ? 'active' : ''}" aria-pressed="${state().mood[TODAY()] === mood}">${faceIcon(mood)}<span>${mood}</span></button>`).join('')}</div>
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
      cells.push(`<button type="button" class="calendar-day ${date === TODAY() ? 'is-today' : ''} ${date === selected ? 'selected' : ''}" data-action="calendar-select" data-date="${date}" aria-pressed="${date === selected}"><b>${day}</b><span>${taskCount ? `${taskCount} 项` : ''}</span><i>${hasFocus ? '<em class="focus-dot"></em>' : ''}${hasMilestone ? '<em class="milestone-dot"></em>' : ''}</i></button>`);
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

  const FOCUS_AUDIO_VERSION = '2026.09-audio-fix';
  const FOCUS_AUDIO_TRACKS = Object.freeze({
    rain: { src: `assets/scenes/rain-window.mp3?v=${FOCUS_AUDIO_VERSION}`, label: '窗雨' },
    music: { src: `assets/scenes/star-rain.mp3?v=${FOCUS_AUDIO_VERSION}`, label: '星雨琴音' }
  });

  function stopRainScene() {
    if (rainAnimationFrame) cancelAnimationFrame(rainAnimationFrame);
    rainAnimationFrame = null;
    if (rainSceneCleanup) rainSceneCleanup();
    rainSceneCleanup = null;
  }

  function setupRainScene() {
    stopRainScene();
    const canvas = document.querySelector('[data-rain-canvas]');
    if (!canvas || /jsdom/i.test(navigator.userAgent)) return;
    let context;
    try { context = canvas.getContext('2d'); } catch (error) { return; }
    if (!context) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let drops = [];
    const resetDrop = (drop, initial = false) => {
      drop.x = Math.random() * (width + 100) + 30;
      drop.y = initial ? Math.random() * height : -Math.random() * 120 - 20;
      drop.length = 8 + Math.random() * 24;
      drop.speed = 2.4 + Math.random() * 4.8;
      drop.alpha = 0.12 + Math.random() * 0.28;
      drop.lineWidth = Math.random() > 0.86 ? 1.35 : 0.7;
      return drop;
    };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const active = state().timer?.status === 'running';
      const density = width < 560 ? (active ? 62 : 38) : (active ? 108 : 68);
      drops = Array.from({ length: density }, () => resetDrop({}, true));
    };
    const paint = () => {
      context.clearRect(0, 0, width, height);
      drops.forEach((drop) => {
        context.beginPath();
        context.moveTo(drop.x, drop.y);
        context.lineTo(drop.x - drop.length * 0.16, drop.y + drop.length);
        context.lineWidth = drop.lineWidth;
        context.lineCap = 'round';
        context.strokeStyle = `rgba(214, 229, 255, ${drop.alpha})`;
        context.stroke();
        if (!reduceMotion) {
          drop.y += drop.speed;
          drop.x -= drop.speed * 0.16;
          if (drop.y > height + drop.length || drop.x < -40) resetDrop(drop);
        }
      });
      if (!reduceMotion) rainAnimationFrame = requestAnimationFrame(paint);
    };
    resize();
    paint();
    window.addEventListener('resize', resize, { passive: true });
    rainSceneCleanup = () => window.removeEventListener('resize', resize);
  }

  function ensureFocusAudioMedia() {
    if (focusAudioMedia || typeof Audio !== 'function') return focusAudioMedia;
    focusAudioMedia = Object.fromEntries(Object.entries(FOCUS_AUDIO_TRACKS).map(([channel, track]) => {
      const element = new Audio(new URL(track.src, document.baseURI).href);
      element.loop = true;
      element.preload = 'auto';
      element.setAttribute('playsinline', '');
      element.setAttribute('webkit-playsinline', '');
      element.setAttribute('aria-hidden', 'true');
      element.dataset.focusAudio = channel;
      element.hidden = true;
      document.body.append(element);
      return [channel, element];
    }));
    return focusAudioMedia;
  }

  function focusMediaVolume(channel) {
    const value = Core.clamp(Number(state().focusSettings[`${channel}Volume`]) || 0, 0, 1);
    return value ? Math.pow(value, 0.65) : 0;
  }

  function applyFocusAudioLevels() {
    const media = ensureFocusAudioMedia();
    if (!media) return;
    ['rain', 'music'].forEach((channel) => {
      const enabled = state().focusSettings[`${channel}Enabled`];
      media[channel].muted = false;
      media[channel].volume = enabled ? focusMediaVolume(channel) : 0;
      if (!enabled && !media[channel].paused) media[channel].pause();
    });
  }

  function startFocusAudio() {
    const media = ensureFocusAudioMedia();
    if (!media) {
      focusAudioIssue = '当前浏览器不支持网页声音。';
      return Promise.resolve(false);
    }
    const channels = ['rain', 'music'].filter((channel) => state().focusSettings[`${channel}Enabled`] && focusMediaVolume(channel) > 0);
    if (!channels.length) {
      focusAudioIssue = state().focusSettings.rainEnabled || state().focusSettings.musicEnabled
        ? '声音音量为 0，请先把滑块调高。'
        : '请先开启窗雨或星雨琴音。';
      return Promise.resolve(false);
    }
    const requestEpoch = ++focusAudioEpoch;
    if (focusAudioFadeFrame) cancelAnimationFrame(focusAudioFadeFrame);
    focusAudioFadeFrame = null;
    focusAudioStarting = true;
    focusAudioIssue = '';
    applyFocusAudioLevels();
    const requested = channels.map((channel) => {
      try {
        const playback = media[channel].play();
        return playback && typeof playback.then === 'function' ? playback : Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    });
    ['rain', 'music'].filter((channel) => !channels.includes(channel)).forEach((channel) => media[channel].pause());
    const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 3500));
    return Promise.race([Promise.allSettled(requested), timeout]).then((results) => {
      if (requestEpoch !== focusAudioEpoch) return false;
      focusAudioStarting = false;
      const started = channels.some((channel) => !media[channel].paused);
      focusAudioPlaying = started;
      if (!started) {
        focusAudioIssue = '声音没有启动。请调高 iPhone 媒体音量，再点一次「开启」。';
        (results || []).filter((result) => result.status === 'rejected').forEach((result) => console.warn('小小生长册：专注音频播放被浏览器阻止。', result.reason));
      }
      return started;
    }).catch((error) => {
      if (requestEpoch === focusAudioEpoch) {
        focusAudioStarting = false;
        focusAudioPlaying = false;
        focusAudioIssue = '声音没有启动。请调高 iPhone 媒体音量，再点一次「开启」。';
      }
      console.warn('小小生长册：当前浏览器未能开启专注声音。', error);
      return false;
    });
  }

  function stopFocusAudio(immediate = false) {
    focusAudioPlaying = false;
    focusAudioStarting = false;
    focusAudioIssue = '';
    const stopEpoch = ++focusAudioEpoch;
    if (focusAudioFadeFrame) cancelAnimationFrame(focusAudioFadeFrame);
    focusAudioFadeFrame = null;
    const media = focusAudioMedia;
    if (!media) return;
    const channels = ['rain', 'music'].filter((channel) => !media[channel].paused);
    if (immediate || !channels.length) {
      channels.forEach((channel) => media[channel].pause());
      applyFocusAudioLevels();
      return;
    }
    const startedAt = performance.now();
    const startVolumes = Object.fromEntries(channels.map((channel) => [channel, media[channel].volume]));
    const fade = (now) => {
      if (stopEpoch !== focusAudioEpoch) return;
      const progress = Math.min(1, (now - startedAt) / 420);
      channels.forEach((channel) => { media[channel].volume = startVolumes[channel] * (1 - progress); });
      if (progress < 1) {
        focusAudioFadeFrame = requestAnimationFrame(fade);
        return;
      }
      focusAudioFadeFrame = null;
      channels.forEach((channel) => media[channel].pause());
      applyFocusAudioLevels();
    };
    focusAudioFadeFrame = requestAnimationFrame(fade);
  }

  function toggleFocusAudio() {
    if (focusAudioPlaying || focusAudioStarting) {
      stopFocusAudio();
      announce('专注氛围已关闭');
      render({ preserveScroll: true });
      return;
    }
    const soundAttempt = startFocusAudio();
    announce('正在开启雨夜氛围');
    render({ preserveScroll: true });
    soundAttempt.then((started) => {
      if (state().ui.page !== 'focus') return;
      announce(started ? '雨夜氛围已开启' : focusAudioIssue);
      render({ preserveScroll: true });
    });
  }

  function toggleFocusSound(channel) {
    if (!['rain', 'music'].includes(channel)) return;
    const settings = state().focusSettings;
    const key = `${channel}Enabled`;
    settings[key] = !settings[key];
    Core.save('focus-sound-toggle');
    const anyEnabled = settings.rainEnabled || settings.musicEnabled;
    let soundAttempt = null;
    if (!anyEnabled) {
      stopFocusAudio();
    } else if (focusAudioPlaying || focusAudioStarting) {
      soundAttempt = startFocusAudio();
    } else if (settings[key]) {
      soundAttempt = startFocusAudio();
    }
    announce(`${channel === 'rain' ? '窗雨' : '星雨琴音'}已${settings[key] ? '开启' : '关闭'}`);
    render({ preserveScroll: true });
    soundAttempt?.then((started) => {
      if (state().ui.page !== 'focus') return;
      if (!started) announce(focusAudioIssue);
      render({ preserveScroll: true });
    });
  }

  async function requestFocusWakeLock() {
    if (!('wakeLock' in navigator) || document.hidden || focusWakeLock) return;
    try {
      focusWakeLock = await navigator.wakeLock.request('screen');
      focusWakeLock.addEventListener('release', () => { focusWakeLock = null; }, { once: true });
    } catch (error) { /* Wake lock is an enhancement and may be unavailable in Low Power Mode. */ }
  }

  function releaseFocusWakeLock() {
    if (!focusWakeLock) return;
    focusWakeLock.release().catch(() => {});
    focusWakeLock = null;
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
    const settings = state().focusSettings;
    const audioSupported = typeof Audio === 'function';
    if (audioSupported) ensureFocusAudioMedia();
    const sessionState = timer?.status === 'running' ? '正在专注' : timer?.status === 'paused' ? '暂时停笔' : '准备开始';
    const soundState = focusAudioPlaying ? '氛围播放中' : focusAudioStarting ? '正在连接声音' : focusAudioIssue ? '声音没有启动' : timer?.status === 'running' ? '点按开启声音' : '轻触试听后开始';
    const soundHelp = focusAudioIssue || 'iPhone 首次使用请轻触「试听」；开始、继续也会同步开启声音。';
    return `<div class="page inner-page focus-page ${timer ? 'has-session' : ''} ${timer?.status === 'running' ? 'is-running' : ''}">
      ${pageHeader('FOCUS ROOM', '雨夜自习室', '把雨留在窗外，把这一刻留给自己。')}
      <section class="focus-room" aria-label="雨夜专注自习室">
        <div class="focus-scene">${img('assets/scenes/focus-night.webp', '银灰发青年在雨夜书桌前安静学习', 1586, 992, { className: 'focus-scene-image', eager: true })}<canvas class="rain-canvas" width="1586" height="992" data-rain-canvas aria-hidden="true"></canvas><div class="focus-scene-shade" aria-hidden="true"></div><div class="focus-weather">${icon('rain')}<span><b>窗外有雨</b><small>${timer?.status === 'running' ? '雨幕会陪你到这一轮结束' : '轻触开始，进入自习室'}</small></span><em>动态场景</em></div><div class="focus-scene-caption"><span>RAINY STUDY ROOM</span><p>暖灯、夜雨与安静的书桌。</p></div></div>
        <div class="timer-panel">
          <div class="focus-mode-status"><span><i></i>${sessionState}</span><small>${currentLabel || '先选好这一轮要完成的事'}</small></div>
          <div class="focus-fields"><label>当前任务<select id="focus-task" ${timer ? 'disabled' : ''}><option value="">自定义专注</option>${tasks.map((task) => `<option value="${attr(task.id)}" ${(timer?.taskId || focusDraftTaskId) === task.id ? 'selected' : ''}>${esc(task.title)}</option>`).join('')}</select></label><label>这一轮只做<input id="focus-label" maxlength="80" value="${attr(currentLabel)}" placeholder="例如：CPA 审计专题六" ${timer ? 'disabled' : ''}></label></div>
          <div class="timer-ring" style="--progress:${progress}" role="timer" aria-label="剩余时间 ${formatClock(remaining)}"><svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70"/><circle class="timer-progress" cx="80" cy="80" r="70" data-timer-ring/></svg><strong data-timer-clock>${formatClock(remaining)}</strong><span>${timer?.status === 'paused' ? '已暂停' : '保持此刻'}</span></div>
          <div class="duration-switch ${timer ? 'disabled' : ''}" aria-label="专注时长">${[25, 45, 60].map((minutes) => `<button type="button" data-action="focus-duration" data-value="${minutes}" class="${!timer && focusDuration === minutes || timer?.durationSeconds === minutes * 60 ? 'active' : ''}" aria-pressed="${!timer && focusDuration === minutes || timer?.durationSeconds === minutes * 60}" ${timer ? 'disabled' : ''}>${minutes}<small>分钟</small></button>`).join('')}</div>
          <div class="timer-actions">${!timer ? `<button type="button" class="primary-button" data-action="focus-start">${icon('play')}开始</button>` : timer.status === 'paused' ? `<button type="button" class="primary-button" data-action="focus-resume">${icon('play')}继续</button>` : `<button type="button" class="primary-button" data-action="focus-pause">${icon('pause')}暂停</button>`}<button type="button" class="secondary-button" data-action="focus-end" ${timer ? '' : 'disabled'}>${icon('stop')}结束</button></div>
          <section class="focus-soundscape" aria-label="专注氛围声音">
            <header><div><span>自习室声音</span><b>${soundState}</b></div><button type="button" class="sound-master ${focusAudioPlaying || focusAudioStarting ? 'active' : ''}" data-action="focus-audio-master" aria-pressed="${focusAudioPlaying || focusAudioStarting}" ${audioSupported ? '' : 'disabled'}>${icon(focusAudioPlaying ? 'muted' : 'volume')}<span>${focusAudioPlaying ? '关闭' : focusAudioStarting ? '连接中' : timer ? '开启' : '试听'}</span></button></header>
            <div class="sound-channels">
              <div class="sound-channel ${settings.rainEnabled ? 'enabled' : ''}"><button type="button" data-action="focus-sound-toggle" data-channel="rain" aria-pressed="${settings.rainEnabled}">${icon('rain')}<span><b>窗雨</b><small>柔和白噪音</small></span></button><label><span>雨声</span><input type="range" min="0" max="100" step="1" value="${Math.round(settings.rainVolume * 100)}" data-focus-volume="rain" aria-label="窗雨音量"><output data-focus-output="rain">${Math.round(settings.rainVolume * 100)}%</output></label></div>
              <div class="sound-channel ${settings.musicEnabled ? 'enabled' : ''}"><button type="button" data-action="focus-sound-toggle" data-channel="music" aria-pressed="${settings.musicEnabled}">${icon('music')}<span><b>星雨琴音</b><small>原创生成轻音乐</small></span></button><label><span>音乐</span><input type="range" min="0" max="100" step="1" value="${Math.round(settings.musicVolume * 100)}" data-focus-volume="music" aria-label="星雨琴音音量"><output data-focus-output="music">${Math.round(settings.musicVolume * 100)}%</output></label></div>
            </div>
            <p class="sound-help ${focusAudioIssue ? 'has-issue' : ''}" role="${focusAudioIssue ? 'alert' : 'note'}">${esc(soundHelp)}</p>
          </section>
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
        <div class="habit-rows">${state().habits.map((habit) => `<div class="habit-row"><span>${esc(habit.name)}</span>${dates.map((date) => `<button type="button" data-action="habit-toggle" data-id="${attr(habit.id)}" data-date="${date}" class="${habit.days?.[date] ? 'done' : ''}" aria-label="${attr(habit.name)} ${date}" aria-pressed="${Boolean(habit.days?.[date])}">${habit.days?.[date] ? icon('check') : ''}</button>`).join('')}<button type="button" class="habit-remove" data-action="habit-delete" data-id="${attr(habit.id)}" aria-label="删除 ${attr(habit.name)}">${icon('trash')}</button></div>`).join('')}</div>
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
    const hasWeeklyData = summary.tasks.length > 0
      || summary.focusMinutes > 0
      || summary.studyMinutes > 0
      || summary.exerciseCount > 0
      || summary.writingWords > 0
      || summary.podcastMinutes > 0;
    if (!hasWeeklyData) {
      return `<div class="page inner-page review-page">
        ${pageHeader('WEEKLY LETTER', '本周复盘', `${dateLabel(start)} — ${dateLabel(end)}`)}
        <section class="review-empty">${icon('review')}<div><h2>这一周还没有记录</h2><p>先安排一件真正想推进的事，完成后这里会自动长出本周总结。</p></div><button type="button" class="primary-button" data-action="planner-open">${icon('today')}安排本周第一步</button></section>
        <section class="review-writing review-writing-alone">${sectionHead('一句话复盘', '自动保存')}<textarea id="week-review" rows="4" maxlength="360" placeholder="即使没有完成，也可以写下这一周的感受。">${esc(review.note || '')}</textarea><span class="autosave-note" id="review-status">输入后自动保存</span></section>
      </div>`;
    }
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
      <section class="notes-list">${notes.length ? notes.map((note) => { const project = projectById(note.projectId); return `<article class="note-row" data-action="note-edit" data-id="${attr(note.id)}" role="button" tabindex="0" aria-label="编辑笔记 ${attr(note.title)}"><div><span>${new Date(note.updatedAt).toLocaleDateString('zh-CN')}${project ? ` · ${esc(project.name)}` : ''}</span><h2>${esc(note.title)}</h2><p>${esc(note.body || '空白笔记')}</p></div><button type="button" data-action="note-delete" data-id="${attr(note.id)}" aria-label="删除笔记">${icon('trash')}</button></article>`; }).join('') : emptyState('还没有笔记', '写下一段值得以后再读的内容。')}</section>
    </div>`;
  }

  function outfitCard(outfit) {
    const owned = state().collection.outfits.includes(outfit.id);
    const favorite = state().collection.favorites.includes(outfit.id);
    const featured = state().collection.featuredOutfitId === outfit.id;
    const imageAction = owned ? 'outfit-feature' : 'outfit-open';
    const imageLabel = featured ? `正在展示 ${outfit.name}` : owned ? `展示 ${outfit.name}` : `查看并解锁 ${outfit.name}`;
    return `<article class="outfit-card ${owned ? 'owned' : 'locked'} ${featured ? 'featured' : ''}">
      <button type="button" class="outfit-image" data-action="${imageAction}" data-id="${outfit.id}" aria-label="${attr(imageLabel)}" aria-pressed="${owned ? featured : 'false'}" ${featured ? 'disabled' : ''}>${img(outfit.image, `${outfit.name}限定卡面`, 853, 1844)}<span class="outfit-state">${featured ? `${icon('check')}当前展示` : owned ? `${icon('next')}点按展示` : `${icon('lock')}待解锁`}</span></button>
      <div class="outfit-card-copy"><span>${esc(outfit.series)}</span><h3>${esc(outfit.name)}</h3><p>${esc(outfit.palette)}</p><div>${owned ? `<b>已拥有</b>` : `<b>${icon('coin')}${outfit.price}</b>`}<span class="outfit-card-actions"><button type="button" class="outfit-details-button" data-action="outfit-open" data-id="${outfit.id}" aria-label="查看 ${attr(outfit.name)} 详情">详情</button><button type="button" data-action="outfit-favorite" data-id="${outfit.id}" class="${favorite ? 'active' : ''}" aria-label="${favorite ? '从喜欢中移除' : '加入喜欢'}" aria-pressed="${favorite}">${icon('heart')}</button></span></div></div>
    </article>`;
  }

  function wardrobeTab() {
    const filter = state().ui.wardrobeFilter;
    const featuredOutfit = Core.OUTFITS.find((outfit) => outfit.id === state().collection.featuredOutfitId) || Core.OUTFITS[0];
    const filtered = Core.OUTFITS.filter((outfit) => {
      if (filter === 'owned') return state().collection.outfits.includes(outfit.id);
      if (filter === 'favorite') return state().collection.favorites.includes(outfit.id);
      if (filter === 'all') return true;
      return outfit.release === filter;
    });
    return `<div class="wardrobe-tab">
      <section class="character-intro"><button type="button" class="character-featured" data-action="outfit-open" data-id="${featuredOutfit.id}" aria-label="查看当前展示卡面 ${attr(featuredOutfit.name)}">${img(featuredOutfit.image, `${featuredOutfit.name}当前展示卡面`, 853, 1844)}<span>${icon('check')}当前展示</span></button><div><span class="character-kicker">我的角色卡面</span><h2>${esc(featuredOutfit.name)}</h2><p>${esc(featuredOutfit.series)} · ${esc(featuredOutfit.hair)}<br>卡面会随主题改变服装、发型、配饰、动作与背景；解锁后可切换当前展示。</p><dl><div><dt>已收藏</dt><dd>${state().collection.outfits.length}/10</dd></div><div><dt>可用金币</dt><dd>${state().rewards.coins}</dd></div></dl><button type="button" class="text-button character-view-button" data-action="outfit-open" data-id="${featuredOutfit.id}">查看完整卡面${icon('next')}</button></div></section>
      <section class="outfit-shop">${sectionHead('限定卡面衣橱', '十套独立高清收藏')}
        <div class="segmented wardrobe-filters">${[['all', '全部'], ['new', '新品'], ['basic', '基础'], ['limited', '限定'], ['owned', '已拥有'], ['favorite', '喜欢']].map(([value, label]) => `<button type="button" data-action="wardrobe-filter" data-value="${value}" class="${filter === value ? 'active' : ''}" aria-pressed="${filter === value}">${label}</button>`).join('')}</div>
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
    const archiveStats = backupStats(state());
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
      <section class="monthly-editor"><div class="monthly-paper"><span class="month-ribbon">月度纪念</span><h2>${currentMonth.replace('-', ' · ')}</h2><div class="monthly-paper-grid"><div><div class="monthly-facts"><p><span>完成任务</span><b>${stats.completedTasks}</b></p><p><span>专注时间</span><b>${formatMinutes(stats.focusMinutes)}</b></p><p><span>成长领域</span><b>${esc(stats.growthArea)}</b></p></div><div class="paper-stickers">${stickerSlots(3, memoryStickers)}</div></div><figure class="monthly-character-card" data-monthly-outfit-preview>${img(selectedOutfit.image, `${selectedOutfit.name}本月角色卡面`, 853, 1844)}${selectedBadge ? `<span class="monthly-character-badge" title="${attr(selectedBadge.name)}">${img(selectedBadge.image, selectedBadge.name, 180, 180)}</span>` : ''}<figcaption>${esc(selectedOutfit.name)}</figcaption></figure></div></div>
        <form data-form="monthly"><div class="monthly-collection-fields"><label>本月角色卡面<select name="outfitId" aria-describedby="monthly-outfit-hint">${ownedOutfits.map((outfit) => `<option value="${attr(outfit.id)}" ${outfit.id === selectedOutfit.id ? 'selected' : ''}>${esc(outfit.name)}</option>`).join('')}</select><small id="monthly-outfit-hint">选择后，上方卡面会即时预览</small></label><label>本月徽章<select name="badgeId"><option value="">暂不放置</option>${ownedBadges.map((badge) => `<option value="${attr(badge.id)}" ${badge.id === selectedBadge?.id ? 'selected' : ''}>${esc(badge.name)}</option>`).join('')}</select></label></div><label>本月关键词<input name="keyword" maxlength="24" value="${attr(saved.keyword || '')}" placeholder="例如：稳定"></label><label>本月总结<textarea name="summary" rows="5" maxlength="480" placeholder="这个月，我想记住……">${esc(saved.summary || '')}</textarea></label><button type="submit" class="primary-button">保存本月纪念页</button></form>
      </section>
      <section class="scene-collection">${sectionHead('场景收藏', `${state().collection.scenes.length}/${Core.SCENES.length} 已拥有`)}<div>${Core.SCENES.map((scene) => { const owned = state().collection.scenes.includes(scene.id); return `<article class="scene-card ${owned ? '' : 'locked'}">${img(scene.image, scene.name, scene.id === 'today-desk' ? 1672 : 1586, scene.id === 'today-desk' ? 941 : 992)}<span>${owned ? esc(scene.name) : `${icon('lock')}待解锁`}</span></article>`; }).join('')}</div></section>
      <section class="history-months">${sectionHead('历史月份', `${months.length} 页永久保存`)}${months.length ? `<div>${historyCards}</div>` : emptyState('还没有月度纪念页', '保存这个月，第一本成长册就会出现。')}</section>
      <section class="data-vault">${sectionHead('数据保管', '为很多年后的自己留一份副本')}
        <div class="data-vault-row"><span class="data-vault-mark">${icon('shield')}</span><div class="data-vault-copy"><h3>这本成长册保存在当前设备</h3><p>最近保存 ${backupTimeLabel(state().updatedAt)} · ${archiveStats.tasks} 个任务 · ${archiveStats.notes} 篇笔记 · ${archiveStats.memories} 页月度纪念</p></div><div class="backup-actions"><button type="button" class="secondary-button" data-action="backup-export">${icon('download')}导出备份</button><button type="button" class="primary-button" data-action="backup-import-select">${icon('upload')}恢复备份</button><input id="backup-file-input" class="backup-file-input" type="file" accept=".json,application/json" data-backup-file aria-label="选择小小生长册备份文件"></div></div>
        <p class="backup-privacy">备份包含任务、日记与笔记，请只存放在自己的私密位置。恢复前会先展示文件内容摘要，不会直接覆盖。</p>
      </section>
    </div>`;
  }

  function collectionPage() {
    const tab = state().ui.collectionTab;
    const content = { wardrobe: wardrobeTab, stickers: stickersTab, badges: badgesTab, memories: memoriesTab }[tab]?.() || wardrobeTab();
    return `<div class="page inner-page collection-page">${pageHeader('ARCHIVE', '收藏', '衣橱、贴纸、徽章与每个月留下的纪念。')}<div class="collection-tabs" role="tablist">${[['wardrobe', '衣橱'], ['stickers', '贴纸'], ['badges', '徽章'], ['memories', '纪念']].map(([value, label]) => `<button type="button" id="collection-tab-${value}" role="tab" data-action="collection-tab" data-tab="${value}" aria-controls="collection-panel-${value}" aria-selected="${tab === value}" tabindex="${tab === value ? '0' : '-1'}" class="${tab === value ? 'active' : ''}">${label}</button>`).join('')}</div><div id="collection-panel-${tab}" role="tabpanel" aria-labelledby="collection-tab-${tab}">${content}</div></div>`;
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
    const actions = [['smart', 'logo', '一句话任务', '自动识别日期、时间与项目'], ['capture', 'inbox', '快速记录', '先放进收集箱'], ['focus', 'focus', '开始番茄', '直接进入专注室'], ['journal', 'note', '一句话日记', '留下今天的句子'], ['growth', 'growth', '成长记录', '学习、写作、运动或播客']];
    return modalFrame('快速添加', `<div class="quick-actions">${actions.map(([kind, iconName, title, description]) => `<button type="button" data-action="quick-choice" data-kind="${kind}"><span>${icon(iconName)}</span><b>${title}</b><small>${description}</small>${icon('next')}</button>`).join('')}</div>`, 'quick-modal');
  }

  function smartTaskModal() {
    const examples = ['今晚 CPA 审计 45 分钟 重点', '明天英语 20 分钟', '周六播客 30 分钟', '今晚税务师 30 分钟', '今晚写作 45 分钟'];
    return modalFrame('一句话添加', `<form data-form="smart-task"><label>把任务直接写成一句话<textarea id="smart-task-input" name="text" rows="3" maxlength="160" placeholder="例如：明晚 CPA 审计专题六 45 分钟" required autofocus></textarea></label><div class="smart-examples" aria-label="示例">${examples.map((example) => `<button type="button" data-action="smart-example" data-value="${attr(example)}">${esc(example)}</button>`).join('')}</div><div class="smart-preview" id="smart-task-preview"><span>${icon('logo')}</span><div><small>识别结果</small><strong>输入后会在这里确认</strong><p>日期、时间、领域与项目会自动判断，保存后仍可编辑。</p></div></div><footer><button type="button" class="secondary-button" data-action="modal-close">取消</button><button type="submit" class="primary-button">直接加入</button></footer></form>`);
  }

  function plannerModal() {
    const selectedTracks = modal.tracks?.length ? modal.tracks : (state().planning.lastTracks.length ? state().planning.lastTracks : PLAN_TRACKS.map((track) => track.id));
    const minutes = Number(modal.minutes || state().planning.defaultMinutes || 60);
    const energy = modal.energy || state().planning.defaultEnergy || 'steady';
    if (modal.step === 'results') {
      const plans = generateDailyPlans(minutes, energy, selectedTracks);
      const energyName = { low: '低电量', steady: '一般', high: '状态不错' }[energy];
      return modalFrame('三套今日方案', `<div class="planner-results"><div class="planner-summary"><span>${icon('today')}</span><p><b>${minutes} 分钟 · ${esc(energyName)}</b><small>${selectedTracks.map((id) => planTrackById(id)?.name).filter(Boolean).join(' · ')}</small></p><button type="button" data-action="planner-back">重新选择</button></div><div class="plan-options">${plans.map((plan) => `<article><header><div><span>${esc(plan.name)}</span><h3>${plan.focusMinutes} 分钟</h3></div><small>${esc(plan.note)}</small></header><ol>${plan.items.map((item) => `<li><i></i><div><b>${esc(item.title)}</b><span>${esc(planTrackById(item.trackId)?.name || item.area)} · ${item.minutes} 分钟 · ${esc(item.source)}</span></div></li>`).join('')}</ol><button type="button" class="primary-button" data-action="planner-adopt" data-plan="${plan.id}">采用这套方案</button></article>`).join('')}</div><p class="planner-footnote">采用后会直接进入今日任务；已有任务会移到今天，不会重复建立。</p></div>`, 'planner-modal');
    }
    return modalFrame('帮我安排今天', `<form data-form="planner-setup"><div class="planner-intro"><span>${icon('logo')}</span><div><b>不用自己拆任务</b><p>只选今天的时间、状态和想推进的内容。</p></div></div><fieldset class="choice-field"><legend>今天能留出多久？</legend><div class="choice-pills time-pills">${[30, 60, 90, 120].map((value) => `<label><input type="radio" name="minutes" value="${value}" ${minutes === value ? 'checked' : ''}><span>${value === 120 ? '2 小时' : `${value} 分钟`}</span></label>`).join('')}</div></fieldset><fieldset class="choice-field"><legend>今天的状态？</legend><div class="choice-pills energy-pills">${[['low', '低电量'], ['steady', '一般'], ['high', '状态不错']].map(([value, label]) => `<label><input type="radio" name="energy" value="${value}" ${energy === value ? 'checked' : ''}><span>${label}</span></label>`).join('')}</div></fieldset><fieldset class="choice-field"><legend>这次想安排哪些？</legend><div class="track-pills">${PLAN_TRACKS.map((track) => `<label><input type="checkbox" name="track" value="${track.id}" ${selectedTracks.includes(track.id) ? 'checked' : ''}><span>${esc(track.name)}</span></label>`).join('')}</div><small id="planner-selection-note">可以多选；时间不够时，方案会自动减少项目。</small></fieldset><footer><button type="button" class="secondary-button" data-action="modal-close">取消</button><button type="submit" class="primary-button">生成三套方案</button></footer></form>`, 'planner-modal');
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
    const templates = `<div class="project-template-picker"><div><b>${project ? '补全项目方案' : '从一个方案开始'}</b><small>${project ? '只补充空白项，不覆盖已经写好的内容。' : '点选后仍可自由修改。'}</small></div><div>${PLAN_TRACKS.map((track) => `<button type="button" data-action="project-template" data-template="${track.id}">${esc(track.name)}</button>`).join('')}</div><p id="project-template-status"></p></div>`;
    return modalFrame(project ? '编辑项目' : '新建项目', `<form data-form="project"><input type="hidden" name="id" value="${attr(project?.id || '')}">${templates}<div class="form-grid"><label>项目名称<input name="name" maxlength="40" value="${attr(project?.name || '')}" required autofocus></label><label>领域<select name="area">${areaOptions(project?.area || '学习')}</select></label><label class="wide">目标<input name="goal" maxlength="160" value="${attr(project?.goal || '')}" placeholder="这个章节最终想抵达哪里？"></label><label class="wide">下一步<input name="nextStep" maxlength="120" value="${attr(project?.nextStep || '')}" placeholder="足够小、可以立刻开始的一步"></label><label class="wide">本周重点（每行一项，最多 3 项）<textarea name="weeklyFocus" rows="3">${esc(focus)}</textarea></label><label class="wide">重要节点（日期 | 内容，每行一项）<textarea name="milestones" rows="4" placeholder="2026-09-15 | 完成专题六">${esc(milestones)}</textarea></label></div><footer><button type="button" class="secondary-button" data-action="modal-close">取消</button><button type="submit" class="primary-button">保存项目</button></footer></form>`);
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

  function backupImportModal() {
    if (!pendingBackupImport) return '';
    const details = pendingBackupImport.stats;
    return modalFrame('恢复前确认', `<div class="backup-preview"><div class="backup-preview-lead"><span>${icon('upload')}</span><div><small>${esc(pendingBackupImport.filename)}</small><h3>找到一份小小生长册</h3><p>${backupTimeLabel(pendingBackupImport.exportedAt)}</p></div></div><dl><div><dt>任务</dt><dd>${details.tasks}</dd></div><div><dt>项目</dt><dd>${details.projects}</dd></div><div><dt>专注记录</dt><dd>${details.focus}</dd></div><div><dt>笔记</dt><dd>${details.notes}</dd></div><div><dt>日记天数</dt><dd>${details.journalDays}</dd></div><div><dt>月度纪念</dt><dd>${details.memories}</dd></div></dl><p class="backup-warning">恢复会用这份备份替换当前设备里的成长册。若当前也有重要内容，请先导出一份。</p><footer class="backup-preview-actions"><button type="button" class="secondary-button" data-action="backup-export">${icon('download')}先备份当前内容</button><button type="button" class="secondary-button" data-action="modal-close">取消</button><button type="button" class="primary-button restore-button" data-action="backup-import-confirm">确认恢复</button></footer></div>`, 'backup-modal');
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
      smart: () => smartTaskModal(),
      planner: () => plannerModal(),
      task: () => taskModal(modal),
      capture: () => captureModal(),
      journal: () => journalModal(),
      growth: () => growthModal(),
      project: () => projectModal(modal.id ? projectById(modal.id) : null),
      'inbox-move': () => inboxMoveModal(modal.kind, modal.id),
      note: () => noteModal(modal.id ? state().notes.find((note) => note.id === modal.id) : null),
      habit: () => habitModal(),
      'backup-import': () => backupImportModal(),
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
    if (state().ui.page !== 'focus') {
      stopFocusAudio();
      releaseFocusWakeLock();
    }
    const scroll = options.preserveScroll ? window.scrollY : 0;
    app.innerHTML = shell();
    document.body.classList.toggle('modal-open', Boolean(modal));
    document.body.classList.toggle('drawer-open-body', drawerOpen);
    document.body.classList.toggle('focus-session-active', state().ui.page === 'focus' && state().timer?.status === 'running');
    const mobileLayout = window.matchMedia('(max-width: 900px)').matches;
    const renderedSidebar = document.querySelector('#app-sidebar');
    const renderedMain = document.querySelector('.main-shell');
    const renderedFab = document.querySelector('.global-fab');
    if (mobileLayout && renderedSidebar) {
      renderedSidebar.inert = !drawerOpen;
      renderedSidebar.setAttribute('aria-hidden', String(!drawerOpen));
      if (renderedMain) renderedMain.inert = drawerOpen;
      if (renderedFab) renderedFab.inert = drawerOpen;
    }
    document.querySelectorAll('[data-safe-image]').forEach((image) => image.addEventListener('error', () => image.parentElement?.classList.add('image-error'), { once: true }));
    if (options.preserveScroll) window.scrollTo(0, scroll);
    if (modal) requestAnimationFrame(() => (document.querySelector('.modal-card [autofocus]') || document.querySelector('.modal-card > header button'))?.focus());
    else if (options.focusSelector) requestAnimationFrame(() => document.querySelector(options.focusSelector)?.focus());
    if (toastMessage) {
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toastMessage = '';
        document.querySelector('.toast')?.classList.remove('show');
      }, 2600);
    }
    if (state().ui.page === 'focus') setupRainScene();
    else stopRainScene();
    syncTimerView();
  }

  function openModal(next) {
    modal = next;
    render({ preserveScroll: true });
  }

  function closeModal() {
    if (modal?.type === 'backup-import') pendingBackupImport = null;
    modal = null;
    render({ preserveScroll: true });
  }

  function navigate(page) {
    if (state().ui.page === 'focus' && page !== 'focus') {
      stopFocusAudio();
      releaseFocusWakeLock();
    }
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
    const soundAttempt = startFocusAudio();
    void requestFocusWakeLock();
    saveAndRender('focus-start', '专注开始 · 雨夜自习室已进入');
    soundAttempt.then((started) => {
      if (state().ui.page !== 'focus' || state().timer?.status !== 'running') return;
      announce(started ? '雨夜声音已开启' : focusAudioIssue);
      render({ preserveScroll: true });
    });
  }

  function pauseFocus() {
    const timer = state().timer;
    if (!timer || timer.status !== 'running') return;
    timer.remainingSeconds = remainingSeconds(timer);
    timer.status = 'paused';
    timer.lastStartedAt = null;
    stopFocusAudio();
    releaseFocusWakeLock();
    saveAndRender('focus-pause', '已暂停');
  }

  function resumeFocus() {
    const timer = state().timer;
    if (!timer || timer.status !== 'paused') return;
    timer.status = 'running';
    timer.lastStartedAt = Date.now();
    const soundAttempt = startFocusAudio();
    void requestFocusWakeLock();
    saveAndRender('focus-resume', '继续专注');
    soundAttempt.then((started) => {
      if (state().ui.page !== 'focus' || state().timer?.status !== 'running') return;
      announce(started ? '雨夜声音已恢复' : focusAudioIssue);
      render({ preserveScroll: true });
    });
  }

  function finishFocus(completedByTimer = false) {
    if (timerFinishing) return;
    const timer = state().timer;
    if (!timer) return;
    timerFinishing = true;
    stopFocusAudio();
    releaseFocusWakeLock();
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

  function updateSmartTaskPreview(value) {
    const preview = document.querySelector('#smart-task-preview');
    if (!preview) return;
    const title = preview.querySelector('strong');
    const detail = preview.querySelector('p');
    const source = String(value || '').trim();
    if (!source) {
      if (title) title.textContent = '输入后会在这里确认';
      if (detail) detail.textContent = '日期、时间、领域与项目会自动判断，保存后仍可编辑。';
      return;
    }
    const parsed = parseSmartTask(source);
    const project = projectById(parsed.projectId);
    const when = parsed.date === TODAY() ? '今天' : parsed.date === Core.addDays(TODAY(), 1) ? '明天' : dateLabel(parsed.date);
    if (title) title.textContent = parsed.title;
    if (detail) detail.textContent = [when, parsed.area, `${parsed.minutes} 分钟`, project?.name, parsed.priority ? '今日重点' : '普通任务'].filter(Boolean).join(' · ');
  }

  app.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (action === 'navigate') return navigate(target.dataset.page);
    if (action === 'sidebar-collapse') {
      if (window.matchMedia('(max-width: 900px)').matches) { drawerOpen = false; return render({ preserveScroll: true, focusSelector: '.mobile-projects-button' }); }
      state().ui.sidebarCollapsed = !state().ui.sidebarCollapsed;
      return saveAndRender('sidebar');
    }
    if (action === 'projects-collapse') { state().ui.projectsCollapsed = !state().ui.projectsCollapsed; return saveAndRender('projects-collapse'); }
    if (action === 'drawer-open') { drawerOpen = true; state().ui.sidebarCollapsed = false; return render({ preserveScroll: true, focusSelector: '.sidebar .collapse-button' }); }
    if (action === 'drawer-close') { drawerOpen = false; return render({ preserveScroll: true, focusSelector: '.mobile-projects-button' }); }
    if (action === 'quick-open') return openModal({ type: 'quick' });
    if (action === 'modal-close' || action === 'modal-backdrop' && target === event.target) return closeModal();
    if (action === 'planner-open') return openModal({ type: 'planner', step: 'setup' });
    if (action === 'planner-back') { modal = { ...modal, step: 'setup' }; return render({ preserveScroll: true }); }
    if (action === 'planner-adopt') return adoptDailyPlan(target.dataset.plan);
    if (action === 'smart-example') {
      const input = document.querySelector('#smart-task-input');
      if (!input) return;
      input.value = target.dataset.value || '';
      input.focus();
      return updateSmartTaskPreview(input.value);
    }
    if (action === 'project-template') {
      const track = planTrackById(target.dataset.template);
      const form = target.closest('form');
      if (!track || !form) return;
      const isNew = !form.elements.id?.value;
      const fill = (name, value) => { const field = form.elements[name]; if (field && (isNew || !String(field.value || '').trim())) field.value = value; };
      fill('name', track.projectName);
      fill('goal', track.goal);
      fill('nextStep', track.nextStep);
      fill('weeklyFocus', track.weeklyFocus.join('\n'));
      if (isNew && form.elements.area) form.elements.area.value = track.area;
      const status = document.querySelector('#project-template-status');
      if (status) status.textContent = `已套用${track.name}方案，可以继续修改。`;
      return;
    }
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
    if (action === 'focus-audio-master') return toggleFocusAudio();
    if (action === 'focus-sound-toggle') return toggleFocusSound(target.dataset.channel);
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
    if (action === 'backup-export') { void exportBackup(); return; }
    if (action === 'backup-import-select') { document.querySelector('#backup-file-input')?.click(); return; }
    if (action === 'backup-import-confirm') return restorePendingBackup();
    if (action === 'wardrobe-filter') { state().ui.wardrobeFilter = target.dataset.value; return saveAndRender('wardrobe-filter'); }
    if (action === 'outfit-open') return openModal({ type: 'outfit', id });
    if (action === 'outfit-favorite') {
      const favorites = state().collection.favorites;
      const index = favorites.indexOf(id);
      if (index >= 0) favorites.splice(index, 1); else favorites.push(id);
      return saveAndRender('favorite', index >= 0 ? '已从喜欢中移除' : '已加入喜欢');
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
    if (form.dataset.form === 'smart-task-inline' || form.dataset.form === 'smart-task') {
      const source = String(data.text || '').trim();
      if (!source) return;
      const result = addSmartTask(source);
      modal = null;
      return saveAndRender('smart-task-add', result.message);
    }
    if (form.dataset.form === 'planner-setup') {
      const formData = new FormData(form);
      const minutes = Number(formData.get('minutes'));
      const energy = String(formData.get('energy') || 'steady');
      const tracks = formData.getAll('track').map(String).filter((id) => planTrackById(id));
      if (!tracks.length) {
        const note = form.querySelector('#planner-selection-note');
        if (note) {
          note.textContent = '请至少选择一项想推进的内容。';
          note.classList.add('form-error');
        }
        return;
      }
      state().planning.defaultMinutes = [30, 60, 90, 120].includes(minutes) ? minutes : 60;
      state().planning.defaultEnergy = ['low', 'steady', 'high'].includes(energy) ? energy : 'steady';
      state().planning.lastTracks = tracks;
      Core.save('planner-preferences');
      modal = { type: 'planner', step: 'results', minutes: state().planning.defaultMinutes, energy: state().planning.defaultEnergy, tracks };
      return render({ preserveScroll: true });
    }
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
    if (event.target.matches('[data-focus-volume]')) {
      const channel = event.target.dataset.focusVolume;
      if (!['rain', 'music'].includes(channel)) return;
      const volume = Core.clamp(Number(event.target.value) / 100, 0, 1);
      state().focusSettings[`${channel}Volume`] = volume;
      const output = document.querySelector(`[data-focus-output="${channel}"]`);
      if (output) output.textContent = `${Math.round(volume * 100)}%`;
      applyFocusAudioLevels();
      Core.save('focus-volume');
      return;
    }
    if (event.target.id === 'smart-task-input') {
      updateSmartTaskPreview(event.target.value);
      return;
    }
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

  app.addEventListener('change', async (event) => {
    if (event.target.matches('[data-backup-file]')) {
      const [file] = event.target.files || [];
      await prepareBackupImport(file);
      return;
    }
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

  const focusableElements = (container) => container
    ? [...container.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), summary, [href], [tabindex]:not([tabindex="-1"])')].filter((element) => !element.closest('[inert]'))
    : [];
  const trapFocus = (container, event) => {
    const elements = focusableElements(container);
    if (!elements.length) return;
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  document.addEventListener('keydown', (event) => {
    const tab = event.target.closest?.('[role="tab"]');
    if (tab && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
      const offset = event.key === 'ArrowRight' ? 1 : -1;
      const next = tabs[(tabs.indexOf(tab) + offset + tabs.length) % tabs.length];
      event.preventDefault();
      next.focus();
      next.click();
      return;
    }
    const note = event.target.closest?.('.note-row[role="button"]');
    if (note && event.target === note && ['Enter', ' '].includes(event.key)) {
      event.preventDefault();
      note.click();
      return;
    }
    if (event.key === 'Tab' && modal) { trapFocus(document.querySelector('.modal-card'), event); return; }
    if (event.key === 'Tab' && drawerOpen && window.matchMedia('(max-width: 900px)').matches) { trapFocus(document.querySelector('.sidebar'), event); return; }
    if (event.key !== 'Escape') return;
    if (modal) closeModal();
    else if (drawerOpen) { drawerOpen = false; render({ preserveScroll: true, focusSelector: '.mobile-projects-button' }); }
    else if (searchQuery) { searchQuery = ''; render({ preserveScroll: true }); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    syncTimerView();
    if (state().ui.page === 'focus' && state().timer?.status === 'running') {
      void requestFocusWakeLock();
      const enabledChannels = ['rain', 'music'].filter((channel) => state().focusSettings[`${channel}Enabled`]);
      const interrupted = focusAudioPlaying && focusAudioMedia && enabledChannels.every((channel) => focusAudioMedia[channel].paused);
      if (interrupted) {
        focusAudioPlaying = false;
        focusAudioIssue = '声音已被 iPhone 暂停，请点「开启」恢复。';
        announce(focusAudioIssue);
        render({ preserveScroll: true });
      }
    }
  });

  render();
  timerLoop = setInterval(syncTimerView, 250);
})();
