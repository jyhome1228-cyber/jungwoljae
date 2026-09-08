(()=>{
  const tool=document.body.dataset.quickTool;
  if(!['lucky-number','important-day','moving'].includes(tool))return;
  const result=document.querySelector('[data-quick-result]');
  const body=document.querySelector('[data-quick-result-body]');
  if(!result||!body)return;

  const purposeLabels={contract:'계약·서명',open:'개업·오픈',interview:'면접·중요 미팅',exam:'시험·평가',presentation:'발표·제안',project:'프로젝트 시작',relationship:'고백·관계 시작',travel:'여행·출발'};
  const purposeRules={
    contract:'계약은 판단·정리와 안정·관리 성향을 조금 더 높게 반영합니다.',
    open:'개업·오픈은 시작·성장과 표현·활동 성향을 조금 더 높게 반영합니다.',
    interview:'면접·중요 미팅은 표현·활동을 우선하고 판단·정리 성향을 함께 봅니다.',
    exam:'시험·평가는 관찰·유연과 판단·정리 성향을 함께 반영합니다.',
    presentation:'발표·제안은 표현·활동을 우선하고 관찰·유연 성향을 보조 기준으로 봅니다.',
    project:'프로젝트 시작은 시작·성장과 표현·활동 성향을 함께 반영합니다.',
    relationship:'고백·관계 시작은 표현·활동과 시작·성장 성향을 중심으로 봅니다.',
    travel:'여행·출발은 이동과 연결을 뜻하는 관찰·유연 성향을 조금 더 반영합니다.'
  };

  function currentMethod(){
    if(tool==='lucky-number'){
      return {
        label:'NUMBER METHODOLOGY',
        title:'이 숫자는 이렇게 산출했습니다.',
        intro:'행운의 숫자는 전통 명리의 특정 숫자표를 그대로 사용하는 방식이 아니라, 출생정보와 오늘의 일진을 하나의 고정 규칙으로 숫자화한 정월재의 참고 지표입니다.',
        rows:[
          ['① 개인 기준','생년월일과 출생시간으로 계산한 출생일의 일주(천간·지지)를 기본값으로 사용합니다. 출생시간을 모르는 경우에는 시간 정보 없이 동일한 규칙을 적용합니다.'],
          ['② 오늘 기준','서울 기준 오늘 날짜의 일진을 계산해 개인의 일주와 함께 묶습니다. 날짜가 바뀌면 오늘의 일진도 달라지므로 같은 사람이라도 결과 숫자가 달라질 수 있습니다.'],
          ['③ 숫자 변환','출생일·출생시간·개인 일주·오늘 일진·오늘 날짜를 하나의 고정 시드로 만든 뒤 1~45 범위에 중복 없이 여섯 숫자로 변환합니다. 중심 숫자도 같은 시드 안에서 선택하므로 같은 날짜와 같은 입력에는 같은 결과가 나옵니다.']
        ],
        note:'숫자는 당첨 확률이나 재물 결과를 예측하는 값이 아닙니다. 명리 정보를 숫자 형태로 가볍게 번역한 콘텐츠이므로 작은 선택이나 재미 요소로 활용하는 것이 적절합니다.'
      };
    }
    if(tool==='important-day'){
      const purpose=document.querySelector('#quick-purpose')?.value||'';
      const purposeName=purposeLabels[purpose]||'선택한 일정';
      return {
        label:'DATE SCORE METHODOLOGY',
        title:`‘추천 점수’는 ${purposeName} 후보를 비교하기 위한 상대 지수입니다.`,
        intro:'표시되는 숫자는 성공 확률이나 길흉을 100점 만점으로 단정한 값이 아닙니다. 선택한 기간 안의 날짜들을 동일한 계산식으로 비교해 순서를 정하기 위한 내부 지수를 1~99 범위로 보여드립니다.',
        rows:[
          ['① 날짜 관계','기본값 55에서 출생일의 지지와 후보 날짜의 지지 관계를 비교합니다. 육합 +18, 삼합 +12, 같은 지지 +5를 더하고, 충 -18, 형 -12, 해 -10, 파 -7을 반영합니다.'],
          ['② 목적 가중치',purposeRules[purpose]||'선택한 일정의 성격과 후보 날짜 천간의 오행 성향이 얼마나 잘 맞는지 보조 가중치로 반영합니다.'],
          ['③ 현실 일정 보정','계약·개업·면접·시험·발표·프로젝트처럼 실제 업무일이 중요한 항목은 평일에 +4, 주말에는 -4를 적용합니다. 이후 같은 기간의 후보를 높은 점수 순으로 정렬해 상위 5일을 보여드립니다.']
        ],
        note:'추천 점수가 높아도 실제 계약조건, 기관 운영일, 상대방 일정, 준비 상태가 우선입니다. 이 점수는 여러 가능한 날짜가 있을 때 마지막 후보를 좁히기 위한 참고 기준입니다.'
      };
    }
    const weekend=document.querySelector('#quick-weekend')?.checked;
    return {
      label:'MOVING SCORE METHODOLOGY',
      title:'이사 추천 점수는 ‘정착하기 편한 후보’를 비교하는 상대 지수입니다.',
      intro:'이사 택일의 숫자도 미래 결과를 확률로 계산한 값은 아닙니다. 선택한 기간의 모든 날짜에 같은 규칙을 적용해 서로 비교하고, 상대적으로 안정적인 후보와 주의할 후보를 나누는 방식입니다.',
      rows:[
        ['① 출생일과 후보일 관계','기본값 55에서 출생일의 지지와 후보 날짜의 지지를 비교합니다. 육합·삼합처럼 연결이 부드러운 관계에는 가점을, 충·형·해·파처럼 마찰이 큰 관계에는 감점을 적용합니다.'],
        ['② 정착 성향 보정','후보 날짜의 천간 성향 가운데 안정·관리로 해석하는 토 성향은 +10, 시작·성장으로 보는 목 성향은 +5를 더해 정착과 새 출발의 의미를 보조적으로 반영합니다.'],
        ['③ 실제 일정 선호',weekend?'주말 선호를 선택했으므로 토·일 후보에는 +5를 추가했습니다.':'별도의 주말 가중치는 적용하지 않았습니다. 실제 가능한 기간 안에서 점수가 높은 5일과 낮은 3일을 각각 보여드립니다.']
      ],
      note:'이사업체 예약, 잔금·등기, 관리사무소와 엘리베이터 사용 가능시간이 가장 먼저입니다. 택일 점수는 그 현실 조건을 충족한 날짜들 사이에서 참고하는 보조 기준입니다.'
    };
  }

  function render(){
    if(result.hidden||!body.children.length)return;
    body.querySelector('.quick-methodology')?.remove();
    const m=currentMethod();
    const box=document.createElement('section');
    box.className='quick-methodology';
    box.innerHTML=`<div class="quick-methodology-head"><span>${m.label}</span><h3>${m.title}</h3><p>${m.intro}</p></div><div class="quick-methodology-list">${m.rows.map(([title,copy])=>`<article><strong>${title}</strong><p>${copy}</p></article>`).join('')}</div><p class="quick-methodology-note"><strong>해석 기준 안내</strong>${m.note}</p>`;
    body.appendChild(box);
  }

  let timer=0;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(render,60);};
  new MutationObserver(schedule).observe(result,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  form?.addEventListener('submit',()=>setTimeout(render,120));
  schedule();
})();