(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const supported=new Set(['saju-result.html','ohaeng-result.html','fortune-result.html','relationship-result.html','work-money-result.html','guide-result.html']);
  if(!supported.has(file))return;

  const $=(s,r=document)=>r.querySelector(s);
  const all=(s,r=document)=>[...r.querySelectorAll(s)];
  const txt=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();
  const clip=(v,n=165)=>{const t=String(v||'').replace(/\s+/g,' ').trim();return t.length>n?`${t.slice(0,n).replace(/[,.\s]+$/,'')}…`:t;};
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const root=$('main');if(!root)return;

  function firstText(selector,scope=root){return txt($(selector,scope));}
  function firstParagraph(selector,scope=root){const n=$(selector,scope);if(!n)return'';return txt(n.querySelector?.('p')||n);}
  function listText(selector,limit=2,scope=root){return all(selector,scope).slice(0,limit).map(txt).filter(Boolean).join(' · ');}
  function name(){return firstText('[data-name]')||'회원';}

  function addSub(h2,copy){
    if(!h2||!copy)return;
    let sub=h2.parentElement?.querySelector(':scope > .result-plain-sub');
    if(!sub){sub=document.createElement('span');sub.className='result-plain-sub';h2.insertAdjacentElement('afterend',sub);}
    sub.textContent=copy;
  }
  function retitle(labelSelector,key,title,sub){
    const label=all(labelSelector,root).find(n=>txt(n).startsWith(key));if(!label)return;
    const box=label.closest('section,article,div');
    const h2=box?.querySelector('h2');if(!h2)return;
    h2.textContent=title;addSub(h2,sub);
  }

  function verbal(value){
    let t=String(value||'');
    const pairs=[
      ['명식 안에서','사주 전체에서'],['명식에서는','사주 전체에서는'],['명식에서','사주 전체에서'],['명식','사주 구조'],
      ['의식적으로 보완할','조금 더 챙기면 좋은'],['의식적으로 보완','일부러 챙기기'],['보완할 부분','챙기면 좋은 부분'],['보완하는','챙기는'],
      ['작용이 상대적으로 강하고','특징이 비교적 자주 나타나고'],['작용이 강하게','특징이 뚜렷하게'],['작용이','특징이'],
      ['드러나는 편입니다','나타나는 편입니다'],['드러납니다','나타날 수 있습니다'],['읽힙니다','볼 수 있습니다'],
      ['~하는 경향','~하는 편'],['상대 강도','상대적인 비중'],['균형을 잡을','놓치는 부분을 챙길'],
      ['미래를 단정하기보다','미래를 정답처럼 예측하기보다'],['기운','성향']
    ];
    pairs.forEach(([a,b])=>{t=t.split(a).join(b);});
    return t;
  }

  function humanizeVisible(){
    all('p',root).forEach(p=>{
      if(p.closest('.result-methodology-section,.result-friendly-overview,.evidence-content,.fortune-evidence-content,.relationship-evidence-content,.work-evidence-content,.guide-evidence-content'))return;
      const before=p.textContent,after=verbal(before);if(after!==before)p.textContent=after;
    });
  }

  function overviewHTML(title,intro,cards,callout){
    return `<section class="result-friendly-overview" data-result-friendly-overview>
      <div class="result-friendly-head"><div><span>FIRST, READ THIS</span><h2>${esc(title)}</h2></div><p>${esc(intro)}</p></div>
      <div class="result-friendly-grid">${cards.map((c,i)=>`<article class="result-friendly-card${i===0?' is-main':''}"><small>${esc(c.label)}</small><strong>${esc(c.title)}</strong><p>${esc(c.copy)}</p>${c.note?`<em>${esc(c.note)}</em>`:''}</article>`).join('')}</div>
      ${callout?`<div class="result-friendly-callout"><span>${esc(callout.label||'한 줄 조언')}</span><strong>${esc(callout.title)}</strong>${callout.copy?`<p>${esc(callout.copy)}</p>`:''}</div>`:''}
    </section>`;
  }

  function insertOverview(html,hero){
    if(!hero||$('[data-result-friendly-overview]',root))return;
    hero.insertAdjacentHTML('afterend',html);
  }

  function saju(){
    const hero=$('.saju-hero',root);if(!hero)return;
    const n=name(),dm=firstText('[data-daymaster-title]')||'내 반응 방식에 분명한 기준이 있는 편';
    const summary=verbal(firstText('[data-summary]'));
    const life=all('.life-card',root);
    const work=verbal(firstParagraph('.life-card:nth-child(2)'))||verbal(firstText('[data-daymaster-text]'));
    const relation=verbal(firstParagraph('.life-card:nth-child(4)'))||verbal(firstText('[data-balance-copy]'));
    const balance=verbal(firstText('[data-balance-copy]'));
    insertOverview(overviewHTML(
      `${n}님의 사주, 먼저 이렇게 이해하면 됩니다.`,
      '전문 용어는 뒤에서 천천히 봐도 됩니다. 먼저 “나는 어떤 사람이고, 어디서 잘하고, 어디서 피곤해지는지”부터 보세요.',
      [
        {label:'한마디로',title:dm,copy:clip(summary,190),note:'명리학의 일간·오행은 이 설명을 만드는 근거입니다.'},
        {label:'일에서는',title:'잘하는 방식이 분명한 편',copy:clip(work,180)},
        {label:'사람·선택에서는',title:'익숙한 반응만 반복하지 않는 게 중요',copy:clip(relation||balance,180)}
      ],
      {label:'이 사주의 핵심',title:'잘하는 것을 더 세게 밀기보다, 놓치기 쉬운 부분을 생활 습관으로 챙기면 훨씬 편해집니다.',copy:clip(balance,190)}
    ),hero);
    const h1=hero.querySelector('h1');if(h1)h1.innerHTML=`${esc(n)}님의 사주,<br />쉽게 말하면 이런 사람입니다.`;
    retitle('.saju-label','01','사주 원본부터 가볍게 보기','명리 용어: 사주팔자(四柱八字) · 태어난 연·월·일·시를 계산한 기본표');
    retitle('.saju-label','02','나는 어떤 방식으로 반응하는 사람인가','명리 용어: 일간(日干) · 사주에서 “나”를 놓고 비교하는 기준점');
    retitle('.saju-label','03','내가 자연스럽게 하는 것과 놓치기 쉬운 것','명리 용어: 음양오행(陰陽五行) · 시작·표현·관리·판단·관찰 기능의 상대 비중');
    retitle('.saju-label','04','일·돈·사람을 대할 때 반복되는 방식','명리 용어: 십성(十星) · 주도성·표현·돈·책임·배움의 관계 분류');
    retitle('.saju-label','05','실제 생활에서는 이렇게 보일 수 있어요','앞의 명리 구조를 일·돈·관계·선택 상황으로 번역한 부분입니다.');
    retitle('.saju-label','06','올해는 무엇에 신경 쓰면 좋을까','명리 용어: 세운(歲運) · 올해의 기운을 내 사주와 비교해 보는 참고 흐름');
    retitle('.saju-label','08','그래서 내 사주를 한 문장으로 정리하면','전문 용어보다 실제 생활에서 기억할 강점·주의점·행동 기준을 먼저 보세요.');
  }

  function ohaeng(){
    const hero=$('.result-hero',root);if(!hero)return;
    const n=name(),summary=verbal(firstText('[data-summary]'));
    const strong=verbal(firstText('[data-strong-text]'));
    const weak=verbal(firstText('[data-weak-text]'));
    const life=verbal(firstParagraph('.life-card'));
    const total=verbal(firstText('[data-total-summary]'));
    insertOverview(overviewHTML(
      `${n}님의 오행, 숫자보다 이 세 가지가 중요합니다.`,
      '목·화·토·금·수의 이름을 외우지 않아도 됩니다. “자동으로 잘 되는 것 / 놓치기 쉬운 것 / 실제로 어떻게 챙길지”만 보면 됩니다.',
      [
        {label:'자연스럽게 잘 되는 것',title:'힘을 많이 주지 않아도 나오는 방식',copy:clip(strong||summary,185)},
        {label:'놓치기 쉬운 것',title:'필요할 때 일부러 챙기면 좋은 방식',copy:clip(weak,185)},
        {label:'생활에서는',title:'일·돈·관계에서 이렇게 나타날 수 있어요',copy:clip(life||total,185)}
      ],
      {label:'오행을 보는 법',title:'비율이 높다고 무조건 좋고, 0%라고 나쁜 것이 아닙니다.',copy:'오행은 능력 점수가 아니라 어떤 방식을 자주 쓰고 어떤 방식은 덜 쓰는지 보여주는 상대적인 분포입니다.'}
    ),hero);
    const h1=hero.querySelector('h1');if(h1)h1.innerHTML=`${esc(n)}님은 무엇을 자연스럽게 하고,<br />무엇을 놓치기 쉬울까요?`;
    retitle('.section-label','01','나는 어떤 방식을 많이 쓰는 편일까','명리 용어: 오행 분포(五行) · 목·화·토·금·수를 생활 기능으로 나눠 본 상대 비중');
    retitle('.section-label','02','힘주지 않아도 잘 되는 것','명리 용어: 강한 오행 · 사주에서 상대적으로 자주 나타나는 기능');
    retitle('.section-label','03','일부러 챙기면 더 편해지는 것','명리 용어: 약한 오행 · 부족한 능력이 아니라 상대적으로 덜 쓰는 기능');
    retitle('.section-label','04','왜 한쪽만 보고 판단하면 안 될까','명리 용어: 상생(相生) · 다섯 기능이 서로 이어지고 영향을 주는 흐름');
    retitle('.section-label','05','일·돈·관계에서는 이렇게 나타나요','오행의 비율을 실제 생활 장면으로 바꿔 설명합니다.');
    retitle('.section-label','06','이것만 기억해도 됩니다','내가 잘 쓰는 방식과 일부러 챙길 방식만 기억하면 충분합니다.');
    retitle('.section-label','07','그래서 내 오행은?','전체 내용을 생활 언어로 다시 정리한 최종 요약입니다.');
  }

  function fortune(){
    const hero=$('.fortune-hero',root);if(!hero)return;
    const n=name(),headline=firstText('[data-headline]')||'오늘은 속도보다 순서를 보는 게 좋습니다.';
    const signal=verbal(firstText('[data-signal-note]'));
    const dos=listText('[data-do-list] li',2),donts=listText('[data-dont-list] li',2);
    const total=verbal(firstText('[data-total-summary]'));
    insertOverview(overviewHTML(
      `${n}님, 오늘은 이것부터 보면 됩니다.`,
      '좋은 날·나쁜 날로 단정하기보다 오늘 어떤 행동은 잘 맞고, 무엇은 한 번 더 확인하면 좋은지 바로 정리했습니다.',
      [
        {label:'오늘 한 줄',title:headline,copy:clip(signal,175)},
        {label:'도움이 되는 것',title:'오늘은 이쪽으로 움직여보세요',copy:clip(dos||'이미 준비한 일 한 가지를 실제 행동으로 옮기고, 중요한 일부터 순서대로 처리해보세요.',180)},
        {label:'피하면 좋은 것',title:'이건 오늘 조금 줄여보세요',copy:clip(donts||'충동적인 결정과 감정적인 답변은 한 번 더 확인하고 진행하는 편이 좋습니다.',180)}
      ],
      {label:'오늘의 기준',title:'운세는 결과를 맞히는 답보다 오늘의 선택 속도를 조절하는 참고표에 가깝습니다.',copy:clip(total,180)}
    ),hero);
    const h1=hero.querySelector('h1');if(h1)h1.innerHTML=`${esc(n)}님, 오늘은<br />뭘 하고 뭘 피하면 좋을까요?`;
    retitle('.fortune-label','01','오늘의 흐름이 나와 어떻게 맞물릴까','명리 용어: 일진(日辰)·띠의 지지 관계 · 오늘의 날짜와 출생연 지지를 비교한 참고값');
    retitle('.fortune-label','02','오늘 하루를 한 번에 보면','명리 계산 결과를 실제 하루의 속도와 선택 방식으로 풀어 설명합니다.');
    retitle('.fortune-label','03','일·돈·사람별로 보면','같은 하루라도 생활 영역에 따라 다르게 느껴질 수 있습니다.');
    retitle('.fortune-label','04','언제 움직이고 언제 쉬면 좋을까','시간대별 흐름은 절대적인 길흉이 아니라 하루 리듬을 나눠 보는 참고입니다.');
    retitle('.fortune-label','06','오늘은 이 세 가지만 기억하세요','복잡한 계산보다 실제 행동으로 가져갈 핵심만 남겼습니다.');
    retitle('.fortune-label','08','그래서 오늘은 어떤 하루일까','일·돈·관계·생활을 한 번에 다시 정리한 요약입니다.');
  }

  function relationship(){
    const hero=$('.relationship-hero',root);if(!hero)return;
    const n=name(),summary=verbal(firstText('[data-summary]'));
    const core=verbal(firstParagraph('.relationship-core-grid article'))||verbal(firstText('[data-core-grid]'));
    const pattern=verbal(firstText('[data-pattern-text]'));
    const guide=verbal(firstParagraph('.relationship-guide-grid article'))||verbal(firstText('[data-guide-grid]'));
    const total=verbal(firstText('[data-total-summary]'));
    insertOverview(overviewHTML(
      `${n}님은 연애할 때 이런 사람에 가깝습니다.`,
      '“누구를 만나게 될까?”보다 내가 좋아할 때 어떤 반응을 하고, 가까워질수록 무엇이 필요하며, 어디서 반복해서 힘들어지는지를 먼저 봅니다.',
      [
        {label:'마음이 생기면',title:'호감과 감정을 표현하는 내 방식',copy:clip(core||summary,185)},
        {label:'반복해서 걸리는 지점',title:'관계에서 피곤해지기 쉬운 패턴',copy:clip(pattern,185)},
        {label:'관계를 편하게 만드는 법',title:'상대보다 먼저 내 기준을 알아두기',copy:clip(guide||total,185)}
      ],
      {label:'인연을 보는 핵심',title:'합·충 같은 명리 용어보다, 실제 연락·약속·거리감·갈등 뒤 행동을 함께 보는 것이 중요합니다.',copy:clip(total,185)}
    ),hero);
    const h1=hero.querySelector('h1');if(h1)h1.innerHTML=`${esc(n)}님은 사랑할 때<br />어떤 패턴을 반복하는 사람일까요?`;
    retitle('.relationship-label','01','나는 관계를 시작할 때 이런 편입니다','명리 용어: 일간(日干)·일지(日支) · 나의 기본 반응과 가까운 관계에서의 생활 반응을 보는 기준');
    retitle('.relationship-label','02','좋아하면 이렇게 티가 나는 편','감정 표현의 속도와 방식이 실제 연락·대화에서 어떻게 나타나는지 봅니다.');
    retitle('.relationship-label','03','가까워질수록 이런 게 필요합니다','명리학의 일지와 오행을 거리감·생활 리듬의 언어로 바꿔 설명합니다.');
    retitle('.relationship-label','04','이런 관계가 나에게 편합니다','좋은 사람의 정답보다 내가 오래 편하게 유지할 수 있는 관계의 조건을 봅니다.');
    retitle('.relationship-label','05','반복해서 걸리는 지점은 여기입니다','갈등 자체보다 내가 어떤 반응을 반복하는지 보는 부분입니다.');
    retitle('.relationship-label','06','지금 내 상황에서는 이렇게 보면 됩니다','솔로·연애 중·썸·이별 후처럼 현재 상황에 맞춰 현실적인 기준을 더합니다.');
    retitle('.relationship-label','07','올해 관계에서 볼 포인트','명리 용어: 세운(歲運) · 올해의 지지 관계를 관계 변화의 참고 흐름으로 봅니다.');
    retitle('.relationship-label','08','관계에서 이렇게 해보세요','결과 예측보다 실제 대화와 행동에서 써볼 기준을 정리합니다.');
    retitle('.relationship-label','09','그래서 나는 연애할 때 어떤 사람일까','앞의 내용을 한 번에 읽히도록 생활 언어로 다시 묶습니다.');
  }

  function work(){
    const hero=$('.work-hero',root);if(!hero)return;
    const n=name(),summary=verbal(firstText('[data-summary]'));
    const strength=verbal(firstText('[data-strength-text]'));
    const pressure=verbal(firstText('[data-pressure-text]'));
    const guide=verbal(firstParagraph('.work-guide-grid article'))||verbal(firstText('[data-guide-grid]'));
    const total=verbal(firstText('[data-total-summary]'));
    insertOverview(overviewHTML(
      `${n}님은 일하고 돈을 다룰 때 이런 편입니다.`,
      '직업명을 맞히는 것보다 어떤 환경에서 성과가 나고, 어디서 지치며, 돈을 어떤 기준으로 다루는지가 실제 선택에는 더 도움이 됩니다.',
      [
        {label:'일할 때 강점',title:'이럴 때 능률이 잘 납니다',copy:clip(strength||summary,185)},
        {label:'빨리 지치는 조건',title:'이런 환경은 오래 가면 피곤할 수 있어요',copy:clip(pressure,185)},
        {label:'실제 선택 기준',title:'직업명보다 환경과 역할을 보세요',copy:clip(guide||total,185)}
      ],
      {label:'일·재물 핵심',title:'“어떤 일이 맞나?”보다 “어떤 방식으로 일해야 오래 잘하나?”를 보는 것이 중요합니다.',copy:clip(total,185)}
    ),hero);
    const h1=hero.querySelector('h1');if(h1)h1.innerHTML=`${esc(n)}님은 어떤 방식으로 일하고,<br />돈을 다루는 사람일까요?`;
    retitle('.work-label','01','나는 일할 때 이런 편입니다','명리 용어: 일간·십성·오행 · 내 기본 반응과 업무에서 반복되는 방식을 함께 봅니다.');
    retitle('.work-label','02','이럴 때 능률이 잘 나요','잘 맞는 직업명보다 성과가 자연스럽게 나는 업무 조건을 설명합니다.');
    retitle('.work-label','03','이럴 때 빨리 지칠 수 있어요','과한 책임·애매한 역할·속도 차이처럼 피로가 생기는 조건을 봅니다.');
    retitle('.work-label','04','조직과 독립, 나는 어디가 더 편할까','둘 중 하나를 정답으로 고르지 않고 자율성과 구조의 적정 비율을 봅니다.');
    retitle('.work-label','05','돈을 벌고 쓰고 남기는 내 방식','명리 용어: 재성(財星) · 돈의 양이 아니라 현실 조건·자원·관리 방식을 보는 분류');
    retitle('.work-label','06','올해 일·돈에서 볼 포인트','명리 용어: 세운(歲運) · 올해의 흐름을 일간과 비교한 참고 주제');
    retitle('.work-label','07','지금 궁금한 부분을 더 풀어보면','사용자가 선택한 관심 주제를 실제 결정 기준으로 더 자세히 풉니다.');
    retitle('.work-label','08','실제로 이렇게 해보세요','운보다 먼저 바꿀 수 있는 업무 습관·돈 관리 기준을 정리합니다.');
    retitle('.work-label','09','그래서 내 일·재물 스타일은?','앞의 분석을 실제 커리어와 돈 관리 언어로 다시 요약합니다.');
  }

  function guide(){
    const hero=$('.guide-result-hero',root);if(!hero)return;
    const n=name(),lead=verbal(firstText('[data-lead]'));
    const answer=verbal(firstText('[data-answer]'));
    const check=verbal(firstParagraph('.guide-check-card'))||verbal(firstText('[data-check-grid]'));
    const action=verbal(firstParagraph('.guide-action-card'))||verbal(firstText('[data-action-grid]'));
    const warning=verbal(firstText('[data-warning]'));
    insertOverview(overviewHTML(
      `${n}님의 고민, 먼저 답부터 보면 이렇습니다.`,
      '사주 용어를 길게 읽기 전에 지금 무엇을 확인하고, 무엇을 해보고, 어떤 판단을 조심하면 되는지부터 바로 보세요.',
      [
        {label:'지금 확인할 것',title:'결정 전에 현실 조건부터 체크',copy:clip(check||lead,185)},
        {label:'지금 해볼 것',title:'오늘 할 수 있는 행동으로 줄이기',copy:clip(action,185)},
        {label:'조심할 판단',title:'불안한 마음을 사실처럼 받아들이지 않기',copy:clip(warning,185)}
      ],
      {label:'정월재의 답',title:clip(answer||lead,125),copy:'명리학적 성향은 선택을 대신하는 답이 아니라, 내가 어떤 상황에서 판단이 꼬이기 쉬운지 확인하는 보조 기준으로 사용합니다.'}
    ),hero);
    const h1=hero.querySelector('h1');if(h1)h1.innerHTML=`${esc(n)}님의 고민,<br />어떻게 풀어가면 좋을까요?`;
    retitle('.guide-result-label','01','지금 고민을 한 문장으로 정리하면','복잡한 상황을 먼저 실제 선택 문제로 좁혀봅니다.');
    retitle('.guide-result-label','02','나는 고민할 때 이런 방식이 먼저 나옵니다','명리 용어: 일간·오행·십성 · 판단할 때 자주 쓰는 반응 방식을 보는 참고 기준');
    retitle('.guide-result-label','03','왜 이 고민이 자꾸 길어질까','사주보다 먼저 현재 상황에서 결정이 막히는 이유를 현실적으로 정리합니다.');
    retitle('.guide-result-label','04','결정 전에 이것부터 확인하세요','돈·일정·사람·조건처럼 실제로 확인 가능한 항목을 먼저 봅니다.');
    retitle('.guide-result-label','05','오늘부터 이렇게 움직여보세요','큰 결론보다 지금 바로 할 수 있는 행동 세 가지로 줄입니다.');
    retitle('.guide-result-label','06','이런 판단은 잠깐 조심하세요','불안·조급함·후회를 사실과 분리해서 보도록 돕습니다.');
    retitle('.guide-result-label','07','그래서 정월재의 답은','앞의 현실 조건과 사주 성향을 함께 놓고 선택 기준을 정리합니다.');
  }

  function apply(){
    if(file==='saju-result.html')saju();
    else if(file==='ohaeng-result.html')ohaeng();
    else if(file==='fortune-result.html')fortune();
    else if(file==='relationship-result.html')relationship();
    else if(file==='work-money-result.html')work();
    else if(file==='guide-result.html')guide();
    humanizeVisible();
  }

  let runs=0;const timer=setInterval(()=>{apply();runs++;if(runs>=7)clearInterval(timer);},300);
  setTimeout(apply,60);
  window.addEventListener('load',apply,{once:true});
})();
