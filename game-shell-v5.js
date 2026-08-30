/* 星轨成长舱 v5：独立全屏养成游戏外壳 */
(function () {
  const outfitCatalog = [
    { id:'moonlit-immortal', name:'月华仙衣', series:'东方古韵', rarity:5, price:520, preview:'assets/avatar-v5/moonlit-immortal-outfit-preview.png?v=6' },
    { id:'crimson-ceremony', name:'赤霄华章', series:'东方古韵', rarity:5, price:560, preview:'assets/avatar-v5/crimson-ceremony-preview.png?v=6' },
    { id:'mist-city-walk', name:'雾城漫步', series:'现代都市', rarity:5, price:460, preview:'assets/avatar-v5/mist-city-walk-preview.png?v=6' },
    { id:'bunny-bakery', name:'月绒烘焙屋', series:'兔兔可爱', rarity:5, price:440, preview:'assets/avatar-v5/bunny-bakery-preview.png?v=6' },
    { id:'midnight-banquet', name:'午夜星宴', series:'绅士典藏', rarity:5, price:520, preview:'assets/avatar-v5/midnight-banquet-preview.png?v=6' }
  ];

  D.game = D.game || {};
  D.game.ownedV5 = D.game.ownedV5 || ['moonlit-immortal'];
  /* Existing saves originally contained only one look, which made the wardrobe
     appear broken. Give every save a second starter look so changing clothes
     can be tested immediately; the remaining looks still come from the shop. */
  if (!D.game.ownedV5.includes('moonlit-immortal')) D.game.ownedV5.unshift('moonlit-immortal');
  if (!D.game.ownedV5.includes('mist-city-walk')) D.game.ownedV5.push('mist-city-walk');
  D.game.equippedV5 = D.game.equippedV5 || 'moonlit-immortal';
  D.game.wardrobeSlots = D.game.wardrobeSlots || {
    hairBack:'moon-hair-back', base:null, hairFront:'moon-hair-front',
    top:'moon-top', bottom:'moon-bottom', coat:'moon-coat', shoes:'moon-boots',
    headwear:'moon-crown', neck:'moon-waist'
  };
  D.game.petAction = D.game.petAction || { type:'idle', at:0 };
  D.game.decorRoom = D.game.decorRoom || 'living';
  D.game.scene = D.game.scene || 'estate';
  D.game.garden = D.game.garden || {
    selectedCrop: 'starbell',
    plots: Array.from({length:4},()=>({crop:null,plantedAt:0,boostHours:0,lastWater:''})),
    harvests: 0
  };

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
  let pendingOutfit = null;
  let wardrobeTab = 'all';

  const partCatalog = [
    ['moon-hair-back','hairBack','发型','月华后发','assets/avatar-parts/hair-back.png'],
    ['moon-hair-front','hairFront','发型','月华前发','assets/avatar-parts/hair-front.png'],
    ['starlight-base','base','基础','星光基础体','assets/avatar-parts/base.png'],
    ['moon-top','top','上装','月华内衫','assets/avatar-parts/top.png'],
    ['moon-bottom','bottom','下装','月华下装','assets/avatar-parts/bottom.png'],
    ['moon-coat','coat','外套','流光外袍','assets/avatar-parts/coat.png'],
    ['moon-boots','shoes','鞋履','月纹短靴','assets/avatar-parts/boots.png'],
    ['moon-crown','headwear','头饰','弦月冠饰','assets/avatar-parts/headwear.png'],
    ['moon-waist','neck','配饰','星月腰饰','assets/avatar-parts/waist.png']
  ].map(([id,slot,tab,name,src])=>({id,slot,tab,name,src}));
  const layerOrder=['hairBack','base','bottom','shoes','top','coat','neck','hairFront','headwear'];
  function avatarLayers(selection=D.game.wardrobeSlots, cls=''){
    return `<div class="layeredAvatar ${cls}" aria-label="当前完整人物">${layerOrder.map(slot=>{const id=selection[slot],item=partCatalog.find(x=>x.id===id);return item?`<img data-avatar-slot="${slot}" src="${item.src}?v=7" alt="">`:''}).join('')}</div>`;
  }

  function wallet(){
    app.querySelector('#v5Coins').textContent = D.coins;
    app.querySelector('#v5Dust').textContent = Math.floor(D.xp / 10);
  }

  function go(next, options={}){
    if (!options.replace && scene !== next) history.push(scene);
    if(scene==='wardrobe'&&next!=='wardrobe') pendingOutfit=null;
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
    if(room==='study')return `<div class="specialRoom studyRoom"><div class="specialRoomCopy"><small>1F · MOONLIGHT STUDY</small><h2>月影书房</h2><p>书桌、书架和阅读榻都有各自用途。专注记录会在这里留下星光。</p><div class="specialActions"><button data-room-action="study">开始一次专注</button><button data-room-action="read">阅读片刻 · +2 XP</button><button data-v5-scene="decor" data-decor-room="study">装饰书房</button></div></div><button class="sceneHotspot hs-desk" data-room-action="study" aria-label="星象书桌"></button><button class="sceneHotspot hs-books" data-room-action="read" aria-label="拱门书架"></button></div>`;
    if(room==='dining')return `<div class="specialRoom diningRoom"><div class="specialRoomCopy"><small>1F · GALAXY DINING</small><h2>银河餐厅</h2><p>给自己留下一次好好吃饭的记录，也可以为兔兔准备点心。</p><div class="specialActions"><button data-room-action="meal">记录好好吃饭 · +3 XP</button><button data-v5-scene="floor:1">返回一层</button></div></div></div>`;
    if(room==='closet')return wardrobeScene();
    if(room==='bath')return `<div class="specialRoom bathRoom"><div class="specialRoomCopy"><small>2F · CLOUD MIST BATH</small><h2>云雾浴室</h2><p>把放松也记进成长：完成一次身体复盘，就能点亮浴室的水晶灯。</p><div class="specialActions"><button data-room-action="bath">泡一会儿 · +4 XP</button><button data-v5-scene="floor:2">返回二层地图</button></div></div></div>`;
    if(room==='garden')return gardenScene();
    if(!supported.includes(room)) return `<div class="comingScene"><div>${gameIcon('map')}</div><h2>房间载入失败</h2><p>这个入口暂时无法读取，请返回楼层地图。</p><button data-v5-scene="estate">返回家园</button></div>`;
    setTimeout(()=>{
      const roomView=document.querySelector('#roomView');
      if(roomView){
        const toolbar=document.createElement('div');
        toolbar.className='roomToolbar';
        toolbar.innerHTML=`<button data-floor="${room==='bedroom'?2:1}">${gameIcon('map')}<span>本层地图</span></button><div><small>${room==='bedroom'?'2F · PRIVATE FLOOR':'1F · LIVING FLOOR'}</small><b>${{living:'星光客厅',bedroom:'月光卧室',bunny:'兔兔房'}[room]}</b></div><button data-v5-scene="decor">${gameIcon('decor')}<span>装修</span></button>`;
        const hotspots=document.createElement('div');
        hotspots.className='roomHotspots';
        hotspots.innerHTML=room==='living'?'<button data-room-action="sofa"><b>云朵沙发</b><small>休息 · 恢复一点心情</small></button><button data-room-action="window"><b>月窗</b><small>看一会儿星星</small></button>':room==='bedroom'?'<button data-room-action="rest"><b>月光床</b><small>记录睡眠 · +状态</small></button><button data-room-action="study"><b>星象书桌</b><small>去完成一次专注</small></button><button data-v5-scene="wardrobe"><b>星回衣橱</b><small>全屏换装</small></button>':'<button data-v5-scene="pet"><b>月绒兔</b><small>进入兔兔照料</small></button>';
        const avatar=document.createElement('div');
        avatar.className='roomAvatar';
        avatar.innerHTML=avatarLayers(D.game.wardrobeSlots,'roomAvatarLayers');
        sceneRoot.replaceChildren(toolbar,roomView,avatar,hotspots);
        roomView.hidden=false;
        openRoom(room);
        renderHouse();
      }
    });
    return '<div class="roomLoading"></div>';
  }

  function wardrobeScene(){
    const tabs=['全部','发型','上装','下装','外套','鞋履','头饰','配饰'];
    const visible=partCatalog.filter(x=>wardrobeTab==='all'||x.tab===wardrobeTab);
    return `<div class="v5Wardrobe">
      <div class="wardrobeViewer"><div class="wardrobeHalo"></div>${avatarLayers()}<div class="lookName"><small>整体人物展示</small><b>当前混搭</b><span>发型、服装与配饰均可单独更换</span></div></div>
      <section class="wardrobeControls">
        <div class="v5Tabs">${tabs.map(t=>`<button data-wardrobe-tab="${t==='全部'?'all':t}" class="${wardrobeTab===(t==='全部'?'all':t)?'active':''}">${t}</button>`).join('')}</div>
        <div class="wardrobeGuide"><b>逐件选择已拥有的服饰</b><small>每一项都是独立透明图层，点击即可试穿；保存后同步到家园。</small></div>
        <div class="partGrid">${visible.map(x=>`<button class="partCard ${D.game.wardrobeSlots[x.slot]===x.id?'selected':''}" data-equip-part="${x.id}"><span class="partThumb"><img src="${x.src}?v=7" alt="${x.name}"></span><b>${x.name}</b><small>${x.tab}</small></button>`).join('')}</div>
        <div class="wardrobeActions"><button data-reset-look>恢复月华整套</button><button class="primary" data-save-look>保存当前穿搭</button></div>
      </section>
    </div>`;
  }

  function shopScene(){
    return `<div class="v5ShopHub"><div class="shopIntro"><small>STARLIGHT MARKET</small><h2>星光商城</h2><p>现实成长兑换游戏收藏。商城只负责购买，装扮请前往衣橱或装修。</p></div><div class="shopDoors"><button data-v5-scene="furnitureStore">${gameIcon('decor')}<b>家具商城</b><span>家具 · 灯饰 · 房间套装</span></button><button data-v5-scene="clothingStore">${gameIcon('wardrobe')}<b>服饰商城</b><span>服装 · 发型 · 鞋履 · 配饰</span></button></div></div>`;
  }

  function clothingStoreScene(){
    return `<div class="v5Store"><div class="storeBanner clothes"><small>WARDROBE BOUTIQUE</small><h2>服饰商城</h2><p>购买后自动送入衣橱。</p></div><div class="v5OutfitGrid storeGrid">${outfitCatalog.map(x=>{const has=D.game.ownedV5.includes(x.id);return `<article class="v5Outfit"><img src="${x.preview}" alt="${x.name}"><b>${x.name}</b><small>${x.series} · ${'★'.repeat(x.rarity)}</small><button data-buy-outfit="${x.id}" ${has?'disabled':''}>${has?'已拥有':x.price+' 金币'}</button></article>`}).join('')}</div></div>`;
  }

  function furnitureStoreScene(){return `<div class="v5Store"><div class="storeBanner furniture"><small>HOME COLLECTION</small><h2>家具商城</h2><p>购买后送入仓库，再到房间装修中摆放。</p></div>${catalogFurniture('store')}</div>`}
  function decorScene(){const room=D.game.decorRoom||D.house.room||'living';return `<div class="v5Store decorWorkspace"><div class="storeBanner decor"><small>ROOM EDITOR · ${room.toUpperCase()}</small><h2>房间装修</h2><p>点击家具先在固定位置预览，再确认保存；同类家具会自动替换。</p><button data-return-room="${room}">完成并返回房间</button></div><div class="decorPreview" data-decor-preview="${room}"></div>${catalogFurniture('editor')}</div>`}
  function petScene(){const a=D.game.petAction||{type:'idle'};const labels={idle:'安静陪伴',feed:'正在吃胡萝卜',play:'开心地扑向星星球',sleep:'盖好小毯子睡着了',study:'挨着你一起读书'};return `<div class="v5PetScene"><div class="v5PetStage pet-${a.type}"><div class="v5PetSprite"></div><div class="petFx" aria-hidden="true"></div><div class="petMood"><b>月绒兔</b><span>状态：${labels[a.type]||labels.idle}</span></div></div>${petPanel()}</div>`}
  function inventoryScene(){return `<div class="v5Inventory"><div class="inventoryHero"><h2>星光仓库</h2><p>服装进入衣橱，家具进入装修；仓库负责统一查看收藏。</p></div><div class="inventorySummary"><span>家具 <b>${D.house.ownedFurniture.length}</b></span><span>服装 <b>${D.game.ownedV5.length}</b></span><span>发型 <b>1</b></span></div><h3>家具收藏</h3>${catalogFurniture('inventory')}<h3>服装收藏</h3><div class="v5OutfitGrid">${outfitCatalog.filter(x=>D.game.ownedV5.includes(x.id)).map(x=>`<article class="v5Outfit"><img src="${x.preview}" alt=""><b>${x.name}</b><small>${x.series}</small></article>`).join('')}</div></div>`}
  function achievementScene(){return `<div class="v5Achievements"><div class="achievementHero"><h2>星轨成就图鉴</h2><p>所有游戏奖励都来自现实中的持续行动。</p></div>${achievementPanel()}</div>`}
  const gardenCatalog={
    starbell:{name:'星铃花',hours:6,reward:12,color:'#c9b4ff'},
    moonberry:{name:'月绒莓',hours:12,reward:20,color:'#f2a9ce'},
    cloudgrass:{name:'云朵草',hours:24,reward:32,color:'#b8ddf4'}
  };
  function plotState(plot){
    if(!plot.crop)return {state:'empty',progress:0,label:'空花圃'};
    const crop=gardenCatalog[plot.crop];
    const elapsed=(Date.now()-plot.plantedAt)/36e5+(plot.boostHours||0);
    const progress=Math.max(0,Math.min(100,Math.floor(elapsed/crop.hours*100)));
    return {state:progress>=100?'ready':'growing',progress,label:progress>=100?'可以收获':`生长 ${progress}%`};
  }
  function gardenScene(){
    const garden=D.game.garden;
    return `<div class="gardenScene"><div class="gardenCopy"><small>STARLIGHT GARDEN</small><h2>星梦花园</h2><p>播种、浇水、等待和收获都会保存在手机里。现实打卡获得的金币，可以继续扩建花园。</p>
      <div class="seedPicker">${Object.entries(gardenCatalog).map(([id,c])=>`<button class="${garden.selectedCrop===id?'active':''}" data-select-crop="${id}"><i style="--seed:${c.color}"></i><b>${c.name}</b><small>${c.hours}小时成熟</small></button>`).join('')}</div>
      <div class="gardenPlots">${garden.plots.map((plot,i)=>{const s=plotState(plot),crop=plot.crop?gardenCatalog[plot.crop]:null;return `<article class="gardenPlot ${s.state}" data-plot="${i}"><span class="plotNumber">0${i+1}</span><div class="plantVisual"><i style="--plant:${crop?.color||'#c8b8a0'}"></i></div><b>${crop?.name||'空花圃'}</b><small>${s.label}</small><div class="plantProgress"><i style="width:${s.progress}%"></i></div><div class="plotActions">${s.state==='empty'?`<button data-plant="${i}">播种</button>`:s.state==='ready'?`<button data-harvest="${i}">收获 +${crop.reward}金币</button>`:`<button data-water="${i}">浇水 · 加速2小时</button>`}</div></article>`}).join('')}</div>
      <div class="gardenFooter"><span>累计收获 <b>${garden.harvests||0}</b> 次</span><button data-garden-action="walk">陪兔兔散步 · 亲密度 +2</button></div>
    </div></div>`;
  }

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
    if(sceneButton){if(sceneButton.dataset.v5Scene==='decor'){D.game.decorRoom=sceneButton.dataset.decorRoom||(D.house.room==='exterior'?'living':D.house.room)}go(sceneButton.dataset.v5Scene);return}
    const floorButton=e.target.closest('[data-floor]');
    if(floorButton){go('floor:'+floorButton.dataset.floor);return}
    const roomButton=e.target.closest('[data-room]');
    if(roomButton){go('room:'+roomButton.dataset.room);return}
    const tryOutfit=e.target.closest('[data-try-outfit]');
    if(tryOutfit){pendingOutfit=tryOutfit.dataset.tryOutfit;render();return}
    if(e.target.closest('[data-cancel-outfit]')){pendingOutfit=null;render();return}
    if(e.target.closest('[data-confirm-outfit]')){
      if(!pendingOutfit)return;
      D.game.equippedV5=pendingOutfit;
      const item=outfitCatalog.find(x=>x.id===pendingOutfit);
      pendingOutfit=null;save();render();toast(`已换上「${item?.name||'新穿搭'}」`);return
    }
    const tab=e.target.closest('[data-wardrobe-tab]');
    if(tab){wardrobeTab=tab.dataset.wardrobeTab;render();return}
    const part=e.target.closest('[data-equip-part]');
    if(part){const item=partCatalog.find(x=>x.id===part.dataset.equipPart);if(item){D.game.wardrobeSlots[item.slot]=item.id;render()}return}
    if(e.target.closest('[data-reset-look]')){D.game.wardrobeSlots={hairBack:'moon-hair-back',base:null,hairFront:'moon-hair-front',top:'moon-top',bottom:'moon-bottom',coat:'moon-coat',shoes:'moon-boots',headwear:'moon-crown',neck:'moon-waist'};render();return}
    if(e.target.closest('[data-save-look]')){save();toast('当前分层穿搭已保存，并同步到家园');return}
    const returnRoom=e.target.closest('[data-return-room]');
    if(returnRoom){go('room:'+returnRoom.dataset.returnRoom);return}
    const buy=e.target.closest('[data-buy-outfit]');
    if(buy){const item=outfitCatalog.find(x=>x.id===buy.dataset.buyOutfit);if(!item)return;if(D.coins<item.price)return toast('金币还不够，先完成现实任务');D.coins-=item.price;D.game.ownedV5.push(item.id);save();render();toast('服装已送入衣橱')}
    const bathAction=e.target.closest('[data-room-action]');
    if(bathAction){const action=bathAction.dataset.roomAction;if(action==='study'){gotoPage('focus');exitGameV5();return}if(action==='read'||action==='meal'){const key=action+'-'+TODAY;if(D.rewarded[key])return toast('今天已经记录过了');reward(action==='meal'?3:2,1,key);render();toast(action==='meal'?'好好吃饭也值得一颗星':'书页翻过了一小段');return}if(action==='rest'){const key='rest-'+TODAY;if(D.rewarded[key])return toast('今天已经记录过休息');reward(4,2,key);toast('睡眠状态已记录');return}if(action==='bath'){const key='bath-'+TODAY;if(D.rewarded[key])return toast('今天已经完成过放松记录');reward(4,2,key);render();toast('水晶灯被点亮，放松状态已记录');return}if(action==='sofa'||action==='window'){const key=action+'-'+TODAY;if(D.rewarded[key])return toast('今天已经互动过啦');reward(2,1,key);toast(action==='sofa'?'柔软的云朵接住你了':'月光落在窗边');return}}
    const cropButton=e.target.closest('[data-select-crop]');
    if(cropButton){D.game.garden.selectedCrop=cropButton.dataset.selectCrop;save();render();return}
    const plantButton=e.target.closest('[data-plant]');
    if(plantButton){const plot=D.game.garden.plots[+plantButton.dataset.plant];if(plot.crop)return;plot.crop=D.game.garden.selectedCrop;plot.plantedAt=Date.now();plot.boostHours=0;plot.lastWater='';save();render();toast('星种已经落进花圃');return}
    const waterButton=e.target.closest('[data-water]');
    if(waterButton){const plot=D.game.garden.plots[+waterButton.dataset.water];if(!plot.crop)return;if(plot.lastWater===TODAY)return toast('这块花圃今天已经浇过水');plot.lastWater=TODAY;plot.boostHours=(plot.boostHours||0)+2;save();render();toast('月泉让植物生长得更快了');return}
    const harvestButton=e.target.closest('[data-harvest]');
    if(harvestButton){const plot=D.game.garden.plots[+harvestButton.dataset.harvest],state=plotState(plot);if(state.state!=='ready')return toast('还没有成熟');const crop=gardenCatalog[plot.crop];D.coins+=crop.reward;D.xp+=6;D.game.garden.harvests=(D.game.garden.harvests||0)+1;Object.assign(plot,{crop:null,plantedAt:0,boostHours:0,lastWater:''});save();render();toast(`收获 ${crop.name}，获得 ${crop.reward} 金币`);return}
    const gardenAction=e.target.closest('[data-garden-action]');
    if(gardenAction){const key='garden-'+gardenAction.dataset.gardenAction+'-'+TODAY;if(D.rewarded[key])return toast('今天已经完成过这一项');if(gardenAction.dataset.gardenAction==='walk')D.house.love+=2;reward(3,2,key);save();render();toast('兔兔在花园里开心地跑了一圈');return}
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
  window.renderGameV5=render;
})();
