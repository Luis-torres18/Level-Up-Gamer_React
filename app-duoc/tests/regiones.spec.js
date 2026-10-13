import { describe, it, expect } from 'vitest';
import REGIONES from '../src/data/regiones';

describe('regiones', () => {
  it('es un arreglo no vacio', () => {
    expect(Array.isArray(REGIONES)).toBe(true);
    expect(REGIONES.length).toBeGreaterThan(0);
  });

  it('cada region tiene comunas', () => {
    REGIONES.forEach((r) => {
      expect(typeof r.region).toBe('string');
      expect(Array.isArray(r.comunas)).toBe(true);
      expect(r.comunas.length).toBeGreaterThan(0);
    });
  });
});