(()=>{
  const file=location.pathname.split('/').pop()||'';
  const isResult=file.endsWith('-result.html')||file==='compatibility-report.html';
  if(!isResult)return;

  let released=false;
  function release(reason='watchdog'){
    if(released)return;
    released=true;
    const overlay=document.querySelector('[data-saju-loading]');
    if(overlay){
      overlay.classList.remove('is-visible','is-leaving');
      overlay.hidden=true;
    }
    const main=document.querySelector('main');
    if(main)main.style.visibility='';
    document.body.classList.remove('saju-loading-open','reading-result-pending');
    document.documentElement.classList.remove('jw-entry-first');
    window.dispatchEvent(new CustomEvent('jw:result-loader-released',{detail:{reason}}));
  }

  window.__jwReleaseResultLoader=release;

  // No result page should ever stay behind a loading screen indefinitely.
  const hardTimer=setTimeout(()=>release('hard-timeout'),5500);

  window.addEventListener('jw:result-ready',()=>{
    clearTimeout(hardTimer);
    setTimeout(()=>release('result-ready'),120);
  },{once:true});

  window.addEventListener('pageshow',event=>{
    if(event.persisted){
      setTimeout(()=>{
        if(document.body.classList.contains('saju-loading-open')||document.body.classList.contains('reading-result-pending'))release('bfcache');
      },150);
    }
  });

  window.addEventListener('error',()=>{
    setTimeout(()=>{
      if(document.body.classList.contains('saju-loading-open')||document.body.classList.contains('reading-result-pending'))release('script-error');
    },300);
  });

  window.addEventListener('unhandledrejection',()=>{
    setTimeout(()=>{
      if(document.body.classList.contains('saju-loading-open')||document.body.classList.contains('reading-result-pending'))release('promise-error');
    },300);
  });
})();