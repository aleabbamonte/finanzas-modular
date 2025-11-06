// ============================================================
// 💾 storage.js — Módulo de persistencia cifrada multiusuario
// ============================================================
// Finanzas Pro v3.2
// Cada cuenta guarda su dataset cifrado con clave dinámica (PIN del usuario).
// Usa AES (CryptoJS) para encriptar y proteger los datos locales.
//
// 🔐 Estructura de clave por usuario:
//   localStorage["auratech_datos_<email>"] = AES(datosJSON, pin)
// Si no hay PIN (sesión inicial), los datos se guardan sin cifrar.
// ============================================================

/**
 * Guarda los datos financieros de un usuario en localStorage.
 * Si se pasa un PIN, los datos se cifran con AES.
 * 
 * @param {Object} datos - Objeto completo de datos financieros del usuario
 * @param {string|null} pin - Clave de cifrado (PIN) o null si sin cifrar
 * @param {string|null} email - Email del usuario actual (clave única)
 * @returns {boolean} Éxito o fallo del guardado
 */
export function guardarDatos(datos, pin, email = null) {
  try {
    const key = email ? `auratech_datos_${email}` : 'auratech_datos';

    // Si no hay PIN → guarda en texto plano (solo setup inicial)
    if (!pin) {
      localStorage.setItem(key, JSON.stringify(datos));
      return true;
    }

    // Encriptar con AES (CryptoJS)
    const json = JSON.stringify(datos);
    const enc = CryptoJS.AES.encrypt(json, pin).toString();
    localStorage.setItem(key, enc);
    return true;
  } catch (e) {
    console.error('❌ Error al guardar datos cifrados:', e);
    return false;
  }
}

/**
 * Carga y descifra los datos financieros del usuario actual.
 * 
 * @param {string|null} pin - Clave de descifrado (PIN)
 * @param {string|null} email - Email del usuario actual
 * @returns {Object|null} Datos descifrados o null si no existen / error
 */
export function cargarDatos(pin, email = null) {
  try {
    const key = email ? `auratech_datos_${email}` : 'auratech_datos';
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    // Si no hay PIN, cargar sin descifrar (modo setup)
    if (!pin) return JSON.parse(raw);

    // Intentar descifrar con AES
    const bytes = CryptoJS.AES.decrypt(raw, pin);
    const txt = bytes.toString(CryptoJS.enc.Utf8);
    if (!txt) {
      console.warn('⚠️ PIN incorrecto o datos corruptos para', key);
      return null;
    }

    return JSON.parse(txt);
  } catch (e) {
    console.error('❌ Error al cargar datos cifrados:', e);
    return null;
  }
}

/**
 * Exporta los datos actuales a un archivo JSON descargable.
 * 
 * @param {Object} datos - Objeto con todos los datos financieros
 */
export function exportarJSON(datos) {
  try {
    const json = JSON.stringify(datos, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzaspro-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('❌ Error al exportar datos a JSON:', e);
    alert('⚠️ No se pudo exportar los datos.');
  }
}