import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';

(()=>{
  const root=document.querySelector('[data-fortune-result]');
  if(!root)return;
  const $=(s,r=root)=>r.querySelector(s);
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const text=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();
  let input={};
  try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
  if(!input.birthDate){root.dataset.finalState='ready';return;}

  const tomorrow=input.mode==='tomorrow';
  const dayWord=tomorrow?'내일':'오늘';
  const stemInfo={갑:{e:'wood',p:'yang'},을:{e:'wood',p:'yin'},병:{e:'fire',p:'yang'},정:{e:'fire',p:'yin'},무:{e:'earth',p:'yang'},기:{e:'earth',p:'yin'},경:{e:'metal',p:'yang'},신:{e:'metal',p:'yin'},임:{e:'water',p:'yang'},계:{e:'water',p:'yin'}};
  const elementKo={wood:'목(木)',fire:'화(火)',earth:'토(土)',metal:'금(金)',water:'수(水)'};
  const generates={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
  const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
  const yukhap=[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']];
  const chung=[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];
  const hae=[['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']];
  const pa=[['자','유'],['축','진'],['인','해'],['묘','오'],['사','신'],['미','술']];
  const samhap=[['신','자','진'],['해','묘','미'],['인','오','술'],['사','유','축']];
  const hyeongGroups=[['인','사','신'],['축','미','술']];
  const pairHas=(arr,a,b)=>arr.some(p=>p.includes(a)&&p.includes(b));
  const isHyeong=(a,b)=>(a===b&&['진','오','유','해'].includes(a))||pairHas([['자','묘']],a,b)||hyeongGroups.some(g=>g.includes(a)&&g.includes(b));
  const pillarString=v=>typeof v==='string'?v:(v?.korean||v?.name||'');

  const elementPack={
    wood:{keywords:'시작 · 확장 · 첫걸음',headline:'작게라도 먼저 시작하면 흐름이 살아납니다.',work:'아이디어를 더 모으기보다 첫 결과물을 만드는 쪽이 좋습니다. 메일 한 통, 초안 한 장, 일정 하나처럼 시작의 흔적을 남겨보세요.',money:'새 지출이 생기기 쉬운 날입니다. “필요한가?”보다 “이 돈이 무엇을 시작하게 해주는가?”를 먼저 보면 판단이 선명해집니다.',love:'관계에서는 먼저 말을 걸거나 약속의 계기를 만드는 쪽이 자연스럽습니다. 기다리기만 하기보다 가벼운 표현 하나가 분위기를 바꿀 수 있습니다.',life:'움직임을 늘리면 기분도 따라옵니다. 다만 하루를 너무 크게 벌이면 저녁에 체력이 먼저 퇴근할 수 있으니 시작은 작게 잡으세요.',color:'청록 · 연두',object:'작은 노트 · 식물',direction:'동쪽',time:'오전 7시–11시'},
    fire:{keywords:'표현 · 실행 · 반응',headline:'생각을 밖으로 꺼낼수록 기운이 붙습니다.',work:'말·제안·발표·공유처럼 눈에 보이는 행동이 잘 맞습니다. 머릿속 회의만 길게 하지 말고 실제 결과물을 사람 앞에 한 번 꺼내보세요.',money:'기분이 좋을수록 결제 버튼도 가벼워질 수 있습니다. 필요한 소비는 빠르게 해도 좋지만 “이왕이면 이것도”가 붙는 순간 한 번 멈춰보세요.',love:'호감이나 필요한 말은 돌려 말하기보다 솔직하게 표현하는 편이 좋습니다. 답장 한 줄에 드라마 한 편을 만들기보다 내가 하고 싶은 말을 먼저 정리해보세요.',life:'사람을 만나고 움직일수록 에너지가 살아납니다. 다만 과열되면 말도 일정도 커질 수 있으니 저녁에는 속도를 조금 낮추세요.',color:'주황 · 자주',object:'조명 · 펜',direction:'남쪽',time:'오전 10시–오후 2시'},
    earth:{keywords:'정리 · 안정 · 유지',headline:'벌이기보다 정리하고 안정시키는 데 강한 날입니다.',work:'새 일을 더 얹기보다 진행 중인 업무 하나를 끝내는 편이 좋습니다. 할 일 목록이 길다고 하루가 더 길어지는 건 아니니 완료 표시 하나를 먼저 만드세요.',money:'돈을 크게 벌고 쓰는 날이라기보다 흐름을 정리하는 날입니다. 정기결제, 반복 지출, 묵혀둔 비용처럼 조용히 새는 돈을 찾아내면 체감이 좋습니다.',love:'관계에서는 화려한 표현보다 약속을 지키는 태도가 더 크게 보입니다. 상대가 무엇을 말했는지보다 실제로 어떤 행동을 반복하는지 살펴보세요.',life:'식사·휴식·이동 시간을 일정하게 두면 하루가 편해집니다. 일정표가 테트리스가 되기 전에 빈칸 하나는 남겨두는 게 좋습니다.',color:'베이지 · 황토',object:'수첩 · 정리함',direction:'가운데 · 익숙한 공간',time:'오후 1시–5시'},
    metal:{keywords:'판단 · 기준 · 정리',headline:'선택지를 줄이고 기준을 세울수록 선명해집니다.',work:'무엇을 더 할지보다 무엇을 끝내고 무엇을 빼야 할지 정하는 게 좋습니다. 애매한 업무 하나를 “한다/안 한다/나중에 한다”로 나눠보세요.',money:'가격표보다 유지비와 실제 쓰임을 같이 보면 좋습니다. 싸게 산 물건이 서랍에서 가장 비싼 물건이 되는 일은 생각보다 자주 생깁니다.',love:'말보다 행동의 일관성을 보는 편이 좋습니다. 약속을 지키는지, 불편한 말을 했을 때 태도가 달라지는지처럼 반복되는 패턴이 답에 가깝습니다.',life:'정리·삭제·마감에 힘이 붙습니다. 파일 하나, 방 한 칸, 미뤄둔 신청 하나처럼 “끝났다”는 표시를 남기면 체감이 좋아집니다.',color:'아이보리 · 실버',object:'금속 펜 · 키링',direction:'서쪽',time:'오후 3시–7시'},
    water:{keywords:'관찰 · 정보 · 여백',headline:'바로 답하기보다 한 번 더 살피면 답이 보입니다.',work:'자료를 두세 개 비교하고 빠진 조건을 확인한 뒤 움직이기 좋습니다. 오늘은 “빨리 답한 사람”보다 “놓치지 않은 사람”이 편해질 수 있습니다.',money:'지갑은 기분보다 숫자에 더 솔직합니다. 최근 지출과 남은 예산을 한 번 보고 결제하면, 사고 나서 이유를 만드는 일을 줄일 수 있습니다.',love:'한 번의 답장보다 며칠간의 흐름을 함께 보세요. 연락이 느린 하루를 관계 전체의 결론으로 만들 필요는 없습니다.',life:'일정 사이에 여백을 두면 판단이 좋아집니다. 생각할 시간이 없을수록 사소한 일까지 크게 느껴질 수 있으니 조용한 시간 하나를 남겨두세요.',color:'네이비 · 블루',object:'물병 · 이어폰',direction:'북쪽',time:'저녁 7시–11시'}
  };
  const branchWords={자:'정보 · 정리',축:'축적 · 점검',인:'시작 · 이동',묘:'관계 · 확장',진:'전환 · 정리',사:'표현 · 속도',오:'실행 · 결정',미:'조율 · 관리',신:'판단 · 변화',유:'정리 · 기준',술:'마무리 · 책임',해:'관찰 · 회복'};

  function seoulDate(offset=0){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get=t=>parts.find(p=>p.type===t)?.value||'';
    const d=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00+09:00`);d.setDate(d.getDate()+offset);
    return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  }
  function calcDay(dateString,{time='12:00',lunar=false,leap=false,gender=''}={}){
    const [year,month,day]=dateString.split('-').map(Number),[hour,minute]=String(time||'12:00').split(':').map(Number);
    const r=calculateFourPillars({year,month,day,hour:Number.isFinite(hour)?hour:12,minute:Number.isFinite(minute)?minute:0,isLunar:lunar,isLeapMonth:leap,gender:gender||undefined});
    const o=typeof r?.toObject==='function'?r.toObject():r,p=pillarString(o?.day);
    return {pillar:p,stem:[...p][0],branch:[...p][1]};
  }
  function branchRelation(a,b){
    if(pairHas(yukhap,a,b))return {label:'육합',delta:18,title:'사람과 일이 자연스럽게 맞물리는 흐름',copy:'내가 먼저 움직인 만큼 접점이 생기기 쉬운 날입니다.'};
    if(samhap.some(g=>g.includes(a)&&g.includes(b)))return {label:'삼합',delta:12,title:'연결을 활용할수록 커지는 흐름',copy:'혼자 밀기보다 사람·정보·협업을 연결할 때 기운이 좋아집니다.'};
    if(pairHas(chung,a,b))return {label:'충',delta:-18,title:'변화가 크게 들어오는 흐름',copy:'예상과 다른 요청이나 반응이 생길 수 있어 방향을 빠르게 조정하는 힘이 중요합니다.'};
    if(isHyeong(a,b))return {label:'형',delta:-12,title:'반복되는 문제를 바로잡는 흐름',copy:'익숙한 방식에서 생기던 피로를 다른 방법으로 끊어내기 좋은 날입니다.'};
    if(pairHas(hae,a,b))return {label:'해',delta:-10,title:'말과 관계의 결을 세심하게 볼 흐름',copy:'작은 말과 태도의 차이가 크게 느껴질 수 있어 진짜 의도를 읽는 게 중요합니다.'};
    if(pairHas(pa,a,b))return {label:'파',delta:-7,title:'작은 어긋남을 정리하는 흐름',copy:'미뤄둔 일정·답장·약속을 하나씩 정리하면 흐름이 바로 가벼워집니다.'};
    if(a===b)return {label:'동일 지지',delta:5,title:'평소 내 성향이 강하게 드러나는 흐름',copy:'익숙한 장점도 잘 나오고 반복하던 습관도 함께 커질 수 있습니다.'};
    return {label:'평이',delta:2,title:'내 선택이 흐름을 만드는 날',copy:'외부 변수보다 내가 무엇을 먼저 하고 어떤 기준을 세우는지가 중요합니다.'};
  }
  function stemRelation(a,b){
    const A=stemInfo[a],B=stemInfo[b];if(!A||!B)return {label:'오행 흐름 평이',delta:0};
    if(A.e===B.e)return {label:`${elementKo[B.e]}의 힘이 겹침`,delta:A.p===B.p?6:4};
    if(generates[A.e]===B.e)return {label:'내 기운이 밖으로 이어짐',delta:5};
    if(generates[B.e]===A.e)return {label:'날짜의 기운이 나를 받쳐줌',delta:8};
    if(controls[A.e]===B.e)return {label:'내가 기준을 세우는 흐름',delta:2};
    if(controls[B.e]===A.e)return {label:'압박을 정리하며 움직이는 흐름',delta:-7};
    return {label:'오행 흐름 평이',delta:0};
  }
  function hash(str){let h=2166136261;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function luckyNumbers(seed){let x=seed||1,out=[];while(out.length<3){x^=x<<13;x^=x>>>17;x^=x<<5;const n=1+((x>>>0)%9);if(!out.includes(n))out.push(n);}return out.sort((a,b)=>a-b);}

  function helpfulLists(element,relation){
    const ep=elementPack[element];
    const positive=[
      ['가장 중요한 한 가지를 먼저 끝내기',`${dayWord}은 ${ep.headline} 할 일을 다 늘어놓기보다 하나를 골라 끝까지 밀어보세요.`],
      ['사람과의 약속은 짧고 분명하게 잡기',relation.label==='육합'||relation.label==='삼합'?'연결의 기운이 좋아 먼저 연락하거나 만남을 잡기 좋습니다.':'말을 길게 돌리기보다 필요한 내용과 시간을 분명히 하면 흐름이 편해집니다.'],
      ['돈은 쓰기 전에 목적 한 줄 적기',ep.money],
      ['중간에 10분짜리 여백 만들기',`${dayWord}은 속도를 계속 유지하는 것보다 한 번씩 리듬을 고르는 시간이 도움이 됩니다.`],
      ['미뤄둔 작은 정리 하나 끝내기',`${branchWords[calcDay(seoulDate(tomorrow?1:0)).branch]||'정리'}의 흐름을 살리려면 답장·파일·일정 중 하나를 끝내보세요.`]
    ];
    const caution=[
      ['완벽한 답을 기다리며 시작 미루기','조건이 다 맞을 때까지 기다리면 좋은 타이밍도 같이 지나갈 수 있습니다. 필요한 기준 두세 개만 확인하고 다음 단계로 넘어가세요.'],
      ['한 번의 반응을 관계 전체로 확대하기','답장 한 번, 말 한마디, 표정 하나만으로 결론을 만들지 마세요. 반복되는 행동을 같이 보는 편이 좋습니다.'],
      ['일정을 빈칸 없이 꽉 채우기','작은 변수 하나만 생겨도 하루 전체가 밀릴 수 있습니다. 이동과 식사 사이에 숨 쉴 틈 하나는 남겨두세요.'],
      ['비교 때문에 소비 기준 바꾸기','다른 사람의 선택보다 지금 내 지갑과 실제 필요를 기준으로 보는 편이 좋습니다.'],
      ['일·돈·관계를 한 번에 다 해결하려 하기','하루에 인생 세 과목을 동시에 기말고사 볼 필요는 없습니다. 가장 중요한 문제 하나부터 순서대로 보세요.']
    ];
    return {positive,caution};
  }

  function render(){
    try{
      const expected=seoulDate(tomorrow?1:0);
      input.targetDate=expected;sessionStorage.setItem('jungwoljae_fortune_input',JSON.stringify(input));
      const natal=calcDay(input.birthDate,{time:input.birthTime||'12:00',lunar:input.calendarType==='lunar',leap:Boolean(input.isLeapMonth),gender:input.gender||''});
      const target=calcDay(expected);
      const br=branchRelation(natal.branch,target.branch),sr=stemRelation(natal.stem,target.stem),element=stemInfo[target.stem]?.e||'earth',ep=elementPack[element];
      const score=Math.max(20,Math.min(88,54+br.delta+sr.delta));
      const name=input.name||'회원',dateLabel=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date(`${expected}T12:00:00+09:00`));
      const headline=score>=68?`${dayWord}은 ${ep.headline}`:score>=48?`${dayWord}은 ${br.title}입니다.`:`${dayWord}은 ${br.title}입니다.`;
      const summary=`${name}님의 일주 ${natal.pillar}과 ${dayWord} 일진 ${target.pillar}을 맞춰보면 ${br.label}의 관계가 잡힙니다. ${sr.label}까지 함께 들어와 ${br.copy} ${ep.headline}`;

      const kicker=$('.fortune-kicker');if(kicker)kicker.textContent=`${tomorrow?"TOMORROW'S":"TODAY'S"} FORTUNE · 正月齋`;
      const heroH=$('.fortune-hero h1');if(heroH)heroH.innerHTML=`<span data-name>${esc(name)}</span>님, ${dayWord}은<br />어떤 기운이 들어올까요?`;
      const hero=$('[data-summary]');if(hero)hero.textContent=summary;
      const meta=$('[data-meta]');if(meta)meta.innerHTML=`<span>${expected}</span><span>${dateLabel}</span><span>내 일주 ${natal.pillar}</span><span>${dayWord} 일진 ${target.pillar}</span>`;
      const signalLabel=$('.fortune-signal span');if(signalLabel)signalLabel.textContent=`${dayWord}의 한줄 결론`;
      const head=$('[data-headline]');if(head)head.textContent=headline;
      const note=$('[data-signal-note]');if(note)note.textContent=summary;

      const relation=$('.fortune-relation');if(relation)relation.innerHTML=`<p class="fortune-label">01 · ${tomorrow?'TOMORROW':'TODAY'} × MY SAJU</p><h2>내 일주와 ${dayWord} 일진이 어떻게 만날까?</h2><div class="relation-pills"><span>${natal.pillar}</span><span>${br.label}</span><span>${target.pillar}</span></div><p>${esc(`${br.copy} ${sr.label}이 함께 들어와 ${ep.headline}`)}</p>`;

      const storySection=$('.fortune-story-section');if(storySection){storySection.querySelector('.fortune-label').textContent=`02 · ${tomorrow?"TOMORROW'S":"TODAY'S"} FLOW`;storySection.querySelector('h2').textContent=`${dayWord} 하루를 한 번에 보면`;}
      const story=$('[data-fortune-story]');if(story)story.innerHTML=`<p><strong>${dayWord}의 중심은 ${ep.keywords}입니다.</strong> ${br.copy} ${sr.label}이 함께 잡혀서, 같은 일을 하더라도 순서와 말의 방식에 따라 체감이 꽤 달라질 수 있습니다.</p><p>${ep.work} 특히 ${br.label==='충'||br.label==='형'?'변수가 생겼을 때 바로 맞서기보다 한 번 방향을 바꾸는 유연함이 중요합니다.':'이미 준비해둔 일이 있다면 생각만 더 보태기보다 실제 행동 하나를 남기는 편이 좋습니다.'}</p><p>${ep.life} ${dayWord}은 거창한 사건보다 작은 선택의 리듬이 전체 분위기를 만드는 날에 가깝습니다.</p>`;

      const area=$('[data-area-grid]');if(area)area.innerHTML=[
        ['01','재물운','돈의 흐름은 “얼마나 쓰느냐”보다 “왜 쓰느냐”에서 갈립니다.',`${ep.money} ${score>=60?'필요한 지출은 너무 오래 끌지 않아도 좋습니다. 대신 오늘 기분 때문에 범위가 커지는지만 한 번 확인하세요.':'큰 지출보다 반복되는 작은 돈의 흐름을 보는 편이 좋습니다. 자동결제나 자주 새는 항목 하나를 잡으면 체감이 큽니다.'} 지갑은 말을 안 하지만 숫자는 꽤 솔직합니다.`,'재물'],
        ['02','연애운','한 번의 반응보다 관계의 흐름 전체를 보는 날입니다.',`${ep.love} ${br.label==='육합'||br.label==='삼합'?'먼저 다가가거나 대화를 열기 좋은 편이라 작은 표현 하나가 예상보다 자연스럽게 이어질 수 있습니다.':br.label==='충'||br.label==='해'?'감정이 먼저 커지면 상대의 말보다 내 해석이 앞설 수 있습니다. 답장 한 줄에 드라마 한 편을 만들기보다 실제 행동을 함께 보세요.':'상대의 속도와 내 속도가 꼭 같을 필요는 없습니다. 편하게 말이 이어지는지를 먼저 보는 편이 좋습니다.'}`,'인연'],
        ['03','일·학업운','할 일의 개수보다 끝나는 일이 있는지가 중요합니다.',`${ep.work} ${score>=60?'제안·제출·공유처럼 결과가 눈에 보이는 일을 하나 꺼내면 흐름이 붙습니다.':'새 범위를 계속 넓히기보다 이미 잡은 일의 수정·마무리·복습에 힘을 쓰는 편이 효율적입니다.'} 할 일 목록이 길다고 하루가 더 길어지는 건 아니니 완료 표시 하나부터 만들어보세요.`,'일'],
        ['04','생활운','리듬을 잘 잡으면 작은 변수도 덜 피곤합니다.',`${ep.life} 일정이 너무 촘촘하면 사소한 지연도 크게 느껴질 수 있습니다. 이동·식사·휴식 중 하나는 일부러 여유 있게 잡아두세요. 일정표가 테트리스가 되기 전에 빈칸 하나 남기는 게 생각보다 큰 차이를 만듭니다.`,'생활']
      ].map(([n,t,h,p,b])=>`<article class="fortune-card"><span>${n}</span><h3>${t}</h3><p><strong>${h}</strong>${p}</p><strong>${b}</strong></article>`).join('');
      const areaSec=area?.closest('.fortune-report');if(areaSec){areaSec.querySelector('.fortune-label').textContent='03 · FORTUNE BY AREA';areaSec.querySelector('h2').textContent=`${dayWord}의 운세를 분야별로 보면`;}

      const timeGrid=$('[data-time-grid]');if(timeGrid){
        const slots={wood:[['오전','시작할 일','새로운 일의 첫 단계, 연락, 일정 잡기에 좋습니다.'],['오후','연결할 일','사람과 정보를 이어 다음 단계로 넘겨보세요.'],['저녁','정리할 일','시작한 일을 너무 늘리지 말고 마감선을 잡으세요.']],fire:[['오전','꺼내 보여주기','제안·공유·발표처럼 밖으로 표현하는 일을 앞쪽에 두세요.'],['오후','반응 확인하기','사람의 반응을 보고 방향을 조금 조정하기 좋습니다.'],['저녁','열기 식히기','새 약속을 더 잡기보다 오늘 한 일을 정리하세요.']],earth:[['오전','순서 정리하기','해야 할 일의 우선순위를 먼저 고르면 하루가 안정됩니다.'],['오후','마무리하기','진행 중인 일을 하나 끝내는 데 힘을 써보세요.'],['저녁','생활 리듬 회복','식사와 휴식을 제시간에 챙길수록 다음 날이 편합니다.']],metal:[['오전','기준 세우기','해야 할 일과 빼도 될 일을 먼저 나눠보세요.'],['오후','결정 내리기','비교가 끝난 사안은 결론을 내리고 다음 단계로 넘기기 좋습니다.'],['저녁','정리와 삭제','파일·메시지·물건처럼 미뤄둔 정리를 끝내보세요.']],water:[['오전','자료 모으기','결정 전에 필요한 정보 두세 개를 확인하기 좋습니다.'],['오후','비교하고 판단하기','사람·금액·조건을 한 번 더 맞춰보세요.'],['저녁','생각 정리하기','조용한 시간에 내일 순서를 미리 정리하면 편합니다.']]}[element];
        timeGrid.innerHTML=slots.map(([a,b,c],i)=>`<article class="fortune-time-card"><span>${String(i+1).padStart(2,'0')} · ${a}</span><strong>${b}</strong><p>${c}</p></article>`).join('');
        const sec=timeGrid.closest('.fortune-report');sec.querySelector('h2').textContent=`${dayWord} 오전·오후·저녁의 흐름`;sec.querySelector('.fortune-section-lead').textContent=`${dayWord} 일진의 ${elementKo[element]} 성향을 시간대별 행동으로 풀었습니다.`;
      }

      const lists=helpfulLists(element,br);
      const renderList=(selector,items)=>{const ul=$(selector);if(ul)ul.innerHTML=items.map(([t,p],i)=>`<li data-index="${String(i+1).padStart(2,'0')}"><div><strong>${t}</strong><span>${p}</span></div></li>`).join('');};
      renderList('[data-do-list]',lists.positive);renderList('[data-dont-list]',lists.caution);
      const choice=$('.fortune-choice-section');if(choice){choice.querySelector('h2').textContent=`${dayWord}은 이렇게 움직이면 좋습니다.`;choice.querySelector('.fortune-section-lead').textContent=`${dayWord}의 일진과 내 일주가 만나는 흐름을 행동으로 바로 풀었습니다.`;choice.querySelector('.positive>span').textContent=`${dayWord} 해보면 좋은 것`;choice.querySelector('.caution>span').textContent=`${dayWord}은 조금 줄일 것`;}

      const key=$('[data-key-grid]');if(key)key.innerHTML=`<article class="fortune-key-card"><span>01 · 내 일주</span><strong>${natal.pillar}</strong><p>내가 평소 반응하고 선택하는 중심입니다. ${target.pillar} 일진과 맞물리며 ${br.label}의 관계가 만들어집니다.</p></article><article class="fortune-key-card"><span>02 · ${dayWord} 일진</span><strong>${target.pillar}</strong><p>${elementKo[element]}의 ${ep.keywords} 성향이 강하게 들어옵니다. ${sr.label}도 함께 작용합니다.</p></article><article class="fortune-key-card"><span>03 · ${dayWord}의 행동</span><strong>${ep.headline}</strong><p>${br.copy} 이 흐름을 가장 쉽게 쓰는 방법은 중요한 일 한 가지의 순서를 분명히 잡는 것입니다.</p></article>`;
      const keySec=key?.closest('.fortune-report');if(keySec)keySec.querySelector('h2').textContent=`${dayWord} 이것만 기억해도 충분합니다.`;

      let lucky=$('.fortune-lucky-section');
      if(!lucky){lucky=document.createElement('section');lucky.className='fortune-report fortune-lucky-section';keySec?.insertAdjacentElement('afterend',lucky);}
      const nums=luckyNumbers(hash(`${input.birthDate}|${input.birthTime||''}|${natal.pillar}|${target.pillar}|${expected}`));
      lucky.innerHTML=`<p class="fortune-label">07 · LUCKY KEYWORDS</p><h2>${dayWord}의 키워드와 행운 포인트</h2><p class="fortune-lucky-lead">${dayWord} 일진의 오행과 내 일주의 관계를 색·숫자·사물·방향으로 풀었습니다.</p><div class="fortune-lucky-grid"><article class="fortune-lucky-card"><small>행운 키워드</small><strong>${ep.keywords}</strong><p>${dayWord}의 흐름을 가장 짧게 기억하고 싶다면 이 세 단어를 챙겨보세요.</p></article><article class="fortune-lucky-card"><small>도움이 되는 색</small><strong>${ep.color}</strong><p>${elementKo[element]}의 기운을 생활 색상으로 옮긴 조합입니다.</p></article><article class="fortune-lucky-card"><small>행운 숫자</small><strong>${nums.join(' · ')}</strong><p>좌석·순서·번호처럼 선택지가 여러 개일 때 활용하기 좋은 숫자입니다.</p></article><article class="fortune-lucky-card"><small>가까이 두기 좋은 사물</small><strong>${ep.object}</strong><p>${dayWord}의 오행 성향을 생활 속 오브젝트로 풀었습니다.</p></article><article class="fortune-lucky-card"><small>행운 방향</small><strong>${ep.direction}</strong><p>이동하거나 자리를 정할 때 기운을 모으기 좋은 방향입니다.</p></article><article class="fortune-lucky-card"><small>좋은 시간대</small><strong>${ep.time}</strong><p>중요한 일이나 대화를 배치하기 좋은 시간대입니다.</p></article></div><div class="fortune-lucky-note"><strong>${dayWord}의 한 가지 팁</strong> · ${ep.headline}</div>`;

      const tip=$('.fortune-tip-section');if(tip){tip.querySelector('.fortune-label').textContent='08 · TODAY GUIDE';tip.querySelector('h2').textContent=`${dayWord}을 잘 쓰는 세 가지 방법`;tip.querySelector('.fortune-tip-lead').textContent='운세를 읽고 끝내기보다 하루의 순서에 바로 넣어보세요.';const g=tip.querySelector('[data-tip-grid]');if(g)g.innerHTML=`<article class="fortune-tip-card"><span>01 · WORK</span><h3>끝나는 일을 하나 만들기</h3><p>${ep.work}</p></article><article class="fortune-tip-card"><span>02 · RELATION</span><h3>말보다 흐름 전체 보기</h3><p>${ep.love}</p></article><article class="fortune-tip-card"><span>03 · MONEY & LIFE</span><h3>돈과 체력의 범위 정하기</h3><p>${ep.money} ${ep.life}</p></article>`;const fl=tip.querySelector('.fortune-tip-final span');if(fl)fl.textContent=`${dayWord}의 마무리`;const fs=tip.querySelector('[data-tip-final]');if(fs)fs.textContent=`${dayWord}은 ${ep.headline} 가장 중요한 일 하나를 분명히 하고, 사람·돈·일정은 그다음 순서로 정리해보세요.`;}

      const total=$('[data-total-summary]');if(total)total.innerHTML=`<p><span class="fortune-summary-label">OVERALL</span><strong>${headline}</strong>${summary}</p><p><span class="fortune-summary-label">WORK · MONEY</span><strong>일은 완료를 만들고, 돈은 이유를 분명히 하세요.</strong>${ep.work} ${ep.money}</p><p><span class="fortune-summary-label">LOVE · RHYTHM</span><strong>관계는 한 번의 반응보다 반복되는 흐름을 보세요.</strong>${ep.love} ${ep.life}</p><p><span class="fortune-summary-label">${tomorrow?"TOMORROW'S":"TODAY'S"} GUIDE</span><strong>${ep.headline}</strong>${br.copy} ${sr.label}이 함께 들어오는 만큼, 거창한 선택보다 한 가지 행동을 실제로 남기는 것이 ${dayWord}의 기운을 가장 잘 쓰는 방법입니다.</p>`;
      const totalSec=total?.closest('.fortune-report');if(totalSec){totalSec.querySelector('.fortune-label').textContent='09 · TOTAL SUMMARY';totalSec.querySelector('h2').textContent=`${dayWord} 하루를 한 번에 정리하면`;}

      const evidence=$('[data-evidence]');if(evidence)evidence.innerHTML=`<article class="fortune-evidence-item"><strong>日柱 · 출생 일주</strong><p>${name}님의 출생일에서 계산된 일주는 ${natal.pillar}입니다. 일간은 ${natal.stem}, 일지는 ${natal.branch}로 봅니다.</p></article><article class="fortune-evidence-item"><strong>日辰 · ${dayWord} 일진</strong><p>${expected}의 일진은 ${target.pillar}입니다. 천간 ${target.stem}과 지지 ${target.branch}의 성격을 하루의 기본 기운으로 둡니다.</p></article><article class="fortune-evidence-item"><strong>地支 관계</strong><p>내 일지 ${natal.branch}와 ${dayWord} 지지 ${target.branch} 사이에는 ${br.label}의 관계가 잡힙니다.</p></article><article class="fortune-evidence-item"><strong>天干 生剋</strong><p>내 일간 ${natal.stem}과 ${dayWord} 천간 ${target.stem}의 오행 관계는 “${sr.label}”로 풀이됩니다.</p></article><article class="fortune-evidence-item"><strong>五行</strong><p>${dayWord} 천간은 ${elementKo[element]}에 해당하며 ${ep.keywords}의 생활 성향으로 연결됩니다.</p></article><article class="fortune-evidence-item"><strong>六合 · 三合 · 沖 · 刑 · 害 · 破</strong><p>지지 사이의 결합과 충돌 관계를 사람·일정·선택의 흐름에 반영했습니다.</p></article><article class="fortune-evidence-item"><strong>출생시간</strong><p>${input.birthTimeUnknown||!input.birthTime?'출생시간이 없어 일주 중심으로 풀이했습니다.':`출생시간 ${input.birthTime}을 출생 명식 계산에 포함했습니다.`}</p></article><article class="fortune-evidence-item"><strong>음력 · 윤달</strong><p>${input.calendarType==='lunar'?`음력 기준${input.isLeapMonth?' · 윤달 포함':''}으로 출생 명식을 계산했습니다.`:'양력 기준으로 출생 명식을 계산했습니다.'}</p></article>`;
      const evidenceSec=evidence?.closest('.fortune-report');if(evidenceSec){let label=evidenceSec.querySelector('.fortune-label');if(!label){label=document.createElement('p');label.className='fortune-label';evidenceSec.prepend(label);}label.textContent='10 · INTERPRETATION BASIS';let h=evidenceSec.querySelector('h2');if(!h){h=document.createElement('h2');label.insertAdjacentElement('afterend',h);}h.textContent='명리 해석 근거';}

      document.title=`${dayWord}의 운세 결과 — 정월재`;
    }catch(error){console.error(error);}
    finally{root.dataset.finalState='ready';}
  }

  setTimeout(render,280);
})();
