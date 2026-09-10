(() => {
  'use strict';
  const emit = (el, type = 'change') => el.dispatchEvent(new Event(type, { bubbles: true }));
  const labelText = el => el.closest('.field,.quick-field,.profile-edit-field')?.querySelector('label')?.textContent || '';
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
  const run = () => {
    document.querySelectorAll('select[name="gender"],select[id*="gender"]').forEach(enhance);
    document.querySelectorAll('select[name="gender"],select[id*="gender"]').forEach(select => select._jwjUnifiedGender?.paint?.());
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
