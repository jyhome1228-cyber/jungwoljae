(() => {
  'use strict';
  const emit = (el, type = 'change') => el.dispatchEvent(new Event(type, { bubbles: true }));
  const labelText = el => el.closest('.field,.quick-field,.profile-edit-field,.guide-field')?.querySelector('label')?.textContent || '';
  const regions=['서울특별시','부산광역시','대구광역시','인천광역시','광주광역시','대전광역시','울산광역시','세종특별자치시','경기도','강원특별자치도','충청북도','충청남도','전북특별자치도','전라남도','경상북도','경상남도','제주특별자치도','해외·기타'];

  const enhance = select => {
    if (select._jwjUnifiedGender) return;
    if (!/gender|성별/i.test(`${select.id || ''} ${select.name || ''} ${labelText(select)}`)) return;
    let host = select.closest('.jwj-gender-host');
    if (host) host.querySelectorAll('.jwj-gender-segment').forEach(node => node.remove());
    else {
      host = document.createElement('div');
      host.className = 'jwj-gender-host';
      select.parentNode.insertBefore(host, select);
      host.append(select);
    }
    select.classList.add('jwj-native-hidden');
    const group = document.createElement('div');
    group.className = 'jwj-gender-segment';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', '성별 선택');
    const male = document.createElement('button');
    const female = document.createElement('button');
    male.type = female.type = 'button';
    male.textContent = '남성';
    female.textContent = '여성';
    male.dataset.value = 'male';
    female.dataset.value = 'female';
    group.append(male, female);
    host.append(group);
    const buttons = [male, female];
    const paint = () => buttons.forEach(button => {
      const active = select.value === button.dataset.value;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
      button.disabled = select.disabled;
    });
    buttons.forEach(button => button.addEventListener('click', () => {
      select.value = select.value === button.dataset.value && !select.required ? '' : button.dataset.value;
      emit(select, 'input');
      emit(select);
      paint();
    }));
    select._jwjUnifiedGender = { paint };
    paint();
  };

  const normalizeRegion=value=>{
    const raw=String(value||'').trim();
    if(!raw)return '';
    if(regions.includes(raw))return raw;
    return regions.find(region=>raw.includes(region.replace('특별자치도','').replace('특별자치시','').replace('광역시','').replace('특별시','').replace('도','')))||'';
  };

  const enhanceRegion = input => {
    if(input._jwjUnifiedRegion)return;
    const text=`${input.id||''} ${input.name||''} ${labelText(input)}`;
    if(!/city|지역/i.test(text))return;
    if(input.closest('[data-compatibility-form]'))return;
    const field=input.closest('.field,.quick-field,.profile-edit-field,.guide-field');
    if(!field)return;

    const select=document.createElement('select');
    select.className='jwj-region-select';
    select.setAttribute('aria-label','태어난 지역');
    select.innerHTML='<option value="">지역을 선택해주세요</option>'+regions.map(region=>`<option value="${region}">${region}</option>`).join('');
    if(input.id)select.id=`${input.id}-select`;
    const label=field.querySelector(`label[for="${CSS.escape(input.id||'')}"]`)||field.querySelector('label');
    if(label&&select.id)label.htmlFor=select.id;

    input.classList.add('jwj-native-hidden','jwj-region-source');
    input.setAttribute('aria-hidden','true');
    input.tabIndex=-1;
    input.style.setProperty('display','none','important');
    input.insertAdjacentElement('afterend',select);

    let syncing=false;
    const fromSelect=()=>{
      if(syncing)return;
      syncing=true;
      input.value=select.value;
      emit(input,'input');
      emit(input);
      syncing=false;
    };
    const fromInput=()=>{
      if(syncing)return;
      const next=normalizeRegion(input.value);
      if(select.value!==next)select.value=next;
      select.disabled=input.disabled;
    };
    select.addEventListener('change',fromSelect);
    input.addEventListener('input',fromInput);
    input.addEventListener('change',fromInput);
    input._jwjUnifiedRegion={select,sync:fromInput};
    fromInput();
  };

  const run = () => {
    document.querySelectorAll('select[name="gender"],select[id*="gender"]').forEach(enhance);
    document.querySelectorAll('select[name="gender"],select[id*="gender"]').forEach(select => select._jwjUnifiedGender?.paint?.());
    document.querySelectorAll('input[name="city"],input[id$="-city"]').forEach(enhanceRegion);
    document.querySelectorAll('.jwj-region-source').forEach(input=>input._jwjUnifiedRegion?.sync?.());
  };
  run();
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; run(); });
  };
  const observer = new MutationObserver(schedule);
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  let ticks = 0;
  const syncTimer = setInterval(() => {
    run();
    ticks += 1;
    if (ticks >= 20) clearInterval(syncTimer);
  }, 700);
  addEventListener('pageshow', run);
})();
