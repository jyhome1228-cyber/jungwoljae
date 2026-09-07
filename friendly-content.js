(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!file.endsWith('-result.html'))return;
  const root=document.querySelector('main');
  if(!root)return;

  const $all=(s,r=root)=>[...r.querySelectorAll(s)];
  const text=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();

  const easyExact={
    '목':'시작하고 키우는 힘','화':'표현하고 움직이는 힘','토':'안정시키고 관리하는 힘','금':'판단하고 정리하는 힘','수':'살피고 연결하는 힘',
    '비겁':'내 기준 · 독립성 · 경쟁','식상':'표현 · 실행 · 결과물','재성':'돈 · 현실 감각 · 관리','관성':'책임 · 규칙 · 조직생활','인성':'배움 · 준비 · 정보',
    '비견':'내 기준과 독립성','겁재':'경쟁과 주도권','식신':'꾸준한 표현과 생산','상관':'자유로운 표현과 문제 해결','편재':'기회 · 거래 · 유동적 수입','정재':'안정적 수입 · 계획적 관리','편관':'압박 속 책임과 결단','정관':'규칙 · 직책 · 책임','편인':'직감 · 새로운 아이디어','정인':'배움 · 정보 · 보호'
  };

  const phrasePairs=[
    ['명식 안에서','사주 전체에서'],['명식에서는','사주 전체에서는'],['명식에서','사주 전체에서'],
    ['일간의','타고난 중심 성향의'],['일간은','타고난 중심 성향은'],['일지는','가까운 관계와 생활 습관을 보는 자리는'],['일지의','가까운 관계와 생활 습관을 보는 자리의'],
    ['작용이 상대적으로 강하고','성향이 비교적 자주 드러나고'],['작용이 강하게','성향이 강하게'],['작용이','성향이'],
    ['의식적으로 보완할 부분','조금 더 챙기면 좋은 부분'],['보완할 부분','조금 더 챙기면 좋은 부분'],['보완하면 좋은 기운','놓치기 쉬워 챙기면 좋은 힘'],['강하게 쓰이는 기운','자연스럽게 잘 쓰는 힘'],
    ['목의 기운','새로운 일을 시작하고 키우려는 성향'],['화의 기운','표현하고 움직이려는 성향'],['토의 기운','안정시키고 꾸준히 관리하려는 성향'],['금의 기운','기준을 세우고 정리하려는 성향'],['수의 기운','먼저 살피고 연결하려는 성향'],
    ['비겁의','내 기준과 경쟁 성향의'],['식상의','표현과 실행 성향의'],['재성의','돈과 현실 감각의'],['관성의','책임과 조직 기준의'],['인성의','배움과 준비 성향의'],
    ['비겁은','내 기준과 경쟁 성향은'],['식상은','표현과 실행 성향은'],['재성은','돈과 현실 감각은'],['관성은','책임과 조직 기준은'],['인성은','배움과 준비 성향은'],
    ['육합','서로 자연스럽게 맞물리는 관계'],['충의 흐름','변화와 부딪힘이 커지는 흐름'],['일지와 충','가까운 관계 자리와 변화가 크게 맞부딪히는 흐름']
  ];

  function simplifySentence(value){
    let t=String(value||'');
    phrasePairs.forEach(([a,b])=>{t=t.split(a).join(b);});
    return t;
  }

  function simplifyVisibleText(){
    $all('p').forEach(p=>{
      if(p.closest('[data-evidence],.evidence-content,.guide-evidence-content,.relationship-evidence-content,.fortune-evidence-content,.work-evidence-content'))return;
      p.textContent=simplifySentence(p.textContent);
    });
    $all('strong,h3').forEach(n=>{
      const raw=text(n);
      if(easyExact[raw]){
        n.textContent=easyExact[raw];
        n.title=`전통 명리 용어: ${raw}`;
        if(!n.parentElement?.querySelector('.friendly-term-note')){
          const note=document.createElement('em');note.className='friendly-term-note';
          note.textContent=raw==='비겁'?'전통 명리에서 비견과 겁재를 묶는 말이며, 일상어의 “비겁하다”와는 전혀 다른 뜻입니다.':`전통 명리에서는 ‘${raw}’라고 부릅니다.`;
          n.insertAdjacentElement('afterend',note);
        }
      }
    });
  }

  const practicalByElement={
    '시작하고 키우는 힘':'새로운 일을 시작하거나 방향을 정할 때 힘이 잘 붙습니다. 다만 시작한 뒤 반복 관리와 마무리가 밀리지 않도록 일정과 마감 기준을 함께 잡아두는 편이 좋습니다.',
    '표현하고 움직이는 힘':'생각을 말이나 행동으로 꺼낼 때 장점이 잘 드러납니다. 발표, 제안, 대화처럼 반응이 바로 오는 상황에서는 빠르게 움직일 수 있지만 감정이 올라온 순간 큰 결론까지 내리지는 않는 편이 좋습니다.',
    '안정시키고 관리하는 힘':'흩어진 일을 정리하고 꾸준히 유지하는 데 강점이 있습니다. 실제로는 일정, 예산, 반복 업무처럼 계속 챙겨야 하는 일을 안정적으로 붙드는 데 도움이 됩니다.',
    '판단하고 정리하는 힘':'무엇이 필요한지 구분하고 기준을 세울 때 강점이 드러납니다. 계약, 견적, 우선순위처럼 결론이 필요한 상황에서는 기준을 미리 적어두면 판단이 더 빨라집니다.',
    '살피고 연결하는 힘':'정보와 분위기를 먼저 보고 여러 가능성을 비교하는 편입니다. 조사와 생각이 길어질수록 행동이 늦어질 수 있으니, 알아볼 기간과 실제로 움직일 날짜를 따로 정해두는 편이 좋습니다.'
  };

  const practicalByGod={
    '내 기준 · 독립성 · 경쟁':'남이 정한 방식보다 내가 납득한 기준이 있어야 움직이기 쉽습니다. 협업할 때는 역할과 책임 범위를 먼저 정하면 불필요한 피로를 줄일 수 있습니다.',
    '표현 · 실행 · 결과물':'생각을 밖으로 꺼내 실제 결과물로 만들 때 힘이 붙습니다. 글, 발표, 디자인, 제안서처럼 눈에 보이는 결과물을 꾸준히 남기는 방식이 잘 맞습니다.',
    '돈 · 현실 감각 · 관리':'시간과 돈, 효율처럼 실제 조건을 함께 보는 편입니다. 감으로 판단하기보다 비용, 수입, 반복 지출을 숫자로 적어보면 선택이 훨씬 선명해집니다.',
    '책임 · 규칙 · 조직생활':'역할과 책임이 분명할수록 안정적으로 힘을 쓰기 쉽습니다. 반대로 기준이 자주 바뀌거나 책임만 늘어나는 환경에서는 피로가 빨리 쌓일 수 있습니다.',
    '배움 · 준비 · 정보':'충분히 이해하고 준비한 뒤 움직일 때 마음이 놓이는 편입니다. 준비가 길어져 실행이 늦어지지 않도록 조사 종료 시점을 정하는 것이 중요합니다.'
  };

  function appendIfShort(card,extra){
    const p=card?.querySelector('p');
    if(!p||!extra||text(p).length>=95||p.dataset.friendlyExpanded==='1')return;
    p.dataset.friendlyExpanded='1';
    p.textContent=`${text(p)} ${extra}`;
  }

  function enrichCommonCards(){
    $all('.work-core-card,.ten-god-card,.element-card,.relationship-core-card,.guide-personal-card').forEach(card=>{
      const key=text(card.querySelector('strong'));
      const extra=practicalByElement[key]||practicalByGod[key];
      appendIfShort(card,extra);
    });
  }

  const guideDomainExtra={
    work:'이 고민은 “버틸까 그만둘까”보다 어떤 조건이면 움직일지 정하는 문제에 가깝습니다. 연봉, 실제 업무시간, 맡을 역할, 1년 뒤 남는 경험을 같은 표에 놓고 비교하면 막연함이 줄어듭니다.',
    money:'돈 문제는 운보다 숫자가 먼저입니다. 최근 3개월 수입·고정비·반복지출을 먼저 확인하고, 큰 지출이나 투자는 최대 손실과 회수 기간을 정한 뒤 판단하는 편이 안전합니다.',
    love:'상대의 마음을 계속 추측하기보다 최근 몇 주 동안 말과 행동이 얼마나 일치했는지를 보는 것이 중요합니다. 연락, 약속, 갈등 뒤 태도를 함께 보면 관계의 실제 모습을 더 정확히 볼 수 있습니다.',
    people:'관계를 유지할지 끊을지 바로 정하기보다 먼저 어디까지 허용할지를 정하는 편이 좋습니다. 반복되는 불편함이 있는지, 말했을 때 상대가 조정하려는지부터 확인하세요.',
    change:'변화는 기대감만으로 결정하기보다 비용, 생활 안정, 준비 기간, 되돌아올 수 있는 선택지를 함께 봐야 합니다. 바로 큰 결정을 하기보다 작게 시험해보는 방법이 있는지도 확인해보세요.',
    mind:'마음이 지쳤을 때는 모든 문제를 인생 전체의 문제로 넓혀 생각하기 쉽습니다. 지금 해결해야 하는 한 가지와 잠시 미뤄도 되는 것을 나누고, 수면·식사·일정처럼 생활 리듬부터 다시 잡는 것이 우선입니다.',
    choice:'두 선택지 모두 장단점이 있다면 “완벽한 답”을 찾기보다 반드시 필요한 조건과 감수할 수 있는 단점을 나누는 편이 좋습니다. 결정 시한을 정하면 고민이 끝없이 길어지는 것을 막을 수 있습니다.'
  };

  function enrichGuide(){
    const guide=document.querySelector('[data-guide-result]');if(!guide)return;
    let input={};try{input=JSON.parse(sessionStorage.getItem('jungwoljae_guide_input')||'{}');}catch(e){}
    const domain=input.domain||input.guideDomain||input.category||'';
    const reason=document.querySelector('[data-reason]');
    if(reason&&guideDomainExtra[domain]&&text(reason).length<300){
      const p=document.createElement('p');p.className='friendly-explain';p.textContent=guideDomainExtra[domain];reason.appendChild(p);
    }
    $all('.guide-personal-card,.guide-check-card,.guide-action-card',guide).forEach(card=>{
      const p=card.querySelector('p');
      if(p&&text(p).length<85){
        p.textContent+= ' 실제로 적용할 때는 한 번에 크게 바꾸기보다, 이번 주 안에 확인할 수 있는 작은 행동 하나부터 정해보는 편이 좋습니다.';
      }
    });
    const answer=document.querySelector('[data-answer]');
    if(answer&&guideDomainExtra[domain]&&text(answer).length<420){
      const p=document.createElement('p');p.textContent='정월재의 해답은 미래를 대신 결정하는 말보다, 지금 바로 확인할 수 있는 기준을 드리는 데 초점을 둡니다. 위 기준 중 두세 가지를 실제 상황에 대입해보고, 조건이 맞는 쪽으로 움직여보세요.';answer.appendChild(p);
    }
  }

  function enrichRelationship(){
    const r=document.querySelector('[data-relationship-result]');if(!r)return;
    $all('.relationship-guide-card,.relationship-status-box',r).forEach(card=>{
      const p=card.querySelector('p');if(!p||text(p).length>=95)return;
      p.textContent+=' 연락 빈도, 약속을 지키는지, 불편함을 말했을 때 상대가 어떻게 반응하는지처럼 실제 행동을 함께 보면 판단이 더 쉬워집니다.';
    });
  }

  function enrichFortune(){
    const r=document.querySelector('[data-fortune-result]');if(!r)return;
    $all('.fortune-card,.fortune-time-card,.fortune-tip-card',r).forEach(card=>{
      const p=card.querySelector('p');if(!p||text(p).length>=90)return;
      p.textContent+=' 오늘 하루는 한 번에 많은 것을 바꾸기보다, 지금 바로 확인할 수 있는 한 가지 행동으로 옮겨보는 편이 좋습니다.';
    });
  }

  function enrichWork(){
    const r=document.querySelector('[data-work-result]');if(!r)return;
    $all('.money-card,.work-guide-card,.focus-result-card',r).forEach(card=>{
      const p=card.querySelector('p');if(!p||text(p).length>=95)return;
      p.textContent+=' 실제 판단에서는 수입·비용·시간·반복 가능성을 함께 적어보면 장단점이 훨씬 분명해집니다.';
    });
  }

  simplifyVisibleText();
  enrichCommonCards();
  enrichGuide();
  enrichRelationship();
  enrichFortune();
  enrichWork();
})();
