(()=>{
  'use strict';
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const supported=new Set(['saju-result.html','ohaeng-result.html','fortune-result.html','relationship-result.html','work-money-result.html','guide-result.html','compatibility-report.html']);
  if(!supported.has(file))return;
  const main=document.querySelector('main');if(!main)return;

  /* Traditional terms are intentionally preserved only in the interpretation/evidence area. */
  const technicalSelector='.evidence-report,.evidence-section,.fortune-evidence,.relationship-evidence,.work-evidence,.guide-evidence,.evidence-content,.fortune-evidence-content,.relationship-evidence-content,.work-evidence-content,.guide-evidence-content,.compatibility-pillars,[data-evidence]';
  const stemRole={
    '갑':'시작과 방향이 두드러지는 흐름','을':'유연하게 길을 만드는 흐름',
    '병':'표현과 실행이 두드러지는 흐름','정':'집중하고 표현하는 흐름',
    '무':'관리와 안정이 두드러지는 흐름','기':'세밀하게 관리하고 쌓는 흐름',
    '경':'판단과 정리가 두드러지는 흐름','신':'정교하게 구분하고 다듬는 흐름',
    '임':'큰 흐름을 읽고 연결하는 흐름','계':'살펴보고 정보를 모으는 흐름'
  };
  const branches=new Set(['자','축','인','묘','진','사','오','미','신','유','술','해']);
  const ganjiRole=value=>{
    const t=String(value||'').trim();
    const chars=[...t];
    return chars.length===2&&stemRole[chars[0]]&&branches.has(chars[1])?stemRole[chars[0]]:'';
  };

  const elementExact={
    '목':'시작하는 힘','화':'표현하고 실행하는 힘','토':'관리하고 이어가는 힘','금':'판단하고 정리하는 힘','수':'살펴보고 대응하는 힘','오행':'다섯 가지 생활 성향',
    '木 목':'시작하는 힘','火 화':'표현하고 실행하는 힘','土 토':'관리하고 이어가는 힘','金 금':'판단하고 정리하는 힘','水 수':'살펴보고 대응하는 힘',
    '목 · 성장·방향':'시작하고 방향을 만드는 힘','화 · 표현·실행':'표현하고 실행하는 힘','토 · 안정·관리':'관리하고 이어가는 힘','금 · 판단·정리':'판단하고 정리하는 힘','수 · 관찰·유연':'살펴보고 유연하게 대응하는 힘',
    '목 · 방향·성장':'시작하고 방향을 만드는 힘','토 · 관리·유지':'관리하고 이어가는 힘','수 · 관찰·정보':'살펴보고 정보를 모으는 힘'
  };
  const roleExact={
    '비견':'자기 기준','겁재':'경쟁·주도권','식신':'꾸준한 표현','상관':'빠른 표현·변화','편재':'기회·외부 활동','정재':'안정적 수입·관리','편관':'압박 속 책임','정관':'규칙·책임','편인':'새로운 관점·탐색','정인':'배움·준비',
    '비겁':'자기 기준·주도권','식상':'표현·결과물','재성':'현실 성과·자원 관리','관성':'책임·규칙','인성':'배움·준비'
  };
  const relationExact={
    '일지와 육합':'관계가 자연스럽게 맞물리는 흐름','일지와 충':'변화와 부딪힘이 커지는 흐름','일지와 같은 지지':'익숙한 관계 패턴이 강해지는 흐름',
    '합의 흐름':'관계가 자연스럽게 이어지는 흐름','충의 흐름':'변화와 부딪힘이 커지는 흐름','육합':'서로 자연스럽게 맞물리는 흐름','삼합':'관계가 부드럽게 이어지는 흐름',
    '충':'변화와 부딪힘을 한 번 더 살필 흐름','형':'반복되는 긴장을 점검할 흐름','해':'말과 의도를 한 번 더 확인할 흐름','파':'작은 어긋남을 정리할 흐름',
    '동일 지지':'익숙한 패턴이 강해지는 흐름','평이':'내 선택이 중요한 흐름'
  };

  const phrasePairs=[
    ['목·화·토·금·수','시작·표현·관리·판단·관찰'],
    ['목(木)','시작하는 힘'],['화(火)','표현하고 실행하는 힘'],['토(土)','관리하고 이어가는 힘'],['금(金)','판단하고 정리하는 힘'],['수(水)','살펴보고 대응하는 힘'],
    ['목(방향·성장)','시작하고 방향을 만드는 힘'],['화(표현·실행)','표현하고 실행하는 힘'],['토(관리·유지)','관리하고 이어가는 힘'],['금(판단·정리)','판단하고 정리하는 힘'],['수(관찰·정보)','살펴보고 정보를 모으는 힘'],
    ['목의 ‘시작과 확장’','시작하고 확장하는 방식'],['화의 ‘표현과 반응’','표현하고 반응을 주고받는 방식'],['토의 ‘안정과 지속’','안정적으로 관계를 이어가는 방식'],['금의 ‘기준과 경계’','기준과 거리를 분명히 하는 방식'],['수의 ‘관찰과 유연’','상황을 살피고 유연하게 대응하는 방식'],
    ['목의 작용','시작하고 방향을 만드는 힘'],['화의 작용','표현하고 실행하는 힘'],['토의 작용','관리하고 이어가는 힘'],['금의 작용','판단하고 정리하는 힘'],['수의 작용','살펴보고 대응하는 힘'],
    ['목의 기운','시작하고 방향을 만드는 힘'],['화의 기운','표현하고 실행하는 힘'],['토의 기운','관리하고 이어가는 힘'],['금의 기운','판단하고 정리하는 힘'],['수의 기운','살펴보고 대응하는 힘'],
    ['목의 역할','시작하는 역할'],['화의 역할','표현하고 실행하는 역할'],['토의 역할','관리하고 이어가는 역할'],['금의 역할','판단하고 정리하는 역할'],['수의 역할','살펴보고 확인하는 역할'],
    ['목의 방식','시작하고 방향을 만드는 방식'],['화의 방식','표현하고 실행하는 방식'],['토의 방식','관리하고 이어가는 방식'],['금의 방식','판단하고 정리하는 방식'],['수의 방식','살펴보고 대응하는 방식'],
    ['목의 관점','시작과 방향을 보는 관점'],['화의 관점','표현과 실행을 보는 관점'],['토의 관점','관리와 지속을 보는 관점'],['금의 관점','판단과 기준을 보는 관점'],['수의 관점','상황을 살피는 관점'],
    ['오행 전체 분포','다섯 가지 생활 성향의 분포'],['오행 분포','다섯 가지 생활 성향의 분포'],['오행의 흐름','생활 성향의 흐름'],['오행의 균형','생활 성향의 균형'],['오행 구조','생활 성향의 구조'],
    ['일간·십성·오행','내 기본 성향과 생활 패턴'],['일간·일지와 오행','내 기본 성향과 관계 패턴'],['일간·일지','내 기본 성향과 관계 성향'],
    ['일지의 기운은','가까운 관계에서 드러나는 성향은'],['일지의 역할','가까운 관계에서 드러나는 역할'],['일지 관계','가까운 관계의 패턴'],
    ['내 일주','내 사주의 중심'],['출생 일주','내 사주의 중심'],['일주의','사주 중심의'],['일주와','사주 중심과'],['일주를','사주의 중심을'],
    ['오늘 일진','오늘 날짜의 흐름'],['내일 일진','내일 날짜의 흐름'],['일진의','날짜 흐름의'],['일진과','날짜 흐름과'],['일진을','날짜의 흐름을'],['일진','날짜의 흐름'],
    ['연주·월주·일주·시주','태어난 해·달·날·시간의 네 기준'],['연주','태어난 해의 흐름'],['월주','태어난 달의 흐름'],['시주','태어난 시간의 흐름'],
    ['개인 명식 전체','내 사주 전체'],['개인 명식','내 사주'],['전체 명식','사주 전체'],['명식 전체','사주 전체'],['명식','사주 구조'],
    ['세운','올해 흐름'],['천간·지지','사주의 기본 구성'],['천간에서는','사주의 표현 방식에서는'],['십성','생활 역할'],['지장간','사주 안쪽의 세부 구성'],['격국·용신','전통적인 세부 해석 기준']
  ];

  function replaceText(text){
    let t=String(text||'').trim();
    if(!t)return t;
    if(elementExact[t])return elementExact[t];
    if(roleExact[t])return roleExact[t];
    if(relationExact[t])return relationExact[t];
    for(const [from,to] of phrasePairs)t=t.split(from).join(to);
    for(const [from,to] of Object.entries(roleExact))t=t.split(from).join(to);
    t=t
      .replace(/일간의/g,'기본 성향의').replace(/일간을/g,'기본 성향을').replace(/일간과/g,'기본 성향과').replace(/일간/g,'기본 성향')
      .replace(/일지의/g,'가까운 관계에서 드러나는').replace(/일지와/g,'가까운 관계의 성향과').replace(/일지/g,'가까운 관계 성향')
      .replace(/오행을/g,'다섯 가지 생활 성향을').replace(/오행은/g,'다섯 가지 생활 성향은').replace(/오행에서/g,'다섯 가지 생활 성향에서').replace(/오행으로/g,'다섯 가지 생활 성향으로').replace(/오행/g,'다섯 가지 생활 성향')
      .replace(/합이나 충/g,'강하게 맞물리거나 부딪히는 신호').replace(/합·충·형·해·파/g,'서로 맞물리거나 부딪히는 관계 신호');
    return t;
  }

  function humanizeGanjiNode(node,prefix=''){
    if(!node||node.closest(technicalSelector))return;
    const raw=node.textContent.trim();
    const role=ganjiRole(raw);
    if(role)node.textContent=prefix?`${prefix} · ${role}`:role;
  }
  function humanizeTrailingGanji(node){
    if(!node||node.closest(technicalSelector))return;
    const raw=node.textContent.trim();
    const match=raw.match(/^(.*?)([갑을병정무기경신임계][자축인묘진사오미신유술해])$/);
    if(!match)return;
    const role=ganjiRole(match[2]);if(!role)return;
    const prefix=match[1].replace(/[·\s]+$/,'').trim();
    node.textContent=prefix?`${prefix} · ${role}`:role;
  }

  function apply(){
    const nodes=main.querySelectorAll('p,h1,h2,h3,h4,strong,span,small,li,dt,dd');
    nodes.forEach(node=>{
      if(node.closest(technicalSelector)||node.children.length)return;
      const before=node.textContent,after=replaceText(before);
      if(after&&after!==before.trim())node.textContent=after;
    });

    if(file==='work-money-result.html'){
      const lead=main.querySelector('[data-summary]');if(lead)lead.textContent=replaceText(lead.textContent);
      main.querySelectorAll('.work-core-card strong,.work-core-card p,.money-card strong,.money-card p,.year-card p,.work-axis-copy').forEach(n=>{if(!n.closest(technicalSelector))n.textContent=replaceText(n.textContent);});
      main.querySelectorAll('.year-card strong').forEach(n=>humanizeGanjiNode(n,'그해의 중심'));
      main.querySelectorAll('.year-card small').forEach(n=>{if(!n.closest(technicalSelector))n.textContent=replaceText(n.textContent);});
    }
    if(file==='relationship-result.html'){
      main.querySelectorAll('[data-summary],[data-emotion-text] p,[data-distance-text] p,.relationship-core-card strong,.relationship-core-card p,.relationship-year-copy p,.relationship-pattern p').forEach(n=>{if(!n.closest(technicalSelector))n.textContent=replaceText(n.textContent);});
    }
    if(file==='compatibility-report.html'){
      main.querySelectorAll('[data-summary],.compatibility-person-card h3,.compatibility-person-card p,.compatibility-compare-card p,.compatibility-advice p').forEach(n=>{if(!n.closest(technicalSelector))n.textContent=replaceText(n.textContent);});
    }
    if(file==='fortune-result.html'){
      main.querySelectorAll('[data-summary],[data-signal-note],[data-relation-text],.fortune-key p,.fortune-card strong,.fortune-card p,.fortune-story p,.fortune-total p').forEach(n=>{if(!n.closest(technicalSelector))n.textContent=replaceText(n.textContent);});
      const pills=[...main.querySelectorAll('.relation-pills span')];
      if(pills[0])humanizeGanjiNode(pills[0],'내 기본 흐름');
      if(pills[1]&&!pills[1].closest(technicalSelector))pills[1].textContent=replaceText(pills[1].textContent);
      if(pills[2])humanizeGanjiNode(pills[2],file==='fortune-result.html'?'날짜의 흐름':'흐름');
      main.querySelectorAll('.fortune-key strong').forEach(n=>{const role=ganjiRole(n.textContent.trim());if(role)humanizeGanjiNode(n);else{const text=replaceText(n.textContent);n.textContent=text;humanizeTrailingGanji(n);}});
      main.querySelectorAll('.fortune-meta span').forEach(n=>{n.textContent=replaceText(n.textContent);humanizeTrailingGanji(n);});
    }
    if(file==='saju-result.html'){
      main.querySelectorAll('.element-row label,.ten-god-card strong,.ten-god-card p,.year-card p,.summary-card strong,.summary-prose p,.balance-copy').forEach(n=>{if(!n.closest(technicalSelector))n.textContent=replaceText(n.textContent);});
      /* The four-pillar board itself remains exact as a reference; explanatory year cards become plain language. */
      main.querySelectorAll('.year-card strong').forEach(n=>humanizeGanjiNode(n,'그해의 중심'));
    }
    if(file==='guide-result.html'){
      main.querySelectorAll('[data-lead],.guide-personal-card strong,.guide-personal-card p,.guide-reason-copy p,.guide-check-card p,.guide-action-card p,.guide-answer p,.guide-answer strong').forEach(n=>{if(!n.closest(technicalSelector))n.textContent=replaceText(n.textContent);});
    }
  }

  let queued=false;
  const schedule=()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;apply();},80);};
  const observer=new MutationObserver(schedule);observer.observe(main,{childList:true,subtree:true,characterData:true});
  apply();[400,900,1700,2800,4500,7000].forEach(ms=>setTimeout(apply,ms));
})();
