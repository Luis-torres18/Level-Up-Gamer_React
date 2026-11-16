import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  actualizarUsuarioSesion,
  borrarSesion,
  getSesionGuardada,
  getToken,
  guardarSesion,
  suscribirSesion,
} from '../src/services/sesion';

const usuario = { id: 7, nombre: 'Ana', correo: 'ana@gmail.com', rol: 'CLIENTE' };

describe('sesion', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('guarda y recupera la sesión con su token', () => {
    guardarSesion({ token: 't1', expiraEn: Date.now() + 10_000, usuario });

    expect(getSesionGuardada().usuario.nombre).toBe('Ana');
    expect(getToken()).toBe('t1');
  });

  it('ignora una sesión expirada', () => {
    guardarSesion({ token: 't1', expiraEn: Date.now() - 1, usuario });

    expect(getSesionGuardada()).toBeNull();
    expect(getToken()).toBeNull();
  });

  it('ignora datos corruptos en localStorage', () => {
    localStorage.setItem('lug_sesion', '{no es json');
    expect(getSesionGuardada()).toBeNull();
  });

  it('borrarSesion elimina la sesión y notifica', () => {
    const callback = vi.fn();
    const desuscribir = suscribirSesion(callback);
    guardarSesion({ token: 't1', expiraEn: Date.now() + 10_000, usuario });

    borrarSesion();

    expect(getSesionGuardada()).toBeNull();
    expect(callback).toHaveBeenCalledTimes(2);
    desuscribir();
  });

  it('borrarSesion sin sesión no notifica', () => {
    const callback = vi.fn();
    const desuscribir = suscribirSesion(callback);

    borrarSesion();

    expect(callback).not.toHaveBeenCalled();
    desuscribir();
  });

  it('actualizarUsuarioSesion cambia los datos del usuario logueado', () => {
    guardarSesion({ token: 't1', expiraEn: Date.now() + 10_000, usuario });

    actualizarUsuarioSesion({ nombre: 'Ana María' });

    expect(getSesionGuardada().usuario).toMatchObject({ nombre: 'Ana María', correo: 'ana@gmail.com' });
    expect(getToken()).toBe('t1');
  });

  it('actualizarUsuarioSesion no hace nada sin sesión', () => {
    actualizarUsuarioSesion({ nombre: 'X' });
    expect(getSesionGuardada()).toBeNull();
  });
});
