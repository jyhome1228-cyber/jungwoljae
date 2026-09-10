(()=>{
  'use strict';
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='saju-result.html')return;
  const root=document.querySelector('[data-saju-result]');if(!root)return;
  const terms=['갑목','을목','병화','정화','무토','기토','경금','신금','임수','계수'];
  const termRe=new RegExp(terms.join('|'),'g');
  const subjectRe=new RegExp(`(${terms.join('|')})(은|는|이|가|의)`,'g');
  const run=()=>{
    const title=root.querySelector('[data-daymaster-title]');
    const text=root.querySelector('[data-daymaster-text]');
    if(title){
      let t=String(title.textContent||'').trim();
      if(t&&termRe.test(t)){
        termRe.lastIndex=0;
        t=t.replace(termRe,'성향').replace(/성향\s*성향/g,'성향');
        title.textContent=t;
      }
      termRe.lastIndex=0;
    }
    if(text){
      let t=String(text.textContent||'').trim();
      if(t){
        t=t.replace(subjectRe,(_,term,particle)=>`이 성향${particle}`);
        t=t.replace(termRe,'이 성향');
        text.textContent=t.replace(/이 성향\s*이 성향/g,'이 성향');
      }
      termRe.lastIndex=0;
    }
  };
  const observer=new MutationObserver(run);observer.observe(root,{childList:true,subtree:true,characterData:true});
  run();[300,800,1600,2800,4500].forEach(ms=>setTimeout(run,ms));
})();
