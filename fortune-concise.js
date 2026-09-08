(()=>{
  const root=document.querySelector('[data-fortune-result]');
  if(!root)return;
  // 2026-09-08: 상세 운세를 지나치게 줄이던 축약 처리를 중단합니다.
  // 기존의 하루 흐름·시간대·행동/주의·총평을 그대로 살리고,
  // 최종 문장 다듬기는 content-quality-v6.js에서 처리합니다.
  root.querySelectorAll('.fortune-story-section,.fortune-time-section,.fortune-choice-section,.fortune-total-section').forEach(section=>{
    section.style.removeProperty('display');
  });
  const keySection=root.querySelector('[data-key-grid]')?.closest('.fortune-report');
  if(keySection)keySection.style.removeProperty('display');
})();
