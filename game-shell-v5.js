/* 星回衣橱 v23：先把一套衣服做对。整套高清成品图，不再用矢量服装或临时拼图。 */
(function(){
  const VERSION=23;
  const BASE='assets/dressup-2d/base-approved.webp';
  const OUTFIT='assets/avatar-v5/mist-city-walk-preview.png';
  const OUTFIT_ID='mist-city-walk';
  const D0=window.D||{};
  window.D=D0;
  D0.game2d=D0.game2d||{};
  const state=D0.game2d;
  if(state.catalogVersion!==VERSION){state.catalogVersion=VERSION;state.owned=[OUTFIT_ID];state.equipped=OUTFIT_ID;}
  if(!Array.isArray(state.owned)) state.owned=[OUTFIT_ID];
  if(!state.owned.includes(OUTFIT_ID)) state.owned.push(OUTFIT_ID);
  if(state.equipped!==OUTFIT_ID && state.equipped!==null) state.equipped=OUTFIT_ID;
  const old=document.getElementById('gameAppV5'); if(old) old.remove();
  const app=document.createElement('section'); app.id='gameAppV5'; app.className='gameAppV5 dressupApp dressupV23';
  function icon(name){const p={back:'<path d="M20 6 10 16l10 10M11 16h15"/>',wardrobe:'<path d="M12 6 8 8l-4 5 4 4 3-2v12h10V15l3 2 4-4-4-5-4-2c-.8 2-2 3-4 3s-3.2-1-4-3Z"/>',shop:'<path d="M7 11h18l-2 16H9Z"/><path d="M12 11V8a4 4 0 0 1 8 0v3M12 17h8"/>',rewards:'<circle cx="16" cy="12" r="7"/><path d="m16 7 1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.6-3 1.6.6-3.2-2.4-2.3 3.3-.5ZM11 19l-1 8 6-3 6 3-1-8"/>'};return `<svg viewBox="0 0 32 32" aria-hidden="true">${p[name]}</svg>`}
  app.innerHTML=`<header class="dressTopbar"><button class="dressBack" aria-label="返回工作台">${icon('back')}</button><div class="dressTitle"><small>STARLIGHT DRESS</small><b id="dressSceneTitle">星回衣橱</b></div><div class="dressCoins"><i>✦</i><b id="dressCoinCount">0</b></div></header><main class="dressScene" id="dressScene"></main><nav class="dressNav v23Nav"><button data-dress-scene="wardrobe">${icon('wardrobe')}<span>衣橱</span></button><button data-dress-scene="shop">${icon('shop')}<span>商城</span></button><button data-dress-scene="rewards">${icon('rewards')}<span>奖励</span></button></nav>`;
  document.body.appendChild(app);
  const root=app.querySelector('#dressScene'),title=app.querySelector('#dressSceneTitle'); let scene='wardrobe',draft=state.equipped;
  function money(){const el=app.querySelector('#dressCoinCount');if(el)el.textContent=Number(D0.coins||0)}
  function figure(which=draft,mini=false){const src=which===OUTFIT_ID?OUTFIT:BASE,label=which===OUTFIT_ID?'雾城漫步·银灰旅装完整穿搭':'基础造型';return `<div class="v23Figure ${mini?'mini':''} ${which===OUTFIT_ID?'outfitFigure':'baseFigure'}"><img src="${src}?v=${VERSION}" alt="${label}" draggable="false"></div>`}
  function saveState(message){if(typeof save==='function')save();if(typeof toast==='function')toast(message);money()}
  function setName(which){return which===OUTFIT_ID?'雾城漫步·银灰旅装':'基础造型'}
  function wardrobeScene(){const wearing=draft===OUTFIT_ID;return `<div class="v23Wardrobe"><section class="characterPanel v23CharacterPanel"><div class="characterGlow"></div>${figure(draft)}</section><div class="lookSummary"><div><small>当前试穿</small><b>${setName(draft)}</b></div><span>整套成品 · 固定尺寸</span></div><section class="v23Drawer"><div class="wardrobePanelHead"><div><small>WARDROBE</small><b>星光衣橱</b></div><span>首发套装 · 1 / 1</span></div><article class="v23SetCard ${wearing?'selected':''}"><div class="v23SetPreview">${figure(OUTFIT_ID,true)}</div><div class="v23SetInfo"><small>SSR · FIRST DROP</small><h3>雾城漫步·银灰旅装</h3><p>银灰与雾蓝层叠长外套、针织内搭和深灰长裤组成完整造型。</p><button data-toggle-outfit>${wearing?'脱下套装':'试穿套装'}</button></div></article></section><div class="dressActions"><button data-reset-draft>恢复</button><button class="primary" data-save-draft>保存穿搭</button></div></div>`}
  function shopScene(){return `<div class="shopPage v23Shop"><section class="shopHero"><small>STARLIGHT BOUTIQUE</small><h2>服饰商城</h2><p>首发系列先收入一套完整成品。</p></section><article class="v23ShopCard"><div>${figure(OUTFIT_ID,true)}</div><section><small>已拥有 · 初始赠礼</small><h3>雾城漫步·银灰旅装</h3><p>完整高清套装</p><button disabled>已收入衣橱</button></section></article></div>`}
  function rewardsScene(){return `<div class="rewardsPage"><section class="shopHero"><small>REAL LIFE → DRESS-UP</small><h2>行动兑换新衣</h2><p>完成现实任务获得金币，后续可用于解锁新的服装系列。</p></section><div class="rewardCards"><button data-workbench="today"><b>今日打卡</b><span>完成现实任务，继续积累金币</span></button><button data-workbench="focus"><b>番茄钟</b><span>专注完成后获得成长奖励</span></button><button data-workbench="plans"><b>成长计划</b><span>推进长期目标</span></button></div></div>`}
  function render(){money();if(scene==='shop'){title.textContent='服饰商城';root.innerHTML=shopScene()}else if(scene==='rewards'){title.textContent='奖励';root.innerHTML=rewardsScene()}else{title.textContent='星回衣橱';root.innerHTML=wardrobeScene()}app.querySelectorAll('[data-dress-scene]').forEach(b=>b.classList.toggle('active',b.dataset.dressScene===scene))}
  app.addEventListener('click',e=>{const nav=e.target.closest('[data-dress-scene]');if(nav){scene=nav.dataset.dressScene;render();return}if(e.target.closest('[data-toggle-outfit]')){draft=draft===OUTFIT_ID?null:OUTFIT_ID;render();return}if(e.target.closest('[data-reset-draft]')){draft=state.equipped;render();return}if(e.target.closest('[data-save-draft]')){state.equipped=draft;saveState('当前穿搭已保存');render();return}const wb=e.target.closest('[data-workbench]');if(wb){exitGame2d();if(typeof gotoPage==='function')gotoPage(wb.dataset.workbench)}});
  app.querySelector('.dressBack').addEventListener('click',exitGame2d);const legacyLeave=typeof leaveGame==='function'?leaveGame:function(){};
  function enterGame2d(){document.body.classList.add('game-mode','dressup-v21-active','dressup-v23-active');app.classList.add('open');scene='wardrobe';draft=state.equipped;render()}
  function exitGame2d(){app.classList.remove('open');document.body.classList.remove('game-mode','dressup-v21-active','dressup-v23-active');if(typeof baseGotoPage==='function')baseGotoPage('home');else legacyLeave()}
  enterGame=enterGame2d;leaveGame=exitGame2d;window.enterGameV5=enterGame2d;window.exitGameV5=exitGame2d;window.renderGameV5=render;
})();