import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  ROLES,
  esAdmin,
  esCorreoDuoc,
  esRolAdmin,
  getSession,
  loginUser,
  logout,
  registerUser,
  subscribe,
} from '../src/services/auth';
import { getToken } from '../src/services/sesion';
import { crearFakeApi } from './helpers/fakeApi';

const datosRegistro = (correo = 'nuevo@gmail.com') => ({
  nombre: '  Nuevo Usuario ',
  correo: ` ${correo.toUpperCase()} `,
  contrasena: 'Clave123!',
  telefono: ' 912345678 ',
  region: 'Metropolitana de Santiago',
  comuna: 'Santiago',
});

describe('auth service (ms-usuarios)', () => {
  let api;

  beforeEach(() => {
    localStorage.clear();
    api = crearFakeApi();
  });

  it('registra un usuario nuevo como CLIENTE con POST /api/auth/registro', async () => {
    const resultado = await registerUser(datosRegistro());

    expect(resultado.ok).toBe(true);
    expect(resultado.user).toMatchObject({ correo: 'nuevo@gmail.com', rol: ROLES.CLIENTE });
    expect(resultado.user.contrasena).toBeUndefined();

    const peticion = api.peticiones.at(-1);
    expect(peticion).toMatchObject({ metodo: 'POST', url: '/api/auth/registro' });
    expect(peticion.body).toMatchObject({ nombre: 'Nuevo Usuario', correo: 'nuevo@gmail.com', telefono: '912345678' });
  });

  it('marca el descuento Duoc al registrar un correo @duoc.cl', async () => {
    const resultado = await registerUser(datosRegistro('alumno@duoc.cl'));
    expect(resultado.user.descuentoDuoc).toBe(true);
  });

  it('no permite registrar un correo duplicado (409)', async () => {
    const resultado = await registerUser(datosRegistro('juan@gmail.com'));

    expect(resultado).toEqual({
      ok: false,
      status: 409,
      error: 'Ya existe una cuenta registrada con este correo electrónico.',
    });
  });

  it('informa si no hay conexión al registrar', async () => {
    api.sinConexion = true;
    const resultado = await registerUser(datosRegistro());

    expect(resultado.ok).toBe(false);
    expect(resultado.status).toBeNull();
    expect(resultado.error).toMatch(/No se pudo conectar/);
  });

  it('login correcto guarda el token y el usuario con su rol', async () => {
    const callback = vi.fn();
    const desuscribir = subscribe(callback);

    const resultado = await loginUser('ADMIN@duocuc.cl', 'Admin123!');

    expect(resultado.ok).toBe(true);
    expect(resultado.user.rol).toBe(ROLES.ADMIN);
    expect(getToken()).toMatch(/^token-1/);
    expect(getSession()).toMatchObject({ correo: 'admin@duocuc.cl', rol: 'ADMIN' });
    expect(esAdmin()).toBe(true);
    expect(callback).toHaveBeenCalled();
    desuscribir();
  });

  it('login incorrecto devuelve el mensaje del backend y no guarda sesión', async () => {
    const resultado = await loginUser('juan@gmail.com', 'Incorrecta1!');

    expect(resultado).toEqual({ ok: false, error: 'Correo o contraseña incorrectos.' });
    expect(getSession()).toBeNull();
  });

  it('logout elimina la sesión', async () => {
    await loginUser('juan@gmail.com', 'Clave123!');
    expect(getSession()).not.toBeNull();

    logout();

    expect(getSession()).toBeNull();
    expect(esAdmin()).toBe(false);
  });

  it('esRolAdmin solo es verdadero para el rol ADMIN', () => {
    expect(esRolAdmin({ rol: 'ADMIN' })).toBe(true);
    expect(esRolAdmin({ rol: 'CLIENTE' })).toBe(false);
    expect(esRolAdmin(null)).toBe(false);
  });

  it('esCorreoDuoc reconoce @duoc.cl y @duocuc.cl', () => {
    expect(esCorreoDuoc('a@duoc.cl')).toBe(true);
    expect(esCorreoDuoc('B@DUOCUC.CL')).toBe(true);
    expect(esCorreoDuoc('c@gmail.com')).toBe(false);
    expect(esCorreoDuoc(undefined)).toBe(false);
  });
});
