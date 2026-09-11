(()=>{
  const footer=document.querySelector('.site-footer');
  if(!footer) return;

  // Homepage final-pass fixes must run after the shared runtime theme files.
  const currentFile=location.pathname.split('/').pop()||'index.html';
  if(currentFile==='index.html' && !document.getElementById('home-hero-contrast-fix')){
    const style=document.createElement('style');
    style.id='home-hero-contrast-fix';
    style.textContent=`
      .home-image-hero .home-image-hero-copy,
      .home-image-hero .home-image-hero-copy .eyebrow,
      .home-image-hero .home-image-hero-copy h1,
      .home-image-hero .home-image-hero-copy > p:not(.eyebrow){
        color:#fff!important;
      }
      .home-image-hero .button.secondary{
        color:#fff!important;
      }

      /* Keep Jungwol Dogam identical to the other homepage service cards.
         theme-polish.css used to make the 7th card span two columns. */
      .home-services .service-visual-card[href="./guide.html"]{
        grid-column:auto!important;
        grid-row:auto!important;
        width:auto!important;
        min-width:0!important;
        background-color:#3a2e2c!important;
        background-image:url('https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260908-101633-996b4914-fc05-4d0f-a690-8f4b684c6a0b-67d8544d.webp')!important;
        background-position:center!important;
        background-size:cover!important;
        background-repeat:no-repeat!important;
      }
      .home-services .service-visual-card[href="./guide.html"]::before{
        background:linear-gradient(to top,rgba(20,12,12,.94) 0%,rgba(20,12,12,.56) 38%,rgba(20,12,12,.14) 72%,rgba(20,12,12,.05) 100%)!important;
      }
      .home-services .service-visual-card[href="./guide.html"]::after{
        content:none!important;
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  footer.dataset.enhanced='true';
  footer.innerHTML=`
    <div class="container footer-minimal">
      <p>대표자 박재영</p>
    </div>`;

  if(!document.getElementById('footer-minimal-style')){
    const style=document.createElement('style');
    style.id='footer-minimal-style';
    style.textContent=`
      .site-footer{
        padding:28px 0!important;
        border-top:1px solid #eee7e3!important;
        background:#fff!important;
        color:#8a817d!important;
      }
      .site-footer .footer-minimal{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:min(calc(100% - 32px),1280px)!important;
        margin:0 auto!important;
        padding:0!important;
        text-align:center!important;
      }
      .site-footer .footer-minimal p{
        margin:0!important;
        color:#8a817d!important;
        font-size:11px!important;
        font-weight:500!important;
        line-height:18px!important;
        letter-spacing:-.01em!important;
      }
    `;
    document.head.appendChild(style);
  }
})();