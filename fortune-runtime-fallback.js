(()=>{
  const root=document.querySelector('[data-fortune-result]');
  if(!root)return;
  let input={};
  try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
  if(!input.birthDate)return;

  const tomorrow=input.mode==='tomorrow';
  const dayWord=tomorrow?'내일':'오늘';
  const $=s=>root.querySelector(s);
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const stemInfo={갑:{e:'wood',p:'yang'},을:{e:'wood',p:'yin'},병:{e:'fire',p:'yang'},정:{e:'fire',p:'yin'},무:{e:'earth',p:'yang'},기:{e:'earth',p:'yin'},경:{e:'metal',p:'yang'},신:{e:'metal',p:'yin'},임:{e:'water',p:'yang'},계:{e:'water',p:'yin'}};
  const elementName={wood:'목(木)',fire:'화(火)',earth:'토(土)',metal:'금(金)',water:'수(水)'};
  const elementPack={
    wood:{headline:'작은 시작 하나를 만드는 날',work:'새 일을 크게 벌리기보다 첫 단계가 분명한 일 하나를 시작해보세요.',money:'새 지출은 무엇을 시작하기 위한 돈인지 목적을 분명히 하면 좋습니다.',love:'먼저 말을 걸거나 다음 만남의 계기를 만드는 흐름이 좋습니다.',life:'움직임을 늘리되 시작한 일을 끝까지 이어갈 체력을 남겨두세요.'},
    fire:{headline:'생각을 밖으로 꺼낼수록 좋은 날',work:'제안·발표·공유처럼 결과가 보이는 일을 실제로 꺼내보세요.',money:'필요한 소비는 빠르게 결정하되 기분에 따라 범위를 넓히지는 마세요.',love:'호감이나 필요한 말은 돌려 말하기보다 짧고 분명하게 표현해보세요.',life:'초반 속도가 붙는 만큼 저녁에는 과열되지 않게 마무리하세요.'},
    earth:{headline:'정리하고 안정시키는 힘이 좋은 날',work:'진행 중인 업무 하나를 마무리하고 다음 순서를 정리해보세요.',money:'정기 지출과 반복 비용을 정리하면 재물 흐름이 안정됩니다.',love:'말보다 약속과 생활 리듬이 실제로 맞는지를 보는 편이 좋습니다.',life:'식사·휴식·이동의 리듬을 일정하게 유지해보세요.'},
    metal:{headline:'선택지를 줄이고 기준을 세우는 날',work:'해야 할 일과 하지 않을 일을 나누고 우선순위를 분명히 해보세요.',money:'가격보다 유지비와 실제 쓰임까지 함께 보며 결정하는 흐름이 좋습니다.',love:'상대의 말보다 행동의 일관성과 약속을 지키는지를 기준으로 보세요.',life:'미뤄둔 정리나 완료 표시 하나를 남기면 체감이 좋아집니다.'},
    water:{headline:'한 번 더 살피면 답이 보이는 날',work:'자료를 비교하고 빠진 정보를 채운 뒤 결정하면 정확도가 올라갑니다.',money:'결제 전 최근 지출 흐름을 한 번 확인하면 돈의 흐름이 선명해집니다.',love:'한 번의 답장보다 최근 며칠의 연락 흐름과 행동을 함께 보세요.',life:'일정 사이에 여백을 두고 생각을 정리할 시간을 남겨두세요.'}
  };
  const generates={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
  const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
  const yukhap=[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']];
  const chung=[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];
  const samhap=[['신','자','진'],['해','묘','미'],['인','오','술'],['사','유','축']];
  const pairHas=(arr,a,b)=>arr.some(p=>p.includes(a)&&p.includes(b));
  const stems=['갑','을','병','정','무','기','경','신','임','계'];
  const branches=['자','축','인','묘','진','사','오','미','신','유','술','해'];

  function seoulDate(offset=0){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get=t=>parts.find(p=>p.type===t)?.value||'';
    const d=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00+09:00`);
    d.setDate(d.getDate()+offset);
    return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  }
  function jdn(y,m,d){
    const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;
    return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;
  }
  function localDayPillar(dateString){
    const [y,m,d]=String(dateString).split('-').map(Number);
    const idx=((jdn(y,m,d)+49)%60+60)%60;
    const pillar=stems[idx%10]+branches[idx%12];
    return {pillar,stem:pillar[0],branch:pillar[1],approximate:true};
  }
  function pillarString(v){return typeof v==='string'?v:(v?.korean||v?.name||'');}
  async function loadCalculator(){
    const timeout=new Promise(resolve=>setTimeout(()=>resolve(null),2200));
    const candidates=Promise.any([
      import('https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm'),
      import('https://esm.sh/manseryeok@2.0.0')
    ]).catch(()=>null);
    return Promise.race([candidates,timeout]);
  }
  async function dayPillar(dateString,opts={}){
    const mod=window.__jwManseryeokModule||await loadCalculator();
    if(mod?.calculateFourPillars){
      window.__jwManseryeokModule=mod;
      const [year,month,day]=String(dateString).split('-').map(Number);
      const [hour,minute]=String(opts.time||'12:00').split(':').map(Number);
      const r=mod.calculateFourPillars({year,month,day,hour:Number.isFinite(hour)?hour:12,minute:Number.isFinite(minute)?minute:0,isLunar:Boolean(opts.lunar),isLeapMonth:Boolean(opts.leap),gender:opts.gender||undefined});
      const o=typeof r?.toObject==='function'?r.toObject():r;
      const p=pillarString(o?.day);
      if(p&&[...p].length>=2)return {pillar:p,stem:[...p][0],branch:[...p][1],approximate:false};
    }
    return localDayPillar(dateString);
  }
  function branchRel(a,b){
    if(pairHas(yukhap,a,b))return {label:'육합',delta:18,title:'사람과 일이 자연스럽게 이어지는 흐름',copy:'연결점이 잘 생기는 날이라 먼저 손을 내밀거나 관계를 이어가는 힘이 좋습니다.'};
    if(samhap.some(g=>g.includes(a)&&g.includes(b)))return {label:'삼합',delta:12,title:'연결을 활용하면 흐름이 커지는 날',copy:'협업·대화·정보 연결을 활용할수록 일이 부드럽게 이어집니다.'};
    if(pairHas(chung,a,b))return {label:'충',delta:-18,title:'변화와 움직임이 크게 들어오는 흐름',copy:'예상과 다른 요청이나 반응이 들어올 수 있어 방향을 유연하게 조정하는 힘이 중요합니다.'};
    if(a===b)return {label:'동일 지지',delta:5,title:'평소 내 성향이 강하게 드러나는 흐름',copy:'익숙한 장점이 잘 나오고 반복하던 습관도 함께 커질 수 있습니다.'};
    return {label:'평이',delta:2,title:'내 선택이 흐름을 만드는 날',copy:'외부 변수보다 내가 무엇을 먼저 하고 어떤 기준을 세우는지가 하루를 크게 좌우합니다.'};
  }
  function stemRel(a,b){
    const A=stemInfo[a],B=stemInfo[b];
    if(!A||!B)return {label:'오행 흐름 평이',delta:0};
    if(A.e===B.e)return {label:`${elementName[B.e]}의 힘이 겹침`,delta:A.p===B.p?6:4};
    if(generates[A.e]===B.e)return {label:'내 기운이 밖으로 이어짐',delta:5};
    if(generates[B.e]===A.e)return {label:'날짜의 기운이 나를 받쳐줌',delta:8};
    if(controls[A.e]===B.e)return {label:'내가 기준을 세우는 흐름',delta:2};
    if(controls[B.e]===A.e)return {label:'압박을 정리하며 움직이는 흐름',delta:-7};
    return {label:'오행 흐름 평이',delta:0};
  }
  async function calculate(){
    const expected=seoulDate(tomorrow?1:0);
    input.targetDate=expected;
    try{sessionStorage.setItem('jungwoljae_fortune_input',JSON.stringify(input));}catch(e){}
    const natal=await dayPillar(input.birthDate,{time:input.birthTime||'12:00',lunar:input.calendarType==='lunar',leap:Boolean(input.isLeapMonth),gender:input.gender||''});
    const target=await dayPillar(expected);
    const br=branchRel(natal.branch,target.branch),sr=stemRel(natal.stem,target.stem);
    const element=stemInfo[target.stem]?.e||'earth',ep=elementPack[element];
    const score=Math.max(20,Math.min(88,54+br.delta+sr.delta));
    return {expected,natal,target,br,sr,element,ep,score,approximate:Boolean(natal.approximate||target.approximate)};
  }
  function li(title,body,index){return `<li data-index="${index}"><div><strong>${esc(title)}</strong><span>${esc(body)}</span></div></li>`;}
  function render(d){
    const dateLabel=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date(`${d.expected}T12:00:00+09:00`));
    const heroTitle=root.querySelector('.fortune-hero h1');
    if(heroTitle)heroTitle.innerHTML=`<span data-name>${esc(input.name||'회원')}</span>님,<br />${dayWord}의 흐름을 정리했습니다.`;
    $('[data-summary]').textContent=`${input.name||'회원'}님의 기본 흐름과 ${dayWord}의 일진을 함께 보며 재물·인연·일·생활의 방향을 정리했습니다.`;
    $('[data-meta]').innerHTML=`<span>${d.expected}</span><span>${dateLabel}</span><span>내 일주 ${d.natal.pillar}</span><span>${dayWord} 일진 ${d.target.pillar}</span>`;
    $('[data-headline]').textContent=`${dayWord}은 ${d.score>=68?d.ep.headline:d.br.title}입니다.`;
    $('[data-signal-note]').textContent=`${d.br.copy} ${d.sr.label}이 함께 들어옵니다.`;
    $('[data-relation-pills]').innerHTML=`<span>${d.natal.pillar}</span><span>${d.br.label}</span><span>${d.target.pillar}</span>`;
    $('[data-relation-text]').textContent=`내 일지 ${d.natal.branch}와 ${dayWord} 일지 ${d.target.branch}의 관계는 ${d.br.label}입니다. 천간에서는 ${d.sr.label}의 흐름이 함께 작동합니다.`;
    $('[data-fortune-story]').innerHTML=`<p><strong>${dayWord}의 전체 흐름</strong> ${esc(d.ep.headline)}. ${esc(d.br.copy)}</p><p><strong>움직이는 기준</strong> ${esc(d.ep.work)}</p>`;
    const areas=[['01','재물운',d.ep.money,'재물'],['02','연애운',d.ep.love,'인연'],['03','일·학업운',d.ep.work,'일'],['04','생활운',d.ep.life,'생활']];
    $('[data-area-grid]').innerHTML=areas.map(([n,t,p,b])=>`<article class="fortune-card"><span>${n}</span><h3>${t}</h3><p>${esc(p)}</p><strong>${b}</strong></article>`).join('');
    $('[data-time-grid]').innerHTML=`<article class="fortune-time-card"><span>오전</span><strong>중요한 일부터 가볍게 시작하세요.</strong><p>${esc(d.ep.work)}</p></article><article class="fortune-time-card"><span>오후</span><strong>사람과의 접점을 활용하세요.</strong><p>${esc(d.br.copy)}</p></article><article class="fortune-time-card"><span>저녁</span><strong>하루를 정리하고 여백을 남기세요.</strong><p>${esc(d.ep.life)}</p></article>`;
    $('[data-do-list]').innerHTML=li('가장 중요한 일 하나 먼저 끝내기',d.ep.work,'01')+li('필요한 말은 짧고 분명하게 하기',d.ep.love,'02')+li('결정 전 기준 하나 확인하기',d.ep.money,'03');
    $('[data-dont-list]').innerHTML=li('한꺼번에 너무 많은 일을 벌이지 않기','우선순위가 흐려지면 체력만 먼저 빠질 수 있습니다.','01')+li('상대의 한마디만으로 결론 내리지 않기','최근의 흐름과 실제 행동을 함께 보세요.','02')+li('기분에 따라 지출 범위를 넓히지 않기','목적과 예산을 한 번 더 확인하세요.','03');
    $('[data-key-grid]').innerHTML=`<article class="fortune-key-card"><span>01 · 내 일주</span><strong>${d.natal.pillar}</strong><p>${esc(input.name||'회원')}님의 기본 반응을 보는 중심 일주입니다.</p></article><article class="fortune-key-card"><span>02 · ${dayWord} 일진</span><strong>${d.target.pillar} · ${d.br.label}</strong><p>${esc(d.br.copy)}</p></article><article class="fortune-key-card"><span>03 · ${dayWord}의 중심</span><strong>${elementName[d.element]}</strong><p>${esc(d.ep.headline)}</p></article>`;
    $('[data-tip-grid]').innerHTML=`<article class="fortune-tip-card"><span>01</span><h3>일</h3><p>${esc(d.ep.work)}</p></article><article class="fortune-tip-card"><span>02</span><h3>인연</h3><p>${esc(d.ep.love)}</p></article><article class="fortune-tip-card"><span>03</span><h3>재물</h3><p>${esc(d.ep.money)}</p></article>`;
    $('[data-tip-final]').textContent=`${dayWord}은 ${d.br.title}입니다. ${d.ep.headline}.`;
    $('[data-total-summary]').innerHTML=`<p><span class="fortune-summary-label">한줄 정리</span><strong>${dayWord}은 ${d.ep.headline}</strong>${esc(d.br.copy)}</p><p><span class="fortune-summary-label">우선순위</span><strong>일 하나, 관계 하나, 지출 하나만 분명히</strong>범위를 줄일수록 하루가 더 선명해집니다.</p><p><span class="fortune-summary-label">마무리</span><strong>내일로 넘길 짐을 하나 줄여두세요.</strong>${esc(d.ep.life)}</p>`;
    $('[data-evidence]').innerHTML=`<div class="fortune-evidence-item"><strong>내 일주</strong><p>${d.natal.pillar}</p></div><div class="fortune-evidence-item"><strong>${dayWord} 일진</strong><p>${d.target.pillar}</p></div><div class="fortune-evidence-item"><strong>지지 관계</strong><p>${d.br.label}</p></div><div class="fortune-evidence-item"><strong>천간 흐름</strong><p>${d.sr.label}</p></div>${d.approximate?'<div class="fortune-evidence-item"><strong>계산 안내</strong><p>정밀 계산 모듈 연결이 지연되어 기본 날짜 계산으로 우선 표시했습니다. 새로고침하면 정밀 계산을 다시 시도합니다.</p></div>':''}`;
    root.dataset.finalState='ready';
    window.dispatchEvent(new CustomEvent('jw:fortune-rendered'));
    window.dispatchEvent(new CustomEvent('jw:result-ready'));
  }
  function reportText(d){return [`정월재 ${dayWord}의 운세`,`${input.name||'회원'} · 내 일주 ${d.natal.pillar}`,`${dayWord} ${d.expected} · 일진 ${d.target.pillar}`,`관계: ${d.br.label} · ${d.sr.label}`,'',`${dayWord}은 ${d.ep.headline}`,`재물운: ${d.ep.money}`,`연애운: ${d.ep.love}`,`일·학업운: ${d.ep.work}`,`생활운: ${d.ep.life}`].join('\n');}

  async function activateFallback(){
    const headline=$('[data-headline]')?.textContent?.trim()||'';
    const areaCount=$('[data-area-grid]')?.children.length||0;
    if(headline&&headline!=='흐름을 읽는 중입니다.'&&areaCount>0){
      root.dataset.finalState='ready';
      window.dispatchEvent(new CustomEvent('jw:fortune-rendered'));
      return;
    }
    let data;
    try{data=await calculate();render(data);}catch(error){
      root.dataset.finalState='ready';
      const h=$('[data-headline]');if(h)h.textContent='잠시 연결이 지연되고 있습니다.';
      const p=$('[data-signal-note]');if(p)p.textContent='페이지를 새로고침하거나 다시 운세를 확인해주세요.';
      window.dispatchEvent(new CustomEvent('jw:fortune-rendered'));
      return;
    }
    const copyBtn=$('[data-copy]'),pdfBtn=$('[data-pdf]'),saveBtn=$('[data-save]'),status=$('[data-action-status]');
    copyBtn?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(reportText(data));if(status)status.textContent='운세 내용을 복사했습니다.';}catch(e){if(status)status.textContent='복사하지 못했습니다.';}});
    pdfBtn?.addEventListener('click',()=>window.print());
    saveBtn?.addEventListener('click',async()=>{
      saveBtn.disabled=true;
      if(status)status.textContent='저장 상태를 확인하고 있습니다.';
      try{
        const [{firebaseConfig},appMod,authMod,dbMod]=await Promise.all([
          import('./firebase-config.js?v=20260907-1645'),
          import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),
          import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
          import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
        ]);
        const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(firebaseConfig);
        const user=authMod.getAuth(app).currentUser;
        if(!user){location.href='./login.html?next=./fortune-result.html';return;}
        const db=dbMod.getFirestore(app);
        await dbMod.addDoc(dbMod.collection(db,'users',user.uid,'readings'),{type:tomorrow?'tomorrow':'fortune',mode:input.mode||'today',title:`${input.name||'회원'}님의 ${dayWord}의 운세`,input,summary:`${dayWord}은 ${data.ep.headline}`,targetDate:data.expected,natalDayPillar:data.natal.pillar,targetDayPillar:data.target.pillar,branchRelation:data.br.label,stemRelation:data.sr.label,element:data.element,score:data.score,reportText:reportText(data),createdAt:dbMod.serverTimestamp()});
        saveBtn.textContent='저장 완료';if(status)status.textContent='정월록과 마이페이지에 저장했습니다.';
      }catch(e){saveBtn.disabled=false;if(status)status.textContent='저장하지 못했습니다. 잠시 후 다시 시도해주세요.';}
    },{once:true});
  }

  setTimeout(activateFallback,650);
})();