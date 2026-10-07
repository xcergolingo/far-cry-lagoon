/* Automatically display the actual Hunt target at arrival. */
(function(){
function init(){
 const h=window.__LAGOON__?.hunt;
 if(!h)return false;
 if(window.__golingoArrivalCardInstalled)return true;
 window.__golingoArrivalCardInstalled=true;
 let lastArrival="",target=null;
 const card=document.createElement("div");
 card.id="golingo-arrival-word";
 card.style.cssText="display:none;position:fixed;top:24%;left:50%;transform:translateX(-50%);z-index:10000;width:min(460px,90vw);padding:22px;background:rgba(5,45,48,.96);color:#fff;border:2px solid #9af7dd;border-radius:14px;text-align:center;box-shadow:0 12px 48px #0009;pointer-events:auto";
 card.innerHTML='<div style="font:600 12px system-ui;letter-spacing:.15em;color:#a5e8d9">WORD FOUND · HUNT ARRIVAL</div><div id="golingo-arrival-text" style="font:700 clamp(30px,8vw,60px) system-ui;margin:16px 0;overflow-wrap:anywhere"></div><button id="golingo-arrival-practice">PRACTICE WORD</button><button id="golingo-arrival-close">LOOK AROUND</button>';
 document.body.appendChild(card);
 card.querySelector("#golingo-arrival-close").onclick=()=>card.style.display="none";
 card.querySelector("#golingo-arrival-practice").onclick=()=>{
  card.style.display="none";
  if(!target)return;
  target.word.found=true;h.practiceWord=target.word;h.save();h.openPractice(target.word);
 };
 const show=document.createElement("button");show.id="golingo-show-word-fixed";show.textContent="SHOW WORD";
 show.style.cssText="position:fixed;right:12px;top:75px;z-index:9999;padding:12px;background:#07564d;color:white;border:2px solid #a7ffe2;border-radius:8px;pointer-events:auto";
 document.body.appendChild(show);
 function nearest(){
  const p=window.__LAGOON__?.player;if(!p)return null;
  let best=null,dist=Infinity;
  for(const m of h.markers){if(m.word.basket)continue;const d=p.position.distanceTo(m.group.position);if(d<dist){dist=d;best=m}}
  return best;
 }
 function reveal(m){
  if(!m)return;
  target=m;card.querySelector("#golingo-arrival-text").textContent=m.word.learning;
  card.style.display="block";
 }
 show.onclick=()=>reveal(nearest());
 const guide=document.getElementById("golingo-hunt-guide");
 if(guide){
  new MutationObserver(()=>{
   if(!guide.textContent.includes("TARGET NEARBY")){lastArrival="";return}
   const m=nearest();if(!m)return;
   const key=String(m.word.id||m.word.learning);
   if(key===lastArrival)return;
   lastArrival=key;reveal(m);
  }).observe(guide,{childList:true,subtree:true,characterData:true});
 }
 return true;
}
let n=0,t=setInterval(()=>{if(init()||++n>300)clearInterval(t)},100);
})();