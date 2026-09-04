/* 星轨旅程 v40：现实成长 → 星光 → 场景与成就。 */
(function () {
  const VERSION = '40';
  const AVATAR = 'assets/dressup-v38/composite.webp';
  const data = typeof D === 'object' && D ? D : (window.D || {});
  data.starJourney = data.starJourney || { roomLevel: 1, previewRoomLevel: 1 };
  const journeyState = data.starJourney;

  const old = document.getElementById('gameAppV5');
  if (old) old.remove();

  const app = document.createElement('section');
  app.id = 'gameAppV5';
  app.className = 'gameAppV5 starJourneyApp';

  const milestones = [
    { title: '启程', sub: '把现实目标写进星轨', state: 'done' },
    { title: '新章', sub: '稳定进入新的工作节奏', state: 'current' },
    { title: '长夜', sub: '把 CPA 学习变成长期习惯', state: 'next' },
    { title: '成书', sub: '《第五时》抵达 10 万字', state: 'locked' },
    { title: '星环', sub: '完成一整年的成长记录', state: 'locked' }
  ];

  const achievements = [
    { icon: 'audit', name: '审计旅人', desc: '把项目经验变成自己的能力地图', tag: '已获得', unlocked: true },
    { icon: 'study', name: '长夜灯塔', desc: '累计完成 30 次有效学习', tag: '18 / 30', unlocked: false },
    { icon: 'book', name: '第五时', desc: '成熟正文累计达到 100,000 字', tag: '进行中', unlocked: false },
    { icon: 'streak', name: '星火不熄', desc: '连续 30 天留下成长记录', tag: '进行中', unlocked: false }
  ];

  let scene = 'journey';

  function icon(name) {
    const icons = {
      back: '<path d="M19 7 10 16l9 9M11 16h14"/>',
      journey: '<path d="M6 23c4-9 8-14 13-14 4 0 7 3 7 7 0 6-7 10-14 10"/><circle cx="8" cy="23" r="2"/><circle cx="20" cy="9" r="2"/><path d="m26 5 .7 1.8L29 7.5l-2.3.7L26 10l-.7-1.8L23 7.5l2.3-.7Z"/>',
      home: '<path d="m5 15 11-9 11 9v12H5Z"/><path d="M12 27v-8h8v8M10 13h3M19 13h3"/>',
      archive: '<path d="M7 6h18v21H7Z"/><path d="M11 6v21M15 11h6M15 16h6M15 21h4"/>',
      sparkle: '<path d="m16 4 1.4 4.6L22 10l-4.6 1.4L16 16l-1.4-4.6L10 10l4.6-1.4ZM25 17l.8 2.2L28 20l-2.2.8L25 23l-.8-2.2L22 20l2.2-.8Z"/>',
      audit: '<path d="M8 5h16v22H8Z"/><path d="M12 10h8M12 15h8M12 20h5"/><path d="m20 22 2 2 4-5"/>',
      study: '<path d="M6 8c4-2 7-2 10 1v18c-3-3-6-3-10-1ZM26 8c-4-2-7-2-10 1v18c3-3 6-3 10-1Z"/>',
      book: '<path d="M8 6h16v21H8Z"/><path d="M12 10h8M12 15h8M12 20h6"/>',
      streak: '<path d="M16 4c3 5 7 7 7 13a7 7 0 1 1-14 0c0-3 2-6 5-9 0 4 1 6 2 7 2-3 2-6 0-11Z"/>'
    };
    return `<svg viewBox="0 0 32 32" aria-hidden="true">${icons[name] || icons.sparkle}</svg>`;
  }

  app.innerHTML = `
    <header class="sjTopbar">
      <button class="sjBack" aria-label="返回工作台">${icon('back')}</button>
      <div class="sjTitle"><small>STAR GROWTH JOURNEY</small><b id="sjSceneTitle">星轨旅程</b></div>
      <div class="sjCurrency"><span>✦</span><b id="sjCoinCount">0</b></div>
    </header>
    <main class="sjScene" id="sjScene"></main>
    <nav class="sjNav" aria-label="成长游戏导航">
      <button data-sj-scene="journey">${icon('journey')}<span>旅程</span></button>
      <button data-sj-scene="home">${icon('home')}<span>小屋</span></button>
      <button data-sj-scene="archive">${icon('archive')}<span>收藏</span></button>
    </nav>`;
  document.body.appendChild(app);

  const root = app.querySelector('#sjScene');
  const title = app.querySelector('#sjSceneTitle');

  function coins() { return Number(data.coins || 0); }
  function xp() { return Number(data.xp || data.totalXp || 0); }
  function level() { return Math.max(1, Math.floor(xp() / 350) + 1); }
  function progressPercent() {
    const raw = xp() % 350;
    return Math.max(12, Math.min(100, Math.round(raw / 350 * 100)));
  }
  function companionLine() {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) return '今天已经走了很远。留下最后一点记录，就可以安心收尾。';
    if (hour < 12) return '今天不用一下子完成很多。先点亮第一颗星。';
    if (hour < 18) return '现实里的每一个小进度，都会在这里留下光。';
    return '把今天真正完成的事留下来，星轨会替你记住。';
  }

  function hero() {
    return `<section class="sjHero">
      <div class="sjHeroSky"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="sjHeroCopy">
        <small>CHAPTER 02 · 新章</small>
        <h2>今晚，也向前一点点。</h2>
        <p>${companionLine()}</p>
        <div class="sjLevel"><span>Lv.${level()}</span><div><i style="width:${progressPercent()}%"></i></div><b>${progressPercent()}%</b></div>
      </div>
      <div class="sjAvatarHalo"></div>
      <img class="sjAvatar" src="${AVATAR}?v=38" alt="星回陪伴角色" draggable="false">
      <div class="sjHeroBadge"><small>本周状态</small><b>持续回来就很好</b></div>
    </section>`;
  }

  function journeyScene() {
    return `<div class="sjPage sjJourneyPage">
      ${hero()}
      <section class="sjSection">
        <div class="sjSectionHead"><div><small>YOUR CONSTELLATION</small><h3>我的星轨</h3></div><button data-workbench="today">记录今日星光</button></div>
        <div class="sjPath">
          ${milestones.map((m, i) => `<article class="sjNode ${m.state}">
            <div class="sjNodeMark"><span>${i + 1}</span></div>
            <div class="sjNodeText"><b>${m.title}</b><small>${m.sub}</small></div>
            <em>${m.state === 'done' ? '已点亮' : m.state === 'current' ? '当前章节' : m.state === 'next' ? '即将抵达' : '未解锁'}</em>
          </article>`).join('')}
        </div>
      </section>
      <section class="sjMiniGrid">
        <button class="sjMiniCard" data-sj-scene="home"><span>${icon('home')}</span><div><small>星光小屋</small><b>书房 Lv.${journeyState.previewRoomLevel || 1}</b><p>把现实积累变成看得见的空间。</p></div></button>
        <button class="sjMiniCard" data-sj-scene="archive"><span>${icon('archive')}</span><div><small>成长收藏</small><b>1 / ${achievements.length}</b><p>收藏现实里真正发生过的里程碑。</p></div></button>
      </section>
    </div>`;
  }

  function roomIllustration(lvl) {
    const stars = Math.min(5, lvl + 1);
    return `<div class="sjRoomScene level${lvl}">
      <div class="sjWindow"><span></span>${Array.from({ length: stars }).map(() => '<i></i>').join('')}</div>
      <div class="sjDesk"><div class="sjLamp"></div><div class="sjBooks"><i></i><i></i><i></i></div><div class="sjCup"></div></div>
      <div class="sjChair"></div><div class="sjPlant"></div><div class="sjRug"></div>
      <img src="${AVATAR}?v=38" alt="星回" draggable="false">
    </div>`;
  }

  function homeScene() {
    const lvl = Math.max(1, Math.min(3, Number(journeyState.previewRoomLevel || 1)));
    const copy = ['一盏灯、一张桌子。先从能坐下来做事开始。','书架和星窗亮起来了。这里开始像真正属于你的地方。','夜景、植物和收藏都回到了房间。它已经记录了你的生活。'][lvl - 1];
    return `<div class="sjPage sjHomePage">
      <section class="sjRoomCard">
        <div class="sjSectionHead light"><div><small>STARLIGHT HOME</small><h3>云雾书房 · Lv.${lvl}</h3></div><span>预览模式</span></div>
        ${roomIllustration(lvl)}
        <div class="sjRoomCopy"><p>${copy}</p><div class="sjRoomLevels">${[1,2,3].map(n => `<button class="${n === lvl ? 'active' : ''}" data-room-level="${n}"><span>0${n}</span><b>${n === 1 ? '初见' : n === 2 ? '长明' : '星窗'}</b></button>`).join('')}</div></div>
      </section>
      <section class="sjRoomRule"><span>${icon('sparkle')}</span><div><b>这里不卖家具</b><p>学习、工作、写作和身体目标达到阶段里程碑后，房间自己长出来。</p></div></section>
    </div>`;
  }

  function archiveScene() {
    return `<div class="sjPage sjArchivePage">
      <section class="sjArchiveHero"><small>REAL LIFE ARCHIVE</small><h2>现实发生过的事，值得被收藏。</h2><p>不是虚拟道具，而是你真正做完的一段路。</p></section>
      <section class="sjAchievementGrid">
        ${achievements.map(a => `<article class="sjAchievement ${a.unlocked ? 'unlocked' : 'locked'}">
          <div class="sjAchievementIcon">${icon(a.icon)}</div>
          <div><small>${a.tag}</small><h3>${a.name}</h3><p>${a.desc}</p></div>
          <span>${a.unlocked ? '已收入' : '未完成'}</span>
        </article>`).join('')}
      </section>
      <button class="sjReviewButton" data-workbench="calendar"><span>${icon('sparkle')}</span><div><b>去写今天的成长记录</b><small>真正完成的事，才会进入收藏馆。</small></div></button>
    </div>`;
  }

  function render() {
    app.querySelector('#sjCoinCount').textContent = coins();
    if (scene === 'home') { title.textContent = '星光小屋'; root.innerHTML = homeScene(); }
    else if (scene === 'archive') { title.textContent = '成长收藏'; root.innerHTML = archiveScene(); }
    else { title.textContent = '星轨旅程'; root.innerHTML = journeyScene(); }
    app.querySelectorAll('[data-sj-scene]').forEach(btn => {
      const active = btn.dataset.sjScene === scene;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-current', active ? 'page' : 'false');
    });
    root.scrollTop = 0;
  }

  app.addEventListener('click', event => {
    const nav = event.target.closest('[data-sj-scene]');
    if (nav) { scene = nav.dataset.sjScene; render(); return; }
    const levelBtn = event.target.closest('[data-room-level]');
    if (levelBtn) { journeyState.previewRoomLevel = Number(levelBtn.dataset.roomLevel); render(); return; }
    const workbench = event.target.closest('[data-workbench]');
    if (workbench) {
      exitJourney();
      if (typeof gotoPage === 'function') gotoPage(workbench.dataset.workbench);
    }
  });

  const legacyLeave = typeof leaveGame === 'function' ? leaveGame : function () {};
  function enterJourney() {
    document.body.classList.add('game-mode', 'star-journey-active');
    app.classList.add('open');
    scene = 'journey';
    render();
  }
  function exitJourney() {
    app.classList.remove('open');
    document.body.classList.remove('game-mode', 'star-journey-active');
    if (typeof baseGotoPage === 'function') baseGotoPage('home');
    else legacyLeave();
  }

  app.querySelector('.sjBack').addEventListener('click', exitJourney);
  enterGame = enterJourney;
  leaveGame = exitJourney;
  window.enterGameV5 = enterJourney;
  window.exitGameV5 = exitJourney;
  window.renderGameV5 = render;

  const image = new Image();
  image.decoding = 'async';
  image.src = `${AVATAR}?v=38`;
})();
