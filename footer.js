(()=>{
  const footer=document.querySelector('.site-footer');
  if(!footer) return;

  // Homepage hero: shared/runtime theme styles can override index.html,
  // so apply the final contrast rule after those styles have loaded.
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