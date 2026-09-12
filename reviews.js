import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const db=getFirestore(app);
const auth=getAuth(app);
const PAGE_SIZE=12;
const ALLOWED_SERVICES=new Set([
  '오행 분석','오늘의 운세','내일의 운세','연애와 인연','궁합','일과 재물',
  '정월도감','정월부적','행운의 숫자','중요한 날','이사 택일'
]);

const stars=rating=>'★'.repeat(Number(rating)||0)+'☆'.repeat(5-(Number(rating)||0));
const esc=(value='')=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]));
const average=items=>items.length?items.reduce((sum,item)=>sum+Number(item.rating||0),0)/items.length:0;

function formatDate(value){
  try{
    const date=value?.toDate?value.toDate():value?new Date(value):null;
    if(!date)return '방금';
    return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).format(date).replace(/\s/g,'');
  }catch(e){return '방금';}
}

function cardMarkup(review){
  const rating=Math.min(5,Math.max(1,Number(review.rating)||5));
  const service=ALLOWED_SERVICES.has(review.service)?review.service:'정월재';
  return `<article class="review-entry"><div class="review-entry-top"><span class="review-stars" aria-label="${rating}점">${stars(rating)}</span><span class="review-badge">${esc(service)}</span></div><p>${esc(review.content||'')}</p><div class="review-entry-meta"><span class="review-entry-user">${esc(review.authorLabel||'익명 사용자')} · ${esc(service)}</span><span>${esc(formatDate(review.createdAt))}</span></div></article>`;
}

function subscribeReviews(callback,onError){
  const q=query(collection(db,'reviews'),orderBy('createdAt','desc'));
  return onSnapshot(q,snap=>{
    const items=snap.docs
      .map(d=>({id:d.id,...d.data()}))
      .filter(item=>item.status!=='hidden'&&ALLOWED_SERVICES.has(item.service));
    callback(items);
  },error=>onError?.(error));
}

