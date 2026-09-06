(()=>{
  function mount(){
    const app=document.querySelector('.app');
    const top=document.querySelector('.topbar');
    if(!app||!top||top.querySelector('.mobileProjectBtn')) return;
    const b=document.createElement('button');
    b.className='mobileProjectBtn';
    b.type='button';
    b.setAttribute('aria-label','打开项目栏');
    b.innerHTML='<span></span><span></span><span></span>';
    b.onclick=()=>app.classList.toggle('mobileSidebarOpen');
    top.prepend(b);
    const side=document.querySelector('.sidebar');
    if(side){
      const close=document.createElement('button');
      close.className='mobileSidebarClose';
      close.type='button';
      close.textContent='×';
      close.onclick=()=>app.classList.remove('mobileSidebarOpen');
      side.appendChild(close);
    }
    document.addEventListener('click',e=>{
      const a=document.querySelector('.app');
      if(!a?.classList.contains('mobileSidebarOpen')) return;
      if(e.target.closest('.sidebar')||e.target.closest('.mobileProjectBtn')) return;
      a.classList.remove('mobileSidebarOpen');
    });
  }
  const obs=new MutationObserver(()=>requestAnimationFrame(mount));
  obs.observe(document.documentElement,{childList:true,subtree:true});
  requestAnimationFrame(mount);
})();