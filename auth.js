import { firebaseConfig } from './firebase-config.js?v=20260907-1637';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  deleteUser
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const css=document.createElement('link');
css.rel='stylesheet';
css.href='./auth.css?v=20260908-0731';
document.head.appendChild(css);

const configured=Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
const LAST_EMAIL_KEY='jungwoljae_last_login_email';
let auth=null;
let db=null;

if(configured){
  const app=getApps().length?getApp():initializeApp(firebaseConfig);
  auth=getAuth(app);
  db=getFirestore(app);
}

function currentFile(){return location.pathname.split('/').pop()||'index.html';}
function rememberEmail(email){try{if(email)localStorage.setItem(LAST_EMAIL_KEY,String(email).trim());}catch(e){}}
function recentEmail(){try{return localStorage.getItem(LAST_EMAIL_KEY)||'';}catch(e){return '';}}

function renderHeaderAuth(user){
  document.querySelectorAll('.auth-login-link,.auth-logout-button').forEach(el=>el.remove());
  const signup=document.querySelector('.header-cta');
  if(signup){
    if(user){signup.href='./mypage.html';signup.textContent='마이페이지';}
    else{signup.href='./signup.html';signup.textContent='회원등록';}
  }
  document.querySelectorAll('.header-inner').forEach(header=>{
    if(user){
      const logout=document.createElement('button');
      logout.type='button';logout.className='auth-logout-button';logout.textContent='로그아웃';logout.dataset.logout='true';header.appendChild(logout);
    }else{
      const login=document.createElement('a');
      login.href='./login.html';login.className='auth-login-link';login.textContent='로그인';header.appendChild(login);
    }
  });
  document.querySelectorAll('.mobile-menu nav').forEach(nav=>{
    nav.querySelectorAll('[data-auth-mobile]').forEach(el=>el.remove());
    if(user){
      const my=document.createElement('a');my.href='./mypage.html';my.textContent='마이페이지';my.className='mobile-auth-item';my.dataset.authMobile='true';
      const logout=document.createElement('button');logout.type='button';logout.textContent='로그아웃';logout.className='mobile-auth-logout';logout.dataset.authMobile='true';logout.dataset.logout='true';nav.append(my,logout);
    }else{
      const login=document.createElement('a');login.href='./login.html';login.textContent='로그인';login.className='mobile-auth-item';login.dataset.authMobile='true';
      const signupLink=document.createElement('a');signupLink.href='./signup.html';signupLink.textContent='회원등록';signupLink.className='mobile-auth-item';signupLink.dataset.authMobile='true';nav.append(login,signupLink);
    }
  });
}

function errorCode(error){return String(error?.code||error?.message||'unknown-error').replace(/^FirebaseError:\s*/,'');}
function friendlyAuthError(error,stage='auth'){
  const code=String(error?.code||'');
  if(code.includes('api-key-not-valid')||code.includes('invalid-api-key')) return 'Firebase Web API 키가 현재 앱에서 유효하지 않습니다.';
  if(code.includes('invalid-credential')||code.includes('wrong-password')||code.includes('user-not-found')) return '이메일 또는 비밀번호를 다시 확인해주세요.';
  if(code.includes('email-already-in-use')) return '이미 가입된 이메일입니다.';
  if(code.includes('invalid-email')) return '이메일 형식을 확인해주세요.';
  if(code.includes('weak-password')) return '비밀번호는 8자 이상으로 조금 더 안전하게 설정해주세요.';
  if(code.includes('operation-not-allowed')) return 'Firebase Authentication에서 이메일/비밀번호 로그인이 아직 활성화되지 않았습니다.';
  if(code.includes('unauthorized-domain')) return '현재 사이트 도메인이 Firebase Authentication 허용 도메인에 등록되지 않았습니다.';
  if(code.includes('too-many-requests')) return '요청이 많습니다. 잠시 후 다시 시도해주세요.';
  if(code.includes('network-request-failed')) return 'Firebase 서버와 연결하지 못했습니다. 네트워크 연결을 확인해주세요.';
  if(code.includes('permission-denied')) return 'Firestore 저장 권한이 거부되었습니다. Firestore Rules를 확인해주세요.';
  if(code.includes('failed-precondition')) return 'Firestore 설정이 아직 준비되지 않았습니다.';
  if(code.includes('unavailable')) return 'Firestore 서버에 일시적으로 연결할 수 없습니다.';
  if(stage==='firestore') return '계정은 생성됐지만 회원정보 저장 단계에서 오류가 발생했습니다.';
  return '처리 중 오류가 발생했습니다.';
}
function setStatus(status,message,state='error',debug=''){if(!status)return;status.dataset.state=state;status.textContent=debug?`${message} · 오류 코드: ${debug}`:message;}

