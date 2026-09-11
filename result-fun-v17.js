(()=>{
  'use strict';
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const supported=new Set(['saju-result.html','ohaeng-result.html','relationship-result.html','guide-result.html','compatibility-report.html']);
  if(!supported.has(file))return;

  const text=n=>String(n?.textContent||'').replace(/\s+/g,' ').trim();
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const findSection=(root,needle)=>[...root.querySelectorAll('section')].find(sec=>new RegExp(needle,'i').test(text(sec.querySelector('[class*="label"],[class*="kicker"]'))));
  const setH2=(root,needle,value)=>{const sec=findSection(root,needle);const h=sec?.querySelector('h2');if(h)h.textContent=value;return sec;};
  const easyElements={
    wood:{key:'목',hanja:'木',label:'시작력',type:'새 일을 열고 방향을 잡는 힘',good:'새 프로젝트를 시작하고 첫 단추를 끼우는 데 강합니다.',watch:'시작한 뒤 정리와 마감이 뒤로 밀리기 쉽습니다.',action:'시작할 때 마감 날짜까지 같이 정하세요.'},
    fire:{key:'화',hanja:'火',label:'표현력',type:'생각을 밖으로 보여주고 움직이는 힘',good:'말·발표·제안·콘텐츠처럼 밖으로 보여줄 때 강합니다.',watch:'기분과 속도가 올라가면 너무 빨리 결정하기 쉽습니다.',action:'큰 결정은 한 번 말하거나 적어본 뒤 다시 보세요.'},
    earth:{key:'토',hanja:'土',label:'관리력',type:'흩어진 일을 정리하고 꾸준히 굴리는 힘',good:'운영·관리·일정처럼 계속 이어지는 일을 안정시키는 데 강합니다.',watch:'익숙한 방식을 오래 붙잡아 변화를 늦출 수 있습니다.',action:'한 달에 한 번 유지할 것과 바꿀 것을 따로 정하세요.'},
    metal:{key:'금',hanja:'金',label:'판단력',type:'기준을 세우고 결론을 내리는 힘',good:'복잡한 것을 정리하고 필요 없는 것을 잘라낼 때 강합니다.',watch:'기준이 높아져 완벽한 답이 나올 때까지 미룰 수 있습니다.',action:'꼭 지킬 기준 3개만 정하고 결정하세요.'},
    water:{key:'수',hanja:'水',label:'관찰력',type:'정보를 모으고 비교해 답을 찾는 힘',good:'자료·사람·상황을 오래 보고 연결할 때 강합니다.',watch:'생각이 길어지면 시작 시점을 놓치기 쉽습니다.',action:'조사 종료 날짜를 먼저 정하고 그날 결정하세요.'}
  };
  const keyToElement=k=>({목:'wood',화:'fire',토:'earth',금:'metal',수:'water',木:'wood',火:'fire',土:'earth',金:'metal',水:'water'})[k]||null;
  const inferElement=s=>{const t=String(s||'');for(const k of ['木','火','土','金','水','목','화','토','금','수'])if(t.includes(k))return keyToElement(k);return null;};

  const dayPacks={
    甲:{type:'먼저 시작하고 방향을 잡는 사람',good:'새 일·기획·리딩처럼 처음 판을 만드는 일',watch:'한번 정한 방향을 너무 오래 고집하는 것',work:'기획·PM·사업개발처럼 처음부터 구조를 만드는 일',action:'시작하기 전에 다른 선택지 하나만 더 비교하세요.'},
    乙:{type:'사람과 상황을 읽으며 길을 만드는 사람',good:'조율·브랜딩·협업처럼 여러 요소를 연결하는 일',watch:'상대 반응을 보느라 내 결정을 늦추는 것',work:'브랜딩·마케팅·AE·컨설팅처럼 연결하는 일',action:'결정 기준을 세 개만 남기고 나머지는 내려놓으세요.'},
    丙:{type:'보여주고 움직일수록 살아나는 사람',good:'영업·발표·콘텐츠처럼 반응이 바로 오는 일',watch:'분위기에 올라타 너무 빨리 확정하는 것',work:'영업·마케팅·콘텐츠·교육처럼 사람을 움직이는 일',action:'큰 결정은 바로 확정하지 말고 한 번만 다시 보세요.'},
    丁:{type:'깊게 파고 완성도로 승부하는 사람',good:'디자인·연구·편집처럼 작은 차이가 결과를 바꾸는 일',watch:'완벽해질 때까지 시작이나 제출을 미루는 것',work:'디자인·브랜딩·연구·편집·전문 제작',action:'완료 기준을 먼저 정하고 중요한 20%에 힘을 쓰세요.'},
    戊:{type:'판 전체를 보고 중심을 잡는 사람',good:'운영총괄·PM·조직관리처럼 여러 일을 한 구조로 묶는 일',watch:'변화가 필요한데 익숙한 방식을 오래 유지하는 것',work:'운영총괄·프로젝트관리·조직관리',action:'유지할 것과 바꿀 것을 따로 적어보세요.'},
    己:{type:'차근차근 쌓아 결과를 만드는 사람',good:'운영·관리·실무 조율처럼 반복을 안정시키는 일',watch:'내 몫이 아닌 일까지 오래 떠안는 것',work:'운영·관리·CS/CX·정산·실무 조율',action:'내가 책임질 범위와 마감선을 먼저 정하세요.'},
    庚:{type:'기준을 세우고 결론을 내리는 사람',good:'검토·품질·협상·의사결정처럼 기준이 필요한 일',watch:'맞고 틀림을 너무 빨리 나누는 것',work:'품질관리·구매·계약·의사결정·문제 해결',action:'꼭 지킬 기준과 양보할 조건을 나눠 적으세요.'},
    辛:{type:'작은 차이를 놓치지 않는 사람',good:'디자인·편집·분석처럼 완성도가 돈이 되는 일',watch:'완벽하지 않으면 움직이지 않는 것',work:'디자인·편집·기획·품질·분석',action:'완료 기준을 미리 정하고 끝낼 때는 끝내세요.'},
    壬:{type:'큰 흐름을 보고 여러 가능성을 연결하는 사람',good:'기획·전략·네트워크처럼 변화가 많은 일',watch:'가능성이 많아져 집중이 흩어지는 것',work:'기획·전략·사업개발·네트워크형 프로젝트',action:'조사 기간을 정하고 끝나면 한 방향을 고르세요.'},
    癸:{type:'작은 신호를 읽고 차분히 준비하는 사람',good:'리서치·분석·상담처럼 작은 차이가 중요한 일',watch:'생각이 길어져 실행 시점을 놓치는 것',work:'리서치·분석·상담·세밀한 기획',action:'필요한 정보 개수와 결정 날짜를 먼저 정하세요.'}
  };

  function simplifyLeaves(root){
    const pairs=[
      ['상대적으로',''],['의식적으로','일부러'],['작용이','성향이'],['작용은','성향은'],['작용을','성향을'],['작용','성향'],
      ['전체 명식','전체 사주'],['명식에서는','사주에서는'],['명식에서','사주에서'],['오행 구조','다섯 기운의 배치'],
      ['평이한 흐름','큰 변화가 적은 시기'],['합의 흐름','잘 맞물리는 시기'],['충의 흐름','변화가 큰 시기'],['조율의 흐름','대화가 필요한 시기']
    ];
    root.querySelectorAll('p,h2,h3,strong,span,li').forEach(node=>{
      if(node.children.length)return;
      if(node.closest('details,.evidence-content,.fortune-evidence-content,.relationship-evidence-content,.work-evidence-content,.guide-evidence-content,.compatibility-pillars'))return;
      let t=text(node);if(!t)return;
      pairs.forEach(([a,b])=>{t=t.split(a).join(b)});
      t=t.replace(/\s{2,}/g,' ').trim();
      node.textContent=t;
    });
  }

  function polishSaju(){
    const root=document.querySelector('[data-saju-result]');if(!root)return false;
    const symbol=text(root.querySelector('[data-daymaster-symbol]'));const pack=dayPacks[symbol];if(!pack)return false;
    const name=text(root.querySelector('[data-name]'))||'회원';
    const lead=root.querySelector('[data-summary]');if(lead)lead.textContent=`${name}님은 ${pack.type}입니다. 잘하는 건 ${pack.good}, 조심할 건 ${pack.watch}입니다.`;
    const title=root.querySelector('[data-daymaster-title]');if(title)title.textContent=pack.type;
    const desc=root.querySelector('[data-daymaster-text]');if(desc)desc.textContent=`${pack.good}에서 강점이 잘 드러납니다. 반대로 ${pack.watch}만 조심하면 훨씬 편합니다. ${pack.action}`;
    setH2(root,'FOUR PILLARS','내 사주를 이루는 네 가지 기준');
    setH2(root,'FIVE DAILY FORCES','나는 시작형일까, 표현형일까, 관리형일까?');
    setH2(root,'LIFE ROLES','일하고 돈 쓰고 배우는 방식');
    setH2(root,'LIFE STRUCTURE','일·돈·연애에서 실제로는 이렇게 보입니다.');
    setH2(root,'YEAR FLOW','올해는 무엇에 힘이 실릴까?');
    setH2(root,'FINAL SUMMARY','한마디로 나는 이런 사람');

    const summaryCards=[...root.querySelectorAll('[data-summary-grid] .summary-card')];
    const cardData=[['01 · 나의 타입',pack.type],['02 · 잘하는 것',pack.good],['03 · 조심할 것',pack.watch],['04 · 잘 맞는 일',pack.work],['05 · 한 가지 팁',pack.action]];
    summaryCards.slice(0,5).forEach((card,i)=>{const s=card.querySelector('span'),st=card.querySelector('strong');if(s)s.textContent=cardData[i][0];if(st)st.textContent=cardData[i][1];});
    const prose=root.querySelector('[data-summary-prose]');if(prose)prose.innerHTML=`<p><strong>${esc(name)}님의 핵심</strong> ${esc(pack.type)}입니다. ${esc(pack.good)}에서 힘이 잘 붙습니다.</p><p><strong>조심할 것</strong> ${esc(pack.watch)}입니다. ${esc(pack.action)}</p>`;

    const roleMap={비겁:['주도력','내가 직접 정하고 움직이는 힘'],식상:['표현력','생각을 말·글·결과물로 꺼내는 힘'],재성:['현실감각','돈·시간·효율을 따지는 힘'],관성:['책임감','역할과 약속을 지키는 힘'],인성:['학습력','배우고 준비해 전문성을 쌓는 힘']};
    root.querySelectorAll('[data-ten-gods] .ten-god-card').forEach(card=>{const s=card.querySelector('span'),p=card.querySelector('p');const k=text(s);if(roleMap[k]){s.textContent=roleMap[k][0];if(p)p.textContent=roleMap[k][1];}});
    return true;
  }

  function ohaengOrder(root){
    return [...root.querySelectorAll('[data-element-chart] .element-bar')].map(bar=>{const k=inferElement(text(bar.querySelector('.label')));const score=Number((text(bar.querySelector('.score')).match(/\d+(?:\.\d+)?/)||[])[0]||0);return {k,score,bar};}).filter(x=>x.k).sort((a,b)=>b.score-a.score);
  }
  function polishOhaeng(){
    const root=document.querySelector('[data-ohaeng-result]');if(!root)return false;
    const order=ohaengOrder(root);if(order.length<2)return false;
    const strong=easyElements[order[0].k],weak=easyElements[order.at(-1).k],name=text(root.querySelector('[data-name]'))||'회원';
    const lead=root.querySelector('[data-summary]');if(lead)lead.textContent=`${name}님은 ${strong.label}이 가장 강합니다. ${strong.good} 반대로 ${weak.label}은 놓치기 쉬워서 ${weak.action}`;
    const meta=[...root.querySelectorAll('[data-meta] span')];meta.forEach(m=>{if(/균형 지표/.test(text(m)))m.textContent=text(m).replace('균형 지표','전체 밸런스')});
    setH2(root,'DISTRIBUTION','내 능력치 중 뭐가 제일 강할까?');
    setH2(root,'NATURAL FORCE','생각 안 해도 잘하는 것');
    setH2(root,'BALANCE','자꾸 빠뜨리기 쉬운 것');
    setH2(root,'FLOW','이 순서만 기억하면 됩니다.');
    setH2(root,'DAILY LIFE','일·연애·돈에서는 이렇게 써먹으세요.');
    setH2(root,'KEY POINTS','지금 기억할 것 세 가지');
    setH2(root,'TOTAL SUMMARY','한마디로 내 성향을 정리하면');

    order.forEach(({k,bar})=>{const info=easyElements[k],label=bar.querySelector('.label');if(label)label.innerHTML=`<span class="hanja">${info.hanja}</span>${info.label}`;});
    root.querySelectorAll('[data-element-cards] .element-card').forEach(card=>{const k=inferElement(text(card.querySelector('strong')));if(!k)return;const info=easyElements[k];card.querySelector('strong').textContent=`${info.label} · ${info.type}`;const p=card.querySelector('p');if(p)p.textContent=info.good;});
    const strongText=root.querySelector('[data-strong-text]');if(strongText)strongText.innerHTML=`<p><strong>${esc(strong.label)}</strong> ${esc(strong.good)}</p><p>${esc(strong.action)}</p>`;
    const weakText=root.querySelector('[data-weak-text]');if(weakText)weakText.innerHTML=`<p><strong>${esc(weak.label)}</strong>은 평소 놓치기 쉽습니다. ${esc(weak.watch)}</p><p>${esc(weak.action)}</p>`;
    const flow=root.querySelector('[data-flow-text]');if(flow)flow.textContent=`${strong.label}은 이미 잘 쓰고 있습니다. 큰 결정이나 중요한 일에서는 ${weak.label}만 한 번 더 챙기면 훨씬 편합니다.`;
    const life=[...root.querySelectorAll('[data-life-grid] .life-card')];
    const lifeCopy=[
      `${strong.label}이 강해서 ${strong.good} 중요한 선택 전에는 ${weak.action}`,
      `사람을 만날 때도 ${strong.type}이 먼저 나옵니다. 상대가 나와 다르게 움직이면 바로 판단하지 말고 한 번 더 물어보세요.`,
      `일에서는 ${strong.type}을 쓰는 역할이 잘 맞습니다. 대신 ${weak.label}이 필요한 과정은 체크리스트나 일정으로 보완하세요.`,
      `돈은 감으로 끝내지 말고 기록을 남기세요. 수입·지출·저축 기준을 숫자로 정하면 훨씬 편합니다.`
    ];
    life.slice(0,4).forEach((card,i)=>{const p=card.querySelector('p');if(p)p.textContent=lifeCopy[i];});
    const total=root.querySelector('[data-total-summary]');if(total)total.innerHTML=`<p><strong>한마디로</strong> ${esc(name)}님은 ${esc(strong.label)}이 강한 타입입니다.</p><p><strong>잘하는 것</strong> ${esc(strong.good)}</p><p><strong>조심할 것</strong> ${esc(weak.watch)}</p><p><strong>추천</strong> ${esc(weak.action)}</p>`;
    return true;
  }

  const lovePacks={
    wood:{type:'좋으면 앞으로 가는 연애 타입',good:'함께 성장하고 다음 계획을 만드는 관계',watch:'상대보다 너무 빨리 다음 단계로 가는 것',tip:'상대의 속도를 한 번 확인하고 움직이세요.'},
    fire:{type:'좋아하면 티가 나는 연애 타입',good:'표현과 반응이 분명한 관계',watch:'감정이 올라온 순간 바로 결론 내리는 것',tip:'서운한 말은 한 박자 쉬고 짧게 말하세요.'},
    earth:{type:'천천히 믿고 오래 가는 연애 타입',good:'약속과 생활 리듬이 안정적인 관계',watch:'참다가 한 번에 터뜨리는 것',tip:'작은 불편도 그때그때 말하세요.'},
    metal:{type:'기준이 분명한 연애 타입',good:'존중과 약속, 각자의 선이 분명한 관계',watch:'감정보다 맞고 틀림을 먼저 따지는 것',tip:'문제를 풀기 전에 상대 감정부터 확인하세요.'},
    water:{type:'천천히 관찰하며 가까워지는 연애 타입',good:'서두르지 않고 자연스럽게 가까워지는 관계',watch:'생각하느라 말을 너무 늦게 하는 것',tip:'혼자 생각이 길어지기 전에 한 문장이라도 설명하세요.'}
  };
  function polishRelationship(){
    const root=document.querySelector('[data-relationship-result]');if(!root)return false;
    const core=text(root.querySelector('[data-core-grid]'));const el=inferElement(core);if(!el)return false;const pack=lovePacks[el],name=text(root.querySelector('[data-name]'))||'회원';
    const lead=root.querySelector('[data-summary]');if(lead)lead.textContent=`${name}님은 ${pack.type}입니다. 잘 맞는 건 ${pack.good}, 조심할 건 ${pack.watch}입니다.`;
    setH2(root,'RELATIONSHIP CORE','나는 연애할 때 뭘 먼저 볼까?');
    setH2(root,'EMOTION','좋아하면 티가 나는 편일까?');
    setH2(root,'DISTANCE','가까워져도 꼭 필요한 거리');
    setH2(root,'COMFORTABLE RELATIONSHIP','이런 사람과 만나면 편합니다.');
    setH2(root,'REPEATED PATTERN','연애할 때 내가 자주 하는 실수');
    setH2(root,'THIS YEAR','올해 연애에서 눈여겨볼 것');
    setH2(root,'RELATIONSHIP GUIDE','연락·약속·싸움은 이렇게 하는 게 맞습니다.');
    setH2(root,'TOTAL SUMMARY','한마디로 나는 이런 연애 타입');
    const emotion=root.querySelector('[data-emotion-text]');if(emotion)emotion.innerHTML=`<p><strong>${esc(pack.type)}</strong>입니다. ${esc(pack.good)}에서 마음이 편합니다.</p><p>${esc(pack.watch)}만 조심하세요. ${esc(pack.tip)}</p>`;
    const distance=root.querySelector('[data-distance-text]');if(distance)distance.innerHTML=`<p>${esc(pack.good)}이 잘 맞습니다. 상대와 가까워져도 각자 편한 속도와 시간을 존중하는 게 중요합니다.</p><p>${esc(pack.tip)}</p>`;
    const total=root.querySelector('[data-total-summary]');if(total)total.innerHTML=`<p><strong>연애 타입</strong> ${esc(pack.type)}</p><p><strong>잘 맞는 관계</strong> ${esc(pack.good)}</p><p><strong>자주 하는 실수</strong> ${esc(pack.watch)}</p><p><strong>이번엔 이렇게</strong> ${esc(pack.tip)}</p>`;
    return true;
  }

  function polishCompatibility(){
    const root=document.querySelector('[data-compatibility-report]');if(!root)return false;
    const score=Number(text(root.querySelector('[data-overall-score]')));if(!score)return false;
    const a=text(root.querySelector('[data-person-a]'))||'나',b=text(root.querySelector('[data-person-b]'))||'상대방';
    const metrics=[...root.querySelectorAll('[data-metric-grid] .compatibility-metric')].map(c=>({name:text(c.querySelector('span')),score:Number(text(c.querySelector('strong')))||0})).sort((x,y)=>y.score-x.score);
    const best=metrics[0]?.name||'대화',weak=metrics.at(-1)?.name||'생활';
    const title=score>=85?'기본 호흡이 아주 잘 맞는 궁합':score>=75?'잘 맞는 부분이 뚜렷한 궁합':score>=65?'맞춰가면 오래 갈 수 있는 궁합':'끌림보다 대화 방식이 더 중요한 궁합';
    const lead=root.querySelector('[data-summary]');if(lead)lead.textContent=`${a}님과 ${b}님은 ${score}점 궁합입니다. 가장 잘 맞는 건 ${best}, 가장 신경 쓸 건 ${weak}입니다.`;
    const st=root.querySelector('[data-score-title]');if(st)st.textContent=title;
    const sc=root.querySelector('[data-score-copy]');if(sc)sc.textContent=`${best}은 자연스럽게 맞는 편이고, ${weak}은 서로 다르게 느낄 수 있습니다. 이 두 가지만 알고 만나도 훨씬 편합니다.`;
    setH2(root,'FOUR POINTS','둘이 잘 맞는 건 무엇일까?');
    setH2(root,'TWO PEOPLE','두 사람은 사랑할 때 뭘 중요하게 볼까?');
    setH2(root,'MATCH & FRICTION','잘 맞는 부분과 자주 부딪히는 부분');
    setH2(root,'RELATIONSHIP FLOW','오래 가려면 이것만 기억하세요.');
    setH2(root,'TOTAL SUMMARY','두 사람의 궁합, 한마디로');
    const total=root.querySelector('[data-total-summary]');if(total)total.innerHTML=`<p><strong>${esc(score+'점 · '+title)}</strong></p><p>잘 맞는 건 ${esc(best)}입니다. 이 부분은 굳이 애쓰지 않아도 자연스럽게 맞습니다.</p><p>${esc(weak)}은 서로 다르게 느낄 수 있으니, 싸우기 전에 기준을 먼저 맞추세요.</p>`;
    root.querySelectorAll('[data-person-grid] .compatibility-person-card p').forEach(p=>{let t=text(p).replace(/전체적으로는 .*?관계가 더 편해질 수 있습니다\.?/,'');p.textContent=t||'연애할 때 중요하게 보는 기준과 편한 속도가 분명한 편입니다.';});
    return true;
  }

  function polishGuide(){
    const root=document.querySelector('[data-guide-result]');if(!root)return false;
    if(!text(root.querySelector('[data-problem]')))return false;
    const lead=root.querySelector('[data-lead]');if(lead)lead.textContent='어려운 명리 용어 대신, 지금 뭘 확인하고 어떻게 움직이면 되는지만 정리했습니다.';
    setH2(root,'THE QUESTION','지금 고민에서 진짜 중요한 것');
    setH2(root,'MY DECISION STYLE','나는 고민할 때 어떤 실수를 자주 할까?');
    setH2(root,'WHY IT FEELS HARD','왜 이렇게 계속 고민될까?');
    setH2(root,'SAJU CHECK','결정 전에 이것부터 확인하세요.');
    setH2(root,'NEXT MOVE','지금 당장 할 것 세 가지');
    setH2(root,'AVOID','지금은 이 선택만 피하세요.');
    setH2(root,'JUNGWOLJAE ANSWER','그래서 이번 고민의 답은?');
    return true;
  }

  function run(){
    let ok=false;
    if(file==='saju-result.html')ok=polishSaju();
    if(file==='ohaeng-result.html')ok=polishOhaeng();
    if(file==='relationship-result.html')ok=polishRelationship();
    if(file==='compatibility-report.html')ok=polishCompatibility();
    if(file==='guide-result.html')ok=polishGuide();
    const root=document.querySelector('main');if(root)simplifyLeaves(root);
    return ok;
  }

  run();
  [500,1100,1900,2900,4300,6000].forEach(ms=>setTimeout(run,ms));
})();