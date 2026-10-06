/* GoLingo Lagoon expanded word exploration zones v1 */
(function(){
  // Authored hunt zones: start shore, remote islands, open-water surface, reef and deep sea.
  // y=null keeps the game's terrain placement; explicit y places words on/under the sea.
  const ZONES=[
    {name:"Outpost beach",type:"land",pts:[[-20,null,45],[42,null,38],[-6,null,50],[15,null,55],[32,null,60]]},
    {name:"West island",type:"island",pts:[[-72,2.0,-82],[-64,2.4,-94],[-82,1.8,-103],[-58,2.2,-112]]},
    {name:"Arch island",type:"island",pts:[[68,2.0,-98],[78,2.8,-111],[62,2.2,-121],[88,1.9,-91]]},
    {name:"Sandy spit",type:"island",pts:[[52,1.1,55],[60,1.2,40],[66,1.0,24],[48,1.2,68]]},
    {name:"Sea surface",type:"surface",pts:[[-28,0.65,-18],[8,0.65,-38],[42,0.65,-52],[-58,0.65,-48],[70,0.65,-34],[-5,0.65,-88]]},
    {name:"Shallow reef",type:"reef",pts:[[-24,-3.5,-28],[18,-4.5,-42],[38,-5.5,-68],[-48,-4.0,-62],[55,-5.0,-78]]},
    {name:"Deep sea",type:"deep",pts:[[-20,-11,-105],[18,-15,-125],[48,-19,-145],[-55,-14,-128],[75,-21,-155],[-4,-24,-170]]}
  ];
  const flat=ZONES.flatMap(z=>z.pts.map(p=>({zone:z.name,type:z.type,p})));
  function distribute(h){
    if(!h?.markers?.length)return;
    // Interleave environments so even a short imported list encourages different kinds of exploration.
    const order=["land","surface","island","reef","deep","island","surface","deep"];
    const buckets={}; for(const q of flat)(buckets[q.type]??=[]).push(q);
    const used={};
    h.markers.forEach((m,i)=>{
      const type=order[i%order.length], b=buckets[type]||flat;
      const n=used[type]||0; used[type]=n+1;
      const q=b[n%b.length], [x,y,z]=q.p;
      m.group.position.x=x; m.group.position.z=z;
      if(y!==null){m.group.position.y=y;m.base=y}
      else m.base=m.group.position.y;
      m.word.exploreZone=q.zone;
      m.word.exploreType=q.type;
      // Make underwater/surface targets easier to spot without turning them into giant billboards.
      if(m.sprite){
        const k=(q.type==="deep"||q.type==="reef")?1.18:(q.type==="surface"?1.08:1);
        m.sprite.scale.set(3.8*k,.95*k,1);
      }
    });
    h.save?.(); h.refresh?.();
  }
  function install(){
    const h=window.__LAGOON__?.hunt;
    if(!h)return false;
    if(h.__expandedOceanHunt){distribute(h);return true}
    h.__expandedOceanHunt=true;
    const rebuild=h.rebuild.bind(h);
    h.rebuild=function(){const r=rebuild();distribute(h);return r};
    distribute(h);
    const setup=h.setup;
    if(setup && !document.getElementById("golingo-explore-note")){
      const p=document.createElement("p");p.id="golingo-explore-note";p.className="lh-note";
      p.style.cssText="margin-top:10px;color:#9fd7cf";
      p.textContent="Explore everywhere: words can be on beaches, remote islands, floating on the sea, along the reef, or deep underwater.";
      const count=document.getElementById("lh-count"); count?.insertAdjacentElement("afterend",p);
    }
    return true;
  }
  let tries=0,t=setInterval(()=>{if(install()||++tries>300)clearInterval(t)},50);
  window.addEventListener("golingo-game-event",()=>setTimeout(()=>{const h=window.__LAGOON__?.hunt;if(h)distribute(h)},0));
})();