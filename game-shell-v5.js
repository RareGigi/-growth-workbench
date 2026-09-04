/* 栖光 v1：把现实成长，养成一个世界。 */
(function () {
  const VERSION = 'qiguang-1';
  const STORAGE_KEY = 'qiguang-world-v1';
  const data = typeof D === 'object' && D ? D : (window.D || {});

  const defaults = {
    scene: 'greenhouse',
    light: 36,
    plants: { study: 2, writing: 1, body: 3, life: 1 },
    stars: { begin: true, thirty: false, cpa: false, novel: false, work: false },
    relics: { seed: true, nights: false, pages: false, morning: false }
  };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        ...defaults,
        ...saved,
        plants: { ...defaults.plants, ...(saved.plants || {}) },
        stars: { ...defaults.stars, ...(saved.stars || {}) },
        relics: { ...defaults.relics, ...(saved.relics || {}) }
      };
    } catch (_) { return JSON.parse(JSON.stringify(defaults)); }
  }
  const state = loadState();
  function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {} }

  const old = document.getElementById('gameAppV5');
  if (old) old.remove();

  const app = document.createElement('section');
  app.id = 'gameAppV5';
  app.className = 'gameAppV5 qiguangApp';

  const plants = [
    { id: 'study', name: '白山茶', track: '学习', note: '把反复回来的夜晚养成花。', tone: 'ivory' },
    { id: 'writing', name: '紫藤', track: '创作', note: '每一次落笔，都会留下新的枝条。', tone: 'violet' },
    { id: 'body', name: '银杏', track: '身体', note: '慢一点也没关系，先让根扎稳。', tone: 'gold' },
    { id: 'life', name: '铃兰', track: '生活', note: '那些微小而具体的好日子。', tone: 'sage' }
  ];
  const stageNames = ['种子', '初芽', '舒叶', '含苞', '盛放'];

  function icon(name) {
    const map = {
      back:'<path d="M19 7 10 16l9 9M11 16h14"/>',
      leaf:'<path d="M25 7C15 7 8 12 8 20c0 4 3 7 7 7 8 0 12-9 10-20Z"/><path d="M8 27c3-8 8-12 15-16"/>',
      star:'<path d="m16 4 3.2 7 7.6.8-5.6 5.2 1.6 7.6-6.8-3.8-6.8 3.8 1.6-7.6-5.6-5.2 7.6-.8Z"/>',
      archive:'<path d="M7 7h18v20H7Z"/><path d="M11 12h10M11 17h10M11 22h6"/>',
      plus:'<path d="M16 7v18M7 16h18"/>',
      spark:'<path d="m16 5 1.7 5.3L23 12l-5.3 1.7L16 19l-1.7-5.3L9 12l5.3-1.7ZM25 20l.9 2.1L28 23l-2.1.9L25 26l-.9-2.1L22 23l2.1-.9Z"/>'
    };
    return `<svg viewBox="0 0 32 32" aria-hidden="true">${map[name] || map.spark}</svg>`;
  }

  app.innerHTML = `
    <header class="qgTopbar">
      <button class="qgBack" aria-label="返回工作台">${icon('back')}</button>
      <div class="qgBrand"><small>QI · GUANG</small><b id="qgTitle">玻璃温室</b></div>
      <div class="qgLight"><span>✦</span><b id="qgLightCount">${state.light}</b></div>
    </header>
    <main class="qgScene" id="qgScene"></main>
    <nav class="qgNav">
      <button data-qg-scene="greenhouse">${icon('leaf')}<span>温室</span></button>
      <button data-qg-scene="sky">${icon('star')}<span>星穹</span></button>
      <button data-qg-scene="museum">${icon('archive')}<span>藏光馆</span></button>
    </nav>`;
  document.body.appendChild(app);

  const root = app.querySelector('#qgScene');
  const title = app.querySelector('#qgTitle');
  const lightCount = app.querySelector('#qgLightCount');

  function plantArt(p, stage) {
    const leaves = Math.max(0, stage - 1);
    const flowers = stage >= 4 ? (stage === 4 ? 2 : 5) : 0;
    return `<div class="qgPlantArt ${p.tone} stage${stage}">
      <div class="qgPot"><i></i></div>
      <div class="qgStem"></div>
      ${Array.from({length: leaves}).map((_,i)=>`<span class="qgLeaf l${i+1}"></span>`).join('')}
      ${Array.from({length: flowers}).map((_,i)=>`<span class="qgFlower f${i+1}"></span>`).join('')}
      ${stage === 1 ? '<span class="qgSeed"></span>' : ''}
    </div>`;
  }

  function greenhouseScene() {
    const totalStages = Object.values(state.plants).reduce((a,b)=>a+b,0);
    const progress = Math.round(totalStages / (plants.length * 5) * 100);
    return `<div class="qgPage qgGreenhousePage">
      <section class="qgGreenhouseHero">
        <div class="qgGlassRoof"><i></i><i></i><i></i><i></i></div>
        <div class="qgHeroText"><small>YOUR LIVING ARCHIVE</small><h1>你不用经营它。<br>好好生活，它自己会长大。</h1><p>现实里的坚持，在这里留下植物、光和时间。</p></div>
        <div class="qgHeroProgress"><div><span>温室生长度</span><b>${progress}%</b></div><i><em style="width:${progress}%"></em></i></div>
      </section>
      <section class="qgIntroStrip"><span>09 · 05</span><p>今天也可以只留下很小的一点光。</p><button data-workbench="today">回到今日</button></section>
      <section class="qgPlantSection">
        <div class="qgSectionHead"><div><small>BOTANICAL INDEX</small><h2>正在生长</h2></div><span>${plants.length} 株</span></div>
        <div class="qgPlantGrid">
          ${plants.map(p => {
            const stage = Math.max(1, Math.min(5, Number(state.plants[p.id] || 1)));
            return `<article class="qgPlantCard" data-plant="${p.id}">
              <div class="qgPlantVisual">${plantArt(p, stage)}<span class="qgStageTag">${stageNames[stage-1]}</span></div>
              <div class="qgPlantMeta"><small>${p.track}</small><h3>${p.name}</h3><p>${p.note}</p>
                <div class="qgStageDots">${[1,2,3,4,5].map(n=>`<i class="${n<=stage?'on':''}"></i>`).join('')}</div>
                <button data-grow="${p.id}" ${stage>=5?'disabled':''}>${stage>=5?'已盛放':`${icon('plus')} 记录一次成长`}</button>
              </div>
            </article>`;
          }).join('')}
        </div>
      </section>
    </div>`;
  }

  function skyScene() {
    const stars = [
      ['begin','启程星','开始记录自己的成长','2026 · 09'],
      ['thirty','长夜灯塔','累计完成 30 次有效学习','未点亮'],
      ['work','晨钟','新的工作阶段稳定满 100 天','未点亮'],
      ['novel','成书星','《第五时》成熟正文抵达 10 万字','未点亮'],
      ['cpa','执衡座','完成一项 CPA 重要里程碑','未点亮']
    ];
    return `<div class="qgPage qgSkyPage">
      <section class="qgSkyHero">
        <div class="qgSkyDust"></div>
        ${stars.map((s,i)=>`<button class="qgStarNode n${i+1} ${state.stars[s[0]]?'lit':'dim'}" data-star-info="${s[0]}"><i></i><span>${s[1]}</span></button>`).join('')}
        <svg class="qgConstellation" viewBox="0 0 390 500"><path d="M70 360 C110 300 132 260 175 218 S250 160 312 96"/><path d="M175 218 C215 260 257 292 325 335"/></svg>
        <div class="qgSkyCopy"><small>CONSTELLATION OF REAL LIFE</small><h1>星星只为真正<br>抵达过的地方亮起。</h1></div>
      </section>
      <section class="qgSkyList">${stars.map(s=>`<article class="${state.stars[s[0]]?'lit':''}"><span>${state.stars[s[0]]?'✦':'○'}</span><div><small>${s[3]}</small><b>${s[1]}</b><p>${s[2]}</p></div></article>`).join('')}</section>
    </div>`;
  }

  function museumScene() {
    const relics = [
      {id:'seed', code:'001', name:'第一粒种子', sub:'开始认真记录生活的那一天', form:'seed'},
      {id:'nights', code:'002', name:'第三十夜', sub:'装着 30 次学习微光的玻璃瓶', form:'bottle'},
      {id:'pages', code:'003', name:'未完之书', sub:'献给写到 10 万字的故事', form:'book'},
      {id:'morning', code:'004', name:'第一百枚晨光', sub:'一段工作旅程稳定走过 100 天', form:'watch'}
    ];
    return `<div class="qgPage qgMuseumPage">
      <section class="qgMuseumHero"><small>PRIVATE MUSEUM · COLLECTION 01</small><h1>现实发生过的事，<br>值得拥有一件藏品。</h1><p>它们不能购买，也不会因为某一天停下来而消失。</p></section>
      <section class="qgMuseumGrid">
        ${relics.map(r=>`<article class="qgRelic ${state.relics[r.id]?'owned':'locked'}">
          <div class="qgRelicCase"><div class="qgObject ${r.form}"><i></i><i></i><i></i></div><span>${state.relics[r.id]?'COLLECTED':'LOCKED'}</span></div>
          <div class="qgRelicMeta"><small>NO. ${r.code}</small><h3>${r.name}</h3><p>${r.sub}</p></div>
        </article>`).join('')}
      </section>
      <section class="qgMuseumNote"><span>${icon('spark')}</span><p><b>时间不会清零。</b> 已经长出的花、亮起的星和收入的藏品，都不会因为一次中断而消失。</p></section>
    </div>`;
  }

  function render() {
    const scene = state.scene || 'greenhouse';
    lightCount.textContent = state.light;
    title.textContent = scene === 'sky' ? '星穹' : scene === 'museum' ? '藏光馆' : '玻璃温室';
    root.innerHTML = scene === 'sky' ? skyScene() : scene === 'museum' ? museumScene() : greenhouseScene();
    app.querySelectorAll('[data-qg-scene]').forEach(btn=>btn.classList.toggle('active', btn.dataset.qgScene === scene));
    root.scrollTop = 0;
  }

  function grow(id) {
    const now = Math.max(1, Math.min(5, Number(state.plants[id] || 1)));
    if (now >= 5) return;
    state.plants[id] = now + 1;
    state.light += 6;
    const sum = Object.values(state.plants).reduce((a,b)=>a+b,0);
    if (sum >= 12) state.stars.thirty = true;
    if (state.plants.writing >= 5) { state.stars.novel = true; state.relics.pages = true; }
    if (state.plants.study >= 5) { state.stars.cpa = true; state.relics.nights = true; }
    if (state.plants.life >= 5) { state.stars.work = true; state.relics.morning = true; }
    saveState();
    render();
  }

  app.addEventListener('click', event => {
    const nav = event.target.closest('[data-qg-scene]');
    if (nav) { state.scene = nav.dataset.qgScene; saveState(); render(); return; }
    const growBtn = event.target.closest('[data-grow]');
    if (growBtn) { grow(growBtn.dataset.grow); return; }
    const workbench = event.target.closest('[data-workbench]');
    if (workbench) { exitQiguang(); if (typeof gotoPage === 'function') gotoPage(workbench.dataset.workbench); }
  });

  const legacyLeave = typeof leaveGame === 'function' ? leaveGame : function () {};
  function enterQiguang() {
    document.body.classList.add('game-mode', 'qiguang-active');
    app.classList.add('open');
    render();
  }
  function exitQiguang() {
    app.classList.remove('open');
    document.body.classList.remove('game-mode', 'qiguang-active');
    if (typeof baseGotoPage === 'function') baseGotoPage('home'); else legacyLeave();
  }

  app.querySelector('.qgBack').addEventListener('click', exitQiguang);
  enterGame = enterQiguang;
  leaveGame = exitQiguang;
  window.enterGameV5 = enterQiguang;
  window.exitGameV5 = exitQiguang;
  window.renderGameV5 = render;
})();