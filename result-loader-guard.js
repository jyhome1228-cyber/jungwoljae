(()=>{
  const file=location.pathname.split('/').pop()||'';
  const isResult=file.endsWith('-result.html')||file==='compatibility-report.html';
  if(!isResult)return;

  const startedAt=Date.now();
  let released=false;
  let observer=null;

  function forceClosed(){
    document.querySelectorAll('[data-saju-loading],.saju-loading-overlay').forEach(overlay=>{
      const needsClose=!overlay.hidden||overlay.classList.contains('is-visible')||overlay.classList.contains('is-leaving')||overlay.style.display!=='none';
      if(!needsClose)return;
      overlay.classList.remove('is-visible','is-leaving');
      overlay.hidden=true;
      overlay.setAttribute('hidden','');
      overlay.style.setProperty('display','none','important');
      overlay.style.setProperty('pointer-events','none','important');
    });

    document.querySelectorAll('[data-final-state="loading"]').forEach(node=>node.setAttribute('data-final-state','ready'));

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
  }

  function release(reason='watchdog'){
    const firstRelease=!released;
    released=true;
    window.__jwResultLoaderReleased=true;
    forceClosed();

    if(firstRelease){
      window.dispatchEvent(new CustomEvent('jw:result-loader-released',{detail:{reason}}));
    }
  }

  window.__jwReleaseResultLoader=release;
  window.__jwResultLoaderReleased=false;

  const hardTimer=setTimeout(()=>release('hard-timeout'),4200);

  // Keep enforcing the closed state for delayed imports or stale cached scripts.
  const watchdog=setInterval(()=>{
    const elapsed=Date.now()-startedAt;
    if(elapsed>=4200)release('interval-timeout');
    if(elapsed>=30000)clearInterval(watchdog);
  },300);

  // If any late script reopens or recreates the overlay after release, close it again immediately.
  const startObserver=()=>{
    if(observer||!document.body)return;
    observer=new MutationObserver(()=>{
      if(released)forceClosed();
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','style']});
    setTimeout(()=>{observer?.disconnect();observer=null;},30000);
  };
  if(document.body)startObserver();else document.addEventListener('DOMContentLoaded',startObserver,{once:true});

  window.addEventListener('jw:result-ready',()=>{
    clearTimeout(hardTimer);
    setTimeout(()=>release('result-ready'),80);
  },{once:true});

  window.addEventListener('pageshow',event=>{
    if(event.persisted)setTimeout(()=>release('bfcache'),50);
  });

  window.addEventListener('error',()=>setTimeout(()=>release('script-error'),100));
  window.addEventListener('unhandledrejection',()=>setTimeout(()=>release('promise-error'),100));

  document.addEventListener('DOMContentLoaded',()=>{
    setTimeout(()=>release('dom-timeout'),4300);
  },{once:true});
})();