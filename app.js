const themeLink = document.createElement('link');
themeLink.rel = 'stylesheet';
themeLink.href = './theme-dark.css';
document.head.appendChild(themeLink);

const tuningLink = document.createElement('link');
tuningLink.rel = 'stylesheet';
tuningLink.href = './theme-tuning.css';
document.head.appendChild(tuningLink);

const polishLink = document.createElement('link');
polishLink.rel = 'stylesheet';
polishLink.href = './theme-polish.css';
document.head.appendChild(polishLink);

const themeMeta = document.querySelector('meta[name="theme-color"]');
if (themeMeta) themeMeta.setAttribute('content', '#ffffff');

function applyBrandLogo(){
  document.querySelectorAll('.brand').forEach((brand)=>{
    brand.innerHTML = '<img class="brand-logo" src="./logo.svg" alt="" aria-hidden="true"><span class="brand-name">정월재</span>';
  });

  document.querySelectorAll('.footer-brand').forEach((brand)=>{
    brand.innerHTML = '<span class="footer-logo-wrap"><img class="footer-logo" src="./logo.svg" alt="" aria-hidden="true"></span><span class="footer-brand-name">정월재</span>';
  });
}
applyBrandLogo();

function normalizeNavigation(){
  document.querySelectorAll('.desktop-nav, .mobile-menu nav, .secondary-nav .container').forEach((nav)=>{
    let links=[...nav.querySelectorAll('a')];
    const fortune=links.find(a=>a.getAttribute('href')?.includes('fortune.html'));
    if(fortune) fortune.textContent='오늘의 운세';

    let archive=links.find(a=>a.getAttribute('href')?.includes('archive.html'));
    if(!archive && !nav.closest('.secondary-nav')){
      archive=document.createElement('a');
      archive.href='./archive.html';
      archive.textContent='정월록';
      const review=links.find(a=>a.getAttribute('href')?.includes('reviews.html'));
      const about=links.find(a=>a.getAttribute('href')?.includes('about.html'));
      if(review) nav.insertBefore(archive,review); else if(about) nav.insertBefore(archive,about); else nav.appendChild(archive);
      links=[...nav.querySelectorAll('a')];
    }
    if(archive) archive.textContent='정월록';

    if(!nav.closest('.secondary-nav') && !links.some(a=>a.getAttribute('href')?.includes('reviews.html'))){
      const review=document.createElement('a');
      review.href='./reviews.html';
      review.textContent='후기';
      const about=links.find(a=>a.getAttribute('href')?.includes('about.html'));
      if(about) nav.insertBefore(review,about); else nav.appendChild(review);
    }
  });

  document.querySelectorAll('.header-cta').forEach((cta)=>{
    cta.href='./signup.html';
    cta.textContent='회원등록';
  });

  document.querySelectorAll('a[href="#reviews"]').forEach((link)=>link.setAttribute('href','./reviews.html'));
}
normalizeNavigation();

const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const yearNode = document.querySelector('[data-year]');
const readingForm = document.querySelector('[data-reading-form]');
const formStatus = document.querySelector('[data-form-status]');

if (yearNode) yearNode.textContent = new Date().getFullYear();

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
  fortune:{title:'오늘의 운세',description:'나의 사주와 오늘의 기운이 만나는 흐름을 중심으로 살펴봅니다.',button:'오늘의 운세 살펴보기'},
  love:{title:'연애와 인연',description:'관계를 맺는 방식과 반복되는 패턴, 연애와 인연의 흐름을 살펴봅니다.',button:'연애와 인연 살펴보기'},
  compatibility:{title:'궁합',description:'두 사람의 사주와 오행을 비교해 서로 보완되는 부분과 관계의 특징을 봅니다.',button:'두 사람의 궁합 살펴보기',needsPartner:true},
  work:{title:'일과 재물',description:'업무 성향, 조직과 독립의 방향, 재물을 다루는 기질과 흐름을 살펴봅니다.',button:'일과 재물 살펴보기'}
};

