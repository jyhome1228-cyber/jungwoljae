(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!file.endsWith('-result.html'))return;

  const inputKeys={
    'saju-result.html':'jungwoljae_saju_input',
    'ohaeng-result.html':'jungwoljae_ohaeng_input',
    'fortune-result.html':'jungwoljae_fortune_input',
    'relationship-result.html':'jungwoljae_relationship_input',
    'work-money-result.html':'jungwoljae_work_money_input',
    'compatibility-result.html':'jungwoljae_compatibility_input'
  };
  let input={};
  try{input=JSON.parse(sessionStorage.getItem(inputKeys[file])||'{}');}catch(e){}

  const $=(s,root=document)=>root.querySelector(s);
  const $all=(s,root=document)=>[...root.querySelectorAll(s)];
  const txt=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();

  const elementEasy={
    목:'시작하고 키우는 힘',
    화:'표현하고 움직이는 힘',
    토:'안정시키고 관리하는 힘',
    금:'판단하고 정리하는 힘',
    수:'살피고 연결하는 힘'
  };
  const elementHanja={목:'木',화:'火',토:'土',금:'金',수:'水'};
  const groupEasy={
    비겁:'주도성 · 동료와 경쟁',
    식상:'표현 · 실행 · 결과물',
    재성:'돈 · 현실 · 자원 관리',
    관성:'책임 · 규칙 · 조직',
    인성:'배움 · 정보 · 전문성'
  };
  const godEasy={
    비견:'내 기준과 독립성',
    겁재:'경쟁과 주도권',
    식신:'꾸준한 표현과 생산',
    상관:'자유로운 표현과 문제 해결',
    편재:'기회 · 거래 · 유동적 수입',
    정재:'안정적 수입 · 계획적 관리',
    편관:'압박 속 책임과 결단',
    정관:'규칙 · 직책 · 책임',
    편인:'직감 · 독창적 학습',
    정인:'배움 · 정보 · 보호'
  };
  const relationEasy={
    '일지와 육합':'관계가 자연스럽게 맞물리는 흐름',
    '육합':'서로 맞물리기 쉬운 흐름',
    '일지와 충':'변화와 부딪힘이 커지는 흐름',
    '충':'변화와 부딪힘이 큰 흐름',
    '일지와 같은 지지':'익숙한 성향이 강해지는 흐름',
    '평이한 흐름':'큰 충돌 없이 무난한 흐름',
    '평이한 관계':'큰 충돌 없이 무난한 관계',
    '합의 흐름':'연결점이 생기기 쉬운 흐름',
    '조율의 흐름':'오해와 속도 차이를 조율할 흐름'
  };

  const easyElementFromText=value=>{
    const t=String(value||'');
    return Object.keys(elementEasy).find(k=>t===k||t.includes(`${k}(`)||t.includes(`${elementHanja[k]} ${k}`)||t.includes(`${elementHanja[k]}${k}`))||null;
  };

  function friendlyValue(value){
    const raw=String(value||'').trim();
    if(!raw)return raw;
    if(groupEasy[raw])return groupEasy[raw];
    if(godEasy[raw])return godEasy[raw];
    if(relationEasy[raw])return relationEasy[raw];
    if(elementEasy[raw])return elementEasy[raw];

    const el=easyElementFromText(raw);
    if(el && (raw.length<=18 || /^[木火土金水]\s*[목화토금수]/.test(raw)))return elementEasy[el];

    if(raw.includes(' · ')){
      return raw.split(' · ').map(part=>{
        const p=part.trim();
        return groupEasy[p]||godEasy[p]||relationEasy[p]||elementEasy[p]||p;
      }).join(' · ');
    }
    return raw;
  }

  function friendlySentence(value){
    let t=String(value||'');
    const replacePairs=[
      ['명식 안에서','사주 전체 구조에서'],['명식에서는','사주 전체 구조에서는'],['명식에서','사주 전체 구조에서'],
      ['작용이 상대적으로 강하고','성향이 비교적 자주 드러나고'],['작용이 강하게','성향이 강하게'],['작용이','성향이'],
      ['의식적으로 보완할 부분','조금 더 신경 써야 할 부분'],['보완할 부분','조금 더 신경 써야 할 부분'],
      ['보완하면 좋은 기운','놓치기 쉬워 챙기면 좋은 힘'],['강하게 쓰이는 기운','자연스럽게 잘 쓰는 힘'],
      ['기운이 상대적으로 두드러집니다','성향이 비교적 자주 드러납니다'],['기운이 강하게','성향이 강하게'],
      ['비겁의','주도성과 동료·경쟁 관계의'],['식상의','표현과 결과물의'],['재성의','돈과 현실 감각의'],['관성의','책임과 조직 기준의'],['인성의','배움과 정보 축적의'],
      ['비겁은','주도성과 동료·경쟁 관계는'],['식상은','표현과 결과물은'],['재성은','돈과 현실 감각은'],['관성은','책임과 조직 기준은'],['인성은','배움과 정보 축적은'],
      ['비겁','주도성·동료·경쟁'],['식상','표현·실행·결과물'],['재성','돈·현실·자원관리'],['관성','책임·규칙·조직'],['인성','배움·정보·전문성']
    ];
    replacePairs.forEach(([a,b])=>{t=t.split(a).join(b);});

    Object.entries(relationEasy).forEach(([a,b])=>{t=t.split(a).join(b);});
    Object.entries(godEasy).forEach(([a,b])=>{t=t.split(a).join(b);});

    t=t
      .replace(/목\([^)]*\)/g,elementEasy.목)
      .replace(/화\([^)]*\)/g,elementEasy.화)
      .replace(/토\([^)]*\)/g,elementEasy.토)
      .replace(/금\([^)]*\)/g,elementEasy.금)
      .replace(/수\([^)]*\)/g,elementEasy.수)
      .replace(/갑목은|을목은|병화는|정화는|무토는|기토는|경금은|신금은|임수는|계수는/g,'이 성향은');
    return t;
  }

  function simplifyParagraphs(root){
    $all('p',root).forEach(p=>{
      if(p.closest('.relationship-evidence-content,.fortune-evidence-content,.work-evidence-content,.evidence-content'))return;
      p.textContent=friendlySentence(p.textContent);
    });
  }

  function simplifyStrongValues(root){
    $all('strong,h3',root).forEach(n=>{
      if(n.closest('.relationship-evidence-content,.fortune-evidence-content,.work-evidence-content,.evidence-content'))return;
      const raw=txt(n),next=friendlyValue(raw);
      if(next!==raw){
        n.textContent=next;
        n.title=`전통 명리 분류: ${raw}`;
      }
    });
  }

  function addTermNote(card,raw){
    if(!card||!raw||card.querySelector('.result-term-note'))return;
    let note='';
    if(raw==='비겁')note='전통 명리의 ‘비겁’은 비견·겁재를 묶어 부르는 말로, 일반적인 “비겁하다”와는 전혀 다른 뜻입니다.';
    else if(groupEasy[raw])note=`전통 명리에서는 ‘${raw}’ 계열로 분류합니다.`;
    else if(elementEasy[raw])note=`전통 명리에서는 ${raw}(${elementHanja[raw]})의 성향으로 분류합니다.`;
    if(!note)return;
    const em=document.createElement('em');
    em.className='result-term-note';
    em.textContent=note;
    const strong=card.querySelector('strong');
    strong?.insertAdjacentElement('afterend',em);
  }

  function fixWork(){
    const root=$('[data-work-result]');if(!root)return;
    const cards=$all('.work-core-card',root);
    cards.forEach((card,index)=>{
      const strong=card.querySelector('strong');
      if(!strong)return;
      const raw=txt(strong);
      if(index===1 && groupEasy[raw]){
        strong.textContent=groupEasy[raw];
        addTermNote(card,raw);
      }
      if((index===2||index===3) && elementEasy[raw]){
        strong.textContent=elementEasy[raw];
        addTermNote(card,raw);
      }
      const span=card.querySelector('span');
      if(span){
        span.textContent=span.textContent
          .replace('강하게 쓰이는 기운','자연스럽게 잘 쓰는 힘')
          .replace('보완하면 좋은 기운','놓치기 쉬워 챙기면 좋은 힘');
      }
    });

    $all('.year-card strong,.focus-result-card strong,.money-card strong,.work-guide-card strong',root).forEach(n=>n.textContent=friendlyValue(txt(n)));
    simplifyParagraphs(root);
    simplifyStrongValues(root);
  }

  const daymasterEasy={
    甲:'방향을 세우고 시작을 만드는 성향',乙:'상황을 읽고 유연하게 길을 만드는 성향',
    丙:'표현하고 분위기를 움직이는 성향',丁:'집중해서 세밀하게 완성하는 성향',
    戊:'중심을 잡고 구조를 안정시키는 성향',己:'꾸준히 관리하고 쌓아가는 성향',
    庚:'판단하고 정리하는 성향',辛:'세부를 구분하고 완성도를 높이는 성향',
    壬:'큰 흐름을 보고 연결하는 성향',癸:'작은 변화를 읽고 차분히 준비하는 성향'
  };

  function fixSaju(){
    const root=$('[data-saju-result]');if(!root)return;
    const symbol=txt($('[data-daymaster-symbol]',root));
    if(daymasterEasy[symbol])$('[data-daymaster-title]',root).textContent=daymasterEasy[symbol];

    const tenHeading=$all('h2',root).find(h=>txt(h).includes('십성'));
    if(tenHeading){
      const row=tenHeading.closest('.section-heading-row');
      const side=row?.querySelector(':scope > p');
      if(side)side.textContent='십성은 일반 단어의 뜻이 아니라 전통 명리에서 관계와 역할을 나누는 분류입니다. 아래에서는 쉬운 의미를 먼저 보여드립니다.';
    }

    $all('.ten-god-card',root).forEach(card=>{
      const label=card.querySelector('span');
      if(!label)return;
      const raw=txt(label);
      if(groupEasy[raw]){
        label.textContent=groupEasy[raw];
        addTermNote(card,raw);
      }
    });

    $all('.year-card strong,.summary-card strong',root).forEach(n=>n.textContent=friendlyValue(txt(n)));
    simplifyParagraphs(root);
    simplifyStrongValues(root);
  }

  function fixOhaeng(){
    const root=$('[data-ohaeng-result]');if(!root)return;
    $all('.element-card',root).forEach(card=>{
      const strong=card.querySelector('strong');if(!strong)return;
      const el=easyElementFromText(txt(strong));
      if(el){strong.textContent=elementEasy[el];addTermNote(card,el);}
    });
    $all('.key-card strong,.life-card strong',root).forEach(n=>n.textContent=friendlyValue(txt(n)));
    simplifyParagraphs(root);
    simplifyStrongValues(root);
  }

  function fixFortune(){
    const root=$('[data-fortune-result]');if(!root)return;
    $all('.relation-pills span',root).forEach(n=>n.textContent=relationEasy[txt(n)]||friendlyValue(txt(n)));
    $all('.fortune-card strong,.fortune-key strong,.fortune-time-card strong',root).forEach(n=>n.textContent=friendlyValue(txt(n)));
    simplifyParagraphs(root);
  }

  const relationshipEasy={
    목:{core:'호감이 생기면 관계를 앞으로 움직여보고 싶은 마음이 비교적 빨리 생길 수 있습니다. 연락을 먼저 하거나 다음 약속을 잡는 데 망설임이 적은 편이지만, 상대가 천천히 보는 단계라면 속도 차이가 생길 수 있습니다.',close:'가까워진 뒤에도 함께 새로운 경험을 하거나 관계가 조금씩 발전한다는 느낌이 있을 때 만족도가 높습니다. 같은 패턴만 반복되면 답답함을 느낄 수 있습니다.'},
    화:{core:'좋아하는 마음이 생기면 말투와 연락 빈도처럼 감정이 비교적 겉으로 드러나는 편입니다. 상대의 반응도 빨리 확인하고 싶어질 수 있어 표현이 적으면 생각보다 크게 신경 쓰일 수 있습니다.',close:'애정 표현과 반응이 오가는 관계에서 안정감을 느끼기 쉽습니다. 표현이 거의 없는 사람과 만나면 실제 마음보다 내가 덜 사랑받는다고 느낄 수 있습니다.'},
    토:{core:'연락이 일정하고 약속을 지키는 사람에게 안정감을 느끼기 쉽습니다. 한 번 마음을 주면 오래 보려는 편이라 불편한 관계도 오래 참을 수 있습니다.',close:'가까워질수록 화려한 이벤트보다 약속 시간, 생활 리듬, 꾸준한 태도가 더 중요해질 수 있습니다.'},
    금:{core:'관계를 시작할 때 예의와 약속, 말의 무게처럼 분명한 기준을 중요하게 보는 편입니다. 좋아해도 상대가 선을 넘거나 말을 자주 바꾸면 신뢰가 빨리 떨어질 수 있습니다.',close:'가까운 사이여도 각자의 시간과 영역이 존중될 때 편합니다. 서로 믿고 각자 시간을 보낼 수 있는 관계가 더 오래가기 쉽습니다.'},
    수:{core:'호감이 생겨도 바로 확신하기보다 상대의 말투와 연락 패턴, 약속을 지키는지를 오래 살펴보는 편입니다. 처음에는 마음이 없는 것처럼 보여도 실제로는 판단 전 관찰 시간이 필요한 경우가 많습니다.',close:'가까워질수록 혼자 생각할 시간과 부담 없이 말할 수 있는 분위기가 중요합니다. 계속 답을 재촉하는 관계에서는 좋아하는 마음이 있어도 피로가 커질 수 있습니다.'}
  };

  function fixRelationship(){
    const root=$('[data-relationship-result]');if(!root)return;
    $all('p',root).forEach(p=>{
      if(/자료 조사|글쓰기|기획|분석|아카이브|포트폴리오|업무 기록/.test(txt(p)) && p.closest('.relationship-report'))p.remove();
    });
    const cards=$all('.relationship-core-card',root);
    cards.forEach((card,index)=>{
      const strong=card.querySelector('strong');if(!strong)return;
      const raw=txt(strong),el=easyElementFromText(raw);
      if(el){
        strong.textContent=elementEasy[el];
        addTermNote(card,el);
        const p=card.querySelector('p');
        const easy=relationshipEasy[el];
        if(p&&easy)p.textContent=index===0?easy.core:index===1?easy.close:p.textContent;
      }
    });
    simplifyParagraphs(root);
    simplifyStrongValues(root);
  }

  function fixCompatibility(){
    const root=$('[data-compatibility-result]');if(!root)return;
    simplifyParagraphs(root);
    simplifyStrongValues(root);
  }

  function run(){
    $all('.realism-note').forEach(n=>n.remove());
    if(file==='work-money-result.html')fixWork();
    else if(file==='saju-result.html')fixSaju();
    else if(file==='ohaeng-result.html')fixOhaeng();
    else if(file==='fortune-result.html')fixFortune();
    else if(file==='relationship-result.html')fixRelationship();
    else if(file==='compatibility-result.html')fixCompatibility();
  }

  requestAnimationFrame(()=>requestAnimationFrame(run));
  setTimeout(run,180);
  setTimeout(run,500);
})();
