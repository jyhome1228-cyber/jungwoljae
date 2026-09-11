import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';

const HIDE_KEY='jw_welcome_hide_date_v1';
const SESSION_KEY='jw_welcome_dismissed_session_v1';
const ENTRY_LOADING_KEY='jw_entry_loading_seen_session_v1';
const EXCLUDED=new Set(['login.html','signup.html','admin.html','privacy.html','firebase-debug.html']);
const currentFile=location.pathname.split('/').pop()||'index.html';
const isResult=currentFile.endsWith('-result.html')||currentFile==='compatibility-report.html';
const canRun=!EXCLUDED.has(currentFile)&&!isResult;

function todayKey(){
  try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
  catch(e){return new Date().toISOString().slice(0,10);}
}
function hiddenToday(){try{return localStorage.getItem(HIDE_KEY)===todayKey();}catch(e){return false;}}
function dismissedThisSession(){try{return sessionStorage.getItem(SESSION_KEY)==='1';}catch(e){return false;}}
function dismissSession(){try{sessionStorage.setItem(SESSION_KEY,'1');}catch(e){}}
function dismissToday(){try{localStorage.setItem(HIDE_KEY,todayKey());}catch(e){}dismissSession();}
function hasSeenEntryLoading(){try{return sessionStorage.getItem(ENTRY_LOADING_KEY)==='1';}catch(e){return false;}}
function markEntryLoadingSeen(){try{sessionStorage.setItem(ENTRY_LOADING_KEY,'1');}catch(e){}}

function removePopup(){
  document.querySelector('[data-jw-welcome]')?.remove();
  document.body.classList.remove('jw-welcome-open');
}

function showPopup(){
  if(document.querySelector('[data-jw-welcome]'))return;
  const overlay=document.createElement('div');
  overlay.className='jw-welcome-overlay';
  overlay.dataset.jwWelcome='true';
  overlay.innerHTML=`
    <section class="jw-welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="jw-welcome-title">
      <button type="button" class="jw-welcome-close" aria-label="닫기" data-jw-welcome-close>×</button>
      <div class="jw-welcome-hero" aria-hidden="true">
        <div class="jw-welcome-hero-copy">
          <strong>좋은 오늘이,<br>더 나은 내일이 되도록</strong>
          <span></span>
          <p>정월재와 함께,<br>당신의 시간을 더 깊이</p>
        </div>
      </div>
      <div class="jw-welcome-content">
        <div class="jw-welcome-brand"><img src="./logo.svg" alt="" aria-hidden="true"><span>정월재 · 正月齋</span></div>
        <p class="jw-welcome-kicker">WELCOME TO JUNGWOLJAE</p>
        <h2 id="jw-welcome-title">정월재에 오신 것을 환영합니다</h2>
        <div class="jw-welcome-rule" aria-hidden="true"></div>
        <div class="jw-welcome-copy">
          <p>정월재는<br>사주를 좋아하지만 <strong>과한 광고와 복잡한 이용 방식은 부담스러운 분들</strong>을 위해 만들었습니다.</p>
          <p>회원가입을 하신다면<br>기본 정보가 상시 저장되어<br><strong>더 빠르고 편하게</strong> 여러 서비스를 이용할 수 있습니다.</p>
        </div>
        <div class="jw-welcome-actions">
          <a class="jw-welcome-button primary" href="./signup.html" data-jw-welcome-signup>회원가입</a>
          <button type="button" class="jw-welcome-button secondary" data-jw-welcome-later>나중에 둘러보기</button>
        </div>
        <button type="button" class="jw-welcome-today" data-jw-welcome-today><span aria-hidden="true"></span>오늘 하루 보지 않기</button>
      </div>
    </section>`;
  document.body.appendChild(overlay);
  document.body.classList.add('jw-welcome-open');
  const dialog=overlay.querySelector('.jw-welcome-dialog');
  const close=()=>{dismissSession();removePopup();};
  overlay.querySelector('[data-jw-welcome-close]')?.addEventListener('click',close);
  overlay.querySelector('[data-jw-welcome-later]')?.addEventListener('click',close);
  overlay.querySelector('[data-jw-welcome-today]')?.addEventListener('click',()=>{dismissToday();removePopup();});
  overlay.querySelector('[data-jw-welcome-signup]')?.addEventListener('click',dismissSession);
  overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
  document.addEventListener('keydown',function esc(event){if(event.key==='Escape'){document.removeEventListener('keydown',esc);close();}});
  setTimeout(()=>dialog?.querySelector('[data-jw-welcome-signup]')?.focus(),80);
}

async function runFirstEntryLoading(){
  if(!canRun||hasSeenEntryLoading())return;
  markEntryLoadingSeen();
  try{
    const {showSajuLoading}=await import('./saju-loading.js?v=20260909-2340');
    await showSajuLoading({
      duration:2500,
      eyebrow:'JUNGWOLJAE · WELCOME',
      title:'정월재의 문을 열고 있습니다.',
      messages:[
        '차분히 둘러볼 수 있도록 공간을 준비하고 있습니다.',
        '오늘의 흐름을 읽을 자리를 정돈하고 있습니다.',
        '정월재에서 편안한 시간을 시작해보세요.'
      ],
      ariaLabel:'정월재 시작 화면 준비 중'
    });
  }catch(error){
    console.error('welcome loading failed',error);
  }
}

function resolveUser(){
  return new Promise(resolve=>{
    try{
      const app=getApps().length?getApp():initializeApp(firebaseConfig);
      const auth=getAuth(app);
      let stop=()=>{};
      stop=onAuthStateChanged(auth,user=>{stop();resolve(user);},()=>resolve(null));
    }catch(e){resolve(null);}
  });
}

async function boot(){
  if(!canRun)return;
  const [user]=await Promise.all([resolveUser(),runFirstEntryLoading()]);
  if(hiddenToday()||dismissedThisSession())return;
  if(user&&!user.isAnonymous)return;
  setTimeout(showPopup,220);
}

boot();
