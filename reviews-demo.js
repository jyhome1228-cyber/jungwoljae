(()=>{
  const params=new URLSearchParams(location.search);
  if(params.get('demo')!=='1')return;

  const DEMO_REVIEWS=[
    ['90년생 여성','오행 분석',5,'설명이 어렵지 않고 바로 이해돼서 좋았어요. 제가 시작은 빠른데 마무리가 느린 이유가 생활 습관처럼 풀려 있어서 재미있게 읽었습니다.'],
    ['96년생 여성','오행 분석',5,'목화토금수만 설명하는 게 아니라 시작력, 표현력처럼 풀어주니까 훨씬 와닿았어요. 결과도 길지 않아서 편하게 봤습니다.'],
    ['88년생 남성','오행 분석',4,'잘하는 부분이랑 놓치기 쉬운 부분을 같이 보여줘서 좋았습니다. 너무 좋은 말만 하지 않는 점이 오히려 더 믿음이 갔어요.'],
    ['92년생 여성','오늘의 운세',5,'아침에 출근하면서 봤는데 오늘 뭘 먼저 하면 좋은지 딱 정리돼 있어서 생각보다 실용적이었어요.'],
    ['89년생 남성','오늘의 운세',5,'좋다 나쁘다가 아니라 일, 돈, 사람으로 나눠서 알려주는 방식이 마음에 들었습니다. 하루 계획 잡을 때 보기 좋아요.'],
    ['97년생 여성','오늘의 운세',4,'문장이 어렵지 않고 바로 행동으로 이어지는 내용이라 좋았어요. 매일 가볍게 보기 괜찮은 것 같습니다.'],
    ['95년생 여성','내일의 운세',5,'밤에 미리 보고 내일 중요한 연락을 언제 할지 정해둘 수 있어서 오늘의 운세랑 또 다른 재미가 있었어요.'],
    ['87년생 남성','내일의 운세',4,'내일 조심할 부분이랑 먼저 해둘 일이 같이 나와서 일정 정리용으로 잘 보고 있습니다.'],
    ['93년생 여성','연애와 인연',5,'제가 연애할 때 왜 비슷한 상황에서 서운해지는지 나와서 좀 놀랐어요. 상대보다 제 패턴을 보는 방식이라 더 재미있었습니다.'],
    ['91년생 남성','연애와 인연',4,'연락 속도나 약속 같은 실제 상황으로 설명돼서 이해하기 쉬웠습니다. 연애운 중에서는 제일 현실적으로 느껴졌어요.'],
    ['98년생 여성','연애와 인연',5,'어떤 사람과 있을 때 편한지 설명한 부분이 제 취향이랑 잘 맞아서 친구한테도 보여줬어요.'],
    ['90년생 여성','궁합',5,'두 사람이 왜 자꾸 같은 문제로 부딪히는지 설명을 읽으니까 조금 이해가 됐어요. 점수만 보여주는 궁합보다 훨씬 재밌습니다.'],
    ['86년생 남성','궁합',4,'잘 맞는 부분과 싸우기 쉬운 부분이 같이 나와서 좋았습니다. 누가 더 좋고 나쁘다는 식이 아니라 부담도 없었어요.'],
    ['94년생 여성','궁합',5,'친구랑 재미로 해봤는데 서로 대화 방식이 다르다는 부분이 너무 비슷해서 한참 이야기했네요.'],
    ['85년생 남성','일과 재물',5,'직업 이름 하나를 찍는 게 아니라 어떤 역할에서 돈이 되는지 알려줘서 좋았습니다. 제 일하는 방식이랑 꽤 잘 맞았어요.'],
    ['97년생 여성','일과 재물',5,'이직 고민 중이라 봤는데 잘 맞는 환경과 피해야 할 환경이 나뉘어 있어서 생각 정리하는 데 도움이 됐습니다.'],
    ['92년생 남성','일과 재물',4,'재물운이 막연하지 않고 돈을 벌고 남기는 방식으로 나와서 오히려 현실적으로 느껴졌어요.'],
    ['89년생 여성','일과 재물',5,'단가, 반복 수입, 지출 습관처럼 구체적인 단어가 나와서 좋았습니다. 그냥 돈 들어온다는 말보다 훨씬 이해하기 쉬웠어요.'],
    ['90년생 남성','정월도감',5,'이직 고민으로 해봤는데 질문을 하나씩 고르다 보니 제가 뭐 때문에 망설이는지 정리가 됐어요.'],
    ['99년생 여성','정월도감',5,'연애 고민을 선택했는데 결과가 사주 풀이보다는 상담처럼 나와서 재밌었습니다. 지금 뭘 해야 할지도 명확했어요.'],
    ['87년생 여성','정월도감',4,'고민을 길게 적지 않아도 돼서 편했고 결과도 어렵지 않았습니다. 선택지가 조금 더 늘어나면 더 좋을 것 같아요.'],
    ['91년생 여성','정월부적',5,'이미지가 예쁘고 너무 무겁지 않아서 좋았어요. 오늘 마음가짐 하나 정하고 저장해두는 느낌으로 쓰고 있습니다.'],
    ['96년생 남성','정월부적',4,'부적이라고 해서 조금 부담스러울 줄 알았는데 디자인이 깔끔해서 생각보다 괜찮았습니다.'],
    ['84년생 남성','행운의 숫자',4,'가볍게 보기 좋은 기능이라 재미있습니다. 숫자만 툭 나오는 게 아니라 간단한 설명도 있어서 좋았어요.'],
    ['98년생 여성','행운의 숫자',5,'친구들이랑 같이 해봤는데 사람마다 다르게 나와서 은근 재미있었어요. 디자인도 예쁩니다.'],
    ['93년생 남성','중요한 날',5,'계약 날짜 후보가 여러 개라 비교해봤는데 한눈에 순서가 보여서 편했습니다.'],
    ['95년생 여성','중요한 날',4,'면접 날짜 고를 때 참고용으로 봤어요. 무조건 좋다고 하기보다 목적에 따라 설명해주는 게 좋았습니다.'],
    ['89년생 남성','이사 택일',5,'이사 가능한 날짜가 많지 않았는데 그 안에서 비교해주니까 실제로 써먹기 좋았습니다.'],
    ['92년생 여성','이사 택일',5,'잔금일이랑 이사 날짜를 같이 고민 중이었는데 후보를 좁히는 데 도움이 됐어요. 화면도 보기 편합니다.'],
    ['88년생 여성','오늘의 운세',5,'전체적으로 사주가 어렵다는 느낌보다 오늘 내가 뭘 하면 되는지 알려주는 느낌이라 자꾸 들어와 보게 되네요.']
  ].map((r,i)=>({id:`demo-${String(i+1).padStart(2,'0')}`,authorLabel:r[0],service:r[1],rating:r[2],content:r[3],createdAt:new Date(Date.now()-i*86400000)}));

  const grid=document.querySelector('[data-review-grid]');
  const count=document.querySelector('[data-review-count]');
  const avg=document.querySelector('[data-review-average]');
  const filter=document.querySelector('[data-review-filter]');
  const prev=document.querySelector('[data-review-prev]');
  const next=document.querySelector('[data-review-next]');
  const pageNode=document.querySelector('[data-review-page]');
  const hero=document.querySelector('.review-page-hero .container');
  if(!grid)return;

  const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
  const fmt=d=>new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).format(d).replace(/\s/g,'');
  const PAGE_SIZE=12;
  let page=1;

  if(hero&&!hero.querySelector('[data-demo-badge]')){
    const badge=document.createElement('span');
    badge.dataset.demoBadge='true';
    badge.textContent='시연 화면 · 더미 데이터';
    badge.style.cssText='display:inline-flex;margin-top:16px;padding:7px 11px;border:1px solid #d9cbc5;border-radius:999px;background:#fff;color:#543a3a;font-size:10px;font-weight:800;line-height:16px;';
    hero.appendChild(badge);
  }

  function visibleItems(){
    const value=filter?.value||'all';
    return value==='all'?DEMO_REVIEWS:DEMO_REVIEWS.filter(r=>r.service===value);
  }
  function card(r){
    return `<article class="review-entry" data-demo-review="true"><div class="review-entry-top"><span class="review-stars" aria-label="${r.rating}점">${stars(r.rating)}</span><span class="review-badge">시연 · ${esc(r.service)}</span></div><p>${esc(r.content)}</p><div class="review-entry-meta"><span class="review-entry-user">${esc(r.authorLabel)} · ${esc(r.service)}</span><span>${esc(fmt(r.createdAt))}</span></div></article>`;
  }
  function render(){
    const items=visibleItems();
    const pages=Math.max(1,Math.ceil(items.length/PAGE_SIZE));
    page=Math.min(page,pages);
    const slice=items.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
    grid.innerHTML=slice.map(card).join('');
    if(count)count.textContent=String(items.length);
    if(avg)avg.textContent=items.length?(items.reduce((s,r)=>s+r.rating,0)/items.length).toFixed(1):'—';
    if(pageNode)pageNode.textContent=`${page} / ${pages}`;
    if(prev)prev.disabled=page<=1;
    if(next)next.disabled=page>=pages;
  }

  filter?.addEventListener('change',e=>{e.stopImmediatePropagation();page=1;render();},true);
  prev?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();if(page>1){page--;render();}},true);
  next?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const pages=Math.max(1,Math.ceil(visibleItems().length/PAGE_SIZE));if(page<pages){page++;render();}},true);

  const observer=new MutationObserver(()=>{
    if(!grid.querySelector('[data-demo-review="true"]'))render();
  });
  observer.observe(grid,{childList:true});
  render();
  [400,1000,1800,3000].forEach(ms=>setTimeout(render,ms));
})();