async function getPublicReviewUid(){
  if(auth.currentUser)return auth.currentUser.uid;
  try{
    const credential=await signInAnonymously(auth);
    return credential.user.uid;
  }catch(error){
    return null;
  }
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
  const pagination=document.querySelector('.review-pagination');
  const serviceSelect=form?.querySelector('#review-service');
  if(!grid)return;

  const params=new URLSearchParams(location.search);
  const requestedService=String(params.get('service')||'').trim();
  const shouldOpen=params.get('write')==='1'||params.get('open')==='1';
  const hasRequestedService=ALLOWED_SERVICES.has(requestedService);
  if(hasRequestedService&&serviceSelect)serviceSelect.value=requestedService;
  if(hasRequestedService&&filter)filter.value=requestedService;

  let page=1;
  let items=[];

  const filteredItems=()=>{
    const category=filter?.value||'all';
    return category==='all'?items:items.filter(item=>item.service===category);
  };

  const emptyMarkup=()=>{
    const category=filter?.value||'all';
    const title=category==='all'?'아직 등록된 후기가 없습니다.':`${esc(category)} 후기가 아직 없습니다.`;
    return `<div class="review-empty"><span class="review-empty-mark" aria-hidden="true">正月齋</span><strong>${title}</strong><p>정월재를 이용한 뒤 경험을 남겨주세요.<br>후기는 익명으로 바로 공개됩니다.</p><button class="button button-accent review-empty-button" type="button" data-review-empty-open>첫 후기 남기기</button></div>`;
  };

  const redraw=()=>{
    const filtered=filteredItems();
    const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
    page=Math.min(Math.max(1,page),totalPages);
    const chunk=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);

    grid.innerHTML=chunk.length?chunk.map(cardMarkup).join(''):emptyMarkup();
    grid.dataset.empty=chunk.length?'false':'true';

    if(countNode)countNode.textContent=String(filtered.length);
    if(avgNode)avgNode.textContent=filtered.length?average(filtered).toFixed(1):'—';
    if(pageNode)pageNode.textContent=`${page} / ${totalPages}`;
    if(prev)prev.disabled=page<=1;
    if(next)next.disabled=page>=totalPages;
    if(pagination)pagination.hidden=totalPages<=1;

    grid.querySelector('[data-review-empty-open]')?.addEventListener('click',()=>openComposer());
  };

  subscribeReviews(nextItems=>{
    items=nextItems;
    redraw();
  },()=>{
    items=[];
    redraw();
    if(status)status.textContent='후기 목록을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.';
  });

  filter?.addEventListener('change',()=>{page=1;redraw();});
  prev?.addEventListener('click',()=>{if(page>1){page--;redraw();}});
  next?.addEventListener('click',()=>{
    const totalPages=Math.max(1,Math.ceil(filteredItems().length/PAGE_SIZE));
    if(page<totalPages){page++;redraw();}
  });

  function openComposer(){
    if(!composer)return;
    composer.hidden=false;
    if(hasRequestedService&&serviceSelect)serviceSelect.value=requestedService;
    if(status)status.textContent=hasRequestedService?`${requestedService} 후기를 남겨주세요.`:'';
    composer.scrollIntoView({behavior:'smooth',block:'start'});
    requestAnimationFrame(()=>{
      if(hasRequestedService)document.querySelector('#review-content')?.focus();
      else serviceSelect?.focus();
    });
  }

  open?.addEventListener('click',openComposer);
  if(shouldOpen)setTimeout(openComposer,120);

  closeButtons.forEach(btn=>btn.addEventListener('click',()=>{
    if(composer)composer.hidden=true;
    if(status)status.textContent='';
  }));

  form?.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!status)return;

    const data=new FormData(form);
    const service=String(data.get('service')||'').trim();
    const content=String(data.get('content')||'').trim();
    const rating=Number(data.get('rating')||5);
    const honeypot=String(data.get('website')||'').trim();

    if(honeypot){form.reset();return;}
    if(!ALLOWED_SERVICES.has(service)){
      status.textContent='이용한 서비스를 선택해주세요.';
      document.querySelector('#review-service')?.focus();
      return;
    }
    if(!Number.isInteger(rating)||rating<1||rating>5){
      status.textContent='평점을 다시 선택해주세요.';
      return;
    }
    if(content.length<10){
      status.textContent='후기는 10자 이상 입력해주세요.';
      document.querySelector('#review-content')?.focus();
      return;
    }
    if(content.length>500){
      status.textContent='후기는 500자 이하로 입력해주세요.';
      return;
    }

    const submit=form.querySelector('[type="submit"]');
    if(submit){submit.disabled=true;submit.textContent='등록 중…';}
    status.textContent='후기를 등록하고 있습니다.';

    try{
      const uid=await getPublicReviewUid();
      await addDoc(collection(db,'reviews'),{
        uid:uid||null,
        authorLabel:'익명 사용자',
        service,
        rating,
        content,
        status:'published',
        createdAt:serverTimestamp()
      });
      form.reset();
      if(composer)composer.hidden=true;
      if(filter)filter.value=service;
      status.textContent='후기가 등록되었습니다. 익명으로 바로 공개됩니다.';
      page=1;
    }catch(error){
      console.error('Review submit failed',error);
      status.textContent=error?.code==='permission-denied'
        ?'후기 등록 권한 설정을 확인하는 중입니다. 잠시 후 다시 시도해주세요.'
        :'후기를 등록하지 못했습니다. 잠시 후 다시 시도해주세요.';
    }finally{
      if(submit){submit.disabled=false;submit.textContent='후기 등록하기';}
    }
  });
}

function initPreview(){
  const section=document.querySelector('#reviews');
  if(!section||document.body.dataset.reviewsPage==='true')return;

  subscribeReviews(items=>{
    const preview=items.slice(0,4);
    section.innerHTML=`<div class="container"><div class="section-head center-head"><p class="section-label">REVIEW</p><h2>정월재를 경험한<br>사람들의 기록</h2><p>서비스를 이용한 뒤 남긴 후기를 익명으로 모아봅니다.</p></div><div class="review-overview"><div><span>누적 후기</span><strong>${items.length}</strong><small>실제 등록된 후기</small></div><div><span>평균 평점</span><strong>${items.length?average(items).toFixed(1):'—'}</strong><small>${items.length?stars(Math.round(average(items))):'아직 후기 없음'}</small></div><div><span>후기 등록</span><strong class="review-word">WRITE</strong><small>로그인 없이 작성 가능</small></div></div><div class="review-grid">${preview.length?preview.map(cardMarkup).join(''):'<div class="review-empty">아직 등록된 후기가 없습니다.</div>'}</div><div class="review-preview-actions"><a class="button button-accent" href="./reviews.html">후기 전체보기 · 등록하기</a></div></div>`;
  },()=>{});
}

initPreview();
initPage();
