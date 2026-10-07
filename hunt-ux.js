/* Hunt v3: boat autopilot and underwater word fishing */
(function(){
function init(){
const g=window.__LAGOON__,h=g?.hunt,p=g?.player,boat=g?.boat;
if(!h||!p||!boat)return false;
if(window.__golingoBoatHuntV3)return true;window.__golingoBoatHuntV3=true;
const guide=document.getElementById("golingo-hunt-guide");
const desktop=document.getElementById("golingo-hunt-btn"),mobile=document.getElementById("golingo-hunt-mobile");
if(!guide||!desktop)return false;
let target=null,active=false,fishing=false,previousAuto=false;
const norm=a=>Math.atan2(Math.sin(a),Math.cos(a));
function stop(){active=false;target=null;previousAuto=false;delete p.keys.KeyW;delete p.keys.KeyA;delete p.keys.KeyD;delete p.keys.KeyS;guide.classList.add("hidden")}
function nearest(){
const origin=boat.seated?boat.position:p.position;let best=null,dist=Infinity;
for(const m of h.markers){if(m.word.basket)continue;const dx=m.group.position.x-origin.x,dz=m.group.position.z-origin.z,d=Math.hypot(dx,dz);if(d<dist){dist=d;best=m}}
return best;
}
function start(){stop();target=nearest();if(!target){h.notify("All words are in your basket.");return}active=true;guide.classList.remove("hidden");h.notify(boat.seated?"Boat HUNT: steering toward "+target.word.learning:"HUNT: walking toward "+target.word.learning)}
desktop.onclick=start;if(mobile)mobile.onclick=start;
const box=document.createElement("div");box.id="golingo-fishing";box.hidden=true;
box.style.cssText="position:fixed;z-index:10010;top:50%;left:50%;transform:translate(-50%,-50%);width:min(390px,92vw);padding:24px;background:#063a40f5;color:white;border:2px solid #83e3d1;border-radius:14px;text-align:center;pointer-events:auto";
box.innerHTML='<div style="font:700 15px system-ui">FISH FOR THE WORD</div><p style="font:13px system-ui">Tap REEL repeatedly to bring the underwater word up!</p><div style="height:12px;background:#184b50;border-radius:8px;overflow:hidden"><div id="golingo-reel-bar" style="height:100%;width:0;background:#8ee4cb"></div></div><p id="golingo-reel-count">0%</p><button id="golingo-reel">REEL 🎣</button> <button id="golingo-reel-cancel">CANCEL</button>';
document.body.appendChild(box);const style=document.createElement("style");style.textContent="#golingo-fishing[hidden]{display:none!important}";document.head.appendChild(style);
let progress=0;
function fish(m){stop();target=m;fishing=true;progress=0;box.hidden=false;box.querySelector("#golingo-reel-bar").style.width="0%";box.querySelector("#golingo-reel-count").textContent="0%";h.notify("Fish the underwater word to the surface.");}
box.querySelector("#golingo-reel-cancel").onclick=()=>{fishing=false;box.hidden=true;target=null};
box.querySelector("#golingo-reel").onclick=()=>{
if(!target)return;progress=Math.min(100,progress+12+Math.floor(Math.random()*8));
box.querySelector("#golingo-reel-bar").style.width=progress+"%";box.querySelector("#golingo-reel-count").textContent=progress+"%";
if(progress>=100){const w=target.word;fishing=false;box.hidden=true;target=null;w.found=true;h.practiceWord=w;h.save();h.openPractice(w)}
};
const add=document.getElementById("lh-add");
if(add)add.addEventListener("click",()=>{stop();fishing=false;box.hidden=true},true);
let last=performance.now();
function tick(now){
const dt=Math.min(.05,(now-last)/1000||.016);last=now;
if(active&&target){
if(target.word.basket||!h.markers.includes(target)){stop()}
else{
const aboard=boat.seated,origin=aboard?boat.position:p.position;
const dx=target.group.position.x-origin.x,dz=target.group.position.z-origin.z,dist=Math.hypot(dx,dz);
const underwater=target.group.position.y<-.9;
guide.textContent=(aboard?"BOAT HUNT":"HUNT")+" · "+target.word.learning+" · "+Math.round(dist)+" m"+(underwater?" · FISHING":"");
if(!h.ui.paused){
if(aboard){
if(dist<8){stop();if(underwater)fish(target);else h.notify("Word nearby. Look and tap the floating label.")}
else{
if(boat.moored){h.notify("Cast off the mooring with E before boat HUNT.");stop()}
else{
const desired=Math.atan2(-dx,-dz),delta=norm(desired-boat.heading);
p.keys.KeyW=Math.abs(delta)<1.2;p.keys.KeyA=delta>0.12;p.keys.KeyD=delta<-.12;
p.keys.KeyS=false;
}
}
}else{
if(dist<3.5){stop();h.notify("Word nearby. Look around and tap it.")}
else{
const desired=Math.atan2(-dx,-dz),delta=norm(desired-p.yaw),turn=Math.max(-2.2*dt,Math.min(2.2*dt,delta));
p.yaw+=turn;
if(Math.abs(delta)<.8){const step=Math.min((dist<10?1.6:2.8)*dt,dist-3.3);p.position.x-=Math.sin(p.yaw)*step;p.position.z-=Math.cos(p.yaw)*step}
}
}
}
}
}
requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
return true;
}
let n=0,t=setInterval(()=>{if(init()||++n>300)clearInterval(t)},100);
})();