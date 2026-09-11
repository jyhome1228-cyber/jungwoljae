(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!['fortune-result.html','work-money-result.html'].includes(file))return;
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const text=node=>String(node?.textContent||'').replace(/\s+/g,' ').trim();

  function injectStyle(){
    if(document.getElementById('directive-results-v16-style'))return;
    const style=document.createElement('style');
    style.id='directive-results-v16-style';
    style.textContent=`
      .directive-summary-list{display:grid!important;gap:0!important;margin-top:18px!important}
      .directive-summary-row{display:grid!important;grid-template-columns:128px minmax(0,1fr)!important;gap:22px!important;align-items:start!important;padding:18px 0!important;border-top:1px solid rgba(84,58,58,.14)!important}
      .directive-summary-row:first-child{border-top:0!important;padding-top:0!important}.directive-summary-row:last-child{padding-bottom:0!important}
      .directive-summary-row strong{display:block!important;margin:0!important;font-size:12px!important;line-height:20px!important;font-weight:800!important}
      .directive-summary-row p{margin:0!important;font-size:13px!important;line-height:22px!important;word-break:keep-all!important}
      [data-fortune-result] .fortune-total .directive-summary-row strong{color:#543a3a!important}[data-fortune-result] .fortune-total .directive-summary-row p{color:#5f5551!important}
      [data-work-result] .work-summary-section .directive-summary-row{border-color:rgba(255,255,255,.18)!important}
      [data-work-result] .work-summary-section .directive-summary-row strong,[data-work-result] .work-summary-section .directive-summary-row p{color:#fff!important}
      [data-work-result] .work-total{max-width:960px!important}[data-work-result] .work-total p{margin:0!important}
      [data-work-result] [data-strength-text] strong,[data-work-result] [data-pressure-text] strong{color:#2b2524!important;font-weight:800!important}
      @media(max-width:640px){.directive-summary-row{grid-template-columns:1fr!important;gap:5px!important;padding:15px 0!important}}
    `;
    document.head.appendChild(style);
  }

  const fortunePacks={
    go:{
      headline:'오늘은 생각보다 실행이 먼저입니다. 준비한 일 하나를 바로 움직이세요.',
      money:'돈과 연결되는 행동을 하나 끝내세요. 견적 보내기, 청구하기, 판매 제안, 미수금 확인처럼 실제 수입으로 이어지는 일을 먼저 처리하세요. 예정에 없던 큰 지출은 오늘 만들지 마세요.',
      love:'먼저 연락하세요. 필요한 대화가 있다면 짧고 분명하게 말을 꺼내세요. 상대 반응을 추측하며 기다리지 말고 직접 확인하세요.',
      work:'가장 중요한 업무 하나를 오늘 결과물로 끝내세요. 제안서·문서·발표·제출·공유처럼 눈에 보이는 완료 상태를 만드세요.',
      life:'중요한 일정은 앞쪽에 두고 저녁에는 새 일을 벌이지 마세요. 시작한 일을 닫고 쉬는 쪽으로 마무리하세요.',
      today:'준비한 것 하나를 실제로 내보내세요.',
      times:[['오전','가장 중요한 일부터 끝내세요.','돈이나 성과와 직접 연결되는 업무를 오전에 먼저 처리하세요.'],['오후','연락과 제안을 움직이세요.','혼자 더 다듬기보다 필요한 사람에게 보내고 반응을 받으세요.'],['저녁','새 일을 만들지 마세요.','오늘 시작한 일을 정리하고 내일 첫 할 일만 남겨두세요.']],
      dos:[['결과물 하나 보내기','제안·제출·공유 중 하나를 실제로 완료하세요.'],['받을 돈 요청하기','청구·정산·미수금 확인을 오늘 처리하세요.'],['먼저 연락하기','필요한 사람에게 짧게 먼저 연락하세요.']],
      donts:[['일을 여러 개 벌이기','좋은 흐름을 욕심내서 여러 일에 나누지 마세요.'],['충동 지출하기','예정에 없던 큰 결제는 오늘 확정하지 마세요.'],['반응을 추측하기','답장 속도나 말투만 보고 결론 내리지 마세요.']]
    },
    check:{
      headline:'오늘은 새 판보다 정리와 확인이 답입니다. 미뤄둔 것부터 끝내세요.',
      money:'새 투자나 큰 소비보다 돈이 새는 곳부터 막으세요. 정기결제, 미수금, 세금·고정비, 반복 지출을 확인하고 불필요한 한 건을 정리하세요.',
      love:'상대의 말뜻을 혼자 해석하지 마세요. 걸리는 말이 있다면 한 번 직접 물어보고, 답장 속도보다 실제 행동을 기준으로 보세요.',
      work:'새 일을 추가하지 말고 오래 끌던 업무 하나를 끝내세요. 우선순위를 세 개 이하로 줄이고 가장 오래 미뤄둔 것부터 닫으세요.',
      life:'일정 사이에 빈 시간을 남기세요. 이동·식사·휴식 시간을 줄여가며 일을 채우지 말고, 한 번 멈춰 정리한 뒤 다음 일을 시작하세요.',
      today:'미뤄둔 일 하나를 끝내고, 돈이 새는 곳 하나를 정리하세요.',
      times:[['오전','가장 오래 미룬 일을 끝내세요.','새로운 일을 시작하기 전에 닫아야 할 업무부터 처리하세요.'],['오후','확인할 것을 직접 확인하세요.','답장·일정·금액·조건처럼 애매한 부분을 사람에게 직접 확인하세요.'],['저녁','지출과 내일 일정을 정리하세요.','정기결제와 오늘 쓴 돈을 보고 내일 첫 할 일을 한 줄로 정하세요.']],
      dos:[['미뤄둔 일 끝내기','완료 표시를 남길 수 있는 일 하나부터 닫으세요.'],['돈 새는 곳 찾기','정기결제·고정비·미수금을 확인하세요.'],['애매한 말 확인하기','추측하지 말고 필요한 질문 하나를 직접 하세요.']],
      donts:[['새 일 추가하기','기존 일이 끝나기 전에는 새 일을 늘리지 마세요.'],['큰 결제 확정하기','오늘 처음 본 투자·구매는 바로 결정하지 마세요.'],['혼자 의미 붙이기','상대 말과 상황을 확대해석하지 마세요.']]
    },
    balance:{
      headline:'오늘은 욕심내지 말고 세 가지만 끝내세요. 일 하나, 돈 하나, 사람 하나면 충분합니다.',
      money:'수입을 만드는 행동 하나와 지출을 줄이는 행동 하나를 같이 하세요. 받을 돈은 요청하고, 필요 없는 결제는 끊으세요.',
      love:'관계는 추측보다 확인입니다. 필요한 말 한 가지를 분명하게 하고, 한 번의 반응보다 반복되는 태도를 보세요.',
      work:'오늘 끝낼 수 있는 업무 하나만 확실히 마감하세요. 여러 일을 조금씩 건드리지 말고 완료 표시가 남는 일을 먼저 하세요.',
      life:'하루를 꽉 채우지 마세요. 해야 할 일 세 가지만 정하고 나머지는 내일로 넘기세요.',
      today:'일 하나, 돈 하나, 사람 하나를 정리하세요.',
      times:[['오전','오늘 가장 중요한 일 하나를 고르세요.','오전에 그 일의 절반 이상을 끝내는 것을 목표로 움직이세요.'],['오후','돈과 사람 일을 하나씩 처리하세요.','받을 돈·결제·연락 중 미뤄둔 것을 하나씩 정리하세요.'],['저녁','더 하지 말고 닫으세요.','내일 첫 할 일만 정하고 오늘 일정은 마무리하세요.']],
      dos:[['업무 하나 마감하기','완료 표시가 남는 일 하나를 끝내세요.'],['받을 돈·지출 확인하기','돈과 관련된 미뤄둔 행동 하나를 처리하세요.'],['필요한 말 하기','돌려 말하지 말고 필요한 말 한 가지를 분명히 하세요.']],
      donts:[['할 일 늘리기','세 가지를 넘겨 욕심내지 마세요.'],['작은 반응 확대해석하기','한 번의 반응으로 전체를 판단하지 마세요.'],['계획 없는 소비하기','목적이 없는 결제는 오늘 넘기세요.']]
    }
  };
  let fortunePackCache=null;
  function fortuneTone(root){const h=text(root.querySelector('[data-headline]'));if(/시작|움직|꺼내|표현|연결|제안|실행/.test(h))return'go';if(/정리|살피|점검|확인|기준|줄이|마무리/.test(h))return'check';return'balance';}
  function choiceHTML(rows){return rows.map((r,i)=>`<li data-index="0${i+1}"><div><strong>${esc(r[0])}</strong><span>${esc(r[1])}</span></div></li>`).join('')}

  function polishFortune(){
    const root=document.querySelector('[data-fortune-result]');if(!root||root.dataset.directivePolished==='true')return false;
    if(!root.querySelector('.fortune-card')||!text(root.querySelector('[data-headline]')))return false;
    let input={};try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}')}catch(e){}
    const dayWord=input.mode==='tomorrow'?'내일':'오늘';
    const pack=fortunePackCache||(fortunePackCache=fortunePacks[fortuneTone(root)]);
    const r=s=>s.replaceAll('오늘',dayWord);

    root.querySelector('[data-headline]').textContent=r(pack.headline);
    const signal=root.querySelector('[data-signal-note]');if(signal)signal.textContent=`${dayWord}은 설명보다 행동을 남기세요. 가장 중요한 한 가지부터 바로 처리하면 됩니다.`;
    const areaMap={'재물운':pack.money,'연애운':pack.love,'일·학업운':pack.work,'생활운':pack.life};
    root.querySelectorAll('.fortune-card').forEach(card=>{const p=card.querySelector('p'),title=text(card.querySelector('h3'));if(p&&areaMap[title])p.textContent=r(areaMap[title]);});
    const story=root.querySelector('[data-fortune-story]');if(story)story.innerHTML=`<p><strong>${dayWord}의 결론</strong> ${esc(r(pack.today))}</p><p><strong>가장 먼저</strong> ${esc(r(pack.work))}</p>`;

    const timeCards=[...root.querySelectorAll('.fortune-time-card')];
    timeCards.slice(0,3).forEach((card,i)=>{const t=pack.times[i];card.innerHTML=`<span>${esc(t[0])}</span><strong>${esc(r(t[1]))}</strong><p>${esc(r(t[2]))}</p>`;});
    const timeSection=root.querySelector('.fortune-time-section');if(timeSection){const h=timeSection.querySelector('h2');if(h)h.textContent=`${dayWord}은 이 순서로 움직이세요.`;const lead=timeSection.querySelector('.fortune-section-lead');if(lead)lead.textContent='시간대별로 해야 할 행동만 남겼습니다.';}

    const doList=root.querySelector('[data-do-list]'),dontList=root.querySelector('[data-dont-list]');
    if(doList)doList.innerHTML=choiceHTML(pack.dos.map(x=>[r(x[0]),r(x[1])]));if(dontList)dontList.innerHTML=choiceHTML(pack.donts.map(x=>[r(x[0]),r(x[1])]));
    const choice=root.querySelector('.fortune-choice-section');if(choice){const h=choice.querySelector('h2');if(h)h.textContent=`${dayWord} 할 것과 하지 말 것`;const lead=choice.querySelector('.fortune-section-lead');if(lead)lead.textContent='애매하게 판단하지 않도록 행동 기준을 분명하게 나눴습니다.';}

    const totalSection=root.querySelector('.fortune-total-section');if(totalSection){const label=totalSection.querySelector('.fortune-label');if(label)label.textContent=`08 · ${dayWord}의 결론`;const h=totalSection.querySelector('h2');if(h)h.textContent=`${dayWord}은 이렇게 움직이세요.`;}
    const total=root.querySelector('[data-total-summary]');if(total)total.innerHTML=`<div class="directive-summary-list"><article class="directive-summary-row"><strong>${dayWord} 할 일</strong><p>${esc(r(pack.today))}</p></article><article class="directive-summary-row"><strong>재물</strong><p>${esc(r(pack.money))}</p></article><article class="directive-summary-row"><strong>일·관계</strong><p>${esc(r(`${pack.work} ${pack.love}`))}</p></article></div>`;
    const evidence=root.querySelector('.fortune-evidence');if(evidence){const label=evidence.querySelector('.fortune-label');if(label)label.textContent='09 · 해석 기준';}
    root.dataset.directivePolished='true';return true;
  }

  const workProfiles=[
    {match:'방향을 세우고 키워가는 방식',title:'새 판을 만들고 방향을 정하는 일이 맞습니다.',jobs:'신사업·서비스기획·PM·사업개발·브랜드 리드·창업처럼 처음부터 구조를 만드는 역할을 고르세요.',money:'내가 만든 기준·기획·프로젝트가 반복해서 팔리게 만드세요. 단발 업무보다 패키지·리테이너·구독·장기계약처럼 반복 수입 구조를 만드세요.',condition:'결정권이 있고 처음부터 판을 설계할 수 있을 때 성과가 납니다.',avoid:'지시만 받고 이미 정해진 일을 반복하는 환경은 피하세요.'},
    {match:'연결하며 길을 만드는 방식',title:'사람과 자원을 연결해 결과를 만드는 일이 맞습니다.',jobs:'브랜딩·마케팅·MD·AE·컨설팅·파트너십·프로젝트 조율처럼 여러 요소를 연결하는 역할을 고르세요.',money:'사람과 정보를 연결해 거래를 만들고, 연결한 일을 장기계약이나 반복 프로젝트로 전환하세요.',condition:'혼자 완결하는 일보다 여러 사람 사이에서 방향을 조율할 때 성과가 납니다.',avoid:'관계가 끊긴 채 혼자 같은 일을 반복하는 환경은 피하세요.'},
    {match:'보여주고 움직이는 방식',title:'말하고 보여주고 움직이는 일이 돈으로 연결됩니다.',jobs:'영업·마케팅·콘텐츠·PR·발표·교육·세일즈처럼 반응이 바로 오는 역할을 고르세요.',money:'결과물을 밖으로 자주 보여주고 제안 횟수를 늘리세요. 숨겨둔 실력보다 노출·제안·판매 행동이 수입을 만듭니다.',condition:'반응이 빠르고 결과가 눈에 보이는 환경에서 성과가 납니다.',avoid:'검토만 길고 실제 실행이 늦어지는 조직은 피하세요.'},
    {match:'집중해서 완성도를 높이는 방식',title:'전문성과 완성도를 파는 일이 가장 잘 맞습니다.',jobs:'디자인·브랜딩·연구·편집·기획·품질관리·전문 제작처럼 결과물의 차이가 돈이 되는 역할을 고르세요.',money:'싼 일을 많이 받기보다 전문 분야를 좁히고 단가를 올리세요. 작업 기준을 상품화하고 같은 품질을 반복 판매하는 구조를 만드세요.',condition:'깊게 파고 결과물의 품질을 직접 통제할 수 있을 때 성과가 납니다.',avoid:'속도만 요구하고 완성도 기준이 없는 환경은 피하세요.'},
    {match:'큰 구조를 안정시키는 방식',title:'여러 일을 한 구조로 묶는 역할이 맞습니다.',jobs:'운영총괄·PM·조직관리·프로젝트관리·생산관리·공간/시설 운영처럼 판 전체를 안정시키는 역할을 고르세요.',money:'사람·일정·비용을 관리해 낭비를 줄이는 능력을 돈으로 바꾸세요. 운영 대행·관리 계약·장기 프로젝트가 맞습니다.',condition:'전체 구조를 보고 기준을 정할 권한이 있을 때 성과가 납니다.',avoid:'매일 방향이 바뀌고 기준이 없는 환경은 피하세요.'},
    {match:'세밀하게 관리하고 쌓는 방식',title:'운영과 관리처럼 꾸준히 쌓이는 일이 맞습니다.',jobs:'운영·관리·CS/CX·백오피스·프로젝트 코디네이션·정산·관리기획처럼 반복을 안정시키는 역할을 고르세요.',money:'정기적으로 반복되는 일을 계약화하세요. 월 관리비·유지보수·운영대행처럼 매달 들어오는 수입을 만드세요.',condition:'업무 범위와 반복 주기가 분명할 때 성과가 납니다.',avoid:'책임 범위가 끝없이 늘어나는 역할은 피하세요.'},
    {match:'기준을 세우고 정리하는 방식',title:'판단하고 정리하고 결정하는 일이 맞습니다.',jobs:'전략·품질관리·구매·감사·기획·프로덕트 오너·문제해결처럼 기준과 결론이 필요한 역할을 고르세요.',money:'애매한 일을 정리해 비용과 시간을 줄이는 능력을 돈으로 바꾸세요. 검토·진단·의사결정 지원을 상품화하세요.',condition:'내가 기준을 세우고 결정할 수 있을 때 성과가 납니다.',avoid:'결정권 없이 책임만 지는 자리는 피하세요.'},
    {match:'정밀하게 구분하고 다듬는 방식',title:'정확도와 완성도의 차이를 파는 일이 맞습니다.',jobs:'디자인·편집·브랜딩·QA·데이터분석·리서치·세밀한 기획처럼 작은 차이가 결과를 바꾸는 역할을 고르세요.',money:'완성도와 정확도를 가격으로 바꾸세요. 수정 범위와 기준을 명확히 하고 전문성을 기준으로 단가를 받는 구조를 만드세요.',condition:'기준이 분명하고 결과 품질을 직접 통제할 때 성과가 납니다.',avoid:'대충 빨리 끝내는 것만 요구하는 환경은 피하세요.'},
    {match:'큰 흐름을 읽고 연결하는 방식',title:'변화와 정보를 연결해 방향을 만드는 일이 맞습니다.',jobs:'전략기획·컨설팅·사업기획·플랫폼·네트워크·글로벌 프로젝트처럼 변화가 많은 역할을 고르세요.',money:'정보를 모아 기회로 바꾸는 능력을 상품화하세요. 기획·자문·연결·프로젝트 수수료처럼 판단과 네트워크가 수입이 되게 만드세요.',condition:'변화가 있고 선택지가 많은 환경에서 성과가 납니다.',avoid:'하나의 방식만 오래 반복하는 환경은 피하세요.'},
    {match:'관찰하고 축적한 뒤 움직이는 방식',title:'자료를 읽고 판단해 답을 만드는 일이 맞습니다.',jobs:'리서치·데이터분석·UX리서치·상담·전략기획·콘텐츠기획처럼 정보 해석이 중요한 역할을 고르세요.',money:'모은 정보를 보고서·컨설팅·리서치·전문 콘텐츠로 바꾸세요. 아는 것을 축적만 하지 말고 판매 가능한 결과물로 만들어야 수입이 납니다.',condition:'충분히 조사한 뒤 내 판단을 결과물로 낼 수 있을 때 성과가 납니다.',avoid:'생각만 쌓고 결과물을 내지 못하는 구조는 피하세요.'}
  ];
  const fallback={title:'전문성을 결과물로 바꾸는 일이 맞습니다.',jobs:'기획·운영·전문 실무처럼 내가 기준을 만들고 결과를 책임질 수 있는 역할을 고르세요.',money:'단발성 노동보다 반복해서 팔 수 있는 서비스와 계약 구조를 만드세요.',condition:'역할과 책임이 분명하고 결과를 직접 통제할 때 성과가 납니다.',avoid:'결정권 없이 책임만 커지는 환경은 피하세요.'};
  function coreCard(n,label,title,copy){return `<article class="work-core-card"><span>${n} · ${esc(label)}</span><strong>${esc(title)}</strong><p>${esc(copy)}</p></article>`}
  function moneyCard(n,title,copy){return `<article class="money-card"><span>${n}</span><h3>${esc(title)}</h3><p>${esc(copy)}</p></article>`}
  function guideCard(n,title,copy){return `<article class="work-guide-card"><span>${n}</span><strong>${esc(title)}</strong><p>${esc(copy)}</p></article>`}

  function polishWork(){
    const root=document.querySelector('[data-work-result]');if(!root||root.dataset.directivePolished==='true')return false;
    const corpus=text(root.querySelector('[data-summary]'))+' '+text(root.querySelector('[data-core-grid]'));
    if(!corpus||corpus.length<40)return false;
    const profile=workProfiles.find(p=>corpus.includes(p.match))||fallback;
    const name=text(root.querySelector('[data-name]'))||'회원';
    const summary=root.querySelector('[data-summary]');if(summary)summary.textContent=`${name}님은 ${profile.title} ${profile.jobs}`;
    const core=root.querySelector('[data-core-grid]');if(core)core.innerHTML=[coreCard('01','일하는 방식',profile.title,profile.condition),coreCard('02','돈 되는 역할','이런 직무를 우선하세요.',profile.jobs),coreCard('03','성과 조건','이 조건이 있어야 실력이 돈이 됩니다.',profile.condition),coreCard('04','피해야 할 환경','이런 자리는 오래 끌지 마세요.',profile.avoid)].join('');
    const strength=root.querySelector('[data-strength-text]');if(strength)strength.innerHTML=`<p><strong>성과가 나는 조건:</strong> ${esc(profile.condition)}</p><p>${esc(profile.jobs)}</p>`;
    const pressure=root.querySelector('[data-pressure-text]');if(pressure)pressure.innerHTML=`<p><strong>피해야 할 조건:</strong> ${esc(profile.avoid)}</p><p>참는 쪽으로 해결하지 말고 역할·권한·단가 중 하나를 바꾸세요.</p>`;
    const org=root.querySelector('[data-organization-text]');if(org){const old=text(org);if(/자율성과 주도권|독립|프리랜스/.test(old))org.textContent='독립성이 높은 방식이 맞습니다. 프리랜스·사업·프로젝트 리드처럼 내가 일정과 결과를 결정하는 역할을 우선하세요. 대신 단발 매출에 기대지 말고 반복계약과 고정 수입원을 먼저 만드세요.';else if(/조직의 기준|전문 책임자|리더/.test(old))org.textContent='조직 안에서 전문 책임자나 리드 역할을 맡는 쪽이 맞습니다. 지시만 따르는 자리보다 담당 범위와 결정권이 분명한 포지션을 고르세요.';else org.textContent='조직에 있되 일하는 방식은 자율적인 자리가 맞습니다. PM·리드·전문가처럼 목표는 분명하고 실행 방법은 내가 정할 수 있는 역할을 고르세요.';}
    const money=root.querySelector('[data-money-grid]');if(money)money.innerHTML=[moneyCard('01','돈이 되는 일',profile.jobs),moneyCard('02','수입을 늘리는 법',profile.money),moneyCard('03','돈을 남기는 법','수입이 들어오면 먼저 세금·저축·운영비 몫을 분리하고 남은 돈을 쓰세요. 소비 후 남는 돈을 저축하는 순서는 바꾸세요.'),moneyCard('04','피해야 할 돈 습관','단가가 낮은 일을 많이 받거나, 기준 없이 할인하거나, 계약 범위 밖의 일을 계속 무료로 해주는 습관을 끊으세요.')].join('');
    const guide=root.querySelector('[data-guide-grid]');if(guide)guide.innerHTML=[guideCard('01','직업 기준',profile.jobs),guideCard('02','돈 버는 기준',profile.money),guideCard('03','돈 관리 기준','받을 돈은 바로 청구하고, 들어온 돈은 용도별로 먼저 분리하세요. 숫자를 보고 관리하는 습관을 고정하세요.'),guideCard('04','변화의 기준','이직·사업·새 프로젝트는 역할, 보상, 성장성 중 두 가지 이상이 좋아지는 선택만 하세요. 이름만 좋은 자리는 고르지 마세요.')].join('');
    const guideSection=root.querySelector('.work-guide-section');if(guideSection){const h=guideSection.querySelector('h2');if(h)h.textContent='내게 맞는 직업과 돈 버는 기준';}
    const summarySection=root.querySelector('.work-summary-section');if(summarySection){const label=summarySection.querySelector('.work-label');if(label)label.textContent='09 · 결론';const h=summarySection.querySelector('h2');if(h)h.textContent='이 직업과 방식이 수입으로 연결됩니다.';}
    const total=root.querySelector('[data-total-summary]');if(total)total.innerHTML=`<div class="directive-summary-list"><article class="directive-summary-row"><strong>일</strong><p>${esc(profile.title)} ${esc(profile.jobs)}</p></article><article class="directive-summary-row"><strong>돈</strong><p>${esc(profile.money)}</p></article><article class="directive-summary-row"><strong>지금 바꿀 것</strong><p>${esc(profile.avoid)} 대신 역할·단가·계약 범위를 분명하게 정하고 반복해서 팔 수 있는 구조를 만드세요.</p></article></div>`;
    root.dataset.directivePolished='true';return true;
  }

  function run(){injectStyle();return file==='fortune-result.html'?polishFortune():polishWork();}
  const attempt=()=>{if(run())return;setTimeout(()=>{if(run())return;setTimeout(run,1800)},1400)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(attempt,2400));else setTimeout(attempt,2400);
})();