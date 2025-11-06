// ============================================================
// 🇦🇷 arg-data.js — Servicio de indicadores económicos argentinos
// ============================================================
// Finanzas Pro v3.2
// Consultas remotas para Dólar, UVA e Inflación (placeholders).
//
// ▸ Incluye caché local en localStorage (TTL configurable, 1h por defecto)
// ▸ Devuelve datos persistidos si no hay conexión
// ▸ Preparado para integrarse con fuentes confiables (BCRA, INDEC, Dólar API)
//
// ⚙️ En producción: reemplazar URLs por endpoints verificados o API oficial.
// ============================================================

// Tiempo de vida de caché por defecto (1 hora)
const defaultCacheTTL = 60 * 60 * 1000;

/**
 * Realiza una petición con almacenamiento en caché.
 * Si la llamada falla, devuelve el último valor almacenado.
 *
 * @param {string} key - Clave única del recurso (ej: 'dolar_tarjeta')
 * @param {string} url - Endpoint remoto a consultar
 * @param {number} ttl - Tiempo de validez del caché (en ms)
 * @returns {Promise<any|null>} Datos frescos o del caché; null si no hay nada
 */
async function cachedFetch(key, url, ttl = defaultCacheTTL) {
  try {
    const cacheKey = 'auratech_cache_' + key;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    const now = Date.now();

    // ✅ Si el caché sigue vigente, devolverlo directamente
    if (cached && (now - cached.ts) < ttl) return cached.data;

    // 🔄 Si no hay caché válido, hacer fetch real
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch error (${res.status})`);

    const data = await res.json();

    // Guardar en caché con timestamp
    localStorage.setItem(cacheKey, JSON.stringify({ ts: now, data }));

    return data;
  } catch (e) {
    console.warn('⚠️ cachedFetch fallback → usando caché local:', e.message);
    const cacheKey = 'auratech_cache_' + key;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    return cached ? cached.data : null;
  }
}

// ============================================================
// 💵 Dólar Tarjeta (o tipo de cambio principal)
// ============================================================
// Ejemplo usando dolarsi.com — puede reemplazarse por dolarapi.com o similar
export async function getDolarTarjeta() {
  const url = 'https://www.dolarsi.com/api/api.php?type=valoresprincipales';
  const data = await cachedFetch('dolar_tarjeta', url, 30 * 60 * 1000); // TTL 30 min
  if (!data) return null;

  // Buscar elemento que contenga "Tarjeta" en su nombre
  const found = data.find(item => item.casa && /tarjeta/i.test(item.casa.nombre));
  if (found) {
    return parseFloat(found.casa.venta?.replace(',', '.') || found.casa.compra?.replace(',', '.') || 0);
  }

  // Fallback: si no está disponible, usar "Dólar Oficial"
  const oficial = data.find(item => item.casa && /oficial/i.test(item.casa.nombre));
  if (oficial) {
    return parseFloat(oficial.casa.venta?.replace(',', '.') || 0);
  }

  return null;
}

// ============================================================
// 📈 UVA (Unidad de Valor Adquisitivo)
// ============================================================
// Ejemplo: API pública del BCRA (requiere token real en producción)
// Devuelve el último valor disponible o null si no se puede obtener.
export async function getUVA() {
  const url = 'https://api.estadisticasbcra.com/uvs';
  const data = await cachedFetch('uva', url, 24 * 60 * 60 * 1000); // TTL 24h

  if (!data) return null;

  // Si la API devuelve array con [{fecha, valor}], tomar el último elemento
  if (Array.isArray(data) && data.length) {
    const ultimo = data[data.length - 1];
    return {
      fecha: ultimo.fecha,
      valor: parseFloat(ultimo.valor)
    };
  }

  return data;
}

// ============================================================
// 📊 Inflación mensual (placeholder sin fuente activa)
// ============================================================
// En versiones futuras, puede integrarse con INDEC o fuentes confiables.
// Por ahora, retorna null y permite a la app manejar el caso vacío.
export async function getInflacionMensual() {
  return null;
}