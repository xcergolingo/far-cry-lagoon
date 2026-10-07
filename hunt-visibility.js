/* Always-visible Show Word control and target card */
(function(){
function init(){
 const h=window.__LAGOON__?.hunt;
 if(!h)return false;
 if(document.getElementById("golingo-show-word-fixed"))return true;
 const b=document.createElement("button");b.id="golingo-show-word-fixed";b.textContent="SHOW WORD";
 b.style.cssText="position:fixed;right:12px;top:75px;z-index:9999;padding:12px 14px;background:#07564d;color:white;border:2px solid #a7ffe2;border-radius:8px;font-weight:bold;pointer-events:auto";
 document.body.appendChild(b);
 const card=document.createElement("div");card.id="golingo-target-card";
 card.style.cssText="display:none;position:fixed;top:30%;left:50%;transform:translateX(-50%);z-index:10000;max-width:90vw;padding:24px;background:#083b3a;color:white;border:2px solid #a7ffe2;border-radius:12px;text-align:center;pointer-events:auto";
 document.body.appendChild(card);
 b.onclick=()=>{
  const p=window.__LAGOON__?.player;
  let best=null,d=Infinity;
  for(const m of h.markers){if(m.word.basket)continue;const v=p.position.distanceTo(m.group.position);if(v<d){d=v;best=m}}
  if(!best){card.textContent="No remaining words.";card.style.display="block";return}
  card.replaceChildren();
  const title=document.createElement("div");title.textContent=best.word.learning;title.style.cssText="font:700 42px system-ui;margin-bottom:12px";card.appendChild(title);
  const practice=document.createElement("button");practice.textContent="PRACTICE WORD";practice.onclick=()=>{card.style.display="none";h.practiceWord=best.word;best.word.found=true;h.save();h.openPractice(best.word)};card.appendChild(practice);
  const close=document.createElement("button");close.textContent="CLOSE";close.style.marginLeft="12px";close.onclick=()=>card.style.display="none";card.appendChild(close);
  card.style.display="block";
 };
 return true;
}
let n=0,t=setInterval(()=>{if(init()||++n>300)clearInterval(t)},100);
})();