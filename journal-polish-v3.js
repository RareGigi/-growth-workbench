/* Journal polish v3: illustrated mascot + UI finishing layer */
(function(){
  const ART='assets/journal/mascot-v1.webp';
  function replaceMascots(root=document){
    root.querySelectorAll('.mascot').forEach(el=>{
      if(el.dataset.illustrated==='1') return;
      el.dataset.illustrated='1';
      el.innerHTML=`<img class="mascotArtwork" src="${ART}" alt="原创成长小形象">`;
    });
  }
  function refineLabels(){
    document.querySelectorAll('.mascotNote').forEach(el=>{
      if(!el.dataset.refined){el.dataset.refined='1';el.textContent='今天做一点点，也是在认真生活。';}
    });
  }
  function polish(){replaceMascots();refineLabels();document.documentElement.classList.add('journal-polished-v3');}
  const observer=new MutationObserver(()=>requestAnimationFrame(polish));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',polish);
  polish();
})();