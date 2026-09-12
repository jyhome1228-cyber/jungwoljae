(()=>{
  'use strict';
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const isResult=file.endsWith('-result.html')||file==='compatibility-report.html';
  if(!isResult)return;

  const clean=value=>String(value||'').replace(/\s+/g,' ').trim();

  function finishTruncated(node){
    if(!node)return;
    const original=clean(node.textContent);
    if(!/(?:…|\.\.\.)$/.test(original))return;
    const body=original.replace(/(?:…|\.\.\.)$/,'').trim();
    let cut=-1;
    for(const mark of ['.','!','?','。'])cut=Math.max(cut,body.lastIndexOf(mark));
    if(cut>=Math.min(48,Math.floor(body.length*.45))){
      node.textContent=body.slice(0,cut+1).trim();
      return;
    }
    // If no complete sentence exists in the clipped range, prefer a short complete-looking
    // card over showing an obviously unfinished trailing phrase.
    const comma=Math.max(body.lastIndexOf(','),body.lastIndexOf('·'));
    if(comma>32){node.textContent=`${body.slice(0,comma).trim()}.`;return;}
    node.textContent=body.replace(/[\s,·]+$/,'')+'.';
  }

  function polishCompatibilitySummary(){
    if(file!=='compatibility-report.html')return;
    const summary=document.querySelector('[data-quality-summary]');
    if(!summary)return;
    const cards=[...summary.querySelectorAll('.quality-summary-card')];
    if(cards.length<3)return;

    const compare=[...document.querySelectorAll('[data-compare-grid] .compatibility-compare-card')];
    const advice=[...document.querySelectorAll('[data-advice] article')];
    const scoreCopy=document.querySelector('[data-score-copy]');
    const sources=[
      compare[0]?.querySelector('p'),
      compare[1]?.querySelector('p')||advice[0]?.querySelector('p'),
      scoreCopy||advice[1]?.querySelector('p')||advice[0]?.querySelector('p')
    ];
    sources.forEach((source,index)=>{
      const target=cards[index]?.querySelector('p');
      const value=clean(source?.textContent);
      if(target&&value)target.textContent=value;
    });
  }

  function run(){
    polishCompatibilitySummary();
    document.querySelectorAll('main p,main li').forEach(finishTruncated);
  }

  run();
  [350,900,1800,2600,3600,5200,7000].forEach(ms=>setTimeout(run,ms));

  const root=document.querySelector('main');
  if(root){
    let scheduled=false;
    const observer=new MutationObserver(()=>{
      if(scheduled)return;
      scheduled=true;
      requestAnimationFrame(()=>{scheduled=false;run();});
    });
    observer.observe(root,{subtree:true,childList:true,characterData:true});
    setTimeout(()=>observer.disconnect(),8500);
  }
})();
