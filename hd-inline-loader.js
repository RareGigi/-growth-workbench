(()=>{
  const cache={};
  async function load(name){
    if(cache[name])return cache[name];
    const t=await fetch(`assets/blue/${name}-inline.b64?v=3`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.text()});
    const m=t.match(/^[A-Za-z0-9+/=]+/);
    if(!m)throw new Error(`invalid asset: ${name}`);
    return cache[name]=`data:image/webp;base64,${m[0]}`;
  }
  async function apply(){
    try{
      const [hero,avatar,outfits,scenes]=await Promise.all([load('hero'),load('avatar'),load('outfits'),load('scenes')]);
      document.querySelectorAll('img').forEach(img=>{
        const s=img.getAttribute('src')||'';
        if(/(?:^|\/)hero\.webp(?:\?|$)/.test(s)&&img.src!==hero) img.src=hero;
        if(/(?:^|\/)avatar\.webp(?:\?|$)/.test(s)&&img.src!==avatar) img.src=avatar;
      });
      document.documentElement.style.setProperty('--outfits-hd',`url("${outfits}")`);
      document.documentElement.style.setProperty('--scenes-hd',`url("${scenes}")`);
      document.documentElement.classList.add('hdAssetsReady');
    }catch(e){console.warn('HD assets fallback',e)}
  }
  const ob=new MutationObserver(()=>requestAnimationFrame(apply));
  ob.observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('load',apply);
  apply();
})();