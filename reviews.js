(() => {
  const STORAGE_KEY = 'jw_review_local_v1';
  const DEMO_MODE = true;
  const PAGE_SIZE = 6;

  const SAMPLE_REVIEWS = [
    {id:'s01',service:'종합 사주',rating:5,name:'90년생 여성',date:'2026.09.07',content:'생각보다 설명이 구체적이고 장점만 말하지 않아서 오히려 이해하기 쉬웠어요.',source:'sample'},
    {id:'s02',service:'오행 분석',rating:5,name:'88년생 남성',date:'2026.09.06',content:'오행이 왜 부족하다고 보는지 구조를 같이 보여줘서 납득하기 편했습니다.',source:'sample'},
    {id:'s03',service:'운의 흐름',rating:4,name:'93년생 여성',date:'2026.09.06',content:'월별 흐름을 한눈에 보기 좋았고 주의할 시기가 따로 보여서 실용적이었어요.',source:'sample'},
    {id:'s04',service:'연애와 인연',rating:4,name:'95년생 여성',date:'2026.09.05',content:'막연하게 잘 된다고 하지 않고 관계에서 반복되는 패턴을 짚어주는 쪽이 좋았습니다.',source:'sample'},
    {id:'s05',service:'궁합',rating:5,name:'91년생 남성',date:'2026.09.05',content:'둘이 잘 맞는 부분뿐 아니라 부딪히기 쉬운 지점까지 같이 나와서 재미있게 봤어요.',source:'sample'},
    {id:'s06',service:'일과 재물',rating:4,name:'87년생 남성',date:'2026.09.04',content:'직업명을 찍어주는 방식이 아니라 일하는 방식과 판단 성향을 설명해줘서 괜찮았습니다.',source:'sample'},
    {id:'s07',service:'종합 사주',rating:5,name:'92년생 여성',date:'2026.09.04',content:'전체 결과가 서로 연결돼 있어서 여러 메뉴를 봐도 말이 크게 바뀌지 않는 점이 좋았어요.',source:'sample'},
    {id:'s08',service:'오행 분석',rating:4,name:'84년생 여성',date:'2026.09.03',content:'강한 기운이 무조건 장점으로만 나오지 않고 과하면 어떤 부담이 생기는지도 보여줍니다.',source:'sample'},
    {id:'s09',service:'운의 흐름',rating:3,name:'96년생 남성',date:'2026.09.03',content:'전체적으로 읽기 편했는데 일별 설명은 조금 더 자세해지면 좋을 것 같아요.',source:'sample'},
    {id:'s10',service:'궁합',rating:5,name:'89년생 여성',date:'2026.09.02',content:'상대방과 저의 차이를 단순 점수보다 문장으로 풀어줘서 더 유용했습니다.',source:'sample'},
    {id:'s11',service:'연애와 인연',rating:4,name:'97년생 여성',date:'2026.09.02',content:'연애운보다 관계 습관을 보는 느낌이라 오히려 부담 없이 볼 수 있었습니다.',source:'sample'},
    {id:'s12',service:'일과 재물',rating:5,name:'85년생 남성',date:'2026.09.01',content:'독립이나 조직 중 어디가 무조건 좋다고 하지 않고 장단점을 같이 설명해줘서 좋았어요.',source:'sample'},
    {id:'s13',service:'종합 사주',rating:4,name:'94년생 남성',date:'2026.09.01',content:'처음 보는 용어가 있었지만 풀이 문장이 어렵지 않아서 끝까지 읽었습니다.',source:'sample'},
    {id:'s14',service:'오행 분석',rating:5,name:'90년생 여성',date:'2026.08.31',content:'결과 화면에서 다섯 기운 비율을 비교하기 쉬워서 제일 기억에 남았습니다.',source:'sample'},
    {id:'s15',service:'운의 흐름',rating:4,name:'86년생 여성',date:'2026.08.31',content:'좋은 시기와 조심할 시기를 같이 보여줘서 너무 낙관적으로 느껴지지 않았어요.',source:'sample'},
    {id:'s16',service:'궁합',rating:3,name:'98년생 남성',date:'2026.08.30',content:'점수만 보는 것보다 설명은 좋았고, 앞으로 항목이 조금 더 늘어나면 좋겠습니다.',source:'sample'},
    {id:'s17',service:'연애와 인연',rating:5,name:'91년생 여성',date:'2026.08.30',content:'상대방 얘기보다 제 쪽의 관계 방식부터 설명하는 구성이 마음에 들었어요.',source:'sample'},
    {id:'s18',service:'일과 재물',rating:4,name:'83년생 남성',date:'2026.08.29',content:'돈이 들어온다는 식이 아니라 소비와 판단 성향을 같이 봐서 부담이 덜했습니다.',source:'sample'},
    {id:'s19',service:'종합 사주',rating:5,name:'99년생 여성',date:'2026.08.29',content:'결과가 길지만 문단 구분이 잘 되어 있어서 필요한 부분만 다시 보기 편했어요.',source:'sample'},
    {id:'s20',service:'오행 분석',rating:4,name:'92년생 남성',date:'2026.08.28',content:'목화토금수 설명이 단순 성격 테스트처럼 끝나지 않고 다른 항목과 이어져 좋았습니다.',source:'sample'},
    {id:'s21',service:'운의 흐름',rating:5,name:'89년생 여성',date:'2026.08.28',content:'월운에서 업무와 관계를 따로 볼 수 있어서 신년운세보다 더 자주 보게 될 것 같아요.',source:'sample'},
    {id:'s22',service:'궁합',rating:4,name:'93년생 여성',date:'2026.08.27',content:'궁합이 높다 낮다보다 왜 편하고 왜 피곤한지를 설명해줘서 재미있었습니다.',source:'sample'},
    {id:'s23',service:'연애와 인연',rating:3,name:'96년생 여성',date:'2026.08.27',content:'내용은 괜찮았고 현재 관계 흐름 쪽이 더 세분화되면 다시 볼 것 같아요.',source:'sample'},
    {id:'s24',service:'일과 재물',rating:5,name:'88년생 남성',date:'2026.08.26',content:'현재 일에서 왜 특정 부분을 힘들어하는지 성향 설명과 연결해서 보니 흥미로웠습니다.',source:'sample'},
    {id:'s25',service:'종합 사주',rating:4,name:'95년생 남성',date:'2026.08.26',content:'예쁜 말만 하지 않고 불편할 수 있는 부분도 적혀 있어서 오히려 신뢰가 갔습니다.',source:'sample'},
    {id:'s26',service:'오행 분석',rating:5,name:'87년생 여성',date:'2026.08.25',content:'같은 오행이라도 강한 정도에 따라 설명이 달라지는 방식이 보기 좋았습니다.',source:'sample'},
    {id:'s27',service:'운의 흐름',rating:4,name:'90년생 남성',date:'2026.08.25',content:'오늘 운세가 랜덤 문구처럼 보이지 않고 기본 사주와 연결되는 점이 좋았어요.',source:'sample'},
    {id:'s28',service:'궁합',rating:5,name:'85년생 여성',date:'2026.08.24',content:'서로 다른 성향을 누가 맞고 틀리다고 하지 않고 조합으로 설명해주는 게 좋았습니다.',source:'sample'},
    {id:'s29',service:'연애와 인연',rating:4,name:'94년생 여성',date:'2026.08.24',content:'결혼 시기를 단정하는 식이 아니라 관계 흐름 중심이라 편하게 볼 수 있었어요.',source:'sample'},
    {id:'s30',service:'일과 재물',rating:4,name:'82년생 남성',date:'2026.08.23',content:'사업운을 단순 성공 여부가 아니라 리스크와 판단 방식까지 같이 설명해줘서 괜찮았습니다.',source:'sample'}
  ];

  function readLocalReviews(){
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')}catch{return []}
  }
  function writeLocalReviews(items){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  /* Firebase 연결 시 아래 store의 list/create 구현만 Firestore로 교체하면 됩니다. */
  const reviewStore = {
    async list(){
      const locals = readLocalReviews();
      return [...locals, ...SAMPLE_REVIEWS];
    },
    async create(review){
      const locals = readLocalReviews();
      const next = [{...review,id:`local-${Date.now()}`,source:'local'},...locals];
      writeLocalReviews(next);
      return next[0];
    }
  };

  const stars = (rating) => '★'.repeat(rating) + '☆'.repeat(5-rating);
  const escapeHtml = (value='') => String(value).replace(/[&<>'"]/g,(ch)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  function average(items){
    if(!items.length) return 0;
    return items.reduce((sum,item)=>sum+Number(item.rating||0),0)/items.length;
  }

  function cardMarkup(review){
    const badge = review.source === 'sample' ? '샘플 데이터' : '브라우저 저장';
    return `<article class="review-entry">
      <div class="review-entry-top"><span class="review-stars" aria-label="${review.rating}점">${stars(review.rating)}</span><span class="review-badge">${badge}</span></div>
      <p>${escapeHtml(review.content)}</p>
      <div class="review-entry-meta"><span class="review-entry-user">${escapeHtml(review.name)} · ${escapeHtml(review.service)}</span><span>${escapeHtml(review.date)}</span></div>
    </article>`;
  }

  async function initPreview(){
    const section = document.querySelector('#reviews');
    if(!section || document.body.dataset.reviewsPage === 'true') return;
    const items = await reviewStore.list();
    const preview = items.slice(0,4);
    section.innerHTML = `<div class="container">
      <div class="section-head center-head">
        <p class="section-label">REVIEW</p>
        <h2>정월재를 먼저 경험한<br>사람들의 기록</h2>
        <p>Firebase 연결 전 UI 검증용 샘플 후기입니다. 실제 오픈 시 실제 이용 후기 데이터로 교체됩니다.</p>
      </div>
      <div class="review-overview">
        <div><span>현재 표시</span><strong>${items.length}</strong><small>샘플 + 이 브라우저 등록</small></div>
        <div><span>샘플 평균</span><strong>${average(items).toFixed(1)}</strong><small>${stars(Math.round(average(items)))}</small></div>
        <div><span>후기 등록</span><strong class="review-word">WRITE</strong><small>Firebase 연결 준비</small></div>
      </div>
      <div class="review-grid">${preview.map(cardMarkup).join('')}</div>
      <div class="review-preview-actions"><a class="button button-accent" href="./reviews.html">후기 전체보기 · 등록하기</a></div>
    </div>`;
  }

  async function initPage(){
    if(document.body.dataset.reviewsPage !== 'true') return;
    const grid = document.querySelector('[data-review-grid]');
    const countNode = document.querySelector('[data-review-count]');
    const avgNode = document.querySelector('[data-review-average]');
    const pageNode = document.querySelector('[data-review-page]');
    const filter = document.querySelector('[data-review-filter]');
    const prev = document.querySelector('[data-review-prev]');
    const next = document.querySelector('[data-review-next]');
    const open = document.querySelector('[data-review-open]');
    const close = document.querySelector('[data-review-close]');
    const composer = document.querySelector('[data-review-composer]');
    const form = document.querySelector('[data-review-form]');
    const status = document.querySelector('[data-review-status]');
    let page = 1;
    let items = await reviewStore.list();

    const redraw = () => {
      const category = filter?.value || 'all';
      const filtered = category === 'all' ? items : items.filter(item=>item.service===category);
      const totalPages = Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
      page = Math.min(page,totalPages);
      const chunk = filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
      grid.innerHTML = chunk.map(cardMarkup).join('');
      countNode.textContent = String(items.length);
      avgNode.textContent = average(items).toFixed(1);
      pageNode.textContent = `${page} / ${totalPages}`;
      prev.disabled = page <= 1;
      next.disabled = page >= totalPages;
    };

    filter?.addEventListener('change',()=>{page=1;redraw()});
    prev?.addEventListener('click',()=>{if(page>1){page--;redraw()}});
    next?.addEventListener('click',()=>{page++;redraw()});
    open?.addEventListener('click',()=>{composer.hidden=false;composer.scrollIntoView({behavior:'smooth',block:'center'})});
    close?.addEventListener('click',()=>{composer.hidden=true});

    form?.addEventListener('submit',async(event)=>{
      event.preventDefault();
      const data = new FormData(form);
      const content = String(data.get('content')||'').trim();
      const name = String(data.get('name')||'').trim();
      const service = String(data.get('service')||'종합 사주');
      const rating = Number(data.get('rating')||5);
      if(name.length < 2 || content.length < 10){
        status.textContent='닉네임은 2자 이상, 후기는 10자 이상 입력해주세요.';
        return;
      }
      const date = new Date().toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\. /g,'.').replace('.','').replace(/\.$/,'');
      await reviewStore.create({name,service,rating,content,date});
      items = await reviewStore.list();
      page = 1;
      redraw();
      form.reset();
      composer.hidden = true;
      status.textContent='이 브라우저에 후기가 저장되었습니다. Firebase 연결 후 Firestore 저장으로 교체됩니다.';
    });

    redraw();
  }

  window.JWReviewStore = reviewStore;
  initPreview();
  initPage();
})();