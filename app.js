const themeLink = document.createElement('link');
themeLink.rel = 'stylesheet';
themeLink.href = './theme-dark.css';
document.head.appendChild(themeLink);

const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const yearNode = document.querySelector('[data-year]');
const readingForm = document.querySelector('[data-reading-form]');
const formStatus = document.querySelector('[data-form-status]');

if (yearNode) yearNode.textContent = new Date().getFullYear();

function ensureReviewNav(){
  document.querySelectorAll('.desktop-nav').forEach((nav)=>{
    if(nav.querySelector('a[href*="reviews.html"]')) return;
    const link=document.createElement('a');
    link.href='./reviews.html';link.textContent='후기';
    const about=[...nav.querySelectorAll('a')].find(a=>a.getAttribute('href')?.includes('about.html'));
    if(about) nav.insertBefore(link,about); else nav.appendChild(link);
  });
  document.querySelectorAll('.mobile-menu nav').forEach((nav)=>{
    if(nav.querySelector('a[href*="reviews.html"]')) return;
    const link=document.createElement('a');
    link.href='./reviews.html';link.textContent='후기';
    nav.appendChild(link);
  });
  document.querySelectorAll('a[href="#reviews"]').forEach((link)=>link.setAttribute('href','./reviews.html'));
}
ensureReviewNav();

function setMenu(open){
  if(!menuButton||!mobileMenu)return;
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
  mobileMenu.hidden=!open;
  document.body.classList.toggle('menu-open',open);
}
if(menuButton&&mobileMenu){
  menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
  mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
  window.addEventListener('resize',()=>{if(window.innerWidth>=1280)setMenu(false)});
}

const serviceConfig={
  saju:{title:'종합 사주',description:'사주팔자와 음양오행을 바탕으로 기본 기질, 성향과 삶의 큰 구조를 살펴봅니다.',button:'종합 사주 살펴보기'},
  elements:{title:'오행 분석',description:'목·화·토·금·수의 분포와 균형, 강한 기운과 부족한 기운을 함께 봅니다.',button:'오행 분석 살펴보기'},
  fortune:{title:'운의 흐름',description:'나의 사주와 오늘, 이번 달, 올해의 기운이 만나는 흐름을 살펴봅니다.',button:'운의 흐름 살펴보기'},
  love:{title:'연애와 인연',description:'관계를 맺는 방식과 반복되는 패턴, 연애와 인연의 흐름을 살펴봅니다.',button:'연애와 인연 살펴보기'},
  compatibility:{title:'궁합',description:'두 사람의 사주와 오행을 비교해 서로 보완되는 부분과 관계의 특징을 봅니다.',button:'두 사람의 궁합 살펴보기',needsPartner:true},
  work:{title:'일과 재물',description:'업무 성향, 조직과 독립의 방향, 재물을 다루는 기질과 흐름을 살펴봅니다.',button:'일과 재물 살펴보기'}
};
function setFieldError(input,message){if(!input)return;const target=document.querySelector(`[data-error-for="${input.id}"]`);input.setAttribute('aria-invalid','true');if(target)target.textContent=message}
function clearFieldError(input){if(!input)return;const target=document.querySelector(`[data-error-for="${input.id}"]`);input.removeAttribute('aria-invalid');if(target)target.textContent=''}

if(readingForm){
  const serviceRadios=[...readingForm.querySelectorAll('input[name="serviceType"]')];
  const descriptionNode=readingForm.querySelector('[data-selected-service-description]');
  const submitButton=readingForm.querySelector('button[type="submit"]');
  const partnerPanel=readingForm.querySelector('[data-partner-panel]');
  const profileName=readingForm.querySelector('#profile-name');
  const birthDate=readingForm.querySelector('#birth-date');
  const partnerName=readingForm.querySelector('#partner-name');
  const partnerBirthDate=readingForm.querySelector('#partner-birth-date');
  const consent=readingForm.querySelector('input[name="consent"]');
  const selectedServiceKey=()=>readingForm.querySelector('input[name="serviceType"]:checked')?.value||'saju';
  const syncService=()=>{
    const service=serviceConfig[selectedServiceKey()]||serviceConfig.saju;
    if(descriptionNode)descriptionNode.textContent=service.description;
    if(submitButton)submitButton.textContent=service.button;
    if(partnerPanel)partnerPanel.hidden=!service.needsPartner;
    if(partnerName)partnerName.required=Boolean(service.needsPartner);
    if(partnerBirthDate)partnerBirthDate.required=Boolean(service.needsPartner);
    if(!service.needsPartner){clearFieldError(partnerName);clearFieldError(partnerBirthDate)}
    if(formStatus)formStatus.textContent='';
  };
  serviceRadios.forEach(radio=>radio.addEventListener('change',syncService));
  [profileName,birthDate,partnerName,partnerBirthDate].forEach(input=>input?.addEventListener('input',()=>clearFieldError(input)));
  consent?.addEventListener('change',()=>{if(consent.checked&&formStatus)formStatus.textContent=''})
  readingForm.addEventListener('submit',(event)=>{
    event.preventDefault();let valid=true;const service=serviceConfig[selectedServiceKey()]||serviceConfig.saju;
    if(!profileName?.value.trim()){setFieldError(profileName,'이름 또는 닉네임을 입력해주세요.');valid=false}else clearFieldError(profileName);
    if(!birthDate?.value){setFieldError(birthDate,'생년월일을 입력해주세요.');valid=false}else clearFieldError(birthDate);
    if(service.needsPartner){
      if(!partnerName?.value.trim()){setFieldError(partnerName,'상대방의 이름 또는 닉네임을 입력해주세요.');valid=false}else clearFieldError(partnerName);
      if(!partnerBirthDate?.value){setFieldError(partnerBirthDate,'상대방의 생년월일을 입력해주세요.');valid=false}else clearFieldError(partnerBirthDate);
    }
    if(!consent?.checked){if(formStatus)formStatus.textContent='분석을 진행하려면 입력 정보 사용에 동의해주세요.';valid=false}
    if(!valid){readingForm.querySelector('[aria-invalid="true"]')?.focus();return}
    const data=new FormData(readingForm);const birthTime=data.get('birthTime')||'출생 시간 미입력';const calendarType=data.get('calendarType')==='lunar'?'음력':'양력';
    if(formStatus)formStatus.textContent=`${data.get('profileName')}님의 ${service.title} 분석 정보가 확인되었습니다. ${data.get('birthDate')} · ${birthTime} · ${calendarType} 기준으로 분석합니다.`;
  });
  syncService();
}

if(document.querySelector('#reviews') && document.body.dataset.reviewsPage!=='true'){
  const reviewScript=document.createElement('script');
  reviewScript.src='./reviews.js';reviewScript.defer=true;document.body.appendChild(reviewScript);
}
