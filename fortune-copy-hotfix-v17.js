(()=>{
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='fortune-result.html')return;

  const replacements=new Map([
    ['오늘은 욕심내지 말고 세 가지만 끝내세요. 일 하나, 돈 하나, 사람 하나면 충분합니다.','오늘은 새로운 일을 벌이기보다, 이미 시작한 일과 미뤄둔 정리를 끝내는 데 집중하세요.'],
    ['내일은 욕심내지 말고 세 가지만 끝내세요. 일 하나, 돈 하나, 사람 하나면 충분합니다.','내일은 새로운 일을 벌이기보다, 이미 시작한 일과 미뤄둔 정리를 끝내는 데 집중하세요.'],
    ['일 하나, 돈 하나, 사람 하나를 정리하세요.','가장 중요한 업무를 마감하고, 재물과 관계에서 미뤄둔 일을 정리하세요.'],
    ['돈과 사람 일을 하나씩 처리하세요.','재물과 관계에서 미뤄둔 일을 처리하세요.'],
    ['받을 돈·결제·연락 중 미뤄둔 것을 하나씩 정리하세요.','받을 돈과 불필요한 지출을 확인하고, 필요한 연락도 미루지 마세요.'],
    ['해야 할 일 세 가지만 정하고 나머지는 내일로 넘기세요.','오늘 꼭 끝낼 일만 남기고, 급하지 않은 일정은 내일로 넘기세요.'],
    ['세 가지를 넘겨 욕심내지 마세요.','오늘 꼭 끝낼 일의 수를 줄이고, 새 일을 추가하지 마세요.']
  ]);

  function polish(root=document.querySelector('[data-fortune-result]')){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      let value=node.nodeValue||'';
      replacements.forEach((to,from)=>{if(value.includes(from))value=value.replaceAll(from,to);});
      node.nodeValue=value;
    });
  }

  polish();
  const root=document.querySelector('[data-fortune-result]');
  if(!root)return;
  let queued=false;
  const observer=new MutationObserver(()=>{
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;polish(root);});
  });
  observer.observe(root,{subtree:true,childList:true,characterData:true});
  setTimeout(()=>polish(root),800);
  setTimeout(()=>polish(root),2200);
})();