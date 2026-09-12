(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const isResult=file.endsWith('-result.html')||file==='compatibility-report.html';
  if(!isResult)return;

  const startedAt=Date.now();
  const MIN_VISIBLE=2800;
  const HARD_RELEASE=4800;
  let released=false;
  let observer=null;

  function stopObserver(){
    if(!observer)return;
    observer.disconnect();
    observer=null;
  }

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

  function release(reason='watchdog'){
    if(released)return;
    const elapsed=Date.now()-startedAt;
    if(elapsed<MIN_VISIBLE){
      setTimeout(()=>release(reason),MIN_VISIBLE-elapsed);
      return;
    }
    released=true;
    window.__jwResultLoaderReleased=true;
    // Stop observing before changing loader attributes. Otherwise the observer can
    // react to forceClosed() itself and repeatedly mutate the same DOM.
    stopObserver();
    forceClosed();
    window.dispatchEvent(new CustomEvent('jw:result-loader-released',{detail:{reason}}));
  }

  window.__jwReleaseResultLoader=release;
  if(window.__jwResultLoaderReleased!==true)window.__jwResultLoaderReleased=false;

  // Only result lifecycle events may end the loader early. Generic JS/network errors
  // must not make the loading screen disappear immediately.
  window.addEventListener('jw:result-ready',()=>release('result-ready'),{once:true});
  window.addEventListener('jw:fortune-rendered',()=>release('fortune-rendered'),{once:true});
  window.addEventListener('pageshow',event=>{if(event.persisted)release('bfcache');});
  setTimeout(()=>release('hard-timeout'),HARD_RELEASE);

  const startObserver=()=>{
    if(observer||released||!document.body)return;
    observer=new MutationObserver(()=>{
      // Before release this observer is only a watchdog. Once release starts it is
      // disconnected first, preventing a self-triggering mutation loop.
      if(released)stopObserver();
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','style']});
    setTimeout(stopObserver,20000);
  };
  if(document.body)startObserver();else document.addEventListener('DOMContentLoaded',startObserver,{once:true});
})();