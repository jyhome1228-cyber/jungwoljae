import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const root=document.querySelector('[data-mypage]');
const form=document.querySelector('[data-profile-form]');
if(root&&form){
  const app=getApps().length?getApp():initializeApp(firebaseConfig);
  const auth=getAuth(app);const db=getFirestore(app);
  const editBtn=root.querySelector('[data-profile-edit]');
  const cancelBtn=root.querySelector('[data-profile-cancel]');
  const view=root.querySelector('[data-profile-view]');
  const status=root.querySelector('[data-profile-edit-status]');
  const y=form.elements.birthYear,m=form.elements.birthMonth,d=form.elements.birthDay;
  const mer=form.elements.birthMeridiem,hour=form.elements.birthHour,min=form.elements.birthMinute,unknown=form.elements.birthTimeUnknown;
  let currentUser=null;let profile=null;

  const currentYear=new Date().getFullYear();
  for(let n=currentYear;n>=1900;n--)y.insertAdjacentHTML('beforeend',`<option value="${n}">${n}년</option>`);
  for(let n=1;n<=12;n++)m.insertAdjacentHTML('beforeend',`<option value="${String(n).padStart(2,'0')}">${n}월</option>`);
  for(let n=1;n<=12;n++)hour.insertAdjacentHTML('beforeend',`<option value="${String(n).padStart(2,'0')}">${n}시</option>`);
  for(let n=0;n<60;n+=10)min.insertAdjacentHTML('beforeend',`<option value="${String(n).padStart(2,'0')}">${String(n).padStart(2,'0')}분</option>`);
  function fillDays(){const prev=d.value;d.innerHTML='<option value="">일</option>';const yy=Number(y.value)||2000,mm=Number(m.value)||1,max=new Date(yy,mm,0).getDate();for(let n=1;n<=max;n++)d.insertAdjacentHTML('beforeend',`<option value="${String(n).padStart(2,'0')}">${n}일</option>`);if([...d.options].some(o=>o.value===prev))d.value=prev;}
  y.addEventListener('change',fillDays);m.addEventListener('change',fillDays);fillDays();

  function syncUnknown(){const disabled=unknown.checked;[mer,hour,min].forEach(el=>{el.disabled=disabled;if(disabled)el.value='';});}
  unknown.addEventListener('change',syncUnknown);

  function renderView(data){
    const values={name:data.name||'—',birthDate:data.birthDate||'—',birthTime:data.birthTimeUnknown?'모름':(data.birthTime||'—'),calendarType:data.calendarType==='lunar'?'음력':'양력',gender:data.gender==='male'?'남성':data.gender==='female'?'여성':'—',city:data.city||'—'};
    Object.entries(values).forEach(([key,value])=>{const el=root.querySelector(`[data-profile="${key}"]`);if(el)el.textContent=value;});
  }
  function fillForm(data){
    form.elements.name.value=data.name||'';form.elements.calendarType.value=data.calendarType||'solar';form.elements.gender.value=data.gender||'female';form.elements.city.value=data.city||'';
    if(data.birthDate){const [yy,mm,dd]=data.birthDate.split('-');y.value=yy;m.value=mm;fillDays();d.value=dd;}
    unknown.checked=Boolean(data.birthTimeUnknown);
    if(!unknown.checked&&data.birthTime){const [rawH,rawM]=data.birthTime.split(':').map(Number);mer.value=rawH>=12?'pm':'am';hour.value=String((rawH%12)||12).padStart(2,'0');min.value=String(Math.round(rawM/10)*10%60).padStart(2,'0');}
    syncUnknown();
  }
  function setEditing(on){form.hidden=!on;view.hidden=on;editBtn.hidden=on;if(on){fillForm(profile||{});status.textContent='';}}
  editBtn.addEventListener('click',()=>setEditing(true));cancelBtn.addEventListener('click',()=>setEditing(false));

  onAuthStateChanged(auth,async user=>{
    currentUser=user;if(!user)return;
    try{const snap=await getDoc(doc(db,'users',user.uid));if(snap.exists()){profile=snap.data();fillForm(profile);}}
    catch(e){}
  });

  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!currentUser)return;
    const name=form.elements.name.value.trim();const birthDate=(y.value&&m.value&&d.value)?`${y.value}-${m.value}-${d.value}`:'';let birthTime='';
    if(!unknown.checked&&mer.value&&hour.value&&min.value){let hh=Number(hour.value)%12;if(mer.value==='pm')hh+=12;birthTime=`${String(hh).padStart(2,'0')}:${min.value}`;}
    if(!name||!birthDate){status.textContent='성함과 태어난 날짜를 확인해주세요.';return;}
    const button=form.querySelector('[type="submit"]');button.disabled=true;button.textContent='저장 중…';
    try{
      const next={name,birthDate,birthTime,birthTimeUnknown:Boolean(unknown.checked),calendarType:form.elements.calendarType.value,gender:form.elements.gender.value,city:form.elements.city.value.trim(),updatedAt:serverTimestamp()};
      await updateDoc(doc(db,'users',currentUser.uid),next);await updateProfile(currentUser,{displayName:name});profile={...(profile||{}),...next};renderView(profile);status.textContent='회원정보를 수정했습니다.';setTimeout(()=>setEditing(false),350);
    }catch(e){status.textContent='회원정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.';}
    finally{button.disabled=false;button.textContent='변경사항 저장';}
  });
}
