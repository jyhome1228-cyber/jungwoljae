(()=>{
  'use strict';
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const supported=new Set(['saju-result.html','ohaeng-result.html','fortune-result.html','relationship-result.html','work-money-result.html','guide-result.html','compatibility-report.html']);
  if(!supported.has(file))return;
  const main=document.querySelector('main');if(!main)return;

  const technicalSelector='.evidence-content,.fortune-evidence-content,.relationship-evidence-content,.work-evidence-content,.guide-evidence-content,.compatibility-pillars,[data-evidence]';
  const elementExact={
    '목':'시작하는 힘','화':'표현하고 실행하는 힘','토':'관리하고 이어가는 힘','금':'판단하고 정리하는 힘','수':'살펴보고 대응하는 힘',
    '목 · 성장·방향':'시작하고 방향을 만드는 힘','화 · 표현·실행':'표현하고 실행하는 힘','토 · 안정·관리':'관리하고 이어가는 힘','금 · 판단·정리':'판단하고 정리하는 힘','수 · 관찰·유연':'살펴보고 유연하게 대응하는 힘',
    '목 · 방향·성장':'시작하고 방향을 만드는 힘','화 · 표현·실행':'표현하고 실행하는 힘','토 · 관리·유지':'관리하고 이어가는 힘','금 · 판단·정리':'판단하고 정리하는 힘','수 · 관찰·정보':'살펴보고 정보를 모으는 힘'
  };
  const roleExact={
    '비견':'자기 기준','겁재':'경쟁·주도권','식신':'꾸준한 표현','상관':'빠른 표현·변화','편재':'기회·외부 활동','정재':'안정적 수입·관리','편관':'압박 속 책임','정관':'규칙·책임','편인':'새로운 관점·탐색','정인':'배움·준비',
    '비겁':'자기 기준·주도권','식상':'표현·결과물','재성':'현실 성과·자원 관리','관성':'책임·규칙','인성':'배움·준비'
  };
  const relationExact={
    '일지와 육합':'관계가 자연스럽게 맞물리는 흐름',
    '일지와 충':'변화와 부딪힘이 커지는 흐름',
    '일지와 같은 지지':'익숙한 패턴이 강해지는 흐름',
    '육합':'서로 자연스럽게 맞물리는 흐름',
    '삼합':'관계가 부드럽게 이어지는 흐름',
    '충':'변화와 부딪힘을 한 번 더 살필 흐름',
    '형':'반복되는 긴장을 점검할 흐름',
    '해':'말과 의도를 한 번 더 확인할 흐름',
    '파':'작은 어긋남을 정리할 흐름'
  };

  const phrasePairs=[
    ['목·화·토·금·수','시작·표현·관리·판단·관찰'],
    ['목(木)','시작하는 힘'],['화(火)','표현하고 실행하는 힘'],['토(土)','관리하고 이어가는 힘'],['금(金)','판단하고 정리하는 힘'],['수(水)','살펴보고 대응하는 힘'],
    ['목(방향·성장)','시작하고 방향을 만드는 힘'],['화(표현·실행)','표현하고 실행하는 힘'],['토(관리·유지)','관리하고 이어가는 힘'],['금(판단·정리)','판단하고 정리하는 힘'],['수(관찰·정보)','살펴보고 정보를 모으는 힘'],
    ['일간·십성·오행','내 기본 성향과 생활 패턴'],
    ['일간·일지와 오행','내 기본 성향과 관계 패턴'],
    ['일간·일지','내 기본 성향과 관계 성향'],
    ['개인 명식 전체','내 사주 전체'],
    ['개인 명식','내 사주'],
    ['전체 명식','사주 전체'],
    ['명식 전체','사주 전체'],
    ['명식','사주 구조'],
    ['세운','올해 흐름'],
    ['천간·지지','사주의 기본 구성'],
    ['십성','생활 역할'],
    ['지장간','사주 안쪽의 세부 구성'],
    ['격국·용신','전통적인 세부 해석 기준']
  ];

  function replaceText(text){
    let t=String(text||'').trim();
    if(!t)return t;
    if(elementExact[t])return elementExact[t];
    if(roleExact[t])return roleExact[t];
    if(relationExact[t])return relationExact[t];
    for(const [from,to] of phrasePairs)t=t.split(from).join(to);
    t=t
      .replace(/\b비겁의 성향/g,'내 기준과 주도권을 중시하는 성향')
      .replace(/\b식상의 성향/g,'표현하고 결과물을 만드는 성향')
      .replace(/\b재성의 성향/g,'현실적인 성과와 자원을 보는 성향')
      .replace(/\b관성의 성향/g,'책임과 기준을 중시하는 성향')
      .replace(/\b인성의 성향/g,'준비하고 배우는 과정을 중시하는 성향');
    return t;
  }

  function apply(){
    const nodes=main.querySelectorAll('p,h1,h2,h3,h4,strong,span,small,li,dt,dd');
    nodes.forEach(node=>{
      if(node.closest(technicalSelector))return;
      if(node.children.length)return;
      const before=node.textContent;
      const after=replaceText(before);
      if(after&&after!==before.trim())node.textContent=after;
    });

    /* Result-specific static helpers that may be overwritten by render modules. */
    if(file==='work-money-result.html'){
      const lead=main.querySelector('[data-summary]');
      if(lead&&/비겁|식상|재성|관성|인성|목\(|화\(|토\(|금\(|수\(/.test(lead.textContent))lead.textContent=replaceText(lead.textContent);
      main.querySelectorAll('.work-core-card strong,.money-card strong,.year-card strong').forEach(n=>{if(!n.closest(technicalSelector)){const v=replaceText(n.textContent);if(v!==n.textContent.trim())n.textContent=v;}});
    }
    if(file==='fortune-result.html'){
      main.querySelectorAll('.relation-pills span,.fortune-key strong,.fortune-card strong').forEach(n=>{const v=replaceText(n.textContent);if(v!==n.textContent.trim())n.textContent=v;});
    }
    if(file==='saju-result.html'){
      main.querySelectorAll('.element-row label,.ten-god-card strong,.year-card strong,.summary-card strong').forEach(n=>{if(!n.closest(technicalSelector)){const v=replaceText(n.textContent);if(v!==n.textContent.trim())n.textContent=v;}});
    }
  }

  let queued=false;
  const schedule=()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;apply();},80);};
  const observer=new MutationObserver(schedule);
  observer.observe(main,{childList:true,subtree:true,characterData:true});
  apply();
  [500,1200,2400,4200,7000].forEach(ms=>setTimeout(apply,ms));
})();
