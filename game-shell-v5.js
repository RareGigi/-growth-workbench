/* 星回衣橱 v25：固定Q版人物 + 雾城漫步独立位图单品。 */
(function(){
 const VERSION=25,BASE='assets/dressup-2d/base-approved.webp',A='assets/dressup-v24/';
 const FULL='assets/avatar-v5/mist-city-walk-preview.png';
 const D0=window.D||{};window.D=D0;D0.game2d=D0.game2d||{};const state=D0.game2d;
 const slots=['top','bottom','outer','shoes'],starter={top:true,bottom:true,outer:true,shoes:true};
 if(state.catalogVersion!==VERSION){state.catalogVersion=VERSION;state.mistEquipped={...starter};}
 state.mistEquipped={...starter,...(state.mistEquipped||{})};
 const meta={
  top:{tab:'上装',name:'奶油白针织高领毛衣',src:A+'mist-top.webp'},
  bottom:{tab:'下装',name:'灰蓝链饰工装长裤',src:A+'mist-bottom.webp'},
  outer:{tab:'外套',name:'冰霜星辉流光长外套',src:A+'mist-outer-back.webp'},
  shoes:{tab:'鞋履',name:'白色系带运动鞋',src:A+'mist-shoes.webp'}
 };
 const old=document.getElementById('gameAppV5');if(old)old.remove();
 const app=document.createElement('section');app.id='gameAppV5';app.className='gameAppV5 dressupApp dressupV25';
 app.innerHTML=`<header class="dressTopbar"><button class="dressBack" aria-label="返回工作台">${icon('back')}</button><div class="dressTitle"><small>STARLIGHT DRESS</small><b id="dressSceneTitle">星回衣橱</b></div><div class="dressCoins"><i>✦</i><b id="dressCoinCount">0</b></div></header><main class="dressScene" id="dressScene"></main><nav class="dressNav v23Nav"><button data-dress-scene="wardrobe">${icon('wardrobe')}<span>衣橱</span></button><button data-dress-scene="shop">${icon('shop')}<span>商城</span></button><button data-dress-scene="rewards">${icon('rewards')}<span>奖励</span></button></nav>`;
 document.body.appendChild(app);const root=app.querySelector('#dressScene'),title=app.querySelector('#dressSceneTitle');
 let scene='wardrobe',tab='套装',draft={...state.mistEquipped};const tabs=['套装','上装','下装','外套','鞋履'];
 function icon(name){const p={back:'<path d="M20 6 10 16l10 10M11 16h15"/>',wardrobe:'<path d="M12 6 8 8l-4 5 4 4 3-2v12h10V15l3 2 4-4-4-5-4-2c-.8 2-2 3-4 3s-3.2-1-4-3Z"/>',shop:'<path d="M7 11h18l-2 16H9Z"/><path d="M12 11V8a4 4 0 0 1 8 0v3M12 17h8"/>',rewards:'<circle cx="16" cy="12" r="7"/><path d="m16 7 1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.6-3 1.6.6-3.2-2.4-2.3 3.3-.5ZM11 19l-1 8 6-3 6 3-1-8"/>'};return `<svg viewBox="0 0 32 32" aria-hidden="true">${p[name]}</svg>`}
 function money(){const el=app.querySelector('#dressCoinCount');if(el)el.textContent=Number(D0.coins||0)}
 function complete(l=draft){return slots.every(s=>l[s])} function count(l=draft){return slots.filter(s=>l[s]).length}
 function label(l=draft){return complete(l)?'雾城漫步·银灰旅装':(count(l)?`自由混搭 · ${count(l)}件`:'基础造型')}
 function figure(l=draft,mini=false){
  const imgs=[BASE,l.bottom?meta.bottom.src:null,l.top?meta.top.src:null,l.shoes?meta.shoes.src:null,l.outer?meta.outer.src:null].filter(Boolean);
  return `<div class="v25Figure ${mini?'mini':''}"><svg viewBox="0 0 1254 1254" role="img" aria-label="${label(l)}">${imgs.map(src=>`<image href="${src}?v=${VERSION}" x="0" y="0" width="1254" height="1254" preserveAspectRatio="xMidYMid meet"/>`).join('')}</svg></div>`;
 }
 function tabsHtml(){return `<div class="dressTabs">${tabs.map(t=>`<button data-v25-tab="${t}" class="${t===tab?'active':''}">${t}</button>`).join('')}</div>`}
 function card(slot){const m=meta[slot],on=!!draft[slot],single={top:false,bottom:false,outer:false,shoes:false};single[slot]=true;return `<button class="pieceCard v25Piece ${on?'selected':''}" data-toggle-slot="${slot}"><span class="pieceArt">${figure(single,true)}</span><b>${m.name}</b><small>雾城漫步</small><em>${on?'再次点击脱下':'点击试穿'}</em></button>`}
 function drawer(){
  if(tab==='套装')return `<article class="v23SetCard ${complete()?'selected':''}"><div class="v23SetPreview"><div class="v23Figure mini"><img src="${FULL}?v=${VERSION}" alt="雾城漫步完整套装"></div></div><div class="v23SetInfo"><small>SSR · FIRST SPLIT SET</small><h3>雾城漫步·银灰旅装</h3><p>已经拆成上装、下装、外套和鞋履四个独立槽位。</p><button data-wear-set>${complete()?'已整套穿上':'整套试穿'}</button></div></article>`;
  const slot=Object.keys(meta).find(s=>meta[s].tab===tab);return `<div class="pieceGrid v25PieceGrid">${card(slot)}</div>`;
 }
 function wardrobe(){return `<div class="v23Wardrobe v25Wardrobe"><section class="characterPanel v23CharacterPanel"><div class="characterGlow"></div>${figure(draft)}</section><div class="lookSummary"><div><small>当前试穿</small><b>${label(draft)}</b></div><span>固定母版 · 独立位图</span></div><section class="v23Drawer"><div class="wardrobePanelHead"><div><small>WARDROBE</small><b>星光衣橱</b></div><span>4 个独立槽位</span></div>${tabsHtml()}${drawer()}</section><div class="dressActions"><button data-reset-draft>恢复</button><button class="primary" data-save-draft>保存穿搭</button></div></div>`}
 function shop(){return `<div class="shopPage v23Shop"><section class="shopHero"><small>STARLIGHT BOUTIQUE</small><h2>服饰商城</h2><p>首发套装已经进入独立单品模式，后续服装继续沿用同一拆分规范。</p></section><article class="v23ShopCard"><div><div class="v23Figure mini"><img src="${FULL}?v=${VERSION}" alt="雾城漫步"></div></div><section><small>已拥有 · 初始赠礼</small><h3>雾城漫步·银灰旅装</h3><p>上装 / 下装 / 外套 / 鞋履</p><button disabled>已收入衣橱</button></section></article></div>`}
 function rewards(){return `<div class="rewardsPage"><section class="shopHero"><small>REAL LIFE → DRESS-UP</small><h2>行动兑换新衣</h2><p>完成现实任务获得金币，后续用于解锁新的独立服装单品。</p></section><div class="rewardCards"><button data-workbench="today"><b>今日打卡</b><span>继续积累金币</span></button><button data-workbench="focus"><b>番茄钟</b><span>专注完成后获得奖励</span></button><button data-workbench="plans"><b>成长计划</b><span>推进长期目标</span></button></div></div>`}
 function render(){money();if(scene==='shop'){title.textContent='服饰商城';root.innerHTML=shop()}else if(scene==='rewards'){title.textContent='奖励';root.innerHTML=rewards()}else{title.textContent='星回衣橱';root.innerHTML=wardrobe()}app.querySelectorAll('[data-dress-scene]').forEach(b=>b.classList.toggle('active',b.dataset.dressScene===scene))}
 function saveState(){state.mistEquipped={...draft};if(typeof save==='function')save();if(typeof toast==='function')toast('当前穿搭已保存')}
 app.addEventListener('click',e=>{const nav=e.target.closest('[data-dress-scene]');if(nav){scene=nav.dataset.dressScene;render();return}const tb=e.target.closest('[data-v25-tab]');if(tb){tab=tb.dataset.v25Tab;render();return}const item=e.target.closest('[data-toggle-slot]');if(item){const s=item.dataset.toggleSlot;draft[s]=!draft[s];render();return}if(e.target.closest('[data-wear-set]')){draft={...starter};render();return}if(e.target.closest('[data-reset-draft]')){draft={...state.mistEquipped};render();return}if(e.target.closest('[data-save-draft]')){saveState();render();return}const wb=e.target.closest('[data-workbench]');if(wb){exitGame2d();if(typeof gotoPage==='function')gotoPage(wb.dataset.workbench)}});
 app.querySelector('.dressBack').addEventListener('click',exitGame2d);const legacyLeave=typeof leaveGame==='function'?leaveGame:function(){};
 function enterGame2d(){document.body.classList.add('game-mode','dressup-v21-active','dressup-v23-active','dressup-v25-active');app.classList.add('open');scene='wardrobe';tab='套装';draft={...state.mistEquipped};render()}
 function exitGame2d(){app.classList.remove('open');document.body.classList.remove('game-mode','dressup-v21-active','dressup-v23-active','dressup-v25-active');if(typeof baseGotoPage==='function')baseGotoPage('home');else legacyLeave()}
 enterGame=enterGame2d;leaveGame=exitGame2d;window.enterGameV5=enterGame2d;window.exitGameV5=exitGame2d;window.renderGameV5=render;
})();