function setFieldError(input,message){
  if(!input)return;
  const target=document.querySelector(`[data-error-for="${input.id}"]`);
  input.setAttribute('aria-invalid','true');
  if(target)target.textContent=message;
}
function clearFieldError(input){
  if(!input)return;
  const target=document.querySelector(`[data-error-for="${input.id}"]`);
  input.removeAttribute('aria-invalid');
  if(target)target.textContent='';
}

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
  consent?.addEventListener('change',()=>{if(consent.checked&&formStatus)formStatus.textContent=''});

  readingForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    let valid=true;
    const service=serviceConfig[selectedServiceKey()]||serviceConfig.saju;

    if(!profileName?.value.trim()){setFieldError(profileName,'이름 또는 닉네임을 입력해주세요.');valid=false}else clearFieldError(profileName);
    if(!birthDate?.value){setFieldError(birthDate,'생년월일을 입력해주세요.');valid=false}else clearFieldError(birthDate);

    if(service.needsPartner){
      if(!partnerName?.value.trim()){setFieldError(partnerName,'상대방의 이름 또는 닉네임을 입력해주세요.');valid=false}else clearFieldError(partnerName);
      if(!partnerBirthDate?.value){setFieldError(partnerBirthDate,'상대방의 생년월일을 입력해주세요.');valid=false}else clearFieldError(partnerBirthDate);
    }

    if(!consent?.checked){if(formStatus)formStatus.textContent='분석을 진행하려면 입력 정보 사용에 동의해주세요.';valid=false}
    if(!valid){readingForm.querySelector('[aria-invalid="true"]')?.focus();return}

    const data=new FormData(readingForm);
    const birthTime=data.get('birthTime')||'출생 시간 미입력';
    const calendarType=data.get('calendarType')==='lunar'?'음력':'양력';
    if(formStatus)formStatus.textContent=`${data.get('profileName')}님의 ${service.title} 분석 정보가 확인되었습니다. ${data.get('birthDate')} · ${birthTime} · ${calendarType} 기준으로 분석합니다.`;
  });
  syncService();
}

function addHomeServiceVisuals(){
  if(!document.body || !document.querySelector('.catalog-section')) return;
  if(document.querySelector('.home-service-visuals')) return;

  const items=[
    ['01','종합 사주','기질과 삶의 큰 구조','./saju.html','https://nineworksdatabase.planus253.workers.dev/cdn/test/20260907-060437-1-6ea6ea3f.webp'],
    ['02','오행 분석','목·화·토·금·수의 균형','./ohaeng.html','https://nineworksdatabase.planus253.workers.dev/cdn/test/20260907-060438-2-b3ce5dc2.webp'],
    ['03','오늘의 운세','오늘 들어오는 기운의 흐름','./fortune.html','https://nineworksdatabase.planus253.workers.dev/cdn/test/20260907-060438-3-2cdbfb70.webp'],
    ['04','연애와 인연','관계를 맺는 방식과 반복 패턴','./relationship.html','https://nineworksdatabase.planus253.workers.dev/cdn/test/20260907-060439-4-e2399ab7.webp'],
    ['05','궁합','두 사람의 흐름과 관계의 특징','./compatibility.html','https://nineworksdatabase.planus253.workers.dev/cdn/test/20260907-060440-5-677398ac.webp'],
    ['06','일과 재물','업무 성향과 재물 흐름','./work-money.html','https://nineworksdatabase.planus253.workers.dev/cdn/test/20260907-060440-6-ef49b21c.webp'],
    ['07','정월록','내가 본 풀이를 한곳에 기록','./archive.html','https://nineworksdatabase.planus253.workers.dev/cdn/test/20260907-060441-7-9ce562e0.webp']
  ];

  const section=document.createElement('section');
  section.className='home-service-visuals';
  section.innerHTML=`<div class="container"><div class="section-head"><p class="section-label">SERVICES</p><h2>보고 싶은 흐름을 골라보세요.</h2><p>필요한 주제부터 가볍게 시작하고, 같은 사주 원본을 기준으로 이어서 볼 수 있습니다.</p></div><div class="service-visual-grid">${items.map(([n,title,desc,href,img])=>`<a class="service-visual-card" href="${href}" style="background-image:url('${img}')"><span class="visual-index">${n}</span><div><h3>${title}</h3><p>${desc}</p></div></a>`).join('')}</div></div>`;

  const catalog=document.querySelector('.catalog-section');
  catalog.parentNode.insertBefore(section,catalog);
}
addHomeServiceVisuals();

if(document.querySelector('#reviews') && document.body.dataset.reviewsPage!=='true'){
  const reviewScript=document.createElement('script');
  reviewScript.src='./reviews.js';
  reviewScript.defer=true;
  document.body.appendChild(reviewScript);
}

const signupForm=document.querySelector('[data-signup-form]');
if(signupForm){
  const status=signupForm.querySelector('[data-signup-status]');
  signupForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    if(status) status.textContent='회원등록 화면은 준비되었습니다. Firebase Authentication 연결 후 실제 계정 생성 기능을 활성화할 수 있습니다.';
  });
}