function setupLogin(){
  const form=document.querySelector('[data-login-form]');if(!form)return;
  const status=form.querySelector('[data-login-status]');
  const emailInput=form.elements.email;
  const last=recentEmail();if(last&&!emailInput.value)emailInput.value=last;
  if(!configured){setStatus(status,'Firebase 설정값이 아직 연결되지 않았습니다.','error');return;}
  form.addEventListener('submit',async(event)=>{
    event.preventDefault();setStatus(status,'','error');
    const email=emailInput.value.trim();const password=form.elements.password.value;
    if(!email||!password){setStatus(status,'이메일과 비밀번호를 입력해주세요.','error');return;}
    const button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent='로그인 중…';
    try{await signInWithEmailAndPassword(auth,email,password);rememberEmail(email);const params=new URLSearchParams(location.search);location.href=params.get('next')||'./mypage.html';}
    catch(error){setStatus(status,friendlyAuthError(error),'error');}
    finally{button.disabled=false;button.textContent='로그인';}
  });
}

function setupAccountHelp(){
  const recentButton=document.querySelector('[data-find-login-email]');
  const recentStatus=document.querySelector('[data-find-login-email-status]');
  recentButton?.addEventListener('click',()=>{
    const email=recentEmail();
    if(email){recentStatus.dataset.state='success';recentStatus.textContent=`이 기기에서 최근 사용한 로그인 이메일은 ${email} 입니다.`;}
    else{recentStatus.dataset.state='error';recentStatus.textContent='이 기기에 저장된 최근 로그인 이메일이 없습니다. 정월재는 별도 아이디 없이 가입 이메일을 아이디로 사용합니다.';}
  });

  const resetForm=document.querySelector('[data-password-reset-form]');
  if(!resetForm)return;
  const resetStatus=resetForm.querySelector('[data-password-reset-status]');
  const resetEmail=resetForm.elements.resetEmail;
  const last=recentEmail();if(last&&!resetEmail.value)resetEmail.value=last;
  resetForm.addEventListener('submit',async(event)=>{
    event.preventDefault();
    const email=resetEmail.value.trim();
    if(!email){setStatus(resetStatus,'비밀번호를 재설정할 이메일을 입력해주세요.','error');return;}
    if(!configured){setStatus(resetStatus,'Firebase 설정을 확인해주세요.','error');return;}
    const button=resetForm.querySelector('button[type="submit"]');button.disabled=true;button.textContent='메일 보내는 중…';
    try{
      await sendPasswordResetEmail(auth,email);
      rememberEmail(email);
      setStatus(resetStatus,'비밀번호 재설정 메일을 보냈습니다. 메일함과 스팸함을 확인해주세요.','success');
    }catch(error){
      const code=String(error?.code||'');
      if(code.includes('user-not-found'))setStatus(resetStatus,'입력한 이메일로 가입된 계정을 확인하지 못했습니다.','error');
      else setStatus(resetStatus,friendlyAuthError(error),'error');
    }finally{button.disabled=false;button.textContent='비밀번호 재설정 메일 보내기';}
  });
}

function populateBirthSelectors(form){
  const year=form.querySelector('#signup-birth-year');const month=form.querySelector('#signup-birth-month');const day=form.querySelector('#signup-birth-day');const meridiem=form.querySelector('#signup-birth-meridiem');const hour=form.querySelector('#signup-birth-hour');const minute=form.querySelector('#signup-birth-minute');const currentYear=new Date().getFullYear();
  for(let y=currentYear;y>=1900;y--)year?.insertAdjacentHTML('beforeend',`<option value="${y}">${y}년</option>`);
  for(let m=1;m<=12;m++)month?.insertAdjacentHTML('beforeend',`<option value="${String(m).padStart(2,'0')}">${m}월</option>`);
  const fillDays=()=>{if(!day)return;const prev=day.value;day.innerHTML='<option value="">일</option>';const y=Number(year?.value)||2000;const m=Number(month?.value)||1;const max=new Date(y,m,0).getDate();for(let d=1;d<=max;d++)day.insertAdjacentHTML('beforeend',`<option value="${String(d).padStart(2,'0')}">${d}일</option>`);if([...day.options].some(o=>o.value===prev))day.value=prev;};
  year?.addEventListener('change',fillDays);month?.addEventListener('change',fillDays);fillDays();
  for(let h=1;h<=12;h++)hour?.insertAdjacentHTML('beforeend',`<option value="${String(h).padStart(2,'0')}">${h}시</option>`);
  for(let min=0;min<60;min+=10)minute?.insertAdjacentHTML('beforeend',`<option value="${String(min).padStart(2,'0')}">${String(min).padStart(2,'0')}분</option>`);
  return{year,month,day,meridiem,hour,minute};
}

