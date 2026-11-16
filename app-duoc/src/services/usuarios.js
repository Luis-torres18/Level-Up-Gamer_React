// Gestión de usuarios (solo ADMIN). Se comunica con el microservicio ms-gestion-usuarios.
//   GET    /api/usuarios        -> listar
//   GET    /api/usuarios/{id}   -> obtener uno
//   POST   /api/usuarios        -> crear (el ADMIN elige el rol)
//   PUT    /api/usuarios/{id}   -> editar datos y rol
//   DELETE /api/usuarios/{id}   -> eliminar cuenta

import { apiGestion, obtenerMensajeError } from './api';

function prepararDatos(datos) {
  return {
    nombre: String(datos.nombre ?? '').trim(),
    correo: String(datos.correo ?? '').trim().toLowerCase(),
    contrasena: datos.contrasena ?? '',
    telefono: String(datos.telefono ?? '').trim(),
    region: datos.region,
    comuna: datos.comuna,
    rol: datos.rol,
  };
}

export async function listarUsuarios() {
  try {
    const { data } = await apiGestion.get('/api/usuarios');
    return { ok: true, usuarios: Array.isArray(data) ? data : [] };
  } catch (error) {
    return { ok: false, error: obtenerMensajeError(error, 'No se pudo cargar la lista de usuarios.') };
  }
}

export async function obtenerUsuario(id) {
  try {
    const { data } = await apiGestion.get(`/api/usuarios/${id}`);
    return { ok: true, usuario: data };
  } catch (error) {
    return { ok: false, error: obtenerMensajeError(error, 'No se pudo obtener el usuario.') };
  }
}

export async function crearUsuario(datos) {
  try {
    const { data } = await apiGestion.post('/api/usuarios', prepararDatos(datos));
    return { ok: true, usuario: data };
  } catch (error) {
    return { ok: false, error: obtenerMensajeError(error, 'No se pudo crear el usuario.') };
  }
}

export async function actualizarUsuario(id, datos) {
  try {
    const { data } = await apiGestion.put(`/api/usuarios/${id}`, prepararDatos(datos));
    return { ok: true, usuario: data };
  } catch (error) {
    return { ok: false, error: obtenerMensajeError(error, 'No se pudo actualizar el usuario.') };
  }
}

export async function eliminarUsuario(id) {
  try {
    await apiGestion.delete(`/api/usuarios/${id}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: obtenerMensajeError(error, 'No se pudo eliminar el usuario.') };
  }
}
