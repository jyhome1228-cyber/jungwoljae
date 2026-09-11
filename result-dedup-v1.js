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
  function isVisible(el){
    if(!el)return false;
    return !el.hidden&&getComputedStyle(el).display!=='none';
  }

  function apply(){
    if(file==='work-money-result.html'){
      // MONEY STYLE already covers earning / saving / risk habits.
      // WORK & MONEY GUIDE repeated the same job / income / money-management advice.
      hide($('.work-guide-section'));
      const summary=$('.work-summary-section');
      if(summary){
        const focusVisible=isVisible($('[data-focus-section]'));
        text($('.work-label',summary),`${focusVisible?'08':'07'} · 결론`);
        text($('h2',summary),'일과 돈에서 가장 중요한 기준만 남기면');
      }
    }

    if(file==='fortune-result.html'){
      // FORTUNE BY AREA + HELPFUL/AVOID + KEY POINTS already contain the usable advice.
      // TODAY GUIDE and TOTAL SUMMARY repeated those same actions again.
      hide($('.fortune-tip-section'));
      hide($('.fortune-total-section'));
      const key=$('.fortune-key-grid')?.closest('.fortune-report');
      if(key){
        text($('.fortune-label',key),'06 · 오늘의 핵심');
        text($('h2',key),'오늘은 이것만 기억하세요.');
      }
      const evidence=$('.fortune-evidence');
      if(evidence)text($('.fortune-label',evidence),'07 · 해석 기준');
    }

    if(file==='ohaeng-result.html'){
      // NATURAL FORCE / BALANCE / DAILY LIFE already explain the same three takeaways.
      // Keep only one synthesis after those sections.
      hide($('.key-section'));
      const total=$('.total-summary-section');
      if(total){
        text($('.section-label',total),'06 · 결론');
        text($('h2',total),`${$('[data-summary-name]')?.textContent?.trim()||'회원'}님의 생활 성향을 마지막으로 정리하면`);
      }
    }

    if(file==='relationship-result.html'){
      // RELATIONSHIP GUIDE is already the practical conclusion.
      // The following TOTAL SUMMARY restated the same type / strength / caution once more.
      hide($('.relationship-summary-section'));
      const guide=$('[data-guide-grid]')?.closest('.relationship-report');
      if(guide){
        text($('.relationship-label',guide),'08 · 관계 가이드');
        text($('h2',guide),'연락·약속·갈등에서 내게 맞는 방식');
      }
    }

    if(file==='compatibility-report.html'){
      // The score hero + four metrics + match/friction + relationship flow already conclude the match.
      // TOTAL SUMMARY repeats the strongest/weakest metric and score in almost the same words.
      hide($('.relationship-summary-section'));
      const flow=$('[data-advice]')?.closest('.relationship-report');
      if(flow){
        text($('.relationship-label',flow),'04 · 관계 가이드');
        text($('h2',flow),'두 사람이 오래 편하려면 이것만 기억하세요.');
      }
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