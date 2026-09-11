(()=>{
  'use strict';

  const removeRetiredReviews=()=>{
    const grid=document.querySelector('[data-review-grid]');
    if(!grid)return;

    [...grid.querySelectorAll('.review-entry')].forEach(card=>{
      const badge=card.querySelector('.review-badge')?.textContent?.trim();
      if(badge==='종합 사주')card.remove();
    });

    const visible=[...grid.querySelectorAll('.review-entry')];
    const count=document.querySelector('[data-review-count]');
    if(count)count.textContent=String(visible.length);

    const ratings=visible.map(card=>{
      const label=card.querySelector('.review-stars')?.getAttribute('aria-label')||'';
      const match=label.match(/([0-5](?:\.\d+)?)\s*점/);
      return match?Number(match[1]):0;
    }).filter(Boolean);
    const average=document.querySelector('[data-review-average]');
    if(average)average.textContent=ratings.length?(ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1):'—';
  };

  const removeRetiredOptions=()=>{
    document.querySelectorAll('select option').forEach(option=>{
      if(option.textContent?.trim()==='종합 사주')option.remove();
    });
  };

  removeRetiredOptions();
  removeRetiredReviews();

  const grid=document.querySelector('[data-review-grid]');
  if(grid){
    const observer=new MutationObserver(()=>removeRetiredReviews());
    observer.observe(grid,{childList:true,subtree:true});
  }
})();
