/* Fresh random locations per hunt, stable until the next hunt */
(function(){
 const zones=[
  {type:"land",points:[[-25,48],[12,50],[39,38],[-38,30],[26,24],[-10,60]]},
  {type:"island",points:[[-72,-82],[-64,-94],[68,-98],[78,-111],[52,55],[60,40]]},
  {type:"surface",points:[[-28,-18],[8,-38],[42,-52],[-58,-48],[70,-34],[-5,-88]]},
  {type:"reef",points:[[-24,-28],[18,-42],[38,-68],[-48,-62],[55,-78]]},
  {type:"deep",points:[[-20,-105],[18,-125],[48,-145],[-55,-128],[75,-155]]}
 ];
 function place(h){
  if(!h?.markers)return;
  const used=[];
  for(const m of h.markers){
   const w=m.word;
   if(!w.huntLocation){
    let loc=null;
    for(let attempt=0;attempt<120;attempt++){
     const z=zones[Math.floor(Math.random()*zones.length)],base=z.points[Math.floor(Math.random()*z.points.length)];
     const x=base[0]+(Math.random()-.5)*16,zz=base[1]+(Math.random()-.5)*16;
     if(used.every(p=>Math.hypot(p[0]-x,p[1]-zz)>13)){
      const y=z.type==="deep"?-12-Math.random()*12:z.type==="reef"?-3-Math.random()*5:z.type==="surface"?.65:z.type==="island"?2:1.7;
      loc={x,y,z:zz,type:z.type};break;
     }
    }
    if(!loc){const z=zones[Math.floor(Math.random()*zones.length)],p=z.points[Math.floor(Math.random()*z.points.length)];loc={x:p[0]+Math.random()*7,y:z.type==="deep"?-15:z.type==="reef"?-5:z.type==="surface"?.65:2,z:p[1]+Math.random()*7,type:z.type}}
    w.huntLocation=loc;
   }
   const p=w.huntLocation;used.push([p.x,p.z]);
   m.group.position.set(p.x,p.y,p.z);m.base=p.y;
   w.exploreType=p.type;w.exploreZone=p.type;
  }
  try{localStorage.setItem("lagoon-language-hunt-v1",JSON.stringify(h.state))}catch(e){}
 }
 function install(){
  const h=window.__LAGOON__?.hunt;if(!h)return false;
  if(h.__randomHuntV4)return true;h.__randomHuntV4=true;
  // Existing session is given a new route once on upgrade.
  h.state.words.forEach(w=>{delete w.huntLocation;delete w.exploreSlot});
  const rebuild=h.rebuild.bind(h);
  h.rebuild=function(){const r=rebuild();place(h);return r};
  place(h);
  // A genuinely new hunt (new words or changed language) clears old coordinates.
  const apply=h.apply.bind(h);
  h.apply=function(){h.state.words.forEach(w=>delete w.huntLocation);const r=apply();h.state.words.forEach(w=>delete w.huntLocation);place(h);return r};
  return true;
 }
 let n=0,t=setInterval(()=>{if(install()||++n>300)clearInterval(t)},100);
})();