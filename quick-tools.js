import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';
import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const tool=document.body.dataset.quickTool;
const form=document.querySelector('[data-quick-form]');
if(!tool||!form) throw new Error('quick tool form missing');

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app),db=getFirestore(app);
const status=form.querySelector('[data-quick-status]');
const profileState=form.querySelector('[data-profile-state]');
const nameInput=form.querySelector('#quick-name');
const birthDateInput=form.querySelector('#quick-birth-date');
const birthTimeInput=form.querySelector('#quick-birth-time');
const timeUnknown=form.querySelector('#quick-time-unknown');
const calendar=form.querySelector('#quick-calendar');
const gender=form.querySelector('#quick-gender');
const result=document.querySelector('[data-quick-result]');
const resultBody=document.querySelector('[data-quick-result-body]');
const resultTitle=document.querySelector('[data-quick-result-title]');
const resultLead=document.querySelector('[data-quick-result-lead]');

const yukhap=[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']];
const chung=[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];
const hae=[['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']];
const pa=[['자','유'],['축','진'],['인','해'],['묘','오'],['사','신'],['미','술']];
const samhap=[['신','자','진'],['해','묘','미'],['인','오','술'],['사','유','축']];
const hyeongGroups=[['인','사','신'],['축','미','술']];
const pairHas=(arr,a,b)=>arr.some(p=>p.includes(a)&&p.includes(b));
const isHyeong=(a,b)=>(a===b&&['진','오','유','해'].includes(a))||pairHas([['자','묘']],a,b)||hyeongGroups.some(g=>g.includes(a)&&g.includes(b));

const stemInfo={
  갑:{element:'wood',polarity:'yang'},을:{element:'wood',polarity:'yin'},병:{element:'fire',polarity:'yang'},정:{element:'fire',polarity:'yin'},무:{element:'earth',polarity:'yang'},기:{element:'earth',polarity:'yin'},경:{element:'metal',polarity:'yang'},신:{element:'metal',polarity:'yin'},임:{element:'water',polarity:'yang'},계:{element:'water',polarity:'yin'}
};
const generates={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
const elementKo={wood:'목(木) · 시작과 성장',fire:'화(火) · 표현과 실행',earth:'토(土) · 안정과 정착',metal:'금(金) · 판단과 정리',water:'수(水) · 관찰과 흐름'};
const purposeLabels={contract:'계약·서명',open:'개업·오픈',interview:'면접·중요 미팅',exam:'시험·평가',presentation:'발표·제안',project:'프로젝트 시작',relationship:'고백·관계 시작',travel:'여행·출발'};
const purposeElements={
  contract:{metal:14,earth:8,water:3},open:{wood:14,fire:10,earth:4},interview:{fire:13,metal:7,water:4},exam:{water:12,metal:9,earth:3},presentation:{fire:13,water:6,wood:4},project:{wood:13,fire:8,earth:4},relationship:{fire:10,wood:8,water:4},travel:{water:11,wood:7,fire:3}
};
const moveElements={home:{earth:14,water:5,wood:3},movein:{wood:12,earth:10,fire:4},office:{wood:11,fire:10,metal:6,earth:3}};
const moveLabels={home:'주거 이사',movein:'입주',office:'사무실 이전'};

const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const pillarString=v=>typeof v==='string'?v:(v?.korean||v?.name||'');
const pad=n=>String(n).padStart(2,'0');
const dateKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
const fmtDate=s=>new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date(`${s}T12:00:00`));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

function seoulToday(offset=0){
  const base=new Date();
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(base);
  const get=t=>parts.find(p=>p.type===t)?.value||'';
  const date=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00+09:00`);
  date.setDate(date.getDate()+offset);
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}

function ensureLeapControl(){
  if(!calendar||form.querySelector('#quick-leap'))return;
  const field=calendar.closest('.quick-field');
  if(!field)return;
  const wrap=document.createElement('label');
  wrap.className='quick-check';
  wrap.id='quick-leap-wrap';
  wrap.hidden=true;
  wrap.innerHTML='<input id="quick-leap" type="checkbox"><span>윤달로 태어났습니다.</span>';
  field.appendChild(wrap);
  const sync=()=>{wrap.hidden=calendar.value!=='lunar';if(wrap.hidden)wrap.querySelector('input').checked=false;};
  calendar.addEventListener('change',sync);sync();
}
ensureLeapControl();

function calcPillars(dateString,{time='12:00',isLunar=false,isLeapMonth=false,genderValue=''}={}){
  const [year,month,day]=String(dateString).split('-').map(Number);
  const [hour,minute]=String(time||'12:00').split(':').map(Number);
  const r=calculateFourPillars({year,month,day,hour:Number.isFinite(hour)?hour:12,minute:Number.isFinite(minute)?minute:0,isLunar,isLeapMonth,gender:genderValue||undefined});
  return typeof r?.toObject==='function'?r.toObject():r;
}
function dayParts(dateString,opts={}){
  const o=calcPillars(dateString,opts),p=pillarString(o?.day);
  if(!p||[...p].length<2)throw new Error('day pillar missing');
  return {pillar:p,stem:[...p][0],branch:[...p][1]};
}
function yearZodiac(dateString,opts={}){
  const o=calcPillars(dateString,opts),p=pillarString(o?.year),b=[...p][1];
  const branchToZodiac={자:'rat',축:'ox',인:'tiger',묘:'rabbit',진:'dragon',사:'snake',오:'horse',미:'goat',신:'monkey',유:'rooster',술:'dog',해:'pig'};
  return branchToZodiac[b]||'rat';
}
function branchRelation(a,b){
  if(pairHas(yukhap,a,b))return {score:18,label:'육합 · 서로 자연스럽게 맞물리는 날'};
  if(samhap.some(g=>g.includes(a)&&g.includes(b)))return {score:12,label:'삼합 · 사람과 일이 이어지기 좋은 날'};
  if(pairHas(chung,a,b))return {score:-18,label:'충 · 변화와 움직임이 크게 들어오는 날'};
  if(isHyeong(a,b))return {score:-12,label:'형 · 반복되는 일을 바로잡는 날'};
  if(pairHas(hae,a,b))return {score:-10,label:'해 · 말과 관계를 세심하게 볼 날'};
  if(pairHas(pa,a,b))return {score:-7,label:'파 · 작은 어긋남을 정리할 날'};
  if(a===b)return {score:5,label:'동일 지지 · 내 기운이 강하게 드러나는 날'};
  return {score:2,label:'평이 · 내 선택과 실행이 중요한 날'};
}
function stemRelation(a,b){
  const A=stemInfo[a],B=stemInfo[b];if(!A||!B)return {score:0,label:'오행 흐름 평이'};
  if(A.element===B.element)return {score:A.polarity===B.polarity?6:4,label:`${elementKo[B.element]}의 힘이 겹치는 날`};
  if(generates[A.element]===B.element)return {score:5,label:'내 기운이 바깥으로 이어지는 날'};
  if(generates[B.element]===A.element)return {score:8,label:'날짜의 기운이 나를 받쳐주는 날'};
  if(controls[A.element]===B.element)return {score:2,label:'내가 기준을 세우고 움직일 날'};
  if(controls[B.element]===A.element)return {score:-7,label:'압박을 정리하며 움직일 날'};
  return {score:0,label:'오행 흐름 평이'};
}
function natalOptions(b){return {time:b.birthTime||'12:00',isLunar:b.calendarType==='lunar',isLeapMonth:Boolean(b.isLeapMonth),genderValue:b.gender||''};}
function scoreDate(b,date,purpose=''){
  const natal=dayParts(b.birthDate,natalOptions(b));
  const target=dayParts(date);
  const br=branchRelation(natal.branch,target.branch);
  const sr=stemRelation(natal.stem,target.stem);
  const el=stemInfo[target.stem]?.element;
  let score=52+br.score+sr.score+(purposeElements[purpose]?.[el]||0);
  return {date,score,branch:br,stem:sr,day:target,element:el};
}
function reasonFor(item,purpose){
  const p=purposeLabels[purpose]||'중요한 일정';
  const e=item.element?elementKo[item.element]:'';
  return `${item.day.pillar}일 · ${item.branch.label}. ${item.stem.label}. ${e}의 흐름이 ${p}의 성격과 함께 작동합니다.`;
}
function setDateDefaults(){
  const start=form.querySelector('#quick-start'),end=form.querySelector('#quick-end');
  if(start&&!start.value)start.value=seoulToday(tool==='moving'?7:1);
  if(end&&!end.value)end.value=seoulToday(tool==='moving'?60:30);
  if(tool==='tomorrow'){
    const label=document.querySelector('[data-target-date]');
    if(label)label.textContent=new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date(`${seoulToday(1)}T12:00:00+09:00`));
  }
}
setDateDefaults();

function syncTime(){if(!birthTimeInput||!timeUnknown)return;birthTimeInput.disabled=timeUnknown.checked;if(timeUnknown.checked)birthTimeInput.value='';}
timeUnknown?.addEventListener('change',syncTime);syncTime();

onAuthStateChanged(auth,async user=>{
  if(!profileState)return;
  if(!user){profileState.textContent='태어난 정보를 입력하면 바로 계산합니다.';return;}
  try{
    const snap=await getDoc(doc(db,'users',user.uid));
    if(!snap.exists()){profileState.textContent='태어난 정보를 입력해주세요.';return;}
    const p=snap.data();
    if(p.name&&nameInput)nameInput.value=p.name;
    if(p.birthDate&&birthDateInput)birthDateInput.value=p.birthDate;
    if(p.birthTime&&birthTimeInput&&!p.birthTimeUnknown)birthTimeInput.value=p.birthTime;
    if(timeUnknown)timeUnknown.checked=Boolean(p.birthTimeUnknown);
    if(calendar&&p.calendarType)calendar.value=p.calendarType;
    if(gender&&p.gender)gender.value=p.gender;
    const leap=form.querySelector('#quick-leap');if(leap)leap.checked=Boolean(p.isLeapMonth);
    calendar?.dispatchEvent(new Event('change'));
    if(leap)leap.checked=Boolean(p.isLeapMonth)&&calendar?.value==='lunar';
    syncTime();
    profileState.dataset.state='ok';profileState.textContent='저장된 사주 기본정보를 불러왔습니다.';
  }catch(e){profileState.textContent='태어난 정보를 입력해주세요.';}
});

function validate(){
  status.textContent='';
  if(!nameInput?.value.trim()){status.textContent='이름 또는 닉네임을 입력해주세요.';nameInput?.focus();return false;}
  if(!birthDateInput?.value){status.textContent='태어난 날짜를 입력해주세요.';birthDateInput?.focus();return false;}
  if(!form.elements.consent?.checked){status.textContent='분석을 위한 정보 사용에 동의해주세요.';return false;}
  return true;
}
function birthBase(){
  return {
    name:nameInput.value.trim(),birthDate:birthDateInput.value,birthYear:Number(birthDateInput.value.slice(0,4)),
    birthWeekday:new Intl.DateTimeFormat('ko-KR',{weekday:'long'}).format(new Date(`${birthDateInput.value}T12:00:00`)),
    birthTime:birthTimeInput?.value||'',birthTimeUnknown:Boolean(timeUnknown?.checked),calendarType:calendar?.value||'solar',
    isLeapMonth:Boolean(form.querySelector('#quick-leap')?.checked),gender:gender?.value||''
  };
}
function showResult(title,lead,html){
  resultTitle.textContent=title;resultLead.textContent=lead;resultBody.innerHTML=html;result.hidden=false;
  setTimeout(()=>result.scrollIntoView({behavior:'smooth',block:'start'}),50);
}
function hashSeed(str){let h=2166136261;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function randomFromSeed(seed){let x=seed||1;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
function rangeDates(start,end,max=366){
  const out=[],s=new Date(`${start}T12:00:00`),e=new Date(`${end}T12:00:00`);
  for(let d=new Date(s);d<=e&&out.length<max;d=addDays(d,1))out.push(dateKey(d));
  return out;
}

function runTomorrow(){
  const b=birthBase(),targetDate=seoulToday(1),zodiac=yearZodiac(b.birthDate,natalOptions(b));
  sessionStorage.setItem('jungwoljae_fortune_input',JSON.stringify({...b,zodiac,targetDate,mode:'tomorrow',createdAt:Date.now()}));
  location.href='./fortune-result.html';
}
function runLucky(){
  const b=birthBase(),today=dayParts(seoulToday()),natal=dayParts(b.birthDate,natalOptions(b));
  const seed=hashSeed(`${b.birthDate}|${b.birthTime}|${b.calendarType}|${b.isLeapMonth}|${natal.pillar}|${today.pillar}|${seoulToday()}`),rnd=randomFromSeed(seed),nums=[];
  while(nums.length<6){const n=1+Math.floor(rnd()*45);if(!nums.includes(n))nums.push(n);}nums.sort((a,c)=>a-c);
  const key=nums[Math.floor(rnd()*nums.length)];
  showResult(`${b.name}님의 오늘 행운 숫자`,`오늘 일진 ${today.pillar}과 ${b.name}님의 일주 ${natal.pillar}을 겹쳐 여섯 숫자를 뽑았습니다.`,
  `<div class="number-set">${nums.map(n=>`<span class="number-ball${n===key?' is-key':''}">${n}</span>`).join('')}</div><div class="quick-card-grid"><article class="quick-card"><small>오늘의 중심 숫자</small><strong>${key}</strong><p>${key}을 중심으로 여섯 숫자의 흐름을 봅니다. 번호·순서·좌석처럼 숫자를 고르는 장면에서 오늘의 기운으로 써보세요.</p></article><article class="quick-card"><small>명리 조합</small><strong>${natal.pillar} × ${today.pillar}</strong><p>내 일주와 오늘 일주의 천간·지지 조합을 숫자 시드에 함께 반영했습니다.</p></article></div>`);
}
function runImportant(){
  const start=form.querySelector('#quick-start').value,end=form.querySelector('#quick-end').value,purpose=form.querySelector('#quick-purpose').value;
  if(!start||!end||!purpose){status.textContent='용도와 날짜 범위를 모두 선택해주세요.';return;}
  if(new Date(start)>new Date(end)){status.textContent='시작일이 종료일보다 늦습니다.';return;}
  const b=birthBase(),dates=rangeDates(start,end,366);
  if(!dates.length){status.textContent='날짜 범위를 다시 확인해주세요.';return;}
  const items=dates.map(d=>scoreDate(b,d,purpose)).sort((a,c)=>c.score-a.score).slice(0,5);
  showResult(`${purposeLabels[purpose]}에 좋은 날`,`선택한 기간의 일진을 ${b.name}님의 일주와 대조해 ${purposeLabels[purpose]}에 힘이 잘 모이는 날짜를 추렸습니다.`,
  `<div class="date-ranking">${items.map((it,i)=>`<article class="date-row"><span class="rank">${i+1}</span><div><time>${fmtDate(it.date)}</time><p>${esc(reasonFor(it,purpose))}</p></div><span class="score">택일 ${clamp(Math.round(it.score),1,99)}</span></article>`).join('')}</div><div class="quick-note"><strong>택일 기준</strong> · 출생 일주와 후보일의 천간·지지 관계, 합·충·형·해·파, 그리고 ${purposeLabels[purpose]}에 맞는 오행 흐름을 함께 계산했습니다.</div>`);
}
function runMoving(){
  const start=form.querySelector('#quick-start').value,end=form.querySelector('#quick-end').value,type=form.querySelector('#quick-move-type').value||'home';
  if(!start||!end){status.textContent='이사 예정 기간을 선택해주세요.';return;}
  if(new Date(start)>new Date(end)){status.textContent='시작일이 종료일보다 늦습니다.';return;}
  const b=birthBase(),dates=rangeDates(start,end,366),weights=moveElements[type]||moveElements.home;
  const items=dates.map(d=>{const it=scoreDate(b,d,'');it.score+=weights[it.element]||0;return it;}).sort((a,c)=>c.score-a.score);
  const best=items.slice(0,5),avoid=[...items].sort((a,c)=>a.score-c.score).slice(0,3);
  showResult(`${b.name}님의 ${moveLabels[type]} 길일`,`출생 일주와 후보 날짜의 합·충·형·해, 그리고 ${moveLabels[type]}에 맞는 오행을 함께 보아 길일을 골랐습니다.`,
  `<div class="date-ranking">${best.map((it,i)=>`<article class="date-row"><span class="rank">${i+1}</span><div><time>${fmtDate(it.date)}</time><p>${esc(`${it.day.pillar}일 · ${it.branch.label}. ${it.stem.label}. ${elementKo[it.element]}의 힘이 ${moveLabels[type]}의 흐름과 이어집니다.`)}</p></div><span class="score">택일 ${clamp(Math.round(it.score),1,99)}</span></article>`).join('')}</div><div class="quick-card-grid" style="margin-top:14px"><article class="quick-card"><small>피하는 날</small><strong>${avoid.map(x=>fmtDate(x.date)).join(' · ')}</strong><p>선택한 기간 가운데 출생 일주와 충돌이 크거나 ${moveLabels[type]}의 기운이 약하게 잡히는 날짜입니다.</p></article><article class="quick-card"><small>${moveLabels[type]}의 핵심 오행</small><strong>${Object.entries(weights).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>elementKo[k]).join(' · ')}</strong><p>${moveLabels[type]}에 필요한 정착·시작·활동의 성격을 오행 가중치에 반영했습니다.</p></article></div>`);
}

form.addEventListener('submit',e=>{
  e.preventDefault();if(!validate())return;
  try{
    if(tool==='tomorrow')runTomorrow();
    else if(tool==='lucky-number')runLucky();
    else if(tool==='important-day')runImportant();
    else if(tool==='moving')runMoving();
  }catch(err){console.error(err);status.textContent='계산 중 오류가 발생했습니다. 태어난 정보와 날짜를 다시 확인해주세요.';}
});
