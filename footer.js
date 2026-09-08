(()=>{
  const footer=document.querySelector('.site-footer');
  if(!footer) return;
  if(footer.dataset.enhanced==='true' && footer.children.length) return;

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
          <p class="footer-intro">정월재는 오래된 사주명리의 이론을 오늘의 언어로 정돈해 전하는 해석 서비스입니다. 사주팔자와 음양오행을 하나의 공통 기준으로 두고, 기질과 관계, 오늘과 내일의 흐름, 일과 재물, 현실의 고민까지 서로 모순되지 않게 연결해 읽습니다.</p>
          <p class="footer-intro sub">좋은 말만 덧붙이기보다 실제 생활에서 무엇을 확인하고 어떻게 움직이면 좋은지까지 쉬운 말로 정리합니다.</p>
          <div class="footer-service-tags" aria-label="정월재 제공 서비스"><a href="./saju.html">종합 사주</a><a href="./ohaeng.html">오행 분석</a><a href="./fortune.html">오늘의 운세</a><a href="./tomorrow.html">내일의 운세</a><a href="./relationship.html">연애와 인연</a><a href="./work-money.html">일과 재물</a><a href="./guide.html">정월도감</a><a href="./talisman.html">정월부적</a><a href="./lucky-number.html">행운의 숫자</a><a href="./important-day.html">중요한 날</a><a href="./moving-day.html">이사 택일</a><a href="./archive.html">정월록</a></div>
        </section>
        <div class="footer-links-grid">
          <section class="footer-column"><h3>서비스</h3><nav aria-label="푸터 서비스 메뉴"><a href="./saju.html">종합 사주</a><a href="./ohaeng.html">오행 분석</a><a href="./fortune.html">오늘의 운세</a><a href="./tomorrow.html">내일의 운세</a><a href="./relationship.html">연애와 인연</a><a href="./work-money.html">일과 재물</a><a href="./guide.html">정월도감</a><a href="./talisman.html">정월부적</a></nav></section>
          <section class="footer-column"><h3>생활운</h3><nav aria-label="푸터 생활운 메뉴"><a href="./lucky-number.html">행운의 숫자</a><a href="./important-day.html">중요한 날</a><a href="./moving-day.html">이사 택일</a><a href="./archive.html">정월록</a></nav></section>
          <section class="footer-column"><h3>정월재</h3><nav aria-label="푸터 정월재 메뉴"><a href="./reviews.html">후기</a><a href="./about.html">소개</a><a href="./login.html">로그인</a><a href="./signup.html">회원등록</a><a href="./privacy.html">개인정보처리방침</a></nav></section>
        </div>
      </div>
      <div class="footer-bottom"><p class="footer-disclaimer">정월재의 콘텐츠는 전통 명리학 이론과 상징 문화를 바탕으로 한 해석·시각 콘텐츠이며 과학적·의학적·법률적 판단이나 미래 결과, 특정 효험을 보장하지 않습니다. 택일과 숫자 기능은 실제 조건을 대신하지 않는 참고용 콘텐츠입니다.</p><div class="footer-legal"><a href="./privacy.html">개인정보처리방침</a><span>© ${year} JEONGWOLJAE</span></div></div>
    </div>`;
  if(!document.querySelector('script[data-auth-module]')){
    const authScript=document.createElement('script');authScript.type='module';authScript.src='./auth.js?v=20260908-0731';authScript.dataset.authModule='true';document.body.appendChild(authScript);
  }
})();