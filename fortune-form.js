const form=document.querySelector('[data-fortune-form]');
if(!form)throw new Error('fortune form missing');

const status=form.querySelector('[data-fortune-status]');
const profileState=form.querySelector('[data-profile-state]');
const profileToolStatus=form.querySelector('[data-profile-tool-status]');
const memberName=document.querySelector('[data-member-name]');
const nameInput=form.querySelector('#fortune-name');
const birthDateInput=form.querySelector('#fortune-birth-date');
const birthTimeInput=form.querySelector('#fortune-birth-time');
const timeUnknown=form.querySelector('#fortune-time-unknown');
const calendar=form.querySelector('#fortune-calendar');
const leap=form.querySelector('#fortune-leap');
const lunarExtra=form.querySelector('[data-lunar-extra]');
const gender=form.querySelector('#fortune-gender');
const consent=form.querySelector('input[name="consent"]');
const consentRow=consent?.closest('.consent-row');
const submit=form.querySelector('button[type="submit"]');
const loadButton=form.querySelector('[data-profile-load]');
const saveButton=form.querySelector('[data-profile-save]');
const LOCAL_KEY='jungwoljae_basic_profile_v1';

let applying=false;
let userTouched=false;
let currentUser=null;
let accountProfile=null;
let remote=null;

function seoulToday(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value||'';
  const date=`${get('year')}-${get('month')}-${get('day')}`;
  const label=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date(`${date}T12:00:00+09:00`));
  return {date,label};
}
const today=seoulToday();
const todayNode=document.querySelector('[data-today-label]');
if(todayNode)todayNode.textContent=today.label;

function clearStatus(){if(status){status.textContent='';delete status.dataset.state;}}
function setStatus(message,state='error'){if(status){status.textContent=message;if(state)status.dataset.state=state;else delete status.dataset.state;}}
function setToolStatus(message,state=''){if(profileToolStatus){profileToolStatus.textContent=message;if(state)profileToolStatus.dataset.state=state;else delete profileToolStatus.dataset.state;}}
function setProfileState(message,state=''){if(profileState){profileState.textContent=message;if(state)profileState.dataset.state=state;else delete profileState.dataset.state;}}
function clearConsentWarning(){consentRow?.classList.remove('is-missing');consent?.removeAttribute('aria-invalid');}
function showConsentWarning(){
  consentRow?.classList.add('is-missing');
  consent?.setAttribute('aria-invalid','true');
  setStatus('계속하려면 정보 사용 동의 항목을 체크해주세요.','error');
  consentRow?.scrollIntoView({behavior:'smooth',block:'center'});
  setTimeout(()=>{try{consent?.focus({preventScroll:true});}catch(e){consent?.focus();}},150);
}
function focusError(message,target){setStatus(message,'error');target?.focus();}

function syncTime(){
  if(!birthTimeInput||!timeUnknown)return;
  birthTimeInput.disabled=timeUnknown.checked;
  if(timeUnknown.checked)birthTimeInput.value='';
}
function syncCalendar(){
  const lunar=calendar?.value==='lunar';
  if(lunarExtra)lunarExtra.hidden=!lunar;
  if(!lunar&&leap)leap.checked=false;
}
function formIsEmpty(){return !nameInput.value.trim()&&!birthDateInput.value&&!birthTimeInput.value&&!timeUnknown.checked&&!gender.value;}

function resetTransient(){
  applying=true;
  form.reset();
  if(calendar)calendar.value='solar';
  syncTime();
  syncCalendar();
  clearStatus();
  clearConsentWarning();
  delete form.dataset.submitting;
  if(submit){submit.disabled=false;submit.removeAttribute('aria-busy');submit.textContent='오늘의 운세 보기';}
  if(memberName)memberName.textContent='회원님';
  applying=false;
  userTouched=false;
  try{sessionStorage.removeItem('jungwoljae_fortune_input');}catch(e){}
}

function readProfile(){
  return {
    name:nameInput.value.trim(),
    birthDate:birthDateInput.value||'',
    birthTime:timeUnknown.checked?'':(birthTimeInput.value||''),
    birthTimeUnknown:Boolean(timeUnknown.checked),
    calendarType:calendar.value||'solar',
    isLeapMonth:Boolean(calendar.value==='lunar'&&leap?.checked),
    gender:gender.value||''
  };
}
function applyProfile(p={}){
  applying=true;
  if(p.name){nameInput.value=p.name;if(memberName)memberName.textContent=`${p.name}님`;}
  if(p.birthDate)birthDateInput.value=String(p.birthDate).slice(0,10);
  timeUnknown.checked=Boolean(p.birthTimeUnknown);
  syncTime();
  if(!p.birthTimeUnknown&&p.birthTime)birthTimeInput.value=String(p.birthTime).slice(0,5);
  if(p.calendarType)calendar.value=p.calendarType;
  if(p.gender)gender.value=p.gender;
  syncCalendar();
  if(leap)leap.checked=Boolean(p.isLeapMonth)&&calendar.value==='lunar';
  applying=false;
}
function localRead(){try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'null');}catch(e){return null;}}
function localWrite(profile){try{localStorage.setItem(LOCAL_KEY,JSON.stringify({...profile,savedAt:Date.now()}));return true;}catch(e){return false;}}

resetTransient();
setProfileState('비회원은 빈 입력창으로 시작합니다. 회원은 저장된 기본정보를 자동으로 불러옵니다.');
setToolStatus('저장정보는 원할 때 직접 불러올 수 있습니다.');

form.addEventListener('input',()=>{if(!applying)userTouched=true;},true);
form.addEventListener('change',event=>{
  if(!applying)userTouched=true;
  if(event.target===timeUnknown)syncTime();
  if(event.target===calendar)syncCalendar();
  if(event.target===consent&&consent.checked){clearConsentWarning();if(/동의/.test(status?.textContent||''))clearStatus();}
},true);

