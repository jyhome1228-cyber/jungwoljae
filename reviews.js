import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

localStorage.removeItem('jw_review_local_v1');

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);const db=getFirestore(app);
const PAGE_SIZE=6;
let currentUser=null;let currentProfile=null;

const SAMPLE_REVIEWS=[
  {id:'sample-01',isSample:true,authorLabel:'90년생 여성',service:'종합 사주',rating:5,content:'막연하게 좋은 말만 나오는 풀이가 아니라 제가 어떤 상황에서 힘을 잘 쓰고 어디서 지치는지 구체적으로 적혀 있어서 이해하기 쉬웠어요. 특히 일과 관계 부분은 평소 제 모습이랑 꽤 닮아 있었습니다.',createdAt:'2026-09-08T09:10:00+09:00'},
  {id:'sample-02',isSample:true,authorLabel:'87년생 남성',service:'종합 사주',rating:4,content:'사주 용어를 많이 몰라도 읽히는 점이 좋았습니다. 직업 쪽에서 실제로 어떤 역할이 맞을 수 있는지 예시를 같이 보여줘서 그냥 성향 설명보다 훨씬 참고하기 편했어요.',createdAt:'2026-09-07T21:20:00+09:00'},
  {id:'sample-03',isSample:true,authorLabel:'94년생 여성',service:'종합 사주',rating:5,content:'제 장점만 말하는 게 아니라 결정이 늦어질 때나 너무 혼자 감당하려는 습관도 같이 짚어줘서 오히려 신뢰가 갔어요. 마지막에 생활에서 어떻게 바꾸면 되는지도 정리가 잘 되어 있었습니다.',createdAt:'2026-09-07T14:05:00+09:00'},
  {id:'sample-04',isSample:true,authorLabel:'91년생 남성',service:'오행 분석',rating:4,content:'목화토금수만 나오면 어려웠을 텐데 시작, 표현, 관리, 판단처럼 풀어줘서 금방 이해됐습니다. 부족한 부분을 무조건 나쁘다고 하지 않고 생활 습관으로 설명한 점이 마음에 들었어요.',createdAt:'2026-09-06T18:30:00+09:00'},
  {id:'sample-05',isSample:true,authorLabel:'96년생 여성',service:'오행 분석',rating:5,content:'제가 왜 생각은 많은데 시작이 늦어지는지 설명을 읽고 좀 납득이 됐어요. 거창한 보완법보다 시작 날짜를 정하라는 식으로 현실적으로 알려줘서 바로 써먹기 좋았습니다.',createdAt:'2026-09-06T12:15:00+09:00'},
  {id:'sample-06',isSample:true,authorLabel:'89년생 여성',service:'오늘의 운세',rating:5,content:'오늘 운세가 그냥 좋다 나쁘다가 아니라 일, 돈, 연락을 어떻게 하면 좋을지 나눠져 있어서 출근 전에 보기 좋네요. 문장이 길지 않고 바로 행동으로 옮길 수 있는 내용이 많았습니다.',createdAt:'2026-09-05T08:40:00+09:00'},
  {id:'sample-07',isSample:true,authorLabel:'92년생 남성',service:'오늘의 운세',rating:4,content:'오전에 할 일과 오후에 미루면 좋은 일을 구분해주는 방식이 생각보다 유용했습니다. 매일 크게 믿는다기보다 하루 일정 정리할 때 참고하는 느낌으로 보기 좋아요.',createdAt:'2026-09-04T22:10:00+09:00'},
  {id:'sample-08',isSample:true,authorLabel:'98년생 여성',service:'내일의 운세',rating:5,content:'밤에 미리 보고 내일 중요한 연락을 오전에 할지 오후에 할지 정해두니 편했어요. 오늘 운세랑 비슷할 줄 알았는데 준비용으로 보는 느낌이라 활용 방식이 달랐습니다.',createdAt:'2026-09-04T19:25:00+09:00'},
  {id:'sample-09',isSample:true,authorLabel:'93년생 여성',service:'연애와 인연',rating:5,content:'연락 속도나 약속, 서운할 때 어떻게 반응하는지처럼 실제 연애에서 겪는 상황으로 설명해줘서 제일 재미있게 읽었습니다. 상대 마음을 맞히는 내용보다 제가 반복하는 패턴을 보는 쪽이라 좋았어요.',createdAt:'2026-09-03T20:50:00+09:00'},
  {id:'sample-10',isSample:true,authorLabel:'88년생 남성',service:'연애와 인연',rating:4,content:'좋은 인연을 막연하게 표현하지 않고 어떤 사람과 있을 때 편한지, 어떤 관계에서 피로가 쌓이는지를 설명해줘서 이해하기 쉬웠습니다. 생각보다 현실적인 내용이 많았어요.',createdAt:'2026-09-03T12:10:00+09:00'},
  {id:'sample-11',isSample:true,authorLabel:'95년생 여성',service:'궁합',rating:4,content:'누가 더 좋고 나쁘다는 식이 아니라 두 사람이 갈등할 때 속도와 표현 방식이 어떻게 다른지 보는 점이 좋았습니다. 서로 왜 답답했는지 설명을 읽으니 조금 이해가 됐어요.',createdAt:'2026-09-02T16:45:00+09:00'},
  {id:'sample-12',isSample:true,authorLabel:'86년생 남성',service:'일과 재물',rating:5,content:'일운이라고 해서 막연할 줄 알았는데 공무원, 기획, 운영 같은 실제 직무 예시가 나와서 좋았습니다. 돈 쪽도 수입보다 고정비와 반복지출을 보라는 식이라 꽤 현실적이었어요.',createdAt:'2026-09-02T10:30:00+09:00'},
  {id:'sample-13',isSample:true,authorLabel:'97년생 여성',service:'일과 재물',rating:5,content:'이직을 고민 중인데 잘 맞는 업무환경과 지치는 환경을 같이 보여줘서 도움됐어요. 직업 하나를 정답처럼 말하지 않고 역할과 업무방식으로 풀어준 게 더 납득됐습니다.',createdAt:'2026-09-01T21:05:00+09:00'},
  {id:'sample-14',isSample:true,authorLabel:'90년생 남성',service:'정월도감',rating:5,content:'고민을 직접 길게 쓰는 게 아니라 선택하면서 좁혀가는 방식이 편했습니다. 이직 고민으로 해봤는데 연봉, 업무시간, 역할처럼 실제로 확인할 항목을 알려줘서 생각 정리에 도움이 됐어요.',createdAt:'2026-09-01T13:15:00+09:00'},
  {id:'sample-15',isSample:true,authorLabel:'99년생 여성',service:'정월도감',rating:4,content:'연애 고민으로 선택해봤는데 사주 풀이보다 상담 질문에 가까운 느낌이라 재밌었어요. 결국 제가 뭘 불편해하고 어떤 기준이 필요한지 정리되는 점이 좋았습니다.',createdAt:'2026-08-31T20:40:00+09:00'},
  {id:'sample-16',isSample:true,authorLabel:'91년생 여성',service:'정월부적',rating:5,content:'효험을 과하게 말하지 않고 오늘 지키고 싶은 마음을 상징으로 고르는 식이라 부담이 없었어요. 이미지도 예뻐서 저장해두고 배경화면처럼 보기 좋습니다.',createdAt:'2026-08-30T17:25:00+09:00'},
  {id:'sample-17',isSample:true,authorLabel:'84년생 남성',service:'행운의 숫자',rating:4,content:'진지한 사주풀이보다는 가볍게 보는 기능이라 재미있었습니다. 같은 날 같은 정보면 같은 숫자가 나온다고 해서 랜덤 느낌이 덜하고 소소하게 참고하기 좋네요.',createdAt:'2026-08-29T11:20:00+09:00'},
  {id:'sample-18',isSample:true,authorLabel:'93년생 남성',service:'중요한 날',rating:5,content:'계약 날짜를 몇 개 중에 정해야 해서 써봤는데 후보일을 순서대로 보여주니 보기 편했습니다. 실제 가능한 날짜를 먼저 정하고 그 안에서 고르게 하는 방식도 현실적이었어요.',createdAt:'2026-08-28T15:10:00+09:00'},
  {id:'sample-19',isSample:true,authorLabel:'97년생 여성',service:'중요한 날',rating:4,content:'면접 날짜가 두 개 가능해서 비교해봤어요. 무조건 이 날이 대박이라는 식이 아니라 목적에 맞는 날을 고른다는 설명이라 부담 없이 참고했습니다.',createdAt:'2026-08-27T09:55:00+09:00'},
  {id:'sample-20',isSample:true,authorLabel:'89년생 남성',service:'이사 택일',rating:5,content:'이사 업체랑 잔금 일정 때문에 가능한 날짜가 몇 개 없었는데 그 안에서 비교해줘서 실용적이었습니다. 추천일뿐 아니라 상대적으로 조심할 날도 같이 보여줘서 선택하기 쉬웠어요.',createdAt:'2026-08-26T18:35:00+09:00'}
];

