import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc, getDocs, collection, getCountFromServer, query, orderBy, limit, where, Timestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const fixCss=document.createElement('link');
fixCss.rel='stylesheet';
fixCss.href='./admin-fix.css?v=20260907-2130';
document.head.appendChild(fixCss);
const readingCss=document.createElement('link');
readingCss.rel='stylesheet';
readingCss.href='./admin-readings.css?v=20260908-0620';
document.head.appendChild(readingCss);

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
const refreshBtn=document.querySelector('[data-admin-refresh]');
const lockBtn=document.querySelector('[data-admin-lock]');
const gate=document.querySelector('[data-admin-auth-gate]');
const gateTitle=document.querySelector('[data-admin-auth-title]');
const gateDescription=document.querySelector('[data-admin-auth-description]');
const gateStatus=document.querySelector('[data-admin-auth-status]');
const loginLink=document.querySelector('[data-admin-login-link]');
const switchAccountBtn=document.querySelector('[data-admin-switch-account]');
const dashboard=document.querySelector('[data-admin-dashboard]');
const readingAuthState=document.querySelector('[data-reading-auth-state]');
const readingPrivateContent=document.querySelector('[data-reading-private-content]');
const readingTable=document.querySelector('[data-reading-table]');
const readingSearch=document.querySelector('[data-reading-search]');
const readingServiceFilter=document.querySelector('[data-reading-service-filter]');
const readingSummary=document.querySelector('[data-reading-summary]');
const readingModal=document.querySelector('[data-reading-modal]');
const readingDetail=document.querySelector('[data-reading-detail]');
let dashboardLoaded=false;
let adminAuthorized=false;
let readingEvents=[];
let readingsLoaded=false;

