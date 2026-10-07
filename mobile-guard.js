/* GoLingo mobile gameplay guard v2 */
(function(){
 function install(){
  const h=window.__LAGOON__?.hunt, player=window.__LAGOON__?.player;
  if(!h||!player)return false;
  if(h.__mobileGuardV2)return true;h.__mobileGuardV2=true;
  const menu=document.getElementById("menu"), mobile=document.getElementById("mobile-controls");
  let explicitMenu=false;

  function resume(){
    h.ui.modal=null;h.ui.paused=false;player.active=true;
    menu?.classList.add("hidden");
    if(document.body.classList.contains("touch-mode")&&h.ui.started)mobile?.classList.remove("hidden");
  }
  // Language panels close straight back to play without invoking the game's generic close/start/menu path.
  h.close=function(panel){panel?.classList.add("hidden");resume()};

  const keep=document.getElementById("lh-keep");
  if(keep)keep.onclick=()=>{h.practice?.classList.add("hidden");resume()};
  const add=document.getElementById("lh-add");
  if(add)add.onclick=()=>{
    const w=h.practiceWord;if(!w)return;
    w.basket=true;w.found=true;h.save();h.rebuild();h.notify(w.learning+" added to your review basket.");
    h.practice?.classList.add("hidden");resume();
  };

  // Only the actual menu controls may intentionally expose #menu.
  const menuBtn=document.getElementById("touch-menu");
  if(menuBtn)menuBtn.addEventListener("pointerdown",()=>{explicitMenu=true;setTimeout(()=>explicitMenu=false,900)},true);

  // Gameplay gestures must never transition to the title/main menu.
  const gameplaySelectors=["#game","#joystick","#stick","#mobile-controls",".mobile-buttons","#golingo-hunt-mobile"];
  const isGameplay=t=>gameplaySelectors.some(s=>t?.closest?.(s));
  for(const ev of ["touchstart","touchmove","pointerdown","pointermove"]){
    document.addEventListener(ev,e=>{
      if(!h.ui.started||explicitMenu||!isGameplay(e.target))return;
      // If another handler accidentally revealed the menu during a gesture, immediately restore play.
      requestAnimationFrame(()=>{if(!explicitMenu&&!menu?.classList.contains("hidden"))resume()});
    },{capture:true,passive:true});
  }

  // Strong state guard while a finger is actively controlling the game.
  let activeTouches=0;
  document.addEventListener("touchstart",e=>{if(h.ui.started&&isGameplay(e.target))activeTouches=e.touches.length},{capture:true,passive:true});
  document.addEventListener("touchend",e=>{activeTouches=e.touches.length},{capture:true,passive:true});
  document.addEventListener("touchcancel",()=>{activeTouches=0},{capture:true,passive:true});
  const observer=new MutationObserver(()=>{
    if(h.ui.started&&activeTouches>0&&!explicitMenu&&!menu?.classList.contains("hidden"))resume();
  });
  if(menu)observer.observe(menu,{attributes:true,attributeFilter:["class"]});
  return true;
 }
 let n=0,t=setInterval(()=>{if(install()||++n>300)clearInterval(t)},50);
})();