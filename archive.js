import { firebaseConfig } from './firebase-config.js?v=20260907-1637';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, query, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);const db=getFirestore(app);
const status=document.querySelector('[data-readings-status]');
const list=document.querySelector('[data-reading-list]');
const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

function formatDate(value){try{if(value?.toDate)return value.toDate().toLocaleString('ko-KR');if(value)return new Date(value).toLocaleString('ko-KR');}catch(e){}return '저장 날짜 없음';}

onAuthStateChanged(auth,async user=>{
  if(!user){status.textContent='로그인하면 저장한 분석을 확인할 수 있습니다.';list.innerHTML='<div class="empty-record">정월록은 로그인 회원의 개인 기록 공간입니다. 로그인 후 저장한 오행 분석이 여기에 쌓입니다.</div>';return;}
  try{
    const q=query(collection(db,'users',user.uid,'readings'),orderBy('createdAt','desc'));
    const snap=await getDocs(q);
    if(snap.empty){status.textContent='아직 저장된 분석이 없습니다.';list.innerHTML='<div class="empty-record">첫 오행 분석 결과에서 “마이페이지에 저장”을 누르면 이곳에 기록됩니다.</div>';return;}
    status.textContent=`${snap.size}개의 기록`;
    list.innerHTML=snap.docs.map(docSnap=>{const d=docSnap.data();const type=d.type==='ohaeng'?'오행 분석':(d.type||'분석');const summary=d.summary||'';const report=d.reportText||summary;return `<details class="reading-card"><summary><span class="reading-type">${esc(type)}</span><h3>${esc(d.title||'정월재 분석')}</h3><span class="reading-date">${esc(formatDate(d.createdAt))}</span></summary><div class="reading-body"><p>${esc(report)}</p></div></details>`;}).join('');
  }catch(e){status.textContent='기록을 불러오지 못했습니다.';list.innerHTML='<div class="empty-record">Firestore 연결 상태를 확인해주세요.</div>';}
});
