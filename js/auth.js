// auth.js - manejo de usuarios (correo+clave), PIN local y WebAuthn (si está disponible)
// Depende: CryptoJS (ya cargado en index.html). No realiza comunicación con backend — funciona localmente.
// Estructura guardada en localStorage: 'auratech_users' -> { email: { salt, hash, hasWebAuthn, pinHash, datosKey } }

function hmacHash(password, salt) {
  return CryptoJS.SHA256(password + salt).toString();
}

export function crearCuenta(email, password) {
  email = (email||'').toLowerCase();
  if (!email || !password) return { ok:false, err:'Email o contraseña vacíos' };
  const users = JSON.parse(localStorage.getItem('auratech_users')||'{}');
  if (users[email]) return { ok:false, err:'Usuario ya existe' };
  const salt = Math.random().toString(36).slice(2,10);
  const hash = hmacHash(password, salt);
  users[email] = { salt, hash, hasWebAuthn:false, pinHash:null, datosKey: null };
  localStorage.setItem('auratech_users', JSON.stringify(users));
  return { ok:true };
}

export function verificarCredenciales(email, password) {
  email = (email||'').toLowerCase();
  const users = JSON.parse(localStorage.getItem('auratech_users')||'{}');
  const u = users[email];
  if (!u) return { ok:false, err:'Usuario no encontrado' };
  const hash = hmacHash(password, u.salt);
  if (hash !== u.hash) return { ok:false, err:'Contraseña incorrecta' };
  // establecer sesión simple
  localStorage.setItem('auratech_session', JSON.stringify({ email, ts: Date.now() }));
  return { ok:true };
}

export function logout() {
  localStorage.removeItem('auratech_session');
}

export function currentUser() {
  const s = localStorage.getItem('auratech_session');
  return s ? JSON.parse(s).email : null;
}

// PIN local (guardado como hash)
export function setPinForCurrentUser(pin) {
  const email = currentUser();
  if (!email) return false;
  const users = JSON.parse(localStorage.getItem('auratech_users')||'{}');
  const u = users[email]; if (!u) return false;
  u.pinHash = hmacHash(String(pin), u.salt);
  users[email] = u;
  localStorage.setItem('auratech_users', JSON.stringify(users));
  return true;
}

export function verifyPinForCurrentUser(pin) {
  const email = currentUser();
  if (!email) return false;
  const users = JSON.parse(localStorage.getItem('auratech_users')||'{}');
  const u = users[email]; if (!u || !u.pinHash) return false;
  return hmacHash(String(pin), u.salt) === u.pinHash;
}

// WebAuthn (registro y login) - envoltorios simples
export async function webAuthnAvailable() {
  return !!(window.PublicKeyCredential && navigator.credentials);
}

// Nota: para producción WebAuthn requiere servidor y challenge. Aquí hacemos un enfoque simplificado usando 'create'/'get' con ephemeral challenge.
// register returns true if flow completed
export async function registerWebAuthn(displayName) {
  if (!await webAuthnAvailable()) throw new Error('WebAuthn no disponible');
  const publicKey = {
    challenge: Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32))),
    rp: { name: "Finanzas Pro" },
    user: { id: Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(8))), name: displayName, displayName },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
    timeout: 60000,
    authenticatorSelection: { userVerification: "preferred" },
    attestation: "none"
  };
  const cred = await navigator.credentials.create({ publicKey });
  return !!cred;
}

export async function loginWebAuthn() {
  if (!await webAuthnAvailable()) throw new Error('WebAuthn no disponible');
  const publicKey = {
    challenge: Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32))),
    timeout: 60000,
    userVerification: "preferred"
  };
  const assertion = await navigator.credentials.get({ publicKey });
  return !!assertion;
}
