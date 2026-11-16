import { describe, it, expect, beforeEach } from 'vitest';
import { AxiosError } from 'axios';

import {
  API_URLS,
  agregarToken,
  apiProductos,
  manejarErrorRespuesta,
  obtenerMensajeError,
} from '../src/services/api';
import { getSesionGuardada, guardarSesion } from '../src/services/sesion';

const sesionValida = () =>
  guardarSesion({ token: 'abc123', expiraEn: Date.now() + 60_000, usuario: { id: 1, rol: 'ADMIN' } });

describe('cliente API (axios)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('usa localhost por defecto para los 3 microservicios', () => {
    expect(API_URLS.productos).toBe('http://localhost:8081');
    expect(API_URLS.usuarios).toBe('http://localhost:8082');
    expect(API_URLS.gestion).toBe('http://localhost:8083');
    expect(apiProductos.defaults.baseURL).toBe('http://localhost:8081');
  });

  it('agrega el header Authorization cuando hay sesión', () => {
    sesionValida();
    const config = agregarToken({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer abc123');
  });

  it('no agrega Authorization sin sesión', () => {
    const config = agregarToken({});
    expect(config.headers).toBeUndefined();
  });

  it('cierra la sesión si la API responde 401 teniendo token', async () => {
    sesionValida();
    const error = new AxiosError('401', 'ERR_BAD_REQUEST', {}, {}, { status: 401, data: {} });

    await expect(manejarErrorRespuesta(error)).rejects.toBe(error);
    expect(getSesionGuardada()).toBeNull();
  });

  it('no cierra la sesión con otros errores', async () => {
    sesionValida();
    const error = new AxiosError('403', 'ERR_BAD_REQUEST', {}, {}, { status: 403, data: {} });

    await expect(manejarErrorRespuesta(error)).rejects.toBe(error);
    expect(getSesionGuardada()).not.toBeNull();
  });

  describe('obtenerMensajeError', () => {
    it('usa el mensaje que envía el backend', () => {
      const error = { response: { status: 409, data: { mensaje: 'Correo duplicado.' } } };
      expect(obtenerMensajeError(error)).toBe('Correo duplicado.');
    });

    it('tiene mensajes para 401 y 403 sin cuerpo', () => {
      expect(obtenerMensajeError({ response: { status: 401 } })).toMatch(/sesión expiró/);
      expect(obtenerMensajeError({ response: { status: 403 } })).toMatch(/permisos/);
    });

    it('usa el mensaje por defecto para otros códigos', () => {
      expect(obtenerMensajeError({ response: { status: 500 } }, 'Falló')).toBe('Falló');
    });

    it('avisa cuando no hay conexión con el servidor', () => {
      expect(obtenerMensajeError({ request: {} })).toMatch(/No se pudo conectar/);
      expect(obtenerMensajeError({ code: 'ERR_NETWORK' })).toMatch(/No se pudo conectar/);
    });

    it('usa el mensaje por defecto si el error no tiene datos', () => {
      expect(obtenerMensajeError(null)).toMatch(/error inesperado/);
    });
  });
});
