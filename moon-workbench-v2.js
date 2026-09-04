/* Moon Workbench integration v2: route legacy game entry directly to Moon Garden. */
(function(){
  function relabel(){
    const brand=document.querySelector('.brand b'); if(brand) brand.textContent='成长工作台';
    const gameBtn=document.querySelector('#nav [data-page="game"]'); if(gameBtn) gameBtn.textContent='月相庭院';
    const side=document.querySelector('.sideStats'); if(side) side.innerHTML=side.innerHTML.replace(/金币/g,'月辉');
  }
  function openGarden(){
    document.getElementById('sidebar')?.classList.remove('open');
    const legacy=document.getElementById('game'); if(legacy) legacy.classList.remove('active');
    if(typeof window.enterGameV5==='function') window.enterGameV5();
    else if(typeof window.enterGame==='function') window.enterGame();
  }
  document.addEventListener('click',function(e){
    const btn=e.target.closest('#nav [data-page="game"], [data-go="game"]');
    if(!btn) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    openGarden();
  },true);
  function cleanLegacy(){
    const legacy=document.getElementById('game');
    if(legacy){ legacy.setAttribute('aria-hidden','true'); legacy.style.display='none'; }
    relabel();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',cleanLegacy); else cleanLegacy();
  window.openMoonGarden=openGarden;
})();
