import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';
import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const raw=sessionStorage.getItem('jungwoljae_fortune_input');
if(!raw){location.href='./fortune.html';throw new Error('missing fortune input');}
const input=JSON.parse(raw);
const root=document.querySelector('[data-fortune-result]');
const $=s=>root.querySelector(s);
const app=getApps().length?getApp():initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
let currentUser=null,saved=false,resultData=null;
const tomorrow=input.mode==='tomorrow',dayWord=tomorrow?'내일':'오늘';

const stemInfo={갑:{e:'wood',p:'yang'},을:{e:'wood',p:'yin'},병:{e:'fire',p:'yang'},정:{e:'fire',p:'yin'},무:{e:'earth',p:'yang'},기:{e:'earth',p:'yin'},경:{e:'metal',p:'yang'},신:{e:'metal',p:'yin'},임:{e:'water',p:'yang'},계:{e:'water',p:'yin'}};
const generates={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
const elementName={wood:'목(木)',fire:'화(火)',earth:'토(土)',metal:'금(金)',water:'수(水)'};
const elementPack={
  wood:{headline:'작은 시작 하나를 만드는 날',work:'새 일을 크게 벌리기보다 첫 단계가 분명한 일 하나를 시작하면 힘이 붙습니다.',money:'새 지출은 무엇을 시작하기 위한 돈인지 목적을 분명히 하면 좋습니다.',love:'먼저 말을 걸거나 다음 만남의 계기를 만드는 흐름이 좋습니다.',life:'움직임을 늘리되 시작한 일을 끝까지 이어갈 체력을 남겨두세요.'},
  fire:{headline:'생각을 밖으로 꺼낼수록 좋은 날',work:'제안·발표·공유처럼 결과가 보이는 일을 실제로 꺼내면 흐름이 살아납니다.',money:'필요한 소비는 빠르게 결정하되 기분에 따라 범위를 넓히지는 마세요.',love:'호감이나 필요한 말은 돌려 말하기보다 짧고 분명하게 표현하는 편이 좋습니다.',life:'초반 속도가 붙는 만큼 저녁에는 과열되지 않게 마무리하세요.'},
  earth:{headline:'정리하고 안정시키는 힘이 좋은 날',work:'진행 중인 업무 하나를 마무리하고 다음 순서를 정리하는 데 힘을 쓰세요.',money:'정기 지출과 반복 비용을 정리하면 재물 흐름이 안정됩니다.',love:'말보다 약속과 생활 리듬이 실제로 맞는지를 보는 편이 좋습니다.',life:'식사·휴식·이동의 리듬을 일정하게 유지하면 좋습니다.'},
  metal:{headline:'선택지를 줄이고 기준을 세우는 날',work:'해야 할 일과 하지 않을 일을 나누고 우선순위를 분명히 하세요.',money:'가격보다 유지비와 실제 쓰임까지 함께 보며 결정하는 흐름이 좋습니다.',love:'상대의 말보다 행동의 일관성과 약속을 지키는지를 기준으로 보세요.',life:'미뤄둔 정리나 완료 표시 하나를 남기면 체감이 좋아집니다.'},
  water:{headline:'한 번 더 살피면 답이 보이는 날',work:'자료를 비교하고 빠진 정보를 채운 뒤 결정하면 정확도가 올라갑니다.',money:'결제 전 최근 지출 흐름을 한 번 확인하면 돈의 흐름이 선명해집니다.',love:'한 번의 답장보다 최근 며칠의 연락 흐름과 행동을 함께 보세요.',life:'일정 사이에 여백을 두고 생각을 정리할 시간을 남겨두세요.'}
};
const yukhap=[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']];
const chung=[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];
const hae=[['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']];
const pa=[['자','유'],['축','진'],['인','해'],['묘','오'],['사','신'],['미','술']];
const samhap=[['신','자','진'],['해','묘','미'],['인','오','술'],['사','유','축']];
const hyeongGroups=[['인','사','신'],['축','미','술']];
const pairHas=(arr,a,b)=>arr.some(p=>p.includes(a)&&p.includes(b));
const isHyeong=(a,b)=>(a===b&&['진','오','유','해'].includes(a))||pairHas([['자','묘']],a,b)||hyeongGroups.some(g=>g.includes(a)&&g.includes(b));
const pillarString=v=>typeof v==='string'?v:(v?.korean||v?.name||'');
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function seoulDate(offset=0){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value||'';const d=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00+09:00`);d.setDate(d.getDate()+offset);
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
}
function dayPillar(dateString,{time='12:00',lunar=false,leap=false,gender=''}={}){
  const [year,month,day]=dateString.split('-').map(Number),[hour,minute]=String(time||'12:00').split(':').map(Number);
  const r=calculateFourPillars({year,month,day,hour:Number.isFinite(hour)?hour:12,minute:Number.isFinite(minute)?minute:0,isLunar:lunar,isLeapMonth:leap,gender:gender||undefined});
  const o=typeof r?.toObject==='function'?r.toObject():r,p=pillarString(o?.day);if(!p||[...p].length<2)throw new Error('day pillar missing');
  return {pillar:p,stem:[...p][0],branch:[...p][1]};
}
function branchRel(a,b){
  if(pairHas(yukhap,a,b))return {label:'육합',delta:18,title:'사람과 일이 자연스럽게 이어지는 흐름',copy:'연결점이 잘 생기는 날이라 먼저 손을 내밀거나 관계를 이어가는 힘이 좋습니다.'};
  if(samhap.some(g=>g.includes(a)&&g.includes(b)))return {label:'삼합',delta:12,title:'연결을 활용하면 흐름이 커지는 날',copy:'협업·대화·정보 연결을 활용할수록 일이 부드럽게 이어집니다.'};
  if(pairHas(chung,a,b))return {label:'충',delta:-18,title:'변화와 움직임이 크게 들어오는 흐름',copy:'예상과 다른 요청이나 반응이 들어올 수 있어 방향을 빠르게 조정하는 힘이 중요합니다.'};
  if(isHyeong(a,b))return {label:'형',delta:-12,title:'반복되는 문제를 바로잡는 흐름',copy:'평소 하던 방식에서 생기던 피로를 다른 방법으로 끊어내기 좋습니다.'};
  if(pairHas(hae,a,b))return {label:'해',delta:-10,title:'말과 관계의 결을 세심하게 볼 흐름',copy:'작은 말과 태도의 차이가 크게 느껴질 수 있어 진짜 의도를 정확히 읽는 것이 중요합니다.'};
  if(pairHas(pa,a,b))return {label:'파',delta:-7,title:'작은 어긋남을 정리하는 흐름',copy:'미뤄둔 일정·답장·약속을 하나씩 정리하면 흐름이 빠르게 좋아집니다.'};
  if(a===b)return {label:'동일 지지',delta:5,title:'평소 내 성향이 강하게 드러나는 흐름',copy:'익숙한 장점이 잘 나오고 반복하던 습관도 함께 커질 수 있습니다.'};
  return {label:'평이',delta:2,title:'내 선택이 흐름을 만드는 날',copy:'외부 변수보다 내가 무엇을 먼저 하고 어떤 기준을 세우는지가 하루를 크게 좌우합니다.'};
}
function stemRel(a,b){
  const A=stemInfo[a],B=stemInfo[b];if(!A||!B)return {label:'오행 흐름 평이',delta:0};
  if(A.e===B.e)return {label:`${elementName[B.e]}의 힘이 겹침`,delta:A.p===B.p?6:4};
  if(generates[A.e]===B.e)return {label:'내 기운이 밖으로 이어짐',delta:5};
  if(generates[B.e]===A.e)return {label:'날짜의 기운이 나를 받쳐줌',delta:8};
  if(controls[A.e]===B.e)return {label:'내가 기준을 세우는 흐름',delta:2};
  if(controls[B.e]===A.e)return {label:'압박을 정리하며 움직이는 흐름',delta:-7};
  return {label:'오행 흐름 평이',delta:0};
}
function calculate(){
  const expected=seoulDate(tomorrow?1:0);input.targetDate=expected;sessionStorage.setItem('jungwoljae_fortune_input',JSON.stringify(input));
  const natal=dayPillar(input.birthDate,{time:input.birthTime||'12:00',lunar:input.calendarType==='lunar',leap:Boolean(input.isLeapMonth),gender:input.gender||''});
  const target=dayPillar(expected),br=branchRel(natal.branch,target.branch),sr=stemRel(natal.stem,target.stem),element=stemInfo[target.stem]?.e||'earth',ep=elementPack[element];
  const score=Math.max(20,Math.min(88,54+br.delta+sr.delta));return {expected,natal,target,br,sr,element,ep,score};
}
function areaCards(d){return [['01','재물운',d.ep.money,'재물'],['02','연애운',d.ep.love,'인연'],['03','일·학업운',d.ep.work,'일'],['04','생활운',d.ep.life,'생활']];}
function headline(d){return `${dayWord}은 ${d.score>=68?d.ep.headline:d.br.title}입니다.`;}
function render(d){
  const dateLabel=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date(`${d.expected}T12:00:00+09:00`));
  $('[data-name]').textContent=input.name;$('[data-summary]').textContent=`${input.name}님의 일주 ${d.natal.pillar}과 ${dayWord} 일진 ${d.target.pillar}을 맞춰보면 ${d.br.label}의 관계가 잡힙니다. ${d.sr.label}까지 함께 들어와 ${d.ep.headline}.`;
  $('[data-meta]').innerHTML=`<span>${d.expected}</span><span>${dateLabel}</span><span>내 일주 ${d.natal.pillar}</span><span>${dayWord} 일진 ${d.target.pillar}</span>`;
  $('[data-headline]').textContent=headline(d);$('[data-signal-note]').textContent=`${d.br.copy} ${d.sr.label}이 함께 들어옵니다.`;
  $('[data-relation-pills]').innerHTML=`<span>${d.natal.pillar}</span><span>${d.br.label}</span><span>${d.target.pillar}</span>`;
  $('[data-relation-text]').textContent=`내 일지 ${d.natal.branch}와 ${dayWord} 일지 ${d.target.branch}는 ${d.br.label} 관계입니다. ${d.br.copy} 천간에서는 ${d.natal.stem}과 ${d.target.stem}이 만나 ${d.sr.label}의 흐름을 만듭니다.`;
  $('[data-area-grid]').innerHTML=areaCards(d).map(([n,t,p,b])=>`<article class="fortune-card"><span>${n}</span><h3>${t}</h3><p>${esc(p)}</p><strong>${b}</strong></article>`).join('');
  $('[data-key-grid]').innerHTML=`<article class="fortune-key-card"><span>01 · 내 일주</span><strong>${d.natal.pillar}</strong><p>${input.name}님의 기본 반응을 보는 중심 일주입니다.</p></article><article class="fortune-key-card"><span>02 · ${dayWord} 일진</span><strong>${d.target.pillar} · ${d.br.label}</strong><p>${esc(d.br.copy)}</p></article><article class="fortune-key-card"><span>03 · ${dayWord}의 중심</span><strong>${elementName[d.element]}</strong><p>${esc(d.ep.headline)}</p></article>`;
  $('[data-tip-grid]').innerHTML=[['01','일',d.ep.work],['02','인연',d.ep.love],['03','재물',d.ep.money]].map(([n,t,p])=>`<article class="fortune-tip-card"><span>${n}</span><h3>${t}</h3><p>${esc(p)}</p></article>`).join('');
  $('[data-tip-final]').textContent=`${dayWord}의 중심은 ${d.br.title}입니다. ${d.ep.headline}.`;
  $('[data-evidence]').innerHTML=`<div class="methodology-grid"><article><strong>基準日 日柱 · 기준일 일주</strong><p>${d.expected}의 일주 ${d.target.pillar}을 산출해 ${dayWord} 운세의 기준으로 삼았습니다.</p></article><article><strong>命主 日柱 · 명주 일주</strong><p>${input.name}님의 생년월일${input.birthTime?`·출생시간 ${input.birthTime}`:''}으로 일주 ${d.natal.pillar}을 산출했습니다.</p></article><article><strong>天干 生剋 · 천간 생극</strong><p>${d.natal.stem}과 ${d.target.stem}의 오행 생극과 음양 관계를 비교해 ${d.sr.label}으로 읽었습니다.</p></article><article><strong>地支 六合·三合 · 지지 합</strong><p>일지 사이의 육합·삼합 여부를 관계와 연결의 힘으로 반영했습니다.</p></article><article><strong>沖 · 충</strong><p>서로 마주보는 지지의 충은 변화·이동·방향 전환이 크게 들어오는 흐름으로 읽었습니다.</p></article><article><strong>刑·害·破 · 형해파</strong><p>형·해·파는 반복되는 긴장, 말의 어긋남, 작은 균열을 세밀하게 읽는 기준으로 사용했습니다.</p></article><article><strong>五行 主氣 · 오행 주기</strong><p>${dayWord} 천간 ${d.target.stem}의 ${elementName[d.element]} 기운을 일·재물·인연·생활 해석의 중심으로 두었습니다.</p></article><article><strong>綜合 · 종합</strong><p>일주 관계와 천간 생극을 함께 합성해 한줄 결론과 분야별 흐름을 산출했습니다.</p></article></div>`;
}
function reportText(d){return [`정월재 ${dayWord}의 운세`,`${input.name} · 내 일주 ${d.natal.pillar}`,`${dayWord} ${d.expected} · 일진 ${d.target.pillar}`,`관계: ${d.br.label} · ${d.sr.label}`,'',headline(d),'',...areaCards(d).map(x=>`${x[1]}: ${x[2]}`),'',`${dayWord}의 중심: ${d.ep.headline}`].join('\n');}

try{resultData=calculate();render(resultData);}catch(error){root.innerHTML=`<div class="fortune-result-container"><section class="fortune-report"><h1>운세를 계산하지 못했습니다.</h1><p>태어난 날짜와 달력 기준을 다시 확인해주세요.</p><a href="${tomorrow?'./tomorrow.html':'./fortune.html'}" class="fortune-button primary">다시 보기</a></section></div>`;throw error;}

const copyBtn=$('[data-copy]'),pdfBtn=$('[data-pdf]'),saveBtn=$('[data-save]'),actionStatus=$('[data-action-status]');
copyBtn?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(reportText(resultData));actionStatus.textContent='운세 내용을 복사했습니다.';}catch(e){actionStatus.textContent='복사하지 못했습니다.';}});
pdfBtn?.addEventListener('click',()=>window.print());
onAuthStateChanged(auth,user=>{currentUser=user||null;if(saveBtn)saveBtn.textContent=!user?'로그인 후 저장':saved?'저장 완료':'마이페이지에 저장';});
saveBtn?.addEventListener('click',async()=>{
  if(saved){actionStatus.textContent='이미 저장한 운세입니다.';return;}
  if(!currentUser){location.href=`./login.html?next=./fortune-result.html`;return;}
  saveBtn.disabled=true;saveBtn.textContent='저장 중…';
  try{
    const ref=await addDoc(collection(db,'users',currentUser.uid,'readings'),{type:tomorrow?'tomorrow':'fortune',mode:input.mode||'today',title:`${input.name}님의 ${dayWord}의 운세`,input,summary:headline(resultData),targetDate:resultData.expected,natalDayPillar:resultData.natal.pillar,targetDayPillar:resultData.target.pillar,branchRelation:resultData.br.label,stemRelation:resultData.sr.label,element:resultData.element,score:resultData.score,areas:Object.fromEntries(areaCards(resultData).map(x=>[x[1],x[2]])),reportText:reportText(resultData),createdAt:serverTimestamp()});
    saved=true;saveBtn.textContent='저장 완료';actionStatus.innerHTML=`정월록과 마이페이지에 저장했습니다. <a href="./archive.html?reading=${encodeURIComponent(ref.id)}">저장한 운세 보기</a>`;
  }catch(e){saveBtn.disabled=false;saveBtn.textContent='마이페이지에 저장';actionStatus.textContent='저장하지 못했습니다.';}
});
