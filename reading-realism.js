(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!file.includes('-result.html')) return;

  const inputKeys={
    'saju-result.html':'jungwoljae_saju_input',
    'ohaeng-result.html':'jungwoljae_ohaeng_input',
    'fortune-result.html':'jungwoljae_fortune_input',
    'relationship-result.html':'jungwoljae_relationship_input',
    'work-money-result.html':'jungwoljae_work_money_input',
    'compatibility-result.html':'jungwoljae_compatibility_input'
  };
  let input={};
  try{input=JSON.parse(sessionStorage.getItem(inputKeys[file])||'{}');}catch(e){}

  const elementExamples={
    '목':{
      strength:'새로운 프로젝트를 먼저 제안하거나, 배우고 싶은 분야를 바로 찾아 시작하고, 사람·업무의 범위를 넓히는 방식으로 나타날 수 있습니다.',
      risk:'시작은 빠른데 마무리와 유지가 뒤로 밀릴 수 있으니, 새 일을 추가하기 전에 기존 일의 종료 기준을 정해두는 편이 좋습니다.',
      action:'새 프로젝트·공부·이직 준비처럼 시작이 필요한 일은 첫 단계와 마감일을 함께 정해두세요.'
    },
    '화':{
      strength:'발표, 영업, SNS·블로그·유튜브, 디자인·콘텐츠 공개처럼 내가 만든 것을 밖으로 보여주는 상황에서 힘이 잘 드러날 수 있습니다.',
      risk:'반응이 빠른 만큼 말이나 결정이 앞서갈 수 있어, 공개·전송·계약 전에는 한 번 더 검토하는 과정이 필요합니다.',
      action:'포트폴리오, 글, 영상, 제안서처럼 결과물이 보이는 형태로 생각을 자주 밖에 꺼내보는 것이 좋습니다.'
    },
    '토':{
      strength:'일정표를 만들고, 반복 업무를 정리하고, 예산·문서·운영 기준을 세우는 등 흩어진 일을 안정된 구조로 묶는 데 강점이 나타날 수 있습니다.',
      risk:'익숙한 방식을 오래 유지해 변화 시점을 늦출 수 있으니, 일정 기간마다 유지할 것과 버릴 것을 다시 정하는 편이 좋습니다.',
      action:'업무 루틴, 월간 예산, 파일 정리, 체크리스트처럼 반복 가능한 관리 체계를 만들어두세요.'
    },
    '금':{
      strength:'견적 비교, 계약 조건 확인, 품질 검수, 비용 절감, 우선순위 정리처럼 무엇을 선택하고 무엇을 버릴지 판단하는 상황에서 강점이 드러날 수 있습니다.',
      risk:'기준이 높아지면 완성되기 전에는 공개하지 못하거나 작은 오류에 지나치게 오래 머물 수 있습니다.',
      action:'결정 기준을 3개 안팎으로 정하고, 기준을 충족하면 실행하는 마감 규칙을 두는 것이 좋습니다.'
    },
    '수':{
      strength:'자료 조사, 글쓰기, 기획, 분석, 기록, 아카이브처럼 정보를 모으고 연결해 다음 판단의 근거로 만드는 일에서 강점이 나타날 수 있습니다.',
      risk:'가능성을 오래 비교하다 실행 시점을 놓칠 수 있으니, 조사와 실행의 시간을 따로 정해두는 편이 좋습니다.',
      action:'메모·리서치·업무 기록을 쌓되, 일정 시점에는 반드시 결과물이나 결정으로 연결해보세요.'
    }
  };

  const godExamples={
    '식상':{
      text:'식상은 표현과 생산의 기운이라, 현실에서는 글·영상·디자인·기획서·발표·강의·포트폴리오처럼 생각을 결과물로 보여주는 방식으로 나타나기 쉽습니다.',
      action:'혼자 고민하는 시간을 길게 가져가기보다 작은 결과물을 꾸준히 공개하고 기록하면 강점을 살리기 좋습니다.'
    },
    '재성':{
      text:'재성은 현실적인 성과와 자원 관리로 연결되므로, 견적·매출·가격 책정·예산·고객 대응·현금흐름처럼 숫자와 결과가 분명한 일에서 체감되기 쉽습니다.',
      action:'돈의 많고 적음보다 수입원별 수익성과 반복 지출을 기록해 실제 숫자로 판단하는 습관이 중요합니다.'
    },
    '관성':{
      text:'관성은 책임과 조직의 기준으로 읽기 때문에, 직장에서는 역할·평가·마감·승진·관리 책임처럼 해야 할 일이 명확한 상황에서 드러나기 쉽습니다.',
      action:'책임을 무조건 더 떠안기보다 내 역할과 권한, 마감 기준을 명확하게 합의하는 것이 필요합니다.'
    },
    '인성':{
      text:'인성은 학습과 축적의 기운이라, 자격·연구·자료 정리·문서화·전문지식처럼 오래 쌓아 경쟁력을 만드는 방식과 연결됩니다.',
      action:'배우는 것에서 끝내지 말고 노트, 문서, 강의안, 콘텐츠처럼 다시 꺼내 쓸 수 있는 자산으로 남겨두세요.'
    },
    '비겁':{
      text:'비겁은 나와 비슷한 사람·경쟁·협업의 영역과 연결되므로, 동료·파트너·프리랜서 네트워크·공동 프로젝트에서 힘과 부담이 동시에 나타날 수 있습니다.',
      action:'협업할 때는 친분보다 역할·비용·책임 범위를 먼저 정해두는 편이 관계를 오래 유지하는 데 도움이 됩니다.'
    }
  };

  function textOf(node){return (node?.textContent||'').replace(/\s+/g,' ').trim();}
  function detectedElement(text){return ['목','화','토','금','수'].find(k=>new RegExp(`(^|[^가-힣])${k}([^가-힣]|$)|${k}\\(`).test(text))||null;}
  function detectedGod(text){
    if(/식신|상관|식상/.test(text))return '식상';
    if(/편재|정재|재성/.test(text))return '재성';
    if(/편관|정관|관성/.test(text))return '관성';
    if(/편인|정인|인성/.test(text))return '인성';
    if(/비견|겁재|비겁/.test(text))return '비겁';
    return null;
  }
  function statusLabel(){
    const s=input.relationshipStatus;
    return s==='single'?'솔로':s==='dating'?'연애 중':s==='complicated'?'썸·관계 고민':s==='breakup'?'이별 후':'';
  }
  function serviceName(){
    return file.startsWith('saju')?'종합 사주':file.startsWith('ohaeng')?'오행 분석':file.startsWith('fortune')?'오늘의 운세':file.startsWith('relationship')?'연애와 인연':file.startsWith('work-money')?'일과 재물':file.startsWith('compatibility')?'궁합':'사주';
  }

  function practicalCopy(title,body){
    const combined=`${title} ${body}`;
    const el=detectedElement(combined);
    const god=detectedGod(combined);
    const name=input.name||'회원';
    const element=el?elementExamples[el]:null;
    const godInfo=god?godExamples[god]:null;

    if(file==='fortune-result.html'){
      if(/일|학업|업무|흐름/.test(title))return [`예를 들어 오늘 처리해야 할 메일·제안·문서가 있다면 새 일을 더 벌이기보다 가장 중요한 한 가지를 먼저 끝내는 식으로 적용할 수 있습니다. 회의나 답변도 즉흥적으로 확정하기보다 해야 할 일과 책임자를 기록으로 남겨두면 흐름을 더 안정적으로 쓸 수 있습니다.`,`오늘 운세는 사건을 맞히는 문장보다 행동 기준으로 쓰는 편이 유용합니다. 결제·계약·중요한 답변처럼 되돌리기 어려운 선택은 한 번 더 확인하고, 가벼운 연락·정리·준비는 부담 없이 실행해보세요.`];
      if(/재물|소비/.test(title))return [`오늘 재물 흐름은 '돈이 들어온다/나간다'보다 소비 판단 방식으로 보는 것이 현실적입니다. 계획에 없던 결제, 구독 갱신, 큰 금액 구매가 있다면 바로 결정하지 말고 필요성·가격·대체 가능성을 한 번 비교해보세요.`,`반대로 이미 예산이 정해진 생활비나 필요한 지출까지 지나치게 아끼기보다, 계획 안에서 쓰고 기록을 남기는 쪽이 더 안정적입니다.`];
      if(/관계|사람|대화/.test(title))return [`관계에서는 메시지 답장 속도나 짧은 말투 하나에 의미를 크게 붙이기보다 실제로 확인된 말과 행동을 기준으로 보세요. 중요한 대화가 있다면 감정이 올라온 순간 바로 결론을 내리기보다 핵심 질문을 한두 개로 줄여 이야기하는 편이 좋습니다.`,`새 인연이나 업무 관계에서도 상대의 속도를 재촉하지 않고, 다음 약속이나 해야 할 일을 분명하게 정하는 방식이 도움이 됩니다.`];
      if(/생활|리듬|시간/.test(title))return [`일정을 촘촘하게 채우기보다 집중이 필요한 시간과 회복 시간을 분리해보세요. 오전에 중요한 일을 몰아서 했다면 오후에는 단순 정리·이동·연락처럼 에너지 소모가 적은 일로 배치하는 방식이 현실적인 활용법입니다.`,`수면·식사·이동 시간을 줄여서 성과를 만들기보다 하루 후반에도 집중력을 남길 수 있는 일정이 더 중요합니다.`];
    }

    if(file==='relationship-result.html'){
      const state=statusLabel();
      if(/감정|표현|마음/.test(title))return [`${state?`${state} 상태라면 `:''}마음을 확인받기 위해 긴 대화를 한 번에 하기보다, 연락 빈도·약속을 지키는 방식·상대가 불편할 때 반응하는 모습을 먼저 살펴보는 것이 더 현실적입니다. 호감이 있어도 상대의 답장 속도나 말투만으로 관계를 확정하지 않는 편이 좋습니다.`,`감정 표현이 어려운 편이라면 '좋아한다'는 큰 말보다 먼저 연락하기, 약속을 구체적으로 잡기, 고마웠던 일을 바로 말하기처럼 작은 행동으로 표현하는 연습이 도움이 됩니다.`];
      if(/거리|갈등|패턴/.test(title))return [`관계가 가까워질수록 연락 횟수, 혼자 보내는 시간, 돈을 쓰는 방식, 주말 일정 같은 생활 기준에서 차이가 실제 갈등으로 이어질 수 있습니다. 애매하게 참다가 한 번에 터뜨리기보다 불편한 기준을 작은 단위로 먼저 말하는 편이 좋습니다.`,`같은 문제가 두세 번 반복된다면 상대의 성격만 문제로 보기보다 내가 늘 양보하는지, 답을 재촉하는지, 말을 미루는지처럼 반복되는 내 반응도 함께 점검해보세요.`];
      if(/올해|인연|현재/.test(title))return [`새로운 사람을 만날 기회가 있더라도 '운이 들어왔다'는 이유만으로 관계를 서두를 필요는 없습니다. 실제로는 소개, 모임, 업무 연결, 취미 활동처럼 사람을 반복해서 만날 수 있는 환경을 늘리는 것이 인연 가능성을 현실적으로 높입니다.`,`연애 중이라면 관계의 좋고 나쁨보다 앞으로 3~6개월 동안 일정·거리·돈·가족·생활 방식 중 무엇을 맞춰야 하는지 대화를 구체화하는 편이 더 도움이 됩니다.`];
    }

    if(file==='work-money-result.html' || file==='saju-result.html'){
      if(/일|직업|업무|성과|커리어|직장/.test(title)){
        const a=godInfo?.text||element?.strength||'일에서는 내가 잘하는 방식이 실제 결과물로 보이게 만드는 것이 중요합니다.';
        const b=godInfo?.action||element?.action||'업무를 넓히기보다 결과가 남는 한 가지를 정하고 마감 기준을 분명하게 두세요.';
        return [`${a} 예를 들어 제안서, 포트폴리오, 보고서, 고객 응대 기록, 프로젝트 결과처럼 다른 사람이 확인할 수 있는 형태로 남길수록 강점이 실제 평가와 기회로 연결되기 쉽습니다.`,`${b} 이직이나 사업을 고민한다면 막연히 '변화가 좋다'고 보기보다 현재 수입, 필요한 생활비, 준비 기간, 확보한 고객·경력 같은 현실 조건을 표로 정리한 뒤 결정하는 편이 좋습니다.`];
      }
      if(/재물|돈|수입|소비|축적/.test(title))return [`재물 해석은 '큰돈이 들어온다'는 식보다 돈을 버는 방식과 관리 습관으로 보는 편이 정확합니다. 월 고정비, 프로젝트별 순수익, 카드·구독 지출, 미수금처럼 실제 숫자를 한 번에 볼 수 있게 정리하면 자신의 재물 패턴을 훨씬 분명하게 확인할 수 있습니다.`,`사업·투자·이직처럼 금액이 큰 결정은 사주 결과만으로 판단하지 말고 손실 가능성, 현금 보유 기간, 계약 조건을 먼저 확인하세요. 운의 흐름은 의사결정의 참고 기준이지 수익을 보장하는 신호는 아닙니다.`];
      if(/성향|기질|일간|나의 사주|핵심/.test(title)){
        const a=element?.strength||'이 성향은 생각 속에만 머무르기보다 반복되는 행동 방식에서 더 분명하게 보입니다.';
        const b=element?.risk||'강점이 반복될수록 반대 역할을 의식적으로 넣는 것이 필요합니다.';
        return [`${a} 예를 들어 일을 받을 때 먼저 구조부터 잡는지, 바로 실행하는지, 자료를 충분히 모은 뒤 움직이는지, 사람과 이야기하면서 방향을 잡는지 같은 반복 행동을 돌아보면 이 해석을 현실에서 확인하기 쉽습니다.`,`${b} 자신과 맞지 않는 역할을 억지로 잘하려 하기보다 체크리스트, 협업 파트너, 일정 규칙처럼 부족한 기능을 시스템으로 보완하는 방식이 더 현실적입니다.`];
      }
      if(/앞으로|올해|내년|흐름|대운|세운/.test(title))return [`시기의 흐름은 특정 사건을 예고한다기보다 어떤 종류의 선택이 늘어날 가능성이 있는지를 보는 기준으로 사용하는 편이 좋습니다. 예를 들어 변화 기운이 강하면 실제로는 이직 제안, 프로젝트 이동, 업무 방식 변화, 새로운 공부처럼 기존 루틴을 바꾸는 선택지가 많아지는 식으로 체감될 수 있습니다.`,`이때는 '운이 좋으니 무조건 옮긴다'가 아니라 조건을 비교할 기준을 먼저 정해두세요. 연봉·시간·성장 가능성·생활 안정성처럼 본인에게 중요한 항목을 점수화하면 흐름을 현실적인 선택으로 연결하기 쉽습니다.`];
    }

    if(file==='ohaeng-result.html'){
      if(element)return [`${element.strength} 단순히 '${el}이 강하다'는 설명에서 끝내기보다, 최근 몇 년간 내가 반복해서 맡아온 역할이나 주변에서 자주 부탁받는 일을 떠올려보면 이 기운이 실제로 어떻게 쓰이는지 확인하기 쉽습니다.`,`${element.risk} ${element.action}`];
      if(/생활|생각|관계|일|돈/.test(title))return [`오행의 차이는 생활 습관으로 바꿔 볼 때 가장 이해하기 쉽습니다. 예를 들어 시작이 빠른 대신 기록이 약하다면 체크리스트를 두고, 생각이 긴 대신 표현이 늦다면 회의 전에 핵심 문장을 미리 적어두는 식으로 부족한 역할을 행동 규칙으로 보완할 수 있습니다.`,`색상·소품 같은 상징적 보완보다 일정, 기록, 대화, 돈 관리처럼 반복되는 실제 행동을 바꾸는 쪽이 정월재가 권하는 활용 방식입니다.`];
    }

    if(file==='compatibility-result.html')return [`궁합은 점수보다 실제 생활에서 맞춰야 할 기준을 보는 편이 유용합니다. 연락 빈도, 돈을 쓰는 방식, 혼자 필요한 시간, 갈등이 생겼을 때 대화 속도처럼 두 사람이 반복해서 부딪힐 수 있는 생활 항목을 구체적으로 비교해보세요.`,`잘 맞는 부분도 자동으로 유지되지는 않습니다. 한 사람은 즉시 해결하려 하고 다른 사람은 시간을 두고 정리하려 한다면, 갈등 시 '몇 시간 뒤 다시 이야기하기'처럼 두 사람이 지킬 수 있는 규칙을 만드는 편이 현실적인 보완이 됩니다.`];

    if(element)return [`${element.strength}`,`${element.risk} ${element.action}`];
    return [`이 해석은 실제 생활에서 반복되는 행동과 선택을 확인할 때 의미가 분명해집니다. 최근 6개월 정도의 업무, 소비, 관계, 생활 패턴에서 비슷한 상황이 어떻게 반복됐는지 떠올려보세요.`,`맞는 부분은 유지할 방법을 만들고, 불편한 부분은 의지로 버티기보다 일정·기록·대화 규칙 같은 시스템으로 보완하는 편이 더 현실적입니다.`];
  }

  function isEligible(section){
    if(section.dataset.realismEnhanced==='true')return false;
    const cls=section.className||'';
    if(/actions|evidence|error/.test(cls))return false;
    const title=textOf(section.querySelector('h2,h3'));
    if(!title)return false;
    if(/왜 이렇게|해석 근거/.test(title))return false;
    return true;
  }

  function enhance(){
    const root=document.querySelector('[data-saju-result],[data-ohaeng-result],[data-fortune-result],[data-relationship-result],[data-work-money-result],[data-compatibility-result]')||document.querySelector('main');
    if(!root)return;
    const sections=[...root.querySelectorAll('section')].filter(isEligible);
    let added=0;
    sections.forEach((section,index)=>{
      if(added>=7)return;
      const title=textOf(section.querySelector('h2,h3'));
      const body=textOf(section);
      if(body.length<80)return;
      const [p1,p2]=practicalCopy(title,body);
      const note=document.createElement('div');
      note.className=`realism-note${/총평|총 요약|전체 요약|total/i.test(title)?' is-summary':''}`;
      note.innerHTML=`<span class="realism-note__tag">REAL LIFE</span><span class="realism-note__label">현실에서는 이렇게 참고해보세요.</span><p>${p1}</p><p>${p2}</p>`;
      section.appendChild(note);
      section.dataset.realismEnhanced='true';
      added++;
    });
  }

  let tries=0;
  const timer=setInterval(()=>{
    enhance();
    tries++;
    if(tries>8)clearInterval(timer);
  },220);
  window.addEventListener('load',enhance,{once:true});
})();