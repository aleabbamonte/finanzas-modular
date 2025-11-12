// arg-data.js - servicio para consultar indicadores argentinos (Dólar tarjeta, UVA, Inflación)
// Nota: las URLs usadas son ejemplos. En producción ajustá a proveedores confiables o a APIs oficiales.
// Implementa cache local (1 hora por defecto) para minimizar peticiones.

const defaultCacheTTL = 60 * 60 * 1000; // 1 hora

async function cachedFetch(key, url, ttl = defaultCacheTTL) {
  try {
    const cacheKey = 'auratech_cache_' + key;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    const now = Date.now();
    if (cached && (now - cached.ts) < ttl) return cached.data;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fetch error');
    const data = await res.json();
    localStorage.setItem(cacheKey, JSON.stringify({ ts: now, data }));
    return data;
  } catch (e) {
    console.warn('cachedFetch failed', e);
    const cacheKey = 'auratech_cache_' + key;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    return cached ? cached.data : null;
  }
}

export async function getDolarTarjeta() {
  // fuente demo: dolarapi.com (ejemplo) -> adaptá si usás otra API
  const url = 'https://www.dolarsi.com/api/api.php?type=valoresprincipales'; // devuelve varios tipos
  const data = await cachedFetch('dolar_tarjeta', url, 30*60*1000);
  if (!data) return null;
  // buscar 'Dolar Tarjeta' o aproximado
  const found = data.find(item => item.casa && /tarjeta/i.test(item.casa.nombre));
  if (found) return found.casa.compra || found.casa.venta || null;
  // fallback: devolver dólar oficial
  const oficial = data.find(item => item.casa && /oficial/i.test(item.casa.nombre));
  return oficial ? (oficial.casa.venta || null) : null;
}

export async function getUVA() {
  // Fuente demo: BCRA públicos. Aquí usamos una URL ejemplo que podría necesitar reemplazo con token.
  const url = 'https://api.estadisticasbcra.com/uvs'; // requiere token en producción; aquí intentamos y devolvemos null si falla
  const data = await cachedFetch('uva', url, 24*60*60*1000);
  if (!data) return null;
  // asumir que data es array con objetos {fecha, valor}
  if (Array.isArray(data) && data.length) return data[0];
  return data;
}

export async function getInflacionMensual() {
  // INDEC no siempre da endpoints sencillos; usar una fuente o mantener dataset propio
  // Aquí devolvemos null si no hay fuente accesible
  return null;
}
