import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerUser,
  loginUser,
  getSession,
  logout,
  esCorreoDuoc,
  esCorreoAdmin,
  findUserByEmail,
} from '../src/services/auth';

describe('auth service', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
  });

  it('esCorreoDuoc detecta duoc', () => {
    expect(esCorreoDuoc('alumno@duoc.cl')).toBe(true);
    expect(esCorreoDuoc('algo@gmail.com')).toBe(false);
  });

  it('esCorreoAdmin detecta duocuc', () => {
    expect(esCorreoAdmin('admin@duocuc.cl')).toBe(true);
    expect(esCorreoAdmin('alumno@duoc.cl')).toBe(false);
  });

  it('registra usuario nuevo', () => {
    const res = registerUser({
      nombre: 'Juan Perez',
      correo: 'juan@duoc.cl',
      contrasena: 'Secret1!',
      telefono: '',
      region: 'Metropolitana de Santiago',
      comuna: 'Santiago',
    });
    expect(res.ok).toBe(true);
    expect(res.user.correo).toBe('juan@duoc.cl');
    expect(res.user.descuentoDuoc).toBe(true);
  });

  it('no permite email duplicado', () => {
    registerUser({
      nombre: 'Juan Perez',
      correo: 'juan@duoc.cl',
      contrasena: 'Secret1!',
      telefono: '',
      region: 'Metropolitana de Santiago',
      comuna: 'Santiago',
    });
    const res = registerUser({
      nombre: 'Otro',
      correo: 'juan@duoc.cl',
      contrasena: 'Secret1!',
      telefono: '',
      region: 'Metropolitana de Santiago',
      comuna: 'Santiago',
    });
    expect(res.ok).toBe(false);
  });

  it('login correcto crea sesion', () => {
    registerUser({
      nombre: 'Juan Perez',
      correo: 'juan@duoc.cl',
      contrasena: 'Secret1!',
      telefono: '',
      region: 'Metropolitana de Santiago',
      comuna: 'Santiago',
    });
    const res = loginUser('juan@duoc.cl', 'Secret1!');
    expect(res.ok).toBe(true);
    expect(getSession()).not.toBeNull();
    expect(getSession().correo).toBe('juan@duoc.cl');
  });

  it('login incorrecto falla', () => {
    registerUser({
      nombre: 'Juan Perez',
      correo: 'juan@duoc.cl',
      contrasena: 'Secret1!',
      telefono: '',
      region: 'Metropolitana de Santiago',
      comuna: 'Santiago',
    });
    const res = loginUser('juan@duoc.cl', 'wrong');
    expect(res.ok).toBe(false);
  });

  it('logout limpia sesion', () => {
    registerUser({
      nombre: 'Juan Perez',
      correo: 'juan@duoc.cl',
      contrasena: 'Secret1!',
      telefono: '',
      region: 'Metropolitana de Santiago',
      comuna: 'Santiago',
    });
    loginUser('juan@duoc.cl', 'Secret1!');
    logout();
    expect(getSession()).toBeNull();
  });

  it('findUserByEmail', () => {
    registerUser({
      nombre: 'Juan Perez',
      correo: 'juan@duoc.cl',
      contrasena: 'Secret1!',
      telefono: '',
      region: 'Metropolitana de Santiago',
      comuna: 'Santiago',
    });
    expect(findUserByEmail('JUAN@duoc.cl')).not.toBeNull();
    expect(findUserByEmail('nope@x.cl')).toBeNull();
  });
});