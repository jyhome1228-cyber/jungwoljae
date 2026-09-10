(() => {
  'use strict';
  const pad = value => String(value).padStart(2, '0');
  const emit = (el, type = 'change') => el.dispatchEvent(new Event(type, { bubbles: true }));
  const labelText = el => el.closest('.field,.quick-field,.profile-edit-field,.guide-field')?.querySelector('label')?.textContent || '';
  const isBirthTime = el => /birth|태어난 시간|출생시간/i.test(`${el.id || ''} ${el.name || ''} ${labelText(el)}`);

  const styleGroups = () => {
    document.querySelectorAll('.time-selects,.birth-time-grid,.profile-time-selects,.guide-time-selects').forEach(host => host.classList.add('jwj-time-selects'));
  };
  const makeSelect = (label, options) => {
    const select = document.createElement('select');
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = label;
    select.append(blank);
    options.forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      select.append(option);
    });
    return select;
  };
  const enhanceNative = native => {
    if (native._jwjUnifiedTime || !isBirthTime(native)) return;
    const host = document.createElement('div');
    host.className = 'jwj-native-time-host';
    native.parentNode.insertBefore(host, native);
    host.append(native);
    native.classList.add('jwj-native-hidden');
    const ui = document.createElement('div');
    ui.className = 'jwj-time-selects jwj-native-time-ui';
    const period = makeSelect('오전/오후', [['am', '오전'], ['pm', '오후']]);
    const hour = makeSelect('시', Array.from({ length: 12 }, (_, i) => [pad(i + 1), `${i + 1}시`]));
    const minute = makeSelect('분', [0, 10, 20, 30, 40, 50].map(value => [pad(value), `${pad(value)}분`]));
    ui.append(period, hour, minute);
    host.append(ui);
    const write = () => {
      if (native.disabled) return;
      let hour24 = Number(hour.value) % 12;
      if (period.value === 'pm') hour24 += 12;
      native.value = period.value && hour.value && minute.value ? `${pad(hour24)}:${minute.value}` : '';
      emit(native, 'input');
      emit(native);
    };
    [period, hour, minute].forEach(select => select.addEventListener('change', write));
    const sync = () => {
      [period, hour, minute].forEach(select => { select.disabled = native.disabled; });
      if (native.disabled) { period.value = ''; hour.value = ''; minute.value = ''; return; }
      const match = native.value.match(/^(\d{2}):(\d{2})/);
      if (!match) return;
      const hour24 = Number(match[1]);
      period.value = hour24 >= 12 ? 'pm' : 'am';
      hour.value = pad((hour24 % 12) || 12);
      minute.value = pad(Math.min(50, Math.round(Number(match[2]) / 10) * 10));
    };
    native._jwjUnifiedTime = { sync };
    sync();
  };
  const run = () => {
    styleGroups();
    document.querySelectorAll('input[type="time"]').forEach(enhanceNative);
    document.querySelectorAll('input[type="time"]').forEach(native => native._jwjUnifiedTime?.sync?.());
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
