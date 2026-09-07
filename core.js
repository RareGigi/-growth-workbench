(() => {
  'use strict';

  const STORAGE_KEY = 'growth-journal-v1';
  const LEGACY_KEYS = [
    'grow-with-you-blue-v2',
    'grow-with-you-blue-v1',
    'little-growth-book-rebuild-v2',
    'little-growth-book-rebuild-v1',
    'growth-journal-v2',
    'starGrowthCabin-v2'
  ];

  const OUTFITS = Object.freeze([
    { id: 'daily-daylight', name: '昼光信笺', series: '日常限定', image: 'assets/outfits/daily-daylight.webp', price: 0, release: 'basic', hair: '日光碎银', accessories: '星形耳扣 · 银表 · 信笺吊坠', palette: '雾灰 / 象牙白 / 淡蓝' },
    { id: 'academy-rabbit', name: '绒兔秘约', series: '学院限定', image: 'assets/outfits/academy-rabbit.webp', price: 160, release: 'basic', hair: '暮色侧分', accessories: '银框眼镜 · 星轨胸针 · 怀表链', palette: '午夜蓝 / 暖木 / 珍珠灰' },
    { id: 'home-reading', name: '午后静读', series: '居家限定', image: 'assets/outfits/home-reading.webp', price: 140, release: 'basic', hair: '柔软帘发', accessories: '阅读镜 · 星芒书签 · 针织披毯', palette: '燕麦 / 雨蓝 / 奶油白' },
    { id: 'summer-seabreeze', name: '海风絮语', series: '夏日限定', image: 'assets/outfits/summer-seabreeze.webp', price: 220, release: 'new', hair: '海风短发', accessories: '蓝晶耳扣 · 罗盘项链 · 墨镜', palette: '海盐白 / 晴空蓝 / 鼠尾草' },
    { id: 'ancient-starlake', name: '云汉长明', series: '古风限定', image: 'assets/outfits/ancient-starlake.webp', price: 360, release: 'limited', hair: '银冠半束', accessories: '星冠 · 玉耳扣 · 月纹折扇', palette: '月白 / 淡蓝紫 / 银' },
    { id: 'valentine-rose', name: '蔷薇密约', series: '情人节限定', image: 'assets/outfits/valentine-rose.webp', price: 320, release: 'limited', hair: '蔷薇侧梳', accessories: '石榴耳钉 · 蔷薇胸针 · 礼服手套', palette: '午夜蓝 / 雾粉 / 银红' },
    { id: 'anniversary-orbit', name: '星轨誓约', series: '周年限定', image: 'assets/outfits/anniversary-orbit.webp', price: 420, release: 'limited', hair: '星穹背梳', accessories: '星芒胸针 · 蓝宝耳钉 · 周年缎带', palette: '珍珠白 / 星河蓝 / 香槟金' },
    { id: 'radiant-rite', name: '逐光礼赞', series: '辉光典藏', image: 'assets/outfits/radiant-rite.webp', price: 480, release: 'limited', hair: '逐光银羽', accessories: '光环额饰 · 棱晶胸针 · 仪典光杖', palette: '象牙白 / 晨光金 / 棱镜蓝' },
    { id: 'midnight-crown', name: '星夜加冕', series: '暗夜典藏', image: 'assets/outfits/midnight-crown.webp', price: 520, release: 'limited', hair: '夜风长层', accessories: '星环 · 蓝晶耳链 · 天体权杖', palette: '深空蓝 / 冷银 / 紫晶' },
    { id: 'festival-fireworks', name: '烟火来信', series: '节日限定', image: 'assets/outfits/festival-fireworks.webp', price: 280, release: 'new', hair: '焰尾束线', accessories: '烟火胸针 · 玉耳扣 · 火花信封', palette: '墨蓝 / 暖灰 / 暗绯' }
  ]);

  const SCENES = Object.freeze([
    { id: 'today-desk', name: '晨光书桌', image: 'assets/scenes/today-desk.webp' },
    { id: 'focus-night', name: '静夜专注', image: 'assets/scenes/focus-night.webp' },
    { id: 'cafe-afternoon', name: '午后咖啡馆', image: 'assets/scenes/cafe-afternoon.webp' },
    { id: 'garden-morning', name: '晨雾花园', image: 'assets/scenes/garden-morning.webp' }
  ]);

  const STICKERS = Object.freeze([
    { id: 'moon', name: '晚安月亮', image: 'assets/stickers/moon.svg', hint: '完成一句话日记' },
    { id: 'star', name: '第一颗星', image: 'assets/stickers/star.svg', hint: '完成第一件任务' },
    { id: 'flower', name: '慢慢开花', image: 'assets/stickers/flower.svg', hint: '累计完成 5 件任务' },
    { id: 'cat', name: '陪伴小猫', image: 'assets/stickers/cat.svg', hint: '记录 3 天心情' },
    { id: 'rabbit', name: '专注白兔', image: 'assets/stickers/rabbit.svg', hint: '完成第一次专注' },
    { id: 'coffee', name: '咖啡时间', image: 'assets/stickers/coffee.svg', hint: '累计专注 2 小时' },
    { id: 'book', name: '读完一页', image: 'assets/stickers/book.svg', hint: '完成学习任务' },
    { id: 'headphones', name: '听见世界', image: 'assets/stickers/headphones.svg', hint: '记录一次播客' },
    { id: 'plant', name: '今日新芽', image: 'assets/stickers/plant.svg', hint: '完成一次习惯记录' },
    { id: 'tape', name: '蓝紫纸胶带', image: 'assets/stickers/tape.svg', hint: '写下第一篇笔记' },
    { id: 'note', name: '轻轻记下', image: 'assets/stickers/note.svg', hint: '整理一条收集箱' },
    { id: 'pencil', name: '写作铅笔', image: 'assets/stickers/pencil.svg', hint: '记录一次写作' },
    { id: 'cloud', name: '休息云朵', image: 'assets/stickers/cloud.svg', hint: '记录疲惫心情' },
    { id: 'planet', name: '环游小星球', image: 'assets/stickers/planet.svg', hint: '保存第一张月度手账' },
    { id: 'study-seal', name: '学习章', image: 'assets/stickers/study-seal.svg', hint: '累计学习 5 小时' },
    { id: 'writing-seal', name: '写作章', image: 'assets/stickers/writing-seal.svg', hint: '累计写作 5,000 字' },
    { id: 'sport-seal', name: '运动章', image: 'assets/stickers/sport-seal.svg', hint: '完成 5 次运动记录' }
  ]);

  const BADGES = Object.freeze([
    { id: 'first-focus', name: '第一次专注', image: 'assets/badges/first-focus.svg', hint: '完成第一次专注', hidden: false },
    { id: 'focus-10h', name: '专注 10 小时', image: 'assets/badges/focus-10h.svg', hint: '累计专注 600 分钟', hidden: false },
    { id: 'seven-days', name: '连续记录 7 天', image: 'assets/badges/seven-days.svg', hint: '连续七天留下记录', hidden: false },
    { id: 'first-memory', name: '第一本成长册', image: 'assets/badges/first-memory.svg', hint: '保存第一张月度手账', hidden: false },
    { id: 'novel-50k', name: '小说 5 万字', image: 'assets/badges/novel-50k.svg', hint: '一个会自己出现的成就', hidden: true },
    { id: 'project-chapter', name: '完成重要章节', image: 'assets/badges/project-chapter.svg', hint: '完成一个项目节点', hidden: true }
  ]);

  const AREA_META = Object.freeze({
    学习: { color: '#718bd1', unit: '分钟' },
    工作: { color: '#7d82bc', unit: '分钟' },
    生活: { color: '#d0969e', unit: '件' },
    写作: { color: '#8d7dcc', unit: '字' },
    运动: { color: '#6ca98f', unit: '分钟' },
    英语: { color: '#6f9eb9', unit: '分钟' },
    播客: { color: '#c38f73', unit: '分钟' }
  });

  const localDateKey = (value = new Date()) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return localDateKey(new Date());
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  };
  const monthKey = (value = new Date()) => localDateKey(value).slice(0, 7);
  const parseDateKey = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return new Date();
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  };
  const addDays = (dateKey, amount) => {
    const date = parseDateKey(dateKey);
    date.setDate(date.getDate() + amount);
    return localDateKey(date);
  };
  const startOfWeek = (value = new Date()) => {
    const date = value instanceof Date ? new Date(value) : parseDateKey(value);
    const offset = (date.getDay() + 6) % 7;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    return localDateKey(date);
  };
  const endOfWeek = (value = new Date()) => addDays(startOfWeek(value), 6);
  const clamp = (number, minimum, maximum) => Math.min(maximum, Math.max(minimum, Number(number) || 0));
  const uid = (prefix = 'item') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const starterProjects = () => [
    { id: 'cpa', name: 'CPA', area: '学习', goal: '通过审计与经济法。', nextStep: '', weeklyFocus: [], milestones: [], createdAt: Date.now() },
    { id: 'fifth-hour', name: '第五时', area: '写作', goal: '完成原创长篇《第五时》。', nextStep: '', weeklyFocus: [], milestones: [], createdAt: Date.now() },
    { id: 'career', name: '工作成长', area: '工作', goal: '稳定积累职业能力。', nextStep: '', weeklyFocus: [], milestones: [], createdAt: Date.now() },
    { id: 'body', name: '身体计划', area: '运动', goal: '建立长期稳定的运动记录。', nextStep: '', weeklyFocus: [], milestones: [], createdAt: Date.now() }
  ];
  const starterHabits = () => [
    { id: 'water', name: '喝水', days: {} },
    { id: 'english', name: '英语', days: {} },
    { id: 'exercise', name: '运动', days: {} },
    { id: 'read', name: '阅读', days: {} },
    { id: 'sleep', name: '早睡', days: {} }
  ];

  const defaultState = () => ({
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ui: { page: 'today', sidebarCollapsed: false, projectsCollapsed: false, selectedProjectId: 'cpa', taskFilter: '全部', collectionTab: 'wardrobe', wardrobeFilter: 'all', calendarCursor: monthKey(), selectedDate: localDateKey() },
    tasks: [],
    projects: starterProjects(),
    inbox: [],
    focusSessions: [],
    timer: null,
    habits: starterHabits(),
    mood: {},
    journal: {},
    growthRecords: [],
    activity: [],
    notes: [],
    weeklyReviews: {},
    rewards: { stars: 0, coins: 0 },
    collection: { outfits: ['daily-daylight'], stickers: [], badges: [], scenes: ['today-desk', 'focus-night'], favorites: [] },
    monthlyMemories: {}
  });

  const safeParse = (raw) => {
    if (!raw) return null;
    try {
      const value = JSON.parse(raw);
      return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
    } catch (error) {
      console.warn('小小生长册：忽略了损坏的本地数据。', error);
      return null;
    }
  };
  const readKey = (key) => {
    try { return safeParse(localStorage.getItem(key)); }
    catch (error) { console.warn('小小生长册：无法读取本地数据。', error); return null; }
  };

  const normaliseTask = (task, dateHint, projectNameToId) => {
    if (!task || typeof task !== 'object') return null;
    const title = String(task.title || task.text || '').trim();
    if (!title) return null;
    const completed = Boolean(task.done || task.completed || task.status === 'done');
    const cancelled = Boolean(task.cancelled || task.status === 'cancelled');
    return {
      id: String(task.id || uid('task')),
      title,
      area: AREA_META[task.area] ? task.area : '生活',
      minutes: clamp(task.minutes ?? task.mins ?? task.estimate ?? 25, 1, 1440),
      reward: clamp(task.reward ?? 10, 0, 999),
      priority: Boolean(task.priority || task.focus),
      status: cancelled ? 'cancelled' : completed ? 'done' : 'todo',
      date: /^\d{4}-\d{2}-\d{2}$/.test(task.date || dateHint || '') ? (task.date || dateHint) : localDateKey(),
      projectId: task.projectId || projectNameToId.get(task.project || task.plan || '') || null,
      createdAt: Number(task.createdAt || task.ts || Date.now()),
      updatedAt: Number(task.updatedAt || task.ts || Date.now()),
      completedAt: completed ? Number(task.completedAt || task.doneAt || task.ts || Date.now()) : null,
      rewardGranted: completed ? true : Boolean(task.rewardGranted),
      actualMinutes: clamp(task.actualMinutes ?? 0, 0, 1440),
      postponedCount: clamp(task.postponedCount ?? 0, 0, 999)
    };
  };

  const migrateLegacy = (legacy) => {
    const next = defaultState();
    if (!legacy) return next;
    const legacyPageMap = { plans: 'project', journal: 'collection' };
    const requestedPage = legacyPageMap[legacy.page] || legacy.page;
    if (['today', 'inbox', 'project', 'calendar', 'focus', 'habits', 'review', 'notes', 'collection'].includes(requestedPage)) next.ui.page = requestedPage;
    next.ui.sidebarCollapsed = Boolean(legacy.collapsed);
    next.ui.projectsCollapsed = Boolean(legacy.projectsCollapsed);
    const plans = Array.isArray(legacy.projects) ? legacy.projects : Array.isArray(legacy.plans) ? legacy.plans : [];
    if (plans.length) {
      next.projects = plans.map((plan, index) => ({
        id: String(plan.id || `project-${index + 1}-${String(plan.name || '').toLowerCase().replace(/\s+/g, '-')}`),
        name: String(plan.name || `项目 ${index + 1}`),
        area: AREA_META[plan.area] ? plan.area : '学习',
        goal: String(plan.goal || ''),
        nextStep: String(plan.nextStep || plan.target || ''),
        weeklyFocus: Array.isArray(plan.weeklyFocus) ? plan.weeklyFocus.slice(0, 3).map(String) : [],
        milestones: Array.isArray(plan.milestones) ? plan.milestones : [],
        createdAt: Number(plan.createdAt || Date.now())
      }));
    }
    const projectNameToId = new Map(next.projects.map((project) => [project.name, project.id]));
    next.ui.selectedProjectId = projectNameToId.get(legacy.selectedProject) || next.projects[0]?.id || 'cpa';
    if (Array.isArray(legacy.tasks)) {
      next.tasks = legacy.tasks.map((task) => normaliseTask(task, task.date, projectNameToId)).filter(Boolean);
    } else if (legacy.tasks && typeof legacy.tasks === 'object') {
      next.tasks = Object.entries(legacy.tasks).flatMap(([date, values]) => (Array.isArray(values) ? values : []).map((task) => normaliseTask(task, date, projectNameToId)).filter(Boolean));
    }
    next.inbox = (Array.isArray(legacy.inbox) ? legacy.inbox : []).map((item) => ({ id: String(item.id || uid('inbox')), text: String(item.text || item.title || '').trim(), createdAt: Number(item.createdAt || item.ts || Date.now()) })).filter((item) => item.text);
    const focusSource = Array.isArray(legacy.focusSessions) ? legacy.focusSessions : Array.isArray(legacy.focus) ? legacy.focus : [];
    next.focusSessions = focusSource.map((session) => ({
      id: String(session.id || uid('focus')),
      taskId: session.taskId ? String(session.taskId) : null,
      label: String(session.label || '专注'),
      plannedMinutes: clamp(session.plannedMinutes || session.m || session.minutes || 25, 1, 1440),
      actualMinutes: clamp(session.actualMinutes || session.m || session.minutes || 1, 1, 1440),
      startedAt: Number(session.startedAt || session.ts || Date.now()),
      endedAt: Number(session.endedAt || session.ts || Date.now()),
      date: /^\d{4}-\d{2}-\d{2}$/.test(session.date || '') ? session.date : localDateKey(session.ts || Date.now()),
      status: 'completed',
      rewardGranted: true
    }));
    if (legacy.timer && typeof legacy.timer === 'object') {
      const durationSeconds = clamp(legacy.timer.durationSeconds ?? legacy.timer.total ?? 1500, 60, 86400);
      next.timer = {
        id: String(legacy.timer.id || uid('timer')),
        status: 'paused',
        taskId: legacy.timer.taskId ? String(legacy.timer.taskId) : null,
        label: String(legacy.timer.label || '专注'),
        durationSeconds,
        remainingSeconds: clamp(legacy.timer.remainingSeconds ?? legacy.timer.left ?? durationSeconds, 0, durationSeconds),
        createdAt: Number(legacy.timer.createdAt || legacy.timer.started || Date.now()),
        lastStartedAt: null
      };
    }
    next.habits = (Array.isArray(legacy.habits) && legacy.habits.length ? legacy.habits : starterHabits()).map((habit) => ({ id: String(habit.id || uid('habit')), name: String(habit.name || '新习惯'), days: habit.days && typeof habit.days === 'object' ? habit.days : {} }));
    const moodNames = ['开心', '平静', '一般', '疲惫', '焦虑'];
    next.mood = Object.fromEntries(Object.entries(legacy.mood && typeof legacy.mood === 'object' ? legacy.mood : {}).map(([date, mood]) => [date, Number.isInteger(Number(mood)) && moodNames[Number(mood)] ? moodNames[Number(mood)] : mood]));
    next.journal = legacy.journal && typeof legacy.journal === 'object' ? legacy.journal : {};
    next.notes = (Array.isArray(legacy.notes) ? legacy.notes : []).map((note) => ({ id: String(note.id || uid('note')), title: String(note.title || '未命名笔记'), body: String(note.body || note.text || ''), projectId: note.projectId || null, createdAt: Number(note.createdAt || note.ts || Date.now()), updatedAt: Number(note.updatedAt || note.ts || Date.now()) }));
    next.rewards.coins = clamp(legacy.rewards?.coins ?? legacy.coins ?? 0, 0, Number.MAX_SAFE_INTEGER);
    next.rewards.stars = clamp(legacy.rewards?.stars ?? legacy.stars ?? legacy.xp ?? 0, 0, Number.MAX_SAFE_INTEGER);
    const legacyOutfitIds = Array.isArray(legacy.collection?.outfits) ? legacy.collection.outfits : [];
    const outfitFromIndex = Number.isInteger(legacy.selectedOutfit) ? OUTFITS[clamp(legacy.selectedOutfit, 0, OUTFITS.length - 1)]?.id : null;
    next.collection.outfits = [...new Set(['daily-daylight', ...legacyOutfitIds, ...(outfitFromIndex ? [outfitFromIndex] : [])])].filter((id) => OUTFITS.some((outfit) => outfit.id === id));
    next.collection.stickers = Array.isArray(legacy.collection?.stickers) ? legacy.collection.stickers.filter((id) => STICKERS.some((item) => item.id === id)) : [];
    next.collection.badges = Array.isArray(legacy.collection?.badges) ? legacy.collection.badges.filter((id) => BADGES.some((item) => item.id === id)) : [];
    next.collection.scenes = Array.isArray(legacy.collection?.scenes) ? legacy.collection.scenes : ['today-desk', 'focus-night'];
    next.monthlyMemories = legacy.monthlyMemories && typeof legacy.monthlyMemories === 'object' ? legacy.monthlyMemories : {};
    next.weeklyReviews = legacy.weeklyReviews && typeof legacy.weeklyReviews === 'object' ? legacy.weeklyReviews : {};
    if (String(legacy.weekNote || '').trim() && !next.weeklyReviews[startOfWeek()]) next.weeklyReviews[startOfWeek()] = { note: String(legacy.weekNote).slice(0, 360), updatedAt: Date.now() };
    next.activity = [
      ...next.tasks.filter((task) => task.completedAt).map((task) => ({ id: uid('activity'), type: 'task', title: `完成 ${task.title}`, at: task.completedAt, date: localDateKey(task.completedAt), meta: { taskId: task.id, area: task.area, scheduledDate: task.date } })),
      ...next.focusSessions.map((session) => ({ id: uid('activity'), type: 'focus', title: `专注 ${session.actualMinutes} 分钟`, at: session.endedAt, date: session.date, meta: { sessionId: session.id } }))
    ].sort((a, b) => a.at - b.at);
    next.updatedAt = Date.now();
    return next;
  };

  const repairState = (source) => {
    const base = defaultState();
    const state = source && typeof source === 'object' && !Array.isArray(source) ? source : base;
    const objectOrEmpty = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const text = (value, fallback = '') => String(value ?? fallback).trim();
    const validDate = (value, fallback = localDateKey()) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? String(value) : fallback;
    const uniqueCatalogIds = (values, catalog) => [...new Set(Array.isArray(values) ? values.map(String) : [])].filter((id) => catalog.some((item) => item.id === id));

    state.version = 1;
    state.createdAt = Number(state.createdAt) || base.createdAt;
    state.updatedAt = Number(state.updatedAt) || Date.now();

    const rawUi = objectOrEmpty(state.ui);
    const pages = new Set(['today', 'inbox', 'project', 'calendar', 'focus', 'habits', 'review', 'notes', 'collection']);
    const collectionTabs = new Set(['wardrobe', 'stickers', 'badges', 'memories']);
    const wardrobeFilters = new Set(['all', 'new', 'basic', 'limited', 'owned']);
    state.ui = {
      ...base.ui,
      ...rawUi,
      page: pages.has(rawUi.page) ? rawUi.page : base.ui.page,
      sidebarCollapsed: Boolean(rawUi.sidebarCollapsed),
      projectsCollapsed: Boolean(rawUi.projectsCollapsed),
      taskFilter: rawUi.taskFilter === '全部' || AREA_META[rawUi.taskFilter] ? rawUi.taskFilter : '全部',
      collectionTab: collectionTabs.has(rawUi.collectionTab) ? rawUi.collectionTab : 'wardrobe',
      wardrobeFilter: wardrobeFilters.has(rawUi.wardrobeFilter) ? rawUi.wardrobeFilter : 'all',
      calendarCursor: /^\d{4}-\d{2}$/.test(String(rawUi.calendarCursor || '')) ? rawUi.calendarCursor : monthKey(),
      selectedDate: validDate(rawUi.selectedDate)
    };

    const rawProjects = Array.isArray(state.projects) ? state.projects : [];
    state.projects = rawProjects.map((project) => {
      if (!project || typeof project !== 'object') return null;
      const name = text(project.name);
      if (!name) return null;
      const milestones = (Array.isArray(project.milestones) ? project.milestones : []).map((milestone) => {
        if (!milestone || typeof milestone !== 'object' || !text(milestone.title)) return null;
        return {
          id: text(milestone.id, uid('milestone')),
          title: text(milestone.title),
          date: text(milestone.date),
          done: Boolean(milestone.done),
          completedAt: milestone.done ? (Number(milestone.completedAt) || Date.now()) : null
        };
      }).filter(Boolean);
      return {
        id: text(project.id, uid('project')),
        name,
        area: AREA_META[project.area] ? project.area : '学习',
        goal: text(project.goal),
        nextStep: text(project.nextStep),
        weeklyFocus: (Array.isArray(project.weeklyFocus) ? project.weeklyFocus : []).map((item) => text(item)).filter(Boolean).slice(0, 3),
        milestones,
        createdAt: Number(project.createdAt) || Date.now()
      };
    }).filter(Boolean);
    if (!state.projects.length) state.projects = starterProjects();
    const projectIds = new Set(state.projects.map((project) => project.id));
    const projectNameToId = new Map(state.projects.map((project) => [project.name, project.id]));
    if (!projectIds.has(String(rawUi.selectedProjectId || ''))) state.ui.selectedProjectId = state.projects[0].id;

    state.tasks = (Array.isArray(state.tasks) ? state.tasks : []).map((task) => normaliseTask(task, task?.date, projectNameToId)).filter(Boolean).map((task) => ({ ...task, projectId: projectIds.has(String(task.projectId || '')) ? String(task.projectId) : null }));
    state.inbox = (Array.isArray(state.inbox) ? state.inbox : []).map((item) => {
      if (!item || typeof item !== 'object' || !text(item.text || item.title)) return null;
      return { id: text(item.id, uid('inbox')), text: text(item.text || item.title), createdAt: Number(item.createdAt) || Date.now() };
    }).filter(Boolean);
    state.focusSessions = (Array.isArray(state.focusSessions) ? state.focusSessions : []).map((session) => {
      if (!session || typeof session !== 'object') return null;
      const actualMinutes = clamp(session.actualMinutes ?? ((Number(session.actualSeconds) || 0) / 60), 0, 1440);
      if (!actualMinutes) return null;
      const endedAt = Number(session.endedAt) || Date.now();
      return {
        id: text(session.id, uid('focus')),
        taskId: state.tasks.some((task) => task.id === String(session.taskId || '')) ? String(session.taskId) : null,
        label: text(session.label, '专注'),
        plannedMinutes: clamp(session.plannedMinutes ?? 25, 1, 1440),
        actualMinutes,
        actualSeconds: clamp(session.actualSeconds ?? actualMinutes * 60, 1, 86400),
        startedAt: Number(session.startedAt) || endedAt - actualMinutes * 60000,
        endedAt,
        date: validDate(session.date, localDateKey(endedAt)),
        status: 'completed',
        rewardGranted: Boolean(session.rewardGranted)
      };
    }).filter(Boolean);

    const rawTimer = objectOrEmpty(state.timer);
    if (Object.keys(rawTimer).length) {
      const durationSeconds = clamp(rawTimer.durationSeconds ?? 1500, 60, 86400);
      const remainingSeconds = clamp(rawTimer.remainingSeconds ?? durationSeconds, 0, durationSeconds);
      const status = rawTimer.status === 'paused' ? 'paused' : 'running';
      state.timer = {
        id: text(rawTimer.id, uid('timer')),
        status,
        taskId: state.tasks.some((task) => task.id === String(rawTimer.taskId || '')) ? String(rawTimer.taskId) : null,
        label: text(rawTimer.label, '专注'),
        durationSeconds,
        remainingSeconds,
        createdAt: Number(rawTimer.createdAt) || Date.now(),
        lastStartedAt: status === 'running' ? (Number(rawTimer.lastStartedAt) || Date.now()) : null
      };
    } else state.timer = null;

    const rawHabits = Array.isArray(state.habits) && state.habits.length ? state.habits : starterHabits();
    state.habits = rawHabits.map((habit) => {
      if (!habit || typeof habit !== 'object' || !text(habit.name)) return null;
      const days = Object.fromEntries(Object.entries(objectOrEmpty(habit.days)).filter(([date, done]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Boolean(done)).map(([date]) => [date, true]));
      return { id: text(habit.id, uid('habit')), name: text(habit.name), days, rewardedDays: [...new Set(Array.isArray(habit.rewardedDays) ? habit.rewardedDays.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(String(date))) : Object.keys(days))] };
    }).filter(Boolean);
    if (!state.habits.length) state.habits = starterHabits();

    state.mood = Object.fromEntries(Object.entries(objectOrEmpty(state.mood)).filter(([date, mood]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && ['开心', '平静', '一般', '疲惫', '焦虑'].includes(mood)));
    state.journal = Object.fromEntries(Object.entries(objectOrEmpty(state.journal)).filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date)).map(([date, value]) => [date, String(value ?? '').slice(0, 240)]));
    state.growthRecords = (Array.isArray(state.growthRecords) ? state.growthRecords : []).map((record) => {
      if (!record || typeof record !== 'object' || !AREA_META[record.area]) return null;
      const amount = clamp(record.amount, 0, Number.MAX_SAFE_INTEGER);
      if (!amount) return null;
      return { id: text(record.id, uid('growth')), area: record.area, amount, unit: text(record.unit, AREA_META[record.area].unit), note: text(record.note), date: validDate(record.date), createdAt: Number(record.createdAt) || Date.now() };
    }).filter(Boolean);
    state.activity = (Array.isArray(state.activity) ? state.activity : []).map((entry) => {
      if (!entry || typeof entry !== 'object' || !text(entry.title)) return null;
      const at = Number(entry.at) || Date.now();
      return { id: text(entry.id, uid('activity')), type: text(entry.type, 'record'), title: text(entry.title), meta: objectOrEmpty(entry.meta), at, date: validDate(entry.date, localDateKey(at)) };
    }).filter(Boolean).sort((a, b) => a.at - b.at);
    state.notes = (Array.isArray(state.notes) ? state.notes : []).map((note) => {
      if (!note || typeof note !== 'object' || !text(note.title)) return null;
      return { id: text(note.id, uid('note')), title: text(note.title), body: String(note.body ?? note.text ?? ''), projectId: projectIds.has(String(note.projectId || '')) ? String(note.projectId) : null, createdAt: Number(note.createdAt) || Date.now(), updatedAt: Number(note.updatedAt) || Date.now() };
    }).filter(Boolean);
    state.weeklyReviews = Object.fromEntries(Object.entries(objectOrEmpty(state.weeklyReviews)).filter(([date, review]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && review && typeof review === 'object').map(([date, review]) => [date, { note: String(review.note ?? '').slice(0, 360), updatedAt: Number(review.updatedAt) || Date.now() }]));
    state.rewards = { stars: clamp(state.rewards?.stars, 0, Number.MAX_SAFE_INTEGER), coins: clamp(state.rewards?.coins, 0, Number.MAX_SAFE_INTEGER) };
    state.collection = {
      outfits: uniqueCatalogIds(state.collection?.outfits, OUTFITS),
      stickers: uniqueCatalogIds(state.collection?.stickers, STICKERS),
      badges: uniqueCatalogIds(state.collection?.badges, BADGES),
      scenes: uniqueCatalogIds(state.collection?.scenes, SCENES),
      favorites: uniqueCatalogIds(state.collection?.favorites, OUTFITS)
    };
    if (!state.collection.outfits.includes('daily-daylight')) state.collection.outfits.unshift('daily-daylight');
    if (!state.collection.scenes.length) state.collection.scenes = ['today-desk', 'focus-night'];
    state.monthlyMemories = Object.fromEntries(Object.entries(objectOrEmpty(state.monthlyMemories)).filter(([month, memory]) => /^\d{4}-\d{2}$/.test(month) && memory && typeof memory === 'object').map(([month, memory]) => [month, {
      month,
      keyword: String(memory.keyword ?? '').slice(0, 24),
      summary: String(memory.summary ?? '').slice(0, 480),
      stickers: uniqueCatalogIds(memory.stickers, STICKERS).slice(-3),
      outfitId: state.collection.outfits.includes(String(memory.outfitId || '')) ? String(memory.outfitId) : null,
      badgeId: state.collection.badges.includes(String(memory.badgeId || '')) ? String(memory.badgeId) : null,
      stats: objectOrEmpty(memory.stats),
      createdAt: Number(memory.createdAt) || Date.now(),
      updatedAt: Number(memory.updatedAt) || Date.now()
    }]));
    return state;
  };

  const recordDays = (state) => {
    const dates = new Set();
    state.tasks.filter((task) => task.status === 'done').forEach((task) => dates.add(task.completedAt ? localDateKey(task.completedAt) : task.date));
    state.focusSessions.forEach((session) => dates.add(session.date));
    state.growthRecords.forEach((record) => dates.add(record.date));
    Object.entries(state.journal).forEach(([date, text]) => { if (String(text || '').trim()) dates.add(date); });
    Object.keys(state.mood).forEach((date) => dates.add(date));
    state.habits.forEach((habit) => Object.entries(habit.days || {}).forEach(([date, done]) => { if (done) dates.add(date); }));
    return dates;
  };
  const longestRecentStreak = (state) => {
    const days = recordDays(state);
    let streak = 0;
    let cursor = localDateKey();
    if (!days.has(cursor)) cursor = addDays(cursor, -1);
    while (days.has(cursor)) { streak += 1; cursor = addDays(cursor, -1); }
    return streak;
  };
  const totals = (state) => {
    const completedTasks = state.tasks.filter((task) => task.status === 'done');
    const focusMinutes = state.focusSessions.reduce((sum, session) => sum + clamp(session.actualMinutes, 0, 1440), 0);
    const records = state.growthRecords.reduce((acc, record) => {
      const area = AREA_META[record.area] ? record.area : '生活';
      acc[area] = (acc[area] || 0) + (Number(record.amount) || 0);
      return acc;
    }, {});
    completedTasks.forEach((task) => {
      if (['学习', '工作', '英语'].includes(task.area)) records[task.area] = (records[task.area] || 0) + (task.actualMinutes || task.minutes || 0);
      if (task.area === '生活') records.生活 = (records.生活 || 0) + 1;
    });
    return { completedTasks: completedTasks.length, focusMinutes, writingWords: records.写作 || 0, exerciseCount: state.growthRecords.filter((record) => record.area === '运动').length + completedTasks.filter((task) => task.area === '运动').length, areas: records, streak: longestRecentStreak(state) };
  };

  const evaluateUnlocks = (state) => {
    const summary = totals(state);
    const completed = state.tasks.filter((task) => task.status === 'done');
    const moodDays = Object.keys(state.mood).length;
    const habitChecks = state.habits.reduce((sum, habit) => sum + Object.values(habit.days || {}).filter(Boolean).length, 0);
    const hasGrowth = (area) => state.growthRecords.some((record) => record.area === area) || completed.some((task) => task.area === area);
    const stickerRules = {
      moon: Object.values(state.journal).some((text) => String(text || '').trim()),
      star: completed.length >= 1,
      flower: completed.length >= 5,
      cat: moodDays >= 3,
      rabbit: state.focusSessions.length >= 1,
      coffee: summary.focusMinutes >= 120,
      book: completed.some((task) => task.area === '学习'),
      headphones: hasGrowth('播客'),
      plant: habitChecks >= 1,
      tape: state.notes.length >= 1,
      note: state.activity.some((entry) => entry.type === 'inbox-organized'),
      pencil: hasGrowth('写作'),
      cloud: Object.values(state.mood).includes('疲惫'),
      planet: Object.keys(state.monthlyMemories).length >= 1,
      'study-seal': (summary.areas.学习 || 0) >= 300,
      'writing-seal': summary.writingWords >= 5000,
      'sport-seal': summary.exerciseCount >= 5
    };
    const badgeRules = {
      'first-focus': state.focusSessions.length >= 1,
      'focus-10h': summary.focusMinutes >= 600,
      'seven-days': summary.streak >= 7,
      'first-memory': Object.keys(state.monthlyMemories).length >= 1,
      'novel-50k': summary.writingWords >= 50000,
      'project-chapter': state.projects.some((project) => (project.milestones || []).some((milestone) => milestone.done))
    };
    const unlocked = { stickers: [], badges: [], scenes: [] };
    Object.entries(stickerRules).forEach(([id, eligible]) => {
      if (eligible && !state.collection.stickers.includes(id)) { state.collection.stickers.push(id); unlocked.stickers.push(id); }
    });
    Object.entries(badgeRules).forEach(([id, eligible]) => {
      if (eligible && !state.collection.badges.includes(id)) { state.collection.badges.push(id); unlocked.badges.push(id); }
    });
    if (summary.focusMinutes >= 180 && !state.collection.scenes.includes('cafe-afternoon')) { state.collection.scenes.push('cafe-afternoon'); unlocked.scenes.push('cafe-afternoon'); }
    if (summary.streak >= 7 && !state.collection.scenes.includes('garden-morning')) { state.collection.scenes.push('garden-morning'); unlocked.scenes.push('garden-morning'); }
    return unlocked;
  };

  let loaded = readKey(STORAGE_KEY);
  let migratedFrom = null;
  if (!loaded) {
    for (const key of LEGACY_KEYS) {
      const candidate = readKey(key);
      if (candidate) { loaded = migrateLegacy(candidate); migratedFrom = key; break; }
    }
  }
  let state = repairState(loaded || defaultState());
  evaluateUnlocks(state);
  const listeners = new Set();
  const persist = () => {
    state.updatedAt = Date.now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
    catch (error) { console.warn('小小生长册：本地保存失败。', error); return false; }
  };
  const save = (reason = 'update') => {
    const unlocked = evaluateUnlocks(state);
    const result = { ...unlocked, persisted: persist() };
    listeners.forEach((listener) => listener(state, { reason, unlocked: result }));
    return result;
  };
  const replace = (next, reason = 'replace') => { state = repairState(next); return save(reason); };
  const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
  if (!loaded || migratedFrom) persist();

  window.GrowthCore = {
    STORAGE_KEY, LEGACY_KEYS, OUTFITS, SCENES, STICKERS, BADGES, AREA_META,
    get state() { return state; },
    save, replace, subscribe, migratedFrom, uid, clamp, localDateKey, monthKey,
    parseDateKey, addDays, startOfWeek, endOfWeek, totals, recordDays, evaluateUnlocks
  };
})();
