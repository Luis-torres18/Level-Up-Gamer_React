import { describe, it, expect, beforeEach } from 'vitest';
import {
  getProductos,
  getProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  getCategorias,
  formatearPrecio,
} from '../src/services/productos';

describe('productos service', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
  });

  it('getProductos siembra iniciales', () => {
    const productos = getProductos();
    expect(productos.length).toBeGreaterThan(0);
  });

  it('getProducto por id', () => {
    const producto = getProducto('JM001');
    expect(producto).not.toBeNull();
    expect(producto.nombre).toBe('Catan');
  });

  it('crearProducto', () => {
    const res = crearProducto({
      categoria: 'Accesorios',
      nombre: 'Mouse',
      descripcion: 'Mouse gamer',
      imagen: 'https://example.com/m.jpg',
      precio: '1000',
    });
    expect(res.ok).toBe(true);
    expect(getProducto(res.producto.id)).not.toBeNull();
  });

  it('crearProducto valida', () => {
    const res = crearProducto({ categoria: '', nombre: '', descripcion: '', imagen: 'bad', precio: 0 });
    expect(res.ok).toBe(false);
    expect(typeof res.error).toBe('string');
  });

  it('actualizarProducto', () => {
    const res = crearProducto({
      categoria: 'Accesorios',
      nombre: 'Mouse',
      descripcion: 'Mouse gamer',
      imagen: 'https://example.com/m.jpg',
      precio: 1000,
    });
    const upd = actualizarProducto(res.producto.id, {
      categoria: 'Accesorios',
      nombre: 'Mouse Pro',
      descripcion: 'Mouse gamer pro',
      imagen: 'https://example.com/m2.jpg',
      precio: 2000,
    });
    expect(upd.ok).toBe(true);
    expect(getProducto(res.producto.id).nombre).toBe('Mouse Pro');
  });

  it('eliminarProducto', () => {
    const res = crearProducto({
      categoria: 'Accesorios',
      nombre: 'Mouse',
      descripcion: 'Mouse gamer',
      imagen: 'https://example.com/m.jpg',
      precio: 1000,
    });
    const del = eliminarProducto(res.producto.id);
    expect(del.ok).toBe(true);
    expect(getProducto(res.producto.id)).toBeNull();
  });

  it('getCategorias', () => {
    const cats = getCategorias();
    expect(Array.isArray(cats)).toBe(true);
    expect(cats.length).toBeGreaterThan(0);
  });

  it('formatearPrecio', () => {
    const out = formatearPrecio(1000);
    expect(typeof out).toBe('string');
    expect(out).toContain('1');
  });
});