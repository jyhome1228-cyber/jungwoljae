(()=>{
  'use strict';

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
  mobileMenu?.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false);});
  window.addEventListener('resize',()=>{if(window.innerWidth>=1280)setMenu(false);});

  // Keep the header layout stable. Auth only changes the existing CTA text/link;
  // it never inserts/removes menu items on these service pages.
  (async()=>{
    if(!headerCta)return;
    try{
      const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('auth-timeout')),1800));
      const [{firebaseConfig},appMod,authMod]=await Promise.race([
        Promise.all([
          import('./firebase-config.js?v=20260907-1645'),
          import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),
          import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js')
        ]),
        timeout
      ]);
      const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(firebaseConfig);
      const auth=authMod.getAuth(app);
      let done=false;
      let stop=()=>{};
      const finish=user=>{
        if(done)return;
        done=true;
        try{stop();}catch(e){}
        if(user&&!user.isAnonymous){
          headerCta.href='./mypage.html';
          headerCta.textContent='마이페이지';
        }else{
          headerCta.href='./signup.html';
          headerCta.textContent='회원등록';
        }
      };
      stop=authMod.onAuthStateChanged(auth,finish,()=>finish(null));
      setTimeout(()=>finish(auth.currentUser||null),1600);
    }catch(e){
      headerCta.href='./signup.html';
      headerCta.textContent='회원등록';
    }
  })();
})();
