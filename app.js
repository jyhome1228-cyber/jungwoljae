function applyBrandFavicon(){
  document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"],link[rel="mask-icon"]').forEach((link)=>link.remove());
  const favicon=document.createElement('link');favicon.rel='icon';favicon.type='image/svg+xml';favicon.href='./logo.svg?v=20260907-1815';document.head.appendChild(favicon);
  const shortcut=document.createElement('link');shortcut.rel='shortcut icon';shortcut.href='./logo.svg?v=20260907-1815';document.head.appendChild(shortcut);
  const mask=document.createElement('link');mask.rel='mask-icon';mask.href='./logo.svg?v=20260907-1815';mask.color='#543a3a';document.head.appendChild(mask);
}
applyBrandFavicon();
const currentFile=location.pathname.split('/').pop()||'index.html';
const quickProfilePages=new Set(['tomorrow.html','lucky-number.html','important-day.html','moving-day.html']);
const profilePages=new Set(['saju.html','ohaeng.html','fortune.html','relationship.html','work-money.html','guide.html',...quickProfilePages]);
const isResultLike=currentFile.endsWith('-result.html')||currentFile==='compatibility-report.html';
[['./theme-dark.css','stylesheet'],['./theme-tuning.css','stylesheet'],['./theme-polish.css','stylesheet'],['./footer-fix.css?v=20260907-1548','stylesheet'],['./site-mobile.css?v=20260908-2106','stylesheet'],['./ui-fixes.css?v=20260908-1334','stylesheet'],['./friendly-content.css?v=20260908-1140','stylesheet']].forEach(([href])=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l);});
if(profilePages.has(currentFile)){const l=document.createElement('link');l.rel='stylesheet';l.href='./basic-profile.css?v=20260908-2106';document.head.appendChild(l);}
if(isResultLike){
  const r=document.createElement('link');r.rel='stylesheet';r.href='./result-readability.css?v=20260907-2257';document.head.appendChild(r);
  const q=document.createElement('link');q.rel='stylesheet';q.href='./result-quality-v7.css?v=20260908-2235';document.head.appendChild(q);
}
const universalUi=document.createElement('link');universalUi.rel='stylesheet';universalUi.href='./universal-structure-v8.css?v=20260909-0404';document.head.appendChild(universalUi);
if(isResultLike){const contrast=document.createElement('link');contrast.rel='stylesheet';contrast.href='./brand-contrast-v8.css?v=20260909-0404';document.head.appendChild(contrast);}
if(currentFile==='fortune-result.html'){const fx=document.createElement('link');fx.rel='stylesheet';fx.href='./fortune-experience-v9.css?v=20260909-0516';document.head.appendChild(fx);}
if(document.body?.classList.contains('about-page')){const l=document.createElement('link');l.rel='stylesheet';l.href='./about.css';document.head.appendChild(l);}
const themeMeta=document.querySelector('meta[name="theme-color"]');if(themeMeta)themeMeta.setAttribute('content','#ffffff');
function applyBrandLogo(){document.querySelectorAll('.brand').forEach(brand=>{brand.innerHTML='<img class="brand-logo" src="./logo.svg" alt="" aria-hidden="true"><span class="brand-name">정월재</span>';});}applyBrandLogo();
function normalizeNavigation(){
  const primaryLinks=[['./saju.html','사주'],['./ohaeng.html','오행'],['./fortune.html','오늘의 운세'],['./tomorrow.html','내일의 운세'],['./relationship.html','인연'],['./compatibility.html','궁합'],['./work-money.html','일·재물'],['./guide.html','정월도감'],['./talisman.html','정월부적'],['./lucky-number.html','행운의 숫자'],['./important-day.html','중요한 날'],['./moving-day.html','이사 택일'],['./archive.html','정월록'],['./reviews.html','후기'],['./about.html','소개']];
  document.querySelectorAll('.desktop-nav, .mobile-menu nav').forEach(nav=>{nav.innerHTML=primaryLinks.map(([href,label])=>`<a href="${href}"${currentFile===href.replace('./','')?' aria-current="page"':''}>${label}</a>`).join('');});
  document.querySelectorAll('.secondary-nav .container').forEach(nav=>{[...nav.querySelectorAll('a')].forEach(link=>{if(link.getAttribute('href')?.includes('fortune.html'))link.textContent='오늘의 운세';});});
  document.querySelectorAll('.header-cta').forEach(cta=>{cta.href='./signup.html';cta.textContent='회원등록';});
  document.querySelectorAll('a[href="#reviews"]').forEach(link=>link.setAttribute('href','./reviews.html'));
}
normalizeNavigation();
const menuButton=document.querySelector('[data-menu-button]'),mobileMenu=document.querySelector('[data-mobile-menu]'),yearNode=document.querySelector('[data-year]'),readingForm=document.querySelector('[data-reading-form]'),formStatus=document.querySelector('[data-form-status]');
if(yearNode)yearNode.textContent=new Date().getFullYear();
function setMenu(open){if(!menuButton||!mobileMenu)return;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');mobileMenu.hidden=!open;document.body.classList.toggle('menu-open',open);}
menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
window.addEventListener('resize',()=>{if(window.innerWidth>=1280)setMenu(false)});
document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false)});
mobileMenu?.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false)});
function scrollToTarget(target){const el=document.querySelector(target);if(!el)return;const header=document.querySelector('.site-header');const offset=(header?.offsetHeight||0)+18;const top=el.getBoundingClientRect().top+window.scrollY-offset;window.scrollTo({top,behavior:'smooth'});}
document.addEventListener('click',event=>{const anchor=event.target.closest('a[href^="#"]');if(!anchor)return;const href=anchor.getAttribute('href');if(!href||href==='#')return;const target=document.querySelector(href);if(!target)return;event.preventDefault();scrollToTarget(href);});
const reviewsSection=document.querySelector('#reviews');if(reviewsSection){const s=document.createElement('script');s.type='module';s.src='./reviews.js?v=20260907-02';document.body.appendChild(s);}
const footer=document.querySelector('.site-footer');if(footer&&!footer.dataset.enhanced){footer.dataset.enhanced='true';const s=document.createElement('script');s.src='./footer.js?v=20260908-1255';s.defer=true;document.body.appendChild(s);}
const authScript=document.createElement('script');authScript.type='module';authScript.src='./auth.js?v=20260908-0731';document.body.appendChild(authScript);
const analyticsScript=document.createElement('script');analyticsScript.type='module';analyticsScript.src='./analytics.js?v=20260908-1255';document.body.appendChild(analyticsScript);
if(profilePages.has(currentFile)){
  const s=document.createElement('script');s.type='module';
  s.src=quickProfilePages.has(currentFile)?'./quick-profile.js?v=20260908-1345':'./basic-profile.js?v=20260908-0247';
  document.body.appendChild(s);
}
if(isResultLike){
  if(currentFile.endsWith('-result.html')){const e=document.createElement('script');e.type='module';e.src='./reading-event.js?v=20260908-0620';document.body.appendChild(e);}
  setTimeout(()=>{const q=document.createElement('script');q.src='./result-quality-v7.js?v=20260908-2235';q.defer=true;document.body.appendChild(q);},1800);
}
if(currentFile==='fortune-result.html'){
  const fx=document.createElement('script');fx.type='module';fx.src='./fortune-experience-v9.js?v=20260909-0516';document.body.appendChild(fx);
  const fix=document.createElement('script');fix.src='./fortune-layout-fix-v10.js?v=20260909-0516';fix.defer=true;document.body.appendChild(fix);
}
function fieldError(form,name,message=''){const node=form.querySelector(`[data-error-for="${name}"]`);if(node)node.textContent=message;}
readingForm?.addEventListener('submit',event=>{
  if(currentFile==='compatibility.html'||readingForm.matches('[data-saju-form],[data-ohaeng-form],[data-fortune-form],[data-relationship-form]'))return;
  event.preventDefault();formStatus.textContent='';readingForm.querySelectorAll('[data-error-for]').forEach(el=>el.textContent='');const required=[...readingForm.querySelectorAll('[required]')];let firstInvalid=null;
  required.forEach(field=>{const type=field.getAttribute('type');const invalid=(type==='checkbox'&&!field.checked)||(!type||type!=='checkbox')&&!String(field.value||'').trim();if(invalid){firstInvalid||=field;fieldError(readingForm,field.id||field.name,'필수 입력 항목입니다.');}});
  if(firstInvalid){formStatus.textContent='필수 항목을 확인해주세요.';firstInvalid.focus();return;}
  const service=readingForm.querySelector('input[name="serviceType"]:checked')?.value||'';formStatus.textContent='입력 내용을 확인했습니다. 결과 페이지 연결을 준비하고 있습니다.';formStatus.dataset.state='success';setTimeout(()=>{formStatus.textContent=`${service||'선택한'} 분석 결과 화면을 준비 중입니다.`;},300);
});
