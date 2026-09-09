(() => {
  'use strict';
  const maxYear = new Date().getFullYear();
  const pad = value => String(value).padStart(2, '0');
  const emit = (el, type = 'change') => el.dispatchEvent(new Event(type, { bubbles: true }));
  const valid = (y, m, d) => {
    y = Number(y); m = Number(m); d = Number(d);
    if (y < 1900 || y > maxYear || m < 1 || m > 12 || d < 1) return false;
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  };
  const format = value => {
    const raw = String(value || '').replace(/\D/g, '').slice(0, 8);
    if (raw.length <= 4) return raw;
    if (raw.length <= 6) return `${raw.slice(0, 4)}.${raw.slice(4)}`;
    return `${raw.slice(0, 4)}.${raw.slice(4, 6)}.${raw.slice(6)}`;
  };
  const parse = value => {
    const raw = String(value || '').replace(/\D/g, '');
    if (raw.length !== 8) return null;
    const parts = [raw.slice(0, 4), raw.slice(4, 6), raw.slice(6, 8)];
    return valid(...parts) ? parts : null;
  };
  const makeInput = () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'numeric';
    input.autocomplete = 'bday';
    input.maxLength = 10;
    input.placeholder = 'YYYY.MM.DD';
    input.className = 'jwj-date-input jwj-date-input-simple';
    input.setAttribute('aria-label', '태어난 날짜');
    return input;
  };
  const bind = (host, read, write, clear) => {
    if (host._jwjSimpleDate) return;
    host.querySelectorAll('.jwj-date-input-simple').forEach(node => node.remove());
    const input = makeInput();
    host.append(input);
    let busy = false;
    input.addEventListener('input', () => {
      input.value = format(input.value);
      const parts = parse(input.value);
      if (parts) {
        busy = true;
        write(`${parts[0]}-${parts[1]}-${parts[2]}`);
        busy = false;
        input.removeAttribute('aria-invalid');
      } else if (!input.value) {
        busy = true; clear(); busy = false;
      } else if (input.value.replace(/\D/g, '').length === 8) {
        input.setAttribute('aria-invalid', 'true');
      }
    });
    const sync = () => {
      if (busy || document.activeElement === input) return;
      const value = String(read() || '').replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1.$2.$3');
      if (input.value !== value) input.value = value;
    };
    host._jwjSimpleDate = { sync };
    sync();
  };
  const selectGroups = () => document.querySelectorAll('.date-selects,.birth-date-grid,.profile-date-selects').forEach(host => {
    if (host._jwjSimpleDate) return;
    const list = [...host.querySelectorAll(':scope > select')];
    if (list.length < 3) return;
    const year = list.find(el => /year|연도/i.test(`${el.id} ${el.name} ${el.getAttribute('aria-label') || ''}`)) || list[0];
    const month = list.find(el => /month|월/i.test(`${el.id} ${el.name} ${el.getAttribute('aria-label') || ''}`)) || list[1];
    const day = list.find(el => /day|일/i.test(`${el.id} ${el.name} ${el.getAttribute('aria-label') || ''}`)) || list[2];
    [year, month, day].forEach(el => el.classList.add('jwj-native-hidden'));
    host.dataset.jwjDateEnhanced = 'true';
    const setPart = (el, value) => { el.value = value; emit(el, 'input'); emit(el); };
    bind(host,
      () => year.value && month.value && day.value ? `${year.value}-${pad(month.value)}-${pad(day.value)}` : '',
      value => { const parts = value.split('-'); setPart(year, parts[0]); setPart(month, parts[1]); setPart(day, parts[2]); },
      () => [year, month, day].forEach(el => setPart(el, ''))
    );
  });
  const nativeDates = () => document.querySelectorAll('input[type="date"]').forEach(native => {
    if (native._jwjSimpleDate) return;
    const field = native.closest('.field,.quick-field,.profile-edit-field');
    if (!/birth|태어난|생년|출생/i.test(`${native.id} ${native.name} ${field?.querySelector('label')?.textContent || ''}`)) return;
    const host = document.createElement('div');
    host.className = 'jwj-native-date-host';
    native.parentNode.insertBefore(host, native);
    host.append(native);
    native.classList.add('jwj-native-hidden');
    bind(host, () => native.value, value => { native.value = value; emit(native, 'input'); emit(native); }, () => { native.value = ''; emit(native, 'input'); emit(native); });
    native._jwjSimpleDate = true;
  });
  const run = () => { selectGroups(); nativeDates(); document.querySelectorAll('[data-jwj-date-enhanced="true"]').forEach(host => host._jwjSimpleDate?.sync?.()); document.querySelectorAll('.jwj-native-date-host').forEach(host => host._jwjSimpleDate?.sync?.()); };
  run();
  setInterval(run, 700);
})();
