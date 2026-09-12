import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const form=document.querySelector('[data-work-form]');
if(!form) throw new Error('work money form missing');
const app=getApps().length?getApp():initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const q=s=>form.querySelector(s);
const status=q('[data-work-status]'),profileState=q('[data-profile-state]'),memberName=document.querySelector('[data-member-name]');
const year=q('#work-year'),month=q('#work-month'),day=q('#work-day'),meridiem=q('#work-meridiem'),hour=q('#work-hour'),minute=q('#work-minute'),timeUnknown=q('#work-time-unknown'),calendar=q('#work-calendar'),lunarExtra=q('[data-lunar-extra]');
const focusInputs=[...form.querySelectorAll('input[name="focus"]')],focusCount=document.querySelector('[data-focus-count]'),focusMessage=document.querySelector('[data-focus-message]');

function populate(){
  const now=new Date().getFullYear();
  for(let y=now;y>=1900;y--)year.insertAdjacentHTML('beforeend',`<option value="${y}">${y}년</option>`);
  for(let m=1;m<=12;m++)month.insertAdjacentHTML('beforeend',`<option value="${String(m).padStart(2,'0')}">${m}월</option>`);
  for(let h=1;h<=12;h++)hour.insertAdjacentHTML('beforeend',`<option value="${String(h).padStart(2,'0')}">${h}시</option>`);
  for(let m=0;m<60;m+=10)minute.insertAdjacentHTML('beforeend',`<option value="${String(m).padStart(2,'0')}">${String(m).padStart(2,'0')}분</option>`);
  fillDays();
}
function fillDays(){
  const prev=day.value;day.innerHTML='<option value="">일</option>';
  const y=Number(year.value)||2000,m=Number(month.value)||1,max=new Date(y,m,0).getDate();
  for(let d=1;d<=max;d++)day.insertAdjacentHTML('beforeend',`<option value="${String(d).padStart(2,'0')}">${d}일</option>`);
  if([...day.options].some(o=>o.value===prev))day.value=prev;
}
function syncTime(){const disabled=timeUnknown.checked;[meridiem,hour,minute].forEach(el=>{el.disabled=disabled;if(disabled)el.value='';});}
function syncCalendar(){lunarExtra.hidden=calendar.value!=='lunar';if(calendar.value!=='lunar'&&form.elements.isLeapMonth)form.elements.isLeapMonth.checked=false;}
function syncFocus(changed){
  const checked=focusInputs.filter(x=>x.checked);
  if(checked.length>2&&changed){changed.checked=false;focusMessage.textContent='관심 영역은 최대 2개까지 선택할 수 있습니다.';}
  else focusMessage.textContent='';
  focusCount.textContent=String(focusInputs.filter(x=>x.checked).length);
}
function fillProfile(p){
  if(p.name){form.elements.name.value=p.name;memberName.textContent=`${p.name}님`;}
  if(p.birthDate){const [y,m,d]=p.birthDate.split('-');year.value=y;month.value=m;fillDays();day.value=d;}
  if(p.birthTimeUnknown){timeUnknown.checked=true;syncTime();}
  else if(p.birthTime){const [hRaw,mRaw]=p.birthTime.split(':');const h=Number(hRaw);meridiem.value=h>=12?'pm':'am';hour.value=String((h%12)||12).padStart(2,'0');minute.value=String(Math.min(50,Math.round(Number(mRaw||0)/10)*10)).padStart(2,'0');}
  if(p.calendarType){calendar.value=p.calendarType;syncCalendar();}
  if(form.elements.isLeapMonth)form.elements.isLeapMonth.checked=Boolean(p.isLeapMonth)&&calendar.value==='lunar';
  if(p.gender)form.elements.gender.value=p.gender;
  if(p.city)form.elements.city.value=p.city;
}

function recoverFromHistory(){
  // Chrome/Safari may restore the exact submitted DOM from BFCache when the user
  // presses Back. Clear the transient submitting/loading state so the form is usable.
  form.dataset.submitting='false';
  const submit=form.querySelector('button[type="submit"]');
  if(submit){
    submit.disabled=false;
    submit.removeAttribute('aria-busy');
  }
  document.querySelectorAll('[data-saju-loading],.saju-loading-overlay').forEach(overlay=>{
    overlay.classList.remove('is-visible','is-leaving');
    overlay.hidden=true;
    overlay.setAttribute('hidden','');
    overlay.style.setProperty('display','none','important');
    overlay.style.setProperty('pointer-events','none','important');
  });
  document.body.classList.remove('saju-loading-open','reading-result-pending','menu-open');
  document.documentElement.classList.remove('saju-loading-open','reading-result-pending','jw-entry-first');
  document.body.style.removeProperty('overflow');
  document.documentElement.style.removeProperty('overflow');
  if(status&&/준비|분석|이동|로딩|처리 중/.test(status.textContent||''))status.textContent='';
}

populate();year.addEventListener('change',fillDays);month.addEventListener('change',fillDays);timeUnknown.addEventListener('change',syncTime);calendar.addEventListener('change',syncCalendar);focusInputs.forEach(i=>i.addEventListener('change',()=>syncFocus(i)));syncTime();syncCalendar();
window.addEventListener('pageshow',event=>{if(event.persisted)recoverFromHistory();});

onAuthStateChanged(auth,async user=>{
  if(!user){profileState.textContent='비회원 분석입니다. 직접 입력한 정보로 결과를 계산합니다.';return;}
  try{
    const snap=await getDoc(doc(db,'users',user.uid));
    if(snap.exists()){fillProfile(snap.data());profileState.dataset.state='ok';profileState.textContent='저장된 회원정보를 불러왔습니다.';}
    else profileState.textContent='저장된 회원정보가 없어 직접 입력해주세요.';
  }catch(e){profileState.textContent='회원정보를 불러오지 못했습니다. 직접 입력해도 분석할 수 있습니다.';}
});

form.addEventListener('submit',e=>{
  e.preventDefault();if(form.dataset.submitting==='true')return;status.textContent='';
  const name=form.elements.name.value.trim();
  const birthDate=year.value&&month.value&&day.value?`${year.value}-${month.value}-${day.value}`:'';
  let birthTime='';
  if(!timeUnknown.checked&&meridiem.value&&hour.value&&minute.value){let h=Number(hour.value)%12;if(meridiem.value==='pm')h+=12;birthTime=`${String(h).padStart(2,'0')}:${minute.value}`;}
  if(!name){status.textContent='이름 또는 닉네임을 입력해주세요.';form.elements.name.focus();return;}
  if(!birthDate){status.textContent='태어난 연·월·일을 모두 선택해주세요.';year.focus();return;}
  if(!timeUnknown.checked&&(meridiem.value||hour.value||minute.value)&&!birthTime){status.textContent='시간을 입력하려면 오전/오후·시·분을 모두 선택해주세요.';meridiem.focus();return;}
  if(!form.elements.consent.checked){status.textContent='분석을 위한 정보 사용에 동의해주세요.';form.elements.consent.focus();return;}
  const payload={name,birthDate,birthTime,birthTimeUnknown:timeUnknown.checked,calendarType:calendar.value,isLeapMonth:Boolean(form.elements.isLeapMonth?.checked),gender:form.elements.gender.value,city:form.elements.city.value.trim(),focus:focusInputs.filter(x=>x.checked).map(x=>x.value),createdAt:new Date().toISOString()};
  sessionStorage.setItem('jungwoljae_work_money_input',JSON.stringify(payload));
  form.dataset.submitting='true';const submit=form.querySelector('button[type="submit"]');if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true');}
  location.href='./work-money-result.html';
});