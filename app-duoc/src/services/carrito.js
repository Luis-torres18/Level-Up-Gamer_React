import { getProductos, subscribeProductos } from './productos';

const CART_KEY = 'lug_carrito';
const CART_EVENT = 'lug-carrito-change';

export const DESCUENTO_DUOC = 0.2; // 20% para correos Duoc.

// Caché de snapshots (se invalida en cada escritura o cambio de catálogo).
let itemsCache = null; // [{ producto, cantidad }]
let conteoCache = null; // número

function notifyChange() {
  window.dispatchEvent(new Event(CART_EVENT));
}

function invalidarCache() {
  itemsCache = null;
  conteoCache = null;
}

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  invalidarCache();
  notifyChange();
}

// Devuelve los ítems del carrito con su producto asociado (snapshot cacheado).
export function getCarritoItems() {
  if (itemsCache) return itemsCache;

  const productos = getProductos();
  const porId = new Map(productos.map((producto) => [producto.id, producto]));

  itemsCache = readCart()
    .map((item) => ({ producto: porId.get(item.id), cantidad: item.cantidad }))
    .filter((item) => item.producto);

  return itemsCache;
}

// Total de unidades en el carrito (snapshot cacheado).
export function contarCarrito() {
  if (conteoCache !== null) return conteoCache;

  conteoCache = readCart().reduce((total, item) => total + item.cantidad, 0);
  return conteoCache;
}

export function agregarAlCarrito(producto) {
  const items = readCart();
  const existente = items.find((item) => item.id === producto.id);

  if (existente) {
    writeCart(
      items.map((item) =>
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item,
      ),
    );
  } else {
    writeCart([...items, { id: producto.id, cantidad: 1 }]);
  }
}

export function cambiarCantidad(id, cantidad) {
  const nuevaCantidad = Math.max(1, cantidad);
  writeCart(
    readCart().map((item) => (item.id === id ? { ...item, cantidad: nuevaCantidad } : item)),
  );
}

export function eliminarDelCarrito(id) {
  writeCart(readCart().filter((item) => item.id !== id));
}

export function vaciarCarrito() {
  writeCart([]);
}

// Subtotal, descuento Duoc (si aplica) y total a pagar.
export function obtenerTotales(aplicaDescuentoDuoc) {
  const subtotal = getCarritoItems().reduce(
    (total, item) => total + item.producto.precio * item.cantidad,
    0,
  );
  const descuento = aplicaDescuentoDuoc ? Math.round(subtotal * DESCUENTO_DUOC) : 0;
  return { subtotal, descuento, total: subtotal - descuento };
}

// El caché del carrito depende también del catálogo: si cambian los productos
// (por el CRUD de administración) hay que invalidarlo.
window.addEventListener('storage', invalidarCache);
subscribeProductos(invalidarCache);

// Permite que componentes reaccionen a cambios del carrito.
export function subscribeCarrito(callback) {
  window.addEventListener(CART_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CART_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
