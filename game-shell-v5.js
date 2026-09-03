/* 星回衣橱 v31c：修复 v31b 脱衣后残留与底图变糊。
 * 核心原则：主试穿区始终使用同一套高清直接透明图层，不再在“完整套装原图”和“Base64 重组图”之间切换。
 */
(function(){
  const VERSION='31c';
  const OUTFIT='assets/avatar-v5/mist-city-walk-preview.png';
  const IMG={
    base:'assets/avatar-parts/base.png',
    top:'assets/dressup-v24/mist-top.webp',
    bottom:'assets/dressup-v24/mist-bottom.webp',
    outer:'assets/dressup-v24/mist-outer-back.webp',
    shoes:'assets/dressup-v24/mist-shoes.webp'
  };
  const FULL={top:true,bottom:true,outer:true,shoes:true};
  const SLOTS=['top','bottom','outer','shoes'];
  const META={
    top:{tab:'上装',name:'雾白针织高领毛衣'},
    bottom:{tab:'下装',name:'灰蓝链饰工装长裤'},
    outer:{tab:'外套',name:'冰霜星辉长风衣'},
    shoes:{tab:'鞋履',name:'白色系带运动鞋'}
  };

  const D0=window.D||{};window.D=D0;D0.game2d=D0.game2d||{};const state=D0.game2d;
  if(!state.mistV31)state.mistV31={equipped:{...FULL}};
  state.mistV31.equipped={...FULL,...(state.mistV31.equipped||{})};
  let scene='wardrobe',tab='套装',draft={...state.mistV31.equipped};

  const old=document.getElementById('gameAppV5');if(old)old.remove();
  const app=document.createElement('section');app.id='gameAppV5';app.className='gameAppV5 dressupApp dressupV31 dressupV31c';
  function icon(name){const p={back:'<path d="M20 6 10 16l10 10M11 16h15"/>',wardrobe:'<path d="M12 6 8 8l-4 5 4 4 3-2v12h10V15l3 2 4-4-4-5-4-2c-.8 2-2 3-4 3s-3.2-1-4-3Z"/>',shop:'<path d="M7 11h18l-2 16H9Z"/><path d="M12 11V8a4 4 0 0 1 8 0v3M12 17h8"/>',rewards:'<circle cx="16" cy="12" r="7"/><path d="m16 7 1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.6-3 1.6.6-3.2-2.4-2.3 3.3-.5ZM11 19l-1 8 6-3 6 3-1-8"/>'};return `<svg viewBox="0 0 32 32" aria-hidden="true">${p[name]}</svg>`}
  app.innerHTML=`<header class="dressTopbar"><button class="dressBack" aria-label="返回工作台">${icon('back')}</button><div class="dressTitle"><small>STARLIGHT DRESS</small><b id="dressSceneTitle">星回衣橱</b></div><div class="dressCoins"><i>✦</i><b id="dressCoinCount">0</b></div></header><main class="dressScene" id="dressScene"></main><nav class="dressNav v23Nav"><button data-dress-scene="wardrobe">${icon('wardrobe')}<span>衣橱</span></button><button data-dress-scene="shop">${icon('shop')}<span>商城</span></button><button data-dress-scene="rewards">${icon('rewards')}<span>奖励</span></button></nav>`;
  document.body.appendChild(app);

  const style=document.createElement('style');
  style.textContent=`
  .dressupV31 .dressTabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin:10px 0 12px}
  .dressupV31 .dressTabs button{min-width:0;padding:8px 2px;border:0;border-radius:10px;background:#eef1f7;color:#657086;font-size:12px}
  .dressupV31 .dressTabs button.active{background:#fff;box-shadow:0 3px 12px #8794b52b;color:#405276;font-weight:700}
  .dressupV31 .v31Figure{width:100%;height:100%;position:relative;overflow:visible}
  .dressupV31 .v31Layer{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;user-select:none;-webkit-user-drag:none;image-rendering:auto}
  .dressupV31 .v31Layer.base{z-index:1}.dressupV31 .v31Layer.bottom{z-index:2}.dressupV31 .v31Layer.top{z-index:3}.dressupV31 .v31Layer.shoes{z-index:4}.dressupV31 .v31Layer.outer{z-index:5}
  .dressupV31 .v31PieceGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .dressupV31 .v31Piece{border:1px solid #e2e7f1;border-radius:15px;background:#fff;padding:8px;text-align:left}
  .dressupV31 .v31Piece.selected{border-color:#9baed6;box-shadow:0 4px 14px #7489b426}
  .dressupV31 .pieceArt{height:116px;display:block;background:linear-gradient(180deg,#f8f9fc,#eef2f8);border-radius:11px;overflow:hidden;position:relative}
  .dressupV31 .pieceArt .v31Figure{height:100%}
  .dressupV31 .v31Piece b,.dressupV31 .v31Piece small,.dressupV31 .v31Piece em{display:block}
  .dressupV31 .v31Piece b{font-size:12px;margin-top:7px}.dressupV31 .v31Piece small{font-size:10px;color:#9199aa;margin-top:2px}.dressupV31 .v31Piece em{font-style:normal;font-size:10px;color:#7585aa;margin-top:5px}`;
  document.head.appendChild(style);

  const root=app.querySelector('#dressScene'),title=app.querySelector('#dressSceneTitle');
  const complete=l=>SLOTS.every(s=>!!l[s]),count=l=>SLOTS.filter(s=>!!l[s]).length;
  const lookName=l=>complete(l)?'雾城漫步·银灰旅装':count(l)?`自由混搭 · ${count(l)}件`:'基础造型';
  function money(){const el=app.querySelector('#dressCoinCount');if(el)el.textContent=Number(D0.coins||0)}
  function layer(slot){return `<img class="v31Layer ${slot}" src="${IMG[slot]}?v=${VERSION}" alt="" draggable="false">`}
  function figure(l=draft,mini=false){return `<div class="v31Figure ${mini?'mini':''}" role="img" aria-label="${lookName(l)}">${layer('base')}${l.bottom?layer('bottom'):''}${l.top?layer('top'):''}${l.shoes?layer('shoes'):''}${l.outer?layer('outer'):''}</div>`}
  function setPreview(){return `<div class="v23Figure mini outfitFigure"><img src="${OUTFIT}?v=${VERSION}" alt="雾城漫步·银灰旅装" draggable="false"></div>`}
  function isolated(slot){return `<div class="v31Figure" role="img" aria-label="${META[slot].name}">${layer(slot)}</div>`}
  function tabs(){return `<div class="dressTabs">${['套装','上装','下装','外套','鞋履'].map(t=>`<button data-v31-tab="${t}" class="${tab===t?'active':''}">${t}</button>`).join('')}</div>`}
  function pieceCard(slot){const m=META[slot],on=!!draft[slot];return `<button class="v31Piece ${on?'selected':''}" data-toggle-slot="${slot}"><span class="pieceArt">${isolated(slot)}</span><b>${m.name}</b><small>雾城漫步</small><em>${on?'再次点击脱下':'点击试穿'}</em></button>`}
  function drawer(){if(tab==='套装')return `<article class="v23SetCard ${complete(draft)?'selected':''}"><div class="v23SetPreview">${setPreview()}</div><div class="v23SetInfo"><small>SSR · V31C CLEAN LAYERS</small><h3>雾城漫步·银灰旅装</h3><p>主试穿区固定使用同一套透明图层，脱下单件只隐藏该层，不再替换人物底图。</p><button data-wear-set>整套试穿</button></div></article>`;const slot=Object.keys(META).find(s=>META[s].tab===tab);return `<div class="v31PieceGrid">${pieceCard(slot)}</div>`}
  function wardrobeScene(){return `<div class="v23Wardrobe"><section class="characterPanel v23CharacterPanel"><div class="characterGlow"></div>${figure(draft)}</section><div class="lookSummary"><div><small>当前试穿</small><b>${lookName(draft)}</b></div><span>固定底模 · 独立透明层</span></div><section class="v23Drawer"><div class="wardrobePanelHead"><div><small>WARDROBE</small><b>星光衣橱</b></div><span>4 个独立槽位</span></div>${tabs()}${drawer()}</section><div class="dressActions"><button data-reset-draft>恢复</button><button class="primary" data-save-draft>保存穿搭</button></div></div>`}
  function shopScene(){return `<div class="shopPage v23Shop"><section class="shopHero"><small>STARLIGHT BOUTIQUE</small><h2>服饰商城</h2><p>首发套装支持四个独立槽位。</p></section><article class="v23ShopCard"><div>${setPreview()}</div><section><small>已拥有 · 初始赠礼</small><h3>雾城漫步·银灰旅装</h3><p>上装 / 下装 / 外套 / 鞋履</p><button disabled>已收入衣橱</button></section></article></div>`}
  function rewardsScene(){return `<div class="rewardsPage"><section class="shopHero"><small>REAL LIFE → DRESS-UP</small><h2>行动兑换新衣</h2><p>完成现实任务获得金币，后续用于解锁更多独立服装。</p></section></div>`}
  function render(){money();if(scene==='shop'){title.textContent='服饰商城';root.innerHTML=shopScene()}else if(scene==='rewards'){title.textContent='奖励';root.innerHTML=rewardsScene()}else{title.textContent='星回衣橱';root.innerHTML=wardrobeScene()}app.querySelectorAll('[data-dress-scene]').forEach(b=>b.classList.toggle('active',b.dataset.dressScene===scene))}
  function persist(){state.mistV31.equipped={...draft};if(typeof save==='function')save();if(typeof toast==='function')toast('当前穿搭已保存')}
  app.addEventListener('click',e=>{const nav=e.target.closest('[data-dress-scene]');if(nav){scene=nav.dataset.dressScene;render();return}const tb=e.target.closest('[data-v31-tab]');if(tb){tab=tb.dataset.v31Tab;render();return}if(e.target.closest('[data-wear-set]')){draft={...FULL};render();return}const item=e.target.closest('[data-toggle-slot]');if(item){const s=item.dataset.toggleSlot;draft[s]=!draft[s];render();return}if(e.target.closest('[data-reset-draft]')){draft={...state.mistV31.equipped};render();return}if(e.target.closest('[data-save-draft]')){persist();render();return}});
  const legacyLeave=typeof leaveGame==='function'?leaveGame:function(){};
  function enterGame2d(){document.body.classList.add('game-mode','dressup-v21-active','dressup-v23-active','dressup-v31-active');app.classList.add('open');scene='wardrobe';tab='套装';draft={...state.mistV31.equipped};render()}
  function exitGame2d(){app.classList.remove('open');document.body.classList.remove('game-mode','dressup-v21-active','dressup-v23-active','dressup-v31-active');if(typeof baseGotoPage==='function')baseGotoPage('home');else legacyLeave()}
  app.querySelector('.dressBack').addEventListener('click',exitGame2d);enterGame=enterGame2d;leaveGame=exitGame2d;window.enterGameV5=enterGame2d;window.exitGameV5=exitGame2d;window.renderGameV5=render;
})();
