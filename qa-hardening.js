(()=>{
  const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const $=(s,r=document)=>r.querySelector(s);
  const all=(s,r=document)=>[...r.querySelectorAll(s)];
  const pad=n=>String(n).padStart(2,'0');

  function seoulDate(offset=0){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get=t=>parts.find(p=>p.type===t)?.value||'';
    const d=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00+09:00`);
    d.setDate(d.getDate()+offset);
    return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  }

  function addNotice(message,href=''){
    if($('.qa-runtime-notice'))return;
    const n=document.createElement('div');n.className='qa-runtime-notice';
    n.innerHTML=`<strong>페이지를 정상 상태로 복구하고 있습니다.</strong>${message}${href?` <a href="${href}">다시 입력하기</a>`:''}`;
    const target=$('main')||document.body;target.prepend(n);
  }

  function normalizeYears(){
    const selectors=['#saju-year','#ohaeng-year','#fortune-year','#relationship-year','#work-year','#guide-year','#signup-birth-year'];
    selectors.forEach(sel=>{
      const node=$(sel);if(!node||node.tagName!=='SELECT'||node.options.length<2)return;
      const values=new Set([...node.options].map(o=>o.value));
      for(let y=1929;y>=1900;y--)if(!values.has(String(y)))node.add(new Option(`${y}년`,String(y)));
    });
  }

  function clearInvalid(form){all('[aria-invalid="true"]',form).forEach(el=>el.removeAttribute('aria-invalid'));}
  function markInvalid(el){if(el){el.setAttribute('aria-invalid','true');el.focus?.();}}

  function populateSelects(cfg){
    const {year,month,day,meridiem,hour,minute}=cfg;
    const now=new Date().getFullYear();
    if(year&&year.options.length<=1)for(let y=now;y>=1900;y--)year.add(new Option(`${y}년`,String(y)));
    if(month&&month.options.length<=1)for(let m=1;m<=12;m++)month.add(new Option(`${m}월`,pad(m)));
    if(hour&&hour.options.length<=1)for(let h=1;h<=12;h++)hour.add(new Option(`${h}시`,pad(h)));
    if(minute&&minute.options.length<=1)for(let m=0;m<60;m+=10)minute.add(new Option(`${pad(m)}분`,pad(m)));
    const fillDays=()=>{
      if(!day)return;const keep=day.value,y=Number(year?.value)||2000,m=Number(month?.value)||1,max=new Date(y,m,0).getDate();
      day.innerHTML='<option value="">일</option>';for(let d=1;d<=max;d++)day.add(new Option(`${d}일`,pad(d)));if(keep&&Number(keep)<=max)day.value=keep;
    };
    year?.addEventListener('change',fillDays);month?.addEventListener('change',fillDays);fillDays();
    const syncTime=()=>{if(!cfg.timeUnknown)return;const disabled=cfg.timeUnknown.checked;[meridiem,hour,minute].forEach(el=>{if(el){el.disabled=disabled;if(disabled)el.value='';}});};
    cfg.timeUnknown?.addEventListener('change',syncTime);syncTime();
  }

  function getTime(cfg){
    if(cfg.timeUnknown?.checked)return '';
    if(!(cfg.meridiem?.value&&cfg.hour?.value&&cfg.minute?.value))return '';
    let h=Number(cfg.hour.value)%12;if(cfg.meridiem.value==='pm')h+=12;return `${pad(h)}:${cfg.minute.value}`;
  }

  function fallbackCoreForm(){
    const configs={
      'saju.html':{form:'[data-saju-form]',prefix:'saju',storage:'jungwoljae_saju_input',dest:'./saju-result.html'},
      'ohaeng.html':{form:'[data-ohaeng-form]',prefix:'ohaeng',storage:'jungwoljae_ohaeng_input',dest:'./ohaeng-result.html'},
      'fortune.html':{form:'[data-fortune-form]',prefix:'fortune',storage:'jungwoljae_fortune_input',dest:'./fortune-result.html'},
      'relationship.html':{form:'[data-relationship-form]',prefix:'relationship',storage:'jungwoljae_relationship_input',dest:'./relationship-result.html'},
      'work-money.html':{form:'[data-work-form]',prefix:'work',storage:'jungwoljae_work_money_input',dest:'./work-money-result.html'}
    };
    const c=configs[file];if(!c)return;
    const form=$(c.form);if(!form)return;
    const year=$(`#${c.prefix}-year`,form);
    if(year&&year.options.length>10){normalizeYears();return;}

    const cfg={form,year,month:$(`#${c.prefix}-month`,form),day:$(`#${c.prefix}-day`,form),meridiem:$(`#${c.prefix}-meridiem`,form),hour:$(`#${c.prefix}-hour`,form),minute:$(`#${c.prefix}-minute`,form),timeUnknown:$(`#${c.prefix}-time-unknown`,form)};
    populateSelects(cfg);
    const profileState=$('[data-profile-state]',form);if(profileState)profileState.textContent='회원정보 연결이 지연되어도 직접 입력으로 정상 이용할 수 있습니다.';
    form.dataset.qaFallback='true';

    form.addEventListener('submit',e=>{
      e.preventDefault();e.stopImmediatePropagation();clearInvalid(form);
      const status=$('[data-saju-status],[data-ohaeng-status],[data-fortune-status],[data-relationship-status],[data-work-status]',form);
      if(status)status.textContent='';
      const nameEl=$(`#${c.prefix}-name`,form)||form.elements.name;
      const name=String(nameEl?.value||'').trim();
      const date=cfg.year?.value&&cfg.month?.value&&cfg.day?.value?`${cfg.year.value}-${cfg.month.value}-${cfg.day.value}`:'';
      const time=getTime(cfg);
      if(!name){if(status)status.textContent='이름 또는 닉네임을 입력해주세요.';markInvalid(nameEl);return;}
      if(!date){if(status)status.textContent='태어난 연·월·일을 모두 선택해주세요.';markInvalid(cfg.year);return;}
      if(!cfg.timeUnknown?.checked&&(cfg.meridiem?.value||cfg.hour?.value||cfg.minute?.value)&&!time){if(status)status.textContent='시간을 입력하려면 오전/오후·시·분을 모두 선택해주세요.';markInvalid(cfg.meridiem);return;}
      if(!form.elements.consent?.checked){if(status)status.textContent='분석을 위한 정보 사용에 동의해주세요.';markInvalid(form.elements.consent);return;}
      const calendar=$(`#${c.prefix}-calendar`,form)?.value||'solar';
      const gender=$(`#${c.prefix}-gender`,form)?.value||'';
      const city=$(`#${c.prefix}-city`,form)?.value?.trim?.()||'';
      const payload={name,birthDate:date,birthTime:time,birthTimeUnknown:Boolean(cfg.timeUnknown?.checked),calendarType:calendar,isLeapMonth:Boolean(form.elements.isLeapMonth?.checked),gender,city,createdAt:new Date().toISOString()};
      if(file==='saju.html'||file==='work-money.html')payload.focus=[...form.querySelectorAll('input[name="focus"]:checked')].map(x=>x.value).filter(x=>x!=='overall');
      if(file==='relationship.html')payload.relationshipStatus=form.elements.relationshipStatus?.value||'single';
      if(file==='fortune.html')Object.assign(payload,{birthYear:Number(cfg.year.value),birthWeekday:new Intl.DateTimeFormat('ko-KR',{weekday:'long'}).format(new Date(`${date}T12:00:00`)),targetDate:seoulDate(0),mode:'today',createdAt:Date.now()});
      sessionStorage.setItem(c.storage,JSON.stringify(payload));location.href=c.dest;
    },true);
  }

  function guardDynamicPages(){
    if(file==='guide.html'&&!$('[data-domain-grid]')?.children.length)addNotice('정월도감 선택 항목을 불러오지 못했습니다. 네트워크 연결을 확인한 뒤 새로고침해주세요.','./guide.html');
  }

  function resultWatchdog(){
    const resultPages={'saju-result.html':'./saju.html','ohaeng-result.html':'./ohaeng.html','fortune-result.html':'./fortune.html','relationship-result.html':'./relationship.html','work-money-result.html':'./work-money.html','guide-result.html':'./guide.html','compatibility-report.html':'./compatibility.html'};
    const back=resultPages[file];if(!back)return;
    document.body.classList.remove('reading-result-pending');const main=$('main');if(main)main.style.visibility='';
    const overlay=$('[data-saju-result-loading]');if(overlay&&!overlay.hidden){overlay.hidden=true;document.body.classList.remove('saju-loading-open');}
    const t=(main?.innerText||'').replace(/\s+/g,' ');
    const stuck=/(계산하고 있습니다|읽고 있습니다|준비하고 있습니다|결과를 준비|흐름을 읽고 있습니다)/.test(t);
    const tooShort=t.length<350;
    if(stuck||tooShort)addNotice('계산 결과가 끝까지 완성되지 않았습니다. 입력 정보는 그대로 다시 확인할 수 있습니다.',back);
  }

  function imageGuard(){
    all('img').forEach(img=>{
      const fail=()=>{if(img.classList.contains('brand-logo')||img.closest('.talisman-modal'))return;img.style.visibility='hidden';img.setAttribute('aria-hidden','true');};
      if(img.complete&&img.naturalWidth===0)fail();else img.addEventListener('error',fail,{once:true});
    });
  }

  function buttonRecovery(){
    addEventListener('pageshow',()=>{
      all('form[data-submitting="true"]').forEach(form=>{delete form.dataset.submitting;});
      all('button[aria-busy="true"]').forEach(btn=>{btn.disabled=false;btn.removeAttribute('aria-busy');});
    });
  }

  /* Plain-language layer for the Five Elements report.
     Traditional names remain as small secondary labels and inside the evidence section only. */
  const elementRoles={
    wood:{keys:['목','木'],title:'시작하는 힘',traditional:'목(木)',short:'시작',base:'새로운 일을 시작하고 방향을 정하는 능력입니다.',strong:'새 일을 시작하거나 첫 방향을 잡을 때 비교적 자연스럽게 움직일 수 있습니다.',weak:'처음 시작하는 데 시간이 걸릴 수 있으니, 해야 할 일을 아주 작은 첫 단계로 나누면 도움이 됩니다.',advice:'작은 시작점을 먼저 정하기'},
    fire:{keys:['화','火'],title:'표현하고 실행하는 힘',traditional:'화(火)',short:'표현·실행',base:'생각과 감정을 밖으로 표현하고 행동으로 옮기는 능력입니다.',strong:'생각한 것을 말이나 행동으로 꺼내고 분위기를 움직이는 데 힘이 잘 붙을 수 있습니다.',weak:'생각은 있어도 표현 시점을 놓칠 수 있으니, 필요한 말과 행동을 미리 정해두면 도움이 됩니다.',advice:'생각을 말이나 행동으로 분명하게 꺼내기'},
    earth:{keys:['토','土'],title:'관리하고 이어가는 힘',traditional:'토(土)',short:'관리·유지',base:'시작한 일을 꾸준히 관리하고 반복 가능한 구조로 만드는 능력입니다.',strong:'여러 일을 정리해 안정적인 흐름으로 만들고 꾸준히 이어가는 데 강점이 있을 수 있습니다.',weak:'시작은 빠르지만 유지 단계에서 피로해질 수 있으니, 일정과 반복 기준을 먼저 만들어두면 도움이 됩니다.',advice:'끝까지 이어갈 일정과 반복 기준 만들기'},
    metal:{keys:['금','金'],title:'판단하고 정리하는 힘',traditional:'금(金)',short:'판단·정리',base:'기준을 세우고 선택지를 줄여 결론을 내리는 능력입니다.',strong:'복잡한 상황에서 기준을 세우고 무엇을 할지 또는 하지 않을지 정하는 데 강점이 있을 수 있습니다.',weak:'선택지를 오래 열어두기 쉬우니, 중요한 결정에서는 기준을 두세 가지로 줄이면 도움이 됩니다.',advice:'선택 기준과 하지 않을 일을 분명히 정하기'},
    water:{keys:['수','水'],title:'살펴보고 유연하게 대응하는 힘',traditional:'수(水)',short:'관찰·대응',base:'바로 반응하기 전에 상황을 살피고 정보를 모아 유연하게 대응하는 능력입니다.',strong:'상황을 한 번 더 살피고 여러 가능성을 비교하면서 대응하는 데 강점이 있을 수 있습니다.',weak:'빠르게 움직이는 대신 확인 과정이 짧아질 수 있으니, 기록하고 한 번 더 검토하는 습관이 도움이 됩니다.',advice:'바로 결정하기 전에 기록하고 한 번 더 확인하기'}
  };
  function elementKeyFromText(value=''){
    const t=String(value);
    return Object.entries(elementRoles).find(([,v])=>v.keys.some(k=>t.includes(k)))?.[0]||'';
  }
  function setText(node,value){if(node&&node.textContent!==value)node.textContent=value;}
  function setHTML(node,value){if(node&&node.innerHTML!==value)node.innerHTML=value;}

  function simplifyOhaengResult(){
    if(file!=='ohaeng-result.html')return false;
    const root=$('[data-ohaeng-result]');if(!root)return false;
    const bars=all('.element-bar',root);if(bars.length<5)return false;
    const order=bars.map(bar=>{
      if(bar.dataset.elementKey)return bar.dataset.elementKey;
      const key=elementKeyFromText(bar.querySelector('.label')?.textContent||'');
      if(key)bar.dataset.elementKey=key;
      return key;
    }).filter(Boolean);
    if(order.length<5)return false;
    const first=elementRoles[order[0]],second=elementRoles[order[1]],weak=elementRoles[order.at(-1)];
    const name=($('[data-name]',root)?.textContent||'회원').trim()||'회원';
    const balanceMatch=($('[data-meta]',root)?.textContent||'').match(/(?:균형 지표|균형 정도)\s*(\d+)\/100/);
    const balance=balanceMatch?.[1]||'';

    setText($('[data-summary]',root),`${name}님은 ${first.title}과 ${second.title}을 비교적 자연스럽게 쓰는 편입니다. 반대로 ${weak.title}은 중요한 순간에 한 번 더 챙기면 좋습니다. 이 결과는 좋고 나쁨을 매기는 점수가 아니라, 평소 어떤 방식이 익숙하고 어떤 과정에서 조금 더 신경을 쓰면 좋은지를 보여주는 참고 기준입니다.`);
    all('[data-meta] span',root).forEach(span=>{if(/균형 지표/.test(span.textContent))setText(span,span.textContent.replace('균형 지표','균형 정도'));});

    const distribution=$('.distribution-section',root);
    setText(distribution?.querySelector('h2'),'내가 자연스럽게 잘 쓰는 힘은 무엇일까요?');
    setText(distribution?.querySelector('.section-title-row>p'),'사주의 다섯 가지 기운을 시작·표현·관리·판단·관찰이라는 생활 언어로 바꿔 설명합니다. 전통 명리 용어는 보조 표기로만 확인할 수 있습니다.');

    bars.forEach(bar=>{
      const key=bar.dataset.elementKey||elementKeyFromText(bar.querySelector('.label')?.textContent||'');
      const role=elementRoles[key];if(!role)return;
      setHTML(bar.querySelector('.label'),`<span class="element-role">${role.title}</span><small class="element-traditional">${role.traditional}</small>`);
    });

    const cards=all('.element-card',root);
    const fixedOrder=['wood','fire','earth','metal','water'];
    cards.forEach((card,index)=>{
      const key=card.dataset.elementKey||elementKeyFromText(card.textContent)||fixedOrder[index];
      const role=elementRoles[key];if(!role)return;card.dataset.elementKey=key;
      setHTML(card,`<strong>${role.title}</strong><span class="element-traditional">명리 용어 · ${role.traditional}</span><p>${role.base}</p>`);
    });

    setHTML($('[data-strong-text]',root),`<p><strong>${first.title}</strong>이 가장 자연스럽게 드러납니다. ${first.strong}</p><p><strong>${second.title}</strong>도 함께 잘 쓰이는 편입니다. ${second.strong}</p>`);
    setHTML($('[data-weak-text]',root),`<p><strong>${weak.title}</strong>은 다른 과정에 비해 조금 더 의식해서 챙길 필요가 있습니다. ${weak.weak}</p><p>성격을 억지로 바꾸기보다 <strong>${weak.advice}</strong>처럼 작은 습관 하나를 추가하는 방식이 현실적입니다.</p>`);

    const flow=$('.flow-section',root);
    setText(flow?.querySelector('h2'),'잘하는 힘이 다음 단계로 이어질 때 균형이 좋아집니다.');
    setHTML($('.flow-chain',root),'<span>시작하기</span><i>→</i><span>표현하기</span><i>→</i><span>관리하기</span><i>→</i><span>판단하기</span><i>→</i><span>살펴보기</span><i>→</i><span>다시 시작</span>');
    setText($('[data-flow-text]',root),`${first.title}에서 출발하는 것은 비교적 자연스럽지만, 일을 다음 단계로 넘길 때 ${weak.title}이 필요해지는 순간에는 속도가 조금 떨어질 수 있습니다. 잘하는 부분을 더 세게 밀기보다 ‘${weak.advice}’를 중간 단계로 넣어두면 시작한 일을 끝까지 이어가기 쉬워집니다.`);

    const life=$('.life-section',root);setText(life?.querySelector('h2'),'일·관계·돈에서는 이렇게 활용해보세요.');
    const lifeCopy=[
      ['생각과 행동',`평소에는 ${first.title}이 먼저 나오기 쉽습니다. 중요한 결정을 할 때는 바로 움직이기 전에 ‘${weak.advice}’를 한 번 거치면 한쪽으로 치우친 판단을 줄일 수 있습니다.`],
      ['사람과 관계',`관계에서도 내가 익숙한 방식이 먼저 나옵니다. 상대와 속도가 다를 때는 내 반응을 반복하기보다 상대가 실제로 한 말과 행동을 한 번 더 확인하는 편이 좋습니다.`],
      ['일과 선택',`업무에서는 ${first.title}을 강점으로 활용하세요. 다만 결과를 오래 유지하려면 ‘${weak.advice}’를 체크리스트나 일정 안에 넣어두는 것이 도움이 됩니다.`],
      ['돈과 생활',`돈의 많고 적음을 이 결과 하나로 판단할 수는 없습니다. 대신 지출·저축·계획을 감으로 처리하기보다 기록으로 남기고, 큰 결정은 하루 정도 다시 확인하는 습관을 두는 편이 안전합니다.`]
    ];
    all('.life-card',root).forEach((card,i)=>{const copy=lifeCopy[i];if(!copy)return;setText(card.querySelector('h3'),copy[0]);setText(card.querySelector('p'),copy[1]);});

    const keySection=$('.key-section',root);setText(keySection?.querySelector('h2'),'지금 기억하면 좋은 세 가지');
    const keyCards=all('.key-card',root);
    const keyData=[
      ['01 · 자연스러운 강점',`${first.short} · ${second.short}`,`${first.title}과 ${second.title}은 힘을 많이 주지 않아도 비교적 자연스럽게 나오는 편입니다.`],
      ['02 · 한 번 더 챙길 부분',weak.title,`중요한 선택이나 오래 이어가야 하는 일에서는 ‘${weak.advice}’를 의식적으로 넣어보세요.`],
      ['03 · 전체 균형',balance?`${balance}/100`:'참고 지표','이 숫자는 운이 좋고 나쁨을 뜻하지 않습니다. 다섯 가지 힘의 편차가 얼마나 큰지 비교해서 보는 참고값입니다.']
    ];
    keyCards.forEach((card,i)=>{const d=keyData[i];if(!d)return;setText(card.querySelector('span'),d[0]);setText(card.querySelector('strong'),d[1]);setText(card.querySelector('p'),d[2]);});

    const total=$('.total-summary-section',root);setText(total?.querySelector('h2'),`${name}님의 생활 성향을 한 번에 정리하면`);
    setHTML($('[data-total-summary]',root),`<strong class="total-summary-highlight">${name}님은 ${first.title}과 ${second.title}이 강점이고, ${weak.title}을 한 번 더 챙길 때 전체 흐름이 더 안정적입니다.</strong><p>잘하는 방식을 버릴 필요는 없습니다. 오히려 ${first.short}과 ${second.short}의 장점은 그대로 살리되, 중요한 선택이나 오래 이어가야 하는 일에서는 ‘${weak.advice}’를 중간 과정으로 넣어보세요.</p><p>이 분석은 사람을 다섯 가지 유형으로 단정하는 결과가 아닙니다. 내가 평소 어떤 과정은 쉽게 하고, 어떤 과정은 놓치기 쉬운지 확인해서 일·관계·생활의 습관을 조정하는 참고 자료로 활용하는 것이 가장 좋습니다.</p>`);
    return true;
  }

  /* Emergency contrast guard: only fixes clearly unreadable text (white-on-white, dark-on-dark).
     It deliberately ignores ordinary muted text so the visual hierarchy is preserved. */
  function rgb(value){
    const m=String(value||'').match(/rgba?\((\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)(?:[,\s\/]+(\d*\.?\d+))?\)/i);
    return m?{r:+m[1],g:+m[2],b:+m[3],a:m[4]===undefined?1:+m[4]}:null;
  }
  function luminance(c){
    const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};
    return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);
  }
  function contrast(a,b){const l1=luminance(a),l2=luminance(b),hi=Math.max(l1,l2),lo=Math.min(l1,l2);return (hi+.05)/(lo+.05);}
  function effectiveBg(el){
    let n=el;
    while(n&&n!==document){const c=rgb(getComputedStyle(n).backgroundColor);if(c&&c.a>.88)return c;n=n.parentElement;}
    return {r:255,g:255,b:255,a:1};
  }
  function severeContrastGuard(){
    const main=$('main');if(!main)return;
    const selectors='h1,h2,h3,h4,p,strong,small,li,dt,dd,label,a,button,span';
    all(selectors,main).forEach(el=>{
      if(!el.offsetParent||el.closest('.evidence-content,.fortune-evidence-content,.relationship-evidence-content,.work-evidence-content,.guide-evidence-content,.compatibility-pillars'))return;
      const hasDirect=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!hasDirect)return;
      const fg=rgb(getComputedStyle(el).color),bg=effectiveBg(el);if(!fg||!bg)return;
      if(contrast(fg,bg)<2.05){el.style.setProperty('color',luminance(bg)>.53?'#2b2524':'#ffffff','important');}
    });
  }

  function resultPolish(){simplifyOhaengResult();severeContrastGuard();}

  buttonRecovery();imageGuard();normalizeYears();
  setTimeout(()=>{fallbackCoreForm();normalizeYears();guardDynamicPages();},1800);
  setTimeout(resultPolish,1200);
  setTimeout(resultPolish,2800);
  setTimeout(resultPolish,5200);
  setTimeout(resultWatchdog,9000);

  const resultFiles=new Set(['saju-result.html','ohaeng-result.html','fortune-result.html','relationship-result.html','work-money-result.html','guide-result.html','compatibility-report.html']);
  if(resultFiles.has(file)){
    const main=$('main');let queued=false;
    const observer=new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;resultPolish();},120);});
    if(main)observer.observe(main,{childList:true,subtree:true,characterData:true});
  }
})();
