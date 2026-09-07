(()=>{
  const grid=document.querySelector('[data-talisman-grid]');
  if(!grid)return;

  const STORAGE_KEY='jungwoljae_saved_talismans_v1';
  const items=[
    {
      id:'opening',category:'change',number:'01',name:'개운부',hanja:'開運符',tag:'새 흐름 · 전환',
      image:'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260907-230321-0-e3fe4032.webp',
      summary:'막혀 있던 생각을 정리하고 새로운 시작을 선택할 때 곁에 두는 정월재의 개운 상징 카드입니다.',
      meaning:'개운(開運)은 운을 억지로 바꾼다는 뜻보다, 닫혀 있던 선택지를 다시 열고 흐름을 바꾸는 계기를 만든다는 의미로 해석합니다. 오래 미뤄둔 일을 시작하거나 생활 리듬을 새롭게 정리하고 싶을 때 어울립니다.',
      symbol:'중앙의 정월재 인장과 사방으로 뻗는 선형 구조는 중심을 잃지 않은 채 새로운 방향이 열리는 모습을 상징합니다. 반복되는 문양은 하루의 작은 선택이 쌓여 흐름을 만든다는 뜻을 담았습니다.',
      use:'이직·이사·새 프로젝트·새 학기처럼 환경이 달라지는 시기, 혹은 무언가를 다시 시작하고 싶지만 첫 행동이 잘 나오지 않을 때 보관해보세요.',
      keep:'휴대폰 갤러리나 배경화면에 저장하고, 아침에 오늘 꼭 바꾸고 싶은 행동 한 가지를 정한 뒤 한 번 바라보는 방식으로 활용해보세요.',
      phrase:'“새로운 운은 기다리는 것이 아니라, 오늘 바꾸는 작은 선택에서 시작됩니다.”'
    },
    {
      id:'wealth',category:'money',number:'02',name:'재물부',hanja:'財運符',tag:'재물 · 관리 · 축적',
      image:'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260907-230322-1-dbf9bb63.webp',
      summary:'돈이 들어오는 순간보다 벌고, 쓰고, 남기는 흐름을 안정적으로 관리하고 싶을 때 두는 재물 상징 카드입니다.',
      meaning:'재물운은 단순히 큰돈이 들어오는 상황만을 뜻하지 않습니다. 수입을 지키는 기준, 지출을 통제하는 습관, 기회를 현실적인 숫자로 판단하는 힘까지 함께 포함합니다. 정월부적의 재물부는 “모으는 운”보다 “흐트러지지 않는 관리”에 더 무게를 둡니다.',
      symbol:'좌우 대칭의 반복 구조는 들어오는 것과 나가는 것의 균형을, 중앙의 단단한 인장은 돈에 끌려가기보다 자신의 기준으로 관리하는 태도를 상징합니다.',
      use:'큰 지출을 앞두고 있거나, 저축 습관을 만들고 싶은 때, 사업·계약·구매처럼 금액 판단이 필요한 시기에 잘 어울립니다.',
      keep:'카드 이미지와 함께 이번 달의 한 가지 재물 기준을 적어두세요. 예를 들어 “계획에 없던 큰 결제는 하루 뒤 다시 본다”처럼 구체적인 규칙과 함께 보관하는 것이 좋습니다.',
      phrase:'“재물은 들어오는 순간보다, 남겨두는 기준에서 오래 머뭅니다.”'
    },
    {
      id:'relationship',category:'relationship',number:'03',name:'인연부',hanja:'姻緣符',tag:'인연 · 관계 · 연결',
      image:'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260907-230323-2-c15c14b3.webp',
      summary:'좋은 인연을 기다리는 마음뿐 아니라 이미 곁에 있는 관계를 더 건강하게 이어가고 싶을 때 두는 인연 상징 카드입니다.',
      meaning:'인연은 누군가가 반드시 찾아온다는 예언보다, 나와 상대의 속도와 경계를 존중하며 좋은 관계를 알아보는 기준에 가깝습니다. 이 부적은 새로운 만남, 연애, 우정, 협업처럼 사람과 사람 사이의 연결을 상징합니다.',
      symbol:'화문과 서로 마주 보는 장식은 다른 두 사람이 각자의 모습을 유지한 채 연결되는 관계를 표현합니다. 중앙의 원형은 가까워져도 각자의 중심을 잃지 않는 관계를 뜻합니다.',
      use:'새로운 사람을 만나기 시작했을 때, 썸이나 연애에서 마음이 복잡할 때, 혹은 인간관계에서 적당한 거리와 기준을 다시 세우고 싶을 때 어울립니다.',
      keep:'상대의 마음을 추측하는 도구가 아니라 내가 원하는 관계의 기준을 기억하는 상징으로 사용하세요. 연락, 약속, 존중 중 내가 가장 중요하게 보는 한 가지를 함께 적어두면 좋습니다.',
      phrase:'“좋은 인연은 나를 잃지 않으면서도 서로의 자리를 넓혀주는 관계입니다.”'
    },
    {
      id:'peace',category:'peace',number:'04',name:'평안부',hanja:'平安符',tag:'평안 · 안정 · 마음',
      image:'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260907-230324-3-79891f58.webp',
      summary:'마음이 쉽게 흔들리거나 하루가 복잡하게 느껴질 때 생활의 중심을 다시 잡는 의미로 두는 평안 상징 카드입니다.',
      meaning:'평안은 아무 일도 일어나지 않는 상태보다, 일이 생겨도 내 리듬을 잃지 않고 돌아올 수 있는 상태를 뜻합니다. 불안과 과로가 겹칠 때 먼저 생활을 정리하고 마음의 여백을 확보한다는 의미를 담았습니다.',
      symbol:'부드럽게 반복되는 구름과 곡선은 급하게 밀어붙이지 않는 흐름을, 좌우 균형 구조는 감정과 현실 사이의 안정된 중심을 나타냅니다.',
      use:'일이 많아 마음이 복잡할 때, 중요한 결과를 기다리는 중일 때, 잠들기 전 생각이 길어질 때처럼 안정과 휴식이 필요한 시기에 잘 어울립니다.',
      keep:'잠금화면이나 개인 앨범에 저장하고, 볼 때마다 “지금 당장 해결할 한 가지”와 “오늘은 미뤄도 되는 한 가지”를 나누어보세요.',
      phrase:'“평안은 모든 일이 끝난 뒤 오는 것이 아니라, 흔들리는 중에도 돌아올 자리를 만드는 일입니다.”'
    },
    {
      id:'travel',category:'change',number:'05',name:'출행부',hanja:'出行符',tag:'이동 · 여행 · 변화',
      image:'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260907-230325-4-89ad5038.webp',
      summary:'여행, 이사, 출국, 출근길처럼 공간을 옮길 때 무사한 이동과 차분한 준비를 상징하는 출행 카드입니다.',
      meaning:'출행(出行)은 단순한 여행뿐 아니라 익숙한 장소를 떠나 새로운 환경으로 움직이는 모든 변화를 포함합니다. 이동의 결과보다 준비·확인·귀환의 기준을 잊지 않는다는 의미로 구성했습니다.',
      symbol:'문과 계단, 산세가 이어지는 구도는 익숙한 곳에서 새로운 곳으로 넘어가는 길을 상징합니다. 중앙의 인장은 어디로 이동하더라도 자기 기준을 잃지 않는 중심을 의미합니다.',
      use:'여행 전날, 이사나 이직으로 생활 반경이 달라질 때, 장거리 운전이나 출장을 앞두었을 때처럼 이동 계획이 있는 시기에 어울립니다.',
      keep:'출발 전 갤러리에서 한 번 확인하며 신분증·예약·시간·교통·비상연락 등 실제 준비 항목을 체크하는 작은 의식처럼 사용해보세요.',
      phrase:'“좋은 길은 서두르는 길보다, 돌아올 자리까지 생각해둔 길입니다.”'
    },
    {
      id:'achievement',category:'work',number:'06',name:'성취부',hanja:'成就符',tag:'일 · 학업 · 완성',
      image:'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260907-230325-5-3ebc69bd.webp',
      summary:'시험, 프로젝트, 작업 마감처럼 결과를 만들어야 할 때 시작보다 끝까지 이어가는 힘을 상징하는 성취 카드입니다.',
      meaning:'성취는 단번에 큰 결과를 만드는 운보다 목표를 작은 단위로 나누고 끝까지 완성하는 흐름에 가깝습니다. 잘 시작하는 것과 제대로 마무리하는 것을 같은 무게로 두는 부적입니다.',
      symbol:'정교하게 반복되는 직선과 건축적 문양은 계획과 집중, 누적되는 과정을 표현합니다. 여러 겹의 사각 구조는 단계별로 목표에 가까워지는 모습을 뜻합니다.',
      use:'시험 준비, 포트폴리오, 논문, 업무 마감, 창업 준비처럼 긴 시간 집중이 필요한 시기에 잘 어울립니다.',
      keep:'작업 폴더나 휴대폰에 저장하고, 오늘 끝낼 수 있는 가장 작은 단위의 목표를 하나 정해 카드와 함께 기록해보세요.',
      phrase:'“성취는 가장 큰 결심보다, 끝낸 작은 일의 수에서 만들어집니다.”'
    },
    {
      id:'protection',category:'peace',number:'07',name:'수호부',hanja:'守護符',tag:'수호 · 경계 · 정돈',
      image:'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260907-230326-6-24a8e393.webp',
      summary:'외부의 소음에 휩쓸리지 않고 자신의 시간과 감정, 생활의 경계를 지키고 싶을 때 두는 수호 상징 카드입니다.',
      meaning:'수호는 보이지 않는 위험을 막는다는 단정적 의미보다, 내가 받아들일 것과 거리를 둘 것을 구분하는 힘을 상징합니다. 사람·일·정보가 너무 많이 들어올 때 자기 영역을 다시 세우는 데 초점을 둡니다.',
      symbol:'원을 감싸는 반복 문양은 중심을 둘러싼 보호의 경계를, 안과 밖이 명확하게 나뉜 구성은 필요한 것만 받아들이는 태도를 나타냅니다.',
      use:'사람 관계에 지쳤을 때, 일이 지나치게 많아졌을 때, 불필요한 연락과 정보에서 잠시 거리를 두고 싶은 시기에 어울립니다.',
      keep:'갤러리에 저장해두고 “오늘 내가 책임질 일”과 “내가 책임지지 않아도 되는 일”을 구분하는 신호로 활용해보세요.',
      phrase:'“나를 지킨다는 것은 모든 것을 막는 것이 아니라, 내 안에 들일 것을 선택하는 일입니다.”'
    },
    {
      id:'benefactor',category:'relationship',number:'08',name:'귀인부',hanja:'貴人符',tag:'귀인 · 도움 · 좋은 연결',
      image:'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260907-230921-8-4902157c.webp',
      summary:'혼자 해결하기 어려운 순간에 좋은 조언과 연결을 알아보고, 필요한 도움을 받아들이는 태도를 상징하는 귀인 카드입니다.',
      meaning:'귀인(貴人)은 특정한 누군가가 반드시 나타난다는 예언이라기보다, 내가 놓치고 있던 정보와 기회를 연결해주는 사람·관계·조언을 알아보는 감각을 뜻합니다. 도움을 받는 일을 약함으로 여기지 않고 적절한 사람에게 질문하고 협력하는 태도까지 포함합니다.',
      symbol:'물 위를 잇는 다리와 양쪽으로 이어지는 길은 서로 떨어져 있던 자리 사이에 통로가 생기는 모습을 상징합니다. 주변의 매화와 구름 문양은 때를 기다린 뒤 맞는 시점에 인연과 기회가 연결되는 흐름을 표현합니다.',
      use:'새로운 협업이나 거래처를 찾을 때, 취업·이직·진학처럼 조언이 필요한 선택 앞에 있을 때, 혼자 고민이 길어져 다른 관점이 필요한 시기에 잘 어울립니다.',
      keep:'휴대폰 갤러리나 정월부적 보관함에 저장하고, 막히는 일이 생길 때 “지금 누구에게 물어보면 가장 정확한 답을 얻을 수 있을까?”를 한 번 떠올리는 기준으로 활용해보세요.',
      phrase:'“좋은 도움은 우연히 오는 것만이 아니라, 필요한 순간에 손을 내밀 줄 아는 태도에서 시작됩니다.”'
    }
  ];

  const modal=document.querySelector('[data-talisman-modal]');
  const empty=document.querySelector('[data-talisman-empty]');
  const savedCount=document.querySelector('[data-saved-count]');
  const savedToggle=document.querySelector('[data-saved-toggle]');
  let activeFilter='all';
  let savedOnly=false;
  let currentId=null;

  const readSaved=()=>{try{return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'));}catch(e){return new Set();}};
  const writeSaved=set=>localStorage.setItem(STORAGE_KEY,JSON.stringify([...set]));
  const isSaved=id=>readSaved().has(id);
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function toast(message){
    document.querySelector('.talisman-toast')?.remove();
    const node=document.createElement('div');node.className='talisman-toast';node.textContent=message;document.body.appendChild(node);
    setTimeout(()=>node.remove(),1800);
  }

  function toggleSave(id){
    const saved=readSaved();
    if(saved.has(id)){saved.delete(id);toast('정월부적 보관함에서 꺼냈습니다.');}
    else{saved.add(id);toast('정월부적 보관함에 저장했습니다.');}
    writeSaved(saved);render();syncModalButtons();
  }

  async function download(item){
    try{
      toast('이미지를 준비하고 있습니다.');
      const response=await fetch(item.image,{mode:'cors'});
      if(!response.ok)throw new Error('download failed');
      const blob=await response.blob();
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;a.download=`jungwoljae-${item.id}-talisman.webp`;document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1200);
      toast('이미지 저장을 시작했습니다.');
    }catch(e){
      window.open(item.image,'_blank','noopener');
      toast('이미지를 새 창으로 열었습니다. 길게 눌러 저장할 수 있습니다.');
    }
  }

  function cardHtml(item){
    const saved=isSaved(item.id);
    return `<article class="talisman-card" data-id="${item.id}" data-category="${item.category}">
      <button type="button" class="talisman-image-button" data-detail="${item.id}" aria-label="${esc(item.name)} 상세 보기"><img src="${item.image}" alt="${esc(item.name)} ${esc(item.hanja)} 정월부적" loading="lazy"></button>
      <div class="talisman-card-body">
        <div class="talisman-card-top"><span>${item.number} · ${item.hanja}</span><em>${item.tag}</em></div>
        <h3>${item.name}</h3><p>${item.summary}</p>
        <div class="talisman-card-actions"><button type="button" class="detail" data-detail="${item.id}">상세 보기</button><button type="button" class="save${saved?' is-saved':''}" data-save="${item.id}">${saved?'보관됨':'보관하기'}</button></div>
      </div>
    </article>`;
  }

  function render(){
    const saved=readSaved();
    savedCount.textContent=saved.size;
    savedToggle?.classList.toggle('is-active',savedOnly);
    const visible=items.filter(item=>(activeFilter==='all'||item.category===activeFilter)&&(!savedOnly||saved.has(item.id)));
    grid.innerHTML=visible.map(cardHtml).join('');
    if(empty)empty.hidden=visible.length>0;
  }

  function openModal(id){
    const item=items.find(x=>x.id===id);if(!item||!modal)return;
    currentId=id;
    modal.querySelector('[data-modal-image]').src=item.image;
    modal.querySelector('[data-modal-image]').alt=`${item.name} ${item.hanja} 정월부적`;
    modal.querySelector('[data-modal-kicker]').textContent=`${item.number} · ${item.hanja} · ${item.tag}`;
    modal.querySelector('[data-modal-title]').textContent=item.name;
    modal.querySelector('[data-modal-summary]').textContent=item.summary;
    modal.querySelector('[data-modal-details]').innerHTML=`
      <div class="talisman-detail-item"><span>핵심 의미</span><p>${item.meaning}</p></div>
      <div class="talisman-detail-item"><span>도상과 상징</span><p>${item.symbol}</p></div>
      <div class="talisman-detail-item"><span>이런 때에</span><p>${item.use}</p></div>
      <div class="talisman-detail-item"><span>보관 방법</span><p>${item.keep}</p></div>`;
    modal.querySelector('[data-modal-phrase]').textContent=item.phrase;
    syncModalButtons();
    modal.hidden=false;modal.setAttribute('aria-hidden','false');document.body.classList.add('talisman-modal-open');
    modal.querySelector('.talisman-modal-close')?.focus();
  }

  function closeModal(){if(!modal)return;modal.hidden=true;modal.setAttribute('aria-hidden','true');document.body.classList.remove('talisman-modal-open');currentId=null;}
  function syncModalButtons(){
    if(!modal||!currentId)return;
    const btn=modal.querySelector('[data-modal-save]');const saved=isSaved(currentId);
    if(btn){btn.textContent=saved?'보관됨 · 해제하기':'보관하기';btn.classList.toggle('is-saved',saved);}
  }

  document.addEventListener('click',event=>{
    const detail=event.target.closest('[data-detail]');if(detail){openModal(detail.dataset.detail);return;}
    const save=event.target.closest('[data-save]');if(save){toggleSave(save.dataset.save);return;}
    const close=event.target.closest('[data-modal-close]');if(close){closeModal();return;}
    const filter=event.target.closest('[data-filter]');if(filter){
      activeFilter=filter.dataset.filter;savedOnly=false;
      document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('is-active',b===filter));render();return;
    }
  });

  savedToggle?.addEventListener('click',()=>{savedOnly=!savedOnly;render();});
  modal?.querySelector('[data-modal-save]')?.addEventListener('click',()=>{if(currentId)toggleSave(currentId);});
  modal?.querySelector('[data-modal-download]')?.addEventListener('click',()=>{const item=items.find(x=>x.id===currentId);if(item)download(item);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modal?.hidden)closeModal();});

  render();
})();
