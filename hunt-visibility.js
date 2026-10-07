/* Restore world-space words; suppress intrusive arrival popup and overlap */
(function(){
 function install(){
  const h=window.__LAGOON__?.hunt;if(!h)return false;
  if(window.__golingoWorldWordsV4)return true;window.__golingoWorldWordsV4=true;
  document.getElementById("golingo-arrival-card")?.remove();
  document.querySelectorAll("#golingo-show-word-fixed,#golingo-show-target").forEach(x=>x.remove());
  const style=document.createElement("style");
  style.textContent=`
  html,body,canvas,button,.mobile-top,.mobile-buttons,#mobile-controls,#hud,#menu{user-select:none!important;-webkit-user-select:none!important;-webkit-touch-callout:none!important}
  input,textarea{user-select:text!important;-webkit-user-select:text!important}
  #golingo-hunt-guide{top:calc(env(safe-area-inset-top,0px) + 70px)!important;max-width:70vw!important;white-space:normal!important}
  #toast{top:auto!important;bottom:calc(env(safe-area-inset-bottom,0px) + 175px)!important;max-width:75vw!important;pointer-events:none!important}
  body.golingo-walking #toast{opacity:0!important}
  body.golingo-walking #lh-status{display:none!important}

  #golingo-arrival-card,#golingo-arrival-word,#golingo-target-card{display:none!important}
  .touch-mode .mobile-top{top:calc(env(safe-area-inset-top,0px) + 12px)!important;right:12px!important;display:flex!important;flex-wrap:wrap!important;max-width:78vw!important;gap:6px!important}
  .touch-mode .mobile-top button{position:relative!important;top:auto!important;right:auto!important;min-height:42px!important}
  .touch-mode #golingo-hunt-btn{display:none!important}
  .touch-mode #golingo-hunt-guide:not(.hidden)~*{ }
  body.golingo-walking .mobile-top{opacity:0!important;pointer-events:none!important}
  body.golingo-walking #golingo-hunt-btn{display:none!important}
  `;document.head.appendChild(style);
  function showWorldWords(){
   for(const m of h.markers){
    if(!m.word.basket){
     m.group.visible=true;
     if(m.sprite){
      m.sprite.visible=true;
      m.sprite.material.depthTest=false;
      m.sprite.material.depthWrite=false;
      m.sprite.material.transparent=true;
      m.sprite.material.opacity=1;
      const type=m.word.exploreType;
      m.sprite.scale.set(type==="land"||type==="island"?5.2:4.6,type==="land"||type==="island"?1.3:1.15,1);
     }
    }
   }
  }
  const rebuild=h.rebuild.bind(h);h.rebuild=function(){const r=rebuild();showWorldWords();return r};
  showWorldWords();
  const guide=document.getElementById("golingo-hunt-guide");
  if(guide){
   new MutationObserver(()=>{
    const walking=!guide.classList.contains("hidden")&&!guide.textContent.includes("TARGET NEARBY");
    document.body.classList.toggle("golingo-walking",walking);
   }).observe(guide,{attributes:true,attributeFilter:["class"],childList:true,subtree:true,characterData:true});
  }
  return true;
 }
 let n=0,t=setInterval(()=>{if(install()||++n>300)clearInterval(t)},100);
})();