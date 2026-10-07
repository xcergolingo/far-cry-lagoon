/* GoLingo Lagoon immutable word locations v3
   Rule: a word's original index determines its location forever.
   Collection/removal/rebuild never reindexes or redistributes remaining words. */
(function(){
  const TYPE_ORDER=["land","surface","island","reef","deep","island","surface","deep"];
  const BASE={
    land:[[-20,1.7,45],[42,1.7,38],[-6,1.7,50],[15,1.7,55],[32,1.7,60],[-38,1.7,32],[28,1.7,28]],
    island:[[-72,2,-82],[-64,2.4,-94],[-82,1.8,-103],[-58,2.2,-112],[68,2,-98],[78,2.8,-111],[62,2.2,-121],[88,1.9,-91],[52,1.1,55],[60,1.2,40],[66,1,24],[48,1.2,68]],
    surface:[[-28,.65,-18],[8,.65,-38],[42,.65,-52],[-58,.65,-48],[70,.65,-34],[-5,.65,-88],[-82,.65,-22],[88,.65,-68],[24,.65,-104]],
    reef:[[-24,-3.5,-28],[18,-4.5,-42],[38,-5.5,-68],[-48,-4,-62],[55,-5,-78],[-70,-6,-86],[12,-7,-92]],
    deep:[[-20,-11,-105],[18,-15,-125],[48,-19,-145],[-55,-14,-128],[75,-21,-155],[-4,-24,-170],[-82,-18,-150],[92,-16,-132],[36,-26,-182]]
  };
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function originalIndex(w){
    const n=Number(w.index);
    if(Number.isFinite(n)&&n>=0)return n;
    return hash(String(w.id||w.learning||w.word||"word"))%10000;
  }
  function slot(w){
    const i=originalIndex(w),type=TYPE_ORDER[i%TYPE_ORDER.length],pool=BASE[type],n=Math.floor(i/TYPE_ORDER.length);
    const b=pool[n%pool.length],cycle=Math.floor(n/pool.length);
    // Every cycle gets a deterministic offset; no modulo back onto the same exact point.
    const ang=((hash(String(w.id||w.learning||i))%360)/180)*Math.PI;
    const radius=cycle===0?0:Math.min(4+cycle*3,24);
    const x=b[0]+Math.cos(ang)*radius,z=b[2]+Math.sin(ang)*radius;
    // Keep explicit vertical bands by environment.
    let y=b[1];
    if(type==="surface")y=.65;
    if(type==="reef")y=Math.max(-9,Math.min(-3,y-(cycle%3)));
    if(type==="deep")y=Math.max(-30,Math.min(-10,y-(cycle%4)*1.5));
    return {i,type,x,y,z,name:type==="land"?"Beach":type==="surface"?"Open sea surface":type==="island"?"Remote island":type==="reef"?"Reef": "Deep sea"};
  }
  function place(h){
    if(!h?.markers)return;
    for(const m of h.markers){
      const q=slot(m.word);
      m.group.position.set(q.x,q.y,q.z);m.base=q.y;
      m.word.exploreType=q.type;m.word.exploreZone=q.name;
      m.word.exploreStableIndex=q.i;
      if(m.sprite){const k=(q.type==="deep"||q.type==="reef")?1.18:q.type==="surface"?1.08:1;m.sprite.scale.set(3.8*k,.95*k,1)}
    }
    h.refresh?.();
  }
  function install(){
    const h=window.__LAGOON__?.hunt;if(!h)return false;
    if(h.__immutableWordLocations){place(h);return true}
    h.__immutableWordLocations=true;
    // Remove old saved slot metadata; it is intentionally ignored from now on.
    h.state.words.forEach(w=>{delete w.exploreSlot});
    const rebuild=h.rebuild.bind(h);
    h.rebuild=function(){const result=rebuild();place(h);return result};
    place(h);
    try{localStorage.setItem("lagoon-language-hunt-v1",JSON.stringify(h.state))}catch(e){}
    let note=document.getElementById("golingo-explore-note");
    if(note)note.textContent="Every word has one permanent location based on its original list position. Collecting a word never moves or replaces another word.";
    return true;
  }
  let tries=0,t=setInterval(()=>{if(install()||++tries>300)clearInterval(t)},50);
})();