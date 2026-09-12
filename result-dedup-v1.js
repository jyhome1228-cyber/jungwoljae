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

  function plainRelationCopy(label,dayWord){
    if(/육합|삼합/.test(label))return `${dayWord}은 사람이나 일이 자연스럽게 이어지기 쉬운 편입니다. 기다리기보다 먼저 연락하거나 제안을 꺼내고, 중간에 한 번 의견을 맞추면 흐름이 더 편해집니다.`;
    if(label==='충')return `${dayWord}은 예상과 다른 요청이나 일정 변화가 생길 수 있습니다. 처음 계획을 끝까지 고집하기보다 중요한 목적만 지키고 방법은 유연하게 바꾸는 편이 좋습니다.`;
    if(/형|해|파/.test(label))return `${dayWord}은 작은 말이나 일정 차이가 평소보다 크게 느껴질 수 있습니다. 바로 결론 내리기보다 사실을 한 번 확인하고 필요한 말만 짧게 주고받으세요.`;
    return `${dayWord}은 외부 변수보다 내가 무엇을 먼저 할지 정하는 것이 중요합니다. 해야 할 일의 순서를 줄이고, 가장 중요한 한 가지부터 움직이면 하루가 훨씬 안정적입니다.`;
  }

  function practicalFortuneKey(){
    const grid=$('.fortune-key-grid');
    if(!grid)return;
    const cards=[...grid.querySelectorAll('.fortune-key-card')];
    if(cards.length<3)return;

    const first=cards[0],second=cards[1],third=cards[2];
    const dayWord=(document.body.innerText||'').includes('내일')?'내일':'오늘';

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

  function simplifyFortuneVisibleJargon(){
    const dayWord=(document.body.innerText||'').includes('내일')?'내일':'오늘';
    const headline=$('[data-headline]')?.textContent?.trim();
    const note=$('[data-signal-note]')?.textContent?.trim();
    const heroSummary=$('[data-summary]');
    if(heroSummary&&headline)heroSummary.textContent=`${headline}${note?` ${note}`:''}`;

    const meta=[...document.querySelectorAll('.fortune-meta span')];
    meta.forEach((span,index)=>{if(index>1)hide(span);});

    const pills=[...document.querySelectorAll('.relation-pills span')];
    const technicalLabel=pills[1]?.textContent?.trim()||'';
    if(pills[0])pills[0].textContent='나의 기본 흐름';
    if(pills[1])pills[1].textContent=/육합|삼합/.test(technicalLabel)?'연결이 자연스러운 날':technicalLabel==='충'?'변화가 큰 날':/형|해|파/.test(technicalLabel)?'조정이 필요한 날':'내 선택이 중요한 날';
    if(pills[2])pills[2].textContent=`${dayWord}의 흐름`;

    const relationText=$('[data-relation-text]');
    if(relationText)relationText.textContent=plainRelationCopy(technicalLabel,dayWord);
    const relationTitle=relationText?.closest('.fortune-relation')?.querySelector('h2');
    if(relationTitle)relationTitle.textContent=`${dayWord}, 사람과 일은 이렇게 흘러갈 가능성이 큽니다.`;
  }

  function finishTruncated(node){
    if(!node)return;
    const original=String(node.textContent||'').replace(/\s+/g,' ').trim();
    if(!/(?:…|\.\.\.)$/.test(original))return;
    const body=original.replace(/(?:…|\.\.\.)$/,'').trim();
    let cut=-1;
    for(const mark of ['.','!','?','。'])cut=Math.max(cut,body.lastIndexOf(mark));
    if(cut>=Math.min(48,Math.floor(body.length*.45))){node.textContent=body.slice(0,cut+1).trim();return;}
    const comma=Math.max(body.lastIndexOf(','),body.lastIndexOf('·'));
    if(comma>32){node.textContent=`${body.slice(0,comma).trim()}.`;return;}
    node.textContent=body.replace(/[\s,·]+$/,'')+'.';
  }

  function polishCompatibilitySummary(){
    if(file!=='compatibility-report.html')return;
    const summary=$('[data-quality-summary]');
    if(!summary)return;
    const cards=[...summary.querySelectorAll('.quality-summary-card')];
    if(cards.length<3)return;
    const compare=[...document.querySelectorAll('[data-compare-grid] .compatibility-compare-card')];
    const advice=[...document.querySelectorAll('[data-advice] article')];
    const scoreCopy=$('[data-score-copy]');
    const sources=[compare[0]?.querySelector('p'),compare[1]?.querySelector('p')||advice[0]?.querySelector('p'),scoreCopy||advice[1]?.querySelector('p')||advice[0]?.querySelector('p')];
    sources.forEach((source,index)=>{
      const target=cards[index]?.querySelector('p');
      const value=String(source?.textContent||'').replace(/\s+/g,' ').trim();
      if(target&&value&&target.textContent!==value)target.textContent=value;
    });
  }

  function polishVisibleEndings(){
    polishCompatibilitySummary();
    document.querySelectorAll('main p,main li').forEach(finishTruncated);
  }

  function apply(){
    if(file==='work-money-result.html'){
      hide($('.work-guide-section'));
      const summary=$('.work-summary-section');
      if(summary){
        const focusVisible=isVisible($('[data-focus-section]'));
        text($('.work-label',summary),`${focusVisible?'08':'07'} · 결론`);
        text($('h2',summary),'일과 돈에서 가장 중요한 기준만 남기면');
      }
    }

    if(file==='fortune-result.html'){
      hide($('.fortune-tip-section'));
      hide($('.fortune-total-section'));
      hide($('.fortune-lucky-section'));
      simplifyFortuneVisibleJargon();
      practicalFortuneKey();

      const key=$('.fortune-key-grid')?.closest('.fortune-report');
      if(key){
        const tomorrow=(key.ownerDocument.body.innerText||'').includes('내일');
        text($('.fortune-label',key),'06 · 행동 기준');
        text($('h2',key),tomorrow?'내일은 이 세 가지만 기억하세요.':'오늘은 이 세 가지만 기억하세요.');
        const intro=key.querySelector('.fortune-key-intro');
        if(intro)intro.textContent='어려운 용어보다 바로 옮길 수 있는 행동 세 가지만 남겼습니다.';
      }
      const evidence=$('.fortune-evidence');
      if(evidence)text($('.fortune-label',evidence),'07 · 해석 기준');
    }

    if(file==='ohaeng-result.html'){
      hide($('.key-section'));
      const total=$('.total-summary-section');
      if(total){
        text($('.section-label',total),'06 · 결론');
        text($('h2',total),`${$('[data-summary-name]')?.textContent?.trim()||'회원'}님의 생활 성향을 마지막으로 정리하면`);
      }
    }

    if(file==='relationship-result.html'){
      hide($('.relationship-summary-section'));
      const guide=$('[data-guide-grid]')?.closest('.relationship-report');
      if(guide){
        text($('.relationship-label',guide),'08 · 관계 가이드');
        text($('h2',guide),'연락·약속·갈등에서 내게 맞는 방식');
      }
    }

    if(file==='compatibility-report.html'){
      hide($('.relationship-summary-section'));
      const flow=$('[data-advice]')?.closest('.relationship-report');
      if(flow){
        text($('.relationship-label',flow),'04 · 관계 가이드');
        text($('h2',flow),'두 사람이 오래 편하려면 이것만 기억하세요.');
      }
    }

    polishVisibleEndings();
  }

  apply();
  [100,250,500,900,1400,2200,3600,5200,7000].forEach(ms=>setTimeout(apply,ms));

  const root=document.querySelector('main');
  if(root){
    let scheduled=false;
    const observer=new MutationObserver(()=>{
      if(scheduled)return;
      scheduled=true;
      requestAnimationFrame(()=>{scheduled=false;apply();});
    });
    observer.observe(root,{subtree:true,childList:true,characterData:true});
    setTimeout(()=>observer.disconnect(),8000);
  }
})();