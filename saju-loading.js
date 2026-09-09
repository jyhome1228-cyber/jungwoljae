const DURATION = 3400;
const messages = [
  '입력하신 사주 정보를 차분히 살펴보고 있습니다.',
  '타고난 기운과 흐름을 하나씩 정리하고 있습니다.',
  '내용을 다시 살피며 결과를 준비하고 있습니다.'
];

function ensureOverlay() {
  let overlay = document.querySelector('[data-saju-loading]');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.className = 'saju-loading-overlay';
  overlay.hidden = true;
  overlay.dataset.sajuLoading = '';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-label', '사주 분석 준비 중');
  overlay.innerHTML = `
    <div class="saju-loading-inner">
      <div class="saju-loading-mark" aria-hidden="true">
        <span class="saju-loading-ring"></span>
        <span class="saju-loading-ring"></span>
        <img class="saju-loading-logo" src="./logo.svg?v=20260909-2119" alt="" />
      </div>
      <p class="saju-loading-eyebrow">JUNGWOLJAE · SAJU READING</p>
      <h2 class="saju-loading-title">사주를 신중하게 풀어보고 있습니다.</h2>
      <p class="saju-loading-message" data-saju-loading-message>${messages[0]}</p>
      <div class="saju-loading-dots" aria-hidden="true"><span></span><span></span><span></span></div>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

export function showSajuLoading() {
  const overlay = ensureOverlay();
  const message = overlay.querySelector('[data-saju-loading-message]');

  document.body.classList.add('saju-loading-open');
  overlay.hidden = false;
  overlay.classList.remove('is-visible', 'is-leaving');
  message.classList.remove('is-changing');
  message.textContent = messages[0];

  // Force a layout read so the first frame is painted before the fade-in class.
  void overlay.offsetWidth;
  overlay.classList.add('is-visible');

  const timers = [];
  [1100, 2200].forEach((delay, i) => {
    timers.push(setTimeout(() => {
      message.classList.add('is-changing');
      timers.push(setTimeout(() => {
        message.textContent = messages[i + 1];
        message.classList.remove('is-changing');
      }, 180));
    }, delay));
  });

  return new Promise(resolve => {
    timers.push(setTimeout(() => {
      overlay.classList.add('is-leaving');
      timers.push(setTimeout(() => {
        overlay.classList.remove('is-visible');
        resolve();
      }, 260));
    }, DURATION));
  });
}