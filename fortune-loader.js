(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(file!=='fortune-result.html')return;

  let input={};
  try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
  const tomorrow=input.mode==='tomorrow';
  const startedAt=Date.now();
  const MIN_VISIBLE=3200;
  const HARD_CLOSE=4800;
  let closed=false;
  let closeTimer=null;

  const overlay=document.createElement('div');
  overlay.className='saju-loading-overlay is-visible';
  overlay.dataset.sajuLoading='';
  overlay.setAttribute('role','status');
  overlay.setAttribute('aria-live','polite');
  overlay.setAttribute('aria-label',tomorrow?'내일의 운세 준비 중':'오늘의 운세 준비 중');
  overlay.innerHTML=`
    <div class="saju-loading-inner">
      <div class="saju-loading-mark" aria-hidden="true">
        <span class="saju-loading-ring"></span>
        <span class="saju-loading-ring"></span>
        <img class="saju-loading-logo" src="./logo.svg?v=20260911-1955" alt="" />
      </div>
      <p class="saju-loading-eyebrow">JUNGWOLJAE · ${tomorrow?'TOMORROW':'DAILY'} FORTUNE</p>
      <h2 class="saju-loading-title">${tomorrow?'내일의 흐름을 신중하게 정리하고 있습니다.':'오늘의 흐름을 신중하게 정리하고 있습니다.'}</h2>
      <p class="saju-loading-message" data-fortune-loader-message>${tomorrow?'내 사주와 내일의 흐름을 맞춰보고 있습니다.':'내 사주와 오늘의 흐름을 맞춰보고 있습니다.'}</p>
      <div class="saju-loading-dots" aria-hidden="true"><span></span><span></span><span></span></div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add('saju-loading-open');

  const message=overlay.querySelector('[data-fortune-loader-message]');
  const messages=tomorrow
    ? ['내 사주와 내일의 흐름을 맞춰보고 있습니다.','재물·인연·일·생활의 흐름을 각각 살펴보고 있습니다.','내일에 필요한 핵심 행동을 정리하고 있습니다.']
    : ['내 사주와 오늘의 흐름을 맞춰보고 있습니다.','재물·인연·일·생활의 흐름을 각각 살펴보고 있습니다.','오늘에 필요한 핵심 행동을 정리하고 있습니다.'];
  setTimeout(()=>{if(!closed&&message)message.textContent=messages[1];},1050);
  setTimeout(()=>{if(!closed&&message)message.textContent=messages[2];},2200);

  function finish(reason='ready'){
    if(closed)return;
    const elapsed=Date.now()-startedAt;
    if(elapsed<MIN_VISIBLE){
      clearTimeout(closeTimer);
      closeTimer=setTimeout(()=>finish(reason),MIN_VISIBLE-elapsed);
      return;
    }
    closed=true;
    window.__jwFortuneLoaderClosed=true;
    overlay.classList.add('is-leaving');
    setTimeout(()=>{
      overlay.classList.remove('is-visible','is-leaving');
      overlay.hidden=true;
      overlay.style.display='none';
      document.body.classList.remove('saju-loading-open','reading-result-pending');
      document.documentElement.classList.remove('saju-loading-open','reading-result-pending');
    },260);
  }

  window.__jwFinishFortuneLoader=finish;
  window.addEventListener('jw:fortune-rendered',()=>finish('fortune-rendered'),{once:true});
  window.addEventListener('jw:result-ready',()=>finish('result-ready'),{once:true});
  setTimeout(()=>finish('hard-timeout'),HARD_CLOSE);
})();
