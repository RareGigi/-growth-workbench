(()=>{
  const cache={};
  async function load(name){
    if(cache[name])return cache[name];
    const t=await fetch(`assets/blue/${name}-inline.b64?v=blue-hd-9`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`${name}:${r.status}`);return r.text()});
    const raw=t.replace(/\s+/g,'').match(/^[A-Za-z0-9+/=]+/)?.[0];
    if(!raw||raw.length<4000)throw new Error(`${name}:invalid`);
    return cache[name]=`data:image/webp;base64,${raw}`;
  }
  async function apply(){
    const names=['hero','avatar','outfits','scenes'];
    const settled=await Promise.allSettled(names.map(load));
    const got={};settled.forEach((r,i)=>{if(r.status==='fulfilled')got[names[i]]=r.value});
    if(got.hero)document.querySelectorAll('img').forEach(img=>{const s=img.getAttribute('src')||'';if(/(?:^|\/)hero\.webp(?:\?|$)/.test(s)&&img.dataset.hd!=='hero'){img.dataset.hd='hero';img.hidden=false;img.src=got.hero}});
    if(got.avatar)document.querySelectorAll('img').forEach(img=>{const s=img.getAttribute('src')||'';if(/(?:^|\/)avatar\.webp(?:\?|$)/.test(s)&&img.dataset.hd!=='avatar'){img.dataset.hd='avatar';img.hidden=false;img.src=got.avatar}});
    if(got.outfits){document.documentElement.style.setProperty('--outfits-hd',`url("${got.outfits}")`);document.documentElement.classList.add('hdOutfitsReady')}
    if(got.scenes){document.documentElement.style.setProperty('--scenes-hd',`url("${got.scenes}")`);document.documentElement.classList.add('hdScenesReady')}
    if(got.hero||got.avatar)document.documentElement.classList.add('hdAssetsReady');
  }
  let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})};
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('load',apply);apply();
})();