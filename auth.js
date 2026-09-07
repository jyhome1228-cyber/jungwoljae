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
css.href='./auth.css?v=20260907-01';
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
      my.href='./mypage.html'; my.textContent='마이페이지'; my.className='mobile-auth-item'; my.dataset.authMobile='true';
      const logout=document.createElement('button');
      logout.type='button'; logout.textContent='로그아웃'; logout.className='mobile-auth-logout'; logout.dataset.authMobile='true'; logout.dataset.logout='true';
      nav.append(my,logout);
    }else{
      const login=document.createElement('a');
      login.href='./login.html'; login.textContent='로그인'; login.className='mobile-auth-item'; login.dataset.authMobile='true';
      const signupLink=document.createElement('a');
      signupLink.href='./signup.html'; signupLink.textContent='회원등록'; signupLink.className='mobile-auth-item'; signupLink.dataset.authMobile='true';
      nav.append(login,signupLink);
    }
  });
}

function friendlyAuthError(error){
  const code=error?.code||'';
  if(code.includes('invalid-credential')||code.includes('wrong-password')||code.includes('user-not-found')) return '이메일 또는 비밀번호를 다시 확인해주세요.';
  if(code.includes('email-already-in-use')) return '이미 가입된 이메일입니다.';
  if(code.includes('invalid-email')) return '이메일 형식을 확인해주세요.';
  if(code.includes('weak-password')) return '비밀번호는 8자 이상으로 설정해주세요.';
  if(code.includes('too-many-requests')) return '로그인 시도가 많습니다. 잠시 후 다시 시도해주세요.';
  if(code.includes('network-request-failed')) return '네트워크 연결을 확인해주세요.';
  return '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

function setupLogin(){
  const form=document.querySelector('[data-login-form]');
  if(!form) return;
  const status=form.querySelector('[data-login-status]');
  if(!configured){status.innerHTML='Firebase 설정값이 아직 연결되지 않았습니다. <code>firebase-config.js</code>에 Web App 설정을 넣으면 로그인 기능이 활성화됩니다.';return;}
  form.addEventListener('submit',async(event)=>{
    event.preventDefault();
    status.textContent='';
    const email=form.elements.email.value.trim();
    const password=form.elements.password.value;
    if(!email||!password){status.textContent='이메일과 비밀번호를 입력해주세요.';return;}
    const button=form.querySelector('button[type="submit"]');
    button.disabled=true; button.textContent='로그인 중…';
    try{
      await signInWithEmailAndPassword(auth,email,password);
      const params=new URLSearchParams(location.search);
      location.href=params.get('next')||'./mypage.html';
    }catch(error){status.textContent=friendlyAuthError(error);}
    finally{button.disabled=false;button.textContent='로그인';}
  });
}

function setupSignup(){
  let form=document.querySelector('[data-signup-form]');
  if(!form) return;

  // Existing prototype page had an inline submit listener. Clone once to remove old listeners.
  const emailExists=form.querySelector('#signup-email');
  if(!emailExists){
    const userIdField=form.querySelector('#signup-id')?.closest('.field');
    if(userIdField){
      const emailWrap=document.createElement('div');
      emailWrap.className='field full';
      emailWrap.innerHTML='<label for="signup-email">이메일 <small>로그인·계정 확인용</small></label><input id="signup-email" name="email" type="email" autocomplete="email" required placeholder="name@example.com"><p class="field-error" data-signup-error="email"></p>';
      userIdField.insertAdjacentElement('afterend',emailWrap);
    }
  }
  const clean=form.cloneNode(true);
  form.replaceWith(clean);
  form=clean;

  const status=form.querySelector('[data-signup-status]');
  const birthTime=form.querySelector('#signup-birth-time');
  const timeUnknown=form.querySelector('#signup-time-unknown');
  const field=(name)=>form.elements[name];
  const error=(name,msg='')=>{const el=form.querySelector(`[data-signup-error="${name}"]`);if(el)el.textContent=msg;};

  timeUnknown?.addEventListener('change',()=>{
    if(timeUnknown.checked){birthTime.value='';birthTime.disabled=true;}else birthTime.disabled=false;
  });

  if(!configured){
    status.innerHTML='화면은 준비되었습니다. Firebase Web App 설정값을 연결하면 실제 회원등록이 시작됩니다.';
  }

  form.addEventListener('submit',async(event)=>{
    event.preventDefault();
    ['userId','email','password','passwordConfirm','name','birthDate','gender','city','privacyConsent'].forEach(k=>error(k));
    status.textContent='';
    let valid=true;
    const userId=field('userId').value.trim();
    const email=field('email').value.trim();
    const password=field('password').value;
    const passwordConfirm=field('passwordConfirm').value;

    if(!/^[A-Za-z0-9_]{4,20}$/.test(userId)){error('userId','아이디는 영문, 숫자, _ 조합 4~20자로 입력해주세요.');valid=false;}
    if(!/^\S+@\S+\.\S+$/.test(email)){error('email','이메일 형식을 확인해주세요.');valid=false;}
    if(password.length<8){error('password','비밀번호는 8자 이상 입력해주세요.');valid=false;}
    if(passwordConfirm!==password){error('passwordConfirm','비밀번호가 서로 일치하지 않습니다.');valid=false;}
    if(!field('name').value.trim()){error('name','성함을 입력해주세요.');valid=false;}
    if(!field('birthDate').value){error('birthDate','태어난 날짜를 입력해주세요.');valid=false;}
    if(!field('gender').value){error('gender','성별을 선택해주세요.');valid=false;}
    if(!field('city').value.trim()){error('city','시 단위의 지역을 입력해주세요.');valid=false;}
    if(!field('privacyConsent').checked){error('privacyConsent','개인정보처리방침 동의가 필요합니다.');valid=false;}
    if(!valid){status.textContent='입력 내용을 다시 확인해주세요.';return;}
    if(!configured){status.textContent='Firebase 설정값을 먼저 연결해주세요.';return;}

    const button=form.querySelector('button[type="submit"]');
    button.disabled=true; button.textContent='등록 중…';
    let credential=null;
    try{
      credential=await createUserWithEmailAndPassword(auth,email,password);
      await updateProfile(credential.user,{displayName:field('name').value.trim()});
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
          name:field('name').value.trim(),
          birthDate:field('birthDate').value,
          birthTime:timeUnknown?.checked?'':(birthTime?.value||''),
          birthTimeUnknown:Boolean(timeUnknown?.checked),
          calendarType:field('calendarType').value,
          gender:field('gender').value,
          city:field('city').value.trim(),
          privacyConsent:true,
          createdAt:serverTimestamp(),
          updatedAt:serverTimestamp()
        });
      });
      location.href='./mypage.html';
    }catch(err){
      if(credential?.user){try{await deleteUser(credential.user);}catch(e){}}
      if(err?.message==='USERNAME_TAKEN') error('userId','이미 사용 중인 아이디입니다.');
      else status.textContent=friendlyAuthError(err);
    }finally{button.disabled=false;button.textContent='회원등록';}
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
    Object.entries(values).forEach(([key,value])=>{const el=root.querySelector(`[data-profile="${key}"]`);if(el)el.textContent=value;});
    status.textContent='';
  }catch(error){status.textContent='회원 정보를 불러오지 못했습니다.';}
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
