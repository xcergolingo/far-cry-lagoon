/* GoLingo Native Bridge v1 */
(function(){
  const MAP={en:"en-US",zh:"zh-CN",ja:"ja-JP",es:"es-ES",fr:"fr-FR",pt:"pt-BR",de:"de-DE",it:"it-IT",ko:"ko-KR",vi:"vi-VN",ar:"ar-SA",hi:"hi-IN",ru:"ru-RU",nl:"nl-NL",sv:"sv-SE"};
  const lang=c=>{if(!c)return null;c=String(c);return MAP[c.toLowerCase()]||c};
  const post=(type,data={})=>{
    const message={type,...data};
    try{window.webkit?.messageHandlers?.golingo?.postMessage(message)}catch(e){}
    try{window.ReactNativeWebView?.postMessage(JSON.stringify(message))}catch(e){}
    window.dispatchEvent(new CustomEvent("golingo-game-event",{detail:message}));
  };
  const ready=()=>new Promise((resolve,reject)=>{
    if(window.__LAGOON__?.hunt)return resolve(window.__LAGOON__);
    let n=0,t=setInterval(()=>{if(window.__LAGOON__?.hunt){clearInterval(t);resolve(window.__LAGOON__)}
      else if(++n>300){clearInterval(t);reject(new Error("Lagoon game did not become ready"))}},50);
  });
  const clean=(w,i)=>{
    if(typeof w==="string")w={word:w};
    const learning=String(w.word??w.learning??w.text??w.term??"").trim();
    const primary=String(w.translation??w.primary??w.meaning??w.definition??"").trim();
    return {id:String(w.id??("golingo-"+i+"-"+learning)),learning,primary,
      sentence:w.sentence??w.example??"",sentenceTranslation:w.sentenceTranslation??w.translationSentence??w.exampleTranslation??"",
      audioURL:w.audioURL??w.audioUrl??null,tags:Array.isArray(w.tags)?w.tags:[],
      found:!!w.found,basket:!!w.basket,practice:Number(w.practice||0),index:i};
  };
  async function importWords(payload={}){
    const game=await ready(),h=game.hunt;
    const primary=lang(payload.primaryLanguage??payload.primary??h.state.primary)||h.state.primary;
    const learning=lang(payload.learningLanguage??payload.learning??h.state.learning)||h.state.learning;
    const words=(Array.isArray(payload.words)?payload.words:[]).map(clean).filter(w=>w.learning).slice(0,100);
    if(!words.length)throw new Error("No learning words were supplied");
    h.state={primary,learning,words};
    if(h.primary)h.primary.value=primary;if(h.learning)h.learning.value=learning;
    if(h.words)h.words.value=words.map(w=>w.learning+(w.primary?" = "+w.primary:"")).join("\n");
    h.save();h.rebuild();h.refresh();
    h.notify(words.length+" GoLingo words imported. Find them around the lagoon.");
    post("wordsImported",{primaryLanguage:primary,learningLanguage:learning,count:words.length,words:h.snapshot().words});
    return h.snapshot();
  }
  async function snapshot(){return (await ready()).hunt.snapshot()}
  async function reviewWords(){return (await snapshot()).words.filter(w=>w.basket)}
  async function openBasket(){const h=(await ready()).hunt;h.openBasket();return h.snapshot()}
  async function openWords(){const h=(await ready()).hunt;h.openSetup();return h.snapshot()}
  async function resetProgress(){const h=(await ready()).hunt;h.state.words.forEach(w=>{w.found=false;w.basket=false;w.practice=0});h.save();h.rebuild();h.refresh();post("progressChanged",{snapshot:h.snapshot()});return h.snapshot()}
  window.GoLingoGame={version:"1.0",ready,importWords,snapshot,reviewWords,openBasket,openWords,resetProgress};
  window.addEventListener("golingo-import",e=>importWords(e.detail).catch(err=>post("error",{message:err.message})));
  window.addEventListener("message",e=>{const d=e.data;if(d?.type==="golingo.importWords")importWords(d.payload||d).catch(err=>post("error",{message:err.message}))});
  ready().then(game=>{
    const h=game.hunt;
    if(!h.__golingoWrapped){
      h.__golingoWrapped=true;
      const save=h.save.bind(h);h.save=function(){save();post("progressChanged",{snapshot:h.snapshot()})};
      const add=h.addBasket.bind(h);h.addBasket=function(){const w=h.practiceWord;add();if(w)post("wordAddedToBasket",{word:{...w},snapshot:h.snapshot()})};
    }
    post("ready",{version:"1.0",snapshot:h.snapshot()});
  }).catch(err=>post("error",{message:err.message}));
})();