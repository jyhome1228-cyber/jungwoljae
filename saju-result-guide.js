(()=>{
  const root=document.querySelector('[data-saju-result]');
  if(!root)return;
  const $=(s,r=root)=>r.querySelector(s);
  const all=(s,r=root)=>[...r.querySelectorAll(s)];
  const text=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();

  const stemGuide={
    갑:{name:'갑목',plain:'큰 방향을 세우고 먼저 시작하는 쪽',strength:'새 일을 시작하고 기준을 세우는 힘, 추진력, 책임감이 장점으로 드러나기 쉽습니다.',watch:'한 번 정한 방향을 고집하거나 주변 상황을 충분히 살피기 전에 밀어붙일 수 있습니다.',action:'중요한 결정에서는 시작 전에 다른 선택지 1~2개를 함께 비교해보세요.'},
    을:{name:'을목',plain:'상황을 읽고 유연하게 길을 찾는 쪽',strength:'사람과 환경의 변화를 세밀하게 읽고, 관계를 연결하거나 우회로를 찾는 데 강점이 있습니다.',watch:'선택지가 많아질수록 결정을 미루거나 다른 사람의 반응을 지나치게 의식할 수 있습니다.',action:'결정 기준을 2~3개만 남기고 나머지는 과감히 내려놓는 방식이 도움이 됩니다.'},
    병:{name:'병화',plain:'생각을 밖으로 보여주고 움직이는 쪽',strength:'표현력, 실행 속도, 사람을 움직이는 에너지에서 강점이 드러나기 쉽습니다.',watch:'속도가 빨라질수록 세부 확인이 빠지거나 감정과 판단이 동시에 앞설 수 있습니다.',action:'큰 결정은 바로 확정하지 말고 한 번 적어본 뒤 다시 확인하는 시간을 두세요.'},
    정:{name:'정화',plain:'한곳을 깊게 보고 정교하게 표현하는 쪽',strength:'집중력, 섬세한 관찰, 완성도를 높이는 능력이 장점으로 작용하기 쉽습니다.',watch:'작은 변화나 실수에도 오래 신경 쓰거나 기준이 지나치게 예민해질 수 있습니다.',action:'완벽하게 끝내야 하는 일과 적당히 마쳐도 되는 일을 구분해두는 것이 좋습니다.'},
    무:{name:'무토',plain:'흩어진 것을 모아 중심을 잡는 쪽',strength:'여러 일을 한 구조 안에 모으고 안정적으로 유지하는 데 강점이 있습니다.',watch:'변화가 필요한 시점에도 익숙한 방식을 오래 유지해 판단이 늦어질 수 있습니다.',action:'정기적으로 지금 유지하는 것 중 바꿀 것과 그만둘 것을 따로 점검해보세요.'},
    기:{name:'기토',plain:'작은 단위를 꾸준히 관리하고 쌓는 쪽',strength:'실무 관리, 세심한 조율, 반복 업무를 안정적으로 이어가는 힘이 장점으로 드러나기 쉽습니다.',watch:'책임을 오래 안고 가거나 주변 요구를 많이 받아들이면 피로가 쌓일 수 있습니다.',action:'해야 할 일의 범위와 마감, 내가 책임질 선을 미리 정해두는 것이 중요합니다.'},
    경:{name:'경금',plain:'기준을 세우고 빠르게 정리하는 쪽',strength:'문제를 선명하게 보고 우선순위를 정하거나 결론을 내리는 데 강점이 있습니다.',watch:'기준이 강해지면 타협이 어려워지고 자신이나 주변 사람에게 지나치게 엄격해질 수 있습니다.',action:'꼭 지켜야 할 기준과 양보 가능한 조건을 따로 적어두면 선택이 부드러워집니다.'},
    신:{name:'신금',plain:'세부를 구분하고 완성도를 높이는 쪽',strength:'오류를 발견하고 품질을 다듬거나 정밀하게 판단하는 데 강점이 있습니다.',watch:'완벽히 정리되기 전에는 움직이지 못하거나 작은 오류에 과하게 민감해질 수 있습니다.',action:'완료 기준을 미리 정하고 80%에서 한 번 실행해보는 습관이 도움이 됩니다.'},
    임:{name:'임수',plain:'큰 흐름을 보고 여러 가능성을 연결하는 쪽',strength:'변화에 적응하고 다양한 정보와 사람을 연결해 넓게 보는 데 강점이 있습니다.',watch:'가능성이 많아질수록 집중이 분산되거나 결정을 늦출 수 있습니다.',action:'조사할 기간을 먼저 정하고, 그 날짜가 지나면 한 가지 방향을 선택해 실행해보세요.'},
    계:{name:'계수',plain:'작은 신호를 관찰하고 차분히 축적하는 쪽',strength:'정보, 감정, 상황의 미세한 변화를 읽고 준비하는 데 강점이 있습니다.',watch:'생각이 안쪽으로 길어지면 실행 시점을 놓치거나 불확실성을 오래 품을 수 있습니다.',action:'생각을 계속 이어가기보다 판단에 필요한 정보 개수와 결정 시점을 미리 정해두세요.'}
  };

  const elementGuide={
    목:{title:'목 · 시작과 방향',plain:'새 일을 시작하고 성장시키는 기능',high:'비중이 높으면 새로운 일을 벌이고 방향을 잡는 힘이 빨리 나올 수 있습니다.',low:'비중이 낮으면 시작보다 충분히 검토한 뒤 움직이는 편일 수 있습니다.'},
    화:{title:'화 · 표현과 실행',plain:'생각을 말과 행동으로 밖에 꺼내는 기능',high:'비중이 높으면 표현과 실행이 빠르고 반응이 분명하게 드러날 수 있습니다.',low:'비중이 낮으면 표현보다 관찰과 준비가 먼저일 수 있습니다.'},
    토:{title:'토 · 안정과 관리',plain:'흩어진 것을 정리하고 꾸준히 유지하는 기능',high:'비중이 높으면 반복 관리와 안정적인 운영을 편하게 느낄 수 있습니다.',low:'비중이 낮으면 유지보다 변화와 이동을 더 자연스럽게 느낄 수 있습니다.'},
    금:{title:'금 · 판단과 정리',plain:'기준을 세우고 필요한 것과 아닌 것을 나누는 기능',high:'비중이 높으면 결론과 기준이 분명하고 정리 속도가 빠를 수 있습니다.',low:'비중이 낮으면 단번에 자르기보다 여러 가능성을 열어두는 편일 수 있습니다.'},
    수:{title:'수 · 관찰과 유연',plain:'정보를 모으고 비교하며 상황에 맞춰 조정하는 기능',high:'비중이 높으면 관찰, 정보수집, 비교 판단을 많이 사용하는 편일 수 있습니다.',low:'비중이 낮으면 오래 살피기보다 직접 부딪혀 답을 찾는 편일 수 있습니다.'}
  };

  const godGuide={
    비겁:{title:'주도성 · 동료와 경쟁',plain:'내 의지, 독립성, 협업과 경쟁을 다루는 방식',high:'자기 판단으로 시작하고 밀어가는 일이 자주 중요해질 수 있습니다.',low:'혼자 밀어붙이기보다 역할이 분명한 환경이나 다른 사람과의 조율을 더 편하게 느낄 수 있습니다.'},
    식상:{title:'표현 · 실행 · 결과물',plain:'생각을 밖으로 꺼내고 실제 결과로 만드는 방식',high:'말하기, 만들기, 실행하기처럼 밖으로 드러나는 활동이 자주 중요해질 수 있습니다.',low:'바로 표현하기보다 충분히 생각하고 준비한 뒤 움직이는 편일 수 있습니다.'},
    재성:{title:'돈 · 현실 · 자원 관리',plain:'시간, 돈, 자원, 현실 조건을 다루는 방식',high:'금액, 효율, 실용성처럼 현실적인 조건을 자주 고려하는 편일 수 있습니다.',low:'돈 감각이 없다는 뜻이 아니라 현재 계산에서 재성 관계가 표면적으로 적게 보인다는 뜻입니다.'},
    관성:{title:'책임 · 규칙 · 조직',plain:'역할, 책임, 기준, 조직 안의 압력을 받아들이는 방식',high:'책임과 기준이 분명한 환경에서 자신의 역할을 중요하게 느낄 수 있습니다.',low:'규칙을 못 지킨다는 뜻이 아니라 자율성과 개인 판단이 더 먼저 드러날 수 있다는 뜻입니다.'},
    인성:{title:'배움 · 정보 · 전문성',plain:'배우고 이해하고 생각을 축적하는 방식',high:'정보를 모으고 공부하거나 전문성을 쌓는 과정이 삶에서 반복적으로 중요해질 수 있습니다.',low:'배움이 약하다는 뜻이 아니라 생각보다 행동이나 경험을 통해 배우는 비중이 클 수 있습니다.'}
  };

  function ensureReadingGuide(){
    if($('.saju-reading-guide'))return;
    const hero=$('.saju-hero');if(!hero)return;
    const section=document.createElement('section');
    section.className='saju-reading-guide';
    section.innerHTML=`<div class="saju-reading-guide-head"><div><span>HOW TO READ</span><h2>처음 보는 분은 이 순서로 읽으면 쉽습니다.</h2></div><p>전문 용어를 외울 필요는 없습니다. 아래 네 단계만 이해하면 뒤의 해석이 훨씬 자연스럽게 연결됩니다.</p></div><div class="saju-reading-steps"><article class="saju-reading-step"><b>01</b><strong>사주팔자 = 계산의 원본</strong><p>태어난 연·월·일·시를 두 글자씩 네 묶음으로 바꾼 기본표입니다.</p></article><article class="saju-reading-step"><b>02</b><strong>일간 = 나를 보는 기준점</strong><p>여덟 글자 중 태어난 날의 첫 글자를 기준으로 다른 요소와의 관계를 봅니다.</p></article><article class="saju-reading-step"><b>03</b><strong>오행 = 자주 쓰는 기능의 분포</strong><p>시작·표현·관리·판단·관찰 같은 다섯 기능이 어느 쪽에 더 몰리는지 봅니다.</p></article><article class="saju-reading-step"><b>04</b><strong>십성 = 실제 삶에서 쓰는 방식</strong><p>주도성, 표현, 돈, 책임, 배움의 주제가 어떤 비중으로 드러나는지 봅니다.</p></article></div>`;
    hero.insertAdjacentElement('afterend',section);
  }

  function explainPillars(){
    const board=$('[data-pillar-board]');if(!board)return;
    const section=board.closest('.saju-report');if(!section||section.querySelector('[data-pillar-guide]'))return;
    const cards=all('.pillar-card',board);
    const values={};cards.forEach(c=>{values[text(c.querySelector('span'))]=text(c.querySelector('strong'));});
    const box=document.createElement('div');box.className='saju-easy-explain';box.dataset.pillarGuide='';
    box.innerHTML=`<span class="saju-explain-kicker">쉽게 읽는 법</span><h3>네 칸은 서로 다른 시기와 관계의 배경을 보여주는 참고 축입니다.</h3><p class="saju-explain-lead">각 칸의 두 글자 중 앞 글자는 천간(天干), 뒤 글자는 지지(地支)입니다. 한 칸만 보고 성격이나 미래를 단정하지 않고, 네 칸이 서로 어떤 조합을 이루는지를 함께 봅니다.</p><div class="saju-explain-grid"><article class="saju-explain-card"><span>연주 ${values['연주']?`· ${values['연주']}`:''}</span><strong>태어난 해 · 바깥에서 처음 주어진 배경</strong><p>전통적으로 가족의 큰 배경, 어린 시절, 사회에서 처음 드러나는 이미지를 참고할 때 봅니다.</p><em>쉽게 말하면: 내가 선택하기 전부터 주어진 출발 환경에 가까운 칸입니다.</em></article><article class="saju-explain-card"><span>월주 ${values['월주']?`· ${values['월주']}`:''}</span><strong>성장 환경 · 사회와 일의 리듬</strong><p>계절의 중심이 되는 칸으로, 성장 과정과 사회생활, 일하는 환경을 볼 때 상대적으로 중요하게 참고합니다.</p><em>쉽게 말하면: 내가 어떤 환경에서 힘을 쓰기 편한지 보는 데 도움이 되는 칸입니다.</em></article><article class="saju-explain-card"><span>일주 ${values['일주']?`· ${values['일주']}`:''}</span><strong>나 자신과 가까운 생활의 기준</strong><p>앞 글자인 일간은 ‘나’를 보는 기준점이고, 뒤 글자인 일지는 가까운 관계와 일상 반응을 함께 살필 때 참고합니다.</p><em>쉽게 말하면: 이번 리포트에서 가장 중심이 되는 칸입니다.</em></article><article class="saju-explain-card"><span>시주 ${values['시주']?`· ${values['시주']}`:'· 출생시간 미입력'}</span><strong>장기 계획 · 후반의 관심과 내면 습관</strong><p>${values['시주']?'전통적으로 장기적인 계획, 후반의 관심사, 자녀와 결과물 같은 주제를 참고할 때 봅니다.':'출생시간이 없어 이번 분석에서는 시주를 제외했습니다. 시주가 없어도 연·월·일 기준의 기본 해석은 가능합니다.'}</p><em>쉽게 말하면: 시간이 지나며 무엇을 남기고 싶은지 보는 보조 칸입니다.</em></article></div><p class="saju-explain-note"><strong>기억할 점</strong> · ‘병자’, ‘경자’처럼 두 글자 자체가 좋고 나쁜 점수는 아닙니다. 각 글자의 오행·음양과 서로의 관계를 조합해 읽는 것이 핵심입니다.</p>`;
    section.appendChild(box);
  }

  function explainDaymaster(){
    const section=$('.daymaster-section');if(!section||section.querySelector('[data-daymaster-guide]'))return;
    const title=text($('[data-daymaster-title]',section));
    const symbol=text($('[data-daymaster-symbol]',section));
    let key=Object.keys(stemGuide).find(k=>title.includes(k)||symbol.includes(({갑:'甲',을:'乙',병:'丙',정:'丁',무:'戊',기:'己',경:'庚',신:'辛',임:'壬',계:'癸'})[k]));
    const g=stemGuide[key]||{name:'일간',plain:'내가 세상을 받아들이고 반응하는 기본 기준',strength:'일간은 성격 전체가 아니라 해석의 출발점입니다.',watch:'한 가지 특징만으로 자신을 단정하지 않는 것이 중요합니다.',action:'오행과 십성, 실제 생활 해석을 함께 보세요.'};
    const box=document.createElement('div');box.className='saju-easy-explain';box.dataset.daymasterGuide='';
    box.innerHTML=`<span class="saju-explain-kicker">일간을 쉽게 말하면</span><h3>${g.name}은 “나는 어떤 방식으로 반응하는 사람인가”를 보는 첫 기준입니다.</h3><p class="saju-explain-lead">일간 하나가 성격의 전부를 결정하는 것은 아닙니다. 다만 다른 오행과 십성을 해석할 때 무엇을 ‘나’로 놓고 비교할지를 정하는 중심점입니다. ${g.name}은 ${g.plain}으로 이해하면 쉽습니다.</p><div class="saju-explain-grid"><article class="saju-explain-card"><span>잘 드러날 때</span><strong>이런 점이 장점이 되기 쉽습니다.</strong><p>${g.strength}</p></article><article class="saju-explain-card"><span>과해질 때</span><strong>이런 상황에서는 피로가 생길 수 있습니다.</strong><p>${g.watch}</p></article><article class="saju-explain-card"><span>생활에서 쓰는 법</span><strong>성향을 바꾸기보다 쓰는 방법을 조절합니다.</strong><p>${g.action}</p></article><article class="saju-explain-card"><span>해석할 때 주의</span><strong>‘나는 ${g.name}이니까 무조건 이렇다’고 보지 않습니다.</strong><p>같은 일간이라도 태어난 계절, 다른 오행의 비중, 십성 관계가 다르면 실제 생활에서 나타나는 모습은 달라집니다.</p></article></div>`;
    section.appendChild(box);
  }

  function explainElements(){
    const bars=$('[data-elements]');if(!bars)return;
    const section=bars.closest('.saju-report');if(!section||section.querySelector('[data-element-guide]'))return;
    const rows=all('.element-row',bars).map(r=>({label:text(r.querySelector('label')),pct:Number(text(r.querySelector('b')).replace('%',''))||0}));
    const getKey=label=>Object.keys(elementGuide).find(k=>label.startsWith(k)||label.includes(`${k} ·`));
    const sorted=[...rows].sort((a,b)=>b.pct-a.pct);const strongest=getKey(sorted[0]?.label)||'목',weakest=getKey(sorted.at(-1)?.label)||'수';
    const cards=Object.keys(elementGuide).map(k=>{const g=elementGuide[k];const row=rows.find(r=>getKey(r.label)===k);const pct=row?.pct??0;return `<article class="element-meaning-card${k===strongest?' is-strong':''}${k===weakest?' is-weak':''}"><span>${g.title} · ${pct}%</span><strong>${g.plain}</strong><p>${pct>=25?g.high:pct<=8?g.low:`이 기능은 다른 오행과 비교해 중간 정도의 비중으로 나타납니다.`}</p><small>${k===strongest?'현재 계산에서 가장 크게 드러나는 기능':k===weakest?'현재 계산에서 가장 적게 드러나는 기능':'상대 비중 참고'}</small></article>`;}).join('');
    const box=document.createElement('div');box.className='saju-easy-explain';box.dataset.elementGuide='';
    box.innerHTML=`<span class="saju-explain-kicker">오행을 쉽게 말하면</span><h3>오행은 다섯 가지 ‘능력 점수’가 아니라, 평소 어떤 기능을 더 자주 쓰는지 보는 분포입니다.</h3><p class="saju-explain-lead">예를 들어 수(水)가 높다고 해서 ‘물이 많다’는 뜻이 아니라 관찰·정보수집·비교 같은 방식이 상대적으로 자주 나타난다는 식으로 이해하면 됩니다.</p><div class="element-meaning-grid">${cards}</div><p class="saju-explain-note"><strong>0%나 낮은 수치를 볼 때</strong> · 그 능력이 없다는 뜻이 아닙니다. 현재 계산은 표면 천간·지지와 월지 가중을 기준으로 한 1차 분포이므로, 낮은 항목은 ‘자동으로 먼저 나오기보다 필요할 때 의식적으로 챙겨야 할 기능’ 정도로 보는 것이 적절합니다.</p>`;
    section.appendChild(box);
  }

  function explainTenGods(){
    const grid=$('[data-ten-gods]');if(!grid)return;
    const section=grid.closest('.saju-report');if(!section||section.querySelector('[data-ten-guide]'))return;
    const cards=all('.ten-god-card',grid).map(c=>({key:text(c.querySelector('span')),count:Number((text(c.querySelector('strong')).match(/\d+/)||['0'])[0])}));
    const top=[...cards].sort((a,b)=>b.count-a.count)[0]?.key;
    const html=Object.keys(godGuide).map(k=>{const g=godGuide[k];const count=cards.find(c=>c.key.includes(k))?.count??0;return `<article class="ten-god-help-card${k===top&&count>0?' is-top':''}"><span>${g.title} · ${count}회</span><strong>${g.plain}</strong><p>${count>=2?g.high:count===0?g.low:'현재 계산에서는 한 번 드러나며, 필요할 때 이 주제가 중요하게 작동할 수 있습니다.'}</p><small>${count===0?'0회 = 능력 없음이 아님':'표면 천간 기준 빈도'}</small></article>`;}).join('');
    const box=document.createElement('div');box.className='saju-easy-explain';box.dataset.tenGuide='';
    box.innerHTML=`<span class="saju-explain-kicker">십성을 쉽게 말하면</span><h3>십성은 “삶에서 어떤 문제를 어떤 방식으로 자주 다루는가”를 다섯 주제로 묶어 보는 방식입니다.</h3><p class="saju-explain-lead">현재 화면의 ‘몇 회’는 능력이나 운의 점수가 아니라, 보이는 천간에서 해당 관계가 몇 번 나타났는지를 센 값입니다. 따라서 0회라고 해서 돈·책임·표현 같은 능력이 없다는 뜻은 아닙니다.</p><div class="ten-god-help-grid">${html}</div><p class="saju-explain-note"><strong>이번 표를 읽는 핵심</strong> · 많이 나온 항목은 평소 자주 부딪히는 주제, 적게 나온 항목은 필요할 때 일부러 챙겨야 하는 주제로 보면 쉽습니다. 정밀한 십성 해석은 지장간과 계절 세력까지 더 보지만, 현재 리포트는 표면 천간 중심의 1차 구조를 보여줍니다.</p>`;
    section.appendChild(box);
  }

  function updateHeadings(){
    const pillar=$('[data-pillar-board]')?.closest('.saju-report');
    const pillarSide=pillar?.querySelector('.section-heading-row>p');if(pillarSide)pillarSide.textContent='사주팔자는 결과가 아니라 계산의 원본입니다. 네 칸의 의미를 아래에서 생활 언어로 함께 설명합니다.';
    const balance=$('[data-elements]')?.closest('.saju-report');const balanceSide=balance?.querySelector('.section-heading-row>p');if(balanceSide)balanceSide.textContent='숫자가 높을수록 좋다는 뜻이 아닙니다. 내가 어떤 방식으로 시작하고, 표현하고, 관리하고, 판단하고, 살피는지의 상대 비중입니다.';
    const ten=$('[data-ten-gods]')?.closest('.saju-report');const tenSide=ten?.querySelector('.section-heading-row>p');if(tenSide)tenSide.textContent='어려운 십성 이름보다 주도성·표현·돈·책임·배움이라는 다섯 생활 주제로 먼저 이해하면 쉽습니다.';
  }

  function apply(){ensureReadingGuide();updateHeadings();explainPillars();explainDaymaster();explainElements();explainTenGods();}
  let timer=0;const schedule=()=>{clearTimeout(timer);timer=setTimeout(apply,40);};
  new MutationObserver(schedule).observe(root,{subtree:true,childList:true,characterData:true});
  apply();setTimeout(apply,250);setTimeout(apply,700);setTimeout(apply,1200);
})();
