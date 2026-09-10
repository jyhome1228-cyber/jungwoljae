(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!['lucky-number.html','important-day.html','moving-day.html'].includes(file))return;
  const result=document.querySelector('[data-quick-result]');
  const body=document.querySelector('[data-quick-result-body]');
  if(!result||!body)return;
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const text=n=>String(n?.textContent||'').replace(/\s+/g,' ').trim();

  function appendSection(title,lead,cards,note=''){
    if(body.querySelector('[data-quick-polish]'))return;
    const section=document.createElement('section');
    section.className='quick-polish-section';section.dataset.quickPolish='true';
    section.innerHTML=`<div class="quick-polish-head"><span>HOW TO READ</span><h3>${esc(title)}</h3><p>${esc(lead)}</p></div><div class="quick-card-grid quick-polish-grid">${cards.map(([k,h,p])=>`<article class="quick-card"><small>${esc(k)}</small><strong>${esc(h)}</strong><p>${esc(p)}</p></article>`).join('')}</div>${note?`<div class="quick-note quick-polish-note">${esc(note)}</div>`:''}`;
    body.appendChild(section);
  }

  function polishLucky(){
    const balls=[...body.querySelectorAll('.number-ball')].map(x=>text(x)).filter(Boolean);
    const key=text(body.querySelector('.number-ball.is-key'))||balls[0]||'—';
    if(!balls.length)return;
    appendSection(
      '숫자 자체보다 오늘 어떻게 활용할지가 중요합니다.',
      '행운의 숫자는 당첨이나 결과를 보장하는 값이 아니라, 오늘의 일진과 개인 일주를 하나의 숫자 조합으로 표현한 참고 도구입니다.',
      [
        ['01 · 중심 숫자',`${key}을 먼저 기억하세요.`,`여섯 숫자를 모두 외우기보다 중심 숫자 ${key}을 오늘의 대표값처럼 가볍게 사용해보세요. 좌석, 순서, 번호처럼 여러 선택지 가운데 숫자를 하나 골라야 할 때 참고하는 정도가 적절합니다.`],
        ['02 · 숫자 묶음',balls.join(' · '),'숫자의 순위가 정해진 것은 아닙니다. 여섯 숫자는 같은 계산 안에서 나온 하나의 묶음이며, 필요할 때 일부를 골라 쓰는 방식으로 보는 것이 자연스럽습니다.'],
        ['03 · 현실적인 사용','결정을 대신하지는 않습니다.','금전·계약·의료처럼 중요한 판단을 숫자만으로 정하지 마세요. 오늘의 기분을 환기하거나 작은 선택에 재미를 더하는 상징적 참고값으로 사용하는 것이 좋습니다.']
      ],
      '같은 생년월일이라도 태어난 시간과 달력 기준이 다르면 계산되는 일주가 달라질 수 있습니다.'
    );
  }

  function polishImportant(){
    const rows=[...body.querySelectorAll('.date-row')];if(!rows.length)return;
    const first=rows[0],second=rows[1];
    const firstDate=text(first?.querySelector('time'))||'1순위 날짜';
    const secondDate=text(second?.querySelector('time'))||'다음 후보일';
    appendSection(
      '1순위보다 실제 일정에 맞는 상위 후보를 고르세요.',
      '택일 점수는 선택한 기간 안에서 날짜를 서로 비교하기 위한 상대값입니다. 숫자가 높다고 모든 조건에서 절대적으로 좋은 날이라는 뜻은 아닙니다.',
      [
        ['01 · 우선 후보',firstDate,`가능하다면 ${firstDate}을 먼저 검토하되, 실제 계약 상대·업무 일정·준비 상태가 맞지 않으면 억지로 고정할 필요는 없습니다.`],
        ['02 · 대안 후보',secondDate,`상위 날짜 사이의 차이가 크지 않다면 현실적으로 준비가 더 잘 되는 날을 선택하는 편이 좋습니다. 택일은 좋은 조건을 보태는 참고 기준이지 준비도를 대신하지 않습니다.`],
        ['03 · 최종 확인','시간·장소·상대 조건까지 확인하세요.','계약, 면접, 발표처럼 상대가 있는 일정은 상대방의 가능 시간과 이동 여건을 함께 보고 결정하세요. 날짜가 좋아도 지나치게 촉박한 일정이면 실제 결과에는 불리할 수 있습니다.']
      ],
      '정월재의 택일은 출생 일주와 후보일의 천간·지지 관계, 합·충·형·해·파, 목적별 오행 가중치를 함께 비교합니다.'
    );
  }

  function polishMoving(){
    const rows=[...body.querySelectorAll('.date-row')];if(!rows.length)return;
    const firstDate=text(rows[0]?.querySelector('time'))||'1순위 날짜';
    const avoidCard=[...body.querySelectorAll('.quick-card')].find(x=>/피하는 날/.test(text(x.querySelector('small'))));
    const avoid=text(avoidCard?.querySelector('strong'))||'충돌이 큰 후보일';
    appendSection(
      '이사 택일은 날짜와 실제 이사 조건을 함께 봐야 합니다.',
      '좋은 날짜라도 입주 가능 시간, 엘리베이터 예약, 잔금 일정, 이동 거리 같은 현실 조건이 맞지 않으면 체감이 크게 달라질 수 있습니다.',
      [
        ['01 · 우선 후보',firstDate,`${firstDate}이 상위 후보로 계산됐습니다. 실제로 선택할 때는 입주 가능 시간과 이동 동선까지 함께 확인하면 좋습니다.`],
        ['02 · 피하는 후보',avoid,`피하는 날은 무조건 문제가 생긴다는 뜻이 아니라, 선택한 기간 안에서 출생 일주와의 충돌이나 이동·정착의 오행 점수가 상대적으로 낮게 나온 날짜입니다.`],
        ['03 · 불가피한 경우','준비 여유를 더 확보하세요.','원하는 길일을 선택하기 어렵다면 일정 사이 여유를 두고, 잔금·열쇠 수령·짐 이동처럼 중요한 절차를 한꺼번에 몰지 않는 방식으로 현실적인 부담을 줄이는 편이 좋습니다.']
      ],
      '택일 결과는 미래의 사건을 보장하지 않으며, 선택 가능한 일정 안에서 비교 기준을 제공하는 참고 정보입니다.'
    );
  }

  function run(){
    if(result.hidden||!body.children.length||body.querySelector('[data-quick-polish]'))return;
    if(file==='lucky-number.html')polishLucky();
    else if(file==='important-day.html')polishImportant();
    else if(file==='moving-day.html')polishMoving();
  }

  const observer=new MutationObserver(run);observer.observe(result,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  run();
})();
