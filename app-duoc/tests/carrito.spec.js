import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  agregarAlCarrito,
  cambiarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
  getCarritoItems,
  contarCarrito,
  obtenerTotales,
  subscribeCarrito,
} from '../src/services/carrito';
import { getProductos, getProducto } from '../src/services/productos';

describe('carrito service', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    getProductos();
  });

  it('inicia vacio', () => {
    expect(getCarritoItems()).toEqual([]);
    expect(contarCarrito()).toBe(0);
  });

  it('agregarAlCarrito', () => {
    const producto = getProducto('JM001');
    agregarAlCarrito(producto);
    const items = getCarritoItems();
    expect(items.length).toBe(1);
    expect(items[0].producto.id).toBe('JM001');
    expect(items[0].cantidad).toBe(1);
    expect(contarCarrito()).toBe(1);
  });

  it('agregar incrementa cantidad', () => {
    const producto = getProducto('JM001');
    agregarAlCarrito(producto);
    agregarAlCarrito(producto);
    expect(getCarritoItems()[0].cantidad).toBe(2);
    expect(contarCarrito()).toBe(2);
  });

  it('cambiarCantidad minimo 1', () => {
    const producto = getProducto('JM001');
    agregarAlCarrito(producto);
    cambiarCantidad('JM001', 0);
    expect(getCarritoItems()[0].cantidad).toBe(1);
    cambiarCantidad('JM001', 5);
    expect(getCarritoItems()[0].cantidad).toBe(5);
  });

  it('eliminarDelCarrito', () => {
    const producto = getProducto('JM001');
    agregarAlCarrito(producto);
    eliminarDelCarrito('JM001');
    expect(getCarritoItems().length).toBe(0);
  });

  it('vaciarCarrito', () => {
    const producto = getProducto('JM001');
    agregarAlCarrito(producto);
    vaciarCarrito();
    expect(getCarritoItems().length).toBe(0);
    expect(contarCarrito()).toBe(0);
  });

  it('obtenerTotales sin descuento', () => {
    const producto = getProducto('JM001');
    agregarAlCarrito(producto);
    const totales = obtenerTotales(false);
    expect(totales.subtotal).toBe(producto.precio);
    expect(totales.descuento).toBe(0);
    expect(totales.total).toBe(producto.precio);
  });

  it('obtenerTotales con descuento duoc', () => {
    const producto = getProducto('JM001');
    agregarAlCarrito(producto);
    const totales = obtenerTotales(true);
    expect(totales.descuento).toBe(Math.round(producto.precio * 0.2));
    expect(totales.total).toBe(producto.precio - totales.descuento);
  });

  it('subscribeCarrito notifica', () => {
    const cb = vi.fn();
    const unsub = subscribeCarrito(cb);
    const producto = getProducto('JM001');
    agregarAlCarrito(producto);
    expect(cb).toHaveBeenCalled();
    unsub();
  });
});