(()=>{
  'use strict';
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const supported=new Set(['ohaeng-result.html','relationship-result.html','work-money-result.html','compatibility-report.html','guide-result.html']);
  if(!supported.has(file))return;

  const text=node=>String(node?.textContent||'').replace(/\s+/g,' ').trim();
  const addCue=(card,copy)=>{
    if(!card||!copy||card.querySelector(':scope > .result-action-cue'))return;
    const p=document.createElement('p');
    p.className='result-action-cue';
    p.textContent=copy;
    card.appendChild(p);
  };

  const cueForOhaeng=(title,body)=>{
    const t=`${title} ${body}`;
    if(/생각|행동|시작|결정/.test(t))return '결정할 때 선택지를 세 개 이하로 줄이고, 오늘 할 첫 행동 하나까지 정해보세요.';
    if(/사람|관계|대화/.test(t))return '불편한 점은 쌓아두지 말고, 사실 한 가지와 원하는 것 한 가지를 짧게 말해보세요.';
    if(/일|업무|선택|성과/.test(t))return '새 일을 더 늘리기보다 마감일·담당·완료 기준을 먼저 적어두세요.';
    if(/돈|재물|지출|생활/.test(t))return '이번 달 고정지출과 변동지출을 나눠 적고, 줄일 항목 하나만 골라보세요.';
    if(/자연스럽|강한|잘 쓰/.test(t))return '잘하는 방식은 그대로 쓰되, 같은 방식만 반복하고 있지는 않은지 마지막 단계에서 한 번 확인하세요.';
    if(/보완|약한|챙길/.test(t))return '부족한 기운을 억지로 키우기보다, 놓치기 쉬운 과정을 체크리스트 하나로 보완해보세요.';
    return '';
  };

  const cueForRelationship=(title,body)=>{
    const t=`${title} ${body}`;
    if(/표현|마음|감정/.test(t))return '“나는 지금 이렇게 느끼고, 그래서 이게 필요해”처럼 한 문장으로 직접 말해보세요.';
    if(/갈등|부딪|회복/.test(t))return '싸울 때는 사실 1개 → 감정 1개 → 요청 1개 순서로 말하면 감정이 덜 번집니다.';
    if(/거리|시간|혼자/.test(t))return '연락 횟수보다 서로 편한 시간대를 먼저 합의해두는 편이 오래 갑니다.';
    if(/선택|관계|인연|끌림/.test(t))return '끌림보다 약속을 지키는 방식, 대화 뒤 피로도, 일상 속 속도가 맞는지를 보세요.';
    if(/연락|약속/.test(t))return '연락 빈도나 약속 방식처럼 반복해서 부딪히는 항목 하나만 먼저 규칙을 정해보세요.';
    return '';
  };

  const cueForWork=(title,body)=>{
    const t=`${title} ${body}`;
    if(/성과|강점|일의 중심|직업/.test(t))return '이번 주에 내가 반드시 끝낼 핵심 책임 세 가지만 남기고 나머지는 뒤로 미뤄보세요.';
    if(/피로|부담|지치|압박/.test(t))return '내 책임이 아닌 일 하나를 골라 넘기거나, 마감 기준을 다시 협의해보세요.';
    if(/조직|독립|프리랜스|사업/.test(t))return '직함보다 의사결정 권한·수입 안정성·고객 확보 세 조건을 각각 점수로 비교해보세요.';
    if(/돈|재물|수입|지출|축적/.test(t))return '큰 지출은 목적·회수 기간·최악의 경우를 한 줄씩 적은 뒤 결정하세요.';
    if(/변화|이직|이동/.test(t))return '바로 옮기기보다 현재 문제와 새 환경에서 얻을 것을 각각 세 가지씩 적어 비교해보세요.';
    return '';
  };

  const cueForCompatibility=(title,body)=>{
    const t=`${title} ${body}`;
    if(/잘 맞|이어지|자연스럽/.test(t))return '잘 맞는 부분은 굳이 고치려 하지 말고, 두 사람이 편하게 반복할 수 있는 습관으로 남겨두세요.';
    if(/조율|부딪|갈등|차이/.test(t))return '자주 부딪히는 주제 하나만 골라 “언제·어떻게 말할지” 규칙을 먼저 정해보세요.';
    if(/대화|연락/.test(t))return '중요한 얘기는 감정이 올라왔을 때 결론내기보다, 잠깐 쉬고 같은 날 다시 확인하세요.';
    if(/생활|리듬|속도/.test(t))return '연락 빈도·약속 시간·혼자 있는 시간 중 하나부터 서로의 기준을 숫자로 맞춰보세요.';
    if(/감정|표현/.test(t))return '상대가 알아서 알 거라고 넘기지 말고, 좋았던 점과 서운한 점을 각각 한 문장으로 말해보세요.';
    return '';
  };

  function polishOhaeng(){
    document.querySelectorAll('[data-life-grid] .life-card,.insight-card').forEach(card=>{
      const title=text(card.querySelector('h2,h3,strong'));
      const body=text(card.querySelector('p,div'));
      addCue(card,cueForOhaeng(title,body));
    });
  }

  function polishRelationship(){
    document.querySelectorAll('[data-guide-grid] .relationship-guide-card,[data-condition-grid] .relationship-condition-card,.relationship-insight').forEach(card=>{
      const title=text(card.querySelector('h2,h3,strong'));
      const body=text(card.querySelector('p,div'));
      addCue(card,cueForRelationship(title,body));
    });
  }

  function polishWork(){
    document.querySelectorAll('[data-core-grid] .work-core-card,.work-insight,[data-money-grid] .money-card').forEach(card=>{
      const title=text(card.querySelector('h2,h3,strong'));
      const body=text(card.querySelector('p,div'));
      addCue(card,cueForWork(title,body));
    });
  }

  function polishCompatibility(){
    document.querySelectorAll('[data-compare-grid] .compatibility-compare-card,[data-advice] article').forEach(card=>{
      const title=text(card.querySelector('h2,h3,strong'));
      const body=text(card.querySelector('p,div'));
      addCue(card,cueForCompatibility(title,body));
    });
  }

  function polishGuide(){
    // Dogam is already action-led. Only reinforce cards that still end in vague advice.
    document.querySelectorAll('[data-check-grid] .guide-check-card').forEach(card=>{
      const title=text(card.querySelector('strong,h3'));
      const body=text(card.querySelector('p'));
      if(/확인|비교|기준/.test(`${title} ${body}`))addCue(card,'오늘 확인할 수 있는 사실 하나를 숫자·날짜·행동으로 바꿔 적어보세요.');
    });
  }

  function run(){
    if(file==='ohaeng-result.html')polishOhaeng();
    if(file==='relationship-result.html')polishRelationship();
    if(file==='work-money-result.html')polishWork();
    if(file==='compatibility-report.html')polishCompatibility();
    if(file==='guide-result.html')polishGuide();
  }

  run();
  [500,1200,2200,3600,5200].forEach(ms=>setTimeout(run,ms));
})();
