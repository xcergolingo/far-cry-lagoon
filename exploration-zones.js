/* Wide-area randomized hunt v5. No fixed anchor slots; land words float visibly. */
(function(){
 const types=["land","surface","island","reef","deep"];
 function randomPoint(type){
  const r=Math.random;
  if(type==="land")return {x:-48+r()*96,z:18+r()*57,y:8+r()*3,type};
  if(type==="island"){
   const islands=[[-75,-95],[72,-108],[55,48]];
   const a=islands[Math.floor(r()*islands.length)];
   return {x:a[0]+(r()-.5)*28,z:a[1]+(r()-.5)*28,y:7+r()*3,type};
  }
  if(type==="surface")return {x:-100+r()*200,z:-105+r()*115,y:0.15,type};
  if(type==="reef")return {x:-90+r()*180,z:-110+r()*70,y:-3-r()*6,type};
  return {x:-100+r()*200,z:-180+r()*85,y:-12-r()*13,type};
 }
 function allocate(words){
  const occupied=[];
  words.forEach((w,i)=>{
   let point=null;
   for(let n=0;n<300;n++){
    const type=types[(i+Math.floor(Math.random()*types.length))%types.length];
    const p=randomPoint(type);
    if(occupied.every(q=>Math.hypot(q.x-p.x,q.z-p.z)>17)){point=p;break}
   }
   if(!point)point=randomPoint(types[i%types.length]);
   w.huntLocation=point;occupied.push(point);
  });
 }
 function place(h){
  if(!h.markers)return;
  for(const m of h.markers){
   const p=m.word.huntLocation;
   if(!p)continue;
   m.group.position.set(p.x,p.y,p.z);m.base=p.y;
   m.group.visible=true;
   if(m.sprite){m.sprite.visible=true;m.sprite.scale.set(5.4,1.35,1);m.sprite.material.depthTest=false;m.sprite.material.depthWrite=false;m.sprite.material.opacity=1}
   m.word.exploreType=p.type;m.word.exploreZone=p.type;
  }
 }
 function save(h){try{localStorage.setItem("lagoon-language-hunt-v1",JSON.stringify(h.state))}catch(e){}}
 function install(){
  const h=window.__LAGOON__?.hunt;if(!h)return false;
  if(h.__wideRandomHuntV5)return true;h.__wideRandomHuntV5=true;
  // Migrate the old fixed-anchor route exactly once, not on every reload.
  if(h.state.words.some(w=>!w.huntLocation||!w.huntLocation.v5)){
   allocate(h.state.words);h.state.words.forEach(w=>w.huntLocation.v5=true);save(h);
  }
  const rebuild=h.rebuild.bind(h);
  h.rebuild=function(){const result=rebuild();place(h);return result};
  place(h);
  const apply=h.apply.bind(h);
  h.apply=function(){
   const result=apply();
   allocate(h.state.words);h.state.words.forEach(w=>w.huntLocation.v5=true);
   save(h);place(h);return result;
  };
  return true;
 }
 let tries=0,t=setInterval(()=>{if(install()||++tries>300)clearInterval(t)},100);
})();