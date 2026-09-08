(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const supported=new Set(['saju-result.html','ohaeng-result.html','fortune-result.html','relationship-result.html','guide-result.html']);
  if(!supported.has(file))return;
  const root=document.querySelector('main');if(!root)return;
  document.body.classList.add('practical-v4');
  const $=(s,r=root)=>r.querySelector(s),all=(s,r=root)=>[...r.querySelectorAll(s)];
  const text=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const clip=(s,n=260)=>{const t=clean(s);return t.length>n?`${t.slice(0,n).replace(/[,.\s]+$/,'')}…`:t;};
  const name=()=>text($('[data-name]'))||'회원';
  const card=(label,title,copy,example='')=>`<article class="practical-card"><small>${esc(label)}</small><h3>${esc(title)}</h3><p>${esc(copy)}</p>${example?`<p class="example">${esc(example)}</p>`:''}</article>`;
  const section=(title,lead,cards,callout='',soft=false)=>`<section class="practical-section${soft?' is-soft':''}" data-practical-v4><div class="practical-head"><div><span class="practical-kicker">PRACTICAL GUIDE</span><h2>${esc(title)}</h2></div><p>${esc(lead)}</p></div><div class="practical-grid${cards.length===3?' three':''}">${cards.join('')}</div>${callout?`<div class="practical-callout"><span>정월재 한 줄 조언</span><strong>${esc(callout)}</strong></div>`:''}</section>`;
  const insertAfter=(host,html)=>{if(!host||root.querySelector('[data-practical-v4]'))return;host.insertAdjacentHTML('afterend',html);};
  const easyTerms=[
    ['목','시작하고 키우는 힘'],['화','표현하고 움직이는 힘'],['토','안정시키고 관리하는 힘'],['금','판단하고 정리하는 힘'],['수','살피고 비교하는 힘'],
    ['비겁','내 기준과 주도권'],['식상','표현과 실행'],['재성','돈과 현실 감각'],['관성','책임과 조직생활'],['인성','배움과 준비']
  ];
  function softenVisible(){
    all('p,h2,h3,strong').forEach(n=>{
      if(n.closest('.evidence-content,.fortune-evidence-content,.relationship-evidence-content,.guide-evidence-content'))return;
      let t=n.textContent||'';
      easyTerms.forEach(([a,b])=>{
        t=t.replace(new RegExp(`(^|[\\s·,(])${a}(?=$|[\\s·,)])`,'g'),(_,p)=>`${p}${b}`);
      });
      t=t.replaceAll('명식','사주 전체').replaceAll('작용','특징').replaceAll('보완','챙기기').replaceAll('기운','성향');
      n.textContent=t;
    });
  }

  const dmMap={
    '甲':{title:'먼저 방향을 세우고 시작하는 편',jobs:['신규사업 기획','프로젝트 리드','교육·성장 기획','브랜드·서비스 기획'],money:'돈도 목표가 분명할 때 관리가 잘 되는 편입니다. 막연히 아끼기보다 “무엇을 위해 얼마를 모을지”를 정하면 유지하기 쉽습니다.',people:'사람 관계에서도 먼저 방향을 제안하는 편이라, 상대가 천천히 생각하는 사람이라면 속도를 한 번 맞춰주는 것이 좋습니다.'},
    '乙':{title:'상황을 읽고 가능한 길을 찾는 편',jobs:['브랜드 기획','조율형 PM','콘텐츠·편집','고객경험 기획'],money:'여러 선택지를 비교하다 결정을 늦출 수 있어, 큰 지출은 기준 3개를 미리 정해두면 훨씬 편합니다.',people:'상대의 분위기를 잘 읽는 대신 내 의견을 뒤로 미룰 수 있습니다. 관계가 가까울수록 “나는 이게 좋아”를 먼저 말해보는 것이 좋습니다.'},
    '丙':{title:'표현하고 분위기를 움직이는 편',jobs:['마케팅','영업·사업개발','콘텐츠 기획','행사·프로듀싱'],money:'기분과 분위기에 따라 소비 속도가 빨라질 수 있어 큰 결제는 하루 뒤 다시 보는 규칙이 잘 맞습니다.',people:'호감과 싫음이 비교적 잘 드러나는 편입니다. 감정이 올라온 순간 결론까지 내리지만 않으면 솔직함이 큰 장점이 됩니다.'},
    '丁':{title:'한 가지를 깊게 파고 완성도를 높이는 편',jobs:['디자인','연구·편집','전문 콘텐츠','교육·상담'],money:'가격보다 품질을 중요하게 볼 수 있어 “좋은 것”을 사는 데 돈을 쓰기 쉽습니다. 예산 상한을 먼저 정하는 것이 도움이 됩니다.',people:'관계에서 작은 말이나 변화도 오래 생각할 수 있습니다. 상대의 의도를 추측하기보다 필요한 부분은 직접 확인하는 편이 좋습니다.'},
    '戊':{title:'흩어진 것을 모아 중심을 잡는 편',jobs:['운영총괄','공공·사업관리','프로젝트 관리','조직 운영'],money:'꾸준히 모으고 지키는 힘은 좋지만 익숙한 방식만 유지할 수 있습니다. 6개월에 한 번은 보험·저축·고정비를 다시 점검해보세요.',people:'한 번 관계를 맺으면 오래 책임지려는 편입니다. 다만 내가 감당할 수 있는 선을 넘어서까지 책임질 필요는 없습니다.'},
    '己':{title:'작은 일을 꾸준히 관리해 결과를 쌓는 편',jobs:['행정·운영','교육운영','실무 PM','고객·조직 관리'],money:'큰 승부보다 반복 가능한 수입과 안정적인 관리가 잘 맞습니다. 자동이체·예산 항목처럼 시스템을 만들어두면 강점이 살아납니다.',people:'세심하게 챙기는 장점이 있지만 부탁을 계속 받아주다 지칠 수 있습니다. 일정과 감정 모두 여유분을 남겨두는 편이 좋습니다.'},
    '庚':{title:'기준을 세우고 결론을 내리는 편',jobs:['품질관리','구매·조달','심사·검토','운영책임'],money:'돈에서도 기준이 분명해 예산과 손익을 나누는 데 강점이 있습니다. 다만 너무 보수적으로만 보면 새로운 기회를 놓칠 수 있습니다.',people:'예의와 약속을 중요하게 봅니다. 갈등에서 누가 맞는지보다 먼저 상대가 무엇 때문에 서운했는지 들어보면 관계가 훨씬 편해집니다.'},
    '辛':{title:'작은 차이를 잡아내고 완성도를 높이는 편',jobs:['디자인·편집','품질기획','UX·정보설계','분석·검토'],money:'작은 비용도 잘 보는 편이지만 좋은 품질을 위해서는 과감히 지출할 수 있습니다. “필수 품질”과 “취향 비용”을 나누면 관리가 쉬워집니다.',people:'말투나 태도의 작은 변화에 민감할 수 있습니다. 상대의 한 번의 반응보다 반복되는 행동을 기준으로 판단하는 편이 안전합니다.'},
    '壬':{title:'큰 흐름을 보고 여러 가능성을 연결하는 편',jobs:['전략기획','사업개발','컨설팅','서비스 기획'],money:'기회가 보이면 움직일 수 있지만 선택지가 많아질수록 분산되기 쉽습니다. 투자·사업비는 한 번에 여러 곳보다 우선순위를 정하는 것이 좋습니다.',people:'다양한 사람과 대화하는 힘이 있지만 관계도 넓어질수록 피로가 쌓일 수 있습니다. 정말 중요한 관계에 시간을 따로 배정해보세요.'},
    '癸':{title:'작은 신호를 읽고 차분히 준비하는 편',jobs:['리서치','분석','상담','세밀한 기획'],money:'충분히 비교하고 움직이는 편이라 큰 실수는 줄이지만 결정이 늦을 수 있습니다. 조사 마감일을 정해두면 장점이 훨씬 잘 살아납니다.',people:'상대의 분위기를 잘 읽지만 혼자 추측이 길어질 수 있습니다. 중요한 관계에서는 확인 질문 한 번이 며칠의 고민보다 낫습니다.'}
  };
  function saju(){
    const sym=text($('[data-daymaster-symbol]'));const p=dmMap[sym];if(!p)return;
    const life=all('.life-card p').map(text).filter(Boolean);
    const cards=[
      card('일에서는',p.title,clip(life[0]||'잘하는 방식이 분명한 편입니다. 직함보다 실제 업무 방식과 책임 범위를 확인하면 강점을 쓰기 쉽습니다.',240),`살펴볼 직무 예시: ${p.jobs.join(' · ')}`),
      card('돈에서는','감보다 기준을 만들수록 편합니다.',p.money,'월 고정비·저축·큰 지출처럼 반복되는 돈은 자동화하거나 숫자로 남겨두는 것이 좋습니다.'),
      card('사람 관계에서는','나와 다른 속도를 인정하면 관계가 훨씬 편해집니다.',p.people,'연락·약속·역할처럼 반복되는 문제는 참다가 터뜨리기보다 작을 때 말하는 편이 좋습니다.'),
      card('결정할 때','완벽한 답보다 결정 기준이 중요합니다.','사주는 정답을 대신 골라주는 표가 아니라 내가 어떤 방식으로 판단할 때 편하고 어디서 실수하기 쉬운지를 보는 참고자료에 가깝습니다.','큰 결정은 “꼭 필요한 조건 3개 / 감수 가능한 단점 2개 / 결정 날짜 1개”로 정리해보세요.')
    ];
    const host=$('.life-grid')?.closest('.saju-report')||$('.ten-god-grid')?.closest('.saju-report');
    insertAfter(host,section(`${name()}님의 사주를 현실에 옮기면 이렇게 볼 수 있어요.`,'전문 용어보다 실제 일·돈·사람·결정 상황에서 어떤 모습으로 나타나는지를 먼저 정리했습니다.',cards,`직업명 하나를 운명처럼 정하기보다, “어떤 역할에서 오래 잘할 수 있는가”를 보는 편이 훨씬 현실적입니다.`));
  }

  const elPlain={
    wood:{name:'시작하고 방향을 잡는 힘',daily:'새 일을 시작하거나 목표를 정할 때 힘이 붙습니다.',habit:'이번 주 안에 시작할 일 하나를 정하고 첫 행동을 30분짜리로 줄여보세요.'},
    fire:{name:'표현하고 움직이는 힘',daily:'말·발표·제안처럼 밖으로 보여줄 때 장점이 살아납니다.',habit:'좋은 생각 하나를 메모에만 두지 말고 오늘 한 사람에게 말하거나 결과물로 꺼내보세요.'},
    earth:{name:'정리하고 꾸준히 유지하는 힘',daily:'일정·예산·반복 업무처럼 계속 굴러가게 만드는 데 강합니다.',habit:'할 일의 시작보다 “누가 언제까지 관리할지”를 먼저 정해보세요.'},
    metal:{name:'기준을 세우고 판단하는 힘',daily:'무엇을 남기고 버릴지 정하는 순간에 강점이 드러납니다.',habit:'결정할 때 꼭 필요한 조건 3개와 포기 가능한 조건 1개를 적어보세요.'},
    water:{name:'살피고 비교한 뒤 움직이는 힘',daily:'정보와 사람의 반응을 모아 결론을 내리는 데 익숙합니다.',habit:'알아볼 기간을 먼저 정하고 그 날짜가 지나면 반드시 작은 행동 하나를 시작하세요.'}
  };
  function ohaeng(){
    const rows=all('.element-bar');
    const vals=rows.map(r=>{const label=text(r.querySelector('.label'));const p=Number((text(r.querySelector('.score')).match(/\d+(?:\.\d+)?/)||[])[0]||0);const key=label.includes('木')||label.includes('목')?'wood':label.includes('火')||label.includes('화')?'fire':label.includes('土')||label.includes('토')?'earth':label.includes('金')||label.includes('금')?'metal':label.includes('水')||label.includes('수')?'water':null;return key?{key,p}:null;}).filter(Boolean).sort((a,b)=>b.p-a.p);
    if(!vals.length)return;
    const strong=vals[0],weak=vals.at(-1),mid=vals[2]||vals[1];
    const cards=[
      card('힘주지 않아도 잘 되는 것',elPlain[strong.key].name,`${elPlain[strong.key].daily} 이 부분은 잘하는 능력이라기보다 평소 자연스럽게 자주 쓰는 방식에 가깝습니다.`,elPlain[strong.key].habit),
      card('놓치기 쉬운 것',elPlain[weak.key].name,`${elPlain[weak.key].daily} 지금 사주에서는 이 기능을 덜 쓰는 편이라, 필요할 때 일부러 챙기면 생활의 균형이 좋아질 수 있습니다.`,elPlain[weak.key].habit),
      card('중간에서 연결해주는 것',elPlain[mid.key].name,`${elPlain[mid.key].daily} 강한 쪽과 약한 쪽 사이를 이어주는 생활 습관으로 활용하기 좋습니다.`,elPlain[mid.key].habit),
      card('오행을 보는 가장 쉬운 법','좋고 나쁨이 아니라 “자주 쓰는 방식”을 보는 겁니다.','비율이 높다고 무조건 좋고 낮다고 문제가 있다는 뜻은 아닙니다. 익숙한 방식만 반복할 때 어떤 부분이 빠지는지 확인하는 데 의미가 있습니다.','사주를 보고 갑자기 생활을 바꿀 필요는 없습니다. 한 가지 습관만 바꿔보는 정도가 가장 현실적입니다.')
    ];
    const host=$('.life-section')||$('.life-grid')?.closest('.report-section');
    insertAfter(host,section('오행을 생활 사용 설명서처럼 보면 이렇습니다.','목·화·토·금·수라는 이름을 외우지 않아도 됩니다. 지금 나에게 자연스러운 기능과 덜 쓰는 기능만 이해하면 충분합니다.',cards,`강한 부분을 더 세게 밀기보다, 빠지기 쉬운 기능 하나를 습관으로 보완하는 편이 실제 생활에서는 더 도움이 됩니다.`));
  }

  function fortune(){
    const areas=all('.fortune-card').map(c=>({title:text(c.querySelector('h3')),copy:text(c.querySelector('p'))}));
    const find=k=>areas.find(x=>x.title.includes(k))?.copy||'';
    const dos=all('[data-do-list] li').map(text).slice(0,3),donts=all('[data-dont-list] li').map(text).slice(0,3);
    const cards=[
      card('일·공부', '오늘 업무에 바로 옮기면',clip(find('일')||'해야 할 일을 늘리기보다 가장 중요한 한 가지부터 끝내는 편이 좋습니다.',250),'메일 답장, 문서 마감, 일정 확정처럼 “끝났다고 표시할 수 있는 일”을 하나 먼저 처리해보세요.'),
      card('돈', '오늘 지출은 이렇게 보면',clip(find('재물')||'계획에 없던 큰 결제는 한 번 더 확인하는 편이 좋습니다.',250),'장비·쇼핑·구독처럼 급하지 않은 지출은 오늘 결제하지 않아도 되는지 한 번 더 물어보세요.'),
      card('사람', '연락과 대화에서는',clip(find('사람')||'상대의 말 한마디보다 전체 태도를 보는 편이 좋습니다.',250),'답장이 짧거나 늦다고 바로 의미를 붙이지 말고, 필요한 말은 짧고 분명하게 전해보세요.')
    ];
    const call=dos.length?`오늘은 “${dos[0]}”부터 해보고, ${donts[0]?`“${donts[0]}”은 조금 줄여보세요.`:'큰 결론은 서두르지 마세요.'}`:'오늘의 운세는 하루를 대신 결정하는 답이 아니라 행동 순서를 정하는 참고표로 쓰는 것이 가장 좋습니다.';
    const host=$('.fortune-grid')?.closest('.fortune-report')||$('.fortune-story-section');
    insertAfter(host,section('오늘 운세를 실제 일정에 옮기면 이렇게 쓸 수 있어요.','좋다·나쁘다보다 오늘 무엇을 먼저 하고 무엇을 미루면 편한지에 초점을 맞췄습니다.',cards,call,true));
  }

  const relByElement={
    '시작하고 키우는 힘':{fit:'함께 새로운 경험을 만들고 관계를 앞으로 움직이는 사람',tired:'관계를 오래 애매하게 두고 결정을 계속 미루는 사람',line:'“우리 다음에 언제 볼까?”처럼 다음 행동을 구체적으로 정하면 관계가 편해집니다.'},
    '표현하고 움직이는 힘':{fit:'좋아하면 좋아한다고 말하고 반응을 분명하게 주는 사람',tired:'마음은 있다면서 표현을 거의 하지 않는 사람',line:'“나는 표현이 있는 관계가 편해”처럼 원하는 방식을 직접 말해보세요.'},
    '안정시키고 관리하는 힘':{fit:'연락과 약속이 일정하고 말과 행동이 크게 다르지 않은 사람',tired:'계획과 약속이 자주 바뀌고 그때그때 반응이 달라지는 사람',line:'“이 문제는 계속 반복돼서 한번 맞춰보고 싶어”처럼 반복되는 행동을 주제로 말하는 편이 좋습니다.'},
    '판단하고 정리하는 힘':{fit:'예의와 경계를 존중하고 서로의 시간을 인정하는 사람',tired:'선이 자주 바뀌고 관계의 기준을 계속 흐리는 사람',line:'“나는 여기까지는 괜찮고, 이건 불편해”라고 선을 말로 확인하는 것이 좋습니다.'},
    '살피고 연결하는 힘':{fit:'대화를 재촉하지 않고 생각할 시간을 주면서도 필요한 말은 해주는 사람',tired:'감정 확인을 계속 요구하거나 답을 빨리 내리라고 압박하는 사람',line:'“조금 생각할 시간이 필요하지만 이 문제를 피하는 건 아니야”라고 시간을 약속해두면 오해가 줄어듭니다.'}
  };
  function relationship(){
    const cards0=all('.relationship-core-card');
    const key=text(cards0[2]?.querySelector('strong'))||text(cards0[0]?.querySelector('strong'));
    const mapped=Object.entries(relByElement).find(([k])=>key.includes(k))?.[1]||{fit:'말과 행동이 비교적 일치하고 서로의 속도를 설명할 수 있는 사람',tired:'상대의 마음을 계속 추측하게 만들고 기준을 자주 바꾸는 사람',line:'추측이 길어지기 전에 중요한 질문 한 가지는 직접 확인해보세요.'};
    let input={};try{input=JSON.parse(sessionStorage.getItem('jungwoljae_relationship_input')||'{}');}catch(e){}
    const status={single:'새 인연을 볼 때',dating:'연애 중이라면',complicated:'썸이나 애매한 관계라면',breakup:'이별 후라면'}[input.relationshipStatus]||'관계를 볼 때';
    const cards=[
      card('잘 맞기 쉬운 사람',mapped.fit,'완벽히 같은 사람보다 서로 다른 방식을 설명하고 조절할 수 있는 사람이 더 오래 편할 가능성이 큽니다.','연락 빈도·약속·돈·혼자 필요한 시간 중 중요한 기준 2~3개를 먼저 정해보세요.'),
      card('피곤해지기 쉬운 관계',mapped.tired,'처음의 설렘보다 같은 문제가 반복될 때 상대가 조정하려는 태도가 있는지를 보는 것이 중요합니다.','한 번의 말보다 최근 몇 주의 행동이 반복해서 어땠는지를 기준으로 보세요.'),
      card('갈등이 생겼을 때','감정의 크기보다 한 가지 사실부터 말해보세요.',mapped.line,'“넌 항상 그래”보다 “어제 약속이 바뀌었을 때 나는 서운했어”처럼 한 장면으로 말하면 대화가 훨씬 쉬워집니다.'),
      card(status,'관계를 결정하기 전에 이것을 확인하세요.','내가 이 관계에서 편안한지, 내 의견을 말할 수 있는지, 불편함을 말했을 때 상대가 조정하려는지를 함께 보세요.','상대의 마음을 맞히는 것보다 내가 원하는 관계의 조건을 아는 것이 먼저입니다.')
    ];
    const host=$('.relationship-condition-grid')?.closest('.relationship-report')||$('.relationship-pattern-section');
    insertAfter(host,section('연애를 현실적으로 보면 이런 사람이 더 잘 맞기 쉽습니다.','사주에서 보이는 관계 성향을 연락·약속·갈등·거리감처럼 실제 연애 장면으로 바꿔 정리했습니다.',cards,`좋은 인연은 내 부족한 부분을 대신 채워주는 사람이 아니라, 서로 다른 방식을 설명하고 조절할 수 있는 사람에 더 가깝습니다.`));
  }

  function guide(){
    const problem=text($('[data-problem]')),answer=text($('[data-answer]'));
    const checks=all('.guide-check-card').slice(0,3).map(c=>`${text(c.querySelector('strong'))}: ${text(c.querySelector('p'))}`);
    const cards=[
      card('지금 고민의 본질','결정을 못 하는 게 아니라 기준이 아직 섞여 있을 수 있습니다.',clip(problem,250),'감정, 돈, 사람, 시기 중 무엇이 사실이고 무엇이 걱정인지 나눠 적어보세요.'),
      card('현실 확인','먼저 사실로 확인할 수 있는 것부터 보세요.',clip(checks.join(' '),280),'오늘 안에 확인할 수 있는 항목 하나부터 실제 숫자·일정·상대의 답으로 확인해보세요.'),
      card('정월재의 답','결론보다 조건을 먼저 정하는 편이 좋습니다.',clip(answer,280),'조건이 맞으면 움직이고, 맞지 않으면 기다린다는 기준을 만들면 고민이 훨씬 짧아집니다.')
    ];
    const host=$('.guide-problem-box')?.closest('.guide-report');
    insertAfter(host,section('이 고민, 세 줄로 먼저 정리하면 이렇습니다.','긴 내용을 보기 전에 핵심만 먼저 잡고 싶다면 아래 세 칸부터 보세요.',cards,'사주는 선택을 대신하는 정답지가 아니라, 내가 어떤 방식으로 고민을 길게 만들고 어떤 기준에서 편해지는지 보는 참고도구입니다.',true));
  }

  function run(){
    softenVisible();
    if(file==='saju-result.html')saju();
    else if(file==='ohaeng-result.html')ohaeng();
    else if(file==='fortune-result.html')fortune();
    else if(file==='relationship-result.html')relationship();
    else if(file==='guide-result.html')guide();
  }
  setTimeout(run,250);
  setTimeout(run,1000);
})();
