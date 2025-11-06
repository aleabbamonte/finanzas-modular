// ============================================================
// 💰 formatters.js — Utilidades de formato y parseo monetario
// ============================================================
// Finanzas Pro v3.2
//
// Funciones:
//  - formatearPesos: convierte números a formato "$ 1.234,56"
//  - parseMonto: interpreta strings en formato local → número decimal
//  - attachCurrencyFormatters: aplica formateo automático a inputs de monto
//
// Todas las funciones trabajan en el contexto ARS (es-AR).
// ============================================================

/**
 * Formatea un número como pesos argentinos (ARS)
 * @param {number} num - Monto numérico
 * @returns {string} Ejemplo: "$ 1.234,56"
 */
export function formatearPesos(num) {
  if (num == null || isNaN(num)) return '$ 0,00';
  const s = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
  return `$ ${s}`;
}

/**
 * Convierte un string en formato monetario ("$ 1.234,56") a número decimal.
 * @param {string} str - Texto a interpretar
 * @returns {number} Ejemplo: 1234.56
 */
export function parseMonto(str) {
  if (str == null) return NaN;
  const limpio = String(str)
    .replace(/[^0-9,.-]/g, '') // elimina símbolos y letras
    .replace(/\./g, '')        // quita separador de miles
    .replace(/,/g, '.');       // cambia coma decimal por punto
  const n = parseFloat(limpio);
  return isNaN(n) ? NaN : n;
}

/**
 * Aplica formato de moneda a los inputs especificados,
 * con animación suave al escribir (mantiene la posición del cursor).
 * 
 * @param {string[]} ids - IDs de los campos <input> donde aplicar el formato.
 */
export function attachCurrencyFormatters(ids = []) {

  // ------------------------------------------------------------
  // 🧩 Función interna: genera string "$ 1.234,56" en vivo
  // ------------------------------------------------------------
  const formatLive = (raw) => {
    if (raw == null) return '';
    let s = String(raw).replace(/\s|\$/g, ''); // quita espacios y símbolo $
    s = s.replace(/\./g, '');                  // elimina puntos de miles
    s = s.replace(/[^0-9,\-]/g, '');           // solo permite números, coma y negativo

    const lastComma = s.lastIndexOf(',');
    let entero = lastComma >= 0 ? s.slice(0, lastComma) : s;
    let dec = lastComma >= 0 ? s.slice(lastComma + 1) : '';
    const neg = entero.startsWith('-');
    if (neg) entero = entero.slice(1);

    // limpiar y limitar
    entero = entero.replace(/[^0-9]/g, '');
    dec = dec.replace(/[^0-9]/g, '').slice(0, 2);
    if (entero.length > 9) entero = entero.slice(0, 9);
    entero = entero.replace(/^0+(\d)/, '$1');

    // separadores de miles con punto
    const withThousands = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const base = (neg ? '-' : '') + withThousands;
    if (!base && !dec) return '';

    return dec.length ? `$ ${base},${dec}` : `$ ${base}`;
  };

  // ------------------------------------------------------------
  // 🪄 Mantiene el caret (posición del cursor) al formatear
  // ------------------------------------------------------------
  const setFormattedWithCaret = (input) => {
    const prev = input.value;
    const selStart = input.selectionStart || 0;
    const digitsBefore = (prev.slice(0, selStart).match(/\d/g) || []).length;
    const formatted = formatLive(prev);
    input.value = formatted;

    // Recoloca el cursor donde corresponde tras formatear
    let count = 0, newPos = formatted.length;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) count++;
      if (count >= digitsBefore) { newPos = i + 1; break; }
    }
    try { input.setSelectionRange(newPos, newPos); } catch {}
  };

  // ------------------------------------------------------------
  // ✏️ Vincula eventos a cada input de monto
  // ------------------------------------------------------------
  ids.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    // Al enfocar → mostrar valor crudo editable
    input.addEventListener('focus', () => {
      const val = parseMonto(input.value);
      input.value = isNaN(val) ? '' : String(val);
    });

    // Mientras escribe → formato dinámico con cursor estable
    input.addEventListener('input', () => {
      if (!input.value) return;
      setFormattedWithCaret(input);
    });

    // Al salir → aplicar formato final ($ con separadores)
    input.addEventListener('blur', () => {
      const val = parseMonto(input.value);
      input.value = isNaN(val) ? '' : formatearPesos(val);
    });
  });
}