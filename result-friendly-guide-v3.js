(()=>{
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='guide-result.html')return;
  const root=document.querySelector('[data-guide-result]');if(!root)return;
  const $=(s,r=root)=>r.querySelector(s),all=(s,r=root)=>[...r.querySelectorAll(s)],txt=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();
  const clip=(v,n=320)=>{const t=String(v||'').replace(/\s+/g,' ').trim();return t.length>n?`${t.slice(0,n).replace(/[,.\s]+$/,'')}…`:t;};
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const name=()=>txt($('[data-name]'))||'회원';
  const children=(s,limit=6)=>all(`${s}>*`).slice(0,limit).map(txt).filter(Boolean);
  function addAfter(anchor,key,html){if(!anchor||root.querySelector(`[data-rf3="${key}"]`))return;anchor.insertAdjacentHTML('afterend',`<div data-rf3="${key}">${html}</div>`);}
  function addInside(anchor,key,html){if(!anchor||root.querySelector(`[data-rf3="${key}"]`))return;anchor.insertAdjacentHTML('beforeend',`<div data-rf3="${key}">${html}</div>`);}
  function run(){
    const hero=$('.guide-result-hero');
    const answer=txt($('[data-answer]')),problem=txt($('[data-problem]')),reason=txt($('[data-reason]')),warning=txt($('[data-warning]'));
    const overview=$('[data-result-friendly-overview]');
    addAfter(overview||hero,'guide-answer-first',`<section class="rf3-block is-dark"><div class="rf3-head"><div><span>ANSWER FIRST</span><h3>${esc(name())}님, 결론부터 보면 이렇게 정리할 수 있습니다.</h3></div><p>정월도감은 명리학을 설명하기보다 지금 고민을 실제 선택으로 바꾸는 데 초점을 둡니다.</p></div><blockquote class="rf3-quote">${esc(clip(answer||problem,420))}</blockquote><div class="rf3-grid" style="margin-top:10px"><article class="rf3-card"><small>왜 고민이 길어졌을까</small><strong>지금 막히는 이유</strong><p>${esc(clip(reason,260))}</p></article><article class="rf3-card"><small>조심할 점</small><strong>이 판단만은 서두르지 마세요</strong><p>${esc(clip(warning,260))}</p></article></div></section>`);

    const checkHost=$('[data-check-grid]')?.closest('.guide-report');const checks=children('[data-check-grid]',6);
    if(checkHost)addInside(checkHost,'guide-reality',`<div class="rf3-block is-soft"><div class="rf3-head"><div><span>REALITY CHECK</span><h3>사주보다 먼저 실제 조건을 확인하세요.</h3></div><p>운이 좋아 보여도 현실 조건이 맞지 않으면 오래가기 어렵습니다. 아래 항목은 느낌보다 숫자와 사실로 확인해보세요.</p></div><div class="rf3-checklist">${checks.map(x=>`<div class="rf3-check">${esc(clip(x,230))}</div>`).join('')}</div><div class="rf3-example"><strong>판단 팁</strong> · “좋아 보인다/불안하다” 대신 비용, 시간, 역할, 관계, 되돌릴 수 있는 정도를 각각 적어보면 선택이 훨씬 선명해집니다.</div></div>`);

    const actionHost=$('[data-action-grid]')?.closest('.guide-report');const actions=children('[data-action-grid]',6);
    if(actionHost)addInside(actionHost,'guide-actions-rich',`<div class="rf3-block"><div class="rf3-head"><div><span>DO IT NOW</span><h3>오늘 바로 할 수 있는 수준까지 작게 바꿔봤습니다.</h3></div><p>결정 자체가 어렵다면, 결정 전에 확인할 작은 행동부터 시작하면 됩니다.</p></div><div class="rf3-checklist">${actions.map(x=>`<div class="rf3-check">${esc(clip(x,230))}</div>`).join('')}</div><div class="rf3-tip"><span>가장 중요</span><strong>“언젠가 결정해야지”보다 결정 날짜와 확인할 조건을 먼저 정하세요.</strong></div></div>`);

    const personalHost=$('[data-personal-grid]')?.closest('.guide-report');if(personalHost)addInside(personalHost,'guide-terms',`<div class="rf3-example"><strong>명리 해석은 여기서 어떻게 쓰이나요?</strong> · 일간(日干)은 내가 판단할 때 자주 쓰는 기본 반응을, 오행은 시작·표현·관리·판단·관찰의 상대 비중을, 십성은 주도성·표현·현실·책임·배움의 관계를 보는 기준으로 사용합니다. 전문 용어 자체가 답은 아니고, 지금 고민에서 반복되는 선택 습관을 설명하기 위한 근거입니다.</div>`);

    const answerHost=$('[data-answer]')?.closest('.guide-report');if(answerHost)addInside(answerHost,'guide-final',`<div class="rf3-block is-soft"><div class="rf3-head"><div><span>ONE MORE THING</span><h3>이 답을 실제 선택으로 바꾸려면</h3></div><p>정월도감의 답은 미래를 확정하는 문장이 아니라 “지금 무엇을 먼저 확인하고 어떤 순서로 움직일지”를 정하는 참고 기준입니다.</p></div><div class="rf3-grid three"><div class="rf3-check">오늘 확인할 사실 1개를 정한다.</div><div class="rf3-check">결정할 날짜를 캘린더에 넣는다.</div><div class="rf3-check">최악의 경우 감당 가능한 범위를 미리 정한다.</div></div></div>`);
  }
  run();setTimeout(run,700);setTimeout(run,1600);
})();