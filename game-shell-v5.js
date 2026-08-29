/* 星轨成长舱 v5：独立全屏养成游戏外壳 */
(function () {
  const outfitCatalog = [
    { id:'moonlit-immortal', name:'月华仙衣', series:'东方古韵', rarity:5, price:520, preview:'assets/avatar-v5/moonlit-immortal-outfit-preview.png' },
    { id:'crimson-ceremony', name:'赤霄华章', series:'东方古韵', rarity:5, price:560, preview:'assets/avatar-v5/crimson-ceremony-preview.png' },
    { id:'mist-city-walk', name:'雾城漫步', series:'现代都市', rarity:5, price:460, preview:'assets/avatar-v5/mist-city-walk-preview.png' },
    { id:'bunny-bakery', name:'月绒烘焙屋', series:'兔兔可爱', rarity:5, price:440, preview:'assets/avatar-v5/bunny-bakery-preview.png' },
    { id:'midnight-banquet', name:'午夜星宴', series:'绅士典藏', rarity:5, price:520, preview:'assets/avatar-v5/midnight-banquet-preview.png' }
  ];

  D.game = D.game || {};
  D.game.ownedV5 = D.game.ownedV5 || ['moonlit-immortal'];
  D.game.equippedV5 = D.game.equippedV5 || 'moonlit-immortal';
  D.game.scene = D.game.scene || 'estate';

  const app = document.createElement('section');
  app.id = 'gameAppV5';
  app.className = 'gameAppV5';
  app.setAttribute('aria-label','星月家园养成游戏');
  app.innerHTML = `
    <header class="v5Topbar">
      <button class="v5Back" aria-label="返回">${gameIcon('back')}</button>
      <div class="v5Title"><small>STARLIGHT HOME</small><b id="v5SceneTitle">星月洋馆</b></div>
      <div class="v5Wallet">
        <span>${gameIcon('coin')}<b id="v5Coins">0</b></span>
        <span>${gameIcon('dust')}<b id="v5Dust">0</b></span>
      </div>
    </header>
    <main class="v5Scene" id="v5Scene"></main>
    <nav class="v5Nav" aria-label="养成游戏导航"></nav>`;
  document.body.append(app);

  const navItems = [
    ['estate','map','家园'], ['wardrobe','wardrobe','衣橱'], ['pet','pet','兔兔'],
    ['shop','shop','商城'], ['inventory','bag','仓库'], ['achievements','award','成就']
  ];
  const nav = app.querySelector('.v5Nav');
  nav.innerHTML = navItems.map(x=>`<button data-v5-scene="${x[0]}">${gameIcon(x[1])}<span>${x[2]}</span></button>`).join('');

  const sceneRoot = app.querySelector('#v5Scene');
  const sceneTitle = app.querySelector('#v5SceneTitle');
  let scene = 'estate';
  let history = [];

  function wallet(){
    app.querySelector('#v5Coins').textContent = D.coins;
    app.querySelector('#v5Dust').textContent = Math.floor(D.xp / 10);
  }

  function go(next, options={}){
    if (!options.replace && scene !== next) history.push(scene);
    scene = next;
    D.game.scene = next;
    save();
    render();
  }

  function back(){
    if (scene === 'estate' || history.length === 0) return exitGameV5();
    scene = history.pop() || 'estate';
    render();
  }

  function estateScene(){
    return `<div class="estateScene">
      <div class="estateCopy"><small>你的星光栖息地</small><h2>星月洋馆</h2><p>从现实里的每一次完成，带回一颗可以装点生活的星星。</p></div>
      <div class="estateHotspots">
        <button data-floor="1"><b>一层</b><span>客厅 · 书房 · 餐厅</span></button>
        <button data-floor="2"><b>二层</b><span>卧室 · 衣帽间 · 浴室</span></button>
        <button data-room="bunny"><b>兔兔房</b><span>喂养 · 玩耍 · 陪读</span></button>
        <button data-v5-scene="garden"><b>星梦花园</b><span>种植 · 散步 · 季节装扮</span></button>
      </div>
      <button class="estateDoor" data-floor="1"><span>进入洋馆</span></button>
    </div>`;
  }

  const floors = {
    1:[['living','星光客厅','会客、休息与主要家具展示'],['study','月影书房','专注学习获得额外家园经验'],['dining','银河餐厅','节日料理与兔兔点心']],
    2:[['bedroom','月光卧室','睡眠、收藏和卧室装扮'],['closet','星回衣帽间','进入独立全屏衣橱'],['bath','云雾浴室','放松状态与浴室套装']]
  };
  function floorScene(n){
    const rooms=floors[n];
    return `<div class="floorScene floor${n}"><div class="floorHero"><div><small>STARLIGHT MANOR · ${n}F</small><h2>${n===1?'日常生活区':'私人休息区'}</h2><p>房间独立保存布置；沿中央楼梯可自由切换楼层。</p></div><div class="floorSwitch"><button data-floor="1" class="${n===1?'active':''}"><b>1F</b><span>生活区</span></button><i></i><button data-floor="2" class="${n===2?'active':''}"><b>2F</b><span>休息区</span></button></div></div><div class="floorPlan"><div class="floorRooms">${rooms.map((r,i)=>`<button class="floorRoom room${i}" data-room="${r[0]}"><span class="doorGlow"></span><span class="roomNumber">0${i+1}</span><b>${r[1]}</b><small>${r[2]}</small></button>`).join('')}</div><button class="v5Stairs" data-floor="${n===1?2:1}"><span class="stairLines"><i></i><i></i><i></i><i></i></span><b>${n===1?'上楼':'下楼'}</b><small>${n===1?'前往二层私人区':'返回一层生活区'}</small></button></div></div>`;
  }

  function roomScene(room){
    const supported=['living','bedroom','bunny'];
    if(room==='bath')return `<div class="specialRoom bathRoom"><div class="specialRoomCopy"><small>2F · CLOUD MIST BATH</small><h2>云雾浴室</h2><p>把放松也记进成长：完成一次身体复盘，就能点亮浴室的水晶灯。</p><div class="specialActions"><button data-room-action="bath">泡一会儿 · +4 XP</button><button data-v5-scene="floor:2">返回二层地图</button></div></div></div>`;
    if(room==='garden')return gardenScene();
    if(!supported.includes(room)) return `<div class="comingScene"><div>${gameIcon('map')}</div><h2>${{study:'月影书房',dining:'银河餐厅',closet:'星回衣帽间',bath:'云雾浴室'}[room]||'新房间'}</h2><p>房间结构已经接入楼层地图，高清布景和专属家具正在制作。</p><button data-v5-scene="${room==='closet'?'wardrobe':'estate'}">${room==='closet'?'进入衣橱':'返回家园'}</button></div>`;
    setTimeout(()=>{
      const roomView=document.querySelector('#roomView');
      if(roomView){const toolbar=document.createElement('div');toolbar.className='roomToolbar';toolbar.innerHTML=`<button data-floor="${room==='bedroom'?2:1}">${gameIcon('map')}<span>本层地图</span></button><div><small>${room==='bedroom'?'2F · PRIVATE FLOOR':'1F · LIVING FLOOR'}</small><b>${{living:'星光客厅',bedroom:'月光卧室',bunny:'兔兔房'}[room]}</b></div><button data-v5-scene="decor">${gameIcon('decor')}<span>装修</span></button>`;const hotspots=document.createElement('div');hotspots.className='roomHotspots';hotspots.innerHTML=room==='living'?'<button data-room-action="sofa"><b>云朵沙发</b><small>休息 · 恢复一点心情</small></button><button data-room-action="window"><b>月窗</b><small>看一会儿星星</small></button>':room==='bedroom'?'<button data-room-action="rest"><b>月光床</b><small>记录睡眠 · +状态</small></button><button data-room-action="study"><b>星象书桌</b><small>去完成一次专注</small></button><button data-v5-scene="wardrobe"><b>星回衣橱</b><small>全屏换装</small></button>':'<button data-v5-scene="pet"><b>月绒兔</b><small>进入兔兔照料</small></button>';sceneRoot.replaceChildren(toolbar,roomView,hotspots);roomView.hidden=false;openRoom(room);renderHouse();}
    });
    return '<div class="roomLoading"></div>';
  }

  function wardrobeScene(){
    const owned=outfitCatalog.filter(x=>D.game.ownedV5.includes(x.id));
    const current=outfitCatalog.find(x=>x.id===D.game.equippedV5)||owned[0];
    return `<div class="v5Wardrobe">
      <div class="wardrobeViewer"><div class="wardrobeHalo"></div><img src="${current.preview}" alt="${current.name}"><div class="lookName"><small>当前穿搭</small><b>${current.name}</b><span>${'★'.repeat(current.rarity)}</span></div></div>
      <section class="wardrobeControls"><div class="v5Tabs"><button class="active">套装</button><button>发型</button><button>上装</button><button>下装</button><button>外套</button><button>鞋履</button><button>头饰</button><button>配饰</button></div><p>衣橱只展示已经拥有的物品。点击即可试穿，购买请前往服饰商城。</p><div class="v5OutfitGrid">${owned.map(x=>`<button class="v5Outfit ${x.id===current.id?'selected':''}" data-equip="${x.id}"><img src="${x.preview}" alt=""><b>${x.name}</b><small>${x.series}</small></button>`).join('')}</div></section>
    </div>`;
  }

  function shopScene(){
    return `<div class="v5ShopHub"><div class="shopIntro"><small>STARLIGHT MARKET</small><h2>星光商城</h2><p>现实成长兑换游戏收藏。商城只负责购买，装扮请前往衣橱或装修。</p></div><div class="shopDoors"><button data-v5-scene="furnitureStore">${gameIcon('decor')}<b>家具商城</b><span>家具 · 灯饰 · 房间套装</span></button><button data-v5-scene="clothingStore">${gameIcon('wardrobe')}<b>服饰商城</b><span>服装 · 发型 · 鞋履 · 配饰</span></button></div></div>`;
  }

  function clothingStoreScene(){
    return `<div class="v5Store"><div class="storeBanner clothes"><small>WARDROBE BOUTIQUE</small><h2>服饰商城</h2><p>购买后自动送入衣橱。</p></div><div class="v5OutfitGrid storeGrid">${outfitCatalog.map(x=>{const has=D.game.ownedV5.includes(x.id);return `<article class="v5Outfit"><img src="${x.preview}" alt="${x.name}"><b>${x.name}</b><small>${x.series} · ${'★'.repeat(x.rarity)}</small><button data-buy-outfit="${x.id}" ${has?'disabled':''}>${has?'已拥有':x.price+' 金币'}</button></article>`}).join('')}</div></div>`;
  }

  function furnitureStoreScene(){return `<div class="v5Store"><div class="storeBanner furniture"><small>HOME COLLECTION</small><h2>家具商城</h2><p>购买后送入仓库，再到房间装修中摆放。</p></div>${catalogFurniture('store')}</div>`}
  function decorScene(){return `<div class="v5Store"><div class="storeBanner decor"><small>ROOM EDITOR</small><h2>房间装修</h2><p>这里只显示已经拥有的家具。</p></div>${catalogFurniture('editor')}</div>`}
  function petScene(){return `<div class="v5PetScene"><div class="v5PetStage"><div class="v5PetSprite"></div><div class="petSpeech">今天也陪你慢慢长大。</div></div>${petPanel()}</div>`}
  function inventoryScene(){return `<div class="v5Inventory"><div class="inventoryHero"><h2>星光仓库</h2><p>服装进入衣橱，家具进入装修；仓库负责统一查看收藏。</p></div><div class="inventorySummary"><span>家具 <b>${D.house.ownedFurniture.length}</b></span><span>服装 <b>${D.game.ownedV5.length}</b></span><span>发型 <b>1</b></span></div><h3>家具收藏</h3>${catalogFurniture('inventory')}<h3>服装收藏</h3><div class="v5OutfitGrid">${outfitCatalog.filter(x=>D.game.ownedV5.includes(x.id)).map(x=>`<article class="v5Outfit"><img src="${x.preview}" alt=""><b>${x.name}</b><small>${x.series}</small></article>`).join('')}</div></div>`}
  function achievementScene(){return `<div class="v5Achievements"><div class="achievementHero"><h2>星轨成就图鉴</h2><p>所有游戏奖励都来自现实中的持续行动。</p></div>${achievementPanel()}</div>`}
  function gardenScene(){return `<div class="gardenScene"><div class="gardenCopy"><small>STARLIGHT GARDEN</small><h2>星梦花园</h2><p>每次现实打卡都会给花园带来一点变化。先照料一块土地，再慢慢解锁整座庭院。</p><div class="gardenActions"><button data-garden-action="seed">播种星种 <small>今日 +6 XP</small></button><button data-garden-action="water">月泉浇灌 <small>今日 +3 XP</small></button><button data-garden-action="walk">陪兔兔散步 <small>亲密度 +2</small></button><button data-v5-scene="estate">返回洋馆</button></div></div></div>`}

  function render(){
    const activeRoomView=sceneRoot.querySelector('#roomView');
    if(activeRoomView){activeRoomView.hidden=true;document.querySelector('#game')?.append(activeRoomView)}
    wallet();
    app.classList.toggle('roomActive',scene.startsWith('room:'));
    const titles={estate:'星月洋馆','floor:1':'一层地图','floor:2':'二层地图',wardrobe:'星回衣橱',pet:'兔兔小屋',shop:'星光商城',clothingStore:'服饰商城',furnitureStore:'家具商城',decor:'房间装修',inventory:'星光仓库',achievements:'成就图鉴',garden:'星梦花园'};
    const roomTitles={living:'一层 · 星光客厅',bedroom:'二层 · 月光卧室',bunny:'一层 · 兔兔房'};
    sceneTitle.textContent=titles[scene]||(scene.startsWith('room:')?roomTitles[scene.split(':')[1]]||'房间':'星月家园');
    if(scene==='estate')sceneRoot.innerHTML=estateScene();
    else if(scene.startsWith('floor:'))sceneRoot.innerHTML=floorScene(+scene.split(':')[1]);
    else if(scene.startsWith('room:'))sceneRoot.innerHTML=roomScene(scene.split(':')[1]);
    else if(scene==='wardrobe')sceneRoot.innerHTML=wardrobeScene();
    else if(scene==='pet')sceneRoot.innerHTML=petScene();
    else if(scene==='shop')sceneRoot.innerHTML=shopScene();
    else if(scene==='clothingStore')sceneRoot.innerHTML=clothingStoreScene();
    else if(scene==='furnitureStore')sceneRoot.innerHTML=furnitureStoreScene();
    else if(scene==='decor')sceneRoot.innerHTML=decorScene();
    else if(scene==='inventory')sceneRoot.innerHTML=inventoryScene();
    else if(scene==='achievements')sceneRoot.innerHTML=achievementScene();
    else if(scene==='garden')sceneRoot.innerHTML=gardenScene();
    nav.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.v5Scene===scene));
  }

  app.addEventListener('click',e=>{
    const sceneButton=e.target.closest('[data-v5-scene]');
    if(sceneButton){go(sceneButton.dataset.v5Scene);return}
    const floorButton=e.target.closest('[data-floor]');
    if(floorButton){go('floor:'+floorButton.dataset.floor);return}
    const roomButton=e.target.closest('[data-room]');
    if(roomButton){go('room:'+roomButton.dataset.room);return}
    const equip=e.target.closest('[data-equip]');
    if(equip){D.game.equippedV5=equip.dataset.equip;save();render();return}
    const buy=e.target.closest('[data-buy-outfit]');
    if(buy){const item=outfitCatalog.find(x=>x.id===buy.dataset.buyOutfit);if(!item)return;if(D.coins<item.price)return toast('金币还不够，先完成现实任务');D.coins-=item.price;D.game.ownedV5.push(item.id);save();render();toast('服装已送入衣橱')}
    const bathAction=e.target.closest('[data-room-action]');
    if(bathAction){const action=bathAction.dataset.roomAction;if(action==='study'){gotoPage('focus');exitGameV5();return}if(action==='rest'){const key='rest-'+TODAY;if(D.rewarded[key])return toast('今天已经记录过休息');reward(4,2,key);toast('睡眠状态已记录');return}if(action==='bath'){const key='bath-'+TODAY;if(D.rewarded[key])return toast('今天已经完成过放松记录');reward(4,2,key);render();return}if(action==='sofa'||action==='window'){const key=action+'-'+TODAY;if(D.rewarded[key])return toast('今天已经互动过啦');reward(2,1,key);toast(action==='sofa'?'柔软的云朵接住你了':'月光落在窗边');return}}
    const gardenAction=e.target.closest('[data-garden-action]');
    if(gardenAction){const key='garden-'+gardenAction.dataset.gardenAction+'-'+TODAY;if(D.rewarded[key])return toast('今天已经照料过这一项');if(gardenAction.dataset.gardenAction==='walk')D.house.love+=2;reward(gardenAction.dataset.gardenAction==='seed'?6:3,gardenAction.dataset.gardenAction==='seed'?3:2,key);save();render();return}
  });
  app.querySelector('.v5Back').addEventListener('click',back);

  const legacyEnter=enterGame;
  const legacyLeave=leaveGame;
  function enterGameV5(){
    document.body.classList.add('game-mode','game-v5-active');
    app.classList.add('open');
    history=[];scene='estate';render();
  }
  function exitGameV5(){
    app.classList.remove('open');
    document.body.classList.remove('game-mode','game-v5-active');
    if(typeof baseGotoPage==='function')baseGotoPage('home');else legacyLeave();
  }
  enterGame=enterGameV5;
  leaveGame=exitGameV5;
  window.enterGameV5=enterGameV5;
  window.exitGameV5=exitGameV5;
})();
