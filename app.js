const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
const readingForm = document.querySelector('[data-reading-form]');
const formStatus = document.querySelector('[data-form-status]');
const yearNode = document.querySelector('[data-year]');

if (yearNode) yearNode.textContent = new Date().getFullYear();

function setMenu(open) {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  mobileMenu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  mobileLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1280) setMenu(false);
  });
}

const serviceConfig = {
  saju: {
    title: '종합 사주',
    description: '사주팔자와 음양오행을 바탕으로 기본 기질과 성향, 삶의 큰 구조를 살펴봅니다.',
    button: '종합 사주 살펴보기'
  },
  elements: {
    title: '오행 분석',
    description: '목·화·토·금·수의 분포와 균형, 강한 기운과 부족한 기운을 살펴봅니다.',
    button: '오행의 균형 살펴보기'
  },
  fortune: {
    title: '운의 흐름',
    description: '나의 사주와 오늘, 이번 달, 올해의 기운이 어떻게 만나는지 살펴봅니다.',
    button: '운의 흐름 살펴보기'
  },
  love: {
    title: '연애와 인연',
    description: '관계를 맺는 방식과 연애 성향, 반복되는 관계 패턴과 인연의 흐름을 살펴봅니다.',
    button: '연애와 인연 살펴보기'
  },
  compatibility: {
    title: '궁합',
    description: '두 사람의 사주와 오행을 비교해 보완되는 부분과 부딪히는 지점을 함께 살펴봅니다.',
    button: '두 사람의 궁합 살펴보기',
    needsPartner: true
  },
  work: {
    title: '일과 재물',
    description: '업무 성향, 조직과 독립의 방향, 재물을 다루는 기질과 시기의 흐름을 살펴봅니다.',
    button: '일과 재물 살펴보기'
  }
};

function setFieldError(input, message) {
  if (!input) return;
  const target = document.querySelector(`[data-error-for="${input.id}"]`);
  input.setAttribute('aria-invalid', 'true');
  if (target) target.textContent = message;
}

function clearFieldError(input) {
  if (!input) return;
  const target = document.querySelector(`[data-error-for="${input.id}"]`);
  input.removeAttribute('aria-invalid');
  if (target) target.textContent = '';
}

if (readingForm) {
  const descriptionNode = readingForm.querySelector('[data-selected-service-description]');
  const submitButton = readingForm.querySelector('button[type="submit"]');
  const partnerPanel = readingForm.querySelector('[data-partner-panel]');
  const profileName = readingForm.querySelector('#profile-name');
  const birthDate = readingForm.querySelector('#birth-date');
  const partnerName = readingForm.querySelector('#partner-name');
  const partnerBirthDate = readingForm.querySelector('#partner-birth-date');
  const consent = readingForm.querySelector('input[name="consent"]');

  function selectedKey() {
    return readingForm.querySelector('input[name="serviceType"]:checked')?.value || 'saju';
  }

  function syncService() {
    const service = serviceConfig[selectedKey()] || serviceConfig.saju;
    if (descriptionNode) descriptionNode.textContent = service.description;
    if (submitButton) submitButton.textContent = service.button;

    const needsPartner = Boolean(service.needsPartner);
    if (partnerPanel) partnerPanel.hidden = !needsPartner;
    if (partnerName) partnerName.required = needsPartner;
    if (partnerBirthDate) partnerBirthDate.required = needsPartner;

    if (!needsPartner) {
      clearFieldError(partnerName);
      clearFieldError(partnerBirthDate);
    }
    if (formStatus) formStatus.textContent = '';
  }

  readingForm.querySelectorAll('input[name="serviceType"]').forEach((radio) => {
    radio.addEventListener('change', syncService);
  });

  [profileName, birthDate, partnerName, partnerBirthDate].forEach((input) => {
    input?.addEventListener('input', () => clearFieldError(input));
  });

  document.querySelectorAll('[data-service-target]').forEach((card) => {
    const selectAndMove = () => {
      const key = card.dataset.serviceTarget;
      const radio = readingForm.querySelector(`input[name="serviceType"][value="${key}"]`);
      if (!radio) return;
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      document.querySelector('#reading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    card.addEventListener('click', selectAndMove);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectAndMove();
      }
    });
  });

  syncService();

  readingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;
    const service = serviceConfig[selectedKey()] || serviceConfig.saju;

    if (!profileName?.value.trim()) {
      setFieldError(profileName, '이름 또는 닉네임을 입력해주세요.');
      valid = false;
    } else clearFieldError(profileName);

    if (!birthDate?.value) {
      setFieldError(birthDate, '생년월일을 입력해주세요.');
      valid = false;
    } else clearFieldError(birthDate);

    if (service.needsPartner) {
      if (!partnerName?.value.trim()) {
        setFieldError(partnerName, '상대방의 이름 또는 닉네임을 입력해주세요.');
        valid = false;
      } else clearFieldError(partnerName);

      if (!partnerBirthDate?.value) {
        setFieldError(partnerBirthDate, '상대방의 생년월일을 입력해주세요.');
        valid = false;
      } else clearFieldError(partnerBirthDate);
    }

    if (!consent?.checked) {
      if (formStatus) formStatus.textContent = '분석을 진행하려면 입력 정보 사용에 동의해주세요.';
      valid = false;
    } else if (formStatus) formStatus.textContent = '';

    if (!valid) return;

    const formData = new FormData(readingForm);
    const birthTime = formData.get('birthTime') || '출생 시간 미입력';
    const calendarType = formData.get('calendarType') === 'lunar' ? '음력' : '양력';
    const person = formData.get('profileName');

    if (formStatus) {
      formStatus.style.color = 'var(--muted)';
      formStatus.textContent = `${person}님의 ${service.title} 분석 정보를 확인했습니다. ${formData.get('birthDate')} · ${birthTime} · ${calendarType} 기준으로 계산 엔진을 연결할 예정입니다.`;
    }
  });
}
