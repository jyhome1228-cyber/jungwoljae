(()=>{
  if((document.body?.dataset.quickTool||'')!=='tomorrow')return;
  const form=document.querySelector('[data-quick-form]');
  if(!form)return;
  const status=form.querySelector('[data-quick-status]');
  const name=form.querySelector('#quick-name');
  const birthDate=form.querySelector('#quick-birth-date');
  const birthTime=form.querySelector('#quick-birth-time');
  const timeUnknown=form.querySelector('#quick-time-unknown');
  const calendar=form.querySelector('#quick-calendar');
  const gender=form.querySelector('#quick-gender');
  const consent=form.querySelector('input[name="consent"]');
  const submit=form.querySelector('button[type="submit"]');

  const setStatus=(message,state='error')=>{
    if(!status)return;
    status.textContent=message;
    if(state)status.dataset.state=state;else delete status.dataset.state;
  };
  const focus=(el)=>{try{el?.focus({preventScroll:false});}catch(e){el?.focus();}};
  const tomorrowDate=()=>{
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get=t=>parts.find(p=>p.type===t)?.value||'';
    const d=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00+09:00`);
    d.setDate(d.getDate()+1);
    return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  };

  form.addEventListener('submit',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    if(form.dataset.submitting==='true')return;
    const n=(name?.value||'').trim();
    const d=birthDate?.value||'';
    if(!n){setStatus('이름 또는 닉네임을 입력해주세요.');focus(name);return;}
    if(!d){setStatus('태어난 날짜를 입력해주세요.');focus(birthDate);return;}
    if(!consent?.checked){
      setStatus('계속하려면 정보 사용 동의 항목을 체크해주세요.');
      consent?.closest('.quick-consent')?.classList.add('is-missing');
      consent?.setAttribute('aria-invalid','true');
      consent?.closest('.quick-consent')?.scrollIntoView({behavior:'smooth',block:'center'});
      focus(consent);
      return;
    }

    const payload={
      name:n,
      birthDate:d,
      birthYear:Number(d.slice(0,4)),
      birthWeekday:new Intl.DateTimeFormat('ko-KR',{weekday:'long'}).format(new Date(`${d}T12:00:00`)),
      birthTime:timeUnknown?.checked?'':(birthTime?.value||''),
      birthTimeUnknown:Boolean(timeUnknown?.checked),
      calendarType:calendar?.value||'solar',
      isLeapMonth:Boolean(form.querySelector('#quick-leap')?.checked),
      gender:gender?.value||'',
      zodiac:'',
      targetDate:tomorrowDate(),
      mode:'tomorrow',
      createdAt:Date.now()
    };
    try{sessionStorage.setItem('jungwoljae_fortune_input',JSON.stringify(payload));}
    catch(e){setStatus('브라우저 저장 기능을 사용할 수 없어 결과로 이동하지 못했습니다.');return;}

    form.dataset.submitting='true';
    const old=submit?.textContent||'내일의 운세 보기';
    if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true');submit.textContent='결과를 준비하고 있습니다…';}
    setStatus('입력 정보를 확인했습니다. 내일의 운세로 이동합니다.','ok');
    location.assign(new URL('./fortune-result.html',location.href).href);
    setTimeout(()=>{
      if(!location.pathname.endsWith('tomorrow.html'))return;
      form.dataset.submitting='false';
      if(submit){submit.disabled=false;submit.removeAttribute('aria-busy');submit.textContent=old;}
      setStatus('이동이 지연되고 있습니다. 버튼을 다시 눌러주세요.');
    },2200);
  },true);

  consent?.addEventListener('change',()=>{
    if(consent.checked){
      consent.closest('.quick-consent')?.classList.remove('is-missing');
      consent.removeAttribute('aria-invalid');
      if(status&&/동의/.test(status.textContent||'')){status.textContent='';delete status.dataset.state;}
    }
  });
})();