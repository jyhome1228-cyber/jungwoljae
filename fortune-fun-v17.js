(()=>{
  'use strict';
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='fortune-result.html')return;
  const root=document.querySelector('[data-fortune-result]');if(!root)return;
  let input={};try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}')}catch(e){}
  const dayWord=input.mode==='tomorrow'?'내일':'오늘';
  const text=n=>String(n?.textContent||'').replace(/\s+/g,' ').trim();
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const godMap={
    비견:'내 페이스대로 밀고 가고 싶은 날',겁재:'경쟁심과 주도권이 커지는 날',식신:'꾸준히 결과를 만들기 좋은 날',상관:'말과 아이디어가 강해지는 날',편재:'기회와 돈의 움직임이 커지는 날',정재:'현실적인 성과와 돈을 정리하기 좋은 날',편관:'압박은 있지만 집중력이 올라가는 날',정관:'약속과 기준을 지킬수록 유리한 날',편인:'새 정보와 아이디어가 들어오는 날',정인:'배우고 준비하기 좋은 날'
  };
  const relMap={육합:'사람과 일이 자연스럽게 이어지는 편',삼합:'연결과 협업을 활용하면 좋은 편',충:'예상 밖 변화가 생길 수 있음',형:'반복되던 불편을 끊어야 함',해:'말이 엇갈리지 않게 확인이 필요함',파:'작은 어긋남을 정리하면 좋음',평이:'큰 변수는 적은 편',동일:'평소 내 성향이 더 강해짐'};
  const cleanGod=s=>{for(const k of Object.keys(godMap))if(String(s||'').includes(k))return k;return null};
  const cleanRel=s=>{for(const k of Object.keys(relMap))if(String(s||'').includes(k))return k;return '평이'};

  function run(){
    const relation=root.querySelector('.fortune-relation');if(!relation)return false;
    const oldPills=[...relation.querySelectorAll('.relation-pills span')].map(text);
    if(oldPills.length<2)return false;
    const god=cleanGod(oldPills[1])||cleanGod(text(root))||'비견';
    const rel1=cleanRel(oldPills[2]||''),rel2=cleanRel(oldPills[3]||'');
    const headline=text(root.querySelector('[data-headline]'));
    const work=text([...root.querySelectorAll('.fortune-card')].find(c=>/일·학업운/.test(text(c.querySelector('h3'))))?.querySelector('p'));
    const money=text([...root.querySelectorAll('.fortune-card')].find(c=>/재물운/.test(text(c.querySelector('h3'))))?.querySelector('p'));

    relation.innerHTML=`<p class="fortune-label">01 · ${dayWord}의 성향</p><h2>${dayWord}은 내 성향이 이렇게 드러납니다.</h2><div class="relation-pills"><span>${esc(godMap[god])}</span><span>${esc(relMap[rel1])}</span><span>${esc(relMap[rel2])}</span></div><p>${esc(`${dayWord}은 ${godMap[god]}입니다. 사람과 관계에서는 ${relMap[rel1]}, 일과 생활에서는 ${relMap[rel2]}으로 보면 됩니다. 어려운 명리 용어보다 실제 행동 기준만 기억하세요.`)}</p>`;

    const story=root.querySelector('[data-fortune-story]');
    if(story)story.innerHTML=`<p><strong>${dayWord}의 한줄 요약</strong> ${esc(headline||godMap[god])}</p><p><strong>실제로는</strong> ${esc(work||'가장 중요한 일부터 처리하세요.')} ${esc(money||'돈은 계획된 범위 안에서 움직이세요.')}</p>`;

    const meta=root.querySelector('[data-meta]');
    if(meta){const spans=[...meta.querySelectorAll('span')].map(text);const date=spans[0]||input.targetDate||'';const label=spans[1]||'';meta.innerHTML=`${date?`<span>${esc(date)}</span>`:''}${label?`<span>${esc(label)}</span>`:''}<span>${dayWord} 운세</span><span>내 사주 반영</span>`;}
    return true;
  }
  run();[250,700,1300,2200,3400,5000,6500].forEach(ms=>setTimeout(run,ms));
})();