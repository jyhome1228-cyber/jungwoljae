(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const supported=new Set(['saju-result.html','ohaeng-result.html','fortune-result.html','relationship-result.html','work-money-result.html','guide-result.html']);
  if(!supported.has(file))return;
  const root=document.querySelector('main'); if(!root)return;
  document.body.classList.add('practical-v5');
  const all=(s,r=root)=>[...r.querySelectorAll(s)];

  const element={목:'시작하고 키우는 힘',화:'표현하고 움직이는 힘',토:'안정시키고 관리하는 힘',금:'판단하고 정리하는 힘',수:'살피고 비교하는 힘'};
  const groups={비겁:'내 기준과 주도권',식상:'표현과 실행',재성:'돈과 현실 감각',관성:'책임과 조직생활',인성:'배움과 준비'};
  const gods={비견:'내 기준과 독립성',겁재:'경쟁과 주도권',식신:'꾸준한 표현과 생산',상관:'자유로운 표현과 문제 해결',편재:'기회와 거래',정재:'안정적인 수입과 관리',편관:'압박 속 책임과 결단',정관:'규칙과 직책',편인:'새로운 아이디어와 학습',정인:'배움과 정보'};
  const relations={육합:'서로 자연스럽게 맞물리는 흐름',삼합:'연결이 부드러운 흐름',충:'변화와 부딪힘이 큰 흐름',형:'긴장과 반복을 점검할 흐름',해:'말과 의도를 한 번 더 확인할 흐름',파:'작은 어긋남을 정리할 흐름','같은 지지':'익숙한 성향이 강해지는 흐름','평이한 관계':'큰 충돌 없이 무난한 흐름'};
  const particlePattern='(의|이|가|은|는|을|를|에서|으로|와|과)?';
  const left='(^|[\\s·,(])';
  const right='(?=$|[\\s·,)])';
  const escRe=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

  function replaceToken(out,key,value){
    const k=escRe(key);
    out=out.replace(new RegExp(`${left}${k}\\([木火土金水]\\)${particlePattern}${right}`,'g'),(_,pre,particle='')=>`${pre}${value}${particle||''}`);
    out=out.replace(new RegExp(`${left}[木火土金水]\\s*${k}${particlePattern}${right}`,'g'),(_,pre,particle='')=>`${pre}${value}${particle||''}`);
    out=out.replace(new RegExp(`${left}${k}${particlePattern}${right}`,'g'),(_,pre,particle='')=>`${pre}${value}${particle||''}`);
    return out;
  }

  function replaceTerms(t){
    let out=String(t||'');
    Object.entries(element).forEach(([k,v])=>{out=replaceToken(out,k,v);});
    Object.entries(groups).forEach(([k,v])=>{out=replaceToken(out,k,v);});
    Object.entries(gods).forEach(([k,v])=>{out=replaceToken(out,k,v);});
    out=out.replaceAll('명식','사주 전체').replaceAll('작용','특징').replaceAll('보완','챙기기').replaceAll('기운','성향');
    return out;
  }

  function simplify(){
    all('p,h1,h2,h3,strong,span').forEach(n=>{
      if(n.closest('.evidence-content,.fortune-evidence-content,.relationship-evidence-content,.work-evidence-content,.guide-evidence-content'))return;
      if(n.classList.contains('visual-index'))return;
      const before=n.textContent||''; const after=replaceTerms(before);
      if(after!==before)n.textContent=after;
    });
    all('.friendly-term-note,.result-term-note').forEach(n=>{
      if(!n.closest('.evidence-content,.fortune-evidence-content,.relationship-evidence-content,.work-evidence-content,.guide-evidence-content'))n.remove();
    });
  }

  function ohaengFlow(){
    if(file!=='ohaeng-result.html')return;
    const labels=['시작','표현','관리','판단','관찰','시작'];
    all('.flow-chain span').forEach((n,i)=>{if(labels[i]){n.title=`전통 명리 오행: ${n.textContent}`;n.textContent=labels[i];}});
    const h2=root.querySelector('.flow-section h2'); if(h2)h2.textContent='다섯 가지 생활 기능은 서로 이어집니다.';
  }

  function sajuLabels(){
    if(file!=='saju-result.html')return;
    const map=[['내 사주의 중심, 일간','나는 어떤 방식으로 반응하는 사람일까?'],['음양과 오행의 균형','내가 자주 쓰는 방식과 놓치기 쉬운 방식'],['십성으로 보는 삶의 사용 방식','주도성·표현·돈·책임·배움으로 보는 생활 방식']];
    all('h2').forEach(h=>{const hit=map.find(([a])=>h.textContent.includes(a));if(hit)h.textContent=hit[1];});
  }

  function fortuneLabels(){
    if(file!=='fortune-result.html')return;
    all('.relation-pills span').forEach(n=>{const raw=n.textContent.trim(); if(relations[raw])n.textContent=relations[raw];});
    const h=root.querySelector('.fortune-relation h2'); if(h)h.textContent='오늘 날짜의 흐름과 내 띠가 어떻게 맞물릴까?';
  }

  function workLabels(){
    if(file!=='work-money-result.html')return;
    const labelMap={'강하게 쓰이는 기운':'자연스럽게 잘 쓰는 힘','보완하면 좋은 기운':'놓치기 쉬워 챙기면 좋은 힘','성과를 내는 방식':'성과가 잘 나는 방식'};
    all('.work-core-card span').forEach(n=>{Object.entries(labelMap).forEach(([a,b])=>{if(n.textContent.includes(a))n.textContent=n.textContent.replace(a,b);});});
  }

  function run(){simplify();ohaengFlow();sajuLabels();fortuneLabels();workLabels();}
  setTimeout(run,120);
  setTimeout(run,700);
})();