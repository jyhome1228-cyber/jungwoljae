(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!file.endsWith('-result.html'))return;
  const escText=v=>String(v||'').replace(/\s+/g,' ').trim();

  function extraFor(title,text){
    const t=`${title} ${text}`;
    if(/생각|행동|성향|기질/.test(t))return '예를 들어 일을 받을 때 먼저 구조를 잡는지, 바로 실행하는지, 자료를 충분히 모은 뒤 움직이는지처럼 반복되는 행동을 돌아보면 이 성향을 현실에서 확인하기 쉽습니다. 중요한 결정은 감정이나 분위기보다 본인이 반복해서 쓰는 판단 기준을 적어보는 것이 도움이 됩니다.';
    if(/일|직업|업무|성과|학업|커리어/.test(t))return '현실에서는 제안서·보고서·포트폴리오·고객 응대 기록처럼 결과가 남는 일을 꾸준히 쌓는 것이 중요합니다. 이직이나 역할 변경을 고민할 때도 막연한 기대보다 연봉, 업무시간, 성장 가능성, 생활 안정성처럼 비교 기준을 먼저 적어두는 편이 좋습니다.';
    if(/재물|돈|수입|소비|축적/.test(t))return '재물은 운의 좋고 나쁨보다 관리 방식에서 차이가 크게 납니다. 월 고정비, 프로젝트별 순수익, 카드·구독 지출, 저축액처럼 실제 숫자를 한 화면에 모아보면 자신의 소비와 축적 패턴을 더 정확히 확인할 수 있습니다.';
    if(/사람|관계|인연|연애|감정/.test(t))return '관계에서는 답장 속도나 말투처럼 해석이 필요한 신호보다 약속을 지키는지, 불편한 상황에서 대화가 되는지, 서로의 생활 리듬을 존중하는지를 기준으로 보는 편이 현실적입니다. 같은 문제가 반복되면 상대의 성격만 보기보다 내가 늘 참는지, 재촉하는지, 말을 미루는지도 함께 살펴보세요.';
    if(/거리|갈등|경계/.test(t))return '실제로는 연락 빈도, 혼자 보내는 시간, 주말 일정, 돈을 쓰는 방식처럼 생활 기준에서 차이가 갈등으로 나타나기 쉽습니다. 불편함이 커진 뒤 한 번에 말하기보다 작은 기준부터 미리 합의하는 편이 관계를 오래 유지하는 데 도움이 됩니다.';
    if(/표현|식신|상관|식상/.test(t))return '글, 영상, 디자인, 발표, 강의, SNS, 포트폴리오처럼 생각을 결과물로 밖에 보여주는 활동을 꾸준히 해보세요. 완벽하게 준비된 뒤 공개하려 하기보다 작은 단위로 자주 기록하고 보여주는 편이 실제 기회와 피드백을 얻는 데 유리합니다.';
    if(/인성|정인|편인|학습|연구/.test(t))return '자격 공부, 리서치, 문서화, 업무 노트처럼 배운 것을 다시 꺼내 쓸 수 있는 형태로 쌓는 것이 좋습니다. 공부만 늘리고 실행을 미루기보다 일정 주기마다 글·자료·프로젝트 결과로 정리해보세요.';
    if(/비겁|비견|겁재|협업|독립/.test(t))return '동료·파트너·프리랜서 협업에서는 친분보다 역할, 비용, 마감, 책임 범위를 먼저 정하는 것이 중요합니다. 경쟁이 많은 환경에서는 다른 사람을 따라가기보다 자신의 전문 영역과 결과물을 분명하게 만드는 편이 도움이 됩니다.';
    if(/관성|정관|편관|조직|책임/.test(t))return '직장에서는 역할, 평가 기준, 마감, 책임 범위가 분명할수록 장점이 잘 드러날 수 있습니다. 반대로 책임만 늘고 권한이 없는 상황은 피로가 커질 수 있으니 업무를 받을 때 기대 결과와 결정 권한을 함께 확인해보세요.';
    if(/재성|정재|편재/.test(t))return '가격을 정하고 견적을 비교하거나, 고객·매출·예산·현금흐름을 관리하는 장면에서 이 기운을 현실적으로 확인할 수 있습니다. 수입이 늘어도 지출 구조가 함께 커지지 않는지 월 단위로 점검하는 것이 중요합니다.';
    if(/목|木/.test(t))return '새 프로젝트, 공부, 이직 준비처럼 시작이 필요한 일에서 힘이 드러날 수 있습니다. 시작만 늘어나지 않도록 각 일마다 종료 조건과 마감일을 함께 정해두세요.';
    if(/화|火/.test(t))return '발표, 영업, SNS·블로그·유튜브, 디자인·콘텐츠 공개처럼 자신을 밖으로 보여주는 활동에서 장점이 드러날 수 있습니다. 반응이 빠른 만큼 공개나 전송 전에는 한 번 더 검토하는 습관이 필요합니다.';
    if(/토|土/.test(t))return '일정, 예산, 문서, 반복 업무를 체계화하는 데 강점이 나타날 수 있습니다. 익숙한 방식만 오래 유지하지 않도록 정기적으로 유지할 것과 버릴 것을 다시 정리해보세요.';
    if(/금|金/.test(t))return '계약 조건, 견적, 품질 검수, 우선순위처럼 무엇을 선택하고 버릴지 정하는 상황에서 강점이 드러날 수 있습니다. 완벽함 때문에 실행이 늦어지지 않도록 결정 기준을 몇 가지로 제한하는 것이 좋습니다.';
    if(/수|水/.test(t))return '자료 조사, 글쓰기, 기획, 분석, 기록처럼 정보를 모아 판단 근거로 만드는 활동과 잘 연결됩니다. 조사 시간이 길어지면 실행이 늦어질 수 있으니 조사 마감과 실행 시작일을 따로 정해보세요.';
    return '';
  }

  function enhanceCards(){
    const root=document.querySelector('main');if(!root)return;
    const selectors=[
      '.life-grid > *','.ten-god-grid > *','.summary-grid > *','.element-cards > *','.key-grid > *',
      '.fortune-grid > *','.fortune-key-grid > *','.relationship-core-grid > *','.relationship-condition-grid > *',
      '.work-core-grid > *','.money-grid > *','.work-guide-grid > *','.focus-result-grid > *'
    ];
    root.querySelectorAll(selectors.join(',')).forEach(card=>{
      if(card.dataset.realDetail==='true')return;
      const p=card.querySelector('p');if(!p)return;
      const title=escText(card.querySelector('h3,strong')?.textContent);
      const body=escText(p.textContent);
      if(!title||body.length>300)return;
      const extra=extraFor(title,body);
      if(!extra)return;
      p.textContent=`${body} ${extra}`;
      card.dataset.realDetail='true';
    });
  }

  let tries=0;
  const timer=setInterval(()=>{enhanceCards();if(++tries>8)clearInterval(timer);},240);
  window.addEventListener('load',enhanceCards,{once:true});
})();