import { describe, it, expect } from 'vitest';
import {
  validarNombre,
  validarCorreo,
  validarConfirmacionCorreo,
  validarContrasena,
  validarConfirmacionContrasena,
  validarTelefono,
  validarRegion,
  validarComuna,
} from '../src/utils/validaciones';

describe('validaciones', () => {
  it('validarNombre correcto', () => {
    expect(validarNombre('Juan Perez')).toBe('');
  });

  it('validarNombre vacio', () => {
    expect(validarNombre('')).not.toBe('');
  });

  it('validarNombre corto', () => {
    expect(validarNombre('ab')).not.toBe('');
  });

  it('validarNombre muy largo', () => {
    expect(validarNombre('a'.repeat(51))).not.toBe('');
  });

  it('validarCorreo correcto', () => {
    expect(validarCorreo('test@duoc.cl')).toBe('');
  });

  it('validarCorreo invalido', () => {
    expect(validarCorreo('no-email')).not.toBe('');
  });

  it('validarConfirmacionCorreo coincide', () => {
    expect(validarConfirmacionCorreo('A@B.CL', 'a@b.cl')).toBe('');
  });

  it('validarConfirmacionCorreo no coincide', () => {
    expect(validarConfirmacionCorreo('x@y.cl', 'a@b.cl')).not.toBe('');
  });

  it('validarContrasena valida', () => {
    expect(validarContrasena('Abcdef1!')).toBe('');
  });

  it('validarContrasena invalida por falta mayuscula', () => {
    expect(validarContrasena('abcdef1!')).not.toBe('');
  });

  it('validarConfirmacionContrasena coincide', () => {
    expect(validarConfirmacionContrasena('abc', 'abc')).toBe('');
  });

  it('validarTelefono opcional vacio', () => {
    expect(validarTelefono('')).toBe('');
  });

  it('validarTelefono valido', () => {
    expect(validarTelefono('+56 9 1234 5678')).toBe('');
  });

  it('validarTelefono invalido', () => {
    expect(validarTelefono('123')).not.toBe('');
  });

  it('validarRegion requerido', () => {
    expect(validarRegion('')).not.toBe('');
    expect(validarRegion('Metropolitana')).toBe('');
  });

  it('validarComuna requerido', () => {
    expect(validarComuna('')).not.toBe('');
    expect(validarComuna('Santiago')).toBe('');
  });
});