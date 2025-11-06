// ============================================================
// 🔐 auth.js — Sistema de autenticación local
// ============================================================
// Finanzas Pro v3.2
// Gestión de usuarios, contraseñas, PIN, biometría y sesión local.
//
// Este módulo funciona totalmente offline, usando localStorage,
// pero está preparado para integrar Firebase Auth (email / Google Sign-In)
// o WebAuthn real más adelante.
// ============================================================

// === Dependencia: CryptoJS (ya incluida en index.html) ===
function sha256(str) {
  return CryptoJS.SHA256(str).toString();
}

// ============================================================
// 👤 CREAR NUEVO USUARIO
// ============================================================
// Genera un "salt" único por usuario, guarda el hash (password+salt)
// y crea la estructura base en localStorage.
export function crearCuenta(email, password) {
  email = (email || '').trim().toLowerCase();
  if (!email || !password) return { ok: false, err: 'Email y contraseña requeridos' };

  const users = JSON.parse(localStorage.getItem('auratech_users') || '{}');
  if (users[email]) return { ok: false, err: 'El usuario ya existe' };

  const salt = Math.random().toString(36).slice(2, 10);
  users[email] = {
    salt,                        // semilla única por usuario
    hash: sha256(password + salt),
    pinHash: null,               // PIN se configura después del primer login
    webAuthn: false              // bandera de huella/biometría
  };
  localStorage.setItem('auratech_users', JSON.stringify(users));
  return { ok: true };
}

// ============================================================
// 🔑 VERIFICAR CREDENCIALES DE LOGIN
// ============================================================
// Compara el hash calculado con el almacenado.
// Si es correcto, guarda una sesión local con timestamp.
export function verificarCredenciales(email, password) {
  email = (email || '').trim().toLowerCase();
  const users = JSON.parse(localStorage.getItem('auratech_users') || '{}');
  const u = users[email];

  if (!u) return { ok: false, err: 'Usuario no encontrado' };
  if (sha256(password + u.salt) !== u.hash) return { ok: false, err: 'Contraseña incorrecta' };

  localStorage.setItem('auratech_session', JSON.stringify({ email, ts: Date.now() }));
  return { ok: true };
}

// ============================================================
// 👥 SESIÓN ACTUAL
// ============================================================
// Devuelve el email del usuario actualmente logueado.
// Si no hay sesión activa o el JSON está corrupto → null.
export function currentUser() {
  const s = localStorage.getItem('auratech_session');
  try {
    return s ? JSON.parse(s).email : null;
  } catch {
    return null;
  }
}

// Cierra la sesión activa.
export function logout() {
  localStorage.removeItem('auratech_session');
}

// ============================================================
// 🔒 PIN POR USUARIO
// ============================================================
// Cada usuario tiene su propio PIN encriptado (hash con su salt).
export function setPinForCurrentUser(pin) {
  const email = currentUser();
  if (!email) return false;

  const users = JSON.parse(localStorage.getItem('auratech_users') || '{}');
  const u = users[email];
  if (!u) return false;

  u.pinHash = sha256(String(pin) + u.salt);
  users[email] = u;
  localStorage.setItem('auratech_users', JSON.stringify(users));
  return true;
}

// Verifica que el PIN ingresado coincida con el guardado.
export function verifyPinForCurrentUser(pin) {
  const email = currentUser();
  if (!email) return false;

  const users = JSON.parse(localStorage.getItem('auratech_users') || '{}');
  const u = users[email];
  if (!u || !u.pinHash) return false;

  return sha256(String(pin) + u.salt) === u.pinHash;
}

// ============================================================
// 🖐️ BIOMETRÍA (placeholders WebAuthn locales)
// ============================================================
// Estos métodos simulan el flujo de registro/login biométrico
// y guardan solo una bandera booleana por usuario.
// Cuando se integre WebAuthn real, se reemplazan fácilmente.
export async function webAuthnAvailable() {
  return !!(window.PublicKeyCredential && navigator.credentials);
}

// Simula registrar la huella para el usuario actual
export async function registerWebAuthn() {
  if (!await webAuthnAvailable()) return false;
  const email = currentUser();
  if (!email) return false;

  const users = JSON.parse(localStorage.getItem('auratech_users') || '{}');
  if (!users[email]) return false;

  users[email].webAuthn = true;
  localStorage.setItem('auratech_users', JSON.stringify(users));
  return true;
}

// Simula login biométrico (solo valida la bandera local)
export async function loginWebAuthn() {
  if (!await webAuthnAvailable()) return false;
  const email = currentUser();
  if (!email) return false;

  const users = JSON.parse(localStorage.getItem('auratech_users') || '{}');
  return !!(users[email] && users[email].webAuthn);
}

// ============================================================
// 🌐 LOGIN CON GOOGLE (placeholder offline)
// ============================================================
// Crea un usuario "fake" con email temporal y marca provider:'google'.
// Preparado para conectar con Firebase Auth → Google Sign-In.
export async function loginWithGooglePlaceholder() {
  const fakeEmail = 'google_user_' + Math.random().toString(36).slice(2, 8) + '@example.com';

  // Inicia sesión simulada
  localStorage.setItem(
    'auratech_session',
    JSON.stringify({ email: fakeEmail, ts: Date.now(), provider: 'google' })
  );

  // Si el usuario no existía, se crea uno genérico
  const users = JSON.parse(localStorage.getItem('auratech_users') || '{}');
  if (!users[fakeEmail]) {
    users[fakeEmail] = {
      salt: 'g',
      hash: sha256('oauth'),
      pinHash: null,
      webAuthn: false
    };
    localStorage.setItem('auratech_users', JSON.stringify(users));
  }

  return { ok: true, email: fakeEmail };
}