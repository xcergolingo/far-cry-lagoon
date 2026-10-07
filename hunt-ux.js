/* GoLingo Hunt UX fixes v1 */
(function(){
  function install(){
    const h=window.__LAGOON__?.hunt, player=window.__LAGOON__?.player;
    if(!h||!player)return false;
    if(h.__huntUxV1)return true; h.__huntUxV1=true;

    // Closing a language modal must resume the game directly, never reopen the main/settings page.
    h.close=function(panel){
      panel?.classList.add("hidden");
      h.ui.modal=null;
      h.ui.paused=false;
      player.active=true;
      if(h.ui.started){
        const mc=document.getElementById("mobile-controls");
        if(document.body.classList.contains("touch-mode"))mc?.classList.remove("hidden");
      }
    };

    // Keep learning: close practice and resume exactly where the player is.
    const keep=document.getElementById("lh-keep");
    if(keep) keep.onclick=()=>h.close(h.practice);

    // Basket: preserve original behavior but resume gameplay after the word is removed.
    const add=document.getElementById("lh-add");
    if(add) add.onclick=()=>{
      const w=h.practiceWord;if(!w)return;
      w.basket=true;w.found=true;h.save();h.rebuild();
      h.notify(w.learning+" added to your review basket.");
      h.close(h.practice);
    };

    // HUNT button: select nearest uncollected marker, show live bearing/distance and optional auto-walk/swim.
    const hud=document.getElementById("hud");
    const btn=document.createElement("button");btn.id="golingo-hunt-btn";btn.textContent="HUNT";
    btn.style.cssText="position:absolute;right:18px;top:16px;pointer-events:auto;padding:11px 16px;border-color:#75d1bf;background:rgba(5,47,49,.82);font-weight:700;z-index:30";
    hud?.appendChild(btn);
    const guide=document.createElement("div");guide.id="golingo-hunt-guide";guide.className="hidden";
    guide.style.cssText="position:absolute;left:50%;top:16px;transform:translateX(-50%);padding:10px 15px;background:rgba(5,40,42,.8);border:1px solid rgba(117,209,191,.4);font:600 11px/1.45 system-ui;letter-spacing:.05em;text-align:center;pointer-events:none";
    hud?.appendChild(guide);
    let target=null,auto=false;

    function nearest(){
      let best=null,bd=Infinity;
      for(const m of h.markers){
        if(m.word.basket)continue;
        const d=player.position.distanceTo(m.group.position);
        if(d<bd){bd=d;best=m}
      }
      return best;
    }
    function choose(){
      target=nearest();
      if(!target){h.notify("You found every word in this hunt.");guide.classList.add("hidden");return}
      auto=true;guide.classList.remove("hidden");
      h.notify("Hunt started: "+target.word.learning+" · "+(target.word.exploreZone||target.word.exploreType||"explore"));
    }
    btn.onclick=choose;

    // Mobile also gets HUNT near the top controls.
    const top=document.querySelector(".mobile-top");
    if(top){const mb=btn.cloneNode(true);mb.id="golingo-hunt-mobile";mb.style.cssText="";mb.onclick=choose;top.prepend(mb)}

    function tick(){
      if(target){
        if(target.word.basket || !h.markers.includes(target)){target=null;auto=false;setTimeout(choose,250)}
        else{
          const dx=target.group.position.x-player.position.x,dz=target.group.position.z-player.position.z;
          const dist=Math.hypot(dx,dz),dy=target.group.position.y-player.position.y;
          const zone=target.word.exploreZone||target.word.exploreType||"";
          guide.innerHTML="HUNT · <b>"+target.word.learning+"</b> · "+Math.round(dist)+" m · "+zone+(dy<-2?" · DIVE ↓":dy>3?" · UP ↑":"");
          // Auto navigation deliberately stops near the target so the learner still finds/interacts with it.
          if(auto && dist>4.2 && !h.ui.paused){
            const len=Math.max(dist,0.001),speed=Math.min(0.11,dist*.006);
            player.position.x+=dx/len*speed;player.position.z+=dz/len*speed;
            // Underwater target: descend gradually only once close enough; surface targets rise gently.
            if(dist<18 && Math.abs(dy)>1.5)player.position.y+=Math.sign(dy)*Math.min(.045,Math.abs(dy)*.008);
          } else if(dist<=4.2) auto=false;
        }
      }
      requestAnimationFrame(tick);
    }
    tick();
    return true;
  }
  let n=0,t=setInterval(()=>{if(install()||++n>300)clearInterval(t)},50);
})();