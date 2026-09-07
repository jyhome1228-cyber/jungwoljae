function applyBrandFavicon(){
  document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"],link[rel="mask-icon"]').forEach((link)=>link.remove());

  const favicon=document.createElement('link');
  favicon.rel='icon';
  favicon.type='image/svg+xml';
  favicon.href='./logo.svg?v=20260907-1815';
  document.head.appendChild(favicon);

  const shortcut=document.createElement('link');
  shortcut.rel='shortcut icon';
  shortcut.href='./logo.svg?v=20260907-1815';
  document.head.appendChild(shortcut);

  const mask=document.createElement('link');
  mask.rel='mask-icon';
  mask.href='./logo.svg?v=20260907-1815';
  mask.color='#543a3a';
  document.head.appendChild(mask);
}
applyBrandFavicon();

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

const footerFixLink = document.createElement('link');
footerFixLink.rel = 'stylesheet';
footerFixLink.href = './footer-fix.css?v=20260907-1548';
document.head.appendChild(footerFixLink);

if (document.body?.classList.contains('about-page')) {
  const aboutLink = document.createElement('link');
  aboutLink.rel = 'stylesheet';
  aboutLink.href = './about.css';
  document.head.appendChild(aboutLink);
}

const themeMeta = document.querySelector('meta[name="theme-color"]');
if (themeMeta) themeMeta.setAttribute('content', '#ffffff');

function applyBrandLogo(){
  document.querySelectorAll('.brand').forEach((brand)=>{
    brand.innerHTML = '<img class="brand-logo" src="./logo.svg" alt="" aria-hidden="true"><span class="brand-name">정월재</span>';
  });
}
applyBrandLogo();

function normalizeNavigation(){
  const primaryLinks = [
    ['./saju.html','사주'],
    ['./ohaeng.html','오행'],
    ['./fortune.html','오늘의 운세'],
    ['./relationship.html','인연'],
    ['./work-money.html','일·재물'],
    ['./archive.html','정월록'],
    ['./reviews.html','후기'],
    ['./about.html','소개']
  ];
  const currentPath = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.desktop-nav, .mobile-menu nav').forEach((nav)=>{
    nav.innerHTML = primaryLinks.map(([href,label])=>{
      const file = href.replace('./','');
      const current = currentPath === file ? ' aria-current="page"' : '';
      return `<a href="${href}"${current}>${label}</a>`;
    }).join('');
  });
  document.querySelectorAll('.secondary-nav .container').forEach((nav)=>{
    [...nav.querySelectorAll('a')].forEach((link)=>{
      if(link.getAttribute('href')?.includes('fortune.html')) link.textContent='오늘의 운세';
    });
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
menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
window.addEventListener('resize',()=>{if(window.innerWidth>900)setMenu(false)});
document.addEventListener('keydown',(event)=>{if(event.key==='Escape')setMenu(false)});
mobileMenu?.addEventListener('click',(event)=>{if(event.target.closest('a'))setMenu(false)});

function scrollToTarget(target){
  const el=document.querySelector(target);
  if(!el)return;
  const header=document.querySelector('.site-header');
  const offset=(header?.offsetHeight||0)+18;
  const top=el.getBoundingClientRect().top+window.scrollY-offset;
  window.scrollTo({top,behavior:'smooth'});
}
document.addEventListener('click',(event)=>{
  const anchor=event.target.closest('a[href^="#"]');
  if(!anchor)return;
  const href=anchor.getAttribute('href');
  if(!href||href==='#')return;
  const target=document.querySelector(href);
  if(!target)return;
  event.preventDefault();
  scrollToTarget(href);
});

const reviewsSection=document.querySelector('#reviews');
if(reviewsSection){
  const reviewsScript=document.createElement('script');
  reviewsScript.type='module';
  reviewsScript.src='./reviews.js?v=20260907-02';
  document.body.appendChild(reviewsScript);
}

const footer=document.querySelector('.site-footer');
if(footer && !footer.dataset.enhanced){
  footer.dataset.enhanced='true';
  const footerScript=document.createElement('script');
  footerScript.src='./footer.js?v=20260907-01';
  footerScript.defer=true;
  document.body.appendChild(footerScript);
}

const authScript=document.createElement('script');
authScript.type='module';
authScript.src='./auth.js?v=20260907-08';
document.body.appendChild(authScript);

const analyticsScript=document.createElement('script');
analyticsScript.type='module';
analyticsScript.src='./analytics.js?v=20260907-01';
document.body.appendChild(analyticsScript);

function fieldError(form,name,message=''){
  const node=form.querySelector(`[data-error-for="${name}"]`);
  if(node)node.textContent=message;
}

readingForm?.addEventListener('submit',(event)=>{
  if(readingForm.matches('[data-saju-form],[data-ohaeng-form],[data-fortune-form],[data-relationship-form]'))return;
  event.preventDefault();
  formStatus.textContent='';
  readingForm.querySelectorAll('[data-error-for]').forEach(el=>el.textContent='');
  const required=[...readingForm.querySelectorAll('[required]')];
  let firstInvalid=null;
  required.forEach((field)=>{
    const type=field.getAttribute('type');
    const invalid=(type==='checkbox'&&!field.checked)||(!type||type!=='checkbox')&&!String(field.value||'').trim();
    if(invalid){
      firstInvalid ||= field;
      fieldError(readingForm,field.id||field.name,'필수 입력 항목입니다.');
    }
  });
  if(firstInvalid){formStatus.textContent='필수 항목을 확인해주세요.';firstInvalid.focus();return;}
  const service=readingForm.querySelector('input[name="serviceType"]:checked')?.value||'';
  formStatus.textContent='입력 내용을 확인했습니다. 결과 페이지 연결을 준비하고 있습니다.';
  formStatus.dataset.state='success';
  setTimeout(()=>{formStatus.textContent=`${service||'선택한'} 분석 결과 화면을 준비 중입니다.`;},300);
});
