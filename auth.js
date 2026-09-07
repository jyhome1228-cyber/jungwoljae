import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const css=document.createElement('link');
css.rel='stylesheet';
css.href='./auth.css?v=20260907-02';
document.head.appendChild(css);

const configured=Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
let auth=null;
let db=null;

if(configured){
  const app=initializeApp(firebaseConfig);
  auth=getAuth(app);
  db=getFirestore(app);
}

function currentFile(){return location.pathname.split('/').pop()||'index.html';}

function renderHeaderAuth(user){
  document.querySelectorAll('.auth-login-link,.auth-logout-button').forEach(el=>el.remove());
  const signup=document.querySelector('.header-cta');
  if(signup){
    if(user){
      signup.href='./mypage.html';
      signup.textContent='마이페이지';
    }else{
      signup.href='./signup.html';
      signup.textContent='회원등록';
    }
  }

  document.querySelectorAll('.header-inner').forEach(header=>{
    if(user){
      const logout=document.createElement('button');
      logout.type='button';
      logout.className='auth-logout-button';
      logout.textContent='로그아웃';
      logout.dataset.logout='true';
      header.appendChild(logout);
    }else{
      const login=document.createElement('a');
      login.href='./login.html';
      login.className='auth-login-link';
      login.textContent='로그인';
      header.appendChild(login);
    }
  });

  document.querySelectorAll('.mobile-menu nav').forEach(nav=>{
    nav.querySelectorAll('[data-auth-mobile]').forEach(el=>el.remove());
    if(user){
      const my=document.createElement('a');
      my.href='./mypage.html';
      my.textContent='마이페이지';
      my.className='mobile-auth-item';
      my.dataset.authMobile='true';
      const logout=document.createElement('button');
      logout.type='button';
      logout.textContent='로그아웃';
      logout.className='mobile-auth-logout';
      logout.dataset.authMobile='true';
      logout.dataset.logout='true';
      nav.append(my,logout);
    }else{
      const login=document.createElement('a');
      login.href='./login.html';
      login.textContent='로그인';
      login.className='mobile-auth-item';
      login.dataset.authMobile='true';
      const signupLink=document.createElement('a');
      signupLink.href='./signup.html';
      signupLink.textContent='회원등록';
      signupLink.className='mobile-auth-item';
      signupLink.dataset.authMobile='true';
      nav.append(login,signupLink);
    }
  });
}

function errorCode(error){
  return String(error?.code||error?.message||'unknown-error').replace(/^FirebaseError:\s*/,'');
}

function friendlyAuthError(error,stage='auth'){
  const code=String(error?.code||'');
  if(code.includes('invalid-credential')||code.includes('wrong-password')||code.includes('user-not-found')) return '이메일 또는 비밀번호를 다시 확인해주세요.';
  if(code.includes('email-already-in-use')) return '이미 가입된 이메일입니다.';
  if(code.includes('invalid-email')) return '이메일 형식을 확인해주세요.';
  if(code.includes('weak-password')) return '비밀번호가 Firebase 보안 기준을 충족하지 않습니다. 조금 더 길고 복잡하게 설정해주세요.';
  if(code.includes('operation-not-allowed')) return 'Firebase Authentication에서 이메일/비밀번호 로그인이 아직 활성화되지 않았습니다.';
  if(code.includes('unauthorized-domain')) return '현재 사이트 도메인이 Firebase Authentication 허용 도메인에 등록되지 않았습니다.';
  if(code.includes('configuration-not-found')) return 'Firebase Authentication 설정을 찾을 수 없습니다. Authentication 설정을 다시 확인해주세요.';
  if(code.includes('too-many-requests')) return '로그인 시도가 많습니다. 잠시 후 다시 시도해주세요.';
  if(code.includes('network-request-failed')) return 'Firebase 서버와 연결하지 못했습니다. 네트워크 연결을 확인해주세요.';
  if(code.includes('permission-denied')) return 'Firestore 저장 권한이 거부되었습니다. Firebase의 Firestore Rules가 게시되었는지 확인해주세요.';
  if(code.includes('failed-precondition')) return 'Firestore 설정이 아직 준비되지 않았습니다. 데이터베이스와 규칙 상태를 확인해주세요.';
  if(code.includes('unavailable')) return 'Firestore 서버에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
  if(stage==='firestore') return '계정은 생성됐지만 회원정보 저장 단계에서 오류가 발생했습니다.';
  return '처리 중 오류가 발생했습니다.';
}

function setStatus(status,message,state='error',debug=''){
  if(!status)return;
  status.dataset.state=state;
  status.textContent=debug?`${message} · 오류 코드: ${debug}`:message;
}

