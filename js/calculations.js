// calculations.js - cálculos financieros: interés simple, compuesto, conversión TNA/Tasa mensual
export function interesSimple(capital, tasaAnualDecimal, meses) {
  return capital * (1 + tasaAnualDecimal * (meses / 12));
}

export function interesCompuesto(capital, tasaAnualDecimal, meses, compPerYear = 12) {
  const r = tasaAnualDecimal / compPerYear;
  const n = compPerYear * (meses / 12);
  return capital * Math.pow(1 + r, n);
}

// conv TNA (%) a tasa mensual decimal aproximada (usando interés compuesto mensual)
export function tnaAMensual(tnaPercent) {
  const tna = tnaPercent / 100;
  return Math.pow(1 + tna, 1/12) - 1;
}

// calcular retorno con/without compuestos
export function calcularRetorno({capital, tnaPercent, meses, compuesto=true}) {
  const rAnual = tnaPercent / 100;
  if (compuesto) {
    const final = interesCompuesto(capital, rAnual, meses, 12);
    return { final, ganancia: final - capital };
  } else {
    const final = interesSimple(capital, rAnual, meses);
    return { final, ganancia: final - capital };
  }
}
