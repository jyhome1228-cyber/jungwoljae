(()=>{
  const form=document.querySelector('[data-compatibility-form]');
  if(!form)return;

  const currentYear=new Date().getFullYear();
  const pad=n=>String(n).padStart(2,'0');
  const regions=['서울특별시','부산광역시','대구광역시','인천광역시','광주광역시','대전광역시','울산광역시','세종특별자치시','경기도','강원특별자치도','충청북도','충청남도','전북특별자치도','전라남도','경상북도','경상남도','제주특별자치도','해외·기타'];

  const fillYears=id=>{const el=document.getElementById(id);for(let y=currentYear;y>=1900;y--)el.add(new Option(`${y}년`,String(y)));};
  const fillMonths=id=>{const el=document.getElementById(id);for(let m=1;m<=12;m++)el.add(new Option(`${m}월`,pad(m)));};
  const fillHours=id=>{const el=document.getElementById(id);for(let h=1;h<=12;h++)el.add(new Option(`${h}시`,pad(h)));};
  const fillMinutes=id=>{const el=document.getElementById(id);for(let m=0;m<60;m+=10)el.add(new Option(`${pad(m)}분`,pad(m)));};
  const fillRegions=id=>{const el=document.getElementById(id);regions.forEach(region=>el.add(new Option(region,region)));};

  function refreshDays(yearId,monthId,dayId){
    const y=Number(document.getElementById(yearId).value)||2000;
    const m=Number(document.getElementById(monthId).value)||1;
    const day=document.getElementById(dayId);
    const keep=day.value;
    const max=new Date(y,m,0).getDate();
    day.innerHTML='<option value="">일</option>';
    for(let d=1;d<=max;d++)day.add(new Option(`${d}일`,pad(d)));
    if(keep&&Number(keep)<=max)day.value=keep;
  }

  function setupPerson(prefix){
    const ids={year:`${prefix}year`,month:`${prefix}month`,day:`${prefix}day`,meridiem:`${prefix}meridiem`,hour:`${prefix}hour`,minute:`${prefix}minute`,city:`${prefix}city`,calendar:`${prefix}calendar`,leap:`${prefix}leap`,lunarWrap:`${prefix}lunar-wrap`};
    fillYears(ids.year);fillMonths(ids.month);fillHours(ids.hour);fillMinutes(ids.minute);fillRegions(ids.city);refreshDays(ids.year,ids.month,ids.day);
    [ids.year,ids.month].forEach(id=>document.getElementById(id).addEventListener('change',()=>refreshDays(ids.year,ids.month,ids.day)));
    const calendar=document.getElementById(ids.calendar),lunarWrap=document.getElementById(ids.lunarWrap);
    const syncLunar=()=>{if(lunarWrap)lunarWrap.hidden=calendar.value!=='lunar';if(calendar.value!=='lunar')document.getElementById(ids.leap).checked=false;};
    calendar.addEventListener('change',syncLunar);syncLunar();
  }

  setupPerson('birth-');
  setupPerson('partner-birth-');

  function getDate(prefix){const y=document.getElementById(`${prefix}year`).value,m=document.getElementById(`${prefix}month`).value,d=document.getElementById(`${prefix}day`).value;return y&&m&&d?`${y}-${m}-${d}`:'';}
  function getTime(prefix){const mer=document.getElementById(`${prefix}meridiem`).value,hh=document.getElementById(`${prefix}hour`).value,mm=document.getElementById(`${prefix}minute`).value;if(!mer&&!hh&&!mm)return '';if(!(mer&&hh&&mm))return null;let hour=Number(hh)%12;if(mer==='pm')hour+=12;return `${pad(hour)}:${mm}`;}
  function setStatus(message,state=''){const status=form.querySelector('[data-form-status]');if(!status)return;status.textContent=message;status.dataset.state=state;}
  function clearErrors(){form.querySelectorAll('[data-error-for]').forEach(el=>el.textContent='');}
  function setError(id,message){const el=form.querySelector(`[data-error-for="${id}"]`);if(el)el.textContent=message;}

  form.addEventListener('submit',event=>{
    event.preventDefault();event.stopImmediatePropagation();
    if(form.dataset.submitting==='true')return;
    clearErrors();setStatus('');

    const a={name:form.elements.profileName.value.trim(),birthDate:getDate('birth-'),birthTime:getTime('birth-'),calendarType:document.getElementById('birth-calendar').value,isLeapMonth:document.getElementById('birth-leap').checked,gender:document.getElementById('birth-gender').value,city:document.getElementById('birth-city').value};
    const b={name:form.elements.partnerName.value.trim(),birthDate:getDate('partner-birth-'),birthTime:getTime('partner-birth-'),calendarType:document.getElementById('partner-birth-calendar').value,isLeapMonth:document.getElementById('partner-birth-leap').checked,gender:document.getElementById('partner-birth-gender').value,city:document.getElementById('partner-birth-city').value};

    let firstInvalid=null;
    if(!a.name){setError('profile-name','이름 또는 닉네임을 입력해주세요.');firstInvalid=document.getElementById('profile-name');}
    else if(!a.birthDate){setStatus('나의 태어난 연·월·일을 모두 선택해주세요.');firstInvalid=document.getElementById('birth-year');}
    else if(a.birthTime===null){setStatus('나의 태어난 시간을 입력하려면 오전/오후·시·분을 모두 선택해주세요.');firstInvalid=document.getElementById('birth-meridiem');}
    else if(!a.gender){setStatus('나의 성별을 선택해주세요.');firstInvalid=document.getElementById('birth-gender');}
    else if(!a.city){setStatus('나의 태어난 지역을 선택해주세요.');firstInvalid=document.getElementById('birth-city');}
    else if(!b.name){setError('partner-name','상대방 이름 또는 닉네임을 입력해주세요.');firstInvalid=document.getElementById('partner-name');}
    else if(!b.birthDate){setStatus('상대방의 태어난 연·월·일을 모두 선택해주세요.');firstInvalid=document.getElementById('partner-birth-year');}
    else if(b.birthTime===null){setStatus('상대방의 태어난 시간을 입력하려면 오전/오후·시·분을 모두 선택해주세요.');firstInvalid=document.getElementById('partner-birth-meridiem');}
    else if(!b.gender){setStatus('상대방의 성별을 선택해주세요.');firstInvalid=document.getElementById('partner-birth-gender');}
    else if(!b.city){setStatus('상대방의 태어난 지역을 선택해주세요.');firstInvalid=document.getElementById('partner-birth-city');}
    else if(!form.elements.consent.checked){setStatus('분석을 위한 정보 사용에 동의해주세요.');firstInvalid=form.elements.consent;}
    if(firstInvalid){firstInvalid.setAttribute('aria-invalid','true');firstInvalid.focus();return;}

    const payload={personA:a,personB:b,createdAt:Date.now()};
    sessionStorage.setItem('jungwoljae_compatibility_input',JSON.stringify(payload));
    form.dataset.submitting='true';const submit=form.querySelector('button[type="submit"]');if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true');}
    setStatus('두 사람의 명식을 비교하고 있습니다.','success');
    setTimeout(()=>{location.href='./compatibility-report.html';},160);
  },true);
})();