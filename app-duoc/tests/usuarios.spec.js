import { describe, it, expect, beforeEach } from 'vitest';

import { guardarSesion } from '../src/services/sesion';
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
  obtenerUsuario,
} from '../src/services/usuarios';
import { ADMIN, CLIENTE, crearFakeApi, tokenPara } from './helpers/fakeApi';

const datos = {
  nombre: ' Ana Torres ',
  correo: ' ANA@gmail.com ',
  contrasena: 'Clave123!',
  telefono: '',
  region: 'Valparaíso',
  comuna: 'Viña del Mar',
  rol: 'CLIENTE',
};

describe('usuarios service (ms-gestion-usuarios)', () => {
  let api;

  beforeEach(() => {
    localStorage.clear();
    api = crearFakeApi();
    guardarSesion(tokenPara(api, ADMIN));
  });

  it('listarUsuarios usa GET /api/usuarios con el token del ADMIN', async () => {
    const resultado = await listarUsuarios();

    expect(resultado.ok).toBe(true);
    expect(resultado.usuarios.map((usuario) => usuario.correo)).toEqual(['admin@duocuc.cl', 'juan@gmail.com']);
    expect(resultado.usuarios[0].contrasena).toBeUndefined();
    expect(api.peticiones.at(-1)).toMatchObject({ metodo: 'GET', url: '/api/usuarios' });
  });

  it('un CLIENTE no puede listar usuarios (403)', async () => {
    guardarSesion(tokenPara(api, CLIENTE));
    expect(await listarUsuarios()).toEqual({ ok: false, error: 'No tienes permisos para realizar esta acción.' });
  });

  it('obtenerUsuario devuelve uno o el error 404', async () => {
    expect((await obtenerUsuario(2)).usuario.nombre).toBe('Juan Perez');
    expect(await obtenerUsuario(99)).toEqual({ ok: false, error: 'El usuario no existe.' });
  });

  it('crearUsuario envía POST con los datos limpios', async () => {
    const resultado = await crearUsuario(datos);

    expect(resultado.ok).toBe(true);
    expect(resultado.usuario).toMatchObject({ nombre: 'Ana Torres', correo: 'ana@gmail.com', rol: 'CLIENTE' });
    expect(api.peticiones.at(-1)).toMatchObject({ metodo: 'POST', url: '/api/usuarios' });
  });

  it('crearUsuario con correo repetido devuelve 409', async () => {
    const resultado = await crearUsuario({ ...datos, correo: 'juan@gmail.com' });
    expect(resultado.error).toBe('Ya existe una cuenta registrada con este correo electrónico.');
  });

  it('actualizarUsuario envía PUT y puede cambiar el rol', async () => {
    const resultado = await actualizarUsuario(2, { ...datos, correo: 'juan@gmail.com', rol: 'ADMIN' });

    expect(resultado.ok).toBe(true);
    expect(resultado.usuario.rol).toBe('ADMIN');
    expect(api.peticiones.at(-1)).toMatchObject({ metodo: 'PUT', url: '/api/usuarios/2' });
  });

  it('el ADMIN no puede quitarse su propio rol', async () => {
    const resultado = await actualizarUsuario(1, { ...datos, correo: 'admin@duocuc.cl', rol: 'CLIENTE' });
    expect(resultado.error).toBe('No puedes quitarte a ti mismo el rol de administrador.');
  });

  it('eliminarUsuario envía DELETE', async () => {
    expect(await eliminarUsuario(2)).toEqual({ ok: true });
    expect(api.usuarios).toHaveLength(1);
  });

  it('eliminarUsuario informa errores (propia cuenta / sin conexión)', async () => {
    expect(await eliminarUsuario(1)).toEqual({ ok: false, error: 'No puedes eliminar tu propia cuenta.' });
    api.sinConexion = true;
    expect((await eliminarUsuario(2)).error).toMatch(/No se pudo conectar/);
  });
});
