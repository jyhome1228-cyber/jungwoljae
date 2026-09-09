import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const form=document.querySelector('[data-saju-form]');
if(!form) throw new Error('saju form missing');
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app),db=getFirestore(app);
const $=s=>form.querySelector(s);
const status=$('[data-saju-status]'),profileState=$('[data-profile-state]'),memberName=document.querySelector('[data-member-name]');
const year=$('#saju-year'),month=$('#saju-month'),day=$('#saju-day'),meridiem=$('#saju-meridiem'),hour=$('#saju-hour'),minute=$('#saju-minute'),timeUnknown=$('#saju-time-unknown'),calendar=$('#saju-calendar'),lunarExtra=$('[data-lunar-extra]');
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
function syncCalendar(){lunarExtra.hidden=calendar.value!=='lunar';}
function syncFocus(changed){
  const checked=focusInputs.filter(x=>x.checked);
  if(checked.length>2&&changed){changed.checked=false;focusMessage.textContent='관심 영역은 최대 2개까지 선택할 수 있습니다.';}
  else focusMessage.textContent='';
  const count=focusInputs.filter(x=>x.checked).length;focusCount.textContent=String(count);
  const overall=focusInputs.find(x=>x.value==='overall');
  if(overall?.checked){focusInputs.forEach(x=>{if(x!==overall)x.checked=false;});focusCount.textContent='1';}
}
function fillProfile(p){
  if(p.name){form.elements.name.value=p.name;memberName.textContent=`${p.name}님`;}
  if(p.birthDate){const [y,m,d]=p.birthDate.split('-');year.value=y;month.value=m;fillDays();day.value=d;}
  if(p.birthTimeUnknown){timeUnknown.checked=true;syncTime();}
  else if(p.birthTime){const [hRaw,mRaw]=p.birthTime.split(':');const h=Number(hRaw);meridiem.value=h>=12?'pm':'am';hour.value=String((h%12)||12).padStart(2,'0');const rounded=Math.min(50,Math.round(Number(mRaw)/10)*10);minute.value=String(rounded).padStart(2,'0');}
  if(p.calendarType){calendar.value=p.calendarType;syncCalendar();}
  if(p.gender)form.elements.gender.value=p.gender;
  if(p.city)form.elements.city.value=p.city;
}

populate();year.addEventListener('change',fillDays);month.addEventListener('change',fillDays);timeUnknown.addEventListener('change',syncTime);calendar.addEventListener('change',syncCalendar);syncTime();syncCalendar();focusInputs.forEach(i=>i.addEventListener('change',()=>syncFocus(i)));

onAuthStateChanged(auth,async user=>{
  if(!user){profileState.textContent='비회원 분석입니다. 직접 입력한 정보로 결과를 계산합니다.';return;}
  try{
    const snap=await getDoc(doc(db,'users',user.uid));
    if(snap.exists()){fillProfile(snap.data());profileState.dataset.state='ok';profileState.textContent='저장된 회원정보를 불러왔습니다.';}
    else profileState.textContent='저장된 회원정보가 없어 직접 입력해주세요.';
  }catch(e){profileState.textContent='회원정보를 불러오지 못했습니다. 직접 입력해도 분석할 수 있습니다.';}
});

form.addEventListener('submit',e=>{
  e.preventDefault();status.textContent='';
  const name=form.elements.name.value.trim();
  const birthDate=year.value&&month.value&&day.value?`${year.value}-${month.value}-${day.value}`:'';
  let birthTime='';
  if(!timeUnknown.checked&&meridiem.value&&hour.value&&minute.value){let h=Number(hour.value)%12;if(meridiem.value==='pm')h+=12;birthTime=`${String(h).padStart(2,'0')}:${minute.value}`;}
  if(!name){status.textContent='이름 또는 닉네임을 입력해주세요.';return;}
  if(!birthDate){status.textContent='태어난 연·월·일을 모두 선택해주세요.';return;}
  if(!timeUnknown.checked&&(meridiem.value||hour.value||minute.value)&&!birthTime){status.textContent='시간을 입력하려면 오전/오후·시·분을 모두 선택해주세요.';return;}
  if(!form.elements.consent.checked){status.textContent='분석을 위한 정보 사용에 동의해주세요.';return;}
  if(form.dataset.submitting==='true')return;
  let focus=focusInputs.filter(x=>x.checked).map(x=>x.value);
  if(focus.includes('overall'))focus=[];
  const payload={name,birthDate,birthTime,birthTimeUnknown:timeUnknown.checked,calendarType:calendar.value,isLeapMonth:Boolean(form.elements.isLeapMonth?.checked),gender:form.elements.gender.value,city:form.elements.city.value.trim(),focus,createdAt:new Date().toISOString()};
  sessionStorage.setItem('jungwoljae_saju_input',JSON.stringify(payload));
  form.dataset.submitting='true';
  const submitButton=form.querySelector('button[type="submit"]');
  if(submitButton){submitButton.disabled=true;submitButton.setAttribute('aria-busy','true');}
  location.assign('./saju-result.html');
});
