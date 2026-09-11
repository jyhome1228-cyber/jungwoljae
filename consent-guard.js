(()=>{
  const STATUS_SELECTORS='[data-fortune-status],[data-relationship-status],[data-work-status],[data-guide-status],[data-form-status],[data-quick-status],.form-status,.quick-status';

  function consentRow(input){
    return input?.closest('.consent-row,.quick-consent,.privacy-check,label');
  }
  function statusNode(form){
    return form?.querySelector(STATUS_SELECTORS);
  }
  function showMissing(form,input){
    const row=consentRow(input);
    const status=statusNode(form);
    row?.classList.add('is-missing');
    input?.setAttribute('aria-invalid','true');
    if(status){
      status.textContent='계속하려면 정보 사용 동의 항목을 체크해주세요.';
      status.dataset.state='error';
    }
    row?.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>{
      try{input?.focus({preventScroll:true});}catch(e){input?.focus();}
    },160);
  }
  function clearMissing(input){
    const row=consentRow(input);
    const form=input?.closest('form');
    const status=statusNode(form);
    row?.classList.remove('is-missing');
    input?.removeAttribute('aria-invalid');
    if(status?.dataset.state==='error'&&/동의/.test(status.textContent||'')){
      status.textContent='';
      delete status.dataset.state;
    }
  }

  document.addEventListener('submit',event=>{
    const form=event.target instanceof HTMLFormElement?event.target:null;
    if(!form)return;
    const consent=form.querySelector('input[name="consent"]');
    if(!consent||consent.checked)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showMissing(form,consent);
  },true);

  document.addEventListener('change',event=>{
    const input=event.target;
    if(input instanceof HTMLInputElement&&input.name==='consent'&&input.checked)clearMissing(input);
  });
})();
