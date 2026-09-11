(()=>{
  'use strict';
  const overlay=document.querySelector('[data-saju-result-loading]');
  const message=document.querySelector('[data-saju-result-loading-message]');
  if(!overlay)return;

  let finished=false;
  const hide=()=>{
    if(finished)return;
    finished=true;
    overlay.classList.add('is-leaving');
    setTimeout(()=>{
      overlay.classList.remove('is-visible','is-leaving');
      overlay.hidden=true;
      document.body.classList.remove('saju-loading-open','reading-result-pending');
      const main=document.querySelector('[data-saju-result]');
      if(main)main.style.visibility='';
    },220);
  };

  const show=()=>{
    overlay.hidden=false;
    overlay.classList.remove('is-leaving');
    document.body.classList.add('saju-loading-open');
    requestAnimationFrame(()=>overlay.classList.add('is-visible'));
  };

  const alreadyShown=sessionStorage.getItem('jungwoljae_saju_loader_shown')==='1';
  sessionStorage.removeItem('jungwoljae_saju_loader_shown');
  if(alreadyShown){hide();return;}

  show();
  const messages=[
    '입력하신 사주 정보를 차분히 살펴보고 있습니다.',
    '타고난 성향과 생활 흐름을 하나씩 정리하고 있습니다.',
    '내용을 다시 살피며 결과를 준비하고 있습니다.'
  ];
  [900,1800].forEach((delay,i)=>setTimeout(()=>{
    if(finished||!message)return;
    message.classList.add('is-changing');
    setTimeout(()=>{
      if(finished||!message)return;
      message.textContent=messages[i+1];
      message.classList.remove('is-changing');
    },160);
  },delay));

  // Never allow the result page to remain behind the loader indefinitely.
  const hardStop=setTimeout(hide,3200);
  window.addEventListener('pageshow',event=>{if(event.persisted)hide();},{once:true});
  window.addEventListener('error',()=>{clearTimeout(hardStop);setTimeout(hide,120);},{once:true});
  window.addEventListener('unhandledrejection',()=>{clearTimeout(hardStop);setTimeout(hide,120);},{once:true});
  window.addEventListener('jungwoljae:saju-result-ready',()=>{clearTimeout(hardStop);setTimeout(hide,180);},{once:true});
  window.JungwoljaeSajuResultLoader={hide};
})();
