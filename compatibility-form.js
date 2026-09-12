(()=>{
  const form=document.querySelector('[data-compatibility-form]');
  if(!form)return;

  const currentYear=new Date().getFullYear();
  const pad=n=>String(n).padStart(2,'0');
  const regions=['서울특별시','부산광역시','대구광역시','인천광역시','광주광역시','대전광역시','울산광역시','세종특별자치시','경기도','강원특별자치도','충청북도','충청남도','전북특별자치도','전라남도','경상북도','경상남도','제주특별자치도','해외·기타'];

  if(!document.querySelector('style[data-compatibility-time-optional]')){
    const style=document.createElement('style');
    style.dataset.compatibilityTimeOptional='';
    style.textContent=`
      .compatibility-form .compatibility-time-check{display:flex!important;align-items:center!important;gap:10px!important;margin:10px 0 0!important;color:#756b67!important;font-size:11px!important;font-weight:500!important;line-height:18px!important;cursor:pointer!important}
      .compatibility-form .compatibility-time-check input{appearance:none!important;-webkit-appearance:none!important;flex:0 0 22px!important;width:22px!important;height:22px!important;margin:0!important;padding:0!important;border:1px solid #d5cac5!important;border-radius:6px!important;background:#fff!important;position:relative!important;box-sizing:border-box!important}
      .compatibility-form .compatibility-time-check input:checked{border-color:#543a3a!important;background:#543a3a!important}
      .compatibility-form .compatibility-time-check input:checked::after{content:"";position:absolute;left:7px;top:3px;width:6px;height:11px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}
      .compatibility-form .time-selects select:disabled{background-color:#f7f4f2!important;color:#aaa19d!important;cursor:not-allowed!important;opacity:1!important}
    `;
    document.head.appendChild(style);
  }

  const fillYears=id=>{const el=document.getElementById(id);if(!el)return;for(let y=currentYear;y>=1900;y--)el.add(new Option(`${y}년`,String(y)));};
  const fillMonths=id=>{const el=document.getElementById(id);if(!el)return;for(let m=1;m<=12;m++)el.add(new Option(`${m}월`,pad(m)));};
  const fillHours=id=>{const el=document.getElementById(id);if(!el)return;for(let h=1;h<=12;h++)el.add(new Option(`${h}시`,pad(h)));};
  const fillMinutes=id=>{const el=document.getElementById(id);if(!el)return;for(let m=0;m<60;m+=10)el.add(new Option(`${pad(m)}분`,pad(m)));};
  const fillRegions=id=>{const el=document.getElementById(id);if(!el)return;regions.forEach(region=>el.add(new Option(region,region)));};

  function refreshDays(yearId,monthId,dayId){
    const year=document.getElementById(yearId),month=document.getElementById(monthId),day=document.getElementById(dayId);
    if(!year||!month||!day)return;
    const y=Number(year.value)||2000;
    const m=Number(month.value)||1;
    const keep=day.value;
    const max=new Date(y,m,0).getDate();
    day.innerHTML='<option value="">일</option>';
    for(let d=1;d<=max;d++)day.add(new Option(`${d}일`,pad(d)));
    if(keep&&Number(keep)<=max)day.value=keep;
  }

  function ensureTimeUnknown(ids){
    const selects=document.getElementById(ids.meridiem)?.closest('.time-selects');
    if(!selects)return null;
    let checkbox=document.getElementById(ids.timeUnknown);
    if(!checkbox){
      const label=document.createElement('label');
      label.className='compatibility-time-check';
      label.innerHTML=`<input id="${ids.timeUnknown}" type="checkbox" /><span>태어난 시간을 모릅니다</span>`;
      selects.insertAdjacentElement('afterend',label);
      checkbox=label.querySelector('input');
    }
    const sync=()=>{
      const unknown=Boolean(checkbox.checked);
      [ids.meridiem,ids.hour,ids.minute].forEach(id=>{
        const el=document.getElementById(id);
        if(!el)return;
        el.disabled=unknown;
        if(unknown)el.value='';
      });
    };
    checkbox.addEventListener('change',sync);
    sync();
    return checkbox;
  }

  function setupPerson(prefix){
    const ids={year:`${prefix}year`,month:`${prefix}month`,day:`${prefix}day`,meridiem:`${prefix}meridiem`,hour:`${prefix}hour`,minute:`${prefix}minute`,timeUnknown:`${prefix}time-unknown`,city:`${prefix}city`,calendar:`${prefix}calendar`,leap:`${prefix}leap`,lunarWrap:`${prefix}lunar-wrap`};
    fillYears(ids.year);fillMonths(ids.month);fillHours(ids.hour);fillMinutes(ids.minute);fillRegions(ids.city);refreshDays(ids.year,ids.month,ids.day);
    [ids.year,ids.month].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>refreshDays(ids.year,ids.month,ids.day)));
    const calendar=document.getElementById(ids.calendar),lunarWrap=document.getElementById(ids.lunarWrap),leap=document.getElementById(ids.leap);
    const syncLunar=()=>{if(!calendar)return;if(lunarWrap)lunarWrap.hidden=calendar.value!=='lunar';if(calendar.value!=='lunar'&&leap)leap.checked=false;};
    calendar?.addEventListener('change',syncLunar);syncLunar();
    ensureTimeUnknown(ids);
  }

  setupPerson('birth-');
  setupPerson('partner-birth-');

  function getDate(prefix){const y=document.getElementById(`${prefix}year`)?.value,m=document.getElementById(`${prefix}month`)?.value,d=document.getElementById(`${prefix}day`)?.value;return y&&m&&d?`${y}-${m}-${d}`:'';}
  function getTime(prefix){
    if(document.getElementById(`${prefix}time-unknown`)?.checked)return '';
    const mer=document.getElementById(`${prefix}meridiem`)?.value||'',hh=document.getElementById(`${prefix}hour`)?.value||'',mm=document.getElementById(`${prefix}minute`)?.value||'';
    if(!mer&&!hh&&!mm)return '';
    if(!(mer&&hh&&mm))return null;
    let hour=Number(hh)%12;if(mer==='pm')hour+=12;return `${pad(hour)}:${mm}`;
  }
  function setStatus(message,state=''){const status=form.querySelector('[data-form-status]');if(!status)return;status.textContent=message;if(state)status.dataset.state=state;else delete status.dataset.state;}
  function clearErrors(){form.querySelectorAll('[data-error-for]').forEach(el=>el.textContent='');form.querySelectorAll('[aria-invalid="true"]').forEach(el=>el.removeAttribute('aria-invalid'));}
  function setError(id,message){const el=form.querySelector(`[data-error-for="${id}"]`);if(el)el.textContent=message;}

  form.addEventListener('submit',event=>{
    event.preventDefault();event.stopImmediatePropagation();
    if(form.dataset.submitting==='true')return;
    clearErrors();setStatus('');

    const a={name:form.elements.profileName.value.trim(),birthDate:getDate('birth-'),birthTime:getTime('birth-'),birthTimeUnknown:Boolean(document.getElementById('birth-time-unknown')?.checked),calendarType:document.getElementById('birth-calendar').value,isLeapMonth:document.getElementById('birth-leap').checked,gender:document.getElementById('birth-gender').value,city:document.getElementById('birth-city').value};
    const b={name:form.elements.partnerName.value.trim(),birthDate:getDate('partner-birth-'),birthTime:getTime('partner-birth-'),birthTimeUnknown:Boolean(document.getElementById('partner-birth-time-unknown')?.checked),calendarType:document.getElementById('partner-birth-calendar').value,isLeapMonth:document.getElementById('partner-birth-leap').checked,gender:document.getElementById('partner-birth-gender').value,city:document.getElementById('partner-birth-city').value};

    let firstInvalid=null;
    if(!a.name){setError('profile-name','이름 또는 닉네임을 입력해주세요.');firstInvalid=document.getElementById('profile-name');}
    else if(!a.birthDate){setStatus('나의 태어난 연·월·일을 모두 선택해주세요.');firstInvalid=document.getElementById('birth-year');}
    else if(a.birthTime===null){setStatus('나의 태어난 시간을 입력하려면 오전/오후·시·분을 모두 선택해주세요. 시간을 모르면 아래 체크박스를 선택해주세요.');firstInvalid=document.getElementById('birth-meridiem');}
    else if(!a.gender){setStatus('나의 성별을 선택해주세요.');firstInvalid=document.getElementById('birth-gender');}
    else if(!a.city){setStatus('나의 태어난 지역을 선택해주세요.');firstInvalid=document.getElementById('birth-city');}
    else if(!b.name){setError('partner-name','상대방 이름 또는 닉네임을 입력해주세요.');firstInvalid=document.getElementById('partner-name');}
    else if(!b.birthDate){setStatus('상대방의 태어난 연·월·일을 모두 선택해주세요.');firstInvalid=document.getElementById('partner-birth-year');}
    else if(b.birthTime===null){setStatus('상대방의 태어난 시간을 입력하려면 오전/오후·시·분을 모두 선택해주세요. 시간을 모르면 아래 체크박스를 선택해주세요.');firstInvalid=document.getElementById('partner-birth-meridiem');}
    else if(!b.gender){setStatus('상대방의 성별을 선택해주세요.');firstInvalid=document.getElementById('partner-birth-gender');}
    else if(!b.city){setStatus('상대방의 태어난 지역을 선택해주세요.');firstInvalid=document.getElementById('partner-birth-city');}
    else if(!form.elements.consent.checked){setStatus('분석을 위한 정보 사용에 동의해주세요.');firstInvalid=form.elements.consent;}
    if(firstInvalid){firstInvalid.setAttribute('aria-invalid','true');firstInvalid.focus();return;}

    const payload={personA:a,personB:b,createdAt:Date.now()};
    try{sessionStorage.setItem('jungwoljae_compatibility_input',JSON.stringify(payload));}
    catch(e){setStatus('브라우저 저장 기능을 사용할 수 없어 결과로 이동하지 못했습니다.');return;}
    form.dataset.submitting='true';const submit=form.querySelector('button[type="submit"]');if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true');}
    setStatus('두 사람의 명식을 비교하고 있습니다.','success');
    setTimeout(()=>{location.assign(new URL('./compatibility-report.html',location.href).href);},160);
  },true);

  window.addEventListener('pageshow',event=>{
    if(!event.persisted)return;
    delete form.dataset.submitting;
    const submit=form.querySelector('button[type="submit"]');
    if(submit){submit.disabled=false;submit.removeAttribute('aria-busy');}
    document.body.classList.remove('saju-loading-open','reading-result-pending');
    document.documentElement.classList.remove('saju-loading-open','reading-result-pending','jw-entry-first');
  });
})();