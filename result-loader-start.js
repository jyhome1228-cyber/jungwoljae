(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const isResult=file.endsWith('-result.html')||file==='compatibility-report.html';
  if(!isResult)return;
  if(document.querySelector('[data-saju-loading]'))return;

  let input={};
  try{
    const key=file==='fortune-result.html'?'jungwoljae_fortune_input':'';
    if(key)input=JSON.parse(sessionStorage.getItem(key)||'{}');
  }catch(e){}

  const tomorrow=file==='fortune-result.html'&&input.mode==='tomorrow';
  const copy={
    'ohaeng-result.html':{eyebrow:'JUNGWOLJAE · FIVE ELEMENTS',title:'생활 속 다섯 가지 힘을 정리하고 있습니다.',messages:['오행의 비중을 차분히 살펴보고 있습니다.','자연스럽게 쓰는 힘과 보완할 힘을 정리하고 있습니다.','생활에서 이해하기 쉬운 말로 결과를 다듬고 있습니다.']},
    'fortune-result.html':{eyebrow:`JUNGWOLJAE · ${tomorrow?'TOMORROW':'DAILY'} FORTUNE`,title:tomorrow?'내일의 흐름을 차분히 읽고 있습니다.':'오늘의 흐름을 차분히 읽고 있습니다.',messages:[tomorrow?'내 흐름과 내일의 흐름을 맞춰보고 있습니다.':'내 흐름과 오늘의 흐름을 맞춰보고 있습니다.','재물·인연·일의 흐름을 각각 살펴보고 있습니다.',tomorrow?'내일에 필요한 핵심 내용을 정리하고 있습니다.':'오늘에 필요한 핵심 내용을 정리하고 있습니다.']},
    'relationship-result.html':{eyebrow:'JUNGWOLJAE · RELATIONSHIP',title:'인연과 관계의 흐름을 살펴보고 있습니다.',messages:['감정 표현과 관계의 리듬을 확인하고 있습니다.','반복되는 관계 패턴을 함께 보고 있습니다.','관계에서 중요한 기준을 정리하고 있습니다.']},
    'work-money-result.html':{eyebrow:'JUNGWOLJAE · WORK & MONEY',title:'일과 재물의 흐름을 정리하고 있습니다.',messages:['일하는 방식과 돈의 흐름을 살펴보고 있습니다.','강점과 부담이 생기는 지점을 확인하고 있습니다.','현실적으로 참고할 수 있게 결과를 정리하고 있습니다.']},
    'guide-result.html':{eyebrow:'JUNGWOLJAE · DOGAM',title:'정월도감의 해답을 준비하고 있습니다.',messages:['선택하신 고민과 현재 흐름을 살펴보고 있습니다.','결정에 영향을 주는 조건을 정리하고 있습니다.','바로 이해할 수 있는 기준으로 다듬고 있습니다.']},
    'compatibility-report.html':{eyebrow:'JUNGWOLJAE · COMPATIBILITY',title:'두 사람의 관계를 함께 살펴보고 있습니다.',messages:['두 사람의 생활 성향을 같은 기준으로 비교하고 있습니다.','편한 지점과 부딪히는 지점을 나누어 보고 있습니다.','관계의 구조가 잘 보이도록 결과를 정리하고 있습니다.']}
  }[file]||{eyebrow:'JUNGWOLJAE · READING',title:'내용을 차분히 살펴보고 있습니다.',messages:['입력한 정보를 확인하고 있습니다.','중요한 흐름을 정리하고 있습니다.','결과를 읽기 쉽게 다듬고 있습니다.']};

  const startedAt=Date.now();
  const MIN_VISIBLE=2800;
  const HARD_CLOSE=4600;
  let closed=false;
  let closeTimer=null;

  const overlay=document.createElement('div');
  overlay.className='saju-loading-overlay is-visible';
  overlay.dataset.sajuLoading='';
  overlay.setAttribute('role','status');
  overlay.setAttribute('aria-live','polite');
  overlay.setAttribute('aria-label','분석 결과 준비 중');
  overlay.innerHTML=`<div class="saju-loading-inner"><div class="saju-loading-mark" aria-hidden="true"><span class="saju-loading-ring"></span><span class="saju-loading-ring"></span><img class="saju-loading-logo" src="./logo.svg?v=20260911-2027" alt="" /></div><p class="saju-loading-eyebrow">${copy.eyebrow}</p><h2 class="saju-loading-title">${copy.title}</h2><p class="saju-loading-message" data-result-loader-message>${copy.messages[0]}</p><div class="saju-loading-dots" aria-hidden="true"><span></span><span></span><span></span></div></div>`;
  document.body.appendChild(overlay);
  document.body.classList.add('saju-loading-open');
  window.__jwResultLoaderStarted=true;

  const message=overlay.querySelector('[data-result-loader-message]');
  setTimeout(()=>{if(!closed&&message)message.textContent=copy.messages[1]||copy.messages[0];},900);
  setTimeout(()=>{if(!closed&&message)message.textContent=copy.messages[2]||copy.messages[1]||copy.messages[0];},1800);

  function finish(reason='ready'){
    if(closed)return;
    const elapsed=Date.now()-startedAt;
    if(elapsed<MIN_VISIBLE){
      clearTimeout(closeTimer);
      closeTimer=setTimeout(()=>finish(reason),MIN_VISIBLE-elapsed);
      return;
    }
    closed=true;
    window.__jwResultLoaderReleased=true;
    overlay.classList.add('is-leaving');
    setTimeout(()=>{
      overlay.classList.remove('is-visible','is-leaving');
      overlay.hidden=true;
      overlay.setAttribute('hidden','');
      overlay.style.setProperty('display','none','important');
      overlay.style.setProperty('pointer-events','none','important');
      document.body.classList.remove('saju-loading-open','reading-result-pending');
      document.documentElement.classList.remove('saju-loading-open','reading-result-pending');
    },260);
  }

  window.__jwFinishResultLoader=finish;
  window.__jwFinishFortuneLoader=finish;
  window.addEventListener('jw:result-ready',()=>finish('result-ready'),{once:true});
  window.addEventListener('jw:fortune-rendered',()=>finish('fortune-rendered'),{once:true});
  window.addEventListener('pageshow',e=>{if(e.persisted)finish('bfcache');});
  setTimeout(()=>finish('hard-timeout'),HARD_CLOSE);
})();
