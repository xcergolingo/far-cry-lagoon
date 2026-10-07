/* GoLingo Hunt visibility assist v1 */
(function(){
 function install(){
  const h=window.__LAGOON__?.hunt,player=window.__LAGOON__?.player;
  if(!h||!player)return false;if(h.__huntVisibilityV1)return true;h.__huntVisibilityV1=true;

  function norm(a){return Math.atan2(Math.sin(a),Math.cos(a))}
  function faceMarker(m){
    if(!m)return;
    const dx=m.group.position.x-player.position.x,dz=m.group.position.z-player.position.z;
    player.yaw=Math.atan2(-dx,-dz);
    // Put the eye near the marker's vertical level when necessary so it cannot be above/below the view.
    const type=m.word.exploreType;
    if(type==="deep"||type==="reef"){
      player.position.y=m.group.position.y+.25;
    }else if(type==="surface"){
      player.position.y=Math.max(player.position.y,m.group.position.y+.65);
    }
    // Make the target visually unmistakable for a few seconds.
    const sp=m.sprite,orb=m.orb;
    if(sp){
      const original=sp.scale.clone();
      sp.scale.multiplyScalar(1.65);
      sp.material.depthTest=false;sp.material.opacity=1;
      let start=performance.now();
      const pulse=now=>{
        if(!h.markers.includes(m))return;
        const t=(now-start)/1000;
        if(t>5){sp.scale.copy(original);sp.material.depthTest=true;sp.material.opacity=1;return}
        const k=1+.10*Math.sin(t*8);sp.scale.copy(original).multiplyScalar(1.65*k);
        requestAnimationFrame(pulse);
      };requestAnimationFrame(pulse);
    }
    if(orb){
      const old=orb.scale.clone();orb.scale.multiplyScalar(2.1);
      setTimeout(()=>{if(orb.parent)orb.scale.copy(old)},5000);
    }
    h.notify("Target found nearby: "+m.word.learning+". It is highlighted in front of you.");
  }

  // Watch the Hunt guide. When v2 announces TARGET NEARBY, use the selected nearest marker
  // and orient the player to it. At this point v2 has already stopped movement.
  const guide=document.getElementById("golingo-hunt-guide");
  if(guide){
    let handled="";
    new MutationObserver(()=>{
      if(!guide.textContent.includes("TARGET NEARBY"))return;
      // v2's arrived target is the closest remaining marker at this exact location.
      let best=null,bd=Infinity;
      for(const m of h.markers){
        if(m.word.basket)continue;
        const d=player.position.distanceTo(m.group.position);
        if(d<bd){bd=d;best=m}
      }
      if(!best)return;
      const k=String(best.word.id||best.word.learning);
      if(k===handled)return;handled=k;faceMarker(best);
    }).observe(guide,{childList:true,subtree:true,characterData:true});
  }

  // Also provide an explicit "SHOW WORD" action during the nearby state.
  const show=document.createElement("button");show.id="golingo-show-target";show.textContent="SHOW WORD";
  show.style.cssText="position:absolute;right:18px;top:62px;pointer-events:auto;padding:9px 12px;border-color:#75d1bf;background:rgba(5,47,49,.82);font-size:9px;z-index:31";
  show.classList.add("hidden");document.getElementById("hud")?.appendChild(show);
  let timer=setInterval(()=>{
    if(!guide){clearInterval(timer);return}
    const near=guide.textContent.includes("TARGET NEARBY");
    show.classList.toggle("hidden",!near);
  },250);
  show.onclick=()=>{
    let best=null,bd=Infinity;
    for(const m of h.markers){if(m.word.basket)continue;const d=player.position.distanceTo(m.group.position);if(d<bd){bd=d;best=m}}
    faceMarker(best);
  };
  return true;
 }
 let n=0,t=setInterval(()=>{if(install()||++n>300)clearInterval(t)},50);
})();