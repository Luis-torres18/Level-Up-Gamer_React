// Guarda la sesión (token JWT + datos del usuario) en localStorage
// y avisa a los componentes cuando cambia.

const SESSION_KEY = 'lug_sesion';
const AUTH_EVENT = 'lug-auth-change';

function notificar() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function leer() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Recibe la respuesta del login: { token, expiraEn, usuario }.
export function guardarSesion({ token, expiraEn, usuario }) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, expiraEn, usuario }));
  notificar();
}

export function borrarSesion() {
  if (localStorage.getItem(SESSION_KEY) === null) return;
  localStorage.removeItem(SESSION_KEY);
  notificar();
}

// Devuelve la sesión solo si tiene token y no ha expirado.
export function getSesionGuardada() {
  const sesion = leer();
  if (!sesion?.token || !sesion?.usuario) return null;
  if (sesion.expiraEn && Date.now() >= sesion.expiraEn) return null;
  return sesion;
}

export function getToken() {
  return getSesionGuardada()?.token ?? null;
}

// Actualiza los datos del usuario logueado (por ejemplo, si un ADMIN edita su propio nombre).
export function actualizarUsuarioSesion(usuario) {
  const sesion = getSesionGuardada();
  if (!sesion) return;
  guardarSesion({ ...sesion, usuario: { ...sesion.usuario, ...usuario } });
}

export function suscribirSesion(callback) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
