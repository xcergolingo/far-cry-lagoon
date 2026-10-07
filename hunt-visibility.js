/* Arrival card v3: automatic, touch-safe, no SHOW WORD button */
(function(){
function init(){
 const h=window.__LAGOON__?.hunt;
 if(!h)return false;
 if(window.__golingoArrivalV3)return true;
 window.__golingoArrivalV3=true;
 document.querySelectorAll("#golingo-show-word-fixed,#golingo-show-target").forEach(e=>e.remove());
 const style=document.createElement("style");
 style.textContent=`
 #golingo-hunt-btn{top:64px!important;right:12px!important}
 #golingo-hunt-mobile{position:relative!important}
 .mobile-top{top:calc(env(safe-area-inset-top, 0px) + 12px)!important;right:12px!important;display:flex!important;flex-wrap:wrap!important;justify-content:flex-end!important;max-width:75vw!important;gap:7px!important}
 .mobile-top button{position:relative!important;top:auto!important;right:auto!important;min-height:42px!important}
 .touch-mode #golingo-hunt-btn{display:none!important}
 #golingo-arrival-card{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10020;width:min(430px,90vw);max-height:78dvh;overflow:auto;padding:22px;background:#092f31f5;color:#fff;border:2px solid #87e6ce;border-radius:14px;text-align:center;box-shadow:0 12px 45px #000b;pointer-events:auto}
 #golingo-arrival-card[hidden]{display:none!important}
 #golingo-arrival-card button{min-height:44px;margin:5px;padding:10px 14px;touch-action:manipulation}
 #golingo-arrival-card .word{font:700 clamp(32px,8vw,58px) system-ui;overflow-wrap:anywhere;margin:14px 0}
 `;
 document.head.appendChild(style);
 const card=document.createElement("section");card.id="golingo-arrival-card";card.hidden=true;
 card.innerHTML='<div style="font:600 12px system-ui;letter-spacing:.12em;color:#a6e8d8">HUNT TARGET FOUND</div><div class="word"></div><div><button data-action="hear">🔊 HEAR WORD</button><button data-action="practice">PRACTICE</button><button data-action="basket">PUT IN BASKET</button><button data-action="close">LOOK AROUND</button></div>';
 document.body.appendChild(card);
 let target=null,arrived=false,armed=false;
 function nearest(){
  const p=window.__LAGOON__?.player;if(!p)return null;
  let best=null,d=Infinity;
  for(const m of h.markers){if(m.word.basket)continue;const v=p.position.distanceTo(m.group.position);if(v<d){d=v;best=m}}
  return best;
 }
 function show(m){
  if(!m||!armed||arrived)return;
  target=m;arrived=true;armed=false;
  card.querySelector(".word").textContent=m.word.learning;
  card.hidden=false;
 }
 card.addEventListener("click",e=>{
  const action=e.target.closest("button")?.dataset.action;
  if(!action||!target)return;
  const w=target.word;
  if(action==="hear")h.speak(w.learning,h.state.learning);
  if(action==="practice"){card.hidden=true;w.found=true;h.practiceWord=w;h.save();h.openPractice(w)}
  if(action==="basket"){
    w.basket=true;w.found=true;h.save();h.rebuild();h.refresh();card.hidden=true;
    h.notify(w.learning+" added to basket. Tap HUNT for another word.");
  }
  if(action==="close")card.hidden=true;
 });
 // Arm only on explicit HUNT. Prevent repeat card after basket.
 document.addEventListener("click",e=>{
  if(e.target.closest("#golingo-hunt-btn,#golingo-hunt-mobile")){armed=true;arrived=false;target=null;card.hidden=true}
 },true);
 const guide=document.getElementById("golingo-hunt-guide");
 if(guide){
  const check=()=>{
   if(!armed)return;
   if(guide.textContent.includes("TARGET NEARBY"))show(nearest());
  };
  new MutationObserver(check).observe(guide,{childList:true,subtree:true,characterData:true});
 }
 return true;
}
let n=0,t=setInterval(()=>{if(init()||++n>300)clearInterval(t)},100);
})();