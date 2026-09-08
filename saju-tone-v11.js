(()=>{
  const root=document.querySelector('main');
  if(!root)return;
  const skip='.evidence-content,.fortune-evidence-content,.relationship-evidence-content,.work-evidence-content,.guide-evidence-content,code,pre,script,style';
  const replacements=[
    ['참고 숫자','행운 숫자'],['참고 방향','행운 방향'],['참고 시간대','좋은 시간대'],['참고 키워드','행운 키워드'],['참고 지표','해석 지수'],['참고지수','해석지수'],
    ['참고할 날짜','좋은 날'],['참고할 수 있는 날짜','좋은 날'],['참고용 순위','택일 순위'],['참고용','해석용'],['참고값','해석값'],['참고 항목','해석 항목'],['참고 주제','해석 주제'],
    ['가볍게 참고해보세요.','오늘의 기운으로 활용해보세요.'],['재미로 참고할 수 있는','오늘의 흐름으로 고를 수 있는'],['재미로 참고해보세요.','오늘의 흐름에 맞춰 골라보세요.'],
    ['미래의 특정 결과를 보장하지 않습니다.',''],['특정 사건의 발생이나 결과를 보장하지 않습니다.',''],['행운이나 특정 결과를 보장하지 않습니다.',''],['결과를 보장하는 숫자가 아니라',''],
    ['실제 일정이 가능한 날들 사이에서 마지막 후보를 좁히는 용도로 활용해주세요.',''],['실제 계약·입주 일정이 정해져 있다면 무리해서 바꿀 필요는 없습니다.',''],
    ['업무 조건, 기관 운영일, 당사자 사정이 우선입니다.',''],['관리사무소, 이사업체, 잔금·등기 일정이 가능한 날짜 중에서 후보를 좁히는 방식으로 활용해주세요.',''],
    ['중요한 법률·의료·투자 결정은 관련 전문가와 실제 조건을 함께 확인하세요.',''],
    ['미래 사건을 확정하거나 특정 결과를 보장하지 않습니다.','']
  ];
  function cleanText(value){
    let t=String(value||'');
    replacements.forEach(([a,b])=>{t=t.split(a).join(b);});
    t=t.replace(/\s{2,}/g,' ').replace(/\s+([,.!?])/g,'$1').trim();
    return t;
  }
  function apply(){
    root.querySelectorAll('p,span,strong,h1,h2,h3,li,small').forEach(node=>{
      if(node.closest(skip)||node.children.length)return;
      const next=cleanText(node.textContent);
      if(next!==node.textContent)node.textContent=next;
    });
  }
  let queued=false,observer;
  const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;observer?.disconnect();try{apply();}finally{observer?.observe(root,{subtree:true,childList:true,characterData:true});}});};
  observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true});
  apply();[600,1800,3200,5200].forEach(ms=>setTimeout(schedule,ms));
})();
