import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

(()=>{
  if(document.body.dataset.reviewsPage!=='true')return;

  const app=getApps().length?getApp():initializeApp(firebaseConfig);
  const db=getFirestore(app);
  const PAGE_SIZE=12;
  const grid=document.querySelector('[data-review-grid]');
  const countNode=document.querySelector('[data-review-count]');
  const avgNode=document.querySelector('[data-review-average]');
  const pageNode=document.querySelector('[data-review-page]');
  const filter=document.querySelector('[data-review-filter]');
  const prev=document.querySelector('[data-review-prev]');
  const next=document.querySelector('[data-review-next]');
  const pagination=document.querySelector('.review-pagination');
  if(!grid||!countNode||!avgNode)return;

  let page=1;
  let items=[];

  const esc=(value='')=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const stars=rating=>'★'.repeat(Number(rating)||0)+'☆'.repeat(5-(Number(rating)||0));
  const formatDate=value=>{try{const date=value?.toDate?value.toDate():value?new Date(value):null;if(!date)return '';return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).format(date).replace(/\s/g,'');}catch(e){return '';}};
  const average=list=>list.length?list.reduce((sum,item)=>sum+Number(item.rating||0),0)/list.length:0;
  const cardMarkup=review=>`<article class="review-entry"><div class="review-entry-top"><span class="review-stars" aria-label="${Number(review.rating)||0}점">${stars(review.rating)}</span><span class="review-badge">${esc(review.service||'정월재')}</span></div><p>${esc(review.content||'')}</p><div class="review-entry-meta"><span class="review-entry-user">${esc(review.authorLabel||'정월재 회원')} · ${esc(review.service||'정월재')}</span><span>${esc(formatDate(review.createdAt))}</span></div></article>`;

  function filteredItems(){
    const value=filter?.value||'all';
    return value==='all'?items:items.filter(item=>item.service===value);
  }

  function render(){
    const list=filteredItems();
    const pages=Math.max(1,Math.ceil(list.length/PAGE_SIZE));
    page=Math.min(Math.max(1,page),pages);
    const start=(page-1)*PAGE_SIZE;
    const visible=list.slice(start,start+PAGE_SIZE);

    countNode.textContent=String(list.length);
    avgNode.textContent=list.length?average(list).toFixed(1):'—';

    if(visible.length){
      grid.innerHTML=visible.map(cardMarkup).join('');
    }else{
      grid.innerHTML='<div class="review-empty"><strong>아직 등록된 후기가 없습니다.</strong><p>정월재를 이용한 뒤 첫 후기를 남겨주세요.</p></div>';
    }

    if(pageNode)pageNode.textContent=`${page} / ${pages}`;
    if(prev)prev.disabled=page<=1;
    if(next)next.disabled=page>=pages;
    if(pagination)pagination.hidden=pages<=1;
  }

  filter?.addEventListener('change',event=>{event.stopImmediatePropagation();page=1;render();},true);
  prev?.addEventListener('click',event=>{event.stopImmediatePropagation();if(page>1){page--;render();}},true);
  next?.addEventListener('click',event=>{event.stopImmediatePropagation();const pages=Math.max(1,Math.ceil(filteredItems().length/PAGE_SIZE));if(page<pages){page++;render();}},true);

  const q=query(collection(db,'reviews'),orderBy('createdAt','desc'));
  onSnapshot(q,snap=>{
    items=snap.docs.map(d=>({id:d.id,...d.data()})).filter(item=>item.status!=='hidden');
    render();
  },()=>{
    items=[];
    render();
  });
})();
