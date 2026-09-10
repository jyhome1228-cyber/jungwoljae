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

  buttonRecovery();imageGuard();normalizeYears();
  setTimeout(()=>{fallbackCoreForm();normalizeYears();guardDynamicPages();},1800);
  setTimeout(resultWatchdog,9000);
})();