const stars=rating=>'★'.repeat(Number(rating)||0)+'☆'.repeat(5-(Number(rating)||0));
const esc=(value='')=>String(value).replace(/[&<>'\"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[ch]));
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
  return `<article class="review-entry${review.isSample?' is-sample':''}">
    <div class="review-entry-top"><span class="review-stars" aria-label="${Number(review.rating)||0}점">${stars(review.rating)}</span><span class="review-badge">${esc(review.service||'정월재')}${review.isSample?' · 가안':''}</span></div>
    <p>${esc(review.content||'')}</p>
    <div class="review-entry-meta"><span class="review-entry-user">${esc(review.authorLabel||'정월재 회원')} · ${esc(review.service||'정월재')}</span><span>${esc(formatDate(review.createdAt))}</span></div>
  </article>`;
}
function withSamples(realItems=[]){
  const real=[...realItems];
  const needed=Math.max(0,20-real.length);
  return [...real,...SAMPLE_REVIEWS.slice(0,needed)].sort((a,b)=>new Date(b.createdAt?.toDate?b.createdAt.toDate():b.createdAt||0)-new Date(a.createdAt?.toDate?a.createdAt.toDate():a.createdAt||0));
}

async function loadProfile(user){
  if(!user){currentProfile=null;return;}
  try{const snap=await getDoc(doc(db,'users',user.uid));currentProfile=snap.exists()?snap.data():null;}catch(e){currentProfile=null;}
}
onAuthStateChanged(auth,user=>{currentUser=user;loadProfile(user);});

function subscribeReviews(callback,onError){
  const q=query(collection(db,'reviews'),orderBy('createdAt','desc'));
  return onSnapshot(q,snap=>callback(withSamples(snap.docs.map(d=>({id:d.id,...d.data()})))),error=>{callback(SAMPLE_REVIEWS);onError?.(error);});
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

  subscribeReviews(nextItems=>{items=nextItems;redraw();status.textContent='';},()=>{status.textContent='실제 후기를 불러오지 못해 가안 후기를 표시하고 있습니다.';});
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
    section.innerHTML=`<div class="container"><div class="section-head center-head"><p class="section-label">REVIEW</p><h2>정월재를 경험한<br>사람들의 기록</h2><p>초기 가안 후기와 실제 회원 후기를 함께 익명으로 표시합니다.</p></div><div class="review-overview"><div><span>현재 표시 후기</span><strong>${items.length}</strong><small>실제 후기는 순차적으로 가안 후기를 대체합니다</small></div><div><span>평균 평점</span><strong>${items.length?average(items).toFixed(1):'—'}</strong><small>${items.length?stars(Math.round(average(items))):'아직 후기 없음'}</small></div><div><span>후기 등록</span><strong class="review-word">WRITE</strong><small>로그인 회원 작성</small></div></div><div class="review-grid">${preview.length?preview.map(cardMarkup).join(''):'<div class="review-empty">아직 등록된 후기가 없습니다.</div>'}</div><div class="review-preview-actions"><a class="button button-accent" href="./reviews.html">후기 전체보기 · 등록하기</a></div></div>`;
  },()=>{});
}

initPreview();initPage();
