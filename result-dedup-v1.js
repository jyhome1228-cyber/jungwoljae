(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const $=(s,r=document)=>r.querySelector(s);

  function hide(el){
    if(!el)return;
    el.hidden=true;
    el.setAttribute('aria-hidden','true');
  }
  function text(el,value){
    if(el&&el.textContent!==value)el.textContent=value;
  }

  function apply(){
    if(file==='work-money-result.html'){
      // MONEY STYLE already contains earning / saving / risk guidance.
      // The later WORK & MONEY GUIDE repeated the same four ideas almost verbatim.
      hide($('.work-guide-section'));
      const summary=$('.work-summary-section');
      if(summary){
        text($('.work-label',summary),'08 · 결론');
        text($('h2',summary),'일과 돈에서 가장 중요한 기준만 남기면');
      }
    }

    if(file==='fortune-result.html'){
      // Area / helpful-avoid / key-point sections already provide actions.
      // TODAY GUIDE duplicated the same advice once more.
      hide($('.fortune-tip-section'));
      const total=$('.fortune-total-section');
      if(total){
        text($('.fortune-label',total),'07 · 오늘의 결론');
        text($('h2',total),'오늘은 이것만 기억하세요.');
      }
      const evidence=$('.fortune-evidence');
      if(evidence)text($('.fortune-label',evidence),'08 · 해석 기준');
    }

    if(file==='ohaeng-result.html'){
      // Natural force / balance / daily-life sections already explain the key points.
      // Keep one final synthesis instead of another three-card recap immediately before it.
      hide($('.key-section'));
      const total=$('.total-summary-section');
      if(total){
        text($('.section-label',total),'06 · TOTAL SUMMARY');
        text($('h2',total),`${$('[data-summary-name]')?.textContent?.trim()||'회원'}님의 생활 성향을 마지막으로 정리하면`);
      }
    }

    if(file==='relationship-result.html'){
      // The relationship guide is actionable and useful; the following total summary
      // repeated the same core/strong/weak pattern. Finish with the guide instead.
      hide($('.relationship-summary-section'));
    }
  }

  apply();
  [150,500,1200,2200,3600,5200].forEach(ms=>setTimeout(apply,ms));

  const root=document.querySelector('main');
  if(root){
    const observer=new MutationObserver(()=>apply());
    observer.observe(root,{subtree:true,childList:true,characterData:true});
    setTimeout(()=>observer.disconnect(),7000);
  }
})();