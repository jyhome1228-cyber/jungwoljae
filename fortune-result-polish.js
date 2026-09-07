(()=>{
  const root=document.querySelector('[data-fortune-result]');
  if(!root)return;
  const $=(s,r=root)=>r.querySelector(s);
  const all=(s,r=root)=>[...r.querySelectorAll(s)];
  const text=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();

  function mode(){
    const h=text($('[data-headline]'));
    if(/밀어도|꺼내도|실행|한 걸음/.test(h))return 'go';
    if(/서두르지|점검|확인/.test(h))return 'check';
    return 'balance';
  }

  const content={
    go:{
      do:[
        ['준비한 일 하나를 실제로 시작하기','이미 검토해둔 제안·연락·업무라면 오늘은 머릿속에 두기보다 한 단계 실행으로 옮겨보세요.'],
        ['중요한 일은 하루 초반에 먼저 처리하기','에너지가 분산되기 전에 우선순위가 가장 높은 한 가지를 먼저 끝내는 편이 좋습니다.'],
        ['필요한 말은 짧고 분명하게 전하기','관계에서는 돌려 말하기보다 필요한 내용을 부드럽고 명확하게 표현하는 것이 도움이 됩니다.'],
        ['계획한 범위 안에서 소비하기','돈은 기분에 따라 넓히기보다 미리 정한 예산과 목적 안에서 쓰는 쪽이 안정적입니다.'],
        ['오늘 끝낼 수 있는 일은 마무리하기','새 일을 여러 개 벌리기보다 이미 시작한 것 중 하나를 완성하면 흐름을 더 잘 활용할 수 있습니다.']
      ],
      dont:[
        ['한 번에 여러 일을 크게 벌이기','흐름이 좋게 느껴져도 해야 할 일을 과도하게 늘리면 집중력이 빠르게 분산될 수 있습니다.'],
        ['상대의 반응을 내 속도로 재촉하기','내가 빠르게 움직인다고 해서 상대도 같은 속도로 결정해야 하는 것은 아닙니다.'],
        ['충동적인 큰 결제','예정에 없던 큰 지출이나 투자는 오늘의 기분보다 실제 현금흐름과 필요성을 먼저 확인하세요.'],
        ['좋은 분위기를 확정된 결과로 보기','초반 반응이 좋더라도 계약·약속·관계는 실제 조건이 확인될 때까지 여지를 남겨두는 편이 좋습니다.'],
        ['피곤한 상태에서 일정 더 잡기','활동량이 늘기 쉬운 날일수록 하루 후반의 체력까지 고려해 여백을 남겨두세요.']
      ]
    },
    balance:{
      do:[
        ['진행 중인 일을 한 단계 정리하기','새로운 일을 늘리기보다 이미 진행 중인 업무의 다음 순서를 분명하게 만드는 것이 좋습니다.'],
        ['결정 전에 기준을 짧게 적어보기','중요한 선택은 장단점을 머릿속으로만 돌리지 말고 필요한 조건을 2~3개로 적어보세요.'],
        ['대화는 사실과 해석을 나눠서 보기','상대가 실제로 한 말과 내가 받아들인 의미를 구분하면 불필요한 오해를 줄일 수 있습니다.'],
        ['필요한 지출과 미뤄도 되는 지출 구분하기','오늘은 확장보다 생활 리듬과 현금흐름을 정리하는 쪽이 더 안정적입니다.'],
        ['중간에 짧은 여백 만들기','일정 사이에 잠깐이라도 정리 시간을 두면 감정과 판단이 섞이는 것을 줄일 수 있습니다.']
      ],
      dont:[
        ['완벽한 답이 나올 때까지 결정 미루기','모든 조건을 충족하는 선택을 찾기보다 지금 꼭 필요한 기준부터 확인하는 편이 좋습니다.'],
        ['작은 반응을 크게 해석하기','연락 한 번, 말 한마디만으로 관계나 상황 전체를 단정하지 마세요.'],
        ['일정을 지나치게 촘촘하게 잡기','예상 밖의 변수가 생겨도 대응할 수 있도록 시간과 체력을 남겨두는 편이 좋습니다.'],
        ['비교 때문에 소비 기준 바꾸기','다른 사람의 선택보다 현재 내 예산과 실제 필요를 기준으로 판단하세요.'],
        ['한 번에 여러 결론 내리기','일·관계·돈 문제를 같은 날 모두 해결하려 하지 말고 가장 중요한 문제부터 순서대로 보세요.']
      ]
    },
    check:{
      do:[
        ['빠진 조건을 한 번 더 확인하기','오늘은 속도보다 누락을 줄이는 것이 중요합니다. 일정·금액·약속의 세부 조건을 다시 확인하세요.'],
        ['중요한 답변은 잠깐 두고 다시 보기','바로 보내야 할 필요가 없다면 메일·메시지·결정은 한 번 읽어본 뒤 확정하는 편이 좋습니다.'],
        ['지출과 약속의 상한선 정하기','돈과 시간 모두 어디까지 감당할 수 있는지 먼저 정하면 불필요한 부담을 줄일 수 있습니다.'],
        ['관계에서는 먼저 확인 질문하기','상대의 의도를 추측하기보다 궁금한 부분을 짧고 직접적으로 확인하는 것이 좋습니다.'],
        ['오늘은 정리와 마무리에 집중하기','새로운 판을 크게 벌이기보다 미뤄둔 정리·수정·점검을 끝내는 데 적합합니다.']
      ],
      dont:[
        ['감정이 올라온 순간 결론 확정하기','불편함이 큰 순간의 판단은 실제 조건보다 감정의 영향을 더 많이 받을 수 있습니다.'],
        ['충동구매나 큰 금액 결정','예정에 없던 결제는 가능하면 하루 뒤 다시 보고 결정하는 편이 안전합니다.'],
        ['확인되지 않은 말을 사실로 받아들이기','전달받은 이야기나 상대의 의도를 추측으로 확정하지 말고 근거를 확인하세요.'],
        ['체력이 떨어졌는데 일정 추가하기','오늘 해야 할 일보다 회복이 필요한 상태인지 먼저 살펴보는 것이 좋습니다.'],
        ['한 번의 실수로 전체를 부정하기','작은 어긋남을 관계·일 전체의 실패로 확대해서 해석하지 않는 것이 중요합니다.']
      ]
    }
  };

  function renderList(selector,items){
    const ul=$(selector);if(!ul)return;
    const html=items.map(([title,copy],i)=>`<li data-index="${String(i+1).padStart(2,'0')}"><div><strong>${title}</strong><span>${copy}</span></div></li>`).join('');
    if(ul.innerHTML!==html)ul.innerHTML=html;
  }

  function areaCopy(title){
    const card=all('.fortune-card').find(c=>text(c.querySelector('h3')).includes(title));
    return text(card?.querySelector('p'));
  }

  function expandSummary(){
    const box=$('[data-total-summary]');if(!box)return;
    const headline=text($('[data-headline]'))||'오늘은 내 선택의 속도를 조절하는 것이 중요합니다.';
    const signal=text($('[data-signal-note]'));
    const work=areaCopy('일');
    const money=areaCopy('재물');
    const people=areaCopy('사람');
    const rhythm=areaCopy('생활');
    const final=text($('[data-tip-final]'));
    const m=mode();
    const closing=m==='go'
      ?'오늘은 새로운 가능성을 무작정 넓히는 날이라기보다, 이미 준비된 것을 실제 행동으로 옮기고 하나씩 완성해가는 데 더 적합합니다.'
      :m==='check'
        ?'오늘은 멈추라는 뜻보다, 중요한 결정을 한 번 더 확인하고 불필요한 변수를 줄인 뒤 움직이는 편이 안정적이라는 의미에 가깝습니다.'
        :'오늘은 크게 밀거나 멈추는 한쪽의 선택보다, 진행 중인 일을 정리하고 사람·돈·일정의 균형을 맞추는 데 초점을 두는 편이 좋습니다.';
    const html=`
      <p><span class="fortune-summary-label">OVERALL</span><strong>${headline}</strong>${signal}</p>
      <p><span class="fortune-summary-label">WORK · MONEY</span><strong>일과 돈에서는 기준을 먼저 확인하세요.</strong>${work} ${money}</p>
      <p><span class="fortune-summary-label">RELATIONSHIP · RHYTHM</span><strong>관계와 생활에서는 속도를 조절하는 것이 중요합니다.</strong>${people} ${rhythm}</p>
      <p class="fortune-summary-closing"><span class="fortune-summary-label">TODAY'S GUIDE</span><strong>${final||'오늘의 선택은 크기보다 순서가 중요합니다.'}</strong>${closing}</p>`;
    if(box.innerHTML!==html)box.innerHTML=html;
  }

  function retitleChoice(){
    const section=$('.fortune-choice-section');if(!section)return;
    const label=section.querySelector('.fortune-label');if(label&&label.textContent!=='05 · HELPFUL & AVOID')label.textContent='05 · HELPFUL & AVOID';
    const h2=section.querySelector('h2');if(h2&&h2.textContent!=='오늘은 이렇게 움직이면 좋습니다.')h2.textContent='오늘은 이렇게 움직이면 좋습니다.';
    let lead=section.querySelector('.fortune-section-lead');
    if(!lead){lead=document.createElement('p');lead.className='fortune-section-lead';h2?.insertAdjacentElement('afterend',lead);}
    const leadText='오늘의 흐름을 생활에 바로 적용할 수 있도록 도움이 되는 행동과 피하면 좋은 행동을 구체적으로 정리했습니다.';
    if(lead.textContent!==leadText)lead.textContent=leadText;
    const positive=section.querySelector('.fortune-choice-card.positive>span');if(positive&&positive.textContent!=='도움이 되는 것')positive.textContent='도움이 되는 것';
    const caution=section.querySelector('.fortune-choice-card.caution>span');if(caution&&caution.textContent!=='피하면 좋은 것')caution.textContent='피하면 좋은 것';
  }

  function apply(){
    const m=mode();
    retitleChoice();
    renderList('[data-do-list]',content[m].do);
    renderList('[data-dont-list]',content[m].dont);
    expandSummary();
  }

  let timer=0,observer=null;
  const observe=()=>observer.observe(root,{subtree:true,childList:true,characterData:true});
  const schedule=()=>{
    clearTimeout(timer);
    timer=setTimeout(()=>{
      observer.disconnect();
      try{apply();}finally{observe();}
    },20);
  };
  observer=new MutationObserver(schedule);
  observe();
  observer.disconnect();apply();observe();
  setTimeout(schedule,250);
  setTimeout(schedule,700);
})();