// Catálogo de productos. Los datos vienen del microservicio ms-productos (sin datos quemados).
//   GET    /api/productos        -> listar (público)
//   GET    /api/productos/{id}   -> obtener uno (público)
//   POST   /api/productos        -> crear (ADMIN)
//   PUT    /api/productos/{id}   -> actualizar (ADMIN)
//   DELETE /api/productos/{id}   -> eliminar (ADMIN)

import { apiProductos, obtenerMensajeError } from './api';

const PRODUCTS_EVENT = 'lug-productos-change';

// Última lista recibida de la API (la usa el carrito para mostrar nombre, precio e imagen).
let productosCache = [];

function notifyChange() {
  window.dispatchEvent(new Event(PRODUCTS_EVENT));
}

function setCache(productos) {
  productosCache = productos;
  notifyChange();
}

export function getProductosCache() {
  return productosCache;
}

export async function cargarProductos() {
  try {
    const { data } = await apiProductos.get('/api/productos');
    setCache(Array.isArray(data) ? data : []);
    return { ok: true, productos: productosCache };
  } catch (error) {
    return {
      ok: false,
      error: obtenerMensajeError(error, 'No se pudo cargar el catálogo de productos.'),
    };
  }
}

export async function getProducto(id) {
  try {
    const { data } = await apiProductos.get(`/api/productos/${id}`);
    return { ok: true, producto: data };
  } catch (error) {
    return { ok: false, error: obtenerMensajeError(error, 'No se pudo obtener el producto.') };
  }
}

export function getCategorias() {
  const categorias = new Set(productosCache.map((producto) => producto.categoria));
  return [...categorias].sort((a, b) => a.localeCompare(b, 'es'));
}

// Valida en el navegador antes de enviar (el backend vuelve a validar).
export function normalizarProducto(datos) {
  const categoria = String(datos.categoria ?? '').trim();
  const nombre = String(datos.nombre ?? '').trim();
  const descripcion = String(datos.descripcion ?? '').trim();
  const imagen = String(datos.imagen ?? '').trim();
  const precio = Number(String(datos.precio ?? '').replace(/\./g, '').replace(',', '.'));

  if (!categoria) return { error: 'La categoría es obligatoria.' };
  if (!nombre) return { error: 'El nombre es obligatorio.' };
  if (!descripcion) return { error: 'La descripción es obligatoria.' };
  if (!/^https?:\/\/\S+$/i.test(imagen)) {
    return { error: 'La imagen debe ser un link válido que comience con http:// o https://.' };
  }
  if (!Number.isFinite(precio) || precio <= 0) {
    return { error: 'El valor debe ser un número mayor a 0.' };
  }

  return {
    producto: { categoria, nombre, descripcion, imagen, precio: Math.round(precio) },
  };
}

export async function crearProducto(datos) {
  const resultado = normalizarProducto(datos);
  if (resultado.error) return { ok: false, error: resultado.error };

  try {
    const { data } = await apiProductos.post('/api/productos', resultado.producto);
    setCache([...productosCache, data]);
    return { ok: true, producto: data };
  } catch (error) {
    return { ok: false, error: obtenerMensajeError(error, 'No se pudo crear el producto.') };
  }
}

export async function actualizarProducto(id, datos) {
  const resultado = normalizarProducto(datos);
  if (resultado.error) return { ok: false, error: resultado.error };

  try {
    const { data } = await apiProductos.put(`/api/productos/${id}`, resultado.producto);
    setCache(productosCache.map((producto) => (producto.id === id ? data : producto)));
    return { ok: true, producto: data };
  } catch (error) {
    return { ok: false, error: obtenerMensajeError(error, 'No se pudo actualizar el producto.') };
  }
}

export async function eliminarProducto(id) {
  try {
    await apiProductos.delete(`/api/productos/${id}`);
    setCache(productosCache.filter((producto) => producto.id !== id));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: obtenerMensajeError(error, 'No se pudo eliminar el producto.') };
  }
}

export function subscribeProductos(callback) {
  window.addEventListener(PRODUCTS_EVENT, callback);
  return () => window.removeEventListener(PRODUCTS_EVENT, callback);
}

export function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(valor ?? 0);
}
