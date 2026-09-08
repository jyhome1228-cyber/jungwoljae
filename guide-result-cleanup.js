(()=>{
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='guide-result.html')return;
  const root=document.querySelector('[data-guide-result]');
  if(!root)return;
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let input={};
  try{input=JSON.parse(sessionStorage.getItem('jungwoljae_guide_input')||'{}');}catch(e){}
  const domain=input.domain||'';
  const situation=input.situationLabel||'현재 상황';
  const blockers=Array.isArray(input.blockerLabels)?input.blockerLabels:[];
  const blockerText=blockers.length?blockers.join(' · '):'가장 걸리는 조건';

  const copy={
    work:{essence:`${situation}이라면, 지금 고민은 단순히 버틸지 그만둘지보다 “어떤 조건에서 더 오래 잘 일할 수 있나”를 정하는 문제에 가깝습니다.`,reality:`${blockerText}처럼 실제로 걸리는 조건을 연봉, 업무시간, 맡을 역할, 성장 가능성과 함께 한 표에 놓고 비교해보세요.`,answer:'완벽한 직장을 찾기보다 “이 조건이면 움직인다”는 기준을 먼저 정하면 결정이 훨씬 쉬워집니다.'},
    money:{essence:`${situation}이라면, 지금은 운보다 숫자를 먼저 보는 편이 좋습니다.`,reality:`${blockerText}을 막연히 걱정하지 말고 최근 3개월 수입·고정비·반복지출과 함께 확인해보세요.`,answer:'쓸 수 있는 금액, 잃어도 되는 금액, 결정할 날짜를 먼저 정하면 돈 문제의 불안이 줄어듭니다.'},
    love:{essence:`${situation}이라면, 상대의 마음을 계속 맞히려 하기보다 관계가 실제로 어떻게 이어지고 있는지를 보는 게 먼저입니다.`,reality:`${blockerText}을 볼 때는 한 번의 말보다 최근 몇 주 동안 연락, 약속, 배려가 꾸준했는지 확인해보세요.`,answer:'상대의 마음을 추측하기보다 내가 원하는 관계의 기준과 기다릴 수 있는 시간을 먼저 정하는 편이 좋습니다.'},
    people:{essence:`${situation}이라면, 관계를 당장 끊을지 말지보다 어디까지 허용할지를 정하는 게 먼저입니다.`,reality:`${blockerText} 때문에 힘들다면 같은 불편함이 반복되는지, 말했을 때 상대가 조정하려는지를 확인해보세요.`,answer:'한 번에 관계를 정리하기보다 작은 선부터 말하고, 그래도 달라지지 않으면 거리를 조절하는 순서가 현실적입니다.'},
    change:{essence:`${situation}이라면, 기대감보다 실제로 바뀌는 조건을 먼저 보는 편이 좋습니다.`,reality:`${blockerText}과 함께 비용, 준비기간, 생활 안정, 되돌아올 선택지가 있는지를 확인해보세요.`,answer:'큰 결정을 한 번에 내리기보다 작게 시험해볼 방법이 있다면 먼저 확인한 뒤 움직이는 편이 안전합니다.'},
    mind:{essence:`${situation}이라면, 모든 문제를 한꺼번에 해결하려 하기보다 지금 가장 힘든 한 가지부터 분리해서 보는 게 좋습니다.`,reality:`${blockerText}이 크게 느껴질수록 수면, 식사, 일정, 해야 할 일의 양처럼 당장 손댈 수 있는 것부터 확인해보세요.`,answer:'생각을 더 늘리기보다 오늘 하나만 줄이고, 하나만 끝내는 방식으로 리듬을 다시 잡아보세요.'},
    choice:{essence:`${situation}이라면, 정답이 없어서 못 고르는 게 아니라 기준이 서로 섞여 있어서 결정이 길어질 수 있습니다.`,reality:`${blockerText}을 포함해 꼭 필요한 조건 3개와 감수할 수 있는 단점 2개를 따로 적어보세요.`,answer:'모든 조건이 좋은 선택보다 내 기준에 더 맞는 선택을 고르고, 결정 날짜까지 정하는 편이 좋습니다.'}
  };
  const c=copy[domain]||{essence:'지금 고민은 결론보다 판단 기준을 먼저 정하면 훨씬 단순해질 수 있습니다.',reality:`${blockerText} 중 무엇이 사실이고 무엇이 걱정인지 나눠 적어보세요.`,answer:'오늘 확인할 수 있는 조건부터 하나씩 확인한 뒤 결정해보세요.'};

  root.querySelectorAll('[data-practical-v4]').forEach(n=>n.remove());
  root.querySelectorAll('p,h1,h2,h3,strong,span').forEach(n=>{
    if(n.closest('.guide-evidence-content'))return;
    n.textContent=(n.textContent||'')
      .replaceAll('지판단하고 정리하는 힘','지금')
      .replaceAll('조판단하고 정리하는 힘','조금')
      .replaceAll('방판단하고 정리하는 힘','방금')
      .replaceAll('…','');
  });

  const problem=root.querySelector('.guide-problem-box')?.closest('.guide-report');
  if(!problem||root.querySelector('[data-guide-clean-summary]'))return;
  const section=document.createElement('section');
  section.className='practical-section is-soft';
  section.dataset.guideCleanSummary='true';
  section.innerHTML=`
    <div class="practical-head"><div><span class="practical-kicker">먼저 이것부터</span><h2>이 고민, 세 줄로 먼저 보면 이렇습니다.</h2></div><p>긴 설명 전에 핵심만 짧고 쉽게 정리했습니다.</p></div>
    <div class="practical-grid three">
      <article class="practical-card"><small>지금 고민의 핵심</small><h3>${esc(situation)}</h3><p>${esc(c.essence)}</p></article>
      <article class="practical-card"><small>먼저 확인할 것</small><h3>${esc(blockerText)}</h3><p>${esc(c.reality)}</p></article>
      <article class="practical-card"><small>정월재의 답</small><h3>결론보다 기준을 먼저</h3><p>${esc(c.answer)}</p></article>
    </div>`;
  problem.insertAdjacentElement('afterend',section);
})();