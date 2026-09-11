const root=document.querySelector('[data-fortune-result]');
if(!root)throw new Error('fortune result root missing');

let input=null;
try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'null');}catch(e){}
if(!input?.birthDate||!input?.name){location.replace('./fortune.html');throw new Error('missing fortune input');}
if(Number(input.createdAt)&&Date.now()-Number(input.createdAt)>30*60*1000){
  try{sessionStorage.removeItem('jungwoljae_fortune_input');}catch(e){}
  location.replace(input.mode==='tomorrow'?'./tomorrow.html':'./fortune.html');
  throw new Error('stale fortune input');
}

const tomorrow=input.mode==='tomorrow';
const dayWord=tomorrow?'내일':'오늘';
const $=selector=>root.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

const stemInfo={갑:{e:'wood',p:'yang'},을:{e:'wood',p:'yin'},병:{e:'fire',p:'yang'},정:{e:'fire',p:'yin'},무:{e:'earth',p:'yang'},기:{e:'earth',p:'yin'},경:{e:'metal',p:'yang'},신:{e:'metal',p:'yin'},임:{e:'water',p:'yang'},계:{e:'water',p:'yin'}};
const elementName={wood:'목(木)',fire:'화(火)',earth:'토(土)',metal:'금(金)',water:'수(水)'};
const generates={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
const elementPack={
  wood:{headline:'작은 시작 하나를 만드는 날',work:'새 일을 크게 벌리기보다 첫 단계가 분명한 일 하나를 시작하면 흐름이 붙습니다.',money:'새 지출은 무엇을 시작하기 위한 돈인지 목적을 분명히 하면 좋습니다.',love:'먼저 말을 걸거나 다음 만남의 계기를 만드는 흐름이 좋습니다.',life:'움직임을 늘리되 시작한 일을 이어갈 체력은 남겨두세요.'},
  fire:{headline:'생각을 밖으로 꺼낼수록 좋은 날',work:'제안·발표·공유처럼 결과가 보이는 일을 실제로 꺼내면 흐름이 살아납니다.',money:'필요한 소비는 빠르게 결정하되 기분에 따라 범위를 넓히지는 마세요.',love:'호감이나 필요한 말은 돌려 말하기보다 짧고 분명하게 표현하는 편이 좋습니다.',life:'초반 속도가 붙는 만큼 저녁에는 과열되지 않게 마무리하세요.'},
  earth:{headline:'정리하고 안정시키는 힘이 좋은 날',work:'진행 중인 업무 하나를 마무리하고 다음 순서를 정리하는 데 힘을 써보세요.',money:'정기 지출과 반복 비용을 정리하면 재물 흐름이 안정됩니다.',love:'말보다 약속과 생활 리듬이 실제로 맞는지를 보는 편이 좋습니다.',life:'식사·휴식·이동의 리듬을 일정하게 유지하면 좋습니다.'},
  metal:{headline:'선택지를 줄이고 기준을 세우는 날',work:'해야 할 일과 하지 않을 일을 나누고 우선순위를 분명히 하세요.',money:'가격보다 유지비와 실제 쓰임까지 함께 보며 결정하는 흐름이 좋습니다.',love:'상대의 말보다 행동의 일관성과 약속을 지키는지를 기준으로 보세요.',life:'미뤄둔 정리나 완료 표시 하나를 남기면 체감이 좋아집니다.'},
  water:{headline:'한 번 더 살피면 답이 보이는 날',work:'자료를 비교하고 빠진 정보를 채운 뒤 결정하면 정확도가 올라갑니다.',money:'결제 전 최근 지출 흐름을 한 번 확인하면 돈의 흐름이 선명해집니다.',love:'한 번의 답장보다 최근 며칠의 연락 흐름과 행동을 함께 보세요.',life:'일정 사이에 여백을 두고 생각을 정리할 시간을 남겨두세요.'}
};
const yukhap=[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']];
const chung=[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];
const hae=[['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']];
const pa=[['자','유'],['축','진'],['인','해'],['묘','오'],['사','신'],['미','술']];
const samhap=[['신','자','진'],['해','묘','미'],['인','오','술'],['사','유','축']];
const hyeongGroups=[['인','사','신'],['축','미','술']];
const pairHas=(arr,a,b)=>arr.some(pair=>pair.includes(a)&&pair.includes(b));
const isHyeong=(a,b)=>(a===b&&['진','오','유','해'].includes(a))||pairHas([['자','묘']],a,b)||hyeongGroups.some(group=>group.includes(a)&&group.includes(b));
const stems=['갑','을','병','정','무','기','경','신','임','계'];
const branches=['자','축','인','묘','진','사','오','미','신','유','술','해'];

function seoulDate(offset=0){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=type=>parts.find(part=>part.type===type)?.value||'';
  const date=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00+09:00`);
  date.setDate(date.getDate()+offset);
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
function jdn(y,m,d){const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}
function localSolarDayPillar(dateString){
  const [y,m,d]=String(dateString).split('-').map(Number);
  const index=((jdn(y,m,d)+49)%60+60)%60;
  const pillar=stems[index%10]+branches[index%12];
  return {pillar,stem:pillar[0],branch:pillar[1],fallback:true};
}
function pillarString(value){return typeof value==='string'?value:(value?.korean||value?.name||'');}

let calculatorPromise=null;
function getCalculator(){
  if(calculatorPromise)return calculatorPromise;
  const sources=Promise.any([
    import('https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm'),
    import('https://esm.sh/manseryeok@2.0.0')
  ]).catch(()=>null);
  const timeout=new Promise(resolve=>setTimeout(()=>resolve(null),2500));
  calculatorPromise=Promise.race([sources,timeout]);
  return calculatorPromise;
}
async function dayPillar(dateString,{time='12:00',lunar=false,leap=false,gender=''}={}){
  const module=await getCalculator();
  if(module?.calculateFourPillars){
    const [year,month,day]=String(dateString).split('-').map(Number);
    const [hour,minute]=String(time||'12:00').split(':').map(Number);
    const result=module.calculateFourPillars({year,month,day,hour:Number.isFinite(hour)?hour:12,minute:Number.isFinite(minute)?minute:0,isLunar:lunar,isLeapMonth:leap,gender:gender||undefined});
    const object=typeof result?.toObject==='function'?result.toObject():result;
    const pillar=pillarString(object?.day);
    if(pillar&&[...pillar].length>=2)return {pillar,stem:[...pillar][0],branch:[...pillar][1],fallback:false};
  }
  if(lunar)throw new Error('lunar-calculator-unavailable');
  return localSolarDayPillar(dateString);
}
function branchRelation(a,b){
  if(pairHas(yukhap,a,b))return {label:'육합',delta:18,title:'사람과 일이 자연스럽게 이어지는 흐름',copy:'연결점이 잘 생기는 날이라 먼저 손을 내밀거나 관계를 이어가는 힘이 좋습니다.'};
  if(samhap.some(group=>group.includes(a)&&group.includes(b)))return {label:'삼합',delta:12,title:'연결을 활용하면 흐름이 커지는 날',copy:'협업·대화·정보 연결을 활용할수록 일이 부드럽게 이어집니다.'};
  if(pairHas(chung,a,b))return {label:'충',delta:-18,title:'변화와 움직임이 크게 들어오는 흐름',copy:'예상과 다른 요청이나 반응이 들어올 수 있어 방향을 유연하게 조정하는 힘이 중요합니다.'};
  if(isHyeong(a,b))return {label:'형',delta:-12,title:'반복되는 문제를 바로잡는 흐름',copy:'익숙한 방식에서 생기던 피로를 다른 방법으로 끊어내기 좋은 날입니다.'};
  if(pairHas(hae,a,b))return {label:'해',delta:-10,title:'말과 관계의 결을 세심하게 볼 흐름',copy:'작은 말과 태도의 차이가 크게 느껴질 수 있어 진짜 의도를 정확히 읽는 것이 중요합니다.'};
  if(pairHas(pa,a,b))return {label:'파',delta:-7,title:'작은 어긋남을 정리하는 흐름',copy:'미뤄둔 일정·답장·약속을 하나씩 정리하면 흐름이 가벼워집니다.'};
  if(a===b)return {label:'동일 지지',delta:5,title:'평소 내 성향이 강하게 드러나는 흐름',copy:'익숙한 장점이 잘 나오고 반복하던 습관도 함께 커질 수 있습니다.'};
  return {label:'평이',delta:2,title:'내 선택이 흐름을 만드는 날',copy:'외부 변수보다 내가 무엇을 먼저 하고 어떤 기준을 세우는지가 하루를 크게 좌우합니다.'};
}
function stemRelation(a,b){
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
  const [natal,target]=await Promise.all([
    dayPillar(input.birthDate,{time:input.birthTime||'12:00',lunar:input.calendarType==='lunar',leap:Boolean(input.isLeapMonth),gender:input.gender||''}),
    dayPillar(expected)
  ]);
  const branch=branchRelation(natal.branch,target.branch),stem=stemRelation(natal.stem,target.stem);
  const element=stemInfo[target.stem]?.e||'earth',pack=elementPack[element];
  const score=Math.max(20,Math.min(88,54+branch.delta+stem.delta));
  return {expected,natal,target,branch,stem,element,pack,score,fallback:Boolean(natal.fallback||target.fallback)};
}
function listItem(title,body){return `<li><strong>${esc(title)}</strong><span>${esc(body)}</span></li>`;}
function headline(data){return `${dayWord}은 ${data.score>=68?data.pack.headline:data.branch.title}입니다.`;}
function areaCards(data){return [['01','재물운',data.pack.money,'재물'],['02','연애운',data.pack.love,'인연'],['03','일·학업운',data.pack.work,'일'],['04','생활운',data.pack.life,'생활']];}
function render(data){
  const dateLabel=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date(`${data.expected}T12:00:00+09:00`));
  const heroTitle=root.querySelector('.fortune-hero h1');
  if(heroTitle)heroTitle.innerHTML=`<span data-name>${esc(input.name)}</span>님,<br />${dayWord}의 흐름을 정리했습니다.`;
  $('[data-summary]').textContent=`${input.name}님의 기본 흐름과 ${dayWord}의 일진을 함께 보며 재물·인연·일·생활의 방향을 정리했습니다.`;
  $('[data-meta]').innerHTML=`<span>${data.expected}</span><span>${dateLabel}</span><span>내 일주 ${data.natal.pillar}</span><span>${dayWord} 일진 ${data.target.pillar}</span>`;
  $('[data-headline]').textContent=headline(data);
  $('[data-signal-note]').textContent=`${data.branch.copy} ${data.stem.label}이 함께 들어옵니다.`;
  $('[data-relation-pills]').innerHTML=`<span>${data.natal.pillar}</span><span>${data.branch.label}</span><span>${data.target.pillar}</span>`;
  $('[data-relation-text]').textContent=`내 일지 ${data.natal.branch}와 ${dayWord} 일지 ${data.target.branch}의 관계는 ${data.branch.label}입니다. 천간에서는 ${data.stem.label}의 흐름이 함께 작동합니다.`;
  $('[data-fortune-story]').innerHTML=`<p><strong>${dayWord}의 전체 흐름</strong> ${esc(data.pack.headline)}. ${esc(data.branch.copy)}</p><p><strong>움직이는 기준</strong> ${esc(data.pack.work)}</p>`;
  $('[data-area-grid]').innerHTML=areaCards(data).map(([n,title,copy,badge])=>`<article class="fortune-card"><span>${n}</span><h3>${title}</h3><p>${esc(copy)}</p><strong>${badge}</strong></article>`).join('');
  $('[data-time-grid]').innerHTML=`<article class="fortune-time-card"><span>오전</span><strong>가장 중요한 일부터 가볍게 시작하세요.</strong><p>${esc(data.pack.work)}</p></article><article class="fortune-time-card"><span>오후</span><strong>사람과의 접점을 활용하세요.</strong><p>${esc(data.branch.copy)}</p></article><article class="fortune-time-card"><span>저녁</span><strong>하루를 정리하고 여백을 남기세요.</strong><p>${esc(data.pack.life)}</p></article>`;
  $('[data-do-list]').innerHTML=listItem('가장 중요한 일 하나 먼저 끝내기',data.pack.work)+listItem('필요한 말은 짧고 분명하게 하기',data.pack.love)+listItem('결정 전 기준 하나 확인하기',data.pack.money);
  $('[data-dont-list]').innerHTML=listItem('한꺼번에 너무 많은 일을 벌이기','오늘의 중심을 흐릴 수 있습니다.')+listItem('한 번의 반응만 보고 결론 내리기','관계와 일 모두 전체 흐름을 같이 보세요.')+listItem('기분에 따라 지출 범위 넓히기','결제 전 목적과 예산을 한 번 확인하세요.');
  $('[data-key-grid]').innerHTML=`<article class="fortune-key-card"><span>01 · 가장 먼저</span><strong>${esc(data.pack.work)}</strong><p>오늘의 첫 행동을 분명하게 만들어보세요.</p></article><article class="fortune-key-card"><span>02 · 사람과 대화</span><strong>${esc(data.pack.love)}</strong><p>${esc(data.branch.copy)}</p></article><article class="fortune-key-card"><span>03 · 마무리</span><strong>${esc(data.pack.life)}</strong><p>새 일을 늘리기보다 오늘 시작한 것 하나에 완료 표시를 남겨보세요.</p></article>`;
  $('[data-tip-grid]').innerHTML=`<article class="fortune-tip-card"><span>01</span><h3>일</h3><p>${esc(data.pack.work)}</p></article><article class="fortune-tip-card"><span>02</span><h3>인연</h3><p>${esc(data.pack.love)}</p></article><article class="fortune-tip-card"><span>03</span><h3>재물</h3><p>${esc(data.pack.money)}</p></article>`;
  $('[data-tip-final]').textContent=`${data.branch.title}. ${data.pack.headline}.`;
  $('[data-total-summary]').innerHTML=`<p><strong>${input.name}님의 ${dayWord}</strong> ${esc(headline(data))}</p><p>${esc(data.branch.copy)} ${esc(data.stem.label)}의 흐름을 참고해 일·재물·관계의 순서를 정해보세요.</p>`;
  $('[data-evidence]').innerHTML=`<div class="methodology-grid"><article><strong>기준일 일주</strong><p>${data.expected}의 일주 ${data.target.pillar}을 ${dayWord} 운세의 기준으로 사용했습니다.</p></article><article><strong>내 일주</strong><p>${input.birthDate}${input.birthTime?` · ${input.birthTime}`:''} 기준 일주 ${data.natal.pillar}을 사용했습니다.</p></article><article><strong>지지 관계</strong><p>${data.natal.branch}와 ${data.target.branch}의 관계를 ${data.branch.label}으로 읽었습니다.</p></article><article><strong>천간 흐름</strong><p>${data.natal.stem}과 ${data.target.stem}의 오행 관계를 ${data.stem.label}으로 정리했습니다.</p></article><article><strong>오행 중심</strong><p>${dayWord} 천간의 ${elementName[data.element]} 기운을 분야별 행동 기준에 반영했습니다.</p></article></div>${data.fallback?'<p class="fortune-section-lead">현재 네트워크 연결 때문에 일부 계산은 로컬 기준으로 처리했습니다.</p>':''}`;
  root.dataset.finalState='ready';
  window.__jwFortuneResultReady=true;
  window.dispatchEvent(new CustomEvent('jw:fortune-rendered'));
  window.dispatchEvent(new CustomEvent('jw:result-ready'));
}
function reportText(data){return [`정월재 ${dayWord}의 운세`,`${input.name} · 내 일주 ${data.natal.pillar}`,`${dayWord} ${data.expected} · 일진 ${data.target.pillar}`,`관계: ${data.branch.label} · ${data.stem.label}`,'',headline(data),'',...areaCards(data).map(card=>`${card[1]}: ${card[2]}`)].join('\n');}
async function copyText(text){
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return;}
  const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();
}
async function setupActions(data){
  const copyBtn=$('[data-copy]'),pdfBtn=$('[data-pdf]'),saveBtn=$('[data-save]'),actionStatus=$('[data-action-status]');
  copyBtn?.addEventListener('click',async()=>{try{await copyText(reportText(data));if(actionStatus)actionStatus.textContent='운세 내용을 복사했습니다.';}catch(e){if(actionStatus)actionStatus.textContent='복사하지 못했습니다.';}});
  pdfBtn?.addEventListener('click',()=>window.print());
  saveBtn?.addEventListener('click',async()=>{
    if(!saveBtn)return;saveBtn.disabled=true;if(actionStatus)actionStatus.textContent='저장 상태를 확인하고 있습니다.';
    try{
      const [{firebaseConfig},appMod,authMod,dbMod]=await Promise.all([
        import('./firebase-config.js?v=20260907-1645'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
      ]);
      const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(firebaseConfig),auth=authMod.getAuth(app),user=auth.currentUser;
      if(!user){location.href='./login.html?next=./fortune-result.html';return;}
      const db=dbMod.getFirestore(app);
      await dbMod.addDoc(dbMod.collection(db,'users',user.uid,'readings'),{type:tomorrow?'tomorrow':'fortune',mode:input.mode||'today',title:`${input.name}님의 ${dayWord}의 운세`,input,summary:headline(data),targetDate:data.expected,natalDayPillar:data.natal.pillar,targetDayPillar:data.target.pillar,branchRelation:data.branch.label,stemRelation:data.stem.label,element:data.element,score:data.score,reportText:reportText(data),createdAt:dbMod.serverTimestamp()});
      saveBtn.textContent='저장 완료';if(actionStatus)actionStatus.textContent='정월록과 마이페이지에 저장했습니다.';
    }catch(e){saveBtn.disabled=false;if(actionStatus)actionStatus.textContent='저장하지 못했습니다. 잠시 후 다시 시도해주세요.';}
  });
}

try{
  const data=await calculate();
  render(data);
  setupActions(data);
}catch(error){
  root.dataset.finalState='ready';
  const container=root.querySelector('.fortune-result-container');
  if(container)container.innerHTML=`<section class="fortune-report"><p class="fortune-label">FORTUNE</p><h1>운세 계산 연결이 지연되고 있습니다.</h1><p class="fortune-lead">${input.calendarType==='lunar'?'음력 날짜 계산 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.':'입력 정보를 다시 확인한 뒤 운세를 다시 확인해주세요.'}</p><a class="fortune-button primary" href="${tomorrow?'./tomorrow.html':'./fortune.html'}">다시 입력하기</a></section>`;
  window.dispatchEvent(new CustomEvent('jw:fortune-rendered'));
  window.dispatchEvent(new CustomEvent('jw:result-ready'));
}
