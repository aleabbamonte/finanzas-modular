// ============================================================
// 🧭 login-bootstrap.js — Flujo principal de autenticación
// ============================================================
// Finanzas Pro v3.2
//
// Flujo completo:
//   Login → (PIN individual) → Acceso a la App
//
// Compatible con:
//  - auth.js (creación, login local, biometría)
//  - pin-user.js (interfaz de PIN)
//  - app.js (contenedor principal)
//
// Previene instancias duplicadas y mantiene la pantalla principal limpia.
// ============================================================

import {
  crearCuenta,
  verificarCredenciales,
  currentUser,
  loginWithGooglePlaceholder,
  registerWebAuthn
} from './auth.js';
import { pinUI } from './pin-user.js';

// ------------------------------------------------------------
// 🧩 Helpers básicos de visibilidad
// ------------------------------------------------------------
function show(el) {
  el.style.display = 'flex';
}
function hide(el) {
  el.style.display = 'none';
}

// ------------------------------------------------------------
// 🏗️ Monta la pantalla de login principal
// ------------------------------------------------------------
function mountLogin() {
  // 🔁 Si ya existe una instancia previa, eliminarla antes
  document.querySelectorAll('#loginScreen').forEach(e => e.remove());

  const el = document.createElement('div');
  el.id = 'loginScreen';
  el.innerHTML = `
    <div class="login-card">
      <div class="login-logo">
        <img src="./img/logo.png" alt="Finanzas Pro"
          onerror="this.style.display='none';this.parentElement.textContent='FP';">
      </div>
      <div class="login-title">Finanzas Pro</div>
      <div class="login-subtitle">Gestioná tus finanzas con inteligencia y estilo</div>

      <form class="login-form" onsubmit="return false;">
        <input id="loginEmail" class="input" type="email"
               placeholder="Correo electrónico" autocomplete="username" required />
        <input id="loginPass" class="input" type="password"
               placeholder="Contraseña" autocomplete="current-password" required />

        <button id="loginBtn" class="login-btn">Iniciar sesión</button>
        <div class="login-link" id="createLink">Crear cuenta nueva</div>

        <div class="login-sep">o</div>

        <button id="googleBtn" type="button" class="login-google">
          <span class="g-icon"></span> Iniciar sesión con Google
        </button>

        <button id="bioSetup" type="button" class="login-bio">
          🔓 Activar huella (opcional)
        </button>

        <div class="login-foot">Finanzas Pro by Auratech™ · v3.2</div>
      </form>
    </div>`;

  document.body.appendChild(el);

  // ------------------------------------------------------------
  // 🎯 Asignación de eventos
  // ------------------------------------------------------------
  const btnLogin  = el.querySelector('#loginBtn');
  const btnCreate = el.querySelector('#createLink');
  const btnGoogle = el.querySelector('#googleBtn');
  const btnBio    = el.querySelector('#bioSetup');

  // ------------------------------------------------------------
  // 🔐 Iniciar sesión local con email/contraseña
  // ------------------------------------------------------------
  btnLogin.addEventListener('click', () => {
    const email = el.querySelector('#loginEmail').value.trim();
    const pass  = el.querySelector('#loginPass').value.trim();

    const res = verificarCredenciales(email, pass);
    if (!res.ok) {
      alert(res.err || 'No se pudo iniciar sesión. Verificá tus datos.');
      return;
    }

    // ✅ Sesión iniciada: ocultar login y pasar al PIN
    hide(el);
    document.querySelectorAll('#pinScreen').forEach(e => e.remove()); // limpia duplicados
    pinUI.show('unlock');
  });

  // ------------------------------------------------------------
  // ✳️ Crear cuenta nueva (local)
  // ------------------------------------------------------------
  btnCreate.addEventListener('click', () => {
    const email = el.querySelector('#loginEmail').value.trim();
    const pass  = el.querySelector('#loginPass').value.trim();

    const r = crearCuenta(email, pass);
    if (!r.ok) {
      alert(r.err || 'No se pudo crear la cuenta.');
      return;
    }

    alert('✅ Cuenta creada correctamente. Ahora iniciá sesión.');
  });

  // ------------------------------------------------------------
  // 🌐 Iniciar sesión con Google (placeholder offline)
  // ------------------------------------------------------------
  btnGoogle.addEventListener('click', async () => {
    try {
      const r = await loginWithGooglePlaceholder();
      if (r.ok) {
        hide(el);
        document.querySelectorAll('#pinScreen').forEach(e => e.remove());
        pinUI.show('unlock');
      } else {
        alert('❌ No se pudo iniciar con Google en este entorno.');
      }
    } catch (e) {
      console.error('Error en login con Google:', e);
      alert('⚠️ Error al intentar iniciar con Google.');
    }
  });

  // ------------------------------------------------------------
  // 🖐️ Activar autenticación biométrica (WebAuthn)
  // ------------------------------------------------------------
  btnBio.addEventListener('click', async () => {
    try {
      const ok = await registerWebAuthn();
      alert(ok
        ? '✅ Biometría activada para este usuario.'
        : '⚠️ No se pudo activar biometría en este dispositivo.');
    } catch (e) {
      console.error('Error al activar biometría:', e);
      alert('⚠️ Error al activar biometría.');
    }
  });

  return el;
}

// ------------------------------------------------------------
// 🚀 Inicialización automática al cargar la app
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Ocultar app principal hasta que se valide login + PIN
  const appContainer = document.querySelector('.container');
  if (appContainer) appContainer.style.display = 'none';

  // Detectar si ya hay sesión activa
  const email = currentUser();
  const loginEl = mountLogin();

  if (email) {
    // 🔓 Sesión previa: saltar login y mostrar PIN directamente
    hide(loginEl);
    document.querySelectorAll('#pinScreen').forEach(e => e.remove());
    pinUI.show('unlock');
  } else {
    // 👋 No hay sesión → mostrar login
    show(loginEl);
  }
});