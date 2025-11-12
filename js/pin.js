// pin.js - Sistema de PIN y control de acceso a la app
// ----------------------------------------------------
// Este módulo maneja la creación, confirmación y verificación del PIN
// que protege los datos del usuario. Si ya hay un PIN guardado, muestra
// la pantalla de desbloqueo. Si no, permite configurarlo por primera vez.

// ⚠️ Usa localStorage para almacenar el PIN de manera local (sin cifrar).
// ⚠️ Los datos de la app, en cambio, se cifran con AES usando ese PIN (ver storage.js).

const pinManager = {
  // Estado actual del sistema de PIN
  currentPin: '',      // PIN que el usuario está escribiendo ahora
  storedPin: null,     // PIN almacenado en localStorage (si existe)
  confirmPin: '',      // PIN temporal para confirmar en modo setup
  mode: 'setup',       // Modos posibles: 'setup', 'confirm', 'login'

  // === Inicialización ===
  // Determina si se debe mostrar la pantalla de creación o de ingreso del PIN.
  init() {
    this.storedPin = localStorage.getItem('app_pin');

    if (this.storedPin) {
      // Ya existe un PIN → modo login
      this.mode = 'login';
      document.getElementById('pinTitle').textContent = 'Ingresa tu PIN';
      document.getElementById('pinSubtitle').textContent = 'Desbloquea tu app financiera';
    } else {
      // Primera vez → modo configuración
      this.mode = 'setup';
      document.getElementById('pinTitle').textContent = 'Configura tu PIN';
      document.getElementById('pinSubtitle').textContent = 'Crea un PIN de 4 dígitos para proteger tus datos';
    }
  },

  // === Añadir dígito ===
  // Cada vez que el usuario toca un número, se agrega al PIN actual.
  addDigit(digit) {
    if (this.currentPin.length < 4) {
      this.currentPin += digit;
      this.updateDots();

      // Cuando el PIN alcanza los 4 dígitos, procesarlo con un pequeño delay
      if (this.currentPin.length === 4) {
        setTimeout(() => this.processPin(), 300);
      }
    }
  },

  // === Eliminar último dígito ===
  deleteDigit() {
    this.currentPin = this.currentPin.slice(0, -1);
    this.updateDots();
    document.getElementById('pinError').textContent = '';
  },

  // === Actualizar puntos visuales ===
  // Muestra cuántos dígitos se ingresaron (rellenando los círculos).
  updateDots() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, index) => {
      if (index < this.currentPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  },

  // === Procesar PIN según modo actual ===
  processPin() {
    if (this.mode === 'setup') {
      // Primer paso de configuración: guardar PIN temporal y pedir confirmación
      this.confirmPin = this.currentPin;
      this.currentPin = '';
      this.mode = 'confirm';
      document.getElementById('pinTitle').textContent = 'Confirma tu PIN';
      document.getElementById('pinSubtitle').textContent = 'Ingresa nuevamente el PIN';
      this.updateDots();

    } else if (this.mode === 'confirm') {
      // Segundo paso de configuración: verificar coincidencia
      if (this.currentPin === this.confirmPin) {
        // Coinciden → guardar y desbloquear
        localStorage.setItem('app_pin', this.currentPin);
        this.unlockApp();
      } else {
        // No coinciden → mostrar error y reiniciar proceso
        document.getElementById('pinError').textContent = '❌ Los PINs no coinciden. Intenta de nuevo.';
        this.currentPin = '';
        this.confirmPin = '';
        this.mode = 'setup';
        document.getElementById('pinTitle').textContent = 'Configura tu PIN';
        document.getElementById('pinSubtitle').textContent = 'Crea un PIN de 4 dígitos';
        setTimeout(() => {
          this.updateDots();
          document.getElementById('pinError').textContent = '';
        }, 2000);
      }

    } else if (this.mode === 'login') {
      // Verificación normal de PIN
      if (this.currentPin === this.storedPin) {
        this.unlockApp();
      } else {
        document.getElementById('pinError').textContent = '❌ PIN incorrecto';
        this.currentPin = '';
        setTimeout(() => {
          this.updateDots();
          document.getElementById('pinError').textContent = '';
        }, 1500);
      }
    }
  },

  // === Desbloquear la aplicación ===
  // Oculta la pantalla de PIN y muestra el contenedor principal.
  unlockApp() {
    document.getElementById('pinScreen').style.display = 'none';
    document.querySelector('.container').style.display = 'block';

    // Inicializar la app principal (definida en app.js)
    app.init();
  }
};

// === INICIALIZACIÓN AUTOMÁTICA ===
// Se ejecuta al cargar el DOM: oculta el contenedor y muestra la pantalla de PIN.
export function setupPinAutoInit() {
  document.addEventListener('DOMContentLoaded', () => {
    const cont = document.querySelector('.container');
    if (cont) cont.style.display = 'none';
    if (typeof pinManager !== 'undefined' && pinManager.init) pinManager.init();
  });
}

// Exponer el manejador globalmente (útil para los botones del teclado numérico)
window.pinManager = pinManager;
