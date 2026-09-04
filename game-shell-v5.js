/* 星回衣橱 v34：高清底模不变，四件单品在同一 SVG 坐标系内按固定锚点叠加。 */
(function () {
  const VERSION = '34';
  const IMAGE = {
    base: 'assets/dressup-v34/base.webp',
    top: 'assets/dressup-v34/top.webp',
    bottom: 'assets/dressup-v34/bottom.webp',
    outer: 'assets/dressup-v34/outer.webp',
    shoes: 'assets/dressup-v34/shoes.webp',
    thumbTop: 'assets/dressup-v34/thumb-top.webp',
    thumbBottom: 'assets/dressup-v34/thumb-bottom.webp',
    thumbOuter: 'assets/dressup-v34/thumb-outer.webp',
    thumbShoes: 'assets/dressup-v34/thumb-shoes.webp'
  };
  const FULL = { top: true, bottom: true, outer: true, shoes: true };
  const SLOTS = ['top', 'bottom', 'outer', 'shoes'];
  const META = {
    top: { tab: '上装', name: '雾白针织高领毛衣' },
    bottom: { tab: '下装', name: '灰蓝链饰工装长裤' },
    outer: { tab: '外套', name: '冰霜星辉长风衣' },
    shoes: { tab: '鞋履', name: '白色系带运动鞋' }
  };

  /* app-v2.js keeps D in a global lexical binding, not on window. */
  const data = typeof D === 'object' && D ? D : (window.D || {});
  data.game2d = data.game2d || {};
  const saved = data.game2d.mistV34?.equipped
    || data.game2d.mistV33?.equipped
    || data.game2d.mistV32?.equipped
    || data.game2d.mistV31?.equipped
    || data.game2d.mistV29?.equipped
    || FULL;
  data.game2d.mistV34 = { equipped: { ...FULL, ...saved } };
  const state = data.game2d.mistV34;

  let scene = 'wardrobe';
  let tab = '套装';
  let draft = { ...state.equipped };
  let figureSerial = 0;

  const old = document.getElementById('gameAppV5');
  if (old) old.remove();

  const app = document.createElement('section');
  app.id = 'gameAppV5';
  app.className = 'gameAppV5 dressupApp dressupV32 dressupV33 dressupV34';

  function icon(name) {
    const paths = {
      back: '<path d="M20 6 10 16l10 10M11 16h15"/>',
      wardrobe: '<path d="M12 6 8 8l-4 5 4 4 3-2v12h10V15l3 2 4-4-4-5-4-2c-.8 2-2 3-4 3s-3.2-1-4-3Z"/>',
      shop: '<path d="M7 11h18l-2 16H9Z"/><path d="M12 11V8a4 4 0 0 1 8 0v3M12 17h8"/>',
      rewards: '<circle cx="16" cy="12" r="7"/><path d="m16 7 1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.6-3 1.6.6-3.2-2.4-2.3 3.3-.5ZM11 19l-1 8 6-3 6 3-1-8"/>'
    };
    return `<svg viewBox="0 0 32 32" aria-hidden="true">${paths[name]}</svg>`;
  }

  app.innerHTML = `
    <header class="dressTopbar">
      <button class="dressBack" aria-label="返回工作台">${icon('back')}</button>
      <div class="dressTitle"><small>STARLIGHT DRESS</small><b id="dressSceneTitle">星回衣橱</b></div>
      <div class="dressCoins" aria-label="当前金币"><i>✦</i><b id="dressCoinCount">0</b></div>
    </header>
    <main class="dressScene" id="dressScene"></main>
    <nav class="dressNav" aria-label="换装导航">
      <button data-dress-scene="wardrobe">${icon('wardrobe')}<span>衣橱</span></button>
      <button data-dress-scene="shop">${icon('shop')}<span>商城</span></button>
      <button data-dress-scene="rewards">${icon('rewards')}<span>奖励</span></button>
    </nav>`;
  document.body.appendChild(app);

  const root = app.querySelector('#dressScene');
  const title = app.querySelector('#dressSceneTitle');
  const isComplete = look => SLOTS.every(slot => Boolean(look[slot]));
  const pieceCount = look => SLOTS.filter(slot => Boolean(look[slot])).length;
  const lookName = look => isComplete(look)
    ? '雾城漫步·银灰旅装'
    : pieceCount(look)
      ? `自由混搭 · ${pieceCount(look)}件`
      : '月白基础造型';

  function updateMoney() {
    app.querySelector('#dressCoinCount').textContent = Number(data.coins || 0);
  }

  function svgLayer(slot) {
    return `<image class="v34SvgLayer ${slot}" href="${IMAGE[slot]}?v=${VERSION}" x="0" y="0" width="1254" height="1254" preserveAspectRatio="none"/>`;
  }

  function figure(look = draft, mini = false) {
    const maskId = `v34BaseMask${++figureSerial}`;
    return `<div class="v32Figure${mini ? ' mini' : ''}" role="img" aria-label="${lookName(look)}">
      <svg class="v34Canvas" viewBox="0 0 1254 1254" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs><mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254">
          <rect width="1254" height="1254" fill="white"/>
          ${look.bottom ? '<rect x="510" y="780" width="230" height="305" fill="black"/>' : ''}
        </mask></defs>
        <image class="v34SvgLayer base" href="${IMAGE.base}?v=${VERSION}" x="0" y="0" width="1254" height="1254" preserveAspectRatio="none" mask="url(#${maskId})"/>
        ${look.bottom ? svgLayer('bottom') : ''}
        ${look.top ? svgLayer('top') : ''}
        ${look.shoes ? svgLayer('shoes') : ''}
        ${look.outer ? svgLayer('outer') : ''}
      </svg>
    </div>`;
  }

  function pieceThumbnail(slot) {
    const key = `thumb${slot[0].toUpperCase()}${slot.slice(1)}`;
    return `<img class="v33PieceThumb ${slot}" src="${IMAGE[key]}?v=${VERSION}" alt="${META[slot].name}" draggable="false" decoding="async">`;
  }

  function tabs() {
    return `<div class="dressTabs" role="tablist" aria-label="服装分类">
      ${['套装', '上装', '下装', '外套', '鞋履'].map(name => `
        <button role="tab" aria-selected="${tab === name}" data-v32-tab="${name}" class="${tab === name ? 'active' : ''}">${name}</button>`).join('')}
    </div>`;
  }

  function pieceCard(slot) {
    const item = META[slot];
    const selected = Boolean(draft[slot]);
    return `<button class="v32Piece${selected ? ' selected' : ''}" data-toggle-slot="${slot}" aria-pressed="${selected}">
      <span class="pieceArt">${pieceThumbnail(slot)}</span>
      <span class="pieceCopy"><b>${item.name}</b><small>雾城漫步</small><em>${selected ? '再次点击脱下' : '点击试穿'}</em></span>
    </button>`;
  }

  function drawer() {
    if (tab === '套装') {
      return `<article class="v32SetCard${isComplete(draft) ? ' selected' : ''}">
        <div class="v32SetPreview">${figure(FULL, true)}</div>
        <div class="v32SetInfo">
          <small>初始珍藏 · 已拥有</small>
          <h3>雾城漫步·银灰旅装</h3>
          <p>上装、下装、外套和鞋履均可单独穿脱。</p>
          <button data-wear-set>整套试穿</button>
        </div>
      </article>`;
    }
    const slot = Object.keys(META).find(key => META[key].tab === tab);
    return `<div class="v32PieceGrid">${pieceCard(slot)}</div>`;
  }

  function wardrobeScene() {
    const changed = SLOTS.some(slot => draft[slot] !== state.equipped[slot]);
    return `<div class="v32Wardrobe">
      <section class="characterPanel v32CharacterPanel"><div class="characterGlow"></div>${figure(draft)}</section>
      <div class="lookSummary"><div><small>当前试穿</small><b>${lookName(draft)}</b></div><span>${changed ? '尚未保存' : '已保存'}</span></div>
      <section class="v32Drawer">
        <div class="wardrobePanelHead"><div><small>WARDROBE</small><b>星光衣橱</b></div><span>1 套 · 4 件</span></div>
        ${tabs()}${drawer()}
      </section>
      <div class="dressActions">
        <button data-reset-draft ${changed ? '' : 'disabled'}>恢复已保存</button>
        <button class="primary" data-save-draft ${changed ? '' : 'disabled'}>${changed ? '保存穿搭' : '穿搭已保存'}</button>
      </div>
    </div>`;
  }

  function shopScene() {
    return `<div class="shopPage v32Shop">
      <section class="shopHero"><small>STARLIGHT BOUTIQUE</small><h2>服饰商城</h2><p>完成现实任务积累金币，兑换后会自动收入衣橱。</p></section>
      <article class="v32ShopCard">
        <div>${figure(FULL, true)}</div>
        <section><small>初始赠礼</small><h3>雾城漫步·银灰旅装</h3><p>上装 / 下装 / 外套 / 鞋履</p><button disabled>已收入衣橱</button></section>
      </article>
    </div>`;
  }

  function rewardsScene() {
    return `<div class="rewardsPage">
      <section class="shopHero"><small>REAL LIFE → DRESS-UP</small><h2>行动兑换新衣</h2><p>完成打卡与专注，金币会同步显示在衣橱。</p></section>
      <div class="rewardCards">
        <button data-workbench="today"><b>今日打卡</b><span>完成现实里的小任务</span></button>
        <button data-workbench="focus"><b>番茄钟</b><span>完成一次专注获得金币</span></button>
        <button data-workbench="plans"><b>成长计划</b><span>推进正在进行的长期目标</span></button>
      </div>
    </div>`;
  }

  function render() {
    updateMoney();
    if (scene === 'shop') {
      title.textContent = '服饰商城';
      root.innerHTML = shopScene();
    } else if (scene === 'rewards') {
      title.textContent = '奖励';
      root.innerHTML = rewardsScene();
    } else {
      title.textContent = '星回衣橱';
      root.innerHTML = wardrobeScene();
    }
    app.querySelectorAll('[data-dress-scene]').forEach(button => {
      const active = button.dataset.dressScene === scene;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function persist() {
    state.equipped = { ...draft };
    if (typeof save === 'function') save();
    if (typeof toast === 'function') toast('当前穿搭已保存');
  }

  app.addEventListener('click', event => {
    const nav = event.target.closest('[data-dress-scene]');
    if (nav) {
      scene = nav.dataset.dressScene;
      render();
      return;
    }
    const tabButton = event.target.closest('[data-v32-tab]');
    if (tabButton) {
      tab = tabButton.dataset.v32Tab;
      render();
      return;
    }
    if (event.target.closest('[data-wear-set]')) {
      draft = { ...FULL };
      render();
      return;
    }
    const item = event.target.closest('[data-toggle-slot]');
    if (item) {
      const slot = item.dataset.toggleSlot;
      draft[slot] = !draft[slot];
      render();
      return;
    }
    if (event.target.closest('[data-reset-draft]')) {
      draft = { ...state.equipped };
      render();
      return;
    }
    if (event.target.closest('[data-save-draft]')) {
      persist();
      render();
      return;
    }
    const workbench = event.target.closest('[data-workbench]');
    if (workbench) {
      exitGame2d();
      if (typeof gotoPage === 'function') gotoPage(workbench.dataset.workbench);
    }
  });

  const legacyLeave = typeof leaveGame === 'function' ? leaveGame : function () {};
  function enterGame2d() {
    document.body.classList.add('game-mode', 'dressup-v21-active', 'dressup-v23-active', 'dressup-v32-active', 'dressup-v33-active', 'dressup-v34-active');
    app.classList.add('open');
    scene = 'wardrobe';
    tab = '套装';
    draft = { ...state.equipped };
    render();
  }

  function exitGame2d() {
    app.classList.remove('open');
    document.body.classList.remove('game-mode', 'dressup-v21-active', 'dressup-v23-active', 'dressup-v31-active', 'dressup-v32-active', 'dressup-v33-active', 'dressup-v34-active');
    if (typeof baseGotoPage === 'function') baseGotoPage('home');
    else legacyLeave();
  }

  app.querySelector('.dressBack').addEventListener('click', exitGame2d);
  enterGame = enterGame2d;
  leaveGame = exitGame2d;
  window.enterGameV5 = enterGame2d;
  window.exitGameV5 = exitGame2d;
  window.renderGameV5 = render;

  Object.values(IMAGE).forEach(path => {
    const image = new Image();
    image.decoding = 'async';
    image.src = `${path}?v=${VERSION}`;
  });
})();