function setupSignup(){
  let form=document.querySelector('[data-signup-form]');if(!form)return;
  const clean=form.cloneNode(true);form.replaceWith(clean);form=clean;
  const status=form.querySelector('[data-signup-status]');const timeUnknown=form.querySelector('#signup-time-unknown');const birth=populateBirthSelectors(form);const field=(name)=>form.elements[name];const error=(name,msg='')=>{const el=form.querySelector(`[data-signup-error="${name}"]`);if(el)el.textContent=msg;};
  const syncTimeUnknown=()=>{const disabled=Boolean(timeUnknown?.checked);[birth.meridiem,birth.hour,birth.minute].forEach(el=>{if(el){el.disabled=disabled;if(disabled)el.value='';}});};timeUnknown?.addEventListener('change',syncTimeUnknown);syncTimeUnknown();
  form.addEventListener('submit',async(event)=>{
    event.preventDefault();['email','password','passwordConfirm','name','birthDate','birthTime','gender','city','privacyConsent'].forEach(k=>error(k));setStatus(status,'','error');let valid=true;
    const email=field('email').value.trim();const password=field('password').value;const passwordConfirm=field('passwordConfirm').value;
    const birthDate=(birth.year?.value&&birth.month?.value&&birth.day?.value)?`${birth.year.value}-${birth.month.value}-${birth.day.value}`:'';let birthTime='';
    if(!timeUnknown?.checked&&birth.meridiem?.value&&birth.hour?.value&&birth.minute?.value){let h=Number(birth.hour.value)%12;if(birth.meridiem.value==='pm')h+=12;birthTime=`${String(h).padStart(2,'0')}:${birth.minute.value}`;}
    if(!/^\S+@\S+\.\S+$/.test(email)){error('email','이메일 형식을 확인해주세요.');valid=false;}
    if(password.length<8){error('password','비밀번호는 8자 이상 입력해주세요.');valid=false;}
    if(passwordConfirm!==password){error('passwordConfirm','비밀번호가 서로 일치하지 않습니다.');valid=false;}
    if(!field('name').value.trim()){error('name','성함을 입력해주세요.');valid=false;}
    if(!birthDate){error('birthDate','태어난 연·월·일을 모두 선택해주세요.');valid=false;}
    if(!timeUnknown?.checked&&((birth.meridiem?.value||birth.hour?.value||birth.minute?.value)&&!birthTime)){error('birthTime','시간을 입력하려면 오전/오후·시·분을 모두 선택해주세요.');valid=false;}
    if(!field('gender').value){error('gender','성별을 선택해주세요.');valid=false;}
    if(!field('city').value.trim()){error('city','시 단위의 지역을 입력해주세요.');valid=false;}
    if(!field('privacyConsent').checked){error('privacyConsent','개인정보처리방침 동의가 필요합니다.');valid=false;}
    if(!valid){setStatus(status,'입력 내용을 다시 확인해주세요.','error');return;}
    if(!configured){setStatus(status,'Firebase 설정값을 먼저 연결해주세요.','error');return;}
    const button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent='등록 중…';let credential=null;let authCreated=false;
    try{
      credential=await createUserWithEmailAndPassword(auth,email,password);authCreated=true;
      await updateProfile(credential.user,{displayName:field('name').value.trim()});
      const userRef=doc(db,'users',credential.user.uid);
      try{
        await setDoc(userRef,{email,name:field('name').value.trim(),birthDate,birthTime,birthTimeUnknown:Boolean(timeUnknown?.checked),calendarType:field('calendarType').value,gender:field('gender').value,city:field('city').value.trim(),privacyConsent:true,createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});
      }catch(fsError){fsError.stage='firestore';throw fsError;}
      rememberEmail(email);
      setStatus(status,'회원등록이 완료되었습니다. 마이페이지로 이동합니다.','success');setTimeout(()=>{location.href='./mypage.html';},500);
    }catch(err){
      if(authCreated&&credential?.user){try{await deleteUser(credential.user);}catch(e){}}
      setStatus(status,friendlyAuthError(err,err?.stage),'error',errorCode(err));
    }finally{button.disabled=false;button.textContent='회원등록';}
  });
}

async function setupMyPage(user){
  const root=document.querySelector('[data-mypage]');if(!root)return;
  const status=root.querySelector('[data-mypage-status]');
  if(!configured){status.textContent='Firebase 설정값을 연결하면 회원 정보가 표시됩니다.';return;}
  if(!user){location.href='./login.html?next=./mypage.html';return;}
  rememberEmail(user.email||'');
  try{
    const snap=await getDoc(doc(db,'users',user.uid));const data=snap.exists()?snap.data():{};
    const values={email:user.email||data.email||'—',name:data.name||user.displayName||'—',birthDate:data.birthDate||'—',birthTime:data.birthTimeUnknown?'모름':(data.birthTime||'—'),calendarType:data.calendarType==='lunar'?'음력':'양력',gender:data.gender==='male'?'남성':data.gender==='female'?'여성':'—',city:data.city||'—'};
    Object.entries(values).forEach(([key,value])=>{const el=root.querySelector(`[data-profile="${key}"]`);if(el)el.textContent=value;});status.textContent='';
  }catch(error){status.textContent='회원 정보를 불러오지 못했습니다.';}
}

setupLogin();setupAccountHelp();setupSignup();
if(configured){onAuthStateChanged(auth,(user)=>{renderHeaderAuth(user);setupMyPage(user);});}else{renderHeaderAuth(null);setupMyPage(null);}
document.addEventListener('click',async(event)=>{const logout=event.target.closest('[data-logout]');if(!logout||!configured)return;event.preventDefault();await signOut(auth);if(currentFile()==='mypage.html')location.href='./index.html';});