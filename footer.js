(()=>{
  const footer=document.querySelector('.site-footer');
  if(!footer || footer.dataset.enhanced==='true') return;

  footer.dataset.enhanced='true';
  const year=new Date().getFullYear();
  footer.innerHTML=`
    <div class="container footer-shell">
      <div class="footer-main">
        <section class="footer-identity" aria-label="정월재 소개">
          <div class="footer-brand-lockup">
            <span class="footer-symbol-wrap"><img class="footer-symbol" src="./logo.svg" alt="정월재 심볼"></span>
            <div class="footer-name"><strong>정월재</strong><span>JEONGWOLJAE · 正月齋</span></div>
          </div>
          <p class="footer-intro">정월재는 사주팔자와 음양오행을 바탕으로 기질, 관계, 오늘의 흐름, 일과 재물 등을 하나의 구조 안에서 읽어내는 명리 해석 서비스입니다. 같은 이론을 더 정돈된 기준과 현대적인 언어로 전달합니다.</p>
          <div class="footer-principle"><span>사주팔자 기반</span><span>음양오행 분석</span><span>개인 맞춤 해석</span><span>좋은 말만 하지 않는 기준</span></div>
        </section>

        <section class="footer-column">
          <h3>서비스</h3>
          <nav aria-label="푸터 서비스 메뉴">
            <a href="./saju.html">종합 사주</a>
            <a href="./ohaeng.html">오행 분석</a>
            <a href="./fortune.html">오늘의 운세</a>
            <a href="./relationship.html">연애와 인연</a>
            <a href="./work-money.html">일과 재물</a>
          </nav>
        </section>

        <section class="footer-column">
          <h3>정월재</h3>
          <nav aria-label="푸터 정월재 메뉴">
            <a href="./compatibility.html">궁합</a>
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

      <div class="footer-bottom">
        <p class="footer-disclaimer">정월재의 콘텐츠는 전통 명리학 이론을 바탕으로 한 해석 콘텐츠이며 과학적·의학적·법률적 판단이나 미래 결과를 보장하지 않습니다. 입력 정보는 회원관리와 사주·운세 풀이 및 정월록 기록을 위해서만 사용합니다.</p>
        <div class="footer-legal"><a href="./privacy.html">개인정보처리방침</a><span>© ${year} JEONGWOLJAE</span></div>
      </div>
    </div>`;
})();
