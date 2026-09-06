(()=>{
  function mount(){
    const app=document.querySelector('.app');
    const top=document.querySelector('.topbar');
    if(!app||!top||top.querySelector('.mobileProjectBtn')) return;
    const b=document.createElement('button');
    b.className='mobileProjectBtn';
    b.type='button';
    b.setAttribute('aria-label','打开项目栏');
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h7l2 2h9v10H3z"/></svg><span>项目</span>';
    b.onclick=e=>{e.stopPropagation();app.classList.toggle('mobileSidebarOpen')};
    top.prepend(b);
    const side=document.querySelector('.sidebar');
    if(side&&!side.querySelector('.mobileSidebarClose')){
      const close=document.createElement('button');
      close.className='mobileSidebarClose';
      close.type='button';
      close.setAttribute('aria-label','关闭项目栏');
      close.textContent='×';
      close.onclick=e=>{e.stopPropagation();app.classList.remove('mobileSidebarOpen')};
      side.appendChild(close);
    }
  }
  document.addEventListener('click',e=>{
    const app=document.querySelector('.app');
    if(!app?.classList.contains('mobileSidebarOpen')) return;
    if(e.target.closest('.sidebar')||e.target.closest('.mobileProjectBtn')) return;
    app.classList.remove('mobileSidebarOpen');
  });
  const obs=new MutationObserver(()=>requestAnimationFrame(mount));
  obs.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('load',mount);
  requestAnimationFrame(mount);
})();