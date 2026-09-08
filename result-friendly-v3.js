(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const supported=new Set(['saju-result.html','ohaeng-result.html','fortune-result.html','relationship-result.html','work-money-result.html','guide-result.html']);
  if(!supported.has(file))return;
  const root=document.querySelector('main');if(!root)return;
  const $=(s,r=root)=>r.querySelector(s);const all=(s,r=root)=>[...r.querySelectorAll(s)];
  const text=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();
  const clip=(v,n=240)=>{const t=String(v||'').replace(/\s+/g,' ').trim();return t.length>n?`${t.slice(0,n).replace(/[,.\s]+$/,'')}…`:t;};
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const n=()=>text($('[data-name]'))||'회원';
  const nodeText=s=>text($(s));
  const childrenText=(s,limit=6)=>all(`${s}>*`).slice(0,limit).map(text).filter(Boolean);
  const once=(host,key,html,pos='beforeend')=>{if(!host||host.querySelector(`[data-rf3="${key}"]`))return;host.insertAdjacentHTML(pos,`<div data-rf3="${key}">${html}</div>`);};
  const card=(label,title,copy,note='')=>`<article class="rf3-card"><small>${esc(label)}</small><strong>${esc(title)}</strong><p>${esc(copy)}</p>${note?`<em>${esc(note)}</em>`:''}</article>`;
  const block=(title,lead,cards,tip='',cls='')=>`<div class="rf3-block ${cls}"><div class="rf3-head"><div><span>EASY GUIDE</span><h3>${esc(title)}</h3></div>${lead?`<p>${esc(lead)}</p>`:''}</div><div class="rf3-grid${cards.length>=5?' five':cards.length===3?' three':''}">${cards.join('')}</div>${tip?`<div class="rf3-tip"><span>이렇게 써보세요</span><strong>${esc(tip)}</strong></div>`:''}</div>`;

  const elementGuide={
    목:{name:'목(木)',plain:'시작하고 방향을 잡는 힘',high:'새로운 일을 벌이고 첫걸음을 떼는 데 힘이 잘 붙는 편입니다.',low:'충분히 알아본 뒤 시작하려는 편이라 첫 실행이 늦어질 수 있습니다.',tip:'준비가 70% 정도 됐을 때 작은 실행 날짜를 먼저 잡아보세요.'},
    화:{name:'화(火)',plain:'생각을 표현하고 움직이는 힘',high:'말하고 보여주고 직접 실행할 때 에너지가 올라오는 편입니다.',low:'생각은 있어도 표현 시점을 오래 재거나 혼자 정리하는 시간이 길 수 있습니다.',tip:'중요한 생각은 머릿속에만 두지 말고 짧게라도 말이나 메모로 밖에 꺼내보세요.'},
    토:{name:'토(土)',plain:'정리하고 꾸준히 유지하는 힘',high:'반복 관리, 일정, 운영처럼 계속 굴러가게 만드는 데 강점이 있습니다.',low:'새로운 일은 잘 시작해도 유지·관리 단계에서 피로가 커질 수 있습니다.',tip:'시작할 때부터 누가, 언제, 어떻게 관리할지까지 정해두면 훨씬 편합니다.'},
    금:{name:'금(金)',plain:'기준을 세우고 판단하는 힘',high:'좋고 싫음, 필요와 불필요를 구분하고 결론을 내리는 기준이 분명한 편입니다.',low:'가능성을 오래 열어두다 보니 “이건 안 한다”라고 자르는 결정이 늦어질 수 있습니다.',tip:'결정할 때 꼭 필요한 기준 3개와 포기 가능한 조건 1개를 먼저 적어보세요.'},
    수:{name:'수(水)',plain:'살피고 비교하고 연결하는 힘',high:'자료와 사람의 반응을 오래 보고 여러 가능성을 비교하는 데 익숙한 편입니다.',low:'오래 살피기보다 직접 부딪혀 답을 찾는 편이라 확인 과정이 짧아질 수 있습니다.',tip:'큰 결정은 자료 2~3개를 비교하고 하루 정도 다시 보는 시간을 두세요.'}
  };
  const stemGuide={
    甲:['갑목(甲木)','판을 열고 방향을 세우는 사람','시작과 추진에 강하지만 이미 정한 방향을 바꾸는 데 시간이 걸릴 수 있습니다.','새 프로젝트, 기획, 리딩처럼 처음 길을 만드는 역할에서 강점이 잘 살아납니다.','결정 전에 다른 선택지 하나만 더 비교해보세요.'],
    乙:['을목(乙木)','상황을 읽고 길을 찾아내는 사람','사람과 환경을 잘 살피지만 선택지가 많아지면 결정이 길어질 수 있습니다.','조율, 브랜딩, 관계형 업무처럼 여러 요소를 연결하는 일에 잘 맞습니다.','결정 기준을 2~3개로 줄이고 나머지는 내려놓는 연습이 도움이 됩니다.'],
    丙:['병화(丙火)','분위기를 움직이고 밖으로 보여주는 사람','표현과 실행이 빠른 대신 감정과 판단이 같이 앞설 수 있습니다.','발표, 영업, 콘텐츠, 실행 중심 프로젝트처럼 반응이 바로 오는 일에서 강합니다.','큰 결정은 한 번 적어두고 몇 시간 뒤 다시 확인해보세요.'],
    丁:['정화(丁火)','한 곳을 깊게 파고 완성도를 높이는 사람','집중력과 섬세함이 강하지만 작은 변화나 실수에도 오래 신경 쓸 수 있습니다.','디자인, 연구, 편집, 전문 작업처럼 깊이와 완성도가 중요한 일에서 강점이 큽니다.','모든 일을 완벽하게 끝내려 하지 말고 중요한 일과 적당히 끝낼 일을 구분하세요.'],
    戊:['무토(戊土)','흩어진 것을 모아 판을 안정시키는 사람','큰 구조와 중심을 잡는 데 강하지만 변화가 필요한 시점을 늦출 수 있습니다.','운영, 조직관리, 프로젝트 총괄처럼 여러 요소를 한 구조로 묶는 역할에 잘 맞습니다.','한 달에 한 번은 유지할 것과 바꿀 것을 따로 점검해보세요.'],
    己:['기토(己土)','작은 일을 꾸준히 관리해 결과를 쌓는 사람','실무와 관리에 강하지만 책임을 오래 안고 가면 쉽게 지칠 수 있습니다.','관리, 운영, 실무 조율, 반복 업무처럼 꾸준함이 필요한 일에 잘 맞습니다.','내가 책임질 범위와 마감선을 먼저 정해두는 것이 중요합니다.'],
    庚:['경금(庚金)','기준을 세우고 결론을 내리는 사람','판단이 빠르고 분명하지만 기준이 강해질수록 타협이 어려워질 수 있습니다.','검토, 의사결정, 품질관리, 문제 해결처럼 기준이 필요한 일에 강합니다.','꼭 지킬 기준과 양보 가능한 조건을 따로 적어보세요.'],
    辛:['신금(辛金)','작은 차이를 그냥 지나치지 않는 사람','정밀함과 완성도에 강하지만 완벽히 정리되기 전에는 쉽게 움직이지 못할 수 있습니다.','디자인, 편집, 기획, 품질, 분석처럼 작은 차이가 결과를 바꾸는 일에 강합니다.','완료 기준을 미리 정하고 중요한 20%에만 완성도를 더 쓰는 방식이 잘 맞습니다.'],
    壬:['임수(壬水)','큰 흐름을 보고 여러 가능성을 연결하는 사람','변화와 정보에 강하지만 가능성이 많아질수록 집중이 분산될 수 있습니다.','기획, 전략, 네트워크, 변화가 많은 프로젝트에서 강점을 쓰기 쉽습니다.','조사 기간을 먼저 정하고 끝나면 한 방향을 선택해 실행하세요.'],
    癸:['계수(癸水)','작은 신호를 놓치지 않고 차분히 준비하는 사람','관찰력과 정보 축적에 강하지만 생각이 길어지면 실행 시점을 놓칠 수 있습니다.','리서치, 분석, 상담, 세밀한 기획처럼 작은 신호가 중요한 일에 잘 맞습니다.','판단에 필요한 정보의 개수와 결정 날짜를 미리 정해두세요.']
  };
  const groupGuide={
    비겁:['비겁(比劫)','내 기준·주도권·동료와 경쟁','내가 직접 판단하고 움직이는 힘을 보는 분류입니다. 일반 단어의 “비겁하다”와는 전혀 다른 뜻입니다.'],
    식상:['식상(食傷)','표현·실행·결과물','생각을 말, 글, 행동, 결과물로 밖에 꺼내는 힘을 보는 분류입니다.'],
    재성:['재성(財星)','돈·시간·현실 조건','돈의 양을 뜻하기보다 자원과 현실 조건을 어떻게 다루는지 보는 분류입니다.'],
    관성:['관성(官星)','책임·규칙·조직','역할, 책임, 기준, 조직의 압력을 어떻게 받아들이는지 보는 분류입니다.'],
    인성:['인성(印星)','배움·정보·전문성','배우고 이해하고 생각을 축적하는 방식을 보는 분류입니다.']
  };

  function parseElements(){
    const out=[];
    all('.element-row').forEach(row=>{const label=text(row.querySelector('label'));const b=text(row.querySelector('b'));const k=['목','화','토','금','수'].find(x=>label.startsWith(x));if(k)out.push({k,p:Number((b.match(/\d+(?:\.\d+)?/)||[])[0]||0)});});
    if(out.length)return out.sort((a,b)=>b.p-a.p);
    all('.element-card').forEach(c=>{const t=text(c);const k=['목','화','토','금','수'].find(x=>t.includes(x));const p=Number((t.match(/(\d+(?:\.\d+)?)\s*%/)||[])[1]||0);if(k&&!out.some(x=>x.k===k))out.push({k,p});});
    return out.sort((a,b)=>b.p-a.p);
  }

  function saju(){
    const dmSymbol=nodeText('[data-daymaster-symbol]');const dm=stemGuide[dmSymbol];if(!dm)return;
    const dmSection=$('.daymaster-section');
    once(dmSection,'saju-daymaster',block('명리 용어를 몰라도, 이렇게 이해하면 됩니다.','일간은 성격검사 결과가 아니라 다른 기운을 비교할 때 “나”를 놓는 기준점입니다. 아래는 현재 일간이 생활에서 어떻게 보일 수 있는지를 풀어쓴 설명입니다.',[
      card('쉽게 말하면',dm[1],`명리학에서는 ${dm[0]} 일간이라고 부릅니다. ${dm[2]}`),
      card('일할 때', '이런 환경에서 강점이 잘 나와요',dm[3]),
      card('지칠 때','이런 순간은 조금 조심하세요',dm[2]),
      card('생활에서 써먹는 법','성향을 바꾸기보다 쓰는 방법을 조절하세요',dm[4])
    ],dm[4]));

    const elements=parseElements();if(elements.length){
      const strong=elements[0],weak=elements[elements.length-1],host=$('[data-balance-copy]')?.closest('.saju-report');
      const cards=['목','화','토','금','수'].map(k=>{const e=elements.find(x=>x.k===k);const g=elementGuide[k];const state=e?.k===strong.k?'현재 가장 자주 쓰는 편':e?.k===weak.k?'현재 상대적으로 덜 쓰는 편':'현재 중간 정도';return card(`${g.name}${e?` · ${e.p}%`:''}`,g.plain,e?.k===strong.k?g.high:e?.k===weak.k?g.low:`이 기능은 현재 사주에서 다른 오행과 함께 중간 정도 비중으로 나타납니다.`,state);});
      once(host,'saju-elements',block('오행을 “성격 점수”가 아니라 생활 기능으로 보면 쉽습니다.','목·화·토·금·수는 좋고 나쁨이 아니라 시작, 표현, 관리, 판단, 관찰이라는 다섯 기능을 나눠 보는 방식입니다.',cards,`${elementGuide[weak.k].tip} 특히 ${weak.k}이 낮다고 그 능력이 없다는 뜻은 아닙니다.`,'is-soft'));
    }

    const tgHost=$('[data-ten-gods]')?.closest('.saju-report');if(tgHost){
      const cards=Object.values(groupGuide).map(g=>card(g[0],g[1],g[2]));
      once(tgHost,'saju-tengods',block('십성은 어려워 보여도 결국 다섯 가지 생활 주제입니다.','숫자가 많다고 무조건 좋고, 0이라고 능력이 없다는 뜻도 아닙니다. 현재 계산에서 어떤 관계가 표면에 더 자주 보이는지를 말합니다.',cards,'십성은 “나는 돈복이 없다”처럼 단정하는 표가 아닙니다. 어떤 상황에서 주도권, 표현, 현실감각, 책임, 배움을 더 자주 쓰는지 보는 참고표로 이해하면 됩니다.'));
    }

    const lifeHost=$('[data-life-grid]')?.closest('.saju-report');if(lifeHost){
      const items=all('.life-card').map(c=>({h:text(c.querySelector('h3')),p:text(c.querySelector('p'))}));
      const checks=items.map(x=>`<div class="rf3-check"><strong>${esc(x.h||'생활')}</strong><br>${esc(clip(x.p,190))}</div>`).join('');
      once(lifeHost,'saju-life',`<div class="rf3-block is-soft"><div class="rf3-head"><div><span>REAL LIFE</span><h3>“그래서 실제로 나는 어떤 편인데?”를 여기서 확인하세요.</h3></div><p>사주 해석은 생활과 연결되지 않으면 의미가 없습니다. 아래 문장을 읽고 실제 내 경험과 맞는지 비교해보세요.</p></div><div class="rf3-checklist">${checks}</div><div class="rf3-example"><strong>읽는 팁</strong> · 모든 문장이 100% 똑같이 맞아야 하는 것은 아닙니다. 반복해서 “맞다”고 느껴지는 패턴과 실제 생활에서 자주 생기는 문제를 중심으로 보세요.</div></div>`);
    }
  }

  function ohaeng(){
    const elements=parseElements();const host=$('[data-element-cards]')?.closest('.report-section')||$('.distribution-section');
    if(host){
      const strong=elements[0],weak=elements[elements.length-1];
      const cards=['목','화','토','금','수'].map(k=>{const g=elementGuide[k],e=elements.find(x=>x.k===k);let copy=`${g.plain}입니다.`;let note='';if(e&&strong&&e.k===strong.k){copy+=` ${g.high}`;note='자연스럽게 자주 쓰는 방식';}else if(e&&weak&&e.k===weak.k){copy+=` ${g.low}`;note='필요할 때 따로 챙기면 좋은 방식';}return card(`${g.name}${e?` · ${e.p}%`:''}`,g.plain,copy,note);});
      once(host,'ohaeng-translate',block('목·화·토·금·수, 생활에서는 이렇게 번역됩니다.','오행 이름보다 “내가 자동으로 하는 행동”과 “필요할 때 일부러 해야 하는 행동”을 보는 것이 훨씬 중요합니다.',cards,weak?elementGuide[weak.k].tip:'가장 낮은 오행은 능력 부족이 아니라 덜 자동적으로 나오는 기능으로 이해하세요.'));
    }
    const strong=nodeText('[data-strong-text]'),weak=nodeText('[data-weak-text]');
    const split=$('.split-section');if(split)once(split,'ohaeng-real',block('이 차이는 실제 생활에서 이렇게 느껴질 수 있어요.','강한 오행은 힘주지 않아도 나오는 습관이고, 약한 오행은 중요한 순간에 체크리스트처럼 챙기면 좋은 부분입니다.',[
      card('자연스럽게 하는 것','별다른 노력 없이 먼저 나오는 반응',clip(strong,230)),
      card('놓치기 쉬운 것','필요할 때 일부러 챙기면 편해지는 반응',clip(weak,230))
    ],'“강한 것은 줄이고 약한 것은 억지로 키운다”보다, 잘하는 것은 그대로 쓰고 빠지는 과정만 도구와 습관으로 보완하는 방식이 현실적입니다.'));
  }

  function fortune(){
    const area=all('.fortune-card').map(c=>({h:text(c.querySelector('h3')),p:text(c.querySelector('p'))}));
    const host=$('[data-area-grid]')?.closest('.fortune-report');if(host&&area.length){
      once(host,'fortune-scenes',block('오늘 운세를 실제 하루에 대입하면 이렇게 보면 됩니다.','운세를 “좋다/나쁘다”로 끝내지 않고 일, 돈, 사람, 컨디션에서 바로 써먹을 행동으로 바꿔보세요.',area.slice(0,4).map(x=>card(x.h||'오늘','지금 이렇게 움직여보세요',clip(x.p,210))), '오늘 모든 걸 잘하려 하지 말고, 가장 중요한 한 가지에서만 이 기준을 적용해도 충분합니다.'));
    }
    const choice=$('.fortune-choice-section');if(choice){
      const dos=all('[data-do-list] li').map(text).slice(0,5),donts=all('[data-dont-list] li').map(text).slice(0,5);
      once(choice,'fortune-check',`<div class="rf3-block is-soft"><div class="rf3-head"><div><span>TODAY CHECK</span><h3>오늘 하루, 이 정도만 기억하세요.</h3></div><p>길게 읽을 시간이 없다면 아래 체크만 보고 하루 중 한 번 적용해보세요.</p></div><div class="rf3-grid"><article class="rf3-card"><small>하면 좋은 것</small><strong>오늘의 플러스 행동</strong><div class="rf3-checklist">${dos.map(x=>`<div class="rf3-check">${esc(x)}</div>`).join('')}</div></article><article class="rf3-card"><small>피하면 좋은 것</small><strong>오늘 한 번 더 생각할 행동</strong><div class="rf3-checklist">${donts.map(x=>`<div class="rf3-check">${esc(x)}</div>`).join('')}</div></article></div></div>`);
    }
    const relation=$('.fortune-relation');if(relation)once(relation,'fortune-term',`<div class="rf3-example"><strong>일진(日辰)이란?</strong> 오늘 날짜에 해당하는 천간·지지 조합입니다. 여기서는 내 띠와 오늘의 지지가 합·충·형·해 등 어떤 관계를 이루는지 참고해 “오늘 어떤 속도로 움직이면 편한지”를 설명합니다. 좋은 사건이나 나쁜 사건을 확정하는 뜻은 아닙니다.</div>`);
  }

  function relationship(){
    const host=$('[data-core-grid]')?.closest('.relationship-report');
    const emotion=nodeText('[data-emotion-text]'),distance=nodeText('[data-distance-text]'),pattern=nodeText('[data-pattern-text]'),status=nodeText('[data-status-result]');
    if(host)once(host,'relationship-profile',block(`${n()}님은 연애할 때 이런 모습이 반복될 수 있어요.`,'누구와 만나느냐도 중요하지만, 내가 호감을 표현하고 가까워지고 갈등을 풀 때 어떤 패턴을 반복하는지를 먼저 보는 게 더 현실적입니다.',[
      card('좋아질 때','호감이 생기면 이렇게 반응하는 편',clip(emotion||nodeText('[data-summary]'),220)),
      card('가까워지면','편안한 관계를 위해 필요한 것',clip(distance,220)),
      card('꼬일 때','반복해서 걸리기 쉬운 지점',clip(pattern,220)),
      card('지금 관계에서는','현재 상황에서 먼저 볼 것',clip(status,220))
    ],'상대 마음을 맞히는 것보다 “말과 행동이 반복해서 일치하는가, 내가 이 관계에서 편안하게 말할 수 있는가”를 보는 것이 훨씬 유용합니다.'));
    const patternHost=$('[data-pattern-text]')?.closest('.relationship-report');if(patternHost)once(patternHost,'relationship-reality',`<div class="rf3-block is-soft"><div class="rf3-head"><div><span>REALITY CHECK</span><h3>관계가 헷갈릴 때는 사주보다 이것부터 확인하세요.</h3></div><p>명리 해석은 관계를 보는 보조 기준입니다. 실제 관계의 건강함은 반복되는 행동에서 확인하는 것이 더 중요합니다.</p></div><div class="rf3-grid"><div class="rf3-check">말한 약속을 실제로 지키는가?</div><div class="rf3-check">내가 불편함을 말했을 때 조정하려는가?</div><div class="rf3-check">한쪽만 계속 연락·시간·감정을 더 쓰고 있지는 않은가?</div><div class="rf3-check">이 사람 앞에서 눈치를 덜 보고 내 의견을 말할 수 있는가?</div></div></div>`);
    const year=$('[data-year-text]')?.closest('.relationship-report');if(year)once(year,'relationship-year-note',`<div class="rf3-example"><strong>합·충 같은 말은 이렇게 보면 쉽습니다.</strong> · 합(合)은 관계나 상황이 맞물리는 지점이 생기기 쉬운 흐름, 충(沖)은 기존 방식과 다른 요구가 들어와 변화가 커질 수 있는 흐름입니다. “합이면 결혼, 충이면 이별”처럼 단정하는 뜻은 아닙니다.</div>`);
  }

  function work(){
    const host=$('[data-core-grid]')?.closest('.work-report');
    const strength=nodeText('[data-strength-text]'),pressure=nodeText('[data-pressure-text]'),org=nodeText('[data-organization-text]');
    const money=childrenText('[data-money-grid]',4).join(' ');
    if(host)once(host,'work-profile',block(`${n()}님은 일할 때 이런 조건에서 힘이 잘 납니다.`,'직업 이름 하나를 찍어주는 것보다 내가 어떤 환경에서 오래 잘하고, 어떤 환경에서 빨리 소모되는지를 아는 것이 더 현실적입니다.',[
      card('잘할 때','이런 환경에서는 능률이 올라가기 쉬워요',clip(strength||nodeText('[data-summary]'),230)),
      card('지칠 때','이런 구조가 반복되면 피로가 빨리 쌓여요',clip(pressure,230)),
      card('조직에서는','회사냐 프리랜서냐보다 이 조건을 보세요',clip(org,230)),
      card('돈에서는','버는 것만큼 남기는 구조가 중요해요',clip(money,230))
    ],'새 직장이나 일을 고를 때 “연봉”만 보지 말고 결정권, 업무 범위, 협업 밀도, 일정 예측 가능성, 결과가 보이는 속도까지 같이 비교해보세요.'));
    const orgHost=$('[data-organization-text]')?.closest('.work-report');if(orgHost)once(orgHost,'work-org-check',`<div class="rf3-block is-soft"><div class="rf3-head"><div><span>JOB FIT CHECK</span><h3>회사를 볼 때 이 다섯 가지를 같이 비교해보세요.</h3></div><p>“나는 조직형인가 독립형인가” 한 문장보다 실제 근무 조건이 더 중요합니다.</p></div><div class="rf3-grid three"><div class="rf3-check">내가 결정할 수 있는 범위가 얼마나 되는가</div><div class="rf3-check">업무 우선순위가 자주 뒤집히는가</div><div class="rf3-check">혼자 책임져야 하는 범위가 과도하지 않은가</div><div class="rf3-check">성과가 어떤 기준으로 평가되는가</div><div class="rf3-check">일한 만큼 경험·돈·포트폴리오 중 무엇이 남는가</div></div></div>`);
    const moneyHost=$('[data-money-grid]')?.closest('.work-report');if(moneyHost)once(moneyHost,'work-money-check',`<div class="rf3-example"><strong>재성(財星)을 쉽게 말하면</strong> · “돈복의 양”이 아니라 돈, 시간, 자원, 거래 같은 현실 조건을 어떤 방식으로 다루는지 보는 명리 분류입니다. 재성이 적게 보인다고 돈을 못 번다는 뜻은 아닙니다. 실제 재물 관리는 수입·고정비·현금흐름·지출 습관을 함께 봐야 합니다.</div>`);
  }

  function guide(){
    const hero=$('.guide-result-hero');const overview=$('[data-result-friendly-overview]');
    const answer=nodeText('[data-answer]'),problem=nodeText('[data-problem]'),reason=nodeText('[data-reason]'),warning=nodeText('[data-warning]');
    const checks=childrenText('[data-check-grid]',5),actions=childrenText('[data-action-grid]',5);
    const host=overview||hero;if(host)once(host.parentElement||root,'guide-first',`<section class="rf3-block is-dark" data-rf3-inner><div class="rf3-head"><div><span>ANSWER FIRST</span><h3>${esc(n())}님, 결론부터 보면 이렇게 정리할 수 있습니다.</h3></div><p>정월도감은 사주를 설명하는 페이지가 아니라 지금 고민을 실제 선택으로 바꾸는 페이지입니다.</p></div><blockquote class="rf3-quote">${esc(clip(answer||problem,360))}</blockquote><div class="rf3-grid" style="margin-top:10px">${card('왜 고민이 길어졌을까','지금 막히는 이유',clip(reason,220))}${card('조심할 점','이 판단만은 서두르지 마세요',clip(warning,220))}</div></section>`,'afterend');
    const checkHost=$('[data-check-grid]')?.closest('.guide-report');if(checkHost)once(checkHost,'guide-real-check',`<div class="rf3-block is-soft"><div class="rf3-head"><div><span>REALITY CHECK</span><h3>사주보다 먼저 실제 조건을 확인하세요.</h3></div><p>운이 좋아도 현실 조건이 맞지 않으면 오래가기 어렵습니다. 아래 항목은 직접 숫자와 사실로 확인해보는 것이 좋습니다.</p></div><div class="rf3-checklist">${checks.map(x=>`<div class="rf3-check">${esc(clip(x,210))}</div>`).join('')}</div></div>`);
    const actionHost=$('[data-action-grid]')?.closest('.guide-report');if(actionHost)once(actionHost,'guide-actions',`<div class="rf3-block"><div class="rf3-head"><div><span>DO IT NOW</span><h3>오늘 바로 할 수 있는 수준까지 작게 바꿔봤습니다.</h3></div><p>결정 자체가 어렵다면 결정 전에 할 수 있는 작은 행동부터 시작하면 됩니다.</p></div><div class="rf3-checklist">${actions.map(x=>`<div class="rf3-check">${esc(clip(x,210))}</div>`).join('')}</div><div class="rf3-tip"><span>중요</span><strong>“언젠가 결정해야지”보다 결정 날짜와 확인할 조건을 먼저 정하세요.</strong></div></div>`);
  }

  function enrichOverview(){
    const ov=$('[data-result-friendly-overview]');if(!ov)return;
    const intro=$('.result-friendly-head p',ov);if(intro)intro.textContent='어려운 명리 용어부터 읽지 않아도 됩니다. 먼저 “그래서 나는 어떤 편이고, 실제 생활에서 뭘 하면 좋은지”를 보고, 궁금할 때 아래의 명리 근거를 확인하세요.';
    const cards=all('.result-friendly-card',ov);cards.forEach(c=>{const p=c.querySelector('p');if(p&&text(p).length<80)p.textContent=`${text(p)} 이 문장이 실제 내 경험에서 언제 자주 나타나는지 한두 장면을 떠올려보면 결과를 훨씬 쉽게 이해할 수 있습니다.`;});
  }

  function run(){
    enrichOverview();
    if(file==='saju-result.html')saju();
    else if(file==='ohaeng-result.html')ohaeng();
    else if(file==='fortune-result.html')fortune();
    else if(file==='relationship-result.html')relationship();
    else if(file==='work-money-result.html')work();
    else if(file==='guide-result.html')guide();
  }
  let timer;const schedule=()=>{clearTimeout(timer);timer=setTimeout(run,80);};
  const obs=new MutationObserver(schedule);obs.observe(root,{subtree:true,childList:true,characterData:true});
  run();setTimeout(run,700);setTimeout(run,1600);setTimeout(run,2600);
})();