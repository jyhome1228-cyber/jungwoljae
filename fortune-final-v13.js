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

  function relationAction(label){
    if(/육합|삼합/.test(label))return ['먼저 연락하거나 제안을 꺼내보세요.','사람과의 접점이 자연스럽게 생기기 쉬운 흐름입니다. 기다리기만 하기보다 가벼운 연락, 제안, 약속처럼 먼저 문을 여는 행동이 잘 맞습니다.'];
    if(/충|형|해|파/.test(label))return ['중요한 말은 추측하지 말고 한 번 직접 확인하세요.','작은 차이도 크게 느껴질 수 있는 흐름입니다. 답장 속도나 말투만 보고 결론 내리기보다 궁금한 한 가지를 직접 묻는 편이 관계와 일 모두에서 도움이 됩니다.'];
    return ['내 기준을 한 문장으로 정하고 움직이세요.','외부 변수보다 내가 어떤 순서와 기준으로 움직이는지가 중요한 흐름입니다. “오늘은 이것부터 한다”는 기준 하나를 먼저 정해두세요.'];
  }

  function enhance(){
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
      <article class="fortune-key-card is-action">
        <span>01 · 가장 먼저 할 일</span>
        <strong>${pack.first}</strong>
        <p>${pack.why}</p>
        <div class="fortune-key-action"><b>${dayWord}의 행동</b><em>${pack.first}</em></div>
        <small>${evidence}</small>
      </article>
      <article class="fortune-key-card is-action">
        <span>02 · 사람·대화에서</span>
        <strong>${relationTitle}</strong>
        <p>${relationCopy}</p>
        <div class="fortune-key-action"><b>${dayWord}의 행동</b><em>${relationTitle}</em></div>
        <small>${evidence}</small>
      </article>
      <article class="fortune-key-card is-action">
        <span>03 · 끝내기 전에</span>
        <strong>${pack.finish}</strong>
        <p>${dayWord}의 기운을 가장 쉽게 쓰는 방법은 새로운 일을 계속 늘리는 것보다, 이미 손댄 일 하나에 분명한 다음 단계나 완료 표시를 남기는 것입니다.</p>
        <div class="fortune-key-action"><b>${dayWord}의 행동</b><em>${pack.finish}</em></div>
        <small>${evidence}</small>
      </article>`;
    key.dataset.actionReady='true';

    const sec=key.closest('.fortune-report');
    if(sec){
      const h2=sec.querySelector('h2');
      if(h2)h2.textContent=`${dayWord}은 이 세 가지만 해보세요.`;
      let lead=sec.querySelector('.fortune-key-intro');
      if(!lead){lead=document.createElement('p');lead.className='fortune-key-intro';h2?.insertAdjacentElement('afterend',lead);}
      lead.textContent=`명리 용어는 아래에 근거로 남기고, 먼저 ${dayWord} 실제로 해볼 행동부터 정리했습니다.`;
    }
  }

  if(root.dataset.finalState==='ready')enhance();
  else{
    const observer=new MutationObserver(()=>{if(root.dataset.finalState==='ready'){observer.disconnect();enhance();}});
    observer.observe(root,{attributes:true,attributeFilter:['data-final-state']});
  }
})();
