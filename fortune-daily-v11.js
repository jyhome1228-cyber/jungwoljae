import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';

(()=>{
  const root=document.querySelector('[data-fortune-result]');
  if(!root)return;
  let input={};try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
  if(!input.birthDate)return;

  const $=(s,r=root)=>r.querySelector(s);
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const tomorrow=input.mode==='tomorrow';
  const dayWord=tomorrow?'내일':'오늘';
  const stemInfo={갑:{e:'wood',p:'yang'},을:{e:'wood',p:'yin'},병:{e:'fire',p:'yang'},정:{e:'fire',p:'yin'},무:{e:'earth',p:'yang'},기:{e:'earth',p:'yin'},경:{e:'metal',p:'yang'},신:{e:'metal',p:'yin'},임:{e:'water',p:'yang'},계:{e:'water',p:'yin'}};
  const generates={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
  const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
  const elementKo={wood:'목(木)',fire:'화(火)',earth:'토(土)',metal:'금(金)',water:'수(水)'};
  const elementPack={
    wood:{headline:'시작할 일을 하나 정하면 흐름이 살아납니다.',work:'새로운 일의 첫 단계를 만들거나 미뤄둔 일을 시작하기 좋습니다.',money:'새 지출은 무엇을 시작하기 위한 돈인지 목적을 분명히 하면 좋습니다.',love:'먼저 말을 걸고 다음 약속의 계기를 만드는 쪽이 자연스럽습니다.',life:'움직임을 늘리되 시작한 일을 끝까지 이어갈 힘을 남겨두세요.'},
    fire:{headline:'생각을 말과 행동으로 꺼낼수록 좋습니다.',work:'제안·발표·공유처럼 밖으로 보여주는 일에서 힘이 붙습니다.',money:'필요한 소비는 빠르게 결정하되 기분에 따라 범위를 넓히지는 마세요.',love:'호감이나 필요한 말은 돌려 말하기보다 솔직하게 표현하는 편이 좋습니다.',life:'초반 속도가 붙는 만큼 저녁에는 과열되지 않게 마무리하세요.'},
    earth:{headline:'새로 벌이기보다 정리하고 안정시키는 데 강합니다.',work:'진행 중인 일 하나를 마무리하고 다음 순서를 정리하기 좋습니다.',money:'정기 지출과 반복 비용을 정리하면 흐름이 안정됩니다.',love:'관계의 말보다 약속과 생활 리듬이 실제로 맞는지를 보세요.',life:'식사·휴식·이동의 리듬을 일정하게 유지하면 좋습니다.'},
    metal:{headline:'선택지를 줄이고 기준을 세우면 선명해집니다.',work:'해야 할 일과 하지 않을 일을 나누고 우선순위를 정하기 좋습니다.',money:'가격보다 유지비와 실제 쓰임까지 함께 보며 결정하세요.',love:'말보다 행동의 일관성과 약속을 지키는지를 기준으로 보세요.',life:'미뤄둔 정리나 완료 표시 하나를 남기면 체감이 좋아집니다.'},
    water:{headline:'바로 답하기보다 한 번 더 살피면 답이 보입니다.',work:'자료를 비교하고 빠진 정보를 채운 뒤 움직이기 좋습니다.',money:'결제 전 최근 지출 흐름을 한 번 확인하면 선택이 선명해집니다.',love:'한 번의 답장보다 며칠간의 연락 흐름과 행동을 함께 보세요.',life:'일정 사이에 여백을 두고 생각을 정리할 시간을 남겨두세요.'}
  };
  const branchPack={자:'정보 · 정리',축:'축적 · 점검',인:'시작 · 이동',묘:'관계 · 확장',진:'전환 · 정리',사:'표현 · 속도',오:'실행 · 결정',미:'조율 · 관리',신:'판단 · 변화',유:'정리 · 기준',술:'마무리 · 책임',해:'관찰 · 회복'};
  const yukhap=[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']];
  const chung=[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];
  const hae=[['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']];
  const pa=[['자','유'],['축','진'],['인','해'],['묘','오'],['사','신'],['미','술']];
  const samhap=[['신','자','진'],['해','묘','미'],['인','오','술'],['사','유','축']];
  const hyeongGroups=[['인','사','신'],['축','미','술']];
  const pairHas=(arr,a,b)=>arr.some(p=>p.includes(a)&&p.includes(b));
  const isHyeong=(a,b)=>(a===b&&['진','오','유','해'].includes(a))||pairHas([['자','묘']],a,b)||hyeongGroups.some(g=>g.includes(a)&&g.includes(b));
  const pillarString=v=>typeof v==='string'?v:(v?.korean||v?.name||'');
  const pad=n=>String(n).padStart(2,'0');

  function seoulDate(offset=0){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get=t=>parts.find(p=>p.type===t)?.value||'';
    const d=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00+09:00`);d.setDate(d.getDate()+offset);
    return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  }
  function calc(dateString,{time='12:00',lunar=false,leap=false,gender=''}={}){
    const [year,month,day]=dateString.split('-').map(Number),[hour,minute]=String(time||'12:00').split(':').map(Number);
    const r=calculateFourPillars({year,month,day,hour:Number.isFinite(hour)?hour:12,minute:Number.isFinite(minute)?minute:0,isLunar:lunar,isLeapMonth:leap,gender:gender||undefined});
    const o=typeof r?.toObject==='function'?r.toObject():r,p=pillarString(o?.day);
    return {pillar:p,stem:[...p][0],branch:[...p][1]};
  }
  function branchRel(a,b){
    if(pairHas(yukhap,a,b))return {label:'육합',delta:18,title:'서로 맞물리는 힘이 좋은 날',copy:'사람과 일이 자연스럽게 이어지기 쉬워 먼저 움직일수록 접점이 생깁니다.'};
    if(samhap.some(g=>g.includes(a)&&g.includes(b)))return {label:'삼합',delta:12,title:'연결을 활용하면 흐름이 커지는 날',copy:'혼자 끌기보다 사람·정보·협업을 연결할수록 일이 부드럽게 이어집니다.'};
    if(pairHas(chung,a,b))return {label:'충',delta:-18,title:'변화가 크게 들어오는 날',copy:'예상과 다른 요청이나 반응이 들어올 수 있어 방향을 빠르게 조정하는 힘이 중요합니다.'};
    if(isHyeong(a,b))return {label:'형',delta:-12,title:'반복되는 문제를 바로잡는 날',copy:'평소 하던 방식에서 생기던 피로를 다른 방법으로 끊어내기 좋습니다.'};
    if(pairHas(hae,a,b))return {label:'해',delta:-10,title:'관계와 말의 결을 세심하게 볼 날',copy:'작은 말과 태도의 차이가 크게 느껴질 수 있어 진짜 의도를 정확히 읽는 것이 중요합니다.'};
    if(pairHas(pa,a,b))return {label:'파',delta:-7,title:'작은 어긋남을 정리하는 날',copy:'미뤄둔 일정·답장·약속을 하나씩 정리하면 흐름이 바로 좋아집니다.'};
    if(a===b)return {label:'동일 지지',delta:5,title:'평소 내 성향이 강하게 드러나는 날',copy:'익숙한 장점이 잘 나오고 반복하던 습관도 함께 커질 수 있습니다.'};
    return {label:'평이',delta:2,title:'내 선택이 흐름을 만드는 날',copy:'외부 변수보다 내가 무엇을 먼저 하고 어떤 기준을 세우는지가 중요합니다.'};
  }
  function stemRel(a,b){
    const A=stemInfo[a],B=stemInfo[b];if(!A||!B)return {label:'오행 흐름 평이',delta:0};
    if(A.e===B.e)return {label:`${elementKo[B.e]}의 힘이 겹침`,delta:A.p===B.p?6:4};
    if(generates[A.e]===B.e)return {label:'내 기운이 밖으로 이어짐',delta:5};
    if(generates[B.e]===A.e)return {label:'날짜의 기운이 나를 받쳐줌',delta:8};
    if(controls[A.e]===B.e)return {label:'내가 기준을 세우는 흐름',delta:2};
    if(controls[B.e]===A.e)return {label:'압박을 정리하며 움직이는 흐름',delta:-7};
    return {label:'오행 흐름 평이',delta:0};
  }
  function hash(str){let h=2166136261;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function numbers(seed){let x=seed||1,out=[];while(out.length<3){x^=x<<13;x^=x>>>17;x^=x<<5;const n=1+((x>>>0)%9);if(!out.includes(n))out.push(n);}return out.sort((a,b)=>a-b);}
  const luckyPack={wood:['청록 · 연두','작은 노트 · 식물','동쪽','오전 7시–11시'],fire:['주황 · 자주','조명 · 펜','남쪽','오전 10시–오후 2시'],earth:['베이지 · 황토','수첩 · 정리함','중앙','오후 1시–5시'],metal:['아이보리 · 실버','금속 펜 · 키링','서쪽','오후 3시–7시'],water:['네이비 · 블루','물병 · 이어폰','북쪽','저녁 7시–11시']};

  function render(){
    const expected=seoulDate(tomorrow?1:0);
    if(input.targetDate!==expected){input.targetDate=expected;sessionStorage.setItem('jungwoljae_fortune_input',JSON.stringify(input));}
    const natal=calc(input.birthDate,{time:input.birthTime||'12:00',lunar:input.calendarType==='lunar',leap:Boolean(input.isLeapMonth),gender:input.gender||''});
    const target=calc(expected);
    const br=branchRel(natal.branch,target.branch),sr=stemRel(natal.stem,target.stem),element=stemInfo[target.stem]?.e||'earth',ep=elementPack[element],score=Math.max(20,Math.min(88,54+br.delta+sr.delta));
    const dateLabel=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date(`${expected}T12:00:00+09:00`));
    const name=input.name||'회원';
    const headline=score>=70?`${dayWord}은 ${ep.headline}`:score>=55?`${dayWord}은 ${br.title}입니다.`:score>=42?`${dayWord}은 ${ep.headline}`:`${dayWord}은 ${br.title}입니다.`;
    const summary=`${name}님의 일주 ${natal.pillar}과 ${dayWord} 일진 ${target.pillar}을 맞춰보면 ${br.label}의 관계가 잡힙니다. ${sr.label}까지 함께 보면 ${br.copy} ${ep.headline}`;
    const meta=$('[data-meta]');if(meta)meta.innerHTML=`<span>${expected}</span><span>${dateLabel}</span><span>내 일주 ${natal.pillar}</span><span>${dayWord} 일진 ${target.pillar}</span>`;
    const head=$('[data-headline]');if(head)head.textContent=headline;
    const note=$('[data-signal-note]');if(note)note.textContent=summary;
    const hero=$('[data-summary]');if(hero)hero.textContent=summary;
    const relation=$('.fortune-relation');if(relation)relation.innerHTML=`<p class="fortune-label">01 · ${tomorrow?'TOMORROW':'TODAY'} × MY SAJU</p><h2>내 일주와 ${dayWord}의 일진이 어떻게 만날까?</h2><div class="relation-pills"><span>${natal.pillar}</span><span>${br.label}</span><span>${target.pillar}</span></div><p>${esc(`${br.copy} ${sr.label}이 함께 들어와 ${ep.headline}`)}</p>`;
    const story=$('[data-fortune-story]');if(story)story.innerHTML=`<p>${esc(`${dayWord}의 중심은 ${branchPack[target.branch]||'흐름 조절'}입니다. ${br.copy}`)}</p><p>${esc(`${elementKo[element]}의 기운이 ${dayWord} 일진의 앞쪽에 서기 때문에 일에서는 ${ep.work}`)}</p><p>${esc(`재물에서는 ${ep.money} 관계에서는 ${ep.love} 생활에서는 ${ep.life}`)}</p>`;
    const area=$('[data-area-grid]');if(area)area.innerHTML=[['재물운',ep.money,'재물'],['연애운',ep.love,'인연'],['일·학업운',ep.work,'일'],['생활운',ep.life,'생활']].map(([t,p,b],i)=>`<article class="fortune-card"><span>${pad(i+1)}</span><h3>${t}</h3><p>${esc(p)}</p><strong>${b}</strong></article>`).join('');
    const key=$('[data-key-grid]');if(key)key.innerHTML=`<article class="fortune-key-card"><span>01 · 내 일주</span><strong>${natal.pillar}</strong><p>${name}님의 기본 반응을 보는 중심 일주입니다.</p></article><article class="fortune-key-card"><span>02 · ${dayWord} 일진</span><strong>${target.pillar} · ${br.label}</strong><p>${esc(br.copy)}</p></article><article class="fortune-key-card"><span>03 · ${dayWord}의 행동</span><strong>${esc(branchPack[target.branch]||'흐름 정리')}</strong><p>${esc(ep.headline)}</p></article>`;

    const lucky=root.querySelector('[data-fortune-lucky-section]');
    if(lucky){
      const lp=luckyPack[element],nums=numbers(hash(`${input.birthDate}|${input.birthTime||''}|${input.calendarType}|${input.isLeapMonth}|${natal.pillar}|${target.pillar}|${expected}`));
      const cards=[['핵심 키워드',branchPack[target.branch]||ep.headline,`${target.pillar} 일진의 지지 흐름을 세 단어로 압축했습니다.`],['도움이 되는 색',lp[0],`${elementKo[element]}의 기운을 색으로 풀었습니다.`],['행운 숫자',nums.join(' · '),`${natal.pillar}과 ${target.pillar}의 조합에서 뽑은 숫자입니다.`],['가까이 두기 좋은 사물',lp[1],`${elementKo[element]}의 성격을 생활 사물로 옮긴 조합입니다.`],['방향',lp[2],`${elementKo[element]}이 향하는 방위를 함께 봅니다.`],['좋은 시간대',lp[3],`${elementKo[element]}의 흐름이 살아나는 시간대로 풀이했습니다.`]];
      lucky.innerHTML=`<p class="fortune-label">07 · LUCKY KEYWORDS</p><h2>${dayWord}의 키워드와 행운 포인트</h2><div class="fortune-lucky-grid">${cards.map(([l,t,c])=>`<article class="fortune-lucky-card"><small>${l}</small><strong>${esc(t)}</strong><p>${esc(c)}</p></article>`).join('')}</div>`;
    }
  }

  let observer,queued=false;
  const schedule=()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;observer?.disconnect();try{render();}finally{observer?.observe(root,{subtree:true,childList:true,characterData:true});}},40);};
  observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true});
  [0,600,1600,3000,5200,7000].forEach(ms=>setTimeout(schedule,ms));
})();
