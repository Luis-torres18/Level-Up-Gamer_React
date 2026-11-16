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
import { cargarProductos, getProductosCache } from '../src/services/productos';
import { crearFakeApi } from './helpers/fakeApi';

const getProducto = (id) => getProductosCache().find((producto) => producto.id === id);

describe('carrito service', () => {
  let api;

  beforeEach(async () => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    api = crearFakeApi();
    await cargarProductos();
  });

  it('inicia vacio', () => {
    expect(getCarritoItems()).toEqual([]);
    expect(contarCarrito()).toBe(0);
  });

  it('agregarAlCarrito', () => {
    const producto = getProducto(1);
    agregarAlCarrito(producto);
    const items = getCarritoItems();
    expect(items.length).toBe(1);
    expect(items[0].producto.id).toBe(1);
    expect(items[0].cantidad).toBe(1);
    expect(contarCarrito()).toBe(1);
  });

  it('agregar incrementa cantidad', () => {
    const producto = getProducto(1);
    agregarAlCarrito(producto);
    agregarAlCarrito(producto);
    expect(getCarritoItems()[0].cantidad).toBe(2);
    expect(contarCarrito()).toBe(2);
  });

  it('cambiarCantidad minimo 1', () => {
    const producto = getProducto(1);
    agregarAlCarrito(producto);
    cambiarCantidad(1, 0);
    expect(getCarritoItems()[0].cantidad).toBe(1);
    cambiarCantidad(1, 5);
    expect(getCarritoItems()[0].cantidad).toBe(5);
  });

  it('eliminarDelCarrito', () => {
    const producto = getProducto(1);
    agregarAlCarrito(producto);
    eliminarDelCarrito(1);
    expect(getCarritoItems().length).toBe(0);
  });

  it('vaciarCarrito', () => {
    const producto = getProducto(1);
    agregarAlCarrito(producto);
    vaciarCarrito();
    expect(getCarritoItems().length).toBe(0);
    expect(contarCarrito()).toBe(0);
  });

  it('obtenerTotales sin descuento', () => {
    const producto = getProducto(1);
    agregarAlCarrito(producto);
    const totales = obtenerTotales(false);
    expect(totales.subtotal).toBe(producto.precio);
    expect(totales.descuento).toBe(0);
    expect(totales.total).toBe(producto.precio);
  });

  it('obtenerTotales con descuento duoc', () => {
    const producto = getProducto(1);
    agregarAlCarrito(producto);
    const totales = obtenerTotales(true);
    expect(totales.descuento).toBe(Math.round(producto.precio * 0.2));
    expect(totales.total).toBe(producto.precio - totales.descuento);
  });

  it('subscribeCarrito notifica', () => {
    const cb = vi.fn();
    const unsub = subscribeCarrito(cb);
    const producto = getProducto(1);
    agregarAlCarrito(producto);
    expect(cb).toHaveBeenCalled();
    unsub();
  });

  it('usa los datos del catálogo de la API y oculta productos que ya no existen', async () => {
    agregarAlCarrito(getProducto(1));
    agregarAlCarrito(getProducto(2));
    expect(getCarritoItems().map((item) => item.producto.nombre)).toEqual(['Catan', 'PlayStation 5']);

    api.productos = api.productos.filter((producto) => producto.id !== 2);
    await cargarProductos();

    expect(getCarritoItems().map((item) => item.producto.id)).toEqual([1]);
    expect(contarCarrito()).toBe(2);
  });

  it('notifica al carrito cuando cambia el catálogo', async () => {
    const cb = vi.fn();
    const unsub = subscribeCarrito(cb);
    await cargarProductos();
    expect(cb).toHaveBeenCalled();
    unsub();
  });
});
