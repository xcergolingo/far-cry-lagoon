/* GoLingo Lagoon stable exploration zones v2 */
(function(){
  const ZONES=[
    {name:"Outpost beach",type:"land",pts:[[-20,null,45],[42,null,38],[-6,null,50],[15,null,55],[32,null,60],[-38,null,32],[28,null,28]]},
    {name:"West island",type:"island",pts:[[-72,2.0,-82],[-64,2.4,-94],[-82,1.8,-103],[-58,2.2,-112],[-90,2.0,-88]]},
    {name:"Arch island",type:"island",pts:[[68,2.0,-98],[78,2.8,-111],[62,2.2,-121],[88,1.9,-91],[55,2.1,-108]]},
    {name:"Sandy spit",type:"island",pts:[[52,1.1,55],[60,1.2,40],[66,1.0,24],[48,1.2,68],[72,1.1,50]]},
    {name:"Sea surface",type:"surface",pts:[[-28,.65,-18],[8,.65,-38],[42,.65,-52],[-58,.65,-48],[70,.65,-34],[-5,.65,-88],[-82,.65,-22],[88,.65,-68],[24,.65,-104]]},
    {name:"Shallow reef",type:"reef",pts:[[-24,-3.5,-28],[18,-4.5,-42],[38,-5.5,-68],[-48,-4,-62],[55,-5,-78],[-70,-6,-86],[12,-7,-92]]},
    {name:"Deep sea",type:"deep",pts:[[-20,-11,-105],[18,-15,-125],[48,-19,-145],[-55,-14,-128],[75,-21,-155],[-4,-24,-170],[-82,-18,-150],[92,-16,-132],[36,-26,-182]]}
  ];
  const order=["land","surface","island","reef","deep","island","surface","deep"];
  const pools={}; ZONES.forEach(z=>z.pts.forEach(p=>(pools[z.type]??=[]).push({zone:z.name,type:z.type,p})));
  const all=Object.values(pools).flat();

  // Deterministic hash: a word keeps the same slot even when other markers disappear.
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function key(w,i){return String(w.id||w.learning||w.word||("word-"+i))}
  function assign(w,i){
    if(w.exploreSlot && all[w.exploreSlot.allIndex]) return all[w.exploreSlot.allIndex];
    const type=order[hash(key(w,i)+"|type")%order.length];
    const pool=pools[type]||all;
    let q=pool[hash(key(w,i)+"|place")%pool.length];
    const allIndex=all.indexOf(q);
    w.exploreSlot={allIndex};
    w.exploreZone=q.zone;w.exploreType=q.type;
    return q;
  }
  function distribute(h){
    if(!h?.markers?.length)return;
    const occupied=new Set();
    h.markers.forEach((m,i)=>{
      let q=assign(m.word,i);
      // Resolve rare hash collisions without changing assignments after collection.
      let idx=q.exploreSlot?.allIndex ?? all.indexOf(q), tries=0;
      while(occupied.has(idx)&&tries<all.length){idx=(idx+1)%all.length;tries++}
      occupied.add(idx);q=all[idx];m.word.exploreSlot={allIndex:idx};m.word.exploreZone=q.zone;m.word.exploreType=q.type;
      const [x,y,z]=q.p;m.group.position.x=x;m.group.position.z=z;
      if(y!==null){m.group.position.y=y;m.base=y}else m.base=m.group.position.y;
      if(m.sprite){const k=(q.type==="deep"||q.type==="reef")?1.18:(q.type==="surface"?1.08:1);m.sprite.scale.set(3.8*k,.95*k,1)}
    });
    // Important: save the slots so rebuild/collect does not reshuffle the hunt.
    try{localStorage.setItem("lagoon-language-hunt-v1",JSON.stringify(h.state))}catch(e){}
    h.refresh?.();
  }
  function install(){
    const h=window.__LAGOON__?.hunt;if(!h)return false;
    if(h.__stableOceanHunt){distribute(h);return true}
    h.__stableOceanHunt=true;
    const rebuild=h.rebuild.bind(h);
    h.rebuild=function(){const r=rebuild();distribute(h);return r};
    // Give existing hunts a clean stable distribution once.
    h.state.words.forEach(w=>{delete w.exploreSlot});
    distribute(h);
    const count=document.getElementById("lh-count");
    if(count&&!document.getElementById("golingo-explore-note")){
      const p=document.createElement("p");p.id="golingo-explore-note";p.className="lh-note";p.style.cssText="margin-top:10px;color:#9fd7cf";
      p.textContent="Every word has its own persistent hiding place across beaches, islands, open water, reef and deep sea. Collected words do not cause the others to move.";
      count.insertAdjacentElement("afterend",p);
    }
    return true;
  }
  let n=0,t=setInterval(()=>{if(install()||++n>300)clearInterval(t)},50);
})();