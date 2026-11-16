import axios from 'axios';

import { borrarSesion, getToken } from './sesion';

// URLs de los microservicios. Se configuran en los archivos .env (ver .env.example):
//   local:      http://localhost:8081 ...
//   producción: http://<ELASTIC_IP_EC2>:8081 ...
export const API_URLS = {
  productos: import.meta.env.VITE_API_PRODUCTOS_URL || 'http://localhost:8081',
  usuarios: import.meta.env.VITE_API_USUARIOS_URL || 'http://localhost:8082',
  gestion: import.meta.env.VITE_API_GESTION_URL || 'http://localhost:8083',
};

// Agrega el token JWT a cada petición (si hay sesión iniciada).
export function agregarToken(config) {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

// Si la API responde 401 teniendo sesión, el token venció o es inválido: se cierra la sesión.
export function manejarErrorRespuesta(error) {
  if (error?.response?.status === 401 && getToken()) {
    borrarSesion();
  }
  return Promise.reject(error);
}

function crearCliente(baseURL) {
  const cliente = axios.create({
    baseURL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });
  cliente.interceptors.request.use(agregarToken);
  cliente.interceptors.response.use((respuesta) => respuesta, manejarErrorRespuesta);
  return cliente;
}

// Un cliente axios por microservicio.
export const apiProductos = crearCliente(API_URLS.productos);
export const apiUsuarios = crearCliente(API_URLS.usuarios);
export const apiGestion = crearCliente(API_URLS.gestion);

// Traduce un error de axios a un mensaje para mostrar al usuario.
export function obtenerMensajeError(
  error,
  porDefecto = 'Ocurrió un error inesperado. Inténtalo nuevamente.',
) {
  const respuesta = error?.response;

  if (respuesta) {
    if (respuesta.data?.mensaje) return respuesta.data.mensaje;
    if (respuesta.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
    if (respuesta.status === 403) return 'No tienes permisos para realizar esta acción.';
    return porDefecto;
  }

  if (error?.request || error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED') {
    return 'No se pudo conectar con el servidor. Verifica que la API esté disponible.';
  }

  return porDefecto;
}
