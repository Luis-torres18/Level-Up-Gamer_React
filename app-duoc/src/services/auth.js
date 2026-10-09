// Servicio de autenticación basado en localStorage.
// No hay backend en el proyecto, por lo que las cuentas se guardan en el navegador.
// NOTA: el hash es una ofuscación simple para una demo académica; en producción
// la validación y el hashing de contraseñas deben realizarse en el servidor.

const USERS_KEY = 'lug_usuarios';
const SESSION_KEY = 'lug_sesion';
const AUTH_EVENT = 'lug-auth-change';

function hashPassword(password) {
  let hash = 0;
  const salted = `level-up-gamer::${password}`;
  for (let i = 0; i < salted.length; i += 1) {
    hash = (hash << 5) - hash + salted.charCodeAt(i);
    hash |= 0; // fuerza entero de 32 bits
  }
  return `h${(hash >>> 0).toString(16)}`;
}

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Elimina la contraseña antes de exponer un usuario a la interfaz.
function toPublicUser(user) {
  const publicUser = { ...user };
  delete publicUser.password;
  return publicUser;
}

function notifyChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

export function findUserByEmail(email) {
  const normalized = normalizeEmail(email);
  return readUsers().find((user) => user.correo === normalized) ?? null;
}

export function registerUser({ nombre, correo, contrasena, telefono, region, comuna }) {
  const normalizedEmail = normalizeEmail(correo);

  if (findUserByEmail(normalizedEmail)) {
    return {
      ok: false,
      error: 'Ya existe una cuenta registrada con este correo electrónico.',
    };
  }

  const newUser = {
    nombre: nombre.trim(),
    correo: normalizedEmail,
    contrasena: hashPassword(contrasena),
    telefono: telefono.trim(),
    region,
    comuna,
    descuentoDuoc: normalizedEmail.endsWith('@duoc.cl'),
    creadoEl: new Date().toISOString(),
  };

  writeUsers([...readUsers(), newUser]);
  notifyChange();

  return { ok: true, user: toPublicUser(newUser) };
}

export function loginUser(correo, contrasena) {
  const user = findUserByEmail(correo);

  if (!user) {
    return { ok: false, error: 'No existe una cuenta registrada con este correo.' };
  }

  if (user.contrasena !== hashPassword(contrasena)) {
    return { ok: false, error: 'La contraseña es incorrecta. Inténtalo nuevamente.' };
  }

  const session = toPublicUser(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notifyChange();

  return { ok: true, user: session };
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  notifyChange();
}

// Permite que componentes (ej: Header) reaccionen a login/logout.
export function subscribe(callback) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
