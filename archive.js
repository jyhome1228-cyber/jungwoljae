import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, query, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
const status=document.querySelector('[data-readings-status]');
const list=document.querySelector('[data-reading-list]');
const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

function formatDate(value){
  try{const d=value?.toDate?value.toDate():value?new Date(value):null;if(!d)return '저장 날짜 없음';return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(d);}catch(e){return '저장 날짜 없음';}
}
function typeLabel(type){
  return ({ohaeng:'오행 분석',fortune:'오늘의 운세',relationship:'연애와 인연',compatibility:'궁합',work:'일과 재물',guide:'정월도감'})[type]||'정월재 분석';
}
function openRequestedReading(){
  const id=new URLSearchParams(location.search).get('reading');if(!id)return;const target=document.getElementById(`reading-${CSS.escape(id)}`);if(target){target.open=true;setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'center'}),120);}
}

onAuthStateChanged(auth,async user=>{
  if(!user){status.textContent='로그인하면 저장한 분석을 확인할 수 있습니다.';list.innerHTML='<div class="empty-record">정월록은 로그인 회원의 개인 기록 공간입니다. 운세와 정월도감의 고민 해답을 이곳에 차곡차곡 모아둘 수 있습니다.</div>';return;}
  try{
    const q=query(collection(db,'users',user.uid,'readings'),orderBy('createdAt','desc'));const snap=await getDocs(q);
    if(snap.empty){status.textContent='아직 저장된 분석이 없습니다.';list.innerHTML='<div class="empty-record">분석 결과에서 저장 버튼을 누르면 이곳에 기록됩니다.</div>';return;}
    status.textContent=`총 ${snap.size}개의 저장 기록`;
    list.innerHTML=snap.docs.map(docSnap=>{const d=docSnap.data();const question=(d.question||'').trim();const direct=(d.questionDirect||'').trim();const report=d.reportText||d.summary||'';return `<details class="reading-card" id="reading-${esc(docSnap.id)}" data-reading-id="${esc(docSnap.id)}"><summary><span class="reading-type">${esc(typeLabel(d.type))}</span><div class="reading-title-wrap"><h3>${esc(d.title||'정월재 분석')}</h3>${question?`<p>${esc(question)}</p>`:''}</div><span class="reading-date">${esc(formatDate(d.createdAt))}</span></summary><div class="reading-body">${direct?`<div class="reading-direct"><span>질문에 대한 답</span><strong>${esc(direct)}</strong></div>`:''}<pre class="reading-report">${esc(report)}</pre></div></details>`;}).join('');
    openRequestedReading();
  }catch(e){status.textContent='기록을 불러오지 못했습니다.';list.innerHTML='<div class="empty-record">Firestore 연결 상태를 확인해주세요.</div>';}
});
