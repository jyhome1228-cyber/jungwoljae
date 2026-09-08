(()=>{
  const root=document.querySelector('[data-fortune-result]');
  if(!root)return;
  let input={};try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
  const tomorrow=input.mode==='tomorrow';
  const dayWord=tomorrow?'내일':'오늘';
  const $=(s,r=root)=>r.querySelector(s);
  const text=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();

  function tone(){
    const h=text($('[data-headline]'));
    if(/밀어|실행|움직|꺼내|한 걸음/.test(h))return 'go';
    if(/점검|확인|서두르지|천천히/.test(h))return 'check';
    return 'balance';
  }

  function compactTip(){
    const final=$('[data-tip-final]');
    if(!final)return;
    const copy={
      go:`${dayWord}은 준비한 일 하나를 실제 행동으로 옮겨보세요. 다만 한 번에 여러 일을 벌이기보다 가장 중요한 한 가지부터 시작하는 편이 좋습니다.`,
      check:`${dayWord}은 중요한 조건을 한 번 더 확인하고 움직여보세요. 결정을 미루라는 뜻보다 빠진 부분을 줄인 뒤 확정하는 편이 좋다는 의미입니다.`,
      balance:`${dayWord}은 새로운 선택지를 늘리기보다 진행 중인 일의 다음 순서를 먼저 정리해보세요. 작은 일 하나를 끝내는 것부터 시작하면 충분합니다.`
    }[tone()];
    if(text(final)!==copy)final.textContent=copy;
  }

  function normalizeKeyCards(){
    const grid=$('[data-key-grid]');
    if(!grid)return;
    [...grid.children].forEach(card=>{
      if(!card.classList.contains('fortune-key-card')&&!card.classList.contains('fortune-key'))card.classList.add('fortune-key-card');
    });
  }

  function restoreGuideCards(){
    const grid=$('[data-tip-grid]');
    if(grid){
      grid.style.removeProperty('display');
      grid.removeAttribute('hidden');
    }
  }

  function apply(){normalizeKeyCards();restoreGuideCards();compactTip();}
  [0,500,1200,2400,3200,5000,6500].forEach(ms=>setTimeout(apply,ms));
})();