async function initRemoteProfile(){
  try{
    const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('firebase-timeout')),2400));
    const modules=await Promise.race([
      Promise.all([
        import('./firebase-config.js?v=20260907-1645'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
      ]),
      timeout
    ]);
    const [{firebaseConfig},appMod,authMod,dbMod]=modules;
    const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(firebaseConfig);
    const auth=authMod.getAuth(app),db=dbMod.getFirestore(app);
    remote={authMod,dbMod,auth,db};
    let settled=false;
    let stop=()=>{};
    const finish=async user=>{
      if(settled)return;settled=true;try{stop();}catch(e){}
      currentUser=user||null;
      if(!user||user.isAnonymous){setProfileState('비회원은 빈 입력창으로 시작합니다. 저장정보는 직접 불러올 수 있습니다.');return;}
      try{
        const snap=await dbMod.getDoc(dbMod.doc(db,'users',user.uid));
        if(!snap.exists()){setProfileState('회원정보에 저장된 기본정보가 없습니다.');return;}
        accountProfile=snap.data();
        if(!userTouched&&formIsEmpty()){
          applyProfile(accountProfile);
          setProfileState('회원 기본정보를 자동으로 불러왔습니다.','ok');
        }else{
          setProfileState('회원 기본정보가 있습니다. 현재 입력을 유지하고 있습니다.');
        }
      }catch(e){setProfileState('회원정보 연결이 지연되고 있습니다. 직접 입력해도 이용할 수 있습니다.');}
    };
    stop=authMod.onAuthStateChanged(auth,finish,()=>finish(null));
    setTimeout(()=>finish(auth.currentUser||null),1800);
  }catch(e){
    setProfileState('직접 입력으로 정상 이용할 수 있습니다.');
  }
}
initRemoteProfile();

loadButton?.addEventListener('click',async()=>{
  loadButton.disabled=true;
  setToolStatus('저장된 기본정보를 불러오고 있습니다.');
  try{
    let p=accountProfile;
    if(!p&&currentUser&&remote){
      try{const snap=await remote.dbMod.getDoc(remote.dbMod.doc(remote.db,'users',currentUser.uid));if(snap.exists())p=snap.data();}catch(e){}
    }
    p=p||localRead();
    if(!p){setToolStatus('저장된 기본정보가 없습니다. 현재 정보를 입력한 뒤 저장해주세요.','error');return;}
    applyProfile(p);
    userTouched=false;
    setToolStatus(currentUser?'회원 기본정보를 불러왔습니다.':'이 브라우저에 저장한 기본정보를 불러왔습니다.','ok');
  }finally{loadButton.disabled=false;}
});

saveButton?.addEventListener('click',async()=>{
  const p=readProfile();
  if(!p.name||!p.birthDate){setToolStatus('이름과 태어난 날짜를 먼저 입력해주세요.','error');return;}
  saveButton.disabled=true;
  setToolStatus('현재 기본정보를 저장하고 있습니다.');
  try{
    localWrite(p);
    if(currentUser&&remote){
      await remote.dbMod.setDoc(remote.dbMod.doc(remote.db,'users',currentUser.uid),{...p,updatedAt:remote.dbMod.serverTimestamp()},{merge:true});
      accountProfile=p;
      setToolStatus('기본정보를 계정에 저장했습니다.','ok');
    }else setToolStatus('이 브라우저에 기본정보를 저장했습니다.','ok');
  }catch(e){setToolStatus('기본정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.','error');}
  finally{saveButton.disabled=false;}
});

form.addEventListener('submit',event=>{
  event.preventDefault();
  if(form.dataset.submitting==='true')return;
  clearStatus();clearConsentWarning();

  const profile=readProfile();
  if(!profile.name){focusError('이름 또는 닉네임을 입력해주세요.',nameInput);return;}
  if(!profile.birthDate){focusError('태어난 날짜를 입력해주세요.',birthDateInput);return;}
  if(!profile.birthTimeUnknown&&birthTimeInput.value&&!/^\d{2}:\d{2}$/.test(birthTimeInput.value)){focusError('태어난 시간을 다시 확인해주세요.',birthTimeInput);return;}
  if(!consent?.checked){showConsentWarning();return;}

  const payload={
    ...profile,
    birthYear:Number(profile.birthDate.slice(0,4)),
    birthWeekday:new Intl.DateTimeFormat('ko-KR',{weekday:'long'}).format(new Date(`${profile.birthDate}T12:00:00`)),
    targetDate:today.date,
    mode:'today',
    createdAt:Date.now()
  };
  try{sessionStorage.setItem('jungwoljae_fortune_input',JSON.stringify(payload));}
  catch(e){focusError('브라우저 저장 기능을 사용할 수 없어 결과로 이동하지 못했습니다.',submit);return;}

  form.dataset.submitting='true';
  if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true');submit.textContent='결과를 준비하고 있습니다…';}
  setStatus('입력 정보를 확인했습니다. 결과 페이지로 이동합니다.','ok');
  location.assign(new URL('./fortune-result.html',location.href).href);

  setTimeout(()=>{
    if(!location.pathname.endsWith('fortune.html'))return;
    delete form.dataset.submitting;
    if(submit){submit.disabled=false;submit.removeAttribute('aria-busy');submit.textContent='오늘의 운세 보기';}
    setStatus('페이지 이동이 지연되고 있습니다. 버튼을 다시 눌러주세요.','error');
  },2500);
});

window.addEventListener('pageshow',event=>{
  if(!event.persisted)return;
  resetTransient();
  if(accountProfile){applyProfile(accountProfile);setProfileState('회원 기본정보를 다시 불러왔습니다.','ok');}
});
