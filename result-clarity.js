(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!file.endsWith('-result.html'))return;

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

  const $=(s,root=document)=>root.querySelector(s);
  const $all=(s,root=document)=>[...root.querySelectorAll(s)];
  const text=node=>(node?.textContent||'').replace(/\s+/g,' ').trim();
  const set=(s,value,root=document)=>{const n=$(s,root);if(n&&value)n.textContent=value;};
  const paragraphs=(node,list)=>{if(node&&list?.length)node.innerHTML=list.map(v=>`<p>${v}</p>`).join('');};
  const elementOf=value=>['목','화','토','금','수'].find(k=>String(value||'').includes(k))||null;
  const godOf=value=>{
    const t=String(value||'');
    if(/비견|겁재|비겁/.test(t))return '비겁';
    if(/식신|상관|식상/.test(t))return '식상';
    if(/편재|정재|재성/.test(t))return '재성';
    if(/편관|정관|관성/.test(t))return '관성';
    if(/편인|정인|인성/.test(t))return '인성';
    return null;
  };
  const cleanup=()=>{
    $all('.realism-note').forEach(n=>n.remove());
    $all('p').forEach(p=>{
      if(/자료 조사, 글쓰기, 기획, 분석, 기록, 아카이브/.test(text(p)))p.remove();
    });
  };
  cleanup();

  const element={
    목:{name:'목',person:'생각이 서면 오래 머뭇거리기보다 일단 시작해보는 편입니다. 새로운 사람, 새로운 일, 새로운 환경에서 에너지가 살아나기 쉽습니다.',risk:'다만 시작하는 힘에 비해 마무리나 반복 관리가 뒤로 밀릴 수 있습니다. 하고 싶은 일이 늘어날수록 지금 끝낼 일부터 정하는 습관이 필요합니다.',work:'새 프로젝트 제안, 공부 시작, 이직 준비처럼 첫발을 떼야 하는 일에 강점이 있습니다. 시작할 때 마감일과 완료 기준까지 같이 정하면 성과가 훨씬 안정적입니다.',money:'기회가 보이면 먼저 움직이려는 편이라 새로운 수입원이나 투자 아이디어에도 관심이 빨리 갈 수 있습니다. 가능성만 보지 말고 실제 비용과 회수 시점을 숫자로 확인하는 과정이 중요합니다.'},
    화:{name:'화',person:'생각과 감정이 밖으로 드러나는 편이고, 사람들과 반응을 주고받을 때 힘이 살아납니다. 내가 만든 것을 보여주거나 분위기를 움직이는 상황에 비교적 강합니다.',risk:'기분과 속도가 함께 올라가면 말이나 결정이 앞설 수 있습니다. 중요한 메시지, 공개, 결제, 계약은 한 번 더 확인하는 장치를 두는 편이 좋습니다.',work:'발표, 영업, 콘텐츠, 디자인, 영상, 교육처럼 결과를 밖으로 보여주는 일이 잘 맞을 수 있습니다. 완벽해질 때까지 숨기기보다 작은 결과물을 꾸준히 공개하는 편이 기회를 만들기 쉽습니다.',money:'기분이 좋거나 분위기가 올라갈 때 소비도 함께 커질 수 있습니다. 보여주기 위한 지출과 실제 필요한 지출을 나눠보면 돈 관리가 훨씬 쉬워집니다.'},
    토:{name:'토',person:'쉽게 방향을 바꾸기보다 익숙한 것을 꾸준히 유지하는 힘이 있습니다. 사람과 일 모두 한 번 맡으면 오래 책임지려는 편입니다.',risk:'버티는 힘이 강한 만큼 이미 불편해진 상황도 오래 끌 수 있습니다. 계속 유지할 이유가 있는지 주기적으로 다시 판단하는 것이 필요합니다.',work:'일정, 예산, 운영, 문서, 반복 업무처럼 흩어진 일을 정리하고 안정적으로 굴리는 데 강점이 있습니다. 체크리스트나 월간 계획처럼 반복 가능한 구조를 만들면 장점이 더 잘 살아납니다.',money:'한 번 기준을 세우면 꾸준히 관리하는 편이라 장기 저축이나 고정비 관리에 강점이 있습니다. 다만 익숙한 지출을 오래 방치하지 않도록 정기 구독과 반복 비용을 한 번씩 정리해보세요.'},
    금:{name:'금',person:'무엇이 맞는지, 어디까지 허용할지 기준을 세우는 힘이 분명한 편입니다. 복잡한 상황에서도 핵심을 골라내고 결론을 내리는 데 강점이 있습니다.',risk:'기준이 너무 높아지면 작은 오류에도 오래 머물거나 완벽하지 않으면 시작하지 못할 수 있습니다. 중요한 기준 몇 개만 충족하면 다음 단계로 넘어가는 연습이 필요합니다.',work:'견적 비교, 계약 검토, 품질 관리, 우선순위 정리처럼 선택과 판단이 필요한 일에서 강점이 드러날 수 있습니다. 결정 기준을 3개 안팎으로 줄이면 실행 속도도 좋아집니다.',money:'가격과 조건을 비교하고 손해를 줄이는 감각이 잘 쓰일 수 있습니다. 다만 지나치게 아끼거나 작은 차이에 시간을 많이 쓰지 않도록 금액 기준을 미리 정해두는 편이 좋습니다.'},
    수:{name:'수',person:'바로 결론을 내리기보다 먼저 보고 듣고 생각하는 편입니다. 작은 변화나 분위기를 잘 알아차리고 여러 가능성을 비교하는 힘이 있습니다.',risk:'생각이 길어지면 실행 시점을 놓치기 쉽습니다. 조사할 시간과 결정할 시간을 따로 정해두면 고민이 끝없이 늘어나는 것을 막을 수 있습니다.',work:'기획, 연구, 글쓰기, 분석, 상담처럼 정보를 모으고 연결해 판단하는 일에 강점이 있습니다. 다만 준비만 길어지지 않도록 조사 종료일과 결과물을 내는 날짜를 함께 잡는 편이 좋습니다.',money:'돈을 쓰기 전 비교하고 생각하는 편이지만 정보가 많아질수록 오히려 결정이 늦어질 수 있습니다. 큰 지출은 비교 기준을 미리 정하고 일정 기간 안에 결론을 내는 방식이 잘 맞습니다.'}
  };

  const daymaster={
    甲:'큰 방향을 먼저 세우고 꾸준히 밀어가는 힘이 있는 편입니다. 일을 맡으면 책임감을 갖고 끝까지 끌고 가려 하지만, 이미 정한 방향을 중간에 바꾸는 것은 부담스럽게 느낄 수 있습니다.',
    乙:'주변 상황을 읽고 가장 가능한 길을 찾아가는 편입니다. 사람과 상황에 맞춰 유연하게 움직이는 장점이 있지만, 선택지가 많아지면 결정을 미루거나 상대 반응을 지나치게 살필 수 있습니다.',
    丙:'에너지가 밖으로 잘 드러나고 사람이나 일을 움직이는 힘이 있는 편입니다. 표현과 실행이 빠르지만, 속도가 올라갈수록 세부를 놓치지 않도록 중간 점검이 필요합니다.',
    丁:'한 가지를 깊게 보고 섬세하게 다듬는 힘이 있습니다. 감정과 완성도에 민감해 작은 차이도 잘 보지만, 마음에 들지 않는 부분을 오래 붙잡고 있을 수 있습니다.',
    戊:'쉽게 흔들리지 않고 중심을 잡는 편입니다. 여러 일을 한꺼번에 받아 정리하고 책임지는 힘이 있지만, 변화가 필요한 때에도 익숙한 방식을 오래 유지할 수 있습니다.',
    己:'작은 일을 세밀하게 관리하고 꾸준히 쌓는 힘이 있습니다. 실무와 조율에는 강하지만, 주변 요구를 계속 받아주다 보면 내 피로를 늦게 알아차릴 수 있습니다.',
    庚:'문제를 보면 빠르게 핵심을 찾고 결론을 내리려는 편입니다. 책임과 기준이 분명한 상황에서 강하지만, 나와 다른 속도나 방식을 답답하게 느낄 수 있습니다.',
    辛:'세부 기준이 분명하고 완성도를 높이는 데 강점이 있습니다. 작은 오류도 잘 잡아내지만, 충분히 잘한 결과도 계속 수정하다가 공개나 실행이 늦어질 수 있습니다.',
    壬:'큰 그림을 보고 여러 가능성을 연결하는 편입니다. 변화에 잘 적응하지만 하고 싶은 방향이 많아지면 집중력이 나뉠 수 있어 우선순위를 좁히는 일이 중요합니다.',
    癸:'작은 신호를 잘 읽고 오래 관찰하는 편입니다. 준비와 기록에는 강하지만 생각이 길어지면 실행 타이밍을 놓칠 수 있어 스스로 결정 기한을 정하는 것이 도움이 됩니다.'
  };

  const gods={
    비겁:'혼자 결정하기보다 동료·친구·파트너와 함께 움직일 때 힘이 생기는 편입니다. 대신 친분과 일의 경계가 흐려지면 역할이나 비용 문제로 피로해질 수 있으니 협업할 때는 책임 범위를 먼저 정하는 것이 좋습니다.',
    식상:'생각을 말, 글, 디자인, 영상, 발표, 결과물처럼 밖으로 표현할수록 장점이 살아나는 편입니다. 머릿속에서 완벽하게 만든 뒤 보여주기보다 작은 결과물을 자주 만들고 기록하는 습관이 실제 기회로 이어지기 쉽습니다.',
    재성:'현실적인 결과와 돈의 흐름을 중요하게 보는 편입니다. 견적, 가격, 매출, 고객 반응처럼 숫자로 확인되는 결과에서 동기가 생길 수 있으며, 수입이 늘 때 지출 구조도 같이 커지지 않는지 보는 습관이 중요합니다.',
    관성:'역할과 책임, 약속이 분명한 상황에서 힘을 잘 씁니다. 직장에서는 마감과 평가 기준이 명확할수록 안정적으로 성과를 내기 쉽지만, 책임만 늘고 결정 권한이 없는 환경에서는 피로가 커질 수 있습니다.',
    인성:'배우고 이해하고 정리한 뒤 움직이는 편입니다. 공부, 자격, 연구, 문서화처럼 지식을 쌓는 일에 강하지만 배우는 것만 늘리고 실행을 미루지 않도록 배운 내용을 실제 결과물로 남기는 과정이 필요합니다.'
  };

  function relationStatus(){
    return input.relationshipStatus==='dating'?'연애 중':input.relationshipStatus==='complicated'?'썸·관계 고민':input.relationshipStatus==='breakup'?'이별 후':'솔로';
  }

  function relationship(){
    const root=$('[data-relationship-result]');if(!root)return;
    const cards=$all('.relationship-core-card',root);
    const els=cards.map(c=>elementOf(text(c.querySelector('strong'))));
    const main=els[0]||'토',close=els[1]||main,strong=els[2]||main,weak=els[3]||main;
    const r={
      목:{core:'호감이 생기면 관계를 앞으로 움직여보고 싶은 마음이 비교적 빨리 생길 수 있습니다. 먼저 연락하거나 다음 약속을 잡는 데 망설임이 적지만, 상대가 천천히 보는 사람이라면 속도 차이가 생길 수 있습니다.',close:'함께 새로운 경험을 하거나 관계가 조금씩 발전하고 있다는 느낌이 있을 때 만족도가 높습니다. 같은 데이트와 같은 대화만 반복되면 답답함을 느낄 수 있습니다.'},
      화:{core:'좋아하는 마음이 생기면 연락 빈도나 말투, 표정에 감정이 비교적 잘 드러나는 편입니다. 상대 반응도 빨리 확인하고 싶어 답장이 늦거나 표현이 적으면 생각보다 크게 신경 쓰일 수 있습니다.',close:'애정 표현이 오가고 서로의 마음을 자주 확인할 수 있는 관계에서 편안함을 느끼기 쉽습니다. 표현이 거의 없는 상대와는 실제 마음보다 내가 덜 사랑받는다고 느낄 수 있습니다.'},
      토:{core:'연락이 일정하고 약속을 지키는 사람, 말과 행동이 크게 다르지 않은 사람에게 안정감을 느끼기 쉽습니다. 한 번 마음을 주면 오래 보려 해서 불편한 관계도 생각보다 오래 참고 있을 수 있습니다.',close:'화려한 이벤트보다 주말을 어떻게 보내는지, 약속 시간을 잘 지키는지, 생활 리듬이 맞는지가 중요합니다. 일상에서 믿을 만하다고 느껴야 마음도 편해지는 편입니다.'},
      금:{core:'관계를 시작할 때 예의, 약속, 말의 무게를 중요하게 봅니다. 좋아하는 마음이 있어도 상대가 선을 넘거나 말을 자주 바꾸면 신뢰가 빠르게 떨어질 수 있습니다.',close:'가까운 사이여도 각자의 시간과 영역을 존중받을 때 편합니다. 모든 일정을 공유하거나 계속 확인하는 관계보다 믿고 각자 시간을 보낼 수 있는 관계가 더 잘 맞습니다.'},
      수:{core:'호감이 생겨도 바로 확신하기보다 연락 패턴, 말투, 약속을 지키는지 등을 오래 살펴보는 편입니다. 처음에는 마음이 없는 것처럼 보일 수 있지만 실제로는 충분히 관찰하는 시간이 필요한 경우가 많습니다.',close:'가까워질수록 혼자 생각할 시간과 부담 없이 말할 수 있는 분위기가 필요합니다. 계속 답을 요구하거나 감정 확인을 재촉하면 좋아하는 마음이 있어도 피로가 먼저 커질 수 있습니다.'}
    };
    if(cards[0]?.querySelector('p'))cards[0].querySelector('p').textContent=r[main].core;
    if(cards[1]?.querySelector('p'))cards[1].querySelector('p').textContent=r[close].close;
    if(cards[2]?.querySelector('p'))cards[2].querySelector('p').textContent=`${element[strong].person} 연애에서는 상대의 표정과 말만 해석하기보다 실제 연락, 약속, 행동이 꾸준히 이어지는지를 함께 보는 편이 좋습니다.`;
    if(cards[3]?.querySelector('p'))cards[3].querySelector('p').textContent=`${element[weak].risk} 관계에서는 서운한 점이나 원하는 것을 상대가 알아주길 기다리기보다 짧게라도 직접 말하는 연습이 도움이 됩니다.`;

    paragraphs($('[data-emotion-text]',root),[
      r[main].core,
      main==='수'?'마음이 있어도 먼저 표현하지 않으면 상대는 확신하기 어렵습니다. 좋아한다는 큰 말이 부담스럽다면 먼저 연락하기, 약속을 구체적으로 잡기, 고마웠던 일을 바로 말하기처럼 작은 행동으로 표현해보세요.':'감정이 생겼을 때 상대가 알아서 눈치채길 기다리기보다, 내가 원하는 관계와 불편한 점을 짧게라도 말로 확인하는 편이 관계를 훨씬 편하게 만듭니다.'
    ]);
    paragraphs($('[data-distance-text]',root),[
      r[close].close,
      '연락 횟수, 혼자 보내는 시간, 주말 일정, 돈을 쓰는 방식처럼 생활 기준이 맞지 않으면 작은 차이도 반복될수록 갈등이 됩니다. 처음부터 모두 맞추려 하기보다 서로 꼭 필요한 기준 두세 가지만 먼저 합의하는 편이 좋습니다.'
    ]);
    $all('.relationship-condition-card',root).forEach((c,i)=>{
      const p=c.querySelector('p');if(!p)return;
      p.textContent=[
        '말을 예쁘게 하는 것보다 약속을 지키고 연락이 갑자기 끊기지 않는 사람이 더 편한 관계가 되기 쉽습니다.',
        '서로의 일과 혼자 보내는 시간을 존중하면서도 중요한 순간에는 피하지 않고 이야기할 수 있는 관계가 잘 맞습니다.',
        '갈등이 생겼을 때 누가 이겼는지보다 무엇이 서운했는지 확인하고 다음에는 어떻게 할지 합의할 수 있는 사람이 좋습니다.'
      ][i]||p.textContent;
    });
    paragraphs($('[data-pattern-text]',root),[
      `${element[main].person} 연애에서는 이 방식이 장점이 되지만 같은 반응을 반복하면 상대와 속도 차이가 커질 수 있습니다.`,
      main==='수'||main==='토'?'불편한 일이 있어도 바로 말하지 않고 혼자 정리하거나 참는 시간이 길어질 수 있습니다. 상대는 괜찮은 줄 알 수 있으니 같은 일이 두 번 반복되기 전에 한 번은 말해두는 편이 좋습니다.':'감정이 생긴 순간 바로 반응하거나 관계를 빨리 정하려는 마음이 생길 수 있습니다. 한 번의 답장이나 한 번의 다툼보다 며칠 동안 반복되는 행동을 보고 판단하는 편이 좋습니다.',
      '좋은 인연은 내 부족한 부분을 대신 해결해주는 사람보다, 연락·약속·감정 표현 방식의 차이를 서로 설명하고 조절할 수 있는 사람에 가깝습니다.'
    ]);
    const status=$('[data-status-result]',root);
    if(status)$all('.relationship-status-box',status).forEach((b,i)=>{const p=b.querySelector('p');if(!p)return;const s=relationStatus();p.textContent=s==='솔로'?(i===0?'새 사람을 만날 때 첫인상보다 두세 번 만났을 때 연락과 약속이 안정적으로 이어지는지 보세요. 강한 끌림보다 일상에서 편한 사람이 오래가기 쉽습니다.':'호감이 생겨도 너무 오래 관찰만 하지 말고, 다시 만나고 싶다면 먼저 짧게 약속을 제안해보는 것이 좋습니다.') : s==='연애 중'?(i===0?'익숙해졌다고 설명을 줄이면 오해가 쌓이기 쉽습니다. 연락 빈도, 주말 일정, 돈 쓰는 방식처럼 자주 부딪히는 생활 기준부터 말로 맞춰보세요.':'갈등이 생겼을 때 오래 잠수하거나 한꺼번에 쏟아내기보다 그날 가장 불편했던 한 가지부터 이야기하는 편이 좋습니다.') : s==='썸·관계 고민'?(i===0?'상대의 말투와 답장 속도를 계속 해석하기보다 실제로 약속을 잡는지, 먼저 연락하는지, 관계를 이어가기 위해 행동하는지를 보세요.':'기다릴 수 있는 기간과 내가 원하는 관계 형태를 스스로 정해두면 애매한 관계에 너무 오래 머무는 것을 줄일 수 있습니다.') : (i===0?'이전 관계의 결과보다 내가 반복해서 참았던 것, 말하지 못했던 것, 상대에게 기대했던 것을 먼저 정리해보세요.':'다음에는 이전 사람과 정반대인 사람을 찾기보다 내가 편하게 유지할 수 있는 연락·약속·거리감의 기준을 정하는 것이 더 중요합니다.');});
    const year=$('[data-year-text]',root);if(year){const old=text(year);const tone=/충/.test(old)?'올해는 관계에서 속도 차이나 방향 변화가 크게 느껴질 수 있습니다. 갑작스러운 결론보다 서로 달라진 점을 먼저 확인하는 것이 중요합니다.':/합|육합/.test(old)?'올해는 새로운 만남이나 기존 관계의 접점이 자연스럽게 생기기 쉬운 편입니다. 다만 인연이 생긴다는 말보다 실제 연락과 약속이 꾸준히 이어지는지를 보는 것이 더 중요합니다.':'올해는 누가 반드시 나타난다기보다 내가 어떤 사람을 선택하고 어떤 관계는 정리할지 기준을 세우는 일이 중요한 시기입니다.';paragraphs(year,[tone,'새로운 사람이 있다면 첫인상보다 몇 번 만난 뒤의 태도를 보고, 현재 관계가 있다면 익숙함 때문에 설명을 줄이고 있지는 않은지 살펴보세요.']);}
    $all('.relationship-guide-card',root).forEach((c,i)=>{const p=c.querySelector('p');if(!p)return;p.textContent=[
      '좋아하는 마음을 상대가 알아서 눈치채길 기다리지 말고, 먼저 연락하기나 다음 약속 잡기처럼 작은 행동으로 표현해보세요.',
      '다툼이 생기면 누가 맞는지 정하기 전에 무엇이 서운했는지 한 가지씩 확인하세요. 감정이 큰 날에는 결론을 하루 미뤄도 괜찮습니다.',
      '끌림이 강해도 약속을 자주 바꾸거나 연락이 반복해서 끊긴다면 관계의 안정성을 다시 보는 편이 좋습니다.',
      '상대에게 맞추느라 내 생활이 계속 무너지지 않는지 보세요. 좋은 관계는 각자의 일과 혼자 있는 시간도 지켜줄 수 있어야 합니다.'
    ][i]||p.textContent;});
    paragraphs($('[data-total-summary]',root),[
      `${input.name||'회원'}님은 관계에서 ${element[main].person.replace('편입니다.','경향이 있습니다.')} 그래서 처음의 강한 감정보다 시간이 지나도 말과 행동이 꾸준한지를 보는 것이 중요합니다.`,
      `특히 ${element[weak].risk} 연애에서는 이 부분이 연락, 갈등, 거리 조절에서 반복될 수 있으므로 불편함을 오래 쌓아두거나 한 번의 반응만으로 결론 내리지 않는 것이 좋습니다.`,
      '정월재가 보는 좋은 인연은 나와 똑같은 사람이 아니라 서로 다른 표현 방식과 생활 속도를 설명하고 맞춰갈 수 있는 사람입니다. 마음이 있다면 표현하고, 불편하면 작을 때 말하는 것이 가장 현실적인 기준입니다.'
    ]);
  }

  function saju(){
    const root=$('[data-saju-result]');if(!root)return;
    const symbol=text($('[data-daymaster-symbol]',root));
    const summaryCards=$all('.summary-grid > *',root);
    const strong=elementOf(text(summaryCards[1]))||elementOf(text(root))||'토';
    const weak=elementOf(text(summaryCards[2]))||'수';
    set('[data-daymaster-text]',daymaster[symbol]||text($('[data-daymaster-text]',root)),root);
    set('[data-summary]',`${input.name||'회원'}님은 ${daymaster[symbol]||'자기 방식이 비교적 분명한 편입니다.'} 사주 전체에서는 ${strong}의 성향이 자주 드러나고, ${weak}의 역할은 생활에서 조금 더 챙기면 좋은 부분입니다.`,root);
    set('[data-balance-copy]',`${element[strong].person} 반대로 ${element[weak].risk} 실제 생활에서는 잘하는 방식을 더 밀어붙이기보다 부족한 부분을 일정, 대화, 기록 같은 습관으로 보완하는 것이 더 현실적입니다.`,root);
    $all('.ten-god-card',root).forEach(c=>{const g=godOf(text(c));const p=c.querySelector('p');if(g&&p)p.textContent=gods[g];});
    const active=$all('.ten-god-card.active',root).sort((a,b)=>Number(text(b.querySelector('strong')).replace(/\D/g,''))-Number(text(a.querySelector('strong')).replace(/\D/g,'')))[0];
    const dominant=godOf(text(active))||'인성';
    set('[data-ten-god-summary]',`지금 보이는 십성 중에서는 ${dominant}의 성향을 눈여겨볼 수 있습니다. 쉽게 말하면 ${gods[dominant]} 이 설명이 실제 생활에서 반복되는지 확인해보는 것이 좋습니다.`,root);
    $all('.life-card',root).forEach((c,i)=>{const p=c.querySelector('p');if(!p)return;const title=text(c.querySelector('h3'));p.textContent=/생각|행동/.test(title)?`${element[strong].person} 중요한 선택에서는 생각만 길어지거나 반대로 너무 빨리 움직이지 않도록 결정 기한과 기준을 적어두는 편이 좋습니다.`:/일|직업/.test(title)?`${element[strong].work} ${gods[dominant]}`:/재물|돈/.test(title)?`${element[strong].money} 월 고정비와 수입원별 순수익처럼 실제 숫자를 기록하면 재물 성향을 훨씬 정확하게 관리할 수 있습니다.`:/관계|사람/.test(title)?'사람 관계에서는 내 방식이 상대에게도 당연하다고 생각하지 않는 것이 중요합니다. 연락, 약속, 역할처럼 반복해서 부딪히는 기준은 감정이 커지기 전에 말로 정해두는 편이 좋습니다.':p.textContent;});
    $all('.year-card',root).forEach(c=>{const p=c.querySelector('p'),g=godOf(text(c));if(!p)return;const rel=text(c.querySelector('strong'));p.textContent=/충/.test(rel)?'이 시기에는 기존 일정이나 역할이 흔들리거나 바뀌는 일이 생길 수 있습니다. 변화 자체를 나쁘게 보기보다 이직, 이동, 관계 변화처럼 실제로 달라진 조건을 하나씩 확인하고 큰 결정은 준비 기간을 두세요.':/합|육합/.test(rel)?'사람이나 기회가 연결되기 쉬운 시기지만 들어오는 제안을 모두 잡을 필요는 없습니다. 실제 시간, 비용, 책임 범위를 확인한 뒤 오래 이어갈 수 있는 것에 힘을 쓰는 편이 좋습니다.':g?`이 시기에는 ${g}의 주제가 눈에 띌 수 있습니다. 현실에서는 ${gods[g]} 한 번에 큰 변화를 기대하기보다 이 주제가 실제 생활에서 어떻게 반복되는지 보는 편이 좋습니다.`:'큰 사건을 기다리기보다 지금 하고 있는 일과 관계에서 무엇을 유지하고 무엇을 바꿀지 정하는 시기로 활용하는 편이 좋습니다.';});
    $all('.focus-reading-card',root).forEach(c=>{const p=c.querySelector('p');if(!p)return;const t=text(c.querySelector('h3'));p.textContent=/직업|일/.test(t)?`${element[strong].work} 잘 맞는 직업명 하나를 찾기보다 내가 성과를 내는 방식과 피로해지는 환경을 구분하는 것이 더 중요합니다.`:/재물/.test(t)?`${element[strong].money} 재물운을 기다리기보다 월 고정비, 저축, 프로젝트별 수익을 기록해 돈이 실제로 남는 구조를 만드는 편이 좋습니다.`:/연애|인연/.test(t)?'연애에서는 감정의 크기보다 연락과 약속이 꾸준한지, 갈등이 생겼을 때 대화가 가능한지를 보세요. 좋은 인연은 서로 다른 방식을 설명하고 조절할 수 있는 관계에 가깝습니다.':/변화|이동|앞으로/.test(t)?'변화를 고민할 때는 막연히 좋은 시기를 기다리기보다 비용, 준비 기간, 얻는 것과 잃는 것을 적어보세요. 사주의 흐름은 결정을 대신하기보다 준비할 시점을 정하는 참고로 쓰는 편이 좋습니다.':`${element[strong].person} ${element[weak].risk}`;});
    paragraphs($('[data-summary-prose]',root),[
      `${input.name||'회원'}님은 ${daymaster[symbol]||'자기 방식이 분명한 편입니다.'} 잘하는 방식이 분명한 만큼 같은 방법만 반복하면 어느 순간 피로가 쌓일 수 있습니다.`,
      `현실에서는 ${element[strong].work} 반대로 ${element[weak].risk} 중요한 일일수록 잘하는 것과 부족한 것을 함께 고려하는 편이 안정적입니다.`,
      '사주를 가장 유용하게 쓰는 방법은 미래를 단정하는 것이 아니라 내가 반복해서 잘하는 행동과 자주 막히는 지점을 알아두는 것입니다. 일, 돈, 관계에서 같은 패턴이 반복될 때 이 결과를 선택 기준으로 활용해보세요.'
    ]);
  }

  function ohaeng(){
    const root=$('[data-ohaeng-result]');if(!root)return;
    const bars=$all('.element-bar',root);if(!bars.length)return;
    const strong=elementOf(text(bars[0]))||'토',weak=elementOf(text(bars.at(-1)))||'수';
    paragraphs($('[data-strong-text]',root),[element[strong].person,`현실에서는 ${element[strong].work}`]);
    paragraphs($('[data-weak-text]',root),[element[weak].risk,`부족하다는 뜻을 나쁘게 볼 필요는 없습니다. ${element[weak].work}처럼 이 역할이 필요한 상황에서 의식적으로 습관을 만들어두면 균형을 잡는 데 도움이 됩니다.`]);
    set('[data-flow-text]',`${strong}의 장점은 이미 자연스럽게 쓰고 있으므로 더 키우는 것보다 그 다음 단계가 끊기지 않는지가 중요합니다. 시작한 일을 끝내고, 표현한 것을 정리하고, 벌어들인 것을 남기는 식으로 생활의 연결을 만들어보세요.`,root);
    $all('.life-card',root).forEach(c=>{const p=c.querySelector('p');if(!p)return;const t=text(c.querySelector('h3'));p.textContent=/생각|행동/.test(t)?`${element[strong].person} ${element[weak].risk}`:/관계|사람/.test(t)?'사람 관계에서도 내가 편하게 쓰는 방식만 반복하면 상대와 속도 차이가 생길 수 있습니다. 상대가 다르게 반응할 때 틀렸다고 보기보다 설명이 필요한 차이라고 생각하는 편이 좋습니다.':/일|선택/.test(t)?`${element[strong].work} ${element[weak].risk}`:/돈|재물|생활/.test(t)?`${element[strong].money} ${element[weak].money}`:p.textContent;});
    paragraphs($('[data-total-summary]',root),[
      `${input.name||'회원'}님은 ${strong}의 성향을 비교적 자연스럽게 쓰는 편입니다. 쉽게 말하면 ${element[strong].person}`,
      `반대로 ${weak}의 역할은 조금 더 신경 쓰면 좋은 부분입니다. ${element[weak].risk} 이 점은 성격의 단점이라기보다 생활 습관으로 보완할 수 있는 부분입니다.`,
      '오행 결과는 어떤 기운이 많아서 좋다거나 적어서 나쁘다는 평가가 아닙니다. 내가 자동으로 잘하는 행동과 의식해야 하는 행동을 구분해 일, 관계, 돈 관리에서 실제 기준으로 사용하는 것이 가장 현실적인 활용법입니다.'
    ]);
  }

  function fortune(){
    const root=$('[data-fortune-result]');if(!root)return;
    const headline=text($('[data-headline]',root));
    const mode=/밀어도|꺼내도|실행/.test(headline)?'go':/점검|서두르지|확인/.test(headline)?'care':'steady';
    paragraphs($('[data-fortune-story]',root),[
      mode==='go'?'오늘은 이미 준비해둔 일을 실제 행동으로 옮기기 좋은 편입니다. 다만 새 일을 여러 개 시작하기보다 가장 중요한 한 가지를 끝까지 밀어보세요.':mode==='care'?'오늘은 빠르게 결론 내리기보다 확인하는 편이 유리합니다. 일정, 숫자, 약속처럼 나중에 되돌리기 어려운 부분을 한 번 더 보는 것이 좋습니다.':'오늘은 크게 밀거나 멈출 필요보다 하던 일을 정리하는 쪽이 잘 맞습니다. 새로운 선택보다 이미 시작한 일을 한 단계 마무리해보세요.',
      '운세는 무슨 사건이 생긴다는 예고보다 하루를 어떻게 쓰면 덜 흔들릴지 참고하는 용도로 보는 편이 좋습니다. 해야 할 일, 만날 사람, 쓸 돈 중 오늘 꼭 결정해야 하는 것만 먼저 골라보세요.'
    ]);
    $all('.fortune-card',root).forEach(c=>{const p=c.querySelector('p');if(!p)return;const t=text(c.querySelector('h3'));p.textContent=/일|학업/.test(t)?(mode==='go'?'미뤄둔 연락, 제안, 문서 중 하나를 오늘 실제로 끝내보세요. 새로운 일을 더 벌이기보다 결과가 남는 한 가지를 마무리하는 편이 좋습니다.':mode==='care'?'메일, 일정, 제출물, 계약 조건처럼 누락되기 쉬운 부분을 다시 확인하세요. 급한 답변보다 정확한 답변이 더 중요한 날입니다.':'진행 중인 일 하나를 끝내고 다음 순서를 정해두세요. 해야 할 일을 늘리기보다 미완료를 줄이는 편이 좋습니다.'):/재물|소비/.test(t)?'계획에 없던 큰 결제는 바로 결정하지 말고 필요성, 가격, 대체 가능성을 한 번 비교해보세요. 이미 예산이 정해진 필요한 지출까지 과하게 줄일 필요는 없습니다.':/사람|관계/.test(t)?'답장 속도나 짧은 말투 하나에 의미를 크게 붙이기보다 실제 약속과 행동을 보세요. 중요한 대화는 감정이 올라온 순간 결론 내리기보다 핵심 질문 한두 개로 정리해서 이야기하는 편이 좋습니다.':'집중이 필요한 시간과 쉬는 시간을 나눠보세요. 하루 초반에 힘을 많이 썼다면 후반에는 정리, 이동, 연락처럼 에너지 소모가 적은 일을 배치하는 편이 좋습니다.';});
    paragraphs($('[data-total-summary]',root),[
      mode==='go'?'오늘은 준비한 일을 밖으로 꺼내는 데 힘을 써도 좋은 날입니다. 단, 여러 방향보다 한 가지에 집중하는 것이 핵심입니다.':mode==='care'?'오늘은 속도보다 확인이 더 중요한 날입니다. 큰 결론을 미루라는 뜻보다, 한 번 더 보고 결정하면 실수를 줄일 수 있다는 쪽에 가깝습니다.':'오늘은 특별한 변화를 만들기보다 진행 중인 일을 정리하고 생활 리듬을 안정시키는 데 잘 맞는 날입니다.',
      '일에서는 한 가지를 끝내고, 돈에서는 계획 밖 지출을 한 번 더 보고, 관계에서는 추측보다 직접 확인해보세요. 이 세 가지만 지켜도 오늘의 흐름을 충분히 현실적으로 활용할 수 있습니다.'
    ]);
  }

  function work(){
    const root=$('[data-work-result]');if(!root)return;
    const cards=$all('[data-core-grid] > *',root);
    const strong=elementOf(text(cards[2]))||elementOf(text(root))||'토';
    const weak=elementOf(text(cards[3]))||'수';
    const dominant=godOf(text(cards[1]))||godOf(text(root))||'인성';
    cards.forEach((c,i)=>{const p=c.querySelector('p');if(!p)return;p.textContent=i===0?`${element[strong].person} 일에서는 내가 어떤 방식으로 성과를 내는지 먼저 아는 것이 직업명 하나를 맞히는 것보다 중요합니다.`:i===1?gods[dominant]:i===2?element[strong].work:`${element[weak].risk} 이 부분은 일정, 검토, 기록 같은 업무 습관으로 충분히 보완할 수 있습니다.`;});
    paragraphs($('[data-strength-text]',root),[`${element[strong].work}`,`${gods[dominant]} 지금 맡은 일에서도 이 방식으로 성과가 나는지 확인해보세요.`]);
    paragraphs($('[data-pressure-text]',root),[`${element[weak].risk}`,'일이 힘든 이유가 능력 부족이라기보다 역할이 모호하거나 책임과 권한이 맞지 않아서일 수도 있습니다. 업무를 받을 때 결과물, 마감, 결정권을 먼저 확인하는 편이 좋습니다.']);
    const org=$('[data-organization-text]',root);if(org){const old=text(org);paragraphs(org,[/독립|사업|프리랜/.test(old)?'혼자 결정하고 속도를 정할 수 있는 환경에서 장점이 살아날 수 있습니다. 다만 독립은 자유만 늘어나는 것이 아니라 영업, 정산, 일정 관리까지 직접 해야 하므로 수입 변동과 운영 부담을 함께 계산해야 합니다.':/조직/.test(old)?'역할과 책임이 분명한 조직에서는 안정적으로 성과를 내기 쉽습니다. 반대로 책임은 큰데 결정 권한이 없는 자리라면 피로가 빨리 쌓일 수 있으니 직급보다 실제 권한과 업무 범위를 확인해보세요.':'조직과 독립 중 하나가 무조건 맞는 구조라기보다 내 역할과 기준이 분명한 환경이 중요합니다. 이직이나 독립을 고민할 때 연봉, 업무시간, 결정권, 수입 안정성을 실제 숫자로 비교해보세요.']);}
    $all('[data-money-grid] > *',root).forEach(c=>{const p=c.querySelector('p');if(!p)return;const t=text(c.querySelector('h3,strong'));p.textContent=/벌|수입|성과/.test(t)?`${element[strong].money} 수입원별로 매출이 아니라 실제 남는 금액을 기록하면 어떤 일이 돈이 되는지 더 분명해집니다.`:/쓰|소비|지출/.test(t)?'돈을 쓰는 성향은 운보다 습관의 영향을 크게 받습니다. 고정비, 구독, 충동 지출을 나눠 한 달 단위로 보면 어디에서 돈이 새는지 확인하기 쉽습니다.':/남|축적|관리|저축/.test(t)?'저축은 남는 돈을 모으기보다 먼저 정해둔 금액을 떼어두는 방식이 안정적입니다. 수입이 들쭉날쭉하다면 최소 생활비와 비상자금을 먼저 기준으로 잡으세요.':'큰 투자나 사업 판단은 사주만으로 결정하지 말고 손실 가능성, 현금흐름, 회수 기간을 숫자로 확인하세요. 좋은 시기라는 말보다 감당 가능한 범위를 정하는 것이 우선입니다.';});
    $all('[data-year-grid] > *',root).forEach(c=>{const p=c.querySelector('p');if(!p)return;const g=godOf(text(c)),rel=text(c);p.textContent=/충/.test(rel)?'일이나 수입 구조가 바뀌고 싶은 마음이 커질 수 있는 시기입니다. 이직·독립을 바로 확정하기보다 필요한 자금, 준비 기간, 다음 수입원이 확보됐는지 먼저 확인하세요.':g?`${gods[g]} 이 시기에는 이 주제를 실제 일과 돈의 선택에서 점검해보는 편이 좋습니다.`:'큰 한 번의 기회보다 지금 하는 일에서 수익성과 피로도를 다시 보는 시기로 활용해보세요.';});
    $all('[data-focus-grid] > *',root).forEach(c=>{const p=c.querySelector('p');if(!p)return;const t=text(c.querySelector('h3,strong'));p.textContent=/사업|창업/.test(t)?'사업이나 독립은 적성보다 현금흐름이 먼저입니다. 최소 몇 달의 생활비, 고정비, 예상 매출, 고객을 어디서 만날지까지 적어본 뒤 판단하는 편이 좋습니다.':/이직|변화/.test(t)?'이직은 지금이 싫다는 이유보다 다음 환경에서 무엇이 달라져야 하는지 정하는 것이 중요합니다. 연봉, 업무시간, 역할, 성장 가능성을 표로 비교해보세요.':/재물|수입|축적/.test(t)?'재물은 들어오는 돈보다 남는 돈이 중요합니다. 월 고정비, 저축액, 프로젝트별 순수익을 기록해 실제로 돈이 쌓이는 구조를 만드는 데 초점을 두세요.':`${element[strong].work} 잘 맞는 직업명을 찾기보다 이런 방식으로 성과를 낼 수 있는 환경을 찾는 것이 더 현실적입니다.`;});
    $all('[data-guide-grid] > *',root).forEach((c,i)=>{const p=c.querySelector('p');if(p)p.textContent=[
      '새 일을 받을 때는 보수, 마감, 해야 할 범위 세 가지를 먼저 확인하세요. 애매한 일을 많이 받는 것보다 끝까지 책임질 수 있는 일을 고르는 편이 좋습니다.',
      '이직이나 독립은 기분이 가장 힘든 날 결정하지 말고 준비 기간과 필요한 돈을 계산한 뒤 움직이세요.',
      '매출이 늘어도 실제 남는 돈이 줄 수 있습니다. 월 단위로 고정비와 순수익을 같이 보는 습관이 필요합니다.',
      '잘하는 일을 계속하는 것과 오래 버틸 수 있는 방식은 다를 수 있습니다. 성과뿐 아니라 시간과 피로도도 함께 기록해보세요.'
    ][i]||p.textContent;});
    paragraphs($('[data-total-summary]',root),[
      `${input.name||'회원'}님은 일에서 ${element[strong].person} 현실적으로는 ${element[strong].work}`,
      `돈에서는 ${element[strong].money} 반대로 ${element[weak].risk} 그래서 수입과 지출, 업무시간을 감으로 기억하기보다 숫자와 기록으로 남기는 편이 좋습니다.`,
      '정월재의 일·재물 해석은 특정 직업이나 투자 결과를 맞히기보다 내가 어떤 환경에서 성과를 내고 어떤 패턴에서 돈과 에너지가 새는지를 찾는 데 초점을 둡니다. 이직, 사업, 큰 지출은 실제 조건과 손실 가능성을 함께 확인한 뒤 결정하세요.'
    ]);
  }

  function simpleCompatibility(){
    const root=$('[data-compatibility-result]');if(!root)return;
    $all('p',root).forEach(p=>{p.textContent=text(p).replaceAll('작용','성향').replaceAll('보완','맞춰가기').replaceAll('명식','사주');});
  }

  function run(){
    cleanup();
    if(file==='relationship-result.html')relationship();
    else if(file==='saju-result.html')saju();
    else if(file==='ohaeng-result.html')ohaeng();
    else if(file==='fortune-result.html')fortune();
    else if(file==='work-money-result.html')work();
    else simpleCompatibility();
  }

  requestAnimationFrame(()=>requestAnimationFrame(run));
  [180,500,1000,1600].forEach(ms=>setTimeout(run,ms));
})();
