import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import {
  getFirestore, doc, getDoc, getDocs, collection, collectionGroup,
  getCountFromServer, deleteDoc
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
const gate=document.querySelector('[data-admin-gate]');
const gateMessage=document.querySelector('[data-admin-gate-message]');
const dashboard=document.querySelector('[data-admin-dashboard]');
const refreshBtn=document.querySelector('[data-admin-refresh]');
const logoutBtn=document.querySelector('[data-admin-logout]');
const searchInput=document.querySelector('[data-member-search]');
let memberRows=[];

const serviceLabels={
  saju:'종합 사주',ohaeng:'오행 분석',fortune:'오늘의 운세',relationship:'연애와 인연',
  compatibility:'궁합','work-money':'일과 재물',work:'일과 재물'
};
const esc=(v='')=>String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const toDate=value=>value?.toDate?value.toDate():value?new Date(value):null;
const formatDate=value=>{const d=toDate(value);if(!d||Number.isNaN(d.getTime()))return '—';return new Intl.DateTimeFormat('ko-KR',{year:'2-digit',month:'2-digit',day:'2-digit'}).format(d).replace(/\s/g,'');};
const formatDateTime=value=>{const d=toDate(value);if(!d||Number.isNaN(d.getTime()))return '—';return new Intl.DateTimeFormat('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(d);};
const n=v=>new Intl.NumberFormat('ko-KR').format(Number(v)||0);

function seoulDateKey(offsetDays=0){
  const now=new Date(Date.now()+offsetDays*86400000);
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const get=t=>parts.find(p=>p.type===t)?.value||'';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function dayLabel(dateKey){const [,m,d]=dateKey.split('-');return `${Number(m)}/${Number(d)}`;}
function isSameSeoulDay(value,dateKey){
  const d=toDate(value);if(!d)return false;
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
  const get=t=>parts.find(p=>p.type===t)?.value||'';
  return `${get('year')}-${get('month')}-${get('day')}`===dateKey;
}
function typeLabel(type){return serviceLabels[type]||type||'기타';}

async function loadTrafficDay(dateKey){
  const dailyRef=doc(db,'analytics_daily',dateKey);
  const [dailySnap,visitorCount]=await Promise.all([
    getDoc(dailyRef),
    getCountFromServer(collection(db,'analytics_daily',dateKey,'visitors')).catch(()=>({data:()=>({count:0})}))
  ]);
  return {dateKey,pageViews:dailySnap.exists()?Number(dailySnap.data().pageViews||0):0,visitors:Number(visitorCount.data().count||0)};
}

function renderTraffic(days){
  const node=document.querySelector('[data-traffic-chart]');
  const max=Math.max(1,...days.map(x=>x.pageViews));
  node.innerHTML=days.map(x=>`<div class="traffic-day"><div class="traffic-bar-wrap" title="${esc(x.dateKey)} · ${n(x.pageViews)} PV · ${n(x.visitors)}명"><div class="traffic-bar" style="height:${Math.max(3,Math.round(x.pageViews/max*100))}%"></div></div><div class="traffic-label"><strong>${n(x.pageViews)}</strong><span>${dayLabel(x.dateKey)} · ${n(x.visitors)}명</span></div></div>`).join('');
}

function renderServiceUsage(readings){
  const counts={};
  readings.forEach(r=>{const key=r.data().type||'other';counts[key]=(counts[key]||0)+1;});
  const items=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  const max=Math.max(1,...items.map(x=>x[1]));
  const node=document.querySelector('[data-service-usage]');
  node.innerHTML=items.length?items.map(([key,count])=>`<div class="service-row"><span>${esc(typeLabel(key))}</span><div class="service-track"><div class="service-fill" style="width:${Math.round(count/max*100)}%"></div></div><strong>${n(count)}</strong></div>`).join(''):'<p class="admin-caption">아직 저장된 분석이 없습니다.</p>';
}

function renderPages(pageDocs,total){
  const tbody=document.querySelector('[data-page-table]');
  document.querySelector('[data-pages-total]').textContent=`오늘 ${n(total)} PV`;
  const rows=pageDocs.map(s=>s.data()).sort((a,b)=>Number(b.pageViews||0)-Number(a.pageViews||0));
  tbody.innerHTML=rows.length?rows.map(row=>`<tr><td><strong>${esc(row.label||row.path)}</strong></td><td>${esc(row.path||'—')}</td><td class="num">${n(row.pageViews)}</td><td class="num">${total?Math.round(Number(row.pageViews||0)/total*100):0}%</td></tr>`).join(''):'<tr><td colspan="4">오늘 집계된 페이지뷰가 없습니다.</td></tr>';
}

function buildMemberRows(users,readings){
  const usage={};
  readings.forEach(s=>{
    const uid=s.ref.parent.parent?.id;if(!uid)return;
    const d=s.data();
    const u=usage[uid]||(usage[uid]={total:0,services:{},last:null});
    u.total++;
    const type=d.type||'other';u.services[type]=(u.services[type]||0)+1;
    const dt=toDate(d.createdAt);if(dt&&(!u.last||dt>u.last))u.last=dt;
  });
  return users.map(s=>{
    const d=s.data();const u=usage[s.id]||{total:0,services:{},last:null};
    const top=Object.entries(u.services).sort((a,b)=>b[1]-a[1]);
    return {uid:s.id,...d,total:u.total,services:u.services,top,last:u.last};
  }).sort((a,b)=>b.total-a.total || String(a.name||'').localeCompare(String(b.name||''),'ko'));
}

function renderMembers(filter=''){
  const tbody=document.querySelector('[data-member-table]');
  const q=filter.trim().toLowerCase();
  const rows=q?memberRows.filter(r=>[r.userId,r.name,r.email].some(v=>String(v||'').toLowerCase().includes(q))):memberRows;
  tbody.innerHTML=rows.length?rows.map(r=>{
    const chips=r.top.slice(0,3).map(([type,count])=>`<span class="service-chip">${esc(typeLabel(type))} ${count}</span>`).join('')||'<span class="service-chip">이용 없음</span>';
    const topLabel=r.top[0]?`${typeLabel(r.top[0][0])} · ${r.top[0][1]}회`:'—';
    return `<tr><td><strong>${esc(r.name||'이름 없음')} · ${esc(r.userId||'—')}</strong><small>${esc(r.email||'—')}</small></td><td>${formatDate(r.createdAt)}</td><td class="num"><strong>${n(r.total)}</strong></td><td><strong>${esc(topLabel)}</strong><div class="service-chips">${chips}</div></td><td>${r.last?formatDateTime(r.last):'—'}</td></tr>`;
  }).join(''):'<tr><td colspan="5">조건에 맞는 회원이 없습니다.</td></tr>';
}

function renderReviews(reviewDocs){
  const node=document.querySelector('[data-review-list]');
  const recent=reviewDocs.slice(0,8);
  node.innerHTML=recent.length?recent.map(s=>{const d=s.data();return `<article class="admin-review" data-review-id="${s.id}"><div class="admin-review-meta"><span>${esc(d.authorLabel||'익명 회원')} · ${esc(d.service||'정월재')}</span><small>${formatDateTime(d.createdAt)}</small></div><p>${esc(d.content||'')}</p><div class="admin-review-actions"><span class="admin-review-rating">★ ${Number(d.rating||0).toFixed(1)}</span><button type="button" class="admin-delete" data-delete-review="${s.id}">삭제</button></div></article>`;}).join(''):'<p class="admin-caption">아직 등록된 후기가 없습니다.</p>';
}

async function loadDashboard(){
  refreshBtn.disabled=true;refreshBtn.textContent='집계 중…';
  try{
    const today=seoulDateKey();
    const dates=[-6,-5,-4,-3,-2,-1,0].map(seoulDateKey);
    const [userSnap,readingSnap,reviewSnap,todayTraffic,pageSnap,...trafficDays]=await Promise.all([
      getDocs(collection(db,'users')),
      getDocs(collectionGroup(db,'readings')),
      getDocs(collection(db,'reviews')),
      loadTrafficDay(today),
      getDocs(collection(db,'analytics_daily',today,'pages')),
      ...dates.map(loadTrafficDay)
    ]);

    const users=[...userSnap.docs];
    const readings=[...readingSnap.docs];
    const reviews=[...reviewSnap.docs].sort((a,b)=>(toDate(b.data().createdAt)?.getTime()||0)-(toDate(a.data().createdAt)?.getTime()||0));
    const avg=reviews.length?reviews.reduce((sum,s)=>sum+Number(s.data().rating||0),0)/reviews.length:0;
    const todaySignups=users.filter(s=>isSameSeoulDay(s.data().createdAt,today)).length;

    document.querySelector('[data-metric-pageviews]').textContent=n(todayTraffic.pageViews);
    document.querySelector('[data-metric-visitors]').textContent=n(todayTraffic.visitors);
    document.querySelector('[data-metric-users]').textContent=n(users.length);
    document.querySelector('[data-metric-users-note]').textContent=`오늘 신규 ${n(todaySignups)}명`;
    document.querySelector('[data-metric-readings]').textContent=n(readings.length);
    document.querySelector('[data-metric-reviews]').textContent=n(reviews.length);
    document.querySelector('[data-metric-rating]').textContent=reviews.length?avg.toFixed(1):'—';
    document.querySelector('[data-admin-updated]').textContent=new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date());

    renderTraffic(trafficDays);
    renderServiceUsage(readings);
    renderPages(pageSnap.docs,todayTraffic.pageViews);
    memberRows=buildMemberRows(users,readings);
    renderMembers(searchInput.value);
    renderReviews(reviews);
  }catch(error){
    console.error(error);
    alert('어드민 데이터를 불러오지 못했습니다. Firestore Rules 게시 상태와 관리자 권한을 확인해주세요.');
  }finally{
    refreshBtn.disabled=false;refreshBtn.textContent='새로고침';
  }
}

searchInput?.addEventListener('input',()=>renderMembers(searchInput.value));
refreshBtn?.addEventListener('click',loadDashboard);
logoutBtn?.addEventListener('click',async()=>{await signOut(auth);location.href='./login.html?next=./admin.html';});

document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-delete-review]');if(!button)return;
  const id=button.dataset.deleteReview;
  if(!confirm('이 후기를 삭제할까요? 삭제 후 복구할 수 없습니다.'))return;
  button.disabled=true;button.textContent='삭제 중';
  try{await deleteDoc(doc(db,'reviews',id));await loadDashboard();}
  catch(e){button.disabled=false;button.textContent='삭제';alert('후기를 삭제하지 못했습니다.');}
});

onAuthStateChanged(auth,async user=>{
  if(!user){location.href='./login.html?next=./admin.html';return;}
  try{
    const adminSnap=await getDoc(doc(db,'admins',user.uid));
    if(!adminSnap.exists()){
      gateMessage.innerHTML=`관리자 권한이 없습니다.<br>Firestore에 <strong>admins/${esc(user.uid)}</strong> 문서를 만든 뒤 다시 접속해주세요.`;
      return;
    }
    gate.hidden=true;dashboard.hidden=false;
    await loadDashboard();
  }catch(error){
    gateMessage.textContent='관리자 권한을 확인하지 못했습니다. Firestore Rules를 확인해주세요.';
  }
});
