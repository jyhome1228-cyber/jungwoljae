import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';
import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const form=document.querySelector('[data-fortune-form]');
if(!form)throw new Error('fortune form missing');
const app=getApps().length?getApp():initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const status=form.querySelector('[data-fortune-status]'),profileState=form.querySelector('[data-profile-state]'),memberName=document.querySelector('[data-member-name]');
const year=form.querySelector('#fortune-year'),month=form.querySelector('#fortune-month'),day=form.querySelector('#fortune-day');
const meridiem=form.querySelector('#fortune-meridiem'),hour=form.querySelector('#fortune-hour'),minute=form.querySelector('#fortune-minute'),timeUnknown=form.querySelector('#fortune-time-unknown');
const calendar=form.querySelector('#fortune-calendar'),leap=form.querySelector('#fortune-leap'),lunarExtra=form.querySelector('[data-lunar-extra]'),gender=form.querySelector('#fortune-gender'),nameInput=form.querySelector('#fortune-name'),weekdayNode=form.querySelector('[data-birth-weekday]');
const branchToZodiac={자:'rat',축:'ox',인:'tiger',묘:'rabbit',진:'dragon',사:'snake',오:'horse',미:'goat',신:'monkey',유:'rooster',술:'dog',해:'pig'};
const pad=n=>String(n).padStart(2,'0');
const pillarString=v=>typeof v==='string'?v:(v?.korean||v?.name||'');

function seoulToday(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value||'';
  const date=`${get('year')}-${get('month')}-${get('day')}`;
  const label=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date(`${date}T12:00:00+09:00`));
  return {date,label,year:Number(get('year'))};
}
const today=seoulToday();
const todayNode=document.querySelector('[data-today-label]');if(todayNode)todayNode.textContent=today.label;
for(let y=today.year;y>=1900;y--)year.add(new Option(`${y}년`,String(y)));
for(let m=1;m<=12;m++)month.add(new Option(`${m}월`,pad(m)));
for(let h=1;h<=12;h++)hour.add(new Option(`${h}시`,pad(h)));
for(let m=0;m<60;m+=10)minute.add(new Option(`${pad(m)}분`,pad(m)));

function fillDays(){
  const keep=day.value,y=Number(year.value)||2000,m=Number(month.value)||1,max=new Date(y,m,0).getDate();
  day.innerHTML='<option value="">일</option>';
  for(let d=1;d<=max;d++)day.add(new Option(`${d}일`,pad(d)));
  if(keep&&Number(keep)<=max)day.value=keep;
}
function birthDate(){return year.value&&month.value&&day.value?`${year.value}-${month.value}-${day.value}`:'';}
function birthTime(){
  if(timeUnknown.checked)return '';
  if(!(meridiem.value&&hour.value&&minute.value))return '';
  let h=Number(hour.value)%12;if(meridiem.value==='pm')h+=12;
  return `${pad(h)}:${minute.value}`;
}
function syncTime(){const disabled=timeUnknown.checked;[meridiem,hour,minute].forEach(el=>{el.disabled=disabled;if(disabled)el.value='';});}
function syncCalendar(){const lunar=calendar.value==='lunar';if(lunarExtra)lunarExtra.hidden=!lunar;if(!lunar&&leap)leap.checked=false;syncMeta();}
function syncMeta(){
  const d=birthDate();
  if(!d){weekdayNode.textContent='날짜를 선택해주세요';return;}
  weekdayNode.textContent=new Intl.DateTimeFormat('ko-KR',{weekday:'long'}).format(new Date(`${d}T12:00:00`));
}
function zodiacFromBirth(d){
  try{
    const [y,m,dd]=d.split('-').map(Number);
    const t=birthTime()||'12:00',[h,min]=t.split(':').map(Number);
    const r=calculateFourPillars({year:y,month:m,day:dd,hour:h,minute:min,isLunar:calendar.value==='lunar',isLeapMonth:Boolean(leap?.checked),gender:gender.value||undefined});
    const o=typeof r?.toObject==='function'?r.toObject():r,p=pillarString(o?.year);
    return branchToZodiac[[...p][1]]||'rat';
  }catch(e){return 'rat';}
}
function fillProfile(p){
  if(p.name){nameInput.value=p.name;memberName.textContent=`${p.name}님`;}
  if(p.birthDate){const [y,m,d]=p.birthDate.split('-');year.value=y;month.value=m;fillDays();day.value=d;}
  if(p.birthTimeUnknown){timeUnknown.checked=true;syncTime();}
  else if(p.birthTime){const [hRaw,mRaw]=p.birthTime.split(':');const h=Number(hRaw);meridiem.value=h>=12?'pm':'am';hour.value=pad((h%12)||12);minute.value=pad(Math.min(50,Math.round(Number(mRaw||0)/10)*10));}
  if(p.calendarType)calendar.value=p.calendarType;
  if(p.gender)gender.value=p.gender;
  syncCalendar();if(leap)leap.checked=Boolean(p.isLeapMonth)&&calendar.value==='lunar';syncMeta();
}

year.addEventListener('change',()=>{fillDays();syncMeta();});month.addEventListener('change',()=>{fillDays();syncMeta();});day.addEventListener('change',syncMeta);timeUnknown.addEventListener('change',syncTime);calendar.addEventListener('change',syncCalendar);syncTime();syncCalendar();fillDays();

onAuthStateChanged(auth,async user=>{
  if(!user){profileState.textContent='태어난 정보를 입력하면 오늘의 일주 관계를 계산합니다.';return;}
  try{
    const snap=await getDoc(doc(db,'users',user.uid));
    if(!snap.exists()){profileState.textContent='태어난 정보를 입력해주세요.';return;}
    fillProfile(snap.data());profileState.dataset.state='ok';profileState.textContent='저장된 사주 기본정보를 불러왔습니다.';
  }catch(e){profileState.textContent='태어난 정보를 입력해주세요.';}
});

form.addEventListener('submit',e=>{
  e.preventDefault();if(form.dataset.submitting==='true')return;status.textContent='';
  const name=nameInput.value.trim(),date=birthDate(),time=birthTime();
  if(!name){status.textContent='이름 또는 닉네임을 입력해주세요.';nameInput.focus();return;}
  if(!date){status.textContent='태어난 연·월·일을 모두 선택해주세요.';year.focus();return;}
  if(!timeUnknown.checked&&(meridiem.value||hour.value||minute.value)&&!time){status.textContent='시간을 입력하려면 오전/오후·시·분을 모두 선택해주세요.';return;}
  if(!form.elements.consent.checked){status.textContent='분석을 위한 정보 사용에 동의해주세요.';return;}
  const payload={
    name,birthYear:Number(year.value),birthDate:date,birthWeekday:new Intl.DateTimeFormat('ko-KR',{weekday:'long'}).format(new Date(`${date}T12:00:00`)),birthTime:time,birthTimeUnknown:timeUnknown.checked,
    calendarType:calendar.value,isLeapMonth:Boolean(leap?.checked),gender:gender.value,zodiac:zodiacFromBirth(date),targetDate:today.date,mode:'today',createdAt:Date.now()
  };
  sessionStorage.setItem('jungwoljae_fortune_input',JSON.stringify(payload));
  form.dataset.submitting='true';const submit=form.querySelector('button[type="submit"]');if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true');}
  location.href='./fortune-result.html';
});
