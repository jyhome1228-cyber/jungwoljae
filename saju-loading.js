const DEFAULT_DURATION = 3600;
const MAX_DURATION = 5000;
const defaultMessages = [
  '입력하신 사주 정보를 차분히 살펴보고 있습니다.',
  '타고난 기운과 현재의 흐름을 하나씩 정리하고 있습니다.',
  '내용을 다시 살피며 결과를 준비하고 있습니다.'
];
let activeRun=0;

function ensureOverlay() {
  let overlay = document.querySelector('[data-saju-loading]');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.className = 'saju-loading-overlay';
  overlay.hidden = true;
  overlay.dataset.sajuLoading = '';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-label', '분석 결과 준비 중');
  overlay.innerHTML = `
    <div class="saju-loading-inner">
      <div class="saju-loading-mark" aria-hidden="true">
        <span class="saju-loading-ring"></span>
        <span class="saju-loading-ring"></span>
        <img class="saju-loading-logo" src="./logo.svg?v=20260909-2340" alt="" />
      </div>
      <p class="saju-loading-eyebrow" data-saju-loading-eyebrow>JUNGWOLJAE · READING</p>
      <h2 class="saju-loading-title" data-saju-loading-title>내용을 신중하게 풀어보고 있습니다.</h2>
      <p class="saju-loading-message" data-saju-loading-message></p>
      <div class="saju-loading-dots" aria-hidden="true"><span></span><span></span><span></span></div>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function forceClose(overlay){
  if(!overlay)return;
  overlay.classList.remove('is-visible','is-leaving');
  overlay.hidden=true;
  document.body.classList.remove('saju-loading-open','reading-result-pending');
  document.documentElement.classList.remove('jw-entry-first');
  const main=document.querySelector('main');
  if(main)main.style.visibility='';
}

export function showSajuLoading(options = {}) {
  const overlay = ensureOverlay();
  const eyebrow = overlay.querySelector('[data-saju-loading-eyebrow]');
  const title = overlay.querySelector('[data-saju-loading-title]');
  const message = overlay.querySelector('[data-saju-loading-message]');
  const requested = Number(options.duration) || DEFAULT_DURATION;
  const duration = Math.min(MAX_DURATION, Math.max(500, requested));
  const messages = Array.isArray(options.messages) && options.messages.length ? options.messages : defaultMessages;
  const alreadyVisible = !overlay.hidden && overlay.classList.contains('is-visible');
  const runId=++activeRun;

  eyebrow.textContent = options.eyebrow || 'JUNGWOLJAE · READING';
  title.textContent = options.title || '내용을 신중하게 풀어보고 있습니다.';
  overlay.setAttribute('aria-label', options.ariaLabel || '분석 결과 준비 중');

  document.body.classList.add('saju-loading-open');
  overlay.hidden = false;
  overlay.classList.remove('is-leaving');
  message.classList.remove('is-changing');
  message.textContent = messages[0] || defaultMessages[0];

  if (!alreadyVisible) {
    overlay.classList.remove('is-visible');
    void overlay.offsetWidth;
    overlay.classList.add('is-visible');
  }

  const timers = [];
  const firstChange = Math.round(duration * 0.31);
  const secondChange = Math.round(duration * 0.62);
  [firstChange, secondChange].forEach((delay, index) => {
    if (!messages[index + 1]) return;
    timers.push(setTimeout(() => {
      if(runId!==activeRun)return;
      message.classList.add('is-changing');
      timers.push(setTimeout(() => {
        if(runId!==activeRun)return;
        message.textContent = messages[index + 1];
        message.classList.remove('is-changing');
      }, 180));
    }, delay));
  });

  return new Promise(resolve => {
    let finished=false;
    const finish=()=>{
      if(finished)return;
      finished=true;
      timers.forEach(clearTimeout);
      forceClose(overlay);
      if(typeof window.__jwReleaseResultLoader==='function')window.__jwReleaseResultLoader('loader-finished');
      resolve();
    };
    timers.push(setTimeout(() => {
      if(runId!==activeRun){finish();return;}
      overlay.classList.add('is-leaving');
      timers.push(setTimeout(finish,280));
    }, duration));
    // Secondary watchdog: even if animation/timer state breaks, release the page.
    timers.push(setTimeout(finish,duration+900));
  });
}
