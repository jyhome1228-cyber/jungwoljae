const form=document.querySelector('[data-fortune-form]');
if(!form)throw new Error('fortune form missing');

const status=form.querySelector('[data-fortune-status]');
const profileState=form.querySelector('[data-profile-state]');
const memberName=document.querySelector('[data-member-name]');
const year=form.querySelector('#fortune-year');
const month=form.querySelector('#fortune-month');
const day=form.querySelector('#fortune-day');
const meridiem=form.querySelector('#fortune-meridiem');
const hour=form.querySelector('#fortune-hour');
const minute=form.querySelector('#fortune-minute');
const timeUnknown=form.querySelector('#fortune-time-unknown');
const calendar=form.querySelector('#fortune-calendar');
const leap=form.querySelector('#fortune-leap');
const lunarExtra=form.querySelector('[data-lunar-extra]');
const gender=form.querySelector('#fortune-gender');
const nameInput=form.querySelector('#fortune-name');
const weekdayNode=form.querySelector('[data-birth-weekday]');
const consent=form.querySelector('input[name="consent"]');
const consentRow=consent?.closest('.consent-row');
const submit=form.querySelector('button[type="submit"]');
const pad=n=>String(n).padStart(2,'0');
const LOCAL_KEY='jungwoljae_basic_profile_v1';

function seoulToday(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value||'';
  const date=`${get('year')}-${get('month')}-${get('day')}`;
  const label=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date(`${date}T12:00:00+09:00`));
  return {date,label,year:Number(get('year'))};
}

const today=seoulToday();
const todayNode=document.querySelector('[data-today-label]');
if(todayNode)todayNode.textContent=today.label;
for(let y=today.year;y>=1900;y--)year.add(new Option(`${y}년`,String(y)));
for(let m=1;m<=12;m++)month.add(new Option(`${m}월`,pad(m)));
for(let h=1;h<=12;h++)hour.add(new Option(`${h}시`,pad(h)));
for(let m=0;m<60;m+=10)minute.add(new Option(`${pad(m)}분`,pad(m)));

function fillDays(){
  const keep=day.value;
  const y=Number(year.value)||2000;
  const m=Number(month.value)||1;
  const max=new Date(y,m,0).getDate();
  day.innerHTML='<option value="">일</option>';
  for(let d=1;d<=max;d++)day.add(new Option(`${d}일`,pad(d)));
  if(keep&&Number(keep)<=max)day.value=keep;
}
function birthDate(){return year.value&&month.value&&day.value?`${year.value}-${month.value}-${day.value}`:'';}
function birthTime(){
  if(timeUnknown.checked)return '';
  if(!(meridiem.value&&hour.value&&minute.value))return '';
  let h=Number(hour.value)%12;
  if(meridiem.value==='pm')h+=12;
  return `${pad(h)}:${minute.value}`;
}
function syncTime(){
  const disabled=timeUnknown.checked;
  [meridiem,hour,minute].forEach(el=>{el.disabled=disabled;if(disabled)el.value='';});
}
function syncMeta(){
  const d=birthDate();
  if(!d){weekdayNode.textContent='날짜를 선택해주세요';return;}
  weekdayNode.textContent=new Intl.DateTimeFormat('ko-KR',{weekday:'long'}).format(new Date(`${d}T12:00:00`));
}
function syncCalendar(){
  const lunar=calendar.value==='lunar';
  if(lunarExtra)lunarExtra.hidden=!lunar;
  if(!lunar&&leap)leap.checked=false;
  syncMeta();
}

function applyProfile(p={}){
  if(p.name){nameInput.value=p.name;if(memberName)memberName.textContent=`${p.name}님`;}
  if(p.birthDate){
    const [y,m,d]=String(p.birthDate).split('-');
    year.value=y||'';
    month.value=m||'';
    fillDays();
    day.value=d||'';
  }
  if(p.birthTimeUnknown){
    timeUnknown.checked=true;
    syncTime();
  }else if(p.birthTime){
    timeUnknown.checked=false;
    syncTime();
    const [hRaw,mRaw]=String(p.birthTime).split(':');
    const h=Number(hRaw);
    meridiem.value=h>=12?'pm':'am';
    hour.value=pad((h%12)||12);
    minute.value=pad(Math.min(50,Math.round(Number(mRaw||0)/10)*10));
  }
  if(p.calendarType)calendar.value=p.calendarType;
  if(p.gender)gender.value=p.gender;
  syncCalendar();
  if(leap)leap.checked=Boolean(p.isLeapMonth)&&calendar.value==='lunar';
  syncMeta();
}

function readLocalProfile(){
  try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'null');}catch(e){return null;}
}

