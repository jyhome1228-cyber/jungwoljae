import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';
import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const form=document.querySelector('[data-fortune-form]');
if(!form) throw new Error('fortune form missing');
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
const status=form.querySelector('[data-fortune-status]');
const profileState=form.querySelector('[data-profile-state]');
const memberName=document.querySelector('[data-member-name]');
const yearSelect=form.querySelector('#fortune-year');
const monthSelect=form.querySelector('#fortune-month');
const daySelect=form.querySelector('#fortune-day');
const weekdayNode=form.querySelector('[data-birth-weekday]');
const nameInput=form.querySelector('#fortune-name');

const zodiacOrder=['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig'];
const branchToZodiac={자:'rat',축:'ox',인:'tiger',묘:'rabbit',진:'dragon',사:'snake',오:'horse',미:'goat',신:'monkey',유:'rooster',술:'dog',해:'pig'};
const zodiacKo={rat:'쥐띠',ox:'소띠',tiger:'호랑이띠',rabbit:'토끼띠',dragon:'용띠',snake:'뱀띠',horse:'말띠',goat:'양띠',monkey:'원숭이띠',rooster:'닭띠',dog:'개띠',pig:'돼지띠'};
const mod=(n,m)=>((n%m)+m)%m;
const zodiacFromYear=(year)=>zodiacOrder[mod(Number(year)-4,12)];
let profileCalendarType='solar';

function seoulToday(){
  const parts=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',weekday:'long'}).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value||'';
  return {year:Number(get('year')),month:Number(get('month')),day:Number(get('day')),label:`${get('year')}.${get('month')}.${get('day')} ${get('weekday')}`};
}
document.querySelector('[data-today-label]').textContent=seoulToday().label;

const currentYear=seoulToday().year;
for(let y=currentYear;y>=1930;y--) yearSelect.insertAdjacentHTML('beforeend',`<option value="${y}">${y}년</option>`);
for(let m=1;m<=12;m++) monthSelect.insertAdjacentHTML('beforeend',`<option value="${String(m).padStart(2,'0')}">${m}월</option>`);

function fillDays(){
  const previous=daySelect.value;
  daySelect.innerHTML='<option value="">일</option>';
  const y=Number(yearSelect.value)||2000;
  const m=Number(monthSelect.value)||1;
  const max=new Date(y,m,0).getDate();
  for(let d=1;d<=max;d++) daySelect.insertAdjacentHTML('beforeend',`<option value="${String(d).padStart(2,'0')}">${d}일</option>`);
  if([...daySelect.options].some(o=>o.value===previous)) daySelect.value=previous;
}
fillDays();

function birthDateValue(){
  return yearSelect.value&&monthSelect.value&&daySelect.value?`${yearSelect.value}-${monthSelect.value}-${daySelect.value}`:'';
}
function weekdayFromDate(dateString){
  if(!dateString)return '';
  const date=new Date(`${dateString}T12:00:00`);
  if(Number.isNaN(date.getTime()))return '';
  return new Intl.DateTimeFormat('ko-KR',{weekday:'long'}).format(date);
}
function selectZodiac(key){
  const radio=form.querySelector(`input[name="zodiac"][value="${key}"]`);
  if(radio)radio.checked=true;
}
function pillarString(v){return typeof v==='string'?v:(v?.korean||v?.name||'');}
function zodiacFromBirthDate(dateString,{isLunar=false,gender}={}){
  try{
    const [y,m,d]=String(dateString||'').split('-').map(Number);
    if(!y||!m||!d)return zodiacFromYear(y);
    const result=calculateFourPillars({year:y,month:m,day:d,hour:12,minute:0,isLunar,gender:gender||undefined});
    const obj=typeof result?.toObject==='function'?result.toObject():result;
    const yearPillar=pillarString(obj?.year);
    return branchToZodiac[[...yearPillar][1]]||zodiacFromYear(y);
  }catch(e){
    return zodiacFromYear(String(dateString||'').slice(0,4));
  }
}
function syncBirthMeta({isLunar=false,gender}={}){
  const date=birthDateValue();
  const weekday=weekdayFromDate(date);
  weekdayNode.textContent=weekday||'날짜를 선택해주세요';
  if(date)selectZodiac(zodiacFromBirthDate(date,{isLunar,gender}));
}
function fillBirthDate(dateString,{isLunar=false,gender}={}){
  const [y,m,d]=String(dateString||'').split('-');
  if(!y||!m||!d)return;
  yearSelect.value=y;
  monthSelect.value=m;
  fillDays();
  daySelect.value=d;
  syncBirthMeta({isLunar,gender});
}

yearSelect.addEventListener('change',()=>{fillDays();syncBirthMeta();});
monthSelect.addEventListener('change',()=>{fillDays();syncBirthMeta();});
daySelect.addEventListener('change',()=>syncBirthMeta());

onAuthStateChanged(auth,async user=>{
  if(!user){profileState.textContent='비회원은 태어난 날짜와 띠를 직접 입력해주세요.';return;}
  try{
    const snap=await getDoc(doc(db,'users',user.uid));
    if(!snap.exists()){profileState.textContent='저장된 사주 기본 정보가 없어 직접 입력해주세요.';return;}
    const p=snap.data();
    profileCalendarType=p.calendarType||'solar';
    if(p.name){nameInput.value=p.name;memberName.textContent=`${p.name}님`;}
    if(p.birthDate){
      fillBirthDate(p.birthDate,{isLunar:profileCalendarType==='lunar',gender:p.gender});
      selectZodiac(zodiacFromBirthDate(p.birthDate,{isLunar:profileCalendarType==='lunar',gender:p.gender}));
    }
    const zName=zodiacKo[form.querySelector('input[name="zodiac"]:checked')?.value]||'띠';
    profileState.dataset.state='ok';
    profileState.textContent=`회원정보에서 ${p.birthDate||'생년월일'} · ${weekdayFromDate(p.birthDate)||'출생요일'} · ${zName}를 불러왔습니다.`;
  }catch(e){
    profileState.textContent='회원정보를 불러오지 못했습니다. 직접 입력해주세요.';
  }
});

form.addEventListener('submit',(event)=>{
  event.preventDefault();
  status.textContent='';
  const name=nameInput.value.trim();
  const birthDate=birthDateValue();
  const birthWeekday=weekdayFromDate(birthDate);
  const birthYear=Number(yearSelect.value);
  const zodiac=form.querySelector('input[name="zodiac"]:checked')?.value||'';
  const consent=form.elements.consent.checked;
  if(!name){status.textContent='이름 또는 닉네임을 입력해주세요.';nameInput.focus();return;}
  if(!birthDate){status.textContent='태어난 연·월·일을 모두 선택해주세요.';yearSelect.focus();return;}
  if(!zodiac){status.textContent='나의 띠를 선택해주세요.';return;}
  if(!consent){status.textContent='분석을 위한 정보 사용에 동의해주세요.';return;}
  const today=seoulToday();
  const payload={
    name,
    birthYear,
    birthDate,
    birthWeekday,
    zodiac,
    targetDate:`${today.year}-${String(today.month).padStart(2,'0')}-${String(today.day).padStart(2,'0')}`,
    createdAt:Date.now()
  };
  sessionStorage.setItem('jungwoljae_fortune_input',JSON.stringify(payload));
  location.href='./fortune-result.html';
});
