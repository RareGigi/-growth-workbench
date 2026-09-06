(()=>{
  const VERSION='asset-v7';
  const repair=()=>{
    document.querySelectorAll('img[src*="assets/blue/"]').forEach(img=>{
      img.hidden=false;
      img.removeAttribute('onerror');
      img.decoding='async';
      const raw=(img.getAttribute('src')||'').split('?')[0];
      if(!img.dataset.stableAsset){
        img.dataset.stableAsset='1';
        img.src=raw+'?v='+VERSION;
      }
      img.onerror=()=>{
        img.onerror=null;
        img.hidden=false;
        img.classList.add('assetFailed');
        img.parentElement?.classList.add('imageFallback');
      };
      img.onload=()=>{
        img.hidden=false;
        img.classList.remove('assetFailed');
        img.parentElement?.classList.remove('imageFallback');
      };
    });
  };
  window.addEventListener('load',repair);
  new MutationObserver(()=>requestAnimationFrame(repair)).observe(document.documentElement,{childList:true,subtree:true});
  requestAnimationFrame(repair);
})();