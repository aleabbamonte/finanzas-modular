// formatters.js - utilidades de formato y parseo
export function formatearPesos(num) {
  const s = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
  }).format(num);
  return `$ ${s}`;
}

export function parseMonto(str) {
  if (str == null) return NaN;
  const limpio = String(str)
      .replace(/[^0-9,.-]/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.');
  const n = parseFloat(limpio);
  return isNaN(n) ? NaN : n;
}

export function attachCurrencyFormatters(ids = []) {
  const formatLive = (raw) => {
      if (raw == null) return '';
      let s = String(raw).replace(/\s|\$/g, '');
      s = s.replace(/\./g, '');
      s = s.replace(/[^0-9,\-]/g, '');
      const lastComma = s.lastIndexOf(',');
      let entero = lastComma >= 0 ? s.slice(0, lastComma) : s;
      let dec = lastComma >= 0 ? s.slice(lastComma + 1) : '';
      const neg = entero.startsWith('-');
      if (neg) entero = entero.slice(1);
      entero = entero.replace(/[^0-9]/g, '');
      dec = dec.replace(/[^0-9]/g, '').slice(0, 2);
      if (entero.length > 9) entero = entero.slice(0, 9);
      entero = entero.replace(/^0+(\d)/, '$1');
      const withThousands = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      const base = (neg ? '-' : '') + withThousands;
      if (!base && !dec) return '';
      return dec.length ? `$ ${base},${dec}` : `$ ${base}`;
  };
  const setFormattedWithCaret = (input) => {
      const prev = input.value;
      const selStart = input.selectionStart || 0;
      const digitsBefore = (prev.slice(0, selStart).match(/\d/g) || []).length;
      const formatted = formatLive(prev);
      input.value = formatted;
      let count = 0;
      let newPos = formatted.length;
      for (let i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i])) count++;
          if (count >= digitsBefore) { newPos = i + 1; break; }
      }
      try { input.setSelectionRange(newPos, newPos); } catch {}
  };
  ids.forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('focus', () => {
          const val = parseMonto(input.value);
          input.value = isNaN(val) ? '' : String(val);
      });
      input.addEventListener('input', () => {
          if (!input.value) return;
          setFormattedWithCaret(input);
      });
      input.addEventListener('blur', () => {
          const val = parseMonto(input.value);
          input.value = isNaN(val) ? '' : formatearPesos(val);
      });
  });
}
