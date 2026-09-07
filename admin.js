import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getFirestore, doc, getDoc, getDocs, collection, getCountFromServer } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const fixCss=document.createElement('link');
fixCss.rel='stylesheet';
fixCss.href='./admin-fix.css?v=20260907-2130';
document.head.appendChild(fixCss);

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

function ensureSyncUi(){
  let row=document.querySelector('[data-admin-sync-row]');
  if(row)return row;
  const updated=document.querySelector('.admin-updated');
  if(!updated)return null;
  row=document.createElement('div');
  row.className='admin-sync-row';
  row.dataset.adminSyncRow='true';
  row.innerHTML=`<span class="admin-sync-pill" data-admin-sync-pill>Firebase 확인 중</span><span class="admin-sync-detail" data-admin-sync-detail>${esc(firebaseConfig.projectId||'Firebase')}</span>`;
  updated.insertAdjacentElement('afterend',row);
  return row;
}
function setSync(state,label,detail=''){
  ensureSyncUi();
  const pill=document.querySelector('[data-admin-sync-pill]');
  const detailNode=document.querySelector('[data-admin-sync-detail]');
  if(pill){pill.dataset.state=state;pill.textContent=label;}
  if(detailNode)detailNode.textContent=detail||firebaseConfig.projectId||'';
}
ensureSyncUi();