function setupLogin(){
  const form=document.querySelector('[data-login-form]');
  if(!form) return;
  const status=form.querySelector('[data-login-status]');
  if(!configured){
    status.textContent='Firebase Web App 설정값이 연결되지 않았습니다.';
    return;
  }
  form.addEventListener('submit',async(event)=>{
    event.preventDefault();
    status.textContent='';
    const email=form.elements.email.value.trim();
    const password=form.elements.password.value;
    if(!email||!password){status.textContent='이메일과 비밀번호를 입력해주세요.';return;}
    const button=form.querySelector('button[type="submit"]');
    button.disabled=true;
    button.textContent='로그인 중…';
    try{
      await signInWithEmailAndPassword(auth,email,password);
      const params=new URLSearchParams(location.search);
      location.href=params.get('next')||'./mypage.html';
    }catch(error){
      console.error('[정월재 로그인 오류]',error);
      status.textContent=friendlyAuthError(error,'auth');
    }finally{
      button.disabled=false;
      button.textContent='로그인';
    }
  });
}

function populateBirthSelectors(form){
  const year=form.elements.birthYear;
  const month=form.elements.birthMonth;
  const day=form.elements.birthDay;
  const meridiem=form.elements.birthMeridiem;
  const hour=form.elements.birthHour;
  const minute=form.elements.birthMinute;
  if(!year||!month||!day||!hour||!minute||!meridiem)return;

  if(year.options.length<=1){
    const now=new Date().getFullYear();
    for(let y=now;y>=1900;y--){year.add(new Option(`${y}년`,String(y)));}
  }
  if(month.options.length<=1){
    for(let m=1;m<=12;m++){month.add(new Option(`${m}월`,String(m).padStart(2,'0')));}
  }
  if(day.options.length<=1){
    for(let d=1;d<=31;d++){day.add(new Option(`${d}일`,String(d).padStart(2,'0')));}
  }
  if(hour.options.length<=1){
    for(let h=1;h<=12;h++){hour.add(new Option(`${h}시`,String(h)));}
  }
  if(minute.options.length<=1){
    for(let m=0;m<60;m++){minute.add(new Option(`${String(m).padStart(2,'0')}분`,String(m).padStart(2,'0')));}
  }
}

function composeBirthDate(form){
  const y=form.elements.birthYear?.value;
  const m=form.elements.birthMonth?.value;
  const d=form.elements.birthDay?.value;
  if(!y||!m||!d)return '';
  return `${y}-${m}-${d}`;
}

function composeBirthTime(form){
  if(form.elements.birthTimeUnknown?.checked)return '';
  const meridiem=form.elements.birthMeridiem?.value;
  const hourValue=form.elements.birthHour?.value;
  const minute=form.elements.birthMinute?.value;
  if(!meridiem||!hourValue||minute==='')return '';
  let hour=Number(hourValue);
  if(meridiem==='am'&&hour===12)hour=0;
  if(meridiem==='pm'&&hour!==12)hour+=12;
  return `${String(hour).padStart(2,'0')}:${minute}`;
}

