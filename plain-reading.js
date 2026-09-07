(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!file.endsWith('-result.html'))return;
  const root=document.querySelector('main');
  if(!root)return;

  const $=(s,r=root)=>r.querySelector(s);
  const all=(s,r=root)=>[...r.querySelectorAll(s)];
  const text=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();
  const set=(n,v)=>{if(n&&v&&text(n)!==v)n.textContent=v;};

  const E={
    목:{h:'木',title:'시작과 방향을 빠르게 잡는 편',main:'새로운 일을 시작하거나 방향을 정할 때 망설임이 적고 먼저 움직이는 편입니다.',tip:'해야 할 일을 아주 작은 첫 단계로 쪼개고, 시작할 때 마감 날짜도 함께 정해두는 것을 추천합니다.',work:'새 프로젝트의 방향을 잡고 첫 단계를 만드는 일에서 강점이 잘 드러납니다.',relation:'관계에서도 먼저 연락하거나 다음 단계를 제안하는 쪽이 편할 수 있습니다.',money:'새로운 지출은 시작 전에 총비용과 중단 기준을 먼저 적어두세요.'},
    화:{h:'火',title:'생각을 말과 행동으로 빨리 옮기는 편',main:'생각한 것을 말하고 보여주거나 바로 실행할 때 힘이 붙는 편입니다.',tip:'중요한 결정은 바로 확정하지 말고 한 번 적어본 뒤 몇 시간 뒤 다시 확인하는 것을 추천합니다.',work:'발표·제안·실행처럼 반응이 바로 오는 업무에서 강점이 잘 드러납니다.',relation:'마음이 생기면 말투나 연락처럼 표현이 비교적 빨리 드러날 수 있습니다.',money:'사고 싶은 마음이 강하게 들 때는 결제 전에 하루만 보류하고 실제 사용 횟수를 적어보세요.'},
    토:{h:'土',title:'일정과 반복을 꾸준히 관리하는 편',main:'흩어진 일을 정리하고 일정한 방식으로 오래 유지하는 데 익숙한 편입니다.',tip:'한 달에 한 번은 지금 유지하는 일 중 그만둘 것과 바꿀 것을 따로 점검하는 것을 추천합니다.',work:'운영·일정·반복 관리처럼 꾸준히 이어가는 업무에서 강점이 잘 드러납니다.',relation:'관계에서는 약속을 지키고 꾸준히 연락하는 태도에서 안정감을 느끼기 쉽습니다.',money:'자동이체·예산표·정기 점검처럼 돈 관리가 자동으로 반복되게 만들어두면 좋습니다.'},
    금:{h:'金',title:'기준을 세우고 정리하는 편',main:'복잡한 상황에서 기준을 세우고 필요한 것과 아닌 것을 나누는 데 익숙한 편입니다.',tip:'결정 전에 꼭 필요한 기준 3개와 포기해도 되는 조건 1개를 적어 선택지를 줄이는 것을 추천합니다.',work:'품질·검토·우선순위·의사결정처럼 기준이 필요한 업무에서 강점이 잘 드러납니다.',relation:'예의·약속·말의 일관성을 중요하게 보는 편입니다.',money:'큰 지출은 가격만 보지 말고 유지비·해지 조건·대체 가능성까지 같은 표에서 비교해보세요.'},
    수:{h:'水',title:'자료를 모으고 비교한 뒤 판단하는 편',main:'바로 결론을 내리기보다 정보를 모으고 여러 가능성을 비교한 뒤 움직이는 편입니다.',tip:'결정 전에 자료 2~3개를 비교하고, 큰 결정은 하루 정도 다시 보는 시간을 두는 것을 추천합니다.',work:'조사·분석·기획처럼 정보를 모아 판단하는 업무에서 강점이 잘 드러납니다.',relation:'상대의 말뿐 아니라 연락 패턴과 약속을 지키는지를 오래 살펴보는 편입니다.',money:'큰돈을 쓰기 전에는 최근 3개월 현금흐름과 감당 가능한 손실 범위를 먼저 확인해보세요.'}
  };
  const aliases={목:['목','木','시작하고 키우는 힘'],화:['화','火','표현하고 움직이는 힘'],토:['토','土','안정시키고 관리하는 힘'],금:['금','金','판단하고 정리하는 힘'],수:['수','水','살피고 연결하는 힘']};
  const role={목:'새 일을 시작하고 첫 행동을 만드는 과정',화:'생각을 말이나 결과물로 밖에 꺼내는 과정',토:'일정과 반복 업무를 꾸준히 관리하는 과정',금:'기준을 세우고 선택지를 정리하는 과정',수:'자료를 모으고 한 번 더 비교하는 과정'};
  const style={목:'먼저 시작하고 방향을 잡는 방식',화:'말하고 보여주며 실행하는 방식',토:'꾸준히 관리하고 유지하는 방식',금:'기준을 세우고 정리하는 방식',수:'자료를 모으고 비교한 뒤 움직이는 방식'};

  function keys(value){
    const t=String(value||'');
    return Object.keys(E).filter(k=>aliases[k].some(a=>t.includes(a))||t.includes(E[k].title));
  }
  function keyFrom(node){return keys(`${node?.getAttribute?.('title')||''} ${text(node)}`)[0]||null;}
  function evidence(n){return Boolean(n?.closest('[data-evidence],.evidence-content,.guide-evidence-content,.relationship-evidence-content,.fortune-evidence-content,.work-evidence-content'));}

  function easySentence(value){
    let t=String(value||'');
    Object.keys(E).forEach(k=>{
      [[`${k}(${E[k].h})의 기운`,style[k]],[`${k}의 기운`,style[k]],[`${k} 기운`,style[k]],[`${k}의 역할`,role[k]],[`${k}의 관점`,style[k]],[`${k}의 방식`,style[k]]].forEach(([a,b])=>{t=t.split(a).join(b);});
    });
    [
      ['명식 안에서','사주에서'],['명식에서는','사주에서는'],['명식에서','사주에서'],['명식','사주'],
      ['강한 기운의 장점이 분명하게 작동합니다','평소 잘하는 방식이라 처음 속도를 내기 쉽습니다'],
      ['강한 기운','평소 잘 쓰는 방식'],['약한 기운','놓치기 쉬운 부분'],['부족한 기운','놓치기 쉬운 부분'],
      ['작용이 강하게','특징이 뚜렷하게'],['작용이 비교적','특징이 비교적'],['작용이','특징이'],
      ['업무 구조 안에 의도적으로 넣어두는 편이 좋습니다','체크리스트·일정·검토 절차처럼 실제 방법으로 따로 챙기는 것을 추천합니다'],
      ['생활 구조 안에 넣는 것이 중요합니다','일정·기록·확인 절차처럼 실제 습관으로 만드는 것을 추천합니다'],
      ['관점으로 한 번 더 상황을 살펴보는 것이 도움이 됩니다','바로 결론 내리지 말고 한 번 더 확인하는 것이 좋습니다'],
      ['균형이 좋아집니다','더 안정적으로 이어가기 쉽습니다'],['보완해보세요','실제 습관으로 챙겨보세요']
    ].forEach(([a,b])=>{t=t.split(a).join(b);});
    return t;
  }

  function simplifyCommon(){
    all('p').forEach(p=>{if(!evidence(p)){const next=easySentence(p.textContent);if(next!==p.textContent)p.textContent=next;}});
    all('.element-card strong,.work-core-card strong,.summary-card strong,.key-card strong').forEach(n=>{
      if(evidence(n))return;
      const k=keyFrom(n),raw=text(n);
      if(k&&(raw===k||aliases[k].includes(raw))){n.textContent=E[k].title;n.title=`전통 명리: ${k}(${E[k].h})`;}
    });
  }

  function rewriteOhaeng(){
    const r=$('[data-ohaeng-result]');if(!r)return;
    const keyCards=all('.key-card',r);
    let strongKeys=keys(text(keyCards[0]?.querySelector('strong')));
    let weak=keyFrom(keyCards[1]?.querySelector('strong'));
    if(!strongKeys.length)strongKeys=keys(text($('[data-strong-text]',r)));
    if(!weak)weak=keys(text($('[data-weak-text]',r)))[0];
    const strong=strongKeys[0],second=strongKeys[1]||strong;
    if(!strong||!weak)return;
    const a=E[strong],b=E[second],w=E[weak],name=text($('[data-name]',r))||'회원';

    set($('[data-summary]',r),`${name}님은 ${a.title} 쪽이 먼저 드러나는 편입니다. ${b.title} 성향도 함께 보입니다. 반면 ${w.title}은 놓치기 쉬울 수 있어, 실제 생활에서 어떻게 챙기면 좋은지 중심으로 설명합니다.`);
    set($('.distribution-section .section-title-row>p',r),'목·화·토·금·수는 전통 명리의 다섯 분류입니다. 아래에서는 어려운 이름보다 실제 생활에서 나타나는 행동을 먼저 보여드립니다.');
    set($('.strong-card h2',r),'평소 자연스럽게 하는 방식');
    set($('.weak-card h2',r),'일부러 챙기면 좋은 방식');

    const strongBox=$('[data-strong-text]',r),strongExpected=`${a.main} ${b.main}`;
    if(strongBox&&text(strongBox)!==strongExpected)strongBox.innerHTML=`<p>${a.main}</p><p>${b.main}</p>`;
    const weakBox=$('[data-weak-text]',r),weakExpected=`${w.title}은 필요할 때 따로 챙기는 편이 좋습니다. 추천: ${w.tip}`;
    if(weakBox&&text(weakBox)!==weakExpected)weakBox.innerHTML=`<p>${w.title}은 필요할 때 따로 챙기는 편이 좋습니다.</p><p><strong>추천:</strong> ${w.tip}</p>`;

    set($('.flow-section h2',r),'잘하는 방식 다음에, 무엇을 놓치는지 봅니다.');
    set($('[data-flow-text]',r),`평소에는 ${a.title} 쪽으로 먼저 움직이기 쉽습니다. 중요한 것은 잘하는 방식을 줄이는 게 아니라 다음 단계에서 빠지는 부분을 챙기는 것입니다. 특히 ${w.title}이 필요한 순간에는 ${w.tip}`);

    const life=all('.life-card',r);
    const lifeCopy=[
      `${a.main} 중요한 선택에서는 익숙한 방식으로 바로 밀어붙이기보다 ${w.tip}`,
      `${a.relation} 상대와 속도가 다를 때는 내 방식이 정답이라고 보기보다 최근의 말과 행동을 함께 확인해보세요.`,
      `새 일을 시작할 때는 ${a.work} 다만 성과를 오래 유지하려면 ${w.tip}`,
      `돈에서는 사주 용어보다 실제 기록이 더 중요합니다. ${a.money} ${w.money}`
    ];
    life.forEach((c,i)=>{if(lifeCopy[i])set(c.querySelector('p'),lifeCopy[i]);});

    if(keyCards[0]){set(keyCards[0].querySelector('strong'),strong===second?a.title:`${a.title} · ${b.title}`);set(keyCards[0].querySelector('p'),'평소 별다른 노력 없이 먼저 나오는 행동 방식입니다. 잘하는 점은 그대로 활용하세요.');}
    if(keyCards[1]){set(keyCards[1].querySelector('strong'),w.title);set(keyCards[1].querySelector('p'),w.tip);}
    if(keyCards[2]){
      const scoreMatch=text(keyCards[2].querySelector('strong')).match(/\d+/);
      if(scoreMatch){const n=Number(scoreMatch[0]);set(keyCards[2].querySelector('strong'),n>=75?'비교적 고른 편':n>=55?'성향 차이가 보이는 편':'특정 방식이 강하게 드러나는 편');}
      set(keyCards[2].querySelector('p'),'좋고 나쁨을 매기는 점수가 아닙니다. 평소 잘하는 방식과 놓치기 쉬운 방식을 구분해 보는 참고 항목입니다.');
    }

    const total=$('[data-total-summary]',r);
    const expected=`${name}님은 ${a.title} 쪽이 자연스럽고, ${w.title}은 습관이나 도구로 따로 챙기면 좋은 편입니다. ${a.main} 이 장점은 그대로 쓰되 중요한 일에서는 ${w.tip} 사주를 볼 때 “어떤 기운이 많다·적다”에서 끝내지 않고, 실제로 무엇을 계속하고 무엇을 조심하면 좋은지까지 연결해서 보는 것이 정월재의 기준입니다.`;
    if(total&&text(total)!==expected)total.innerHTML=`<strong class="total-summary-highlight">${name}님은 ${a.title} 쪽이 자연스럽고, ${w.title}은 습관이나 도구로 따로 챙기면 좋은 편입니다.</strong><p>${a.main} 이 장점은 그대로 쓰되 중요한 일에서는 ${w.tip}</p><p>사주를 볼 때 “어떤 기운이 많다·적다”에서 끝내지 않고, 실제로 무엇을 계속하고 무엇을 조심하면 좋은지까지 연결해서 보는 것이 정월재의 기준입니다.</p>`;
  }

  function rewriteSaju(){
    const r=$('[data-saju-result]');if(!r)return;
    const cards=all('.summary-card',r);
    const strongCard=cards.find(c=>/강하게|잘 쓰|자연스럽/.test(text(c.querySelector('span'))));
    const weakCard=cards.find(c=>/균형|놓치|챙기/.test(text(c.querySelector('span'))));
    const strong=keyFrom(strongCard?.querySelector('strong')),weak=keyFrom(weakCard?.querySelector('strong'));
    if(!strong||!weak)return;
    const a=E[strong],w=E[weak],name=text($('[data-name]',r))||'회원';
    set($('[data-summary]',r),`${name}님은 ${a.title} 쪽이 자연스럽게 먼저 나오는 편입니다. 반면 ${w.title}은 중요한 순간에 따로 확인하는 것이 좋습니다. 아래에서는 이 차이가 일, 돈, 관계와 선택에서 어떻게 나타나는지 쉽게 풀어봅니다.`);
    const life=all('.life-card',r);
    const copy=[`${a.main} 중요한 결정에서는 ${w.tip}`,`일에서는 ${a.work} 직업명보다 실제 업무에서 이 방식을 얼마나 자주 쓸 수 있는지 확인해보세요.`,`돈에서는 재물운의 좋고 나쁨보다 관리 습관을 보는 편이 현실적입니다. ${a.money} ${w.money}`,`${a.relation} 반복해서 불편한 일이 생기면 상대의 마음을 추측하기보다 연락·약속·갈등 뒤 행동을 확인해보세요.`];
    life.forEach((c,i)=>{if(copy[i])set(c.querySelector('p'),copy[i]);});
  }

  function rewriteWork(){
    const r=$('[data-work-result]');if(!r)return;
    const cards=all('.work-core-card',r),strong=keyFrom(cards[2]?.querySelector('strong')),weak=keyFrom(cards[3]?.querySelector('strong'));
    if(!strong||!weak)return;
    set(cards[2].querySelector('strong'),E[strong].title);set(cards[2].querySelector('p'),E[strong].work);
    set(cards[3].querySelector('strong'),E[weak].title);set(cards[3].querySelector('p'),E[weak].tip);
  }

  function apply(){simplifyCommon();rewriteOhaeng();rewriteSaju();rewriteWork();}
  let queued=false;
  const observer=new MutationObserver(()=>schedule());
  const observe=()=>observer.observe(root,{subtree:true,childList:true,characterData:true});
  const schedule=()=>{
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{
      queued=false;observer.disconnect();
      try{apply();}finally{observe();}
    });
  };
  observe();schedule();setTimeout(schedule,150);setTimeout(schedule,500);setTimeout(schedule,900);
})();