function isUnlocked(){
  try{return sessionStorage.getItem(SESSION_KEY)==='1';}catch(e){return false;}
}
function setUnlocked(value){
  try{if(value)sessionStorage.setItem(SESSION_KEY,'1');else sessionStorage.removeItem(SESSION_KEY);}catch(e){}
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
  if(value!==ADMIN_CODE){passStatus.textContent='운영 코드가 맞지 않습니다.';passInput.select();return;}
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

async function visitorCount(dateKey){
  const ref=collection(db,'analytics_daily',dateKey,'visitors');
  try{return Number((await getCountFromServer(ref)).data().count||0);}
  catch(error){
    try{return (await getDocs(ref)).size;}
    catch(fallback){throw fallback;}
  }
}
async function loadTrafficDay(dateKey){
  const dailyRef=doc(db,'analytics_daily',dateKey);
  const pageRef=collection(db,'analytics_daily',dateKey,'pages');
  const [dailySnap,visitors,pageSnap]=await Promise.all([
    getDoc(dailyRef),
    visitorCount(dateKey),
    getDocs(pageRef)
  ]);
  return {dateKey,pageViews:dailySnap.exists()?Number(dailySnap.data().pageViews||0):0,visitors:Number(visitors||0),pages:pageSnap.docs||[]};
}

function renderTraffic(days){
  const node=document.querySelector('[data-traffic-chart]');
  const max=Math.max(1,...days.map(x=>x.pageViews));
  const hasData=days.some(x=>x.pageViews||x.visitors);
  node.innerHTML=hasData?days.map(x=>`<div class="traffic-day"><div class="traffic-bar-wrap" title="${esc(x.dateKey)} · ${n(x.pageViews)} PV · ${n(x.visitors)}명"><div class="traffic-bar" style="height:${Math.max(3,Math.round(x.pageViews/max*100))}%"></div></div><div class="traffic-label"><strong>${n(x.pageViews)}</strong><span>${dayLabel(x.dateKey)} · ${n(x.visitors)}명</span></div></div>`).join(''):`<div class="admin-data-empty" style="grid-column:1/-1"><strong>아직 방문 데이터가 없습니다.</strong>analytics.js 적용 이후 실제 방문부터 날짜별로 누적됩니다. 사이트 메인과 서비스 페이지를 한 번 열어본 뒤 새로고침해보세요.</div>`;
}

function renderServiceUsage(days){
  const counts={};Object.values(resultServices).forEach(label=>counts[label]=0);
  days.forEach(day=>day.pages.forEach(s=>{const row=s.data();const label=resultServices[row.path];if(label)counts[label]+=Number(row.pageViews||0);}));
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
  node.innerHTML=recent.length?recent.map(s=>{const d=s.data();return `<article class="admin-review"><div class="admin-review-meta"><span>${esc(d.authorLabel||'익명 회원')} · ${esc(d.service||'정월재')}</span><small>${formatDateTime(d.createdAt)}</small></div><p>${esc(d.content||'')}</p><div class="admin-review-actions"><span class="admin-review-rating">★ ${Number(d.rating||0).toFixed(1)}</span></div></article>`;}).join(''):'<p class="admin-caption">아직 등록된 후기가 없습니다.</p>';
}

function firestoreHint(error){
  const code=String(error?.code||error?.message||'');
  if(code.includes('permission-denied'))return 'Firestore Rules 최신본을 Firebase 콘솔에서 게시해야 합니다.';
  if(code.includes('unavailable'))return 'Firebase 연결이 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요.';
  return 'Firebase 프로젝트와 Firestore 상태를 확인해주세요.';
}

async function loadDashboard(){
  if(!isUnlocked())return;
  refreshBtn.disabled=true;refreshBtn.textContent='집계 중…';
  setSync('','Firebase 연결 중',firebaseConfig.projectId||'');
  try{
    const dates=[-6,-5,-4,-3,-2,-1,0].map(seoulDateKey);
    const reviewPromise=getDocs(collection(db,'reviews'));
    const trafficPromise=Promise.all(dates.map(loadTrafficDay));
    const [reviewSnap,days]=await Promise.all([reviewPromise,trafficPromise]);
    const today=days.at(-1);
    const reviews=[...reviewSnap.docs].sort((a,b)=>(toDate(b.data().createdAt)?.getTime()||0)-(toDate(a.data().createdAt)?.getTime()||0));
    const avg=reviews.length?reviews.reduce((sum,s)=>sum+Number(s.data().rating||0),0)/reviews.length:0;
    const weekPageViews=days.reduce((sum,d)=>sum+d.pageViews,0),weekVisitors=days.reduce((sum,d)=>sum+d.visitors,0);

    document.querySelector('[data-metric-pageviews]').textContent=n(today.pageViews);
    document.querySelector('[data-metric-visitors]').textContent=n(today.visitors);
    document.querySelector('[data-metric-week-pageviews]').textContent=n(weekPageViews);
    document.querySelector('[data-metric-week-visitors]').textContent=n(weekVisitors);
    document.querySelector('[data-metric-reviews]').textContent=n(reviews.length);
    document.querySelector('[data-metric-rating]').textContent=reviews.length?avg.toFixed(1):'—';
    document.querySelector('[data-admin-updated]').textContent=new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date());

    renderTraffic(days);renderServiceUsage(days);renderPages(today.pages,today.pageViews);renderReviews(reviews);
    const anyTraffic=weekPageViews>0||weekVisitors>0;
    setSync('ok',anyTraffic?'Firebase 연동 정상':'Firebase 연결 정상 · 집계 대기',`${firebaseConfig.projectId} · ${seoulDateKey()}`);
  }catch(error){
    console.error('[Jungwoljae Admin]',error);
    document.querySelector('[data-admin-updated]').textContent='집계 실패';
    setSync('warn','데이터 읽기 실패',firestoreHint(error));
    const traffic=document.querySelector('[data-traffic-chart]');
    if(traffic)traffic.innerHTML=`<div class="admin-data-empty" style="grid-column:1/-1"><strong>Firebase 데이터를 읽지 못했습니다.</strong>${esc(firestoreHint(error))}</div>`;
  }finally{refreshBtn.disabled=false;refreshBtn.textContent='새로고침';}
}

refreshBtn?.addEventListener('click',()=>{if(isUnlocked())loadDashboard();});

if(isUnlocked())openDashboard();
else{
  document.body.classList.remove('admin-unlocked');
  gate.hidden=false;dashboard.hidden=true;
  setTimeout(()=>passInput?.focus(),50);
}
