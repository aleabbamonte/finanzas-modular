// ============================================================
// 📈 calculations.js — Cálculos financieros base
// ============================================================
// Finanzas Pro v3.2
//
// Incluye funciones para:
//
//  - Interés simple
//  - Interés compuesto
//  - Conversión de TNA → tasa mensual
//  - Cálculo de retorno (con o sin capitalización)
//
// Todas las funciones operan en decimales (no porcentajes).
// ============================================================

/**
 * Calcula el monto final con interés simple.
 * 
 * @param {number} capital - Monto inicial invertido
 * @param {number} tasaAnualDecimal - Tasa anual en formato decimal (ej: 0.75 para 75%)
 * @param {number} meses - Duración en meses
 * @returns {number} Monto final (capital + interés)
 */
export function interesSimple(capital, tasaAnualDecimal, meses) {
  if (isNaN(capital) || isNaN(tasaAnualDecimal) || isNaN(meses)) return 0;
  return capital * (1 + tasaAnualDecimal * (meses / 12));
}

/**
 * Calcula el monto final con interés compuesto.
 * 
 * @param {number} capital - Monto inicial
 * @param {number} tasaAnualDecimal - Tasa anual en formato decimal (ej: 0.75 para 75%)
 * @param {number} meses - Plazo en meses
 * @param {number} compPerYear - Frecuencia de capitalización (por defecto mensual: 12)
 * @returns {number} Monto final acumulado
 */
export function interesCompuesto(capital, tasaAnualDecimal, meses, compPerYear = 12) {
  if (isNaN(capital) || isNaN(tasaAnualDecimal) || isNaN(meses)) return 0;
  const r = tasaAnualDecimal / compPerYear;
  const n = compPerYear * (meses / 12);
  return capital * Math.pow(1 + r, n);
}

/**
 * Convierte una TNA (%) a tasa mensual decimal efectiva.
 * Usa la fórmula de capitalización compuesta mensual.
 * 
 * @param {number} tnaPercent - Tasa nominal anual expresada en porcentaje (ej: 75)
 * @returns {number} Tasa mensual equivalente en formato decimal (ej: 0.047)
 */
export function tnaAMensual(tnaPercent) {
  if (isNaN(tnaPercent)) return 0;
  const tna = tnaPercent / 100;
  return Math.pow(1 + tna, 1 / 12) - 1;
}

/**
 * Calcula el retorno total (final + ganancia) con o sin interés compuesto.
 * 
 * @param {Object} params - Parámetros del cálculo
 * @param {number} params.capital - Monto inicial
 * @param {number} params.tnaPercent - Tasa nominal anual (%)
 * @param {number} params.meses - Plazo en meses
 * @param {boolean} [params.compuesto=true] - Si se usa interés compuesto
 * @returns {{ final: number, ganancia: number }}
 */
export function calcularRetorno({ capital, tnaPercent, meses, compuesto = true }) {
  if (isNaN(capital) || isNaN(tnaPercent) || isNaN(meses))
    return { final: 0, ganancia: 0 };

  const rAnual = tnaPercent / 100;
  let final, ganancia;

  if (compuesto) {
    final = interesCompuesto(capital, rAnual, meses, 12);
  } else {
    final = interesSimple(capital, rAnual, meses);
  }

  ganancia = final - capital;
  return { final, ganancia };
}