function clearConsentWarning(){
  consentRow?.classList.remove('is-missing');
  consent?.removeAttribute('aria-invalid');
}
function showConsentWarning(){
  consentRow?.classList.add('is-missing');
  consent?.setAttribute('aria-invalid','true');
  if(status){status.textContent='계속하려면 아래 정보 사용 동의 항목을 체크해주세요.';status.dataset.state='error';}
  consentRow?.scrollIntoView({behavior:'smooth',block:'center'});
  setTimeout(()=>{try{consent?.focus({preventScroll:true});}catch(e){consent?.focus();}},180);
}
function setError(message,target){
  if(status){status.textContent=message;status.dataset.state='error';}
  target?.focus();
}
function clearStatus(){
  if(status){status.textContent='';delete status.dataset.state;}
}

consent?.addEventListener('change',()=>{
  if(consent.checked){
    clearConsentWarning();
    if(status?.dataset.state==='error'&&/동의/.test(status.textContent||''))clearStatus();
  }
});
year.addEventListener('change',()=>{fillDays();syncMeta();});
month.addEventListener('change',()=>{fillDays();syncMeta();});
day.addEventListener('change',syncMeta);
timeUnknown.addEventListener('change',syncTime);
calendar.addEventListener('change',syncCalendar);
syncTime();syncCalendar();fillDays();

// Local profile is immediate and never blocks the form.
const localProfile=readLocalProfile();
if(localProfile){applyProfile(localProfile);if(profileState){profileState.dataset.state='ok';profileState.textContent='이 브라우저에 저장된 기본정보를 불러왔습니다.';}}
else if(profileState)profileState.textContent='태어난 정보를 입력하면 오늘의 흐름을 바로 계산합니다.';

// Account profile loading is best-effort. Remote Firebase modules must never block submit/navigation.
(async()=>{
  try{
    const [{firebaseConfig},appMod,authMod,firestoreMod]=await Promise.all([
      import('./firebase-config.js?v=20260907-1645'),
      import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
    ]);
    const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(firebaseConfig);
    const auth=authMod.getAuth(app);
    const db=firestoreMod.getFirestore(app);
    let stop=()=>{};
    stop=authMod.onAuthStateChanged(auth,async user=>{
      stop();
      if(!user)return;
      try{
        const snap=await firestoreMod.getDoc(firestoreMod.doc(db,'users',user.uid));
        if(snap.exists()){
          applyProfile(snap.data());
          if(profileState){profileState.dataset.state='ok';profileState.textContent='저장된 사주 기본정보를 불러왔습니다.';}
        }
      }catch(e){}
    },()=>{});
  }catch(e){}
})();

form.addEventListener('submit',e=>{
  e.preventDefault();
  if(form.dataset.submitting==='true')return;
  clearStatus();
  clearConsentWarning();

  const name=nameInput.value.trim();
  const date=birthDate();
  const time=birthTime();
  if(!name){setError('이름 또는 닉네임을 입력해주세요.',nameInput);return;}
  if(!date){setError('태어난 연·월·일을 모두 선택해주세요.',year);return;}
  if(!timeUnknown.checked&&(meridiem.value||hour.value||minute.value)&&!time){setError('시간을 입력하려면 오전/오후·시·분을 모두 선택해주세요.',meridiem);return;}
  if(!consent?.checked){showConsentWarning();return;}

  const payload={
    name,
    birthYear:Number(year.value),
    birthDate:date,
    birthWeekday:new Intl.DateTimeFormat('ko-KR',{weekday:'long'}).format(new Date(`${date}T12:00:00`)),
    birthTime:time,
    birthTimeUnknown:timeUnknown.checked,
    calendarType:calendar.value,
    isLeapMonth:Boolean(leap?.checked),
    gender:gender.value,
    zodiac:'',
    targetDate:today.date,
    mode:'today',
    createdAt:Date.now()
  };

  try{
    sessionStorage.setItem('jungwoljae_fortune_input',JSON.stringify(payload));
  }catch(error){
    setError('브라우저 저장 기능을 사용할 수 없어 결과로 이동하지 못했습니다. 시크릿 모드를 해제하거나 저장 권한을 확인해주세요.',submit);
    return;
  }

  form.dataset.submitting='true';
  const originalText=submit?.textContent||'오늘의 운세 보기';
  if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true');submit.textContent='결과를 준비하고 있습니다…';}
  if(status){status.textContent='입력 정보를 확인했습니다. 결과 페이지로 이동합니다.';status.dataset.state='ok';}

  const destination=new URL('./fortune-result.html',location.href).href;
  location.assign(destination);

  // If navigation is unexpectedly blocked, never leave the button in an infinite loading state.
  setTimeout(()=>{
    if(!location.pathname.endsWith('/fortune.html')&&!location.pathname.endsWith('fortune.html'))return;
    form.dataset.submitting='false';
    if(submit){submit.disabled=false;submit.removeAttribute('aria-busy');submit.textContent=originalText;}
    if(status){status.textContent='페이지 이동이 지연되고 있습니다. 버튼을 다시 눌러주세요.';status.dataset.state='error';}
  },2200);
});
