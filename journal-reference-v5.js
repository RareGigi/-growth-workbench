/* Reference layout v5 — match approved visual composition while keeping real app interactions */
(function(){
  const FILES={hero:'assets/journal/hero-desk.webp.b64',mascot:'assets/journal/mascot-card.webp.b64'};
  const assetCache={};
  async function asset(kind){if(assetCache[kind])return assetCache[kind];const text=await fetch(FILES[kind],{cache:'no-store'}).then(r=>r.text());return assetCache[kind]='data:image/webp;base64,'+text.trim()}
  async function fillImage(img,kind){if(!img)return;try{img.src=await asset(kind)}catch(e){console.warn('asset load failed',kind,e)}}
  function dateBits(){const d=new Date();return {m:d.getMonth()+1,day:d.getDate(),week:['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][d.getDay()]}}
  function ensureTodayLayout(){
    const main=document.querySelector('.journalMain');
    const head=main?.querySelector('.todayHead');
    if(!main||!head){document.body.classList.remove('reference-today');return}
    document.body.classList.add('reference-today');
    if(!main.querySelector('.referenceHero')){
      const d=dateBits();
      const hero=document.createElement('section');
      hero.className='referenceHero';
      hero.innerHTML=`<img alt="温柔书桌场景"><div class="referenceHeroNote">慢一点，也很好。<br>你正在成为自己喜欢的样子。♡</div><div class="referenceDate"><b>${d.m}月${d.day}日</b><span>${d.week}　☀</span><p>今天也留下一点自己的痕迹。</p></div>`;
      head.replaceWith(hero); fillImage(hero.querySelector('img'),'hero');
    }
    if(!main.querySelector('.referenceMascotCard')){
      const card=document.createElement('button');
      card.type='button'; card.className='referenceMascotCard';
      card.innerHTML=`<img alt="我的小形象">`;
      fillImage(card.querySelector('img'),'mascot');
      card.addEventListener('click',()=>document.querySelector('[data-page="collection"]')?.click());
      const daily=main.querySelector('.dailyNote,.journalLine');
      (daily||main).insertAdjacentElement('afterend',card);
    }
    if(!main.querySelector('.referenceReward')){
      const reward=document.createElement('div');reward.className='referenceReward';
      const star=document.querySelector('.wallet span:nth-child(2) b')?.textContent||'0';
      reward.innerHTML=`<span class="rewardBunny">♡</span><div><b>今天获得 ${star} 颗星星</b><small>继续保持，明天也一起加油吧～</small></div><i>›</i>`;
      const grid=main.querySelector('.todayGrid');grid?.insertAdjacentElement('afterend',reward);
    }
  }
  function syncMascot(){document.querySelectorAll('.mascotCard .mascot,.focusDesk .mascot,.closetAvatar .mascot').forEach(el=>{if(el.dataset.refImg)return;el.dataset.refImg='1';el.innerHTML='<img class="mascotArtwork" alt="原创成长小形象">';fillImage(el.querySelector('img'),'mascot')})}
  function polish(){ensureTodayLayout();syncMascot();}
  new MutationObserver(()=>requestAnimationFrame(polish)).observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('DOMContentLoaded',polish); polish();
})();