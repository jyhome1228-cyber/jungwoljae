const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
const readingForm = document.querySelector('[data-reading-form]');
const formStatus = document.querySelector('[data-form-status]');
const yearNode = document.querySelector('[data-year]');

const serviceStylesheet = document.createElement('link');
serviceStylesheet.rel = 'stylesheet';
serviceStylesheet.href = './service-flow.css';
document.head.appendChild(serviceStylesheet);

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

const serviceConfig = {
  saju: {
    title: '종합 사주',
    meta: '기질 · 성향 · 기본 명식',
    description: '사주팔자와 음양오행을 바탕으로 나의 기본 기질과 성향을 종합적으로 살펴봅니다.',
    button: '종합 사주 살펴보기'
  },
  elements: {
    title: '오행 분석',
    meta: '木 · 火 · 土 · 金 · 水',
    description: '목·화·토·금·수의 분포와 균형, 강한 기운과 부족한 기운을 살펴봅니다.',
    button: '오행의 균형 살펴보기'
  },
  fortune: {
    title: '오늘 · 월운 · 연운',
    meta: '지금의 흐름',
    description: '나의 사주와 오늘, 이번 달, 올해의 기운이 어떻게 만나는지 흐름을 살펴봅니다.',
    button: '운의 흐름 살펴보기'
  },
  love: {
    title: '연애와 인연',
    meta: '관계 · 연애 성향',
    description: '나의 관계 방식과 연애 성향, 인연을 대하는 기질과 시기의 흐름을 살펴봅니다.',
    button: '연애와 인연 살펴보기'
  },
  compatibility: {
    title: '궁합',
    meta: '두 사람의 관계',
    description: '두 사람의 사주와 오행을 함께 비교해 서로 보완되는 부분과 관계의 특징을 살펴봅니다.',
    button: '두 사람의 궁합 살펴보기',
    needsPartner: true
  },
  work: {
    title: '일과 재물',
    meta: '직업 · 재물 흐름',
    description: '업무 성향과 조직·독립의 방향, 재물을 다루는 기질과 시기의 흐름을 살펴봅니다.',
    button: '일과 재물 살펴보기'
  }
};

function createServicePicker() {
  const picker = document.createElement('fieldset');
  picker.className = 'service-picker';

  const options = Object.entries(serviceConfig).map(([value, service], index) => `
    <label class="service-option">
      <input type="radio" name="serviceType" value="${value}" ${index === 0 ? 'checked' : ''} />
      <span class="service-option-content">
        <span class="service-option-title">${service.title}</span>
        <span class="service-option-meta">${service.meta}</span>
      </span>
    </label>
  `).join('');

  picker.innerHTML = `
    <legend>
      <span class="flow-step">
        <span class="flow-step-number">01</span>
        <span class="flow-step-title">어떤 흐름이 궁금한가요?</span>
      </span>
      <span class="flow-step-description">먼저 보고 싶은 서비스를 하나 골라주세요.</span>
    </legend>
    <div class="service-options">${options}</div>
  `;

  return picker;
}

function createProfileIntro() {
  const intro = document.createElement('div');
  intro.className = 'profile-step';
  intro.innerHTML = `
    <div class="flow-step">
      <span class="flow-step-number">02</span>
      <h3 class="flow-step-title">간단한 정보를 알려주세요.</h3>
    </div>
    <p class="flow-step-description">이름과 생년월일을 중심으로 입력하고, 출생 시간을 모르면 비워두어도 됩니다.</p>
  `;
  return intro;
}

function createNameField() {
  const wrapper = document.createElement('div');
  wrapper.className = 'field profile-name-field';
  wrapper.innerHTML = `
    <label for="profile-name">이름 또는 닉네임 <span aria-hidden="true">*</span></label>
    <input id="profile-name" name="profileName" type="text" autocomplete="name" placeholder="예: 정월" required />
    <p class="field-message" data-error-for="profile-name"></p>
  `;
  return wrapper;
}

function createSelectedServiceNote() {
  const note = document.createElement('div');
  note.className = 'selected-service-note';
  note.setAttribute('aria-live', 'polite');
  note.innerHTML = `
    <strong>선택</strong>
    <p data-selected-service-description></p>
  `;
  return note;
}

function createPartnerPanel() {
  const panel = document.createElement('section');
  panel.className = 'partner-panel';
  panel.hidden = true;
  panel.setAttribute('data-partner-panel', '');
  panel.innerHTML = `
    <div class="partner-panel-header">
      <h3>상대방 정보</h3>
      <p>궁합 분석에 필요한 최소한의 정보만 입력합니다.</p>
    </div>

    <div class="field">
      <label for="partner-name">이름 또는 닉네임 <span aria-hidden="true">*</span></label>
      <input id="partner-name" name="partnerName" type="text" placeholder="예: 상대방" />
      <p class="field-message" data-error-for="partner-name"></p>
    </div>

    <div class="form-row form-row-2">
      <div class="field">
        <label for="partner-birth-date">생년월일 <span aria-hidden="true">*</span></label>
        <input id="partner-birth-date" name="partnerBirthDate" type="date" />
        <p class="field-message" data-error-for="partner-birth-date"></p>
      </div>
      <div class="field">
        <label for="partner-birth-time">태어난 시간 <span class="optional">선택</span></label>
        <input id="partner-birth-time" name="partnerBirthTime" type="time" />
      </div>
    </div>

    <div class="field">
      <label for="partner-calendar-type">달력 기준</label>
      <select id="partner-calendar-type" name="partnerCalendarType">
        <option value="solar">양력</option>
        <option value="lunar">음력</option>
      </select>
    </div>
  `;
  return panel;
}

