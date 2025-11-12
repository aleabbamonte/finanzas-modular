// storage.js - Gestión de almacenamiento local con cifrado opcional
// -------------------------------------------------------------------
// Este módulo permite guardar, cargar y exportar los datos de la app
// de forma segura. Usa localStorage para persistir la información
// y CryptoJS (AES) para cifrar los datos si el usuario definió un PIN.

// ⚠️ Requiere que la librería "crypto-js" esté cargada en index.html.

// === GUARDAR DATOS EN LOCALSTORAGE ===
// Parámetros:
// - d: objeto con todos los datos de la app (JSON serializable)
// - pin: cadena opcional, usada como clave de cifrado AES
export function guardarDatos(d, pin) {
  try {
    if (!pin) {
      // Si no hay PIN, guardar texto plano
      localStorage.setItem('auratech_datos', JSON.stringify(d));
      return true;
    }

    // Convertir a JSON y cifrar con AES usando el PIN
    const datosJSON = JSON.stringify(d);
    const datosEncriptados = CryptoJS.AES.encrypt(datosJSON, pin).toString();
    localStorage.setItem('auratech_datos', datosEncriptados);
    return true;

  } catch (e) {
    console.error('[FinanzasPro][Storage] Error al guardar:', e);
    return false;
  }
}

// === CARGAR DATOS DESDE LOCALSTORAGE ===
// Parámetros:
// - pin: cadena opcional, usada para descifrar los datos
// Retorna:
// - objeto con los datos guardados, o null si no hay datos o el PIN no coincide
export function cargarDatos(pin) {
  try {
    if (pin && !pin.trim()) pin = null;
    const guardado = localStorage.getItem('auratech_datos');
    if (!guardado) return null;

    // Si no hay PIN, leer directamente (modo sin cifrado)
    if (!pin) return JSON.parse(guardado);

    // Intentar descifrar el contenido
    const bytes = CryptoJS.AES.decrypt(guardado, pin);
    const datosJSON = bytes.toString(CryptoJS.enc.Utf8);

    // Si falla la conversión (PIN incorrecto o datos corruptos)
    if (!datosJSON) return null;

    return JSON.parse(datosJSON);

  } catch (e) {
    console.error('[FinanzasPro][Storage] Error al cargar:', e);
    return null;
  }
}

// === EXPORTAR DATOS COMO ARCHIVO JSON ===
// Genera un archivo descargable con todos los datos del usuario.
// El nombre del archivo incluye la fecha actual (ej: auratech-finanzas-2025-11-12.json)
export function exportarJSON(datos) {
  try {
    const json = JSON.stringify(datos, null, 2); // formato legible con sangría
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Crear enlace temporal para forzar descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = `auratech-finanzas-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    // Liberar el objeto URL temporal
    URL.revokeObjectURL(url);

  } catch (e) {
    console.error('[FinanzasPro][Storage] Error al exportar:', e);
  }
}
