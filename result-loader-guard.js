(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const isResult=file.endsWith('-result.html')||file==='compatibility-report.html';
  if(!isResult)return;

  const startedAt=Date.now();
  const minVisible=file==='fortune-result.html'?2800:0;
  const hardLimit=file==='fortune-result.html'?4400:5200;
  let released=false;
  let pendingTimer=null;
  let observer=null;

  function forceClosed(){
    document.querySelectorAll('[data-saju-loading],.saju-loading-overlay').forEach(overlay=>{
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

  function actuallyRelease(reason='watchdog'){
    if(released)return;
    released=true;
    window.__jwResultLoaderReleased=true;
    clearTimeout(pendingTimer);
    forceClosed();
    window.dispatchEvent(new CustomEvent('jw:result-loader-released',{detail:{reason}}));
  }

  function release(reason='watchdog'){
    if(released)return;
    const elapsed=Date.now()-startedAt;
    if(elapsed<minVisible){
      clearTimeout(pendingTimer);
      pendingTimer=setTimeout(()=>actuallyRelease(reason),minVisible-elapsed);
      return;
    }
    actuallyRelease(reason);
  }

  window.__jwReleaseResultLoader=release;
  window.__jwResultLoaderReleased=false;

  const hardTimer=setTimeout(()=>release('hard-timeout'),hardLimit);
  const startObserver=()=>{
    if(observer||!document.body)return;
    observer=new MutationObserver(()=>{if(released)forceClosed();});
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','style']});
    setTimeout(()=>{observer?.disconnect();observer=null;},20000);
  };
  if(document.body)startObserver();else document.addEventListener('DOMContentLoaded',startObserver,{once:true});

  window.addEventListener('jw:result-ready',()=>{clearTimeout(hardTimer);release('result-ready');},{once:true});
  window.addEventListener('jw:fortune-rendered',()=>{clearTimeout(hardTimer);release('fortune-rendered');},{once:true});
  window.addEventListener('pageshow',event=>{if(event.persisted)setTimeout(()=>release('bfcache'),80);});
  window.addEventListener('error',()=>setTimeout(()=>release('script-error'),120));
  window.addEventListener('unhandledrejection',()=>setTimeout(()=>release('promise-error'),120));
})();