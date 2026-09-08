import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';

(()=>{
  const root=document.querySelector('[data-fortune-result]');
  if(!root)return;
  let input={};
  try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
  if(!input.birthYear)return;

  const $=(s,r=root)=>r.querySelector(s);
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const tomorrow=input.mode==='tomorrow';
  const dayWord=tomorrow?'내일':'오늘';
  const zodiacInfo={rat:{name:'쥐띠',branch:'자',hanja:'子'},ox:{name:'소띠',branch:'축',hanja:'丑'},tiger:{name:'호랑이띠',branch:'인',hanja:'寅'},rabbit:{name:'토끼띠',branch:'묘',hanja:'卯'},dragon:{name:'용띠',branch:'진',hanja:'辰'},snake:{name:'뱀띠',branch:'사',hanja:'巳'},horse:{name:'말띠',branch:'오',hanja:'午'},goat:{name:'양띠',branch:'미',hanja:'未'},monkey:{name:'원숭이띠',branch:'신',hanja:'申'},rooster:{name:'닭띠',branch:'유',hanja:'酉'},dog:{name:'개띠',branch:'술',hanja:'戌'},pig:{name:'돼지띠',branch:'해',hanja:'亥'}};
  const stems=['갑','을','병','정','무','기','경','신','임','계'];
  const stemElement={갑:'wood',을:'wood',병:'fire',정:'fire',무:'earth',기:'earth',경:'metal',신:'metal',임:'water',계:'water'};
  const elementKo={wood:'목(木)',fire:'화(火)',earth:'토(土)',metal:'금(金)',water:'수(水)'};
  const generate={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
  const control={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
  const yukhap=[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']];
  const chung=[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];
  const hae=[['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']];
  const pa=[['자','유'],['축','진'],['인','해'],['묘','오'],['사','신'],['미','술']];
  const samhap=[['신','자','진'],['해','묘','미'],['인','오','술'],['사','유','축']];
  const hyeongGroups=[['인','사','신'],['축','미','술']];
  const pairHas=(arr,a,b)=>arr.some(p=>p.includes(a)&&p.includes(b));
  const isHyeong=(a,b)=>(a===b&&['진','오','유','해'].includes(a))||pairHas([['자','묘']],a,b)||hyeongGroups.some(g=>g.includes(a)&&g.includes(b));
  const mod=(n,m)=>((n%m)+m)%m;
  const birthStem=year=>stems[mod(Number(year)-4,10)];

  const branchPack={
    자:{words:'정보 · 정리',note:'작은 신호와 정보를 모아 다음 순서를 정리하는 데 잘 맞는 흐름입니다.'},
    축:{words:'축적 · 점검',note:'눈에 띄는 변화보다 쌓인 일과 조건을 점검할수록 편한 흐름입니다.'},
    인:{words:'시작 · 이동',note:'정체된 일에 첫 움직임을 만들거나 방향을 바꾸기 좋은 흐름입니다.'},
    묘:{words:'관계 · 확장',note:'사람과 대화의 접점을 넓히되 속도를 맞추는 것이 중요한 흐름입니다.'},
    진:{words:'전환 · 정리',note:'기존 흐름을 정리하고 다음 단계로 넘어갈 준비를 하기 좋은 흐름입니다.'},
    사:{words:'표현 · 속도',note:'생각을 말이나 행동으로 꺼낼수록 흐름이 살아나는 편입니다.'},
    오:{words:'실행 · 결정',note:'준비한 것을 실제 행동으로 옮기되 과한 확장은 줄이는 편이 좋습니다.'},
    미:{words:'조율 · 관리',note:'사람·일정·돈의 균형을 맞추고 반복되는 일을 정리하기 좋은 흐름입니다.'},
    신:{words:'판단 · 변화',note:'선택지를 비교하고 필요한 변화를 실제 결정으로 옮기기 좋은 흐름입니다.'},
    유:{words:'정리 · 기준',note:'애매한 것을 줄이고 기준을 분명하게 세울수록 편한 흐름입니다.'},
    술:{words:'마무리 · 책임',note:'새 일을 벌이기보다 책임질 일과 마무리할 일을 구분하는 편이 좋습니다.'},
    해:{words:'관찰 · 회복',note:'바로 결론 내리기보다 한 번 더 살피고 체력을 남겨두는 편이 좋은 흐름입니다.'}
  };
  const elementPack={
    wood:{headline:'작은 시작 하나를 만드는 쪽이 좋습니다.',work:'새로운 일을 크게 벌이기보다 첫 단계가 분명한 일 하나를 시작해보세요.',money:'새 지출은 목적과 시작 비용을 먼저 정하면 좋습니다.',love:'관계에서는 먼저 가볍게 말을 걸거나 다음 약속의 계기를 만들어보세요.',life:'움직임을 늘리되 일정 끝까지 갈 수 있는 체력을 남겨두세요.'},
    fire:{headline:'생각을 밖으로 꺼낼수록 흐름이 살아납니다.',work:'미뤄둔 제안·발표·공유처럼 결과물이 보이는 일을 하나 꺼내보세요.',money:'기분에 따른 소비보다 이미 정한 예산 안에서 필요한 것만 빠르게 결정하세요.',love:'호감이나 필요한 말은 돌려 말하기보다 짧고 부드럽게 표현하는 편이 좋습니다.',life:'초반 속도가 붙어도 저녁까지 에너지를 모두 당겨 쓰지는 마세요.'},
    earth:{headline:'벌이기보다 정리하고 유지하는 쪽이 편합니다.',work:'진행 중인 업무 하나를 마무리하고 다음 순서를 정리하는 데 힘을 써보세요.',money:'정기 결제·반복 지출처럼 매달 나가는 돈 하나를 점검해보세요.',love:'새로운 결론보다 약속과 생활 리듬이 실제로 맞는지 확인하는 편이 좋습니다.',life:'식사·휴식·이동 시간을 줄이지 말고 하루 리듬을 안정적으로 유지하세요.'},
    metal:{headline:'선택지를 줄이고 기준을 세우는 게 좋습니다.',work:'해야 할 일과 하지 않아도 될 일을 나누고 우선순위를 분명히 해보세요.',money:'큰 지출은 가격보다 유지비·해지 조건·실제 사용 가능성을 함께 보세요.',love:'상대의 말과 행동이 반복해서 일치하는지를 기준으로 보는 편이 좋습니다.',life:'정리할 것 하나를 버리거나 완료 표시를 남기면 체감이 좋아집니다.'},
    water:{headline:'바로 답하기보다 한 번 더 살피는 게 좋습니다.',work:'자료 두세 개를 비교하고 필요한 정보를 확인한 뒤 결정해보세요.',money:'결제 전 최근 지출과 현금흐름을 한 번 확인하면 불필요한 소비를 줄이기 쉽습니다.',love:'한 번의 답장보다 최근 며칠의 연락 패턴과 약속을 지키는지를 함께 보세요.',life:'일정 사이에 여백을 두고 생각을 정리할 시간을 조금 남겨두세요.'}
  };

  function seoulDate(offset=0){
    const now=new Date(Date.now()+offset*86400000);
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const get=t=>parts.find(p=>p.type===t)?.value||'';
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  function pillarString(v){return typeof v==='string'?v:(v?.korean||v?.name||'');}
  function calcDay(dateString){
    const [year,month,day]=dateString.split('-').map(Number);
    const r=calculateFourPillars({year,month,day,hour:12,minute:0,isLunar:false});
    const o=typeof r?.toObject==='function'?r.toObject():r;
    const p=pillarString(o?.day);
    return {pillar:p,stem:[...p][0],branch:[...p][1]};
  }
  function relation(my,today){
    if(pairHas(yukhap,my,today))return {key:'yukhap',label:'육합',delta:18,title:'사람과 일이 자연스럽게 이어지기 쉬운 흐름',copy:'연결점이 생기기 쉬운 날입니다. 먼저 손을 내밀되 상대의 속도까지 같다고 가정하지는 마세요.'};
    if(samhap.some(g=>g.includes(my)&&g.includes(today)))return {key:'samhap',label:'삼합',delta:12,title:'혼자 밀기보다 연결을 활용하면 좋은 흐름',copy:'협업·대화·정보 연결을 활용하면 일이 조금 더 부드럽게 풀릴 수 있습니다.'};
    if(pairHas(chung,my,today))return {key:'chung',label:'충',delta:-18,title:'변수가 생기기 쉬워 속도를 조절할 흐름',copy:'계획과 다른 요청이나 반응이 들어올 수 있습니다. 바로 맞서기보다 무엇이 달라졌는지 먼저 확인하세요.'};
    if(isHyeong(my,today))return {key:'hyeong',label:'형',delta:-12,title:'같은 문제를 반복하지 않도록 점검할 흐름',copy:'익숙한 반응을 그대로 반복하면 피로가 커질 수 있습니다. 한 번 멈추고 다른 대응을 시도해보세요.'};
    if(pairHas(hae,my,today))return {key:'hae',label:'해',delta:-10,title:'말보다 확인이 중요한 흐름',copy:'상대의 의도나 상황을 혼자 해석하기보다 짧게 확인하는 편이 오해를 줄이기 좋습니다.'};
    if(pairHas(pa,my,today))return {key:'pa',label:'파',delta:-7,title:'작은 어긋남을 바로 정리하면 편한 흐름',copy:'큰 문제보다 일정·답장·약속 같은 작은 어긋남이 신경 쓰일 수 있습니다. 미루지 말고 하나씩 정리해보세요.'};
    if(my===today)return {key:'same',label:'동일 지지',delta:5,title:'평소 내 방식이 더 강하게 드러나는 흐름',copy:'익숙한 장점이 잘 나오지만 평소 반복하던 실수도 함께 커질 수 있어 한 번 더 점검하면 좋습니다.'};
    return {key:'neutral',label:'평이한 관계',delta:0,title:'큰 충돌보다 내 선택 방식이 더 중요한 흐름',copy:'외부 변수보다 내가 어떤 순서로 움직이고 무엇을 먼저 확인하는지가 체감을 더 크게 바꿀 수 있습니다.'};
  }
  function stemRel(birth,today){
    const b=stemElement[birth],t=stemElement[today];
    if(b===t)return {delta:5,label:`${elementKo[t]} 성향이 겹침`};
    if(generate[t]===b)return {delta:8,label:'오늘 기운이 내 흐름을 받쳐줌'};
    if(generate[b]===t)return {delta:3,label:'내 에너지를 밖으로 쓰는 흐름'};
    if(control[t]===b)return {delta:-8,label:'한 번 더 조건을 확인할 흐름'};
    if(control[b]===t)return {delta:2,label:'내가 기준을 세워야 하는 흐름'};
    return {delta:0,label:'오행 관계는 무난한 편'};
  }
  function scoreLabel(score){
    if(score>=68)return '움직임을 활용하기 좋은 편';
    if(score>=56)return '조심스럽게 실행해도 좋은 편';
    if(score>=44)return '균형과 순서가 중요한 편';
    return '점검과 확인이 더 중요한 편';
  }

  function build(){
    const expected=seoulDate(tomorrow?1:0);
    if(input.targetDate!==expected){
      input.targetDate=expected;
      try{sessionStorage.setItem('jungwoljae_fortune_input',JSON.stringify(input));}catch(e){}
    }
    const day=calcDay(expected);
    const z=zodiacInfo[input.zodiac]||zodiacInfo.rat;
    const br=relation(z.branch,day.branch);
    const sr=stemRel(birthStem(input.birthYear),day.stem);
    const score=Math.max(22,Math.min(82,52+br.delta+sr.delta));
    const ep=elementPack[stemElement[day.stem]||'earth'];
    const bp=branchPack[day.branch]||branchPack.축;
    const dateLabel=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date(`${expected}T12:00:00`));

    const headline=`${dayWord}은 ${br.key==='neutral'?ep.headline:br.title+'입니다.'}`;
    const signal=`${dateLabel}의 일진은 ${day.pillar}입니다. ${br.copy} ${bp.note}`;
    const h=$('[data-headline]');if(h)h.textContent=headline;
    const note=$('[data-signal-note]');if(note)note.textContent=signal;

    const meta=$('[data-meta]');
    if(meta)meta.innerHTML=`<span>${expected}</span><span>${input.birthYear}년</span><span>${z.hanja} ${z.name}</span><span>${dayWord} 일진 ${day.pillar}</span><span>${scoreLabel(score)}</span>`;

    const relationBox=$('.fortune-relation');
    if(relationBox)relationBox.innerHTML=`<p class="fortune-label">01 · ${tomorrow?'TOMORROW':'TODAY'} AT A GLANCE</p><h2>${dayWord}의 흐름을 한마디로 보면</h2><div class="relation-pills"><span>${day.pillar}</span><span>${br.label}</span><span>${bp.words}</span></div><p><strong style="display:block;margin-bottom:7px;color:#2b2524;font-size:14px;line-height:22px">${esc(br.title)}</strong>${esc(br.copy)} ${esc(bp.note)}</p>`;

    const story=$('[data-fortune-story]');
    if(story)story.innerHTML=`<p>${esc(input.name||'회원')}님에게 ${dayWord}은 <strong>${esc(day.pillar)}</strong> 일진이 들어옵니다. ${esc(elementKo[stemElement[day.stem]||'earth'])}의 성격과 ${esc(bp.words)} 흐름이 함께 보여, 같은 일을 하더라도 ${esc(ep.headline.replace('습니다.',''))} 쪽이 더 자연스럽습니다.</p><p>띠 기준으로는 <strong>${esc(br.label)}</strong> 관계입니다. ${esc(br.copy)} 그래서 ${dayWord}은 좋은 날·나쁜 날 하나로 단정하기보다, 어떤 장면에서 속도를 내고 어디서 한 번 더 확인할지를 구분해서 쓰는 편이 좋습니다.</p><p>${esc(ep.work)} 관계에서는 ${esc(ep.love)} 돈과 생활에서는 ${esc(ep.money)} ${esc(ep.life)}</p>`;

    const area=$('[data-area-grid]');
    if(area){
      const areas=[
        ['재물운',ep.money,br.delta<0?'큰 금액은 바로 확정하지 말고 숫자와 조건을 다시 확인하세요.':'계획된 범위 안에서 움직이면 무리가 적습니다.','돈'],
        ['연애운',ep.love,br.delta>8?'먼저 연결을 만들어도 좋지만 상대의 답을 재촉하지는 마세요.':br.delta<0?'추측보다 확인 질문이 훨씬 도움이 됩니다.':'한 번의 반응보다 반복되는 태도를 기준으로 보세요.','마음'],
        ['일·학업운',ep.work,score>=56?'준비된 일 하나는 실제 결과물로 옮겨보세요.':'범위를 넓히기보다 누락과 순서를 먼저 확인하세요.','일'],
        ['생활운',ep.life,bp.note,'리듬']
      ];
      area.innerHTML=areas.map(([t,a,b,tag],i)=>`<article class="fortune-card"><span>${String(i+1).padStart(2,'0')}</span><h3>${esc(t)}</h3><p><strong style="display:block;margin-bottom:7px;color:#2b2524;font-size:14px;line-height:22px">${esc(a)}</strong>${esc(b)}</p><strong>${esc(tag)}</strong></article>`).join('');
    }

    const key=$('[data-key-grid]');
    if(key)key.innerHTML=[
      [`01 · ${dayWord} 일진`,day.pillar,`${day.pillar}의 핵심 생활 키워드는 ${bp.words}입니다.`],
      ['02 · 띠와의 관계',br.label,br.title],
      ['03 · 행동 기준',ep.headline.replace('습니다.',''),`${ep.work} ${score<44?'특히 되돌리기 어려운 결정은 한 번 더 확인하세요.':''}`]
    ].map(([l,t,p])=>`<article class="fortune-key-card"><span>${esc(l)}</span><strong>${esc(t)}</strong><p>${esc(p)}</p></article>`).join('');

    const tipFinal=$('[data-tip-final]');
    if(tipFinal)tipFinal.textContent=`${dayWord}은 ${day.pillar} 일진의 ${bp.words} 흐름을 기억하세요. ${ep.headline}`;

    const keySection=key?.closest('.fortune-report');
    if(keySection){const h2=keySection.querySelector('h2');if(h2)h2.textContent=`${dayWord} 이것만 기억해도 충분합니다.`;}
  }

  [0,900,2400,5200,7000].forEach(ms=>setTimeout(()=>{try{build();}catch(e){console.error('[fortune-daily-v10]',e);}},ms));
})();
