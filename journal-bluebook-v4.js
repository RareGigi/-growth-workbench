(()=>{
  const CORE='./journal-reference-v5.js?v=bluebook-core-1';
  const STATE='little-growth-book-rebuild-v2';
  const OUTFITS=[
    ['assets/xavier-wardrobe-1.webp','日常 · 晨雾'],
    ['assets/xavier-wardrobe-2.webp','学院 · 灰蓝'],
    ['assets/xavier-wardrobe-3.webp','特别 · 星夜']
  ];
  const STICKERS=[
    ['star','星星'],['flower','小花'],['planet','行星'],['book','书本'],['cat','小猫'],['cup','咖啡杯'],['headphones','耳机'],['tape','纸胶带']
  ];
  function read(){try{return JSON.parse(localStorage.getItem(STATE)||'{}')}catch{return{}}}
  function write(s){localStorage.setItem(STATE,JSON.stringify(s))}
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function svg(type){
    const map={
      star:'<path d="M12 3l2.7 5.4 6 .9-4.4 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.4-4.2 6-.9z"/>',
      flower:'<circle cx="12" cy="12" r="2.3"/><circle cx="12" cy="6.2" r="3"/><circle cx="17.4" cy="10" r="3"/><circle cx="15.3" cy="16.3" r="3"/><circle cx="8.7" cy="16.3" r="3"/><circle cx="6.6" cy="10" r="3"/>',
      planet:'<circle cx="12" cy="12" r="4.5"/><path d="M3.7 13.8c2.5 2 7.6 2 12.2-.2 4.2-2 6.6-4.8 5.5-6.2-1-1.2-4-.8-7.4.8"/>',
      book:'<path d="M4 6.5c3-1.1 5.4-.7 8 1.3v11c-2.6-2-5-2.4-8-1.3zM20 6.5c-3-1.1-5.4-.7-8 1.3v11c2.6-2 5-2.4 8-1.3z"/>',
      cat:'<path d="M7 9 5 5l4 2a8 8 0 0 1 6 0l4-2-2 4a7 7 0 1 1-10 0z"/><path d="M9.2 13h.1M14.7 13h.1M10 16c1.3.8 2.7.8 4 0"/>',
      cup:'<path d="M5 8h11v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM16 10h2.2a2.8 2.8 0 0 1 0 5.6H16M8 4c0 1 1 1.4 1 2.4M12 4c0 1 1 1.4 1 2.4"/>',
      headphones:'<path d="M5 13v-2a7 7 0 0 1 14 0v2M5 13H3v6h4v-6zm14 0h2v6h-4v-6z"/>',
      tape:'<path d="M5 7h14v10H5z"/><path d="m5 10 3-3 3 3 3-3 3 3 2-2"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${map[type]||map.star}</svg>`;
  }
  function stats(){
    const s=read();
    const all=Object.values(s.tasks||{}).flat();
    const now=new Date();
    const prefix=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const monthTasks=all.filter(x=>x.done&&String(x.doneAt?new Date(x.doneAt).toISOString().slice(0,7):'').startsWith(prefix));
    const focus=(s.focus||[]).filter(x=>String(x.date||'').startsWith(prefix)).reduce((n,x)=>n+(x.m||0),0);
    const journalDays=Object.keys(s.journal||{}).filter(k=>k.startsWith(prefix)&&(s.journal[k]||'').trim()).length;
    const unlocked=Math.min(8,(s.stickers||[]).length||Math.max(1,Math.floor(all.filter(x=>x.done).length/2)+1));
    return {s,all,monthTasks,focus,journalDays,unlocked};
  }
  function shelf(){
    if(!document.querySelector('.page.active .hero')||document.querySelector('.journalShelf'))return;
    const next=document.querySelector('.nextCard'); if(!next)return;
    const {unlocked}=stats();
    const el=document.createElement('section');el.className='journalShelf';
    el.innerHTML=`<div class="journalShelfText"><b>本周贴纸</b><small>已经收下 ${unlocked} 枚小纪念</small></div><div class="miniStickerRow">${STICKERS.slice(0,Math.min(unlocked,6)).map(([t])=>`<span class="miniSticker">${svg(t)}</span>`).join('')}</div>`;
    next.insertAdjacentElement('afterend',el);
  }
  function enhanceCollection(){
    const page=document.querySelector('.page.active');
    if(!page||!page.querySelector('.collectionGrid')||page.dataset.blueEnhanced==='1')return;
    page.dataset.blueEnhanced='1';
    const {s,monthTasks,focus,journalDays,unlocked}=stats();
    const selected=Math.max(0,Math.min(OUTFITS.length-1,+s.selectedOutfit||0));
    const firstFocus=(s.focus||[]).length>0;
    const done=Object.values(s.tasks||{}).flat().filter(x=>x.done).length;
    const badges=[
      ['第一次专注',firstFocus],['完成 10 件',done>=10],['收集 6 枚贴纸',unlocked>=6]
    ];
    const m=new Date().getMonth()+1;
    page.querySelector('.collectionGrid').innerHTML=`
      <section class="card collectionHero">
        <div class="collectionHeroTop"><h3>我的衣橱</h3><small>固定比例 · 整套换装</small></div>
        <div class="wardrobeStage"><img id="blueWardrobeHero" src="${OUTFITS[selected][0]}" alt="当前造型"></div>
        <div class="wardrobeThumbs">${OUTFITS.map((o,i)=>`<button class="wardrobeThumb ${i===selected?'active':''}" data-blue-outfit="${i}"><img src="${o[0]}" alt="${esc(o[1])}"><span>${esc(o[1])}</span></button>`).join('')}</div>
      </section>
      <div class="collectionStack">
        <section class="card albumPanel"><h3>手账贴纸册</h3><div class="stickerGallery">${STICKERS.map(([t,n],i)=>`<div class="stickerTile ${i>=unlocked?'locked':''}">${svg(t)}<small>${i<unlocked?esc(n):'待解锁'}</small></div>`).join('')}</div></section>
        <section class="card badgePanel"><h3>成长徽章</h3><div class="badgeGrid">${badges.map(([n,on])=>`<div class="badgeCoin ${on?'':'locked'}"><div class="badgeMedal"></div><b>${esc(n)}</b><small>${on?'已获得':'继续记录'}</small></div>`).join('')}</div></section>
        <section class="card monthPanel"><h3>月度纪念</h3><div class="monthMemory"><b>${m}月 · 生长页</b><p>完成 ${monthTasks.length} 件现实任务<br>专注 ${focus} 分钟 · 写下 ${journalDays} 天记录</p><div class="collectionStats"><span>☆ ${s.stars||0} 星星</span><span>○ ${s.coins||0} 金币</span><span>${unlocked}/8 贴纸</span></div></div></section>
      </div>`;
    page.querySelectorAll('[data-blue-outfit]').forEach(b=>b.addEventListener('click',()=>{
      const i=+b.dataset.blueOutfit,st=read();st.selectedOutfit=i;write(st);
      const hero=document.querySelector('#blueWardrobeHero');if(hero)hero.src=OUTFITS[i][0];
      page.querySelectorAll('.wardrobeThumb').forEach((x,j)=>x.classList.toggle('active',j===i));
    }));
  }
  function decorate(){shelf();enhanceCollection()}
  const obs=new MutationObserver(()=>requestAnimationFrame(decorate));
  obs.observe(document.documentElement,{subtree:true,childList:true});
  const script=document.createElement('script');script.src=CORE;script.onload=()=>setTimeout(decorate,60);document.head.appendChild(script);
})();
