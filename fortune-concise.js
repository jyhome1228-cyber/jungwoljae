(()=>{
  const root=document.querySelector('[data-fortune-result]');
  if(!root)return;

  let input={};
  try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
  const isTomorrow=input.mode==='tomorrow';
  const dayWord=isTomorrow?'내일':'오늘';

  const clean=s=>(s||'').replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').trim();
  const pickCard=keyword=>[...root.querySelectorAll('.fortune-card')].find(c=>clean(c.querySelector('h3')?.textContent).includes(keyword));
  const cardText=keyword=>clean(pickCard(keyword)?.querySelector('p')?.textContent);

  function shortSentence(text,fallback){
    const t=clean(text);
    if(!t)return fallback;
    const first=t.split(/(?<=[.!?])\s+/)[0]||t;
    return first.length>74?first.slice(0,72).replace(/[,.\s]+$/,'')+'…':first;
  }

  function relationshipText(){
    const existing=cardText('사람')||cardText('관계');
    if(/먼저 말을|연결/.test(existing))return '먼저 연락하거나 가볍게 마음을 표현하기 좋은 흐름입니다.';
    if(/감정|결론|한 박자|조율/.test(existing))return '서운함을 바로 결론 내리기보다 한 번 더 확인해보세요.';
    return shortSentence(existing,'필요한 말은 짧고 솔직하게 전하면 좋습니다.');
  }

  function moneyText(){
    const existing=cardText('재물')||cardText('돈');
    if(/큰 금액|즉흥|충동|확인/.test(existing))return '큰 지출은 미루고 꼭 필요한 소비만 챙기세요.';
    return shortSentence(existing,'계획한 범위 안에서 쓰면 무리가 적습니다.');
  }

  function workText(){
    const existing=cardText('일');
    if(/새로운|정리|진행 중/.test(existing))return '새 일을 늘리기보다 하던 일을 하나씩 마무리하세요.';
    return shortSentence(existing,'중요한 일 하나에 집중하면 좋습니다.');
  }

  function rhythmText(){
    const existing=cardText('생활');
    return shortSentence(existing,'일정을 너무 빽빽하게 잡지 말고 여유를 조금 남겨두세요.');
  }

  function apply(){
    const headline=root.querySelector('[data-headline]');
    const signal=root.querySelector('[data-signal-note]');
    const summary=root.querySelector('[data-summary]');
    const relation=root.querySelector('.fortune-relation');
    const areaSection=root.querySelector('[data-area-grid]')?.closest('.fortune-report');

    if(summary)summary.textContent=`${dayWord}의 흐름을 어렵게 풀지 않고, 바로 참고할 수 있게 짧게 정리했습니다.`;
    if(signal){
      const h=clean(headline?.textContent);
      signal.textContent=/점검|서두르지/.test(h)
        ?`${dayWord}은 빠르게 결론내리기보다 한 번 더 확인하는 편이 좋습니다.`
        :/한 걸음|꺼내도/.test(h)
          ?`${dayWord}은 준비한 일 하나를 실제로 움직여보기 좋습니다.`
          :`${dayWord}은 하던 일을 정리하며 리듬을 맞추는 편이 좋습니다.`;
    }

    if(relation){
      relation.innerHTML=`<p class="fortune-label">01 · ${isTomorrow?'TOMORROW':'TODAY'} AT A GLANCE</p><h2>${dayWord}은 어떻게 보내면 좋을까?</h2><p>${clean(signal?.textContent)}</p>`;
    }

    if(areaSection){
      const label=areaSection.querySelector('.fortune-label');
      const h2=areaSection.querySelector('h2');
      if(label)label.textContent='02 · FORTUNE BY AREA';
      if(h2)h2.textContent=`${dayWord}의 운세를 분야별로 보면`;
      const grid=areaSection.querySelector('[data-area-grid]');
      if(grid)grid.innerHTML=[
        ['01','재물운',moneyText(),'돈'],
        ['02','연애운',relationshipText(),'마음'],
        ['03','일·학업운',workText(),'집중'],
        ['04','생활운',rhythmText(),'리듬']
      ].map(([n,t,p,b])=>`<article class="fortune-card"><span>${n}</span><h3>${t}</h3><p>${p}</p><strong>${b}</strong></article>`).join('');
    }

    const tipSection=root.querySelector('.fortune-tip-section');
    if(tipSection){
      const label=tipSection.querySelector('.fortune-label');
      const h2=tipSection.querySelector('h2');
      const lead=tipSection.querySelector('.fortune-tip-lead');
      if(label)label.textContent='03 · ONE LINE ADVICE';
      if(h2)h2.textContent=`정월재 ${dayWord}의 한 줄 조언`;
      if(lead)lead.remove();
      const grid=tipSection.querySelector('[data-tip-grid]');
      if(grid)grid.style.display='none';
      const final=tipSection.querySelector('.fortune-tip-final span');
      if(final)final.textContent=`${dayWord}의 한 줄`;
      const finalText=tipSection.querySelector('[data-tip-final]');
      if(finalText){
        const h=clean(headline?.textContent);
        finalText.textContent=/점검|서두르지/.test(h)
          ?'중요한 결정은 한 번 더 확인하고, 급한 결론은 조금 미뤄보세요.'
          :/한 걸음|꺼내도/.test(h)
            ?'준비한 일 하나를 실제 행동으로 옮겨보세요.'
            :'새로운 일을 늘리기보다 지금 하던 일 하나를 마무리해보세요.';
      }
    }

    ['.fortune-story-section','.fortune-time-section','.fortune-choice-section','.fortune-total-section'].forEach(sel=>{
      const el=root.querySelector(sel);if(el)el.style.display='none';
    });
    const keySection=root.querySelector('[data-key-grid]')?.closest('.fortune-report');
    if(keySection)keySection.style.display='none';

    root.querySelectorAll('p,h1,h2,h3,strong,span').forEach(el=>{
      if(el.children.length===0)el.textContent=clean(el.textContent);
    });
  }

  setTimeout(apply,120);
  setTimeout(apply,500);
  setTimeout(apply,1200);
})();
