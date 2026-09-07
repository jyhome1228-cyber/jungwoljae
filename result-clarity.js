(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!file.endsWith('-result.html'))return;

  const cleanup=()=>document.querySelectorAll('.realism-note').forEach(node=>node.remove());
  cleanup();

  const easyReplace=(text='')=>String(text)
    .replaceAll('명식에서는','사주 전체 구조에서는')
    .replaceAll('명식에서','사주 전체 구조에서')
    .replaceAll('명식 안에서','사주 전체 구조에서')
    .replaceAll('작용이 상대적으로 강하고','성향이 비교적 자주 드러나고')
    .replaceAll('작용이 강하게','성향이 강하게')
    .replaceAll('작용이','성향이')
    .replaceAll('의식적으로 보완할 부분','조금 더 신경 써야 할 부분')
    .replaceAll('보완할 부분','신경 써야 할 부분');

  function simplifyVisibleCopy(root){
    root.querySelectorAll('p').forEach(p=>{
      if(p.closest('.relationship-evidence-content,.fortune-evidence-content,.work-evidence-content,.evidence-content'))return;
      p.textContent=easyReplace(p.textContent);
    });
  }

  const relationByElement={
    목:{
      core:'호감이 생기면 관계를 앞으로 움직여보고 싶은 마음이 비교적 빨리 생길 수 있습니다. 연락을 먼저 하거나 다음 약속을 잡는 데 망설임이 적은 편이지만, 상대가 아직 천천히 보고 있는 단계라면 속도 차이가 생길 수 있습니다.',
      close:'가까워진 뒤에도 함께 새로운 경험을 하거나 관계가 조금씩 발전하고 있다는 느낌이 있을 때 만족도가 높습니다. 매번 같은 데이트와 같은 대화만 반복되면 답답함을 느낄 수 있습니다.',
      strength:'새로운 사람과 대화를 시작하거나 어색한 분위기를 먼저 풀어가는 데 강점이 있습니다. 소개팅이나 썸 초반에는 너무 먼 미래를 먼저 정하기보다, 한 번 더 만나보고 싶은지 정도만 확인하는 편이 잘 맞습니다.',
      balance:'관계를 빨리 진전시키려다 상대의 속도를 놓치지 않는 것이 중요합니다. 답장이 늦거나 반응이 약한 날에도 곧바로 관심이 없다고 판단하지 말고, 며칠의 흐름과 실제 행동을 같이 보세요.'
    },
    화:{
      core:'좋아하는 마음이 생기면 말투, 연락 빈도, 표정처럼 감정이 비교적 겉으로 드러나는 편입니다. 상대의 반응도 빨리 확인하고 싶어질 수 있어 답장이 늦거나 표현이 적으면 생각보다 크게 신경 쓰일 수 있습니다.',
      close:'애정 표현이 오가고 서로의 반응이 분명한 관계에서 안정감을 느끼기 쉽습니다. 표현이 거의 없는 사람과 만나면 실제 마음보다 내가 덜 사랑받고 있다고 느낄 수 있습니다.',
      strength:'분위기를 따뜻하게 만들고 먼저 표현하는 힘이 있습니다. 고마운 일은 바로 말하고, 보고 싶을 때 약속을 구체적으로 잡는 식의 표현이 관계를 자연스럽게 이어주는 데 도움이 됩니다.',
      balance:'감정이 올라온 순간 바로 결론을 내리면 말이 세질 수 있습니다. 서운한 일이 생겼을 때는 메시지를 길게 보내기보다 무엇이 서운했는지 한두 문장으로 정리한 뒤 이야기하는 편이 좋습니다.'
    },
    토:{
      core:'연락이 일정하고 약속을 지키는 사람, 말과 행동이 크게 다르지 않은 사람에게 안정감을 느끼기 쉽습니다. 한 번 마음을 주면 오래 보려는 편이라 관계가 불편해져도 쉽게 정리하지 못하고 참는 시간이 길어질 수 있습니다.',
      close:'가까워질수록 화려한 이벤트보다 주말을 어떻게 보내는지, 약속 시간을 지키는지, 생활 리듬이 맞는지가 더 중요해질 수 있습니다. 일상에서 믿을 만하다고 느껴야 마음도 편해지는 편입니다.',
      strength:'관계를 꾸준히 이어가고 상대를 챙기는 데 강점이 있습니다. 기념일이나 거창한 표현보다 정해진 연락, 약속 지키기, 필요할 때 옆에 있어주는 행동으로 신뢰를 만드는 방식이 잘 맞습니다.',
      balance:'참을 수 있다고 계속 넘기면 어느 순간 마음이 크게 식거나 한꺼번에 터질 수 있습니다. 연락 문제, 돈 쓰는 방식, 약속 시간처럼 반복해서 불편한 부분은 작을 때 말해두는 편이 좋습니다.'
    },
    금:{
      core:'관계를 시작할 때 예의, 약속, 말의 무게처럼 분명한 기준을 중요하게 보는 편입니다. 좋아해도 상대가 선을 넘거나 말을 자주 바꾸면 감정과 별개로 신뢰가 빨리 떨어질 수 있습니다.',
      close:'가까운 사이여도 각자의 시간과 영역이 존중될 때 편합니다. 휴대폰을 계속 확인하거나 일정을 모두 공유해야 안심되는 관계보다는, 믿고 각자 시간을 보낼 수 있는 관계가 더 오래가기 쉽습니다.',
      strength:'관계에서 필요한 선을 분명하게 세우고 약속을 지키는 힘이 있습니다. 애매한 관계가 오래 이어진다면 기다리는 기간이나 내가 원하는 관계 형태를 스스로 정해두는 것이 도움이 됩니다.',
      balance:'갈등이 생기면 누가 맞는지부터 정리하려는 마음이 앞설 수 있습니다. 상대가 원하는 것이 해결책인지, 먼저 감정을 이해해주는 것인지 구분해서 대화하면 불필요한 충돌을 줄일 수 있습니다.'
    },
    수:{
      core:'호감이 생겨도 바로 확신하기보다 상대의 말투, 연락 패턴, 약속을 지키는지 등을 오래 살펴보는 편입니다. 처음에는 마음이 없는 것처럼 보일 수 있지만, 실제로는 판단하기 전에 충분히 관찰하는 시간이 필요한 경우가 많습니다.',
      close:'가까워질수록 혼자 생각할 시간과 부담 없이 말할 수 있는 분위기가 중요합니다. 계속 답을 요구하거나 감정 확인을 재촉하는 관계에서는 좋아하는 마음이 있어도 피로가 먼저 커질 수 있습니다.',
      strength:'상대의 기분 변화나 관계의 미묘한 분위기를 잘 알아차리는 편입니다. 다만 추측만 길어지지 않도록 중요한 부분은 직접 묻고, 실제로 들은 말과 행동을 기준으로 판단하는 것이 좋습니다.',
      balance:'생각을 오래 하다 보면 말할 타이밍을 놓치기 쉽습니다. 서운함이나 궁금한 점을 머릿속에서 며칠씩 키우기보다, 짧게라도 그날그날 확인하는 편이 관계를 훨씬 편하게 만듭니다.'
    }
  };

  function extractElement(text=''){
    const t=String(text);
    return ['목','화','토','금','수'].find(k=>t.includes(k))||null;
  }

  function fixRelationship(){
    const root=document.querySelector('[data-relationship-result]');
    if(!root)return;

    // Remove any cached/generic work-study examples that do not belong in an
    // interpretation of love/relationships.
    root.querySelectorAll('p').forEach(p=>{
      const t=p.textContent||'';
      if(/자료 조사|글쓰기|기획|분석|아카이브|포트폴리오|업무 기록/.test(t) && p.closest('.relationship-core-card,.relationship-report')){
        p.remove();
      }
    });

    const cards=[...root.querySelectorAll('.relationship-core-card')];
    cards.forEach((card,index)=>{
      const value=card.querySelector('strong')?.textContent||'';
      const element=extractElement(value);
      const copy=relationByElement[element];
      const p=card.querySelector('p');
      if(!copy||!p)return;
      p.textContent=index===0?copy.core:index===1?copy.close:index===2?copy.strength:copy.balance;
    });

    simplifyVisibleCopy(root);

    const total=root.querySelector('[data-total-summary]');
    if(total){
      total.querySelectorAll('p').forEach(p=>{p.textContent=easyReplace(p.textContent);});
    }
  }

  function fixOtherReports(){
    const roots=[
      document.querySelector('[data-saju-result]'),
      document.querySelector('[data-ohaeng-result]'),
      document.querySelector('[data-fortune-result]'),
      document.querySelector('[data-work-result]'),
      document.querySelector('[data-compatibility-result]')
    ].filter(Boolean);
    roots.forEach(simplifyVisibleCopy);
  }

  function run(){
    cleanup();
    if(file==='relationship-result.html')fixRelationship();
    else fixOtherReports();
  }

  requestAnimationFrame(()=>requestAnimationFrame(run));
  setTimeout(run,180);
  setTimeout(run,500);
})();
