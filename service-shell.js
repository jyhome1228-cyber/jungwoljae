(()=>{
  'use strict';

  const currentFile=location.pathname.split('/').pop()||'index.html';
  const primaryLinks=[
    ['./ohaeng.html','오행'],
    ['./fortune.html','오늘의 운세'],
    ['./tomorrow.html','내일의 운세'],
    ['./relationship.html','인연'],
    ['./compatibility.html','궁합'],
    ['./work-money.html','일·재물'],
    ['./guide.html','정월도감'],
    ['./talisman.html','정월부적'],
    ['./lucky-number.html','행운의 숫자'],
    ['./important-day.html','중요한 날'],
    ['./moving-day.html','이사 택일'],
    ['./archive.html','정월록'],
    ['./reviews.html','후기'],
    ['./about.html','소개']
  ];

  function addStyle(href){
    const base=href.split('?')[0];
    if(document.querySelector(`link[href^="${base}"]`))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=href;
    document.head.appendChild(link);
  }
  addStyle('./auth.css?v=20260912-1108');

  function applyBrandFavicon(){
    document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"],link[rel="mask-icon"]').forEach(link=>link.remove());
    const favicon=document.createElement('link');
    favicon.rel='icon';favicon.type='image/svg+xml';favicon.href='./logo.svg?v=20260907-1815';
    document.head.appendChild(favicon);
    const shortcut=document.createElement('link');
    shortcut.rel='shortcut icon';shortcut.href='./logo.svg?v=20260907-1815';
    document.head.appendChild(shortcut);
  }
  applyBrandFavicon();

  document.querySelectorAll('.brand').forEach(brand=>{
    brand.innerHTML='<img class="brand-logo" src="./logo.svg" alt="" aria-hidden="true"><span class="brand-name">정월재</span>';
  });

  function renderNavigation(){
    document.querySelectorAll('.desktop-nav,.mobile-menu nav').forEach(nav=>{
      nav.innerHTML=primaryLinks.map(([href,label])=>`<a href="${href}"${currentFile===href.replace('./','')?' aria-current="page"':''}>${label}</a>`).join('');
    });
    document.querySelectorAll('.desktop-nav').forEach(nav=>nav.setAttribute('aria-label','주요 메뉴'));
  }
  renderNavigation();

  const menuButton=document.querySelector('[data-menu-button]');
  const mobileMenu=document.querySelector('[data-mobile-menu]');
  const headerCta=document.querySelector('.header-cta');

  function setMenu(open){
    if(!menuButton||!mobileMenu)return;
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
    mobileMenu.hidden=!open;
    document.body.classList.toggle('menu-open',open);
  }

  menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
  mobileMenu?.addEventListener('click',event=>{if(event.target.closest('a,button'))setMenu(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false);});
  window.addEventListener('resize',()=>{if(window.innerWidth>=1280)setMenu(false);});

  let authInstance=null;
  let authModule=null;

  async function doLogout(){
    try{
      if(authInstance&&authModule)await authModule.signOut(authInstance);
    }catch(error){
      console.error('header logout failed',error);
    }
  }

  function renderHeaderAuth(user){
    const signedIn=Boolean(user&&!user.isAnonymous);
    document.querySelectorAll('.auth-login-link,.auth-logout-button').forEach(el=>el.remove());

    if(headerCta){
      headerCta.href=signedIn?'./mypage.html':'./signup.html';
      headerCta.textContent=signedIn?'마이페이지':'회원등록';
    }

    document.querySelectorAll('.header-inner').forEach(header=>{
      if(signedIn){
        const logout=document.createElement('button');
        logout.type='button';
        logout.className='auth-logout-button';
        logout.textContent='로그아웃';
        logout.dataset.logout='true';
        logout.addEventListener('click',doLogout);
        header.appendChild(logout);
      }else{
        const login=document.createElement('a');
        login.href='./login.html';
        login.className='auth-login-link';
        login.textContent='로그인';
        header.appendChild(login);
      }
    });

    document.querySelectorAll('.mobile-menu nav').forEach(nav=>{
      nav.querySelectorAll('[data-auth-mobile]').forEach(el=>el.remove());
      if(signedIn){
        const my=document.createElement('a');
        my.href='./mypage.html';my.textContent='마이페이지';my.className='mobile-auth-item';my.dataset.authMobile='true';
        const logout=document.createElement('button');
        logout.type='button';logout.textContent='로그아웃';logout.className='mobile-auth-logout';logout.dataset.authMobile='true';logout.dataset.logout='true';
        logout.addEventListener('click',doLogout);
        nav.append(my,logout);
      }else{
        const login=document.createElement('a');
        login.href='./login.html';login.textContent='로그인';login.className='mobile-auth-item';login.dataset.authMobile='true';
        const signup=document.createElement('a');
        signup.href='./signup.html';signup.textContent='회원등록';signup.className='mobile-auth-item';signup.dataset.authMobile='true';
        nav.append(login,signup);
      }
    });
  }

  // Render a complete guest header immediately so the layout is stable before Firebase resolves.
  renderHeaderAuth(null);

  (async()=>{
    try{
      const modules=Promise.all([
        import('./firebase-config.js?v=20260907-1645'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js')
      ]);
      const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('auth-timeout')),3500));
      const [{firebaseConfig},appMod,authMod]=await Promise.race([modules,timeout]);
      const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(firebaseConfig);
      authInstance=authMod.getAuth(app);
      authModule=authMod;
      authMod.onAuthStateChanged(authInstance,user=>renderHeaderAuth(user),()=>renderHeaderAuth(null));
      if(authInstance.currentUser)renderHeaderAuth(authInstance.currentUser);
    }catch(error){
      renderHeaderAuth(null);
    }
  })();
})();