function setupSignup(){
  const form=document.querySelector('[data-signup-form]');
  if(!form) return;

  populateBirthSelectors(form);
  const status=form.querySelector('[data-signup-status]');
  const timeUnknown=form.elements.birthTimeUnknown;
  const timeControls=[form.elements.birthMeridiem,form.elements.birthHour,form.elements.birthMinute].filter(Boolean);
  const error=(name,msg='')=>{
    const el=form.querySelector(`[data-signup-error="${name}"]`);
    if(el)el.textContent=msg;
  };

  const syncTimeUnknown=()=>{
    const disabled=Boolean(timeUnknown?.checked);
    timeControls.forEach(control=>{
      control.disabled=disabled;
      if(disabled)control.value='';
    });
  };
  timeUnknown?.addEventListener('change',syncTimeUnknown);
  syncTimeUnknown();

  if(!configured){setStatus(status,'Firebase Web App 설정값이 연결되지 않았습니다.','error');}

  form.addEventListener('submit',async(event)=>{
    event.preventDefault();
    ['userId','email','password','passwordConfirm','name','birthDate','birthTime','gender','city','privacyConsent'].forEach(k=>error(k));
    if(status){status.textContent='';status.removeAttribute('data-state');}

    let valid=true;
    const userId=form.elements.userId.value.trim();
    const email=form.elements.email.value.trim();
    const password=form.elements.password.value;
    const passwordConfirm=form.elements.passwordConfirm.value;
    const birthDate=composeBirthDate(form);
    const birthTime=composeBirthTime(form);

    if(!/^[A-Za-z0-9_]{4,20}$/.test(userId)){error('userId','아이디는 영문, 숫자, _ 조합 4~20자로 입력해주세요.');valid=false;}
    if(!/^\S+@\S+\.\S+$/.test(email)){error('email','이메일 형식을 확인해주세요.');valid=false;}
    if(password.length<8){error('password','비밀번호는 8자 이상 입력해주세요.');valid=false;}
    if(passwordConfirm!==password){error('passwordConfirm','비밀번호가 서로 일치하지 않습니다.');valid=false;}
    if(!form.elements.name.value.trim()){error('name','성함을 입력해주세요.');valid=false;}
    if(!birthDate){error('birthDate','태어난 연도, 월, 일을 모두 선택해주세요.');valid=false;}
    if(!timeUnknown?.checked&&!birthTime){error('birthTime','태어난 시간을 선택하거나 ‘태어난 시간을 모릅니다’를 체크해주세요.');valid=false;}
    if(!form.elements.gender.value){error('gender','성별을 선택해주세요.');valid=false;}
    if(!form.elements.city.value.trim()){error('city','시 단위의 지역을 입력해주세요.');valid=false;}
    if(!form.elements.privacyConsent.checked){error('privacyConsent','개인정보처리방침 동의가 필요합니다.');valid=false;}
    if(!valid){setStatus(status,'입력 내용을 다시 확인해주세요.','error');return;}
    if(!configured){setStatus(status,'Firebase 설정값을 먼저 연결해주세요.','error');return;}

    const button=form.querySelector('button[type="submit"]');
    button.disabled=true;
    button.textContent='등록 중…';
    let credential=null;
    let stage='auth';

    try{
      credential=await createUserWithEmailAndPassword(auth,email,password);
      stage='profile';
      await updateProfile(credential.user,{displayName:form.elements.name.value.trim()});

      stage='firestore';
      const uid=credential.user.uid;
      const usernameRef=doc(db,'usernames',userId.toLowerCase());
      const userRef=doc(db,'users',uid);

      await runTransaction(db,async(tx)=>{
        const usernameSnap=await tx.get(usernameRef);
        if(usernameSnap.exists()) throw new Error('USERNAME_TAKEN');
        tx.set(usernameRef,{uid,createdAt:serverTimestamp()});
        tx.set(userRef,{
          userId,
          email,
          name:form.elements.name.value.trim(),
          birthDate,
          birthTime,
          birthTimeUnknown:Boolean(timeUnknown?.checked),
          calendarType:form.elements.calendarType.value,
          gender:form.elements.gender.value,
          city:form.elements.city.value.trim(),
          privacyConsent:true,
          createdAt:serverTimestamp(),
          updatedAt:serverTimestamp()
        });
      });

      setStatus(status,'회원등록이 완료되었습니다. 마이페이지로 이동합니다.','success');
      setTimeout(()=>{location.href='./mypage.html';},350);
    }catch(err){
      console.error(`[정월재 회원등록 오류 / ${stage}]`,err);
      if(credential?.user){
        try{await deleteUser(credential.user);}catch(deleteErr){console.error('[정월재 임시 계정 정리 오류]',deleteErr);}
      }
      if(err?.message==='USERNAME_TAKEN'){
        error('userId','이미 사용 중인 아이디입니다.');
        setStatus(status,'다른 아이디를 입력해주세요.','error');
      }else{
        const code=errorCode(err);
        setStatus(status,friendlyAuthError(err,stage),'error',code);
      }
    }finally{
      button.disabled=false;
      button.textContent='회원등록';
    }
  });
}

async function setupMyPage(user){
  const root=document.querySelector('[data-mypage]');
  if(!root) return;
  const status=root.querySelector('[data-mypage-status]');
  if(!configured){status.textContent='Firebase 설정값을 연결하면 회원 정보가 표시됩니다.';return;}
  if(!user){location.href='./login.html?next=./mypage.html';return;}
  try{
    const snap=await getDoc(doc(db,'users',user.uid));
    const data=snap.exists()?snap.data():{};
    const values={
      email:user.email||data.email||'—',
      userId:data.userId||'—',
      name:data.name||user.displayName||'—',
      birthDate:data.birthDate||'—',
      birthTime:data.birthTimeUnknown?'모름':(data.birthTime||'—'),
      calendarType:data.calendarType==='lunar'?'음력':'양력',
      gender:data.gender==='male'?'남성':data.gender==='female'?'여성':'—',
      city:data.city||'—'
    };
    Object.entries(values).forEach(([key,value])=>{
      const el=root.querySelector(`[data-profile="${key}"]`);
      if(el)el.textContent=value;
    });
    status.textContent='';
  }catch(error){
    console.error('[정월재 마이페이지 오류]',error);
    status.textContent='회원 정보를 불러오지 못했습니다.';
  }
}

setupLogin();
setupSignup();

if(configured){
  onAuthStateChanged(auth,(user)=>{
    renderHeaderAuth(user);
    setupMyPage(user);
  });
}else{
  renderHeaderAuth(null);
  setupMyPage(null);
}

document.addEventListener('click',async(event)=>{
  const logout=event.target.closest('[data-logout]');
  if(!logout||!configured)return;
  event.preventDefault();
  await signOut(auth);
  if(currentFile()==='mypage.html') location.href='./index.html';
});