import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const file=(location.pathname.split('/').pop()||'').toLowerCase();
const supported=new Set(['tomorrow.html','lucky-number.html','important-day.html','moving-day.html']);
if(!supported.has(file)) throw new Error('quick profile page mismatch');

const form=document.querySelector('[data-quick-form]');
if(!form) throw new Error('quick form missing');

const LOCAL_KEY='jungwoljae_basic_profile_v1';
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app),db=getFirestore(app);
let currentUser=null;

const controls={
  name:form.querySelector('#quick-name'),
  birthDate:form.querySelector('#quick-birth-date'),
  birthTime:form.querySelector('#quick-birth-time'),
  timeUnknown:form.querySelector('#quick-time-unknown'),
  calendar:form.querySelector('#quick-calendar'),
  gender:form.querySelector('#quick-gender')
};
const profileState=form.querySelector('[data-profile-state]');
const anchor=form.querySelector('.quick-form-head');

function emit(el,type='change'){if(el)el.dispatchEvent(new Event(type,{bubbles:true}));}
function setValue(el,value){if(!el||value===undefined||value===null||value==='')return;el.value=String(value);emit(el,'input');emit(el,'change');}
function setChecked(el,value){if(!el)return;el.checked=Boolean(value);emit(el,'change');}
function localRead(){try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'null');}catch(e){return null;}}
function localWrite(profile){try{localStorage.setItem(LOCAL_KEY,JSON.stringify({...profile,savedAt:Date.now()}));}catch(e){}}
function readProfile(){return {
  name:(controls.name?.value||'').trim(),
  birthDate:controls.birthDate?.value||'',
  birthTime:controls.timeUnknown?.checked?'':(controls.birthTime?.value||''),
  birthTimeUnknown:Boolean(controls.timeUnknown?.checked),
  calendarType:controls.calendar?.value||'solar',
  gender:controls.gender?.value||''
};}
function applyProfile(p={}){
  if(p.name)setValue(controls.name,p.name);
  if(p.birthDate)setValue(controls.birthDate,p.birthDate);
  if(controls.timeUnknown)setChecked(controls.timeUnknown,Boolean(p.birthTimeUnknown));
  if(!p.birthTimeUnknown&&p.birthTime)setValue(controls.birthTime,p.birthTime);
  if(p.calendarType)setValue(controls.calendar,p.calendarType);
  if(p.gender)setValue(controls.gender,p.gender);
}

let panel=null,status=null,loadButton=null,saveButton=null;
if(anchor&&!form.querySelector('[data-basic-profile-tools]')){
  panel=document.createElement('section');
  panel.className='basic-profile-tools quick-basic-profile';
  panel.dataset.basicProfileTools='';
  panel.innerHTML=`
    <div class="basic-profile-tools__head">
      <div class="basic-profile-tools__copy">
        <span class="basic-profile-tools__eyebrow">BASIC PROFILE</span>
        <strong class="basic-profile-tools__title">저장해둔 기본정보를 그대로 사용할 수 있어요.</strong>
        <p class="basic-profile-tools__desc">이름·생년월일·출생시간·성별을 한 번 저장하면 내일의 운세, 행운의 숫자, 중요한 날, 이사 택일에서도 다시 입력하지 않아도 됩니다.</p>
      </div>
      <div class="basic-profile-tools__actions">
        <button class="basic-profile-tools__button" type="button" data-profile-load>저장정보 불러오기</button>
        <button class="basic-profile-tools__button primary" type="button" data-profile-save>현재 정보 저장</button>
      </div>
    </div>
    <p class="basic-profile-tools__status" role="status" aria-live="polite" data-profile-tool-status>저장된 정보를 확인하고 있습니다.</p>`;
  anchor.insertAdjacentElement('afterend',panel);
  status=panel.querySelector('[data-profile-tool-status]');
  loadButton=panel.querySelector('[data-profile-load]');
  saveButton=panel.querySelector('[data-profile-save]');
}

function setStatus(message,state=''){if(!status)return;status.textContent=message;if(state)status.dataset.state=state;else delete status.dataset.state;}
async function getSavedProfile(){
  if(currentUser){
    try{const snap=await getDoc(doc(db,'users',currentUser.uid));if(snap.exists())return snap.data();}catch(e){}
  }
  return localRead();
}
async function autoLoad(){
  const profile=await getSavedProfile();
  if(!profile){setStatus(currentUser?'계정에 저장된 기본정보가 없습니다. 현재 정보를 입력한 뒤 저장할 수 있습니다.':'이 브라우저에 저장된 기본정보가 없습니다.','');return;}
  applyProfile(profile);
  const msg=currentUser?'회원 기본정보를 자동으로 불러왔습니다.':'이 브라우저에 저장해둔 기본정보를 자동으로 불러왔습니다.';
  setStatus(msg,'ok');
  if(profileState){profileState.dataset.state='ok';profileState.textContent=msg;}
}

loadButton?.addEventListener('click',async()=>{
  loadButton.disabled=true;setStatus('저장된 기본정보를 불러오고 있습니다.');
  try{const profile=await getSavedProfile();if(!profile){setStatus('저장된 기본정보가 없습니다. 먼저 현재 정보를 저장해주세요.','error');return;}applyProfile(profile);setStatus(currentUser?'회원 기본정보를 불러왔습니다.':'브라우저에 저장된 기본정보를 불러왔습니다.','ok');}
  finally{loadButton.disabled=false;}
});

saveButton?.addEventListener('click',async()=>{
  const profile=readProfile();
  if(!profile.name||!profile.birthDate){setStatus('이름과 태어난 날짜를 먼저 입력해주세요.','error');return;}
  saveButton.disabled=true;setStatus('현재 기본정보를 저장하고 있습니다.');
  try{
    localWrite(profile);
    if(currentUser){await setDoc(doc(db,'users',currentUser.uid),{...profile,updatedAt:serverTimestamp()},{merge:true});setStatus('기본정보를 계정에 저장했습니다. 다른 메뉴에서도 바로 불러올 수 있습니다.','ok');}
    else setStatus('이 브라우저에 기본정보를 저장했습니다. 다른 메뉴에서도 다시 불러올 수 있습니다.','ok');
  }catch(e){setStatus('기본정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.','error');}
  finally{saveButton.disabled=false;}
});

onAuthStateChanged(auth,async user=>{
  currentUser=user||null;
  await autoLoad();
});
