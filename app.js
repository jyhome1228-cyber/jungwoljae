function applyBrandFavicon(){
  document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"],link[rel="mask-icon"]').forEach(link=>link.remove());
  const favicon=document.createElement('link');favicon.rel='icon';favicon.type='image/svg+xml';favicon.href='./logo.svg?v=20260907-1815';document.head.appendChild(favicon);
  const shortcut=document.createElement('link');shortcut.rel='shortcut icon';shortcut.href='./logo.svg?v=20260907-1815';document.head.appendChild(shortcut);
  const mask=document.createElement('link');mask.rel='mask-icon';mask.href='./logo.svg?v=20260907-1815';mask.color='#543a3a';document.head.appendChild(mask);
}
applyBrandFavicon();

const currentFile=location.pathname.split('/').pop()||'index.html';
const quickProfilePages=new Set(['tomorrow.html','lucky-number.html','important-day.html','moving-day.html']);
const profilePages=new Set(['ohaeng.html','fortune.html','relationship.html','work-money.html','guide.html',...quickProfilePages]);
const isResultLike=currentFile.endsWith('-result.html')||currentFile==='compatibility-report.html';
const isFortuneResult=currentFile==='fortune-result.html';

function addStyle(href){const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l);}
[['./theme-dark.css'],['./theme-tuning.css'],['./theme-polish.css'],['./footer-fix.css?v=20260907-1548'],['./site-mobile.css?v=20260908-2106'],['./ui-fixes.css?v=20260911-1428'],['./friendly-content.css?v=20260908-1140']].forEach(([href])=>addStyle(href));
if(profilePages.has(currentFile))addStyle('./basic-profile.css?v=20260908-2106');
if(isResultLike&&!isFortuneResult){addStyle('./result-readability.css?v=20260907-2257');addStyle('./result-quality-v7.css?v=20260910-2140');}
addStyle('./universal-structure-v8.css?v=20260909-0404');
addStyle('./birth-input-unified.css?v=20260909-2205');
addStyle('./saju-loading.css?v=20260909-2340');
if(isResultLike&&!isFortuneResult)addStyle('./brand-contrast-v8.css?v=20260909-0404');
if(document.body?.classList.contains('about-page'))addStyle('./about.css');
addStyle('./qa-hardening.css?v=20260910-2150');
addStyle('./welcome-popup.css?v=20260911-1702');

const useUniversalResultLoader=isResultLike;
const resultMain=useUniversalResultLoader?document.querySelector('main'):null;
if(resultMain){resultMain.style.visibility='hidden';document.body.classList.add('reading-result-pending');}
const loaderCopy={
  'ohaeng-result.html':{eyebrow:'JUNGWOLJAE · FIVE ELEMENTS',title:'생활 속 다섯 가지 힘을 정리하고 있습니다.',messages:['시작·표현·관리·판단·관찰의 비중을 살펴보고 있습니다.','자연스럽게 잘 쓰는 힘과 한 번 더 챙길 힘을 정리하고 있습니다.','생활에서 바로 이해할 수 있는 말로 결과를 다듬고 있습니다.']},
  'fortune-result.html':{eyebrow:'JUNGWOLJAE · DAILY FORTUNE',title:'오늘의 흐름을 차분히 읽고 있습니다.',messages:['내 흐름과 오늘의 흐름을 맞춰보고 있습니다.','일·재물·인연의 흐름을 각각 살펴보고 있습니다.','오늘에 필요한 핵심 내용을 정리하고 있습니다.']},
  'relationship-result.html':{eyebrow:'JUNGWOLJAE · RELATIONSHIP',title:'인연과 관계의 흐름을 살펴보고 있습니다.',messages:['감정 표현과 관계의 리듬을 확인하고 있습니다.','반복되는 패턴과 현재의 흐름을 함께 보고 있습니다.','관계에서 중요한 기준을 차분히 정리하고 있습니다.']},
  'work-money-result.html':{eyebrow:'JUNGWOLJAE · WORK & MONEY',title:'일과 재물의 흐름을 정리하고 있습니다.',messages:['일하는 방식과 돈을 다루는 습관을 살펴보고 있습니다.','강점과 부담이 생기는 지점을 함께 확인하고 있습니다.','현실적으로 참고할 수 있도록 결과를 정리하고 있습니다.']},
  'guide-result.html':{eyebrow:'JUNGWOLJAE · DOGAM',title:'정월도감의 해답을 준비하고 있습니다.',messages:['선택하신 고민과 현재 흐름을 함께 살펴보고 있습니다.','지금 결정에 영향을 주는 조건을 정리하고 있습니다.','바로 이해할 수 있는 기준으로 결과를 다듬고 있습니다.']},
  'compatibility-report.html':{eyebrow:'JUNGWOLJAE · COMPATIBILITY',title:'두 사람의 관계를 함께 살펴보고 있습니다.',messages:['두 사람의 생활 성향을 같은 기준으로 비교하고 있습니다.','편한 지점과 부딪히는 지점을 나누어 보고 있습니다.','관계의 구조가 잘 보이도록 결과를 정리하고 있습니다.']}
};
if(useUniversalResultLoader){
  import('./saju-loading.js?v=20260909-2340').then(({showSajuLoading})=>showSajuLoading({...loaderCopy[currentFile],duration:3600})).catch(error=>{console.error('reading loader failed',error);}).finally(()=>{if(resultMain)resultMain.style.visibility='';document.body.classList.remove('reading-result-pending','saju-loading-open');});
}

