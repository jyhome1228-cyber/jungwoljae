(() => {
  const DURATION = 3400;
  const messages = [
    '입력하신 사주 정보를 차분히 살펴보고 있습니다.',
    '타고난 기운과 흐름을 하나씩 정리하고 있습니다.',
    '내용을 다시 살피며 결과를 준비하고 있습니다.'
  ];

  if (!document.querySelector('link[data-saju-loading-style]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './saju-loading.css?v=20260909-01';
    link.dataset.sajuLoadingStyle = '';
    document.head.appendChild(link);
  }

  function ensureOverlay() {
    let overlay = document.querySelector('[data-saju-loading]');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.className = 'saju-loading-overlay';
    overlay.hidden = true;
    overlay.dataset.sajuLoading = '';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML = `
      <div class="saju-loading-inner">
        <div class="saju-loading-mark" aria-hidden="true">
          <span class="saju-loading-ring"></span>
          <span class="saju-loading-ring"></span>
          <img class="saju-loading-logo" src="./logo.svg" alt="" />
        </div>
        <p class="saju-loading-eyebrow">JUNGWOLJAE · SAJU READING</p>
        <h2 class="saju-loading-title">사주를 신중하게 풀어보고 있습니다.</h2>
        <p class="saju-loading-message" data-saju-loading-message>${messages[0]}</p>
        <div class="saju-loading-dots" aria-hidden="true"><span></span><span></span><span></span></div>
      </div>`;
    document.body.appendChild(overlay);
    return overlay;
  }

  window.showJungwoljaeSajuLoading = function () {
    const overlay = ensureOverlay();
    const message = overlay.querySelector('[data-saju-loading-message]');
    document.body.classList.add('saju-loading-open');
    overlay.hidden = false;
    overlay.classList.remove('is-leaving');
    message.textContent = messages[0];
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('is-visible')));

    [1100, 2200].forEach((delay, i) => {
      setTimeout(() => {
        message.classList.add('is-changing');
        setTimeout(() => {
          message.textContent = messages[i + 1];
          message.classList.remove('is-changing');
        }, 180);
      }, delay);
    });

    return new Promise(resolve => {
      setTimeout(() => {
        overlay.classList.add('is-leaving');
        setTimeout(resolve, 220);
      }, DURATION);
    });
  };
})();