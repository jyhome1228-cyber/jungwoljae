import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

localStorage.removeItem('jw_review_local_v1');

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);const db=getFirestore(app);
const PAGE_SIZE=6;
let currentUser=null;let currentProfile=null;

const stars=rating=>'★'.repeat(Number(rating)||0)+'☆'.repeat(5-(Number(rating)||0));
const esc=(value='')=>String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
function average(items){return items.length?items.reduce((sum,item)=>sum+Number(item.rating||0),0)/items.length:0;}
function formatDate(value){
  try{const date=value?.toDate?value.toDate():value?new Date(value):null;if(!date)return '방금';return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).format(date).replace(/\s/g,'');}catch(e){return '방금';}
}
function anonymousLabel(profile){
  const year=String(profile?.birthDate||'').slice(2,4);
  const gender=profile?.gender==='male'?'남성':profile?.gender==='female'?'여성':'회원';
  return year?`${year}년생 ${gender}`:`정월재 ${gender}`;
}
function cardMarkup(review){
  return `<article class="review-entry">
    <div class="review-entry-top"><span class="review-stars" aria-label="${Number(review.rating)||0}점">${stars(review.rating)}</span><span class="review-badge">${esc(review.service||'정월재')}</span></div>
    <p>${esc(review.content||'')}</p>
    <div class="review-entry-meta"><span class="review-entry-user">${esc(review.authorLabel||'정월재 회원')} · ${esc(review.service||'정월재')}</span><span>${esc(formatDate(review.createdAt))}</span></div>
  </article>`;
}

async function loadProfile(user){
  if(!user){currentProfile=null;return;}
  try{const snap=await getDoc(doc(db,'users',user.uid));currentProfile=snap.exists()?snap.data():null;}catch(e){currentProfile=null;}
}
onAuthStateChanged(auth,user=>{currentUser=user;loadProfile(user);});

function subscribeReviews(callback,onError){
  const q=query(collection(db,'reviews'),orderBy('createdAt','desc'));
  return onSnapshot(q,snap=>callback(snap.docs.map(d=>({id:d.id,...d.data()}))),onError);
}

function initPage(){
  if(document.body.dataset.reviewsPage!=='true')return;
  const grid=document.querySelector('[data-review-grid]');
  const countNode=document.querySelector('[data-review-count]');
  const avgNode=document.querySelector('[data-review-average]');
  const pageNode=document.querySelector('[data-review-page]');
  const filter=document.querySelector('[data-review-filter]');
  const prev=document.querySelector('[data-review-prev]');
  const next=document.querySelector('[data-review-next]');
  const open=document.querySelector('[data-review-open]');
  const closeButtons=document.querySelectorAll('[data-review-close]');
  const composer=document.querySelector('[data-review-composer]');
  const form=document.querySelector('[data-review-form]');
  const status=document.querySelector('[data-review-status]');
  let page=1,items=[];

  const redraw=()=>{
    const category=filter?.value||'all';
    const filtered=category==='all'?items:items.filter(item=>item.service===category);
    const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
    page=Math.min(page,totalPages);
    const chunk=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
    grid.innerHTML=chunk.length?chunk.map(cardMarkup).join(''):'<div class="review-empty">아직 등록된 후기가 없습니다. 첫 후기를 남겨주세요.</div>';
    countNode.textContent=String(items.length);
    avgNode.textContent=items.length?average(items).toFixed(1):'—';
    pageNode.textContent=`${page} / ${totalPages}`;
    prev.disabled=page<=1;next.disabled=page>=totalPages;
  };

  subscribeReviews(nextItems=>{items=nextItems;redraw();status.textContent='';},error=>{status.textContent='후기를 불러오지 못했습니다. Firestore 규칙을 확인해주세요.';grid.innerHTML='';});
  filter?.addEventListener('change',()=>{page=1;redraw();});
  prev?.addEventListener('click',()=>{if(page>1){page--;redraw();}});
  next?.addEventListener('click',()=>{const category=filter?.value||'all';const filtered=category==='all'?items:items.filter(item=>item.service===category);if(page<Math.max(1,Math.ceil(filtered.length/PAGE_SIZE))){page++;redraw();}});
  open?.addEventListener('click',async()=>{
    if(!currentUser){location.href='./login.html?next=./reviews.html';return;}
    if(!currentProfile)await loadProfile(currentUser);
    composer.hidden=false;composer.scrollIntoView({behavior:'smooth',block:'center'});
  });
  closeButtons.forEach(btn=>btn.addEventListener('click',()=>{composer.hidden=true;}));

  form?.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!currentUser){location.href='./login.html?next=./reviews.html';return;}
    if(!currentProfile)await loadProfile(currentUser);
    const data=new FormData(form);const content=String(data.get('content')||'').trim();const service=String(data.get('service')||'종합 사주');const rating=Number(data.get('rating')||5);
    if(content.length<10){status.textContent='후기는 10자 이상 입력해주세요.';return;}
    const submit=form.querySelector('[type="submit"]');submit.disabled=true;submit.textContent='등록 중…';
    try{
      await addDoc(collection(db,'reviews'),{uid:currentUser.uid,authorLabel:anonymousLabel(currentProfile),service,rating,content,status:'published',createdAt:serverTimestamp()});
      form.reset();composer.hidden=true;status.textContent='후기가 등록되었습니다. 이름은 공개되지 않고 익명 정보로 누적됩니다.';page=1;
    }catch(error){status.textContent='후기를 등록하지 못했습니다. Firestore 규칙이 최신 상태인지 확인해주세요.';}
    finally{submit.disabled=false;submit.textContent='후기 등록하기';}
  });
}

function initPreview(){
  const section=document.querySelector('#reviews');
  if(!section||document.body.dataset.reviewsPage==='true')return;
  subscribeReviews(items=>{
    const preview=items.slice(0,4);
    section.innerHTML=`<div class="container"><div class="section-head center-head"><p class="section-label">REVIEW</p><h2>정월재를 경험한<br>사람들의 기록</h2><p>실제 회원이 남긴 후기만 익명으로 표시됩니다.</p></div><div class="review-overview"><div><span>누적 후기</span><strong>${items.length}</strong><small>실제 등록 데이터</small></div><div><span>평균 평점</span><strong>${items.length?average(items).toFixed(1):'—'}</strong><small>${items.length?stars(Math.round(average(items))):'아직 후기 없음'}</small></div><div><span>후기 등록</span><strong class="review-word">WRITE</strong><small>로그인 회원 작성</small></div></div><div class="review-grid">${preview.length?preview.map(cardMarkup).join(''):'<div class="review-empty">아직 등록된 후기가 없습니다.</div>'}</div><div class="review-preview-actions"><a class="button button-accent" href="./reviews.html">후기 전체보기 · 등록하기</a></div></div>`;
  },()=>{});
}

initPreview();initPage();
