/* Mobile controls and fresh hunt management */
(function(){
 function init(){
  const h=window.__LAGOON__?.hunt;if(!h)return false;
  if(window.__golingoRestartV1)return true;window.__golingoRestartV1=true;
  const css=document.createElement("style");css.textContent=`
   .touch-mode #mobile-controls{display:block!important;pointer-events:none!important}
   .touch-mode #mobile-controls .mobile-top,.touch-mode #mobile-controls .mobile-buttons,.touch-mode #joystick{pointer-events:auto!important}
   .touch-mode .mobile-top{opacity:1!important;pointer-events:auto!important;visibility:visible!important}
   .touch-mode .mobile-top button{display:inline-block!important;visibility:visible!important;opacity:1!important}
   .touch-mode #golingo-hunt-mobile{display:inline-block!important}
   .touch-mode #golingo-hunt-btn{display:none!important}
   #golingo-reset-hunt{background:#155b52!important;color:white!important}
   `;document.head.appendChild(css);
  const btn=document.createElement("button");btn.id="golingo-reset-hunt";btn.textContent="NEW HUNT";
  btn.title="Empty the basket and scatter all words into fresh locations";
  const top=document.querySelector(".mobile-top");
  // NEW HUNT belongs in Settings, not the gameplay controls.
  const settings=document.getElementById("settings");
  const settingActions=settings?.querySelector(".setting-actions")||settings;
  if(settingActions)settingActions.appendChild(btn);
  const desktop=document.getElementById("menu")?.querySelector(".actions");
  const desktopBtn=btn.cloneNode(true);desktopBtn.id="golingo-reset-hunt-menu";// Avoid duplicate NEW HUNT buttons on the title screen.
  function reset(){
   if(!confirm("Clear the basket and start a new hunt with fresh word locations?"))return;
   h.state.words.forEach(w=>{w.basket=false;w.found=false;w.practice=0;delete w.huntLocation;delete w.exploreSlot});
   // New route: reuse the randomizer on rebuild, with no saved coordinates.
   h.rebuild();h.save();h.refresh();
   h.notify("New hunt started. Basket cleared and words scattered.");
   h.ui.modal=null;h.ui.paused=false;
   document.getElementById("menu")?.classList.add("hidden");
   if(h.ui.started)document.getElementById("mobile-controls")?.classList.remove("hidden");
  }
  btn.onclick=reset;desktopBtn.onclick=reset;
  // Recover mobile controls if game has started but a modal has closed without restoring them.
  const tick=()=>{
   const menu=document.getElementById("menu");
   const modalOpen=!!document.querySelector(".modal:not(.hidden)");
   if(h.ui.started&&!modalOpen&&menu?.classList.contains("hidden")&&document.body.classList.contains("touch-mode")){
    document.getElementById("mobile-controls")?.classList.remove("hidden");
   }
  };
  setInterval(tick,500);
  return true;
 }
 let n=0,t=setInterval(()=>{if(init()||++n>300)clearInterval(t)},100);
})();