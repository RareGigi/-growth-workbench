const decorAssets={'云朵沙发':'cloud-sofa','星星茶几':'star-table','月亮地毯':'moon-rug','兔兔小窝':'bunny-bed','月光床':'moon-canopy','贝壳床':'shell-daybed','星象书桌':'astronomy-desk','拱门书架':'arched-shelf','月光衣柜':'celestial-wardrobe','星尘梳妆台':'vanity','星星灯':'star-lamp','星星落地灯':'star-lamp','月光花':'moon-flower'};
const furnitureRules={
 '云朵沙发':{slot:'seating',rooms:['living','bunny']},
 '星星茶几':{slot:'table',rooms:['living','bunny']},
 '月亮地毯':{slot:'rug',rooms:['living','bedroom','bunny']},
 '兔兔小窝':{slot:'petBed',rooms:['bunny']},
 '月光床':{slot:'bed',rooms:['bedroom']},
 '贝壳床':{slot:'bed',rooms:['bedroom']},
 '星象书桌':{slot:'desk',rooms:['living','bedroom','bunny']},
 '拱门书架':{slot:'shelf',rooms:['living','bedroom','bunny']},
 '月光衣柜':{slot:'wardrobe',rooms:['bedroom']},
 '星尘梳妆台':{slot:'vanity',rooms:['bedroom']},
 '星星落地灯':{slot:'lamp',rooms:['living','bedroom','bunny']},
 '月光花':{slot:'plant',rooms:['living','bedroom','bunny']}
};
const fixedRoomFurniture={living:['云朵沙发','星星茶几'],bedroom:['月光床','星象书桌','拱门书架'],bunny:[]};
const furniturePlacement={
 'cloud-sofa':{left:7,bottom:5,width:38,z:4},
 'star-table':{left:42,bottom:7,width:20,z:5},
 'moon-rug':{left:23,bottom:0,width:53,z:2},
 'bunny-bed':{left:8,bottom:4,width:24,z:5},
 'moon-canopy':{left:4,bottom:2,width:48,z:4},
 'shell-daybed':{left:8,bottom:4,width:42,z:4},
 'astronomy-desk':{right:4,bottom:5,width:36,z:4},
 'arched-shelf':{right:4,bottom:4,width:25,z:3},
 'celestial-wardrobe':{right:4,bottom:4,width:26,z:4},
 'vanity':{right:32,bottom:5,width:22,z:5},
 'star-lamp':{right:27,bottom:5,width:14,z:5},
 'moon-flower':{right:5,bottom:5,width:15,z:6}
};
 D.house.ownedFurniture=D.house.ownedFurniture||[];Object.values(D.house.rooms||{}).flat().concat(Object.values(fixedRoomFurniture).flat()).forEach(name=>{if(decorAssets[name]&&!D.house.ownedFurniture.includes(name))D.house.ownedFurniture.push(name)});
const furnitureLayer=document.createElement('div');furnitureLayer.className='furnitureLayer';$('houseStage').prepend(furnitureLayer);
function openRoom(room){if(room==='garden')return toast('花园正在生长，下一阶段开放');D.house.room=room;renderHouse();localStorage.setItem(KEY,JSON.stringify(D))}
function backHome(){D.house.room='exterior';renderHouse();localStorage.setItem(KEY,JSON.stringify(D))}
document.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>openRoom(b.dataset.room));
$('backHome').onclick=backHome;
function petAction(action){if(action==='feed'&&D.coins<3)return toast('需要3金币购买胡萝卜');if(action==='feed'){D.coins-=3;D.house.food=Math.min(100,D.house.food+20);D.house.love+=2;D.house.petPose=4}else if(action==='play'){D.house.love+=3;D.house.food=Math.max(0,D.house.food-5);D.house.petPose=6}else if(action==='sleep'){D.house.petPose=3;D.house.food=Math.max(0,D.house.food-2)}else{D.house.love+=2;D.house.petPose=2}save()}
document.querySelectorAll('[data-pet]').forEach(b=>b.onclick=()=>petAction(b.dataset.pet));
function renderHouse(){let exterior=D.house.room==='exterior',room=exterior?'living':D.house.room;$('homeExterior').hidden=!exterior;$('roomView').hidden=exterior;$('houseStage').className='houseStage card '+(exterior?'exteriorRoom':room==='bedroom'?'floor2':room==='bunny'?'bunnyRoom':'floor1');document.querySelectorAll('.floorTabs [data-room]').forEach(b=>b.classList.toggle('active',b.dataset.room===room));$('petLove').textContent=D.house.love;$('petFood').textContent=D.house.food;$('slotA').hidden=true;$('slotB').hidden=true;$('characterArt').hidden=true;$('houseBunny').hidden=room!=='bunny';let active=(D.house.rooms[room]||[]).filter(name=>!furnitureRules[name]||furnitureRules[name].rooms.includes(room)),dynamic=active.filter(name=>!(fixedRoomFurniture[room]||[]).includes(name));furnitureLayer.innerHTML=exterior?'':dynamic.slice(0,10).map(name=>{let asset=decorAssets[name],p=furniturePlacement[asset];if(!asset||!p)return'';let style=['bottom:'+p.bottom+'%','width:'+p.width+'%','z-index:'+p.z];if(p.left!=null)style.push('left:'+p.left+'%');if(p.right!=null)style.push('right:'+p.right+'%');return '<img class="placedFurniture furniture-'+asset+'" alt="'+name+'" src="assets/furniture/'+asset+'.webp" decoding="async" style="'+style.join(';')+'">'}).join('');$('furnitureShop').innerHTML='<div class="empty">基础家具已经与房间光影融合；可在商城继续解锁可替换装饰。</div>'}
const oldRenderAll=renderAll;renderAll=function(){oldRenderAll();renderHouse()};renderHouse();
