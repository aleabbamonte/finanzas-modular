// ============================================================
// 🔢 pin-user.js — Gestión de pantalla de PIN y autenticación local
// ============================================================
// Finanzas Pro v3.2
// Controla el ingreso o configuración del PIN individual por usuario.
// Compatible con auth.js y login-bootstrap.js.
//
// Funcionalidades:
// - Muestra una pantalla centrada para ingresar/configurar PIN.
// - Aplica blur al fondo y evita instancias duplicadas.
// - Permite desbloqueo por huella (si el dispositivo lo soporta).
// - Corrige la inicialización temprana de app.init() (delay 150 ms).
// ============================================================

import {
  currentUser,
  verifyPinForCurrentUser,
  setPinForCurrentUser,
  webAuthnAvailable,
  loginWebAuthn
} from './auth.js';

// ============================================================
// 🧩 Objeto principal de UI del PIN
// ============================================================
export const pinUI = {
  el: null, // referencia al contenedor de la pantalla PIN

  // ------------------------------------------------------------
  // 📲 show(mode) — Muestra la pantalla del PIN
  // ------------------------------------------------------------
  // mode = 'unlock' → desbloqueo normal
  // mode = 'set' → primera vez o cambio de PIN
  show(mode = 'unlock') {
    // Elimina cualquier instancia previa antes de crear una nueva
    document.querySelectorAll('#pinScreen').forEach(e => e.remove());

    // Si no existe aún, crear el componente
    if (!this.el) this.mount();

    this.el.style.display = 'grid'; // visible y centrado

    // Muestra el usuario actual
    const email = currentUser();
    this.el.querySelector('[data-user]').textContent = email || '(sin usuario)';
    this.el.querySelector('[data-mode]').textContent =
      mode === 'set' ? 'Configurar PIN' : 'Ingresar PIN';
    this.el.querySelector('#pinInput').value = '';

    // Mostrar botón de biometría si el dispositivo lo soporta
    const bioBtn = this.el.querySelector('#bioBtn');
    webAuthnAvailable().then(ok => (bioBtn.style.display = ok ? 'block' : 'none'));
  },

  // ------------------------------------------------------------
  // 🧭 hide() — Oculta la pantalla PIN
  // ------------------------------------------------------------
  hide() {
    if (this.el) this.el.style.display = 'none';
  },

  // ------------------------------------------------------------
  // 🏗️ mount() — Crea dinámicamente el DOM del PIN
  // ------------------------------------------------------------
  mount() {
    this.el = document.createElement('div');
    this.el.id = 'pinScreen';
    this.el.innerHTML = `
      <div class="login-card" style="max-width:360px;">
        <div class="login-title">🔒 <span data-mode>Ingresar PIN</span></div>
        <div class="login-subtitle" style="margin-bottom:14px;">
          Usuario: <b data-user></b>
        </div>
        <input
          id="pinInput"
          class="input"
          type="password"
          inputmode="numeric"
          placeholder="••••"
          maxlength="6"
        />
        <button id="pinConfirm" class="login-btn" style="margin-top:4px;">Continuar</button>
        <button id="bioBtn" class="login-bio" style="display:none;">🔓 Usar huella</button>
      </div>`;

    // 💡 Estilos globales aplicados desde CSS:
    // #pinScreen { backdrop-filter: blur(5px); background: rgba(2,6,23,.5); }

    document.body.appendChild(this.el);

    // ------------------------------------------------------------
    // 🎯 Evento: confirmar PIN
    // ------------------------------------------------------------
    this.el.querySelector('#pinConfirm').addEventListener('click', () => {
      const val = this.el.querySelector('#pinInput').value.trim();
      const email = currentUser();
      if (!email) return;

      const ok = verifyPinForCurrentUser(val);

      if (ok) {
        this.desbloquearApp();
      } else {
        // primera vez: setea PIN
        if (val.length >= 4) {
          setPinForCurrentUser(val);
          alert('🔐 PIN registrado correctamente');
          this.desbloquearApp();
        } else {
          alert('⚠️ PIN inválido. Debe tener al menos 4 dígitos.');
        }
      }
    });

    // ------------------------------------------------------------
    // 🖐️ Evento: desbloquear con huella (biometría)
    // ------------------------------------------------------------
    this.el.querySelector('#bioBtn').addEventListener('click', async () => {
      const ok = await loginWebAuthn();
      if (ok) {
        this.desbloquearApp();
      } else {
        alert('❌ No se pudo usar biometría en este dispositivo.');
      }
    });
  },

  // ------------------------------------------------------------
  // 🔓 desbloquearApp() — Oculta PIN y muestra la app principal
  // ------------------------------------------------------------
  desbloquearApp() {
    this.hide();

    const container = document.querySelector('.container');
    if (container && container.style) container.style.display = 'block';

    // Inicializar la app cuando todo el DOM esté listo
    if (window.app && !window.app.__booted) {
      window.app.__booted = true;

      // ⏱️ Delay leve para asegurar que el DOM esté completo
      setTimeout(() => {
        if (document.readyState === 'complete') {
          window.app.init();
        } else {
          window.addEventListener('load', () => window.app.init(), { once: true });
        }
      }, 150);
    }
  }
};