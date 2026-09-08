(()=>{
  let input={};try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
  if(input.mode!=='tomorrow')return;
  document.title='내일의 운세 결과 — 정월재';
  function replaceText(){
    const root=document.querySelector('[data-fortune-result]');if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      if(n.parentElement?.closest('.fortune-evidence-content'))return;
      n.nodeValue=n.nodeValue
        .replaceAll('오늘 하루','내일 하루')
        .replaceAll('오늘의','내일의')
        .replaceAll('오늘은','내일은')
        .replaceAll('오늘을','내일을')
        .replaceAll('오늘로','내일로')
        .replaceAll('오늘과','내일과')
        .replaceAll('오늘이','내일이')
        .replaceAll('오늘 안에','내일 안에')
        .replaceAll('오늘','내일');
    });
    const kicker=root.querySelector('.fortune-kicker');if(kicker)kicker.textContent="TOMORROW'S FORTUNE · 正月齋";
  }
  [180,850,1800,4300,6200].forEach(ms=>setTimeout(replaceText,ms));
})();