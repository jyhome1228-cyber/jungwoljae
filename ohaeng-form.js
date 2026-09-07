import { firebaseConfig } from './firebase-config.js?v=20260907-1637';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
const form=document.querySelector('[data-ohaeng-form]');
if(!form) throw new Error('ohaeng form not found');

const q=(s)=>form.querySelector(s);
const status=q('[data-ohaeng-status]');
const profileState=q('[data-profile-state]');
const memberName=q('[data-member-name]');
const year=q('#ohaeng-year');
const month=q('#ohaeng-month');
const day=q('#ohaeng-day');
const meridiem=q('#ohaeng-meridiem');
const hour=q('#ohaeng-hour');
const minute=q('#ohaeng-minute');
const timeUnknown=q('#ohaeng-time-unknown');
const calendar=q('#ohaeng-calendar');
const lunarExtra=q('[data-lunar-extra]');

const setError=(name,msg='')=>{const el=q(`[data-error="${name}"]`);if(el)el.textContent=msg;};
const setStatus=(msg='')=>{if(status)status.textContent=msg;};

function populate(){
  const now=new Date().getFullYear();
  for(let y=now;y>=1900;y--) year.insertAdjacentHTML('beforeend',`<option value="${y}">${y}년</option>`);
  for(let m=1;m<=12;m++) month.insertAdjacentHTML('beforeend',`<option value="${String(m).padStart(2,'0')}">${m}월</option>`);
  for(let h=1;h<=12;h++) hour.insertAdjacentHTML('beforeend',`<option value="${String(h).padStart(2,'0')}">${h}시</option>`);
  for(let min=0;min<60;min+=10) minute.insertAdjacentHTML('beforeend',`<option value="${String(min).padStart(2,'0')}">${String(min).padStart(2,'0')}분</option>`);
  fillDays();
}
function fillDays(){
  const prev=day.value;
  day.innerHTML='<option value="">일</option>';
  const y=Number(year.value)||2000;
  const m=Number(month.value)||1;
  const max=new Date(y,m,0).getDate();
  for(let d=1;d<=max;d++) day.insertAdjacentHTML('beforeend',`<option value="${String(d).padStart(2,'0')}">${d}일</option>`);
  if([...day.options].some(o=>o.value===prev))day.value=prev;
}
function syncTimeUnknown(){
  const disabled=timeUnknown.checked;
  [meridiem,hour,minute].forEach(el=>{el.disabled=disabled;if(disabled)el.value='';});
}
function syncCalendar(){lunarExtra.hidden=calendar.value!=='lunar';}
function fillProfile(data){
  if(data.name){form.elements.name.value=data.name;memberName.textContent=`${data.name}님`;}
  if(data.birthDate){const [y,m,d]=data.birthDate.split('-');year.value=y;month.value=m;fillDays();day.value=d;}
  if(data.birthTimeUnknown){timeUnknown.checked=true;syncTimeUnknown();}
  else if(data.birthTime){
    const [hRaw,minRaw]=data.birthTime.split(':');
    const h=Number(hRaw);meridiem.value=h>=12?'pm':'am';hour.value=String((h%12)||12).padStart(2,'0');
    const rounded=Math.round(Number(minRaw)/10)*10%60;minute.value=String(rounded).padStart(2,'0');
  }
  if(data.calendarType){calendar.value=data.calendarType;syncCalendar();}
  if(data.gender)form.elements.gender.value=data.gender;
  if(data.city)form.elements.city.value=data.city;
}

populate();
year.addEventListener('change',fillDays);month.addEventListener('change',fillDays);timeUnknown.addEventListener('change',syncTimeUnknown);calendar.addEventListener('change',syncCalendar);syncTimeUnknown();syncCalendar();

onAuthStateChanged(auth,async user=>{
  if(!user){profileState.textContent='비회원 분석입니다. 입력한 정보는 결과 계산에만 사용됩니다.';return;}
  try{
    const snap=await getDoc(doc(db,'users',user.uid));
    if(snap.exists()){
      fillProfile(snap.data());
      profileState.textContent='저장된 회원정보를 불러왔습니다.';
      profileState.dataset.state='ok';
    }else profileState.textContent='회원정보가 없어 직접 입력해주세요.';
  }catch(e){profileState.textContent='회원정보를 불러오지 못했습니다. 직접 입력해도 분석할 수 있습니다.';}
});

form.addEventListener('submit',(event)=>{
  event.preventDefault();
  ['name','birthDate','birthTime'].forEach(k=>setError(k));setStatus('');
  let valid=true;
  const name=form.elements.name.value.trim();
  const birthDate=(year.value&&month.value&&day.value)?`${year.value}-${month.value}-${day.value}`:'';
  let birthTime='';
  if(!timeUnknown.checked&&meridiem.value&&hour.value&&minute.value){
    let h=Number(hour.value)%12;if(meridiem.value==='pm')h+=12;birthTime=`${String(h).padStart(2,'0')}:${minute.value}`;
  }
  if(!name){setError('name','이름 또는 닉네임을 입력해주세요.');valid=false;}
  if(!birthDate){setError('birthDate','태어난 연·월·일을 모두 선택해주세요.');valid=false;}
  if(!timeUnknown.checked&&(meridiem.value||hour.value||minute.value)&&!birthTime){setError('birthTime','시간을 입력하려면 오전/오후·시·분을 모두 선택해주세요.');valid=false;}
  if(!form.elements.consent.checked){setStatus('분석을 진행하려면 입력 정보 사용에 동의해주세요.');valid=false;}
  if(!valid)return;

  const payload={
    name,
    birthDate,
    birthTime,
    birthTimeUnknown:timeUnknown.checked,
    calendarType:calendar.value,
    isLeapMonth:Boolean(form.elements.isLeapMonth?.checked),
    gender:form.elements.gender.value,
    city:form.elements.city.value.trim(),
    question:form.elements.question.value.trim().slice(0,300),
    createdAt:new Date().toISOString()
  };
  sessionStorage.setItem('jungwoljae_ohaeng_input',JSON.stringify(payload));
  location.href='./ohaeng-result.html';
});
