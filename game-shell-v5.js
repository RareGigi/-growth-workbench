/* 星轨成长舱 v10：固定基础内搭 + 可独立穿脱的平面服饰。 */
(function () {
  const VERSION = 10;
  const ASSET = `?v=${VERSION}`;
  const BASE = 'assets/dressup-2d/base-approved.webp';
  const layerOrder = ['shoes', 'bottom', 'top', 'coat'];
  const paintOrder = ['bottom', 'top', 'shoes', 'coat'];
  const tabs = ['全部', '上装', '下装', '外套', '鞋履'];
  let svgSerial = 0;

  const items = [
    { id:'mist-top', slot:'top', tab:'上装', name:'雾白针织衫', series:'雾城漫步', price:72, src:'assets/dressup-2d/mist-top.webp', thumb:'assets/dressup-2d/thumbs/mist-top.webp', baseCut:'top' },
    { id:'mist-bottom', slot:'bottom', tab:'下装', name:'星链长裤', series:'雾城漫步', price:88, src:'assets/dressup-2d/mist-bottom.webp', thumb:'assets/dressup-2d/thumbs/mist-bottom.webp', baseCut:'bottom' },
    { id:'mist-coat', slot:'coat', tab:'外套', name:'流雾风衣', series:'雾城漫步', price:148, src:'assets/dressup-2d/mist-coat.webp', thumb:'assets/dressup-2d/thumbs/mist-coat.webp', selfCut:'openCoat' },
    { id:'mist-shoes', slot:'shoes', tab:'鞋履', name:'星屿球鞋', series:'雾城漫步', price:64, src:'assets/dressup-2d/mist-shoes.webp', thumb:'assets/dressup-2d/thumbs/mist-shoes.webp', baseCut:'shoes' },
    { id:'lilac-shoes', slot:'shoes', tab:'鞋履', name:'紫藤星屿鞋', series:'晨星变奏', price:58, src:'assets/dressup-2d/lilac-shoes.webp', thumb:'assets/dressup-2d/thumbs/lilac-shoes.webp', baseCut:'shoes' }
  ];

  const mistIds = ['mist-top', 'mist-bottom', 'mist-coat', 'mist-shoes'];
  const defaultLook = { top:null, bottom:null, coat:null, shoes:null };
  const mistLook = { top:'mist-top', bottom:'mist-bottom', coat:'mist-coat', shoes:'mist-shoes' };
  const legacyBaseIds = new Set(['hair-default', 'top-base', 'bottom-base', 'coat-none', 'shoes-base']);

  D.game2d = D.game2d || {};
  const state = D.game2d;
  state.owned = Array.isArray(state.owned) ? state.owned : [];
  state.owned = state.owned.filter(id => !legacyBaseIds.has(id));
  /* Every existing save gets one genuinely separated starter set so all
     categories can be tested immediately. Future pieces still cost coins. */
  if (!state.starterGranted) {
    mistIds.forEach(id => { if (!state.owned.includes(id)) state.owned.push(id); });
    state.starterGranted = true;
  }
  state.equipped = sanitizeLook(state.equipped || mistLook);
  state.looks = (Array.isArray(state.looks) ? state.looks : []).map(look => Object.assign({}, look, { slots:sanitizeLook(look.slots) }));
  state.version = VERSION;

  const app = document.createElement('section');
  app.id = 'gameAppV5';
  app.className = 'gameAppV5 dressupApp';
  app.setAttribute('aria-label', '星回平面换装游戏');
  app.innerHTML = `
    <header class="dressTopbar">
      <button class="dressBack" aria-label="返回工作台">←</button>
      <div class="dressTitle"><small>STARLIGHT DRESS</small><b id="dressSceneTitle">星回衣橱</b></div>
      <div class="dressCoins" aria-label="金币余额"><i>✦</i><b id="dressCoinCount">0</b></div>
    </header>
    <main class="dressScene" id="dressScene"></main>
    <nav class="dressNav" aria-label="换装游戏导航">
      <button data-dress-scene="wardrobe">${dressNavIcon('wardrobe')}<span>衣橱</span></button>
      <button data-dress-scene="shop">${dressNavIcon('shop')}<span>商城</span></button>
      <button data-dress-scene="looks">${dressNavIcon('looks')}<span>穿搭</span></button>
      <button data-dress-scene="rewards">${dressNavIcon('rewards')}<span>奖励</span></button>
    </nav>`;
  document.body.appendChild(app);

  const root = app.querySelector('#dressScene');
  const title = app.querySelector('#dressSceneTitle');
  let scene = 'wardrobe';
  let wardrobeTab = '全部';
  let shopTab = '全部';
  let draft = sanitizeLook(state.equipped);

  function dressNavIcon(name) {
    const icons = {
      wardrobe:`<path class="iconTint" d="M11.4 5.4 8 6.8 3.8 11l3.7 4 2.2-1.7V27h12.6V13.3l2.2 1.7 3.7-4L24 6.8l-3.4-1.4C19.7 7.3 18.2 8.3 16 8.3s-3.7-1-4.6-2.9Z"/><path d="M11.4 5.4 8 6.8 3.8 11l3.7 4 2.2-1.7V27h12.6V13.3l2.2 1.7 3.7-4L24 6.8l-3.4-1.4C19.7 7.3 18.2 8.3 16 8.3s-3.7-1-4.6-2.9Z"/><path d="M11.4 5.4c.9 1.9 2.4 2.9 4.6 2.9s3.7-1 4.6-2.9"/>`,
      shop:`<path class="iconTint" d="M6.5 10.5h19L24.2 27H7.8Z"/><path d="M6.5 10.5h19L24.2 27H7.8Z"/><path d="M11.5 11V8.5a4.5 4.5 0 0 1 9 0V11"/><path d="M12 16.5h8"/>`,
      looks:`<rect class="iconTint" x="8" y="5" width="17" height="22" rx="3"/><path d="M8 8H6.5A2.5 2.5 0 0 0 4 10.5v13A2.5 2.5 0 0 0 6.5 26H8"/><rect x="8" y="5" width="17" height="22" rx="3"/><path d="m14 11-2.3 1-2 2.2 2.1 2 1.2-.9v6.2h7v-6.2l1.2.9 2.1-2-2-2.2-2.3-1a3.2 3.2 0 0 1-5 0Z"/>`,
      rewards:`<circle class="iconTint" cx="16" cy="13" r="8"/><circle cx="16" cy="13" r="8"/><path d="m16 8.5 1.4 2.8 3.1.5-2.2 2.1.5 3-2.8-1.5-2.8 1.5.5-3-2.2-2.1 3.1-.5Z"/><path d="m11.5 19.5-1 7 5.5-2.8 5.5 2.8-1-7"/>`
    };
    return `<svg class="dressNavIcon" viewBox="0 0 32 32" aria-hidden="true">${icons[name] || icons.wardrobe}</svg>`;
  }

  function getItem(id) { return items.find(item => item.id === id); }
  function isOwned(id) { return state.owned.includes(id); }
  function money() { app.querySelector('#dressCoinCount').textContent = Number(D.coins || 0); }
  function sanitizeLook(look) {
    const next = Object.assign({}, defaultLook, look || {});
    layerOrder.forEach(slot => {
      const item = getItem(next[slot]);
      if (!item || item.slot !== slot) next[slot] = null;
    });
    return next;
  }
  function cloneLook(look) { return sanitizeLook(look); }

  function avatar(look, extraClass='') {
    const selection = cloneLook(look);
    const uid = `look-${++svgSerial}`;
    const selected = Object.fromEntries(paintOrder.map(slot => [slot, getItem(selection[slot])]));
    const baseCuts = paintOrder.map(slot => baseCutShape(selected[slot]?.baseCut)).join('');
    const layers = paintOrder.map(slot => {
      const item = selected[slot];
      if (!item?.src) return '';
      const mask = item.selfCut ? ` mask="url(#${uid}-${item.selfCut})"` : '';
      return `<image class="dressLayer layer-${slot}" href="${item.src}${ASSET}" x="0" y="0" width="1254" height="1254"${mask}/>`;
    }).join('');
    return `<div class="dressAvatar ${extraClass}" aria-label="完整人物换装预览"><svg class="dressAvatarSvg" viewBox="0 0 1254 1254" role="img" aria-label="银灰短发的Q版人物当前穿搭">
      <defs>
        <mask id="${uid}-base" maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254"><rect width="1254" height="1254" fill="white"/>${baseCuts}</mask>
        ${openCoatMask(uid)}
        <clipPath id="${uid}-hands" clipPathUnits="userSpaceOnUse"><rect x="458" y="872" width="62" height="62" rx="25"/><rect x="734" y="872" width="62" height="62" rx="25"/></clipPath>
      </defs>
      <image class="dressBase" href="${BASE}${ASSET}" x="0" y="0" width="1254" height="1254" mask="url(#${uid}-base)"/>
      ${layers}
      <image class="dressHands" href="${BASE}${ASSET}" x="0" y="0" width="1254" height="1254" clip-path="url(#${uid}-hands)"/>
    </svg></div>`;
  }

  function baseCutShape(type) {
    if (type === 'top') return `<path fill="black" d="M535 656 L505 665 L476 690 L446 855 L452 872 L486 884 L514 807 L543 688 Z M719 656 L749 665 L778 690 L808 855 L802 872 L768 884 L740 807 L711 688 Z M535 655 H719 V920 H535 Z"/>`;
    if (type === 'bottom') return `<rect x="520" y="858" width="214" height="282" fill="black"/>`;
    if (type === 'shoes') return `<rect x="505" y="1080" width="244" height="140" fill="black"/>`;
    return '';
  }

  function openCoatMask(uid) {
    return `<mask id="${uid}-openCoat" maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254"><rect width="1254" height="1254" fill="white"/><path fill="black" d="M580 640 H674 L712 700 L705 865 H549 L542 700 Z"/></mask>`;
  }

  function thumb(item) {
    if (!item || (!item.thumb && !item.src)) return '<span class="emptyPiece">不穿</span>';
    if (item.selfCut === 'openCoat') {
      const uid = `piece-${++svgSerial}`;
      return `<svg viewBox="359 616 536 560" aria-hidden="true"><defs>${openCoatMask(uid)}</defs><image href="${item.src}${ASSET}" x="0" y="0" width="1254" height="1254" mask="url(#${uid}-openCoat)"/></svg>`;
    }
    const src = item.thumb || item.src;
    return `<img src="${src}${ASSET}" alt="${item.name}">`;
  }

  function categoryBar(active, target) {
    return `<div class="dressTabs" role="tablist">${tabs.map(tab => `<button data-${target}-tab="${tab}" class="${active === tab ? 'active' : ''}">${tab}</button>`).join('')}</div>`;
  }

  function wardrobeScene() {
    const visible = items.filter(item => isOwned(item.id) && (wardrobeTab === '全部' || item.tab === wardrobeTab));
    return `<div class="wardrobePage">
      <section class="characterPanel"><div class="characterGlow"></div>${avatar(draft)}</section>
      <div class="lookSummary"><div><small>当前试穿</small><b>${lookLabel(draft)}</b></div><span>基础内搭固定 · 衣服逐层穿脱</span></div>
      <section class="wardrobePanel">
        ${categoryBar(wardrobeTab, 'wardrobe')}
        <p class="layerHint">白色基础内搭属于人物母版，不计入衣服，也不能换掉。再次点击正在试穿的单品即可脱下该层。</p>
        <div class="pieceGrid">${visible.map(item => `<button class="pieceCard ${draft[item.slot] === item.id ? 'selected' : ''}" data-equip-item="${item.id}">
          <span class="pieceArt">${thumb(item)}</span><b>${item.name}</b><small>${item.series}</small><em>${draft[item.slot] === item.id ? '再次点击脱下' : '点击试穿'}</em>
        </button>`).join('')}</div>
      </section>
      <div class="dressActions"><button data-reset-draft>恢复已保存</button><button class="primary" data-save-draft>保存当前穿搭</button></div>
    </div>`;
  }

  function shopScene() {
    const forSale = items.filter(item => item.price > 0 && (shopTab === '全部' || item.tab === shopTab));
    return `<div class="shopPage">
      <section class="shopHero"><small>STARLIGHT BOUTIQUE</small><h2>星光服饰商城</h2><p>完成工作台计划获得金币；购买后单品会进入衣橱，不会自动替换当前穿搭。</p></section>
      <section class="starterGift"><div>${avatar(mistLook, 'miniAvatar')}</div><div><small>首套拆分礼物</small><b>雾城漫步</b><p>上装、下装、外套与鞋履已分别送入衣橱，可立即混搭。</p></div></section>
      ${categoryBar(shopTab, 'shop')}
      <div class="storeGrid">${forSale.map(item => {
        const owned = isOwned(item.id);
        return `<article class="storeCard"><span class="storeArt">${thumb(item)}</span><div><small>${item.series}</small><b>${item.name}</b></div><button data-buy-item="${item.id}" ${owned ? 'disabled' : ''}>${owned ? '已拥有' : `✦ ${item.price}`}</button></article>`;
      }).join('')}</div>
      <section class="comingSeries"><small>持续更新系列</small><h3>东方古韵 · 星夜礼服 · 可爱日常 · 节日限定</h3><p>每一套都会先锁定同一母版，再按上装、下装、外套、鞋履和配饰逐件入库。</p></section>
    </div>`;
  }

  function looksScene() {
    const saved = state.looks;
    return `<div class="looksPage"><section class="looksHero"><small>MY LOOKBOOK</small><h2>我的穿搭册</h2><p>保存不同混搭，下次可以一键换回。</p></section>
      <div class="lookbookGrid">${saved.length ? saved.map(look => `<article class="lookCard">${avatar(look.slots, 'lookAvatar')}<b>${look.name}</b><small>${look.date}</small><div><button data-apply-look="${look.id}">换上</button><button class="quiet" data-delete-look="${look.id}" aria-label="删除穿搭">删除</button></div></article>`).join('') : `<div class="emptyLooks"><span>✦</span><b>还没有保存穿搭</b><p>在衣橱里混搭后点击“保存当前穿搭”，这里就会生成一张穿搭卡。</p><button data-dress-scene="wardrobe">去衣橱搭配</button></div>`}</div></div>`;
  }

  function rewardsScene() {
    const ownedCount = state.owned.filter(id => getItem(id)?.price > 0).length;
    return `<div class="rewardsPage">
      <section class="rewardHero"><small>REAL LIFE → DRESS-UP</small><h2>行动会变成新衣服</h2><p>这里只保留一条清楚的循环：现实任务完成 → 获得金币 → 商城兑换单品 → 衣橱自由混搭。</p><div class="rewardBalance"><span>当前金币</span><b>✦ ${Number(D.coins || 0)}</b></div></section>
      <div class="rewardStats"><article><b>${ownedCount}</b><span>兑换单品</span></article><article><b>${state.looks.length}</b><span>保存穿搭</span></article><article><b>${Math.max(0, Number(D.xp || 0))}</b><span>成长经验</span></article></div>
      <section class="earnWays"><h3>去获得金币</h3><button data-workbench="today"><span>✓</span><div><b>完成今日打卡</b><small>按工作台原有规则结算金币</small></div><i>›</i></button><button data-workbench="focus"><span>◷</span><div><b>完成一次番茄钟</b><small>专注记录会继续累积成长</small></div><i>›</i></button><button data-workbench="plans"><span>✦</span><div><b>推进一条计划</b><small>标准行动和最低行动都算前进</small></div><i>›</i></button></section>
    </div>`;
  }

  function lookLabel(look) {
    const chosen = layerOrder.map(slot => getItem(look[slot])).filter(Boolean);
    if (chosen.some(item => item.series === '雾城漫步')) return '雾城自由混搭';
    return '人物基础造型';
  }

  function render() {
    money();
    const titles = { wardrobe:'星回衣橱', shop:'服饰商城', looks:'我的穿搭', rewards:'金币奖励' };
    title.textContent = titles[scene] || '星回衣橱';
    root.innerHTML = scene === 'shop' ? shopScene() : scene === 'looks' ? looksScene() : scene === 'rewards' ? rewardsScene() : wardrobeScene();
    app.querySelectorAll('.dressNav [data-dress-scene]').forEach(button => button.classList.toggle('active', button.dataset.dressScene === scene));
    root.scrollTop = 0;
  }

  function go(next) {
    scene = next;
    if (next === 'wardrobe') draft = cloneLook(state.equipped);
    render();
  }

  function commitState(message) {
    save();
    render();
    if (message) toast(message);
  }

  app.addEventListener('click', event => {
    const sceneButton = event.target.closest('[data-dress-scene]');
    if (sceneButton) { go(sceneButton.dataset.dressScene); return; }
    const wardrobeButton = event.target.closest('[data-wardrobe-tab]');
    if (wardrobeButton) { wardrobeTab = wardrobeButton.dataset.wardrobeTab; render(); return; }
    const shopButton = event.target.closest('[data-shop-tab]');
    if (shopButton) { shopTab = shopButton.dataset.shopTab; render(); return; }

    const equipButton = event.target.closest('[data-equip-item]');
    if (equipButton) {
      const item = getItem(equipButton.dataset.equipItem);
      if (!item || !isOwned(item.id)) return;
      draft[item.slot] = draft[item.slot] === item.id ? null : item.id;
      render();
      return;
    }

    if (event.target.closest('[data-reset-draft]')) { draft = cloneLook(state.equipped); render(); return; }
    if (event.target.closest('[data-save-draft]')) {
      state.equipped = cloneLook(draft);
      state.looks.unshift({ id:String(Date.now()), name:`穿搭 ${state.looks.length + 1}`, date:new Date().toLocaleDateString('zh-CN'), slots:cloneLook(draft) });
      state.looks = state.looks.slice(0, 12);
      commitState('当前穿搭已保存到穿搭册');
      return;
    }

    const buyButton = event.target.closest('[data-buy-item]');
    if (buyButton) {
      const item = getItem(buyButton.dataset.buyItem);
      if (!item || isOwned(item.id)) return;
      if (Number(D.coins || 0) < item.price) { toast(`还差 ${item.price - Number(D.coins || 0)} 金币`); return; }
      D.coins -= item.price;
      state.owned.push(item.id);
      commitState(`「${item.name}」已送入衣橱`);
      return;
    }

    const applyButton = event.target.closest('[data-apply-look]');
    if (applyButton) {
      const look = state.looks.find(entry => entry.id === applyButton.dataset.applyLook);
      if (!look) return;
      state.equipped = cloneLook(look.slots);
      draft = cloneLook(look.slots);
      commitState(`已换上「${look.name}」`);
      return;
    }

    const deleteButton = event.target.closest('[data-delete-look]');
    if (deleteButton) {
      state.looks = state.looks.filter(entry => entry.id !== deleteButton.dataset.deleteLook);
      commitState('穿搭卡已删除');
      return;
    }

    const workbenchButton = event.target.closest('[data-workbench]');
    if (workbenchButton) {
      exitGame2d();
      if (typeof gotoPage === 'function') gotoPage(workbenchButton.dataset.workbench);
    }
  });

  app.querySelector('.dressBack').addEventListener('click', exitGame2d);

  const legacyLeave = typeof leaveGame === 'function' ? leaveGame : function () {};
  function enterGame2d() {
    document.body.classList.add('game-mode', 'dressup-v10-active');
    app.classList.add('open');
    scene = 'wardrobe';
    draft = cloneLook(state.equipped);
    render();
  }
  function exitGame2d() {
    app.classList.remove('open');
    document.body.classList.remove('game-mode', 'dressup-v10-active');
    if (typeof baseGotoPage === 'function') baseGotoPage('home'); else legacyLeave();
  }

  enterGame = enterGame2d;
  leaveGame = exitGame2d;
  window.enterGameV5 = enterGame2d;
  window.exitGameV5 = exitGame2d;
  window.renderGameV5 = render;
})();
