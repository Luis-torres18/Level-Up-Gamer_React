import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  actualizarProducto,
  cargarProductos,
  crearProducto,
  eliminarProducto,
  formatearPrecio,
  getCategorias,
  getProducto,
  getProductosCache,
  normalizarProducto,
  subscribeProductos,
} from '../src/services/productos';
import { guardarSesion } from '../src/services/sesion';
import { ADMIN, CLIENTE, crearFakeApi, tokenPara } from './helpers/fakeApi';

const nuevoProducto = {
  categoria: ' Teclados ',
  nombre: ' Teclado RGB ',
  descripcion: 'Mecánico',
  imagen: 'https://example.com/teclado.jpg',
  precio: '49.990',
};

describe('productos service (ms-productos)', () => {
  let api;

  beforeEach(async () => {
    localStorage.clear();
    api = crearFakeApi();
    await cargarProductos();
  });

  const loginComo = (usuario) => guardarSesion(tokenPara(api, usuario));

  it('cargarProductos trae el catálogo con GET /api/productos y avisa del cambio', async () => {
    const callback = vi.fn();
    const desuscribir = subscribeProductos(callback);

    const resultado = await cargarProductos();

    expect(resultado.ok).toBe(true);
    expect(resultado.productos).toHaveLength(3);
    expect(getProductosCache()[0].nombre).toBe('Catan');
    expect(callback).toHaveBeenCalled();
    desuscribir();
  });

  it('cargarProductos informa el error si la API no responde', async () => {
    api.sinConexion = true;
    const resultado = await cargarProductos();

    expect(resultado.ok).toBe(false);
    expect(resultado.error).toMatch(/No se pudo conectar/);
  });

  it('getProducto obtiene uno por id o informa 404', async () => {
    expect((await getProducto(2)).producto.nombre).toBe('PlayStation 5');
    expect(await getProducto(999)).toEqual({ ok: false, error: 'El producto no existe en el catálogo.' });
  });

  it('getCategorias devuelve las categorías únicas ordenadas', () => {
    expect(getCategorias()).toEqual(['Consolas', 'Juegos de Mesa', 'Mouse']);
  });

  it('normalizarProducto valida cada campo', () => {
    expect(normalizarProducto({}).error).toBe('La categoría es obligatoria.');
    expect(normalizarProducto({ categoria: 'A' }).error).toBe('El nombre es obligatorio.');
    expect(normalizarProducto({ categoria: 'A', nombre: 'B' }).error).toBe('La descripción es obligatoria.');
    expect(normalizarProducto({ categoria: 'A', nombre: 'B', descripcion: 'C', imagen: 'foto.jpg' }).error).toMatch(
      /link válido/,
    );
    expect(
      normalizarProducto({ categoria: 'A', nombre: 'B', descripcion: 'C', imagen: 'https://x.cl/a.jpg', precio: '0' })
        .error,
    ).toBe('El valor debe ser un número mayor a 0.');
    expect(normalizarProducto(nuevoProducto).producto).toEqual({
      categoria: 'Teclados',
      nombre: 'Teclado RGB',
      descripcion: 'Mecánico',
      imagen: 'https://example.com/teclado.jpg',
      precio: 49990,
    });
  });

  it('crearProducto como ADMIN envía POST con el token y actualiza el catálogo', async () => {
    loginComo(ADMIN);

    const resultado = await crearProducto(nuevoProducto);

    expect(resultado.ok).toBe(true);
    expect(resultado.producto).toMatchObject({ nombre: 'Teclado RGB', precio: 49990 });
    expect(getProductosCache()).toHaveLength(4);
    expect(api.peticiones.at(-1).auth).toMatch(/^Bearer token-1/);
  });

  it('crearProducto no llama a la API si los datos son inválidos', async () => {
    loginComo(ADMIN);
    const antes = api.peticiones.length;

    const resultado = await crearProducto({ ...nuevoProducto, nombre: '' });

    expect(resultado).toEqual({ ok: false, error: 'El nombre es obligatorio.' });
    expect(api.peticiones).toHaveLength(antes);
  });

  it('un CLIENTE no puede crear productos (403)', async () => {
    loginComo(CLIENTE);

    const resultado = await crearProducto(nuevoProducto);

    expect(resultado).toEqual({ ok: false, error: 'No tienes permisos para realizar esta acción.' });
    expect(getProductosCache()).toHaveLength(3);
  });

  it('sin sesión crear producto responde 401', async () => {
    const resultado = await crearProducto(nuevoProducto);
    expect(resultado.error).toBe('Debes iniciar sesión para realizar esta acción.');
  });

  it('actualizarProducto envía PUT y reemplaza el producto en el catálogo', async () => {
    loginComo(ADMIN);

    const resultado = await actualizarProducto(1, { ...nuevoProducto, nombre: 'Catan Deluxe' });

    expect(resultado.ok).toBe(true);
    expect(getProductosCache().find((producto) => producto.id === 1).nombre).toBe('Catan Deluxe');
  });

  it('actualizarProducto valida y maneja errores de la API', async () => {
    loginComo(ADMIN);
    expect((await actualizarProducto(1, { ...nuevoProducto, precio: '-5' })).ok).toBe(false);
    expect(await actualizarProducto(999, nuevoProducto)).toEqual({
      ok: false,
      error: 'El producto no existe en el catálogo.',
    });
  });

  it('eliminarProducto envía DELETE y lo quita del catálogo', async () => {
    loginComo(ADMIN);

    expect(await eliminarProducto(2)).toEqual({ ok: true });
    expect(getProductosCache().map((producto) => producto.id)).toEqual([1, 3]);
    expect(await eliminarProducto(2)).toEqual({ ok: false, error: 'El producto no existe en el catálogo.' });
  });

  it('formatearPrecio usa pesos chilenos', () => {
    expect(formatearPrecio(29990)).toMatch(/\$\s?29\.990/);
    expect(formatearPrecio(undefined)).toMatch(/\$\s?0/);
  });
});
