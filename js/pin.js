// pin.js - Configuración de inicialización del PIN
// -------------------------------------------------
// Este módulo solo se encarga de inicializar el sistema de PIN
// al cargar la página. La lógica completa del PIN está en app.js

// === INICIALIZACIÓN AUTOMÁTICA ===
// Se ejecuta al cargar el DOM: oculta el contenedor y muestra la pantalla de PIN.
export function setupPinAutoInit() {
  document.addEventListener('DOMContentLoaded', () => {
    const cont = document.querySelector('.container');
    if (cont) cont.style.display = 'none';
    
    // El pinManager está definido en app.js
    if (window.pinManager?.init) {
      window.pinManager.init();
    }
  });
}
