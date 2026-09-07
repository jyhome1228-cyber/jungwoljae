(()=>{
  const root=document.querySelector('[data-saju-result]');
  if(!root)return;
  const $=(s,r=root)=>r.querySelector(s);
  const all=(s,r=root)=>[...r.querySelectorAll(s)];
  const text=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();

  const groupMap={
    비겁:['비겁','주도성 · 동료와 경쟁','주도성·동료·경쟁'],
    식상:['식상','표현 · 실행 · 결과물','표현·실행·결과물'],
    재성:['재성','돈 · 현실 · 자원 관리','돈·현실·자원관리'],
    관성:['관성','책임 · 규칙 · 조직','책임·규칙·조직'],
    인성:['인성','배움 · 정보 · 전문성','배움·정보·전문성']
  };
  const helpTitle={비겁:'주도성 · 동료와 경쟁',식상:'표현 · 실행 · 결과물',재성:'돈 · 현실 · 자원 관리',관성:'책임 · 규칙 · 조직',인성:'배움 · 정보 · 전문성'};
  const identify=value=>Object.keys(groupMap).find(k=>groupMap[k].some(v=>String(value||'').includes(v)))||null;

  function syncTenGodHelp(){
    const helpCards=all('.ten-god-help-card');
    const source=all('.ten-god-card').map(c=>({key:identify(text(c.querySelector('span'))),count:Number((text(c.querySelector('strong')).match(/\d+/)||['0'])[0])})).filter(x=>x.key);
    if(!helpCards.length||!source.length)return;
    const top=[...source].sort((a,b)=>b.count-a.count)[0];
    helpCards.forEach(card=>{
      const key=identify(text(card.querySelector('span')));if(!key)return;
      const count=source.find(x=>x.key===key)?.count??0;
      const span=card.querySelector('span');if(span)span.textContent=`${helpTitle[key]} · ${count}회`;
      card.classList.toggle('is-top',Boolean(top&&top.count>0&&top.key===key));
      const small=card.querySelector('small');if(small)small.textContent=count===0?'0회 = 이 능력이 없다는 뜻이 아닙니다':'현재 화면에 보이는 천간 기준 빈도입니다';
    });
  }

  function addLifeGuide(){
    const grid=$('[data-life-grid]');if(!grid)return;
    const section=grid.closest('.saju-report');if(!section||section.querySelector('[data-life-help]'))return;
    const box=document.createElement('div');box.className='saju-easy-explain';box.dataset.lifeHelp='';
    box.innerHTML=`<span class="saju-explain-kicker">생활에 적용하는 법</span><h3>여기부터는 “그래서 나는 어떻게 하면 좋은가?”를 확인하는 부분입니다.</h3><p class="saju-explain-lead">사주 용어를 다시 해석하기보다 실제 선택에서 반복되는 습관을 확인하세요. 아래 질문에 답해보면 결과를 자신의 생활과 연결하기 쉽습니다.</p><div class="saju-explain-grid"><article class="saju-explain-card"><span>생각과 행동</span><strong>나는 시작과 마무리 중 어느 쪽이 더 쉬운가?</strong><p>결정을 빨리 내리는지, 충분히 알아본 뒤 움직이는지, 시작한 일을 끝까지 유지하는지 살펴보세요. 사주 해석은 이 반복 패턴을 확인하는 참고 자료입니다.</p></article><article class="saju-explain-card"><span>일과 직업</span><strong>직업명보다 어떤 환경에서 오래 잘하는지 보세요.</strong><p>혼자 결정할 수 있는 범위, 협업 빈도, 일정의 규칙성, 결과가 보이는 속도 중 어떤 조건에서 힘이 오래 유지되는지가 더 중요합니다.</p></article><article class="saju-explain-card"><span>재물과 현실</span><strong>돈은 ‘재물운’ 한 단어보다 실제 관리 습관이 중요합니다.</strong><p>수입보다 남는 돈, 큰 지출의 상한선, 손실을 멈출 기준, 매달 반복되는 비용을 기록해보면 해석을 현실적으로 사용할 수 있습니다.</p></article><article class="saju-explain-card"><span>관계와 감정</span><strong>누가 맞는 사람인지보다 어떤 관계에서 편안한지 보세요.</strong><p>연락 속도, 약속, 갈등 뒤 행동, 혼자 있는 시간처럼 반복해서 중요하게 느끼는 기준을 확인하면 관계 패턴을 더 쉽게 이해할 수 있습니다.</p></article></div>`;
    section.appendChild(box);
  }

  function addYearGuide(){
    const grid=$('[data-year-flow]');if(!grid)return;
    const section=grid.closest('.saju-report');if(!section||section.querySelector('[data-year-help]'))return;
    const years=all('.year-card',grid).map(c=>({year:text(c.querySelector('span')),title:text(c.querySelector('h3')),key:text(c.querySelector('strong')),copy:text(c.querySelector('p'))}));
    const first=years[0],second=years[1];
    const box=document.createElement('div');box.className='saju-easy-explain';box.dataset.yearHelp='';
    box.innerHTML=`<span class="saju-explain-kicker">연도 흐름을 쉽게 말하면</span><h3>“무슨 일이 생긴다”가 아니라, 그 해에 어떤 주제를 더 자주 다루게 될 수 있는지 보는 참고표입니다.</h3><p class="saju-explain-lead">같은 연도라도 실제 결과는 직업, 관계, 경제 상황과 선택에 따라 달라집니다. 따라서 좋은 해·나쁜 해로 단정하지 않고 미리 점검할 주제를 찾는 용도로 사용하는 편이 좋습니다.</p><div class="saju-explain-grid"><article class="saju-explain-card"><span>${first?.year||'올해'}</span><strong>${first?.key||'현재 주제'}를 어떻게 다룰지 확인하세요.</strong><p>${first?.copy||'현재 연도의 관계를 참고해 내가 자주 부딪힐 수 있는 주제를 확인합니다.'}</p><em>추천: 올해 계획과 실제 상황을 함께 놓고, 이 문장과 맞는 부분만 참고하세요.</em></article><article class="saju-explain-card"><span>${second?.year||'다음 해'}</span><strong>${second?.key||'다음 주제'}는 미리 준비할 질문으로 보세요.</strong><p>${second?.copy||'다음 연도는 예언보다 미리 준비할 생활 주제를 확인하는 참고값으로 봅니다.'}</p><em>추천: 직업·돈·관계 중 이 주제와 연결되는 계획이 있다면 조건을 미리 정리해두세요.</em></article><article class="saju-explain-card"><span>합 · 충 같은 표현</span><strong>사건 예고가 아니라 변화의 방식에 대한 표현입니다.</strong><p>‘합’은 연결점이 생기기 쉬운 관계, ‘충’은 기존 방식과 다른 요구가 들어와 조정이 필요해지는 관계 정도로 이해하면 됩니다.</p></article><article class="saju-explain-card"><span>사용하지 말아야 할 방식</span><strong>퇴사·투자·결혼 같은 큰 결정을 연도 운만으로 정하지 마세요.</strong><p>연도 흐름은 계획을 점검하는 보조 자료입니다. 실제 결정은 계약 조건, 자금, 건강, 관계 상황처럼 현실 정보를 먼저 확인해야 합니다.</p></article></div>`;
    section.appendChild(box);
  }

  function addSummaryGuide(){
    const section=$('.summary-report');if(!section||section.querySelector('[data-summary-help]'))return;
    const box=document.createElement('div');box.className='saju-easy-explain';box.dataset.summaryHelp='';
    box.innerHTML=`<span class="saju-explain-kicker">마지막으로 이렇게 정리하세요</span><h3>사주 결과에서 기억할 것은 전문 용어보다 세 가지입니다.</h3><div class="saju-explain-grid"><article class="saju-explain-card"><span>01 · 계속 써도 되는 것</span><strong>이미 자연스럽게 잘하는 방식</strong><p>결과에서 반복해서 장점으로 언급되는 행동은 억지로 바꾸기보다 어떤 환경에서 가장 잘 쓰이는지 찾는 것이 좋습니다.</p></article><article class="saju-explain-card"><span>02 · 조심할 것</span><strong>잘하는 방식이 과해질 때 생기는 문제</strong><p>강점 자체보다 같은 방법만 반복할 때 생기는 피로, 고집, 미루기, 과속 같은 부작용을 확인하세요.</p></article><article class="saju-explain-card"><span>03 · 실제로 해볼 것</span><strong>부족한 부분은 성격이 아니라 습관으로 보완</strong><p>기록, 체크리스트, 결정 시한, 예산 상한선, 대화 규칙처럼 실제 행동 구조를 하나 추가하는 방식이 가장 현실적입니다.</p></article><article class="saju-explain-card"><span>정월재의 기준</span><strong>사주는 선택을 대신하지 않고 선택 기준을 정리합니다.</strong><p>결과가 내 경험과 맞는 부분은 활용하고 맞지 않는 부분은 고정된 운명처럼 받아들이지 않아도 됩니다.</p></article></div>`;
    section.appendChild(box);
  }

  function apply(){syncTenGodHelp();addLifeGuide();addYearGuide();addSummaryGuide();}
  let timer=0;const schedule=()=>{clearTimeout(timer);timer=setTimeout(apply,60);};
  new MutationObserver(schedule).observe(root,{subtree:true,childList:true,characterData:true});
  apply();setTimeout(apply,450);setTimeout(apply,900);setTimeout(apply,1500);
})();
