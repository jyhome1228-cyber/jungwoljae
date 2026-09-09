import './fortune-final-v12.js?v=20260909-0805';

(()=>{
  const root=document.querySelector('[data-fortune-result]');
  if(!root)return;
  const $=(s,r=root)=>r.querySelector(s);
  let input={};
  try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
  const dayWord=input.mode==='tomorrow'?'내일':'오늘';

  const packs={
    갑:{first:'오전 11시 전, 미뤄둔 일 하나를 실제로 시작하세요.',why:'생각을 더 보태는 것보다 첫 행동을 만드는 쪽에서 흐름이 붙습니다. 메일 보내기, 초안 열기, 예약하기처럼 작더라도 시작 표시를 남겨보세요.',finish:'새 일을 세 개 늘리기보다 시작한 것 하나를 다음 단계까지 넘겨두세요.'},
    을:{first:'해야 할 일을 가장 작은 단위로 쪼개서 하나부터 움직여보세요.',why:'한 번에 크게 밀기보다 가능한 길을 찾아 이어가는 흐름이 잘 맞습니다. 상대 반응을 보며 조정하되 첫걸음은 미루지 않는 편이 좋습니다.',finish:'오늘 안에 끝낼 수 있는 작은 일 하나를 골라 완료 표시를 남겨보세요.'},
    병:{first:'머릿속에 있던 생각 하나를 사람 앞에 꺼내보세요.',why:'말·제안·발표·공유처럼 밖으로 보여주는 행동에서 기운이 살아납니다. 완벽한 문장보다 실제로 전달하는 것이 먼저입니다.',finish:'보여준 뒤에는 반응 하나만 확인하고 다음 행동을 정하세요.'},
    정:{first:'하고 싶은 말이나 보여줄 결과물 하나를 짧게라도 꺼내보세요.',why:'속으로 오래 품는 것보다 말·글·결과물로 표현할 때 흐름이 붙습니다. 연락 한 번, 문서 한 장, 제안 한 줄처럼 눈에 보이게 남겨보세요.',finish:'퇴근 전이나 잠들기 전, 오늘 꺼낸 것 하나를 마무리해두세요.'},
    무:{first:'새로운 일을 더 벌이기보다 진행 중인 일 하나를 끝내세요.',why:'정리하고 중심을 잡는 쪽에 힘이 붙는 날입니다. 할 일 목록이 길다면 가장 오래 끌던 것 하나부터 닫아두는 편이 좋습니다.',finish:'일정·지출·해야 할 일 중 하나를 정리해서 내일로 넘길 짐을 줄여보세요.'},
    기:{first:'오늘 해야 할 일의 순서를 세 칸으로만 정리해보세요.',why:'작은 단위를 관리하고 차곡차곡 쌓는 방식에서 힘이 납니다. 크게 바꾸기보다 순서를 정하고 하나씩 닫는 편이 훨씬 잘 맞습니다.',finish:'마지막에는 내일 첫 번째 할 일까지 한 줄로 적어두세요.'},
    경:{first:'결정이 필요한 일 하나를 “한다 / 안 한다 / 미룬다”로 분명히 나눠보세요.',why:'기준을 세우고 선택지를 줄일수록 흐름이 선명해집니다. 애매하게 들고 있는 일을 하나 정리하면 다른 일도 따라 가벼워집니다.',finish:'필요 없는 일정·파일·약속 하나를 지우거나 정리해보세요.'},
    신:{first:'완벽하게 만들려는 일 하나에 오늘의 완료 기준을 먼저 정하세요.',why:'세부를 보고 다듬는 힘이 강하게 들어옵니다. 잘 만드는 것도 중요하지만 어디까지 하면 끝인지 정해두면 훨씬 편해집니다.',finish:'중요한 20%만 더 다듬고 나머지는 완료 상태로 넘겨보세요.'},
    임:{first:'결정 전에 자료 두세 개만 비교하고 바로 다음 행동을 정하세요.',why:'정보를 넓게 보고 가능성을 연결하는 힘이 커집니다. 다만 조사만 길어지면 시작이 늦어질 수 있으니 비교 개수를 정해두는 게 좋습니다.',finish:'오늘 모은 정보 중 실제 행동으로 이어질 한 가지를 골라두세요.'},
    계:{first:'바로 답하지 말고 필요한 정보 두 가지만 확인한 뒤 결정하세요.',why:'작은 신호와 차이를 잘 읽는 흐름입니다. 생각을 오래 끌기보다 확인할 항목을 줄이고 답을 내리는 편이 좋습니다.',finish:'오늘 확인한 내용을 한 줄로 기록하고 더 볼 것은 내일로 넘기세요.'}
  };

  const flowPacks={
    갑:'새로운 방향을 잡는 힘이 먼저 들어옵니다. 여러 일을 동시에 시작하기보다 첫 단추가 분명한 한 가지를 고르는 편이 좋습니다.',
    을:'큰 변화보다 작은 조정을 이어가는 쪽이 자연스럽습니다. 막히는 지점이 생겨도 다른 길을 찾아 연결하면 흐름이 끊기지 않습니다.',
    병:'반응과 표현의 속도가 평소보다 앞서는 편입니다. 혼자 오래 정리하기보다 외부와 주고받는 과정에서 방향이 선명해질 수 있습니다.',
    정:'섬세하게 표현하고 전달하는 힘이 살아납니다. 크게 드러내기보다 필요한 말과 결과물을 정확한 순간에 보여주는 편이 좋습니다.',
    무:'새로운 자극보다 중심을 잡고 마무리하는 쪽에 힘이 갑니다. 이미 진행 중인 것을 안정시키면 하루가 훨씬 가벼워집니다.',
    기:'작은 일의 순서와 생활 리듬을 정돈할수록 편해집니다. 한꺼번에 바꾸기보다 눈앞의 한 단계씩 처리하는 흐름이 잘 맞습니다.',
    경:'판단 기준이 선명해지는 날입니다. 애매하게 남겨둔 선택지를 줄일수록 시간과 체력을 덜 쓰게 됩니다.',
    신:'세부 차이를 알아채고 다듬는 힘이 좋아집니다. 완성도를 높이되 끝낼 기준까지 함께 정해두는 것이 중요합니다.',
    임:'정보와 가능성이 넓게 보이는 흐름입니다. 여러 선택지를 살펴보되 실제 행동으로 이어질 한 가지를 남겨야 힘이 흩어지지 않습니다.',
    계:'작은 신호와 차이를 읽는 감각이 좋아집니다. 바로 결론 내리기보다 필요한 사실만 확인한 뒤 조용히 방향을 잡는 편이 좋습니다.'
  };

  function relationAction(label){
    if(/육합|삼합/.test(label))return ['먼저 연락하거나 제안을 꺼내보세요.','사람과의 접점이 자연스럽게 생기기 쉬운 흐름입니다. 기다리기만 하기보다 가벼운 연락, 제안, 약속처럼 먼저 문을 여는 행동이 잘 맞습니다.'];
    if(/충|형|해|파/.test(label))return ['중요한 말은 추측하지 말고 한 번 직접 확인하세요.','작은 차이도 크게 느껴질 수 있는 흐름입니다. 답장 속도나 말투만 보고 결론 내리기보다 궁금한 한 가지를 직접 묻는 편이 관계와 일 모두에서 도움이 됩니다.'];
    return ['내 기준을 한 문장으로 정하고 움직이세요.','외부 변수보다 내가 어떤 순서와 기준으로 움직이는지가 중요한 흐름입니다. “오늘은 이것부터 한다”는 기준 하나를 먼저 정해두세요.'];
  }

  function relationFlow(label){
    if(/육합|삼합/.test(label))return '사람이나 정보와 연결되는 과정에서 예상보다 일이 쉽게 풀릴 수 있습니다. 혼자 완성한 뒤 보여주기보다 중간에 한 번 접점을 만드는 편이 유리합니다.';
    if(label==='충')return '예상과 다른 요청이나 일정 변경이 들어올 수 있습니다. 처음 계획을 끝까지 고집하기보다 중요한 목적만 지키고 방법은 바꿀 수 있게 두세요.';
    if(/형|해|파/.test(label))return '작은 어긋남이나 말의 차이가 평소보다 크게 느껴질 수 있습니다. 바로 결론 내리기보다 사실과 해석을 한 번 나눠보는 것이 좋습니다.';
    return '큰 외부 변수보다 내가 무엇을 먼저 선택하는지가 하루의 체감을 좌우합니다. 순서를 정하면 생각보다 안정적으로 흘러갑니다.';
  }

  function enhanceKey(){
    const key=$('[data-key-grid]');
    if(!key||key.dataset.actionReady==='true')return;
    const oldCards=[...key.querySelectorAll('.fortune-key-card')];
    const natal=oldCards[0]?.querySelector('strong')?.textContent?.trim()||'';
    const target=oldCards[1]?.querySelector('strong')?.textContent?.trim()||'';
    if(!target)return;
    const stem=[...target][0];
    const pack=packs[stem]||packs.기;
    const relationLabel=$('.fortune-relation .relation-pills span:nth-child(2)')?.textContent?.trim()||'평이';
    const [relationTitle,relationCopy]=relationAction(relationLabel);
    const evidence=`명리 근거 · 내 일주 ${natal||'—'} × ${dayWord} 일진 ${target} · ${relationLabel}`;

    key.innerHTML=`
      <article class="fortune-key-card is-action"><span>01 · 가장 먼저 할 일</span><strong>${pack.first}</strong><p>${pack.why}</p><div class="fortune-key-action"><b>${dayWord}의 행동</b><em>${pack.first}</em></div><small>${evidence}</small></article>
      <article class="fortune-key-card is-action"><span>02 · 사람·대화에서</span><strong>${relationTitle}</strong><p>${relationCopy}</p><div class="fortune-key-action"><b>${dayWord}의 행동</b><em>${relationTitle}</em></div><small>${evidence}</small></article>
      <article class="fortune-key-card is-action"><span>03 · 끝내기 전에</span><strong>${pack.finish}</strong><p>${dayWord}에 손댄 일 하나는 다음 단계나 완료 표시를 남겨두세요. 새 일을 늘리는 것보다 마감선을 만드는 편이 흐름을 안정시키는 데 도움이 됩니다.</p><div class="fortune-key-action"><b>${dayWord}의 행동</b><em>${pack.finish}</em></div><small>${evidence}</small></article>`;
    key.dataset.actionReady='true';

    const sec=key.closest('.fortune-report');
    if(sec){
      const h2=sec.querySelector('h2');
      if(h2)h2.textContent=`${dayWord}은 이 세 가지만 해보세요.`;
      let lead=sec.querySelector('.fortune-key-intro');
      if(!lead){lead=document.createElement('p');lead.className='fortune-key-intro';h2?.insertAdjacentElement('afterend',lead);}
      lead.textContent='긴 설명보다 실제로 옮길 수 있는 행동 세 가지만 남겼습니다.';
    }
  }

  function polishReport(){
    if(root.dataset.repeatPolished==='true')return;
    const relationLabel=$('.fortune-relation .relation-pills span:nth-child(2)')?.textContent?.trim()||'평이';
    const target=$('.fortune-relation .relation-pills span:nth-child(3)')?.textContent?.trim()||'';
    const stem=[...target][0]||'기';

    const story=$('[data-fortune-story]');
    if(story){
      story.innerHTML=`<p><strong>${dayWord}의 전체 흐름</strong> ${flowPacks[stem]||flowPacks.기}</p><p><strong>변수가 생긴다면</strong> ${relationFlow(relationLabel)}</p>`;
    }

    root.querySelectorAll('.fortune-choice-card ul').forEach(ul=>{
      [...ul.querySelectorAll('li')].slice(3).forEach(li=>li.remove());
    });
    const choice=$('.fortune-choice-section');
    if(choice){
      const lead=choice.querySelector('.fortune-section-lead');
      if(lead)lead.textContent=`${dayWord}에 바로 써볼 것 3가지와 줄이면 좋은 것 3가지만 골랐습니다.`;
    }

    $('.fortune-lucky-note')?.remove();

    const tip=$('.fortune-tip-section');
    if(tip)tip.remove();

    const total=$('[data-total-summary]');
    if(total){
      const headline=$('[data-headline]')?.textContent?.trim()||`${dayWord}의 흐름을 확인해보세요.`;
      const firstAction=$('[data-key-grid] .fortune-key-card:nth-child(1) strong')?.textContent?.trim()||'가장 중요한 일 하나부터 순서를 정하세요.';
      const caution=$('.fortune-choice-card.caution li:first-child strong')?.textContent?.trim()||'한 번에 너무 많은 일을 해결하려 하지 마세요.';
      total.innerHTML=`
        <p><span class="fortune-summary-label">OVERALL</span><strong>${headline}</strong><span class="fortune-summary-copy">${relationLabel}의 관계를 기준으로 하루의 큰 방향만 기억하면 충분합니다.</span></p>
        <p><span class="fortune-summary-label">FIRST</span><strong>${firstAction}</strong><span class="fortune-summary-copy">가장 먼저 움직일 한 가지입니다.</span></p>
        <p><span class="fortune-summary-label">CHECK</span><strong>${caution}</strong><span class="fortune-summary-copy">이 부분만 한 번 더 확인하면 흐름이 훨씬 단순해집니다.</span></p>`;
      const sec=total.closest('.fortune-report');
      if(sec){
        const label=sec.querySelector('.fortune-label');if(label)label.textContent='08 · TOTAL SUMMARY';
        const h2=sec.querySelector('h2');if(h2)h2.textContent=`${dayWord} 하루를 짧게 정리하면`;
      }
    }

    const evidence=$('[data-evidence]')?.closest('.fortune-report');
    if(evidence){const label=evidence.querySelector('.fortune-label');if(label)label.textContent='09 · INTERPRETATION BASIS';}
    root.dataset.repeatPolished='true';
  }

  function run(){enhanceKey();polishReport();}
  if(root.dataset.finalState==='ready')run();
  else{
    const observer=new MutationObserver(()=>{if(root.dataset.finalState==='ready'){observer.disconnect();run();}});
    observer.observe(root,{attributes:true,attributeFilter:['data-final-state']});
  }
})();