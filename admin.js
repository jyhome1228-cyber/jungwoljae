import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getFirestore, doc, getDoc, getDocs, collection, getCountFromServer } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const ADMIN_CODE='1228';
const SESSION_KEY='jungwoljae_admin_unlocked_v1';

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const db=getFirestore(app);
const refreshBtn=document.querySelector('[data-admin-refresh]');
const lockBtn=document.querySelector('[data-admin-lock]');
const gate=document.querySelector('[data-admin-pass-gate]');
const dashboard=document.querySelector('[data-admin-dashboard]');
const passForm=document.querySelector('[data-admin-pass-form]');
const passInput=document.querySelector('[data-admin-pass-input]');
const passStatus=document.querySelector('[data-admin-pass-status]');
let dashboardLoaded=false;

const esc=(v='')=>String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const toDate=value=>value?.toDate?value.toDate():value?new Date(value):null;
const formatDateTime=value=>{const d=toDate(value);if(!d||Number.isNaN(d.getTime()))return '—';return new Intl.DateTimeFormat('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(d);};
const n=v=>new Intl.NumberFormat('ko-KR').format(Number(v)||0);

const resultServices={
  '/saju-result.html':'종합 사주',
  '/ohaeng-result.html':'오행 분석',
  '/fortune-result.html':'오늘의 운세',
  '/relationship-result.html':'연애와 인연',
  '/compatibility-result.html':'궁합',
  '/work-money-result.html':'일과 재물'
};

function isUnlocked(){
  try{return sessionStorage.getItem(SESSION_KEY)==='1';}catch(e){return false;}
}
function setUnlocked(value){
  try{
    if(value)sessionStorage.setItem(SESSION_KEY,'1');
    else sessionStorage.removeItem(SESSION_KEY);
  }catch(e){}
}
async function openDashboard(){
  setUnlocked(true);
  document.body.classList.add('admin-unlocked');
  gate.hidden=true;
  dashboard.hidden=false;
  passStatus.textContent='';
  if(!dashboardLoaded){dashboardLoaded=true;await loadDashboard();}
}
function closeDashboard(){
  setUnlocked(false);
  document.body.classList.remove('admin-unlocked');
  dashboard.hidden=true;
  gate.hidden=false;
  passInput.value='';
  passStatus.textContent='';
  setTimeout(()=>passInput.focus(),50);
}

passForm?.addEventListener('submit',async event=>{
  event.preventDefault();
  const value=String(passInput.value||'').trim();
  if(value!==ADMIN_CODE){
    passStatus.textContent='운영 코드가 맞지 않습니다.';
    passInput.select();
    return;
  }
  passStatus.textContent='확인되었습니다.';
  await openDashboard();
});

lockBtn?.addEventListener('click',closeDashboard);

function seoulDateKey(offsetDays=0){
  const now=new Date(Date.now()+offsetDays*86400000);
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const get=t=>parts.find(p=>p.type===t)?.value||'';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function dayLabel(dateKey){const [,m,d]=dateKey.split('-');return `${Number(m)}/${Number(d)}`;}

async function loadTrafficDay(dateKey){
  const [dailySnap,visitorCount,pageSnap]=await Promise.all([
    getDoc(doc(db,'analytics_daily',dateKey)),
    getCountFromServer(collection(db,'analytics_daily',dateKey,'visitors')).catch(()=>({data:()=>({count:0})})),
    getDocs(collection(db,'analytics_daily',dateKey,'pages')).catch(()=>({docs:[]}))
  ]);
  return {
    dateKey,
    pageViews:dailySnap.exists()?Number(dailySnap.data().pageViews||0):0,
    visitors:Number(visitorCount.data().count||0),
    pages:pageSnap.docs||[]
  };
}

function renderTraffic(days){
  const node=document.querySelector('[data-traffic-chart]');
  const max=Math.max(1,...days.map(x=>x.pageViews));
  node.innerHTML=days.map(x=>`<div class="traffic-day"><div class="traffic-bar-wrap" title="${esc(x.dateKey)} · ${n(x.pageViews)} PV · ${n(x.visitors)}명"><div class="traffic-bar" style="height:${Math.max(3,Math.round(x.pageViews/max*100))}%"></div></div><div class="traffic-label"><strong>${n(x.pageViews)}</strong><span>${dayLabel(x.dateKey)} · ${n(x.visitors)}명</span></div></div>`).join('');
}

function renderServiceUsage(days){
  const counts={};
  Object.values(resultServices).forEach(label=>counts[label]=0);
  days.forEach(day=>day.pages.forEach(s=>{
    const row=s.data();
    const label=resultServices[row.path];
    if(label)counts[label]+=Number(row.pageViews||0);
  }));
  const items=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  const max=Math.max(1,...items.map(x=>x[1]));
  const node=document.querySelector('[data-service-usage]');
  node.innerHTML=items.map(([label,count])=>`<div class="service-row"><span>${esc(label)}</span><div class="service-track"><div class="service-fill" style="width:${count?Math.max(5,Math.round(count/max*100)):0}%"></div></div><strong>${n(count)}</strong></div>`).join('');
}

function renderPages(pageDocs,total){
  const tbody=document.querySelector('[data-page-table]');
  document.querySelector('[data-pages-total]').textContent=`오늘 ${n(total)} PV`;
  const rows=pageDocs.map(s=>s.data()).sort((a,b)=>Number(b.pageViews||0)-Number(a.pageViews||0));
  tbody.innerHTML=rows.length?rows.map(row=>`<tr><td><strong>${esc(row.label||row.path)}</strong></td><td>${esc(row.path||'—')}</td><td class="num">${n(row.pageViews)}</td><td class="num">${total?Math.round(Number(row.pageViews||0)/total*100):0}%</td></tr>`).join(''):'<tr><td colspan="4">오늘 집계된 페이지뷰가 없습니다.</td></tr>';
}

function renderReviews(reviewDocs){
  const node=document.querySelector('[data-review-list]');
  const recent=reviewDocs.slice(0,8);
  node.innerHTML=recent.length?recent.map(s=>{
    const d=s.data();
    return `<article class="admin-review"><div class="admin-review-meta"><span>${esc(d.authorLabel||'익명 회원')} · ${esc(d.service||'정월재')}</span><small>${formatDateTime(d.createdAt)}</small></div><p>${esc(d.content||'')}</p><div class="admin-review-actions"><span class="admin-review-rating">★ ${Number(d.rating||0).toFixed(1)}</span></div></article>`;
  }).join(''):'<p class="admin-caption">아직 등록된 후기가 없습니다.</p>';
}

async function loadDashboard(){
  if(!isUnlocked())return;
  refreshBtn.disabled=true;
  refreshBtn.textContent='집계 중…';
  try{
    const dates=[-6,-5,-4,-3,-2,-1,0].map(seoulDateKey);
    const [reviewSnap,...days]=await Promise.all([
      getDocs(collection(db,'reviews')),
      ...dates.map(loadTrafficDay)
    ]);
    const today=days.at(-1);
    const reviews=[...reviewSnap.docs].sort((a,b)=>(toDate(b.data().createdAt)?.getTime()||0)-(toDate(a.data().createdAt)?.getTime()||0));
    const avg=reviews.length?reviews.reduce((sum,s)=>sum+Number(s.data().rating||0),0)/reviews.length:0;
    const weekPageViews=days.reduce((sum,d)=>sum+d.pageViews,0);
    const weekVisitors=days.reduce((sum,d)=>sum+d.visitors,0);

    document.querySelector('[data-metric-pageviews]').textContent=n(today.pageViews);
    document.querySelector('[data-metric-visitors]').textContent=n(today.visitors);
    document.querySelector('[data-metric-week-pageviews]').textContent=n(weekPageViews);
    document.querySelector('[data-metric-week-visitors]').textContent=n(weekVisitors);
    document.querySelector('[data-metric-reviews]').textContent=n(reviews.length);
    document.querySelector('[data-metric-rating]').textContent=reviews.length?avg.toFixed(1):'—';
    document.querySelector('[data-admin-updated]').textContent=new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date());

    renderTraffic(days);
    renderServiceUsage(days);
    renderPages(today.pages,today.pageViews);
    renderReviews(reviews);
  }catch(error){
    console.error(error);
    document.querySelector('[data-admin-updated]').textContent='집계 실패';
    alert('운영 통계를 불러오지 못했습니다. Firestore Rules가 최신 상태인지 확인해주세요.');
  }finally{
    refreshBtn.disabled=false;
    refreshBtn.textContent='새로고침';
  }
}

refreshBtn?.addEventListener('click',()=>{if(isUnlocked())loadDashboard();});

if(isUnlocked())openDashboard();
else{
  document.body.classList.remove('admin-unlocked');
  gate.hidden=false;
  dashboard.hidden=true;
  setTimeout(()=>passInput?.focus(),50);
}
