import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const form=document.querySelector('[data-relationship-form]');
if(!form) throw new Error('relationship form missing');
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);const db=getFirestore(app);
const status=form.querySelector('[data-relationship-status]');
const profileState=form.querySelector('[data-profile-state]');
const memberName=document.querySelector('[data-member-name]');
const year=form.querySelector('#relationship-year');
const month=form.querySelector('#relationship-month');
const day=form.querySelector('#relationship-day');
const meridiem=form.querySelector('#relationship-meridiem');
const hour=form.querySelector('#relationship-hour');
const minute=form.querySelector('#relationship-minute');
const timeUnknown=form.querySelector('#relationship-time-unknown');
const calendar=form.querySelector('#relationship-calendar');
const lunarExtra=form.querySelector('[data-lunar-extra]');

const currentYear=new Date().getFullYear();
for(let y=currentYear;y>=1900;y--)year.insertAdjacentHTML('beforeend',`<option value="${y}">${y}년</option>`);
for(let m=1;m<=12;m++)month.insertAdjacentHTML('beforeend',`<option value="${String(m).padStart(2,'0')}">${m}월</option>`);
for(let h=1;h<=12;h++)hour.insertAdjacentHTML('beforeend',`<option value="${String(h).padStart(2,'0')}">${h}시</option>`);
for(let min=0;min<60;min+=10)minute.insertAdjacentHTML('beforeend',`<option value="${String(min).padStart(2,'0')}">${String(min).padStart(2,'0')}분</option>`);
function fillDays(){const prev=day.value;day.innerHTML='<option value="">일</option>';const y=Number(year.value)||2000,m=Number(month.value)||1,max=new Date(y,m,0).getDate();for(let d=1;d<=max;d++)day.insertAdjacentHTML('beforeend',`<option value="${String(d).padStart(2,'0')}">${d}일</option>`);if([...day.options].some(o=>o.value===prev))day.value=prev;}
fillDays();year.addEventListener('change',fillDays);month.addEventListener('change',fillDays);

function syncTime(){const disabled=timeUnknown.checked;[meridiem,hour,minute].forEach(el=>{el.disabled=disabled;if(disabled)el.value='';});}
function syncCalendar(){lunarExtra.hidden=calendar.value!=='lunar';if(calendar.value!=='lunar'&&form.elements.isLeapMonth)form.elements.isLeapMonth.checked=false;}
timeUnknown.addEventListener('change',syncTime);calendar.addEventListener('change',syncCalendar);syncTime();syncCalendar();

function fillProfile(p){
  if(p.name){form.elements.name.value=p.name;memberName.textContent=`${p.name}님`;}
  if(p.birthDate){const [y,m,d]=p.birthDate.split('-');year.value=y;month.value=m;fillDays();day.value=d;}
  if(p.birthTimeUnknown){timeUnknown.checked=true;syncTime();}
  else if(p.birthTime){const [hh,mm]=p.birthTime.split(':').map(Number);meridiem.value=hh>=12?'pm':'am';hour.value=String((hh%12)||12).padStart(2,'0');minute.value=String(Math.min(50,Math.round((mm||0)/10)*10)).padStart(2,'0');}
  if(p.calendarType){calendar.value=p.calendarType;syncCalendar();}
  if(form.elements.isLeapMonth)form.elements.isLeapMonth.checked=Boolean(p.isLeapMonth)&&calendar.value==='lunar';
  if(p.gender)form.elements.gender.value=p.gender;
  if(p.city)form.elements.city.value=p.city;
}

onAuthStateChanged(auth,async user=>{
  if(!user){profileState.textContent='비회원 분석입니다. 기본 정보를 직접 입력해주세요.';return;}
  try{const snap=await getDoc(doc(db,'users',user.uid));if(snap.exists()){fillProfile(snap.data());profileState.textContent='저장된 회원정보를 불러왔습니다.';profileState.dataset.state='ok';}else profileState.textContent='회원정보가 없어 직접 입력해주세요.';}
  catch(e){profileState.textContent='회원정보를 불러오지 못했습니다. 직접 입력해도 분석할 수 있습니다.';}
});

function setError(name,msg=''){const el=form.querySelector(`[data-error="${name}"]`);if(el)el.textContent=msg;}
form.addEventListener('submit',event=>{
  event.preventDefault();if(form.dataset.submitting==='true')return;
  ['name','birthDate','birthTime'].forEach(k=>setError(k));status.textContent='';let valid=true;
  const name=form.elements.name.value.trim();
  const birthDate=year.value&&month.value&&day.value?`${year.value}-${month.value}-${day.value}`:'';
  let birthTime='';
  if(!timeUnknown.checked&&meridiem.value&&hour.value&&minute.value){let h=Number(hour.value)%12;if(meridiem.value==='pm')h+=12;birthTime=`${String(h).padStart(2,'0')}:${minute.value}`;}
  if(!name){setError('name','이름 또는 닉네임을 입력해주세요.');valid=false;}
  if(!birthDate){setError('birthDate','태어난 연·월·일을 모두 선택해주세요.');valid=false;}
  if(!timeUnknown.checked&&(meridiem.value||hour.value||minute.value)&&!birthTime){setError('birthTime','시간을 입력하려면 오전/오후·시·분을 모두 선택해주세요.');valid=false;}
  if(!form.elements.consent.checked){status.textContent='분석을 위한 정보 사용에 동의해주세요.';valid=false;}
  if(!valid)return;
  const payload={name,birthDate,birthTime,birthTimeUnknown:timeUnknown.checked,calendarType:calendar.value,isLeapMonth:Boolean(form.elements.isLeapMonth?.checked),gender:form.elements.gender.value,city:form.elements.city.value.trim(),relationshipStatus:form.elements.relationshipStatus.value,createdAt:Date.now()};
  sessionStorage.setItem('jungwoljae_relationship_input',JSON.stringify(payload));
  form.dataset.submitting='true';const submit=form.querySelector('button[type="submit"]');if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true');}
  location.href='./relationship-result.html';
});