const themeMeta=document.querySelector('meta[name="theme-color"]');if(themeMeta)themeMeta.setAttribute('content','#ffffff');
function applyBrandLogo(){document.querySelectorAll('.brand').forEach(brand=>{brand.innerHTML='<img class="brand-logo" src="./logo.svg" alt="" aria-hidden="true"><span class="brand-name">정월재</span>';});}
applyBrandLogo();

function normalizeNavigation(){
  const primaryLinks=[['./ohaeng.html','오행'],['./fortune.html','오늘의 운세'],['./tomorrow.html','내일의 운세'],['./relationship.html','인연'],['./compatibility.html','궁합'],['./work-money.html','일·재물'],['./guide.html','정월도감'],['./talisman.html','정월부적'],['./lucky-number.html','행운의 숫자'],['./important-day.html','중요한 날'],['./moving-day.html','이사 택일'],['./archive.html','정월록'],['./reviews.html','후기'],['./about.html','소개']];
  document.querySelectorAll('.desktop-nav, .mobile-menu nav').forEach(nav=>{nav.innerHTML=primaryLinks.map(([href,label])=>`<a href="${href}"${currentFile===href.replace('./','')?' aria-current="page"':''}>${label}</a>`).join('');});
  document.querySelectorAll('.secondary-nav .container').forEach(nav=>{[...nav.querySelectorAll('a')].forEach(link=>{if(link.getAttribute('href')?.includes('fortune.html'))link.textContent='오늘의 운세';if(link.getAttribute('href')?.includes('saju.html'))link.remove();});});
  document.querySelectorAll('.header-cta').forEach(cta=>{cta.href='./signup.html';cta.textContent='회원등록';});
  document.querySelectorAll('a[href="#reviews"]').forEach(link=>link.setAttribute('href','./reviews.html'));
  document.querySelectorAll('a[href="./saju.html"],a[href="saju.html"],a[href$="/saju.html"]').forEach(link=>link.remove());
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
['./birth-input-unified.js?v=20260910-2005','./birth-time-unified.js?v=20260910-2005','./gender-unified.js?v=20260910-2005'].forEach(src=>{const s=document.createElement('script');s.src=src;s.defer=true;document.body.appendChild(s);});

if(profilePages.has(currentFile)){
  const s=document.createElement('script');s.type='module';
  s.src=quickProfilePages.has(currentFile)?'./quick-profile.js?v=20260909-2340':'./basic-profile.js?v=20260910-2035';
  document.body.appendChild(s);
}

if(isResultLike){
  if(currentFile.endsWith('-result.html')){const e=document.createElement('script');e.type='module';e.src='./reading-event.js?v=20260908-0620';document.body.appendChild(e);}
  if(!isFortuneResult){
    setTimeout(()=>{const q=document.createElement('script');q.src='./result-quality-v7.js?v=20260908-2235';q.defer=true;document.body.appendChild(q);},1800);
    const math=document.createElement('script');math.type='module';math.src='./result-calculation-v11.js?v=20260909-0750';document.body.appendChild(math);
    const tone=document.createElement('script');tone.src='./saju-tone-v11.js?v=20260909-0750';tone.defer=true;document.body.appendChild(tone);
  }
  const plain=document.createElement('script');plain.src='./result-plain-language-v2.js?v=20260910-2150';plain.defer=true;document.body.appendChild(plain);
}

function fieldError(form,name,message=''){const node=form.querySelector(`[data-error-for="${name}"]`);if(node)node.textContent=message;}
readingForm?.addEventListener('submit',event=>{
  if(currentFile==='compatibility.html'||readingForm.matches('[data-ohaeng-form],[data-fortune-form],[data-relationship-form]'))return;
  event.preventDefault();formStatus.textContent='';readingForm.querySelectorAll('[data-error-for]').forEach(el=>el.textContent='');const required=[...readingForm.querySelectorAll('[required]')];let firstInvalid=null;
  required.forEach(field=>{const type=field.getAttribute('type');const invalid=(type==='checkbox'&&!field.checked)||(!type||type!=='checkbox')&&!String(field.value||'').trim();if(invalid){firstInvalid||=field;fieldError(readingForm,field.id||field.name,'필수 입력 항목입니다.');}});
  if(firstInvalid){formStatus.textContent='필수 항목을 확인해주세요.';firstInvalid.focus();return;}
  const service=readingForm.querySelector('input[name="serviceType"]:checked')?.value||'';formStatus.textContent='입력 내용을 확인했습니다. 결과 페이지 연결을 준비하고 있습니다.';formStatus.dataset.state='success';setTimeout(()=>{formStatus.textContent=`${service||'선택한'} 분석 결과 화면을 준비 중입니다.`;},300);
});

if(['lucky-number.html','important-day.html','moving-day.html'].includes(currentFile)){
  const quickPolish=document.createElement('script');quickPolish.src='./quick-result-polish.js?v=20260910-2035';quickPolish.defer=true;document.body.appendChild(quickPolish);
}
const welcomePopupScript=document.createElement('script');welcomePopupScript.type='module';welcomePopupScript.src='./welcome-popup.js?v=20260911-1702';document.body.appendChild(welcomePopupScript);
const qaScript=document.createElement('script');qaScript.src='./qa-hardening.js?v=20260910-2140';qaScript.defer=true;document.body.appendChild(qaScript);