function enhanceServiceCards() {
  const cards = [...document.querySelectorAll('.service-card')];
  const cardMap = ['saju', 'elements', 'fortune', 'love', 'work'];

  cards.forEach((card, index) => {
    const serviceKey = cardMap[index];
    if (!serviceKey || !serviceConfig[serviceKey]) return;

    card.dataset.serviceTarget = serviceKey;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${serviceConfig[serviceKey].title} 선택하고 입력하기`);

    if (!card.querySelector('.service-card-action')) {
      const action = document.createElement('span');
      action.className = 'service-card-action';
      action.textContent = '이 서비스로 시작하기 →';
      card.appendChild(action);
    }

    const selectAndScroll = () => {
      const target = readingForm?.querySelector(`input[name="serviceType"][value="${serviceKey}"]`);
      if (!target) return;
      target.checked = true;
      target.dispatchEvent(new Event('change', { bubbles: true }));
      document.querySelector('#reading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    card.addEventListener('click', selectAndScroll);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectAndScroll();
      }
    });
  });
}

if (readingForm) {
  readingForm.classList.add('service-reading-form');

  const originalFirstChild = readingForm.firstElementChild;
  const picker = createServicePicker();
  const serviceNote = createSelectedServiceNote();
  const profileIntro = createProfileIntro();
  const nameField = createNameField();
  const partnerPanel = createPartnerPanel();
  const consent = readingForm.querySelector('input[name="consent"]');
  const consentRow = consent?.closest('.consent-row');
  const submitButton = readingForm.querySelector('button[type="submit"]');

  readingForm.insertBefore(picker, originalFirstChild);
  readingForm.insertBefore(serviceNote, originalFirstChild);
  readingForm.insertBefore(profileIntro, originalFirstChild);
  readingForm.insertBefore(nameField, originalFirstChild);

  if (consentRow) {
    readingForm.insertBefore(partnerPanel, consentRow);
  } else {
    readingForm.appendChild(partnerPanel);
  }

  const profileName = readingForm.querySelector('#profile-name');
  const birthDate = readingForm.querySelector('#birth-date');
  const partnerName = readingForm.querySelector('#partner-name');
  const partnerBirthDate = readingForm.querySelector('#partner-birth-date');
  const descriptionNode = readingForm.querySelector('[data-selected-service-description]');

  function getSelectedServiceKey() {
    return readingForm.querySelector('input[name="serviceType"]:checked')?.value || 'saju';
  }

  function syncSelectedService() {
    const service = serviceConfig[getSelectedServiceKey()] || serviceConfig.saju;
    if (descriptionNode) descriptionNode.textContent = service.description;
    if (submitButton) submitButton.textContent = service.button;

    partnerPanel.hidden = !service.needsPartner;
    partnerName.required = Boolean(service.needsPartner);
    partnerBirthDate.required = Boolean(service.needsPartner);

    if (!service.needsPartner) {
      clearFieldError(partnerName);
      clearFieldError(partnerBirthDate);
    }

    if (formStatus) formStatus.textContent = '';
  }

  readingForm.querySelectorAll('input[name="serviceType"]').forEach((radio) => {
    radio.addEventListener('change', syncSelectedService);
  });

  [profileName, birthDate, partnerName, partnerBirthDate].forEach((input) => {
    input?.addEventListener('input', () => clearFieldError(input));
  });

  syncSelectedService();
  enhanceServiceCards();

  readingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;
    const serviceKey = getSelectedServiceKey();
    const service = serviceConfig[serviceKey] || serviceConfig.saju;

    if (!profileName?.value.trim()) {
      setFieldError(profileName, '이름 또는 닉네임을 입력해주세요.');
      valid = false;
    } else {
      clearFieldError(profileName);
    }

    if (!birthDate?.value) {
      setFieldError(birthDate, '생년월일을 입력해주세요.');
      valid = false;
    } else {
      clearFieldError(birthDate);
    }

    if (service.needsPartner) {
      if (!partnerName?.value.trim()) {
        setFieldError(partnerName, '상대방의 이름 또는 닉네임을 입력해주세요.');
        valid = false;
      } else {
        clearFieldError(partnerName);
      }

      if (!partnerBirthDate?.value) {
        setFieldError(partnerBirthDate, '상대방의 생년월일을 입력해주세요.');
        valid = false;
      } else {
        clearFieldError(partnerBirthDate);
      }
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
    const person = formData.get('profileName');

    if (formStatus) {
      formStatus.textContent = `${person}님의 ${service.title} 분석 정보를 확인했습니다. ${formData.get('birthDate')} · ${birthTime} · ${calendarType} 기준으로 다음 단계에서 명리 계산 엔진과 연결됩니다.`;
    }
  });
}
