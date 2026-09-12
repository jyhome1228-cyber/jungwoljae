(()=>{
  const footer=document.querySelector('.site-footer');
  if(!footer) return;

  // Recover transient submit/loading state when a page is restored from the
  // browser back-forward cache. Without this, submitted forms can come back
  // with a disabled aria-busy button or a stale full-screen loader.
  window.addEventListener('pageshow',event=>{
    if(!event.persisted)return;
    document.querySelectorAll('form[data-submitting="true"]').forEach(form=>{
      form.dataset.submitting='false';
      form.querySelectorAll('button[type="submit"][aria-busy="true"],button[type="submit"]:disabled').forEach(button=>{
        button.disabled=false;
        button.removeAttribute('aria-busy');
      });
    });
    document.querySelectorAll('[data-saju-loading],.saju-loading-overlay').forEach(overlay=>{
      overlay.classList.remove('is-visible','is-leaving');
      overlay.hidden=true;
      overlay.setAttribute('hidden','');
      overlay.style.setProperty('display','none','important');
      overlay.style.setProperty('pointer-events','none','important');
    });
    document.body.classList.remove('saju-loading-open','reading-result-pending','menu-open');
    document.documentElement.classList.remove('jw-entry-first','saju-loading-open','reading-result-pending');
    document.body.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('overflow');
    document.querySelectorAll('main[aria-busy="true"]').forEach(main=>main.removeAttribute('aria-busy'));
  });

  // Keep the global cohesion layer that unifies all page geometry.
  if(!document.querySelector('link[data-site-cohesion]')){
    const cohesion=document.createElement('link');
    cohesion.rel='stylesheet';
    cohesion.href='./site-cohesion-v19.css?v=20260911-1545';
    cohesion.dataset.siteCohesion='true';
    document.head.appendChild(cohesion);
  }

  // Homepage final-pass fixes must run after the shared runtime theme files.
  const currentFile=location.pathname.split('/').pop()||'index.html';
  if(currentFile==='index.html' && !document.getElementById('home-hero-contrast-fix')){
    const style=document.createElement('style');
    style.id='home-hero-contrast-fix';
    style.textContent=`
      .home-image-hero .home-image-hero-copy,
      .home-image-hero .home-image-hero-copy .eyebrow,
      .home-image-hero .home-image-hero-copy h1,
      .home-image-hero .home-image-hero-copy > p:not(.eyebrow){
        color:#fff!important;
      }
      .home-image-hero .button.secondary{
        color:#fff!important;
      }

      .home-services .service-visual-card[href="./guide.html"]{
        grid-column:auto!important;
        grid-row:auto!important;
        width:auto!important;
        min-width:0!important;
        background-color:#3a2e2c!important;
        background-image:url('https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260908-101633-996b4914-fc05-4d0f-a690-8f4b684c6a0b-67d8544d.webp')!important;
        background-position:center!important;
        background-size:cover!important;
        background-repeat:no-repeat!important;
      }
      .home-services .service-visual-card[href="./guide.html"]::before{
        background:linear-gradient(to top,rgba(20,12,12,.94) 0%,rgba(20,12,12,.56) 38%,rgba(20,12,12,.14) 72%,rgba(20,12,12,.05) 100%)!important;
      }
      .home-services .service-visual-card[href="./guide.html"]::after{
        content:none!important;
        display:none!important;
      }
    `;
    document.head.appendChild(style);

    const main=document.querySelector('main#main');
    if(main){
      const walker=document.createTreeWalker(main,NodeFilter.SHOW_TEXT);
      const nodes=[];
      let node;
      while((node=walker.nextNode()))nodes.push(node);
      nodes.forEach(textNode=>{
        const before=textNode.nodeValue||'';
        const after=before.replace(/무료로\s*/g,'').replace(/무료\s*/g,'');
        if(after!==before)textNode.nodeValue=after;
      });
      const serviceLabel=main.querySelector('.home-services .section-label');
      if(serviceLabel && serviceLabel.textContent.trim()==='FREE SERVICES')serviceLabel.textContent='SERVICES';
    }

    document.title='오늘의 운세·궁합·오행 | 정월재';
    const setMeta=(selector,value)=>{const el=document.querySelector(selector);if(el)el.setAttribute('content',value);};
    setMeta('meta[name="description"]','정월재에서 오행 분석, 오늘의 운세, 내일의 운세, 궁합, 연애·인연, 일·재물, 택일을 쉽고 차분하게 확인하세요.');
    setMeta('meta[name="keywords"]','정월재,운세,오늘의운세,오늘의 운세,내일의운세,내일의 운세,궁합,사주궁합,오행분석,오행 분석,오행,음양오행,연애운,인연운,재물운,직업운,택일,이사택일');
    setMeta('meta[property="og:title"]','오늘의 운세·궁합·오행 | 정월재');
    setMeta('meta[name="twitter:title"]','오늘의 운세·궁합·오행 | 정월재');
    setMeta('meta[name="twitter:description"]','오행 분석과 오늘·내일 운세, 궁합, 재물운, 택일을 확인하세요.');
  }

  // Restore the original branded footer design.
  footer.dataset.enhanced='true';
  const year=new Date().getFullYear();
  footer.innerHTML=`
    <div class="container footer-shell">
      <div class="footer-topline">
        <div class="footer-brand-lockup">
          <span class="footer-symbol-wrap"><img class="footer-symbol" src="./logo.svg" alt="정월재 심볼"></span>
          <div class="footer-name"><strong>정월재</strong><span>JEONGWOLJAE · 正月齋</span></div>
        </div>
        <p class="footer-tagline">삶의 흐름을 읽는 곳.</p>
      </div>

      <div class="footer-main">
        <section class="footer-identity" aria-label="정월재 소개">
          <p class="footer-intro">정월재는 오래된 명리의 기준을 오늘의 언어로 정돈해 전하는 해석 서비스입니다. 오행과 오늘·내일의 흐름, 관계, 궁합, 일과 재물, 현실의 고민까지 하나의 기준으로 이어서 읽습니다.</p>
          <p class="footer-intro sub">어려운 용어보다 실제 생활에서 이해하기 쉬운 말과 행동 기준으로 정리합니다.</p>
          <div class="footer-service-tags" aria-label="정월재 제공 서비스">
            <a href="./ohaeng.html">오행 분석</a><a href="./fortune.html">오늘의 운세</a><a href="./tomorrow.html">내일의 운세</a><a href="./relationship.html">연애와 인연</a><a href="./compatibility.html">궁합</a><a href="./work-money.html">일과 재물</a><a href="./guide.html">정월도감</a><a href="./talisman.html">정월부적</a><a href="./lucky-number.html">행운의 숫자</a><a href="./important-day.html">중요한 날</a><a href="./moving-day.html">이사 택일</a><a href="./archive.html">정월록</a>
          </div>
        </section>

        <div class="footer-links-grid">
          <section class="footer-column"><h3>서비스</h3><nav aria-label="푸터 서비스 메뉴"><a href="./ohaeng.html">오행 분석</a><a href="./fortune.html">오늘의 운세</a><a href="./tomorrow.html">내일의 운세</a><a href="./relationship.html">연애와 인연</a><a href="./compatibility.html">궁합</a><a href="./work-money.html">일과 재물</a><a href="./guide.html">정월도감</a><a href="./talisman.html">정월부적</a></nav></section>
          <section class="footer-column"><h3>생활운</h3><nav aria-label="푸터 생활운 메뉴"><a href="./lucky-number.html">행운의 숫자</a><a href="./important-day.html">중요한 날</a><a href="./moving-day.html">이사 택일</a><a href="./archive.html">정월록</a></nav></section>
          <section class="footer-column"><h3>정월재</h3><nav aria-label="푸터 정월재 메뉴"><a href="./reviews.html">후기</a><a href="./about.html">소개</a><a href="./login.html">로그인</a><a href="./signup.html">회원등록</a><a href="./privacy.html">개인정보처리방침</a></nav></section>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-disclaimer">정월재의 콘텐츠는 전통 명리학 이론과 상징 문화를 바탕으로 한 해석·시각 콘텐츠이며 과학적·의학적·법률적 판단이나 미래 결과, 특정 효험을 보장하지 않습니다. 택일과 숫자 기능은 실제 조건을 대신하지 않는 참고용 콘텐츠입니다.</p>
        <div class="footer-legal"><span>대표자 박재영</span><a href="./privacy.html">개인정보처리방침</a><span>© ${year} JEONGWOLJAE</span></div>
      </div>
    </div>`;

  // Explicit guard so the restored footer cannot be flattened by later global styles.
  if(!document.getElementById('footer-restore-guard')){
    const style=document.createElement('style');
    style.id='footer-restore-guard';
    style.textContent=`
      .site-footer{display:block!important;visibility:visible!important;opacity:1!important;margin-top:88px!important;padding:0!important;background:#543a3a!important;color:#fff!important;border-top:0!important}
      .site-footer .footer-shell{display:block!important}
      @media(max-width:1023px){.site-footer{margin-top:72px!important}}
      @media(max-width:767px){.site-footer{margin-top:60px!important}}
    `;
    document.head.appendChild(style);
  }
})();