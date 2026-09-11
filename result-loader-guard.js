(()=>{
  const file=location.pathname.split('/').pop()||'';
  const isResult=file.endsWith('-result.html')||file==='compatibility-report.html';
  if(!isResult)return;

  const startedAt=Date.now();
  let released=false;

  function release(reason='watchdog'){
    if(released)return;
    released=true;
    window.__jwResultLoaderReleased=true;

    document.querySelectorAll('[data-saju-loading],.saju-loading-overlay').forEach(overlay=>{
      overlay.classList.remove('is-visible','is-leaving');
      overlay.hidden=true;
      overlay.setAttribute('hidden','');
      overlay.style.setProperty('display','none','important');
      overlay.style.setProperty('pointer-events','none','important');
    });

    document.querySelectorAll('[data-final-state="loading"]').forEach(node=>{
      node.setAttribute('data-final-state','ready');
    });

    const main=document.querySelector('main');
    if(main){
      main.style.setProperty('visibility','visible','important');
      main.style.setProperty('opacity','1','important');
      main.removeAttribute('aria-busy');
    }

    document.body?.classList.remove('saju-loading-open','reading-result-pending');
    document.documentElement.classList.remove('jw-entry-first','saju-loading-open','reading-result-pending');
    document.body?.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('overflow');

    window.dispatchEvent(new CustomEvent('jw:result-loader-released',{detail:{reason}}));
  }

  window.__jwReleaseResultLoader=release;
  window.__jwResultLoaderReleased=false;

  // Absolute fail-safe: a result page is never allowed to remain blocked.
  const hardTimer=setTimeout(()=>release('hard-timeout'),4200);

  // Extra watchdog in case another script re-opens the loader after a delayed import.
  const watchdog=setInterval(()=>{
    const elapsed=Date.now()-startedAt;
    const overlay=document.querySelector('[data-saju-loading],.saju-loading-overlay');
    const blocked=document.body?.classList.contains('saju-loading-open')||
      document.body?.classList.contains('reading-result-pending')||
      document.querySelector('[data-final-state="loading"]');
    if(elapsed>=4200&&(overlay||blocked))release('interval-timeout');
    if(elapsed>=12000||released)clearInterval(watchdog);
  },350);

  window.addEventListener('jw:result-ready',()=>{
    clearTimeout(hardTimer);
    setTimeout(()=>release('result-ready'),100);
  },{once:true});

  window.addEventListener('pageshow',event=>{
    if(event.persisted){
      setTimeout(()=>release('bfcache'),80);
    }
  });

  window.addEventListener('error',()=>setTimeout(()=>release('script-error'),120));
  window.addEventListener('unhandledrejection',()=>setTimeout(()=>release('promise-error'),120));

  // Even if DOMContentLoaded/load handlers elsewhere stall, keep the result visible.
  document.addEventListener('DOMContentLoaded',()=>{
    setTimeout(()=>{
      if(Date.now()-startedAt>=4000)release('dom-timeout');
    },4200);
  },{once:true});
})();