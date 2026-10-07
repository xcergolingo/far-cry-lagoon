/* GoLingo Hunt navigation v2 — one-shot hunt + natural turn-then-forward movement */
(function(){
 function install(){
  const h=window.__LAGOON__?.hunt, player=window.__LAGOON__?.player;
  if(!h||!player)return false;
  if(h.__huntNavV2)return true; h.__huntNavV2=true;

  // Disable v1 auto-selection behavior if it exists.
  const oldDesktop=document.getElementById("golingo-hunt-btn");
  const oldMobile=document.getElementById("golingo-hunt-mobile");
  oldDesktop?.remove(); oldMobile?.remove();
  const oldGuide=document.getElementById("golingo-hunt-guide"); oldGuide?.remove();

  const hud=document.getElementById("hud");
  const guide=document.createElement("div");guide.id="golingo-hunt-guide";
  guide.className="hidden";guide.style.cssText="position:absolute;left:50%;top:16px;transform:translateX(-50%);padding:10px 15px;background:rgba(5,40,42,.82);border:1px solid rgba(117,209,191,.4);font:600 11px/1.45 system-ui;letter-spacing:.05em;text-align:center;pointer-events:none;z-index:30";
  hud?.appendChild(guide);
  const btn=document.createElement("button");btn.id="golingo-hunt-btn";btn.textContent="HUNT";
  btn.style.cssText="position:absolute;right:18px;top:16px;pointer-events:auto;padding:11px 16px;border-color:#75d1bf;background:rgba(5,47,49,.82);font-weight:700;z-index:31";
  hud?.appendChild(btn);

  let target=null, active=false, arriving=false;
  const norm=a=>Math.atan2(Math.sin(a),Math.cos(a));
  function nearest(){
    let best=null,bd=Infinity;
    for(const m of h.markers){
      if(m.word.basket)continue;
      const d=player.position.distanceTo(m.group.position);
      if(d<bd){bd=d;best=m}
    }
    return best;
  }
  function stop(message){
    active=false;arriving=false;target=null;guide.classList.add("hidden");
    if(message)h.notify(message);
  }
  function start(){
    target=nearest();
    if(!target){stop("You found every word in this hunt.");return}
    active=true;arriving=false;guide.classList.remove("hidden");
    h.notify("Hunt started: "+target.word.learning+".");
  }
  btn.onclick=start;
  const top=document.querySelector(".mobile-top");
  if(top){const mb=document.createElement("button");mb.id="golingo-hunt-mobile";mb.textContent="HUNT";mb.onclick=start;top.prepend(mb)}

  // Basket explicitly ends the hunt. No automatic next target.
  const add=document.getElementById("lh-add");
  if(add)add.onclick=()=>{
    const w=h.practiceWord;if(!w)return;
    w.basket=true;w.found=true;h.save();h.rebuild();
    h.notify(w.learning+" added to your review basket. Tap HUNT when you want the next word.");
    h.practice?.classList.add("hidden");
    h.ui.modal=null;h.ui.paused=false;player.active=true;
    document.getElementById("menu")?.classList.add("hidden");
    if(document.body.classList.contains("touch-mode")&&h.ui.started)document.getElementById("mobile-controls")?.classList.remove("hidden");
    stop();
  };

  let last=performance.now();
  function tick(now){
    const dt=Math.min(.05,(now-last)/1000||.016);last=now;
    if(active&&target){
      if(target.word.basket||!h.markers.includes(target)){stop();requestAnimationFrame(tick);return}
      const dx=target.group.position.x-player.position.x,dz=target.group.position.z-player.position.z;
      const dist=Math.hypot(dx,dz),dy=target.group.position.y-player.position.y;
      const zone=target.word.exploreZone||target.word.exploreType||"";
      guide.innerHTML="HUNT · <b>"+target.word.learning+"</b> · "+Math.round(dist)+" m · "+zone+(dy<-2?" · DIVE ↓":dy>3?" · UP ↑":"");

      if(!h.ui.paused&&dist>3.8){
        // Three.js forward for yaw=0 is -Z. Turn first toward the destination.
        const desired=Math.atan2(-dx,-dz);
        const yaw=player.yaw||0,delta=norm(desired-yaw);
        const maxTurn=2.35*dt;
        player.yaw=yaw+Math.max(-maxTurn,Math.min(maxTurn,delta));

        // Only move forward when mostly facing the target. Tight turns slow almost to a stop.
        const facing=Math.cos(delta);
        if(facing>.35){
          const speed=(dist<10?2.0:dist<25?2.8:3.5)*Math.max(.18,Math.min(1,(facing-.35)/.65));
          const step=Math.min(speed*dt,Math.max(0,dist-3.6));
          player.position.x+=-Math.sin(player.yaw)*step;
          player.position.z+=-Math.cos(player.yaw)*step;
          // Vertical movement is gradual and only near underwater targets.
          if(dist<16&&Math.abs(dy)>1.2){
            const v=Math.min(.8*dt,Math.abs(dy));
            player.position.y+=Math.sign(dy)*v;
          }
        }
      } else if(dist<=3.8&&!arriving){
        arriving=true;active=false;
        guide.innerHTML="TARGET NEARBY · <b>"+target.word.learning+"</b> · look around";
        h.notify("Target nearby. Look around and find "+target.word.learning+".");
        setTimeout(()=>guide.classList.add("hidden"),3500);
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  return true;
 }
 let n=0,t=setInterval(()=>{if(install()||++n>300)clearInterval(t)},50);
})();