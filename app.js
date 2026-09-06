const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
const readingForm = document.querySelector('[data-reading-form]');
const formStatus = document.querySelector('[data-form-status]');
const yearNode = document.querySelector('[data-year]');

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

function setMenu(open) {
  if (!menuButton || !mobileMenu) return;

  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  mobileMenu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1280) setMenu(false);
  });
}

function setFieldError(input, message) {
  const target = document.querySelector(`[data-error-for="${input.id}"]`);
  input.setAttribute('aria-invalid', 'true');
  if (target) target.textContent = message;
}

function clearFieldError(input) {
  const target = document.querySelector(`[data-error-for="${input.id}"]`);
  input.removeAttribute('aria-invalid');
  if (target) target.textContent = '';
}

if (readingForm) {
  const birthDate = readingForm.querySelector('#birth-date');
  const consent = readingForm.querySelector('input[name="consent"]');

  birthDate?.addEventListener('input', () => clearFieldError(birthDate));

  readingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;

    if (!birthDate?.value) {
      setFieldError(birthDate, '생년월일을 입력해주세요.');
      valid = false;
    } else {
      clearFieldError(birthDate);
    }

    if (!consent?.checked) {
      if (formStatus) formStatus.textContent = '분석을 진행하려면 입력 정보 사용에 동의해주세요.';
      valid = false;
    } else if (formStatus) {
      formStatus.textContent = '';
    }

    if (!valid) return;

    const formData = new FormData(readingForm);
    const birthTime = formData.get('birthTime') || '시간 미입력';
    const calendarType = formData.get('calendarType') === 'lunar' ? '음력' : '양력';

    if (formStatus) {
      formStatus.textContent = `${formData.get('birthDate')} · ${birthTime} · ${calendarType} 기준 입력이 확인되었습니다. 다음 단계에서 명리 계산 엔진을 연결합니다.`;
    }
  });
}
