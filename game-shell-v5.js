/* 星回衣橱 v22：固定Q版人物母版 + 独立高清位图服饰层。 */
(function(){
  const VERSION=22;
  const BASE='assets/dressup-2d/base-approved.webp';
  const A='assets/dressup-v22/';
  const TABS=['套装','上装','下装','外套','鞋履','配饰'];
  const SLOT_ORDER=['top','bottom','outer','shoes','necklace','brooch'];
  let serial=0;

  const items=[
    {id:'starwind-top',slot:'top',tab:'上装',name:'星白束带上衣',series:'星风巡礼',price:0,src:A+'starwind-top.webp',crop:'430 565 395 360',cut:'top'},
    {id:'starwind-bottom',slot:'bottom',tab:'下装',name:'夜幕星链长裤',series:'星风巡礼',price:0,src:A+'starwind-bottom.webp',crop:'470 780 315 390',cut:'bottom'},
    {id:'starwind-outer',slot:'outer',tab:'外套',name:'星轨流光长外套',series:'星风巡礼',price:0,src:A+'starwind-outer-front.webp',backSrc:A+'starwind-outer-back.webp',crop:'385 535 485 520'},
    {id:'starwind-shoes',slot:'shoes',tab:'鞋履',name:'白蓝星轨短靴',series:'星风巡礼',price:0,src:A+'starwind-shoes.webp',crop:'455 1015 345 225',cut:'shoes'},
    {id:'starwind-necklace',slot:'necklace',tab:'配饰',name:'星核垂坠项链',series:'星风巡礼',price:0,src:A+'starwind-necklace.webp',crop:'520 575 220 275'},
    {id:'starwind-brooch',slot:'brooch',tab:'配饰',name:'星芒胸针',series:'星风巡礼',price:0,src:A+'starwind-brooch.webp',crop:'630 590 175 225'}
  ];
  const itemMap=new Map(items.map(x=>[x.id,x]));
  const starterLook={top:'starwind-top',bottom:'starwind-bottom',outer:'starwind-outer',shoes:'starwind-shoes',necklace:'starwind-necklace',brooch:'starwind-brooch'};

  D.game2d=D.game2d||{};
  const state=D.game2d;
  if(state.catalogVersion!==VERSION){
    state.catalogVersion=VERSION; state.owned=items.map(x=>x.id); state.equipped={...starterLook}; state.looks=[];
  }
  state.owned=Array.isArray(state.owned)?state.owned.filter(id=>itemMap.has(id)):items.map(x=>x.id);
  items.forEach(x=>{if(!state.owned.includes(x.id))state.owned.push(x.id)});
  state.equipped=sanitizeLook(state.equipped||starterLook);
  state.looks=(Array.isArray(state.looks)?state.looks:[]).map(x=>({...x,slots:sanitizeLook(x.slots)}));

  const old=document.getElementById('gameAppV5'); if(old)old.remove();
  const app=document.createElement('section');
  app.id='gameAppV5'; app.className='gameAppV5 dressupApp';
  app.innerHTML=`<header class="dressTopbar">
    <button class="dressBack" aria-label="返回工作台">${icon('back')}</button>
    <div class="dressTitle"><small>STARLIGHT DRESS</small><b id="dressSceneTitle">星回衣橱</b></div>
    <div class="dressCoins"><i>✦</i><b id="dressCoinCount">0</b></div>
  </header>
  <main class="dressScene" id="dressScene"></main>
  <nav class="dressNav">
    <button data-dress-scene="wardrobe">${icon('wardrobe')}<span>衣橱</span></button>
    <button data-dress-scene="shop">${icon('shop')}<span>商城</span></button>
    <button data-dress-scene="looks">${icon('looks')}<span>穿搭</span></button>
    <button data-dress-scene="rewards">${icon('rewards')}<span>奖励</span></button>
  </nav>`;
  document.body.appendChild(app);

  const root=app.querySelector('#dressScene'), title=app.querySelector('#dressSceneTitle');
  let scene='wardrobe', wardrobeTab='套装', shopTab='套装', draft=sanitizeLook(state.equipped);

  function sanitizeLook(look){
    const out={top:null,bottom:null,outer:null,shoes:null,necklace:null,brooch:null};
    SLOT_ORDER.forEach(slot=>{const it=itemMap.get(look&&look[slot]);if(it&&it.slot===slot)out[slot]=it.id});
    return out;
  }
  function cloneLook(look){return sanitizeLook(look)}
  function isOwned(id){return state.owned.includes(id)}
  function money(){app.querySelector('#dressCoinCount').textContent=Number(D.coins||0)}
  function completeSet(look){return SLOT_ORDER.every(slot=>look[slot]===starterLook[slot])}
  function lookLabel(look){if(completeSet(look))return '星风巡礼';const n=SLOT_ORDER.filter(slot=>look[slot]).length;return n?`自由混搭 · ${n}件`:'人物基础造型'}
  function icon(name){
    const p={back:'<path d="M20 6 10 16l10 10M11 16h15"/>',wardrobe:'<path d="M12 6 8 8l-4 5 4 4 3-2v12h10V15l3 2 4-4-4-5-4-2c-.8 2-2 3-4 3s-3.2-1-4-3Z"/>',shop:'<path d="M7 11h18l-2 16H9Z"/><path d="M12 11V8a4 4 0 0 1 8 0v3M12 17h8"/>',looks:'<rect x="8" y="5" width="17" height="22" rx="3"/><path d="m14 11-3 2 2 3 2-1v7h6v-7l2 1 2-3-3-2c-.6 1.4-1.8 2-4 2s-3.4-.6-4-2Z"/>',rewards:'<circle cx="16" cy="12" r="7"/><path d="m16 7 1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.6-3 1.6.6-3.2-2.4-2.3 3.3-.5ZM11 19l-1 8 6-3 6 3-1-8"/>'};
    return `<svg viewBox="0 0 32 32" aria-hidden="true">${p[name]}</svg>`;
  }
  function baseCutShape(type){
    if(type==='top')return `<path fill="black" d="M535 656 L505 665 L476 690 L446 855 L452 872 L486 884 L514 807 L543 688 Z M719 656 L749 665 L778 690 L808 855 L802 872 L768 884 L740 807 L711 688 Z M535 655 H719 V920 H535 Z"/>`;
    if(type==='bottom')return `<rect x="520" y="858" width="214" height="282" fill="black"/>`;
    if(type==='shoes')return `<rect x="505" y="1080" width="244" height="140" fill="black"/>`;
    return '';
  }
  function avatar(look,extraClass=''){
    const selected=cloneLook(look),uid=`r22-${++serial}`;
    const top=itemMap.get(selected.top),bottom=itemMap.get(selected.bottom),outer=itemMap.get(selected.outer),shoes=itemMap.get(selected.shoes),necklace=itemMap.get(selected.necklace),brooch=itemMap.get(selected.brooch);
    const cuts=[top,bottom,shoes].filter(Boolean).map(x=>baseCutShape(x.cut)).join('');
    const image=(item,cls)=>item?`<image class="${cls}" href="${item.src}?v=${VERSION}" x="0" y="0" width="1254" height="1254"/>`:'';
    return `<div class="dressAvatar ${extraClass}"><svg viewBox="0 0 1254 1254" role="img" aria-label="固定Q版人物当前穿搭">
      <defs><mask id="${uid}-base" maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254"><rect width="1254" height="1254" fill="white"/>${cuts}</mask>
      <clipPath id="${uid}-hands" clipPathUnits="userSpaceOnUse"><rect x="454" y="864" width="72" height="72" rx="28"/><rect x="728" y="864" width="72" height="72" rx="28"/></clipPath></defs>
      ${outer&&outer.backSrc?`<image href="${outer.backSrc}?v=${VERSION}" x="0" y="0" width="1254" height="1254"/>`:''}
      <image class="dressBase" href="${BASE}?v=${VERSION}" x="0" y="0" width="1254" height="1254" mask="url(#${uid}-base)"/>
      ${image(bottom,'layer-bottom')}${image(top,'layer-top')}${image(shoes,'layer-shoes')}${image(necklace,'layer-necklace')}${image(outer,'layer-outer-front')}${image(brooch,'layer-brooch')}
      <image class="dressHands" href="${BASE}?v=${VERSION}" x="0" y="0" width="1254" height="1254" clip-path="url(#${uid}-hands)"/>
    </svg></div>`;
  }
  function thumb(item){
    const back=item.backSrc?`<image href="${item.backSrc}?v=${VERSION}" x="0" y="0" width="1254" height="1254"/>`:'';
    return `<svg viewBox="${item.crop||'390 535 485 560'}" aria-hidden="true">${back}<image href="${item.src}?v=${VERSION}" x="0" y="0" width="1254" height="1254"/></svg>`;
  }
  function tabs(active,target){return `<div class="dressTabs">${TABS.map(tab=>`<button data-${target}-tab="${tab}" class="${tab===active?'active':''}">${tab}</button>`).join('')}</div>`}
  function setCard(target){
    const action=target==='wardrobe'?'<button data-equip-set>整套试穿</button>':'<button disabled>初始赠送 · 已拥有</button>';
    return `<article class="setCard"><div class="setPreview">${avatar(starterLook,'miniAvatar')}</div><div class="setMeta"><small>SSR · HIGH-RES LAYERS</small><b>星风巡礼</b><div class="swatches"><i style="background:#f6f8ff"></i><i style="background:#9db9ee"></i><i style="background:#20263b"></i><i style="background:#d6b46b"></i></div><p class="setDesc">7 个独立高清单品，外套前后片分层。</p>${action}</div></article>`;
  }
  function visibleItems(tab){return items.filter(x=>tab!=='套装'&&x.tab===tab)}
  function pieceCard(item,store=false){
    const selected=draft[item.slot]===item.id;
    if(store)return `<article class="storeCard"><span class="storeArt">${thumb(item)}</span><div><small>${item.series}</small><b>${item.name}</b></div><button disabled>已拥有</button></article>`;
    return `<button class="pieceCard ${selected?'selected':''}" data-equip-item="${item.id}"><span class="pieceArt">${thumb(item)}</span><b>${item.name}</b><small>${item.series}</small><em>${selected?'再次点击脱下':'点击试穿'}</em></button>`;
  }
  function wardrobeScene(){
    const body=wardrobeTab==='套装'?`<div class="setStrip">${setCard('wardrobe')}</div>`:`<div class="pieceGrid">${visibleItems(wardrobeTab).map(x=>pieceCard(x)).join('')}</div>`;
    return `<div class="wardrobePage"><section class="characterPanel"><div class="characterGlow"></div>${avatar(draft)}</section><div class="lookSummary"><div><small>当前试穿</small><b>${lookLabel(draft)}</b></div><span>固定母版 · 高清位图分层</span></div><section class="wardrobePanel"><div class="wardrobePanelHead"><div><small>WARDROBE</small><b>衣物抽屉</b></div><span>每件单品独立穿脱</span></div>${tabs(wardrobeTab,'wardrobe')}<p class="layerHint">外套已经拆成“后片 + 前片”：后领在人物颈后，左右前襟在身体前。上装、下装、鞋和配饰都是独立透明位图。</p>${body}</section><div class="dressActions"><button data-reset-draft>恢复</button><button class="primary" data-save-draft>保存穿搭</button></div></div>`;
  }
  function shopScene(){
    const body=shopTab==='套装'?`<div class="setShopGrid">${setCard('shop')}</div>`:`<div class="storeGrid">${visibleItems(shopTab).map(x=>pieceCard(x,true)).join('')}</div>`;
    return `<div class="shopPage"><section class="shopHero"><small>STARLIGHT BOUTIQUE</small><h2>服饰商城</h2><p>第一套作为新版衣橱的初始赠礼。后续系列会沿用同一高清图片分层规范加入金币兑换。</p></section>${tabs(shopTab,'shop')}${body}<section class="comingSeries"><small>NEXT DROP</small><h3>古风 · 卡面礼服 · 可爱日常</h3><p>下一批继续使用固定Q版人物母版，不再出现矢量简图。</p></section></div>`;
  }
  function looksScene(){return `<div class="looksPage"><section class="shopHero compact"><small>MY LOOKBOOK</small><h2>我的穿搭</h2><p>保存过的混搭可以一键换回。</p></section><div class="lookGrid">${state.looks.length?state.looks.map(x=>`<article class="lookCard"><div>${avatar(x.slots,'lookAvatar')}</div><b>${x.name}</b><small>${x.date}</small><div><button data-apply-look="${x.id}">换上</button><button data-delete-look="${x.id}">删除</button></div></article>`).join(''):'<div class="emptyState">还没有保存穿搭。</div>'}</div></div>`}
  function rewardsScene(){return `<div class="rewardsPage"><section class="shopHero"><small>REAL LIFE → DRESS-UP</small><h2>行动兑换新衣</h2><p>现实任务完成后获得金币，再在商城兑换后续服装。</p></section><div class="rewardCards"><button data-workbench="today"><b>今日打卡</b><span>完成任务获得金币</span></button><button data-workbench="focus"><b>番茄钟</b><span>专注记录继续累积成长</span></button><button data-workbench="plans"><b>计划中心</b><span>推进你的长期计划</span></button></div></div>`}
  function render(){
    money();title.textContent={wardrobe:'星回衣橱',shop:'服饰商城',looks:'我的穿搭',rewards:'金币奖励'}[scene]||'星回衣橱';
    root.innerHTML=scene==='shop'?shopScene():scene==='looks'?looksScene():scene==='rewards'?rewardsScene():wardrobeScene();
    app.querySelectorAll('.dressNav [data-dress-scene]').forEach(b=>b.classList.toggle('active',b.dataset.dressScene===scene));root.scrollTop=0;
  }
  function go(next){scene=next;if(next==='wardrobe')draft=cloneLook(state.equipped);render()}
  function commit(message){save();render();if(message)toast(message)}
  app.addEventListener('click',e=>{
    const sc=e.target.closest('[data-dress-scene]');if(sc){go(sc.dataset.dressScene);return}
    const wt=e.target.closest('[data-wardrobe-tab]');if(wt){wardrobeTab=wt.dataset.wardrobeTab;render();return}
    const st=e.target.closest('[data-shop-tab]');if(st){shopTab=st.dataset.shopTab;render();return}
    if(e.target.closest('[data-equip-set]')){draft={...starterLook};render();return}
    const eq=e.target.closest('[data-equip-item]');if(eq){const it=itemMap.get(eq.dataset.equipItem);if(it&&isOwned(it.id)){draft[it.slot]=draft[it.slot]===it.id?null:it.id;render()}return}
    if(e.target.closest('[data-reset-draft]')){draft=cloneLook(state.equipped);render();return}
    if(e.target.closest('[data-save-draft]')){state.equipped=cloneLook(draft);state.looks.unshift({id:String(Date.now()),name:`穿搭 ${state.looks.length+1}`,date:new Date().toLocaleDateString('zh-CN'),slots:cloneLook(draft)});state.looks=state.looks.slice(0,12);commit('当前穿搭已保存');return}
    const ap=e.target.closest('[data-apply-look]');if(ap){const x=state.looks.find(v=>v.id===ap.dataset.applyLook);if(x){state.equipped=cloneLook(x.slots);draft=cloneLook(x.slots);commit('已换上保存穿搭')}return}
    const del=e.target.closest('[data-delete-look]');if(del){state.looks=state.looks.filter(v=>v.id!==del.dataset.deleteLook);commit('穿搭已删除');return}
    const wb=e.target.closest('[data-workbench]');if(wb){exitGame2d();if(typeof gotoPage==='function')gotoPage(wb.dataset.workbench)}
  });
  app.querySelector('.dressBack').addEventListener('click',exitGame2d);
  const legacyLeave=typeof leaveGame==='function'?leaveGame:function(){};
  function enterGame2d(){document.body.classList.add('game-mode','dressup-v21-active','dressup-v22-active');app.classList.add('open');scene='wardrobe';draft=cloneLook(state.equipped);render()}
  function exitGame2d(){app.classList.remove('open');document.body.classList.remove('game-mode','dressup-v21-active','dressup-v22-active');if(typeof baseGotoPage==='function')baseGotoPage('home');else legacyLeave()}
  enterGame=enterGame2d;leaveGame=exitGame2d;window.enterGameV5=enterGame2d;window.exitGameV5=exitGame2d;window.renderGameV5=render;
})();