const esc=(v='')=>String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const toDate=value=>value?.toDate?value.toDate():value?new Date(value):null;
const formatDateTime=value=>{const d=toDate(value);if(!d||Number.isNaN(d.getTime()))return '—';return new Intl.DateTimeFormat('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(d);};
const formatFullDateTime=value=>{const d=toDate(value);if(!d||Number.isNaN(d.getTime()))return '—';return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(d);};
const n=v=>new Intl.NumberFormat('ko-KR').format(Number(v)||0);

const resultServices={
  '/saju-result.html':'종합 사주',
  '/ohaeng-result.html':'오행 분석',
  '/fortune-result.html':'오늘의 운세',
  '/relationship-result.html':'연애와 인연',
  '/compatibility-result.html':'궁합',
  '/work-money-result.html':'일과 재물',
  '/guide-result.html':'정월도감'
};
const readingServiceLabels={saju:'종합 사주',ohaeng:'오행 분석',fortune:'오늘의 운세',relationship:'연애와 인연',compatibility:'궁합','work-money':'일과 재물',guide:'정월도감'};
const genderLabels={male:'남성',female:'여성'};
const focusLabels={personality:'나의 성향',future:'앞으로의 흐름',career:'일·직업',money:'재물',love:'연애와 인연',people:'가족·인간관계',change:'변화·이동',overall:'전체적으로 보기',organization:'조직과 독립',business:'사업과 창업',growth:'수입과 축적'};
const domainLabels={work:'일',money:'돈',love:'연애',people:'사람',change:'변화',mind:'마음',choice:'선택'};

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

function setGate(kind,email=''){
  adminAuthorized=false;
  document.body.classList.remove('admin-unlocked');
  if(dashboard)dashboard.hidden=true;
  if(gate)gate.hidden=false;
  if(loginLink)loginLink.hidden=true;
  if(switchAccountBtn)switchAccountBtn.hidden=true;
  const states={
    checking:['운영 계정 확인 중','Firebase 로그인 상태와 관리자 권한을 확인하고 있습니다.','잠시만 기다려주세요.'],
    login:['운영 계정 로그인이 필요합니다.','정월재 운영 대시보드는 Firebase 관리자 계정으로 로그인한 경우에만 열립니다.',''],
    denied:['관리자 권한이 없는 계정입니다.',email?`${email} 계정은 운영 관리자 목록에 등록되어 있지 않습니다.`:'현재 로그인 계정은 운영 관리자 목록에 등록되어 있지 않습니다.','admins 컬렉션에 등록된 운영 계정으로 다시 로그인해주세요.'],
    error:['관리자 권한을 확인하지 못했습니다.','Firebase 연결 또는 Firestore Rules 상태를 확인해주세요.','잠시 후 다시 시도해주세요.']
  };
  const [title,description,status]=states[kind]||states.error;
  if(gateTitle)gateTitle.textContent=title;
  if(gateDescription)gateDescription.textContent=description;
  if(gateStatus)gateStatus.textContent=status;
  if(kind==='login'&&loginLink)loginLink.hidden=false;
  if(kind==='denied'&&switchAccountBtn)switchAccountBtn.hidden=false;
}

async function openDashboard(){
  if(!adminAuthorized)return;
  if(gate)gate.hidden=true;
  if(dashboard)dashboard.hidden=false;
  document.body.classList.add('admin-unlocked');
  if(!dashboardLoaded){dashboardLoaded=true;await loadDashboard();}
  else if(!readingsLoaded)await loadReadingData();
}

async function doSignOut(){
  try{await signOut(auth);}catch(error){console.error('[Jungwoljae Admin signout]',error);}
  location.href='./login.html?next=./admin.html';
}
lockBtn?.addEventListener('click',doSignOut);
switchAccountBtn?.addEventListener('click',doSignOut);

function seoulDateKey(offsetDays=0){const now=new Date(Date.now()+offsetDays*86400000);const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const get=t=>parts.find(p=>p.type===t)?.value||'';return `${get('year')}-${get('month')}-${get('day')}`;}
function dayLabel(dateKey){const [,m,d]=dateKey.split('-');return `${Number(m)}/${Number(d)}`;}
async function visitorCount(dateKey){const ref=collection(db,'analytics_daily',dateKey,'visitors');try{return Number((await getCountFromServer(ref)).data().count||0);}catch(error){try{return (await getDocs(ref)).size;}catch(fallback){throw fallback;}}}
async function loadTrafficDay(dateKey){const dailyRef=doc(db,'analytics_daily',dateKey);const pageRef=collection(db,'analytics_daily',dateKey,'pages');const [dailySnap,visitors,pageSnap]=await Promise.all([getDoc(dailyRef),visitorCount(dateKey),getDocs(pageRef)]);return {dateKey,pageViews:dailySnap.exists()?Number(dailySnap.data().pageViews||0):0,visitors:Number(visitors||0),pages:pageSnap.docs||[]};}
function renderTraffic(days){const node=document.querySelector('[data-traffic-chart]');if(!node)return;const max=Math.max(1,...days.map(x=>x.pageViews));const hasData=days.some(x=>x.pageViews||x.visitors);node.innerHTML=hasData?days.map(x=>`<div class="traffic-day"><div class="traffic-bar-wrap" title="${esc(x.dateKey)} · ${n(x.pageViews)} PV · ${n(x.visitors)}명"><div class="traffic-bar" style="height:${Math.max(3,Math.round(x.pageViews/max*100))}%"></div></div><div class="traffic-label"><strong>${n(x.pageViews)}</strong><span>${dayLabel(x.dateKey)} · ${n(x.visitors)}명</span></div></div>`).join(''):`<div class="admin-data-empty" style="grid-column:1/-1"><strong>아직 방문 데이터가 없습니다.</strong>analytics.js 적용 이후 실제 방문부터 날짜별로 누적됩니다. 사이트 메인과 서비스 페이지를 한 번 열어본 뒤 새로고침해보세요.</div>`;}
function renderServiceUsage(days){const counts={};Object.values(resultServices).forEach(label=>counts[label]=0);days.forEach(day=>day.pages.forEach(s=>{const row=s.data();const label=resultServices[row.path];if(label)counts[label]+=Number(row.pageViews||0);}));const items=Object.entries(counts).sort((a,b)=>b[1]-a[1]);const max=Math.max(1,...items.map(x=>x[1]));const node=document.querySelector('[data-service-usage]');if(!node)return;node.innerHTML=items.map(([label,count])=>`<div class="service-row"><span>${esc(label)}</span><div class="service-track"><div class="service-fill" style="width:${count?Math.max(5,Math.round(count/max*100)):0}%"></div></div><strong>${n(count)}</strong></div>`).join('');}
function renderPages(pageDocs,total){const tbody=document.querySelector('[data-page-table]');const totalNode=document.querySelector('[data-pages-total]');if(totalNode)totalNode.textContent=`오늘 ${n(total)} PV`;if(!tbody)return;const rows=pageDocs.map(s=>s.data()).sort((a,b)=>Number(b.pageViews||0)-Number(a.pageViews||0));tbody.innerHTML=rows.length?rows.map(row=>`<tr><td><strong>${esc(row.label||row.path)}</strong></td><td>${esc(row.path||'—')}</td><td class="num">${n(row.pageViews)}</td><td class="num">${total?Math.round(Number(row.pageViews||0)/total*100):0}%</td></tr>`).join(''):'<tr><td colspan="4">오늘 집계된 페이지뷰가 없습니다.</td></tr>';}
function renderReviews(reviewDocs){const node=document.querySelector('[data-review-list]');if(!node)return;const recent=reviewDocs.slice(0,8);node.innerHTML=recent.length?recent.map(s=>{const d=s.data();return `<article class="admin-review"><div class="admin-review-meta"><span>${esc(d.authorLabel||'익명 회원')} · ${esc(d.service||'정월재')}</span><small>${formatDateTime(d.createdAt)}</small></div><p>${esc(d.content||'')}</p><div class="admin-review-actions"><span class="admin-review-rating">★ ${Number(d.rating||0).toFixed(1)}</span></div></article>`;}).join(''):'<p class="admin-caption">아직 등록된 후기가 없습니다.</p>';}
function firestoreHint(error){const code=String(error?.code||error?.message||'');if(code.includes('permission-denied'))return 'Firestore Rules 최신본을 Firebase 콘솔에서 게시하거나 관리자 권한을 확인해주세요.';if(code.includes('unavailable'))return 'Firebase 연결이 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요.';return 'Firebase 프로젝트와 Firestore 상태를 확인해주세요.';}

function showReadingAuth(kind){
  if(!readingAuthState||!readingPrivateContent)return;
  readingPrivateContent.hidden=true;
  readingAuthState.hidden=false;
  const map={
    checking:['개인정보 영역 확인 중','현재 로그인 계정의 관리자 권한을 확인하고 있습니다.'],
    denied:['현재 계정에는 관리자 권한이 없습니다.','Firebase의 admins 컬렉션에 등록된 운영 계정에서만 분석 이용자 정보를 확인할 수 있습니다.'],
    error:['관리자 권한을 확인하지 못했습니다.','Firebase 연결 또는 Firestore Rules 상태를 확인해주세요.']
  };
  const [title,desc]=map[kind]||map.error;
  readingAuthState.innerHTML=`<strong>${title}</strong><p>${desc}</p>`;
}

async function resolveAdmin(user){
  adminAuthorized=false;
  readingsLoaded=false;
  const todayMetric=document.querySelector('[data-metric-readings-today]');
  const totalMetric=document.querySelector('[data-metric-readings-total]');
  if(todayMetric)todayMetric.textContent='—';
  if(totalMetric)totalMetric.textContent='—';
  if(!user){setGate('login');return;}
  setGate('checking',user.email||'');
  showReadingAuth('checking');
  try{
    const snap=await getDoc(doc(db,'admins',user.uid));
    if(!snap.exists()){showReadingAuth('denied');setGate('denied',user.email||'');return;}
    adminAuthorized=true;
    if(readingAuthState)readingAuthState.hidden=true;
    if(readingPrivateContent)readingPrivateContent.hidden=false;
    await openDashboard();
  }catch(error){
    console.error('[Jungwoljae Admin auth]',error);
    showReadingAuth('error');
    setGate('error',user.email||'');
  }
}
onAuthStateChanged(auth,resolveAdmin);

function seoulDayBounds(){const key=seoulDateKey();const start=new Date(`${key}T00:00:00+09:00`);const end=new Date(start.getTime()+86400000);return [Timestamp.fromDate(start),Timestamp.fromDate(end)];}
function readingBirthTime(d){return d.birthTimeUnknown?'모름':(d.birthTime||'—');}
function readingGender(d){return genderLabels[d.gender]||'—';}
function readingMember(d){return d.uid?'회원':'비회원';}
function renderReadingTable(){
  if(!readingTable)return;
  const keyword=String(readingSearch?.value||'').trim().toLowerCase();
  const service=readingServiceFilter?.value||'';
  const filtered=readingEvents.filter(row=>{
    if(service&&row.service!==service)return false;
    if(!keyword)return true;
    return [row.name,row.birthDate,row.city,row.serviceLabel,readingServiceLabels[row.service],row.partnerName].some(v=>String(v||'').toLowerCase().includes(keyword));
  });
  if(readingSummary)readingSummary.textContent=`최근 ${n(readingEvents.length)}건 중 ${n(filtered.length)}건 표시`;
  readingTable.innerHTML=filtered.length?filtered.map(d=>`<tr>
    <td><strong>${esc(formatFullDateTime(d.createdAt))}</strong></td>
    <td><span class="reading-service">${esc(d.serviceLabel||readingServiceLabels[d.service]||d.service)}</span></td>
    <td><strong>${esc(d.name||'—')}</strong>${d.partnerName?`<small>상대 ${esc(d.partnerName)}</small>`:''}</td>
    <td>${esc(d.birthDate||'—')}</td>
    <td>${esc(readingBirthTime(d))}</td>
    <td>${esc(readingGender(d))}</td>
    <td>${esc(d.city||'—')}</td>
    <td><span class="reading-member ${d.uid?'member':''}">${readingMember(d)}</span></td>
    <td><button type="button" class="reading-detail-button" data-reading-detail-id="${esc(d.id)}">상세</button></td>
  </tr>`).join(''):'<tr><td colspan="9">조건에 맞는 분석 기록이 없습니다.</td></tr>';
}

async function loadReadingData(){
  if(!adminAuthorized)return;
  if(readingPrivateContent)readingPrivateContent.hidden=false;
  if(readingAuthState)readingAuthState.hidden=true;
  if(readingTable)readingTable.innerHTML='<tr><td colspan="9">분석 기록을 불러오는 중…</td></tr>';
  try{
    const ref=collection(db,'reading_events');
    const [start,end]=seoulDayBounds();
    const recentQuery=query(ref,orderBy('createdAt','desc'),limit(200));
    const todayQuery=query(ref,where('createdAt','>=',start),where('createdAt','<',end));
    const [recentSnap,totalSnap,todaySnap]=await Promise.all([getDocs(recentQuery),getCountFromServer(ref),getCountFromServer(todayQuery)]);
    readingEvents=recentSnap.docs.map(s=>({id:s.id,...s.data()}));
    const todayMetric=document.querySelector('[data-metric-readings-today]');
    const totalMetric=document.querySelector('[data-metric-readings-total]');
    if(todayMetric)todayMetric.textContent=n(todaySnap.data().count||0);
    if(totalMetric)totalMetric.textContent=n(totalSnap.data().count||0);
    readingsLoaded=true;
    renderReadingTable();
  }catch(error){
    console.error('[Jungwoljae Admin readings]',error);
    readingsLoaded=false;
    if(readingTable)readingTable.innerHTML=`<tr><td colspan="9">${esc(firestoreHint(error))}</td></tr>`;
    if(readingSummary)readingSummary.textContent='분석 기록을 불러오지 못했습니다.';
  }
}

function detailItem(label,value,full=false){return `<div class="admin-reading-detail-item${full?' full':''}"><span>${esc(label)}</span><strong>${esc(value||'—')}</strong></div>`;}
async function openReadingDetail(id){
  const d=readingEvents.find(x=>x.id===id);if(!d||!readingModal||!readingDetail||!adminAuthorized)return;
  readingModal.hidden=false;document.body.style.overflow='hidden';
  readingDetail.innerHTML='<div class="admin-reading-detail-loading">상세 정보를 불러오는 중…</div>';
  let member=null;
  if(d.uid){try{const snap=await getDoc(doc(db,'users',d.uid));if(snap.exists())member=snap.data();}catch(e){}}
  const focus=(d.focus||[]).map(k=>focusLabels[k]||k).join(' · ');
  const blockers=(d.blockers||[]).join(' · ');
  const domain=domainLabels[d.domain]||d.domain||'';
  const rows=[
    detailItem('이용 일시',formatFullDateTime(d.createdAt)),
    detailItem('서비스',d.serviceLabel||readingServiceLabels[d.service]||d.service),
    detailItem('이름',d.name||member?.name||'—'),
    detailItem('회원 구분',readingMember(d)),
    detailItem('생년월일',d.birthDate),
    detailItem('출생시간',readingBirthTime(d)),
    detailItem('달력 기준',d.calendarType==='lunar'?'음력':'양력'),
    detailItem('성별',readingGender(d)),
    detailItem('출생 지역',d.city),
    detailItem('회원 아이디',member?.userId||'—'),
    detailItem('회원 이메일',member?.email||'—',true)
  ];
  if(focus)rows.push(detailItem('관심 영역',focus,true));
  if(domain)rows.push(detailItem('정월도감 고민 영역',domain,true));
  if(d.situation)rows.push(detailItem('정월도감 상황 코드',d.situation,true));
  if(blockers)rows.push(detailItem('정월도감 걸리는 이유',blockers,true));
  if(d.partnerName||d.partnerBirthDate)rows.push(detailItem('궁합 상대 정보',[d.partnerName,d.partnerBirthDate].filter(Boolean).join(' · '),true));
  rows.push('<p class="admin-reading-detail-note">분석 기록은 사용자가 결과 화면까지 진행한 시점에 저장됩니다. 새로고침으로 같은 입력을 다시 여는 경우에는 같은 브라우저 세션 안에서 중복 기록을 줄이도록 처리했습니다.</p>');
  readingDetail.innerHTML=rows.join('');
}
function closeReadingModal(){if(!readingModal)return;readingModal.hidden=true;document.body.style.overflow='';}
readingSearch?.addEventListener('input',renderReadingTable);
readingServiceFilter?.addEventListener('change',renderReadingTable);
document.addEventListener('click',event=>{const detail=event.target.closest('[data-reading-detail-id]');if(detail){openReadingDetail(detail.dataset.readingDetailId);return;}if(event.target.closest('[data-reading-modal-close]'))closeReadingModal();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!readingModal?.hidden)closeReadingModal();});

async function loadDashboard(){
  if(!adminAuthorized)return;
  if(refreshBtn){refreshBtn.disabled=true;refreshBtn.textContent='집계 중…';}
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
    const setMetric=(selector,value)=>{const el=document.querySelector(selector);if(el)el.textContent=value;};
    setMetric('[data-metric-pageviews]',n(today.pageViews));
    setMetric('[data-metric-visitors]',n(today.visitors));
    setMetric('[data-metric-week-pageviews]',n(weekPageViews));
    setMetric('[data-metric-week-visitors]',n(weekVisitors));
    setMetric('[data-metric-reviews]',n(reviews.length));
    setMetric('[data-metric-rating]',reviews.length?avg.toFixed(1):'—');
    const updated=document.querySelector('[data-admin-updated]');
    if(updated)updated.textContent=new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date());
    renderTraffic(days);renderServiceUsage(days);renderPages(today.pages,today.pageViews);renderReviews(reviews);
    const anyTraffic=weekPageViews>0||weekVisitors>0;
    setSync('ok',anyTraffic?'Firebase 연동 정상':'Firebase 연결 정상 · 집계 대기',`${firebaseConfig.projectId} · ${seoulDateKey()}`);
    await loadReadingData();
  }catch(error){
    console.error('[Jungwoljae Admin]',error);
    const updated=document.querySelector('[data-admin-updated]');
    if(updated)updated.textContent='집계 실패';
    setSync('warn','데이터 읽기 실패',firestoreHint(error));
    const traffic=document.querySelector('[data-traffic-chart]');
    if(traffic)traffic.innerHTML=`<div class="admin-data-empty" style="grid-column:1/-1"><strong>Firebase 데이터를 읽지 못했습니다.</strong>${esc(firestoreHint(error))}</div>`;
  }finally{
    if(refreshBtn){refreshBtn.disabled=false;refreshBtn.textContent='새로고침';}
  }
}
refreshBtn?.addEventListener('click',async()=>{if(!adminAuthorized)return;readingsLoaded=false;await loadDashboard();});

setGate('checking');
