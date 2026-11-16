// Registro, inicio de sesión y roles. Se comunica con el microservicio ms-usuarios.

import { apiUsuarios, obtenerMensajeError } from './api';
import { borrarSesion, getSesionGuardada, guardarSesion, suscribirSesion } from './sesion';

export const ROLES = {
  ADMIN: 'ADMIN',
  CLIENTE: 'CLIENTE',
};

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

// Los correos Duoc tienen 20% de descuento (ya NO dan permisos de administrador).
export function esCorreoDuoc(correo) {
  return /@(duoc|duocuc)\.cl$/i.test(normalizeEmail(correo));
}

// Usuario logueado ({ id, nombre, correo, rol, descuentoDuoc, ... }) o null.
export function getSession() {
  return getSesionGuardada()?.usuario ?? null;
}

export function esRolAdmin(usuario) {
  return usuario?.rol === ROLES.ADMIN;
}

export function esAdmin() {
  return esRolAdmin(getSession());
}

// POST /api/auth/registro
export async function registerUser({ nombre, correo, contrasena, telefono, region, comuna }) {
  try {
    const { data } = await apiUsuarios.post('/api/auth/registro', {
      nombre: String(nombre ?? '').trim(),
      correo: normalizeEmail(correo),
      contrasena,
      telefono: String(telefono ?? '').trim(),
      region,
      comuna,
    });
    return { ok: true, user: data };
  } catch (error) {
    return {
      ok: false,
      status: error?.response?.status ?? null,
      error: obtenerMensajeError(error, 'No se pudo completar el registro.'),
    };
  }
}

// POST /api/auth/login -> guarda el token y los datos del usuario.
export async function loginUser(correo, contrasena) {
  try {
    const { data } = await apiUsuarios.post('/api/auth/login', {
      correo: normalizeEmail(correo),
      contrasena,
    });
    guardarSesion(data);
    return { ok: true, user: data.usuario };
  } catch (error) {
    return { ok: false, error: obtenerMensajeError(error, 'No se pudo iniciar sesión.') };
  }
}

export function logout() {
  borrarSesion();
}

export function subscribe(callback) {
  return suscribirSesion(callback);
}
