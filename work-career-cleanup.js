(()=>{
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='work-money-result.html')return;
  const root=document.querySelector('[data-work-result]');if(!root)return;
  const skip=n=>n.closest('.work-evidence,.work-evidence-content');
  const exact={
    '목':'시작하고 방향을 잡는 힘','화':'표현하고 움직이는 힘','토':'안정시키고 관리하는 힘','금':'판단하고 정리하는 힘','수':'살피고 비교하는 힘',
    '비겁':'내 기준과 주도권','식상':'표현과 실행','재성':'돈과 현실 감각','관성':'책임과 조직생활','인성':'배움과 준비'
  };
  const phrase=[
    ['목의 방향·성장 역할','새 일을 시작하고 방향을 잡는 역할'],['목의 방향·성장','시작과 방향 잡기'],['목의 역할','시작하고 방향을 잡는 역할'],
    ['화의 표현·실행 역할','사람에게 보여주고 움직이게 하는 역할'],['화의 표현·실행','표현과 실행'],['화의 역할','표현하고 움직이는 역할'],
    ['토의 관리·유지 역할','운영을 안정시키고 꾸준히 유지하는 역할'],['토의 관리·유지','관리와 유지'],['토의 역할','안정시키고 관리하는 역할'],
    ['금의 판단·정리 역할','기준을 세우고 판단·정리하는 역할'],['금의 판단·정리','판단과 정리'],['금의 역할','판단하고 정리하는 역할'],
    ['수의 관찰·정보 역할','자료를 모으고 비교한 뒤 판단하는 역할'],['수의 관찰·정보','자료를 살피고 비교하는 방식'],['수의 역할','살피고 비교하는 역할'],
    ['비겁의 작동 방식','내 기준과 주도권을 쓰는 방식'],['식상의 작동 방식','표현하고 실행하는 방식'],['재성의 작동 방식','돈과 현실 조건을 다루는 방식'],['관성의 작동 방식','책임과 조직 기준을 다루는 방식'],['인성의 작동 방식','배우고 준비하는 방식'],
    ['비겁의','내 기준과 주도권의'],['식상의','표현과 실행의'],['재성의','돈과 현실 감각의'],['관성의','책임과 조직생활의'],['인성의','배움과 준비의']
  ];
  function clean(){
    root.querySelectorAll('[data-rf3]').forEach(n=>n.remove());
    root.querySelectorAll('strong,h3').forEach(n=>{if(skip(n))return;const t=(n.textContent||'').trim();if(exact[t])n.textContent=exact[t];});
    root.querySelectorAll('p').forEach(n=>{if(skip(n))return;let t=n.textContent||'';phrase.forEach(([a,b])=>{t=t.split(a).join(b);});n.textContent=t;});
    root.querySelectorAll('.friendly-term-note,.result-term-note').forEach(n=>{if(n.closest('.work-core-card'))n.remove();});
  }
  setTimeout(clean,1800);setTimeout(clean,2600);setTimeout(clean,3600);
})();