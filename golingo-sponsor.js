/* GoLingo sponsor + practice links */
(function(){
  const URL="https://GoLingoApp.com/";
  const css=document.createElement("style");
  css.textContent=`
    .golingo-sponsor{position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:24;
      font:600 10px/1.2 system-ui,-apple-system,sans-serif;letter-spacing:.08em;color:#e9f5df;
      background:rgba(5,35,34,.78);border:1px solid rgba(117,209,191,.38);border-radius:999px;
      padding:8px 13px;text-decoration:none;backdrop-filter:blur(8px);pointer-events:auto}
    .golingo-sponsor:hover{background:rgba(17,72,66,.92);border-color:#75d1bf}
    .golingo-word-cta{display:block;margin:10px 0 17px;padding:10px 12px;border-radius:4px;
      border:1px solid rgba(117,209,191,.32);background:rgba(18,68,63,.35);color:#bde9dc!important;
      font:600 10px/1.45 system-ui,-apple-system,sans-serif;letter-spacing:.055em;text-decoration:none!important}
    .golingo-word-cta:hover{background:rgba(31,99,89,.52);border-color:#75d1bf}
    .golingo-word-cta strong{color:#fff4d2}
    .lh-row .golingo-word-cta{margin:8px 0 0;padding:7px 9px;font-size:9px;max-width:310px}
    @media(max-width:650px){.golingo-sponsor{bottom:6px;font-size:9px;padding:7px 10px;max-width:86vw;text-align:center}}
  `;
  document.head.appendChild(css);

  function link(text,cls="golingo-word-cta"){
    const a=document.createElement("a");
    a.className=cls;a.href=URL;a.target="_blank";a.rel="noopener noreferrer";
    a.innerHTML=text;
    a.addEventListener("click",e=>e.stopPropagation());
    return a;
  }
  function installPageSponsor(){
    if(document.querySelector(".golingo-sponsor"))return;
    const a=link("Sponsored by GoLingoApp.com · Practice languages in the real world","golingo-sponsor");
    a.setAttribute("aria-label","GoLingoApp.com sponsor — open GoLingo");
    document.body.appendChild(a);
  }
  function installPracticeCTA(){
    const meaning=document.getElementById("lh-meaning");
    if(!meaning||document.getElementById("golingo-practice-cta"))return;
    const a=link("<strong>GoLingoApp.com</strong> · Practice this word in the real world ↗");
    a.id="golingo-practice-cta";
    meaning.insertAdjacentElement("afterend",a);
  }
  function installBasketCTAs(){
    document.querySelectorAll("#lh-list .lh-row").forEach(row=>{
      const left=row.firstElementChild;
      if(!left||left.querySelector(".golingo-word-cta"))return;
      left.appendChild(link("<strong>GoLingoApp.com</strong> · Practice this word in the real world ↗"));
    });
  }
  function refresh(){installPageSponsor();installPracticeCTA();installBasketCTAs()}
  new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh);else refresh();
})();