// storage.js - guardar/cargar en localStorage con cifrado usando CryptoJS (require crypto-js cargado en index)
export function guardarDatos(d, pin) {
  try {
    if (!pin) {
      localStorage.setItem('auratech_datos', JSON.stringify(d));
      return true;
    }
    const datosJSON = JSON.stringify(d);
    const datosEncriptados = CryptoJS.AES.encrypt(datosJSON, pin).toString();
    localStorage.setItem('auratech_datos', datosEncriptados);
    return true;
  } catch(e) { console.error(e); return false; }
}

export function cargarDatos(pin) {
  try {
    const guardado = localStorage.getItem('auratech_datos');
    if (!guardado) return null;
    if (!pin) return JSON.parse(guardado);
    const bytes = CryptoJS.AES.decrypt(guardado, pin);
    const datosJSON = bytes.toString(CryptoJS.enc.Utf8);
    if (!datosJSON) return null;
    return JSON.parse(datosJSON);
  } catch(e) { console.error(e); return null; }
}

export function exportarJSON(datos) {
  const json = JSON.stringify(datos, null, 2);
  const blob = new Blob([json], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `auratech-finanzas-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
