import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
const list=document.querySelector('[data-mypage-readings]');
const status=document.querySelector('[data-mypage-reading-status]');
const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

function formatDate(value){
  try{
    const d=value?.toDate?value.toDate():value?new Date(value):null;
    if(!d)return '';
    return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  }catch(e){return '';}
}
function typeLabel(type){
  return ({ohaeng:'오행 분석',saju:'종합 사주',fortune:'오늘의 운세',relationship:'연애와 인연',compatibility:'궁합',work:'일과 재물',guide:'정월도감'})[type]||'정월재 분석';
}

onAuthStateChanged(auth,async user=>{
  if(!list||!status)return;
  if(!user){
    status.textContent='로그인하면 저장한 분석 이력을 확인할 수 있습니다.';
    list.innerHTML='';
    return;
  }
  try{
    const q=query(collection(db,'users',user.uid,'readings'),orderBy('createdAt','desc'),limit(5));
    const snap=await getDocs(q);
    if(snap.empty){
      status.textContent='아직 저장한 분석이 없습니다.';
      list.innerHTML='<div class="mypage-reading-empty">분석 결과에서 “마이페이지에 저장”을 누르면 이곳에 최근 기록이 쌓입니다.</div>';
      return;
    }
    status.textContent=`최근 ${snap.size}개 기록`;
    list.innerHTML=snap.docs.map(docSnap=>{
      const d=docSnap.data();
      const qText=(d.question||'').trim();
      const subtitle=qText?`질문 · ${qText}`:(d.summary||'저장한 분석 결과');
      return `<a class="mypage-reading-item" href="./archive.html?reading=${encodeURIComponent(docSnap.id)}">
        <div class="mypage-reading-main"><span>${esc(typeLabel(d.type))}</span><strong>${esc(d.title||'정월재 분석')}</strong><p>${esc(subtitle)}</p></div>
        <time>${esc(formatDate(d.createdAt))}</time>
      </a>`;
    }).join('');
  }catch(error){
    status.textContent='저장한 기록을 불러오지 못했습니다.';
    list.innerHTML='<div class="mypage-reading-empty">잠시 후 다시 확인해주세요.</div>';
  }
});