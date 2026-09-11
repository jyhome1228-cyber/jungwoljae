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

  function practicalFortuneKey(){
    const grid=$('.fortune-key-grid');
    if(!grid)return;
    const cards=[...grid.querySelectorAll('.fortune-key-card')];
    if(cards.length<3)return;

    const first=cards[0],second=cards[1],third=cards[2];
    const dayWord=(document.body.innerText||'').includes('내일')?'내일':'오늘';

    // Technical evidence belongs in the expandable interpretation-basis section,
    // not inside the three things a visitor is supposed to remember.
    const firstSmall=first.querySelector('small');
    const secondSmall=second.querySelector('small');
    if(firstSmall)firstSmall.textContent=`${dayWord}의 첫 번째 행동 기준`;
    if(secondSmall)secondSmall.textContent='사람과 대화에서 볼 기준';

    const label=third.querySelector('span');
    const strong=third.querySelector('strong');
    const copy=third.querySelector('p');
    const small=third.querySelector('small');
    if(label)label.textContent='03 · 마무리';
    if(strong)strong.textContent='하던 일 하나를 끝내고 다음 순서까지 정해두세요.';
    if(copy)copy.textContent='기운의 많고 적음보다 실제 행동의 순서를 정하는 편이 더 유용합니다. 새 일을 늘리기보다 진행 중인 것 하나에 완료 표시를 남기고, 다음에 무엇을 할지만 짧게 정해두세요.';
    if(small)small.textContent='하루를 가볍게 끝내는 기준';

    const action=third.querySelector('.fortune-key-action');
    if(action){
      const b=action.querySelector('b');
      const em=action.querySelector('em');
      if(b)b.textContent=`${dayWord}의 행동`;
      if(em)em.textContent='완료 표시 하나 남기기';
    }
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
      // The visible result should answer "what should I do today?" rather than expose
      // element percentages, weak-element compensation, colors or directions.
      hide($('.fortune-tip-section'));
      hide($('.fortune-total-section'));
      hide($('.fortune-lucky-section'));
      practicalFortuneKey();

      const key=$('.fortune-key-grid')?.closest('.fortune-report');
      if(key){
        const tomorrow=(key.ownerDocument.body.innerText||'').includes('내일');
        text($('.fortune-label',key),'06 · 행동 기준');
        text($('h2',key),tomorrow?'내일은 이 세 가지만 기억하세요.':'오늘은 이 세 가지만 기억하세요.');
        const intro=key.querySelector('.fortune-key-intro');
        if(intro)intro.textContent='명리 용어보다 바로 옮길 수 있는 행동 세 가지만 남겼습니다.';
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
  [100,250,500,900,1400,2200,3600,5200].forEach(ms=>setTimeout(apply,ms));

  const root=document.querySelector('main');
  if(root){
    const observer=new MutationObserver(()=>apply());
    observer.observe(root,{subtree:true,childList:true,characterData:true});
    setTimeout(()=>observer.disconnect(),8000);
  }
})();