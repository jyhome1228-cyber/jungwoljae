(()=>{
  const root=document.querySelector('[data-fortune-result]');
  if(!root)return;
  let input={};
  try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
  if(!input.birthDate)return;

  const tomorrow=input.mode==='tomorrow';
  const dayWord=tomorrow?'내일':'오늘';
  const $=s=>root.querySelector(s);
  const stems=['갑','을','병','정','무','기','경','신','임','계'];
  const branches=['자','축','인','묘','진','사','오','미','신','유','술','해'];
  const elementByStem={갑:'wood',을:'wood',병:'fire',정:'fire',무:'earth',기:'earth',경:'metal',신:'metal',임:'water',계:'water'};
  const packs={
    wood:{headline:'작게라도 먼저 시작하면 흐름이 살아납니다.',work:'아이디어를 더 모으기보다 첫 결과물을 만드는 쪽이 좋습니다.',money:'지출의 목적을 분명히 하면 판단이 쉬워집니다.',love:'기다리기보다 먼저 가볍게 말을 건네보세요.',life:'움직임을 늘리되 할 일을 너무 많이 벌이지 마세요.'},
    fire:{headline:'생각을 밖으로 꺼낼수록 기운이 붙습니다.',work:'제안·발표·공유처럼 보이는 행동이 잘 맞습니다.',money:'필요한 소비는 하되 충동적으로 범위를 넓히지 마세요.',love:'필요한 말은 짧고 분명하게 표현해보세요.',life:'오후까지 속도를 내고 저녁에는 조금 낮춰주세요.'},
    earth:{headline:'정리하고 안정시키는 데 힘이 붙습니다.',work:'진행 중인 일 하나를 끝내고 다음 순서를 정리해보세요.',money:'정기 지출과 반복 비용을 확인해보세요.',love:'말보다 행동과 약속이 실제로 맞는지 보세요.',life:'식사·휴식·이동의 리듬을 일정하게 유지해보세요.'},
    metal:{headline:'선택지를 줄이고 기준을 세울수록 선명해집니다.',work:'해야 할 일과 하지 않을 일을 분명히 나눠보세요.',money:'가격보다 실제 쓰임과 유지비까지 함께 보세요.',love:'말보다 행동의 일관성을 기준으로 보세요.',life:'미뤄둔 정리나 완료 표시 하나를 남겨보세요.'},
    water:{headline:'한 번 더 살피면 답이 보입니다.',work:'자료를 비교하고 빠진 정보를 확인한 뒤 움직이세요.',money:'결제 전 최근 지출 흐름을 한 번 확인해보세요.',love:'한 번의 답장보다 최근 며칠의 흐름을 함께 보세요.',life:'일정 사이에 생각할 여백을 남겨두세요.'}
  };
  const relations={자:{오:'충',축:'육합'},축:{미:'충',자:'육합'},인:{신:'충',해:'육합'},묘:{유:'충',술:'육합'},진:{술:'충',유:'육합'},사:{해:'충',신:'육합'},오:{자:'충',미:'육합'},미:{축:'충',오:'육합'},신:{인:'충',사:'육합'},유:{묘:'충',진:'육합'},술:{진:'충',묘:'육합'},해:{사:'충',인:'육합'}};

  function seoulDate(offset=0){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get=t=>parts.find(p=>p.type===t)?.value||'';
    const d=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00+09:00`);d.setDate(d.getDate()+offset);
    return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  }
  function jdn(y,m,d){const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}
  function pillar(dateString){const [y,m,d]=String(dateString).split('-').map(Number);const idx=((jdn(y,m,d)+49)%60+60)%60;return stems[idx%10]+branches[idx%12];}
  function relation(a,b){return relations[a]?.[b]||relations[b]?.[a]||(a===b?'동일 지지':'평이');}
  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

  function render(){
    const headline=$('[data-headline]')?.textContent?.trim()||'';
    const areaCount=$('[data-area-grid]')?.children.length||0;
    if(root.dataset.finalState==='ready'||(headline&&headline!=='흐름을 읽는 중입니다.'&&areaCount>0))return;

    const targetDate=seoulDate(tomorrow?1:0);
    const natal=pillar(input.birthDate);
    const target=pillar(targetDate);
    const rel=relation(natal[1],target[1]);
    const element=elementByStem[target[0]]||'earth';
    const pack=packs[element];
    const dateLabel=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date(`${targetDate}T12:00:00+09:00`));

    const hero=root.querySelector('.fortune-hero h1');if(hero)hero.innerHTML=`<span data-name>${esc(input.name||'회원')}</span>님,<br />${dayWord}의 흐름을 정리했습니다.`;
    if($('[data-summary]'))$('[data-summary]').textContent=`${input.name||'회원'}님의 기본 흐름과 ${dayWord} 날짜를 함께 보며 하루의 방향을 정리했습니다.`;
    if($('[data-meta]'))$('[data-meta]').innerHTML=`<span>${targetDate}</span><span>${dateLabel}</span><span>내 일주 ${natal}</span><span>${dayWord} 일진 ${target}</span>`;
    if($('[data-headline]'))$('[data-headline]').textContent=`${dayWord}은 ${pack.headline}`;
    if($('[data-signal-note]'))$('[data-signal-note]').textContent=`관계 흐름은 ${rel}입니다. 오늘의 핵심 행동을 먼저 잡아보세요.`;
    if($('[data-relation-pills]'))$('[data-relation-pills]').innerHTML=`<span>${natal}</span><span>${rel}</span><span>${target}</span>`;
    if($('[data-relation-text]'))$('[data-relation-text]').textContent=`내 기본 흐름과 ${dayWord}의 흐름은 ${rel} 관계로 읽을 수 있습니다. 한 번에 많은 것을 바꾸기보다 우선순위를 분명히 잡는 편이 좋습니다.`;
    if($('[data-fortune-story]'))$('[data-fortune-story]').innerHTML=`<p><strong>${dayWord}의 전체 흐름</strong> ${esc(pack.headline)}</p><p><strong>움직이는 기준</strong> ${esc(pack.work)}</p>`;
    if($('[data-area-grid]'))$('[data-area-grid]').innerHTML=[['재물운',pack.money],['연애운',pack.love],['일·학업운',pack.work],['생활운',pack.life]].map(([t,p],i)=>`<article class="fortune-card"><span>0${i+1}</span><h3>${t}</h3><p>${esc(p)}</p></article>`).join('');
    if($('[data-time-grid]'))$('[data-time-grid]').innerHTML=`<article class="fortune-time-card"><span>오전</span><strong>중요한 일부터 시작하세요.</strong><p>${esc(pack.work)}</p></article><article class="fortune-time-card"><span>오후</span><strong>관계와 일정의 흐름을 확인하세요.</strong><p>${esc(pack.love)}</p></article><article class="fortune-time-card"><span>저녁</span><strong>하루를 정리하고 여백을 남기세요.</strong><p>${esc(pack.life)}</p></article>`;
    if($('[data-do-list]'))$('[data-do-list]').innerHTML=`<li>가장 중요한 일 하나 먼저 끝내기</li><li>필요한 말은 짧고 분명하게 하기</li><li>결정 전 기준 하나 확인하기</li>`;
    if($('[data-dont-list]'))$('[data-dont-list]').innerHTML=`<li>한꺼번에 너무 많은 일을 벌이지 않기</li><li>한마디만으로 관계를 단정하지 않기</li><li>기분에 따라 지출 범위를 넓히지 않기</li>`;
    if($('[data-key-grid]'))$('[data-key-grid]').innerHTML=`<article class="fortune-key-card"><span>01 · 가장 먼저</span><strong>${esc(pack.work)}</strong></article><article class="fortune-key-card"><span>02 · 관계에서</span><strong>${esc(pack.love)}</strong></article><article class="fortune-key-card"><span>03 · 마무리</span><strong>${esc(pack.life)}</strong></article>`;
    if($('[data-tip-grid]'))$('[data-tip-grid]').innerHTML=`<article class="fortune-tip-card"><span>01</span><h3>일</h3><p>${esc(pack.work)}</p></article><article class="fortune-tip-card"><span>02</span><h3>인연</h3><p>${esc(pack.love)}</p></article><article class="fortune-tip-card"><span>03</span><h3>재물</h3><p>${esc(pack.money)}</p></article>`;
    if($('[data-tip-final]'))$('[data-tip-final]').textContent=pack.headline;
    if($('[data-total-summary]'))$('[data-total-summary]').innerHTML=`<p><span class="fortune-summary-label">한줄 정리</span><strong>${dayWord}은 ${esc(pack.headline)}</strong></p><p><span class="fortune-summary-label">우선순위</span><strong>일 하나, 관계 하나, 지출 하나만 분명히</strong></p>`;
    if($('[data-evidence]'))$('[data-evidence]').innerHTML=`<div class="fortune-evidence-item"><strong>내 일주</strong><p>${natal}</p></div><div class="fortune-evidence-item"><strong>${dayWord} 일진</strong><p>${target}</p></div><div class="fortune-evidence-item"><strong>관계</strong><p>${rel}</p></div>`;
    root.dataset.finalState='ready';
    window.dispatchEvent(new CustomEvent('jw:fortune-rendered'));
    window.dispatchEvent(new CustomEvent('jw:result-ready'));
  }

  setTimeout(render,1500);
})();
