(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const supported=new Set(['saju-result.html','ohaeng-result.html','fortune-result.html','relationship-result.html','work-money-result.html','guide-result.html','compatibility-report.html']);
  if(!supported.has(file))return;
  const root=document.querySelector('main');
  if(!root)return;
  document.body.classList.add('result-quality-v7');

  const $=(s,r=root)=>r.querySelector(s);
  const all=(s,r=root)=>[...r.querySelectorAll(s)];
  const clean=s=>String(s||'').replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').trim();
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clip=(s,n=310)=>{const t=clean(s);return t.length>n?`${t.slice(0,n).replace(/[,.\s]+$/,'')}…`:t;};
  const text=n=>clean(n?.textContent||'');
  const name=()=>text($('[data-name]'))||text($('[data-person-a]'))||'회원';

  function cleanVisibleText(){
    const exact={
      '파':'작은 어긋남을 정리하는 흐름',
      '충':'변수와 부딪힘을 한 번 더 살필 흐름',
      '해':'말과 의도를 한 번 더 확인할 흐름',
      '형':'반복되는 긴장을 점검할 흐름',
      '합':'서로 자연스럽게 맞물리는 흐름',
      '육합':'서로 자연스럽게 맞물리는 흐름',
      '삼합':'관계가 부드럽게 이어지는 흐름'
    };
    all('p,h1,h2,h3,strong,span,li').forEach(node=>{
      if(node.children.length)return;
      if(node.closest('.evidence-content,.fortune-evidence-content,.relationship-evidence-content,.work-evidence-content,.guide-evidence-content,.compatibility-pillars'))return;
      let t=clean(node.textContent);
      if(exact[t])t=exact[t];
      t=t
        .replaceAll('진행 중인 일을 한 단계 정리하기새로운 일을','진행 중인 일을 한 단계 정리하기. 새로운 일을')
        .replaceAll('완벽한 답이 나올 때까지 결정 미루기모든 조건을','완벽한 답이 나올 때까지 결정 미루기. 모든 조건을')
        .replaceAll('결정 시한 정하기계속 고민만','결정 시한 정하기. 계속 고민만')
        .replaceAll('작게 시험하기퇴사나','작게 시험하기. 퇴사나')
        .replace(/([.!?])([가-힣A-Za-z])/g,'$1 $2');
      node.textContent=t;
    });
  }

  function addSummary(host,title,lead,cards){
    if(!host||root.querySelector('[data-quality-summary]'))return;
    const section=document.createElement('section');
    section.className='quality-summary';
    section.dataset.qualitySummary='true';
    section.innerHTML=`<div class="quality-summary-head"><div><span class="quality-kicker">먼저 한 번에 보면</span><h2>${esc(title)}</h2></div><p>${esc(lead)}</p></div><div class="quality-summary-grid">${cards.map(([label,headline,copy])=>`<article class="quality-summary-card"><small>${esc(label)}</small><strong>${esc(headline)}</strong><p>${esc(clip(copy,290))}</p></article>`).join('')}</div>`;
    host.insertAdjacentElement('afterend',section);
  }

  function fortune(){
    let input={};try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
    const tomorrow=input.mode==='tomorrow';
    const d=tomorrow?'내일':'오늘';
    const who=text($('[data-name]'))||'회원';
    const currentHeadline=text($('[data-headline]'));
    const tone=/점검|확인|서두르지|천천히/.test(currentHeadline)?'check':/밀어|실행|움직|꺼내/.test(currentHeadline)?'go':'balance';

    const pack={
      balance:{
        headline:`${d}은 속도보다 순서를 정리하면 편한 날입니다.`,
        glance:`좋고 나쁨이 강하게 갈리는 날이라기보다, 같은 일도 어떤 순서로 풀어가느냐에 따라 체감이 달라지는 흐름에 가깝습니다. 새 일을 크게 벌이기보다 이미 진행 중인 일의 다음 순서를 분명히 해두면 하루가 훨씬 매끄럽게 이어집니다.`,
        story:[
          `${who}님에게 ${d}은 무언가 큰 사건을 기다리는 날보다, 이미 손에 들고 있는 일과 감정의 순서를 다시 맞추면 편해지는 날에 가깝습니다. 해야 할 일이 많아 보여도 모두 같은 무게로 다루지 말고, 오늘 안에 끝낼 수 있는 일과 며칠 더 두고 볼 일을 나눠보세요.`,
          `일에서는 새로운 제안을 계속 늘리기보다 진행 중인 업무 하나를 끝까지 정리하는 쪽이 만족도가 높습니다. 관계에서는 상대의 짧은 반응에 의미를 크게 붙이기보다 실제로 확인된 말과 행동을 기준으로 보는 편이 좋습니다.`,
          `돈과 생활 리듬도 비슷합니다. 크게 아끼거나 크게 쓰는 것보다 필요한 지출과 미뤄도 되는 지출을 구분하고, 일정 사이에 짧은 여백을 남겨두세요. ${d}의 핵심은 결론을 빨리 내리는 것이 아니라 흐름이 꼬이지 않도록 순서를 정하는 데 있습니다.`
        ],
        areas:[
          ['재물운','지출의 이유가 분명한지 먼저 보세요.','돈이 들어오고 나가는 흐름이 크게 흔들리는 날이라기보다, 작은 선택이 쌓여 체감이 달라질 수 있습니다. 계획에 없던 결제는 바로 확정하지 말고 왜 필요한지 한 줄로 적어보세요. 정기 결제나 반복 지출을 하나 점검하는 것도 좋습니다. 아끼는 것보다 기준을 만드는 쪽이 더 도움이 됩니다.','돈'],
          ['연애운','한 번의 반응보다 반복되는 태도를 보세요.','연락이 조금 늦거나 말투가 평소와 다르다고 해서 관계 전체의 의미를 크게 해석하지 않는 편이 좋습니다. 필요한 말이 있다면 돌려 말하기보다 짧고 부드럽게 전해보세요. 이미 가까운 사이라면 오늘은 결론보다 서로 이해한 내용이 같은지 확인하는 대화가 더 잘 맞습니다.','마음'],
          ['일·학업운','새 일보다 끝낼 수 있는 일 하나가 중요합니다.','해야 할 일을 넓히기보다 완료 표시를 할 수 있는 일 하나부터 정리해보세요. 메일 답장, 문서 마감, 일정 확정처럼 결과가 남는 일을 먼저 끝내면 다음 선택도 훨씬 분명해집니다. 공부라면 새 범위를 넓히기보다 헷갈렸던 문제를 다시 풀어보는 편이 효율적입니다.','집중'],
          ['생활운','일정 사이에 여백을 남겨두세요.','하루를 빈틈없이 채우면 작은 변수에도 피로가 커질 수 있습니다. 이동, 식사, 휴식 시간을 너무 줄이지 말고 중간에 10분 정도라도 정리 시간을 만들어보세요. 몸이 피곤한데도 계획을 더 얹기보다 이미 잡힌 일정을 편하게 소화하는 쪽이 좋습니다.','리듬']
        ],
        keys:[
          ['01 · 오늘의 중심','균형','빨리 움직이는 것보다 일·사람·돈의 순서를 고르게 정리할수록 편합니다.'],
          ['02 · 오늘의 포인트','작은 어긋남 정리','크게 틀어진 일이 없더라도 미뤄둔 답장, 일정, 감정 하나를 정리하면 체감이 좋아집니다.'],
          ['03 · 오늘의 기준','진행 중인 일을 먼저','새로운 선택지를 늘리기보다 이미 시작한 일의 다음 순서를 분명히 만들어보세요.']
        ],
        tip:`${d}은 새로운 판을 크게 벌이기보다 이미 진행 중인 일의 다음 순서를 정리해보세요. 완벽한 답이 나올 때까지 결정을 붙잡고 있기보다 지금 꼭 필요한 조건 두세 가지만 확인한 뒤 작은 결정 하나를 내리는 편이 좋습니다. 하루를 크게 흔드는 선택보다 흐름을 매끄럽게 만드는 정리가 더 잘 맞습니다.`
      },
      go:{
        headline:`${d}은 준비한 것 하나를 실제로 움직여보기 좋은 날입니다.`,
        glance:`생각만 늘리기보다 이미 준비해둔 일 하나를 행동으로 옮길 때 흐름이 살아납니다. 다만 여러 일을 동시에 벌이는 것보다는 우선순위가 높은 한 가지를 먼저 시작하고, 반응을 본 뒤 다음 단계로 넘어가는 편이 좋습니다.`,
        story:[
          `${who}님에게 ${d}은 머릿속에서 충분히 검토한 일을 바깥으로 꺼내보기 좋은 흐름입니다. 미뤄둔 연락, 제안, 신청, 작업처럼 이미 준비가 된 일이 있다면 완벽해질 때까지 더 붙잡기보다 첫 단계를 시작해보세요.`,
          `다만 흐름이 좋다고 해서 모든 선택을 동시에 확장할 필요는 없습니다. 일에서는 핵심 과제 하나, 관계에서는 필요한 말 하나, 돈에서는 계획된 범위 안의 지출처럼 영역별로 한 가지씩만 분명하게 움직이는 편이 좋습니다.`,
          `${d}의 장점은 시작하는 힘이 붙는다는 점이고, 주의할 점은 기분이 올라온 만큼 일을 크게 잡기 쉽다는 것입니다. 움직이되 범위를 작게 잡으면 성과와 만족을 함께 챙기기 좋습니다.`
        ],
        areas:[
          ['재물운','움직인 만큼 기회가 보일 수 있습니다.','계획해둔 거래나 필요한 구매라면 비교 후 진행해도 괜찮습니다. 다만 좋은 분위기를 수익으로 바로 연결해 생각하지는 마세요. 예정에 없던 큰 금액은 하루 정도 다시 보고, 지출 목적과 회수 가능성을 먼저 확인하는 편이 좋습니다.','돈'],
          ['연애운','먼저 대화를 여는 행동이 잘 맞습니다.','연락하고 싶었던 사람이 있다면 부담 없는 말로 먼저 대화를 시작해보세요. 표현은 솔직할수록 좋지만 상대가 같은 속도로 반응해야 한다고 기대하지 않는 편이 좋습니다. 만남이 있다면 결과를 정하려 하기보다 서로 편하게 대화가 이어지는지 보는 것이 더 중요합니다.','마음'],
          ['일·학업운','준비한 일을 결과물로 꺼내보세요.','검토만 하던 문서, 제안, 과제 하나를 실제 제출이나 공유 단계로 옮기기 좋습니다. 공부도 새 자료를 계속 찾기보다 아는 내용을 문제풀이와 요약으로 꺼내보세요. 결과물을 만들수록 무엇을 더 보완해야 할지도 선명해집니다.','실행'],
          ['생활운','초반의 좋은 흐름을 과하게 쓰지 마세요.','하루 초반에 속도가 붙더라도 후반 체력까지 모두 당겨 쓰지는 않는 편이 좋습니다. 중요한 일정은 앞쪽에 배치하고, 저녁에는 새 약속을 늘리기보다 정리와 휴식을 남겨두세요. 잘 움직인 날일수록 마무리가 중요합니다.','속도']
        ],
        keys:[['01 · 오늘의 중심','실행','준비한 일 하나를 실제 행동으로 옮겨보세요.'],['02 · 오늘의 포인트','한 번에 하나','좋은 흐름을 여러 일로 분산시키기보다 가장 중요한 일부터 끝내는 편이 좋습니다.'],['03 · 오늘의 기준','반응을 보고 다음 단계로','첫 행동 뒤의 실제 반응을 확인한 뒤 다음 선택을 넓혀보세요.']],
        tip:`${d}은 준비한 것을 꺼내보기 좋은 날입니다. 다만 한 번에 여러 일을 시작하면 좋은 흐름이 분산될 수 있으니, 가장 중요한 일 하나를 먼저 움직여보세요. 작은 실행 뒤에 실제 반응을 확인하고 다음 단계를 정하면 훨씬 안정적으로 흐름을 이어갈 수 있습니다.`
      },
      check:{
        headline:`${d}은 중요한 일을 한 번 더 확인하고 움직이면 편한 날입니다.`,
        glance:`멈춰야 하는 날이라기보다, 빠른 결론보다 작은 누락을 줄이는 편이 유리한 흐름입니다. 일정·금액·약속처럼 나중에 되돌리기 어려운 조건은 한 번 더 확인하고, 감정이 큰 순간의 판단은 조금 늦춰보세요.`,
        story:[
          `${who}님에게 ${d}은 속도를 내는 것보다 빠진 조건이 없는지 확인하는 과정이 중요합니다. 특히 메일, 일정, 금액, 약속처럼 나중에 수정하기 번거로운 일은 한 번 더 읽어본 뒤 확정하는 편이 좋습니다.`,
          `관계에서는 상대의 의도를 혼자 추측하기보다 필요한 질문을 짧게 확인해보세요. 일에서는 새로운 일을 크게 벌이기보다 수정과 마무리에 힘을 쓰고, 돈에서는 계획에 없던 큰 결제를 미루는 편이 안정적입니다.`,
          `${d}의 흐름은 ‘하지 말라’는 뜻이 아닙니다. 중요한 선택일수록 작은 확인 절차를 하나 더 넣으면 불필요한 후회를 크게 줄일 수 있다는 쪽에 가깝습니다.`
        ],
        areas:[
          ['재물운','큰 금액은 하루 더 보고 결정하세요.','돈을 쓰지 말아야 하는 날이라기보다, 예정에 없던 지출을 즉시 확정하지 않는 편이 좋습니다. 특히 할인, 마감, 한정이라는 말에 마음이 급해지면 필요성과 예산을 다시 확인해보세요. 오늘은 수익을 늘리는 것보다 새는 돈을 줄이는 점검이 더 잘 맞습니다.','점검'],
          ['연애운','추측보다 확인 질문이 낫습니다.','말투나 답장 속도에 의미를 크게 붙이기 쉬운 날입니다. 서운한 부분이 있다면 결론부터 내리기보다 실제로 무슨 뜻이었는지 짧게 물어보세요. 중요한 관계일수록 한 번의 반응보다 반복되는 행동을 기준으로 보는 편이 안전합니다.','확인'],
          ['일·학업운','제출 전 한 번 더 확인하세요.','문서, 일정, 과제처럼 작은 누락이 결과를 바꿀 수 있는 부분을 다시 살펴보세요. 새로운 범위를 넓히기보다 이미 해둔 일을 다듬는 쪽이 효율적입니다. 공부라면 틀린 문제의 이유를 다시 확인하는 복습이 특히 잘 맞습니다.','정리'],
          ['생활운','체력이 떨어지면 일정을 더 얹지 마세요.','예상보다 피로가 빨리 올 수 있으니 이동과 약속 사이의 시간을 너무 촘촘하게 잡지 않는 편이 좋습니다. 몸이 무거운데도 계획을 밀어붙이기보다 하나를 줄여서라도 전체 리듬을 지켜보세요.','회복']
        ],
        keys:[['01 · 오늘의 중심','확인','결정 전에 빠진 조건이 없는지 한 번 더 보세요.'],['02 · 오늘의 포인트','추측 줄이기','사람과 상황을 혼자 해석하기보다 사실로 확인하는 편이 좋습니다.'],['03 · 오늘의 기준','큰 결론은 조금 늦게','감정이나 피로가 큰 순간에는 되돌리기 어려운 선택을 바로 확정하지 마세요.']],
        tip:`${d}은 멈추는 날이 아니라 확인 절차를 하나 더 넣으면 편한 날입니다. 중요한 결정은 일정·금액·사람의 답처럼 실제 조건을 먼저 확인하고, 감정이 큰 순간의 결론은 조금 늦춰보세요. 작은 확인 하나가 하루 전체의 후회를 줄여줄 수 있습니다.`
      }
    }[tone];

    const signal=$('.fortune-signal');
    if(signal){const strong=signal.querySelector('[data-headline]');const note=signal.querySelector('[data-signal-note]');if(strong)strong.textContent=pack.headline;if(note)note.textContent=pack.glance;}
    const relation=$('.fortune-relation');
    if(relation)relation.innerHTML=`<p class="fortune-label">01 · ${tomorrow?'TOMORROW':'TODAY'} AT A GLANCE</p><h2>${d}의 흐름을 한마디로 보면</h2><p>${esc(pack.glance)}</p>`;
    const story=$('[data-fortune-story]');if(story)story.innerHTML=pack.story.map(p=>`<p>${esc(p)}</p>`).join('');
    const storySection=$('.fortune-story-section');if(storySection){const label=storySection.querySelector('.fortune-label');const h=storySection.querySelector('h2');if(label)label.textContent=`02 · ${tomorrow?"TOMORROW'S":"TODAY'S"} FLOW`;if(h)h.textContent=`${d} 하루를 한 번에 보면`;}
    const area=$('[data-area-grid]');if(area)area.innerHTML=pack.areas.map(([t,h,p,b],i)=>`<article class="fortune-card"><span>${String(i+1).padStart(2,'0')}</span><h3>${esc(t)}</h3><p><strong style="display:block;margin-bottom:8px;color:#2b2524;font-size:15px;line-height:24px">${esc(h)}</strong>${esc(p)}</p><strong>${esc(b)}</strong></article>`).join('');
    const areaSection=area?.closest('.fortune-report');if(areaSection){const label=areaSection.querySelector('.fortune-label'),h=areaSection.querySelector('h2');if(label)label.textContent='03 · FORTUNE BY AREA';if(h)h.textContent=`${d}의 운세를 분야별로 보면`;}
    const key=$('[data-key-grid]');if(key)key.innerHTML=pack.keys.map(([l,t,p])=>`<article class="fortune-key-card"><span>${esc(l)}</span><strong>${esc(t)}</strong><p>${esc(p)}</p></article>`).join('');
    const keySection=key?.closest('.fortune-report');if(keySection){const h=keySection.querySelector('h2');if(h)h.textContent=`${d} 이것만 기억해도 충분합니다.`;}
    const tip=$('.fortune-tip-section');if(tip){const label=tip.querySelector('.fortune-label'),h=tip.querySelector('h2'),lead=tip.querySelector('.fortune-tip-lead'),grid=tip.querySelector('[data-tip-grid]'),final=tip.querySelector('[data-tip-final]'),finalLabel=tip.querySelector('.fortune-tip-final span');if(label)label.textContent='07 · JUNGWOLJAE GUIDE';if(h)h.textContent=`정월재가 정리한 ${d}의 행동 기준`;if(lead)lead.textContent='운세를 생활에 옮길 때는 거창한 행동보다 오늘 바로 바꿀 수 있는 한 가지가 더 중요합니다.';if(grid)grid.style.display='none';if(finalLabel)finalLabel.textContent=`${d}의 기준`;if(final)final.textContent=pack.tip;}
  }

  function guide(){
    let input={};try{input=JSON.parse(sessionStorage.getItem('jungwoljae_guide_input')||'{}');}catch(e){}
    const domain=input.domain||'choice';
    const situation=clean(input.situationLabel)||'지금의 고민';
    const blockers=(Array.isArray(input.blockerLabels)?input.blockerLabels:[]).map(clean).filter(Boolean);
    const b1=blockers[0]||'가장 마음에 걸리는 조건';
    const b2=blockers[1]||'결정 뒤의 부담';
    const joined=blockers.length?blockers.join('과 '):'지금 가장 걸리는 조건';

    const data={
      work:{
        core:`${situation}이라면 퇴사 여부부터 정하기보다, 어떤 조건이면 옮기고 어떤 조건이면 남을지를 먼저 정하는 편이 좋습니다. ${joined}이 마음에 걸린다면 감정만으로 결론을 내리지 말고 현재와 다음 선택을 같은 기준에서 비교해보세요.`,
        reason:[`이직 고민이 길어지는 건 지금이 힘든 이유와 다음이 더 나을지 모른다는 불안이 동시에 있기 때문입니다. 두 문제를 한 번에 해결하려 하면 선택지가 많아질수록 오히려 생각이 더 복잡해집니다.`,`먼저 지금 회사를 떠나야만 해결되는 문제와 직장을 바꿔도 반복될 수 있는 문제를 나눠보세요. 그러면 고민이 ‘갈까 말까’에서 ‘무엇이 확인되면 갈까’로 바뀌고, 다음 행동도 훨씬 분명해집니다.`],
        checks:[['현재와 다음 선택을 같은 표에 놓기','연봉만 보지 말고 실제 업무시간, 맡을 역할, 보고 체계, 성장 가능성을 같은 항목으로 적어보세요. 현재 직장도 똑같이 적어야 비교가 됩니다.'],['힘든 이유가 옮겨가도 반복되는지 보기','회사 문화 때문인지, 직무 자체 때문인지, 과한 업무량 때문인지 구분해보세요. 원인을 잘못 잡으면 회사를 바꿔도 같은 피로가 다시 생길 수 있습니다.'],['1년 뒤 내 손에 무엇이 남는지 보기','직함보다 1년 뒤 포트폴리오, 전문성, 수입, 네트워크 중 무엇이 실제로 남는지를 적어보세요.'],['버틸 수 있는 위험의 크기 계산하기','퇴사 뒤 공백이 생긴다면 생활비와 고정비를 기준으로 몇 달까지 감당 가능한지 숫자로 확인해보세요.']],
        actions:[['오늘 · 비교표 한 장 만들기','현재와 다음 선택을 수입·시간·역할·성장 네 칸으로 나눠 적어보세요. 머릿속 비교를 밖으로 꺼내는 것만으로도 판단이 선명해집니다.'],['48시간 안 · 외부 정보 하나 확인하기','관심 회사의 실제 업무 범위, 면접 가능성, 업계 연봉처럼 혼자 생각해서는 알 수 없는 사실을 하나 확인하세요.'],['이번 주 · 결정 날짜와 기준 정하기','언제까지 더 알아볼지 날짜를 정하고 꼭 만족해야 하는 조건 세 가지를 적으세요. 기준이 생기면 끝없는 고민을 줄일 수 있습니다.']],
        warning:[`힘든 날의 감정만으로 당장 그만두자는 결론을 확정하지 마세요. 감정은 중요한 신호지만 결정은 실제 조건을 확인한 뒤 내려도 늦지 않습니다.`,`반대로 모든 조건이 완벽해질 때까지 기다리지도 마세요. 다음 선택이 100점인지보다 지금보다 무엇이 분명히 나아지는지를 보는 편이 현실적입니다.`],
        answer:`지금은 그만둘까 말까를 반복해서 묻기보다, 움직일 조건을 먼저 정하는 게 맞습니다. ${joined}을 실제 숫자와 사실로 확인하고 현재와 다음 선택을 같은 표에서 비교해보세요.`
      },
      money:{
        core:`${situation}이라면 운보다 숫자가 먼저입니다. ${joined}이 걸릴수록 얼마나 벌 수 있나보다 얼마까지 써도 생활이 흔들리지 않는지를 먼저 정해보세요.`,
        reason:[`돈 고민은 기대와 불안이 같은 숫자를 서로 다르게 보게 만들 때 길어집니다. 수익 가능성을 보면 하고 싶고 손실 가능성을 보면 멈추고 싶어집니다.`,`이럴 때 좋은 선택인지 맞히려 하기보다 내가 감당 가능한 범위를 먼저 정하는 편이 좋습니다. 범위가 생기면 선택도 훨씬 단순해집니다.`],
        checks:[['최근 3개월 실제 현금흐름','수입, 고정비, 반복지출을 묶어 매달 실제로 남는 금액부터 확인하세요.'],['잃어도 되는 최대 금액','투자나 큰 지출은 기대 수익보다 먼저 손실 상한을 적으세요.'],['회수 기간','교육비·장비·사업비라면 몇 개월 안에 회수해야 하는지 정하세요.'],['지금 쓰려는 이유','필요해서인지, 남들과 비교돼서인지, 놓칠까 불안해서인지 한 줄로 적어보세요.']],
        actions:[['오늘 · 3개월 지출 펼쳐보기','카드와 계좌 내역에서 반복되는 지출 세 가지를 찾아보세요.'],['48시간 안 · 상한선 정하기','큰 지출이나 투자의 최대 금액과 최대 손실 금액을 숫자로 정하세요.'],['이번 주 · 한 번 더 계산하고 결정하기','계획에 없던 큰 결제는 하루 이상 두고 다시 본 뒤 결정하세요.']],
        warning:['이번에 놓치면 끝이라는 말에 마음이 급해지면 잠깐 멈춰보세요.','수익률만 보고 고정비와 현금 보유 기간을 빼먹지 마세요.'],
        answer:`지금 필요한 건 좋은 운을 기다리는 게 아니라 쓸 수 있는 돈과 잃어도 되는 돈의 경계를 만드는 일입니다. ${joined}을 숫자로 바꾸고 그 범위 안에서만 선택해보세요.`
      },
      love:{
        core:`${situation}이라면 상대의 마음을 맞히는 것보다 말과 행동이 반복해서 일치하는지를 보는 게 먼저입니다. ${joined}이 걸릴수록 한 번의 연락보다 최근 몇 주의 행동을 기준으로 보세요.`,
        reason:[`관계 고민이 길어지는 건 정보가 부족해서라기보다 작은 반응 하나하나에 의미를 붙이기 시작할 때가 많습니다. 잘해준 날에는 기대가 커지고 연락이 늦은 날에는 불안이 커집니다.`,`매일 결론이 바뀌면 관계 전체를 보기 어렵습니다. 최근 몇 주 동안 약속, 연락, 배려가 어떤 패턴이었는지 보는 편이 훨씬 현실적입니다.`],
        checks:[['말보다 반복되는 행동','좋다는 말보다 약속을 실제로 잡는지, 약속을 지키는지, 다음 만남을 자연스럽게 만드는지를 보세요.'],['내가 이 관계에서 편한지','설레는지와 별개로 내 의견을 말할 수 있는지, 지나치게 눈치를 보지는 않는지 확인하세요.'],['갈등 뒤에 조정이 있는지','안 싸우는 관계보다 문제가 생긴 뒤 설명하고 고치려는 태도가 있는 관계가 오래 갑니다.'],['관계의 방향이 같은지','애매함이 길어진다면 상대의 마음보다 내가 원하는 관계와 기다릴 수 있는 기간을 먼저 정하세요.']],
        actions:[['오늘 · 가장 궁금한 것 하나만 묻기','여러 질문보다 지금 관계를 판단하는 데 가장 중요한 한 가지를 직접 확인해보세요.'],['며칠 동안 · 말보다 행동 보기','답장 속도보다 약속, 배려, 시간을 쓰는 방식이 꾸준한지 보세요.'],['이번 주 · 내 기준 세 가지 적기','연락 빈도, 약속, 돈, 혼자 있는 시간처럼 꼭 필요한 기준 세 가지를 적어보세요.']],
        warning:['답장 한 번이나 말 한마디로 관계 전체의 결론을 내리지 마세요.','상대의 사정을 이해하는 것과 내 불편함을 계속 참는 것은 다른 일입니다.'],
        answer:`지금은 상대의 속마음을 더 많이 추측하기보다 관계가 실제로 어떻게 이어지고 있는지를 보는 게 맞습니다. ${joined}이 걸린다면 최근 몇 주의 행동과 내 기준을 함께 보세요.`
      },
      people:{
        core:`${situation}이라면 관계를 유지할지 끊을지보다 어디까지 허용할지를 먼저 정하는 것이 좋습니다. ${joined}이 반복된다면 감정보다 경계를 분명하게 만드는 일이 먼저입니다.`,
        reason:[`사람 문제는 한 번의 불편함보다 같은 문제가 반복될 때 더 지칩니다. 그런데 오래된 관계일수록 미안함이나 정 때문에 불편한 선을 계속 넘겨주기 쉽습니다.`,`먼저 내가 힘든 지점을 정확히 말해보고 상대가 조정하려는지를 보세요. 관계의 답은 말했을 때의 반응에서 더 분명하게 보일 때가 많습니다.`],
        checks:[['같은 불편함이 반복되는지','한 번의 실수인지 같은 패턴인지 구분해보세요.'],['늘 한쪽만 맞추고 있는지','연락, 시간, 돈, 업무 중 계속 내가 맞추고 있는 부분이 있는지 확인하세요.'],['말했을 때 상대가 조정하는지','불편함을 설명한 뒤 상대가 행동을 바꾸려는지 보세요.'],['이 관계가 왜 필요한지','정 때문인지, 가족이나 업무처럼 현실적 연결이 있어서인지 구분해보세요.']],
        actions:[['오늘 · 불편한 한 가지를 문장으로 적기','감정 전체가 아니라 바꾸고 싶은 행동 하나를 적어보세요.'],['48시간 안 · 작은 선부터 말하기','바로 단절하기보다 이번에는 어디까지 가능한지 구체적으로 말해보세요.'],['이번 주 · 반응을 보고 거리 조절하기','말했는데도 같은 문제가 반복되면 연락과 만남의 빈도를 조절해보세요.']],
        warning:['미안하다는 이유만으로 계속 내 경계를 내어주지 마세요.','한 번 화가 난 순간 모든 관계를 끊는 결정도 바로 확정하지 않는 편이 좋습니다.'],
        answer:`지금 필요한 것은 상대를 바꾸는 일이 아니라 내가 허용할 범위를 분명하게 만드는 일입니다. ${joined}이 반복된다면 작은 선부터 말하고 그 뒤의 반응을 기준으로 거리를 정해보세요.`
      },
      change:{
        core:`${situation}이라면 기대감보다 실제로 바뀌는 조건을 먼저 보는 편이 좋습니다. ${joined}이 걸린다면 비용, 준비기간, 생활 안정, 되돌아올 선택지를 같은 표에 놓고 확인해보세요.`,
        reason:[`변화는 시작 전에는 좋은 점과 두려운 점이 동시에 크게 보입니다. 그래서 마음만으로 비교하면 어떤 날은 하고 싶고 어떤 날은 멈추고 싶어집니다.`,`변화 뒤에 실제로 달라지는 조건을 숫자와 일정으로 바꾸면 막연한 불안이 줄어듭니다. 작게 시험할 방법이 있다면 먼저 해보는 것이 좋습니다.`],
        checks:[['무엇이 실제로 달라지는지','시간, 돈, 생활 반경, 역할 중 바뀌는 조건을 적어보세요.'],['준비에 필요한 시간','결정 뒤 바로 움직일 수 있는지, 몇 주나 몇 달의 준비가 필요한지 확인하세요.'],['되돌아올 선택지가 있는지','실패했을 때 다시 돌아올 수 있는 방법을 하나 만들어두세요.'],['기대가 현실과 맞는지','좋아 보이는 이미지보다 실제 하루가 어떻게 달라지는지 상상해보세요.']],
        actions:[['오늘 · 바뀌는 조건 네 가지 적기','시간·돈·장소·역할로 나눠 적어보세요.'],['48시간 안 · 경험자 한 명에게 묻기','검색보다 실제 경험자의 하루를 들어보세요.'],['이번 주 · 작게 시험하기','가능하면 체험, 단기 프로젝트, 사전 방문처럼 작은 버전으로 먼저 경험해보세요.']],
        warning:['답답함에서 벗어나고 싶다는 이유만으로 변화 자체를 답으로 만들지 마세요.','반대로 준비가 100% 끝날 때까지 기다리면 시작 시점을 계속 미룰 수 있습니다.'],
        answer:`지금은 변화가 맞는지 틀린지를 맞히기보다, 바뀌는 조건을 실제 생활 기준으로 확인하는 것이 먼저입니다. ${joined}을 숫자와 일정으로 바꾸고 작게 시험한 뒤 결정해보세요.`
      },
      mind:{
        core:`${situation}이라면 모든 문제를 한꺼번에 해결하려 하기보다 지금 가장 힘든 한 가지부터 분리해서 보는 편이 좋습니다. ${joined}이 크게 느껴질수록 오늘 손댈 수 있는 것과 지금은 손댈 수 없는 것을 나눠보세요.`,
        reason:[`마음이 지칠 때는 작은 일도 서로 연결된 큰 문제처럼 느껴질 수 있습니다. 그러면 무엇부터 해야 할지 몰라 생각만 길어집니다.`,`지금 필요한 건 인생 전체의 답이 아니라 오늘의 부담을 조금 줄이는 일일 수 있습니다. 수면, 식사, 일정, 해야 할 일의 양처럼 가까운 것부터 정리해보세요.`],
        checks:[['지금 가장 힘든 한 가지','여러 문제 중 오늘 가장 크게 체력을 빼앗는 한 가지를 고르세요.'],['내가 바꿀 수 있는 범위','상대나 결과가 아니라 오늘 내가 바꿀 수 있는 행동을 찾아보세요.'],['몸이 먼저 지친 건 아닌지','수면, 식사, 통증, 과로처럼 몸의 신호를 먼저 확인하세요.'],['미뤄도 되는 일','오늘 꼭 하지 않아도 되는 일을 하나 줄여보세요.']],
        actions:[['오늘 · 할 일 하나 줄이기','해야 할 일 목록에서 미뤄도 되는 한 가지를 빼보세요.'],['오늘 · 하나만 끝내기','작아도 완료 표시를 할 수 있는 일을 하나 마무리하세요.'],['이번 주 · 반복되는 부담 기록하기','언제 가장 힘들어지는지 며칠만 기록해보세요.']],
        warning:['힘든 순간의 생각을 인생 전체의 결론처럼 받아들이지 마세요.','쉬는 시간을 보상처럼 미루지 말고 일정 안에 먼저 넣어두는 편이 좋습니다.'],
        answer:`지금은 더 많이 생각하기보다 부담을 하나 줄이고 하나를 끝내는 방식이 맞습니다. ${joined}을 전부 해결하려 하지 말고 오늘 바꿀 수 있는 한 가지부터 손대보세요.`
      },
      choice:{
        core:`${situation}이라면 정답이 없어서 못 고르는 게 아니라 기준이 서로 섞여 있어서 결정이 길어질 수 있습니다. ${joined}을 포함해 꼭 필요한 조건과 감수할 수 있는 단점을 따로 적어보세요.`,
        reason:[`선택지가 비슷해 보일수록 장점과 단점이 한꺼번에 떠올라 결론이 계속 뒤집힐 수 있습니다. 이럴 때 더 많이 비교한다고 반드시 답이 선명해지는 것은 아닙니다.`,`내가 정말 포기하기 어려운 조건을 먼저 정하면 선택지는 자연스럽게 줄어듭니다. 완벽한 선택보다 내 기준에 더 맞는 선택을 고르는 편이 현실적입니다.`],
        checks:[['꼭 필요한 조건 세 가지','없으면 후회할 조건만 세 가지로 줄여보세요.'],['감수할 수 있는 단점 두 가지','단점이 없는 선택보다 내가 감당 가능한 단점을 고르는 편이 현실적입니다.'],['결정 날짜','언제까지 비교할지를 미리 정하세요.'],['선택 뒤 다음 행동','고른 뒤 바로 무엇을 해야 하는지도 함께 적어보세요.']],
        actions:[['오늘 · 조건을 3개와 2개로 나누기','필수 조건 세 가지, 감수 가능한 단점 두 가지를 적어보세요.'],['48시간 안 · 사실 하나 확인하기','혼자 추측하는 항목 중 실제로 확인할 수 있는 것을 하나 확인하세요.'],['이번 주 · 결정 날짜 지키기','정한 날짜가 오면 새 정보를 계속 찾기보다 현재 기준으로 결론을 내려보세요.']],
        warning:['모든 조건이 좋은 선택을 찾느라 결정을 무기한 미루지 마세요.','주변 사람의 기준이 내 기준보다 앞서지 않도록 한 번 더 확인하세요.'],
        answer:`지금은 더 많은 정보를 모으기보다 선택 기준을 줄이는 일이 먼저입니다. ${joined}을 포함해 필수 조건 세 가지를 정하고 결정 날짜까지 잡아보세요.`
      }
    }[domain]||null;
    if(!data)return;

    const problem=$('[data-problem]');if(problem)problem.innerHTML=`<span>지금 고민</span><strong>${esc(situation)}</strong><p>${esc(data.core)}</p>`;
    const personal=$('[data-personal-grid]');if(personal)personal.innerHTML=`<article class="guide-personal-card"><span>01 · 고민이 길어지는 이유</span><strong>결론보다 기준이 섞여 있습니다.</strong><p>${esc(data.reason[0])}</p></article><article class="guide-personal-card"><span>02 · 먼저 볼 것</span><strong>${esc(b1)}</strong><p>막연한 걱정으로 두지 말고 실제 숫자, 일정, 행동으로 확인할 수 있는 부분부터 나눠보세요.</p></article><article class="guide-personal-card"><span>03 · 결정 방식</span><strong>확인 → 기준 → 행동 순서</strong><p>모든 답이 나올 때까지 기다리기보다 필요한 사실을 확인하고, 내 기준을 정한 뒤 작은 행동 하나를 시작하는 편이 좋습니다.</p></article>`;
    const reason=$('[data-reason]');if(reason)reason.innerHTML=data.reason.map(p=>`<p>${esc(p)}</p>`).join('');
    const checks=$('[data-check-grid]');if(checks)checks.innerHTML=data.checks.map(([t,p],i)=>`<article class="guide-check-card"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(t)}</strong><p>${esc(p)}</p></article>`).join('');
    const actions=$('[data-action-grid]');if(actions)actions.innerHTML=data.actions.map(([t,p],i)=>`<article class="guide-action-card"><span>${i+1}</span><strong>${esc(t)}</strong><p>${esc(p)}</p></article>`).join('');
    const warning=$('[data-warning]');if(warning)warning.innerHTML=data.warning.map(p=>`<p>${esc(p)}</p>`).join('');
    const answer=$('[data-answer]');if(answer)answer.innerHTML=`<strong>${esc(data.answer)}</strong><p>정월재의 역할은 결정을 대신 내려주는 것이 아니라, 고민이 길어지는 이유를 현실적인 조건으로 바꾸고 선택 기준을 줄여주는 데 있습니다.</p><p>오늘 확인할 수 있는 사실 하나부터 확인하고, 그 결과가 내 기준을 충족하면 움직이고 아니라면 조금 더 준비해보세요. 그렇게 하면 생각만 이어지는 고민을 실제 선택으로 바꾸기 쉬워집니다.</p>`;
  }

  function genericSummary(){
    if(file==='saju-result.html'){
      const hero=$('.saju-hero');
      addSummary(hero,`${name()}님의 사주를 생활 언어로 먼저 보면`,`전통 용어를 먼저 외우기보다 실제 일·돈·사람·선택에서 어떤 모습으로 나타나는지부터 보면 훨씬 이해하기 쉽습니다.`,[
        ['나의 기본 반응',text($('[data-daymaster-title]'))||'나는 어떤 방식으로 움직이는 사람인가',text($('[data-daymaster-text]'))||text($('[data-summary]'))],
        ['일과 선택', '잘하는 방식이 드러나는 조건',text($('.life-card p'))||'직함보다 어떤 방식으로 일할 때 오래 힘을 쓸 수 있는지를 먼저 보는 편이 좋습니다.'],
        ['이번에 기억할 것','강점은 쓰고, 놓치기 쉬운 방식은 습관으로 챙기기',text($('[data-summary-prose]'))||'강한 부분을 더 세게 밀기보다 놓치기 쉬운 기능 하나를 생활 습관으로 넣어두면 균형을 잡기 쉽습니다.']
      ]);
      const map=[['05 · LIFE STRUCTURE','일·돈·사람·선택에서는 실제로 이렇게 나타납니다.'],['06 · YEAR FLOW','올해와 다음 해에는 무엇을 조금 더 신경 쓰면 좋을까요?'],['08 · FINAL SUMMARY','그래서 나는 어떤 방식으로 살아갈 때 편한 사람일까요?']];
      all('.saju-label').forEach(l=>{const hit=map.find(([a])=>text(l).includes(a));if(hit){const h=l.parentElement?.querySelector('h2')||l.nextElementSibling;if(h)h.textContent=hit[1];}});
    }
    if(file==='ohaeng-result.html'){
      const hero=$('.result-hero');
      addSummary(hero,`${name()}님의 생활 성향을 먼저 세 줄로 보면`,`오행이라는 이름보다 어떤 기능을 자연스럽게 쓰고 어떤 기능은 의식적으로 챙겨야 하는지만 이해하면 충분합니다.`,[
        ['자연스럽게 잘 쓰는 힘','힘주지 않아도 되는 방식',text($('[data-strong-text]'))],
        ['일부러 챙기면 좋은 힘','필요할 때 놓치기 쉬운 방식',text($('[data-weak-text]'))],
        ['생활에서의 핵심','한 가지 방식만 계속 쓰지 않기',text($('[data-total-summary]'))||text($('[data-flow-text]'))]
      ]);
    }
    if(file==='relationship-result.html'){
      const hero=$('.relationship-hero');
      addSummary(hero,`${name()}님의 관계 성향을 생활 장면으로 먼저 보면`,`좋은 인연을 맞히기보다 연락·표현·거리감·갈등에서 내가 반복하는 방식을 이해하는 쪽에 초점을 맞췄습니다.`,[
        ['감정 표현','좋아할 때 나는 어떻게 보일까?',text($('[data-emotion-text]'))],
        ['가까워진 뒤','어느 정도의 거리에서 편할까?',text($('[data-distance-text]'))],
        ['반복 패턴','관계가 힘들어질 때 먼저 볼 것',text($('[data-pattern-text]'))]
      ]);
    }
    if(file==='work-money-result.html'){
      const hero=$('.work-hero');
      addSummary(hero,`${name()}님의 일과 돈을 먼저 한 번에 보면`,`직업명이나 재물운 한 줄보다 어떤 환경에서 성과가 나고 어떤 조건에서 피로가 쌓이는지를 먼저 보는 편이 현실적입니다.`,[
        ['성과가 나는 조건','내 힘이 잘 쓰이는 환경',text($('[data-strength-text]'))],
        ['피로가 쌓이는 조건','오래 일하려면 줄여야 할 것',text($('[data-pressure-text]'))],
        ['돈과 선택','벌고 쓰고 남기는 기준',text($('[data-total-summary]'))||text($('.money-card p'))]
      ]);
    }
    if(file==='compatibility-report.html'){
      const hero=$('.relationship-hero');
      addSummary(hero,'두 사람의 궁합을 점수보다 관계 방식으로 먼저 보면','점수 하나로 좋고 나쁨을 단정하기보다 실제 관계에서 어디가 편하고 어디를 맞춰야 하는지를 먼저 보면 훨씬 유용합니다.',[
        ['잘 맞는 지점','자연스럽게 이어지는 부분',text($('.compatibility-compare-grid'))],
        ['조율할 지점','반복해서 부딪힐 수 있는 부분',text($('[data-advice]'))],
        ['관계의 기준','두 사람이 기억하면 좋은 한 가지',text($('[data-total-summary]'))||text($('[data-score-copy]'))]
      ]);
    }
  }

  function hierarchyTitles(){
    const maps={
      'relationship-result.html':[
        ['사람을 만날 때 먼저 보는 것','관계에서 내가 먼저 중요하게 보는 것은 무엇일까요?'],
        ['이런 관계라면 오래 편해지기 쉽습니다.','이런 관계라면 오래 편해질 가능성이 높습니다.'],
        ['연애에서 반복되기 쉬운 습관','관계가 힘들어질 때 반복하기 쉬운 패턴'],
        ['연락·약속·갈등에서 기억하면 좋은 기준','연락·약속·갈등에서는 이렇게 맞춰보세요.']
      ],
      'work-money-result.html':[
        ['일할 때 가장 먼저 드러나는 방식','일할 때 나는 어떤 방식으로 힘을 쓰는 편일까요?'],
        ['조직과 독립 사이에서','조직 안과 독립된 환경 중 어디에서 더 편할까요?'],
        ['돈을 벌고, 쓰고, 남기는 방식','돈을 벌고 쓰고 남길 때 반복되는 습관'],
        ['일과 돈에서 기억하면 좋은 기준','일과 돈에서는 이 기준부터 기억해보세요.']
      ],
      'compatibility-report.html':[
        ['네 가지 기준으로 보면 이렇습니다.','두 사람을 네 가지 관계 기준으로 보면'],
        ['잘 맞는 지점과 부딪히기 쉬운 지점','편하게 맞는 부분과 조율이 필요한 부분'],
        ['실제 관계에서는 이렇게 맞추는 편이 좋습니다.','실제 관계에서는 이렇게 맞춰보세요.']
      ]
    }[file]||[];
    all('h2').forEach(h=>{const hit=maps.find(([a])=>text(h)===a);if(hit)h.textContent=hit[1];});
  }

  function run(){
    cleanVisibleText();
    if(file==='fortune-result.html')fortune();
    if(file==='guide-result.html')guide();
    genericSummary();
    hierarchyTitles();
    cleanVisibleText();
  }

  setTimeout(run,120);
  setTimeout(run,900);
  setTimeout(run,2200);
})();
