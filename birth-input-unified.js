(() => {
  'use strict';
  const pad = value => String(value).padStart(2, '0');
  const formatDate = value => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}.${digits.slice(4)}`;
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
  };
  window.JungwoljaeBirthInput = { pad, formatDate };
})();
