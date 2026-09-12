(()=>{
  // Shared result bootstrap: every long-form result page already loads this file,
  // so keep editorial spacing/action polish in one place without duplicating HTML tags.
  const resultFile=(location.pathname.split('/').pop()||'').toLowerCase();
  const longResult=resultFile.endsWith('-result.html')||resultFile==='compatibility-report.html';
  if(longResult){
    if(!document.querySelector('link[href^="./result-editorial-v21.css"]')){
      const style=document.createElement('link');style.rel='stylesheet';style.href='./result-editorial-v21.css?v=20260912-2210';document.head.appendChild(style);
    }
    if(!document.querySelector('script[src^="./result-editorial-v21.js"]')){
      const editorial=document.createElement('script');editorial.src='./result-editorial-v21.js?v=20260912-2210';editorial.defer=true;document.body.appendChild(editorial);
    }
  }

  const SERVICE_PATHS={
    '오행 분석':'/ohaeng.html','오늘의 운세':'/fortune.html','내일의 운세':'/tomorrow.html','연애와 인연':'/relationship.html','궁합':'/compatibility.html','일과 재물':'/work-money.html','정월도감':'/guide.html','정월부적':'/talisman.html','행운의 숫자':'/lucky-number.html','중요한 날':'/important-day.html','이사 택일':'/moving-day.html'
  };
  const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
  const clip=(v,n=110)=>{const t=clean(v);return t.length>n?`${t.slice(0,n-1)}…`:t;};
  const text=(s,r=document)=>clean(r.querySelector(s)?.textContent||'');
  const serviceUrl=s=>new URL(SERVICE_PATHS[s]||'/',location.origin).href;
  const reviewUrl=s=>{const u=new URL('/reviews.html',location.origin);u.searchParams.set('write','1');u.searchParams.set('service',s);return u.href;};
  const status=(n,m)=>{if(n)n.textContent=m||'';};

  async function copy(value){
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);return;}
    const ta=document.createElement('textarea');ta.value=value;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
  }

  function fortuneService(){
    try{return JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}').mode==='tomorrow'?'내일의 운세':'오늘의 운세';}
    catch(e){return '오늘의 운세';}
  }

  function context(){
    if(document.querySelector('[data-ohaeng-result]'))return {service:'오행 분석',summary:text('[data-total-summary]')||text('[data-summary]')};
    if(document.querySelector('[data-fortune-result]'))return {service:fortuneService(),summary:text('[data-headline]')||text('[data-total-summary]')||text('[data-summary]')};
    if(document.querySelector('[data-relationship-result]'))return {service:'연애와 인연',summary:text('[data-total-summary]')||text('[data-summary]')};
    if(document.querySelector('[data-compatibility-report]'))return {service:'궁합',summary:text('[data-total-summary]')||text('[data-score-title]')||text('[data-summary]')};
    if(document.querySelector('[data-work-result]'))return {service:'일과 재물',summary:text('[data-total-summary]')||text('[data-summary]')};
    if(document.querySelector('[data-guide-result]'))return {service:'정월도감',summary:text('[data-answer]')||text('[data-lead]')};
    const tool=document.body.dataset.quickTool;
    if(tool==='lucky-number')return {service:'행운의 숫자',summary:text('[data-quick-result-lead]')||text('[data-quick-result-title]')};
    if(tool==='important-day')return {service:'중요한 날',summary:text('[data-quick-result-lead]')||text('[data-quick-result-title]')};
    if(tool==='moving')return {service:'이사 택일',summary:text('[data-quick-result-lead]')||text('[data-quick-result-title]')};
    if(document.querySelector('[data-talisman-modal]'))return {service:'정월부적',summary:`${text('[data-modal-title]')} ${text('[data-modal-summary]')}`};
    return null;
  }

  async function shareToKakao(c,node){
    const url=serviceUrl(c.service),message=clip(c.summary||`정월재에서 ${c.service} 결과를 확인해보세요.`);
    if(navigator.share){
      try{await navigator.share({title:`정월재 · ${c.service}`,text:message,url});status(node,'공유 메뉴를 열었습니다. 카카오톡을 선택해 공유할 수 있습니다.');return;}
      catch(e){if(e?.name==='AbortError')return;}
    }
    try{await copy(`정월재 · ${c.service}\n${message}\n${url}`);status(node,'카카오톡에 붙여넣을 문구와 링크를 복사했습니다.');}
    catch(e){status(node,'공유하지 못했습니다. 잠시 후 다시 시도해주세요.');}
  }

  async function shareLink(c,node){
    try{await copy(serviceUrl(c.service));status(node,`${c.service} 링크를 복사했습니다.`);}
    catch(e){status(node,'링크를 복사하지 못했습니다. 잠시 후 다시 시도해주세요.');}
  }

  function mount(host){
    if(!host||host.querySelector(':scope > [data-jw-result-share]'))return;
    const box=document.createElement('div');box.className='jw-result-share';box.dataset.jwResultShare='true';
    box.innerHTML='<button type="button" class="jw-share-button is-kakao" data-jw-kakao>카카오톡 공유</button><button type="button" class="jw-share-button" data-jw-link>링크 공유</button><button type="button" class="jw-share-button is-review" data-jw-review>리뷰 남기기</button><p class="jw-share-status" role="status" aria-live="polite" data-jw-share-status></p>';
    host.appendChild(box);
    const msg=box.querySelector('[data-jw-share-status]');
    box.querySelector('[data-jw-kakao]').addEventListener('click',()=>{const c=context();if(c)shareToKakao(c,msg);});
    box.querySelector('[data-jw-link]').addEventListener('click',()=>{const c=context();if(c)shareLink(c,msg);});
    box.querySelector('[data-jw-review]').addEventListener('click',()=>{const c=context();if(c)location.href=reviewUrl(c.service);});
  }

  function init(){
    mount(document.querySelector('.report-actions,.fortune-actions,.relationship-actions,.work-actions,.guide-actions'));
    const quick=document.querySelector('[data-quick-result]');
    if(quick){const q=()=>{if(!quick.hidden)mount(quick);};q();new MutationObserver(q).observe(quick,{attributes:true,attributeFilter:['hidden']});}
    const modal=document.querySelector('[data-talisman-modal]'),actions=document.querySelector('.talisman-modal-actions');
    if(modal&&actions){const t=()=>{if(!modal.hidden)mount(actions);};t();new MutationObserver(t).observe(modal,{attributes:true,attributeFilter:['hidden','aria-hidden']});}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
