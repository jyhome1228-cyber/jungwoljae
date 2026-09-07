(()=>{
  const footer=document.querySelector('.site-footer');
  if(!footer || footer.dataset.enhanced==='true') return;

  footer.dataset.enhanced='true';
  const year=new Date().getFullYear();
  footer.innerHTML=`
    <div class="container footer-shell">
      <div class="footer-topline">
        <div class="footer-brand-lockup">
          <span class="footer-symbol-wrap"><img class="footer-symbol" src="./logo.svg" alt="정월재 심볼"></span>
          <div class="footer-name">
            <strong>정월재</strong>
            <span>JEONGWOLJAE · 正月齋</span>
          </div>
        </div>
        <p class="footer-tagline">삶의 흐름을 읽는 곳.</p>
      </div>

      <div class="footer-main">
        <section class="footer-identity" aria-label="정월재 소개">
          <p class="footer-intro">정월재는 오래된 사주명리의 이론을 오늘의 언어로 정돈해 전하는 해석 서비스입니다. 사주팔자와 음양오행을 하나의 공통 기준으로 두고, 기질과 관계, 오늘의 흐름, 일과 재물까지 서로 모순되지 않게 연결해 읽습니다.</p>
          <p class="footer-intro sub">좋은 말만 덧붙이기보다 강한 기운과 부족한 기운, 편안한 흐름과 부담이 커지는 시기를 함께 살피며 개인에게 필요한 내용을 차분하게 전달합니다.</p>
          <div class="footer-service-tags" aria-label="정월재 제공 서비스">
            <a href="./saju.html">종합 사주</a>
            <a href="./ohaeng.html">오행 분석</a>
            <a href="./fortune.html">오늘의 운세</a>
            <a href="./relationship.html">연애와 인연</a>
            <a href="./compatibility.html">궁합</a>
            <a href="./work-money.html">일과 재물</a>
            <a href="./archive.html">정월록</a>
          </div>
        </section>

        <div class="footer-links-grid">
          <section class="footer-column">
            <h3>서비스</h3>
            <nav aria-label="푸터 서비스 메뉴">
              <a href="./saju.html">종합 사주</a>
              <a href="./ohaeng.html">오행 분석</a>
              <a href="./fortune.html">오늘의 운세</a>
              <a href="./relationship.html">연애와 인연</a>
              <a href="./compatibility.html">궁합</a>
              <a href="./work-money.html">일과 재물</a>
            </nav>
          </section>

          <section class="footer-column">
            <h3>정월재</h3>
            <nav aria-label="푸터 정월재 메뉴">
              <a href="./archive.html">정월록</a>
              <a href="./reviews.html">후기</a>
              <a href="./about.html">소개</a>
              <a href="./signup.html">회원등록</a>
            </nav>
          </section>

          <section class="footer-column">
            <h3>안내</h3>
            <nav aria-label="푸터 안내 메뉴">
              <a href="./privacy.html">개인정보처리방침</a>
              <a href="./about.html">해석 기준</a>
              <a href="./reviews.html">이용 후기</a>
            </nav>
          </section>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-disclaimer">정월재의 콘텐츠는 전통 명리학 이론을 바탕으로 한 해석 콘텐츠이며 과학적·의학적·법률적 판단이나 미래 결과를 보장하지 않습니다. 입력 정보는 회원관리와 사주·운세 풀이 및 정월록 기록을 위해서만 사용합니다.</p>
        <div class="footer-legal"><a href="./privacy.html">개인정보처리방침</a><span>© ${year} JEONGWOLJAE</span></div>
      </div>
    </div>`;
})();
