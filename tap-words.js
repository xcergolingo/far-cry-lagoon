/* Tap floating 3D word labels to collect them after looking up */
(function(){
 function init(){
  const game=window.__LAGOON__,h=game?.hunt;
  if(!h||!game?.player||!game?.camera)return false;
  if(window.__golingoTapWordsV1)return true;window.__golingoTapWordsV1=true;
  const THREE=game.THREE||window.THREE;
  const canvas=document.getElementById("game");
  function tryTap(clientX,clientY){
   const camera=game.camera,player=game.player;
   if(!camera||!h.markers?.length)return false;
   const rect=canvas.getBoundingClientRect();
   const nx=(clientX-rect.left)/rect.width*2-1,ny=1-(clientY-rect.top)/rect.height*2;
   let best=null,bestDist=Infinity;
   // Project each floating label into screen coordinates. This works without relying on raycaster internals.
   for(const m of h.markers){
    if(m.word.basket||!m.sprite)continue;
    const p=m.sprite.getWorldPosition(m.sprite.position.clone());
    const dist=p.distanceTo(camera.position);
    if(dist>9)continue;
    const projected=p.clone().project(camera);
    if(projected.z< -1||projected.z>1)continue;
    const dx=(projected.x-nx)*rect.width/2,dy=(projected.y-ny)*rect.height/2;
    const halfW=Math.max(45,Math.min(210,rect.width*.20/(Math.max(1,dist/3))));
    const halfH=Math.max(32,Math.min(85,rect.height*.055));
    if(Math.abs(dx)<=halfW&&Math.abs(dy)<=halfH&&dist<bestDist){best=m;bestDist=dist}
   }
   if(!best)return false;
   best.word.found=true;h.practiceWord=best.word;h.save();h.openPractice(best.word);
   return true;
  }
  let start=null;
  canvas.addEventListener("touchstart",e=>{if(e.touches.length===1)start={x:e.touches[0].clientX,y:e.touches[0].clientY,time:Date.now()}},{passive:true});
  canvas.addEventListener("touchend",e=>{
   if(!start||!e.changedTouches.length)return;
   const t=e.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;
   if(Math.hypot(dx,dy)<18&&Date.now()-start.time<450){if(tryTap(t.clientX,t.clientY))e.preventDefault()}
   start=null;
  },{passive:false});
  canvas.addEventListener("click",e=>{if(!document.body.classList.contains("touch-mode"))tryTap(e.clientX,e.clientY)});
  return true;
 }
 let n=0,t=setInterval(()=>{if(init()||++n>300)clearInterval(t)},100);
})();